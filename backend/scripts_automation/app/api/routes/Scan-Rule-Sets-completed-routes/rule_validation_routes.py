"""
Rule Validation Routes for Scan-Rule-Sets Group

This module provides comprehensive API routes for rule validation,
compliance checking, syntax analysis, and intelligent validation recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.security.rbac import check_permissions, current_user, RoleType
from app.services.Scan-Rule-Sets-completed-services.rule_validation_engine import RuleValidationEngine
from app.models.Scan-Rule-Sets-completed-models.rule_execution_models import (
    RuleValidationResult, RuleValidationRequest, RuleValidationResponse,
    ValidationRule, ValidationRuleCreate, ValidationRuleUpdate, ValidationRuleResponse,
    ComplianceCheck, ComplianceCheckCreate, ComplianceCheckResponse,
    ValidationReport, ValidationReportResponse,
    SyntaxAnalysis, SyntaxAnalysisResponse,
    PerformanceAnalysis, PerformanceAnalysisResponse,
    SecurityAnalysis, SecurityAnalysisResponse,
    ValidationRecommendation, ValidationRecommendationResponse,
    BulkValidationRequest, BulkValidationResponse,
    ValidationCategoryEnum, ValidationSeverityEnum, ValidationStatusEnum,
    ComplianceFrameworkEnum, RecommendationTypeEnum
)
from app.utils.rate_limiter import check_rate_limit
from app.utils.cache import CacheManager
from app.core.logging_config import get_logger

router = APIRouter(prefix="/api/v1/scan-rule-sets/validation", tags=["Rule Validation"])
logger = get_logger(__name__)

# Initialize services
async def get_validation_engine(db: Session = Depends(get_session)) -> RuleValidationEngine:
    return RuleValidationEngine(db)

# ============================================================================
# RULE VALIDATION
# ============================================================================

@router.post("/validate", response_model=RuleValidationResponse)
@check_rate_limit("rule_validation", requests=30, window=300)
async def validate_rule(
    validation_request: RuleValidationRequest,
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Validate a scan rule with comprehensive analysis."""
    try:
        # Perform validation
        validation_result = await service.validate_rule(
            validation_request=validation_request,
            validated_by=current_user_data.id
        )
        
        # Schedule background optimization analysis
        if validation_result.status == ValidationStatusEnum.PASSED:
            background_tasks.add_task(
                service.analyze_rule_optimization_opportunities,
                validation_result.validation_id
            )
        
        logger.info(f"Rule validation completed: {validation_result.validation_id}")
        return validation_result
        
    except Exception as e:
        logger.error(f"Error in rule validation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/validate/syntax", response_model=SyntaxAnalysisResponse)
@check_rate_limit("syntax_validation", requests=50, window=300)
async def validate_rule_syntax(
    rule_content: str,
    rule_type: Optional[str] = None,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Validate rule syntax and structure."""
    try:
        syntax_analysis = await service.validate_syntax(
            rule_content=rule_content,
            rule_type=rule_type,
            analyzed_by=current_user_data.id
        )
        
        logger.info(f"Syntax validation completed for rule type: {rule_type}")
        return syntax_analysis
        
    except Exception as e:
        logger.error(f"Error in syntax validation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Syntax validation failed: {str(e)}")

@router.post("/validate/performance", response_model=PerformanceAnalysisResponse)
@check_rate_limit("performance_validation", requests=20, window=300)
async def validate_rule_performance(
    rule_id: UUID,
    test_data_size: Optional[int] = Query(1000, ge=100, le=100000),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Validate rule performance and efficiency."""
    try:
        performance_analysis = await service.validate_performance(
            rule_id=rule_id,
            test_data_size=test_data_size,
            analyzed_by=current_user_data.id
        )
        
        logger.info(f"Performance validation completed for rule: {rule_id}")
        return performance_analysis
        
    except Exception as e:
        logger.error(f"Error in performance validation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Performance validation failed: {str(e)}")

@router.post("/validate/security", response_model=SecurityAnalysisResponse)
@check_rate_limit("security_validation", requests=20, window=300)
async def validate_rule_security(
    rule_id: UUID,
    security_frameworks: List[str] = Query(default=["OWASP", "NIST"]),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.SECURITY_ANALYST, RoleType.ADMIN]))
):
    """Validate rule security compliance."""
    try:
        security_analysis = await service.validate_security(
            rule_id=rule_id,
            security_frameworks=security_frameworks,
            analyzed_by=current_user_data.id
        )
        
        logger.info(f"Security validation completed for rule: {rule_id}")
        return security_analysis
        
    except Exception as e:
        logger.error(f"Error in security validation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Security validation failed: {str(e)}")

