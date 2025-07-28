/**
 * Advanced Catalog Lineage Hooks
 * Maps to: advanced_lineage_service.py, lineage_service.py, advanced_lineage_routes.py
 * 
 * Comprehensive React hooks for lineage operations with React Query,
 * real-time updates, graph visualization, and impact analysis.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { catalogLineageApiClient } from '../services/catalog-lineage-apis';
import type {
  DataLineageNode,
  DataLineageEdge,
  LineageDirection,
  LineageDepth,
  LineageGraph,
  LineageImpactAnalysis,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageTraversalRequest,
  LineageTraversalResponse,
  ColumnLineageMapping,
  TransformationLineage,
  LineagePathAnalysis,
  LineageValidationResult,
  LineageAnomalyDetection,
  LineageQualityMetrics,
  LineagePerformanceMetrics,
} from '../types/lineage.types';

import type {
  EnterpriseDataLineage,
  IntelligentDataAsset,
} from '../types/catalog-core.types';

import { useToast } from '@/components/ui/use-toast';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';

// ===================== LINEAGE QUERY HOOKS =====================

/**
 * Hook for getting complete asset lineage
 */
export function useAssetLineage(
  assetId: string | null,
  direction: LineageDirection = 'both',
  depth: LineageDepth = 'all',
  includeColumns: boolean = true,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
): UseQueryResult<LineageGraph, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'asset', assetId, direction, depth, includeColumns],
    queryFn: () => catalogLineageApiClient.getAssetLineage(assetId!, direction, depth, includeColumns),
    enabled: !!assetId && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval || 30000, // 30 seconds
    staleTime: options?.staleTime || 300000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for getting column-level lineage
 */
export function useColumnLineage(
  assetId: string | null,
  columnName?: string,
  options?: {
    enabled?: boolean;
    includeTransformations?: boolean;
  }
): UseQueryResult<ColumnLineageMapping, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'column', assetId, columnName],
    queryFn: () => catalogLineageApiClient.getColumnLineage(assetId!, columnName),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for getting transformation lineage
 */
export function useTransformationLineage(
  transformationId: string | null,
  options?: {
    enabled?: boolean;
    includeCode?: boolean;
  }
): UseQueryResult<TransformationLineage, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'transformation', transformationId],
    queryFn: () => catalogLineageApiClient.getTransformationLineage(transformationId!),
    enabled: !!transformationId && (options?.enabled !== false),
    staleTime: 600000, // 10 minutes
  });
}

/**
 * Hook for lineage path analysis
 */
export function useLineagePathAnalysis(
  sourceAssetId: string | null,
  targetAssetId: string | null,
  options?: {
    enabled?: boolean;
    maxDepth?: number;
  }
): UseQueryResult<LineagePathAnalysis, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'path', sourceAssetId, targetAssetId],
    queryFn: () => catalogLineageApiClient.analyzeLineagePath(sourceAssetId!, targetAssetId!, options?.maxDepth),
    enabled: !!sourceAssetId && !!targetAssetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for lineage impact analysis
 */
export function useLineageImpactAnalysis(
  request: LineageImpactAnalysis | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<LineageImpactAnalysis, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'impact', request?.assetId, request?.changeType],
    queryFn: () => catalogLineageApiClient.analyzeImpact(request!),
    enabled: !!request && (options?.enabled !== false),
    staleTime: 180000, // 3 minutes
  });
}

/**
 * Hook for lineage validation
 */
export function useLineageValidation(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    includeAccuracy?: boolean;
  }
): UseQueryResult<LineageValidationResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'validation', assetId],
    queryFn: () => catalogLineageApiClient.validateLineage(assetId!),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for lineage anomaly detection
 */
export function useLineageAnomalyDetection(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    timeRange?: string;
  }
): UseQueryResult<LineageAnomalyDetection, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'anomalies', assetId, options?.timeRange],
    queryFn: () => catalogLineageApiClient.detectLineageAnomalies(assetId!, options?.timeRange),
    enabled: !!assetId && (options?.enabled !== false),
    refetchInterval: 60000, // 1 minute
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook for lineage metrics
 */
export function useLineageMetrics(
  assetId?: string,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<LineageMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'metrics', assetId, timeRange],
    queryFn: () => catalogLineageApiClient.getLineageMetrics(assetId, timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 30000,
    staleTime: 60000,
  });
}

/**
 * Hook for lineage quality metrics
 */
export function useLineageQualityMetrics(
  assetId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<LineageQualityMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'quality-metrics', assetId],
    queryFn: () => catalogLineageApiClient.getLineageQualityMetrics(assetId!),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for lineage performance metrics
 */
export function useLineagePerformanceMetrics(
  assetId?: string,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<LineagePerformanceMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'performance-metrics', assetId, timeRange],
    queryFn: () => catalogLineageApiClient.getLineagePerformanceMetrics(assetId, timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 30000,
    staleTime: 120000,
  });
}

