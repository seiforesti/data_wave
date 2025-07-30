// ============================================================================
// ADVANCED CATALOG COLLABORATION TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: catalog_collaboration_service.py, catalog_collaboration_models.py
// ============================================================================

import { 
  IntelligentDataAsset,
  TimePeriod,
  BaseEntity 
} from './catalog-core.types';

// ============================================================================
// CORE COLLABORATION TYPES
// ============================================================================

export interface CollaborationActivity extends BaseEntity {
  id: string;
  title: string;
  description?: string;
  type: CollaborationActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  
  // Assignment & Ownership
  createdBy: TeamMember;
  assignedTo?: TeamMember[];
  reviewers?: TeamMember[];
  
  // Related Assets
  relatedAssets?: IntelligentDataAsset[];
  assetIds?: string[];
  
  // Workflow
  workflowId?: string;
  parentActivityId?: string;
  childActivities?: CollaborationActivity[];
  
  // Collaboration Details
  comments?: ActivityComment[];
  attachments?: ActivityAttachment[];
  tags?: string[];
  
  // Timing & Metrics
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  responseTime?: number; // in hours
  
  // Metadata
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

export interface TeamMember extends BaseEntity {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  
  // Profile
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  
  // Roles & Permissions
  roles: CollaborationRole[];
  permissions: CollaborationPermission[];
  
  // Expertise & Skills
  expertise: ExpertiseArea[];
  skills: string[];
  certifications?: string[];
  
  // Activity & Status
  status: MemberStatus;
  lastActiveAt?: Date;
  joinedAt: Date;
  
  // Preferences
  notificationPreferences: NotificationPreferences;
  workingHours?: WorkingHours;
  
  // Metrics
  collaborationScore?: number;
  contributionLevel?: ContributionLevel;
  responsiveness?: number; // average response time in hours
  
  // Social
  connections?: TeamMember[];
  mentoring?: MentorshipRelation[];
}

export interface CollaborationProject extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  
  // Project Details
  type: ProjectType;
  priority: ProjectPriority;
  status: ProjectStatus;
  
  // Ownership & Team
  owner: TeamMember;
  team: TeamMember[];
  stakeholders?: TeamMember[];
  
  // Scope & Assets
  scope: ProjectScope;
  relatedAssets: IntelligentDataAsset[];
  deliverables: ProjectDeliverable[];
  
  // Timeline
  startDate: Date;
  endDate: Date;
  milestones: ProjectMilestone[];
  
  // Progress & Metrics
  progress: number; // 0-100
  budget?: ProjectBudget;
  risks?: ProjectRisk[];
  
  // Activities & Tasks
  activities: CollaborationActivity[];
  dependencies?: ProjectDependency[];
  
  // Collaboration
  workspace?: CollaborationWorkspace;
  communications: ProjectCommunication[];
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationMetrics extends BaseEntity {
  id: string;
  timeframe: TimePeriod;
  
  // Activity Metrics
  totalActivities: number;
  completedActivities: number;
  averageCompletionTime: number;
  activitiesByType: ActivityTypeMetrics[];
  activitiesByPriority: ActivityPriorityMetrics[];
  
  // Team Metrics
  totalTeamMembers: number;
  activeMembers: number;
  averageResponseTime: number;
  collaborationScore: number;
  
  // Project Metrics
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectSuccessRate: number;
  
  // Quality Metrics
  reviewCoverage: number;
  approvalRate: number;
  reworkRate: number;
  
  // Engagement Metrics
  participationRate: number;
  knowledgeSharingScore: number;
  mentorshipEngagement: number;
  
  // Trends
  trends: CollaborationTrend[];
  insights: CollaborationInsight[];
  
  // Benchmarks
  benchmarks?: CollaborationBenchmark[];
  
  // Timestamps
  calculatedAt: Date;
  validFrom: Date;
  validTo: Date;
}

export interface CollaborationNotification extends BaseEntity {
  id: string;
  
  // Notification Details
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  
  // Content
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  
  // Recipients
  recipients: TeamMember[];
  channels: NotificationChannel[];
  
  // Related Objects
  relatedActivity?: CollaborationActivity;
  relatedProject?: CollaborationProject;
  relatedAsset?: IntelligentDataAsset;
  
  // Status & Tracking
  status: NotificationStatus;
  readBy: NotificationRead[];
  deliveryStatus: NotificationDelivery[];
  
