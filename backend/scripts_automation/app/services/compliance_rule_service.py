from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging
import uuid
import json

# **NEW: Import all interconnected services and models**
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

# **NEW: Import interconnected services**
from app.services.data_source_service import DataSourceService
from app.services.scan_service import ScanService
from app.services.custom_scan_rule_service import CustomScanRuleService
from app.services.performance_service import PerformanceService
from app.services.security_service import SecurityService
from app.models.scan_models import DataSource, ScanRuleSet, Scan

logger = logging.getLogger(__name__)


class ComplianceRuleService:
    """Enhanced service layer for compliance rule management with full backend interconnection"""
    
    # **NEW: Framework Templates with Real Implementation Logic**
    @staticmethod
    def get_compliance_frameworks() -> List[Dict[str, Any]]:
        """Get available compliance frameworks with templates"""
        return [
            {
                "id": "soc2",
                "name": "SOC 2",
                "description": "Service Organization Control 2",
                "categories": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
                "templates": [
                    {
                        "id": "soc2_access_control",
                        "name": "Access Control Management",
                        "description": "Logical and physical access controls",
                        "rule_type": "access_control",
                        "severity": "high",
                        "condition": "access_review_frequency <= 90 AND privileged_access_monitored == true"
                    },
                    {
                        "id": "soc2_data_encryption",
                        "name": "Data Encryption",
                        "description": "Data encryption at rest and in transit",
                        "rule_type": "encryption",
                        "severity": "critical",
                        "condition": "encryption_at_rest == true AND encryption_in_transit == true"
                    }
                ]
            },
            {
                "id": "gdpr",
                "name": "GDPR",
                "description": "General Data Protection Regulation",
                "categories": ["Data Protection", "Privacy Rights", "Consent Management", "Data Retention"],
                "templates": [
                    {
                        "id": "gdpr_data_retention",
                        "name": "Data Retention Policy",
                        "description": "Proper data retention and deletion",
                        "rule_type": "data_retention",
                        "severity": "high",
                        "condition": "retention_policy_defined == true AND automated_deletion == true"
                    },
                    {
                        "id": "gdpr_consent_management",
                        "name": "Consent Management",
                        "description": "Valid consent for data processing",
                        "rule_type": "privacy",
                        "severity": "critical",
                        "condition": "explicit_consent == true AND consent_withdrawable == true"
                    }
                ]
            },
            {
                "id": "hipaa",
                "name": "HIPAA",
                "description": "Health Insurance Portability and Accountability Act",
                "categories": ["Physical Safeguards", "Administrative Safeguards", "Technical Safeguards"],
                "templates": [
                    {
                        "id": "hipaa_access_control",
                        "name": "PHI Access Control",
                        "description": "Protected Health Information access controls",
                        "rule_type": "access_control",
                        "severity": "critical",
                        "condition": "phi_access_logged == true AND minimum_necessary == true"
                    }
                ]
            }
        ]
    
    # **NEW: Enhanced Data Source Integration**
    @staticmethod
    def get_applicable_data_sources(
        session: Session,
        rule_type: Optional[ComplianceRuleType] = None,
        compliance_standard: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get data sources that are applicable for compliance rules"""
        try:
            # Get all data sources with their compliance-relevant information
            data_sources = DataSourceService.get_all_data_sources(session)
            
            applicable_sources = []
            for ds in data_sources:
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
                    "tags": ds.tags or [],
                    "applicable_rules": []
                }
                
                # Determine applicable rule types based on data source characteristics
                if ds.data_classification in ["confidential", "restricted"]:
                    source_info["applicable_rules"].extend(["encryption", "access_control", "audit"])
                
                if ds.environment == "production":
                    source_info["applicable_rules"].extend(["backup", "monitoring", "security"])
                
                if "pii" in (ds.tags or []) or "phi" in (ds.tags or []):
                    source_info["applicable_rules"].extend(["privacy", "data_retention", "consent"])
                
                applicable_sources.append(source_info)
            
            return applicable_sources
            
        except Exception as e:
            logger.error(f"Error getting applicable data sources: {str(e)}")
            return []
    
    # **NEW: Scan Rule Integration**
    @staticmethod
    def get_related_scan_rules(
        session: Session,
        compliance_rule_id: int
    ) -> List[Dict[str, Any]]:
        """Get scan rules related to a compliance rule"""
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
                        "rules_count": len(scan_rule_set.rules or [])
                    })
            
            # Get custom scan rules if linked
            if rule.custom_scan_rule_ids:
                for rule_id in rule.custom_scan_rule_ids:
                    # This would integrate with CustomScanRuleService
                    custom_rule = CustomScanRuleService.get_rule_by_id(session, rule_id)
                    if custom_rule:
                        related_rules.append({
                            "id": custom_rule["id"],
                            "name": custom_rule["name"],
                            "type": "custom_scan_rule",
                            "description": custom_rule.get("description", ""),
                            "pattern": custom_rule.get("pattern", "")
                        })
            
            return related_rules
            
        except Exception as e:
            logger.error(f"Error getting related scan rules: {str(e)}")
            return []
    
    # **NEW: Enhanced Rule Evaluation with Data Source Integration**
    @staticmethod
    def evaluate_rule_with_data_sources(
        session: Session, 
        rule_id: int,
        data_source_ids: Optional[List[int]] = None,
        run_scans: bool = False
    ) -> ComplianceRuleEvaluationResponse:
        """Enhanced rule evaluation that integrates with data sources and scans"""
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
                
                # **NEW: Trigger scans if configured**
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
                        ScanService.start_scan(session, scan.id)
                        
                    except Exception as scan_error:
                        logger.warning(f"Failed to run scan for source {source_id}: {scan_error}")
                
                # **NEW: Evaluate compliance based on source characteristics**
                source_result = ComplianceRuleService._evaluate_source_compliance(rule, source)
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
    def _evaluate_source_compliance(rule: ComplianceRule, source: DataSource) -> Dict[str, Any]:
        """Evaluate compliance for a specific data source"""
        # This is a simplified evaluation - in production this would be much more sophisticated
        entity_count = source.entity_count or 100
        
        # Base compliance on source characteristics
        compliance_factors = []
        
        # Check encryption requirements
        if rule.rule_type == ComplianceRuleType.ENCRYPTION:
            compliance_factors.append(1.0 if source.encryption_enabled else 0.0)
        
        # Check access control requirements
        if rule.rule_type == ComplianceRuleType.ACCESS_CONTROL:
            # Simplified: assume compliance based on monitoring
            compliance_factors.append(0.9 if source.monitoring_enabled else 0.3)
        
        # Check data classification alignment
        if rule.rule_type == ComplianceRuleType.PRIVACY:
            if source.data_classification in ["confidential", "restricted"]:
                compliance_factors.append(0.8)
            else:
                compliance_factors.append(1.0)
        
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
            "factors_evaluated": len(compliance_factors)
        }