// ===================== LINEAGE VISUALIZATION HOOKS =====================

/**
 * Hook for lineage visualization configuration
 */
export function useLineageVisualization(
  config: LineageVisualizationConfig | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'visualization', config?.assetId, config?.layout],
    queryFn: () => catalogLineageApiClient.generateLineageVisualization(config!),
    enabled: !!config && (options?.enabled !== false),
    staleTime: 180000,
  });
}

// ===================== LINEAGE MUTATION HOOKS =====================

/**
 * Hook for creating lineage relationships
 */
export function useCreateLineageRelationship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogLineageApiClient.createLineageRelationship,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      
      toast({
        title: "Lineage Relationship Created",
        description: `Successfully created lineage relationship for ${variables.sourceAssetId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating lineage relationships
 */
export function useUpdateLineageRelationship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogLineageApiClient.updateLineageRelationship,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      
      toast({
        title: "Lineage Relationship Updated",
        description: `Successfully updated lineage relationship ${variables.relationshipId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for deleting lineage relationships
 */
export function useDeleteLineageRelationship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogLineageApiClient.deleteLineageRelationship,
    onSuccess: (data, relationshipId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      
      toast({
        title: "Lineage Relationship Deleted",
        description: `Successfully deleted lineage relationship ${relationshipId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for bulk importing lineage
 */
export function useBulkImportLineage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogLineageApiClient.bulkImportLineage,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      
      toast({
        title: "Lineage Import Complete",
        description: `Successfully imported ${data.importedCount} lineage relationships`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Importing Lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ===================== REAL-TIME LINEAGE HOOKS =====================

/**
 * Hook for real-time lineage updates
 */
export function useRealTimeLineage(assetId: string | null) {
  const [updates, setUpdates] = useState<any[]>([]);
  const wsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!assetId) return;

    // Subscribe to real-time lineage updates
    const unsubscribe = catalogLineageApiClient.subscribeToLineageUpdates(
      assetId,
      (update: any) => {
        setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
      }
    );

    wsRef.current = unsubscribe;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [assetId]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    clearUpdates,
    isConnected: !!wsRef.current,
  };
}

// ===================== ADVANCED LINEAGE FEATURES =====================

/**
 * Hook for lineage recommendation
 */
export function useLineageRecommendations(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'recommendations', assetId],
    queryFn: () => catalogLineageApiClient.getLineageRecommendations(assetId!, options?.limit),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for lineage comparison
 */
export function useLineageComparison(
  assetId1: string | null,
  assetId2: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['catalog', 'lineage', 'comparison', assetId1, assetId2],
    queryFn: () => catalogLineageApiClient.compareLineage(assetId1!, assetId2!),
    enabled: !!assetId1 && !!assetId2 && (options?.enabled !== false),
    staleTime: 180000,
  });
}

/**
 * Hook for lineage search
 */
export function useLineageSearch(
  searchRequest: any | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<any, Error> {
  const [debouncedRequest] = useDebounce(searchRequest, 300);

  return useQuery({
    queryKey: ['catalog', 'lineage', 'search', debouncedRequest],
    queryFn: () => catalogLineageApiClient.searchLineage(debouncedRequest!),
    enabled: !!debouncedRequest && (options?.enabled !== false),
    staleTime: 120000,
  });
}

/**
 * Comprehensive hook combining all lineage operations
 */
export function useCatalogLineage() {
  const queryClient = useQueryClient();

  // Core mutations
  const createRelationship = useCreateLineageRelationship();
  const updateRelationship = useUpdateLineageRelationship();
  const deleteRelationship = useDeleteLineageRelationship();
  const bulkImport = useBulkImportLineage();

  // Utility functions
  const invalidateLineageQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
  }, [queryClient]);

  const prefetchAssetLineage = useCallback(
    (assetId: string, direction: LineageDirection = 'both', depth: LineageDepth = 'all') => {
      queryClient.prefetchQuery({
        queryKey: ['catalog', 'lineage', 'asset', assetId, direction, depth, true],
        queryFn: () => catalogLineageApiClient.getAssetLineage(assetId, direction, depth, true),
        staleTime: 300000,
      });
    },
    [queryClient]
  );

  return {
    // Mutations
    createRelationship,
    updateRelationship,
    deleteRelationship,
    bulkImport,

    // Utilities
    invalidateLineageQueries,
    prefetchAssetLineage,

    // Status checks
    isCreating: createRelationship.isPending,
    isUpdating: updateRelationship.isPending,
    isDeleting: deleteRelationship.isPending,
    isImporting: bulkImport.isPending,
    hasError: createRelationship.isError || updateRelationship.isError || deleteRelationship.isError || bulkImport.isError,
  };
}

export default useCatalogLineage;