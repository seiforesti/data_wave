import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface ScanRuleSet {
  id: number
  name: string
  description?: string
  data_source_id?: number
  include_schemas?: string[]
  exclude_schemas?: string[]
  include_tables?: string[]
  exclude_tables?: string[]
  include_columns?: string[]
  exclude_columns?: string[]
  sample_data: boolean
  sample_size?: number
  created_at: string
  updated_at: string
  data_source?: {
    id: number
    name: string
    source_type: string
  }
  scan_count: number
  last_scan?: string
  success_rate?: number
}

export interface ScanRuleSetCreate {
  name: string
  description?: string
  data_source_id?: number
  include_schemas?: string[]
  exclude_schemas?: string[]
  include_tables?: string[]
  exclude_tables?: string[]
  include_columns?: string[]
  exclude_columns?: string[]
  sample_data: boolean
  sample_size?: number
}

export interface ScanRuleSetUpdate {
  name?: string
  description?: string
  data_source_id?: number
  include_schemas?: string[]
  exclude_schemas?: string[]
  include_tables?: string[]
  exclude_tables?: string[]
  include_columns?: string[]
  exclude_columns?: string[]
  sample_data?: boolean
  sample_size?: number
}

export interface ScanRuleSetAnalytics {
  total_rule_sets: number
  active_rule_sets: number
  rule_sets_by_data_source: Record<string, number>
  average_success_rate: number
  total_scans_executed: number
  scans_last_30_days: number
  top_performing_rule_sets: Array<{
    rule_set_id: number
    name: string
    success_rate: number
    total_scans: number
  }>
  rule_set_usage_trends: Array<{
    date: string
    scan_count: number
  }>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ScanExecution {
  scan_id: string
  rule_set_name: string
  data_source_name: string
  message: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  metadata?: Record<string, any>
}

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// HTTP Client
const httpClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}`,
          response.status,
          errorData.code
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
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
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  },
}

// API Service Functions
export const scanRuleSetApi = {
  // CRUD Operations
  getScanRuleSets: async (
    dataSourceId?: number,
    search?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ScanRuleSet[]> => {
    return httpClient.get('/api/scan-rule-sets', {
      data_source_id: dataSourceId,
      search,
      page,
      page_size: pageSize,
    })
  },

  getScanRuleSet: async (id: number): Promise<ScanRuleSet> => {
    return httpClient.get(`/api/scan-rule-sets/${id}`)
  },

  createScanRuleSet: async (data: ScanRuleSetCreate): Promise<ScanRuleSet> => {
    return httpClient.post('/api/scan-rule-sets', data)
  },

  updateScanRuleSet: async (id: number, data: ScanRuleSetUpdate): Promise<ScanRuleSet> => {
    return httpClient.put(`/api/scan-rule-sets/${id}`, data)
  },

  deleteScanRuleSet: async (id: number): Promise<void> => {
    return httpClient.delete(`/api/scan-rule-sets/${id}`)
  },

  // Analytics
  getAnalytics: async (): Promise<ScanRuleSetAnalytics> => {
    return httpClient.get('/api/scan-rule-sets/analytics/overview')
  },

  // Workflow Operations
  executeScanRuleSet: async (id: number, dataSourceId?: number): Promise<ScanExecution> => {
    return httpClient.post(`/api/scan-rule-sets/${id}/execute`, {
      data_source_id: dataSourceId,
    })
  },

  duplicateScanRuleSet: async (id: number, newName: string): Promise<ScanRuleSet> => {
    return httpClient.post(`/api/scan-rule-sets/${id}/duplicate`, {
      new_name: newName,
    })
  },

  // Validation
  validateScanRuleSet: async (data: ScanRuleSetCreate): Promise<ValidationResult> => {
    return httpClient.post('/api/scan-rule-sets/validate', data)
  },
}

// React Query Hooks
export const useScanRuleSets = (
  dataSourceId?: number,
  search?: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ['scan-rule-sets', dataSourceId, search, page, pageSize],
    queryFn: () => scanRuleSetApi.getScanRuleSets(dataSourceId, search, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useScanRuleSet = (id: number) => {
  return useQuery({
    queryKey: ['scan-rule-set', id],
    queryFn: () => scanRuleSetApi.getScanRuleSet(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useScanRuleSetAnalytics = () => {
  return useQuery({
    queryKey: ['scan-rule-set-analytics'],
    queryFn: () => scanRuleSetApi.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  })
}

// Mutations
export const useCreateScanRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScanRuleSetCreate) => scanRuleSetApi.createScanRuleSet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-rule-sets'] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set-analytics'] })
      toast.success('Scan rule set created successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create scan rule set')
    },
  })
}

export const useUpdateScanRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScanRuleSetUpdate }) =>
      scanRuleSetApi.updateScanRuleSet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['scan-rule-sets'] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set', id] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set-analytics'] })
      toast.success('Scan rule set updated successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update scan rule set')
    },
  })
}

export const useDeleteScanRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => scanRuleSetApi.deleteScanRuleSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-rule-sets'] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set-analytics'] })
      toast.success('Scan rule set deleted successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete scan rule set')
    },
  })
}

export const useExecuteScanRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dataSourceId }: { id: number; dataSourceId?: number }) =>
      scanRuleSetApi.executeScanRuleSet(id, dataSourceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scan-rule-sets'] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set-analytics'] })
      toast.success(`Scan execution started: ${data.message}`)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to execute scan rule set')
    },
  })
}

export const useDuplicateScanRuleSet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      scanRuleSetApi.duplicateScanRuleSet(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-rule-sets'] })
      queryClient.invalidateQueries({ queryKey: ['scan-rule-set-analytics'] })
      toast.success('Scan rule set duplicated successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to duplicate scan rule set')
    },
  })
}

export const useValidateScanRuleSet = () => {
  return useMutation({
    mutationFn: (data: ScanRuleSetCreate) => scanRuleSetApi.validateScanRuleSet(data),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to validate scan rule set')
    },
  })
}

// Utility Functions
export const formatScanRuleSetName = (name: string): string => {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
}

export const getScanRuleSetStatus = (ruleSet: ScanRuleSet): 'active' | 'inactive' | 'error' => {
  if (ruleSet.success_rate === undefined) return 'inactive'
  if (ruleSet.success_rate >= 90) return 'active'
  if (ruleSet.success_rate >= 70) return 'inactive'
  return 'error'
}

export const getScanRuleSetPriority = (ruleSet: ScanRuleSet): 'high' | 'medium' | 'low' => {
  if (ruleSet.scan_count > 100) return 'high'
  if (ruleSet.scan_count > 50) return 'medium'
  return 'low'
}

export { ApiError }