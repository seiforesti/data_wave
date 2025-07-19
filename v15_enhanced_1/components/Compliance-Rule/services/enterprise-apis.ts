// Enterprise Compliance API Services
// Comprehensive backend integration for all compliance features with advanced enterprise capabilities

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base API configuration with enterprise features
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')

// Advanced API client with enterprise features
class EnterpriseAPIClient {
  private client: AxiosInstance
  private requestQueue: Map<string, Promise<any>> = new Map()
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error: any) => {
      return error.response?.status >= 500 || error.code === 'NETWORK_ERROR'
    }
  }

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE}/api/${API_VERSION}`,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': API_VERSION,
        'X-Client': 'compliance-enterprise-ui'
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for authentication and request tracking
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()

        // Add timestamp
        config.headers['X-Request-Timestamp'] = new Date().toISOString()

        // Add user context if available
        const userContext = this.getUserContext()
        if (userContext) {
          config.headers['X-User-Context'] = JSON.stringify(userContext)
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling and response processing
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses for monitoring
        this.logResponse(response)
        return response
      },
      async (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          await this.handleAuthenticationError()
          return Promise.reject(error)
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          return this.handleRateLimit(error)
        }

        // Handle server errors with retry logic
        if (this.retryConfig.retryCondition(error)) {
          return this.retryRequest(error)
        }

        // Log error for monitoring
        this.logError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  private getUserContext(): any {
    const userStr = localStorage.getItem('user_context')
    return userStr ? JSON.parse(userStr) : null
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logResponse(response: AxiosResponse) {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
  }

  private logError(error: any) {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error)
  }

  private async handleAuthenticationError() {
    // Clear stored tokens
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    
    // Redirect to login or refresh token
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  private async handleRateLimit(error: any): Promise<any> {
    const retryAfter = error.response?.headers['retry-after'] || 5
    await this.delay(retryAfter * 1000)
    return this.client.request(error.config)
  }

  private async retryRequest(error: any): Promise<any> {
    const config = error.config
    config._retryCount = config._retryCount || 0

    if (config._retryCount >= this.retryConfig.maxRetries) {
      return Promise.reject(error)
    }

    config._retryCount++
    await this.delay(this.retryConfig.retryDelay * config._retryCount)
    return this.client.request(config)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Request deduplication to prevent duplicate API calls
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const key = this.getRequestKey(config)
    
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!
    }

    const promise = this.client.request<T>(config).then(response => response.data)
    this.requestQueue.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      this.requestQueue.delete(key)
    }
  }

  private getRequestKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`
  }

  // Batch request functionality
  async batchRequest<T = any>(requests: AxiosRequestConfig[]): Promise<T[]> {
    const promises = requests.map(config => this.request<T>(config))
    return Promise.all(promises)
  }

  // File upload with progress tracking
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          onProgress(progress)
        }
      }
    })
  }

  // Download file with progress tracking
  async downloadFile(url: string, onProgress?: (progress: number) => void): Promise<Blob> {
    const response = await this.client.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          onProgress(progress)
        }
      }
    })
    return response.data
  }
}

// Create global API client instance
const apiClient = new EnterpriseAPIClient()

// Advanced Types for Enterprise Compliance
export interface ComplianceRequirement {
  id: number
  data_source_id: number
  framework: string
  requirement_id: string
  title: string
  description: string
  category: string
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed' | 'in_progress'
  compliance_percentage: number
  last_assessed?: string
  next_assessment?: string
  assessor?: string
  assessment_notes?: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  remediation_plan?: string
  remediation_deadline?: string
  remediation_owner?: string
  evidence_files: string[]
  documentation_links: string[]
  impact_description?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  version: number
  tags: string[]
}

