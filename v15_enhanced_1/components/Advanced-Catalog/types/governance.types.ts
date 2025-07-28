/**
 * Advanced Catalog Governance Types
 * =================================
 * 
 * Comprehensive governance type definitions for the Advanced Catalog system.
 * Maps to backend governance, compliance, and policy management services.
 * 
 * Backend Files Mapped:
 * - unified_governance_coordinator.py (782 lines)
 * - compliance_service.py (434 lines)
 * - governance_apis.ts (919 lines)
 * - compliance_rule_service.py (1379 lines)
 */

import { 
  AssetType, 
  AssetStatus, 
  DataSensitivity,
  AssetCriticality,
  IntelligentDataAsset 
} from './catalog-core.types';

// ========================= GOVERNANCE ENUMS =========================

export enum PolicyType {
  ACCESS_CONTROL = "access_control",
  DATA_RETENTION = "data_retention",
  DATA_CLASSIFICATION = "data_classification",
  QUALITY_STANDARDS = "quality_standards",
  USAGE_RESTRICTIONS = "usage_restrictions",
  PRIVACY_PROTECTION = "privacy_protection",
  COMPLIANCE_REQUIREMENT = "compliance_requirement",
  BUSINESS_RULE = "business_rule"
}

export enum PolicyStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DEPRECATED = "deprecated",
  ARCHIVED = "archived"
}

export enum ComplianceFramework {
  GDPR = "gdpr",
  CCPA = "ccpa",
  HIPAA = "hipaa",
  SOX = "sox",
  PCI_DSS = "pci_dss",
  SOC2 = "soc2",
  ISO27001 = "iso27001",
  NIST = "nist",
  CUSTOM = "custom"
}

export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PARTIALLY_COMPLIANT = "partially_compliant",
  UNDER_REVIEW = "under_review",
  EXEMPT = "exempt",
  UNKNOWN = "unknown"
}

export enum RiskLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  MINIMAL = "minimal"
}

export enum GovernanceRole {
  DATA_OWNER = "data_owner",
  DATA_STEWARD = "data_steward",
  DATA_CUSTODIAN = "data_custodian",
  COMPLIANCE_OFFICER = "compliance_officer",
  PRIVACY_OFFICER = "privacy_officer",
  BUSINESS_ANALYST = "business_analyst",
  DATA_ARCHITECT = "data_architect"
}

export enum AuditEventType {
  POLICY_CREATED = "policy_created",
  POLICY_UPDATED = "policy_updated",
  POLICY_ACTIVATED = "policy_activated",
  POLICY_VIOLATED = "policy_violated",
  ACCESS_GRANTED = "access_granted",
  ACCESS_DENIED = "access_denied",
  DATA_ACCESSED = "data_accessed",
  DATA_MODIFIED = "data_modified",
  COMPLIANCE_CHECK = "compliance_check",
  RISK_ASSESSMENT = "risk_assessment"
}

// ========================= POLICY MANAGEMENT =========================

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  policy_type: PolicyType;
  status: PolicyStatus;
  
  // Policy Definition
  policy_rules: PolicyRule[];
  enforcement_level: 'advisory' | 'warning' | 'blocking';
  scope: PolicyScope;
  
  // Compliance Mapping
  compliance_frameworks: ComplianceFramework[];
  regulatory_requirements: string[];
  
  // Metadata
  version: string;
  effective_date: string;
  expiry_date?: string;
  
  // Ownership and Approval
  owner: string;
  steward?: string;
  approved_by: string;
  approval_date: string;
  
  // Implementation
  implementation_guidance: string;
  monitoring_frequency: MonitoringFrequency;
  violation_handling: ViolationHandling;
  
  // Analytics
  violation_count: number;
  compliance_score: number;
  last_assessment: string;
  
  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  
  // Additional Properties
  tags: string[];
  custom_properties: Record<string, any>;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  rule_type: PolicyRuleType;
  condition: RuleCondition;
  action: RuleAction;
  parameters: Record<string, any>;
  priority: number;
  is_active: boolean;
}

export enum PolicyRuleType {
  ACCESS_RESTRICTION = "access_restriction",
  DATA_MASKING = "data_masking",
  RETENTION_PERIOD = "retention_period",
  QUALITY_THRESHOLD = "quality_threshold",
  USAGE_MONITORING = "usage_monitoring",
  CLASSIFICATION_REQUIREMENT = "classification_requirement"
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logical_operator?: LogicalOperator;
  nested_conditions?: RuleCondition[];
}

