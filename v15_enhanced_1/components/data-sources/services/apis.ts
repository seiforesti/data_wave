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
  PaginatedResponse,
  DiscoveryHistory,
  ScanRuleSet,
  Scan,
  ScanResult,
  QualityMetric,
  GrowthMetric,
  UserWorkspace,
  ConnectionPoolStats,
  DataSourceSummary,
  ConnectionInfo,
  BulkUpdateRequest,
  SchemaDiscoveryRequest,
  TablePreviewRequest,
  ColumnProfileRequest
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

// ============================================================================
// DATA SOURCE CRUD OPERATIONS
// ============================================================================

export const getDataSources = async (filters: DataSourceFilters = {}): Promise<DataSource[]> => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters.environment && filters.environment !== 'all') params.append('environment', filters.environment);
  if (filters.criticality && filters.criticality !== 'all') params.append('criticality', filters.criticality);
  if (filters.owner && filters.owner !== 'all') params.append('owner', filters.owner);
  if (filters.team && filters.team !== 'all') params.append('team', filters.team);
  if (filters.cloud_provider) params.append('cloud_provider', filters.cloud_provider);
  if (filters.monitoring_enabled !== undefined) params.append('monitoring_enabled', filters.monitoring_enabled.toString());
  if (filters.backup_enabled !== undefined) params.append('backup_enabled', filters.backup_enabled.toString());
  if (filters.encryption_enabled !== undefined) params.append('encryption_enabled', filters.encryption_enabled.toString());
  
  const { data } = await api.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

export const getDataSourceById = async (dataSourceId: number): Promise<DataSource> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}`);
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

// ============================================================================
// DATA SOURCE MONITORING & HEALTH
// ============================================================================

export const getDataSourceStats = async (dataSourceId: number): Promise<DataSourceStats> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/stats`);
  return data;
};

export const getDataSourceHealth = async (dataSourceId: number): Promise<DataSourceHealth> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/health`);
  return data;
};

export const getDataSourceSummary = async (dataSourceId: number): Promise<DataSourceSummary> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/summary`);
  return data;
};

export const updateDataSourceMetrics = async (dataSourceId: number, metrics: any): Promise<DataSource> => {
  const { data } = await api.put(`/scan/data-sources/${dataSourceId}/metrics`, metrics);
  return data;
};

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

export const testDataSourceConnection = async (id: number): Promise<ConnectionTestResult> => {
  const { data } = await api.post(`/scan/data-sources/${id}/validate`);
  return data;
};

export const getConnectionInfo = async (dataSourceId: number): Promise<ConnectionInfo> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/connection-info`);
  return data;
};

export const getConnectionPoolStats = async (dataSourceId: number): Promise<ConnectionPoolStats> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/connection-pool-stats`);
  return data;
};

export const reconfigureConnectionPool = async (
  dataSourceId: number, 
  config: { pool_size?: number; max_overflow?: number; pool_timeout?: number }
): Promise<ApiResponse<any>> => {
  const { data } = await api.put(`/scan/data-sources/${dataSourceId}/connection-pool`, config);
  return data;
};

export const validateCloudConfig = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/validate-cloud-config`);
  return data;
};

export const validateReplicaConfig = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/validate-replica-config`);
  return data;
};

export const validateSSLConfig = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/validate-ssl-config`);
  return data;
};

// ============================================================================
// DATA DISCOVERY & SCHEMA MANAGEMENT
// ============================================================================

export const discoverSchema = async (request: SchemaDiscoveryRequest): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/data-discovery/data-sources/${request.data_source_id}/discover-schema`, request);
  return data;
};

export const getDiscoveryHistory = async (dataSourceId: number, limit: number = 10): Promise<DiscoveryHistory[]> => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/discovery-history?limit=${limit}`);
  return data;
};

export const previewTableData = async (request: TablePreviewRequest): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/data-discovery/data-sources/${request.data_source_id}/preview-table`, request);
  return data;
};

export const profileColumnData = async (request: ColumnProfileRequest): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/data-discovery/data-sources/profile-column`, request);
  return data;
};

export const getConnectionStatus = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/connection-status`);
  return data;
};

// ============================================================================
// SCAN MANAGEMENT
// ============================================================================

