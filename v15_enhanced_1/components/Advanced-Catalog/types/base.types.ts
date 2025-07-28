/**
 * Base Types - Foundation Interfaces for Advanced Catalog
 * =====================================================
 * 
 * Core base types and interfaces that provide the foundation
 * for all Advanced Catalog components, ensuring consistent
 * structure and 100% backend integration.
 */

// ====================== CORE BASE INTERFACES ======================

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TimestampedModel extends BaseModel {
  version?: string;
  last_modified?: string;
  modified_by?: string;
}

export interface AuditableModel extends TimestampedModel {
  audit_trail: AuditEntry[];
  access_history: AccessEntry[];
  modification_history: ModificationEntry[];
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  user_id: string;
  timestamp: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  DOWNLOAD = 'download',
  SHARE = 'share'
}

export interface AccessEntry {
  user_id: string;
  access_type: 'read' | 'write' | 'execute' | 'admin';
  timestamp: string;
  duration?: number;
  context?: Record<string, any>;
}

export interface ModificationEntry {
  field_name: string;
  old_value: any;
  new_value: any;
  modified_by: string;
  timestamp: string;
  reason?: string;
}

// ====================== PAGINATION & FILTERING ======================

export interface PaginatedRequest {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page_count: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SearchRequest extends PaginatedRequest {
  query: string;
  search_fields?: string[];
  highlight_fields?: string[];
  facets?: string[];
  boost_fields?: Record<string, number>;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query_time_ms: number;
  highlighted_results?: Record<string, Record<string, string[]>>;
  facet_results?: Record<string, FacetResult[]>;
  suggestions?: string[];
}

export interface FacetResult {
  value: string;
  count: number;
  selected?: boolean;
}

// ====================== API RESPONSE TYPES ======================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  trace_id?: string;
  timestamp: string;
}

export interface ResponseMetadata {
  request_id: string;
  processing_time_ms: number;
  cache_hit?: boolean;
  data_source?: string;
  api_version?: string;
}

// ====================== VALIDATION TYPES ======================

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

// ====================== WORKFLOW & PROCESS TYPES ======================

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  current_step?: string;
  steps: WorkflowStep[];
  variables: Record<string, any>;
  started_at: string;
  completed_at?: string;
  started_by: string;
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: StepStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  error?: string;
  retry_count?: number;
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// ====================== NOTIFICATION TYPES ======================

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  created_at: string;
  read_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  WORKFLOW = 'workflow',
  QUALITY = 'quality',
  DISCOVERY = 'discovery'
}

export enum NotificationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ====================== PERFORMANCE & METRICS ======================

export interface PerformanceMetrics {
  execution_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percentage: number;
  network_io_mb: number;
  disk_io_mb: number;
  cache_hit_rate: number;
  error_rate: number;
  throughput_per_second: number;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  tags?: Record<string, string>;
}

export interface TimeSeries {
  metric_name: string;
  data_points: MetricDataPoint[];
  aggregation_method?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  time_range: TimeRange;
}

export interface TimeRange {
  start: string;
  end: string;
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

// ====================== CONFIGURATION TYPES ======================

export interface ConfigurationItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default_value?: any;
  required?: boolean;
  validation_rules?: ValidationRule[];
  category?: string;
  sensitive?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum';
  value?: any;
  message?: string;
}

// ====================== FILE & EXPORT TYPES ======================

export interface FileMetadata {
  filename: string;
  size_bytes: number;
  mime_type: string;
  checksum: string;
  uploaded_at: string;
  uploaded_by: string;
  tags?: string[];
  custom_metadata?: Record<string, any>;
}

export interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: JobStatus;
  filters?: Record<string, any>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage?: number;
  result_url?: string;
  error_message?: string;
  estimated_completion?: string;
}

export enum ExportType {
  ASSETS = 'assets',
  LINEAGE = 'lineage',
  QUALITY_REPORTS = 'quality_reports',
  ANALYTICS = 'analytics',
  GLOSSARY = 'glossary',
  FULL_CATALOG = 'full_catalog'
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  PARQUET = 'parquet',
  XML = 'xml'
}

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ====================== COLLABORATION TYPES ======================

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at?: string;
  parent_id?: string;
  replies?: Comment[];
  mentions?: string[];
  reactions?: Reaction[];
  attachments?: Attachment[];
}

