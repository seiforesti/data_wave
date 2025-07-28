/**
 * Advanced Collaboration Types - Enterprise Collaboration Platform
 * ===============================================================
 * 
 * Complete mapping to backend collaboration models and services:
 * - Team collaboration workflows and workspaces
 * - Data stewardship and governance workflows
 * - Annotation and review systems
 * - Crowdsourcing and community contributions
 * - Expert networking and knowledge sharing
 * - Community forums and discussions
 * - Collaboration analytics and insights
 * 
 * This provides complete type definitions for:
 * - Team workspaces and project collaboration
 * - Data stewardship workflows and responsibilities
 * - Content annotation and review processes
 * - Crowdsourcing campaigns and contributions
 * - Expert networks and consultation systems
 * - Knowledge sharing and documentation
 * - Community engagement and forums
 * - Collaboration metrics and analytics
 */

// ========================= BASE COLLABORATION TYPES =========================

export interface CollaborationHub {
  hub_id: string;
  name: string;
  description?: string;
  hub_type: 'team' | 'project' | 'domain' | 'community' | 'stewardship';
  created_at: string;
  updated_at: string;
  created_by: string;
  members: CollaborationMember[];
  settings: HubSettings;
  permissions: HubPermissions;
  status: 'active' | 'inactive' | 'archived';
  metadata: Record<string, any>;
}

export interface CollaborationMember {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  role: CollaborationRole;
  joined_at: string;
  last_active: string;
  permissions: MemberPermissions;
  expertise_areas: string[];
  activity_level: 'low' | 'medium' | 'high';
  reputation_score: number;
}

export interface CollaborationRole {
  role_id: string;
  role_name: string;
  role_type: 'owner' | 'admin' | 'moderator' | 'contributor' | 'viewer';
  permissions: string[];
  can_invite: boolean;
  can_moderate: boolean;
  can_manage_content: boolean;
  can_manage_settings: boolean;
}

export interface HubSettings {
  visibility: 'public' | 'private' | 'restricted';
  join_policy: 'open' | 'approval_required' | 'invitation_only';
  content_moderation: 'none' | 'community' | 'moderator' | 'automatic';
  notification_settings: NotificationSettings;
  integration_settings: IntegrationSettings;
  workflow_settings: WorkflowSettings;
}

export interface NotificationSettings {
  email_notifications: boolean;
  in_app_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  notification_types: NotificationType[];
}

export interface NotificationType {
  type: string;
  enabled: boolean;
  recipients: 'all' | 'subscribers' | 'mentions' | 'custom';
  custom_recipients?: string[];
}

export interface IntegrationSettings {
  slack_integration?: SlackIntegration;
  teams_integration?: TeamsIntegration;
  email_integration?: EmailIntegration;
  webhook_integration?: WebhookIntegration;
  api_integration?: APIIntegration;
}

export interface WorkflowSettings {
  approval_workflows: ApprovalWorkflow[];
  review_workflows: ReviewWorkflow[];
  escalation_workflows: EscalationWorkflow[];
  automation_rules: AutomationRule[];
}

export interface HubPermissions {
  read_access: AccessControl;
  write_access: AccessControl;
  moderate_access: AccessControl;
  admin_access: AccessControl;
  custom_permissions: CustomPermission[];
}

export interface AccessControl {
  users: string[];
  roles: string[];
  groups: string[];
  conditions: AccessCondition[];
}

export interface AccessCondition {
  condition_type: 'time_based' | 'location_based' | 'attribute_based' | 'context_based';
  condition_value: any;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
}

export interface CustomPermission {
  permission_id: string;
  permission_name: string;
  description: string;
  scope: string[];
  assignees: string[];
}

// ========================= TEAM COLLABORATION =========================

export interface CollaborationRequest {
  name: string;
  description?: string;
  hub_type: 'team' | 'project' | 'domain' | 'community' | 'stewardship';
  initial_members?: string[];
  settings?: Partial<HubSettings>;
  project_scope?: ProjectScope;
  objectives?: string[];
  timeline?: ProjectTimeline;
}

export interface ProjectScope {
  domain_areas: string[];
  data_assets: string[];
  business_objectives: string[];
  success_criteria: string[];
  constraints: string[];
  deliverables: string[];
}

export interface ProjectTimeline {
  start_date: string;
  end_date?: string;
  milestones: ProjectMilestone[];
  phases: ProjectPhase[];
}

export interface ProjectMilestone {
  milestone_id: string;
  name: string;
  description?: string;
  target_date: string;
  completion_criteria: string[];
  dependencies: string[];
  assigned_to: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
}

export interface ProjectPhase {
  phase_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  objectives: string[];
  deliverables: string[];
  resources_required: string[];
}

export interface TeamActivity {
  activity_id: string;
  activity_type: 'message' | 'document' | 'task' | 'review' | 'decision' | 'meeting';
  hub_id: string;
  user_id: string;
  timestamp: string;
  title: string;
  description?: string;
  content?: any;
  attachments: ActivityAttachment[];
  mentions: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'resolved' | 'archived';
}

