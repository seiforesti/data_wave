/**
 * Advanced Catalog Collaboration Types
 * ====================================
 * 
 * Maps to backend models:
 * - enhanced_collaboration_models.py
 * - catalog_intelligence_models.py (collaboration aspects)
 * - advanced_catalog_models.py (ownership/stewardship)
 * 
 * Provides comprehensive types for team collaboration, data stewardship,
 * crowdsourcing, expert consultation, and knowledge management.
 */

import { ReactNode } from 'react'

// ===================== BACKEND ENUM MAPPINGS =====================

export enum CollaborationType {
  REVIEW = 'review',
  ANNOTATION = 'annotation',
  DISCUSSION = 'discussion',
  APPROVAL = 'approval',
  SUGGESTION = 'suggestion',
  QUESTION = 'question',
  ISSUE_REPORT = 'issue_report',
  IMPROVEMENT = 'improvement'
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REVISION_REQUESTED = 'revision_requested'
}

export enum ParticipantRole {
  OWNER = 'owner',
  STEWARD = 'steward',
  REVIEWER = 'reviewer',
  CONTRIBUTOR = 'contributor',
  OBSERVER = 'observer',
  EXPERT = 'expert',
  STAKEHOLDER = 'stakeholder'
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum ExpertiseLevel {
  NOVICE = 'novice',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master'
}

export enum WorkflowStage {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVAL = 'approval',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  COMPLETE = 'complete'
}

// ===================== CORE COLLABORATION MODELS =====================

export interface CatalogCollaborationHub {
  id: string
  name: string
  description?: string
  type: CollaborationType
  assetId: string
  assetName: string
  assetType: string
  
  // Participants
  participants: CollaborationParticipant[]
  totalParticipants: number
  activeParticipants: number
  
  // Status and Progress
  status: ReviewStatus
  priority: Priority
  progress: number // 0-100
  stage: WorkflowStage
  
  // Timing
  startDate: string
  endDate?: string
  deadline?: string
  estimatedDuration?: number // minutes
  actualDuration?: number // minutes
  
  // Content and Discussion
  discussions: Discussion[]
  annotations: Annotation[]
  decisions: Decision[]
  actionItems: ActionItem[]
  
  // Metadata
  tags: string[]
  categories: string[]
  relatedHubs: string[]
  
  // AI Insights
  aiInsights?: AICollaborationInsight
  recommendedActions?: RecommendedAction[]
  smartSuggestions?: SmartSuggestion[]
  
  // Metrics
  engagementScore: number
  productivityScore: number
  consensusLevel: number
  
  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  lastActivity: string
}

export interface CollaborationParticipant {
  id: string
  userId: string
  userName: string
  email: string
  role: ParticipantRole
  expertiseLevel: ExpertiseLevel
  
  // Participation
  joinDate: string
  lastActive: string
  contributionCount: number
  engagementScore: number
  
  // Permissions
  canEdit: boolean
  canApprove: boolean
  canAssign: boolean
  canDelete: boolean
  
  // Expertise
  expertiseDomains: string[]
  skillsRating: Record<string, number>
  certifications: string[]
  
  // Notifications
  notificationPreferences: NotificationPreferences
  
  // Status
  isOnline: boolean
  isAvailable: boolean
  timezone: string
  workingHours?: WorkingHours
}

export interface Discussion {
  id: string
  title: string
  content: string
  type: CollaborationType
  
  // Threading
  parentId?: string
  threadDepth: number
  replies: Discussion[]
  
  // Participants
  authorId: string
  authorName: string
  mentions: string[]
  assignedTo?: string[]
  
  // Status
  status: ReviewStatus
  priority: Priority
  isResolved: boolean
  resolution?: string
  
  // Content
  attachments: Attachment[]
  tags: string[]
  reactions: Reaction[]
  
  // AI Analysis
  sentiment: number // -1 to 1
  topics: string[]
  keyPhrases: string[]
  actionItemsExtracted?: string[]
  
  // Timing
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  
  // Metrics
  viewCount: number
  upvotes: number
  downvotes: number
  importanceScore: number
}

export interface Annotation {
  id: string
  assetId: string
  targetType: 'asset' | 'column' | 'row' | 'cell' | 'schema'
  targetId: string
  
  // Content
  type: 'comment' | 'highlight' | 'suggestion' | 'issue' | 'question'
  content: string
  description?: string
  
  // Positioning (for UI annotations)
  coordinates?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  
  // Context
  contextData: Record<string, any>
  relatedAssets: string[]
  tags: string[]
  
  // Collaboration
  authorId: string
  authorName: string
  visibility: 'public' | 'private' | 'team' | 'stakeholders'
  