export interface Reaction {
  emoji: string;
  user_id: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size_bytes: number;
  mime_type: string;
}

export interface Annotation {
  id: string;
  target_type: 'asset' | 'field' | 'lineage' | 'quality_rule';
  target_id: string;
  annotation_type: 'comment' | 'tag' | 'description' | 'warning';
  content: string;
  position?: AnnotationPosition;
  created_by: string;
  created_at: string;
  status: 'active' | 'resolved' | 'archived';
}

export interface AnnotationPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// ====================== INTEGRATION TYPES ======================

export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
  last_sync?: string;
  sync_frequency?: string;
  error_count?: number;
  last_error?: string;
}

export interface SyncStatus {
  integration_id: string;
  status: 'idle' | 'syncing' | 'error' | 'disabled';
  last_sync_start?: string;
  last_sync_end?: string;
  items_processed?: number;
  items_failed?: number;
  next_sync?: string;
  error_details?: string[];
}

// ====================== SECURITY TYPES ======================

export interface SecurityContext {
  user_id: string;
  roles: string[];
  permissions: Permission[];
  organization_id?: string;
  tenant_id?: string;
  session_id?: string;
  ip_address?: string;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AccessPolicy {
  id: string;
  name: string;
  type: 'role_based' | 'attribute_based' | 'rule_based';
  rules: AccessRule[];
  enabled: boolean;
  priority: number;
}

export interface AccessRule {
  id: string;
  condition: string;
  effect: 'allow' | 'deny';
  resources: string[];
  actions: string[];
}

// ====================== EVENT TYPES ======================

export interface CatalogEvent {
  id: string;
  type: string;
  source: string;
  subject_id: string;
  subject_type: string;
  action: string;
  timestamp: string;
  user_id?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EventSubscription {
  id: string;
  event_types: string[];
  webhook_url: string;
  secret?: string;
  filters?: Record<string, any>;
  enabled: boolean;
  created_at: string;
  last_delivery?: string;
  delivery_count?: number;
  failure_count?: number;
}

// ====================== UTILITY TYPES ======================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Awaited<T> = T extends Promise<infer U> ? U : T;

// ====================== FORM TYPES ======================

export interface FormField<T = any> {
  name: string;
  label: string;
  type: FormFieldType;
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: FormValidation;
  options?: FormOption[];
  dependencies?: FormDependency[];
}

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  DATETIME = 'datetime',
  FILE = 'file',
  JSON = 'json',
  CODE = 'code'
}

export interface FormOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface FormValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

export interface FormDependency {
  field: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

// ====================== LOCALE & I18N TYPES ======================

export interface LocaleConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormat;
  currency?: string;
}

export interface TranslationKey {
  key: string;
  defaultValue: string;
  namespace?: string;
  interpolation?: Record<string, any>;
}

// ====================== THEME TYPES ======================

export interface ThemeConfig {
  name: string;
  mode: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  breakpoints: ThemeBreakpoints;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

export interface ThemeSpacing {
  unit: number;
  scale: number[];
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// ====================== ERROR HANDLING ======================

export class CatalogError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;
  public readonly traceId?: string;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: Record<string, any>,
    traceId?: string
  ) {
    super(message);
    this.name = 'CatalogError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.traceId = traceId;
  }
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}

// ====================== ANALYTICS & TRACKING ======================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  user_id?: string;
  session_id?: string;
  page?: string;
  source?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  started_at: string;
  last_activity: string;
  page_views: PageView[];
  events: AnalyticsEvent[];
  device_info?: DeviceInfo;
  location_info?: LocationInfo;
}

export interface PageView {
  path: string;
  title: string;
  timestamp: string;
  duration_ms?: number;
  referrer?: string;
}

export interface DeviceInfo {
  user_agent: string;
  screen_resolution: string;
  viewport_size: string;
  platform: string;
  browser: string;
  is_mobile: boolean;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  ip_address?: string;
}