export interface ComplianceAssessment {
  id: number
  data_source_id: number
  framework: string
  assessment_type: 'annual' | 'quarterly' | 'monthly' | 'ad_hoc' | 'continuous'
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired' | 'cancelled'
  scheduled_date?: string
  started_date?: string
  completed_date?: string
  assessor?: string
  assessment_firm?: string
  overall_score?: number
  compliant_requirements: number
  non_compliant_requirements: number
  partially_compliant_requirements: number
  total_requirements: number
  findings: ComplianceFinding[]
  recommendations: string[]
  report_file?: string
  certificate_file?: string
  remediation_plan?: string
  follow_up_date?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ComplianceFinding {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  description: string
  evidence?: string
  recommendation: string
  remediation_effort: 'low' | 'medium' | 'high'
  remediation_timeline: string
  responsible_party?: string
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
}

export interface ComplianceGap {
  id: number
  data_source_id: number
  requirement_id: number
  gap_title: string
  gap_description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk' | 'deferred'
  remediation_plan?: string
  remediation_steps: string[]
  assigned_to?: string
  due_date?: string
  progress_percentage: number
  last_updated_by?: string
  business_impact?: string
  technical_impact?: string
  cost_estimate?: number
  effort_estimate?: string
  priority: number
  dependencies: string[]
  related_gaps: number[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ComplianceEvidence {
  id: number
  data_source_id: number
  requirement_id: number
  title: string
  description?: string
  evidence_type: 'document' | 'screenshot' | 'log' | 'certificate' | 'report' | 'configuration' | 'code'
  file_path?: string
  file_name?: string
  file_size?: number
  file_hash?: string
  file_mime_type?: string
  valid_from?: string
  valid_until?: string
  is_current: boolean
  collected_by?: string
  collection_method?: string
  collection_date: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by?: string
  verification_date?: string
  verification_notes?: string
  retention_period?: number
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ComplianceWorkflow {
  id: number
  name: string
  description: string
  workflow_type: 'assessment' | 'remediation' | 'approval' | 'review' | 'notification' | 'escalation'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'
  steps: ComplianceWorkflowStep[]
  current_step: number
  assigned_to?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  triggers: ComplianceWorkflowTrigger[]
  conditions: Record<string, any>
  variables: Record<string, any>
  execution_history: ComplianceWorkflowExecution[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ComplianceWorkflowStep {
  id: string
  name: string
  type: 'manual' | 'automated' | 'approval' | 'notification' | 'condition'
  description?: string
  assignee?: string
  due_date_offset?: number
  required: boolean
  conditions?: Record<string, any>
  actions: Record<string, any>
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed'
  started_at?: string
  completed_at?: string
  notes?: string
}

export interface ComplianceWorkflowTrigger {
  id: string
  type: 'manual' | 'scheduled' | 'event' | 'condition'
  config: Record<string, any>
  enabled: boolean
}

export interface ComplianceWorkflowExecution {
  id: string
  started_at: string
  completed_at?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  trigger: string
  steps_completed: number
  total_steps: number
  error_message?: string
  execution_log: string[]
}

export interface ComplianceReport {
  id: number
  name: string
  description: string
  report_type: 'compliance_status' | 'gap_analysis' | 'risk_assessment' | 'audit_trail' | 'executive_summary' | 'detailed_findings'
  framework?: string
  data_source_id?: number
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled'
  generated_by?: string
  generated_at?: string
  file_url?: string
  file_format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  parameters: Record<string, any>
  filters: Record<string, any>
  schedule?: ComplianceReportSchedule
  recipients: string[]
  distribution_method: 'email' | 'download' | 'api' | 'ftp'
  retention_period?: number
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ComplianceReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  day_of_week?: number
  day_of_month?: number
  time: string
  timezone: string
  enabled: boolean
  next_run?: string
  last_run?: string
}

export interface ComplianceIntegration {
  id: number
  name: string
  integration_type: 'grc_tool' | 'security_scanner' | 'audit_platform' | 'risk_management' | 'documentation' | 'ticketing'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'pending' | 'testing'
  config: Record<string, any>
  credentials: Record<string, any>
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual'
  last_synced_at?: string
  last_sync_status?: 'success' | 'failed' | 'partial'
  sync_statistics: ComplianceSyncStatistics
  error_message?: string
  error_count: number
  supported_frameworks: string[]
  data_mapping: Record<string, any>
  webhook_url?: string
  api_version?: string
  rate_limit?: number
  timeout?: number
  retry_config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ComplianceSyncStatistics {
  total_records: number
  records_created: number
  records_updated: number
  records_failed: number
  last_sync_duration: number
  average_sync_duration: number
  success_rate: number
}

export interface ComplianceFramework {
  id: string
  name: string
  version: string
  description: string
  category: 'security' | 'privacy' | 'financial' | 'healthcare' | 'industry' | 'regional'
  jurisdiction: string
  authority: string
  effective_date: string
  status: 'active' | 'deprecated' | 'draft' | 'retired'
  requirements_count: number
  controls_count: number
  complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  implementation_guide?: string
  certification_body?: string
  assessment_frequency: string
  penalty_information?: string
  related_frameworks: string[]
  crosswalk_mappings: Record<string, string[]>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Compliance Management APIs
export class ComplianceManagementAPI {
  // Requirements Management
  static async getRequirements(params?: {
    data_source_id?: number
    framework?: string
    status?: string
    risk_level?: string
    category?: string
    page?: number
    limit?: number
    sort?: string
    search?: string
  }): Promise<{ data: ComplianceRequirement[]; total: number; page: number; limit: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/requirements',
      params
    })
  }

  static async getRequirement(id: number): Promise<ComplianceRequirement> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/requirements/${id}`
    })
  }

  static async createRequirement(data: Omit<ComplianceRequirement, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<ComplianceRequirement> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/requirements',
      data
    })
  }

  static async updateRequirement(id: number, data: Partial<ComplianceRequirement>): Promise<ComplianceRequirement> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/requirements/${id}`,
      data
    })
  }

  static async deleteRequirement(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/requirements/${id}`
    })
  }

  static async bulkUpdateRequirements(updates: Array<{ id: number; data: Partial<ComplianceRequirement> }>): Promise<ComplianceRequirement[]> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/requirements/bulk-update',
      data: { updates }
    })
  }

  static async assessRequirement(id: number, assessment: {
    status: ComplianceRequirement['status']
    compliance_percentage: number
    assessment_notes?: string
    assessor?: string
    evidence_files?: string[]
  }): Promise<ComplianceRequirement> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/requirements/${id}/assess`,
      data: assessment
    })
  }