  // Status
  isActive: boolean
  isResolved: boolean
  priority: Priority
  
  // Responses
  responses: AnnotationResponse[]
  
  // AI Enhancement
  aiSummary?: string
  suggestedActions?: string[]
  
  // Timing
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface AnnotationResponse {
  id: string
  annotationId: string
  content: string
  authorId: string
  authorName: string
  type: 'response' | 'resolution' | 'clarification'
  createdAt: string
  reactions: Reaction[]
}

export interface Decision {
  id: string
  title: string
  description: string
  type: 'policy' | 'technical' | 'business' | 'governance'
  
  // Decision Details
  options: DecisionOption[]
  selectedOption?: string
  rationale?: string
  impact: ImpactAssessment
  
  // Approval Process
  approvers: Approver[]
  requiredApprovals: number
  currentApprovals: number
  
  // Status
  status: ReviewStatus
  priority: Priority
  confidence: number // 0-100
  
  // Context
  relatedAssets: string[]
  affectedStakeholders: string[]
  businessJustification: string
  
  // Implementation
  implementationPlan?: ImplementationPlan
  rollbackPlan?: string
  
  // Timing
  decisionDate?: string
  implementationDate?: string
  reviewDate?: string
  
  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  approvedBy?: string[]
}

export interface DecisionOption {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  cost: number
  effort: number
  risk: number
  impact: number
  feasibility: number
  votes: number
  supportingEvidence: string[]
}

export interface ActionItem {
  id: string
  title: string
  description: string
  type: 'task' | 'fix' | 'improvement' | 'investigation' | 'documentation'
  
  // Assignment
  assignedTo: string
  assignedBy: string
  team?: string
  
  // Status
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
  priority: Priority
  progress: number // 0-100
  
  // Timing
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  startDate?: string
  completedDate?: string
  
  // Dependencies
  dependencies: string[]
  blockers: string[]
  
  // Context
  relatedAssets: string[]
  context: string
  acceptanceCriteria: string[]
  
  // Tracking
  comments: ActionItemComment[]
  attachments: Attachment[]
  checklistItems: ChecklistItem[]
  
  // Metrics
  difficultyLevel: number // 1-10
  businessValue: number // 1-10
  
  // Audit
  createdAt: string
  updatedAt: string
}

export interface ActionItemComment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
  attachments: Attachment[]
}

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  completedBy?: string
  completedAt?: string
  order: number
}

// ===================== DATA STEWARDSHIP MODELS =====================

export interface DataStewardshipCenter {
  id: string
  name: string
  description: string
  scope: 'global' | 'domain' | 'asset' | 'team'
  
  // Stewardship Team
  stewards: DataSteward[]
  headSteward: string
  deputyStewards: string[]
  
  // Responsibilities
  responsibleAssets: string[]
  responsibleDomains: string[]
  governanceAreas: string[]
  
  // Policies and Standards
  policies: StewardshipPolicy[]
  standards: DataStandard[]
  procedures: Procedure[]
  
  // Performance
  stewardshipScore: number
  complianceRate: number
  issueResolutionTime: number // hours
  stakeholderSatisfaction: number
  
  // Workflow
  workflows: StewardshipWorkflow[]
  escalationPaths: EscalationPath[]
  
  // Metrics
  totalAssetsManaged: number
  activeIssues: number
  resolvedIssues: number
  improvementInitiatives: number
  
  // Audit
  createdAt: string
  updatedAt: string
  lastReview: string
  nextReview: string
}

export interface DataSteward {
  id: string
  userId: string
  userName: string
  email: string
  
  // Role and Responsibilities
  stewardshipLevel: 'junior' | 'senior' | 'lead' | 'chief'
  specializations: string[]
  certifications: string[]
  experienceYears: number
  
  // Assignment
  assignedAssets: string[]
  assignedDomains: string[]
  workload: number // 0-100
  capacity: number // hours per week
  
  // Performance
  performanceScore: number
  issuesResolved: number
  averageResolutionTime: number
  stakeholderRating: number
  
  // Skills
  technicalSkills: Skill[]
  businessSkills: Skill[]
  governanceKnowledge: string[]
  
  // Activity
  isActive: boolean
  lastActive: string
  timezone: string
  workingHours: WorkingHours
  
  // Contact
  contactPreferences: ContactPreferences
  escalationPath: string[]
}

export interface Skill {
  name: string
  level: ExpertiseLevel
  certification?: string
  lastAssessed: string
  verifiedBy?: string
}

export interface StewardshipPolicy {
  id: string
  name: string
  description: string
  type: 'governance' | 'quality' | 'access' | 'retention' | 'privacy'
  