export enum ConditionOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  IN = "in",
  NOT_IN = "not_in",
  REGEX_MATCH = "regex_match"
}

export enum LogicalOperator {
  AND = "and",
  OR = "or",
  NOT = "not"
}

export interface RuleAction {
  action_type: ActionType;
  parameters: Record<string, any>;
  notification?: NotificationConfig;
}

export enum ActionType {
  BLOCK_ACCESS = "block_access",
  REQUIRE_APPROVAL = "require_approval",
  APPLY_MASKING = "apply_masking",
  LOG_ACCESS = "log_access",
  SEND_ALERT = "send_alert",
  ESCALATE = "escalate",
  AUDIT_LOG = "audit_log"
}

export interface PolicyScope {
  asset_types?: AssetType[];
  source_systems?: string[];
  databases?: string[];
  schemas?: string[];
  specific_assets?: string[];
  tags?: string[];
  classification_levels?: DataSensitivity[];
  user_roles?: string[];
  departments?: string[];
}

export enum MonitoringFrequency {
  REAL_TIME = "real_time",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly"
}

export interface ViolationHandling {
  immediate_action: ActionType;
  escalation_rules: EscalationRule[];
  notification_recipients: string[];
  remediation_guidance: string;
}

export interface EscalationRule {
  trigger_condition: string;
  escalation_level: number;
  escalate_to: string[];
  escalation_delay_minutes: number;
}

// ========================= COMPLIANCE MANAGEMENT =========================

export interface ComplianceFrameworkMapping {
  id: string;
  framework: ComplianceFramework;
  framework_version: string;
  requirements: ComplianceRequirement[];
  assessment_criteria: AssessmentCriteria[];
  implementation_guide: string;
  certification_requirements?: CertificationRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  requirement_id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  implementation_guidance: string;
  evidence_requirements: string[];
  related_policies: string[];
  assessment_frequency: MonitoringFrequency;
}

export interface AssessmentCriteria {
  criteria_id: string;
  name: string;
  description: string;
  measurement_method: MeasurementMethod;
  target_value: any;
  tolerance: any;
  weight: number;
}

export enum MeasurementMethod {
  AUTOMATED_CHECK = "automated_check",
  MANUAL_REVIEW = "manual_review",
  DOCUMENTATION_REVIEW = "documentation_review",
  PROCESS_AUDIT = "process_audit",
  TECHNICAL_SCAN = "technical_scan"
}

export interface CertificationRequirement {
  certification_name: string;
  issuing_body: string;
  validity_period_months: number;
  renewal_requirements: string[];
  audit_requirements: string[];
}

export interface ComplianceAssessment {
  id: string;
  framework: ComplianceFramework;
  assessment_date: string;
  overall_status: ComplianceStatus;
  overall_score: number;
  
  // Requirement Assessments
  requirement_assessments: RequirementAssessment[];
  
  // Risk Analysis
  identified_risks: ComplianceRisk[];
  risk_score: number;
  risk_level: RiskLevel;
  
  // Gaps and Remediation
  compliance_gaps: ComplianceGap[];
  remediation_plan: RemediationPlan;
  
  // Evidence and Documentation
  evidence_collected: Evidence[];
  documentation_status: DocumentationStatus;
  
  // Metadata
  assessor: string;
  reviewer?: string;
  next_assessment_due: string;
  
  created_at: string;
  updated_at: string;
}

export interface RequirementAssessment {
  requirement_id: string;
  status: ComplianceStatus;
  score: number;
  evidence_provided: string[];
  gaps_identified: string[];
  recommendations: string[];
  assessor_notes: string;
}

export interface ComplianceRisk {
  id: string;
  risk_type: RiskType;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  overall_risk: RiskLevel;
  affected_assets: string[];
  mitigation_strategies: string[];
  owner: string;
  due_date?: string;
}

export enum RiskType {
  DATA_BREACH = "data_breach",
  REGULATORY_VIOLATION = "regulatory_violation",
  PRIVACY_VIOLATION = "privacy_violation",
  OPERATIONAL_RISK = "operational_risk",
  FINANCIAL_RISK = "financial_risk",
  REPUTATIONAL_RISK = "reputational_risk"
}

