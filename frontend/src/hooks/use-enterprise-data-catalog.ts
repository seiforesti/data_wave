import React from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  catalogApi, 
  catalogAnalyticsApi, 
  catalogLineageApi, 
  catalogQualityApi, 
  catalogTagApi, 
  catalogUsageApi 
} from '../services/enhanced-data-catalog-apis';
import { 
  CatalogItem, 
  CatalogItemCreate, 
  CatalogItemUpdate,
  CatalogTag,
  CatalogLineage,
  QualityRule,
  UsageLog,
  CatalogAnalytics,
  SearchFilters,
  DiscoveryResult
} from '../types/data-catalog';
import { useAuth } from './use-auth';
import { useWebSocket } from './use-websocket';
import { useEventBus } from './use-event-bus';

// Real-time catalog monitoring hook
export const useCatalogMonitoring = () => {
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();
  const { emit } = useEventBus();

  const { data: realTimeStats, isLoading } = useQuery({
    queryKey: ['catalog', 'monitoring', 'realtime'],
    queryFn: () => catalogAnalyticsApi.getRealTimeStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user
  });

  // Subscribe to real-time catalog events
  React.useEffect(() => {
    if (!user) return;

    const handleCatalogUpdate = (data: any) => {
      emit('catalog:updated', data);
      toast.info(`Catalog item ${data.item_name} was updated`);
    };

    const handleQualityAlert = (data: any) => {
      emit('catalog:quality-alert', data);
      toast.error(`Quality alert: ${data.message}`, {
        description: `Item: ${data.item_name}`
      });
    };

    const handleLineageChange = (data: any) => {
      emit('catalog:lineage-changed', data);
      toast.info(`Lineage updated for ${data.item_name}`);
    };

    subscribe('catalog:item-updated', handleCatalogUpdate);
    subscribe('catalog:quality-alert', handleQualityAlert);
    subscribe('catalog:lineage-changed', handleLineageChange);

    return () => {
      unsubscribe('catalog:item-updated', handleCatalogUpdate);
      unsubscribe('catalog:quality-alert', handleQualityAlert);
      unsubscribe('catalog:lineage-changed', handleLineageChange);
    };
  }, [user, subscribe, unsubscribe, emit]);

  return {
    realTimeStats,
    isLoading
  };
};

// AI-powered catalog insights hook
export const useCatalogInsights = () => {
  const { user } = useAuth();

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['catalog', 'insights'],
    queryFn: () => catalogAnalyticsApi.getAIInsights(),
    enabled: !!user,
    staleTime: 300000 // 5 minutes
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => catalogAnalyticsApi.generateAIInsights(),
    onSuccess: () => {
      refetch();
      toast.success('AI insights generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate AI insights', {
        description: error.message
      });
    }
  });

  return {
    insights,
    isLoading,
    generateInsights: generateInsightsMutation.mutate,
    isGenerating: generateInsightsMutation.isPending
  };
};

// Enterprise catalog items management hook
export const useEnterpriseCatalogItems = (filters?: SearchFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { emit } = useEventBus();

  // Infinite query for paginated catalog items
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['catalog', 'items', filters],
    queryFn: ({ pageParam = 1 }) => 
      catalogApi.searchItems({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => 
      lastPage.has_more ? lastPage.page + 1 : undefined,
    enabled: !!user
  });

  // Create catalog item
  const createMutation = useMutation({
    mutationFn: (item: CatalogItemCreate) => catalogApi.createItem(item),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      emit('catalog:item-created', newItem);
      toast.success('Catalog item created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create catalog item', {
        description: error.message
      });
    }
  });

  // Update catalog item
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CatalogItemUpdate }) =>
      catalogApi.updateItem(id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      emit('catalog:item-updated', updatedItem);
      toast.success('Catalog item updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update catalog item', {
        description: error.message
      });
    }
  });

  // Delete catalog item
  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteItem(id),
    onSuccess: (deletedItem) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      emit('catalog:item-deleted', deletedItem);
      toast.success('Catalog item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete catalog item', {
        description: error.message
      });
    }
  });

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Array<{ id: string; data: CatalogItemUpdate }>) =>
      catalogApi.bulkUpdateItems(updates),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      emit('catalog:bulk-updated', results);
      toast.success(`Updated ${results.length} catalog items`);
    },
    onError: (error) => {
      toast.error('Failed to bulk update catalog items', {
        description: error.message
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => catalogApi.bulkDeleteItems(ids),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      emit('catalog:bulk-deleted', results);
      toast.success(`Deleted ${results.length} catalog items`);
    },
    onError: (error) => {
      toast.error('Failed to bulk delete catalog items', {
        description: error.message
      });
    }
  });

  return {
    // Data
    items: data?.pages.flatMap(page => page.items) ?? [],
    totalItems: data?.pages[0]?.total ?? 0,
    hasNextPage,
    
    // Loading states
    isLoading,
    isFetchingNextPage,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    // Actions
    fetchNextPage,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    bulkUpdateItems: bulkUpdateMutation.mutate,
    bulkDeleteItems: bulkDeleteMutation.mutate,
    
    // Error
    error
  };
};

