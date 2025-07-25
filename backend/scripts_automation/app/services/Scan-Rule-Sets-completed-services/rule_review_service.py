"""
Rule Review Service for Scan-Rule-Sets Group
===========================================

Advanced rule review and approval workflow service providing comprehensive
review management, approval processes, and collaborative feedback systems.

Features:
- Multi-stage review workflows with configurable approval processes
- Advanced review metrics and quality scoring
- AI-powered review recommendations and quality assessment
- Collaborative review sessions with real-time feedback
- Comprehensive review analytics and reporting
- Integration with version control and change management
- Advanced notification and escalation systems
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from sqlalchemy.orm import selectinload

from app.core.database import get_db_session
from app.models.Scan-Rule-Sets-completed-models.enhanced_collaboration_models import (
    RuleReview, RuleComment, ApprovalWorkflow,
    ReviewStatus, ReviewType, ApprovalStatus,
    RuleReviewRequest, RuleReviewResponse,
    RuleCommentRequest, RuleCommentResponse
)
from app.models.Scan-Rule-Sets-completed-models.rule_template_models import RuleTemplate
from app.models.Scan-Rule-Sets-completed-models.rule_version_control_models import RuleVersion
from app.core.logging_config import get_logger
from app.utils.cache import cache_result
from app.utils.rate_limiter import check_rate_limit

logger = get_logger(__name__)

class RuleReviewService:
    """
    Advanced rule review service with comprehensive review management,
    approval workflows, and collaborative feedback systems.
    """

    def __init__(self):
        self.review_metrics_cache = {}
        self.ai_review_models = {}
        self.notification_handlers = []

    # ===================== REVIEW MANAGEMENT =====================

    async def create_review(
        self,
        review_request: RuleReviewRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> RuleReviewResponse:
        """
        Create a new rule review with comprehensive workflow setup.
        """
        if db is None:
            async with get_db_session() as db:
                return await self._create_review_internal(review_request, current_user_id, db)
        return await self._create_review_internal(review_request, current_user_id, db)

    async def _create_review_internal(
        self,
        review_request: RuleReviewRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> RuleReviewResponse:
        """Internal method to create a rule review."""
        try:
            # Validate rule exists
            rule_query = select(RuleTemplate).where(RuleTemplate.id == review_request.rule_id)
            rule_result = await db.execute(rule_query)
            rule = rule_result.scalar_one_or_none()
            
            if not rule:
                raise ValueError(f"Rule with ID {review_request.rule_id} not found")

            # Create review instance
            review = RuleReview(
                rule_id=review_request.rule_id,
                review_type=review_request.review_type,
                reviewer_id=review_request.reviewer_id or current_user_id,
                requested_by=current_user_id,
                priority=review_request.priority,
                deadline=review_request.deadline,
                review_scope=review_request.review_scope,
                review_criteria=review_request.review_criteria,
                auto_assignment_enabled=review_request.auto_assignment_enabled,
                notification_settings=review_request.notification_settings,
                tags=review_request.tags,
                metadata=review_request.metadata
            )

            # Auto-assign reviewers if enabled
            if review_request.auto_assignment_enabled:
                await self._auto_assign_reviewers(review, rule, db)

            # Set up approval workflow if required
            if review_request.review_type in [ReviewType.APPROVAL_REQUIRED, ReviewType.COMPLIANCE_CHECK]:
                await self._setup_approval_workflow(review, rule, db)

            db.add(review)
            await db.commit()
            await db.refresh(review)

            # Send notifications
            await self._send_review_notifications(review, "created", db)

            logger.info(f"Created rule review {review.id} for rule {review_request.rule_id}")

            return RuleReviewResponse(
                id=review.id,
                rule_id=review.rule_id,
                review_type=review.review_type,
                status=review.status,
                reviewer_id=review.reviewer_id,
                priority=review.priority,
                progress_percentage=review.progress_percentage,
                quality_score=review.quality_score,
                created_at=review.created_at
            )

        except Exception as e:
            logger.error(f"Error creating rule review: {str(e)}")
            await db.rollback()
            raise

    async def get_review(
        self,
        review_id: uuid.UUID,
        db: AsyncSession = None
    ) -> Optional[RuleReviewResponse]:
        """Get detailed review information."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_review_internal(review_id, db)
        return await self._get_review_internal(review_id, db)

    async def _get_review_internal(
        self,
        review_id: uuid.UUID,
        db: AsyncSession
    ) -> Optional[RuleReviewResponse]:
        """Internal method to get review details."""
        try:
            query = (
                select(RuleReview)
                .options(
                    selectinload(RuleReview.comments),
                    selectinload(RuleReview.approval_workflow)
                )
                .where(RuleReview.id == review_id)
            )
            
            result = await db.execute(query)
            review = result.scalar_one_or_none()
            
            if not review:
                return None

            return RuleReviewResponse(
                id=review.id,
                rule_id=review.rule_id,
                review_type=review.review_type,
                status=review.status,
                reviewer_id=review.reviewer_id,
                priority=review.priority,
                progress_percentage=review.progress_percentage,
                quality_score=review.quality_score,
                findings=review.findings,
                recommendations=review.recommendations,
                created_at=review.created_at,
                updated_at=review.updated_at
            )

        except Exception as e:
            logger.error(f"Error getting rule review {review_id}: {str(e)}")
            raise

    async def update_review_status(
        self,
        review_id: uuid.UUID,
        new_status: ReviewStatus,
        notes: Optional[str] = None,
        current_user_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> RuleReviewResponse:
        """Update review status with comprehensive validation and notifications."""
        if db is None:
            async with get_db_session() as db:
                return await self._update_review_status_internal(
                    review_id, new_status, notes, current_user_id, db
                )
        return await self._update_review_status_internal(
            review_id, new_status, notes, current_user_id, db
        )

    async def _update_review_status_internal(
        self,
        review_id: uuid.UUID,
        new_status: ReviewStatus,
        notes: Optional[str],
        current_user_id: Optional[uuid.UUID],
        db: AsyncSession
    ) -> RuleReviewResponse:
        """Internal method to update review status."""
        try:
            # Get current review
            query = select(RuleReview).where(RuleReview.id == review_id)
            result = await db.execute(query)
            review = result.scalar_one_or_none()
            
            if not review:
                raise ValueError(f"Review with ID {review_id} not found")

            # Validate status transition
            await self._validate_status_transition(review, new_status)

            # Update review
            old_status = review.status
            review.status = new_status
            review.updated_at = datetime.utcnow()
            
            if notes:
                review.review_notes = review.review_notes or []
                review.review_notes.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "user_id": str(current_user_id) if current_user_id else None,
                    "note": notes,
                    "status_change": f"{old_status} -> {new_status}"
                })

            # Update progress based on status
            await self._update_review_progress(review)

            # Handle status-specific actions
            if new_status == ReviewStatus.APPROVED:
                await self._handle_review_approval(review, db)
            elif new_status == ReviewStatus.REJECTED:
                await self._handle_review_rejection(review, db)
            elif new_status == ReviewStatus.COMPLETED:
                await self._handle_review_completion(review, db)

            await db.commit()
            await db.refresh(review)

            # Send notifications
            await self._send_review_notifications(review, "status_updated", db)

            logger.info(f"Updated review {review_id} status to {new_status}")

            return RuleReviewResponse(
                id=review.id,
                rule_id=review.rule_id,
                review_type=review.review_type,
                status=review.status,
                reviewer_id=review.reviewer_id,
                priority=review.priority,
                progress_percentage=review.progress_percentage,
                quality_score=review.quality_score,
                created_at=review.created_at,
                updated_at=review.updated_at
            )

        except Exception as e:
            logger.error(f"Error updating review status: {str(e)}")
            await db.rollback()
            raise

    # ===================== COMMENT MANAGEMENT =====================

    async def add_comment(
        self,
        comment_request: RuleCommentRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession = None
    ) -> RuleCommentResponse:
        """Add a comment to a review with comprehensive threading and notifications."""
        if db is None:
            async with get_db_session() as db:
                return await self._add_comment_internal(comment_request, current_user_id, db)
        return await self._add_comment_internal(comment_request, current_user_id, db)

    async def _add_comment_internal(
        self,
        comment_request: RuleCommentRequest,
        current_user_id: uuid.UUID,
        db: AsyncSession
    ) -> RuleCommentResponse:
        """Internal method to add a comment."""
        try:
            # Validate review exists
            review_query = select(RuleReview).where(RuleReview.id == comment_request.review_id)
            review_result = await db.execute(review_query)
            review = review_result.scalar_one_or_none()
            
            if not review:
                raise ValueError(f"Review with ID {comment_request.review_id} not found")

            # Create comment
            comment = RuleComment(
                review_id=comment_request.review_id,
                author_id=current_user_id,
                comment_text=comment_request.comment_text,
                comment_type=comment_request.comment_type,
                parent_comment_id=comment_request.parent_comment_id,
                referenced_line=comment_request.referenced_line,
                referenced_section=comment_request.referenced_section,
                severity=comment_request.severity,
                is_resolved=False,
                attachments=comment_request.attachments,
                mentions=comment_request.mentions,
                tags=comment_request.tags,
                metadata=comment_request.metadata
            )

            db.add(comment)
            await db.commit()
            await db.refresh(comment)

            # Update review activity
            await self._update_review_activity(review, "comment_added", db)

            # Send notifications for mentions
            if comment_request.mentions:
                await self._send_mention_notifications(comment, db)

            logger.info(f"Added comment {comment.id} to review {comment_request.review_id}")

            return RuleCommentResponse(
                id=comment.id,
                review_id=comment.review_id,
                author_id=comment.author_id,
                comment_text=comment.comment_text,
                comment_type=comment.comment_type,
                severity=comment.severity,
                is_resolved=comment.is_resolved,
                created_at=comment.created_at
            )

        except Exception as e:
            logger.error(f"Error adding comment: {str(e)}")
            await db.rollback()
            raise

    async def resolve_comment(
        self,
        comment_id: uuid.UUID,
        resolution_notes: Optional[str] = None,
        current_user_id: Optional[uuid.UUID] = None,
        db: AsyncSession = None
    ) -> RuleCommentResponse:
        """Resolve a comment with comprehensive tracking."""
        if db is None:
            async with get_db_session() as db:
                return await self._resolve_comment_internal(
                    comment_id, resolution_notes, current_user_id, db
                )
        return await self._resolve_comment_internal(
            comment_id, resolution_notes, current_user_id, db
        )

    # ===================== REVIEW ANALYTICS =====================

    @cache_result(expire_time=300)  # 5 minutes
    async def get_review_metrics(
        self,
        rule_id: Optional[uuid.UUID] = None,
        reviewer_id: Optional[uuid.UUID] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Get comprehensive review metrics and analytics."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_review_metrics_internal(
                    rule_id, reviewer_id, date_range, db
                )
        return await self._get_review_metrics_internal(
            rule_id, reviewer_id, date_range, db
        )

    async def _get_review_metrics_internal(
        self,
        rule_id: Optional[uuid.UUID],
        reviewer_id: Optional[uuid.UUID],
        date_range: Optional[Tuple[datetime, datetime]],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method to get review metrics."""
        try:
            # Build base query
            query = select(RuleReview)
            
            if rule_id:
                query = query.where(RuleReview.rule_id == rule_id)
            if reviewer_id:
                query = query.where(RuleReview.reviewer_id == reviewer_id)
            if date_range:
                start_date, end_date = date_range
                query = query.where(
                    and_(
                        RuleReview.created_at >= start_date,
                        RuleReview.created_at <= end_date
                    )
                )

            # Execute query
            result = await db.execute(query)
            reviews = result.scalars().all()

            # Calculate metrics
            total_reviews = len(reviews)
            completed_reviews = len([r for r in reviews if r.status == ReviewStatus.COMPLETED])
            approved_reviews = len([r for r in reviews if r.status == ReviewStatus.APPROVED])
            rejected_reviews = len([r for r in reviews if r.status == ReviewStatus.REJECTED])
            
            avg_review_time = 0
            avg_quality_score = 0
            
            if reviews:
                completed = [r for r in reviews if r.completed_at]
                if completed:
                    total_time = sum(
                        (r.completed_at - r.created_at).total_seconds() / 3600
                        for r in completed
                    )
                    avg_review_time = total_time / len(completed)
                
                quality_scores = [r.quality_score for r in reviews if r.quality_score]
                if quality_scores:
                    avg_quality_score = sum(quality_scores) / len(quality_scores)

            # Review type distribution
            type_distribution = {}
            for review in reviews:
                review_type = review.review_type.value
                type_distribution[review_type] = type_distribution.get(review_type, 0) + 1

            # Priority distribution
            priority_distribution = {}
            for review in reviews:
                priority = review.priority.value
                priority_distribution[priority] = priority_distribution.get(priority, 0) + 1

            return {
                "total_reviews": total_reviews,
                "completed_reviews": completed_reviews,
                "approved_reviews": approved_reviews,
                "rejected_reviews": rejected_reviews,
                "completion_rate": completed_reviews / total_reviews if total_reviews > 0 else 0,
                "approval_rate": approved_reviews / completed_reviews if completed_reviews > 0 else 0,
                "avg_review_time_hours": avg_review_time,
                "avg_quality_score": avg_quality_score,
                "type_distribution": type_distribution,
                "priority_distribution": priority_distribution,
                "calculated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error calculating review metrics: {str(e)}")
            raise

    # ===================== AI-POWERED FEATURES =====================

    async def get_ai_review_recommendations(
        self,
        rule_id: uuid.UUID,
        review_type: ReviewType,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Get AI-powered review recommendations based on rule analysis."""
        if db is None:
            async with get_db_session() as db:
                return await self._get_ai_review_recommendations_internal(
                    rule_id, review_type, db
                )
        return await self._get_ai_review_recommendations_internal(
            rule_id, review_type, db
        )

    async def _get_ai_review_recommendations_internal(
        self,
        rule_id: uuid.UUID,
        review_type: ReviewType,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Internal method for AI review recommendations."""
        try:
            # Get rule details
            rule_query = select(RuleTemplate).where(RuleTemplate.id == rule_id)
            rule_result = await db.execute(rule_query)
            rule = rule_result.scalar_one_or_none()
            
            if not rule:
                raise ValueError(f"Rule with ID {rule_id} not found")

            # Get historical review data
            history_query = (
                select(RuleReview)
                .where(
                    and_(
                        RuleReview.rule_id == rule_id,
                        RuleReview.status.in_([ReviewStatus.COMPLETED, ReviewStatus.APPROVED])
                    )
                )
                .order_by(desc(RuleReview.created_at))
                .limit(10)
            )
            
            history_result = await db.execute(history_query)
            historical_reviews = history_result.scalars().all()

            # AI analysis would go here - using mock logic for now
            recommendations = {
                "suggested_reviewers": await self._suggest_reviewers(rule, review_type, db),
                "estimated_review_time": await self._estimate_review_time(rule, review_type, historical_reviews),
                "complexity_score": await self._calculate_complexity_score(rule),
                "focus_areas": await self._identify_focus_areas(rule, review_type),
                "similar_rules": await self._find_similar_rules(rule, db),
                "potential_issues": await self._predict_potential_issues(rule, historical_reviews),
                "quality_checklist": await self._generate_quality_checklist(rule, review_type)
            }

            return recommendations

        except Exception as e:
            logger.error(f"Error getting AI review recommendations: {str(e)}")
            raise

    # ===================== HELPER METHODS =====================

    async def _auto_assign_reviewers(
        self,
        review: RuleReview,
        rule: RuleTemplate,
        db: AsyncSession
    ) -> None:
        """Auto-assign reviewers based on expertise and availability."""
        # Implementation for auto-assignment logic
        pass

    async def _setup_approval_workflow(
        self,
        review: RuleReview,
        rule: RuleTemplate,
        db: AsyncSession
    ) -> None:
        """Set up approval workflow for the review."""
        # Implementation for approval workflow setup
        pass

    async def _validate_status_transition(
        self,
        review: RuleReview,
        new_status: ReviewStatus
    ) -> None:
        """Validate if status transition is allowed."""
        # Implementation for status transition validation
        pass

    async def _update_review_progress(self, review: RuleReview) -> None:
        """Update review progress percentage based on status and completion."""
        status_progress = {
            ReviewStatus.PENDING: 0,
            ReviewStatus.IN_PROGRESS: 25,
            ReviewStatus.REVIEW_REQUIRED: 50,
            ReviewStatus.REVISION_NEEDED: 40,
            ReviewStatus.APPROVED: 100,
            ReviewStatus.REJECTED: 100,
            ReviewStatus.COMPLETED: 100,
            ReviewStatus.CANCELLED: 0
        }
        
        review.progress_percentage = status_progress.get(review.status, 0)

    async def _send_review_notifications(
        self,
        review: RuleReview,
        event_type: str,
        db: AsyncSession
    ) -> None:
        """Send review notifications to relevant stakeholders."""
        # Implementation for notification sending
        pass

    async def _suggest_reviewers(
        self,
        rule: RuleTemplate,
        review_type: ReviewType,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Suggest optimal reviewers based on expertise and availability."""
        # Mock implementation
        return [
            {
                "user_id": str(uuid.uuid4()),
                "expertise_score": 0.85,
                "availability_score": 0.92,
                "overall_score": 0.88
            }
        ]

    async def _estimate_review_time(
        self,
        rule: RuleTemplate,
        review_type: ReviewType,
        historical_reviews: List[RuleReview]
    ) -> Dict[str, Any]:
        """Estimate review time based on complexity and historical data."""
        # Mock implementation
        return {
            "estimated_hours": 4.5,
            "confidence": 0.78,
            "factors": ["rule_complexity", "review_type", "historical_average"]
        }

    async def _calculate_complexity_score(self, rule: RuleTemplate) -> float:
        """Calculate rule complexity score for review estimation."""
        # Mock implementation
        return 0.65