  // Scheduling
  scheduledAt?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface DataStewardshipTask extends BaseEntity {
  id: string;
  
  // Task Details
  title: string;
  description?: string;
  type: StewardshipTaskType;
  category: StewardshipCategory;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment
  assignedTo: TeamMember;
  reviewer?: TeamMember;
  steward: DataSteward;
  
  // Asset Context
  targetAssets: IntelligentDataAsset[];
  impactedAssets?: IntelligentDataAsset[];
  
  // Workflow
  workflowSteps: StewardshipStep[];
  currentStep: number;
  approvals: StewardshipApproval[];
  
  // Requirements
  requirements: StewardshipRequirement[];
  checklist: TaskChecklistItem[];
  
  // Quality & Compliance
  qualityGates: QualityGate[];
  complianceChecks: ComplianceCheck[];
  
  // Timeline
  dueDate: Date;
  estimatedEffort: number; // hours
  actualEffort?: number; // hours
  
  // Outcomes
  results?: StewardshipResult[];
  recommendations?: string[];
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface KnowledgeBaseArticle extends BaseEntity {
  id: string;
  
  // Content
  title: string;
  content: string;
  summary?: string;
  
  // Classification
  category: KnowledgeCategory;
  tags: string[];
  topics: string[];
  
  // Authorship
  author: TeamMember;
  contributors: TeamMember[];
  reviewers: TeamMember[];
  
  // Versioning
  version: string;
  previousVersions: ArticleVersion[];
  
  // Status & Lifecycle
  status: ArticleStatus;
  publishedAt?: Date;
  expiresAt?: Date;
  
  // Relationships
  relatedAssets: IntelligentDataAsset[];
  relatedArticles: KnowledgeBaseArticle[];
  prerequisites: KnowledgeBaseArticle[];
  
  // Engagement
  views: number;
  likes: number;
  bookmarks: number;
  comments: ArticleComment[];
  
  // Quality
  accuracy: number; // 0-1
  helpfulness: number; // 0-1
  lastReviewed: Date;
  
  // Search & Discovery
  searchKeywords: string[];
  visibility: ArticleVisibility;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityDiscussion extends BaseEntity {
  id: string;
  
  // Discussion Details
  title: string;
  description?: string;
  category: DiscussionCategory;
  tags: string[];
  
  // Participants
  creator: TeamMember;
  participants: TeamMember[];
  moderators: TeamMember[];
  
  // Content
  messages: DiscussionMessage[];
  attachments: DiscussionAttachment[];
  
  // Status & Moderation
  status: DiscussionStatus;
  visibility: DiscussionVisibility;
  moderation: ModerationInfo;
  
  // Engagement
  views: number;
  replies: number;
  reactions: DiscussionReaction[];
  
  // Related Context
  relatedAssets: IntelligentDataAsset[];
  relatedProjects: CollaborationProject[];
  relatedTopics: string[];
  
  // Resolution
  isResolved: boolean;
  resolution?: DiscussionResolution;
  acceptedAnswer?: DiscussionMessage;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export interface ExpertConnection extends BaseEntity {
  id: string;
  
  // Connection Details
  expert: TeamMember;
  requester: TeamMember;
  
  // Request Context
  topic: string;
  description?: string;
  urgency: ConnectionUrgency;
  
  // Expertise Match
  expertiseArea: ExpertiseArea;
  matchScore: number; // 0-1
  
  // Status & Lifecycle
  status: ConnectionStatus;
  requestedAt: Date;
  connectedAt?: Date;
  completedAt?: Date;
  
  // Interaction
  interactions: ExpertInteraction[];
  feedback?: ConnectionFeedback;
  
  // Outcomes
  resolution?: string;
  recommendations?: string[];
  followUpActions?: string[];
  
  // Related Context
  relatedAssets?: IntelligentDataAsset[];
  relatedProjects?: CollaborationProject[];
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationWorkspace extends BaseEntity {
  id: string;
  
  // Workspace Details
  name: string;
  description?: string;
  type: WorkspaceType;
  
  // Ownership & Access
  owner: TeamMember;
  members: WorkspaceMember[];
  accessLevel: WorkspaceAccessLevel;
  
  // Content & Organization
  projects: CollaborationProject[];
  activities: CollaborationActivity[];
  documents: WorkspaceDocument[];
  assets: IntelligentDataAsset[];
  
  // Configuration
  settings: WorkspaceSettings;
  templates: WorkspaceTemplate[];
  workflows: WorkspaceWorkflow[];
  
  // Collaboration Tools
  channels: CommunicationChannel[];
  meetings: WorkspaceMeeting[];
  
  // Analytics
  usage: WorkspaceUsage;
  analytics: WorkspaceAnalytics;
  
  // Status
  status: WorkspaceStatus;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export interface CollaborationInsight extends BaseEntity {
  id: string;
  
  // Insight Details
  title: string;
  description: string;
  type: InsightType;
  category: InsightCategory;
  
  // Analysis
  analysisMethod: string;
  dataSource: string[];
  timeframe: TimePeriod;
  
  // Findings
  findings: InsightFinding[];
  metrics: InsightMetric[];
  trends: InsightTrend[];
  
  // Recommendations
  recommendations: InsightRecommendation[];
  actionItems: ActionItem[];
  
  // Confidence & Quality
  confidence: number; // 0-1
  accuracy: number; // 0-1
  relevance: number; // 0-1
  
  // Impact
  impactLevel: ImpactLevel;
  businessValue: number;
  
  // Audience
  targetAudience: InsightAudience[];
  stakeholders: TeamMember[];
  
  // Status
  status: InsightStatus;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  generatedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

// ============================================================================
// SUPPORTING TYPES & ENUMS
// ============================================================================

export enum CollaborationActivityType {
  REVIEW = 'review',
  ANNOTATION = 'annotation',
  APPROVAL = 'approval',
  STEWARDSHIP = 'stewardship',
  DISCUSSION = 'discussion',
  VALIDATION = 'validation',
  DOCUMENTATION = 'documentation',
  TRAINING = 'training',
  AUDIT = 'audit',
  REMEDIATION = 'remediation'
}

export enum ActivityPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked'
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BUSY = 'busy',
  AWAY = 'away',
  OFFLINE = 'offline'
}

export enum CollaborationRole {
  ADMIN = 'admin',
  STEWARD = 'steward',
  ANALYST = 'analyst',
  REVIEWER = 'reviewer',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer',
  EXPERT = 'expert',
  MODERATOR = 'moderator'
}

export enum ProjectType {
  DATA_QUALITY = 'data_quality',
  GOVERNANCE = 'governance',
  MIGRATION = 'migration',
  INTEGRATION = 'integration',
  COMPLIANCE = 'compliance',
  ANALYTICS = 'analytics',
  DOCUMENTATION = 'documentation'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum NotificationType {
  ACTIVITY_ASSIGNED = 'activity_assigned',
  ACTIVITY_COMPLETED = 'activity_completed',
  REVIEW_REQUESTED = 'review_requested',
  APPROVAL_NEEDED = 'approval_needed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  PROJECT_UPDATE = 'project_update',
  MENTION = 'mention',
  SYSTEM_ALERT = 'system_alert'
}

export enum StewardshipTaskType {
  DATA_QUALITY_CHECK = 'data_quality_check',
  METADATA_REVIEW = 'metadata_review',
  ACCESS_REVIEW = 'access_review',
  COMPLIANCE_AUDIT = 'compliance_audit',
  CLASSIFICATION_REVIEW = 'classification_review',
  LINEAGE_VALIDATION = 'lineage_validation',
  DOCUMENTATION_UPDATE = 'documentation_update'
}

export enum KnowledgeCategory {
  BEST_PRACTICES = 'best_practices',
  PROCEDURES = 'procedures',
  TUTORIALS = 'tutorials',
  TROUBLESHOOTING = 'troubleshooting',
  STANDARDS = 'standards',
  GLOSSARY = 'glossary',
  FAQ = 'faq'
}

export enum DiscussionCategory {
  GENERAL = 'general',
  TECHNICAL = 'technical',
  GOVERNANCE = 'governance',
  QUALITY = 'quality',
  COMPLIANCE = 'compliance',
  BEST_PRACTICES = 'best_practices',
  HELP = 'help'
}

export enum WorkspaceType {
  PROJECT = 'project',
  DEPARTMENT = 'department',
  DOMAIN = 'domain',
  INITIATIVE = 'initiative',
  TEMPORARY = 'temporary'
}

export enum InsightType {
  TREND = 'trend',
  ANOMALY = 'anomaly',
  PATTERN = 'pattern',
  RECOMMENDATION = 'recommendation',
  PREDICTION = 'prediction',
  CORRELATION = 'correlation'
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface ActivityComment {
  id: string;
  author: TeamMember;
  content: string;
  mentions?: TeamMember[];
  reactions?: CommentReaction[];
  replies?: ActivityComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: TeamMember;
  uploadedAt: Date;
}

export interface CollaborationPermission {
  id: string;
  resource: string;
  action: string;
  granted: boolean;
  grantedBy?: TeamMember;
  grantedAt?: Date;
}

export interface ExpertiseArea {
  id: string;
  name: string;
  category: string;
  level: ExpertiseLevel;
  verified: boolean;
  verifiedBy?: TeamMember;
  verifiedAt?: Date;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  slack: boolean;
  digest: DigestFrequency;
  categories: NotificationCategory[];
}

export interface WorkingHours {
  timezone: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  workDays: number[]; // 0-6, 0 = Sunday
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  status: MilestoneStatus;
  deliverables: string[];
  completedAt?: Date;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description?: string;
  type: DeliverableType;
  status: DeliverableStatus;
  assignee: TeamMember;
  dueDate: Date;
  completedAt?: Date;
}

export interface CollaborationTrend {
  metric: string;
  direction: TrendDirection;
  magnitude: number;
  period: TimePeriod;
  significance: number; // 0-1
}

export interface ActivityTypeMetrics {
  type: CollaborationActivityType;
  count: number;
  averageCompletionTime: number;
  successRate: number;
}

export interface ActivityPriorityMetrics {
  priority: ActivityPriority;
  count: number;
  averageCompletionTime: number;
  overdueRate: number;
}

export interface StewardshipStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: StepStatus;
  assignee?: TeamMember;
  dueDate?: Date;
  completedAt?: Date;
  requirements?: string[];
}

export interface TaskChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: TeamMember;
  completedAt?: Date;
}

export interface DiscussionMessage {
  id: string;
  author: TeamMember;
  content: string;
  mentions?: TeamMember[];
  attachments?: DiscussionAttachment[];
  reactions?: MessageReaction[];
  replies?: DiscussionMessage[];
  isAnswer?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  member: TeamMember;
  role: WorkspaceRole;
  permissions: WorkspacePermission[];
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface InsightFinding {
  id: string;
  description: string;
  evidence: string[];
  confidence: number;
  impact: ImpactLevel;
}

export interface InsightRecommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  expectedBenefit: string;
  actionItems: string[];
}

// ============================================================================
// ADDITIONAL ENUMS
// ============================================================================

export enum ExpertiseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum DigestFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

export enum NotificationCategory {
  ASSIGNMENTS = 'assignments',
  REVIEWS = 'reviews',
  APPROVALS = 'approvals',
  DEADLINES = 'deadlines',
  MENTIONS = 'mentions',
  UPDATES = 'updates',
  ALERTS = 'alerts'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  SLACK = 'slack',
  TEAMS = 'teams',
  SMS = 'sms'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum StewardshipCategory {
  QUALITY = 'quality',
  GOVERNANCE = 'governance',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  DOCUMENTATION = 'documentation'
}

export enum ArticleStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated'
}

export enum ArticleVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  PRIVATE = 'private'
}

export enum DiscussionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  LOCKED = 'locked',
  ARCHIVED = 'archived'
}

export enum DiscussionVisibility {
  PUBLIC = 'public',
  TEAM = 'team',
  PROJECT = 'project',
  PRIVATE = 'private'
}

export enum ConnectionUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ConnectionStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  CANCELLED = 'cancelled'
}

export enum WorkspaceAccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  PRIVATE = 'private'
}

export enum WorkspaceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum InsightCategory {
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
  USAGE = 'usage',
  COLLABORATION = 'collaboration',
  COMPLIANCE = 'compliance',
  EFFICIENCY = 'efficiency'
}

export enum ImpactLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum InsightStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  ACTED_UPON = 'acted_upon',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export enum DeliverableType {
  DOCUMENT = 'document',
  DATASET = 'dataset',
  REPORT = 'report',
  DASHBOARD = 'dashboard',
  MODEL = 'model',
  PROCESS = 'process'
}

export enum DeliverableStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed'
}

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer'
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EffortLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTENSIVE = 'extensive'
}

export enum ContributionLevel {
  OBSERVER = 'observer',
  CONTRIBUTOR = 'contributor',
  ACTIVE_CONTRIBUTOR = 'active_contributor',
  LEADER = 'leader',
  CHAMPION = 'champion'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// ADDITIONAL SUPPORTING INTERFACES
// ============================================================================

export interface CommentReaction {
  type: string; // emoji or reaction type
  users: TeamMember[];
  count: number;
}

export interface MessageReaction {
  type: string;
  user: TeamMember;
  createdAt: Date;
}

export interface DiscussionReaction {
  type: string;
  user: TeamMember;
  createdAt: Date;
}

export interface DiscussionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: TeamMember;
  uploadedAt: Date;
}

export interface ModerationInfo {
  moderatedBy?: TeamMember;
  moderatedAt?: Date;
  reason?: string;
  actions?: ModerationAction[];
}

export interface ModerationAction {
  type: string;
  performedBy: TeamMember;
  performedAt: Date;
  reason?: string;
}

export interface DiscussionResolution {
  resolvedBy: TeamMember;
  resolvedAt: Date;
  resolution: string;
  acceptedAnswerId?: string;
}

export interface ExpertInteraction {
  id: string;
  type: InteractionType;
  description: string;
  duration?: number; // minutes
  outcome?: string;
  createdAt: Date;
}

export interface ConnectionFeedback {
  rating: number; // 1-5
  comments?: string;
  wouldRecommend: boolean;
  helpfulness: number; // 1-5
  responsiveness: number; // 1-5
  expertise: number; // 1-5
  providedBy: TeamMember;
  providedAt: Date;
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: TeamMember;
  uploadedAt: Date;
  lastModified: Date;
}

export interface WorkspaceSettings {
  visibility: WorkspaceAccessLevel;
  allowGuestAccess: boolean;
  requireApprovalForJoining: boolean;
  defaultMemberRole: WorkspaceRole;
  notificationSettings: WorkspaceNotificationSettings;
  integrations: WorkspaceIntegration[];
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  content: any;
  createdBy: TeamMember;
  createdAt: Date;
}

export interface WorkspaceWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  status: WorkflowStatus;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: ChannelType;
  members: TeamMember[];
  isPrivate: boolean;
  createdAt: Date;
}

