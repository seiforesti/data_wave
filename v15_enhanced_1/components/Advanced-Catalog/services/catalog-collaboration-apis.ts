/**
 * Catalog Collaboration API Service
 * =================================
 * 
 * Maps to backend services:
 * - enhanced_collaboration_models.py (collaboration models)
 * - catalog_intelligence_models.py (collaboration aspects)
 * - knowledge_management_service.py (knowledge sharing)
 * - enterprise_catalog_service.py (collaboration features)
 * 
 * Provides comprehensive collaboration capabilities including team coordination,
 * expert consultation, knowledge sharing, crowdsourcing, and stewardship.
 */

import { apiClient } from '@/shared/utils/api-client'
import type {
  // Core collaboration types
  CatalogCollaborationHub,
  CollaborationParticipant,
  Discussion,
  Annotation,
  Decision,
  ActionItem,
  
  // Stewardship types
  DataStewardshipCenter,
  DataSteward,
  StewardshipPolicy,
  
  // Crowdsourcing types
  CrowdsourcingPlatform,
  CrowdsourcingCampaign,
  Contributor,
  
  // Expert consultation types
  ExpertNetworking,
  Expert,
  Consultation,
  ConsultationQuestion,
  ConsultationResponse,
  ExpertRecommendation,
  
  // Knowledge management types
  KnowledgeBase,
  KnowledgeArticle,
  ArticleSection,
  ArticleComment,
  ArticleRating,
  
  // Request/Response types
  CreateCollaborationHubRequest,
  UpdateCollaborationHubRequest,
  CreateDiscussionRequest,
  CreateAnnotationRequest,
  StartConsultationRequest,
  CreateKnowledgeArticleRequest,
  
  // Analytics types
  CollaborationAnalytics,
  CollaborationOverview,
  EngagementMetrics,
  ProductivityMetrics,
  
  // Common types
  Attachment,
  Reaction,
  ReviewStatus,
  Priority,
  CollaborationType
} from '../types/collaboration.types'

const API_BASE_URL = '/api/v1/catalog/collaboration'