  static async getRequirementHistory(id: number): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/requirements/${id}/history`
    })
  }

  static async getRuleTemplates(): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/rules/templates'
    })
  }

  static async getRuleTemplate(type: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/rules/templates/${type}`
    })
  }

  static async testRule(ruleData: any): Promise<{ success: boolean; results: any; errors?: string[] }> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/rules/test',
      data: ruleData
    })
  }

  static async validateRule(id: number): Promise<{ valid: boolean; issues: any[]; recommendations: string[] }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/rules/${id}/validate`
    })
  }

  // Assessments Management
  static async getAssessments(params?: {
    data_source_id?: number
    framework?: string
    status?: string
    assessment_type?: string
    page?: number
    limit?: number
    sort?: string
  }): Promise<{ data: ComplianceAssessment[]; total: number; page: number; limit: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/assessments',
      params
    })
  }

  static async getAssessment(id: number): Promise<ComplianceAssessment> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/assessments/${id}`
    })
  }

  static async createAssessment(data: Omit<ComplianceAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceAssessment> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/assessments',
      data
    })
  }

  static async updateAssessment(id: number, data: Partial<ComplianceAssessment>): Promise<ComplianceAssessment> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/assessments/${id}`,
      data
    })
  }

  static async deleteAssessment(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/assessments/${id}`
    })
  }

  static async startAssessment(id: number, params?: { assessor?: string; notes?: string }): Promise<{ assessment_instance_id: string }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/assessments/${id}/start`,
      data: params
    })
  }

  static async completeAssessment(id: number, results: {
    overall_score: number
    findings: ComplianceFinding[]
    recommendations: string[]
    report_file?: string
    certificate_file?: string
  }): Promise<ComplianceAssessment> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/assessments/${id}/complete`,
      data: results
    })
  }

  static async getAssessmentProgress(id: number): Promise<{
    total_requirements: number
    assessed_requirements: number
    progress_percentage: number
    estimated_completion: string
  }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/assessments/${id}/progress`
    })
  }

  // Gaps Management
  static async getGaps(params?: {
    data_source_id?: number
    requirement_id?: number
    status?: string
    severity?: string
    assigned_to?: string
    page?: number
    limit?: number
    sort?: string
  }): Promise<{ data: ComplianceGap[]; total: number; page: number; limit: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/gaps',
      params
    })
  }

  static async getGap(id: number): Promise<ComplianceGap> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/gaps/${id}`
    })
  }

  static async createGap(data: Omit<ComplianceGap, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceGap> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/gaps',
      data
    })
  }

  static async updateGap(id: number, data: Partial<ComplianceGap>): Promise<ComplianceGap> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/gaps/${id}`,
      data
    })
  }

  static async deleteGap(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/gaps/${id}`
    })
  }

  static async updateGapProgress(id: number, progress: {
    progress_percentage: number
    status?: ComplianceGap['status']
    notes?: string
  }): Promise<ComplianceGap> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/gaps/${id}/progress`,
      data: progress
    })
  }

  static async assignGap(id: number, assignee: string, notes?: string): Promise<ComplianceGap> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/gaps/${id}/assign`,
      data: { assigned_to: assignee, notes }
    })
  }

  static async getGapTimeline(id: number): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/gaps/${id}/timeline`
    })
  }

  // Evidence Management
  static async getEvidence(params?: {
    data_source_id?: number
    requirement_id?: number
    evidence_type?: string
    verification_status?: string
    page?: number
    limit?: number
  }): Promise<{ data: ComplianceEvidence[]; total: number; page: number; limit: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/evidence',
      params
    })
  }

  static async getEvidenceItem(id: number): Promise<ComplianceEvidence> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/evidence/${id}`
    })
  }

  static async createEvidence(data: Omit<ComplianceEvidence, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceEvidence> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/evidence',
      data
    })
  }

  static async updateEvidence(id: number, data: Partial<ComplianceEvidence>): Promise<ComplianceEvidence> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/evidence/${id}`,
      data
    })
  }

  static async deleteEvidence(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/evidence/${id}`
    })
  }

  static async uploadEvidenceFile(
    id: number, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ComplianceEvidence> {
    return apiClient.uploadFile(`/compliance/evidence/${id}/upload`, file, onProgress)
  }

  static async downloadEvidenceFile(id: number, onProgress?: (progress: number) => void): Promise<Blob> {
    return apiClient.downloadFile(`/compliance/evidence/${id}/download`, onProgress)
  }

  static async verifyEvidence(id: number, verification: {
    verification_status: ComplianceEvidence['verification_status']
    verification_notes?: string
  }): Promise<ComplianceEvidence> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/evidence/${id}/verify`,
      data: verification
    })
  }
}

// Framework Integration APIs
export class FrameworkIntegrationAPI {
  static async getFrameworks(params?: {
    category?: string
    status?: string
    jurisdiction?: string
    search?: string
  }): Promise<ComplianceFramework[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/frameworks',
      params
    })
  }

  static async getFramework(frameworkId: string): Promise<ComplianceFramework> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/frameworks/${frameworkId}`
    })
  }

  static async getFrameworkRequirements(frameworkId: string, params?: {
    category?: string
    risk_level?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/frameworks/${frameworkId}/requirements`,
      params
    })
  }

  static async importFrameworkRequirements(frameworkId: string, dataSourceId: number, options?: {
    overwrite_existing?: boolean
    import_controls?: boolean
    import_evidence_templates?: boolean
  }): Promise<{ imported_count: number; skipped_count: number; error_count: number }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/frameworks/${frameworkId}/import`,
      data: { data_source_id: dataSourceId, ...options }
    })
  }

  static async validateFrameworkCompliance(frameworkId: string, entityId: string, entityType: string = 'data_source'): Promise<{
    overall_score: number
    compliant_requirements: number
    non_compliant_requirements: number
    partially_compliant_requirements: number
    not_assessed_requirements: number
    critical_gaps: number
    high_risk_gaps: number
    recommendations: string[]
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/frameworks/${frameworkId}/validate`,
      data: { entity_id: entityId, entity_type: entityType }
    })
  }

  static async createFrameworkMapping(sourceFramework: string, targetFramework: string, mappings: Record<string, string[]>): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/frameworks/mapping',
      data: { source_framework: sourceFramework, target_framework: targetFramework, mappings }
    })
  }

  static async getFrameworkMapping(sourceFramework: string, targetFramework: string): Promise<Record<string, string[]>> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/frameworks/mapping/${sourceFramework}/${targetFramework}`
    })
  }

  static async getFrameworkCrosswalk(frameworkId: string): Promise<Record<string, string[]>> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/frameworks/${frameworkId}/crosswalk`
    })
  }

  static async generateFrameworkReport(frameworkId: string, entityId: string, reportType: string = 'compliance_status'): Promise<{
    report_id: string
    file_url?: string
    status: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/frameworks/${frameworkId}/report`,
      data: { entity_id: entityId, report_type: reportType }
    })
  }
}

