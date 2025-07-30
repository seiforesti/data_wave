// ============================================================================
// USE CATALOG QUALITY HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced React hook for quality management functionality
// Integrates with backend quality APIs for comprehensive data governance
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
import {
  DataQualityIssue,
  GovernancePolicy,
  ComplianceCheck,
  QualityMetrics,
  StewardshipMetrics,
  QualityRule,
  QualityAssessment,
  DataQualityReport,
  QualityDimension,
  QualityThreshold,
  ValidationResult,
  IssueResolution,
  QualityTrend,
  ComplianceStatus
} from '../types/collaboration.types';

// Services
import { qualityService } from '../services/quality.service';

// Utils
import { handleApiError } from '../utils/error-handler';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseCatalogQualityOptions {
  workspaceId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCatalogQualityReturn {
  // Data
  qualityIssues: DataQualityIssue[] | undefined;
  policies: GovernancePolicy[] | undefined;
  complianceChecks: ComplianceCheck[] | undefined;
  qualityMetrics: QualityMetrics | undefined;
  stewardshipMetrics: StewardshipMetrics | undefined;
  qualityRules: QualityRule[] | undefined;
  assessments: QualityAssessment[] | undefined;
  reports: DataQualityReport[] | undefined;
  trends: QualityTrend[] | undefined;

  // State
  isLoading: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
  
  // Quality Issues Management
  createQualityIssue: (issue: Partial<DataQualityIssue>) => Promise<DataQualityIssue>;
  updateQualityIssue: (id: string, updates: Partial<DataQualityIssue>) => Promise<DataQualityIssue>;
  resolveQualityIssue: (id: string, resolution: IssueResolution) => Promise<DataQualityIssue>;
  deleteQualityIssue: (id: string) => Promise<void>;
  getQualityIssueById: (id: string) => Promise<DataQualityIssue | null>;
  getIssuesBySeverity: (severity: string) => DataQualityIssue[];
  getIssuesByDomain: (domain: string) => DataQualityIssue[];
  
  // Quality Rules Management
  createQualityRule: (rule: Partial<QualityRule>) => Promise<QualityRule>;
  updateQualityRule: (id: string, updates: Partial<QualityRule>) => Promise<QualityRule>;
  deleteQualityRule: (id: string) => Promise<void>;
  enableQualityRule: (id: string) => Promise<QualityRule>;
  disableQualityRule: (id: string) => Promise<QualityRule>;
  testQualityRule: (rule: QualityRule, sampleData?: any) => Promise<ValidationResult>;
  
  // Policy Management
  createPolicy: (policy: Partial<GovernancePolicy>) => Promise<GovernancePolicy>;
  updatePolicy: (id: string, updates: Partial<GovernancePolicy>) => Promise<GovernancePolicy>;
  deletePolicy: (id: string) => Promise<void>;
  publishPolicy: (id: string) => Promise<GovernancePolicy>;
  archivePolicy: (id: string) => Promise<GovernancePolicy>;
  getPolicyById: (id: string) => Promise<GovernancePolicy | null>;
  
  // Compliance Management
  runComplianceCheck: (assetId: string, policyIds?: string[]) => Promise<ComplianceCheck>;
  getComplianceStatus: (assetId: string) => Promise<ComplianceStatus>;
  scheduleComplianceCheck: (assetId: string, schedule: any) => Promise<void>;
  getComplianceHistory: (assetId: string) => Promise<ComplianceCheck[]>;
  
  // Quality Assessment
  runQualityAssessment: (assetId: string, dimensions?: QualityDimension[]) => Promise<QualityAssessment>;
  getQualityAssessmentHistory: (assetId: string) => Promise<QualityAssessment[]>;
  setQualityThresholds: (assetId: string, thresholds: QualityThreshold[]) => Promise<void>;
  
  // Reporting & Analytics
  generateQualityReport: (options: any) => Promise<DataQualityReport>;
  getQualityTrends: (timeframe: string, metrics: string[]) => Promise<QualityTrend[]>;
  getQualityMetricsByDomain: (domain: string) => Promise<QualityMetrics>;
  getSystemQualityOverview: () => Promise<QualityMetrics>;
  
  // Search & Filtering
  searchQualityIssues: (query: string, filters?: any) => DataQualityIssue[];
  searchPolicies: (query: string, filters?: any) => GovernancePolicy[];
  searchRules: (query: string, filters?: any) => QualityRule[];
  
  // Bulk Operations
  bulkResolveIssues: (issueIds: string[], resolution: IssueResolution) => Promise<void>;
  bulkUpdatePolicies: (policyIds: string[], updates: Partial<GovernancePolicy>) => Promise<void>;
  bulkEnableRules: (ruleIds: string[]) => Promise<void>;
  bulkDisableRules: (ruleIds: string[]) => Promise<void>;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const qualityQueryKeys = {
  all: ['catalog-quality'] as const,
  issues: () => [...qualityQueryKeys.all, 'issues'] as const,
  issuesList: (filters: any) => [...qualityQueryKeys.issues(), 'list', filters] as const,
  issuesDetail: (id: string) => [...qualityQueryKeys.issues(), 'detail', id] as const,
  
  policies: () => [...qualityQueryKeys.all, 'policies'] as const,
  policiesList: (filters: any) => [...qualityQueryKeys.policies(), 'list', filters] as const,
  policiesDetail: (id: string) => [...qualityQueryKeys.policies(), 'detail', id] as const,
  
  rules: () => [...qualityQueryKeys.all, 'rules'] as const,
  rulesList: (filters: any) => [...qualityQueryKeys.rules(), 'list', filters] as const,
  rulesDetail: (id: string) => [...qualityQueryKeys.rules(), 'detail', id] as const,
  
  compliance: () => [...qualityQueryKeys.all, 'compliance'] as const,
  complianceChecks: (assetId: string) => [...qualityQueryKeys.compliance(), 'checks', assetId] as const,
  complianceStatus: (assetId: string) => [...qualityQueryKeys.compliance(), 'status', assetId] as const,
  
  assessments: () => [...qualityQueryKeys.all, 'assessments'] as const,
  assessmentsList: (filters: any) => [...qualityQueryKeys.assessments(), 'list', filters] as const,
  assessmentsHistory: (assetId: string) => [...qualityQueryKeys.assessments(), 'history', assetId] as const,
  
  metrics: () => [...qualityQueryKeys.all, 'metrics'] as const,
  metricsOverview: () => [...qualityQueryKeys.metrics(), 'overview'] as const,
  metricsByDomain: (domain: string) => [...qualityQueryKeys.metrics(), 'domain', domain] as const,
  metricsTrends: (timeframe: string) => [...qualityQueryKeys.metrics(), 'trends', timeframe] as const,
  
  reports: () => [...qualityQueryKeys.all, 'reports'] as const,
  reportsList: (filters: any) => [...qualityQueryKeys.reports(), 'list', filters] as const,
  reportsDetail: (id: string) => [...qualityQueryKeys.reports(), 'detail', id] as const
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCatalogQuality = (
  workspaceId?: string,
  options: UseCatalogQualityOptions = {}
): UseCatalogQualityReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const {
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
  } = options;

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: qualityIssues,
    isLoading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues
  } = useQuery({
    queryKey: qualityQueryKeys.issuesList({ workspaceId }),
    queryFn: () => qualityService.getQualityIssues({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  const {
    data: policies,
    isLoading: policiesLoading,
    error: policiesError,
    refetch: refetchPolicies
  } = useQuery({
    queryKey: qualityQueryKeys.policiesList({ workspaceId }),
    queryFn: () => qualityService.getGovernancePolicies({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 300000 // 5 minutes
  });

  const {
    data: qualityRules,
    isLoading: rulesLoading,
    error: rulesError,
    refetch: refetchRules
  } = useQuery({
    queryKey: qualityQueryKeys.rulesList({ workspaceId }),
    queryFn: () => qualityService.getQualityRules({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  const {
    data: complianceChecks,
    isLoading: complianceLoading,
    error: complianceError,
    refetch: refetchCompliance
  } = useQuery({
    queryKey: qualityQueryKeys.complianceChecks(workspaceId || ''),
    queryFn: () => qualityService.getComplianceChecks({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  const {
    data: qualityMetrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: qualityQueryKeys.metricsOverview(),
    queryFn: () => qualityService.getQualityMetrics({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  const {
    data: stewardshipMetrics,
    isLoading: stewardshipLoading,
    error: stewardshipError,
    refetch: refetchStewardship
  } = useQuery({
    queryKey: qualityQueryKeys.metrics(),
    queryFn: () => qualityService.getStewardshipMetrics({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  const {
    data: assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useQuery({
    queryKey: qualityQueryKeys.assessmentsList({ workspaceId }),
    queryFn: () => qualityService.getQualityAssessments({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: qualityQueryKeys.reportsList({ workspaceId }),
    queryFn: () => qualityService.getQualityReports({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 300000 // 5 minutes
  });

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = useQuery({
    queryKey: qualityQueryKeys.metricsTrends('30d'),
    queryFn: () => qualityService.getQualityTrends('30d', ['completeness', 'accuracy', 'consistency']),
    enabled: !!workspaceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 300000 // 5 minutes
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createQualityIssueMutation = useMutation({
    mutationFn: (issue: Partial<DataQualityIssue>) => qualityService.createQualityIssue(issue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.metricsOverview() });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to create quality issue');
    }
  });

  const updateQualityIssueMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DataQualityIssue> }) =>
      qualityService.updateQualityIssue(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.issues() });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.issuesDetail(id) });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.metricsOverview() });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to update quality issue');
    }
  });

  const createQualityRuleMutation = useMutation({
    mutationFn: (rule: Partial<QualityRule>) => qualityService.createQualityRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rules() });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to create quality rule');
    }
  });

  const updateQualityRuleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<QualityRule> }) =>
      qualityService.updateQualityRule(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rules() });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rulesDetail(id) });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to update quality rule');
    }
  });

  const createPolicyMutation = useMutation({
    mutationFn: (policy: Partial<GovernancePolicy>) => qualityService.createGovernancePolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.policies() });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to create policy');
    }
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GovernancePolicy> }) =>
      qualityService.updateGovernancePolicy(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.policies() });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.policiesDetail(id) });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to update policy');
    }
  });

  const runComplianceCheckMutation = useMutation({
    mutationFn: ({ assetId, policyIds }: { assetId: string; policyIds?: string[] }) =>
      qualityService.runComplianceCheck(assetId, policyIds),
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.complianceChecks(assetId) });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.complianceStatus(assetId) });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to run compliance check');
    }
  });

  const runQualityAssessmentMutation = useMutation({
    mutationFn: ({ assetId, dimensions }: { assetId: string; dimensions?: QualityDimension[] }) =>
      qualityService.runQualityAssessment(assetId, dimensions),
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.assessmentsHistory(assetId) });
      queryClient.invalidateQueries({ queryKey: qualityQueryKeys.metricsOverview() });
    },
    onError: (error) => {
      setError(error);
      handleApiError(error, 'Failed to run quality assessment');
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isLoading = 
    issuesLoading || 
    policiesLoading || 
    rulesLoading || 
    complianceLoading || 
    metricsLoading || 
    stewardshipLoading || 
    assessmentsLoading || 
    reportsLoading || 
    trendsLoading;

  const error = 
    issuesError || 
    policiesError || 
    rulesError || 
    complianceError || 
    metricsError || 
    stewardshipError || 
    assessmentsError || 
    reportsError || 
    trendsError;

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchIssues(),
      refetchPolicies(),
      refetchRules(),
      refetchCompliance(),
      refetchMetrics(),
      refetchStewardship(),
      refetchAssessments(),
      refetchReports(),
      refetchTrends()
    ]);
  }, [
    refetchIssues,
    refetchPolicies,
    refetchRules,
    refetchCompliance,
    refetchMetrics,
    refetchStewardship,
    refetchAssessments,
    refetchReports,
    refetchTrends
  ]);

  // Quality Issues Management
  const createQualityIssue = useCallback(async (issue: Partial<DataQualityIssue>) => {
    return createQualityIssueMutation.mutateAsync(issue);
  }, [createQualityIssueMutation]);

  const updateQualityIssue = useCallback(async (id: string, updates: Partial<DataQualityIssue>) => {
    return updateQualityIssueMutation.mutateAsync({ id, updates });
  }, [updateQualityIssueMutation]);

  const resolveQualityIssue = useCallback(async (id: string, resolution: IssueResolution) => {
    return qualityService.resolveQualityIssue(id, resolution);
  }, []);

  const deleteQualityIssue = useCallback(async (id: string) => {
    await qualityService.deleteQualityIssue(id);
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.issues() });
  }, [queryClient]);

  const getQualityIssueById = useCallback(async (id: string) => {
    return qualityService.getQualityIssueById(id);
  }, []);

  const getIssuesBySeverity = useCallback((severity: string) => {
    return qualityIssues?.filter(issue => issue.severity === severity) || [];
  }, [qualityIssues]);

  const getIssuesByDomain = useCallback((domain: string) => {
    return qualityIssues?.filter(issue => issue.dataDomain === domain) || [];
  }, [qualityIssues]);

  // Quality Rules Management
  const createQualityRule = useCallback(async (rule: Partial<QualityRule>) => {
    return createQualityRuleMutation.mutateAsync(rule);
  }, [createQualityRuleMutation]);

  const updateQualityRule = useCallback(async (id: string, updates: Partial<QualityRule>) => {
    return updateQualityRuleMutation.mutateAsync({ id, updates });
  }, [updateQualityRuleMutation]);

  const deleteQualityRule = useCallback(async (id: string) => {
    await qualityService.deleteQualityRule(id);
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rules() });
  }, [queryClient]);

  const enableQualityRule = useCallback(async (id: string) => {
    return qualityService.enableQualityRule(id);
  }, []);

  const disableQualityRule = useCallback(async (id: string) => {
    return qualityService.disableQualityRule(id);
  }, []);

  const testQualityRule = useCallback(async (rule: QualityRule, sampleData?: any) => {
    return qualityService.testQualityRule(rule, sampleData);
  }, []);

  // Policy Management
  const createPolicy = useCallback(async (policy: Partial<GovernancePolicy>) => {
    return createPolicyMutation.mutateAsync(policy);
  }, [createPolicyMutation]);

  const updatePolicy = useCallback(async (id: string, updates: Partial<GovernancePolicy>) => {
    return updatePolicyMutation.mutateAsync({ id, updates });
  }, [updatePolicyMutation]);

  const deletePolicy = useCallback(async (id: string) => {
    await qualityService.deleteGovernancePolicy(id);
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.policies() });
  }, [queryClient]);

  const publishPolicy = useCallback(async (id: string) => {
    return qualityService.publishGovernancePolicy(id);
  }, []);

  const archivePolicy = useCallback(async (id: string) => {
    return qualityService.archiveGovernancePolicy(id);
  }, []);

  const getPolicyById = useCallback(async (id: string) => {
    return qualityService.getGovernancePolicyById(id);
  }, []);

  // Compliance Management
  const runComplianceCheck = useCallback(async (assetId: string, policyIds?: string[]) => {
    return runComplianceCheckMutation.mutateAsync({ assetId, policyIds });
  }, [runComplianceCheckMutation]);

  const getComplianceStatus = useCallback(async (assetId: string) => {
    return qualityService.getComplianceStatus(assetId);
  }, []);

  const scheduleComplianceCheck = useCallback(async (assetId: string, schedule: any) => {
    return qualityService.scheduleComplianceCheck(assetId, schedule);
  }, []);

  const getComplianceHistory = useCallback(async (assetId: string) => {
    return qualityService.getComplianceHistory(assetId);
  }, []);

  // Quality Assessment
  const runQualityAssessment = useCallback(async (assetId: string, dimensions?: QualityDimension[]) => {
    return runQualityAssessmentMutation.mutateAsync({ assetId, dimensions });
  }, [runQualityAssessmentMutation]);

  const getQualityAssessmentHistory = useCallback(async (assetId: string) => {
    return qualityService.getQualityAssessmentHistory(assetId);
  }, []);

  const setQualityThresholds = useCallback(async (assetId: string, thresholds: QualityThreshold[]) => {
    return qualityService.setQualityThresholds(assetId, thresholds);
  }, []);

  // Reporting & Analytics
  const generateQualityReport = useCallback(async (options: any) => {
    return qualityService.generateQualityReport(options);
  }, []);

  const getQualityTrends = useCallback(async (timeframe: string, metrics: string[]) => {
    return qualityService.getQualityTrends(timeframe, metrics);
  }, []);

  const getQualityMetricsByDomain = useCallback(async (domain: string) => {
    return qualityService.getQualityMetricsByDomain(domain);
  }, []);

  const getSystemQualityOverview = useCallback(async () => {
    return qualityService.getSystemQualityOverview();
  }, []);

  // Search & Filtering
  const searchQualityIssues = useCallback((query: string, filters?: any) => {
    if (!qualityIssues) return [];
    
    return qualityIssues.filter(issue => {
      const matchesQuery = query === '' || 
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = !filters || Object.entries(filters).every(([key, value]) => {
        if (value === 'all' || value === '') return true;
        return issue[key as keyof DataQualityIssue] === value;
      });

      return matchesQuery && matchesFilters;
    });
  }, [qualityIssues]);

  const searchPolicies = useCallback((query: string, filters?: any) => {
    if (!policies) return [];
    
    return policies.filter(policy => {
      const matchesQuery = query === '' || 
        policy.name.toLowerCase().includes(query.toLowerCase()) ||
        policy.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = !filters || Object.entries(filters).every(([key, value]) => {
        if (value === 'all' || value === '') return true;
        return policy[key as keyof GovernancePolicy] === value;
      });

      return matchesQuery && matchesFilters;
    });
  }, [policies]);

  const searchRules = useCallback((query: string, filters?: any) => {
    if (!qualityRules) return [];
    
    return qualityRules.filter(rule => {
      const matchesQuery = query === '' || 
        rule.name.toLowerCase().includes(query.toLowerCase()) ||
        rule.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = !filters || Object.entries(filters).every(([key, value]) => {
        if (value === 'all' || value === '') return true;
        return rule[key as keyof QualityRule] === value;
      });

      return matchesQuery && matchesFilters;
    });
  }, [qualityRules]);

  // Bulk Operations
  const bulkResolveIssues = useCallback(async (issueIds: string[], resolution: IssueResolution) => {
    await Promise.all(issueIds.map(id => qualityService.resolveQualityIssue(id, resolution)));
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.issues() });
  }, [queryClient]);

  const bulkUpdatePolicies = useCallback(async (policyIds: string[], updates: Partial<GovernancePolicy>) => {
    await Promise.all(policyIds.map(id => qualityService.updateGovernancePolicy(id, updates)));
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.policies() });
  }, [queryClient]);

  const bulkEnableRules = useCallback(async (ruleIds: string[]) => {
    await Promise.all(ruleIds.map(id => qualityService.enableQualityRule(id)));
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rules() });
  }, [queryClient]);

  const bulkDisableRules = useCallback(async (ruleIds: string[]) => {
    await Promise.all(ruleIds.map(id => qualityService.disableQualityRule(id)));
    queryClient.invalidateQueries({ queryKey: qualityQueryKeys.rules() });
  }, [queryClient]);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    // Data
    qualityIssues,
    policies,
    complianceChecks,
    qualityMetrics,
    stewardshipMetrics,
    qualityRules,
    assessments,
    reports,
    trends,

    // State
    isLoading,
    error,

    // Actions
    refetch,
    
    // Quality Issues Management
    createQualityIssue,
    updateQualityIssue,
    resolveQualityIssue,
    deleteQualityIssue,
    getQualityIssueById,
    getIssuesBySeverity,
    getIssuesByDomain,
    
    // Quality Rules Management
    createQualityRule,
    updateQualityRule,
    deleteQualityRule,
    enableQualityRule,
    disableQualityRule,
    testQualityRule,
    
    // Policy Management
    createPolicy,
    updatePolicy,
    deletePolicy,
    publishPolicy,
    archivePolicy,
    getPolicyById,
    
    // Compliance Management
    runComplianceCheck,
    getComplianceStatus,
    scheduleComplianceCheck,
    getComplianceHistory,
    
    // Quality Assessment
    runQualityAssessment,
    getQualityAssessmentHistory,
    setQualityThresholds,
    
    // Reporting & Analytics
    generateQualityReport,
    getQualityTrends,
    getQualityMetricsByDomain,
    getSystemQualityOverview,
    
    // Search & Filtering
    searchQualityIssues,
    searchPolicies,
    searchRules,
    
    // Bulk Operations
    bulkResolveIssues,
    bulkUpdatePolicies,
    bulkEnableRules,
    bulkDisableRules
  };
};

export default useCatalogQuality;