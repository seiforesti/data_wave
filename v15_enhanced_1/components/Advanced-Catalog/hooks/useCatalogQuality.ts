/**
 * Advanced Catalog Quality Management Hooks
 * Maps to: catalog_quality_service.py, data_profiling_service.py, catalog_quality_routes.py, data_profiling.py
 * 
 * Comprehensive React hooks for quality management operations with React Query,
 * real-time monitoring, rule validation, and quality assessments.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { catalogQualityApiClient } from '../services/catalog-quality-apis';
import type {
  DataQualityRule,
  QualityAssessment,
  QualityScorecard,
  QualityMonitoringConfig,
  QualityMonitoringAlert,
  QualityReport,
  QualityMetrics,
  QualityThreshold,
  QualityDimension,
  QualityIssue,
  QualityRecommendation,
  QualityTrend,
  QualityBenchmark,
  QualityValidationResult,
  QualityAnomalyDetection,
  QualityImpactAnalysis,
  DataProfilingJob,
  DataProfilingResult,
  DataProfilingConfig,
  StatisticalProfile,
  DataDistribution,
  DataPattern,
  OutlierDetection,
  DataQualityDashboard,
  QualityAlertConfig,
  QualityNotification,
} from '../types/quality.types';

import type {
  IntelligentDataAsset,
  DataQualityAssessment,
} from '../types/catalog-core.types';

import { useToast } from '@/components/ui/use-toast';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';

// ===================== QUALITY RULES HOOKS =====================

/**
 * Hook for getting all quality rules
 */
export function useQualityRules(
  filters?: {
    assetType?: string;
    ruleType?: string;
    severity?: string;
    status?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DataQualityRule[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'rules', filters],
    queryFn: () => catalogQualityApiClient.getQualityRules(filters),
    enabled: options?.enabled !== false,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for getting a specific quality rule
 */
export function useQualityRule(
  ruleId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DataQualityRule, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'rule', ruleId],
    queryFn: () => catalogQualityApiClient.getQualityRule(ruleId!),
    enabled: !!ruleId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for validating quality rules
 */
export function useValidateQualityRule(
  rule: DataQualityRule | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityValidationResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'validate-rule', rule?.id],
    queryFn: () => catalogQualityApiClient.validateQualityRule(rule!),
    enabled: !!rule && (options?.enabled !== false),
    staleTime: 60000, // 1 minute
  });
}

// ===================== QUALITY ASSESSMENTS HOOKS =====================

/**
 * Hook for getting asset quality assessment
 */
export function useAssetQualityAssessment(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    includeHistory?: boolean;
  }
): UseQueryResult<QualityAssessment, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'assessment', assetId, options?.includeHistory],
    queryFn: () => catalogQualityApiClient.getAssetQualityAssessment(assetId!, options?.includeHistory),
    enabled: !!assetId && (options?.enabled !== false),
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
    retry: 3,
  });
}

/**
 * Hook for getting quality scorecard
 */
export function useQualityScorecard(
  assetId: string | null,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityScorecard, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'scorecard', assetId, timeRange],
    queryFn: () => catalogQualityApiClient.getQualityScorecard(assetId!, timeRange),
    enabled: !!assetId && (options?.enabled !== false),
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

/**
 * Hook for getting quality metrics
 */
