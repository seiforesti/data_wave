export interface ScanConfiguration {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  scanRuleSetId: string;
  scheduleConfig: ScheduleConfiguration;
  triggerConfig: TriggerConfiguration;
  executionConfig: ExecutionConfiguration;
  outputConfig: OutputConfiguration;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface ScheduleConfiguration {
  type: ScheduleType;
  cronExpression?: string;
  intervalMinutes?: number;
  dailyTime?: string;
  weeklyDays?: number[];
  monthlyDay?: number;
  timezone: string;
  startDate?: string;
  endDate?: string;
  maxExecutions?: number;
}

export interface TriggerConfiguration {
  type: TriggerType;
  eventFilters: EventFilter[];
  conditions: TriggerCondition[];
  retryPolicy: RetryPolicy;
  timeoutMinutes: number;
}

export interface ExecutionConfiguration {
  parallelism: number;
  resourceLimits: ResourceLimits;
  samplingConfig: SamplingConfiguration;
  qualityChecks: QualityCheckConfiguration[];
  alertConfig: AlertConfiguration;
  loggingLevel: LoggingLevel;
}

export interface OutputConfiguration {
  destinations: OutputDestination[];
  format: OutputFormat;
  compression: CompressionType;
  encryption: EncryptionConfiguration;
  retentionPolicy: RetentionPolicy;
  partitioning: PartitioningConfiguration;
}

export interface ScanExecution {
  id: string;
  configurationId: string;
  status: ExecutionStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  metrics: ExecutionMetrics;
  results: ScanResults;
  errors: ExecutionError[];
  logs: ExecutionLog[];
  resourceUsage: ResourceUsage;
  triggerInfo: TriggerInfo;
}

export interface ScanResults {
  totalRecordsScanned: number;
  recordsClassified: number;
  recordsWithPII: number;
  recordsWithSensitiveData: number;
  qualityScore: number;
  complianceScore: number;
  anomaliesDetected: number;
  schemaChanges: SchemaChange[];
  dataQualityIssues: DataQualityIssue[];
  classificationResults: ClassificationResult[];
  complianceFindings: ComplianceFinding[];
}

export interface ScanTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  configurationTemplate: Partial<ScanConfiguration>;
  recommendedFor: string[];
  industryStandards: string[];
  complianceFrameworks: string[];
  isBuiltIn: boolean;
  customizations: TemplateCustomization[];
}

export interface ScanPolicy {
  id: string;
  name: string;
  description: string;
  scope: PolicyScope;
  rules: PolicyRule[];
  enforcement: EnforcementLevel;
  exemptions: PolicyExemption[];
  approval: ApprovalConfiguration;
  notifications: NotificationConfiguration;
  isActive: boolean;
}

export interface DataLineage {
  sourceId: string;
  transformations: DataTransformation[];
  dependencies: LineageDependency[];
  impactAnalysis: ImpactAnalysis;
  dataFlow: DataFlowNode[];
  qualityPropagation: QualityPropagation[];
}

export interface RealTimeMonitoring {
  configurationId: string;
  metrics: RealTimeMetrics;
  alerts: ActiveAlert[];
  thresholds: MonitoringThreshold[];
  dashboardConfig: DashboardConfiguration;
  streamingConfig: StreamingConfiguration;
}

// Enums
export enum ScheduleType {
  MANUAL = 'manual',
  CRON = 'cron',
  INTERVAL = 'interval',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  EVENT_DRIVEN = 'event_driven'
}

export enum TriggerType {
  SCHEDULE = 'schedule',
  DATA_CHANGE = 'data_change',
  SCHEMA_CHANGE = 'schema_change',
  FILE_ARRIVAL = 'file_arrival',
  API_TRIGGER = 'api_trigger',
  WEBHOOK = 'webhook'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  RETRYING = 'retrying'
}

export enum LoggingLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export enum OutputFormat {
  JSON = 'json',
  PARQUET = 'parquet',
  AVRO = 'avro',
  CSV = 'csv',
  XML = 'xml'
}

export enum CompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  SNAPPY = 'snappy',
  LZ4 = 'lz4',
  ZSTD = 'zstd'
}

export enum TemplateCategory {
  COMPLIANCE = 'compliance',
  PRIVACY = 'privacy',
  QUALITY = 'quality',
  GOVERNANCE = 'governance',
  SECURITY = 'security',
  CUSTOM = 'custom'
}

export enum EnforcementLevel {
  ADVISORY = 'advisory',
  WARNING = 'warning',
  BLOCKING = 'blocking',
  AUDIT_ONLY = 'audit_only'
}
