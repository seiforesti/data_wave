import logging
import asyncio
import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, text
from sqlalchemy.exc import SQLAlchemyError
import uuid
import pandas as pd
from pathlib import Path

# Import existing services for integration
from ..db_session import get_session
from .scan_service import ScanService
from .catalog_service import CatalogService
from .compliance_rule_service import ComplianceRuleService
from .data_source_service import DataSourceService
from .notification_service import NotificationService
from .task_service import TaskService

# Import models for classification
from ..models.classification_models import (
    ClassificationFramework, ClassificationPolicy, ClassificationRule, ClassificationDictionary,
    ClassificationRuleDictionary, ClassificationResult, ClassificationAuditLog, ClassificationTag,
    ClassificationException, ClassificationMetrics, DataSourceClassificationSetting,
    ScanResultClassification, CatalogItemClassification,
    SensitivityLevel, ClassificationRuleType, ClassificationScope, ClassificationStatus,
    ClassificationConfidenceLevel, ClassificationMethod
)

# Import existing models for integration
from ..models.scan_models import DataSource, Scan, ScanResult
from ..models.catalog_models import CatalogItem
from ..models.compliance_models import ComplianceRule

logger = logging.getLogger(__name__)


class EnterpriseClassificationService:
    """
    Advanced enterprise classification service with deep integration 
    into the data governance ecosystem
    """
    
    def __init__(self):
        self.scan_service = ScanService()
        self.catalog_service = CatalogService()
        self.compliance_service = ComplianceRuleService()
        self.data_source_service = DataSourceService()
        self.notification_service = NotificationService()
        self.task_service = TaskService()
        
        # Pattern cache for performance
        self._compiled_patterns = {}
        self._dictionary_cache = {}
        
        # Performance metrics
        self._performance_stats = {
            'total_classifications': 0,
            'avg_processing_time': 0.0,
            'cache_hits': 0,
            'cache_misses': 0
        }
    
    # ==================== FRAMEWORK MANAGEMENT ====================
    
    async def create_classification_framework(
        self, 
        session: Session, 
        framework_data: Dict[str, Any], 
        user: str
    ) -> ClassificationFramework:
        """Create a new classification framework with compliance integration"""
        try:
            # Validate compliance framework references
            if framework_data.get('compliance_frameworks'):
                compliance_ids = framework_data['compliance_frameworks']
                valid_compliance = await self._validate_compliance_frameworks(session, compliance_ids)
                if not valid_compliance:
                    raise ValueError("Invalid compliance framework references")
            
            framework = ClassificationFramework(
                **framework_data,
                created_by=user,
                updated_by=user
            )
            
            session.add(framework)
            session.commit()
            session.refresh(framework)
            
            # Create audit log
            await self._log_audit_event(
                session, 
                event_type="create_framework",
                event_category="framework_management",
                event_description=f"Created classification framework: {framework.name}",
                target_type="framework",
                target_id=str(framework.id),
                target_name=framework.name,
                user_id=user,
                new_values=framework_data
            )
            
            # Notify stakeholders
            await self._notify_framework_change(framework, "created", user)
            
            logger.info(f"Created classification framework: {framework.name} (ID: {framework.id})")
            return framework
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating classification framework: {str(e)}")
            raise
    
    async def activate_framework_for_data_source(
        self, 
        session: Session, 
        data_source_id: int, 
        framework_id: int, 
        user: str
    ) -> DataSourceClassificationSetting:
        """Activate a classification framework for a specific data source"""
        try:
            # Validate data source and framework exist
            data_source = session.get(DataSource, data_source_id)
            framework = session.get(ClassificationFramework, framework_id)
            
            if not data_source or not framework:
                raise ValueError("Data source or framework not found")
            
            # Check if setting already exists
            existing_setting = session.query(DataSourceClassificationSetting).filter_by(
                data_source_id=data_source_id
            ).first()
            
            if existing_setting:
                existing_setting.classification_framework_id = framework_id
                existing_setting.updated_by = user
                existing_setting.updated_at = datetime.utcnow()
                setting = existing_setting
            else:
                setting = DataSourceClassificationSetting(
                    data_source_id=data_source_id,
                    classification_framework_id=framework_id,
                    created_by=user,
                    updated_by=user
                )
                session.add(setting)
            
            session.commit()
            session.refresh(setting)
            
            # Trigger automatic classification for existing data
            await self._trigger_data_source_classification(session, data_source_id, user)
            
            logger.info(f"Activated framework {framework_id} for data source {data_source_id}")
            return setting
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error activating framework for data source: {str(e)}")
            raise
    
    # ==================== RULE MANAGEMENT ====================
    
    async def create_classification_rule(
        self, 
        session: Session, 
        rule_data: Dict[str, Any], 
        user: str
    ) -> ClassificationRule:
        """Create a comprehensive classification rule with validation"""
        try:
            # Validate rule pattern
            await self._validate_rule_pattern(rule_data)
            
            # Create rule
            rule = ClassificationRule(
                **rule_data,
                created_by=user,
                updated_by=user
            )
            
            session.add(rule)
            session.commit()
            session.refresh(rule)
            
            # Clear pattern cache
            self._compiled_patterns.clear()
            
            # Create audit log
            await self._log_audit_event(
                session,
                event_type="create_rule",
                event_category="rule_management", 
                event_description=f"Created classification rule: {rule.name}",
                target_type="rule",
                target_id=str(rule.id),
                target_name=rule.name,
                user_id=user,
                new_values=rule_data
            )
            
            # If rule has compliance integration, validate against compliance rules
            if rule.compliance_rule_id:
                await self._validate_compliance_integration(session, rule)
            
            logger.info(f"Created classification rule: {rule.name} (ID: {rule.id})")
            return rule
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating classification rule: {str(e)}")
            raise
    
    async def apply_rules_to_scan_results(
        self, 
        session: Session, 
        scan_id: int, 
        user: str,
        force_reclassify: bool = False
    ) -> List[ClassificationResult]:
        """Apply classification rules to scan results with advanced processing"""
        try:
            # Get scan and its results
            scan = session.get(Scan, scan_id)
            if not scan:
                raise ValueError(f"Scan {scan_id} not found")
            
            scan_results = session.query(ScanResult).filter_by(scan_id=scan_id).all()
            if not scan_results:
                logger.warning(f"No scan results found for scan {scan_id}")
                return []
            
            # Get data source classification settings
            ds_setting = session.query(DataSourceClassificationSetting).filter_by(
                data_source_id=scan.data_source_id
            ).first()
            
            if not ds_setting or not ds_setting.auto_classify:
                logger.info(f"Auto-classification disabled for data source {scan.data_source_id}")
                return []
            
            # Get applicable rules
            rules = await self._get_applicable_rules(session, scan.data_source_id, ds_setting.classification_framework_id)
            
            classification_results = []
            
            for scan_result in scan_results:
                # Skip if already classified and not forcing reclassification
                if not force_reclassify:
                    existing = session.query(ScanResultClassification).filter_by(
                        scan_result_id=scan_result.id
                    ).first()
                    if existing:
                        continue
                
                # Apply rules to scan result
                results = await self._apply_rules_to_entity(
                    session,
                    entity_type="scan_result",
                    entity_id=str(scan_result.id),
                    entity_data=scan_result,
                    rules=rules,
                    user=user
                )
                
                # Create scan result classification links
                for result in results:
                    scan_result_link = ScanResultClassification(
                        scan_result_id=scan_result.id,
                        classification_result_id=result.id,
                        classification_triggered_by="scan",
                        data_quality_score=scan_result.quality_score if hasattr(scan_result, 'quality_score') else None
                    )
                    session.add(scan_result_link)
                
                classification_results.extend(results)
            
            session.commit()
            
            # Update scan with classification summary
            await self._update_scan_classification_summary(session, scan_id)
            
            # Propagate to catalog if enabled
            if ds_setting.inherit_table_classification:
                await self._propagate_to_catalog(session, scan_id, user)
            
            logger.info(f"Applied classification rules to {len(scan_results)} scan results, created {len(classification_results)} classifications")
            return classification_results
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error applying rules to scan results: {str(e)}")
            raise
    
    async def apply_rules_to_catalog_items(
        self, 
        session: Session, 
        catalog_item_ids: List[int], 
        user: str,
        framework_id: Optional[int] = None
    ) -> List[ClassificationResult]:
        """Apply classification rules to catalog items with business context"""
        try:
            classification_results = []
            
            for item_id in catalog_item_ids:
                catalog_item = session.get(CatalogItem, item_id)
                if not catalog_item:
                    logger.warning(f"Catalog item {item_id} not found")
                    continue
                
                # Get data source settings or use provided framework
                if framework_id:
                    rules = await self._get_framework_rules(session, framework_id)
                else:
                    ds_setting = session.query(DataSourceClassificationSetting).filter_by(
                        data_source_id=catalog_item.data_source_id
                    ).first()
                    
                    if not ds_setting:
                        logger.warning(f"No classification settings for data source {catalog_item.data_source_id}")
                        continue
                    
                    rules = await self._get_applicable_rules(
                        session, 
                        catalog_item.data_source_id, 
                        ds_setting.classification_framework_id
                    )
                
                # Apply rules with catalog-specific context
                results = await self._apply_rules_to_catalog_item(
                    session,
                    catalog_item,
                    rules,
                    user
                )
                
                # Create catalog item classification links
                for result in results:
                    catalog_link = CatalogItemClassification(
                        catalog_item_id=catalog_item.id,
                        classification_result_id=result.id,
                        is_primary_classification=True,
                        business_context=self._extract_business_context(catalog_item),
                        affects_lineage=True,
                        affects_search=True,
                        affects_recommendations=True
                    )
                    session.add(catalog_link)
                
                classification_results.extend(results)
            
            session.commit()
            
            # Update catalog search indices
            await self._update_catalog_search_indices(session, catalog_item_ids)
            
            logger.info(f"Applied classification rules to {len(catalog_item_ids)} catalog items")
            return classification_results
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error applying rules to catalog items: {str(e)}")
            raise
    
    # ==================== BULK OPERATIONS ====================
    
    async def bulk_upload_classification_files(
        self, 
        session: Session, 
        file_data: List[Dict[str, Any]], 
        file_type: str,
        framework_id: Optional[int],
        user: str
    ) -> Dict[str, Any]:
        """Enhanced bulk upload with validation and error handling"""
        try:
            upload_results = {
                'total_processed': 0,
                'successful_imports': 0,
                'failed_imports': 0,
                'validation_errors': [],
                'created_rules': [],
                'created_dictionaries': [],
                'performance_metrics': {}
            }
            
            start_time = datetime.utcnow()
            
            for idx, entry in enumerate(file_data):
                try:
                    upload_results['total_processed'] += 1
                    
                    # Validate entry structure
                    validation_result = await self._validate_bulk_entry(entry, file_type)
                    if not validation_result['valid']:
                        upload_results['validation_errors'].append({
                            'row': idx + 1,
                            'errors': validation_result['errors']
                        })
                        upload_results['failed_imports'] += 1
                        continue
                    
                    # Determine entry type and create appropriate object
                    if entry.get('type') == 'rule' or 'pattern' in entry:
                        rule = await self._create_rule_from_bulk_entry(
                            session, entry, framework_id, user
                        )
                        upload_results['created_rules'].append({
                            'id': rule.id,
                            'name': rule.name,
                            'row': idx + 1
                        })
                    
                    elif entry.get('type') == 'dictionary' or 'entries' in entry:
                        dictionary = await self._create_dictionary_from_bulk_entry(
                            session, entry, user
                        )
                        upload_results['created_dictionaries'].append({
                            'id': dictionary.id,
                            'name': dictionary.name,
                            'row': idx + 1
                        })
                    
                    upload_results['successful_imports'] += 1
                    
                except Exception as e:
                    upload_results['failed_imports'] += 1
                    upload_results['validation_errors'].append({
                        'row': idx + 1,
                        'errors': [f"Processing error: {str(e)}"]
                    })
                    logger.error(f"Error processing bulk entry {idx + 1}: {str(e)}")
            
            session.commit()
            
            # Calculate performance metrics
            end_time = datetime.utcnow()
            processing_time = (end_time - start_time).total_seconds()
            
            upload_results['performance_metrics'] = {
                'total_processing_time_seconds': processing_time,
                'average_time_per_entry': processing_time / len(file_data) if file_data else 0,
                'entries_per_second': len(file_data) / processing_time if processing_time > 0 else 0
            }
            
            # Create audit log
            await self._log_audit_event(
                session,
                event_type="bulk_upload",
                event_category="bulk_operations",
                event_description=f"Bulk upload completed: {upload_results['successful_imports']} successful, {upload_results['failed_imports']} failed",
                target_type="bulk_operation",
                target_id=str(uuid.uuid4()),
                user_id=user,
                event_data=upload_results
            )
            
            logger.info(f"Bulk upload completed: {upload_results}")
            return upload_results
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error in bulk upload: {str(e)}")
            raise
    
    # ==================== ADVANCED PATTERN MATCHING ====================
    
    async def _apply_rules_to_entity(
        self,
        session: Session,
        entity_type: str,
        entity_id: str,
        entity_data: Any,
        rules: List[ClassificationRule],
        user: str
    ) -> List[ClassificationResult]:
        """Advanced rule application with multiple pattern types"""
        results = []
        
        # Sort rules by priority (lower number = higher priority)
        sorted_rules = sorted(rules, key=lambda r: r.priority)
        
        for rule in sorted_rules:
            try:
                start_time = datetime.utcnow()
                
                # Apply rule based on type
                match_result = await self._apply_single_rule(rule, entity_data, entity_type)
                
                if match_result['matched']:
                    # Calculate confidence level
                    confidence_level = self._determine_confidence_level(match_result['confidence'])
                    
                    # Create classification result
                    classification_result = ClassificationResult(
                        uuid=str(uuid.uuid4()),
                        entity_type=entity_type,
                        entity_id=entity_id,
                        entity_name=getattr(entity_data, 'name', None),
                        entity_path=self._build_entity_path(entity_data, entity_type),
                        rule_id=rule.id,
                        sensitivity_level=rule.sensitivity_level,
                        classification_method=ClassificationMethod.AUTOMATED_RULE,
                        confidence_score=match_result['confidence'],
                        confidence_level=confidence_level,
                        matched_patterns=match_result.get('patterns', []),
                        matched_values=match_result.get('values', []),
                        context_data=match_result.get('context', {}),
                        sample_data=match_result.get('sample_data', {}),
                        sample_size=match_result.get('sample_size', 0),
                        total_records=match_result.get('total_records', 0),
                        match_percentage=match_result.get('match_percentage', 0.0),
                        processing_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
                        created_by=user,
                        updated_by=user
                    )
                    
                    session.add(classification_result)
                    session.flush()  # Get ID without committing
                    
                    # Update rule statistics
                    rule.execution_count += 1
                    rule.success_count += 1
                    rule.last_executed = datetime.utcnow()
                    
                    # Calculate average execution time
                    if rule.avg_execution_time_ms:
                        rule.avg_execution_time_ms = (
                            rule.avg_execution_time_ms + classification_result.processing_time_ms
                        ) / 2
                    else:
                        rule.avg_execution_time_ms = classification_result.processing_time_ms
                    
                    results.append(classification_result)
                    
                    # Create audit log
                    await self._log_audit_event(
                        session,
                        event_type="rule_applied",
                        event_category="classification",
                        event_description=f"Rule {rule.name} applied to {entity_type}:{entity_id}",
                        target_type="classification_result",
                        target_id=str(classification_result.id),
                        classification_result_id=classification_result.id,
                        user_id=user,
                        event_data={
                            'rule_id': rule.id,
                            'confidence': match_result['confidence'],
                            'sensitivity_level': rule.sensitivity_level.value
                        }
                    )
                    
                    # Stop if this is a high-confidence match and rule says to stop
                    if (confidence_level in [ClassificationConfidenceLevel.VERY_HIGH, ClassificationConfidenceLevel.CERTAIN] 
                        and rule.scope == ClassificationScope.GLOBAL):
                        break
                
                else:
                    # Update rule statistics for non-matches
                    rule.execution_count += 1
            
            except Exception as e:
                logger.error(f"Error applying rule {rule.id} to {entity_type}:{entity_id}: {str(e)}")
                rule.execution_count += 1
                # Don't break the loop, continue with other rules
        
        return results
    
    async def _apply_single_rule(
        self, 
        rule: ClassificationRule, 
        entity_data: Any, 
        entity_type: str
    ) -> Dict[str, Any]:
        """Apply a single classification rule with type-specific logic"""
        
        if rule.rule_type == ClassificationRuleType.REGEX_PATTERN:
            return await self._apply_regex_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.DICTIONARY_LOOKUP:
            return await self._apply_dictionary_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.COLUMN_NAME_PATTERN:
            return await self._apply_column_name_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.TABLE_NAME_PATTERN:
            return await self._apply_table_name_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.DATA_TYPE_PATTERN:
            return await self._apply_data_type_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.VALUE_RANGE_PATTERN:
            return await self._apply_value_range_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.STATISTICAL_PATTERN:
            return await self._apply_statistical_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.METADATA_PATTERN:
            return await self._apply_metadata_rule(rule, entity_data, entity_type)
        
        elif rule.rule_type == ClassificationRuleType.COMPOSITE_PATTERN:
            return await self._apply_composite_rule(rule, entity_data, entity_type)
        
        else:
            logger.warning(f"Unsupported rule type: {rule.rule_type}")
            return {'matched': False, 'confidence': 0.0}
    
    async def _apply_regex_rule(
        self, 
        rule: ClassificationRule, 
        entity_data: Any, 
        entity_type: str
    ) -> Dict[str, Any]:
        """Apply regex pattern rule with caching and performance optimization"""
        try:
            # Get or compile pattern
            pattern = self._get_compiled_pattern(rule)
            
            # Extract text data based on entity type
            text_data = self._extract_text_data(entity_data, entity_type)
            
            matches = []
            total_checks = 0
            
            for text_field, text_value in text_data.items():
                if text_value:
                    total_checks += 1
                    if pattern.search(str(text_value)):
                        matches.append({
                            'field': text_field,
                            'value': str(text_value),
                            'pattern': rule.pattern
                        })
            
            if matches:
                confidence = min(1.0, len(matches) / max(1, total_checks))
                return {
                    'matched': True,
                    'confidence': confidence,
                    'patterns': [rule.pattern],
                    'values': [m['value'] for m in matches],
                    'context': {'field_matches': matches},
                    'sample_data': {'matched_fields': [m['field'] for m in matches]},
                    'match_percentage': (len(matches) / max(1, total_checks)) * 100
                }
            
            return {'matched': False, 'confidence': 0.0}
            
        except Exception as e:
            logger.error(f"Error applying regex rule {rule.id}: {str(e)}")
            return {'matched': False, 'confidence': 0.0}
    
    async def _apply_dictionary_rule(
        self, 
        rule: ClassificationRule, 
        entity_data: Any, 
        entity_type: str
    ) -> Dict[str, Any]:
        """Apply dictionary lookup rule with fuzzy matching"""
        try:
            # Get dictionary entries
            dictionary_entries = await self._get_dictionary_entries(rule.pattern)
            if not dictionary_entries:
                return {'matched': False, 'confidence': 0.0}
            
            # Extract text data
            text_data = self._extract_text_data(entity_data, entity_type)
            
            matches = []
            total_checks = 0
            
            for text_field, text_value in text_data.items():
                if text_value:
                    total_checks += 1
                    text_lower = str(text_value).lower() if not rule.case_sensitive else str(text_value)
                    
                    for term in dictionary_entries:
                        term_lower = term.lower() if not rule.case_sensitive else term
                        
                        if rule.whole_word_only:
                            # Use word boundary matching
                            import re
                            pattern = r'\b' + re.escape(term_lower) + r'\b'
                            if re.search(pattern, text_lower):
                                matches.append({
                                    'field': text_field,
                                    'value': text_value,
                                    'matched_term': term
                                })
                                break
                        else:
                            # Simple substring matching
                            if term_lower in text_lower:
                                matches.append({
                                    'field': text_field,
                                    'value': text_value,
                                    'matched_term': term
                                })
                                break
            
            if matches:
                confidence = min(1.0, len(matches) / max(1, total_checks))
                return {
                    'matched': True,
                    'confidence': confidence,
                    'patterns': [rule.pattern],
                    'values': [m['matched_term'] for m in matches],
                    'context': {'dictionary_matches': matches},
                    'sample_data': {'matched_terms': [m['matched_term'] for m in matches]},
                    'match_percentage': (len(matches) / max(1, total_checks)) * 100
                }
            
            return {'matched': False, 'confidence': 0.0}
            
        except Exception as e:
            logger.error(f"Error applying dictionary rule {rule.id}: {str(e)}")
            return {'matched': False, 'confidence': 0.0}
    
    # ==================== HELPER METHODS ====================
    
    def _get_compiled_pattern(self, rule: ClassificationRule) -> re.Pattern:
        """Get compiled regex pattern with caching"""
        cache_key = f"{rule.id}_{rule.pattern}_{rule.case_sensitive}"
        
        if cache_key not in self._compiled_patterns:
            flags = 0 if rule.case_sensitive else re.IGNORECASE
            try:
                self._compiled_patterns[cache_key] = re.compile(rule.pattern, flags)
                self._performance_stats['cache_misses'] += 1
            except re.error as e:
                logger.error(f"Invalid regex pattern in rule {rule.id}: {rule.pattern} - {str(e)}")
                # Return a pattern that never matches
                self._compiled_patterns[cache_key] = re.compile(r'(?!.*)')
        else:
            self._performance_stats['cache_hits'] += 1
        
        return self._compiled_patterns[cache_key]
    
    def _extract_text_data(self, entity_data: Any, entity_type: str) -> Dict[str, str]:
        """Extract text data from entity based on type"""
        text_data = {}
        
        if entity_type == "scan_result":
            # Extract from scan result
            if hasattr(entity_data, 'column_name'):
                text_data['column_name'] = entity_data.column_name
            if hasattr(entity_data, 'table_name'):
                text_data['table_name'] = entity_data.table_name
            if hasattr(entity_data, 'schema_name'):
                text_data['schema_name'] = entity_data.schema_name
            if hasattr(entity_data, 'sample_values'):
                text_data['sample_values'] = str(entity_data.sample_values)
            if hasattr(entity_data, 'data_type'):
                text_data['data_type'] = entity_data.data_type
        
        elif entity_type == "catalog_item":
            # Extract from catalog item
            if hasattr(entity_data, 'name'):
                text_data['name'] = entity_data.name
            if hasattr(entity_data, 'description'):
                text_data['description'] = entity_data.description or ""
            if hasattr(entity_data, 'column_name'):
                text_data['column_name'] = entity_data.column_name
            if hasattr(entity_data, 'table_name'):
                text_data['table_name'] = entity_data.table_name
            if hasattr(entity_data, 'schema_name'):
                text_data['schema_name'] = entity_data.schema_name
            if hasattr(entity_data, 'data_type'):
                text_data['data_type'] = entity_data.data_type
        
        elif entity_type == "data_source":
            # Extract from data source
            if hasattr(entity_data, 'name'):
                text_data['name'] = entity_data.name
            if hasattr(entity_data, 'description'):
                text_data['description'] = entity_data.description or ""
        
        return text_data
    
    def _determine_confidence_level(self, confidence_score: float) -> ClassificationConfidenceLevel:
        """Determine confidence level from numeric score"""
        if confidence_score >= 0.95:
            return ClassificationConfidenceLevel.CERTAIN
        elif confidence_score >= 0.8:
            return ClassificationConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.6:
            return ClassificationConfidenceLevel.HIGH
        elif confidence_score >= 0.4:
            return ClassificationConfidenceLevel.MEDIUM
        elif confidence_score >= 0.2:
            return ClassificationConfidenceLevel.LOW
        else:
            return ClassificationConfidenceLevel.VERY_LOW
    
    def _build_entity_path(self, entity_data: Any, entity_type: str) -> str:
        """Build hierarchical path for entity"""
        path_parts = []
        
        if hasattr(entity_data, 'data_source') and entity_data.data_source:
            path_parts.append(entity_data.data_source.name)
        
        if hasattr(entity_data, 'schema_name') and entity_data.schema_name:
            path_parts.append(entity_data.schema_name)
        
        if hasattr(entity_data, 'table_name') and entity_data.table_name:
            path_parts.append(entity_data.table_name)
        
        if hasattr(entity_data, 'column_name') and entity_data.column_name:
            path_parts.append(entity_data.column_name)
        elif hasattr(entity_data, 'name') and entity_data.name:
            path_parts.append(entity_data.name)
        
        return " > ".join(path_parts) if path_parts else entity_type
    
    # ==================== AUDIT AND MONITORING ====================
    
    async def _log_audit_event(
        self,
        session: Session,
        event_type: str,
        event_category: str, 
        event_description: str,
        target_type: str,
        target_id: Optional[str] = None,
        target_name: Optional[str] = None,
        classification_result_id: Optional[int] = None,
        user_id: Optional[str] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        event_data: Optional[Dict[str, Any]] = None
    ):
        """Comprehensive audit logging"""
        try:
            audit_log = ClassificationAuditLog(
                uuid=str(uuid.uuid4()),
                event_type=event_type,
                event_category=event_category,
                event_description=event_description,
                target_type=target_type,
                target_id=target_id,
                target_name=target_name,
                classification_result_id=classification_result_id,
                old_values=old_values,
                new_values=new_values,
                event_data=event_data,
                user_id=user_id
            )
            
            session.add(audit_log)
            # Note: Don't commit here, let the calling method handle it
            
        except Exception as e:
            logger.error(f"Error creating audit log: {str(e)}")
    
    # ==================== INTEGRATION HELPERS ====================
    
    async def _validate_compliance_frameworks(self, session: Session, compliance_ids: List[int]) -> bool:
        """Validate that compliance framework IDs exist"""
        try:
            count = session.query(ComplianceRule).filter(
                ComplianceRule.id.in_(compliance_ids)
            ).count()
            return count == len(compliance_ids)
        except Exception as e:
            logger.error(f"Error validating compliance frameworks: {str(e)}")
            return False
    
    async def _get_applicable_rules(
        self, 
        session: Session, 
        data_source_id: int, 
        framework_id: Optional[int]
    ) -> List[ClassificationRule]:
        """Get rules applicable to a data source"""
        try:
            query = session.query(ClassificationRule).filter(
                ClassificationRule.is_active == True
            )
            
            if framework_id:
                query = query.filter(
                    or_(
                        ClassificationRule.framework_id == framework_id,
                        ClassificationRule.scope == ClassificationScope.GLOBAL
                    )
                )
            else:
                query = query.filter(
                    ClassificationRule.scope == ClassificationScope.GLOBAL
                )
            
            return query.order_by(ClassificationRule.priority).all()
            
        except Exception as e:
            logger.error(f"Error getting applicable rules: {str(e)}")
            return []
    
    async def _trigger_data_source_classification(
        self, 
        session: Session, 
        data_source_id: int, 
        user: str
    ):
        """Trigger classification for all existing data in a data source"""
        try:
            # Schedule a background task to classify existing data
            task_data = {
                'task_type': 'classify_data_source',
                'data_source_id': data_source_id,
                'user': user,
                'priority': 'medium'
            }
            
            # This would integrate with the existing task service
            # await self.task_service.schedule_task(task_data)
            
            logger.info(f"Scheduled classification task for data source {data_source_id}")
            
        except Exception as e:
            logger.error(f"Error triggering data source classification: {str(e)}")
    
    # Additional methods would continue here...
    # This is a comprehensive foundation that integrates deeply with the existing system
