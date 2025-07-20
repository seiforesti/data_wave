from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging
import uuid
import json

# **COMPREHENSIVE: Import all interconnected services and models**
from app.models.compliance_rule_models import (
    ComplianceRule, ComplianceRuleTemplate, ComplianceRuleEvaluation, 
    ComplianceIssue, ComplianceWorkflow, ComplianceWorkflowExecution,
    ComplianceRuleResponse, ComplianceRuleEvaluationResponse, 
    ComplianceIssueResponse, ComplianceWorkflowResponse,
    ComplianceRuleCreate, ComplianceRuleUpdate, ComplianceIssueCreate, 
    ComplianceIssueUpdate, ComplianceWorkflowCreate, ComplianceWorkflowUpdate,
    ComplianceRuleType, ComplianceRuleSeverity, ComplianceRuleStatus,
    ComplianceRuleScope, RuleValidationStatus, WorkflowStatus
)

# **COMPREHENSIVE: Import all backend models for interconnection**
from app.models.scan_models import DataSource, ScanRuleSet, Scan, DataSourceType, Environment, DataClassification
from app.models.compliance_models import ComplianceRequirement, ComplianceAssessment, ComplianceFramework, ComplianceStatus
from app.models.security_models import AccessControl, SecurityPolicy
from app.models.performance_models import PerformanceMetric
from app.models.workflow_models import WorkflowTemplate, WorkflowExecution

# **COMPREHENSIVE: Import all backend services for interconnection**
from app.services.data_source_service import DataSourceService
from app.services.scan_service import ScanService
from app.services.custom_scan_rule_service import CustomScanRuleService
from app.services.compliance_service import ComplianceService
from app.services.security_service import SecurityService
from app.services.performance_service import PerformanceService
from app.services.advanced_workflow_service import AdvancedWorkflowService

logger = logging.getLogger(__name__)


