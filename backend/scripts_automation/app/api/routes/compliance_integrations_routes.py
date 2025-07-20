from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/integrations", tags=["Compliance Integrations"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_integrations(
    integration_type: Optional[str] = Query(None, description="Filter by integration type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    session: Session = Depends(get_session)
):
    """Get compliance integrations"""
    try:
        # Mock data for now - in production this would query integrations table
        integrations = [
            {
                "id": 1,
                "name": "ServiceNow Integration",
                "description": "Integration with ServiceNow for ticket management",
                "integration_type": "ticketing",
                "provider": "servicenow",
                "status": "active",
                "config": {
                    "instance_url": "https://company.service-now.com",
                    "api_version": "v1"
                },
                "last_synced_at": datetime.now().isoformat(),
                "last_sync_status": "success",
                "sync_frequency": "real_time",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "AWS Config Integration",
                "description": "Integration with AWS Config for compliance monitoring",
                "integration_type": "security_scanner",
                "provider": "aws",
                "status": "active",
                "config": {
                    "region": "us-east-1",
                    "account_id": "123456789012"
                },
                "last_synced_at": datetime.now().isoformat(),
                "last_sync_status": "success",
                "sync_frequency": "hourly",
                "created_at": datetime.now().isoformat()
            }
        ]
        
        # Apply filters
        if integration_type:
            integrations = [i for i in integrations if i["integration_type"] == integration_type]
        if status:
            integrations = [i for i in integrations if i["status"] == status]
        
        return integrations
        
    except Exception as e:
        logger.error(f"Error getting integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict[str, Any])
async def create_integration(
    integration_data: Dict[str, Any] = Body(..., description="Integration creation data"),
    session: Session = Depends(get_session)
):
    """Create a new compliance integration"""
    try:
        integration = {
            "id": 999,
            "name": integration_data.get("name", "New Integration"),
            "description": integration_data.get("description", ""),
            "integration_type": integration_data.get("integration_type", "custom"),
            "provider": integration_data.get("provider", "custom"),
            "status": "pending",
            "config": integration_data.get("config", {}),
            "last_synced_at": None,
            "last_sync_status": None,
            "sync_frequency": integration_data.get("sync_frequency", "daily"),
            "created_at": datetime.now().isoformat()
        }
        
        return integration
        
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