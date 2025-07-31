/**
 * Advanced Scan Logic API Service
 * Enterprise-grade API service layer for scan logic operations
 */

import { apiClient } from '../../shared/services/apiClient';
import {
  ScanLogicEngine,
  ScanExecution,
  ScanResults,
  ScanFinding,
  ScanRule,
  ScanProfile,
  ScanLogicEnginesResponse,
  ScanExecutionsResponse,
  ScanResultsResponse,
  ScanFindingsResponse,
  CreateScanExecutionRequest,
  UpdateScanExecutionRequest,
  ScanLogicFilters,
  ScanExecutionFilters,
  ScanFindingFilters,
  SortOption
} from '../types';

const API_BASE = '/api/v1/scan-logic';

/**
 * Scan Logic Engines API
 */
export const scanLogicEnginesApi = {
  // Get all scan logic engines
  getEngines: async (
    filters?: ScanLogicFilters,
    sort?: SortOption[],
    page = 1,
    limit = 20
  ): Promise<ScanLogicEnginesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.engineTypes?.length) {
        filters.engineTypes.forEach(type => params.append('engineTypes', type));
      }
      if (filters.statuses?.length) {
        filters.statuses.forEach(status => params.append('statuses', status));
      }
      if (filters.capabilities?.length) {
        filters.capabilities.forEach(cap => params.append('capabilities', cap));
      }
      if (filters.dataSourceTypes?.length) {
        filters.dataSourceTypes.forEach(type => params.append('dataSourceTypes', type));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.createdBy?.length) {
        filters.createdBy.forEach(user => params.append('createdBy', user));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }

    if (sort?.length) {
      sort.forEach(s => params.append('sort', `${s.field}:${s.direction}`));
    }

    const response = await apiClient.get(`${API_BASE}/engines?${params}`);
    return response.data;
  },

  // Get engine by ID
  getEngine: async (engineId: string): Promise<{ success: boolean; data: ScanLogicEngine; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/engines/${engineId}`);
    return response.data;
  },

  // Create new engine
  createEngine: async (engineData: Partial<ScanLogicEngine>): Promise<{ success: boolean; data: ScanLogicEngine; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/engines`, engineData);
    return response.data;
  },

  // Update engine
  updateEngine: async (engineId: string, engineData: Partial<ScanLogicEngine>): Promise<{ success: boolean; data: ScanLogicEngine; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/engines/${engineId}`, engineData);
    return response.data;
  },

  // Delete engine
  deleteEngine: async (engineId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete(`${API_BASE}/engines/${engineId}`);
    return response.data;
  },

  // Get engine capabilities
  getEngineCapabilities: async (engineId: string): Promise<{ success: boolean; data: any[]; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/engines/${engineId}/capabilities`);
    return response.data;
  },

  // Get engine performance metrics
  getEnginePerformance: async (engineId: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/engines/${engineId}/performance`);
    return response.data;
  },

  // Test engine connection
  testEngine: async (engineId: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/engines/${engineId}/test`);
    return response.data;
  }
};

/**
 * Scan Executions API
 */