export interface WorkspaceMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: TeamMember[];
  organizer: TeamMember;
  meetingUrl?: string;
  notes?: string;
}

export interface WorkspaceUsage {
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  totalActivities: number;
  storageUsed: number;
  lastActivityAt: Date;
}

export interface WorkspaceAnalytics {
  memberActivity: MemberActivityMetrics[];
  projectProgress: ProjectProgressMetrics[];
  collaborationMetrics: CollaborationMetrics;
  usageTrends: UsageTrend[];
}

export interface InsightMetric {
  name: string;
  value: number;
  unit: string;
  change?: number;
  changeDirection?: TrendDirection;
}

export interface InsightTrend {
  metric: string;
  values: TrendDataPoint[];
  direction: TrendDirection;
  significance: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignee?: TeamMember;
  dueDate?: Date;
  priority: ActionItemPriority;
  status: ActionItemStatus;
}

export interface InsightAudience {
  role: CollaborationRole;
  department?: string;
  relevance: number; // 0-1
}

export interface MentorshipRelation {
  id: string;
  mentor: TeamMember;
  mentee: TeamMember;
  status: MentorshipStatus;
  startDate: Date;
  endDate?: Date;
  focus: string[];
}

export interface ProjectScope {
  description: string;
  inclusions: string[];
  exclusions: string[];
  assumptions: string[];
  constraints: string[];
}

