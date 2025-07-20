from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging
import uuid
import json
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

logger = logging.getLogger(__name__)


class ComplianceRuleService:
    """Service layer for compliance rule management"""
    
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
        """Get compliance rules with filtering and pagination"""
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
        """Create a new compliance rule"""
        try:
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
            if rule.evaluations or rule.issues or rule.workflows:
                logger.warning(f"Cannot delete rule {rule_id}: has dependencies")
                return False
            
            session.delete(rule)
            session.commit()
            
            logger.info(f"Deleted compliance rule: {rule.name} (ID: {rule.id})")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting compliance rule {rule_id}: {str(e)}")
            raise
    
    @staticmethod
    def evaluate_rule(
        session: Session, 
        rule_id: int, 
        context: Optional[Dict[str, Any]] = None
    ) -> ComplianceRuleEvaluationResponse:
        """Evaluate a compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                raise ValueError(f"Rule {rule_id} not found")
            
            # Generate evaluation ID
            evaluation_id = f"eval_{rule_id}_{int(datetime.now().timestamp())}"
            
            # Simulate rule evaluation (in production, this would execute the actual rule)
            start_time = datetime.now()
            
            # Mock evaluation results
            entity_count = {
                "total": 100,
                "compliant": 85,
                "non_compliant": 10,
                "error": 3,
                "not_applicable": 2
            }
            
            compliance_score = (entity_count["compliant"] / entity_count["total"]) * 100
            status = RuleValidationStatus.COMPLIANT if compliance_score >= 90 else RuleValidationStatus.NON_COMPLIANT
            
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Create evaluation record
            evaluation = ComplianceRuleEvaluation(
                rule_id=rule_id,
                evaluation_id=evaluation_id,
                status=status,
                entity_count=entity_count,
                compliance_score=compliance_score,
                issues_found=entity_count["non_compliant"],
                execution_time_ms=execution_time,
                entities_processed=entity_count["total"],
                evaluation_context=context or {},
                metadata={"rule_version": rule.version}
            )
            
            session.add(evaluation)
            
            # Update rule metrics
            rule.last_evaluated_at = datetime.now()
            rule.pass_rate = compliance_score
            rule.total_entities = entity_count["total"]
            rule.passing_entities = entity_count["compliant"]
            rule.failing_entities = entity_count["non_compliant"]
            
            # Set next evaluation time based on frequency
            if rule.validation_frequency == "daily":
                rule.next_evaluation_at = datetime.now() + timedelta(days=1)
            elif rule.validation_frequency == "weekly":
                rule.next_evaluation_at = datetime.now() + timedelta(weeks=1)
            elif rule.validation_frequency == "monthly":
                rule.next_evaluation_at = datetime.now() + timedelta(days=30)
            
            session.add(rule)
            session.commit()
            session.refresh(evaluation)
            
            logger.info(f"Evaluated rule {rule_id}: {compliance_score:.1f}% compliance")
            return ComplianceRuleEvaluationResponse.from_orm(evaluation)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error evaluating rule {rule_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_rule_evaluations(
        session: Session, 
        rule_id: int,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[ComplianceRuleEvaluationResponse], int]:
        """Get evaluation history for a rule"""
        try:
            query = select(ComplianceRuleEvaluation).where(
                ComplianceRuleEvaluation.rule_id == rule_id
            ).order_by(ComplianceRuleEvaluation.evaluated_at.desc())
            
            # Get total count
            count_query = select(func.count(ComplianceRuleEvaluation.id)).where(
                ComplianceRuleEvaluation.rule_id == rule_id
            )
            total = session.exec(count_query).one()
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            evaluations = session.exec(query).all()
            
            return [ComplianceRuleEvaluationResponse.from_orm(eval) for eval in evaluations], total
            
        except Exception as e:
            logger.error(f"Error getting evaluations for rule {rule_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_rule_issues(
        session: Session,
        rule_id: Optional[int] = None,
        status: Optional[str] = None,
        severity: Optional[ComplianceRuleSeverity] = None,
        assigned_to: Optional[str] = None,
        data_source_id: Optional[int] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[ComplianceIssueResponse], int]:
        """Get compliance issues"""
        try:
            query = select(ComplianceIssue)
            filters = []
            
            if rule_id:
                filters.append(ComplianceIssue.rule_id == rule_id)
            
            if status:
                filters.append(ComplianceIssue.status == status)
            
            if severity:
                filters.append(ComplianceIssue.severity == severity)
            
            if assigned_to:
                filters.append(ComplianceIssue.assigned_to == assigned_to)
            
            if data_source_id:
                filters.append(ComplianceIssue.data_source_id == data_source_id)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(ComplianceIssue.id)).where(and_(*filters)) if filters else select(func.count(ComplianceIssue.id))
            total = session.exec(count_query).one()
            
            # Apply pagination and sorting
            offset = (page - 1) * limit
            query = query.order_by(ComplianceIssue.created_at.desc()).offset(offset).limit(limit)
            
            issues = session.exec(query).all()
            
            return [ComplianceIssueResponse.from_orm(issue) for issue in issues], total
            
        except Exception as e:
            logger.error(f"Error getting compliance issues: {str(e)}")
            raise
    
    @staticmethod
    def create_issue(session: Session, issue_data: ComplianceIssueCreate) -> ComplianceIssueResponse:
        """Create a new compliance issue"""
        try:
            issue = ComplianceIssue(**issue_data.dict())
            
            session.add(issue)
            session.commit()
            session.refresh(issue)
            
            logger.info(f"Created compliance issue: {issue.title} (ID: {issue.id})")
            return ComplianceIssueResponse.from_orm(issue)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating compliance issue: {str(e)}")
            raise
    
    @staticmethod
    def update_issue(
        session: Session, 
        issue_id: int, 
        issue_data: ComplianceIssueUpdate
    ) -> Optional[ComplianceIssueResponse]:
        """Update a compliance issue"""
        try:
            issue = session.get(ComplianceIssue, issue_id)
            if not issue:
                return None
            
            # Update fields
            update_data = issue_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(issue, field, value)
            
            issue.updated_at = datetime.now()
            
            # Set resolved timestamp if status changed to resolved
            if issue_data.status == "resolved" and issue.status != "resolved":
                issue.resolved_at = datetime.now()
            
            session.add(issue)
            session.commit()
            session.refresh(issue)
            
            logger.info(f"Updated compliance issue: {issue.title} (ID: {issue.id})")
            return ComplianceIssueResponse.from_orm(issue)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating compliance issue {issue_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_rule_templates(session: Session) -> List[Dict[str, Any]]:
        """Get available rule templates"""
        try:
            query = select(ComplianceRuleTemplate).order_by(ComplianceRuleTemplate.name)
            templates = session.exec(query).all()
            
            return [
                {
                    "id": template.id,
                    "name": template.name,
                    "description": template.description,
                    "rule_type": template.rule_type,
                    "severity": template.severity,
                    "scope": template.scope,
                    "entity_types": template.entity_types,
                    "condition_template": template.condition_template,
                    "parameter_definitions": template.parameter_definitions,
                    "default_parameters": template.default_parameters,
                    "remediation_template": template.remediation_template,
                    "reference_url": template.reference_url,
                    "category": template.category,
                    "is_built_in": template.is_built_in
                }
                for template in templates
            ]
            
        except Exception as e:
            logger.error(f"Error getting rule templates: {str(e)}")
            raise
    
    @staticmethod
    def test_rule(session: Session, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test a compliance rule configuration"""
        try:
            # Simulate rule testing
            # In production, this would validate the rule syntax and run a test evaluation
            
            results = {
                "success": True,
                "results": {
                    "syntax_valid": True,
                    "test_entities": 10,
                    "matched_entities": 3,
                    "execution_time_ms": 150
                },
                "errors": [],
                "warnings": []
            }
            
            # Basic validation
            required_fields = ["name", "condition", "rule_type", "severity"]
            for field in required_fields:
                if field not in rule_data or not rule_data[field]:
                    results["success"] = False
                    results["errors"].append(f"Missing required field: {field}")
            
            # Validate condition syntax
            try:
                condition = rule_data.get("condition", "")
                if condition:
                    # Basic JSON validation
                    if condition.startswith("{"):
                        json.loads(condition)
            except json.JSONDecodeError:
                results["success"] = False
                results["errors"].append("Invalid condition syntax: must be valid JSON")
            
            logger.info(f"Tested rule configuration: {results['success']}")
            return results
            
        except Exception as e:
            logger.error(f"Error testing rule: {str(e)}")
            return {
                "success": False,
                "results": {},
                "errors": [str(e)]
            }
    
    @staticmethod
    def validate_rule(session: Session, rule_id: int) -> Dict[str, Any]:
        """Validate a compliance rule"""
        try:
            rule = session.get(ComplianceRule, rule_id)
            if not rule:
                return {
                    "valid": False,
                    "issues": ["Rule not found"],
                    "recommendations": []
                }
            
            issues = []
            recommendations = []
            
            # Check rule configuration
            if not rule.condition:
                issues.append("Rule condition is empty")
            
            if rule.status == ComplianceRuleStatus.DRAFT:
                recommendations.append("Activate the rule to start compliance monitoring")
            
            if not rule.remediation_steps:
                recommendations.append("Add remediation steps to help resolve compliance issues")
            
            if rule.validation_frequency == "daily" and rule.scope == ComplianceRuleScope.GLOBAL:
                recommendations.append("Consider reducing validation frequency for global rules to improve performance")
            
            # Check recent evaluation results
            if rule.last_evaluated_at:
                days_since_eval = (datetime.now() - rule.last_evaluated_at).days
                if days_since_eval > 7:
                    recommendations.append("Rule hasn't been evaluated recently - consider running an evaluation")
            
            return {
                "valid": len(issues) == 0,
                "issues": issues,
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error validating rule {rule_id}: {str(e)}")
            return {
                "valid": False,
                "issues": [str(e)],
                "recommendations": []
            }
    
    @staticmethod
    def get_rule_statistics(session: Session) -> Dict[str, Any]:
        """Get compliance rule statistics"""
        try:
            # Total rules by status
            status_stats = {}
            for status in ComplianceRuleStatus:
                count = session.exec(
                    select(func.count(ComplianceRule.id)).where(ComplianceRule.status == status)
                ).one()
                status_stats[status.value] = count
            
            # Rules by type
            type_stats = {}
            for rule_type in ComplianceRuleType:
                count = session.exec(
                    select(func.count(ComplianceRule.id)).where(ComplianceRule.rule_type == rule_type)
                ).one()
                type_stats[rule_type.value] = count
            
            # Rules by severity
            severity_stats = {}
            for severity in ComplianceRuleSeverity:
                count = session.exec(
                    select(func.count(ComplianceRule.id)).where(ComplianceRule.severity == severity)
                ).one()
                severity_stats[severity.value] = count
            
            # Overall compliance rate
            total_rules = session.exec(select(func.count(ComplianceRule.id))).one()
            if total_rules > 0:
                avg_pass_rate = session.exec(
                    select(func.avg(ComplianceRule.pass_rate)).where(ComplianceRule.status == ComplianceRuleStatus.ACTIVE)
                ).one() or 0
            else:
                avg_pass_rate = 0
            
            # Recent evaluations
            recent_evaluations = session.exec(
                select(func.count(ComplianceRuleEvaluation.id)).where(
                    ComplianceRuleEvaluation.evaluated_at >= datetime.now() - timedelta(days=7)
                )
            ).one()
            
            # Open issues
            open_issues = session.exec(
                select(func.count(ComplianceIssue.id)).where(
                    ComplianceIssue.status.in_(["open", "in_progress"])
                )
            ).one()
            
            return {
                "total_rules": total_rules,
                "status_distribution": status_stats,
                "type_distribution": type_stats,
                "severity_distribution": severity_stats,
                "overall_compliance_rate": round(avg_pass_rate, 2),
                "recent_evaluations": recent_evaluations,
                "open_issues": open_issues,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting rule statistics: {str(e)}")
            raise
    
    @staticmethod
    def bulk_update_rules(
        session: Session, 
        updates: List[Dict[str, Any]], 
        updated_by: Optional[str] = None
    ) -> List[ComplianceRuleResponse]:
        """Bulk update multiple compliance rules"""
        try:
            updated_rules = []
            
            for update in updates:
                rule_id = update.get("id")
                if not rule_id:
                    continue
                
                rule = session.get(ComplianceRule, rule_id)
                if not rule:
                    continue
                
                # Apply updates
                update_data = update.get("data", {})
                for field, value in update_data.items():
                    if hasattr(rule, field):
                        setattr(rule, field, value)
                
                rule.updated_by = updated_by
                rule.updated_at = datetime.now()
                rule.version += 1
                
                session.add(rule)
                updated_rules.append(rule)
            
            session.commit()
            
            for rule in updated_rules:
                session.refresh(rule)
            
            logger.info(f"Bulk updated {len(updated_rules)} compliance rules")
            return [ComplianceRuleResponse.from_orm(rule) for rule in updated_rules]
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error bulk updating rules: {str(e)}")
            raise
    
    @staticmethod
    def get_compliance_frameworks(session: Session) -> List[Dict[str, Any]]:
        """Get available compliance frameworks"""
        try:
            # Get unique compliance standards from rules
            frameworks = session.exec(
                select(ComplianceRule.compliance_standard).where(
                    ComplianceRule.compliance_standard.isnot(None)
                ).distinct()
            ).all()
            
            framework_data = []
            for framework in frameworks:
                if framework:
                    # Get rule count for this framework
                    rule_count = session.exec(
                        select(func.count(ComplianceRule.id)).where(
                            ComplianceRule.compliance_standard == framework
                        )
                    ).one()
                    
                    # Get compliance rate
                    avg_compliance = session.exec(
                        select(func.avg(ComplianceRule.pass_rate)).where(
                            and_(
                                ComplianceRule.compliance_standard == framework,
                                ComplianceRule.status == ComplianceRuleStatus.ACTIVE
                            )
                        )
                    ).one() or 0
                    
                    framework_data.append({
                        "name": framework,
                        "rule_count": rule_count,
                        "compliance_rate": round(avg_compliance, 2),
                        "description": f"Compliance framework: {framework}"
                    })
            
            return sorted(framework_data, key=lambda x: x["name"])
            
        except Exception as e:
            logger.error(f"Error getting compliance frameworks: {str(e)}")
            raise