export class CatalogCollaborationApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ===================== COLLABORATION HUBS =====================

  /**
   * Create collaboration hub
   * Maps to: Enhanced collaboration services
   */
  async createCollaborationHub(request: CreateCollaborationHubRequest): Promise<CatalogCollaborationHub> {
    return apiClient.post(`${this.baseUrl}/hubs`, request)
  }

  /**
   * Get collaboration hub
   * Maps to: Collaboration hub management
   */
  async getCollaborationHub(hubId: string): Promise<CatalogCollaborationHub> {
    return apiClient.get(`${this.baseUrl}/hubs/${hubId}`)
  }

  /**
   * Update collaboration hub
   * Maps to: Hub update services
   */
  async updateCollaborationHub(
    hubId: string,
    request: UpdateCollaborationHubRequest
  ): Promise<CatalogCollaborationHub> {
    return apiClient.put(`${this.baseUrl}/hubs/${hubId}`, request)
  }

  /**
   * List collaboration hubs
   * Maps to: Hub listing services
   */
  async listCollaborationHubs(
    filters?: {
      assetId?: string
      status?: ReviewStatus
      participantId?: string
      type?: CollaborationType
    },
    pagination?: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{
    hubs: CatalogCollaborationHub[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    return apiClient.get(`${this.baseUrl}/hubs?${params.toString()}`)
  }

  /**
   * Add participant to hub
   * Maps to: Participant management services
   */
  async addParticipant(
    hubId: string,
    participantData: {
      userId: string
      role: string
      permissions: Record<string, boolean>
    }
  ): Promise<CollaborationParticipant> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/participants`, participantData)
  }

  /**
   * Remove participant from hub
   * Maps to: Participant management services
   */
  async removeParticipant(hubId: string, participantId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/hubs/${hubId}/participants/${participantId}`)
  }

  /**
   * Update participant role
   * Maps to: Participant role management
   */
  async updateParticipantRole(
    hubId: string,
    participantId: string,
    updates: {
      role?: string
      permissions?: Record<string, boolean>
    }
  ): Promise<CollaborationParticipant> {
    return apiClient.put(`${this.baseUrl}/hubs/${hubId}/participants/${participantId}`, updates)
  }

  // ===================== DISCUSSIONS =====================

  /**
   * Create discussion
   * Maps to: Discussion management services
   */
  async createDiscussion(hubId: string, request: CreateDiscussionRequest): Promise<Discussion> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/discussions`, request)
  }

  /**
   * Get discussion
   * Maps to: Discussion retrieval services
   */
  async getDiscussion(hubId: string, discussionId: string): Promise<Discussion> {
    return apiClient.get(`${this.baseUrl}/hubs/${hubId}/discussions/${discussionId}`)
  }

  /**
   * Update discussion
   * Maps to: Discussion update services
   */
  async updateDiscussion(
    hubId: string,
    discussionId: string,
    updates: {
      title?: string
      content?: string
      status?: ReviewStatus
      priority?: Priority
      tags?: string[]
    }
  ): Promise<Discussion> {
    return apiClient.put(`${this.baseUrl}/hubs/${hubId}/discussions/${discussionId}`, updates)
  }

  /**
   * Reply to discussion
   * Maps to: Discussion threading services
   */
  async replyToDiscussion(
    hubId: string,
    discussionId: string,
    reply: {
      content: string
      attachments?: string[]
      mentions?: string[]
    }
  ): Promise<Discussion> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/discussions/${discussionId}/replies`, reply)
  }

  /**
   * Resolve discussion
   * Maps to: Discussion resolution services
   */
  async resolveDiscussion(
    hubId: string,
    discussionId: string,
    resolution: {
      summary: string
      actionItems?: string[]
      followUpActions?: string[]
    }
  ): Promise<Discussion> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/discussions/${discussionId}/resolve`, resolution)
  }

  /**
   * Add reaction to discussion
   * Maps to: Reaction management services
   */
  async addReaction(
    hubId: string,
    discussionId: string,
    reactionType: string
  ): Promise<Reaction> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/discussions/${discussionId}/reactions`, {
      type: reactionType
    })
  }

  // ===================== ANNOTATIONS =====================

  /**
   * Create annotation
   * Maps to: Annotation management services
   */
  async createAnnotation(request: CreateAnnotationRequest): Promise<Annotation> {
    return apiClient.post(`${this.baseUrl}/annotations`, request)
  }

  /**
   * Get annotations for asset
   * Maps to: Annotation retrieval services
   */
  async getAssetAnnotations(
    assetId: string,
    filters?: {
      type?: string
      authorId?: string
      isActive?: boolean
      targetType?: string
    }
  ): Promise<{
    annotations: Annotation[]
    summary: {
      total: number
      byType: Record<string, number>
      byAuthor: Record<string, number>
      active: number
      resolved: number
    }
  }> {
    const params = new URLSearchParams({ asset_id: assetId })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    return apiClient.get(`${this.baseUrl}/annotations?${params.toString()}`)
  }

  /**
   * Update annotation
   * Maps to: Annotation update services
   */
  async updateAnnotation(
    annotationId: string,
    updates: {
      content?: string
      description?: string
      isActive?: boolean
      tags?: string[]
    }
  ): Promise<Annotation> {
    return apiClient.put(`${this.baseUrl}/annotations/${annotationId}`, updates)
  }

  /**
   * Respond to annotation
   * Maps to: Annotation response services
   */
  async respondToAnnotation(
    annotationId: string,
    response: {
      content: string
      type: 'response' | 'resolution' | 'clarification'
    }
  ): Promise<Annotation> {
    return apiClient.post(`${this.baseUrl}/annotations/${annotationId}/responses`, response)
  }

  /**
   * Resolve annotation
   * Maps to: Annotation resolution services
   */
  async resolveAnnotation(
    annotationId: string,
    resolution: {
      summary: string
      actionTaken?: string
    }
  ): Promise<Annotation> {
    return apiClient.post(`${this.baseUrl}/annotations/${annotationId}/resolve`, resolution)
  }

  // ===================== DECISIONS =====================

  /**
   * Create decision
   * Maps to: Decision management services
   */
  async createDecision(
    hubId: string,
    decision: {
      title: string
      description: string
      type: string
      options: Array<{
        title: string
        description: string
        pros: string[]
        cons: string[]
      }>
      approvers: string[]
      priority: Priority
    }
  ): Promise<Decision> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/decisions`, decision)
  }

  /**
   * Vote on decision option
   * Maps to: Decision voting services
   */
  async voteOnDecision(
    hubId: string,
    decisionId: string,
    optionId: string,
    vote: {
      support: boolean
      reasoning?: string
      conditions?: string[]
    }
  ): Promise<Decision> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/decisions/${decisionId}/vote`, {
      option_id: optionId,
      ...vote
    })
  }

  /**
   * Approve decision
   * Maps to: Decision approval services
   */
  async approveDecision(
    hubId: string,
    decisionId: string,
    approval: {
      approved: boolean
      comments?: string
      conditions?: string[]
    }
  ): Promise<Decision> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/decisions/${decisionId}/approve`, approval)
  }

  /**
   * Implement decision
   * Maps to: Decision implementation services
   */
  async implementDecision(
    hubId: string,
    decisionId: string,
    implementation: {
      selectedOptionId: string
      implementationPlan: Record<string, any>
      timeline: string
      assignedTo: string[]
    }
  ): Promise<Decision> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/decisions/${decisionId}/implement`, implementation)
  }

  // ===================== ACTION ITEMS =====================

  /**
   * Create action item
   * Maps to: Action item management services
   */
  async createActionItem(
    hubId: string,
    actionItem: {
      title: string
      description: string
      type: string
      assignedTo: string
      priority: Priority
      dueDate?: string
      relatedAssets?: string[]
    }
  ): Promise<ActionItem> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/action-items`, actionItem)
  }

  /**
   * Update action item status
   * Maps to: Action item status management
   */
  async updateActionItemStatus(
    hubId: string,
    actionItemId: string,
    updates: {
      status?: string
      progress?: number
      comments?: string
      actualHours?: number
    }
  ): Promise<ActionItem> {
    return apiClient.put(`${this.baseUrl}/hubs/${hubId}/action-items/${actionItemId}`, updates)
  }

  /**
   * Complete action item
   * Maps to: Action item completion services
   */
  async completeActionItem(
    hubId: string,
    actionItemId: string,
    completion: {
      completionNotes: string
      deliverables?: string[]
      lessonsLearned?: string[]
    }
  ): Promise<ActionItem> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/action-items/${actionItemId}/complete`, completion)
  }

  // ===================== DATA STEWARDSHIP =====================

  /**
   * Get stewardship center
   * Maps to: Data stewardship services
   */
  async getStewardshipCenter(centerId: string): Promise<DataStewardshipCenter> {
    return apiClient.get(`${this.baseUrl}/stewardship/centers/${centerId}`)
  }

  /**
   * Create stewardship center
   * Maps to: Stewardship center creation
   */
  async createStewardshipCenter(
    center: {
      name: string
      description: string
      scope: string
      responsibleAssets: string[]
      headSteward: string
    }
  ): Promise<DataStewardshipCenter> {
    return apiClient.post(`${this.baseUrl}/stewardship/centers`, center)
  }

  /**
   * Assign data steward
   * Maps to: Steward assignment services
   */
  async assignDataSteward(
    centerId: string,
    steward: {
      userId: string
      stewardshipLevel: string
      specializations: string[]
      assignedAssets: string[]
      capacity: number
    }
  ): Promise<DataSteward> {
    return apiClient.post(`${this.baseUrl}/stewardship/centers/${centerId}/stewards`, steward)
  }

  /**
   * Update steward assignment
   * Maps to: Steward update services
   */
  async updateStewardAssignment(
    centerId: string,
    stewardId: string,
    updates: {
      assignedAssets?: string[]
      workload?: number
      specializations?: string[]
    }
  ): Promise<DataSteward> {
    return apiClient.put(`${this.baseUrl}/stewardship/centers/${centerId}/stewards/${stewardId}`, updates)
  }

  /**
   * Get stewardship policies
   * Maps to: Policy management services
   */
  async getStewardshipPolicies(centerId?: string): Promise<{
    policies: StewardshipPolicy[]
    categories: Array<{
      category: string
      count: number
      description: string
    }>
  }> {
    const params = new URLSearchParams()
    if (centerId) params.append('center_id', centerId)
    
    return apiClient.get(`${this.baseUrl}/stewardship/policies?${params.toString()}`)
  }

  /**
   * Create stewardship policy
   * Maps to: Policy creation services
   */
  async createStewardshipPolicy(
    policy: {
      name: string
      description: string
      type: string
      content: string
      applicableAssets: string[]
      mandatory: boolean
      reviewFrequency: string
    }
  ): Promise<StewardshipPolicy> {
    return apiClient.post(`${this.baseUrl}/stewardship/policies`, policy)
  }

  // ===================== EXPERT CONSULTATION =====================

  /**
   * Get expert network
   * Maps to: Expert networking services
   */
  async getExpertNetwork(): Promise<ExpertNetworking> {
    return apiClient.get(`${this.baseUrl}/experts/network`)
  }

  /**
   * Find experts
   * Maps to: Expert discovery services
   */
  async findExperts(
    criteria: {
      expertise?: string[]
      availability?: boolean
      rating?: number
      experienceYears?: number
    }
  ): Promise<{
    experts: Expert[]
    matchingScore: Record<string, number>
    recommendations: Array<{
      expertId: string
      reasoning: string
      confidence: number
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/experts/find`, criteria)
  }

  /**
   * Start consultation
   * Maps to: Consultation initiation services
   */
  async startConsultation(request: StartConsultationRequest): Promise<Consultation> {
    return apiClient.post(`${this.baseUrl}/experts/consultations`, request)
  }

  /**
   * Get consultation
   * Maps to: Consultation retrieval services
   */
  async getConsultation(consultationId: string): Promise<Consultation> {
    return apiClient.get(`${this.baseUrl}/experts/consultations/${consultationId}`)
  }

  /**
   * Add consultation question
   * Maps to: Question management services
   */
  async addConsultationQuestion(
    consultationId: string,
    question: {
      question: string
      context?: string
      priority: Priority
    }
  ): Promise<ConsultationQuestion> {
    return apiClient.post(`${this.baseUrl}/experts/consultations/${consultationId}/questions`, question)
  }

  /**
   * Respond to consultation
   * Maps to: Expert response services
   */
  async respondToConsultation(
    consultationId: string,
    response: {
      content: string
      type: string
      attachments?: string[]
    }
  ): Promise<ConsultationResponse> {
    return apiClient.post(`${this.baseUrl}/experts/consultations/${consultationId}/responses`, response)
  }

  /**
   * Complete consultation
   * Maps to: Consultation completion services
   */
  async completeConsultation(
    consultationId: string,
    completion: {
      summary: string
      recommendations: string[]
      followUpActions: string[]
      rating?: number
      feedback?: string
    }
  ): Promise<Consultation> {
    return apiClient.post(`${this.baseUrl}/experts/consultations/${consultationId}/complete`, completion)
  }

  // ===================== CROWDSOURCING =====================

  /**
   * Get crowdsourcing platform
   * Maps to: Crowdsourcing platform services
   */
  async getCrowdsourcingPlatform(): Promise<CrowdsourcingPlatform> {
    return apiClient.get(`${this.baseUrl}/crowdsourcing/platform`)
  }

  /**
   * Create crowdsourcing campaign
   * Maps to: Campaign creation services
   */
  async createCrowdsourcingCampaign(
    campaign: {
      title: string
      description: string
      type: string
      targetAssets: string[]
      rewardPerTask: number
      minParticipants: number
      endDate: string
    }
  ): Promise<CrowdsourcingCampaign> {
    return apiClient.post(`${this.baseUrl}/crowdsourcing/campaigns`, campaign)
  }

  /**
   * Join crowdsourcing campaign
   * Maps to: Participant enrollment services
   */
  async joinCrowdsourcingCampaign(
    campaignId: string,
    preferences?: {
      availableHours?: number
      preferredTaskTypes?: string[]
    }
  ): Promise<{
    participant: Contributor
    assignedTasks: Array<{
      taskId: string
      description: string
      difficulty: string
      reward: number
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/crowdsourcing/campaigns/${campaignId}/join`, { preferences })
  }

  /**
   * Submit crowdsourcing contribution
   * Maps to: Contribution submission services
   */
  async submitContribution(
    campaignId: string,
    taskId: string,
    contribution: {
      data: Record<string, any>
      confidence: number
      notes?: string
    }
  ): Promise<{
    contributionId: string
    status: 'submitted' | 'under_review' | 'approved' | 'rejected'
    reward?: number
    feedback?: string
  }> {
    return apiClient.post(`${this.baseUrl}/crowdsourcing/campaigns/${campaignId}/tasks/${taskId}/contribute`, contribution)
  }

  // ===================== KNOWLEDGE MANAGEMENT =====================

  /**
   * Get knowledge base
   * Maps to: Knowledge base services
   */
  async getKnowledgeBase(baseId: string): Promise<KnowledgeBase> {
    return apiClient.get(`${this.baseUrl}/knowledge/bases/${baseId}`)
  }

  /**
   * Search knowledge articles
   * Maps to: Knowledge search services
   */
  async searchKnowledgeArticles(
    query: string,
    filters?: {
      category?: string
      type?: string
      tags?: string[]
      authorId?: string
    }
  ): Promise<{
    articles: KnowledgeArticle[]
    totalResults: number
    suggestions: string[]
    relatedTopics: string[]
  }> {
    const params = new URLSearchParams({ query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    
    return apiClient.get(`${this.baseUrl}/knowledge/search?${params.toString()}`)
  }

  /**
   * Create knowledge article
   * Maps to: Article creation services
   */
  async createKnowledgeArticle(request: CreateKnowledgeArticleRequest): Promise<KnowledgeArticle> {
    return apiClient.post(`${this.baseUrl}/knowledge/articles`, request)
  }

  /**
   * Update knowledge article
   * Maps to: Article update services
   */
  async updateKnowledgeArticle(
    articleId: string,
    updates: {
      title?: string
      content?: string
      summary?: string
      tags?: string[]
      status?: string
    }
  ): Promise<KnowledgeArticle> {
    return apiClient.put(`${this.baseUrl}/knowledge/articles/${articleId}`, updates)
  }

  /**
   * Add article comment
   * Maps to: Comment management services
   */
  async addArticleComment(
    articleId: string,
    comment: {
      content: string
      isHelpful?: boolean
    }
  ): Promise<ArticleComment> {
    return apiClient.post(`${this.baseUrl}/knowledge/articles/${articleId}/comments`, comment)
  }

  /**
   * Rate knowledge article
   * Maps to: Rating services
   */
  async rateKnowledgeArticle(
    articleId: string,
    rating: {
      rating: number
      comment?: string
      dimensions: {
        accuracy: number
        clarity: number
        completeness: number
        usefulness: number
      }
    }
  ): Promise<ArticleRating> {
    return apiClient.post(`${this.baseUrl}/knowledge/articles/${articleId}/ratings`, rating)
  }

  // ===================== COLLABORATION ANALYTICS =====================

  /**
   * Get collaboration analytics
   * Maps to: Collaboration analytics services
   */
  async getCollaborationAnalytics(timeRange?: string): Promise<CollaborationAnalytics> {
    const params = new URLSearchParams()
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/analytics?${params.toString()}`)
  }

  /**
   * Get engagement metrics
   * Maps to: Engagement tracking services
   */
  async getEngagementMetrics(
    hubId?: string,
    timeRange?: string
  ): Promise<EngagementMetrics> {
    const params = new URLSearchParams()
    if (hubId) params.append('hub_id', hubId)
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/analytics/engagement?${params.toString()}`)
  }

  /**
   * Get productivity metrics
   * Maps to: Productivity tracking services
   */
  async getProductivityMetrics(
    teamId?: string,
    timeRange?: string
  ): Promise<ProductivityMetrics> {
    const params = new URLSearchParams()
    if (teamId) params.append('team_id', teamId)
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/analytics/productivity?${params.toString()}`)
  }

  /**
   * Get collaboration insights
   * Maps to: Insight generation services
   */
  async getCollaborationInsights(
    scope?: 'global' | 'hub' | 'user',
    scopeId?: string
  ): Promise<{
    insights: Array<{
      type: string
      title: string
      description: string
      impact: string
      recommendations: string[]
    }>
    patterns: Array<{
      pattern: string
      frequency: number
      significance: string
    }>
    opportunities: Array<{
      opportunity: string
      potentialValue: string
      effort: string
    }>
  }> {
    const params = new URLSearchParams()
    if (scope) params.append('scope', scope)
    if (scopeId) params.append('scope_id', scopeId)
    
    return apiClient.get(`${this.baseUrl}/analytics/insights?${params.toString()}`)
  }

  // ===================== REAL-TIME COLLABORATION =====================

  /**
   * Subscribe to collaboration updates
   * Maps to: WebSocket collaboration services
   */
  subscribeToCollaborationUpdates(
    hubId: string,
    callback: (update: {
      type: 'discussion' | 'annotation' | 'decision' | 'action_item'
      action: 'created' | 'updated' | 'deleted'
      data: any
      timestamp: string
      userId: string
    }) => void
  ): () => void {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/hubs/${hubId}/updates`)
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      callback(update)
    }
    
    return () => {
      ws.close()
    }
  }

  /**
   * Get online participants
   * Maps to: Real-time presence services
   */
  async getOnlineParticipants(hubId: string): Promise<Array<{
    participantId: string
    userName: string
    status: 'online' | 'away' | 'busy'
    lastSeen: string
    currentActivity?: string
  }>> {
    return apiClient.get(`${this.baseUrl}/hubs/${hubId}/presence`)
  }

  /**
   * Update presence status
   * Maps to: Presence management services
   */
  async updatePresenceStatus(
    hubId: string,
    status: 'online' | 'away' | 'busy',
    activity?: string
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/hubs/${hubId}/presence`, {
      status,
      activity
    })
  }
}

// Create singleton instance
export const catalogCollaborationApiClient = new CatalogCollaborationApiClient()

// Export default
export default catalogCollaborationApiClient