export const startDataSourceScan = async (id: number, scanName?: string, description?: string): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${id}/scan`, {
    name: scanName || `Auto Scan - ${new Date().toISOString()}`,
    description: description || 'Automated scan triggered from UI'
  });
  return data;
};

export const getScans = async (dataSourceId?: number, status?: string): Promise<Scan[]> => {
  const params = new URLSearchParams();
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString());
  if (status) params.append('status', status);
  
  const { data } = await api.get(`/scan/scans?${params.toString()}`);
  return data;
};

export const getScanById = async (scanId: number): Promise<Scan> => {
  const { data } = await api.get(`/scan/scans/${scanId}`);
  return data;
};

export const getScanResults = async (scanId: number, schemaName?: string, tableName?: string): Promise<ScanResult[]> => {
  const params = new URLSearchParams();
  if (schemaName) params.append('schema_name', schemaName);
  if (tableName) params.append('table_name', tableName);
  
  const { data } = await api.get(`/scan/scans/${scanId}/results?${params.toString()}`);
  return data;
};

export const getScanSummary = async (scanId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.get(`/scan/scans/${scanId}/summary`);
  return data;
};

export const executeScan = async (scanId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/scans/${scanId}/execute`);
  return data;
};

export const deleteScan = async (scanId: number): Promise<void> => {
  await api.delete(`/scan/scans/${scanId}`);
};

// ============================================================================
// SCAN RULE SETS
// ============================================================================

export const getScanRuleSets = async (dataSourceId?: number): Promise<ScanRuleSet[]> => {
  const params = new URLSearchParams();
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString());
  
  const { data } = await api.get(`/scan/rule-sets?${params.toString()}`);
  return data;
};

export const getScanRuleSetById = async (ruleSetId: number): Promise<ScanRuleSet> => {
  const { data } = await api.get(`/scan/rule-sets/${ruleSetId}`);
  return data;
};

export const createScanRuleSet = async (ruleSet: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
  const { data } = await api.post('/scan/rule-sets', ruleSet);
  return data;
};

export const updateScanRuleSet = async (ruleSetId: number, ruleSet: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
  const { data } = await api.put(`/scan/rule-sets/${ruleSetId}`, ruleSet);
  return data;
};

export const deleteScanRuleSet = async (ruleSetId: number): Promise<void> => {
  await api.delete(`/scan/rule-sets/${ruleSetId}`);
};

// ============================================================================
// WORKSPACE MANAGEMENT
// ============================================================================

export const saveWorkspace = async (dataSourceId: number, workspaceData: any): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/data-discovery/data-sources/${dataSourceId}/save-workspace`, workspaceData);
  return data;
};

export const getUserWorkspaces = async (dataSourceId: number): Promise<UserWorkspace[]> => {
  const { data } = await api.get(`/data-discovery/data-sources/${dataSourceId}/workspaces`);
  return data;
};

// ============================================================================
// QUALITY & GROWTH METRICS
// ============================================================================

export const getQualityMetrics = async (dataSourceId: number): Promise<QualityMetric[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/quality-metrics`);
  return data;
};

export const getGrowthMetrics = async (dataSourceId: number): Promise<GrowthMetric[]> => {
  const { data } = await api.get(`/scan/data-sources/${dataSourceId}/growth-metrics`);
  return data;
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkUpdateDataSources = async (request: BulkUpdateRequest): Promise<DataSource[]> => {
  const { data } = await api.post('/scan/data-sources/bulk-update', request);
  return data;
};

export const bulkDeleteDataSources = async (ids: number[]): Promise<void> => {
  await api.delete('/scan/data-sources/bulk-delete', { data: { data_source_ids: ids } });
};

// ============================================================================
// FAVORITES & USER PREFERENCES
// ============================================================================

export const toggleFavorite = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/toggle-favorite`);
  return data;
};

export const getUserFavorites = async (): Promise<DataSource[]> => {
  const { data } = await api.get('/scan/data-sources/favorites');
  return data;
};

// ============================================================================
// OPERATIONAL CONTROLS
// ============================================================================

export const toggleMonitoring = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/toggle-monitoring`);
  return data;
};