// Risk Assessment APIs
export class RiskAssessmentAPI {
  static async getRiskAssessment(entityId: string, entityType: string = 'data_source'): Promise<{
    overall_risk_score: number
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    risk_factors: any[]
    risk_trends: any[]
    recommendations: string[]
    last_assessed: string
    next_assessment: string
  }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/risk-assessment/${entityType}/${entityId}`
    })
  }

  static async calculateRiskScore(entityId: string, entityType: string = 'data_source', factors?: Record<string, any>): Promise<{
    risk_score: number
    risk_level: string
    contributing_factors: any[]
    calculation_details: any
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/risk-assessment/${entityType}/${entityId}/calculate`,
      data: { factors }
    })
  }

  static async getRiskFactors(entityId: string, entityType: string = 'data_source'): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/risk-assessment/${entityType}/${entityId}/factors`
    })
  }

  static async updateRiskFactors(entityId: string, entityType: string = 'data_source', factors: any[]): Promise<void> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/risk-assessment/${entityType}/${entityId}/factors`,
      data: { factors }
    })
  }

  static async getRiskTrends(entityId: string, entityType: string = 'data_source', period: string = '30d'): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/risk-assessment/${entityType}/${entityId}/trends`,
      params: { period }
    })
  }

  static async generateRiskReport(entityId: string, entityType: string = 'data_source', reportType: string = 'detailed'): Promise<{
    report_id: string
    file_url?: string
    status: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/risk-assessment/${entityType}/${entityId}/report`,
      data: { report_type: reportType }
    })
  }

  static async getRiskMatrix(): Promise<{
    probability_levels: string[]
    impact_levels: string[]
    risk_matrix: number[][]
    risk_categories: any[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/risk-assessment/matrix'
    })
  }

  static async updateRiskMatrix(matrix: {
    probability_levels: string[]
    impact_levels: string[]
    risk_matrix: number[][]
  }): Promise<void> {
    return apiClient.request({
      method: 'PUT',
      url: '/compliance/risk-assessment/matrix',
      data: matrix
    })
  }
}