  // Policy Details
  content: string
  version: string
  applicableAssets: string[]
  exceptions: PolicyException[]
  
  // Compliance
  mandatory: boolean
  complianceLevel: number
  violationCount: number
  
  // Approval
  approvedBy: string
  approvalDate: string
  effectiveDate: string
  expiryDate?: string
  
  // Review
  reviewFrequency: string // 'monthly', 'quarterly', etc.
  lastReview: string
  nextReview: string
  reviewers: string[]
}

export interface PolicyException {
  id: string
  assetId: string
  reason: string
  approvedBy: string
  approvalDate: string
  expiryDate: string
  conditions: string[]
}

// ===================== CROWDSOURCING MODELS =====================

export interface CrowdsourcingPlatform {
  id: string
  name: string
  description: string
  type: 'improvement' | 'validation' | 'enrichment' | 'classification'
  
  // Campaign
  campaigns: CrowdsourcingCampaign[]
  activeCampaigns: number
  
  // Participants
  contributors: Contributor[]
  totalContributors: number
  activeContributors: number
  
  // Rewards and Gamification
  rewardSystem: RewardSystem
  leaderboard: LeaderboardEntry[]
  achievements: Achievement[]
  
  // Quality Control
  qualityThreshold: number
  reviewProcess: ReviewProcess
  moderators: string[]
  
  // Metrics
  totalContributions: number
  approvedContributions: number
  rejectedContributions: number
  averageQuality: number
  
  // AI Integration
  aiValidation: boolean
  autoApprovalThreshold: number
  suggestionEngine: boolean
}

export interface CrowdsourcingCampaign {
  id: string
  title: string
  description: string
  type: 'tagging' | 'description' | 'classification' | 'validation' | 'quality_review'
  
  // Scope
  targetAssets: string[]
  estimatedTasks: number
  completedTasks: number
  
  // Participation
  participants: string[]
  minParticipants: number
  maxParticipants?: number
  
  // Rewards
  rewardPerTask: number
  bonusRewards: BonusReward[]
  totalRewardPool: number
  
  // Quality
  qualityRequirements: QualityRequirement[]
  reviewers: string[]
  consensusThreshold: number
  
  // Timeline
  startDate: string
  endDate: string
  estimatedDuration: number // hours
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  progress: number // 0-100
  
  // Results
  results: CampaignResult[]
  insights: CampaignInsight[]
}

export interface Contributor {
  id: string
  userId: string
  userName: string
  
  // Statistics
  totalContributions: number
  approvedContributions: number
  accuracyRate: number
  averageTaskTime: number
  
  // Expertise
  expertiseAreas: string[]
  trustScore: number
  qualityRating: number
  
  // Activity
  joinDate: string
  lastContribution: string
  isActive: boolean
  
  // Rewards
  pointsEarned: number
  rewardsReceived: Reward[]
  currentLevel: string
  achievements: string[]
  
  // Preferences
  preferredTaskTypes: string[]
  availableHours: number
  timezone: string
}

// ===================== EXPERT CONSULTATION MODELS =====================

export interface ExpertNetworking {
  id: string
  name: string
  description: string
  
  // Experts
  experts: Expert[]
  expertCategories: ExpertCategory[]
  
  // Consultation
  consultations: Consultation[]
  activeConsultations: number
  
  // Matching
  matchingAlgorithm: 'skill_based' | 'experience_based' | 'availability_based' | 'ai_recommended'
  autoMatching: boolean
  
  // Quality
  averageRating: number
  satisfactionScore: number
  responseTime: number // hours
  
  // Metrics
  totalConsultations: number
  resolvedConsultations: number
  expertUtilization: number
}

export interface Expert {
  id: string
  userId: string
  userName: string
  email: string
  
  // Expertise
  primaryExpertise: string[]
  secondaryExpertise: string[]
  certifications: ExpertCertification[]
  experienceYears: number
  
  // Performance
  rating: number
  totalConsultations: number
  successRate: number
  averageResponseTime: number
  
  // Availability
  isAvailable: boolean
  maxConsultationsPerWeek: number
  currentLoad: number
  timezone: string
  workingHours: WorkingHours
  
  // Preferences
  consultationTypes: string[]
  preferredMethods: string[] // 'chat', 'video', 'email', 'document'
  
  // Recognition
  achievements: string[]
  testimonials: Testimonial[]
  endorsements: Endorsement[]
}

export interface Consultation {
  id: string
  title: string
  description: string
  type: 'technical' | 'business' | 'governance' | 'quality' | 'security'
  