// Catalog discovery and search hook
export const useCatalogDiscovery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: discoveryResults, isLoading } = useQuery({
    queryKey: ['catalog', 'discovery'],
    queryFn: () => catalogApi.discoverItems(),
    enabled: !!user,
    staleTime: 600000 // 10 minutes
  });

  const searchMutation = useMutation({
    mutationFn: (filters: SearchFilters) => catalogApi.searchItems(filters),
    onSuccess: (results) => {
      queryClient.setQueryData(['catalog', 'search-results'], results);
    },
    onError: (error) => {
      toast.error('Search failed', {
        description: error.message
      });
    }
  });

  const autoCompleteMutation = useMutation({
    mutationFn: (query: string) => catalogApi.autoComplete(query),
    onError: (error) => {
      console.error('Auto-complete failed:', error);
    }
  });

  return {
    discoveryResults,
    isLoading,
    search: searchMutation.mutate,
    autoComplete: autoCompleteMutation.mutate,
    isSearching: searchMutation.isPending,
    isAutoCompleting: autoCompleteMutation.isPending
  };
};

// Catalog lineage management hook
export const useCatalogLineage = (itemId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { emit } = useEventBus();

  const { data: lineage, isLoading } = useQuery({
    queryKey: ['catalog', 'lineage', itemId],
    queryFn: () => catalogLineageApi.getItemLineage(itemId!),
    enabled: !!user && !!itemId
  });

  const createLineageMutation = useMutation({
    mutationFn: (lineageData: Omit<CatalogLineage, 'id' | 'created_at' | 'updated_at'>) =>
      catalogLineageApi.createLineage(lineageData),
    onSuccess: (newLineage) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      emit('catalog:lineage-created', newLineage);
      toast.success('Data lineage created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create data lineage', {
        description: error.message
      });
    }
  });

  const updateLineageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogLineage> }) =>
      catalogLineageApi.updateLineage(id, data),
    onSuccess: (updatedLineage) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      emit('catalog:lineage-updated', updatedLineage);
      toast.success('Data lineage updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update data lineage', {
        description: error.message
      });
    }
  });

  const deleteLineageMutation = useMutation({
    mutationFn: (id: string) => catalogLineageApi.deleteLineage(id),
    onSuccess: (deletedLineage) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'lineage'] });
      emit('catalog:lineage-deleted', deletedLineage);
      toast.success('Data lineage deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete data lineage', {
        description: error.message
      });
    }
  });

  return {
    lineage,
    isLoading,
    createLineage: createLineageMutation.mutate,
    updateLineage: updateLineageMutation.mutate,
    deleteLineage: deleteLineageMutation.mutate,
    isCreating: createLineageMutation.isPending,
    isUpdating: updateLineageMutation.isPending,
    isDeleting: deleteLineageMutation.isPending
  };
};

