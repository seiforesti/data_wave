import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  DataSource,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  DataSourceFilters,
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Configure axios base URL - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const getDataSources = async (filters: DataSourceFilters = {}): Promise<DataSource[]> => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await api.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

export const getDataSourceById = async (dataSourceId: number): Promise<DataSource> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}`);
  return data;
};

export const getDataSourceStats = async (dataSourceId: number): Promise<DataSourceStats> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/stats`);
  return data;
};

export const getDataSourceHealth = async (dataSourceId: number): Promise<DataSourceHealth> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/health`);
  return data;
};

export const createDataSource = async (params: DataSourceCreateParams): Promise<DataSource> => {
  const { data } = await api.post('/scan/data-sources', params);
  return data;
};

export const updateDataSource = async (id: number, params: DataSourceUpdateParams): Promise<DataSource> => {
  const { data } = await api.put(`/scan/data-sources/${id}`, params);
  return data;
};

export const deleteDataSource = async (id: number): Promise<void> => {
  await api.delete(`/scan/data-sources/${id}`);
};

export const testDataSourceConnection = async (id: number): Promise<ConnectionTestResult> => {
  const { data } = await api.post(`/scan/data-sources/${id}/validate`);
  return data;
};

export const startDataSourceScan = async (id: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/scans`, {
    name: `Auto Scan - ${new Date().toISOString()}`,
    data_source_id: id,
    description: 'Automated scan triggered from UI'
  });
  return data;
};

// Bulk operations
export const bulkDeleteDataSources = async (ids: number[]): Promise<void> => {
  await Promise.all(ids.map(id => deleteDataSource(id)));
};

export const bulkUpdateDataSources = async (
  ids: number[], 
  updates: Partial<DataSourceUpdateParams>
): Promise<DataSource[]> => {
  const results = await Promise.all(
    ids.map(id => updateDataSource(id, updates))
  );
  return results;
};

// React Query hooks
export const useDataSourcesQuery = (filters: DataSourceFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['dataSources', filters],
    queryFn: () => getDataSources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSource', dataSourceId],
    queryFn: () => getDataSourceById(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
};

export const useDataSourceStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceStats', dataSourceId],
    queryFn: () => getDataSourceStats(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options
  });
};

export const useDataSourceHealthQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceHealth', dataSourceId],
    queryFn: () => getDataSourceHealth(dataSourceId),
    enabled: !!dataSourceId,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 10 * 1000, // 10 seconds
    ...options
  });
};

export const useCreateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });
};

export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & DataSourceUpdateParams) => 
      updateDataSource(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.invalidateQueries({ queryKey: ['dataSource', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dataSourceStats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dataSourceHealth', variables.id] });
    }
  });
};

export const useDeleteDataSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.removeQueries({ queryKey: ['dataSource', id] });
      queryClient.removeQueries({ queryKey: ['dataSourceStats', id] });
      queryClient.removeQueries({ queryKey: ['dataSourceHealth', id] });
    }
  });
};

export const useTestDataSourceConnectionMutation = () => {
  return useMutation({
    mutationFn: testDataSourceConnection
  });
};

export const useStartDataSourceScanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startDataSourceScan,
    onSuccess: (_, dataSourceId) => {
      // Invalidate relevant queries after starting a scan
      queryClient.invalidateQueries({ queryKey: ['dataSourceStats', dataSourceId] });
    }
  });
};

export const useBulkDeleteDataSourcesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteDataSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });
};

export const useBulkUpdateDataSourcesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: number[], updates: Partial<DataSourceUpdateParams> }) =>
      bulkUpdateDataSources(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });
};