// Audit & Reporting APIs
export class AuditReportingAPI {
  static async getAuditTrail(entityType: string, entityId: string, params?: {
    action_type?: string
    user_id?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/audit/${entityType}/${entityId}`,
      params
    })
  }

  static async getComplianceReports(params?: {
    data_source_id?: number
    framework?: string
    report_type?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: ComplianceReport[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/reports',
      params
    })
  }

  static async getReport(id: number): Promise<ComplianceReport> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/reports/${id}`
    })
  }

  static async createReport(data: Omit<ComplianceReport, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceReport> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/reports',
      data
    })
  }

  static async updateReport(id: number, data: Partial<ComplianceReport>): Promise<ComplianceReport> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/reports/${id}`,
      data
    })
  }

  static async deleteReport(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/reports/${id}`
    })
  }

  static async generateReport(id: number, params?: { force_regenerate?: boolean }): Promise<{
    report_id: string
    status: string
    estimated_completion?: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/reports/${id}/generate`,
      data: params
    })
  }

  static async downloadReport(id: number, onProgress?: (progress: number) => void): Promise<Blob> {
    return apiClient.downloadFile(`/compliance/reports/${id}/download`, onProgress)
  }

  static async scheduleReport(id: number, schedule: ComplianceReportSchedule): Promise<ComplianceReport> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/reports/${id}/schedule`,
      data: { schedule }
    })
  }

  static async getCertifications(entityId: string, entityType: string = 'data_source'): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/certifications/${entityType}/${entityId}`
    })
  }

  static async uploadCertification(entityId: string, certification: any, file?: File): Promise<any> {
    if (file) {
      return apiClient.uploadFile(`/compliance/certifications/${entityId}`, file)
    } else {
      return apiClient.request({
        method: 'POST',
        url: `/compliance/certifications/${entityId}`,
        data: certification
      })
    }
  }

  static async getReportTemplates(): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/reports/templates'
    })
  }

  static async getReportTemplate(type: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/reports/templates/${type}`
    })
  }

  static async createReportTemplate(template: any): Promise<any> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/reports/templates',
      data: template
    })
  }

  static async previewReport(data: any): Promise<{ preview_url: string; estimated_size: string; generation_time: string }> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/reports/preview',
      data
    })
  }
}