  // Participants
  requesterId: string
  expertId: string
  additionalParticipants: string[]
  
  // Details
  assetId?: string
  urgency: Priority
  estimatedDuration: number
  actualDuration?: number
  
  // Content
  questions: ConsultationQuestion[]
  responses: ConsultationResponse[]
  recommendations: ExpertRecommendation[]
  followUpActions: ActionItem[]
  
  // Status
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  method: 'chat' | 'video' | 'email' | 'document' | 'meeting'
  
  // Quality
  rating?: number
  feedback?: string
  wasHelpful: boolean
  
  // Timing
  requestedAt: string
  startedAt?: string
  completedAt?: string
  followUpDate?: string
  
  // Documentation
  summary: string
  actionItems: string[]
  attachments: Attachment[]
}

export interface ConsultationQuestion {
  id: string
  question: string
  context?: string
  priority: Priority
  askedAt: string
  isAnswered: boolean
  answer?: string
  answeredAt?: string
}

export interface ConsultationResponse {
  id: string
  content: string
  type: 'answer' | 'clarification' | 'recommendation' | 'resource'
  expertId: string
  createdAt: string
  attachments: Attachment[]
  isHelpful?: boolean
}

export interface ExpertRecommendation {
  id: string
  title: string
  description: string
  rationale: string
  priority: Priority
  implementationSteps: string[]
  expectedOutcome: string
  risks: string[]
  alternatives: string[]
  confidence: number // 0-100
  expertId: string
  createdAt: string
}

// ===================== KNOWLEDGE MANAGEMENT MODELS =====================

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  category: 'documentation' | 'best_practices' | 'troubleshooting' | 'tutorials' | 'policies'
  
  // Content
  articles: KnowledgeArticle[]
  totalArticles: number
  
  // Organization
  topics: Topic[]
  tags: string[]
  collections: ArticleCollection[]
  
  // Access
  visibility: 'public' | 'internal' | 'restricted'
  permissions: Permission[]
  
  // Quality
  qualityScore: number
  reviewCycle: string
  maintainers: string[]
  
  // Usage
  totalViews: number
  searchCount: number
  popularArticles: string[]
  
  // AI Features
  semanticSearch: boolean
  autoTagging: boolean
  contentRecommendations: boolean
  aiSummaries: boolean
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  summary: string
  type: 'howto' | 'reference' | 'tutorial' | 'faq' | 'policy' | 'best_practice'
  
  // Content Structure
  sections: ArticleSection[]
  tableOfContents: string[]
  
  // Metadata
  authorId: string
  authorName: string
  reviewers: string[]
  tags: string[]
  topics: string[]
  
  // Relationships
  relatedArticles: string[]
  relatedAssets: string[]
  prerequisites: string[]
  followUpActions: string[]
  
  // Quality
  version: string
  status: 'draft' | 'review' | 'published' | 'archived'
  qualityScore: number
  accuracy: number
  completeness: number
  
  // Usage
  viewCount: number
  upvotes: number
  downvotes: number
  bookmarks: number
  shares: number
  
  // Feedback
  comments: ArticleComment[]
  ratings: ArticleRating[]
  improvementSuggestions: ImprovementSuggestion[]
  
  // AI Analysis
  readingTime: number
  difficultyLevel: string
  aiSummary?: string
  keyTakeaways: string[]
  
  // Maintenance
  lastReview: string
  nextReview: string
  isOutdated: boolean
  updateFrequency: string
  
  // Audit
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastAccessed: string
}

export interface ArticleSection {
  id: string
  title: string
  content: string
  order: number
  type: 'text' | 'code' | 'image' | 'video' | 'diagram' | 'table'
  subsections?: ArticleSection[]
}

export interface ArticleComment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
  isHelpful: boolean
  replies: ArticleComment[]
}

export interface ArticleRating {
  id: string
  rating: number // 1-5
  comment?: string
  authorId: string
  createdAt: string
  dimensions: {
    accuracy: number
    clarity: number
    completeness: number
    usefulness: number
  }
}

// ===================== SHARED INTERFACE MODELS =====================

export interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: string
  description?: string
  tags: string[]
}

export interface Reaction {
  id: string
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'confused' | 'agree' | 'disagree'
  userId: string
  userName: string
  createdAt: string
}

export interface NotificationPreferences {
  email: boolean
  inApp: boolean
  push: boolean
  sms: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  channels: string[]
}