export function useQualityMetrics(
  filters?: {
    assetId?: string;
    timeRange?: string;
    dimensions?: QualityDimension[];
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'metrics', filters],
    queryFn: () => catalogQualityApiClient.getQualityMetrics(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for getting quality trends
 */
export function useQualityTrends(
  assetId: string | null,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityTrend[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'trends', assetId, timeRange],
    queryFn: () => catalogQualityApiClient.getQualityTrends(assetId!, timeRange),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for getting quality issues
 */
export function useQualityIssues(
  filters?: {
    assetId?: string;
    severity?: string;
    status?: string;
    ruleId?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityIssue[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'issues', filters],
    queryFn: () => catalogQualityApiClient.getQualityIssues(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  });
}

/**
 * Hook for getting quality recommendations
 */
export function useQualityRecommendations(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<QualityRecommendation[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'recommendations', assetId],
    queryFn: () => catalogQualityApiClient.getQualityRecommendations(assetId!, options?.limit),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

// ===================== QUALITY MONITORING HOOKS =====================

/**
 * Hook for getting quality monitoring configuration
 */
export function useQualityMonitoringConfig(
  assetId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityMonitoringConfig, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'monitoring-config', assetId],
    queryFn: () => catalogQualityApiClient.getQualityMonitoringConfig(assetId!),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000, // 10 minutes
  });
}

/**
 * Hook for getting quality alerts
 */
export function useQualityAlerts(
  filters?: {
    assetId?: string;
    severity?: string;
    status?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityMonitoringAlert[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'alerts', filters],
    queryFn: () => catalogQualityApiClient.getQualityAlerts(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

/**
 * Hook for quality anomaly detection
 */
export function useQualityAnomalyDetection(
  assetId: string | null,
  config?: {
    timeRange?: string;
    sensitivity?: number;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityAnomalyDetection, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'anomalies', assetId, config],
    queryFn: () => catalogQualityApiClient.detectQualityAnomalies(assetId!, config),
    enabled: !!assetId && (options?.enabled !== false),
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

// ===================== DATA PROFILING HOOKS =====================

/**
 * Hook for getting data profiling results
 */
export function useDataProfiling(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    includeDistributions?: boolean;
  }
): UseQueryResult<DataProfilingResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'profiling', assetId, options?.includeDistributions],
    queryFn: () => catalogQualityApiClient.getDataProfiling(assetId!, options?.includeDistributions),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000, // 10 minutes
  });
}

/**
 * Hook for getting statistical profile
 */
export function useStatisticalProfile(
  assetId: string | null,
  columnName?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<StatisticalProfile, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'statistical-profile', assetId, columnName],
    queryFn: () => catalogQualityApiClient.getStatisticalProfile(assetId!, columnName),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for getting data distributions
 */
export function useDataDistributions(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    columns?: string[];
  }
): UseQueryResult<DataDistribution[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'distributions', assetId, options?.columns],
    queryFn: () => catalogQualityApiClient.getDataDistributions(assetId!, options?.columns),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for outlier detection
 */