// Workflow Automation APIs
export class WorkflowAutomationAPI {
  static async getWorkflows(params?: {
    workflow_type?: string
    status?: string
    assigned_to?: string
    priority?: string
    page?: number
    limit?: number
  }): Promise<{ data: ComplianceWorkflow[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/workflows',
      params
    })
  }

  static async getWorkflow(id: number): Promise<ComplianceWorkflow> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/workflows/${id}`
    })
  }

  static async createWorkflow(data: Omit<ComplianceWorkflow, 'id' | 'created_at' | 'updated_at' | 'execution_history'>): Promise<ComplianceWorkflow> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/workflows',
      data
    })
  }

  static async updateWorkflow(id: number, data: Partial<ComplianceWorkflow>): Promise<ComplianceWorkflow> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/workflows/${id}`,
      data
    })
  }

  static async deleteWorkflow(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/workflows/${id}`
    })
  }

  static async startWorkflow(id: number, params?: any): Promise<{ instance_id: string }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/${id}/start`,
      data: params
    })
  }

  static async pauseWorkflow(instanceId: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/instances/${instanceId}/pause`
    })
  }

  static async resumeWorkflow(instanceId: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/instances/${instanceId}/resume`
    })
  }

  static async cancelWorkflow(instanceId: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/instances/${instanceId}/cancel`
    })
  }

  static async approveWorkflowStep(instanceId: string, stepId: string, decision: 'approve' | 'reject', notes?: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/instances/${instanceId}/steps/${stepId}/approve`,
      data: { decision, notes }
    })
  }

  static async getWorkflowStatus(instanceId: string): Promise<{
    status: string
    current_step: number
    total_steps: number
    progress_percentage: number
    started_at: string
    estimated_completion?: string
    execution_log: string[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/workflows/instances/${instanceId}/status`
    })
  }

  static async getWorkflowHistory(id: number): Promise<ComplianceWorkflowExecution[]> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/workflows/${id}/history`
    })
  }

  static async getWorkflowTemplates(): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/workflows/templates'
    })
  }

  static async getWorkflowTemplate(type: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/workflows/templates/${type}`
    })
  }

  static async getTriggerTemplates(): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/workflows/trigger-templates'
    })
  }

  static async getActionTemplates(): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/workflows/action-templates'
    })
  }

  static async executeWorkflow(id: number, params?: any): Promise<{ instance_id: string; status: string }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/workflows/${id}/execute`,
      data: params
    })
  }

  static async createWorkflowTemplate(template: any): Promise<any> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/workflows/templates',
      data: template
    })
  }

  static async getActiveWorkflowInstances(params?: {
    workflow_id?: number
    assigned_to?: string
    status?: string
  }): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/workflows/instances',
      params
    })
  }
}