export interface ComplianceGap {
  id: string;
  requirement_id: string;
  gap_description: string;
  severity: RiskLevel;
  affected_areas: string[];
  root_cause: string;
  recommended_actions: string[];
  estimated_effort: string;
  target_resolution_date: string;
}

export interface RemediationPlan {
  id: string;
  plan_name: string;
  description: string;
  remediation_items: RemediationItem[];
  overall_priority: RiskLevel;
  estimated_completion_date: string;
  budget_estimate?: number;
  assigned_team: string[];
}

export interface RemediationItem {
  id: string;
  title: string;
  description: string;
  priority: RiskLevel;
  assigned_to: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  progress_percentage: number;
  estimated_hours: number;
  actual_hours?: number;
}

export interface Evidence {
  id: string;
  evidence_type: EvidenceType;
  title: string;
  description: string;
  file_path?: string;
  url?: string;
  collected_by: string;
  collection_date: string;
  validity_period?: string;
  related_requirements: string[];
}

export enum EvidenceType {
  DOCUMENT = "document",
  SCREENSHOT = "screenshot",
  LOG_FILE = "log_file",
  CONFIGURATION = "configuration",
  PROCESS_DOCUMENTATION = "process_documentation",
  AUDIT_REPORT = "audit_report",
  CERTIFICATION = "certification"
}

export interface DocumentationStatus {
  total_requirements: number;
  documented_requirements: number;
  documentation_completeness: number;
  outdated_documentation: number;
  missing_documentation: string[];
}

// ========================= DATA GOVERNANCE =========================

export interface DataGovernanceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Framework Components
  governance_domains: GovernanceDomain[];
  roles_responsibilities: RoleResponsibility[];
  processes: GovernanceProcess[];
  metrics: GovernanceMetric[];
  
  // Implementation
  maturity_model: MaturityModel;
  implementation_roadmap: ImplementationPhase[];
  
  // Metadata
  created_by: string;
  approved_by: string;
  effective_date: string;
  last_review_date: string;
  next_review_date: string;
}

export interface GovernanceDomain {
  domain_name: string;
  description: string;
  objectives: string[];
  key_activities: string[];
  success_metrics: string[];
  responsible_roles: GovernanceRole[];
}

export interface RoleResponsibility {
  role: GovernanceRole;
  responsibilities: string[];
  authority_level: AuthorityLevel;
  required_skills: string[];
  reporting_structure: string[];
}

export enum AuthorityLevel {
  DECISION_MAKER = "decision_maker",
  RECOMMENDER = "recommender",
  IMPLEMENTER = "implementer",
  REVIEWER = "reviewer",
  OBSERVER = "observer"
}

export interface GovernanceProcess {
  id: string;
  name: string;
  description: string;
  process_steps: ProcessStep[];
  inputs: string[];
  outputs: string[];
  roles_involved: GovernanceRole[];
  frequency: MonitoringFrequency;
  automation_level: AutomationLevel;
}

export interface ProcessStep {
  step_number: number;
  name: string;
  description: string;
  responsible_role: GovernanceRole;
  estimated_duration: string;
  prerequisites: string[];
  deliverables: string[];
}

export enum AutomationLevel {
  FULLY_AUTOMATED = "fully_automated",
  PARTIALLY_AUTOMATED = "partially_automated",
  MANUAL = "manual"
}

export interface GovernanceMetric {
  id: string;
  name: string;
  description: string;
  metric_type: MetricType;
  calculation_method: string;
  target_value: number;
  threshold_values: ThresholdValues;
  measurement_frequency: MonitoringFrequency;
  data_source: string;
  responsible_role: GovernanceRole;
}

export enum MetricType {
  COMPLIANCE_RATE = "compliance_rate",
  QUALITY_SCORE = "quality_score",
  COVERAGE_PERCENTAGE = "coverage_percentage",
  VIOLATION_COUNT = "violation_count",
  RESPONSE_TIME = "response_time",
  USER_SATISFACTION = "user_satisfaction"
}

export interface ThresholdValues {
  excellent: number;
  good: number;
  acceptable: number;
  needs_improvement: number;
}

export interface MaturityModel {
  levels: MaturityLevel[];
  current_level: number;
  target_level: number;
  assessment_criteria: MaturityCriteria[];
}

export interface MaturityLevel {
  level: number;
  name: string;
  description: string;
  characteristics: string[];
  key_capabilities: string[];
}

