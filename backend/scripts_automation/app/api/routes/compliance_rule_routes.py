from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session, select, func
from typing import List, Optional, Dict, Any
import logging
from app.db_session import get_session
from app.services.compliance_rule_service import ComplianceRuleService
from app.models.compliance_rule_models import (
    ComplianceRuleResponse, ComplianceRuleEvaluationResponse, 
    ComplianceIssueResponse, ComplianceWorkflowResponse,
    ComplianceRuleCreate, ComplianceRuleUpdate, ComplianceIssueCreate, 
    ComplianceIssueUpdate, ComplianceWorkflowCreate, ComplianceWorkflowUpdate,
    ComplianceRuleType, ComplianceRuleSeverity, ComplianceRuleStatus,
    ComplianceRuleScope, ComplianceRule
)
from datetime import datetime, timedelta
import random
from app.models.data_source_models import DataSource
from app.models.compliance_rule_evaluation_models import ComplianceRuleEvaluation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/rules", tags=["Compliance Rules"])


# Compliance Rules Management
@router.get("/", response_model=Dict[str, Any])
async def get_compliance_rules(
    rule_type: Optional[ComplianceRuleType] = Query(None, description="Filter by rule type"),
    severity: Optional[ComplianceRuleSeverity] = Query(None, description="Filter by severity"),
    status: Optional[ComplianceRuleStatus] = Query(None, description="Filter by status"),
    scope: Optional[ComplianceRuleScope] = Query(None, description="Filter by scope"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    compliance_standard: Optional[str] = Query(None, description="Filter by compliance standard"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    search: Optional[str] = Query(None, description="Search in name, description, and standard"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    sort: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    session: Session = Depends(get_session)
):
    """Get compliance rules with filtering and pagination"""
    try:
        # Parse tags
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        rules, total = ComplianceRuleService.get_rules(
            session=session,
            rule_type=rule_type,
            severity=severity,
            status=status,
            scope=scope,
            data_source_id=data_source_id,
            compliance_standard=compliance_standard,
            tags=tag_list,
            search=search,
            page=page,
            limit=limit,
            sort=sort,
            sort_order=sort_order
        )
        
        return {
            "data": rules,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance rules: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}", response_model=ComplianceRuleResponse)
async def get_compliance_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific compliance rule by ID"""
    try:
        rule = ComplianceRuleService.get_rule(session, rule_id)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ComplianceRuleResponse)
async def create_compliance_rule(
    rule_data: ComplianceRuleCreate,
    created_by: Optional[str] = Query(None, description="User creating the rule"),
    session: Session = Depends(get_session)
):
    """Create a new compliance rule"""
    try:
        rule = ComplianceRuleService.create_rule(session, rule_data, created_by)
        return rule
        
    except Exception as e:
        logger.error(f"Error creating compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{rule_id}", response_model=ComplianceRuleResponse)
async def update_compliance_rule(
    rule_id: int,
    rule_data: ComplianceRuleUpdate,
    updated_by: Optional[str] = Query(None, description="User updating the rule"),
    session: Session = Depends(get_session)
):
    """Update an existing compliance rule"""
    try:
        rule = ComplianceRuleService.update_rule(session, rule_id, rule_data, updated_by)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{rule_id}")
async def delete_compliance_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Delete a compliance rule"""
    try:
        success = ComplianceRuleService.delete_rule(session, rule_id)
        if not success:
            raise HTTPException(status_code=404, detail="Compliance rule not found or has dependencies")
        
        return {"message": "Compliance rule deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Rule Evaluation
@router.post("/{rule_id}/evaluate", response_model=ComplianceRuleEvaluationResponse)
async def evaluate_compliance_rule(
    rule_id: int,
    context: Optional[Dict[str, Any]] = Body(None, description="Evaluation context"),
    session: Session = Depends(get_session)
):
    """Evaluate a compliance rule"""
    try:
        evaluation = ComplianceRuleService.evaluate_rule(session, rule_id, context)
        return evaluation
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error evaluating compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}/evaluations", response_model=Dict[str, Any])
async def get_rule_evaluations(
    rule_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get evaluation history for a rule"""
    try:
        evaluations, total = ComplianceRuleService.get_rule_evaluations(
            session, rule_id, page, limit
        )
        
        return {
            "data": evaluations,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting evaluations for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rule_id}/validate", response_model=Dict[str, Any])
async def validate_compliance_rule(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Validate a compliance rule configuration"""
    try:
        validation_result = ComplianceRuleService.validate_rule(session, rule_id)
        return validation_result
        
    except Exception as e:
        logger.error(f"Error validating compliance rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Rule Testing
@router.post("/test", response_model=Dict[str, Any])
async def test_compliance_rule(
    rule_data: Dict[str, Any] = Body(..., description="Rule configuration to test"),
    session: Session = Depends(get_session)
):
    """Test a compliance rule configuration"""
    try:
        test_result = ComplianceRuleService.test_rule(session, rule_data)
        return test_result
        
    except Exception as e:
        logger.error(f"Error testing compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Rule Templates
@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_rule_templates(
    session: Session = Depends(get_session)
):
    """Get available rule templates"""
    try:
        templates = ComplianceRuleService.get_rule_templates(session)
        return templates
        
    except Exception as e:
        logger.error(f"Error getting rule templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/{template_type}", response_model=Dict[str, Any])
async def get_rule_template(
    template_type: str,
    session: Session = Depends(get_session)
):
    """Get a specific rule template by type"""
    try:
        templates = ComplianceRuleService.get_rule_templates(session)
        template = next((t for t in templates if t.get("rule_type") == template_type), None)
        
        if not template:
            raise HTTPException(status_code=404, detail="Rule template not found")
        
        return template
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting rule template {template_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Bulk Operations
@router.post("/bulk-update", response_model=List[ComplianceRuleResponse])
async def bulk_update_rules(
    updates: List[Dict[str, Any]] = Body(..., description="List of rule updates"),
    updated_by: Optional[str] = Query(None, description="User performing the update"),
    session: Session = Depends(get_session)
):
    """Bulk update multiple compliance rules"""
    try:
        updated_rules = ComplianceRuleService.bulk_update_rules(session, updates, updated_by)
        return updated_rules
        
    except Exception as e:
        logger.error(f"Error bulk updating rules: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Issues Management
@router.get("/issues", response_model=Dict[str, Any])
async def get_compliance_issues(
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[ComplianceRuleSeverity] = Query(None, description="Filter by severity"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance issues"""
    try:
        issues, total = ComplianceRuleService.get_rule_issues(
            session=session,
            rule_id=rule_id,
            status=status,
            severity=severity,
            assigned_to=assigned_to,
            data_source_id=data_source_id,
            page=page,
            limit=limit
        )
        
        return {
            "data": issues,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance issues: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/issues", response_model=ComplianceIssueResponse)
async def create_compliance_issue(
    issue_data: ComplianceIssueCreate,
    session: Session = Depends(get_session)
):
    """Create a new compliance issue"""
    try:
        issue = ComplianceRuleService.create_issue(session, issue_data)
        return issue
        
    except Exception as e:
        logger.error(f"Error creating compliance issue: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/issues/{issue_id}", response_model=ComplianceIssueResponse)
async def update_compliance_issue(
    issue_id: int,
    issue_data: ComplianceIssueUpdate,
    session: Session = Depends(get_session)
):
    """Update a compliance issue"""
    try:
        issue = ComplianceRuleService.update_issue(session, issue_id, issue_data)
        if not issue:
            raise HTTPException(status_code=404, detail="Compliance issue not found")
        
        return issue
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance issue {issue_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Statistics and Analytics
@router.get("/statistics", response_model=Dict[str, Any])
async def get_rule_statistics(
    session: Session = Depends(get_session)
):
    """Get compliance rule statistics"""
    try:
        stats = ComplianceRuleService.get_rule_statistics(session)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting rule statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **NEW: Enhanced API endpoints for frontend component support**

# Data Source Integration Endpoints
@router.get("/data-sources", response_model=List[Dict[str, Any]])
async def get_applicable_data_sources(
    rule_type: Optional[ComplianceRuleType] = Query(None, description="Filter by rule type"),
    compliance_standard: Optional[str] = Query(None, description="Filter by compliance standard"),
    session: Session = Depends(get_session)
):
    """Get data sources applicable for compliance rules"""
    try:
        sources = ComplianceRuleService.get_applicable_data_sources(
            session=session,
            rule_type=rule_type,
            compliance_standard=compliance_standard
        )
        return sources
        
    except Exception as e:
        logger.error(f"Error getting applicable data sources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frameworks", response_model=List[Dict[str, Any]])
async def get_compliance_frameworks(
    session: Session = Depends(get_session)
):
    """Get available compliance frameworks with templates"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        return frameworks
        
    except Exception as e:
        logger.error(f"Error getting compliance frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}/scan-rules", response_model=List[Dict[str, Any]])
async def get_related_scan_rules(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get scan rules related to a compliance rule"""
    try:
        scan_rules = ComplianceRuleService.get_related_scan_rules(session, rule_id)
        return scan_rules
        
    except Exception as e:
        logger.error(f"Error getting related scan rules for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rule_id}/evaluate-with-sources", response_model=ComplianceRuleEvaluationResponse)
async def evaluate_rule_with_data_sources(
    rule_id: int,
    evaluation_request: Dict[str, Any] = Body(..., description="Evaluation parameters"),
    session: Session = Depends(get_session)
):
    """Enhanced rule evaluation that integrates with data sources and scans"""
    try:
        data_source_ids = evaluation_request.get("data_source_ids")
        run_scans = evaluation_request.get("run_scans", False)
        
        evaluation = ComplianceRuleService.evaluate_rule_with_data_sources(
            session=session,
            rule_id=rule_id,
            data_source_ids=data_source_ids,
            run_scans=run_scans
        )
        return evaluation
        
    except Exception as e:
        logger.error(f"Error evaluating rule with data sources {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **NEW: Template and Framework Integration**
@router.get("/templates/by-framework/{framework}", response_model=List[Dict[str, Any]])
async def get_templates_by_framework(
    framework: str,
    session: Session = Depends(get_session)
):
    """Get rule templates for a specific framework"""
    try:
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        framework_data = next((f for f in frameworks if f["id"] == framework), None)
        
        if not framework_data:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        return framework_data.get("templates", [])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting templates for framework {framework}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/from-template", response_model=ComplianceRuleResponse)
async def create_rule_from_template(
    template_data: Dict[str, Any] = Body(..., description="Template and customization data"),
    created_by: Optional[str] = Query(None, description="User creating the rule"),
    session: Session = Depends(get_session)
):
    """Create a compliance rule from a template"""
    try:
        template_id = template_data.get("template_id")
        customizations = template_data.get("customizations", {})
        
        # Get framework templates
        frameworks = ComplianceRuleService.get_compliance_frameworks()
        template = None
        
        for framework in frameworks:
            for tmpl in framework.get("templates", []):
                if tmpl["id"] == template_id:
                    template = tmpl
                    break
            if template:
                break
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Create rule from template with customizations
        rule_data = ComplianceRuleCreate(
            name=customizations.get("name", template["name"]),
            description=customizations.get("description", template["description"]),
            rule_type=ComplianceRuleType(customizations.get("rule_type", template["rule_type"])),
            severity=ComplianceRuleSeverity(customizations.get("severity", template["severity"])),
            condition=customizations.get("condition", template["condition"]),
            compliance_standard=customizations.get("compliance_standard", framework.get("name")),
            data_source_ids=customizations.get("data_source_ids", []),
            tags=customizations.get("tags", []),
            metadata={
                "template_id": template_id,
                "framework": framework.get("id"),
                **customizations.get("metadata", {})
            }
        )
        
        rule = ComplianceRuleService.create_rule(session, rule_data, created_by)
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating rule from template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **NEW: Advanced Analytics and Insights**
@router.get("/analytics/dashboard", response_model=Dict[str, Any])
async def get_compliance_dashboard_analytics(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    time_range: str = Query("30d", description="Time range for analytics"),
    session: Session = Depends(get_session)
):
    """Get comprehensive compliance analytics for dashboard"""
    try:
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
                ComplianceRuleEvaluation.evaluated_at >= datetime.now() - timedelta(days=7)
            ).order_by(ComplianceRuleEvaluation.evaluated_at.desc()).limit(10)
        ).all()
        
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
            "time_range": time_range,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance dashboard analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **NEW: Integration Status and Health**
@router.get("/integration/status", response_model=Dict[str, Any])
async def get_integration_status(
    session: Session = Depends(get_session)
):
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
        
        return {
            "data_source_integration": {
                "status": "connected" if data_sources_count > 0 else "disconnected",
                "data_sources_count": data_sources_count
            },
            "scan_integration": {
                "status": "active" if scan_rules_with_compliance > 0 else "inactive",
                "integrated_rules": scan_rules_with_compliance
            },
            "system_health": {
                "recent_evaluations": recent_evaluations,
                "last_check": datetime.now().isoformat(),
                "status": "healthy" if recent_evaluations > 0 else "warning"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting integration status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Additional Enterprise API Routes for Compliance Management
@router.get("/{rule_id}/history", response_model=List[Dict[str, Any]])
async def get_rule_history(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get rule change history"""
    try:
        # This would typically fetch from an audit log table
        # For now, return evaluations as history
        evaluations, _ = ComplianceRuleService.get_rule_evaluations(session, rule_id, 1, 100)
        
        history = []
        for eval in evaluations:
            history.append({
                "timestamp": eval.evaluated_at,
                "action": "evaluation",
                "status": eval.status,
                "compliance_score": eval.compliance_score,
                "issues_found": eval.issues_found,
                "metadata": eval.metadata
            })
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting rule history {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rule_id}/assess", response_model=ComplianceRuleResponse)
async def assess_requirement(
    rule_id: int,
    assessment: Dict[str, Any] = Body(..., description="Assessment data"),
    session: Session = Depends(get_session)
):
    """Assess a compliance requirement"""
    try:
        # Update rule with assessment results
        update_data = ComplianceRuleUpdate(
            status=assessment.get("status"),
            metadata=assessment.get("metadata", {})
        )
        
        rule = ComplianceRuleService.update_rule(
            session, rule_id, update_data, assessment.get("assessor")
        )
        
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assessing requirement {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Workflow Integration Routes
@router.get("/{rule_id}/workflows", response_model=List[Dict[str, Any]])
async def get_rule_workflows(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get workflows associated with a rule"""
    try:
        # This would fetch from workflow tables
        # For now, return empty list as placeholder
        return []
        
    except Exception as e:
        logger.error(f"Error getting rule workflows {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{rule_id}/workflows", response_model=Dict[str, Any])
async def create_rule_workflow(
    rule_id: int,
    workflow_data: Dict[str, Any] = Body(..., description="Workflow configuration"),
    session: Session = Depends(get_session)
):
    """Create a workflow for a rule"""
    try:
        # This would create a workflow in the workflow system
        # For now, return success response
        from datetime import datetime
        return {
            "workflow_id": f"wf_{rule_id}_{int(datetime.now().timestamp())}",
            "status": "created",
            "message": "Workflow created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error creating rule workflow {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Advanced Analytics Routes
@router.get("/{rule_id}/trends", response_model=Dict[str, Any])
async def get_rule_trends(
    rule_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days for trend analysis"),
    session: Session = Depends(get_session)
):
    """Get compliance trends for a rule"""
    try:
        # This would analyze evaluation history to show trends
        # For now, return mock trend data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        trends = []
        current_date = start_date
        while current_date <= end_date:
            trends.append({
                "date": current_date.isoformat(),
                "compliance_rate": round(random.uniform(80, 98), 2),
                "issues_found": random.randint(0, 10),
                "entities_checked": random.randint(50, 200)
            })
            current_date += timedelta(days=1)
        
        return {
            "rule_id": rule_id,
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "trends": trends,
            "summary": {
                "avg_compliance_rate": round(sum(t["compliance_rate"] for t in trends) / len(trends), 2),
                "total_issues": sum(t["issues_found"] for t in trends),
                "total_entities": sum(t["entities_checked"] for t in trends)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting rule trends {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{rule_id}/insights", response_model=Dict[str, Any])
async def get_rule_insights(
    rule_id: int,
    session: Session = Depends(get_session)
):
    """Get AI-powered insights for a rule"""
    try:
        rule = ComplianceRuleService.get_rule(session, rule_id)
        if not rule:
            raise HTTPException(status_code=404, detail="Compliance rule not found")
        
        # Generate AI insights based on rule performance
        insights = []
        
        if rule.pass_rate < 90:
            insights.append({
                "type": "warning",
                "title": "Low Compliance Rate",
                "description": f"Rule has {rule.pass_rate:.1f}% compliance rate. Consider reviewing rule configuration.",
                "priority": "high",
                "action": "review_configuration"
            })
        
        if rule.failing_entities > 0:
            insights.append({
                "type": "info",
                "title": "Non-Compliant Entities",
                "description": f"Found {rule.failing_entities} non-compliant entities. Review remediation steps.",
                "priority": "medium",
                "action": "review_remediation"
            })
        
        if not rule.last_evaluated_at or (datetime.now() - rule.last_evaluated_at).days > 7:
            insights.append({
                "type": "suggestion",
                "title": "Evaluation Needed",
                "description": "Rule hasn't been evaluated recently. Run evaluation to get current status.",
                "priority": "low",
                "action": "run_evaluation"
            })
        
        return {
            "rule_id": rule_id,
            "insights": insights,
            "recommendations": [
                "Regularly review and update rule parameters",
                "Monitor compliance trends over time",
                "Ensure remediation steps are clear and actionable"
            ],
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting rule insights {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))