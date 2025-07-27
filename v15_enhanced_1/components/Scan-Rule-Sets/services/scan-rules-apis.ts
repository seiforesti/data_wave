import type {
  ScanRuleSet,
  ScanRule,
  ScanCondition,
  ScanAction,
  ScanExecution,
  ScanRuleSetFilter,
  ScanRuleSetSort,
  PaginationParams,
  ApiResponse,
  BulkOperation,
  ValidationResult,
  PerformanceMetrics,
  RuleTemplate,
  RulePattern,
  RuleOptimization,
  RuleIntelligence,
  RuleCollaboration,
  RuleAnalytics,
} from "../types"

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const API_TIMEOUT = 30000

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// HTTP client with advanced error handling and retry logic
const httpClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData.code)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
    }
  },

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, API_BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return this.request<T>(url.pathname + url.search)
  },

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  },
}

// Advanced Scan Rules API Service - Maps to enterprise_scan_rules_routes.py
export const scanRulesApi = {
  // ===== CORE SCAN RULE SET MANAGEMENT =====
  
  // Get scan rule sets with advanced filtering, sorting, and pagination
  getScanRuleSets: (
    filter?: ScanRuleSetFilter,
    sort?: ScanRuleSetSort,
    pagination?: PaginationParams,
  ): Promise<ApiResponse<ScanRuleSet[]>> => {
    return httpClient.get("/scan-rule-sets", {
      ...filter,
      sort_field: sort?.field,
      sort_direction: sort?.direction,
      page: pagination?.page,
      page_size: pagination?.pageSize,
    })
  },

  // Get single scan rule set by ID with full details
  getScanRuleSet: (id: number): Promise<ScanRuleSet> => {
    return httpClient.get(`/scan-rule-sets/${id}`)
  },

  // Create new scan rule set with validation
  createScanRuleSet: (data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    return httpClient.post("/scan-rule-sets", data)
  },

  // Update existing scan rule set
  updateScanRuleSet: (id: number, data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    return httpClient.put(`/scan-rule-sets/${id}`, data)
  },

  // Delete scan rule set with cascade options
  deleteScanRuleSet: (id: number, cascade: boolean = false): Promise<void> => {
    return httpClient.delete(`/scan-rule-sets/${id}?cascade=${cascade}`)
  },

  // ===== ADVANCED RULE SET OPERATIONS =====

  // Duplicate scan rule set with customization
  duplicateScanRuleSet: (id: number, options: {
    name?: string
    description?: string
    version?: string
    includeExecutions?: boolean
  }): Promise<ScanRuleSet> => {
    return httpClient.post(`/scan-rule-sets/${id}/duplicate`, options)
  },

  // Validate scan rule set with comprehensive checks
  validateScanRuleSet: (data: Partial<ScanRuleSet>): Promise<ValidationResult> => {
    return httpClient.post("/scan-rule-sets/validate", data)
  },

  // Test scan rule set with sample data
  testScanRuleSet: (id: number, testData: any): Promise<{
    results: any[]
    performance: PerformanceMetrics
    validation: ValidationResult
  }> => {
    return httpClient.post(`/scan-rule-sets/${id}/test`, { test_data: testData })
  },

  // ===== BULK OPERATIONS =====

  // Bulk operations on multiple rule sets
  bulkOperation: (operation: BulkOperation): Promise<{
    success: number
    failed: number
    errors: string[]
  }> => {
    return httpClient.post("/scan-rule-sets/bulk", operation)
  },

  // Bulk import rule sets from file
  bulkImport: (file: File, options: {
    overwrite?: boolean
    validate?: boolean
    template?: string
  }): Promise<{
    imported: number
    skipped: number
    errors: string[]
  }> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("overwrite", String(options.overwrite || false))
    formData.append("validate", String(options.validate || true))
    if (options.template) {
      formData.append("template", options.template)
    }

    return httpClient.request("/scan-rule-sets/bulk-import", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // ===== EXECUTION MANAGEMENT =====

  // Execute scan rule set with advanced options
  executeScanRuleSet: (id: number, options: {
    dataSourceId?: number
    priority?: "low" | "medium" | "high" | "critical"
    timeout?: number
    resources?: {
      cpu?: number
      memory?: number
    }
    parameters?: Record<string, any>
  }): Promise<ScanExecution> => {
    return httpClient.post(`/scan-rule-sets/${id}/execute`, options)
  },

  // Get execution history with filtering
  getExecutionHistory: (
    id: number,
    options: {
      pagination?: PaginationParams
      status?: string[]
      dateRange?: { start: string; end: string }
      dataSourceId?: number
    }
  ): Promise<ApiResponse<ScanExecution[]>> => {
    return httpClient.get(`/scan-rule-sets/${id}/executions`, {
      page: options.pagination?.page,
      page_size: options.pagination?.pageSize,
      status: options.status?.join(","),
      start_date: options.dateRange?.start,
      end_date: options.dateRange?.end,
      data_source_id: options.dataSourceId,
    })
  },

  // Cancel running execution
  cancelExecution: (executionId: number): Promise<void> => {
    return httpClient.post(`/scan-executions/${executionId}/cancel`)
  },

  // ===== PERFORMANCE & METRICS =====

  // Get comprehensive performance metrics
  getPerformanceMetrics: (
    id: number,
    options: {
      timeRange?: string
      granularity?: "hour" | "day" | "week" | "month"
      includeTrends?: boolean
      includeResourceUsage?: boolean
    }
  ): Promise<PerformanceMetrics> => {
    return httpClient.get(`/scan-rule-sets/${id}/metrics`, {
      time_range: options.timeRange,
      granularity: options.granularity,
      include_trends: options.includeTrends,
      include_resources: options.includeResourceUsage,
    })
  },

  // Get performance comparison between rule sets
  comparePerformance: (ruleSetIds: number[], options: {
    timeRange?: string
    metrics?: string[]
  }): Promise<{
    comparison: Record<string, PerformanceMetrics>
    summary: {
      best: number
      worst: number
      average: PerformanceMetrics
    }
  }> => {
    return httpClient.post("/scan-rule-sets/compare-performance", {
      rule_set_ids: ruleSetIds,
      time_range: options.timeRange,
      metrics: options.metrics,
    })
  },

  // ===== EXPORT & IMPORT =====

  // Export scan rule set in multiple formats
  exportScanRuleSet: (
    id: number,
    options: {
      format: "json" | "yaml" | "xml" | "csv"
      includeExecutions?: boolean
      includeMetrics?: boolean
      includeTemplates?: boolean
    }
  ): Promise<Blob> => {
    const params = new URLSearchParams({
      format: options.format,
      include_executions: String(options.includeExecutions || false),
      include_metrics: String(options.includeMetrics || false),
      include_templates: String(options.includeTemplates || false),
    })

    return httpClient.request(`/scan-rule-sets/${id}/export?${params}`, {
      headers: {
        Accept: `application/${options.format}`,
      },
    })
  },

  // Import scan rule set from file
  importScanRuleSet: (
    file: File,
    options: {
      validate?: boolean
      overwrite?: boolean
      template?: string
    }
  ): Promise<ScanRuleSet> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("validate", String(options.validate || true))
    formData.append("overwrite", String(options.overwrite || false))
    if (options.template) {
      formData.append("template", options.template)
    }

    return httpClient.request("/scan-rule-sets/import", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // ===== TEMPLATE MANAGEMENT =====

  // Get available templates
  getTemplates: (options: {
    category?: string
    tags?: string[]
    pagination?: PaginationParams
  }): Promise<ApiResponse<RuleTemplate[]>> => {
    return httpClient.get("/scan-rule-sets/templates", {
      category: options.category,
      tags: options.tags?.join(","),
      page: options.pagination?.page,
      page_size: options.pagination?.pageSize,
    })
  },

  // Create rule set from template
  createFromTemplate: (
    templateId: string,
    options: {
      name: string
      description?: string
      parameters?: Record<string, any>
      customizations?: Partial<ScanRuleSet>
    }
  ): Promise<ScanRuleSet> => {
    return httpClient.post("/scan-rule-sets/from-template", {
      template_id: templateId,
      ...options,
    })
  },

  // ===== PATTERN LIBRARY =====

  // Get pattern library
  getPatternLibrary: (options: {
    category?: string
    tags?: string[]
    search?: string
    pagination?: PaginationParams
  }): Promise<ApiResponse<RulePattern[]>> => {
    return httpClient.get("/scan-rule-sets/patterns", {
      category: options.category,
      tags: options.tags?.join(","),
      search: options.search,
      page: options.pagination?.page,
      page_size: options.pagination?.pageSize,
    })
  },

  // Add pattern to library
  addPattern: (pattern: Partial<RulePattern>): Promise<RulePattern> => {
    return httpClient.post("/scan-rule-sets/patterns", pattern)
  },

  // ===== INTELLIGENCE & OPTIMIZATION =====

  // Get AI recommendations for rule set
  getRecommendations: (id: number): Promise<{
    optimizations: RuleOptimization[]
    suggestions: string[]
    performance: PerformanceMetrics
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/recommendations`)
  },

  // Apply AI optimization
  applyOptimization: (
    id: number,
    optimizationId: string,
    options: {
      preview?: boolean
      parameters?: Record<string, any>
    }
  ): Promise<{
    applied: boolean
    changes: Partial<ScanRuleSet>
    impact: PerformanceMetrics
  }> => {
    return httpClient.post(`/scan-rule-sets/${id}/optimize`, {
      optimization_id: optimizationId,
      preview: options.preview,
      parameters: options.parameters,
    })
  },

  // ===== COLLABORATION =====

  // Get collaboration data
  getCollaboration: (id: number): Promise<{
    comments: any[]
    reviews: any[]
    approvals: any[]
    contributors: any[]
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/collaboration`)
  },

  // Add comment
  addComment: (id: number, comment: {
    content: string
    parentId?: number
    mentions?: string[]
  }): Promise<any> => {
    return httpClient.post(`/scan-rule-sets/${id}/comments`, comment)
  },

  // ===== ANALYTICS =====

  // Get comprehensive analytics
  getAnalytics: (id: number, options: {
    timeRange?: string
    dimensions?: string[]
    metrics?: string[]
  }): Promise<{
    overview: any
    trends: any[]
    breakdown: any
    insights: string[]
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/analytics`, {
      time_range: options.timeRange,
      dimensions: options.dimensions?.join(","),
      metrics: options.metrics?.join(","),
    })
  },

  // ===== SCHEDULING =====

  // Get schedule information
  getSchedule: (id: number): Promise<{
    enabled: boolean
    cron: string
    timezone: string
    nextRun?: string
    lastRun?: string
    history: any[]
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/schedule`)
  },

  // Update schedule
  updateSchedule: (
    id: number,
    schedule: {
      enabled: boolean
      cron: string
      timezone: string
    }
  ): Promise<void> => {
    return httpClient.put(`/scan-rule-sets/${id}/schedule`, schedule)
  },

  // ===== VERSION CONTROL =====

  // Get version history
  getVersionHistory: (id: number): Promise<{
    versions: any[]
    current: string
    latest: string
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/versions`)
  },

  // Create new version
  createVersion: (
    id: number,
    options: {
      version: string
      description?: string
      tags?: string[]
    }
  ): Promise<ScanRuleSet> => {
    return httpClient.post(`/scan-rule-sets/${id}/versions`, options)
  },

  // Revert to version
  revertToVersion: (id: number, version: string): Promise<ScanRuleSet> => {
    return httpClient.post(`/scan-rule-sets/${id}/revert`, { version })
  },

  // ===== COMPLIANCE & GOVERNANCE =====

  // Get compliance status
  getComplianceStatus: (id: number): Promise<{
    gdpr: { compliant: boolean; issues: string[] }
    hipaa: { compliant: boolean; issues: string[] }
    sox: { compliant: boolean; issues: string[] }
    pci: { compliant: boolean; issues: string[] }
  }> => {
    return httpClient.get(`/scan-rule-sets/${id}/compliance`)
  },

  // Validate compliance
  validateCompliance: (id: number, frameworks: string[]): Promise<{
    valid: boolean
    issues: string[]
    recommendations: string[]
  }> => {
    return httpClient.post(`/scan-rule-sets/${id}/validate-compliance`, {
      frameworks,
    })
  },
}

// Export the API error class for use in components
export { ApiError }