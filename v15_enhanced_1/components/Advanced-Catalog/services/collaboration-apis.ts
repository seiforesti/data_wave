/**
 * Collaboration APIs - Advanced Team Collaboration System
 * =======================================================
 * 
 * Complete mapping to backend collaboration services:
 * - enterprise_catalog_service.py (collaboration features)
 * - enhanced_collaboration_service.py (from other groups)
 * - knowledge_management_service.py (shared knowledge features)
 * - enterprise_integration_service.py (collaboration coordination)
 * 
 * This service provides comprehensive collaboration features:
 * - Team-based data stewardship workflows
 * - Real-time annotations and documentation
 * - Review and approval processes
 * - Crowdsourced data improvements
 * - Expert networking and consultation
 * - Knowledge sharing platform
 * - Community-driven governance
 * - Cross-functional collaboration tools
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  CollaborationHub,
  DataStewardshipWorkflow,
  AssetAnnotation,
  ReviewWorkflow,
  CrowdsourcingProject,
  ExpertProfile,
  KnowledgeArticle,
  CommunityDiscussion,
  CollaborationMetrics,
  TeamCollaboration,
  StewardshipTask,
  ReviewRequest,
  AnnotationThread,
  ExpertConsultation,
  KnowledgeBase,
  CollaborationInsight,
  CollaborationRequest,
  StewardshipRequest,
  AnnotationRequest,
  ReviewSubmission,
  ExpertRequest,
  KnowledgeRequest,
  CommunityForumPost,
  CollaborationAnalytics
} from '../types/collaboration.types';

/**
 * ==============================================
 * TEAM COLLABORATION HUB
 * ==============================================
 */

export class TeamCollaborationAPI {
  /**
   * Create team collaboration workspace
   * Maps to: Team collaboration hub management
   */
  static async createCollaborationHub(hubConfig: CollaborationRequest): Promise<CollaborationHub> {
    return apiClient.post('/api/catalog/collaboration/hubs', hubConfig);
  }

  /**
   * Get team collaboration hubs
   * Maps to: Collaboration hub retrieval
   */
  static async getCollaborationHubs(teamId?: string, projectId?: string): Promise<CollaborationHub[]> {
    return apiClient.get('/api/catalog/collaboration/hubs', {
      params: { team_id: teamId, project_id: projectId }
    });
  }

  /**
   * Update collaboration hub
   * Maps to: Hub configuration updates
   */
  static async updateCollaborationHub(hubId: string, updates: Partial<CollaborationHub>): Promise<CollaborationHub> {
    return apiClient.put(`/api/catalog/collaboration/hubs/${hubId}`, updates);
  }