export interface ActivityAttachment {
  attachment_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  download_url: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
}

export interface CollaborationTask {
  task_id: string;
  title: string;
  description?: string;
  task_type: 'data_review' | 'documentation' | 'analysis' | 'validation' | 'research';
  hub_id: string;
  created_by: string;
  assigned_to: string[];
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  progress_percentage: number;
  dependencies: string[];
  subtasks: SubTask[];
  comments: TaskComment[];
  time_tracking: TimeTracking;
}

export interface SubTask {
  subtask_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
}

export interface TaskComment {
  comment_id: string;
  user_id: string;
  timestamp: string;
  content: string;
  comment_type: 'comment' | 'status_update' | 'question' | 'suggestion';
  attachments: ActivityAttachment[];
}

export interface TimeTracking {
  estimated_hours?: number;
  actual_hours: number;
  time_entries: TimeEntry[];
  billable: boolean;
}

export interface TimeEntry {
  entry_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  description?: string;
  activity_type: string;
}

// ========================= DATA STEWARDSHIP =========================

export interface DataStewardshipWorkflow {
  workflow_id: string;
  name: string;
  description?: string;
  workflow_type: 'data_quality' | 'governance' | 'lineage' | 'metadata' | 'compliance';
  created_at: string;
  created_by: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  participants: StewardshipParticipant[];
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  automation_rules: AutomationRule[];
  metrics: WorkflowMetrics;
}

export interface StewardshipParticipant {
  user_id: string;
  role: 'data_steward' | 'data_owner' | 'subject_expert' | 'reviewer' | 'approver';
  responsibilities: string[];
  authority_level: 'read' | 'comment' | 'edit' | 'approve' | 'manage';
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  immediate_notifications: string[];
  daily_digest: boolean;
  weekly_summary: boolean;
  escalation_notifications: boolean;
  mobile_notifications: boolean;
}

