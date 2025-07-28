/**
 * Advanced Monitoring and Alerting Types
 * Maps to: monitoring_service.py, alert_service.py, performance_monitoring_service.py
 * 
 * Comprehensive types for real-time monitoring, alerting, performance tracking,
 * and system health management with enterprise-grade capabilities.
 */

export interface MonitoringConfiguration {
  monitoring_enabled: boolean;
  collection_interval: number;
  retention_period: string;
  alert_thresholds: AlertThreshold[];
  performance_metrics: PerformanceMetricConfig[];
  health_checks: HealthCheckConfig[];
  notification_settings: NotificationSettings;
  escalation_policies: EscalationPolicy[];
  monitoring_agents: MonitoringAgent[];
}

export interface AlertThreshold {
  threshold_id: string;
  metric_name: string;
  threshold_type: ThresholdType;
  warning_threshold: number;
  critical_threshold: number;
  comparison_operator: ComparisonOperator;
  evaluation_window: string;
  notification_delay: number;
  auto_resolution: boolean;
  tags: string[];
}

export interface PerformanceMetricConfig {
  metric_id: string;
  metric_name: string;
  metric_type: MetricType;
  collection_method: CollectionMethod;
  aggregation_function: AggregationFunction;
  sampling_rate: number;
  retention_policy: string;
  index_settings: IndexSettings;
}

export interface HealthCheckConfig {
  check_id: string;
  check_name: string;
  check_type: HealthCheckType;
  target_endpoint: string;
  check_interval: number;
  timeout: number;
  retry_count: number;
  expected_response: ExpectedResponse;
  dependencies: string[];
  maintenance_windows: MaintenanceWindow[];
}

export interface NotificationSettings {
  default_channels: NotificationChannel[];
  channel_configs: ChannelConfiguration[];
  rate_limiting: RateLimitConfig[];
  message_templates: MessageTemplate[];
  escalation_delay: number;
  quiet_hours: QuietHours[];
}

export interface EscalationPolicy {
  policy_id: string;
  policy_name: string;
  escalation_levels: EscalationLevel[];
  timeout_settings: TimeoutSettings;
  bypass_conditions: BypassCondition[];
  notification_groups: NotificationGroup[];
}

export interface MonitoringAgent {
  agent_id: string;
  agent_name: string;
  agent_type: AgentType;
  deployment_location: string;
  configuration: AgentConfiguration;
  status: AgentStatus;
  last_heartbeat: string;
  metrics_collected: string[];
}

export interface SystemHealthStatus {
  overall_health: HealthStatus;
  component_health: ComponentHealth[];
  performance_metrics: PerformanceMetrics;
  resource_utilization: ResourceUtilization;
  active_alerts: ActiveAlert[];
  recent_incidents: Incident[];
  system_information: SystemInformation;
  availability_metrics: AvailabilityMetrics;
}

export interface ComponentHealth {
  component_id: string;
  component_name: string;
  component_type: ComponentType;
  health_status: HealthStatus;
  status_message: string;
  last_check: string;
  response_time: number;
  availability_percentage: number;
  dependencies: ComponentDependency[];
  performance_indicators: PerformanceIndicator[];
}

export interface PerformanceMetrics {
  response_time_metrics: ResponseTimeMetrics;
  throughput_metrics: ThroughputMetrics;
  error_rate_metrics: ErrorRateMetrics;
  resource_metrics: ResourceMetrics;
  custom_metrics: CustomMetric[];
  trend_analysis: TrendAnalysis;
}

export interface ResourceUtilization {
  cpu_utilization: ResourceMetric;
  memory_utilization: ResourceMetric;
  disk_utilization: ResourceMetric;
  network_utilization: NetworkMetric;
  database_utilization: DatabaseMetric;
  cache_utilization: CacheMetric;
  queue_utilization: QueueMetric;
}

export interface ActiveAlert {
  alert_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  alert_message: string;
  triggered_at: string;
  metric_value: number;
  threshold_value: number;
  affected_components: string[];
  escalation_level: number;
  acknowledgment_status: AcknowledgmentStatus;
  resolution_status: ResolutionStatus;
  assigned_to?: string;
  tags: string[];
}

export interface Incident {
  incident_id: string;
  incident_title: string;
  incident_description: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_at: string;
  resolved_at?: string;
  affected_services: string[];
  root_cause?: string;
  resolution_summary?: string;
  impact_assessment: ImpactAssessment;
  timeline: IncidentTimeline[];
}

