// ============================================================================
// COLLABORATION SERVICE - ADVANCED TEAM COLLABORATION OPERATIONS
// ============================================================================
// Enterprise Data Governance System - Collaboration Service
// Team collaboration, discussions, reviews, workflows, notifications,
// and collaborative governance processes
// ============================================================================

import { apiClient } from '../../../shared/services/api-client';
import {
  CollaborationThread,
  CollaborationComment,
  AssetReview,
  ApprovalWorkflow,
  WorkflowStep,
  CollaborationNotification,
  TeamMember,
  AssetSubscription,
  CollaborationActivity,
  ReviewTemplate,
  ApprovalRequest,
  CatalogAsset
} from '../types/catalog-core.types';

// ============================================================================
// COLLABORATION SERVICE CLASS
// ============================================================================

class CollaborationService {
  private readonly baseUrl = '/api/v1/catalog/collaboration';

  // ========================================================================
  // DISCUSSION THREADS OPERATIONS
  // ========================================================================

  /**
   * Get collaboration threads for an asset
   */
  async getCollaborationThreads(
    assetId: string,
    filters?: {
      participants?: string[];
      types?: string[];
      status?: string[];
      priority?: string[];
      dateRange?: { start: Date; end: Date };
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationThread[]> {
    const response = await apiClient.get(`${this.baseUrl}/threads/asset/${assetId}`, {
      params: {
        participants: filters?.participants?.join(','),
        types: filters?.types?.join(','),
        status: filters?.status?.join(','),
        priority: filters?.priority?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        tags: filters?.tags?.join(','),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get all collaboration threads
   */
  async getAllCollaborationThreads(
    filters?: {
      search?: string;
      participants?: string[];
      types?: string[];
      status?: string[];
      priority?: string[];
      assetIds?: string[];
      dateRange?: { start: Date; end: Date };
      sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'activity';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    threads: CollaborationThread[];
    total: number;
    summary: {
      byStatus: Record<string, number>;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/threads/search`, { filters });
    return response.data;
  }

  /**
   * Get thread details with full comment history
   */
  async getThreadDetails(threadId: string): Promise<{
    thread: CollaborationThread;
    comments: CollaborationComment[];
    participants: TeamMember[];
    relatedAssets: CatalogAsset[];
    activity: CollaborationActivity[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/threads/${threadId}/details`);
    return response.data;
  }

  /**
   * Create a new collaboration thread
   */
  async createCollaborationThread(thread: {
    assetId?: string;
    title: string;
    description: string;
    type: 'discussion' | 'question' | 'issue' | 'feedback' | 'announcement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    participants?: string[];
    isPrivate?: boolean;
    metadata?: Record<string, any>;
  }): Promise<CollaborationThread> {
    const response = await apiClient.post(`${this.baseUrl}/threads`, thread);
    return response.data;
  }

  /**
   * Update collaboration thread
   */
  async updateCollaborationThread(
    threadId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'active' | 'resolved' | 'closed' | 'archived';
      tags?: string[];
      isPrivate?: boolean;
    }
  ): Promise<CollaborationThread> {
    const response = await apiClient.patch(`${this.baseUrl}/threads/${threadId}`, updates);
    return response.data;
  }

  /**
   * Delete collaboration thread
   */
  async deleteCollaborationThread(threadId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/threads/${threadId}`);
  }

  /**
   * Subscribe to thread notifications
   */
  async subscribeToThread(threadId: string, userId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/threads/${threadId}/subscribe`, { userId });
  }

  /**
   * Unsubscribe from thread notifications
   */
  async unsubscribeFromThread(threadId: string, userId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/threads/${threadId}/unsubscribe`, { userId });
  }

  // ========================================================================
  // COMMENTS OPERATIONS
  // ========================================================================

  /**
   * Add comment to thread
   */
  async addComment(
    threadId: string,
    content: string,
    options?: {
      replyToCommentId?: string;
      mentions?: string[];
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
        size: number;
      }>;
    }
  ): Promise<CollaborationComment> {
    const response = await apiClient.post(`${this.baseUrl}/threads/${threadId}/comments`, {
      content,
      ...options
    });
    return response.data;
  }

  /**
   * Update comment
   */
  async updateComment(
    commentId: string,
    updates: {
      content?: string;
      isEdited?: boolean;
    }
  ): Promise<CollaborationComment> {
    const response = await apiClient.patch(`${this.baseUrl}/comments/${commentId}`, updates);
    return response.data;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/comments/${commentId}`);
  }

  /**
   * Like/unlike comment
   */
  async toggleCommentLike(commentId: string, userId: string): Promise<{
    liked: boolean;
    likeCount: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/comments/${commentId}/like`, {
      userId
    });
    return response.data;
  }

  /**
   * Report comment
   */
  async reportComment(
    commentId: string,
    reason: 'spam' | 'inappropriate' | 'harassment' | 'other',
    description?: string
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/comments/${commentId}/report`, {
      reason,
      description
    });
  }

  // ========================================================================
  // ASSET REVIEWS OPERATIONS
  // ========================================================================

  /**
   * Get asset reviews
   */
  async getAssetReviews(
    assetId: string,
    filters?: {
      reviewers?: string[];
      types?: string[];
      status?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<AssetReview[]> {
    const response = await apiClient.get(`${this.baseUrl}/reviews/asset/${assetId}`, {
      params: {
        reviewers: filters?.reviewers?.join(','),
        types: filters?.types?.join(','),
        status: filters?.status?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get all reviews across organization
   */
  async getAllReviews(
    filters?: {
      assetIds?: string[];
      reviewers?: string[];
      types?: string[];
      status?: string[];
      priority?: string[];
      dateRange?: { start: Date; end: Date };
      sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'progress';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    reviews: AssetReview[];
    total: number;
    summary: {
      byStatus: Record<string, number>;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/search`, { filters });
    return response.data;
  }

  /**
   * Get review details
   */
  async getReviewDetails(reviewId: string): Promise<{
    review: AssetReview;
    checklist: Array<{
      id: string;
      item: string;
      status: 'pending' | 'completed' | 'na';
      comment?: string;
      evidence?: Array<{ name: string; url: string }>;
    }>;
    comments: CollaborationComment[];
    history: Array<{
      timestamp: Date;
      action: string;
      user: string;
      comment?: string;
      oldValue?: any;
      newValue?: any;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/reviews/${reviewId}/details`);
    return response.data;
  }

  /**
   * Create asset review
   */
  async createAssetReview(review: {
    assetId: string;
    title: string;
    description: string;
    type: 'quality' | 'compliance' | 'security' | 'technical' | 'business';
    priority: 'low' | 'medium' | 'high' | 'critical';
    reviewer?: string;
    dueDate?: Date;
    templateId?: string;
    checklist?: Array<{
      item: string;
      required: boolean;
      category: string;
    }>;
    metadata?: Record<string, any>;
  }): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews`, {
      ...review,
      dueDate: review.dueDate?.toISOString()
    });
    return response.data;
  }

  /**
   * Update asset review
   */
  async updateAssetReview(
    reviewId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'draft' | 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
      reviewer?: string;
      dueDate?: Date;
      progress?: number;
      findings?: string;
      recommendations?: string[];
    }
  ): Promise<AssetReview> {
    const response = await apiClient.patch(`${this.baseUrl}/reviews/${reviewId}`, {
      ...updates,
      dueDate: updates.dueDate?.toISOString()
    });
    return response.data;
  }

  /**
   * Submit review for approval
   */
  async submitReview(reviewId: string, submission: {
    findings: string;
    recommendations: string[];
    score?: number;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/${reviewId}/submit`, submission);
    return response.data;
  }

  /**
   * Approve/reject review
   */
  async reviewApproval(
    reviewId: string,
    decision: 'approve' | 'reject',
    comment: string,
    requiresChanges?: boolean
  ): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/${reviewId}/approval`, {
      decision,
      comment,
      requiresChanges
    });
    return response.data;
  }

  // ========================================================================
  // APPROVAL WORKFLOWS OPERATIONS
  // ========================================================================

  /**
   * Get approval workflows
   */
  async getApprovalWorkflows(
    filters?: {
      isActive?: boolean;
      triggers?: string[];
      types?: string[];
    }
  ): Promise<ApprovalWorkflow[]> {
    const response = await apiClient.get(`${this.baseUrl}/workflows`, { params: filters });
    return response.data;
  }

  /**
   * Get workflow details
   */
  async getWorkflowDetails(workflowId: string): Promise<{
    workflow: ApprovalWorkflow;
    steps: WorkflowStep[];
    executions: Array<{
      id: string;
      triggeredAt: Date;
      triggeredBy: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      currentStep: number;
      completedAt?: Date;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/workflows/${workflowId}/details`);
    return response.data;
  }

  /**
   * Create approval workflow
   */
  async createApprovalWorkflow(workflow: {
    name: string;
    description: string;
    trigger: 'manual' | 'asset_change' | 'review_submission' | 'quality_issue' | 'scheduled';
    triggerConditions?: Record<string, any>;
    steps: Array<{
      name: string;
      type: 'approval' | 'review' | 'notification' | 'automation';
      assignees: string[];
      requiredApprovals: number;
      timeoutHours?: number;
      skipConditions?: Record<string, any>;
    }>;
    isActive: boolean;
    metadata?: Record<string, any>;
  }): Promise<ApprovalWorkflow> {
    const response = await apiClient.post(`${this.baseUrl}/workflows`, workflow);
    return response.data;
  }

  /**
   * Update approval workflow
   */
  async updateApprovalWorkflow(
    workflowId: string,
    updates: Partial<ApprovalWorkflow>
  ): Promise<ApprovalWorkflow> {
    const response = await apiClient.patch(`${this.baseUrl}/workflows/${workflowId}`, updates);
    return response.data;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: {
      assetId?: string;
      triggeredBy: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    executionId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    currentStep: number;
    estimatedCompletion?: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/execute`, context);
    return response.data;
  }

  // ========================================================================
  // APPROVAL REQUESTS OPERATIONS
  // ========================================================================

  /**
   * Get pending approval requests
   */
  async getPendingApprovals(
    filters?: {
      assignee?: string;
      types?: string[];
      priority?: string[];
      assetIds?: string[];
      workflowIds?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<ApprovalRequest[]> {
    const response = await apiClient.get(`${this.baseUrl}/approvals/pending`, {
      params: {
        assignee: filters?.assignee,
        types: filters?.types?.join(','),
        priority: filters?.priority?.join(','),
        assetIds: filters?.assetIds?.join(','),
        workflowIds: filters?.workflowIds?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString()
      }
    });
    return response.data;
  }

  /**
   * Get approval request details
   */
  async getApprovalRequestDetails(requestId: string): Promise<{
    request: ApprovalRequest;
    workflow: ApprovalWorkflow;
    asset?: CatalogAsset;
    history: Array<{
      timestamp: Date;
      action: string;
      user: string;
      comment?: string;
      decision?: 'approve' | 'reject' | 'delegate';
    }>;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
      uploadedBy: string;
      uploadedAt: Date;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/approvals/${requestId}/details`);
    return response.data;
  }

  /**
   * Approve request
   */
  async approveRequest(
    requestId: string,
    comment?: string,
    conditions?: string[]
  ): Promise<{
    success: boolean;
    nextStep?: WorkflowStep;
    workflowCompleted: boolean;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/approve`, {
      comment,
      conditions
    });
    return response.data;
  }

  /**
   * Reject request
   */
  async rejectRequest(
    requestId: string,
    reason: string,
    sendBack?: boolean
  ): Promise<{
    success: boolean;
    workflowStopped: boolean;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/reject`, {
      reason,
      sendBack
    });
    return response.data;
  }

  /**
   * Delegate approval request
   */
  async delegateRequest(
    requestId: string,
    delegateTo: string,
    comment?: string
  ): Promise<ApprovalRequest> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/delegate`, {
      delegateTo,
      comment
    });
    return response.data;
  }

  // ========================================================================
  // NOTIFICATIONS OPERATIONS
  // ========================================================================

  /**
   * Get user notifications
   */
  async getNotifications(
    filters?: {
      types?: string[];
      isRead?: boolean;
      priority?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationNotification[]> {
    const response = await apiClient.get(`${this.baseUrl}/notifications`, { params: filters });
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/read-all`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/notifications/${notificationId}`);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    notificationTypes: Record<string, boolean>;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  }> {
    const response = await apiClient.get(`${this.baseUrl}/notifications/settings`);
    return response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    inAppNotifications?: boolean;
    notificationTypes?: Record<string, boolean>;
    frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  }): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/settings`, settings);
  }

  // ========================================================================
  // COLLABORATION ACTIVITIES
  // ========================================================================

  /**
   * Get collaboration activities
   */
  async getCollaborationActivities(
    assetId: string,
    filters?: {
      types?: string[];
      users?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationActivity[]> {
    const response = await apiClient.get(`${this.baseUrl}/activities/asset/${assetId}`, {
      params: {
        types: filters?.types?.join(','),
        users: filters?.users?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get organization-wide activities
   */
  async getOrganizationActivities(
    filters?: {
      types?: string[];
      users?: string[];
      assetIds?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationActivity[]> {
    const response = await apiClient.get(`${this.baseUrl}/activities`, { params: filters });
    return response.data;
  }

  // ========================================================================
  // TEAM MEMBERS AND PERMISSIONS
  // ========================================================================

  /**
   * Get team members
   */
  async getTeamMembers(
    filters?: {
      roles?: string[];
      departments?: string[];
      search?: string;
      isActive?: boolean;
    }
  ): Promise<TeamMember[]> {
    const response = await apiClient.get(`${this.baseUrl}/team`, { params: filters });
    return response.data;
  }

  /**
   * Get team member details
   */
  async getTeamMemberDetails(userId: string): Promise<{
    member: TeamMember;
    permissions: string[];
    recentActivity: CollaborationActivity[];
    statistics: {
      threadsParticipated: number;
      reviewsCompleted: number;
      commentsPosted: number;
      approvalsHandled: number;
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/team/${userId}/details`);
    return response.data;
  }

  /**
   * Invite team member
   */
  async inviteTeamMember(invitation: {
    email: string;
    role: string;
    department?: string;
    permissions: string[];
    message?: string;
  }): Promise<{
    invitationId: string;
    inviteUrl: string;
    expiresAt: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/team/invite`, invitation);
    return response.data;
  }

  // ========================================================================
  // ASSET SUBSCRIPTIONS
  // ========================================================================

  /**
   * Get asset subscriptions
   */
  async getAssetSubscriptions(userId: string): Promise<AssetSubscription[]> {
    const response = await apiClient.get(`${this.baseUrl}/subscriptions/user/${userId}`);
    return response.data;
  }

  /**
   * Subscribe to asset
   */
  async subscribeToAsset(
    assetId: string,
    notificationTypes: ('comments' | 'reviews' | 'changes' | 'quality_issues')[]
  ): Promise<AssetSubscription> {
    const response = await apiClient.post(`${this.baseUrl}/subscriptions`, {
      assetId,
      notificationTypes
    });
    return response.data;
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      notificationTypes?: string[];
      isActive?: boolean;
    }
  ): Promise<AssetSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${subscriptionId}`, updates);
    return response.data;
  }

  /**
   * Unsubscribe from asset
   */
  async unsubscribeFromAsset(subscriptionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/subscriptions/${subscriptionId}`);
  }

  // ========================================================================
  // REVIEW TEMPLATES
  // ========================================================================

  /**
   * Get review templates
   */
  async getReviewTemplates(
    filters?: {
      types?: string[];
      categories?: string[];
      isActive?: boolean;
    }
  ): Promise<ReviewTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/templates`, { params: filters });
    return response.data;
  }

  /**
   * Create review template
   */
  async createReviewTemplate(template: {
    name: string;
    description: string;
    type: string;
    category: string;
    checklist: Array<{
      item: string;
      description?: string;
      required: boolean;
      category: string;
      weight: number;
    }>;
    guidelines?: string;
    isActive: boolean;
  }): Promise<ReviewTemplate> {
    const response = await apiClient.post(`${this.baseUrl}/templates`, template);
    return response.data;
  }

  // ========================================================================
  // REAL-TIME COLLABORATION
  // ========================================================================

  /**
   * Subscribe to collaboration events
   */
  subscribeToCollaborationEvents(
    assetId: string,
    eventTypes: ('thread_created' | 'comment_added' | 'review_submitted' | 'approval_requested')[],
    callback: (event: {
      type: string;
      assetId: string;
      timestamp: Date;
      data: any;
      user: string;
    }) => void
  ): () => void {
    const eventSource = new EventSource(
      `${this.baseUrl}/events/subscribe/${assetId}?eventTypes=${eventTypes.join(',')}`
    );

    eventSource.onmessage = (event) => {
      const collaborationEvent = JSON.parse(event.data);
      callback(collaborationEvent);
    };

    return () => {
      eventSource.close();
    };
  }

  /**
   * Send real-time message
   */
  async sendRealtimeMessage(
    threadId: string,
    message: {
      type: 'typing' | 'presence' | 'reaction';
      data: any;
    }
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/realtime/${threadId}/message`, message);
  }

  // ========================================================================
  // COLLABORATION ANALYTICS
  // ========================================================================

  /**
   * Get collaboration metrics
   */
  async getCollaborationMetrics(
    timeRange: { start: Date; end: Date },
    scope: 'asset' | 'team' | 'organization',
    scopeId?: string
  ): Promise<{
    threadsCreated: number;
    commentsPosted: number;
    reviewsCompleted: number;
    approvalsProcessed: number;
    activeParticipants: number;
    averageResponseTime: number;
    collaborationScore: number;
    trends: {
      threadsCreated: Array<{ date: string; count: number }>;
      engagement: Array<{ date: string; score: number }>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/analytics/metrics`, {
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      },
      scope,
      scopeId
    });
    return response.data;
  }

  /**
   * Get collaboration insights
   */
  async getCollaborationInsights(
    timeRange: { start: Date; end: Date }
  ): Promise<{
    topContributors: Array<{
      userId: string;
      userName: string;
      contributionScore: number;
      threadsCreated: number;
      commentsPosted: number;
    }>;
    mostDiscussedAssets: Array<{
      assetId: string;
      assetName: string;
      threadCount: number;
      commentCount: number;
      participantCount: number;
    }>;
    reviewsEfficiency: {
      averageCompletionTime: number;
      onTimeCompletionRate: number;
      qualityScore: number;
    };
    recommendedActions: Array<{
      type: 'increase_engagement' | 'improve_response_time' | 'enhance_reviews';
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimatedImpact: string;
    }>;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/analytics/insights`, {
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      }
    });
    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const collaborationService = new CollaborationService();
export default collaborationService;