export interface ProjectBudget {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
  breakdown: BudgetItem[];
}

export interface ProjectRisk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: ImpactLevel;
  mitigation: string;
  owner: TeamMember;
  status: RiskStatus;
}

export interface ProjectDependency {
  id: string;
  type: DependencyType;
  description: string;
  dependsOn: string; // project or task ID
  status: DependencyStatus;
}

export interface ProjectCommunication {
  id: string;
  type: CommunicationType;
  subject: string;
  content: string;
  sender: TeamMember;
  recipients: TeamMember[];
  sentAt: Date;
}

export interface CollaborationBenchmark {
  metric: string;
  industryAverage: number;
  topPerformers: number;
  ourValue: number;
  percentile: number;
}

export interface NotificationRead {
  user: TeamMember;
  readAt: Date;
}

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptedAt: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface StewardshipRequirement {
  id: string;
  description: string;
  type: RequirementType;
  mandatory: boolean;
  verificationMethod: string;
  status: RequirementStatus;
}

export interface StewardshipApproval {
  id: string;
  approver: TeamMember;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: Date;
}

export interface QualityGate {
  id: string;
  name: string;
  criteria: QualityCriteria[];
  status: QualityGateStatus;
  evaluatedAt?: Date;
}

export interface ComplianceCheck {
  id: string;
  regulation: string;
  requirement: string;
  status: ComplianceStatus;
  evidence?: string[];
  lastChecked?: Date;
}

