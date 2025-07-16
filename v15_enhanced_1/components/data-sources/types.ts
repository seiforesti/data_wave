// Data source types for the data-sources component group

export interface DataSource {
  id: number;
  name: string;
  source_type: string;
  location: string;
  host: string;
  port: number;
  username: string;
  database_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields for advanced UI (TODO: Backend support needed)
  status?: "active" | "inactive" | "error" | "pending" | "syncing" | "maintenance";
  last_scan?: string;
  health_score?: number;
  compliance_score?: number;
  entity_count?: number;
  size_gb?: number;
  tags?: string[];
  owner?: string;
  team?: string;
  environment?: "production" | "staging" | "development" | "test";
  criticality?: "critical" | "high" | "medium" | "low";
  data_classification?: "public" | "internal" | "confidential" | "restricted";
  backup_enabled?: boolean;
  monitoring_enabled?: boolean;
  encryption_enabled?: boolean;
  last_backup?: string;
  next_scan?: string;
  scan_frequency?: "hourly" | "daily" | "weekly" | "monthly";
  connection_pool_size?: number;
  avg_response_time?: number;
  error_rate?: number;
  uptime_percentage?: number;
  cost_per_month?: number;
  storage_used_percentage?: number;
  active_connections?: number;
  queries_per_second?: number;
  favorite?: boolean;
}

export interface DataSourceCreateParams {
  name: string;
  source_type: string;
  location: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database_name?: string;
  description?: string;
  connection_properties?: Record<string, any>;
}

export interface DataSourceUpdateParams {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database_name?: string;
  description?: string;
  connection_properties?: Record<string, any>;
}

export interface DataSourceFilters {
  type?: string;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  search?: string;
  location?: string;
  environment?: string;
  criticality?: string;
  tags?: string[];
  healthScore?: [number, number];
  complianceScore?: [number, number];
  owner?: string;
  team?: string;
  hasIssues?: boolean;
  favorites?: boolean;
}

export interface DataSourceStats {
  entity_stats: {
    total_entities: number;
    tables: number;
    views: number;
    stored_procedures: number;
    functions?: number;
    triggers?: number;
  };
  size_stats: {
    total_size_formatted: string;
    total_size_gb?: number;
    growth_rate?: number;
  };
  performance_stats?: {
    avg_query_time: number;
    peak_connections: number;
    cache_hit_ratio: number;
  };
  last_scan_time?: string;
  classification_stats?: {
    classified_columns: number;
    unclassified_columns?: number;
    sensitive_columns: number;
  };
  sensitivity_stats?: {
    sensitive_columns: number;
    pii_columns?: number;
    financial_columns?: number;
  };
  compliance_stats?: {
    compliance_score: string;
    violations?: number;
    last_audit?: string;
  };
  quality_stats?: {
    quality_score?: number;
    issues_found?: number;
    data_freshness?: string;
  };
}

export interface DataSourceHealth {
  status: "healthy" | "warning" | "critical" | "unknown";
  last_checked?: string;
  latency_ms?: number;
  error_message?: string;
  recommendations?: string[];
  issues?: Array<{
    type: "performance" | "security" | "compliance" | "connectivity";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    recommendation?: string;
  }>;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  connection_time_ms?: number;
  details?: Record<string, any>;
  recommendations?: Array<{
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
  }>;
}

export interface SortConfig {
  key: keyof DataSource | "health_score" | "compliance_score";
  direction: "asc" | "desc";
}

export interface FilterState {
  search: string;
  type: string;
  status: string;
  location: string;
  environment: string;
  criticality: string;
  tags: string[];
  healthScore: [number, number];
  complianceScore: [number, number];
  owner: string;
  team: string;
  hasIssues: boolean;
  favorites: boolean;
}

export type ViewMode = "grid" | "list" | "details" | "kanban";

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}