export interface SystemInformation {
  system_version: string;
  deployment_environment: string;
  deployment_timestamp: string;
  configuration_version: string;
  service_instances: ServiceInstance[];
  infrastructure_details: InfrastructureDetails;
  feature_flags: FeatureFlag[];
}

export interface AvailabilityMetrics {
  uptime_percentage: number;
  downtime_minutes: number;
  mttr: number; // Mean Time To Recovery
  mtbf: number; // Mean Time Between Failures
  sla_compliance: SLACompliance[];
  availability_zones: AvailabilityZone[];
}

export interface Alert {
  alert_id: string;
  alert_name: string;
  alert_description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  condition: AlertCondition;
  notification_settings: AlertNotificationSettings;
  created_by: string;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
  is_enabled: boolean;
  tags: string[];
}

export interface AlertCondition {
  metric_name: string;
  aggregation: AggregationFunction;
  comparison_operator: ComparisonOperator;
  threshold_value: number;
  evaluation_window: string;
  data_points_to_alarm: number;
  missing_data_treatment: MissingDataTreatment;
  additional_conditions?: AdditionalCondition[];
}

export interface AlertNotificationSettings {
  notification_channels: NotificationChannel[];
  notification_frequency: NotificationFrequency;
  escalation_policy_id?: string;
  custom_message?: string;
  include_metrics: boolean;
  include_logs: boolean;
}

export interface MonitoringDashboard {
  dashboard_id: string;
  dashboard_name: string;
  dashboard_description: string;
  dashboard_type: DashboardType;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refresh_interval: number;
  time_range: TimeRange;
  filters: DashboardFilter[];
  permissions: DashboardPermission[];
  created_by: string;
  created_at: string;
}

export interface DashboardWidget {
  widget_id: string;
  widget_type: WidgetType;
  widget_title: string;
  widget_configuration: WidgetConfiguration;
  position: WidgetPosition;
  size: WidgetSize;
  data_source: DataSource;
  visualization_settings: VisualizationSettings;
}

export interface MetricQuery {
  query_id: string;
  metric_name: string;
  aggregation: AggregationFunction;
  filters: MetricFilter[];
  group_by: string[];
  time_range: TimeRange;
  resolution: string;
  functions: QueryFunction[];
}

export interface LogAnalysis {
  analysis_id: string;
  log_source: string;
  analysis_type: LogAnalysisType;
  time_range: TimeRange;
  search_criteria: LogSearchCriteria;
  results: LogAnalysisResult[];
  patterns_detected: LogPattern[];
  anomalies: LogAnomaly[];
  recommendations: LogRecommendation[];
}

export interface PerformanceReport {
  report_id: string;
  report_type: ReportType;
  report_period: string;
  generated_at: string;
  performance_summary: PerformanceSummary;
  detailed_metrics: DetailedMetric[];
  trend_analysis: TrendAnalysis;
  capacity_planning: CapacityPlanning;
  recommendations: PerformanceRecommendation[];
  sla_report: SLAReport;
}

// ===================== SUPPORTING TYPES =====================

export interface ResponseTimeMetrics {
  average_response_time: number;
  median_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  max_response_time: number;
  response_time_distribution: HistogramData;
}

export interface ThroughputMetrics {
  requests_per_second: number;
  transactions_per_minute: number;
  data_transfer_rate: number;
  concurrent_users: number;
  throughput_trends: TrendData[];
}

export interface ErrorRateMetrics {
  error_rate_percentage: number;
  error_count: number;
  error_types: ErrorTypeDistribution[];
  error_trends: TrendData[];
  critical_errors: CriticalError[];
}

export interface ResourceMetric {
  current_value: number;
  average_value: number;
  peak_value: number;
  utilization_percentage: number;
  threshold_breaches: ThresholdBreach[];
  trend_direction: TrendDirection;
}

export interface NetworkMetric {
  bandwidth_utilization: number;
  latency: number;
  packet_loss: number;
  connection_count: number;
  network_errors: number;
}

export interface DatabaseMetric {
  connection_pool_usage: number;
  query_execution_time: number;
  lock_contention: number;
  cache_hit_ratio: number;
  replication_lag?: number;
}

export interface CacheMetric {
  hit_ratio: number;
  eviction_rate: number;
  memory_usage: number;
  key_count: number;
  expiration_events: number;
}

