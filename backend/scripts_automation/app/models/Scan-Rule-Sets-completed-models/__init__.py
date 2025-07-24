"""
Scan-Rule-Sets Completed Models Package

This package contains all the advanced models for the scan-rule-sets group,
including rule execution, AI pattern detection, orchestration, templates,
version control, collaboration, and analytics.
"""

# Import all models for easy access
from .rule_execution_models import (
    RuleExecutionWorkflow, RuleExecutionInstance, ExecutionStep,
    ResourceAllocation, ExecutionPerformanceMetric,
    WorkflowExecutionRequest, WorkflowExecutionResponse,
    ExecutionStatusUpdate, ResourceAllocationRequest,
    PerformanceMetricRecord, WorkflowExecutionSummary
)

from .ai_pattern_models import (
    PatternLibrary, PatternDetectionResult, PatternValidation,
    SemanticAnalysis, ContextualAnalysis, IntelligentRecommendation,
    AIModelRegistry, PatternDetectionRequest, PatternDetectionResponse,
    SemanticAnalysisRequest, RecommendationRequest, ModelPerformanceUpdate
)

from .orchestration_models import (
    OrchestrationJob, JobExecution, ExecutionStep as OrchestrationExecutionStep,
    JobDependency, OrchestrationResource, OrchestrationResourceAllocation,
    WorkflowTemplate, OrchestrationJobRequest, OrchestrationJobResponse,
    JobExecutionRequest, JobExecutionStatusResponse, OrchestrationMetrics
)

from .rule_template_models import (
    RuleTemplate, TemplateCategory, TemplateVersion, TemplateUsage,
    TemplateReview, TemplateAnalytics, TemplateCreationRequest,
    TemplateUsageRequest, TemplateReviewRequest
)

from .rule_version_control_models import (
    RuleVersion, RuleBranch, RuleChange, MergeRequest,
    MergeRequestReview, VersionComparison, VersionCreationRequest,
    BranchCreationRequest, MergeRequestCreationRequest
)

from .enhanced_collaboration_models import (
    TeamCollaborationHub, TeamMember, RuleReview, Comment,
    KnowledgeItem, Discussion, CollaborationHubCreationRequest,
    ReviewCreationRequest, CommentCreationRequest
)

from .analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceIntegration,
    PerformanceAlert, AnalyticsRequest, ReportGenerationRequest,
    AlertCreationRequest
)

__all__ = [
    # Rule Execution Models
    "RuleExecutionWorkflow", "RuleExecutionInstance", "ExecutionStep",
    "ResourceAllocation", "ExecutionPerformanceMetric",
    "WorkflowExecutionRequest", "WorkflowExecutionResponse",
    "ExecutionStatusUpdate", "ResourceAllocationRequest",
    "PerformanceMetricRecord", "WorkflowExecutionSummary",
    
    # AI Pattern Models
    "PatternLibrary", "PatternDetectionResult", "PatternValidation",
    "SemanticAnalysis", "ContextualAnalysis", "IntelligentRecommendation",
    "AIModelRegistry", "PatternDetectionRequest", "PatternDetectionResponse",
    "SemanticAnalysisRequest", "RecommendationRequest", "ModelPerformanceUpdate",
    
    # Orchestration Models
    "OrchestrationJob", "JobExecution", "OrchestrationExecutionStep",
    "JobDependency", "OrchestrationResource", "OrchestrationResourceAllocation",
    "WorkflowTemplate", "OrchestrationJobRequest", "OrchestrationJobResponse",
    "JobExecutionRequest", "JobExecutionStatusResponse", "OrchestrationMetrics",
    
    # Template Models
    "RuleTemplate", "TemplateCategory", "TemplateVersion", "TemplateUsage",
    "TemplateReview", "TemplateAnalytics", "TemplateCreationRequest",
    "TemplateUsageRequest", "TemplateReviewRequest",
    
    # Version Control Models
    "RuleVersion", "RuleBranch", "RuleChange", "MergeRequest",
    "MergeRequestReview", "VersionComparison", "VersionCreationRequest",
    "BranchCreationRequest", "MergeRequestCreationRequest",
    
    # Collaboration Models
    "TeamCollaborationHub", "TeamMember", "RuleReview", "Comment",
    "KnowledgeItem", "Discussion", "CollaborationHubCreationRequest",
    "ReviewCreationRequest", "CommentCreationRequest",
    
    # Analytics Models
    "UsageAnalytics", "TrendAnalysis", "ROIMetrics", "ComplianceIntegration",
    "PerformanceAlert", "AnalyticsRequest", "ReportGenerationRequest",
    "AlertCreationRequest"
]