export const scanExecutionsApi = {
  // Get all scan executions
  getExecutions: async (
    filters?: ScanExecutionFilters,
    sort?: SortOption[],
    page = 1,
    limit = 20
  ): Promise<ScanExecutionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.statuses?.length) {
        filters.statuses.forEach(status => params.append('statuses', status));
      }
      if (filters.engineIds?.length) {
        filters.engineIds.forEach(id => params.append('engineIds', id));
      }
      if (filters.ruleSetIds?.length) {
        filters.ruleSetIds.forEach(id => params.append('ruleSetIds', id));
      }
      if (filters.dataSourceIds?.length) {
        filters.dataSourceIds.forEach(id => params.append('dataSourceIds', id));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters.duration) {
        params.append('minDuration', filters.duration.min.toString());
        params.append('maxDuration', filters.duration.max.toString());
      }
      if (filters.hasErrors !== undefined) {
        params.append('hasErrors', filters.hasErrors.toString());
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.priority?.length) {
        filters.priority.forEach(p => params.append('priority', p));
      }
      if (filters.assignedTo?.length) {
        filters.assignedTo.forEach(user => params.append('assignedTo', user));
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }

    if (sort?.length) {
      sort.forEach(s => params.append('sort', `${s.field}:${s.direction}`));
    }

    const response = await apiClient.get(`${API_BASE}/executions?${params}`);
    return response.data;
  },

  // Get execution by ID
  getExecution: async (executionId: string): Promise<{ success: boolean; data: ScanExecution; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}`);
    return response.data;
  },

  // Create new execution
  createExecution: async (executionData: CreateScanExecutionRequest): Promise<{ success: boolean; data: ScanExecution; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/executions`, executionData);
    return response.data;
  },

  // Update execution
  updateExecution: async (executionId: string, executionData: UpdateScanExecutionRequest): Promise<{ success: boolean; data: ScanExecution; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/executions/${executionId}`, executionData);
    return response.data;
  },

  // Cancel execution
  cancelExecution: async (executionId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/executions/${executionId}/cancel`);
    return response.data;
  },

  // Pause execution
  pauseExecution: async (executionId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/executions/${executionId}/pause`);
    return response.data;
  },

  // Resume execution
  resumeExecution: async (executionId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/executions/${executionId}/resume`);
    return response.data;
  },

  // Get execution logs
  getExecutionLogs: async (executionId: string): Promise<{ success: boolean; data: any[]; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}/logs`);
    return response.data;
  },

  // Get execution progress
  getExecutionProgress: async (executionId: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}/progress`);
    return response.data;
  }
};

/**
 * Scan Results API
 */
export const scanResultsApi = {
  // Get scan results
  getResults: async (executionId: string): Promise<ScanResultsResponse> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}/results`);
    return response.data;
  },

  // Get results summary
  getResultsSummary: async (executionId: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}/results/summary`);
    return response.data;
  },

  // Export results
  exportResults: async (executionId: string, format: 'json' | 'csv' | 'xlsx' | 'pdf'): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/executions/${executionId}/results/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Compare results
  compareResults: async (executionId1: string, executionId2: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/results/compare?execution1=${executionId1}&execution2=${executionId2}`);
    return response.data;
  },

  // Get historical trends
  getResultsTrends: async (dataSourceId: string, timeRange: string): Promise<{ success: boolean; data: any[]; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/results/trends?dataSourceId=${dataSourceId}&timeRange=${timeRange}`);
    return response.data;
  }
};

/**
 * Scan Findings API
 */
export const scanFindingsApi = {
  // Get all findings
  getFindings: async (
    filters?: ScanFindingFilters,
    sort?: SortOption[],
    page = 1,
    limit = 20
  ): Promise<ScanFindingsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.types?.length) {
        filters.types.forEach(type => params.append('types', type));
      }
      if (filters.severities?.length) {
        filters.severities.forEach(severity => params.append('severities', severity));
      }
      if (filters.categories?.length) {
        filters.categories.forEach(category => params.append('categories', category));
      }
      if (filters.statuses?.length) {
        filters.statuses.forEach(status => params.append('statuses', status));
      }
      if (filters.ruleIds?.length) {
        filters.ruleIds.forEach(id => params.append('ruleIds', id));
      }
      if (filters.dataSourceIds?.length) {
        filters.dataSourceIds.forEach(id => params.append('dataSourceIds', id));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters.assignedTo?.length) {
        filters.assignedTo.forEach(user => params.append('assignedTo', user));
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.confidence) {
        params.append('minConfidence', filters.confidence.min.toString());
        params.append('maxConfidence', filters.confidence.max.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }

    if (sort?.length) {
      sort.forEach(s => params.append('sort', `${s.field}:${s.direction}`));
    }

    const response = await apiClient.get(`${API_BASE}/findings?${params}`);
    return response.data;
  },

  // Get finding by ID
  getFinding: async (findingId: string): Promise<{ success: boolean; data: ScanFinding; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/findings/${findingId}`);
    return response.data;
  },

  // Update finding
  updateFinding: async (findingId: string, findingData: Partial<ScanFinding>): Promise<{ success: boolean; data: ScanFinding; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/findings/${findingId}`, findingData);
    return response.data;
  },

  // Bulk update findings
  bulkUpdateFindings: async (findingIds: string[], updates: Partial<ScanFinding>): Promise<{ success: boolean; data: ScanFinding[]; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/findings/bulk`, { findingIds, updates });
    return response.data;
  },

  // Assign finding
  assignFinding: async (findingId: string, assigneeId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/findings/${findingId}/assign`, { assigneeId });
    return response.data;
  },

  // Add comment to finding
  addComment: async (findingId: string, comment: string): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/findings/${findingId}/comments`, { comment });
    return response.data;
  },

  // Get finding history
  getFindingHistory: async (findingId: string): Promise<{ success: boolean; data: any[]; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/findings/${findingId}/history`);
    return response.data;
  },

  // Get findings analytics
  getFindingsAnalytics: async (filters?: ScanFindingFilters): Promise<{ success: boolean; data: any; message?: string }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.types?.length) {
        filters.types.forEach(type => params.append('types', type));
      }
      if (filters.severities?.length) {
        filters.severities.forEach(severity => params.append('severities', severity));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
    }

    const response = await apiClient.get(`${API_BASE}/findings/analytics?${params}`);
    return response.data;
  }
};