export interface WorkflowStep {
  step_id: string;
  step_name: string;
  step_type: 'review' | 'approval' | 'validation' | 'documentation' | 'decision';
  description?: string;
  assigned_to: string[];
  prerequisites: string[];
  actions_required: ActionRequired[];
  completion_criteria: string[];
  time_limit?: number;
  escalation_rules: EscalationRule[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
}

export interface ActionRequired {
  action_id: string;
  action_type: string;
  description: string;
  required: boolean;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  evidence?: any;
}

export interface WorkflowTrigger {
  trigger_id: string;
  trigger_type: 'manual' | 'scheduled' | 'event_based' | 'condition_based';
  trigger_condition: any;
  enabled: boolean;
  created_at: string;
}

export interface EscalationRule {
  rule_id: string;
  condition: string;
  escalate_to: string[];
  escalation_delay: number;
  escalation_message?: string;
  max_escalations: number;
}

export interface AutomationRule {
  rule_id: string;
  rule_name: string;
  condition: string;
  actions: AutomatedAction[];
  enabled: boolean;
  execution_count: number;
  last_executed?: string;
}

export interface AutomatedAction {
  action_type: string;
  action_config: Record<string, any>;
  success_criteria: string[];
  failure_handling: string;
}

export interface WorkflowMetrics {
  total_executions: number;
  successful_completions: number;
  average_completion_time: number;
  escalations_count: number;
  participant_satisfaction: number;
  process_efficiency: number;
}

export interface StewardshipAssignment {
  assignment_id: string;
  data_asset_id: string;
  steward_id: string;
  steward_type: 'primary' | 'secondary' | 'domain' | 'technical';
  assigned_at: string;
  assigned_by: string;
  responsibilities: StewardshipResponsibility[];
  authority_scope: AuthorityScope;
  performance_metrics: StewardshipMetrics;
  status: 'active' | 'inactive' | 'transferred';
}

export interface StewardshipResponsibility {
  responsibility_id: string;
  responsibility_type: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'as_needed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  success_criteria: string[];
}

export interface AuthorityScope {
  can_approve_changes: boolean;
  can_modify_metadata: boolean;
  can_grant_access: boolean;
  can_classify_data: boolean;
  can_define_quality_rules: boolean;
  approval_thresholds: ApprovalThreshold[];
}

export interface ApprovalThreshold {
  change_type: string;
  threshold_value: any;
  requires_additional_approval: boolean;
  additional_approvers?: string[];
}

export interface StewardshipMetrics {
  response_time_average: number;
  resolution_time_average: number;
  quality_improvement_score: number;
  compliance_score: number;
  user_satisfaction_rating: number;
  tasks_completed: number;
  issues_resolved: number;
}

// ========================= ANNOTATIONS & REVIEWS =========================

export interface DataAnnotation {
  annotation_id: string;
  data_asset_id: string;
  annotator_id: string;
  annotation_type: 'comment' | 'tag' | 'rating' | 'classification' | 'validation' | 'question';
  created_at: string;
  updated_at: string;
  content: AnnotationContent;
  visibility: 'public' | 'team' | 'private';
  status: 'active' | 'resolved' | 'archived';
  metadata: Record<string, any>;
}

export interface AnnotationContent {
  text_content?: string;
  structured_data?: Record<string, any>;
  attachments?: ActivityAttachment[];
  references?: AnnotationReference[];
  tags?: string[];
  rating?: AnnotationRating;
  classification?: AnnotationClassification;
}

export interface AnnotationReference {
  reference_type: 'asset' | 'user' | 'document' | 'url' | 'specification';
  reference_id: string;
  reference_title?: string;
  reference_url?: string;
}

export interface AnnotationRating {
  rating_scale: string;
  rating_value: number;
  max_rating: number;
  rating_criteria: string[];
}

export interface AnnotationClassification {
  classification_scheme: string;
  classification_value: string;
  confidence_score?: number;
  classification_rationale?: string;
}

export interface ReviewWorkflow {
  workflow_id: string;
  name: string;
  description?: string;
  review_type: 'content_review' | 'quality_review' | 'compliance_review' | 'peer_review';
  created_at: string;
  created_by: string;
  target_items: ReviewTarget[];
  reviewers: ReviewParticipant[];
  review_criteria: ReviewCriteria[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  timeline: ReviewTimeline;
  results: ReviewResult[];
}

export interface ReviewTarget {
  target_id: string;
  target_type: 'data_asset' | 'metadata' | 'documentation' | 'process' | 'policy';
  target_name: string;
  target_version?: string;
  review_scope: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReviewParticipant {
  user_id: string;
  reviewer_type: 'primary' | 'secondary' | 'subject_expert' | 'stakeholder';
  assignment_date: string;
  expertise_areas: string[];
  review_responsibilities: string[];
  availability: ReviewAvailability;
}

export interface ReviewAvailability {
  available_from: string;
  available_until: string;
  time_commitment: number;
  timezone: string;
  preferred_schedule: string[];
}

export interface ReviewCriteria {
  criteria_id: string;
  criteria_name: string;
  description: string;
  criteria_type: 'checklist' | 'rating' | 'qualitative' | 'quantitative';
  weight: number;
  measurement_method: string;
  success_threshold?: any;
}

export interface ReviewTimeline {
  start_date: string;
  end_date: string;
  review_phases: ReviewPhase[];
  deadlines: ReviewDeadline[];
  buffer_time: number;
}

export interface ReviewPhase {
  phase_id: string;
  phase_name: string;
  start_date: string;
  end_date: string;
  objectives: string[];
  deliverables: string[];
  participants: string[];
}

export interface ReviewDeadline {
  deadline_id: string;
  deadline_name: string;
  deadline_date: string;
  deadline_type: 'soft' | 'hard';
  consequences?: string;
}

export interface ReviewResult {
  result_id: string;
  reviewer_id: string;
  review_date: string;
  overall_rating?: number;
  criteria_ratings: CriteriaRating[];
  comments: ReviewComment[];
  recommendations: ReviewRecommendation[];
  approval_status: 'approved' | 'approved_with_conditions' | 'rejected' | 'needs_revision';
}

export interface CriteriaRating {
  criteria_id: string;
  rating_value: any;
  confidence_level: number;
  supporting_evidence?: string;
  comments?: string;
}

export interface ReviewComment {
  comment_id: string;
  comment_type: 'general' | 'specific' | 'suggestion' | 'concern' | 'compliment';
  content: string;
  target_section?: string;
  severity: 'info' | 'minor' | 'major' | 'critical';
  actionable: boolean;
}

export interface ReviewRecommendation {
  recommendation_id: string;
  recommendation_type: 'improvement' | 'correction' | 'enhancement' | 'compliance';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort_estimate: string;
  expected_benefit: string;
}

// ========================= CROWDSOURCING =========================

export interface CrowdsourcingCampaign {
  campaign_id: string;
  name: string;
  description: string;
  campaign_type: 'data_validation' | 'metadata_enrichment' | 'quality_assessment' | 'classification' | 'tagging';
  created_at: string;
  created_by: string;
  target_audience: CampaignAudience;
  objectives: CampaignObjective[];
  tasks: CrowdsourcingTask[];
  incentives: CampaignIncentive[];
  timeline: CampaignTimeline;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  metrics: CampaignMetrics;
}

export interface CampaignAudience {
  target_groups: string[];
  expertise_requirements: string[];
  minimum_reputation?: number;
  maximum_participants?: number;
  participation_criteria: ParticipationCriteria[];
}

export interface ParticipationCriteria {
  criteria_type: string;
  criteria_value: any;
  required: boolean;
  description: string;
}

export interface CampaignObjective {
  objective_id: string;
  objective_type: string;
  description: string;
  success_metrics: string[];
  target_value: any;
  deadline?: string;
}

export interface CrowdsourcingTask {
  task_id: string;
  task_type: string;
  title: string;
  description: string;
  instructions: TaskInstruction[];
  data_items: TaskDataItem[];
  completion_criteria: string[];
  time_estimate: number;
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert';
  rewards: TaskReward[];
}

export interface TaskInstruction {
  instruction_id: string;
  instruction_type: 'text' | 'video' | 'example' | 'checklist';
  content: any;
  order: number;
  required: boolean;
}

export interface TaskDataItem {
  item_id: string;
  item_type: string;
  item_content: any;
  context_information: Record<string, any>;
  existing_annotations?: any[];
}

export interface TaskReward {
  reward_type: 'points' | 'badge' | 'monetary' | 'recognition' | 'access';
  reward_value: any;
  reward_criteria: string[];
}

export interface CampaignIncentive {
  incentive_id: string;
  incentive_type: 'gamification' | 'monetary' | 'recognition' | 'learning' | 'social';
  description: string;
  qualification_criteria: string[];
  reward_structure: RewardStructure;
}

export interface RewardStructure {
  base_reward: any;
  performance_multipliers: PerformanceMultiplier[];
  bonus_conditions: BonusCondition[];
  leaderboard_rewards: LeaderboardReward[];
}

export interface PerformanceMultiplier {
  metric: string;
  threshold: number;
  multiplier: number;
}

export interface BonusCondition {
  condition: string;
  bonus_value: any;
  max_bonus?: any;
}

export interface LeaderboardReward {
  position_range: [number, number];
  reward_value: any;
  recognition_type: string;
}

export interface CampaignTimeline {
  start_date: string;
  end_date?: string;
  phases: CampaignPhase[];
  milestones: CampaignMilestone[];
}

export interface CampaignPhase {
  phase_id: string;
  phase_name: string;
  start_date: string;
  end_date: string;
  objectives: string[];
  target_metrics: Record<string, number>;
}

export interface CampaignMilestone {
  milestone_id: string;
  milestone_name: string;
  target_date: string;
  success_criteria: string[];
  celebration_actions?: string[];
}

export interface CampaignMetrics {
  total_participants: number;
  active_participants: number;
  tasks_completed: number;
  quality_score: number;
  participant_satisfaction: number;
  cost_per_task: number;
  time_to_completion: number;
}

export interface ContributionSubmission {
  submission_id: string;
  campaign_id: string;
  task_id: string;
  contributor_id: string;
  submitted_at: string;
  submission_content: any;
  submission_metadata: Record<string, any>;
  quality_score?: number;
  validation_status: 'pending' | 'validated' | 'rejected' | 'needs_revision';
  feedback: ContributionFeedback[];
  rewards_earned: RewardEarned[];
}

export interface ContributionFeedback {
  feedback_id: string;
  feedback_type: 'quality' | 'completeness' | 'accuracy' | 'improvement';
  feedback_content: string;
  feedback_score?: number;
  provided_by: string;
  provided_at: string;
}

export interface RewardEarned {
  reward_id: string;
  reward_type: string;
  reward_value: any;
  earned_at: string;
  redeemed: boolean;
  redeemed_at?: string;
}

// ========================= EXPERT NETWORKING =========================

export interface ExpertNetwork {
  network_id: string;
  name: string;
  description?: string;
  network_type: 'domain_expertise' | 'technical_skills' | 'industry_knowledge' | 'cross_functional';
  created_at: string;
  created_by: string;
  experts: ExpertProfile[];
  expertise_areas: ExpertiseArea[];
  network_settings: NetworkSettings;
  activity_metrics: NetworkActivityMetrics;
}

export interface ExpertProfile {
  expert_id: string;
  user_id: string;
  expertise_areas: ExpertiseDeclaration[];
  credentials: ExpertCredential[];
  experience_level: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'thought_leader';
  availability: ExpertAvailability;
  consultation_preferences: ConsultationPreferences;
  reputation: ExpertReputation;
  portfolio: ExpertPortfolio;
}

export interface ExpertiseDeclaration {
  expertise_id: string;
  domain: string;
  subdomain?: string;
  proficiency_level: number;
  years_of_experience: number;
  self_assessment: number;
  peer_validation: number;
  certification_level?: string;
  evidence: ExpertiseEvidence[];
}

export interface ExpertiseEvidence {
  evidence_type: 'project' | 'publication' | 'certification' | 'testimonial' | 'contribution';
  evidence_content: any;
  verification_status: 'unverified' | 'peer_verified' | 'officially_verified';
  verification_date?: string;
}

export interface ExpertCredential {
  credential_id: string;
  credential_type: 'certification' | 'degree' | 'award' | 'publication' | 'speaking';
  credential_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  verification_url?: string;
  credential_level: string;
}

export interface ExpertAvailability {
  availability_status: 'available' | 'limited' | 'unavailable' | 'by_appointment';
  available_hours_per_week: number;
  preferred_time_slots: TimeSlot[];
  timezone: string;
  consultation_methods: ConsultationMethod[];
  response_time_commitment: number;
}

export interface ConsultationMethod {
  method: 'video_call' | 'phone_call' | 'chat' | 'email' | 'in_person' | 'async_review';
  preferred: boolean;
  availability: string;
  rate?: ConsultationRate;
}

export interface ConsultationRate {
  rate_type: 'hourly' | 'per_session' | 'per_project' | 'pro_bono';
  rate_value?: number;
  currency?: string;
  minimum_engagement?: number;
}

export interface ConsultationPreferences {
  preferred_consultation_types: string[];
  expertise_sharing_willingness: number;
  mentoring_interest: boolean;
  collaboration_openness: number;
  preferred_project_sizes: string[];
  industry_preferences: string[];
}

export interface ExpertReputation {
  overall_rating: number;
  total_ratings: number;
  expertise_ratings: ExpertiseRating[];
  consultation_history: ConsultationHistory;
  community_contributions: CommunityContribution[];
  peer_endorsements: PeerEndorsement[];
}

export interface ExpertiseRating {
  expertise_area: string;
  average_rating: number;
  rating_count: number;
  rating_distribution: Record<number, number>;
  latest_ratings: Rating[];
}

export interface Rating {
  rating_value: number;
  review_text?: string;
  rated_by: string;
  rated_at: string;
  consultation_context: string;
}

export interface ConsultationHistory {
  total_consultations: number;
  successful_consultations: number;
  average_session_rating: number;
  repeat_client_rate: number;
  consultation_topics: Record<string, number>;
  consultation_outcomes: ConsultationOutcome[];
}

export interface ConsultationOutcome {
  outcome_type: 'problem_solved' | 'guidance_provided' | 'knowledge_transferred' | 'collaboration_initiated';
  success_rating: number;
  impact_assessment: string;
  follow_up_required: boolean;
}

export interface CommunityContribution {
  contribution_type: 'knowledge_article' | 'forum_answer' | 'code_contribution' | 'review' | 'mentoring';
  contribution_count: number;
  quality_score: number;
  community_impact: number;
  recognition_received: string[];
}

export interface PeerEndorsement {
  endorsement_id: string;
  endorsed_by: string;
  endorsement_type: 'skill' | 'expertise' | 'collaboration' | 'leadership';
  endorsement_text: string;
  endorsed_at: string;
  public_visibility: boolean;
}

export interface ExpertPortfolio {
  portfolio_items: PortfolioItem[];
  featured_projects: FeaturedProject[];
  publications: Publication[];
  presentations: Presentation[];
  awards_recognition: AwardRecognition[];
}

export interface PortfolioItem {
  item_id: string;
  item_type: 'project' | 'case_study' | 'tool' | 'framework' | 'methodology';
  title: string;
  description: string;
  technologies_used: string[];
  outcomes_achieved: string[];
  client_testimonial?: string;
  public_visibility: boolean;
}

export interface FeaturedProject {
  project_id: string;
  project_name: string;
  project_description: string;
  role_in_project: string;
  project_duration: string;
  key_achievements: string[];
  skills_demonstrated: string[];
  project_impact: ProjectImpact;
}

export interface ProjectImpact {
  business_impact: string;
  technical_impact: string;
  user_impact: string;
  quantifiable_results: Record<string, number>;
}

export interface Publication {
  publication_id: string;
  title: string;
  publication_type: 'journal_article' | 'conference_paper' | 'book' | 'blog_post' | 'white_paper';
  authors: string[];
  publication_venue: string;
  publication_date: string;
  abstract?: string;
  keywords: string[];
  citation_count?: number;
  access_url?: string;
}

export interface Presentation {
  presentation_id: string;
  title: string;
  presentation_type: 'conference' | 'workshop' | 'webinar' | 'internal' | 'keynote';
  venue: string;
  presentation_date: string;
  audience_size?: number;
  audience_feedback?: number;
  presentation_materials?: string;
}

export interface AwardRecognition {
  award_id: string;
  award_name: string;
  awarding_organization: string;
  award_date: string;
  award_category: string;
  award_description: string;
  recognition_level: 'local' | 'national' | 'international' | 'industry';
}

export interface ExpertiseArea {
  area_id: string;
  area_name: string;
  area_description: string;
  parent_area?: string;
  skill_categories: SkillCategory[];
  certification_programs: CertificationProgram[];
  expert_count: number;
  demand_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface SkillCategory {
  category_id: string;
  category_name: string;
  required_skills: string[];
  optional_skills: string[];
  proficiency_levels: ProficiencyLevel[];
}

export interface ProficiencyLevel {
  level: number;
  level_name: string;
  level_description: string;
  competency_requirements: string[];
  assessment_criteria: string[];
}

export interface CertificationProgram {
  program_id: string;
  program_name: string;
  certifying_body: string;
  certification_levels: string[];
  prerequisites: string[];
  renewal_requirements: string[];
  industry_recognition: number;
}

export interface NetworkSettings {
  visibility: 'public' | 'private' | 'restricted';
  membership_policy: 'open' | 'application' | 'invitation' | 'qualification_based';
  quality_standards: QualityStandard[];
  moderation_policies: ModerationPolicy[];
  expertise_validation: ExpertiseValidation;
}

export interface QualityStandard {
  standard_type: string;
  minimum_requirements: Record<string, any>;
  assessment_method: string;
  compliance_monitoring: boolean;
}

export interface ModerationPolicy {
  policy_type: string;
  policy_description: string;
  enforcement_actions: string[];
  appeal_process: string;
}

export interface ExpertiseValidation {
  validation_required: boolean;
  validation_methods: string[];
  validation_criteria: string[];
  revalidation_frequency: string;
  peer_validation_weight: number;
}

export interface NetworkActivityMetrics {
  total_consultations: number;
  active_experts: number;
  average_response_time: number;
  satisfaction_rating: number;
  knowledge_sharing_events: number;
  network_growth_rate: number;
  expertise_coverage: ExpertiseCoverage[];
}

export interface ExpertiseCoverage {
  expertise_area: string;
  expert_count: number;
  demand_supply_ratio: number;
  coverage_quality: number;
  gaps_identified: string[];
}

// ========================= KNOWLEDGE SHARING =========================

export interface KnowledgeRepository {
  repository_id: string;
  name: string;
  description?: string;
  repository_type: 'documentation' | 'best_practices' | 'tutorials' | 'case_studies' | 'templates';
  created_at: string;
  created_by: string;
  knowledge_items: KnowledgeItem[];
  categories: KnowledgeCategory[];
  access_policies: AccessPolicy[];
  quality_standards: KnowledgeQualityStandard[];
  metrics: RepositoryMetrics;
}

export interface KnowledgeItem {
  item_id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'presentation' | 'template' | 'checklist' | 'diagram';
  content: KnowledgeContent;
  author_id: string;
  contributors: string[];
  created_at: string;
  updated_at: string;
  version: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  tags: string[];
  categories: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time: number;
  prerequisites: string[];
  learning_objectives: string[];
  related_items: string[];
  quality_metrics: ContentQualityMetrics;
  usage_analytics: ContentUsageAnalytics;
}

export interface KnowledgeContent {
  text_content?: string;
  structured_content?: any;
  multimedia_content?: MultimediaContent[];
  interactive_elements?: InteractiveElement[];
  code_examples?: CodeExample[];
  attachments?: ActivityAttachment[];
}

export interface MultimediaContent {
  content_id: string;
  content_type: 'image' | 'video' | 'audio' | 'animation' | 'diagram';
  content_url: string;
  thumbnail_url?: string;
  caption?: string;
  alt_text?: string;
  duration?: number;
  file_size: number;
}

export interface InteractiveElement {
  element_id: string;
  element_type: 'quiz' | 'simulation' | 'calculator' | 'form' | 'survey';
  element_config: Record<string, any>;
  interaction_data?: any;
}

export interface CodeExample {
  example_id: string;
  language: string;
  code_content: string;
  explanation: string;
  execution_environment?: string;
  expected_output?: string;
  complexity_level: string;
}

export interface KnowledgeCategory {
  category_id: string;
  category_name: string;
  parent_category?: string;
  description?: string;
  category_icon?: string;
  subcategories: string[];
  item_count: number;
  popularity_rank: number;
}

export interface AccessPolicy {
  policy_id: string;
  policy_name: string;
  policy_type: 'read' | 'contribute' | 'moderate' | 'administer';
  allowed_users: string[];
  allowed_roles: string[];
  restrictions: AccessRestriction[];
  approval_required: boolean;
}

export interface AccessRestriction {
  restriction_type: 'time_based' | 'location_based' | 'device_based' | 'content_based';
  restriction_value: any;
  exemptions: string[];
}

export interface KnowledgeQualityStandard {
  standard_id: string;
  standard_name: string;
  quality_criteria: QualityCriteria[];
  minimum_scores: Record<string, number>;
  review_process: ReviewProcess;
  enforcement_actions: string[];
}

export interface QualityCriteria {
  criteria_name: string;
  criteria_description: string;
  measurement_method: string;
  weight: number;
  acceptable_range: [number, number];
}

export interface ReviewProcess {
  review_stages: ReviewStage[];
  reviewer_qualifications: string[];
  review_timeline: number;
  approval_threshold: number;
}

export interface ReviewStage {
  stage_name: string;
  stage_description: string;
  reviewer_count: number;
  stage_duration: number;
  exit_criteria: string[];
}

export interface RepositoryMetrics {
  total_items: number;
  active_contributors: number;
  monthly_views: number;
  user_satisfaction: number;
  content_freshness: number;
  knowledge_reuse_rate: number;
  search_success_rate: number;
}

export interface ContentQualityMetrics {
  accuracy_score: number;
  completeness_score: number;
  clarity_score: number;
  relevance_score: number;
  freshness_score: number;
  user_rating: number;
  expert_validation: boolean;
}

export interface ContentUsageAnalytics {
  view_count: number;
  unique_viewers: number;
  average_time_spent: number;
  completion_rate: number;
  bookmark_count: number;
  share_count: number;
  feedback_count: number;
  search_ranking: number;
}

export interface KnowledgeSharingEvent {
  event_id: string;
  event_name: string;
  event_type: 'webinar' | 'workshop' | 'knowledge_cafe' | 'expert_session' | 'community_call';
  description: string;
  organizer_id: string;
  speakers: EventSpeaker[];
  agenda: EventAgenda[];
  scheduled_at: string;
  duration: number;
  capacity: number;
  registration_required: boolean;
  event_format: 'in_person' | 'virtual' | 'hybrid';
  recording_available: boolean;
  materials: EventMaterial[];
  attendee_feedback: AttendeeFeedback[];
  follow_up_actions: FollowUpAction[];
}

export interface EventSpeaker {
  speaker_id: string;
  speaker_name: string;
  speaker_title: string;
  speaker_bio: string;
  expertise_areas: string[];
  speaker_photo?: string;
  contact_info?: string;
}

export interface EventAgenda {
  agenda_item_id: string;
  title: string;
  description?: string;
  start_time: string;
  duration: number;
  speaker_id?: string;
  session_type: 'presentation' | 'discussion' | 'q_and_a' | 'hands_on' | 'networking';
  materials_needed: string[];
}

export interface EventMaterial {
  material_id: string;
  material_type: 'slides' | 'handout' | 'recording' | 'resource_list' | 'exercise';
  material_name: string;
  material_url: string;
  availability: 'before_event' | 'during_event' | 'after_event' | 'always';
}

export interface AttendeeFeedback {
  feedback_id: string;
  attendee_id: string;
  overall_rating: number;
  content_quality: number;
  speaker_effectiveness: number;
  event_organization: number;
  likelihood_to_recommend: number;
  written_feedback?: string;
  improvement_suggestions: string[];
}

export interface FollowUpAction {
  action_id: string;
  action_type: 'resource_sharing' | 'community_formation' | 'project_initiation' | 'expertise_connection';
  action_description: string;
  responsible_party: string;
  due_date?: string;
  status: 'planned' | 'in_progress' | 'completed';
}

// ========================= COMMUNITY FORUMS =========================

export interface CommunityForum {
  forum_id: string;
  name: string;
  description: string;
  forum_type: 'general_discussion' | 'q_and_a' | 'announcements' | 'feature_requests' | 'technical_support';
  created_at: string;
  created_by: string;
  moderators: ForumModerator[];
  categories: ForumCategory[];
  rules: ForumRule[];
  settings: ForumSettings;
  statistics: ForumStatistics;
}

export interface ForumModerator {
  moderator_id: string;
  user_id: string;
  appointed_at: string;
  moderation_permissions: ModerationPermission[];
  moderation_statistics: ModerationStatistics;
}

export interface ModerationPermission {
  permission_type: 'delete_posts' | 'edit_posts' | 'ban_users' | 'pin_topics' | 'close_topics';
  permission_scope: 'all_categories' | 'specific_categories' | 'own_posts';
  category_restrictions?: string[];
}

export interface ModerationStatistics {
  actions_taken: number;
  warnings_issued: number;
  posts_moderated: number;
  users_banned: number;
  community_satisfaction: number;
}

export interface ForumCategory {
  category_id: string;
  category_name: string;
  description?: string;
  parent_category?: string;
  display_order: number;
  post_count: number;
  topic_count: number;
  last_activity: string;
  category_icon?: string;
  access_restrictions?: AccessRestriction[];
}

export interface ForumRule {
  rule_id: string;
  rule_title: string;
  rule_description: string;
  rule_type: 'content_guideline' | 'behavior_expectation' | 'posting_requirement' | 'enforcement_policy';
  violation_consequences: string[];
  examples: RuleExample[];
}

export interface RuleExample {
  example_type: 'acceptable' | 'unacceptable';
  example_description: string;
  example_content?: string;
}

export interface ForumSettings {
  posting_permissions: PostingPermission[];
  moderation_settings: ModerationSettings;
  notification_settings: ForumNotificationSettings;
  search_settings: SearchSettings;
  gamification_settings: GamificationSettings;
}

export interface PostingPermission {
  permission_type: 'create_topic' | 'reply_to_topic' | 'upload_attachments' | 'use_formatting';
  required_role?: string;
  minimum_reputation?: number;
  waiting_period?: number;
}

export interface ModerationSettings {
  auto_moderation_enabled: boolean;
  pre_moderation_required: boolean;
  spam_detection_enabled: boolean;
  profanity_filter_enabled: boolean;
  moderation_queue_enabled: boolean;
}

export interface ForumNotificationSettings {
  new_post_notifications: boolean;
  reply_notifications: boolean;
  mention_notifications: boolean;
  moderation_notifications: boolean;
  digest_frequency: 'daily' | 'weekly' | 'monthly';
}

export interface SearchSettings {
  full_text_search_enabled: boolean;
  search_filters_available: string[];
  search_result_ranking: 'chronological' | 'relevance' | 'popularity';
  advanced_search_enabled: boolean;
}

export interface GamificationSettings {
  reputation_system_enabled: boolean;
  badge_system_enabled: boolean;
  leaderboard_enabled: boolean;
  point_values: PointValue[];
  achievement_criteria: AchievementCriteria[];
}

export interface PointValue {
  action_type: string;
  points_awarded: number;
  daily_limit?: number;
}

export interface AchievementCriteria {
  achievement_name: string;
  achievement_description: string;
  criteria: Record<string, any>;
  badge_awarded?: string;
  points_awarded?: number;
}

export interface ForumStatistics {
  total_topics: number;
  total_posts: number;
  active_users: number;
  monthly_posts: number;
  average_response_time: number;
  popular_categories: PopularCategory[];
  user_engagement_metrics: UserEngagementMetrics;
}

export interface PopularCategory {
  category_id: string;
  category_name: string;
  post_count: number;
  view_count: number;
  activity_level: 'low' | 'medium' | 'high' | 'very_high';
}

export interface UserEngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  user_retention_rate: number;
  average_session_duration: number;
  posts_per_user: number;
}

export interface ForumTopic {
  topic_id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  category_id: string;
  tags: string[];
  topic_type: 'discussion' | 'question' | 'announcement' | 'poll' | 'idea';
  status: 'open' | 'closed' | 'pinned' | 'archived';
  priority: 'normal' | 'high' | 'urgent';
  post_count: number;
  view_count: number;
  last_activity: string;
  participants: string[];
  votes: TopicVote[];
  moderation_actions: ModerationAction[];
}

export interface TopicVote {
  vote_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote' | 'helpful' | 'solved';
  voted_at: string;
}

export interface ModerationAction {
  action_id: string;
  action_type: 'edit' | 'delete' | 'move' | 'close' | 'pin' | 'warn';
  performed_by: string;
  performed_at: string;
  reason: string;
  action_details?: Record<string, any>;
}

export interface ForumPost {
  post_id: string;
  topic_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  post_number: number;
  reply_to_post?: string;
  attachments: PostAttachment[];
  formatting: PostFormatting;
  votes: PostVote[];
  reports: PostReport[];
  moderation_status: 'approved' | 'pending' | 'flagged' | 'hidden';
}

export interface PostAttachment {
  attachment_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  download_url: string;
  thumbnail_url?: string;
  virus_scan_status: 'clean' | 'infected' | 'pending';
}

export interface PostFormatting {
  has_code_blocks: boolean;
  has_links: boolean;
  has_mentions: boolean;
  has_quotes: boolean;
  formatting_version: string;
}

export interface PostVote {
  vote_id: string;
  user_id: string;
  vote_type: 'helpful' | 'not_helpful' | 'agree' | 'disagree';
  voted_at: string;
}

export interface PostReport {
  report_id: string;
  reported_by: string;
  report_reason: string;
  report_category: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  reported_at: string;
  report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderator_notes?: string;
}

// ========================= RESPONSE TYPES =========================

export interface SlackIntegration {
  webhook_url: string;
  channel: string;
  enabled: boolean;
  message_template: string;
}

export interface TeamsIntegration {
  webhook_url: string;
  channel: string;
  enabled: boolean;
  message_template: string;
}

export interface EmailIntegration {
  smtp_settings: SMTPSettings;
  email_templates: EmailTemplate[];
  enabled: boolean;
}

export interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  use_tls: boolean;
}

export interface EmailTemplate {
  template_id: string;
  template_name: string;
  subject: string;
  body: string;
  template_type: string;
}

export interface WebhookIntegration {
  webhook_url: string;
  secret_key?: string;
  enabled: boolean;
  event_types: string[];
}

export interface APIIntegration {
  api_endpoint: string;
  api_key: string;
  enabled: boolean;
  supported_operations: string[];
}

export interface ApprovalWorkflow {
  workflow_id: string;
  workflow_name: string;
  approval_steps: ApprovalStep[];
  escalation_rules: EscalationRule[];
}

export interface ApprovalStep {
  step_id: string;
  step_name: string;
  approvers: string[];
  approval_threshold: number;
  time_limit?: number;
}

export interface EscalationWorkflow {
  workflow_id: string;
  workflow_name: string;
  escalation_triggers: EscalationTrigger[];
  escalation_actions: EscalationAction[];
}

export interface EscalationTrigger {
  trigger_condition: string;
  trigger_threshold: any;
  time_based: boolean;
}

export interface EscalationAction {
  action_type: string;
  action_target: string;
  action_message?: string;
}

export interface MemberPermissions {
  read_permissions: string[];
  write_permissions: string[];
  admin_permissions: string[];
  custom_permissions: string[];
}

export interface ResourceRequirement {
  resource_type: string;
  resource_amount: number;
  resource_unit: string;
  availability_requirement: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  day_of_week?: number;
  timezone?: string;
  activity_level?: 'low' | 'medium' | 'high' | 'peak';
}

// Export main collaboration API interface
export interface CollaborationAPI {
  hubs: CollaborationHub[];
  activities: TeamActivity[];
  tasks: CollaborationTask[];
  stewardship: DataStewardshipWorkflow[];
  annotations: DataAnnotation[];
  reviews: ReviewWorkflow[];
  crowdsourcing: CrowdsourcingCampaign[];
  expert_network: ExpertNetwork[];
  knowledge_repository: KnowledgeRepository[];
  forums: CommunityForum[];
}