  /**
   * Add team members to collaboration hub
   * Maps to: Team member management
   */
  static async addTeamMembers(hubId: string, memberIds: string[], roles?: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/hubs/${hubId}/members`, {
      member_ids: memberIds,
      roles
    });
  }

  /**
   * Remove team members from collaboration hub
   * Maps to: Team member removal
   */
  static async removeTeamMembers(hubId: string, memberIds: string[]): Promise<any> {
    return apiClient.delete(`/api/catalog/collaboration/hubs/${hubId}/members`, {
      data: { member_ids: memberIds }
    });
  }

  /**
   * Get collaboration activities and timeline
   * Maps to: Activity tracking and timeline
   */
  static async getCollaborationActivities(hubId: string, timeframe?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/collaboration/hubs/${hubId}/activities`, {
      params: { timeframe }
    });
  }

  /**
   * Set collaboration permissions and access control
   * Maps to: Permission management
   */
  static async setCollaborationPermissions(hubId: string, permissions: any): Promise<any> {
    return apiClient.put(`/api/catalog/collaboration/hubs/${hubId}/permissions`, permissions);
  }

  /**
   * Get team collaboration metrics
   * Maps to: Collaboration analytics
   */
  static async getTeamCollaborationMetrics(teamId: string, timeframe?: string): Promise<CollaborationMetrics> {
    return apiClient.get(`/api/catalog/collaboration/teams/${teamId}/metrics`, {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * DATA STEWARDSHIP CENTER
 * ==============================================
 */

export class DataStewardshipAPI {
  /**
   * Create data stewardship workflow
   * Maps to: Stewardship workflow management
   */
  static async createStewardshipWorkflow(workflow: StewardshipRequest): Promise<DataStewardshipWorkflow> {
    return apiClient.post('/api/catalog/collaboration/stewardship/workflows', workflow);
  }

  /**
   * Get stewardship workflows
   * Maps to: Workflow retrieval and filtering
   */
  static async getStewardshipWorkflows(filters?: any): Promise<DataStewardshipWorkflow[]> {
    return apiClient.get('/api/catalog/collaboration/stewardship/workflows', { params: filters });
  }

  /**
   * Assign stewardship tasks
   * Maps to: Task assignment and management
   */
  static async assignStewardshipTask(taskConfig: any): Promise<StewardshipTask> {
    return apiClient.post('/api/catalog/collaboration/stewardship/tasks', taskConfig);
  }

  /**
   * Get stewardship tasks for user
   * Maps to: Personal task management
   */
  static async getMyStewardshipTasks(userId: string, status?: string): Promise<StewardshipTask[]> {
    return apiClient.get(`/api/catalog/collaboration/stewardship/tasks/user/${userId}`, {
      params: { status }
    });
  }

  /**
   * Update stewardship task status
   * Maps to: Task status management
   */
  static async updateTaskStatus(taskId: string, status: string, notes?: string): Promise<StewardshipTask> {
    return apiClient.put(`/api/catalog/collaboration/stewardship/tasks/${taskId}/status`, {
      status,
      notes
    });
  }

  /**
   * Get stewardship dashboard
   * Maps to: Stewardship overview and metrics
   */
  static async getStewardshipDashboard(stewardId?: string): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/stewardship/dashboard', {
      params: { steward_id: stewardId }
    });
  }

  /**
   * Escalate stewardship issues
   * Maps to: Issue escalation workflow
   */
  static async escalateStewardshipIssue(taskId: string, escalationReason: string, toUserId?: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/stewardship/tasks/${taskId}/escalate`, {
      escalation_reason: escalationReason,
      to_user_id: toUserId
    });
  }

  /**
   * Generate stewardship reports
   * Maps to: Stewardship reporting and analytics
   */
  static async generateStewardshipReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/collaboration/stewardship/reports', reportConfig);
  }
}

/**
 * ==============================================
 * ANNOTATION MANAGER
 * ==============================================
 */

export class AnnotationAPI {
  /**
   * Create asset annotation
   * Maps to: Annotation creation and management
   */
  static async createAnnotation(annotation: AnnotationRequest): Promise<AssetAnnotation> {
    return apiClient.post('/api/catalog/collaboration/annotations', annotation);
  }

  /**
   * Get annotations for asset
   * Maps to: Asset annotation retrieval
   */
  static async getAssetAnnotations(assetId: string, annotationType?: string): Promise<AssetAnnotation[]> {
    return apiClient.get(`/api/catalog/collaboration/annotations/asset/${assetId}`, {
      params: { annotation_type: annotationType }
    });
  }

  /**
   * Update annotation
   * Maps to: Annotation editing
   */
  static async updateAnnotation(annotationId: string, updates: Partial<AssetAnnotation>): Promise<AssetAnnotation> {
    return apiClient.put(`/api/catalog/collaboration/annotations/${annotationId}`, updates);
  }

  /**
   * Delete annotation
   * Maps to: Annotation removal
   */
  static async deleteAnnotation(annotationId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/collaboration/annotations/${annotationId}`);
  }

  /**
   * Create annotation thread for discussions
   * Maps to: Threaded annotation discussions
   */
  static async createAnnotationThread(annotationId: string, threadData: any): Promise<AnnotationThread> {
    return apiClient.post(`/api/catalog/collaboration/annotations/${annotationId}/threads`, threadData);
  }

  /**
   * Reply to annotation thread
   * Maps to: Thread reply functionality
   */
  static async replyToAnnotationThread(threadId: string, reply: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/annotations/threads/${threadId}/replies`, reply);
  }

  /**
   * Resolve annotation thread
   * Maps to: Thread resolution
   */
  static async resolveAnnotationThread(threadId: string, resolution: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/annotations/threads/${threadId}/resolve`, resolution);
  }

  /**
   * Get annotation analytics
   * Maps to: Annotation usage and engagement metrics
   */
  static async getAnnotationAnalytics(assetId?: string, timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/annotations/analytics', {
      params: { asset_id: assetId, timeframe }
    });
  }
}

/**
 * ==============================================
 * REVIEW WORKFLOW ENGINE
 * ==============================================
 */

export class ReviewWorkflowAPI {
  /**
   * Create review workflow
   * Maps to: Review process management
   */
  static async createReviewWorkflow(workflowConfig: any): Promise<ReviewWorkflow> {
    return apiClient.post('/api/catalog/collaboration/reviews/workflows', workflowConfig);
  }

