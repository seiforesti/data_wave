"""
Scan-Rule-Sets Completed Models Package

This package contains all the advanced models for the scan-rule-sets group,
including rule templates, version control, enhanced collaboration, and analytics.
"""

# Import all models for easy access
from .rule_template_models import (
    RuleTemplate, TemplateCategory, TemplateVersion, TemplateUsage,
    TemplateReview, TemplateCreationRequest, TemplateUpdateRequest,
    TemplateResponse, TemplateUsageResponse, TemplateReviewResponse,
    TemplateVersionResponse, TemplateCategoryResponse
)

from .rule_version_control_models import (
    RuleVersion, RuleHistory, RuleBranch, RuleMergeRequest,
    RuleComparison, VersionCreationRequest, BranchCreationRequest,
    MergeRequestCreationRequest, VersionResponse, BranchResponse,
    MergeRequestResponse, ComparisonResponse
)

from .enhanced_collaboration_models import (
    RuleReview, RuleComment, ApprovalWorkflow, KnowledgeBase,
    ExpertConsultation, RuleReviewRequest, RuleCommentRequest,
    ApprovalWorkflowRequest, KnowledgeBaseRequest, ExpertConsultationRequest,
    RuleReviewResponse, RuleCommentResponse, ApprovalWorkflowResponse,
    KnowledgeBaseResponse, ExpertConsultationResponse
)

from .analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceIntegration,
    UsageAnalyticsCreate, UsageAnalyticsResponse, TrendAnalysisCreate,
    TrendAnalysisResponse, ROIMetricsCreate, ROIMetricsResponse,
    ComplianceIntegrationCreate, ComplianceIntegrationResponse,
    AnalyticsSummary, ROIDashboard, ComplianceDashboard
)

__all__ = [
    # Template Models
    "RuleTemplate", "TemplateCategory", "TemplateVersion", "TemplateUsage",
    "TemplateReview", "TemplateCreationRequest", "TemplateUpdateRequest",
    "TemplateResponse", "TemplateUsageResponse", "TemplateReviewResponse",
    "TemplateVersionResponse", "TemplateCategoryResponse",
    
    # Version Control Models
    "RuleVersion", "RuleHistory", "RuleBranch", "RuleMergeRequest",
    "RuleComparison", "VersionCreationRequest", "BranchCreationRequest",
    "MergeRequestCreationRequest", "VersionResponse", "BranchResponse",
    "MergeRequestResponse", "ComparisonResponse",
    
    # Collaboration Models
    "RuleReview", "RuleComment", "ApprovalWorkflow", "KnowledgeBase",
    "ExpertConsultation", "RuleReviewRequest", "RuleCommentRequest",
    "ApprovalWorkflowRequest", "KnowledgeBaseRequest", "ExpertConsultationRequest",
    "RuleReviewResponse", "RuleCommentResponse", "ApprovalWorkflowResponse",
    "KnowledgeBaseResponse", "ExpertConsultationResponse",
    
    # Analytics Models
    "UsageAnalytics", "TrendAnalysis", "ROIMetrics", "ComplianceIntegration",
    "UsageAnalyticsCreate", "UsageAnalyticsResponse", "TrendAnalysisCreate",
    "TrendAnalysisResponse", "ROIMetricsCreate", "ROIMetricsResponse",
    "ComplianceIntegrationCreate", "ComplianceIntegrationResponse",
    "AnalyticsSummary", "ROIDashboard", "ComplianceDashboard"
]