# ============================================================================
# VALIDATION RULES MANAGEMENT
# ============================================================================

@router.post("/rules", response_model=ValidationRuleResponse)
@check_rate_limit("validation_rule_creation", requests=10, window=300)
async def create_validation_rule(
    rule_data: ValidationRuleCreate,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Create a new validation rule."""
    try:
        validation_rule = await service.create_validation_rule(
            rule_data=rule_data,
            created_by=current_user_data.id
        )
        
        logger.info(f"Validation rule created: {validation_rule.id} by {current_user_data.id}")
        return validation_rule
        
    except Exception as e:
        logger.error(f"Error creating validation rule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create validation rule: {str(e)}")

@router.get("/rules", response_model=List[ValidationRuleResponse])
@check_rate_limit("validation_rule_list", requests=30, window=300)
async def list_validation_rules(
    category: Optional[ValidationCategoryEnum] = None,
    severity: Optional[ValidationSeverityEnum] = None,
    active_only: bool = Query(True, description="Show only active rules"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """List validation rules with filtering."""
    try:
        validation_rules = await service.list_validation_rules(
            category=category,
            severity=severity,
            active_only=active_only,
            skip=skip,
            limit=limit
        )
        return validation_rules
        
    except Exception as e:
        logger.error(f"Error listing validation rules: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list validation rules: {str(e)}")

@router.get("/rules/{rule_id}", response_model=ValidationRuleResponse)
@check_rate_limit("validation_rule_detail", requests=50, window=300)
async def get_validation_rule(
    rule_id: UUID = Path(..., description="Validation rule ID"),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Get detailed validation rule information."""
    try:
        validation_rule = await service.get_validation_rule(rule_id)
        if not validation_rule:
            raise HTTPException(status_code=404, detail="Validation rule not found")
        return validation_rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting validation rule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get validation rule: {str(e)}")

@router.put("/rules/{rule_id}", response_model=ValidationRuleResponse)
@check_rate_limit("validation_rule_update", requests=20, window=300)
async def update_validation_rule(
    rule_id: UUID,
    rule_data: ValidationRuleUpdate,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Update validation rule configuration."""
    try:
        validation_rule = await service.update_validation_rule(
            rule_id=rule_id,
            rule_data=rule_data,
            updated_by=current_user_data.id
        )
        
        logger.info(f"Validation rule updated: {rule_id} by {current_user_data.id}")
        return validation_rule
        
    except Exception as e:
        logger.error(f"Error updating validation rule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update validation rule: {str(e)}")

@router.delete("/rules/{rule_id}")
@check_rate_limit("validation_rule_delete", requests=10, window=300)
async def delete_validation_rule(
    rule_id: UUID,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.ADMIN]))
):
    """Delete validation rule."""
    try:
        await service.delete_validation_rule(
            rule_id=rule_id,
            deleted_by=current_user_data.id
        )
        
        logger.info(f"Validation rule deleted: {rule_id} by {current_user_data.id}")
        return {"message": "Validation rule deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting validation rule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete validation rule: {str(e)}")

# ============================================================================
# COMPLIANCE CHECKING
# ============================================================================

@router.post("/compliance/check", response_model=ComplianceCheckResponse)
@check_rate_limit("compliance_check", requests=20, window=300)
async def perform_compliance_check(
    check_data: ComplianceCheckCreate,
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.COMPLIANCE_OFFICER, RoleType.ADMIN]))
):
    """Perform compliance check on rules."""
    try:
        compliance_check = await service.perform_compliance_check(
            check_data=check_data,
            checked_by=current_user_data.id
        )
        
        # Schedule background remediation suggestions
        if compliance_check.issues_found > 0:
            background_tasks.add_task(
                service.generate_compliance_remediation_suggestions,
                compliance_check.check_id
            )
        
        logger.info(f"Compliance check completed: {compliance_check.check_id}")
        return compliance_check
        
    except Exception as e:
        logger.error(f"Error in compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")

@router.get("/compliance/frameworks")
@check_rate_limit("compliance_frameworks", requests=20, window=300)
async def list_compliance_frameworks(
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """List available compliance frameworks."""
    try:
        frameworks = await service.list_compliance_frameworks()
        return frameworks
        
    except Exception as e:
        logger.error(f"Error listing compliance frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list frameworks: {str(e)}")

@router.get("/compliance/checks", response_model=List[ComplianceCheckResponse])
@check_rate_limit("compliance_check_list", requests=30, window=300)
async def list_compliance_checks(
    framework: Optional[ComplianceFrameworkEnum] = None,
    rule_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """List compliance checks with filtering."""
    try:
        compliance_checks = await service.list_compliance_checks(
            framework=framework,
            rule_id=rule_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
        return compliance_checks
        
    except Exception as e:
        logger.error(f"Error listing compliance checks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list compliance checks: {str(e)}")

# ============================================================================
# VALIDATION REPORTS
# ============================================================================

@router.post("/reports/generate")
@check_rate_limit("report_generation", requests=10, window=600)
async def generate_validation_report(
    rule_ids: List[UUID],
    report_type: str = Query("comprehensive", description="Type of validation report"),
    include_recommendations: bool = Query(True, description="Include optimization recommendations"),
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Generate comprehensive validation report."""
    try:
        # Start report generation in background
        background_tasks.add_task(
            service.generate_validation_report,
            rule_ids=rule_ids,
            report_type=report_type,
            include_recommendations=include_recommendations,
            generated_by=current_user_data.id
        )
        
        logger.info(f"Validation report generation started by {current_user_data.id}")
        return {"message": "Report generation started", "status": "generating"}
        
    except Exception as e:
        logger.error(f"Error starting report generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/reports", response_model=List[ValidationReportResponse])
@check_rate_limit("report_list", requests=20, window=300)
async def list_validation_reports(
    report_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """List validation reports."""
    try:
        reports = await service.list_validation_reports(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
            user_id=current_user_data.id
        )
        return reports
        
    except Exception as e:
        logger.error(f"Error listing validation reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list reports: {str(e)}")

@router.get("/reports/{report_id}", response_model=ValidationReportResponse)
@check_rate_limit("report_detail", requests=30, window=300)
async def get_validation_report(
    report_id: UUID,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Get detailed validation report."""
    try:
        report = await service.get_validation_report(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Validation report not found")
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting validation report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get report: {str(e)}")

# ============================================================================
# VALIDATION RECOMMENDATIONS
# ============================================================================

@router.get("/recommendations", response_model=List[ValidationRecommendationResponse])
@check_rate_limit("recommendation_list", requests=30, window=300)
async def list_validation_recommendations(
    rule_id: Optional[UUID] = None,
    recommendation_type: Optional[RecommendationTypeEnum] = None,
    priority_min: Optional[int] = Query(None, ge=1, le=10),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """List validation recommendations."""
    try:
        recommendations = await service.list_validation_recommendations(
            rule_id=rule_id,
            recommendation_type=recommendation_type,
            priority_min=priority_min,
            skip=skip,
            limit=limit
        )
        return recommendations
        
    except Exception as e:
        logger.error(f"Error listing validation recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list recommendations: {str(e)}")

@router.post("/recommendations/{recommendation_id}/apply")
@check_rate_limit("recommendation_apply", requests=10, window=300)
async def apply_validation_recommendation(
    recommendation_id: UUID,
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Apply a validation recommendation."""
    try:
        # Apply recommendation in background
        background_tasks.add_task(
            service.apply_validation_recommendation,
            recommendation_id=recommendation_id,
            applied_by=current_user_data.id
        )
        
        logger.info(f"Validation recommendation application started: {recommendation_id}")
        return {"message": "Recommendation application started", "recommendation_id": recommendation_id}
        
    except Exception as e:
        logger.error(f"Error applying validation recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to apply recommendation: {str(e)}")

@router.post("/recommendations/generate")
@check_rate_limit("recommendation_generation", requests=10, window=300)
async def generate_validation_recommendations(
    rule_id: UUID,
    analysis_depth: str = Query("standard", description="Analysis depth: basic, standard, comprehensive"),
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Generate AI-powered validation recommendations for a rule."""
    try:
        # Generate recommendations in background
        background_tasks.add_task(
            service.generate_intelligent_recommendations,
            rule_id=rule_id,
            analysis_depth=analysis_depth,
            generated_by=current_user_data.id
        )
        
        logger.info(f"Recommendation generation started for rule: {rule_id}")
        return {"message": "Recommendation generation started", "rule_id": rule_id}
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

# ============================================================================
# BULK VALIDATION
# ============================================================================

@router.post("/bulk/validate", response_model=BulkValidationResponse)
@check_rate_limit("bulk_validation", requests=3, window=600)
async def bulk_validation(
    bulk_request: BulkValidationRequest,
    background_tasks: BackgroundTasks,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Perform bulk validation of multiple rules."""
    try:
        # Start bulk validation in background
        background_tasks.add_task(
            service.bulk_validation,
            bulk_request=bulk_request,
            initiated_by=current_user_data.id
        )
        
        logger.info(f"Bulk validation started by {current_user_data.id}")
        return BulkValidationResponse(
            operation_id=UUID("00000000-0000-0000-0000-000000000000"),  # Will be generated in service
            status="started",
            message="Bulk validation initiated",
            total_rules=len(bulk_request.rule_ids),
            validated_rules=0,
            progress_percentage=0.0
        )
        
    except Exception as e:
        logger.error(f"Error starting bulk validation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk validation failed: {str(e)}")

# ============================================================================
# VALIDATION HISTORY
# ============================================================================

@router.get("/history", response_model=List[RuleValidationResponse])
@check_rate_limit("validation_history", requests=30, window=300)
async def get_validation_history(
    rule_id: Optional[UUID] = None,
    status: Optional[ValidationStatusEnum] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Get validation history with filtering."""
    try:
        validation_history = await service.get_validation_history(
            rule_id=rule_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
        return validation_history
        
    except Exception as e:
        logger.error(f"Error getting validation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get validation history: {str(e)}")

@router.get("/history/{validation_id}", response_model=RuleValidationResponse)
@check_rate_limit("validation_detail", requests=50, window=300)
async def get_validation_detail(
    validation_id: UUID,
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Get detailed validation information."""
    try:
        validation = await service.get_validation_detail(validation_id)
        if not validation:
            raise HTTPException(status_code=404, detail="Validation not found")
        return validation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting validation detail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get validation detail: {str(e)}")

# ============================================================================
# HEALTH & MONITORING
# ============================================================================

@router.get("/health")
async def health_check(
    service: RuleValidationEngine = Depends(get_validation_engine)
):
    """Health check for rule validation service."""
    try:
        health_status = await service.get_health_status()
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@router.get("/metrics")
@check_rate_limit("validation_metrics", requests=20, window=300)
async def get_validation_metrics(
    time_range_hours: int = Query(24, ge=1, le=168),
    service: RuleValidationEngine = Depends(get_validation_engine),
    current_user_data = Depends(current_user)
):
    """Get validation service metrics."""
    try:
        metrics = await service.get_validation_metrics(
            time_range_hours=time_range_hours
        )
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting validation metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")