export const toggleBackup = async (dataSourceId: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/scan/data-sources/${dataSourceId}/toggle-backup`);
  return data;
};

// ============================================================================
// ENUMS & METADATA
// ============================================================================

export const getDataSourceEnums = async (): Promise<ApiResponse<any>> => {
  const { data } = await api.get('/scan/data-sources/enums');
  return data;
};

// ============================================================================
// REACT QUERY HOOKS - DATA SOURCES
// ============================================================================

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

export const useDataSourceSummaryQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceSummary', dataSourceId],
    queryFn: () => getDataSourceSummary(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
};

// ============================================================================
// REACT QUERY HOOKS - DISCOVERY & SCHEMA
// ============================================================================

export const useDiscoveryHistoryQuery = (dataSourceId: number, limit: number = 10, options = {}) => {
  return useQuery({
    queryKey: ['discoveryHistory', dataSourceId, limit],
    queryFn: () => getDiscoveryHistory(dataSourceId, limit),
    enabled: !!dataSourceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useScanRuleSetsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSets', dataSourceId],
    queryFn: () => getScanRuleSets(dataSourceId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useScansQuery = (dataSourceId?: number, status?: string, options = {}) => {
  return useQuery({
    queryKey: ['scans', dataSourceId, status],
    queryFn: () => getScans(dataSourceId, status),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
};

export const useScanResultsQuery = (scanId: number, schemaName?: string, tableName?: string, options = {}) => {
  return useQuery({
    queryKey: ['scanResults', scanId, schemaName, tableName],
    queryFn: () => getScanResults(scanId, schemaName, tableName),
    enabled: !!scanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useQualityMetricsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['qualityMetrics', dataSourceId],
    queryFn: () => getQualityMetrics(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useGrowthMetricsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['growthMetrics', dataSourceId],
    queryFn: () => getGrowthMetrics(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useConnectionPoolStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['connectionPoolStats', dataSourceId],
    queryFn: () => getConnectionPoolStats(dataSourceId),
    enabled: !!dataSourceId,
    refetchInterval: 15 * 1000, // 15 seconds
    staleTime: 5 * 1000, // 5 seconds
    ...options
  });
};

export const useUserWorkspacesQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['userWorkspaces', dataSourceId],
    queryFn: () => getUserWorkspaces(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useUserFavoritesQuery = (options = {}) => {
  return useQuery({
    queryKey: ['userFavorites'],
    queryFn: getUserFavorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// ============================================================================
// REACT QUERY MUTATIONS
// ============================================================================

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
      queryClient.invalidateQueries({ queryKey: ['dataSourceSummary', variables.id] });
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
      queryClient.removeQueries({ queryKey: ['dataSourceSummary', id] });
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
    mutationFn: ({ id, name, description }: { id: number; name?: string; description?: string }) =>
      startDataSourceScan(id, name, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceStats', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['scans', variables.id] });
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
    mutationFn: bulkUpdateDataSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });
};

export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (_, dataSourceId) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] });
    }
  });
};

export const useToggleMonitoringMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleMonitoring,
    onSuccess: (_, dataSourceId) => {
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] });
      queryClient.invalidateQueries({ queryKey: ['dataSourceSummary', dataSourceId] });
    }
  });
};

export const useToggleBackupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleBackup,
    onSuccess: (_, dataSourceId) => {
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] });
      queryClient.invalidateQueries({ queryKey: ['dataSourceSummary', dataSourceId] });
    }
  });
};

export const useReconfigureConnectionPoolMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dataSourceId, config }: { dataSourceId: number; config: any }) =>
      reconfigureConnectionPool(dataSourceId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connectionPoolStats', variables.dataSourceId] });
    }
  });
};

export const useCreateScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
    }
  });
};

export const useUpdateScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...ruleSet }: { id: number } & Partial<ScanRuleSet>) =>
      updateScanRuleSet(id, ruleSet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
    }
  });
};

export const useDeleteScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] });
    }
  });
};

export const useExecuteScanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: executeScan,
    onSuccess: (_, scanId) => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['scanResults', scanId] });
    }
  });
};

export const useSaveWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dataSourceId, workspaceData }: { dataSourceId: number; workspaceData: any }) =>
      saveWorkspace(dataSourceId, workspaceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userWorkspaces', variables.dataSourceId] });
    }
  });
};