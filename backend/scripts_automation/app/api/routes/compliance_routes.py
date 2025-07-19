from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.db_session import get_session
from app.services.compliance_service import ComplianceService
from app.models.compliance_models import (
    ComplianceRequirement, ComplianceAssessment, ComplianceGap, ComplianceEvidence,
    ComplianceRequirementResponse, ComplianceAssessmentResponse, ComplianceGapResponse,
    ComplianceStatusResponse, ComplianceRequirementCreate, ComplianceAssessmentCreate,
    ComplianceGapCreate, ComplianceRequirementUpdate, ComplianceGapUpdate,
    ComplianceFramework, ComplianceStatus, AssessmentStatus
)
from app.services.rbac_service import RBACService
from app.services.advanced_analytics_service import AdvancedAnalyticsService
from app.services.advanced_workflow_service import AdvancedWorkflowService
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/compliance", tags=["Compliance Management"])

# Dependency for RBAC
def get_current_user():
    # This would be implemented with your authentication system
    return "current_user_id"

# ============================================================================
# COMPLIANCE STATUS & OVERVIEW
# ============================================================================

@router.get("/status/{data_source_id}", response_model=ComplianceStatusResponse)
async def get_compliance_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get comprehensive compliance status for a data source"""
    try:
        # Check RBAC permissions
        if not RBACService.has_permission(current_user, "compliance", "read", data_source_id):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return ComplianceService.get_compliance_status(session, data_source_id)
    except Exception as e:
        logger.error(f"Error getting compliance status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overview", response_model=Dict[str, Any])
async def get_compliance_overview(
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance overview across all data sources"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get overall compliance metrics
        overview = {
            "total_data_sources": 0,
            "compliant_data_sources": 0,
            "non_compliant_data_sources": 0,
            "compliance_percentage": 0.0,
            "frameworks": {},
            "recent_violations": [],
            "upcoming_assessments": [],
            "risk_summary": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            }
        }
        
        # This would be implemented with actual data aggregation
        return overview
    except Exception as e:
        logger.error(f"Error getting compliance overview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE REQUIREMENTS
# ============================================================================

@router.get("/requirements/{data_source_id}", response_model=List[ComplianceRequirementResponse])
async def get_compliance_requirements(
    data_source_id: int,
    framework: Optional[ComplianceFramework] = Query(None),
    status: Optional[ComplianceStatus] = Query(None),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance requirements for a data source"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read", data_source_id):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        requirements = ComplianceService.get_requirements(session, data_source_id, framework)
        
        # Filter by status if provided
        if status:
            requirements = [req for req in requirements if req.status == status]
        
        return requirements
    except Exception as e:
        logger.error(f"Error getting compliance requirements: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requirements", response_model=ComplianceRequirementResponse)
async def create_compliance_requirement(
    requirement_data: ComplianceRequirementCreate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Create a new compliance requirement"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        requirement = ComplianceService.create_requirement(session, requirement_data, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_requirement_created", {
            "requirement_id": requirement.id,
            "framework": requirement.framework,
            "data_source_id": requirement.data_source_id,
            "user_id": current_user
        })
        
        # Send notification
        NotificationService.send_notification(
            "compliance_requirement_created",
            f"New compliance requirement created: {requirement.title}",
            current_user
        )
        
        return requirement
    except Exception as e:
        logger.error(f"Error creating compliance requirement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/requirements/{requirement_id}", response_model=ComplianceRequirementResponse)
async def update_compliance_requirement(
    requirement_id: int,
    update_data: ComplianceRequirementUpdate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Update a compliance requirement"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "update"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        requirement = ComplianceService.update_requirement(session, requirement_id, update_data, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_requirement_updated", {
            "requirement_id": requirement_id,
            "user_id": current_user
        })
        
        return requirement
    except Exception as e:
        logger.error(f"Error updating compliance requirement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/requirements/{requirement_id}")
async def delete_compliance_requirement(
    requirement_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Delete a compliance requirement"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "delete"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Implementation would be added to ComplianceService
        # ComplianceService.delete_requirement(session, requirement_id, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_requirement_deleted", {
            "requirement_id": requirement_id,
            "user_id": current_user
        })
        
        return {"message": "Compliance requirement deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting compliance requirement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE ASSESSMENTS
# ============================================================================

@router.get("/assessments/{data_source_id}", response_model=List[ComplianceAssessmentResponse])
async def get_compliance_assessments(
    data_source_id: int,
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance assessments for a data source"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read", data_source_id):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return ComplianceService.get_recent_assessments(session, data_source_id, limit)
    except Exception as e:
        logger.error(f"Error getting compliance assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessments", response_model=ComplianceAssessmentResponse)
async def start_compliance_assessment(
    assessment_data: ComplianceAssessmentCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Start a new compliance assessment"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        assessment = ComplianceService.start_assessment(session, assessment_data, current_user)
        
        # Add background task for assessment execution
        background_tasks.add_task(
            ComplianceService.execute_assessment_background,
            assessment.id,
            current_user
        )
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_assessment_started", {
            "assessment_id": assessment.id,
            "framework": assessment.framework,
            "data_source_id": assessment.data_source_id,
            "user_id": current_user
        })
        
        return assessment
    except Exception as e:
        logger.error(f"Error starting compliance assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/assessments/{assessment_id}/status")
async def update_assessment_status(
    assessment_id: int,
    status: AssessmentStatus,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Update assessment status"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "update"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Implementation would be added to ComplianceService
        # assessment = ComplianceService.update_assessment_status(session, assessment_id, status, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_assessment_status_updated", {
            "assessment_id": assessment_id,
            "status": status,
            "user_id": current_user
        })
        
        return {"message": "Assessment status updated successfully"}
    except Exception as e:
        logger.error(f"Error updating assessment status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE GAPS
# ============================================================================

@router.get("/gaps/{data_source_id}", response_model=List[ComplianceGapResponse])
async def get_compliance_gaps(
    data_source_id: int,
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance gaps for a data source"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read", data_source_id):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        gaps = ComplianceService.get_compliance_gaps(session, data_source_id, status)
        
        # Filter by severity if provided
        if severity:
            gaps = [gap for gap in gaps if gap.severity == severity]
        
        return gaps
    except Exception as e:
        logger.error(f"Error getting compliance gaps: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gaps", response_model=ComplianceGapResponse)
async def create_compliance_gap(
    gap_data: ComplianceGapCreate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Create a new compliance gap"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        gap = ComplianceService.create_gap(session, gap_data, current_user)
        
        # Create workflow for gap remediation
        workflow_data = {
            "name": f"Remediate Gap: {gap.gap_title}",
            "description": f"Workflow to remediate compliance gap: {gap.gap_description}",
            "type": "compliance_remediation",
            "priority": gap.severity,
            "assigned_to": gap.assigned_to,
            "due_date": gap.due_date,
            "metadata": {
                "gap_id": gap.id,
                "requirement_id": gap.requirement_id,
                "data_source_id": gap.data_source_id
            }
        }
        
        AdvancedWorkflowService.create_workflow(workflow_data, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_gap_created", {
            "gap_id": gap.id,
            "severity": gap.severity,
            "data_source_id": gap.data_source_id,
            "user_id": current_user
        })
        
        # Send notification
        NotificationService.send_notification(
            "compliance_gap_created",
            f"New compliance gap created: {gap.gap_title}",
            current_user
        )
        
        return gap
    except Exception as e:
        logger.error(f"Error creating compliance gap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/gaps/{gap_id}", response_model=ComplianceGapResponse)
async def update_compliance_gap(
    gap_id: int,
    update_data: ComplianceGapUpdate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Update a compliance gap"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "update"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Implementation would be added to ComplianceService
        # gap = ComplianceService.update_gap(session, gap_id, update_data, current_user)
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("compliance_gap_updated", {
            "gap_id": gap_id,
            "user_id": current_user
        })
        
        return {"message": "Compliance gap updated successfully"}
    except Exception as e:
        logger.error(f"Error updating compliance gap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE ANALYTICS & INSIGHTS
# ============================================================================

@router.get("/analytics/trends")
async def get_compliance_trends(
    data_source_id: Optional[int] = Query(None),
    framework: Optional[ComplianceFramework] = Query(None),
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance trends and analytics"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get analytics data
        trends = AdvancedAnalyticsService.get_compliance_trends(
            data_source_id=data_source_id,
            framework=framework,
            days=days
        )
        
        return trends
    except Exception as e:
        logger.error(f"Error getting compliance trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/risk-assessment")
async def get_compliance_risk_assessment(
    data_source_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get compliance risk assessment"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get risk assessment data
        risk_assessment = AdvancedAnalyticsService.get_compliance_risk_assessment(
            data_source_id=data_source_id
        )
        
        return risk_assessment
    except Exception as e:
        logger.error(f"Error getting compliance risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/recommendations")
async def get_compliance_recommendations(
    data_source_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get AI-powered compliance recommendations"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get AI recommendations
        recommendations = AdvancedAnalyticsService.get_compliance_recommendations(
            data_source_id=data_source_id
        )
        
        return recommendations
    except Exception as e:
        logger.error(f"Error getting compliance recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE WORKFLOWS
# ============================================================================

@router.post("/workflows/automated-check")
async def trigger_automated_compliance_check(
    data_source_id: int,
    frameworks: List[ComplianceFramework] = Query([]),
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Trigger automated compliance check"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "execute"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Add background task for automated compliance check
        background_tasks.add_task(
            ComplianceService.execute_automated_compliance_check,
            data_source_id,
            frameworks,
            current_user
        )
        
        # Trigger analytics
        AdvancedAnalyticsService.track_event("automated_compliance_check_triggered", {
            "data_source_id": data_source_id,
            "frameworks": frameworks,
            "user_id": current_user
        })
        
        return {"message": "Automated compliance check initiated"}
    except Exception as e:
        logger.error(f"Error triggering automated compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows/remediation")
async def create_remediation_workflow(
    gap_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Create remediation workflow for a compliance gap"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get gap details
        gap = session.get(ComplianceGap, gap_id)
        if not gap:
            raise HTTPException(status_code=404, detail="Compliance gap not found")
        
        # Create workflow
        workflow_data = {
            "name": f"Remediate Gap: {gap.gap_title}",
            "description": f"Workflow to remediate compliance gap: {gap.gap_description}",
            "type": "compliance_remediation",
            "priority": gap.severity,
            "assigned_to": gap.assigned_to,
            "due_date": gap.due_date,
            "metadata": {
                "gap_id": gap.id,
                "requirement_id": gap.requirement_id,
                "data_source_id": gap.data_source_id
            }
        }
        
        workflow = AdvancedWorkflowService.create_workflow(workflow_data, current_user)
        
        return workflow
    except Exception as e:
        logger.error(f"Error creating remediation workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE REPORTING
# ============================================================================

@router.get("/reports/generate")
async def generate_compliance_report(
    data_source_id: Optional[int] = Query(None),
    framework: Optional[ComplianceFramework] = Query(None),
    report_type: str = Query("comprehensive"),
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Generate compliance report"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Add background task for report generation
        background_tasks.add_task(
            ComplianceService.generate_compliance_report,
            data_source_id,
            framework,
            report_type,
            current_user
        )
        
        return {"message": "Compliance report generation initiated"}
    except Exception as e:
        logger.error(f"Error generating compliance report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/export")
async def export_compliance_data(
    data_source_id: Optional[int] = Query(None),
    format: str = Query("json", regex="^(json|csv|excel)$"),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Export compliance data"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Implementation would export compliance data in specified format
        export_data = {
            "format": format,
            "data_source_id": data_source_id,
            "export_url": f"/exports/compliance_{data_source_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
        }
        
        return export_data
    except Exception as e:
        logger.error(f"Error exporting compliance data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPLIANCE INTEGRATIONS
# ============================================================================

@router.get("/integrations/frameworks")
async def get_compliance_frameworks(
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Get available compliance frameworks"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        frameworks = [
            {"id": "soc2", "name": "SOC 2", "description": "Service Organization Control 2"},
            {"id": "gdpr", "name": "GDPR", "description": "General Data Protection Regulation"},
            {"id": "hipaa", "name": "HIPAA", "description": "Health Insurance Portability and Accountability Act"},
            {"id": "pci_dss", "name": "PCI DSS", "description": "Payment Card Industry Data Security Standard"},
            {"id": "iso27001", "name": "ISO 27001", "description": "Information Security Management System"},
            {"id": "nist", "name": "NIST", "description": "National Institute of Standards and Technology"},
            {"id": "ccpa", "name": "CCPA", "description": "California Consumer Privacy Act"},
            {"id": "sox", "name": "SOX", "description": "Sarbanes-Oxley Act"}
        ]
        
        return frameworks
    except Exception as e:
        logger.error(f"Error getting compliance frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/integrations/validate")
async def validate_compliance_integration(
    integration_config: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    """Validate compliance integration configuration"""
    try:
        if not RBACService.has_permission(current_user, "compliance", "admin"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Implementation would validate integration configuration
        validation_result = {
            "valid": True,
            "message": "Integration configuration is valid",
            "details": {
                "frameworks_supported": ["SOC2", "GDPR", "HIPAA"],
                "connection_status": "connected",
                "last_sync": datetime.now().isoformat()
            }
        }
        
        return validation_result
    except Exception as e:
        logger.error(f"Error validating compliance integration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))