export interface WorkingHours {
  timezone: string
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface TimeSlot {
  start: string // HH:MM format
  end: string   // HH:MM format
}

export interface ContactPreferences {
  preferredMethod: 'email' | 'chat' | 'phone' | 'video'
  availability: 'always' | 'working_hours' | 'scheduled'
  responseTime: string // e.g., "within 2 hours"
}

// ===================== AI AND INSIGHTS =====================

export interface AICollaborationInsight {
  id: string
  type: 'pattern' | 'trend' | 'anomaly' | 'recommendation' | 'prediction'
  title: string
  description: string
  confidence: number
  impact: number
  evidence: string[]
  recommendations: string[]
  generatedAt: string
}

export interface RecommendedAction {
  id: string
  title: string
  description: string
  type: 'process_improvement' | 'quality_enhancement' | 'collaboration_boost' | 'efficiency_gain'
  priority: Priority
  effort: number // 1-10
  impact: number // 1-10
  confidence: number // 0-100
  steps: string[]
  resources: string[]
  timeline: string
}

export interface SmartSuggestion {
  id: string
  type: 'participant' | 'expert' | 'content' | 'process' | 'tool'
  suggestion: string
  reasoning: string
  confidence: number
  relevanceScore: number
  applicableContext: string[]
}

// ===================== REQUEST/RESPONSE INTERFACES =====================

export interface CreateCollaborationHubRequest {
  name: string
  description?: string
  type: CollaborationType
  assetId: string
  participants: string[]
  priority: Priority
  deadline?: string
  tags?: string[]
}

export interface UpdateCollaborationHubRequest {
  name?: string
  description?: string
  status?: ReviewStatus
  priority?: Priority
  deadline?: string
  tags?: string[]
}

export interface CreateDiscussionRequest {
  title: string
  content: string
  type: CollaborationType
  parentId?: string
  assignedTo?: string[]
  priority: Priority
  tags?: string[]
  attachments?: string[]
}

export interface CreateAnnotationRequest {
  assetId: string
  targetType: string
  targetId: string
  type: string
  content: string
  coordinates?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  visibility: string
  tags?: string[]
}

export interface StartConsultationRequest {
  title: string
  description: string
  type: string
  assetId?: string
  urgency: Priority
  estimatedDuration: number
  preferredMethod: string
  expertId?: string
}

export interface CreateKnowledgeArticleRequest {
  title: string
  content: string
  summary: string
  type: string
  tags: string[]
  topics: string[]
  relatedAssets?: string[]
}

// ===================== COLLABORATION ANALYTICS =====================

export interface CollaborationAnalytics {
  overview: CollaborationOverview
  engagement: EngagementMetrics
  productivity: ProductivityMetrics
  quality: QualityMetrics
  trends: TrendAnalysis
  insights: AnalyticsInsight[]
}

export interface CollaborationOverview {
  totalHubs: number
  activeHubs: number
  totalParticipants: number
  activeParticipants: number
  avgParticipantsPerHub: number
  completionRate: number
  avgDuration: number
  satisfactionScore: number
}

export interface EngagementMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  avgSessionDuration: number
  pageViewsPerSession: number
  contributionsPerUser: number
  responseRate: number
  participationRate: number
}

export interface ProductivityMetrics {
  tasksCompleted: number
  avgCompletionTime: number
  issuesResolved: number
  decisionsMade: number
  improvementsImplemented: number
  knowledgeArticlesCreated: number
  expertConsultations: number
  crowdsourcingTasks: number
}

export interface QualityMetrics {
  avgQualityScore: number
  reviewAccuracy: number
  expertiseUtilization: number
  knowledgeRelevance: number
  solutionEffectiveness: number
  stakeholderSatisfaction: number
  processCompliance: number
  continuousImprovement: number
}

export interface TrendAnalysis {
  engagementTrend: DataPoint[]
  productivityTrend: DataPoint[]
  qualityTrend: DataPoint[]
  participationTrend: DataPoint[]
  issueResolutionTrend: DataPoint[]
  knowledgeGrowthTrend: DataPoint[]
}

export interface DataPoint {
  date: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface AnalyticsInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly'
  title: string
  description: string
  metrics: string[]
  impact: 'high' | 'medium' | 'low'
  confidence: number
  recommendations: string[]
  generatedAt: string
}

// ===================== EXPORT ALL TYPES =====================

export type {
  ImpactAssessment,
  Approver,
  ImplementationPlan,
  StewardshipWorkflow,
  EscalationPath,
  DataStandard,
  Procedure,
  ReviewProcess,
  BonusReward,
  QualityRequirement,
  CampaignResult,
  CampaignInsight,
  Reward,
  ExpertCategory,
  ExpertCertification,
  Testimonial,
  Endorsement,
  Topic,
  ArticleCollection,
  Permission,
  ImprovementSuggestion
}