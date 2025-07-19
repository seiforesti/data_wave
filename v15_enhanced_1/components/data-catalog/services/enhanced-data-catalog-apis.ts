import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface CatalogItem {
  id: number
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'procedure' | 'function'
  description?: string
  schema_name?: string
  table_name?: string
  column_name?: string
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  owner?: string
  steward?: string
  quality_score: number
  popularity_score: number
  data_type?: string
  size_bytes?: number
  row_count?: number
  column_count?: number
  null_percentage?: number
  unique_values?: number
  min_value?: string
  max_value?: string
  avg_value?: string
  query_count: number
  user_count: number
  avg_response_time?: number
  parent_id?: number
  data_source_id: number
  created_at: string
  updated_at: string
  last_accessed?: string
  created_by?: string
  updated_by?: string
  tags: string[]
}

export interface CatalogItemCreate {
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'procedure' | 'function'
  description?: string
  schema_name?: string
  table_name?: string
  column_name?: string
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  owner?: string
  data_source_id: number
  parent_id?: number
}

export interface CatalogItemUpdate {
  name?: string
  description?: string
  classification?: 'public' | 'internal' | 'confidential' | 'restricted'
  owner?: string
  quality_score?: number
  popularity_score?: number
}

export interface DataCatalogAnalytics {
  total_items: number
  items_by_type: Record<string, number>
  items_by_classification: Record<string, number>
  avg_quality_score: number
  total_queries: number
  unique_users: number
  top_accessed_items: Array<{
    id: number
    name: string
    type: string
    query_count: number
    user_count: number
    avg_response_time?: number
  }>
  quality_distribution: Record<string, number>
  lineage_coverage: number
  recent_activity: Array<{
    item_id: number
    item_name: string
    operation: string
    user_id?: string
    timestamp: string
    response_time?: number
  }>
}

export interface LineageGraph {
  nodes: Array<{
    id: string
    name: string
    type: string
    classification: string
    data_source_id: number
  }>
  edges: Array<{
    source: string
    target: string
    type: string
    transformation?: string
  }>
  metadata: {
    total_nodes: number
    total_edges: number
    depth: number
    generated_at: string
  }
}

export interface QualityAssessment {
  item_id: number
  rules: Array<{
    id: number
    name: string
    type: string
    description?: string
    threshold: number
    last_score?: number
    is_active: boolean
  }>
  overall_score: number
  issues: Array<{
    type: string
    severity: string
    description: string
  }>
  recommendations: string[]
}

