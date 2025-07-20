// Base enums and constants
export enum RuleType {
  REGEX = 'regex',
  DICTIONARY = 'dictionary',
  ML_MODEL = 'ml_model',
  AI_INTELLIGENT = 'ai_intelligent',
  COMPOSITE = 'composite'
}

export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CERTAIN = 'certain'
}

export enum ClassificationScope {
  COLUMN = 'column',
  TABLE = 'table',
  SCHEMA = 'schema',
  DATABASE = 'database',
  DATA_SOURCE = 'data_source'
}

export enum FrameworkType {
  REGULATORY = 'regulatory',
  INDUSTRY = 'industry',
  CUSTOM = 'custom',
  AI_GENERATED = 'ai_generated'
}

// Core interfaces
export interface ClassificationFramework {
  id: number;
  name: string;
  description?: string;
  framework_type: FrameworkType;
  version: string;
  is_active: boolean;
  compliance_mappings?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: number;
  
  // Related data
  rules?: ClassificationRule[];
  rules_count?: number;
  usage_statistics?: FrameworkUsageStats;
}

export interface ClassificationRule {
  id: number;
  framework_id: number;
  name: string;
  description?: string;
  rule_type: RuleType;
  pattern_config: Record<string, any>;
  sensitivity_label: SensitivityLevel;
  confidence_threshold: number;
  scope: ClassificationScope;
  is_active: boolean;
  priority: number;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: number;
  
  // Related data
  framework?: ClassificationFramework;
  results_count?: number;
  success_rate?: number;
  last_applied?: string;
}

export interface ClassificationResult {
  id: number;
  rule_id: number;
  scan_result_id?: number;
  catalog_item_id?: number;
  data_source_id: number;
  target_type: string;
  target_identifier: string;
  classification_value: string;
  sensitivity_label: SensitivityLevel;
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  match_details?: Record<string, any>;
  applied_at: string;
  applied_by: number;
  
  // Related data
  rule?: ClassificationRule;
  data_source?: any;
  scan_result?: any;
  catalog_item?: any;
}

export interface ClassificationAuditLog {
  id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id: number;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  
  // Related data
  user?: any;
}

export interface ClassificationTag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  created_at: string;
  usage_count?: number;
}

// API request/response types
export interface CreateFrameworkRequest {
  name: string;
  description?: string;
  framework_type: FrameworkType;
  version?: string;
  compliance_mappings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateFrameworkRequest {
  name?: string;
  description?: string;
  framework_type?: FrameworkType;
  version?: string;
  is_active?: boolean;
  compliance_mappings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateRuleRequest {
  framework_id: number;
  name: string;
  description?: string;
  rule_type: RuleType;
  pattern_config: Record<string, any>;
  sensitivity_label: SensitivityLevel;
  confidence_threshold: number;
  scope: ClassificationScope;
  priority?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  rule_type?: RuleType;
  pattern_config?: Record<string, any>;
  sensitivity_label?: SensitivityLevel;
  confidence_threshold?: number;
  scope?: ClassificationScope;
  is_active?: boolean;
  priority?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApplyRulesRequest {
  framework_id?: number;
  rule_ids?: number[];
  target_type: 'scan_results' | 'catalog_items' | 'data_sources';
  target_ids: number[];
  apply_in_background?: boolean;
}

export interface BulkUploadRequest {
  upload_type: 'rules' | 'dictionaries' | 'frameworks';
  framework_id?: number;
  file_content: string;
  file_format: 'csv' | 'json' | 'excel';
  merge_strategy?: 'replace' | 'merge' | 'append';
}

// Statistics and analytics types
export interface FrameworkUsageStats {
  total_rules: number;
  active_rules: number;
  total_classifications: number;
  last_used: string;
  success_rate: number;
  coverage_percentage: number;
}

export interface ClassificationStats {
  total_frameworks: number;
  total_rules: number;
  total_classifications: number;
  classifications_today: number;
  top_sensitivity_labels: Array<{
    label: SensitivityLevel;
    count: number;
    percentage: number;
  }>;
  framework_distribution: Array<{
    framework_name: string;
    count: number;
    percentage: number;
  }>;
  confidence_distribution: Array<{
    level: ConfidenceLevel;
    count: number;
    percentage: number;
  }>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database_connection: boolean;
  active_frameworks: number;
  active_rules: number;
  background_tasks: number;
  response_time_ms: number;
  last_classification: string;
  issues?: string[];
}

// UI-specific types
export interface ClassificationFilters {
  framework_ids?: number[];
  rule_types?: RuleType[];
  sensitivity_labels?: SensitivityLevel[];
  confidence_levels?: ConfidenceLevel[];
  scopes?: ClassificationScope[];
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
  is_active?: boolean;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form types
export interface RuleBuilderForm {
  name: string;
  description: string;
  rule_type: RuleType;
  sensitivity_label: SensitivityLevel;
  confidence_threshold: number;
  scope: ClassificationScope;
  priority: number;
  tags: string[];
  
  // Pattern configuration based on rule type
  regex_patterns?: string[];
  dictionary_terms?: string[];
  ml_model_config?: {
    model_name: string;
    model_version: string;
    parameters: Record<string, any>;
  };
  ai_config?: {
    prompt_template: string;
    model_name: string;
    parameters: Record<string, any>;
  };
  composite_rules?: {
    operator: 'AND' | 'OR' | 'NOT';
    sub_rules: Array<{
      rule_id?: number;
      inline_config?: any;
    }>;
  };
}

export interface PatternTestResult {
  test_string: string;
  matches: boolean;
  confidence_score: number;
  match_details: {
    matched_text?: string;
    match_position?: number;
    match_length?: number;
    context?: string;
  };
  execution_time_ms: number;
  suggestions?: string[];
}