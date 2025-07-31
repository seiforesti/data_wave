// Advanced Scan Logic Types - Enterprise Data Governance System

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Core Scan Logic Entities
export interface ScanLogic extends BaseEntity {
  name: string;
  description: string;
  version: string;
  status: ScanLogicStatus;
  type: ScanLogicType;
  category: ScanLogicCategory;
  priority: ScanPriority;
  configuration: ScanLogicConfiguration;
  parameters: ScanLogicParameter[];
  rules: ScanRule[];
  executionContext: ExecutionContext;
  schedule: ScanSchedule;
  triggers: ScanTrigger[];
  dataSourceIds: string[];
  ruleSetIds: string[];
  catalogIds: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  lastExecutedAt?: Date;
  lastExecutedBy?: string;
  metrics: ScanLogicMetrics;
  machineLearningModel?: MLModelConfiguration;
  aiEnhancements?: AIEnhancementConfig;
  complianceFrameworks: ComplianceFramework[];
}

export interface ScanLogicConfiguration {
  id: string;
  scanDepth: ScanDepth;
  scanScope: ScanScope;
  batchSize: number;
  parallelism: number;
  timeout: number;
  retryPolicy: RetryPolicy;
  qualityThresholds: QualityThreshold[];
  validationRules: ValidationRule[];
  securityLevel: SecurityLevel;
  encryptionEnabled: boolean;
  accessControls: AccessControl[];
  enableAI: boolean;
  enableML: boolean;
  enableRealTimeProcessing: boolean;
  enableStreaming: boolean;
  connectors: ConnectorConfiguration[];
  outputFormats: OutputFormat[];
  notifications: NotificationConfiguration[];
}

export enum ScanLogicStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  DEPRECATED = 'DEPRECATED',
  ERROR = 'ERROR'
}

export enum ScanLogicType {
  DATA_PROFILING = 'DATA_PROFILING',
  QUALITY_ASSESSMENT = 'QUALITY_ASSESSMENT',
  CLASSIFICATION = 'CLASSIFICATION',
  LINEAGE_DISCOVERY = 'LINEAGE_DISCOVERY',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  METADATA_EXTRACTION = 'METADATA_EXTRACTION',
  RELATIONSHIP_MAPPING = 'RELATIONSHIP_MAPPING',
  CUSTOM = 'CUSTOM'
}

export enum ScanLogicCategory {
  GOVERNANCE = 'GOVERNANCE',
  SECURITY = 'SECURITY',
  QUALITY = 'QUALITY',
  DISCOVERY = 'DISCOVERY',
  COMPLIANCE = 'COMPLIANCE',
  ANALYTICS = 'ANALYTICS',
  MONITORING = 'MONITORING',
  AUTOMATION = 'AUTOMATION'
}

export enum ScanPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface ScanLogicParameter {
  id: string;
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  validationRule?: string;
  description: string;
  category: ParameterCategory;
}

export enum ParameterType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  JSON = 'JSON',
  REGEX = 'REGEX',
  SQL = 'SQL',
  CUSTOM = 'CUSTOM'
}

export interface ScanLogicResponse {
  scanLogics: ScanLogic[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ScanExecutionResult {
  id: string;
  scanLogicId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  results: ScanResult[];
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT'
}

export interface ScanResult {
  id: string;
  type: string;
  category: string;
  dataSourceId: string;
  tableName?: string;
  columnName?: string;
  value: any;
  confidence: number;
  accuracy: number;
  metadata: Record<string, any>;
  tags: string[];
}

// Additional supporting types
export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'LINEAR' | 'EXPONENTIAL' | 'FIXED';
  initialDelayMs: number;
  maxDelayMs: number;
}

export interface QualityThreshold {
  metric: string;
  operator: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE' | 'NEQ';
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ValidationRule {
  id: string;
  name: string;
  expression: string;
  errorMessage: string;
  enabled: boolean;
}

export interface AccessControl {
  principalId: string;
  principalType: 'USER' | 'GROUP' | 'ROLE';
  permissions: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  validationLogic: string;
}

// Add remaining interfaces...
export type ScanLogicEntity = ScanLogic;