export function useOutlierDetection(
  assetId: string | null,
  config?: {
    method?: string;
    threshold?: number;
    columns?: string[];
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<OutlierDetection, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'outliers', assetId, config],
    queryFn: () => catalogQualityApiClient.detectOutliers(assetId!, config),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

// ===================== QUALITY MUTATION HOOKS =====================

/**
 * Hook for creating quality rules
 */
export function useCreateQualityRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.createQualityRule,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality', 'rules'] });
      
      toast({
        title: "Quality Rule Created",
        description: `Successfully created quality rule: ${variables.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Quality Rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating quality rules
 */
export function useUpdateQualityRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.updateQualityRule,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
      
      toast({
        title: "Quality Rule Updated",
        description: `Successfully updated quality rule: ${variables.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Quality Rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for deleting quality rules
 */
export function useDeleteQualityRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.deleteQualityRule,
    onSuccess: (data, ruleId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
      
      toast({
        title: "Quality Rule Deleted",
        description: `Successfully deleted quality rule`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Quality Rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for running quality assessment
 */
export function useRunQualityAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.runQualityAssessment,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality', 'assessment'] });
      
      toast({
        title: "Quality Assessment Started",
        description: `Quality assessment initiated for asset: ${variables.assetId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Running Quality Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for running data profiling
 */
export function useRunDataProfiling() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.runDataProfiling,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality', 'profiling'] });
      
      toast({
        title: "Data Profiling Started",
        description: `Data profiling initiated for asset: ${variables.assetId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Running Data Profiling",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for resolving quality issues
 */
export function useResolveQualityIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.resolveQualityIssue,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality', 'issues'] });
      
      toast({
        title: "Quality Issue Resolved",
        description: `Successfully resolved quality issue: ${variables.issueId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Resolving Quality Issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for configuring quality monitoring
 */
export function useConfigureQualityMonitoring() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogQualityApiClient.configureQualityMonitoring,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality', 'monitoring-config'] });
      
      toast({
        title: "Quality Monitoring Configured",
        description: `Successfully configured quality monitoring for asset: ${variables.assetId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Configuring Quality Monitoring",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ===================== REAL-TIME QUALITY HOOKS =====================

/**
 * Hook for real-time quality updates
 */
export function useRealTimeQualityUpdates(assetId: string | null) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<QualityMonitoringAlert[]>([]);
  const wsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!assetId) return;

    // Subscribe to real-time quality updates
    const unsubscribe = catalogQualityApiClient.subscribeToQualityUpdates(
      assetId,
      (update: any) => {
        setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
        
        // If it's an alert, add to alerts
        if (update.type === 'alert') {
          setAlerts(prev => [update.data, ...prev.slice(0, 49)]); // Keep last 50 alerts
        }
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

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    updates,
    alerts,
    clearUpdates,
    clearAlerts,
    isConnected: !!wsRef.current,
  };
}

// ===================== QUALITY REPORTING HOOKS =====================

/**
 * Hook for generating quality reports
 */
export function useQualityReport(
  config: {
    type: string;
    assetIds?: string[];
    timeRange?: string;
    format?: string;
  } | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityReport, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'report', config],
    queryFn: () => catalogQualityApiClient.generateQualityReport(config!),
    enabled: !!config && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for quality benchmarks
 */
export function useQualityBenchmarks(
  assetType?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QualityBenchmark[], Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'benchmarks', assetType],
    queryFn: () => catalogQualityApiClient.getQualityBenchmarks(assetType),
    enabled: options?.enabled !== false,
    staleTime: 3600000, // 1 hour
  });
}

/**
 * Hook for quality dashboard data
 */
export function useQualityDashboard(
  filters?: {
    assetIds?: string[];
    timeRange?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DataQualityDashboard, Error> {
  return useQuery({
    queryKey: ['catalog', 'quality', 'dashboard', filters],
    queryFn: () => catalogQualityApiClient.getQualityDashboard(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Comprehensive hook combining all quality operations
 */
export function useCatalogQuality() {
  const queryClient = useQueryClient();

  // Core mutations
  const createRule = useCreateQualityRule();
  const updateRule = useUpdateQualityRule();
  const deleteRule = useDeleteQualityRule();
  const runAssessment = useRunQualityAssessment();
  const runProfiling = useRunDataProfiling();
  const resolveIssue = useResolveQualityIssue();
  const configureMonitoring = useConfigureQualityMonitoring();

  // Utility functions
  const invalidateQualityQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
  }, [queryClient]);

  const prefetchAssetQuality = useCallback(
    (assetId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['catalog', 'quality', 'assessment', assetId, false],
        queryFn: () => catalogQualityApiClient.getAssetQualityAssessment(assetId, false),
        staleTime: 60000,
      });
    },
    [queryClient]
  );

  return {
    // Mutations
    createRule,
    updateRule,
    deleteRule,
    runAssessment,
    runProfiling,
    resolveIssue,
    configureMonitoring,

    // Utilities
    invalidateQualityQueries,
    prefetchAssetQuality,

    // Status checks
    isCreatingRule: createRule.isPending,
    isUpdatingRule: updateRule.isPending,
    isDeletingRule: deleteRule.isPending,
    isRunningAssessment: runAssessment.isPending,
    isRunningProfiling: runProfiling.isPending,
    isResolvingIssue: resolveIssue.isPending,
    isConfiguringMonitoring: configureMonitoring.isPending,
    hasError: createRule.isError || updateRule.isError || deleteRule.isError || 
             runAssessment.isError || runProfiling.isError || resolveIssue.isError || 
             configureMonitoring.isError,
  };
}

export default useCatalogQuality;