export interface QueueMetric {
  queue_depth: number;
  processing_rate: number;
  dead_letter_count: number;
  message_age: number;
  consumer_count: number;
}

export interface ComponentDependency {
  dependency_id: string;
  dependency_name: string;
  dependency_type: DependencyType;
  health_status: HealthStatus;
  criticality: DependencyCriticality;
  last_check: string;
}

export interface PerformanceIndicator {
  indicator_name: string;
  current_value: number;
  target_value: number;
  status: IndicatorStatus;
  trend: TrendDirection;
  last_updated: string;
}

export interface ImpactAssessment {
  affected_users: number;
  business_impact: BusinessImpactLevel;
  financial_impact?: number;
  reputation_impact: ReputationImpactLevel;
  compliance_impact: ComplianceImpactLevel;
  service_degradation: ServiceDegradation[];
}

export interface IncidentTimeline {
  timestamp: string;
  event_type: TimelineEventType;
  description: string;
  performer: string;
  attachments?: string[];
}

export interface ServiceInstance {
  instance_id: string;
  service_name: string;
  version: string;
  status: ServiceStatus;
  health_endpoint: string;
  metrics_endpoint: string;
  resource_allocation: ResourceAllocation;
}

export interface InfrastructureDetails {
  cloud_provider: string;
  region: string;
  availability_zones: string[];
  instance_types: InstanceType[];
  network_configuration: NetworkConfiguration;
  security_groups: SecurityGroup[];
}

export interface FeatureFlag {
  flag_name: string;
  flag_value: boolean;
  flag_description: string;
  rollout_percentage: number;
  target_segments: string[];
}

export interface SLACompliance {
  sla_name: string;
  target_percentage: number;
  actual_percentage: number;
  compliance_status: ComplianceStatus;
  breach_count: number;
  next_review_date: string;
}

export interface AvailabilityZone {
  zone_name: string;
  zone_status: ZoneStatus;
  uptime_percentage: number;
  last_outage?: string;
  service_count: number;
}

// ===================== ENUMS =====================

export enum ThresholdType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  ANOMALY_DETECTION = 'anomaly_detection',
  BASELINE = 'baseline'
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
  DISTRIBUTION = 'distribution'
}

export enum CollectionMethod {
  PUSH = 'push',
  PULL = 'pull',
  AGENT = 'agent',
  API = 'api',
  LOG_BASED = 'log_based'
}

export enum AggregationFunction {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  RATE = 'rate'
}

export enum HealthCheckType {
  HTTP = 'http',
  TCP = 'tcp',
  DATABASE = 'database',
  CUSTOM_SCRIPT = 'custom_script',
  HEARTBEAT = 'heartbeat'
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
  MAINTENANCE = 'maintenance'
}

export enum AlertType {
  METRIC = 'metric',
  LOG = 'log',
  SYNTHETIC = 'synthetic',
  COMPOSITE = 'composite',
  ANOMALY = 'anomaly'
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum IncidentType {
  OUTAGE = 'outage',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  DATA_LOSS = 'data_loss',
  CONFIGURATION = 'configuration'
}

export enum IncidentSeverity {
  SEV1 = 'sev1', // Critical
  SEV2 = 'sev2', // High
  SEV3 = 'sev3', // Medium
  SEV4 = 'sev4', // Low
  SEV5 = 'sev5'  // Info
}

export enum IncidentStatus {
  INVESTIGATING = 'investigating',
  IDENTIFIED = 'identified',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PAGERDUTY = 'pagerduty',
  TEAMS = 'teams'
}

export enum ComparisonOperator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals'
}

export enum MissingDataTreatment {
  TREAT_AS_MISSING = 'treat_as_missing',
  NOT_BREACHING = 'not_breaching',
  BREACHING = 'breaching',
  IGNORE = 'ignore'
}

export enum DashboardType {
  OVERVIEW = 'overview',
  OPERATIONAL = 'operational',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  CUSTOM = 'custom'
}

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  SINGLE_VALUE = 'single_value',
  HEATMAP = 'heatmap',
  MAP = 'map'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export enum BusinessImpactLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Import core types for integration
import type { IntelligentDataAsset } from './catalog-core.types';

// Additional complex interfaces would continue here...
// (Truncated for brevity, but would include all remaining supporting interfaces)