// Integration APIs
export class IntegrationAPI {
  static async getIntegrations(params?: {
    integration_type?: string
    provider?: string
    status?: string
  }): Promise<ComplianceIntegration[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/integrations',
      params
    })
  }

  static async getIntegration(id: number): Promise<ComplianceIntegration> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/integrations/${id}`
    })
  }

  static async createIntegration(data: Omit<ComplianceIntegration, 'id' | 'created_at' | 'updated_at' | 'sync_statistics'>): Promise<ComplianceIntegration> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/integrations',
      data
    })
  }

  static async updateIntegration(id: number, data: Partial<ComplianceIntegration>): Promise<ComplianceIntegration> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/integrations/${id}`,
      data
    })
  }

  static async deleteIntegration(id: number): Promise<void> {
    return apiClient.request({
      method: 'DELETE',
      url: `/compliance/integrations/${id}`
    })
  }

  static async testIntegration(id: number): Promise<{
    status: 'success' | 'failed'
    response_time: number
    error_message?: string
    test_results: any
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/integrations/${id}/test`
    })
  }

  static async syncIntegration(id: number, options?: { full_sync?: boolean }): Promise<{
    sync_id: string
    status: string
    estimated_completion?: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/integrations/${id}/sync`,
      data: options
    })
  }

  static async getIntegrationStatus(id: number): Promise<{
    status: string
    last_synced_at?: string
    sync_statistics: ComplianceSyncStatistics
    error_message?: string
  }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/integrations/${id}/status`
    })
  }

  static async getAvailableIntegrations(): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/integrations/available'
    })
  }

  static async getIntegrationTemplates(): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/integrations/templates'
    })
  }

  static async getIntegrationTemplate(type: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/integrations/templates/${type}`
    })
  }

  static async getIntegrationLogs(id: number, params?: {
    level?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/integrations/${id}/logs`,
      params
    })
  }
}

// Data Sources Management APIs (Integration with Data Governance)
export class DataSourcesAPI {
  static async getDataSources(params?: {
    status?: string
    type?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/data-sources',
      params
    })
  }

  static async getDataSource(id: number): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/data-sources/${id}`
    })
  }

  static async getDataSourceSchemas(id: number): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/data-sources/${id}/schemas`
    })
  }

  static async getDataSourceTables(id: number, schema?: string): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/data-sources/${id}/tables`,
      params: { schema }
    })
  }

  static async getDataSourceColumns(id: number, table: string, schema?: string): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: `/data-sources/${id}/columns`,
      params: { table, schema }
    })
  }

  static async testDataSourceConnection(id: number): Promise<{
    status: 'success' | 'failed'
    response_time: number
    error_message?: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/data-sources/${id}/test-connection`
    })
  }
}

// Enhanced Compliance Analytics APIs
export class ComplianceAnalyticsAPI {
  static async getComplianceMetrics(params?: {
    data_source_id?: number
    framework?: string
    date_range?: { start: string; end: string }
    granularity?: 'daily' | 'weekly' | 'monthly'
  }): Promise<{
    overall_score: number
    framework_scores: Record<string, number>
    risk_distribution: Record<string, number>
    trends: any[]
    benchmarks: any
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/analytics/metrics',
      params
    })
  }

  static async getComplianceTrends(params?: {
    data_source_id?: number
    metric_type?: string
    period?: string
  }): Promise<any[]> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/analytics/trends',
      params
    })
  }

  static async generateComplianceInsights(params?: {
    data_source_id?: number
    analysis_type?: 'risk' | 'performance' | 'gaps'
  }): Promise<{
    insights: any[]
    recommendations: string[]
    priority_actions: any[]
  }> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/analytics/insights',
      data: params
    })
  }

  static async getComplianceForecasting(params?: {
    data_source_id?: number
    forecast_period?: number
    metrics?: string[]
  }): Promise<{
    forecasts: any[]
    confidence_intervals: any[]
    assumptions: string[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/analytics/forecasting',
      params
    })
  }
}

// Enhanced Remediation Management APIs
export class RemediationAPI {
  static async getRemediationPlans(params?: {
    data_source_id?: number
    status?: string
    priority?: string
    assigned_to?: string
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/remediation/plans',
      params
    })
  }

  static async createRemediationPlan(data: {
    title: string
    description: string
    issue_ids: number[]
    priority: string
    assigned_to: string
    due_date: string
    steps: any[]
  }): Promise<any> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/remediation/plans',
      data
    })
  }

  static async executeAutomatedRemediation(planId: number, params?: {
    dry_run?: boolean
    approval_required?: boolean
  }): Promise<{
    execution_id: string
    status: string
    estimated_completion: string
  }> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/remediation/plans/${planId}/execute`,
      data: params
    })
  }

  static async getRemediationStatus(executionId: string): Promise<{
    status: string
    progress: number
    steps_completed: number
    total_steps: number
    results: any[]
    errors: any[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/remediation/executions/${executionId}/status`
    })
  }
}

// Settings Management APIs
export class SettingsAPI {
  static async getSettings(category?: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: `/compliance/settings${category ? `/${category}` : ''}`
    })
  }

  static async updateSettings(category: string, settings: any): Promise<any> {
    return apiClient.request({
      method: 'PUT',
      url: `/compliance/settings/${category}`,
      data: settings
    })
  }

  static async resetSettings(category?: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/settings/reset${category ? `/${category}` : ''}`
    })
  }

  static async exportSettings(): Promise<Blob> {
    return apiClient.downloadFile('/compliance/settings/export')
  }

  static async importSettings(file: File): Promise<any> {
    return apiClient.uploadFile('/compliance/settings/import', file)
  }

  static async validateSettings(settings: any): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/settings/validate',
      data: settings
    })
  }
}

