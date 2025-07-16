from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from app.models.scan_models import Scan, ScanResult, DataSource, ScanRuleSet
import json

# Setup logging
logger = logging.getLogger(__name__)

class ComplianceService:
    """Service for generating compliance reports and metrics."""
    
    # Define compliance standards and their requirements
    COMPLIANCE_STANDARDS = {
        "gdpr": {
            "name": "General Data Protection Regulation",
            "description": "EU regulation on data protection and privacy",
            "requirements": [
                {"id": "gdpr_1", "name": "Personal Data Identification", "description": "Identify all personal data in the system"},
                {"id": "gdpr_2", "name": "Data Encryption", "description": "Ensure personal data is encrypted"},
                {"id": "gdpr_3", "name": "Access Controls", "description": "Implement appropriate access controls"},
                {"id": "gdpr_4", "name": "Data Retention", "description": "Implement data retention policies"},
                {"id": "gdpr_5", "name": "Data Subject Rights", "description": "Support data subject rights (access, rectification, erasure, etc.)"},
            ]
        },
        "hipaa": {
            "name": "Health Insurance Portability and Accountability Act",
            "description": "US regulation for medical information privacy",
            "requirements": [
                {"id": "hipaa_1", "name": "PHI Identification", "description": "Identify all protected health information"},
                {"id": "hipaa_2", "name": "Data Encryption", "description": "Ensure PHI is encrypted"},
                {"id": "hipaa_3", "name": "Access Controls", "description": "Implement appropriate access controls"},
                {"id": "hipaa_4", "name": "Audit Logging", "description": "Maintain audit logs of PHI access"},
                {"id": "hipaa_5", "name": "Business Associate Agreements", "description": "Ensure proper agreements with business associates"},
            ]
        },
        "pci_dss": {
            "name": "Payment Card Industry Data Security Standard",
            "description": "Security standard for organizations that handle credit card data",
            "requirements": [
                {"id": "pci_1", "name": "Cardholder Data Identification", "description": "Identify all cardholder data"},
                {"id": "pci_2", "name": "Data Encryption", "description": "Ensure cardholder data is encrypted"},
                {"id": "pci_3", "name": "Access Controls", "description": "Implement appropriate access controls"},
                {"id": "pci_4", "name": "Network Security", "description": "Maintain secure network infrastructure"},
                {"id": "pci_5", "name": "Vulnerability Management", "description": "Implement vulnerability management program"},
            ]
        },
        "ccpa": {
            "name": "California Consumer Privacy Act",
            "description": "California law on consumer privacy rights",
            "requirements": [
                {"id": "ccpa_1", "name": "Personal Information Identification", "description": "Identify all personal information"},
                {"id": "ccpa_2", "name": "Consumer Rights", "description": "Support consumer rights (access, deletion, opt-out)"},
                {"id": "ccpa_3", "name": "Data Sharing Disclosure", "description": "Disclose data sharing practices"},
                {"id": "ccpa_4", "name": "Data Security", "description": "Implement reasonable security measures"},
                {"id": "ccpa_5", "name": "Non-Discrimination", "description": "Ensure non-discrimination for exercising rights"},
            ]
        },
        "sox": {
            "name": "Sarbanes-Oxley Act",
            "description": "US law on corporate governance and financial disclosure",
            "requirements": [
                {"id": "sox_1", "name": "Financial Data Identification", "description": "Identify all financial data"},
                {"id": "sox_2", "name": "Data Integrity", "description": "Ensure financial data integrity"},
                {"id": "sox_3", "name": "Access Controls", "description": "Implement appropriate access controls"},
                {"id": "sox_4", "name": "Audit Trails", "description": "Maintain audit trails for financial data"},
                {"id": "sox_5", "name": "Change Management", "description": "Implement change management processes"},
            ]
        }
    }
    
    # Define data sensitivity levels
    SENSITIVITY_LEVELS = {
        "public": {
            "name": "Public",
            "description": "Data that can be freely shared with the public",
            "risk_level": 0
        },
        "internal": {
            "name": "Internal",
            "description": "Data that should only be shared within the organization",
            "risk_level": 1
        },
        "confidential": {
            "name": "Confidential",
            "description": "Sensitive data that requires protection",
            "risk_level": 2
        },
        "restricted": {
            "name": "Restricted",
            "description": "Highly sensitive data with strict access controls",
            "risk_level": 3
        }
    }
    
    @staticmethod
    def get_compliance_standards() -> Dict[str, Any]:
        """Get all supported compliance standards.
        
        Returns:
            A dictionary containing all supported compliance standards
        """
        return ComplianceService.COMPLIANCE_STANDARDS
    
    @staticmethod
    def get_sensitivity_levels() -> Dict[str, Any]:
        """Get all supported data sensitivity levels.
        
        Returns:
            A dictionary containing all supported data sensitivity levels
        """
        return ComplianceService.SENSITIVITY_LEVELS
    
    @staticmethod
    def generate_compliance_report(session: Session, standard_id: str, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate a compliance report for a specific standard.
        
        Args:
            session: The database session
            standard_id: The ID of the compliance standard (e.g., "gdpr", "hipaa")
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing the compliance report
        """
        try:
            # Check if the standard exists
            if standard_id not in ComplianceService.COMPLIANCE_STANDARDS:
                return {"error": f"Compliance standard not found: {standard_id}"}
            
            standard = ComplianceService.COMPLIANCE_STANDARDS[standard_id]
            
            # Get the latest scan result for each data source
            subq = select(
                ScanResult.scan_id,
                func.max(ScanResult.created_at).label("max_created_at")
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).where(
                Scan.status == "completed"
            )
            
            if data_source_id is not None:
                subq = subq.where(Scan.data_source_id == data_source_id)
            
            subq = subq.group_by(Scan.data_source_id).subquery()
            
            stmt = select(ScanResult, Scan, DataSource).join(
                subq,
                (ScanResult.scan_id == subq.c.scan_id) & 
                (ScanResult.created_at == subq.c.max_created_at)
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).join(
                DataSource, Scan.data_source_id == DataSource.id
            )
            
            results = session.exec(stmt).all()
            
            # Initialize the report
            report = {
                "standard": standard,
                "generated_at": datetime.utcnow().isoformat(),
                "overall_compliance": {
                    "compliant_count": 0,
                    "non_compliant_count": 0,
                    "compliance_percentage": 0,
                    "risk_level": "low"
                },
                "requirements": {},
                "data_sources": []
            }
            
            # Initialize requirements
            for req in standard["requirements"]:
                report["requirements"][req["id"]] = {
                    "name": req["name"],
                    "description": req["description"],
                    "compliant_count": 0,
                    "non_compliant_count": 0,
                    "compliance_percentage": 0,
                    "issues": []
                }
            
            # Process each scan result
            for result, scan, data_source in results:
                # Evaluate compliance for this data source
                source_compliance = ComplianceService._evaluate_compliance(
                    result.scan_metadata, standard_id, data_source.name, data_source.source_type
                )
                
                # Update overall compliance
                if source_compliance["is_compliant"]:
                    report["overall_compliance"]["compliant_count"] += 1
                else:
                    report["overall_compliance"]["non_compliant_count"] += 1
                
                # Update requirement-specific compliance
                for req_id, req_result in source_compliance["requirements"].items():
                    if req_id in report["requirements"]:
                        if req_result["is_compliant"]:
                            report["requirements"][req_id]["compliant_count"] += 1
                        else:
                            report["requirements"][req_id]["non_compliant_count"] += 1
                            
                            # Add issues to the requirement
                            for issue in req_result["issues"]:
                                report["requirements"][req_id]["issues"].append({
                                    "data_source_id": data_source.id,
                                    "data_source_name": data_source.name,
                                    "issue": issue
                                })
                
                # Add data source details
                source_type = data_source.source_type.value if hasattr(data_source.source_type, 'value') else str(data_source.source_type)
                report["data_sources"].append({
                    "id": data_source.id,
                    "name": data_source.name,
                    "source_type": source_type,
                    "is_compliant": source_compliance["is_compliant"],
                    "compliance_percentage": source_compliance["compliance_percentage"],
                    "requirements": source_compliance["requirements"],
                    "issues": source_compliance["issues"],
                    "last_scan_date": scan.completed_at.isoformat() if scan.completed_at else None
                })
            
            # Calculate overall compliance percentage
            total_sources = report["overall_compliance"]["compliant_count"] + report["overall_compliance"]["non_compliant_count"]
            if total_sources > 0:
                report["overall_compliance"]["compliance_percentage"] = round(
                    (report["overall_compliance"]["compliant_count"] / total_sources) * 100, 2
                )
            
            # Calculate requirement-specific compliance percentages
            for req_id in report["requirements"]:
                total_req = report["requirements"][req_id]["compliant_count"] + report["requirements"][req_id]["non_compliant_count"]
                if total_req > 0:
                    report["requirements"][req_id]["compliance_percentage"] = round(
                        (report["requirements"][req_id]["compliant_count"] / total_req) * 100, 2
                    )
            
            # Determine overall risk level
            if report["overall_compliance"]["compliance_percentage"] >= 90:
                report["overall_compliance"]["risk_level"] = "low"
            elif report["overall_compliance"]["compliance_percentage"] >= 70:
                report["overall_compliance"]["risk_level"] = "medium"
            else:
                report["overall_compliance"]["risk_level"] = "high"
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating compliance report: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _evaluate_compliance(metadata: Dict[str, Any], standard_id: str, source_name: str, source_type: str) -> Dict[str, Any]:
        """Evaluate compliance for a specific data source.
        
        Args:
            metadata: The scan result metadata
            standard_id: The ID of the compliance standard
            source_name: The name of the data source
            source_type: The type of the data source
            
        Returns:
            A dictionary containing compliance evaluation results
        """
        # Get the standard requirements
        standard = ComplianceService.COMPLIANCE_STANDARDS.get(standard_id, {})
        requirements = standard.get("requirements", [])
        
        # Initialize the result
        result = {
            "is_compliant": True,
            "compliance_percentage": 100,
            "requirements": {},
            "issues": []
        }
        
        # Initialize requirements
        for req in requirements:
            result["requirements"][req["id"]] = {
                "is_compliant": True,
                "issues": []
            }
        
        # Evaluate each requirement based on the standard
        if standard_id == "gdpr":
            ComplianceService._evaluate_gdpr_compliance(metadata, source_name, source_type, result)
        elif standard_id == "hipaa":
            ComplianceService._evaluate_hipaa_compliance(metadata, source_name, source_type, result)
        elif standard_id == "pci_dss":
            ComplianceService._evaluate_pci_compliance(metadata, source_name, source_type, result)
        elif standard_id == "ccpa":
            ComplianceService._evaluate_ccpa_compliance(metadata, source_name, source_type, result)
        elif standard_id == "sox":
            ComplianceService._evaluate_sox_compliance(metadata, source_name, source_type, result)
        
        # Calculate compliance percentage
        compliant_count = 0
        total_count = len(result["requirements"])
        
        for req_id, req_result in result["requirements"].items():
            if req_result["is_compliant"]:
                compliant_count += 1
            else:
                # Add requirement issues to the overall issues list
                result["issues"].extend(req_result["issues"])
        
        if total_count > 0:
            result["compliance_percentage"] = round((compliant_count / total_count) * 100, 2)
        
        # Update overall compliance status
        result["is_compliant"] = (compliant_count == total_count)
        
        return result
    
    @staticmethod
    def _evaluate_gdpr_compliance(metadata: Dict[str, Any], source_name: str, source_type: str, result: Dict[str, Any]):
        """Evaluate GDPR compliance.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            result: The compliance result to update
        """
        # Check for personal data identification (gdpr_1)
        personal_data_identified = False
        personal_data_encrypted = True
        personal_data_access_controlled = True
        personal_data_retention_policy = True
        personal_data_subject_rights = True
        
        # Process relational database metadata
        for schema in metadata.get("schemas", []):
            for table in schema.get("tables", []):
                for column in table.get("columns", []):
                    # Check for personal data classifications
                    classifications = column.get("classifications", [])
                    is_personal_data = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            is_personal_data = True
                            personal_data_identified = True
                            
                            # Check if personal data is encrypted
                            if is_personal_data and not column.get("is_encrypted", False):
                                personal_data_encrypted = False
                                issue = f"Personal data column {schema.get('name')}.{table.get('name')}.{column.get('name')} is not encrypted"
                                result["requirements"]["gdpr_2"]["issues"].append(issue)
                            
                            # Check if personal data has access controls
                            if is_personal_data and not column.get("has_access_controls", False):
                                personal_data_access_controlled = False
                                issue = f"Personal data column {schema.get('name')}.{table.get('name')}.{column.get('name')} lacks access controls"
                                result["requirements"]["gdpr_3"]["issues"].append(issue)
                            
                            # Check if personal data has retention policy
                            if is_personal_data and not column.get("has_retention_policy", False):
                                personal_data_retention_policy = False
                                issue = f"Personal data column {schema.get('name')}.{table.get('name')}.{column.get('name')} lacks retention policy"
                                result["requirements"]["gdpr_4"]["issues"].append(issue)
                            
                            # Check if personal data supports subject rights
                            if is_personal_data and not column.get("supports_subject_rights", False):
                                personal_data_subject_rights = False
                                issue = f"Personal data column {schema.get('name')}.{table.get('name')}.{column.get('name')} does not support subject rights"
                                result["requirements"]["gdpr_5"]["issues"].append(issue)
        
        # Process MongoDB metadata
        for db in metadata.get("databases", []):
            for collection in db.get("collections", []):
                for field in collection.get("fields", []):
                    # Check for personal data classifications
                    classifications = field.get("classifications", [])
                    is_personal_data = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            is_personal_data = True
                            personal_data_identified = True
                            
                            # Check if personal data is encrypted
                            if is_personal_data and not field.get("is_encrypted", False):
                                personal_data_encrypted = False
                                issue = f"Personal data field {db.get('name')}.{collection.get('name')}.{field.get('name')} is not encrypted"
                                result["requirements"]["gdpr_2"]["issues"].append(issue)
                            
                            # Check if personal data has access controls
                            if is_personal_data and not field.get("has_access_controls", False):
                                personal_data_access_controlled = False
                                issue = f"Personal data field {db.get('name')}.{collection.get('name')}.{field.get('name')} lacks access controls"
                                result["requirements"]["gdpr_3"]["issues"].append(issue)
                            
                            # Check if personal data has retention policy
                            if is_personal_data and not field.get("has_retention_policy", False):
                                personal_data_retention_policy = False
                                issue = f"Personal data field {db.get('name')}.{collection.get('name')}.{field.get('name')} lacks retention policy"
                                result["requirements"]["gdpr_4"]["issues"].append(issue)
                            
                            # Check if personal data supports subject rights
                            if is_personal_data and not field.get("supports_subject_rights", False):
                                personal_data_subject_rights = False
                                issue = f"Personal data field {db.get('name')}.{collection.get('name')}.{field.get('name')} does not support subject rights"
                                result["requirements"]["gdpr_5"]["issues"].append(issue)
        
        # Update requirement compliance status
        if not personal_data_identified:
            # If no personal data is identified, all requirements are compliant by default
            pass
        else:
            # Update requirement compliance status based on the checks
            result["requirements"]["gdpr_1"]["is_compliant"] = personal_data_identified
            result["requirements"]["gdpr_2"]["is_compliant"] = personal_data_encrypted
            result["requirements"]["gdpr_3"]["is_compliant"] = personal_data_access_controlled
            result["requirements"]["gdpr_4"]["is_compliant"] = personal_data_retention_policy
            result["requirements"]["gdpr_5"]["is_compliant"] = personal_data_subject_rights
    
    @staticmethod
    def _evaluate_hipaa_compliance(metadata: Dict[str, Any], source_name: str, source_type: str, result: Dict[str, Any]):
        """Evaluate HIPAA compliance.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            result: The compliance result to update
        """
        # Check for PHI identification (hipaa_1)
        phi_identified = False
        phi_encrypted = True
        phi_access_controlled = True
        phi_audit_logging = True
        phi_business_associates = True
        
        # Process relational database metadata
        for schema in metadata.get("schemas", []):
            for table in schema.get("tables", []):
                for column in table.get("columns", []):
                    # Check for PHI classifications
                    classifications = column.get("classifications", [])
                    is_phi = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["phi", "health", "medical"]:
                            is_phi = True
                            phi_identified = True
                            
                            # Check if PHI is encrypted
                            if is_phi and not column.get("is_encrypted", False):
                                phi_encrypted = False
                                issue = f"PHI column {schema.get('name')}.{table.get('name')}.{column.get('name')} is not encrypted"
                                result["requirements"]["hipaa_2"]["issues"].append(issue)
                            
                            # Check if PHI has access controls
                            if is_phi and not column.get("has_access_controls", False):
                                phi_access_controlled = False
                                issue = f"PHI column {schema.get('name')}.{table.get('name')}.{column.get('name')} lacks access controls"
                                result["requirements"]["hipaa_3"]["issues"].append(issue)
                            
                            # Check if PHI has audit logging
                            if is_phi and not column.get("has_audit_logging", False):
                                phi_audit_logging = False
                                issue = f"PHI column {schema.get('name')}.{table.get('name')}.{column.get('name')} lacks audit logging"
                                result["requirements"]["hipaa_4"]["issues"].append(issue)
        
        # Process MongoDB metadata
        for db in metadata.get("databases", []):
            for collection in db.get("collections", []):
                for field in collection.get("fields", []):
                    # Check for PHI classifications
                    classifications = field.get("classifications", [])
                    is_phi = False
                    
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["phi", "health", "medical"]:
                            is_phi = True
                            phi_identified = True
                            
                            # Check if PHI is encrypted
                            if is_phi and not field.get("is_encrypted", False):
                                phi_encrypted = False
                                issue = f"PHI field {db.get('name')}.{collection.get('name')}.{field.get('name')} is not encrypted"
                                result["requirements"]["hipaa_2"]["issues"].append(issue)
                            
                            # Check if PHI has access controls
                            if is_phi and not field.get("has_access_controls", False):
                                phi_access_controlled = False
                                issue = f"PHI field {db.get('name')}.{collection.get('name')}.{field.get('name')} lacks access controls"
                                result["requirements"]["hipaa_3"]["issues"].append(issue)
                            
                            # Check if PHI has audit logging
                            if is_phi and not field.get("has_audit_logging", False):
                                phi_audit_logging = False
                                issue = f"PHI field {db.get('name')}.{collection.get('name')}.{field.get('name')} lacks audit logging"
                                result["requirements"]["hipaa_4"]["issues"].append(issue)
        
        # Check for business associate agreements
        if phi_identified and not metadata.get("has_business_associate_agreements", False):
            phi_business_associates = False
            issue = f"Data source {source_name} lacks business associate agreements"
            result["requirements"]["hipaa_5"]["issues"].append(issue)
        
        # Update requirement compliance status
        if not phi_identified:
            # If no PHI is identified, all requirements are compliant by default
            pass
        else:
            # Update requirement compliance status based on the checks
            result["requirements"]["hipaa_1"]["is_compliant"] = phi_identified
            result["requirements"]["hipaa_2"]["is_compliant"] = phi_encrypted
            result["requirements"]["hipaa_3"]["is_compliant"] = phi_access_controlled
            result["requirements"]["hipaa_4"]["is_compliant"] = phi_audit_logging
            result["requirements"]["hipaa_5"]["is_compliant"] = phi_business_associates
    
    @staticmethod
    def _evaluate_pci_compliance(metadata: Dict[str, Any], source_name: str, source_type: str, result: Dict[str, Any]):
        """Evaluate PCI DSS compliance.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            result: The compliance result to update
        """
        # Similar implementation as GDPR and HIPAA, but for PCI DSS requirements
        # This is a placeholder implementation
        pass
    
    @staticmethod
    def _evaluate_ccpa_compliance(metadata: Dict[str, Any], source_name: str, source_type: str, result: Dict[str, Any]):
        """Evaluate CCPA compliance.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            result: The compliance result to update
        """
        # Similar implementation as GDPR and HIPAA, but for CCPA requirements
        # This is a placeholder implementation
        pass
    
    @staticmethod
    def _evaluate_sox_compliance(metadata: Dict[str, Any], source_name: str, source_type: str, result: Dict[str, Any]):
        """Evaluate SOX compliance.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            result: The compliance result to update
        """
        # Similar implementation as GDPR and HIPAA, but for SOX requirements
        # This is a placeholder implementation
        pass
    
    @staticmethod
    def generate_data_sensitivity_report(session: Session, data_source_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate a data sensitivity report.
        
        Args:
            session: The database session
            data_source_id: Optional ID of the data source to filter by
            
        Returns:
            A dictionary containing the data sensitivity report
        """
        try:
            # Get the latest scan result for each data source
            subq = select(
                ScanResult.scan_id,
                func.max(ScanResult.created_at).label("max_created_at")
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).where(
                Scan.status == "completed"
            )
            
            if data_source_id is not None:
                subq = subq.where(Scan.data_source_id == data_source_id)
            
            subq = subq.group_by(Scan.data_source_id).subquery()
            
            stmt = select(ScanResult, Scan, DataSource).join(
                subq,
                (ScanResult.scan_id == subq.c.scan_id) & 
                (ScanResult.created_at == subq.c.max_created_at)
            ).join(
                Scan, ScanResult.scan_id == Scan.id
            ).join(
                DataSource, Scan.data_source_id == DataSource.id
            )
            
            results = session.exec(stmt).all()
            
            # Initialize the report
            report = {
                "generated_at": datetime.utcnow().isoformat(),
                "overall_summary": {
                    "total_fields": 0,
                    "sensitivity_levels": {
                        "public": 0,
                        "internal": 0,
                        "confidential": 0,
                        "restricted": 0
                    },
                    "classification_categories": {
                        "pii": 0,
                        "phi": 0,
                        "financial": 0,
                        "other": 0
                    }
                },
                "data_sources": []
            }
            
            # Process each scan result
            for result, scan, data_source in results:
                # Extract sensitivity information from metadata
                source_sensitivity = ComplianceService._extract_sensitivity_from_metadata(
                    result.scan_metadata, data_source.name, data_source.source_type
                )
                
                # Update overall summary
                report["overall_summary"]["total_fields"] += source_sensitivity["total_fields"]
                
                for level, count in source_sensitivity["sensitivity_levels"].items():
                    report["overall_summary"]["sensitivity_levels"][level] += count
                
                for category, count in source_sensitivity["classification_categories"].items():
                    if category in report["overall_summary"]["classification_categories"]:
                        report["overall_summary"]["classification_categories"][category] += count
                    else:
                        report["overall_summary"]["classification_categories"]["other"] += count
                
                # Add data source details
                source_type = data_source.source_type.value if hasattr(data_source.source_type, 'value') else str(data_source.source_type)
                report["data_sources"].append({
                    "id": data_source.id,
                    "name": data_source.name,
                    "source_type": source_type,
                    "total_fields": source_sensitivity["total_fields"],
                    "sensitivity_levels": source_sensitivity["sensitivity_levels"],
                    "classification_categories": source_sensitivity["classification_categories"],
                    "sensitive_fields": source_sensitivity["sensitive_fields"],
                    "last_scan_date": scan.completed_at.isoformat() if scan.completed_at else None
                })
            
            # Calculate percentages for sensitivity levels
            if report["overall_summary"]["total_fields"] > 0:
                for level in report["overall_summary"]["sensitivity_levels"]:
                    report["overall_summary"]["sensitivity_levels"][f"{level}_percentage"] = round(
                        (report["overall_summary"]["sensitivity_levels"][level] / report["overall_summary"]["total_fields"]) * 100, 2
                    )
            
            # Calculate overall risk level
            restricted_percentage = 0
            if report["overall_summary"]["total_fields"] > 0:
                restricted_percentage = round(
                    (report["overall_summary"]["sensitivity_levels"]["restricted"] / report["overall_summary"]["total_fields"]) * 100, 2
                )
            
            if restricted_percentage >= 10:
                report["overall_summary"]["risk_level"] = "high"
            elif restricted_percentage >= 5:
                report["overall_summary"]["risk_level"] = "medium"
            else:
                report["overall_summary"]["risk_level"] = "low"
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating data sensitivity report: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _extract_sensitivity_from_metadata(metadata: Dict[str, Any], source_name: str, source_type: str) -> Dict[str, Any]:
        """Extract sensitivity information from metadata.
        
        Args:
            metadata: The scan result metadata
            source_name: The name of the data source
            source_type: The type of the data source
            
        Returns:
            A dictionary containing sensitivity information
        """
        sensitivity_info = {
            "total_fields": 0,
            "sensitivity_levels": {
                "public": 0,
                "internal": 0,
                "confidential": 0,
                "restricted": 0
            },
            "classification_categories": {
                "pii": 0,
                "phi": 0,
                "financial": 0,
                "other": 0
            },
            "sensitive_fields": []
        }
        
        # Process relational database metadata
        for schema in metadata.get("schemas", []):
            for table in schema.get("tables", []):
                for column in table.get("columns", []):
                    sensitivity_info["total_fields"] += 1
                    
                    # Get sensitivity level
                    sensitivity_level = column.get("sensitivity_level", "public").lower()
                    if sensitivity_level in sensitivity_info["sensitivity_levels"]:
                        sensitivity_info["sensitivity_levels"][sensitivity_level] += 1
                    else:
                        sensitivity_info["sensitivity_levels"]["public"] += 1
                    
                    # Get classification categories
                    classifications = column.get("classifications", [])
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            sensitivity_info["classification_categories"]["pii"] += 1
                        elif category in ["phi", "health", "medical"]:
                            sensitivity_info["classification_categories"]["phi"] += 1
                        elif category in ["financial", "payment", "credit"]:
                            sensitivity_info["classification_categories"]["financial"] += 1
                        else:
                            sensitivity_info["classification_categories"]["other"] += 1
                    
                    # Add sensitive field details
                    if sensitivity_level in ["confidential", "restricted"]:
                        sensitivity_info["sensitive_fields"].append({
                            "name": column.get("name", ""),
                            "path": f"{schema.get('name')}.{table.get('name')}.{column.get('name')}",
                            "type": "column",
                            "data_type": column.get("data_type", ""),
                            "sensitivity_level": sensitivity_level,
                            "classifications": classifications,
                            "is_encrypted": column.get("is_encrypted", False),
                            "has_access_controls": column.get("has_access_controls", False)
                        })
        
        # Process MongoDB metadata
        for db in metadata.get("databases", []):
            for collection in db.get("collections", []):
                for field in collection.get("fields", []):
                    sensitivity_info["total_fields"] += 1
                    
                    # Get sensitivity level
                    sensitivity_level = field.get("sensitivity_level", "public").lower()
                    if sensitivity_level in sensitivity_info["sensitivity_levels"]:
                        sensitivity_info["sensitivity_levels"][sensitivity_level] += 1
                    else:
                        sensitivity_info["sensitivity_levels"]["public"] += 1
                    
                    # Get classification categories
                    classifications = field.get("classifications", [])
                    for classification in classifications:
                        category = classification.get("category", "").lower()
                        if category in ["pii", "personal", "sensitive"]:
                            sensitivity_info["classification_categories"]["pii"] += 1
                        elif category in ["phi", "health", "medical"]:
                            sensitivity_info["classification_categories"]["phi"] += 1
                        elif category in ["financial", "payment", "credit"]:
                            sensitivity_info["classification_categories"]["financial"] += 1
                        else:
                            sensitivity_info["classification_categories"]["other"] += 1
                    
                    # Add sensitive field details
                    if sensitivity_level in ["confidential", "restricted"]:
                        sensitivity_info["sensitive_fields"].append({
                            "name": field.get("name", ""),
                            "path": f"{db.get('name')}.{collection.get('name')}.{field.get('name')}",
                            "type": "field",
                            "data_type": field.get("data_type", ""),
                            "sensitivity_level": sensitivity_level,
                            "classifications": classifications,
                            "is_encrypted": field.get("is_encrypted", False),
                            "has_access_controls": field.get("has_access_controls", False)
                        })
        
        return sensitivity_info