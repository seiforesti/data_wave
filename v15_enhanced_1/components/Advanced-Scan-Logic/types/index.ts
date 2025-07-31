/**
 * Advanced Scan Logic Types
 * Enterprise-grade TypeScript definitions for data governance scan logic
 */

export interface ScanLogicEngine {
  id: string;
  name: string;
  description: string;
  version: string;
  engineType: 'STREAMING' | 'BATCH' | 'HYBRID' | 'REAL_TIME' | 'DISTRIBUTED';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR' | 'DEPRECATED';
  configuration: Record<string, any>;
  capabilities: Array<{
    name: string;
    description: string;
    supported: boolean;
    version: string;
  }>;
  supportedDataSources: string[];
  performance: {
    avgExecutionTime: number;
    successRate: number;
    throughput: number;
    errorRate: number;
    lastMeasured: string;
  };
  lastUpdated: string;
  createdBy: string;
  modifiedBy: string;
  tags: string[];
}

export interface ScanExecution {
  id: string;
  scanId: string;
  executionId: string;
  engineId: string;
  ruleSetId?: string;
  dataSourceId: string;
  status: 'PENDING' | 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: {
    percentage: number;
    currentStage: string;
    stagesCompleted: string[];
    totalStages: number;
    estimatedTimeRemaining: number;
    recordsProcessed: number;
    totalRecords: number;
    throughput: number;
    errors: number;
    warnings: number;
  };
  results?: ScanResults;
  errors: Array<{
    code: string;
    message: string;
    details: string;
    timestamp: string;
    severity: string;
  }>;
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
}

export interface ScanResults {
  id: string;
  executionId: string;
  totalRecordsScanned: number;
  recordsProcessed: number;
  recordsSkipped: number;
  recordsWithIssues: number;
  dataQualityScore: number;
  complianceScore: number;
  securityScore: number;
  findings: ScanFinding[];
  classifications: Array<{
    columnId: string;
    columnName: string;
    dataType: string;
    classificationLabel: string;
    confidence: number;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: string;
    confidence: number;
    location: Record<string, any>;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    actions: string[];
  }>;
  summary: {
    totalFindings: number;
    criticalFindings: number;
    highSeverityFindings: number;
    dataQualityIssues: number;
    complianceIssues: number;
    recommendationsCount: number;
  };
}

export interface ScanFinding {
  id: string;
  executionId: string;
  findingType: 'DATA_QUALITY' | 'COMPLIANCE' | 'SECURITY' | 'PRIVACY' | 'CLASSIFICATION' | 'ANOMALY' | 'PERFORMANCE' | 'LINEAGE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  title: string;
  description: string;
  location: {
    dataSourceId: string;
    schemaName?: string;
    tableName?: string;
    columnName?: string;
    rowIdentifier?: string;
    path?: string;
  };
  ruleId: string;
  ruleName: string;
  evidence: Array<{
    type: string;
    description: string;
    value: any;
    context: Record<string, any>;
  }>;
  impact: {
    businessImpact: string;
    technicalImpact: string;
    complianceImpact: string;
    affectedSystems: string[];
    affectedUsers: number;
    estimatedCost: number;
    riskLevel: string;
  };
  remediation: Array<{
    title: string;
    description: string;
    steps: string[];
    estimatedEffort: string;
    priority: string;
  }>;
  status: 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'ACKNOWLEDGED' | 'FALSE_POSITIVE' | 'DEFERRED';
  assignedTo?: string;
  dueDate?: string;
  confidence: number;
}

export interface ScanRule {
  id: string;
  name: string;
  description: string;
  category: 'DATA_QUALITY' | 'COMPLIANCE' | 'SECURITY' | 'CLASSIFICATION' | 'CUSTOM';
  type: 'VALIDATION' | 'TRANSFORMATION' | 'CLASSIFICATION' | 'DETECTION' | 'MONITORING';
  severity: 'BLOCKING' | 'CRITICAL' | 'WARNING' | 'INFO';
  logic: {
    expression: string;
    language: string;
    parameters: Record<string, any>;
  };
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    dataType: string;
    isRequired: boolean;
  }>;
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
    priority: number;
  }>;
  parameters: Array<{
    name: string;
    type: string;
    defaultValue: any;
    required: boolean;
    description: string;
  }>;
  applicableDataTypes: string[];
  isActive: boolean;
  version: string;
  tags: string[];
}

export interface ScanProfile {
  id: string;
  name: string;
  description: string;
  profileType: 'STANDARD' | 'COMPLIANCE' | 'CUSTOM' | 'TEMPLATE';
  dataSourceTypes: string[];
  rules: string[];
  schedule?: {
    cronExpression: string;
    timezone: string;
    isActive: boolean;
  };
  configuration: {
    scanDepth: 'METADATA_ONLY' | 'SAMPLE' | 'FULL' | 'DEEP';
    includeTables: string[];
    excludeTables: string[];
    includeColumns: string[];
    excludeColumns: string[];
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    triggers: string[];
  };
  retention: {
    retentionDays: number;
    archiveAfterDays: number;
  };
  isDefault: boolean;
  lastUsed?: string;
  usageCount: number;
}

// API Response Types
export interface ScanLogicEnginesResponse {
  success: boolean;
  data: ScanLogicEngine[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
}

export interface ScanExecutionsResponse {
  success: boolean;
  data: ScanExecution[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
}

export interface ScanResultsResponse {
  success: boolean;
  data: ScanResults;
  message?: string;
}

export interface ScanFindingsResponse {
  success: boolean;
  data: ScanFinding[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  aggregations?: {
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
  message?: string;
}

// Request Types
export interface CreateScanExecutionRequest {
  engineId: string;
  ruleSetId?: string;
  profileId?: string;
  dataSourceId: string;
  configuration?: Record<string, any>;
  scheduleId?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  tags?: string[];
}

export interface UpdateScanExecutionRequest {
  status?: 'PENDING' | 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  configuration?: Record<string, any>;
  tags?: string[];
  assignedTo?: string;
}

// Filter Types
export interface ScanLogicFilters {
  engineTypes?: string[];
  statuses?: string[];
  capabilities?: string[];
  dataSourceTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  createdBy?: string[];
  search?: string;
}

export interface ScanExecutionFilters {
  statuses?: string[];
  engineIds?: string[];
  ruleSetIds?: string[];
  dataSourceIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  duration?: {
    min: number;
    max: number;
  };
  hasErrors?: boolean;
  tags?: string[];
  priority?: string[];
  assignedTo?: string[];
  search?: string;
}

export interface ScanFindingFilters {
  types?: string[];
  severities?: string[];
  categories?: string[];
  statuses?: string[];
  ruleIds?: string[];
  dataSourceIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string[];
  tags?: string[];
  confidence?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export default {
  ScanLogicEngine,
  ScanExecution,
  ScanResults,
  ScanFinding,
  ScanRule,
  ScanProfile
};
