from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.compliance_production_services import ComplianceReportService
from app.models.compliance_extended_models import ReportType, ReportStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/reports", tags=["Compliance Reports"])

@router.get("/", response_model=Dict[str, Any])
async def get_compliance_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance reports with advanced filtering and pagination"""
    try:
        # Convert string parameters to enums if provided
        report_type_enum = None
        if report_type:
            try:
                report_type_enum = ReportType(report_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid report type: {report_type}")
        
        status_enum = None
        if status:
            try:
                status_enum = ReportStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        reports, total = ComplianceReportService.get_reports(
            session=session,
            report_type=report_type_enum,
            status=status_enum,
            framework=framework,
            created_by=created_by,
            page=page,
            limit=limit
        )
        
        return {
            "data": reports,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting compliance reports: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict[str, Any])
async def create_report(
    report_data: Dict[str, Any] = Body(..., description="Report creation data"),
    created_by: Optional[str] = Query(None, description="User creating the report"),
    session: Session = Depends(get_session)
):
    """Create a new compliance report with validation and processing"""
    try:
        # Validate required fields
        if not report_data.get("name"):
            raise HTTPException(status_code=400, detail="Report name is required")
        
        if not report_data.get("report_type"):
            raise HTTPException(status_code=400, detail="Report type is required")
        
        # Validate report type
        try:
            ReportType(report_data["report_type"])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid report type: {report_data['report_type']}")
        
        report = ComplianceReportService.create_report(
            session=session,
            report_data=report_data,
            created_by=created_by
        )
        
        return report
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error creating report: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating compliance report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_report_templates(
    framework: Optional[str] = Query(None, description="Filter by framework"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    session: Session = Depends(get_session)
):
    """Get available report templates with filtering"""
    try:
        # Validate report type if provided
        report_type_enum = None
        if report_type:
            try:
                report_type_enum = ReportType(report_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid report type: {report_type}")
        
        templates = ComplianceReportService.get_report_templates(
            session=session,
            framework=framework,
            report_type=report_type_enum
        )
        
        return templates
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting report templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/templates", response_model=Dict[str, Any])
async def create_report_template(
    template_data: Dict[str, Any] = Body(..., description="Template creation data"),
    session: Session = Depends(get_session)
):
    """Create a new report template"""
    try:
        template = {
            "id": f"custom_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "name": template_data.get("name", "Custom Template"),
            "description": template_data.get("description", ""),
            "framework": template_data.get("framework", "custom"),
            "report_type": template_data.get("report_type", "custom"),
            "sections": template_data.get("sections", []),
            "file_formats": template_data.get("file_formats", ["pdf"]),
            "created_at": datetime.now().isoformat()
        }
        
        return template
        
    except Exception as e:
        logger.error(f"Error creating report template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview", response_model=Dict[str, Any])
async def preview_report(
    preview_data: Dict[str, Any] = Body(..., description="Report preview data"),
    session: Session = Depends(get_session)
):
    """Preview a report before generation"""
    try:
        preview = {
            "preview_id": f"preview_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "template_id": preview_data.get("template_id"),
            "estimated_pages": 15,
            "sections": [
                {"name": "Executive Summary", "pages": 2},
                {"name": "Compliance Status", "pages": 5},
                {"name": "Findings", "pages": 4},
                {"name": "Recommendations", "pages": 3},
                {"name": "Appendix", "pages": 1}
            ],
            "data_sources": preview_data.get("data_sources", []),
            "filters": preview_data.get("filters", {}),
            "estimated_generation_time": "5-10 minutes"
        }
        
        return preview
        
    except Exception as e:
        logger.error(f"Error previewing report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))