  /**
   * Submit item for review
   * Maps to: Review submission process
   */
  static async submitForReview(submission: ReviewSubmission): Promise<ReviewRequest> {
    return apiClient.post('/api/catalog/collaboration/reviews/submit', submission);
  }

  /**
   * Get pending review requests
   * Maps to: Review queue management
   */
  static async getPendingReviews(reviewerId?: string, category?: string): Promise<ReviewRequest[]> {
    return apiClient.get('/api/catalog/collaboration/reviews/pending', {
      params: { reviewer_id: reviewerId, category }
    });
  }

  /**
   * Perform review and provide feedback
   * Maps to: Review execution
   */
  static async performReview(reviewId: string, reviewData: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/reviews/${reviewId}/perform`, reviewData);
  }

  /**
   * Approve review request
   * Maps to: Review approval
   */
  static async approveReview(reviewId: string, approvalNotes?: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/reviews/${reviewId}/approve`, {
      approval_notes: approvalNotes
    });
  }

  /**
   * Reject review request
   * Maps to: Review rejection
   */
  static async rejectReview(reviewId: string, rejectionReason: string, suggestions?: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/reviews/${reviewId}/reject`, {
      rejection_reason: rejectionReason,
      suggestions
    });
  }

  /**
   * Get review history for asset
   * Maps to: Review history tracking
   */
  static async getReviewHistory(assetId: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/collaboration/reviews/history/asset/${assetId}`);
  }

  /**
   * Get reviewer performance metrics
   * Maps to: Reviewer analytics
   */
  static async getReviewerMetrics(reviewerId: string, timeframe?: string): Promise<any> {
    return apiClient.get(`/api/catalog/collaboration/reviews/reviewers/${reviewerId}/metrics`, {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * CROWDSOURCING PLATFORM
 * ==============================================
 */

export class CrowdsourcingAPI {
  /**
   * Create crowdsourcing project
   * Maps to: Crowdsourcing project management
   */
  static async createCrowdsourcingProject(projectConfig: any): Promise<CrowdsourcingProject> {
    return apiClient.post('/api/catalog/collaboration/crowdsourcing/projects', projectConfig);
  }

  /**
   * Get active crowdsourcing projects
   * Maps to: Project discovery and participation
   */
  static async getActiveCrowdsourcingProjects(category?: string, skillLevel?: string): Promise<CrowdsourcingProject[]> {
    return apiClient.get('/api/catalog/collaboration/crowdsourcing/projects/active', {
      params: { category, skill_level: skillLevel }
    });
  }

  /**
   * Participate in crowdsourcing project
   * Maps to: Project participation
   */
  static async participateInProject(projectId: string, participationData: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/crowdsourcing/projects/${projectId}/participate`, participationData);
  }

  /**
   * Submit crowdsourced contribution
   * Maps to: Contribution submission
   */
  static async submitContribution(projectId: string, contribution: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/crowdsourcing/projects/${projectId}/contribute`, contribution);
  }

  /**
   * Vote on crowdsourced contributions
   * Maps to: Community voting and validation
   */
  static async voteOnContribution(contributionId: string, vote: 'up' | 'down', reason?: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/crowdsourcing/contributions/${contributionId}/vote`, {
      vote,
      reason
    });
  }

  /**
   * Get crowdsourcing leaderboard
   * Maps to: Contributor recognition and gamification
   */
  static async getCrowdsourcingLeaderboard(projectId?: string, timeframe?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/collaboration/crowdsourcing/leaderboard', {
      params: { project_id: projectId, timeframe }
    });
  }

  /**
   * Get user's crowdsourcing contributions
   * Maps to: Personal contribution tracking
   */
  static async getUserContributions(userId: string, status?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/collaboration/crowdsourcing/users/${userId}/contributions`, {
      params: { status }
    });
  }
}

/**
 * ==============================================
 * EXPERT NETWORKING
 * ==============================================
 */

export class ExpertNetworkingAPI {
  /**
   * Create expert profile
   * Maps to: Expert profile management
   */
  static async createExpertProfile(profileData: any): Promise<ExpertProfile> {
    return apiClient.post('/api/catalog/collaboration/experts/profiles', profileData);
  }

  /**
   * Search for experts by expertise area
   * Maps to: Expert discovery and matching
   */
  static async searchExperts(expertiseArea: string, filters?: any): Promise<ExpertProfile[]> {
    return apiClient.get('/api/catalog/collaboration/experts/search', {
      params: { expertise_area: expertiseArea, ...filters }
    });
  }

  /**
   * Request expert consultation
   * Maps to: Expert consultation requests
   */
  static async requestExpertConsultation(consultationRequest: ExpertRequest): Promise<ExpertConsultation> {
    return apiClient.post('/api/catalog/collaboration/experts/consultations/request', consultationRequest);
  }

  /**
   * Get expert consultation requests
   * Maps to: Consultation queue for experts
   */
  static async getConsultationRequests(expertId: string, status?: string): Promise<ExpertConsultation[]> {
    return apiClient.get(`/api/catalog/collaboration/experts/${expertId}/consultations`, {
      params: { status }
    });
  }

  /**
   * Accept consultation request
   * Maps to: Consultation acceptance
   */
  static async acceptConsultation(consultationId: string, availability?: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/experts/consultations/${consultationId}/accept`, {
      availability
    });
  }

  /**
   * Provide expert consultation response
   * Maps to: Consultation response delivery
   */
  static async provideConsultationResponse(consultationId: string, response: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/experts/consultations/${consultationId}/respond`, response);
  }

  /**
   * Rate expert consultation
   * Maps to: Expert rating and feedback
   */
  static async rateConsultation(consultationId: string, rating: number, feedback?: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/experts/consultations/${consultationId}/rate`, {
      rating,
      feedback
    });
  }

  /**
   * Get expert reputation and metrics
   * Maps to: Expert reputation tracking
   */
  static async getExpertMetrics(expertId: string): Promise<any> {
    return apiClient.get(`/api/catalog/collaboration/experts/${expertId}/metrics`);
  }
}

/**
 * ==============================================
 * KNOWLEDGE SHARING PLATFORM
 * ==============================================
 */

export class KnowledgeSharingAPI {
  /**
   * Create knowledge article
   * Maps to: Knowledge base content creation
   */
  static async createKnowledgeArticle(article: KnowledgeRequest): Promise<KnowledgeArticle> {
    return apiClient.post('/api/catalog/collaboration/knowledge/articles', article);
  }

  /**
   * Search knowledge base
   * Maps to: Knowledge search and discovery
   */
  static async searchKnowledgeBase(query: string, filters?: any): Promise<KnowledgeArticle[]> {
    return apiClient.get('/api/catalog/collaboration/knowledge/search', {
      params: { query, ...filters }
    });
  }

  /**
   * Get knowledge article by ID
   * Maps to: Article retrieval
   */
  static async getKnowledgeArticle(articleId: string): Promise<KnowledgeArticle> {
    return apiClient.get(`/api/catalog/collaboration/knowledge/articles/${articleId}`);
  }

  /**
   * Update knowledge article
   * Maps to: Article editing and versioning
   */
  static async updateKnowledgeArticle(articleId: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
    return apiClient.put(`/api/catalog/collaboration/knowledge/articles/${articleId}`, updates);
  }

  /**
   * Get popular knowledge articles
   * Maps to: Popular content discovery
   */
  static async getPopularKnowledgeArticles(category?: string, timeframe?: string): Promise<KnowledgeArticle[]> {
    return apiClient.get('/api/catalog/collaboration/knowledge/articles/popular', {
      params: { category, timeframe }
    });
  }

  /**
   * Like or bookmark knowledge article
   * Maps to: Article engagement
   */
  static async engageWithArticle(articleId: string, action: 'like' | 'bookmark' | 'share'): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/knowledge/articles/${articleId}/engage`, { action });
  }

  /**
   * Get knowledge base analytics
   * Maps to: Knowledge usage analytics
   */
  static async getKnowledgeBaseAnalytics(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/knowledge/analytics', {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * COMMUNITY FORUM
 * ==============================================
 */

export class CommunityForumAPI {
  /**
   * Create discussion post
   * Maps to: Forum post creation
   */
  static async createDiscussionPost(postData: any): Promise<CommunityForumPost> {
    return apiClient.post('/api/catalog/collaboration/community/posts', postData);
  }

  /**
   * Get community discussions
   * Maps to: Discussion feed and filtering
   */
  static async getCommunityDiscussions(filters?: any): Promise<CommunityDiscussion[]> {
    return apiClient.get('/api/catalog/collaboration/community/discussions', { params: filters });
  }

  /**
   * Reply to discussion
   * Maps to: Discussion participation
   */
  static async replyToDiscussion(discussionId: string, reply: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/community/discussions/${discussionId}/reply`, reply);
  }

  /**
   * Vote on discussion posts
   * Maps to: Community voting
   */
  static async voteOnPost(postId: string, vote: 'up' | 'down'): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/community/posts/${postId}/vote`, { vote });
  }

  /**
   * Mark discussion as solved
   * Maps to: Problem resolution tracking
   */
  static async markDiscussionSolved(discussionId: string, solutionPostId: string): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/community/discussions/${discussionId}/solve`, {
      solution_post_id: solutionPostId
    });
  }

  /**
   * Get trending community topics
   * Maps to: Trending topic discovery
   */
  static async getTrendingTopics(timeframe?: string): Promise<any[]> {
    return apiClient.get('/api/catalog/collaboration/community/trending', {
      params: { timeframe }
    });
  }

  /**
   * Get user's community activity
   * Maps to: Personal community engagement
   */
  static async getUserCommunityActivity(userId: string): Promise<any> {
    return apiClient.get(`/api/catalog/collaboration/community/users/${userId}/activity`);
  }
}

/**
 * ==============================================
 * COLLABORATION ANALYTICS & INSIGHTS
 * ==============================================
 */

export class CollaborationAnalyticsAPI {
  /**
   * Get comprehensive collaboration analytics
   * Maps to: Overall collaboration metrics
   */
  static async getCollaborationAnalytics(scope?: string, timeframe?: string): Promise<CollaborationAnalytics> {
    return apiClient.get('/api/catalog/collaboration/analytics', {
      params: { scope, timeframe }
    });
  }

  /**
   * Get collaboration insights and recommendations
   * Maps to: AI-powered collaboration insights
   */
  static async getCollaborationInsights(teamId?: string): Promise<CollaborationInsight[]> {
    return apiClient.get('/api/catalog/collaboration/insights', {
      params: { team_id: teamId }
    });
  }

  /**
   * Generate collaboration reports
   * Maps to: Collaboration reporting
   */
  static async generateCollaborationReport(reportConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/collaboration/reports', reportConfig);
  }

  /**
   * Get network analysis of collaborations
   * Maps to: Collaboration network analysis
   */
  static async getCollaborationNetwork(scope?: string): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/network', {
      params: { scope }
    });
  }

  /**
   * Measure collaboration effectiveness
   * Maps to: Collaboration effectiveness metrics
   */
  static async measureCollaborationEffectiveness(teamId?: string, projectId?: string): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/effectiveness', {
      params: { team_id: teamId, project_id: projectId }
    });
  }
}

/**
 * ==============================================
 * COMPREHENSIVE COLLABORATION API
 * ==============================================
 */

export class CollaborationAPI {
  // Combine all collaboration APIs
  static readonly TeamCollaboration = TeamCollaborationAPI;
  static readonly DataStewardship = DataStewardshipAPI;
  static readonly Annotations = AnnotationAPI;
  static readonly ReviewWorkflow = ReviewWorkflowAPI;
  static readonly Crowdsourcing = CrowdsourcingAPI;
  static readonly ExpertNetworking = ExpertNetworkingAPI;
  static readonly KnowledgeSharing = KnowledgeSharingAPI;
  static readonly CommunityForum = CommunityForumAPI;
  static readonly Analytics = CollaborationAnalyticsAPI;

  /**
   * Get comprehensive collaboration overview
   * Maps to: Complete collaboration system overview
   */
  static async getCollaborationOverview(options?: {
    include_teams?: boolean;
    include_stewardship?: boolean;
    include_reviews?: boolean;
    include_community?: boolean;
    include_analytics?: boolean;
  }): Promise<any> {
    return apiClient.get('/api/catalog/collaboration/overview', { params: options });
  }

  /**
   * Initialize collaboration for new asset
   * Maps to: Asset collaboration setup
   */
  static async initializeAssetCollaboration(assetId: string, collaborationConfig?: any): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/assets/${assetId}/initialize`, collaborationConfig);
  }

  /**
   * Get collaboration notifications and updates
   * Maps to: Collaboration notification system
   */
  static async getCollaborationNotifications(userId: string, unreadOnly?: boolean): Promise<any[]> {
    return apiClient.get(`/api/catalog/collaboration/notifications/${userId}`, {
      params: { unread_only: unreadOnly }
    });
  }

  /**
   * Mark collaboration notifications as read
   * Maps to: Notification management
   */
  static async markNotificationsRead(userId: string, notificationIds?: string[]): Promise<any> {
    return apiClient.post(`/api/catalog/collaboration/notifications/${userId}/mark-read`, {
      notification_ids: notificationIds
    });
  }

  /**
   * Export collaboration data
   * Maps to: Collaboration data export
   */
  static async exportCollaborationData(exportConfig: any): Promise<Blob> {
    return apiClient.post('/api/catalog/collaboration/export', exportConfig, {
      responseType: 'blob'
    });
  }
}

// Default export with all collaboration APIs
export default CollaborationAPI;