export interface MaturityCriteria {
  domain: string;
  level_1_criteria: string[];
  level_2_criteria: string[];
  level_3_criteria: string[];
  level_4_criteria: string[];
  level_5_criteria: string[];
}

export interface ImplementationPhase {
  phase_number: number;
  name: string;
  description: string;
  objectives: string[];
  deliverables: string[];
  duration_months: number;
  dependencies: string[];
  success_criteria: string[];
  risks: string[];
}

// ========================= AUDIT AND MONITORING =========================

export interface AuditTrail {
  id: string;
  event_type: AuditEventType;
  event_timestamp: string;
  user_id: string;
  user_role?: string;
  asset_id?: string;
  policy_id?: string;
  
  // Event Details
  event_description: string;
  event_source: string;
  ip_address?: string;
  user_agent?: string;
  
  // Context Information
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  affected_fields?: string[];
  
  // Classification
  risk_level: RiskLevel;
  compliance_impact: boolean;
  privacy_impact: boolean;
  
  // Additional Metadata
  session_id?: string;
  transaction_id?: string;
  correlation_id?: string;
  custom_attributes: Record<string, any>;
}

export interface NotificationConfig {
  notification_type: NotificationType;
  recipients: NotificationRecipient[];
  message_template: string;
  delivery_channels: DeliveryChannel[];
  escalation_rules?: EscalationRule[];
}

export enum NotificationType {
  POLICY_VIOLATION = "policy_violation",
  COMPLIANCE_ALERT = "compliance_alert",
  RISK_NOTIFICATION = "risk_notification",
  APPROVAL_REQUEST = "approval_request",
  STATUS_UPDATE = "status_update",
  REMINDER = "reminder"
}

export interface NotificationRecipient {
  recipient_type: 'user' | 'role' | 'group';
  recipient_id: string;
  notification_preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  frequency: NotificationFrequency;
  quiet_hours?: QuietHours;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  DIGEST_HOURLY = "digest_hourly",
  DIGEST_DAILY = "digest_daily",
  DIGEST_WEEKLY = "digest_weekly"
}

export interface QuietHours {
  start_time: string;
  end_time: string;
  timezone: string;
  days_of_week: number[];
}

export enum DeliveryChannel {
  EMAIL = "email",
  SMS = "sms",
  IN_APP = "in_app",
  WEBHOOK = "webhook",
  SLACK = "slack",
  TEAMS = "teams"
}

// ========================= REQUEST/RESPONSE MODELS =========================

export interface PolicyCreateRequest {
  name: string;
  description: string;
  policy_type: PolicyType;
  policy_rules: Omit<PolicyRule, 'id'>[];
  enforcement_level: 'advisory' | 'warning' | 'blocking';
  scope: PolicyScope;
  compliance_frameworks?: ComplianceFramework[];
  effective_date: string;
  expiry_date?: string;
  implementation_guidance: string;
  monitoring_frequency: MonitoringFrequency;
  tags?: string[];
}

export interface PolicyUpdateRequest {
  name?: string;
  description?: string;
  status?: PolicyStatus;
  policy_rules?: PolicyRule[];
  enforcement_level?: 'advisory' | 'warning' | 'blocking';
  scope?: PolicyScope;
  implementation_guidance?: string;
  monitoring_frequency?: MonitoringFrequency;
  tags?: string[];
}

export interface ComplianceAssessmentRequest {
  framework: ComplianceFramework;
  scope: PolicyScope;
  assessment_type: 'full' | 'partial' | 'targeted';
  requirements_to_assess?: string[];
  include_risk_analysis: boolean;
  assessor_notes?: string;
}

export interface GovernanceReportRequest {
  report_type: ReportType;
  scope: PolicyScope;
  time_period: TimePeriod;
  include_details: boolean;
  format: 'json' | 'pdf' | 'excel';
  delivery_method?: 'download' | 'email' | 'api';
}

export enum ReportType {
  COMPLIANCE_SUMMARY = "compliance_summary",
  POLICY_VIOLATIONS = "policy_violations",
  RISK_ASSESSMENT = "risk_assessment",
  GOVERNANCE_METRICS = "governance_metrics",
  AUDIT_SUMMARY = "audit_summary",
  REMEDIATION_STATUS = "remediation_status"
}