export interface StewardshipResult {
  id: string;
  type: ResultType;
  description: string;
  value: any;
  quality: number; // 0-1
  confidence: number; // 0-1
}

export interface ArticleVersion {
  version: string;
  changes: string;
  author: TeamMember;
  createdAt: Date;
}

export interface ArticleComment {
  id: string;
  author: TeamMember;
  content: string;
  rating?: number; // 1-5
  helpful: boolean;
  replies?: ArticleComment[];
  createdAt: Date;
}

export interface DataSteward {
  member: TeamMember;
  specializations: string[];
  certifications: string[];
  experience: number; // years
  rating: number; // 1-5
}

export interface WorkspacePermission {
  resource: string;
  action: string;
  granted: boolean;
}

export interface WorkspaceNotificationSettings {
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  digestFrequency: DigestFrequency;
  categories: NotificationCategory[];
}

export interface WorkspaceIntegration {
  type: IntegrationType;
  configuration: any;
  enabled: boolean;
  lastSyncAt?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  type: WorkflowStepType;
  configuration: any;
  conditions?: WorkflowCondition[];
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  event: string;
  conditions: WorkflowCondition[];
  enabled: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

export interface MemberActivityMetrics {
  member: TeamMember;
  activitiesCompleted: number;
  averageResponseTime: number;
  collaborationScore: number;
  lastActiveAt: Date;
}

export interface ProjectProgressMetrics {
  project: CollaborationProject;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  onSchedule: boolean;
}

export interface UsageTrend {
  metric: string;
  period: TimePeriod;
  values: TrendDataPoint[];
  direction: TrendDirection;
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
}

export interface BudgetItem {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface QualityCriteria {
  name: string;
  threshold: number;
  actualValue?: number;
  passed?: boolean;
}

// ============================================================================
// ADDITIONAL ENUMS FOR SUPPORTING TYPES
// ============================================================================

export enum InteractionType {
  CONSULTATION = 'consultation',
  REVIEW = 'review',
  TRAINING = 'training',
  MENTORING = 'mentoring',
  COLLABORATION = 'collaboration'
}

export enum TemplateType {
  PROJECT = 'project',
  ACTIVITY = 'activity',
  DOCUMENT = 'document',
  WORKFLOW = 'workflow'
}

export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
  VIDEO = 'video',
  ANNOUNCEMENT = 'announcement'
}

export enum ActionItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ActionItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MentorshipStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum RiskStatus {
  OPEN = 'open',
  MITIGATED = 'mitigated',
  ACCEPTED = 'accepted',
  CLOSED = 'closed'
}

export enum DependencyType {
  PREDECESSOR = 'predecessor',
  SUCCESSOR = 'successor',
  EXTERNAL = 'external',
  RESOURCE = 'resource'
}

export enum DependencyStatus {
  PENDING = 'pending',
  SATISFIED = 'satisfied',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum CommunicationType {
  EMAIL = 'email',
  ANNOUNCEMENT = 'announcement',
  UPDATE = 'update',
  ALERT = 'alert'
}

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced'
}

export enum RequirementType {
  FUNCTIONAL = 'functional',
  QUALITY = 'quality',
  COMPLIANCE = 'compliance',
  SECURITY = 'security'
}

export enum RequirementStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SATISFIED = 'satisfied',
  NOT_APPLICABLE = 'not_applicable'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional'
}

export enum QualityGateStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  WAIVED = 'waived'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review'
}

export enum ResultType {
  METRIC = 'metric',
  FINDING = 'finding',
  RECOMMENDATION = 'recommendation',
  ISSUE = 'issue'
}

export enum IntegrationType {
  SLACK = 'slack',
  TEAMS = 'teams',
  JIRA = 'jira',
  CONFLUENCE = 'confluence',
  GITHUB = 'github'
}

export enum WorkflowStepType {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification'
}

export enum TriggerType {
  EVENT = 'event',
  SCHEDULE = 'schedule',
  CONDITION = 'condition',
  MANUAL = 'manual'
}