// Catalog quality management hook
export const useCatalogQuality = (itemId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { emit } = useEventBus();

  const { data: qualityRules, isLoading } = useQuery({
    queryKey: ['catalog', 'quality', itemId],
    queryFn: () => catalogQualityApi.getItemQualityRules(itemId!),
    enabled: !!user && !!itemId
  });

  const { data: qualityMetrics } = useQuery({
    queryKey: ['catalog', 'quality-metrics', itemId],
    queryFn: () => catalogQualityApi.getItemQualityMetrics(itemId!),
    enabled: !!user && !!itemId,
    refetchInterval: 60000 // Refresh every minute
  });

  const createQualityRuleMutation = useMutation({
    mutationFn: (rule: Omit<QualityRule, 'id' | 'created_at' | 'updated_at'>) =>
      catalogQualityApi.createQualityRule(rule),
    onSuccess: (newRule) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
      emit('catalog:quality-rule-created', newRule);
      toast.success('Quality rule created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create quality rule', {
        description: error.message
      });
    }
  });

  const updateQualityRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QualityRule> }) =>
      catalogQualityApi.updateQualityRule(id, data),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
      emit('catalog:quality-rule-updated', updatedRule);
      toast.success('Quality rule updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update quality rule', {
        description: error.message
      });
    }
  });

  const deleteQualityRuleMutation = useMutation({
    mutationFn: (id: string) => catalogQualityApi.deleteQualityRule(id),
    onSuccess: (deletedRule) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality'] });
      emit('catalog:quality-rule-deleted', deletedRule);
      toast.success('Quality rule deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete quality rule', {
        description: error.message
      });
    }
  });

  const runQualityCheckMutation = useMutation({
    mutationFn: (itemId: string) => catalogQualityApi.runQualityCheck(itemId),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'quality-metrics'] });
      emit('catalog:quality-check-completed', results);
      toast.success('Quality check completed');
    },
    onError: (error) => {
      toast.error('Quality check failed', {
        description: error.message
      });
    }
  });

  return {
    qualityRules,
    qualityMetrics,
    isLoading,
    createQualityRule: createQualityRuleMutation.mutate,
    updateQualityRule: updateQualityRuleMutation.mutate,
    deleteQualityRule: deleteQualityRuleMutation.mutate,
    runQualityCheck: runQualityCheckMutation.mutate,
    isCreating: createQualityRuleMutation.isPending,
    isUpdating: updateQualityRuleMutation.isPending,
    isDeleting: deleteQualityRuleMutation.isPending,
    isRunningCheck: runQualityCheckMutation.isPending
  };
};

// Catalog tagging management hook
export const useCatalogTagging = (itemId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { emit } = useEventBus();

  const { data: tags, isLoading } = useQuery({
    queryKey: ['catalog', 'tags', itemId],
    queryFn: () => catalogTagApi.getItemTags(itemId!),
    enabled: !!user && !!itemId
  });

  const { data: allTags } = useQuery({
    queryKey: ['catalog', 'all-tags'],
    queryFn: () => catalogTagApi.getAllTags(),
    enabled: !!user
  });

  const addTagMutation = useMutation({
    mutationFn: ({ itemId, tagName }: { itemId: string; tagName: string }) =>
      catalogTagApi.addTagToItem(itemId, tagName),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'tags'] });
      emit('catalog:tag-added', newTag);
      toast.success('Tag added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add tag', {
        description: error.message
      });
    }
  });

  const removeTagMutation = useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: string; tagId: string }) =>
      catalogTagApi.removeTagFromItem(itemId, tagId),
    onSuccess: (removedTag) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'tags'] });
      emit('catalog:tag-removed', removedTag);
      toast.success('Tag removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove tag', {
        description: error.message
      });
    }
  });

  const createTagMutation = useMutation({
    mutationFn: (tag: Omit<CatalogTag, 'id' | 'created_at' | 'updated_at'>) =>
      catalogTagApi.createTag(tag),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'all-tags'] });
      emit('catalog:tag-created', newTag);
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tag', {
        description: error.message
      });
    }
  });

  return {
    tags,
    allTags,
    isLoading,
    addTag: addTagMutation.mutate,
    removeTag: removeTagMutation.mutate,
    createTag: createTagMutation.mutate,
    isAdding: addTagMutation.isPending,
    isRemoving: removeTagMutation.isPending,
    isCreating: createTagMutation.isPending
  };
};

// Catalog usage tracking hook
export const useCatalogUsage = (itemId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: usageLogs, isLoading } = useQuery({
    queryKey: ['catalog', 'usage', itemId],
    queryFn: () => catalogUsageApi.getItemUsageLogs(itemId!),
    enabled: !!user && !!itemId
  });

  const { data: usageAnalytics } = useQuery({
    queryKey: ['catalog', 'usage-analytics', itemId],
    queryFn: () => catalogUsageApi.getItemUsageAnalytics(itemId!),
    enabled: !!user && !!itemId
  });

  const logUsageMutation = useMutation({
    mutationFn: (usageData: Omit<UsageLog, 'id' | 'created_at'>) =>
      catalogUsageApi.logUsage(usageData),
    onSuccess: (newLog) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'usage'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'usage-analytics'] });
      toast.success('Usage logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log usage', {
        description: error.message
      });
    }
  });

  return {
    usageLogs,
    usageAnalytics,
    isLoading,
    logUsage: logUsageMutation.mutate,
    isLogging: logUsageMutation.isPending
  };
};