export interface TimePeriod {
  start_date: string;
  end_date: string;
  period_type?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

// ========================= ANALYTICS AND INSIGHTS =========================

export interface GovernanceAnalytics {
  overview: GovernanceOverview;
  compliance_metrics: ComplianceMetrics;
  policy_effectiveness: PolicyEffectiveness;
  risk_analysis: RiskAnalysis;
  trend_analysis: TrendAnalysis;
  benchmarking: BenchmarkingData;
}

export interface GovernanceOverview {
  total_policies: number;
  active_policies: number;
  total_assets_governed: number;
  compliance_score: number;
  risk_score: number;
  recent_violations: number;
  last_assessment_date: string;
}

export interface ComplianceMetrics {
  overall_compliance_rate: number;
  compliance_by_framework: Record<ComplianceFramework, number>;
  compliance_trends: ComplianceTrend[];
  non_compliant_assets: number;
  remediation_progress: number;
}

export interface ComplianceTrend {
  date: string;
  compliance_rate: number;
  violations_count: number;
  new_policies: number;
}

export interface PolicyEffectiveness {
  policies_by_effectiveness: PolicyEffectivenessMetric[];
  most_violated_policies: PolicyViolationSummary[];
  policy_adoption_rate: number;
  automation_coverage: number;
}

export interface PolicyEffectivenessMetric {
  policy_id: string;
  policy_name: string;
  effectiveness_score: number;
  violation_rate: number;
  compliance_improvement: number;
}

export interface PolicyViolationSummary {
  policy_id: string;
  policy_name: string;
  violation_count: number;
  affected_assets: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RiskAnalysis {
  overall_risk_score: number;
  risk_distribution: Record<RiskLevel, number>;
  top_risks: ComplianceRisk[];
  risk_trends: RiskTrend[];
  mitigation_effectiveness: number;
}

export interface RiskTrend {
  date: string;
  risk_score: number;
  new_risks: number;
  mitigated_risks: number;
}

export interface TrendAnalysis {
  governance_maturity_trend: MaturityTrend[];
  policy_adoption_trend: AdoptionTrend[];
  violation_trend: ViolationTrend[];
  remediation_trend: RemediationTrend[];
}

export interface MaturityTrend {
  date: string;
  maturity_level: number;
  domain_scores: Record<string, number>;
}

export interface AdoptionTrend {
  date: string;
  new_policies: number;
  active_policies: number;
  policy_coverage: number;
}

export interface ViolationTrend {
  date: string;
  violation_count: number;
  severity_distribution: Record<RiskLevel, number>;
  resolution_time_avg: number;
}

export interface RemediationTrend {
  date: string;
  items_created: number;
  items_completed: number;
  completion_rate: number;
  average_resolution_time: number;
}

export interface BenchmarkingData {
  industry_benchmarks: IndustryBenchmark[];
  peer_comparison: PeerComparison;
  best_practices: BestPractice[];
}

export interface IndustryBenchmark {
  metric_name: string;
  industry_average: number;
  top_quartile: number;
  our_performance: number;
  percentile_rank: number;
}

export interface PeerComparison {
  peer_group: string;
  comparison_metrics: ComparisonMetric[];
  relative_performance: 'above_average' | 'average' | 'below_average';
}

export interface ComparisonMetric {
  metric_name: string;
  our_value: number;
  peer_average: number;
  peer_median: number;
  ranking: number;
  total_peers: number;
}

export interface BestPractice {
  practice_name: string;
  description: string;
  implementation_guidance: string;
  expected_benefits: string[];
  effort_level: 'low' | 'medium' | 'high';
  applicability_score: number;
}

// ========================= EXPORT TYPES =========================

export type {
  // Policy Management
  GovernancePolicy,
  PolicyRule,
  PolicyScope,
  ViolationHandling,
  
  // Compliance Management
  ComplianceFrameworkMapping,
  ComplianceAssessment,
  ComplianceRisk,
  RemediationPlan,
  
  // Data Governance
  DataGovernanceFramework,
  GovernanceProcess,
  GovernanceMetric,
  MaturityModel,
  
  // Audit and Monitoring
  AuditTrail,
  NotificationConfig,
  
  // Request/Response
  PolicyCreateRequest,
  PolicyUpdateRequest,
  ComplianceAssessmentRequest,
  GovernanceReportRequest,
  
  // Analytics
  GovernanceAnalytics,
  ComplianceMetrics,
  RiskAnalysis
};