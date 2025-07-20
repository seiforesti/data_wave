from sqlmodel import Session
from typing import List, Dict, Any
import logging
from datetime import datetime
from app.models.compliance_rule_models import (
    ComplianceRuleTemplate, ComplianceRule,
    ComplianceRuleType, ComplianceRuleSeverity, ComplianceRuleStatus,
    ComplianceRuleScope
)

logger = logging.getLogger(__name__)


class ComplianceRuleInitService:
    """Service for initializing compliance rule templates and sample data"""
    
    @staticmethod
    def create_default_templates(session: Session) -> None:
        """Create default compliance rule templates"""
        try:
            # Check if templates already exist
            existing_templates = session.query(ComplianceRuleTemplate).count()
            if existing_templates > 0:
                logger.info("Compliance rule templates already exist, skipping initialization")
                return
            
            templates = [
                # GDPR Templates
                {
                    "name": "GDPR Personal Data Encryption",
                    "description": "Ensures personal data is encrypted according to GDPR requirements",
                    "rule_type": ComplianceRuleType.PRIVACY,
                    "severity": ComplianceRuleSeverity.CRITICAL,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition_template": '{"column_name_regex": "{{personal_data_pattern}}", "encryption_required": true}',
                    "parameter_definitions": [
                        {
                            "name": "personal_data_pattern",
                            "type": "string",
                            "description": "Regex pattern to identify personal data columns",
                            "required": True,
                            "defaultValue": ".*(email|name|phone|address|ssn).*"
                        }
                    ],
                    "default_parameters": {
                        "personal_data_pattern": ".*(email|name|phone|address|ssn).*"
                    },
                    "remediation_template": "Encrypt the identified personal data columns using AES-256 encryption",
                    "reference_url": "https://gdpr.eu/article-32-security-of-processing/",
                    "category": "Data Protection"
                },
                {
                    "name": "GDPR Data Retention Policy",
                    "description": "Ensures data is not retained longer than necessary per GDPR",
                    "rule_type": ComplianceRuleType.DATA_RETENTION,
                    "severity": ComplianceRuleSeverity.HIGH,
                    "scope": ComplianceRuleScope.TABLE,
                    "entity_types": ["table"],
                    "condition_template": '{"retention_period_days": {{max_retention_days}}, "date_column": "{{date_column}}"}',
                    "parameter_definitions": [
                        {
                            "name": "max_retention_days",
                            "type": "number",
                            "description": "Maximum retention period in days",
                            "required": True,
                            "defaultValue": 2555  # 7 years
                        },
                        {
                            "name": "date_column",
                            "type": "string",
                            "description": "Column containing the creation date",
                            "required": True,
                            "defaultValue": "created_at"
                        }
                    ],
                    "default_parameters": {
                        "max_retention_days": 2555,
                        "date_column": "created_at"
                    },
                    "remediation_template": "Implement automated data purging for records older than {{max_retention_days}} days",
                    "reference_url": "https://gdpr.eu/article-5-how-to-process-personal-data/",
                    "category": "Data Lifecycle"
                },
                
                # SOX Templates
                {
                    "name": "SOX Financial Data Access Control",
                    "description": "Ensures proper access controls for financial data per SOX requirements",
                    "rule_type": ComplianceRuleType.ACCESS_CONTROL,
                    "severity": ComplianceRuleSeverity.CRITICAL,
                    "scope": ComplianceRuleScope.TABLE,
                    "entity_types": ["table"],
                    "condition_template": '{"table_prefix": "{{financial_prefix}}", "required_roles": {{authorized_roles}}}',
                    "parameter_definitions": [
                        {
                            "name": "financial_prefix",
                            "type": "string",
                            "description": "Prefix for financial tables",
                            "required": True,
                            "defaultValue": "fin_"
                        },
                        {
                            "name": "authorized_roles",
                            "type": "array",
                            "description": "List of authorized roles",
                            "required": True,
                            "defaultValue": ["finance_admin", "auditor", "cfo"]
                        }
                    ],
                    "default_parameters": {
                        "financial_prefix": "fin_",
                        "authorized_roles": ["finance_admin", "auditor", "cfo"]
                    },
                    "remediation_template": "Review and update access permissions for financial tables. Remove unauthorized access.",
                    "reference_url": "https://www.sec.gov/about/laws/soa2002.pdf",
                    "category": "Access Control"
                },
                
                # HIPAA Templates
                {
                    "name": "HIPAA PHI Data Encryption",
                    "description": "Ensures Protected Health Information is encrypted per HIPAA requirements",
                    "rule_type": ComplianceRuleType.ENCRYPTION,
                    "severity": ComplianceRuleSeverity.CRITICAL,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition_template": '{"phi_pattern": "{{phi_regex}}", "encryption_algorithm": "{{encryption_type}}"}',
                    "parameter_definitions": [
                        {
                            "name": "phi_regex",
                            "type": "string",
                            "description": "Regex pattern to identify PHI columns",
                            "required": True,
                            "defaultValue": ".*(patient|medical|health|diagnosis|treatment).*"
                        },
                        {
                            "name": "encryption_type",
                            "type": "string",
                            "description": "Required encryption algorithm",
                            "required": True,
                            "defaultValue": "AES-256"
                        }
                    ],
                    "default_parameters": {
                        "phi_regex": ".*(patient|medical|health|diagnosis|treatment).*",
                        "encryption_type": "AES-256"
                    },
                    "remediation_template": "Encrypt PHI columns using {{encryption_type}} encryption",
                    "reference_url": "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
                    "category": "Healthcare Data Protection"
                },
                
                # PCI DSS Templates
                {
                    "name": "PCI DSS Credit Card Data Protection",
                    "description": "Ensures credit card data is properly protected per PCI DSS",
                    "rule_type": ComplianceRuleType.SECURITY,
                    "severity": ComplianceRuleSeverity.CRITICAL,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition_template": '{"card_data_pattern": "{{card_pattern}}", "masking_required": true}',
                    "parameter_definitions": [
                        {
                            "name": "card_pattern",
                            "type": "string",
                            "description": "Pattern to identify credit card data",
                            "required": True,
                            "defaultValue": ".*(card|credit|payment|ccn).*"
                        }
                    ],
                    "default_parameters": {
                        "card_pattern": ".*(card|credit|payment|ccn).*"
                    },
                    "remediation_template": "Implement data masking or tokenization for credit card data",
                    "reference_url": "https://www.pcisecuritystandards.org/",
                    "category": "Payment Security"
                },
                
                # General Security Templates
                {
                    "name": "Sensitive Data Classification",
                    "description": "Ensures sensitive data is properly classified and labeled",
                    "rule_type": ComplianceRuleType.SECURITY,
                    "severity": ComplianceRuleSeverity.HIGH,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition_template": '{"sensitivity_keywords": {{sensitive_patterns}}, "classification_required": true}',
                    "parameter_definitions": [
                        {
                            "name": "sensitive_patterns",
                            "type": "array",
                            "description": "Keywords that indicate sensitive data",
                            "required": True,
                            "defaultValue": ["password", "secret", "key", "token", "confidential"]
                        }
                    ],
                    "default_parameters": {
                        "sensitive_patterns": ["password", "secret", "key", "token", "confidential"]
                    },
                    "remediation_template": "Apply appropriate sensitivity labels and access controls",
                    "reference_url": "https://www.nist.gov/cybersecurity",
                    "category": "Data Classification"
                },
                
                # Quality Templates
                {
                    "name": "Data Quality Completeness Check",
                    "description": "Ensures critical data fields are not null or empty",
                    "rule_type": ComplianceRuleType.QUALITY,
                    "severity": ComplianceRuleSeverity.MEDIUM,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition_template": '{"critical_columns": {{required_columns}}, "null_threshold": {{max_null_percentage}}}',
                    "parameter_definitions": [
                        {
                            "name": "required_columns",
                            "type": "array",
                            "description": "List of columns that must not be null",
                            "required": True,
                            "defaultValue": ["id", "created_at", "updated_at"]
                        },
                        {
                            "name": "max_null_percentage",
                            "type": "number",
                            "description": "Maximum allowed null percentage",
                            "required": True,
                            "defaultValue": 5.0
                        }
                    ],
                    "default_parameters": {
                        "required_columns": ["id", "created_at", "updated_at"],
                        "max_null_percentage": 5.0
                    },
                    "remediation_template": "Implement data validation and default value assignment",
                    "reference_url": "https://www.iso.org/standard/35736.html",
                    "category": "Data Quality"
                }
            ]
            
            # Create template records
            for template_data in templates:
                template = ComplianceRuleTemplate(
                    **template_data,
                    is_built_in=True,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                session.add(template)
            
            session.commit()
            logger.info(f"Created {len(templates)} default compliance rule templates")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating default templates: {str(e)}")
            raise
    
    @staticmethod
    def create_sample_rules(session: Session) -> None:
        """Create sample compliance rules for demonstration"""
        try:
            # Check if sample rules already exist
            existing_rules = session.query(ComplianceRule).filter(
                ComplianceRule.is_built_in == True
            ).count()
            
            if existing_rules > 0:
                logger.info("Sample compliance rules already exist, skipping initialization")
                return
            
            sample_rules = [
                {
                    "name": "Email Column Encryption Rule",
                    "description": "Ensures all email columns are encrypted for privacy protection",
                    "rule_type": ComplianceRuleType.PRIVACY,
                    "severity": ComplianceRuleSeverity.HIGH,
                    "status": ComplianceRuleStatus.ACTIVE,
                    "scope": ComplianceRuleScope.COLUMN,
                    "entity_types": ["column"],
                    "condition": '{"column_name_regex": ".*email.*", "encryption_required": true}',
                    "rule_definition": {
                        "pattern": ".*email.*",
                        "case_sensitive": False,
                        "encryption_algorithm": "AES-256"
                    },
                    "compliance_standard": "GDPR",
                    "reference": "Article 32 - Security of processing",
                    "remediation_steps": "1. Identify email columns\n2. Implement AES-256 encryption\n3. Update application code to handle encrypted data\n4. Test encryption/decryption functionality",
                    "validation_frequency": "daily",
                    "is_automated": True,
                    "business_impact": "high",
                    "regulatory_requirement": True,
                    "tags": ["email", "encryption", "gdpr", "privacy"],
                    "is_built_in": True,
                    "is_global": True,
                    "pass_rate": 95.5,
                    "total_entities": 45,
                    "passing_entities": 43,
                    "failing_entities": 2
                },
                {
                    "name": "Financial Table Access Control",
                    "description": "Restricts access to financial tables to authorized personnel only",
                    "rule_type": ComplianceRuleType.ACCESS_CONTROL,
                    "severity": ComplianceRuleSeverity.CRITICAL,
                    "status": ComplianceRuleStatus.ACTIVE,
                    "scope": ComplianceRuleScope.TABLE,
                    "entity_types": ["table"],
                    "condition": '{"table_prefix": "fin_", "authorized_roles": ["finance_admin", "auditor"]}',
                    "rule_definition": {
                        "table_patterns": ["fin_*", "financial_*", "accounting_*"],
                        "required_roles": ["finance_admin", "auditor", "cfo"],
                        "access_type": "read_write"
                    },
                    "compliance_standard": "SOX",
                    "reference": "Section 404 - Management Assessment of Internal Controls",
                    "remediation_steps": "1. Review current access permissions\n2. Revoke unauthorized access\n3. Implement role-based access control\n4. Set up regular access reviews",
                    "validation_frequency": "weekly",
                    "is_automated": True,
                    "business_impact": "critical",
                    "regulatory_requirement": True,
                    "tags": ["financial", "access_control", "sox", "security"],
                    "is_built_in": True,
                    "is_global": True,
                    "pass_rate": 100.0,
                    "total_entities": 12,
                    "passing_entities": 12,
                    "failing_entities": 0
                },
                {
                    "name": "Data Retention Compliance",
                    "description": "Ensures data is not retained longer than legally required",
                    "rule_type": ComplianceRuleType.DATA_RETENTION,
                    "severity": ComplianceRuleSeverity.HIGH,
                    "status": ComplianceRuleStatus.ACTIVE,
                    "scope": ComplianceRuleScope.TABLE,
                    "entity_types": ["table"],
                    "condition": '{"max_retention_days": 2555, "date_column": "created_at"}',
                    "rule_definition": {
                        "retention_periods": {
                            "user_data": 2555,  # 7 years
                            "log_data": 90,     # 3 months
                            "temp_data": 30     # 1 month
                        },
                        "date_columns": ["created_at", "created_date", "timestamp"]
                    },
                    "compliance_standard": "GDPR",
                    "reference": "Article 5(1)(e) - Storage limitation",
                    "remediation_steps": "1. Identify tables with old data\n2. Implement automated purging\n3. Set up retention policies\n4. Monitor compliance regularly",
                    "validation_frequency": "monthly",
                    "is_automated": True,
                    "auto_remediation": True,
                    "business_impact": "medium",
                    "regulatory_requirement": True,
                    "tags": ["retention", "gdpr", "data_lifecycle", "automation"],
                    "is_built_in": True,
                    "is_global": True,
                    "pass_rate": 88.7,
                    "total_entities": 156,
                    "passing_entities": 138,
                    "failing_entities": 18
                }
            ]
            
            # Create sample rule records
            for rule_data in sample_rules:
                rule = ComplianceRule(
                    **rule_data,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    created_by="system",
                    updated_by="system"
                )
                session.add(rule)
            
            session.commit()
            logger.info(f"Created {len(sample_rules)} sample compliance rules")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating sample rules: {str(e)}")
            raise
    
    @staticmethod
    def initialize_compliance_data(session: Session) -> None:
        """Initialize all compliance rule data"""
        try:
            logger.info("Starting compliance rule data initialization...")
            
            # Create default templates
            ComplianceRuleInitService.create_default_templates(session)
            
            # Create sample rules
            ComplianceRuleInitService.create_sample_rules(session)
            
            logger.info("Compliance rule data initialization completed successfully")
            
        except Exception as e:
            logger.error(f"Error during compliance rule initialization: {str(e)}")
            raise