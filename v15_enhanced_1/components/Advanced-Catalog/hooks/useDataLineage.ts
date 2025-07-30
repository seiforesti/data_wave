// ============================================================================
// USE DATA LINEAGE HOOK - ADVANCED ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for data lineage operations with real backend integration
// Maps to: advanced_lineage_service.py, lineage_service.py
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvancedLineageService } from '../services/advanced-lineage.service';
import {
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualization,
  LineageAnalysisResult,
  LineageImpactAnalysis,
  LineageMetrics,
  LineageValidationResult
} from '../types';

// Create service instance
const advancedLineageService = new AdvancedLineageService();

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseDataLineageOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

export interface UseDataLineageReturn {
  // Data
  lineageData: EnterpriseDataLineage | null;
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  
  // States
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Analysis
  impactAnalysis: LineageImpactAnalysis | null;
  metrics: LineageMetrics | null;
  validation: LineageValidationResult | null;
  
  // Actions
  refetch: () => Promise<void>;
  createLineage: (request: any) => Promise<void>;
  updateLineage: (id: string, updates: any) => Promise<void>;
  deleteLineage: (id: string) => Promise<void>;
  analyzeImpact: (assetIds: string[]) => Promise<LineageImpactAnalysis>;
  validateLineage: (lineageId: string) => Promise<LineageValidationResult>;
  
  // New methods from enhanced service
  getChangeRequests: () => Promise<any[]>;
  getPredictiveModels: () => Promise<any[]>;
  performImpactAnalysis: (request: any) => Promise<any>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useDataLineage = (
  lineageId?: string,
  options: UseDataLineageOptions = {}
): UseDataLineageReturn => {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 30000,
    maxRetries = 3,
    onError
  } = options;

  const queryClient = useQueryClient();
  const [impactAnalysis, setImpactAnalysis] = useState<LineageImpactAnalysis | null>(null);
  const [metrics, setMetrics] = useState<LineageMetrics | null>(null);
  const [validation, setValidation] = useState<LineageValidationResult | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Main lineage query
  const {
    data: lineageData,
    isLoading,
    isError,
    error,
    refetch: refetchQuery
  } = useQuery({
    queryKey: ['lineage', lineageId],
    queryFn: async () => {
      if (!lineageId) return null;
      const response = await advancedLineageService.getLineageById(lineageId);
      return response;
    },
    enabled: !!lineageId,
    retry: maxRetries,
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    onError: (err: Error) => {
      console.error('Lineage query error:', err);
      onError?.(err);
    }
  });

  // Lineage visualization query
  const { data: visualizationData } = useQuery({
    queryKey: ['lineage-visualization', lineageId],
    queryFn: async () => {
      if (!lineageId) return null;
      return await advancedLineageService.getLineageVisualization({
        assetId: lineageId,
        config: {
          enableInteractivity: true,
          showMetadata: true,
          enableFiltering: true,
          enableSearch: true,
          enableExport: true,
          theme: 'modern',
          colorScheme: 'default'
        },
        direction: 'BOTH',
        maxDepth: 5,
        includeLabels: true,
        layoutType: 'HIERARCHICAL'
      });
    },
    enabled: !!lineageId,
    retry: maxRetries
  });

  // Lineage metrics query
  const { data: metricsData } = useQuery({
    queryKey: ['lineage-metrics', lineageId],
    queryFn: async () => {
      if (!lineageId) return null;
      return await advancedLineageService.getLineageMetrics(lineageId);
    },
    enabled: !!lineageId,
    retry: maxRetries,
    onSuccess: (data) => {
      setMetrics(data);
    }
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createLineageMutation = useMutation({
    mutationFn: (request: any) => advancedLineageService.createLineage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Create lineage error:', err);
      onError?.(err);
    }
  });

  const updateLineageMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      advancedLineageService.updateLineage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Update lineage error:', err);
      onError?.(err);
    }
  });

  const deleteLineageMutation = useMutation({
    mutationFn: (id: string) => advancedLineageService.deleteLineage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
    },
    onError: (err: Error) => {
      console.error('Delete lineage error:', err);
      onError?.(err);
    }
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refetch = useCallback(async () => {
    await refetchQuery();
    queryClient.invalidateQueries({ queryKey: ['lineage'] });
  }, [refetchQuery, queryClient]);

  const createLineage = useCallback(async (request: any) => {
    await createLineageMutation.mutateAsync(request);
  }, [createLineageMutation]);

  const updateLineage = useCallback(async (id: string, updates: any) => {
    await updateLineageMutation.mutateAsync({ id, updates });
  }, [updateLineageMutation]);

  const deleteLineage = useCallback(async (id: string) => {
    await deleteLineageMutation.mutateAsync(id);
  }, [deleteLineageMutation]);

  const analyzeImpact = useCallback(async (assetIds: string[]): Promise<LineageImpactAnalysis> => {
    try {
      // Use the new performImpactAnalysis method with proper request format
      const request = {
        source_asset_id: assetIds[0] || '',
        change_type: 'schema_change',
        include_recommendations: true,
        analysis_depth: 10,
        priority_threshold: 0.5
      };
      
      const response = await advancedLineageService.performImpactAnalysis(request);
      const analysis = response.data || response;
      setImpactAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Impact analysis error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  const validateLineage = useCallback(async (lineageId: string): Promise<LineageValidationResult> => {
    try {
      const validationResult = await advancedLineageService.validateConsistency();
      const validation = validationResult.data || validationResult;
      setValidation(validation);
      return validation;
    } catch (error) {
      console.error('Lineage validation error:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  // New enhanced methods
  const getChangeRequests = useCallback(async (): Promise<any[]> => {
    try {
      return await advancedLineageService.getChangeRequests();
    } catch (error) {
      console.error('Failed to get change requests:', error);
      onError?.(error as Error);
      return [];
    }
  }, [onError]);

  const getPredictiveModels = useCallback(async (): Promise<any[]> => {
    try {
      return await advancedLineageService.getPredictiveModels();
    } catch (error) {
      console.error('Failed to get predictive models:', error);
      onError?.(error as Error);
      return [];
    }
  }, [onError]);

  const performImpactAnalysis = useCallback(async (request: any): Promise<any> => {
    try {
      const response = await advancedLineageService.performImpactAnalysis(request);
      return response;
    } catch (error) {
      console.error('Failed to perform impact analysis:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [onError]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const nodes = useMemo(() => {
    if (!lineageData?.nodes) return [];
    return lineageData.nodes;
  }, [lineageData]);

  const edges = useMemo(() => {
    if (!lineageData?.edges) return [];
    return lineageData.edges;
  }, [lineageData]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (metricsData) {
      setMetrics(metricsData);
    }
  }, [metricsData]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    lineageData: lineageData || null,
    nodes,
    edges,
    
    // States
    isLoading,
    isError,
    error: error as Error | null,
    
    // Analysis
    impactAnalysis,
    metrics,
    validation,
    
    // Actions
    refetch,
    createLineage,
    updateLineage,
    deleteLineage,
    analyzeImpact,
    validateLineage,
    
    // New enhanced methods
    getChangeRequests,
    getPredictiveModels,
    performImpactAnalysis
  };
};