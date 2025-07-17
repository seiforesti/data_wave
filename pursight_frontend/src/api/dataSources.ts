import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';
import { DataSourceStats, SingleDataSourceStats, DataSourceConnectionTest, DataSourceHealthCheck } from '../models/DataSourceStats';

/**
 * API functions for data sources
 */

// Types
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
}

// API functions

/**
 * Get all data sources with optional filtering
 */
export const getDataSources = async (filters: DataSourceFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await axios.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

/**
 * Get data source statistics
 */
export const getDataSourceStats = async () => {
  const { data } = await axios.get('/dashboard/data-source-stats');
  return data as DataSourceStats;
};

/**
 * Get a specific data source by ID
 */
export const getDataSourceById = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/data-sources/${dataSourceId}`);
  return data;
};

/**
 * Get detailed statistics for a specific data source
 */
export const getDataSourceDetailStats = async (dataSourceId: number) => {
  const { data } = await axios.get(`/dashboard/data-source-stats/${dataSourceId}`);
  return data as SingleDataSourceStats;
};

/**
 * Create a new data source
 */
export const createDataSource = async (params: DataSourceCreateParams) => {
  const { data } = await axios.post('/scan/data-sources', params);
  return data;
};

/**
 * Update an existing data source
 */
export const updateDataSource = async (id: number, params: DataSourceUpdateParams) => {
  const { data } = await axios.put(`/scan/data-sources/${id}`, params);
  return data;
};

/**
 * Delete a data source
 */
export const deleteDataSource = async (id: number) => {
  await axios.delete(`/scan/data-sources/${id}`);
  return id;
};

/**
 * Test connection to a data source
 */
export const testDataSourceConnection = async (id: number) => {
  const { data } = await axios.post(`/scan/data-sources/${id}/validate`);
  return data as DataSourceConnectionTest;
};

/**
 * Get health check for a data source
 */
export const getDataSourceHealth = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/data-sources/${dataSourceId}/health`);
  return data as DataSourceHealthCheck;
};

// React Query hooks

/**
 * Hook for fetching data sources with React Query
 */
export const useDataSourcesQuery = (filters: DataSourceFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['dataSources', filters],
    queryFn: () => getDataSources(filters),
    ...options
  });
};

/**
 * Hook for fetching data source statistics with React Query
 */
export const useDataSourceStatsQuery = (dataSourceIdOrFilters?: number | DataSourceFilters, options = {}) => {
  if (typeof dataSourceIdOrFilters === 'number') {
    return useQuery({
      queryKey: ['dataSourceDetailStats', dataSourceIdOrFilters],
      queryFn: () => getDataSourceDetailStats(dataSourceIdOrFilters),
      enabled: !!dataSourceIdOrFilters,
      ...options
    });
  }
  
  return useQuery({
    queryKey: ['dataSourceStats', dataSourceIdOrFilters],
    queryFn: () => getDataSourceStats(),
    ...options
  });
};

/**
 * Hook for fetching a single data source with React Query
 */
export const useDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSource', dataSourceId],
    queryFn: () => getDataSourceById(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching detailed statistics for a data source with React Query
 */
export const useDataSourceDetailStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceDetailStats', dataSourceId],
    queryFn: () => getDataSourceDetailStats(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for creating a data source with React Query
 */
export const useCreateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSourceStats']);
    }
  });
};

/**
 * Hook for updating a data source with React Query
 */
export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & DataSourceUpdateParams) => 
      updateDataSource(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSource', variables.id]);
      queryClient.invalidateQueries(['dataSourceStats']);
      queryClient.invalidateQueries(['dataSourceDetailStats', variables.id]);
    }
  });
};

/**
 * Hook for deleting a data source with React Query
 */
export const useDeleteDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: (id) => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSource', id]);
      queryClient.invalidateQueries(['dataSourceStats']);
      queryClient.invalidateQueries(['dataSourceDetailStats', id]);
    }
  });
};

/**
 * Hook for testing connection to a data source with React Query
 */
export const useTestDataSourceConnectionMutation = () => {
  return useMutation({
    mutationFn: testDataSourceConnection
  });
};

/**
 * Hook for fetching health check for a data source with React Query
 */
export const useDataSourceHealthCheckQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceHealth', dataSourceId],
    queryFn: () => getDataSourceHealth(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};