export interface CatalogSearchRequest {
  query?: string
  type_filter?: 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'procedure' | 'function'
  classification_filter?: 'public' | 'internal' | 'confidential' | 'restricted'
  owner_filter?: string
  tag_filter?: string[]
  min_quality_score?: number
  limit: number
  offset: number
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
export const dataCatalogApi = {
  // CRUD Operations
  getCatalogItems: async (
    dataSourceId?: number,
    itemType?: string,
    classification?: string,
    search?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<CatalogItem[]> => {
    return httpClient.get('/api/data-catalog/items', {
      data_source_id: dataSourceId,
      item_type: itemType,
      classification,
      search,
      page,
      page_size: pageSize,
    })
  },

  getCatalogItem: async (id: number): Promise<CatalogItem> => {
    return httpClient.get(`/api/data-catalog/items/${id}`)
  },

  createCatalogItem: async (data: CatalogItemCreate): Promise<CatalogItem> => {
    return httpClient.post('/api/data-catalog/items', data)
  },

  updateCatalogItem: async (id: number, data: CatalogItemUpdate): Promise<CatalogItem> => {
    return httpClient.put(`/api/data-catalog/items/${id}`, data)
  },

  deleteCatalogItem: async (id: number): Promise<void> => {
    return httpClient.delete(`/api/data-catalog/items/${id}`)
  },

  // Search and Discovery
  searchCatalogItems: async (searchRequest: CatalogSearchRequest): Promise<CatalogItem[]> => {
    return httpClient.post('/api/data-catalog/search', searchRequest)
  },

  discoverCatalogItems: async (dataSourceId: number): Promise<{ message: string; discovered_count: number }> => {
    return httpClient.post(`/api/data-catalog/discover/${dataSourceId}`)
  },

  // Analytics
  getAnalytics: async (dataSourceId?: number): Promise<DataCatalogAnalytics> => {
    return httpClient.get('/api/data-catalog/analytics/overview', {
      data_source_id: dataSourceId,
    })
  },

  // Lineage Management
  getItemLineage: async (itemId: number, depth: number = 3): Promise<LineageGraph> => {
    return httpClient.get(`/api/data-catalog/items/${itemId}/lineage`, {
      depth,
    })
  },

  createLineage: async (
    sourceItemId: number,
    targetItemId: number,
    lineageType: string = 'transform',
    transformationLogic?: string
  ): Promise<{ message: string }> => {
    return httpClient.post('/api/data-catalog/lineage', {
      source_item_id: sourceItemId,
      target_item_id: targetItemId,
      lineage_type: lineageType,
      transformation_logic: transformationLogic,
    })
  },

  // Quality Management
  getItemQualityAssessment: async (itemId: number): Promise<QualityAssessment> => {
    return httpClient.get(`/api/data-catalog/items/${itemId}/quality`)
  },

  // Tag Management
  addItemTag: async (itemId: number, tagName: string, tagValue?: string): Promise<{ message: string }> => {
    return httpClient.post(`/api/data-catalog/items/${itemId}/tags`, {
      tag_name: tagName,
      tag_value: tagValue,
    })
  },

  // Usage Tracking
  logItemUsage: async (
    itemId: number,
    operationType: string,
    userId?: string,
    queryText?: string,
    responseTimeMs?: number,
    rowsReturned?: number
  ): Promise<{ message: string }> => {
    return httpClient.post(`/api/data-catalog/items/${itemId}/usage`, {
      operation_type: operationType,
      user_id: userId,
      query_text: queryText,
      response_time_ms: responseTimeMs,
      rows_returned: rowsReturned,
    })
  },
}

// React Query Hooks
export const useCatalogItems = (
  dataSourceId?: number,
  itemType?: string,
  classification?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ['catalog-items', dataSourceId, itemType, classification, search, page, pageSize],
    queryFn: () => dataCatalogApi.getCatalogItems(dataSourceId, itemType, classification, search, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCatalogItem = (id: number) => {
  return useQuery({
    queryKey: ['catalog-item', id],
    queryFn: () => dataCatalogApi.getCatalogItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCatalogAnalytics = (dataSourceId?: number) => {
  return useQuery({
    queryKey: ['catalog-analytics', dataSourceId],
    queryFn: () => dataCatalogApi.getAnalytics(dataSourceId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  })
}

export const useItemLineage = (itemId: number, depth: number = 3) => {
  return useQuery({
    queryKey: ['item-lineage', itemId, depth],
    queryFn: () => dataCatalogApi.getItemLineage(itemId, depth),
    enabled: !!itemId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  })
}

export const useItemQualityAssessment = (itemId: number) => {
  return useQuery({
    queryKey: ['item-quality', itemId],
    queryFn: () => dataCatalogApi.getItemQualityAssessment(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutations
export const useCreateCatalogItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CatalogItemCreate) => dataCatalogApi.createCatalogItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-analytics'] })
      toast.success('Catalog item created successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create catalog item')
    },
  })
}

export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatalogItemUpdate }) =>
      dataCatalogApi.updateCatalogItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] })
      queryClient.invalidateQueries({ queryKey: ['catalog-analytics'] })
      toast.success('Catalog item updated successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update catalog item')
    },
  })
}

export const useDeleteCatalogItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dataCatalogApi.deleteCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-analytics'] })
      toast.success('Catalog item deleted successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete catalog item')
    },
  })
}

export const useDiscoverCatalogItems = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dataSourceId: number) => dataCatalogApi.discoverCatalogItems(dataSourceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-analytics'] })
      toast.success(`Discovered ${data.discovered_count} catalog items`)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to discover catalog items')
    },
  })
}

export const useCreateLineage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sourceItemId,
      targetItemId,
      lineageType,
      transformationLogic,
    }: {
      sourceItemId: number
      targetItemId: number
      lineageType: string
      transformationLogic?: string
    }) => dataCatalogApi.createLineage(sourceItemId, targetItemId, lineageType, transformationLogic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-lineage'] })
      toast.success('Lineage relationship created successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create lineage relationship')
    },
  })
}

export const useAddItemTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, tagName, tagValue }: { itemId: number; tagName: string; tagValue?: string }) =>
      dataCatalogApi.addItemTag(itemId, tagName, tagValue),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', itemId] })
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      toast.success('Tag added successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to add tag')
    },
  })
}

export const useLogItemUsage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      operationType,
      userId,
      queryText,
      responseTimeMs,
      rowsReturned,
    }: {
      itemId: number
      operationType: string
      userId?: string
      queryText?: string
      responseTimeMs?: number
      rowsReturned?: number
    }) => dataCatalogApi.logItemUsage(itemId, operationType, userId, queryText, responseTimeMs, rowsReturned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-analytics'] })
    },
    onError: (error: ApiError) => {
      console.error('Failed to log usage:', error.message)
    },
  })
}

// Utility Functions
export const getCatalogItemIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'database':
      return '🗄️'
    case 'schema':
      return '📁'
    case 'table':
      return '📊'
    case 'view':
      return '👁️'
    case 'column':
      return '📋'
    case 'index':
      return '🔍'
    case 'procedure':
      return '⚙️'
    case 'function':
      return '🔧'
    default:
      return '📄'
  }
}

export const getClassificationColor = (classification: string): string => {
  switch (classification?.toLowerCase()) {
    case 'public':
      return 'text-green-600 bg-green-50'
    case 'internal':
      return 'text-blue-600 bg-blue-50'
    case 'confidential':
      return 'text-yellow-600 bg-yellow-50'
    case 'restricted':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getQualityScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatNumber = (num?: number): string => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export { ApiError }