// Catalog analytics and reporting hook
export const useCatalogAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['catalog', 'analytics'],
    queryFn: () => catalogAnalyticsApi.getAnalytics(),
    enabled: !!user,
    staleTime: 300000 // 5 minutes
  });

  const { data: trends } = useQuery({
    queryKey: ['catalog', 'trends'],
    queryFn: () => catalogAnalyticsApi.getTrends(),
    enabled: !!user,
    staleTime: 600000 // 10 minutes
  });

  const { data: healthMetrics } = useQuery({
    queryKey: ['catalog', 'health'],
    queryFn: () => catalogAnalyticsApi.getHealthMetrics(),
    enabled: !!user,
    refetchInterval: 120000 // Refresh every 2 minutes
  });

  const generateReportMutation = useMutation({
    mutationFn: (reportType: string) => catalogAnalyticsApi.generateReport(reportType),
    onSuccess: (report) => {
      toast.success('Report generated successfully');
      // Handle report download or display
    },
    onError: (error) => {
      toast.error('Failed to generate report', {
        description: error.message
      });
    }
  });

  return {
    analytics,
    trends,
    healthMetrics,
    isLoading,
    generateReport: generateReportMutation.mutate,
    isGeneratingReport: generateReportMutation.isPending
  };
};

// Cross-group data sharing hook for data catalog
export const useCatalogDataSharing = () => {
  const { emit, subscribe } = useEventBus();
  const queryClient = useQueryClient();

  // Share catalog data with other groups
  const shareWithCompliance = (catalogItem: CatalogItem) => {
    emit('compliance:catalog-item-shared', {
      type: 'catalog_item',
      data: catalogItem,
      source: 'data_catalog'
    });
  };

  const shareWithScanRules = (catalogItem: CatalogItem) => {
    emit('scan-rules:catalog-item-shared', {
      type: 'catalog_item',
      data: catalogItem,
      source: 'data_catalog'
    });
  };

  const shareWithScanLogic = (catalogItem: CatalogItem) => {
    emit('scan-logic:catalog-item-shared', {
      type: 'catalog_item',
      data: catalogItem,
      source: 'data_catalog'
    });
  };

  // Listen for data from other groups
  React.useEffect(() => {
    const handleComplianceData = (data: any) => {
      if (data.type === 'compliance_rule') {
        queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
        toast.info('Received compliance rule data');
      }
    };

    const handleScanRulesData = (data: any) => {
      if (data.type === 'scan_rule_set') {
        queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
        toast.info('Received scan rule set data');
      }
    };

    const handleScanLogicData = (data: any) => {
      if (data.type === 'scan_logic') {
        queryClient.invalidateQueries({ queryKey: ['catalog', 'items'] });
        toast.info('Received scan logic data');
      }
    };

    subscribe('compliance:data-shared', handleComplianceData);
    subscribe('scan-rules:data-shared', handleScanRulesData);
    subscribe('scan-logic:data-shared', handleScanLogicData);

    return () => {
      subscribe('compliance:data-shared', handleComplianceData);
      subscribe('scan-rules:data-shared', handleScanRulesData);
      subscribe('scan-logic:data-shared', handleScanLogicData);
    };
  }, [subscribe, queryClient]);

  return {
    shareWithCompliance,
    shareWithScanRules,
    shareWithScanLogic
  };
};

// Workflow automation hook for data catalog
export const useCatalogWorkflow = () => {
  const { user } = useAuth();
  const { emit } = useEventBus();

  const triggerQualityWorkflow = (itemId: string) => {
    emit('workflow:quality-check-triggered', {
      itemId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const triggerLineageWorkflow = (itemId: string) => {
    emit('workflow:lineage-update-triggered', {
      itemId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const triggerTaggingWorkflow = (itemId: string, tags: string[]) => {
    emit('workflow:auto-tagging-triggered', {
      itemId,
      tags,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const triggerDiscoveryWorkflow = () => {
    emit('workflow:discovery-triggered', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  return {
    triggerQualityWorkflow,
    triggerLineageWorkflow,
    triggerTaggingWorkflow,
    triggerDiscoveryWorkflow
  };
};