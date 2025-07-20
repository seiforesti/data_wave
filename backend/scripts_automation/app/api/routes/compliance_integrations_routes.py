from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.compliance_production_services import ComplianceIntegrationService
from app.models.compliance_extended_models import IntegrationType, IntegrationStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/integrations", tags=["Compliance Integrations"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_integrations(
    integration_type: Optional[str] = Query(None, description="Filter by integration type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    session: Session = Depends(get_session)
):
    """Get compliance integrations with filtering"""
    try:
        # Convert string parameters to enums if provided
        integration_type_enum = None
        if integration_type:
            try:
                integration_type_enum = IntegrationType(integration_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid integration type: {integration_type}")
        
        status_enum = None
        if status:
            try:
                status_enum = IntegrationStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        integrations = ComplianceIntegrationService.get_integrations(
            session=session,
            integration_type=integration_type_enum,
            status=status_enum,
            provider=provider
        )
        
        return integrations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict[str, Any])
async def create_integration(
    integration_data: Dict[str, Any] = Body(..., description="Integration creation data"),
    created_by: Optional[str] = Query(None, description="User creating the integration"),
    session: Session = Depends(get_session)
):
    """Create a new compliance integration with validation"""
    try:
        # Validate required fields
        if not integration_data.get("name"):
            raise HTTPException(status_code=400, detail="Integration name is required")
        
        if not integration_data.get("integration_type"):
            raise HTTPException(status_code=400, detail="Integration type is required")
        
        if not integration_data.get("provider"):
            raise HTTPException(status_code=400, detail="Provider is required")
        
        # Validate integration type
        try:
            IntegrationType(integration_data["integration_type"])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid integration type: {integration_data['integration_type']}")
        
        integration = ComplianceIntegrationService.create_integration(
            session=session,
            integration_data=integration_data,
            created_by=created_by
        )
        
        return integration
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error creating integration: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating integration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available", response_model=List[Dict[str, Any]])
async def get_available_integrations(
    session: Session = Depends(get_session)
):
    """Get available integration types"""
    try:
        available_integrations = [
            {
                "id": "servicenow",
                "name": "ServiceNow",
                "description": "Integrate with ServiceNow for incident and change management",
                "integration_type": "ticketing",
                "provider": "servicenow",
                "capabilities": ["ticket_creation", "status_updates", "workflow_integration"],
                "auth_methods": ["oauth2", "basic_auth"],
                "config_fields": [
                    {"name": "instance_url", "type": "url", "required": True},
                    {"name": "username", "type": "string", "required": True},
                    {"name": "password", "type": "password", "required": True}
                ]
            },
            {
                "id": "aws_config",
                "name": "AWS Config",
                "description": "Monitor AWS resource compliance with Config rules",
                "integration_type": "security_scanner",
                "provider": "aws",
                "capabilities": ["compliance_monitoring", "resource_scanning", "rule_evaluation"],
                "auth_methods": ["iam_role", "access_keys"],
                "config_fields": [
                    {"name": "access_key_id", "type": "string", "required": True},
                    {"name": "secret_access_key", "type": "password", "required": True},
                    {"name": "region", "type": "string", "required": True}
                ]
            },
            {
                "id": "azure_policy",
                "name": "Azure Policy",
                "description": "Monitor Azure resource compliance with policies",
                "integration_type": "security_scanner",
                "provider": "azure",
                "capabilities": ["policy_evaluation", "compliance_reporting", "remediation"],
                "auth_methods": ["service_principal", "managed_identity"],
                "config_fields": [
                    {"name": "tenant_id", "type": "string", "required": True},
                    {"name": "client_id", "type": "string", "required": True},
                    {"name": "client_secret", "type": "password", "required": True}
                ]
            },
            {
                "id": "gcp_security_center",
                "name": "Google Cloud Security Center",
                "description": "Monitor GCP security and compliance posture",
                "integration_type": "security_scanner",
                "provider": "gcp",
                "capabilities": ["security_scanning", "compliance_monitoring", "asset_discovery"],
                "auth_methods": ["service_account"],
                "config_fields": [
                    {"name": "project_id", "type": "string", "required": True},
                    {"name": "service_account_key", "type": "json", "required": True}
                ]
            },
            {
                "id": "splunk",
                "name": "Splunk",
                "description": "Send compliance events and logs to Splunk",
                "integration_type": "audit_platform",
                "provider": "splunk",
                "capabilities": ["log_forwarding", "event_correlation", "compliance_dashboards"],
                "auth_methods": ["token", "basic_auth"],
                "config_fields": [
                    {"name": "host", "type": "string", "required": True},
                    {"name": "port", "type": "number", "required": True},
                    {"name": "token", "type": "password", "required": True}
                ]
            },
            {
                "id": "jira",
                "name": "Jira",
                "description": "Create and manage compliance issues in Jira",
                "integration_type": "ticketing",
                "provider": "atlassian",
                "capabilities": ["issue_creation", "status_tracking", "workflow_automation"],
                "auth_methods": ["oauth2", "api_token"],
                "config_fields": [
                    {"name": "base_url", "type": "url", "required": True},
                    {"name": "email", "type": "email", "required": True},
                    {"name": "api_token", "type": "password", "required": True}
                ]
            }
        ]
        
        return available_integrations
        
    except Exception as e:
        logger.error(f"Error getting available integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_integration_templates(
    integration_type: Optional[str] = Query(None, description="Filter by integration type"),
    session: Session = Depends(get_session)
):
    """Get integration configuration templates"""
    try:
        templates = [
            {
                "id": "soc2_servicenow",
                "name": "SOC 2 ServiceNow Template",
                "description": "Pre-configured ServiceNow integration for SOC 2 compliance",
                "integration_type": "ticketing",
                "provider": "servicenow",
                "framework": "soc2",
                "config_template": {
                    "incident_category": "Compliance",
                    "incident_subcategory": "SOC 2",
                    "priority": "3",
                    "assignment_group": "Compliance Team",
                    "auto_assign": True,
                    "escalation_rules": [
                        {"condition": "priority = 1", "escalate_after": "30 minutes"},
                        {"condition": "priority = 2", "escalate_after": "2 hours"}
                    ]
                }
            },
            {
                "id": "gdpr_aws_config",
                "name": "GDPR AWS Config Template",
                "description": "AWS Config rules for GDPR compliance monitoring",
                "integration_type": "security_scanner",
                "provider": "aws",
                "framework": "gdpr",
                "config_template": {
                    "rules": [
                        "encrypted-volumes",
                        "s3-bucket-public-read-prohibited",
                        "s3-bucket-public-write-prohibited",
                        "rds-storage-encrypted"
                    ],
                    "compliance_by_config_rule": True,
                    "delivery_channel": "compliance-delivery-channel",
                    "snapshot_delivery_properties": {
                        "delivery_frequency": "daily"
                    }
                }
            },
            {
                "id": "pci_splunk",
                "name": "PCI DSS Splunk Template",
                "description": "Splunk configuration for PCI DSS compliance monitoring",
                "integration_type": "audit_platform",
                "provider": "splunk",
                "framework": "pci",
                "config_template": {
                    "index": "compliance_pci",
                    "sourcetype": "pci_compliance",
                    "alerts": [
                        {
                            "name": "Unauthorized Access Attempt",
                            "search": "index=compliance_pci sourcetype=access_logs status=failed",
                            "threshold": 5,
                            "time_window": "5m"
                        },
                        {
                            "name": "Cardholder Data Access",
                            "search": "index=compliance_pci sourcetype=data_access CHD=true",
                            "threshold": 1,
                            "time_window": "1m"
                        }
                    ],
                    "dashboards": ["pci_overview", "access_monitoring", "vulnerability_tracking"]
                }
            }
        ]
        
        # Apply filters
        if integration_type:
            templates = [t for t in templates if t["integration_type"] == integration_type]
        
        return templates
        
    except Exception as e:
        logger.error(f"Error getting integration templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))