class ComplianceRuleService:
    """Enhanced service layer for compliance rule management with full backend interconnection"""
    
    # **COMPREHENSIVE: Framework Templates with Real Implementation Logic**
    @staticmethod
    def get_compliance_frameworks() -> List[Dict[str, Any]]:
        """Get available compliance frameworks with comprehensive templates"""
        return [
            {
                "id": "soc2",
                "name": "SOC 2",
                "description": "Service Organization Control 2 - Trust Services Criteria",
                "version": "2017",
                "categories": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
                "authority": "AICPA",
                "scope": "Service organizations",
                "templates": [
                    {
                        "id": "soc2_access_control",
                        "name": "Access Control Management",
                        "description": "Logical and physical access controls (CC6.1-CC6.8)",
                        "rule_type": "access_control",
                        "severity": "high",
                        "condition": "access_review_frequency <= 90 AND privileged_access_monitored == true AND mfa_enabled == true",
                        "scope": "global",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Review access controls\\n2. Implement MFA\\n3. Enable privileged access monitoring\\n4. Conduct quarterly access reviews"
                    },
                    {
                        "id": "soc2_data_encryption",
                        "name": "Data Encryption",
                        "description": "Data encryption at rest and in transit (CC6.7)",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "encryption_at_rest == true AND encryption_in_transit == true AND key_management_implemented == true",
                        "scope": "data_source",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Enable encryption at rest\\n2. Configure TLS for data in transit\\n3. Implement key management\\n4. Verify encryption coverage"
                    },
                    {
                        "id": "soc2_monitoring",
                        "name": "System Monitoring",
                        "description": "Continuous monitoring and logging (CC7.1-CC7.5)",
                        "rule_type": "audit",
                        "severity": "high",
                        "condition": "logging_enabled == true AND monitoring_alerts_configured == true AND log_retention >= 365",
                        "scope": "global",
                        "validation_frequency": "daily",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Enable comprehensive logging\\n2. Configure monitoring alerts\\n3. Set log retention policy\\n4. Review logs regularly"
                    }
                ]
            },
            {
                "id": "gdpr",
                "name": "GDPR",
                "description": "General Data Protection Regulation",
                "version": "2018",
                "categories": ["Data Protection", "Privacy Rights", "Consent Management", "Data Retention", "Data Subject Rights"],
                "authority": "European Union",
                "scope": "Organizations processing EU personal data",
                "templates": [
                    {
                        "id": "gdpr_data_retention",
                        "name": "Data Retention Policy",
                        "description": "Proper data retention and deletion (Article 5)",
                        "rule_type": "data_retention",
                        "severity": "high",
                        "condition": "retention_policy_defined == true AND automated_deletion == true AND retention_period <= max_allowed",
                        "scope": "data_source",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Define retention policy\\n2. Implement automated deletion\\n3. Document retention periods\\n4. Regular compliance review"
                    },
                    {
                        "id": "gdpr_consent_management",
                        "name": "Consent Management",
                        "description": "Valid consent for data processing (Article 6, 7)",
                        "rule_type": "privacy",
                        "severity": "critical",
                        "condition": "explicit_consent == true AND consent_withdrawable == true AND consent_documented == true",
                        "scope": "global",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement consent mechanism\\n2. Enable consent withdrawal\\n3. Document consent records\\n4. Regular consent audits"
                    },
                    {
                        "id": "gdpr_data_subject_rights",
                        "name": "Data Subject Rights",
                        "description": "Right to access, rectification, erasure (Articles 15-17)",
                        "rule_type": "privacy",
                        "severity": "high",
                        "condition": "data_subject_access_implemented == true AND data_portability_enabled == true AND erasure_capability == true",
                        "scope": "global",
                        "validation_frequency": "monthly",
                        "business_impact": "high",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement data subject access\\n2. Enable data portability\\n3. Provide erasure capability\\n4. Document request handling"
                    }
                ]
            },
            {
                "id": "hipaa",
                "name": "HIPAA",
                "description": "Health Insurance Portability and Accountability Act",
                "version": "1996/2013",
                "categories": ["Physical Safeguards", "Administrative Safeguards", "Technical Safeguards"],
                "authority": "US Department of Health and Human Services",
                "scope": "Healthcare organizations and business associates",
                "templates": [
                    {
                        "id": "hipaa_access_control",
                        "name": "PHI Access Control",
                        "description": "Protected Health Information access controls (164.312(a))",
                        "rule_type": "access_control",
                        "severity": "critical",
                        "condition": "phi_access_logged == true AND minimum_necessary == true AND role_based_access == true",
                        "scope": "data_source",
                        "validation_frequency": "weekly",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Implement PHI access logging\\n2. Apply minimum necessary principle\\n3. Configure role-based access\\n4. Regular access audits"
                    },
                    {
                        "id": "hipaa_encryption",
                        "name": "PHI Encryption",
                        "description": "Encryption of PHI (164.312(e))",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "phi_encrypted_at_rest == true AND phi_encrypted_in_transit == true AND encryption_keys_managed == true",
                        "scope": "data_source",
                        "validation_frequency": "daily",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Encrypt PHI at rest\\n2. Encrypt PHI in transit\\n3. Implement key management\\n4. Verify encryption coverage"
                    }
                ]
            },
            {
                "id": "pci_dss",
                "name": "PCI DSS",
                "description": "Payment Card Industry Data Security Standard",
                "version": "4.0",
                "categories": ["Network Security", "Data Protection", "Access Control", "Monitoring", "Security Policies"],
                "authority": "PCI Security Standards Council",
                "scope": "Organizations handling payment card data",
                "templates": [
                    {
                        "id": "pci_data_encryption",
                        "name": "Cardholder Data Encryption",
                        "description": "Protect stored cardholder data (Requirement 3)",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "cardholder_data_encrypted == true AND encryption_keys_secure == true AND data_masking_implemented == true",
                        "scope": "data_source",
                        "validation_frequency": "daily",
                        "business_impact": "critical",
                        "regulatory_requirement": True,
                        "remediation_steps": "1. Encrypt cardholder data\\n2. Secure encryption keys\\n3. Implement data masking\\n4. Regular encryption audits"
                    }
                ]
            }
        ]
    
    # **COMPREHENSIVE: Enhanced Data Source Integration**
    @staticmethod
    def get_applicable_data_sources(
        session: Session,
        rule_type: Optional[ComplianceRuleType] = None,
        compliance_standard: Optional[str] = None,
        environment: Optional[Environment] = None,
        data_classification: Optional[DataClassification] = None
    ) -> List[Dict[str, Any]]:
        """Get data sources that are applicable for compliance rules with comprehensive filtering"""
        try:
            # Get all data sources with their compliance-relevant information
            query = select(DataSource)
            
            # Apply filters
            if environment:
                query = query.where(DataSource.environment == environment)
            if data_classification:
                query = query.where(DataSource.data_classification == data_classification)
            
            data_sources = session.exec(query).all()
            
            applicable_sources = []
            for ds in data_sources:
                # Get compliance status from ComplianceService
                compliance_status = None
                try:
                    compliance_status = ComplianceService.get_compliance_status(session, ds.id)
                except Exception as e:
                    logger.warning(f"Could not get compliance status for data source {ds.id}: {e}")
                
                source_info = {
                    "id": ds.id,
                    "name": ds.name,
                    "source_type": ds.source_type,
                    "environment": ds.environment,
                    "data_classification": ds.data_classification,
                    "criticality": ds.criticality,
                    "compliance_score": ds.compliance_score or 0,
                    "encryption_enabled": ds.encryption_enabled,
                    "monitoring_enabled": ds.monitoring_enabled,
                    "backup_enabled": ds.backup_enabled,
                    "tags": ds.tags or [],
                    "owner": ds.owner,
                    "team": ds.team,
                    "applicable_rules": [],
                    "current_compliance": compliance_status.overall_score if compliance_status else 0,
                    "risk_level": "high" if (ds.compliance_score or 0) < 70 else "medium" if (ds.compliance_score or 0) < 90 else "low"
                }
                
                # Determine applicable rule types based on data source characteristics
                if ds.data_classification in ["confidential", "restricted"]:
                    source_info["applicable_rules"].extend(["encryption", "access_control", "audit", "privacy"])
                
                if ds.environment == "production":
                    source_info["applicable_rules"].extend(["backup", "monitoring", "security", "availability"])
                
                if "pii" in (ds.tags or []) or "phi" in (ds.tags or []):
                    source_info["applicable_rules"].extend(["privacy", "data_retention", "consent", "data_subject_rights"])
                
                if "payment" in (ds.tags or []) or "financial" in (ds.tags or []):
                    source_info["applicable_rules"].extend(["pci_compliance", "financial_controls"])
                
                # Filter by rule type if specified
                if rule_type and rule_type.value not in source_info["applicable_rules"]:
                    continue
                
                applicable_sources.append(source_info)
            
            return applicable_sources
            
        except Exception as e:
            logger.error(f"Error getting applicable data sources: {str(e)}")
            return []
    
    # **COMPREHENSIVE: Scan Rule Integration**
    @staticmethod
    def get_related_scan_rules(
        session: Session,
        compliance_rule_id: int
    ) -> List[Dict[str, Any]]:
        """Get scan rules related to a compliance rule with comprehensive details"""
        try:
            rule = session.get(ComplianceRule, compliance_rule_id)
            if not rule:
                return []
            
            related_rules = []
            
            # Get scan rule set if linked
            if rule.scan_rule_set_id:
                scan_rule_set = session.get(ScanRuleSet, rule.scan_rule_set_id)
                if scan_rule_set:
                    related_rules.append({
                        "id": scan_rule_set.id,
                        "name": scan_rule_set.name,
                        "type": "scan_rule_set",
                        "description": scan_rule_set.description,
                        "rules_count": scan_rule_set.rule_count,
                        "is_active": scan_rule_set.is_active,
                        "data_source_id": scan_rule_set.data_source_id,
                        "created_at": scan_rule_set.created_at.isoformat(),
                        "updated_at": scan_rule_set.updated_at.isoformat()
                    })
            
            # Get custom scan rules if linked
            if rule.custom_scan_rule_ids:
                for rule_id in rule.custom_scan_rule_ids:
                    try:
                        # This would integrate with CustomScanRuleService
                        custom_rule = CustomScanRuleService.get_rule_by_id(session, rule_id)
                        if custom_rule:
                            related_rules.append({
                                "id": custom_rule["id"],
                                "name": custom_rule["name"],
                                "type": "custom_scan_rule",
                                "description": custom_rule.get("description", ""),
                                "pattern": custom_rule.get("pattern", ""),
                                "category": custom_rule.get("category", ""),
                                "severity": custom_rule.get("severity", "medium"),
                                "is_active": custom_rule.get("is_active", True)
                            })
                    except Exception as e:
                        logger.warning(f"Could not get custom scan rule {rule_id}: {e}")
            
            return related_rules
            
        except Exception as e:
            logger.error(f"Error getting related scan rules: {str(e)}")
            return []
    
    # **COMPREHENSIVE: Enhanced Rule Evaluation with Full Integration**
    @staticmethod
    def evaluate_rule_with_data_sources(
        session: Session, 
        rule_id: int,
        data_source_ids: Optional[List[int]] = None,
        run_scans: bool = False,
        include_performance_check: bool = True,
        include_security_check: bool = True
    ) -> ComplianceRuleEvaluationResponse:
        """Enhanced rule evaluation that integrates with all backend systems"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                raise ValueError(f"Rule {rule_id} not found")
            
            # Determine target data sources
            target_sources = data_source_ids or rule.data_source_ids
            if rule.applies_to_all_sources:
                all_sources = DataSourceService.get_all_data_sources(session)
                target_sources = [ds.id for ds in all_sources]
            
            evaluation_results = []
            total_entities = 0
            compliant_entities = 0
            
            for source_id in target_sources:
                source = DataSourceService.get_data_source(session, source_id)
                if not source:
                    continue
                
                # **COMPREHENSIVE: Trigger scans if configured**
                scan_results = None
                if run_scans and rule.auto_scan_on_evaluation:
                    try:
                        # Create and execute scan
                        scan = ScanService.create_scan(
                            session=session,
                            name=f"Compliance Scan - {rule.name}",
                            data_source_id=source_id,
                            scan_rule_set_id=rule.scan_rule_set_id,
                            description=f"Automated scan for compliance rule: {rule.name}"
                        )
                        
                        # Execute scan (this would be async in production)
                        scan_results = ScanService.start_scan(session, scan.id)
                        
                    except Exception as scan_error:
                        logger.warning(f"Failed to run scan for source {source_id}: {scan_error}")
                
                # **COMPREHENSIVE: Performance check if enabled**
                performance_metrics = None
                if include_performance_check:
                    try:
                        performance_metrics = PerformanceService.get_data_source_metrics(session, source_id)
                    except Exception as perf_error:
                        logger.warning(f"Failed to get performance metrics for source {source_id}: {perf_error}")
                
                # **COMPREHENSIVE: Security check if enabled**
                security_status = None
                if include_security_check:
                    try:
                        security_status = SecurityService.get_data_source_security_status(session, source_id)
                    except Exception as sec_error:
                        logger.warning(f"Failed to get security status for source {source_id}: {sec_error}")
                
                # **COMPREHENSIVE: Evaluate compliance based on all factors**
                source_result = ComplianceRuleService._evaluate_source_compliance_comprehensive(
                    rule, source, scan_results, performance_metrics, security_status
                )
                evaluation_results.append(source_result)
                
                total_entities += source_result["entity_count"]
                compliant_entities += source_result["compliant_count"]
            
            # Calculate overall compliance
            compliance_score = (compliant_entities / total_entities * 100) if total_entities > 0 else 0
            status = RuleValidationStatus.COMPLIANT if compliance_score >= 90 else RuleValidationStatus.NON_COMPLIANT
            
            # Create evaluation record
            evaluation = ComplianceRuleEvaluation(
                rule_id=rule_id,
                evaluation_id=f"eval_{rule_id}_{int(datetime.now().timestamp())}",
                status=status,
                entity_count={
                    "total": total_entities,
                    "compliant": compliant_entities,
                    "non_compliant": total_entities - compliant_entities,
                    "error": 0,
                    "not_applicable": 0
                },
                compliance_score=compliance_score,
                issues_found=total_entities - compliant_entities,
                execution_time_ms=100,  # Would be actual execution time
                entities_processed=total_entities,
                evaluation_context={
                    "data_sources": target_sources,
                    "scan_triggered": run_scans and rule.auto_scan_on_evaluation,
                    "performance_check": include_performance_check,
                    "security_check": include_security_check,
                    "evaluation_details": evaluation_results
                },
                metadata={"rule_version": rule.version}
            )
            
            session.add(evaluation)
            session.commit()
            session.refresh(evaluation)
            
            return ComplianceRuleEvaluationResponse.from_orm(evaluation)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error evaluating rule with data sources {rule_id}: {str(e)}")
            raise
    
    @staticmethod
    def _evaluate_source_compliance_comprehensive(
        rule: ComplianceRule, 
        source: DataSource, 
        scan_results: Optional[Dict[str, Any]] = None,
        performance_metrics: Optional[Dict[str, Any]] = None,
        security_status: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Comprehensive compliance evaluation for a specific data source"""
        entity_count = source.entity_count or 100
        
        # Base compliance on multiple factors
        compliance_factors = []
        
        # Check encryption requirements
        if rule.rule_type == ComplianceRuleType.ENCRYPTION:
            compliance_factors.append(1.0 if source.encryption_enabled else 0.0)
            if security_status:
                encryption_score = security_status.get("encryption_score", 0.5)
                compliance_factors.append(encryption_score / 100.0)
        
        # Check access control requirements
        if rule.rule_type == ComplianceRuleType.ACCESS_CONTROL:
            compliance_factors.append(0.9 if source.monitoring_enabled else 0.3)
            if security_status:
                access_score = security_status.get("access_control_score", 0.5)
                compliance_factors.append(access_score / 100.0)
        
        # Check data classification alignment
        if rule.rule_type == ComplianceRuleType.PRIVACY:
            if source.data_classification in ["confidential", "restricted"]:
                compliance_factors.append(0.8)
            else:
                compliance_factors.append(1.0)
        
        # Check performance requirements
        if performance_metrics and rule.rule_type in [ComplianceRuleType.AUDIT, ComplianceRuleType.MONITORING]:
            uptime = performance_metrics.get("uptime_percentage", 100.0)
            compliance_factors.append(uptime / 100.0)
        
        # Check scan results
        if scan_results and rule.rule_type in [ComplianceRuleType.QUALITY, ComplianceRuleType.AUDIT]:
            scan_compliance = scan_results.get("compliance_score", 85.0)
            compliance_factors.append(scan_compliance / 100.0)
        
        # Default compliance if no specific factors
        if not compliance_factors:
            compliance_factors.append(0.85)  # Default 85% compliance
        
        # Calculate average compliance
        avg_compliance = sum(compliance_factors) / len(compliance_factors)
        compliant_count = int(entity_count * avg_compliance)
        
        return {
            "source_id": source.id,
            "source_name": source.name,
            "entity_count": entity_count,
            "compliant_count": compliant_count,
            "compliance_percentage": avg_compliance * 100,
            "factors_evaluated": len(compliance_factors),
            "scan_executed": scan_results is not None,
            "performance_checked": performance_metrics is not None,
            "security_checked": security_status is not None
        }

    # **COMPREHENSIVE: CRUD Operations with Full Integration**
    @staticmethod
    def get_rules(
        session: Session,
        rule_type: Optional[ComplianceRuleType] = None,
        severity: Optional[ComplianceRuleSeverity] = None,
        status: Optional[ComplianceRuleStatus] = None,
        scope: Optional[ComplianceRuleScope] = None,
        data_source_id: Optional[int] = None,
        compliance_standard: Optional[str] = None,
        tags: Optional[List[str]] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
        sort: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[ComplianceRuleResponse], int]:
        """Get compliance rules with comprehensive filtering and pagination"""
        try:
            query = select(ComplianceRule)
            
            # Apply filters
            filters = []
            
            if rule_type:
                filters.append(ComplianceRule.rule_type == rule_type)
            
            if severity:
                filters.append(ComplianceRule.severity == severity)
            
            if status:
                filters.append(ComplianceRule.status == status)
            
            if scope:
                filters.append(ComplianceRule.scope == scope)
            
            if data_source_id:
                filters.append(ComplianceRule.data_source_ids.contains([data_source_id]))
            
            if compliance_standard:
                filters.append(ComplianceRule.compliance_standard == compliance_standard)
            
            if tags:
                for tag in tags:
                    filters.append(ComplianceRule.tags.contains([tag]))
            
            if search:
                search_filter = or_(
                    ComplianceRule.name.ilike(f"%{search}%"),
                    ComplianceRule.description.ilike(f"%{search}%"),
                    ComplianceRule.compliance_standard.ilike(f"%{search}%")
                )
                filters.append(search_filter)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(ComplianceRule.id)).where(and_(*filters)) if filters else select(func.count(ComplianceRule.id))
            total = session.exec(count_query).one()
            
            # Apply sorting
            if hasattr(ComplianceRule, sort):
                sort_column = getattr(ComplianceRule, sort)
                if sort_order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            rules = session.exec(query).all()
            
            return [ComplianceRuleResponse.from_orm(rule) for rule in rules], total
            
        except Exception as e:
            logger.error(f"Error getting compliance rules: {str(e)}")
            raise

    @staticmethod
    def get_rule(session: Session, rule_id: int) -> Optional[ComplianceRuleResponse]:
        """Get a specific compliance rule by ID"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return None
            
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            logger.error(f"Error getting compliance rule {rule_id}: {str(e)}")
            raise

    @staticmethod
    def create_rule(session: Session, rule_data: ComplianceRuleCreate, created_by: Optional[str] = None) -> ComplianceRuleResponse:
        """Create a new compliance rule with comprehensive validation"""
        try:
            # Validate data sources exist
            if rule_data.data_source_ids:
                for ds_id in rule_data.data_source_ids:
                    ds = session.get(DataSource, ds_id)
                    if not ds:
                        raise ValueError(f"Data source {ds_id} not found")
            
            # Validate scan rule set exists if specified
            if hasattr(rule_data, 'scan_rule_set_id') and rule_data.scan_rule_set_id:
                scan_rule_set = session.get(ScanRuleSet, rule_data.scan_rule_set_id)
                if not scan_rule_set:
                    raise ValueError(f"Scan rule set {rule_data.scan_rule_set_id} not found")
            
            # Create rule instance
            rule = ComplianceRule(
                **rule_data.dict(),
                created_by=created_by,
                updated_by=created_by
            )
            
            session.add(rule)
            session.commit()
            session.refresh(rule)
            
            logger.info(f"Created compliance rule: {rule.name} (ID: {rule.id})")
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance rule: {str(e)}")
            raise

    @staticmethod
    def create_rule_from_template(
        session: Session,
        template_id: str,
        customizations: Dict[str, Any],
        created_by: Optional[str] = None
    ) -> ComplianceRuleResponse:
        """Create a compliance rule from a template with customizations"""
        try:
            # Get framework templates
            frameworks = ComplianceRuleService.get_compliance_frameworks()
            template = None
            framework_info = None
            
            for framework in frameworks:
                for tmpl in framework.get("templates", []):
                    if tmpl["id"] == template_id:
                        template = tmpl
                        framework_info = framework
                        break
                if template:
                    break
            
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            # Merge template with customizations
            rule_data = {
                "name": customizations.get("name", template["name"]),
                "description": customizations.get("description", template["description"]),
                "rule_type": ComplianceRuleType(customizations.get("rule_type", template["rule_type"])),
                "severity": ComplianceRuleSeverity(customizations.get("severity", template["severity"])),
                "condition": customizations.get("condition", template["condition"]),
                "compliance_standard": customizations.get("compliance_standard", framework_info.get("name")),
                "scope": ComplianceRuleScope(customizations.get("scope", template.get("scope", "global"))),
                "validation_frequency": customizations.get("validation_frequency", template.get("validation_frequency", "weekly")),
                "business_impact": customizations.get("business_impact", template.get("business_impact", "medium")),
                "regulatory_requirement": customizations.get("regulatory_requirement", template.get("regulatory_requirement", False)),
                "remediation_steps": customizations.get("remediation_steps", template.get("remediation_steps")),
                "data_source_ids": customizations.get("data_source_ids", []),
                "tags": customizations.get("tags", []),
                "metadata": {
                    "template_id": template_id,
                    "framework": framework_info.get("id"),
                    "framework_version": framework_info.get("version"),
                    "created_from_template": True,
                    **customizations.get("metadata", {})
                }
            }
            
            # Create rule
            rule_create = ComplianceRuleCreate(**rule_data)
            return ComplianceRuleService.create_rule(session, rule_create, created_by)
            
        except Exception as e:
            logger.error(f"Error creating rule from template {template_id}: {str(e)}")
            raise

    @staticmethod
    def update_rule(
        session: Session, 
        rule_id: int, 
        rule_data: ComplianceRuleUpdate, 
        updated_by: Optional[str] = None
    ) -> Optional[ComplianceRuleResponse]:
        """Update an existing compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return None
            
            # Update fields
            update_data = rule_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(rule, field, value)
            
            rule.updated_by = updated_by
            rule.updated_at = datetime.now()
            rule.version += 1
            
            session.add(rule)
            session.commit()
            session.refresh(rule)
            
            logger.info(f"Updated compliance rule: {rule.name} (ID: {rule.id})")
            return ComplianceRuleResponse.from_orm(rule)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating compliance rule {rule_id}: {str(e)}")
            raise

    @staticmethod
    def delete_rule(session: Session, rule_id: int) -> bool:
        """Delete a compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return False
            
            # Check if rule has dependencies
            evaluations_count = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.rule_id == rule_id
                )
            ).one()
            
            if evaluations_count > 0:
                logger.warning(f"Cannot delete rule {rule_id}: has {evaluations_count} evaluations")
                return False
            
            session.delete(rule)
            session.commit()
            
            logger.info(f"Deleted compliance rule: {rule.name} (ID: {rule.id})")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting compliance rule {rule_id}: {str(e)}")
            raise

    # **COMPREHENSIVE: Advanced Analytics and Insights**
    @staticmethod
    def get_compliance_dashboard_analytics(
        session: Session,
        data_source_id: Optional[int] = None,
        time_range: str = "30d"
    ) -> Dict[str, Any]:
        """Get comprehensive compliance analytics for dashboard"""
        try:
            # Parse time range
            days = int(time_range.rstrip('d')) if time_range.endswith('d') else 30
            start_date = datetime.now() - timedelta(days=days)
            
            # Get all rules for analytics
            rules_query = select(ComplianceRule)
            if data_source_id:
                rules_query = rules_query.where(ComplianceRule.data_source_ids.contains([data_source_id]))
            
            rules = session.exec(rules_query).all()
            
            # Calculate metrics
            total_rules = len(rules)
            active_rules = len([r for r in rules if r.status == ComplianceRuleStatus.ACTIVE])
            
            # Status distribution
            status_counts = {}
            for status in ComplianceRuleStatus:
                status_counts[status.value] = len([r for r in rules if r.status == status])
            
            # Severity distribution
            severity_counts = {}
            for severity in ComplianceRuleSeverity:
                severity_counts[severity.value] = len([r for r in rules if r.severity == severity])
            
            # Framework coverage
            framework_counts = {}
            for rule in rules:
                if rule.compliance_standard:
                    framework_counts[rule.compliance_standard] = framework_counts.get(rule.compliance_standard, 0) + 1
            
            # Recent evaluations
            recent_evaluations = session.exec(
                select(ComplianceRuleEvaluation).where(
                    ComplianceRuleEvaluation.evaluated_at >= start_date
                ).order_by(ComplianceRuleEvaluation.evaluated_at.desc()).limit(10)
            ).all()
            
            # Compliance trends
            trend_data = []
            for i in range(days):
                date = start_date + timedelta(days=i)
                day_evaluations = session.exec(
                    select(ComplianceRuleEvaluation).where(
                        and_(
                            ComplianceRuleEvaluation.evaluated_at >= date,
                            ComplianceRuleEvaluation.evaluated_at < date + timedelta(days=1)
                        )
                    )
                ).all()
                
                avg_score = sum(e.compliance_score for e in day_evaluations) / len(day_evaluations) if day_evaluations else 0
                trend_data.append({
                    "date": date.isoformat(),
                    "compliance_score": avg_score,
                    "evaluations_count": len(day_evaluations)
                })
            
            return {
                "summary": {
                    "total_rules": total_rules,
                    "active_rules": active_rules,
                    "draft_rules": status_counts.get("draft", 0),
                    "inactive_rules": status_counts.get("inactive", 0)
                },
                "distributions": {
                    "status": status_counts,
                    "severity": severity_counts,
                    "frameworks": framework_counts
                },
                "recent_activity": {
                    "evaluations": [
                        {
                            "id": eval.id,
                            "rule_id": eval.rule_id,
                            "status": eval.status,
                            "compliance_score": eval.compliance_score,
                            "evaluated_at": eval.evaluated_at.isoformat()
                        }
                        for eval in recent_evaluations
                    ]
                },
                "trends": trend_data,
                "time_range": time_range,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting compliance dashboard analytics: {str(e)}")
            raise

    @staticmethod
    def get_integration_status(session: Session) -> Dict[str, Any]:
        """Get status of compliance system integrations"""
        try:
            # Check data source integration
            data_sources_count = session.exec(select(func.count(DataSource.id))).one()
            
            # Check scan rule integration
            scan_rules_with_compliance = session.exec(
                select(func.count(ComplianceRule.id)).where(
                    ComplianceRule.scan_rule_set_id.isnot(None)
                )
            ).one()
            
            # Check recent activity
            recent_evaluations = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.evaluated_at >= datetime.now() - timedelta(hours=24)
                )
            ).one()
            
            # Check workflow integration
            workflow_integrations = session.exec(
                select(func.count(ComplianceRule.id)).where(
                    ComplianceRule.remediation_workflow_id.isnot(None)
                )
            ).one()
            
            return {
                "data_source_integration": {
                    "status": "connected" if data_sources_count > 0 else "disconnected",
                    "data_sources_count": data_sources_count
                },
                "scan_integration": {
                    "status": "active" if scan_rules_with_compliance > 0 else "inactive",
                    "integrated_rules": scan_rules_with_compliance
                },
                "workflow_integration": {
                    "status": "active" if workflow_integrations > 0 else "inactive",
                    "integrated_workflows": workflow_integrations
                },
                "system_health": {
                    "recent_evaluations": recent_evaluations,
                    "last_check": datetime.now().isoformat(),
                    "status": "healthy" if recent_evaluations > 0 else "warning"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting integration status: {str(e)}")
            raise