// System Health and Monitoring APIs
export class SystemAPI {
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    uptime: number
    latency: number
    errorRate: number
    services: any[]
    lastChecked: string
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/system/health'
    })
  }

  static async getSystemMetrics(timeRange?: string): Promise<{
    cpu: number
    memory: number
    disk: number
    network: any
    database: any
    cache: any
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/system/metrics',
      params: { timeRange }
    })
  }

  static async getSystemLogs(params?: {
    level?: string
    service?: string
    limit?: number
    offset?: number
  }): Promise<{ data: any[]; total: number }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/system/logs',
      params
    })
  }

  static async restartService(serviceName: string): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: `/compliance/system/services/${serviceName}/restart`
    })
  }

  static async getSystemInfo(): Promise<{
    version: string
    buildDate: string
    environment: string
    features: string[]
    dependencies: any[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/system/info'
    })
  }
}

// Enhanced Dashboard APIs
export class DashboardAPI {
  static async getDashboardData(params?: {
    dataSourceId?: number
    timeRange?: string
    includeInsights?: boolean
  }): Promise<{
    metrics: any
    trends: any[]
    activities: any[]
    insights: any[]
    alerts: any[]
  }> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/dashboard',
      params
    })
  }

  static async refreshDashboard(force?: boolean): Promise<void> {
    return apiClient.request({
      method: 'POST',
      url: '/compliance/dashboard/refresh',
      data: { force }
    })
  }

  static async getDashboardConfig(userId?: string): Promise<any> {
    return apiClient.request({
      method: 'GET',
      url: '/compliance/dashboard/config',
      params: { userId }
    })
  }

  static async updateDashboardConfig(config: any): Promise<any> {
    return apiClient.request({
      method: 'PUT',
      url: '/compliance/dashboard/config',
      data: config
    })
  }
}

// Export all APIs as a collection
export const ComplianceAPIs = {
  Management: ComplianceManagementAPI,
  Framework: FrameworkIntegrationAPI,
  Risk: RiskAssessmentAPI,
  Audit: AuditReportingAPI,
  Workflow: WorkflowAutomationAPI,
  Integration: IntegrationAPI,
  DataSources: DataSourcesAPI,
  Analytics: ComplianceAnalyticsAPI,
  Remediation: RemediationAPI,
  Settings: SettingsAPI,
  System: SystemAPI,
  Dashboard: DashboardAPI,
  Client: apiClient
}

export default ComplianceAPIs