/**
 * Scan Rules API
 */
export const scanRulesApi = {
  // Get all rules
  getRules: async (
    page = 1,
    limit = 20,
    filters?: any
  ): Promise<{ success: boolean; data: ScanRule[]; pagination?: any; message?: string }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value: any) => params.append(key, value));
        } else if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }

    const response = await apiClient.get(`${API_BASE}/rules?${params}`);
    return response.data;
  },

  // Get rule by ID
  getRule: async (ruleId: string): Promise<{ success: boolean; data: ScanRule; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/rules/${ruleId}`);
    return response.data;
  },

  // Create rule
  createRule: async (ruleData: Partial<ScanRule>): Promise<{ success: boolean; data: ScanRule; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/rules`, ruleData);
    return response.data;
  },

  // Update rule
  updateRule: async (ruleId: string, ruleData: Partial<ScanRule>): Promise<{ success: boolean; data: ScanRule; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/rules/${ruleId}`, ruleData);
    return response.data;
  },

  // Delete rule
  deleteRule: async (ruleId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete(`${API_BASE}/rules/${ruleId}`);
    return response.data;
  },

  // Test rule
  testRule: async (ruleId: string, testData: any): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/rules/${ruleId}/test`, testData);
    return response.data;
  }
};

/**
 * Scan Profiles API
 */
export const scanProfilesApi = {
  // Get all profiles
  getProfiles: async (
    page = 1,
    limit = 20,
    filters?: any
  ): Promise<{ success: boolean; data: ScanProfile[]; pagination?: any; message?: string }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((value: any) => params.append(key, value));
        } else if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }

    const response = await apiClient.get(`${API_BASE}/profiles?${params}`);
    return response.data;
  },

  // Get profile by ID
  getProfile: async (profileId: string): Promise<{ success: boolean; data: ScanProfile; message?: string }> => {
    const response = await apiClient.get(`${API_BASE}/profiles/${profileId}`);
    return response.data;
  },

  // Create profile
  createProfile: async (profileData: Partial<ScanProfile>): Promise<{ success: boolean; data: ScanProfile; message?: string }> => {
    const response = await apiClient.post(`${API_BASE}/profiles`, profileData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileId: string, profileData: Partial<ScanProfile>): Promise<{ success: boolean; data: ScanProfile; message?: string }> => {
    const response = await apiClient.put(`${API_BASE}/profiles/${profileId}`, profileData);
    return response.data;
  },

  // Delete profile
  deleteProfile: async (profileId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete(`${API_BASE}/profiles/${profileId}`);
    return response.data;
  }
};

/**
 * Real-time Updates API
 */
export const scanLogicRealtimeApi = {
  // Subscribe to execution updates
  subscribeToExecutionUpdates: (executionId: string, callback: (data: any) => void) => {
    // WebSocket implementation for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/scan-logic/executions/${executionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => ws.close();
  },

  // Subscribe to findings updates
  subscribeToFindingsUpdates: (callback: (data: any) => void) => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/scan-logic/findings`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => ws.close();
  }
};

export default {
  scanLogicEnginesApi,
  scanExecutionsApi,
  scanResultsApi,
  scanFindingsApi,
  scanRulesApi,
  scanProfilesApi,
  scanLogicRealtimeApi
};
