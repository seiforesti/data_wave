// ============================================================================
// CATALOG ANALYTICS HOOKS - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Custom React hooks for managing catalog analytics data and real-time updates
// Integrates with catalog_analytics_service.py and comprehensive_analytics_service.py
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Services
import { 
  catalogAnalyticsService,
  enterpriseCatalogService,
  catalogRecommendationService,
  catalogQualityService 
} from '../services';

// Types
import { 
  UsageAnalyticsModule,
  AnalyticsDashboardConfig,
  UsageMetric,
  UserEngagementMetric,
  AssetPopularityMetric,
  UsageTrend,
  UserBehaviorAnalysis,
  AccessPatternAnalysis,
  UsageRecommendation,
  UsagePerformanceMetrics,
  AnalyticsFilter,
  TimePeriod,
  PopularityAnalyticsModule,
  BusinessAnalyticsModule,
  TechnicalAnalyticsModule,
  AnalyticsWidget,
  CatalogAnalyticsDashboard
} from '../types/analytics.types';

// ============================================================================
// ANALYTICS CONFIGURATION TYPES
// ============================================================================

interface AnalyticsConfig {
  timeRange: TimePeriod;
  filters: AnalyticsFilter[];
  enableRealTime?: boolean;
  refreshInterval?: number;
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  includeAdvancedMetrics?: boolean;
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel' | 'json';
  timeRange: TimePeriod;
  filters: AnalyticsFilter[];
  includeCharts?: boolean;
  includeInsights?: boolean;
  sections?: string[];
}

interface RealTimeConfig {
  enabled: boolean;
  metrics: string[];
  updateInterval: number;
  maxRetries?: number;
  reconnectDelay?: number;
}

// ============================================================================
// WEBSOCKET CONNECTION MANAGER
// ============================================================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxRetries: number = 5;
  private retryCount: number = 0;
  private reconnectDelay: number = 3000;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/catalog-analytics';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected to catalog analytics');
        this.retryCount = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.retryCount < this.maxRetries) {
      this.reconnectTimer = setTimeout(() => {
        this.retryCount++;
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.retryCount));
    }
  }

  private notifySubscribers(data: any) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket subscriber callback:', error);
      }
    });
  }

  subscribe(id: string, callback: (data: any) => void) {
    this.subscribers.set(id, callback);
    return () => {
      this.subscribers.delete(id);
    };
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
    this.subscribers.clear();
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'error';
    }
  }
}

// Global WebSocket manager instance
let wsManager: WebSocketManager | null = null;

const getWebSocketManager = () => {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
};

// ============================================================================
// MAIN CATALOG ANALYTICS HOOK
// ============================================================================

export const useCatalogAnalytics = (config: AnalyticsConfig) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query for usage analytics
  const usageAnalyticsQuery = useQuery({
    queryKey: ['catalogAnalytics', 'usage', config.timeRange, config.filters],
    queryFn: () => catalogAnalyticsService.getUsageAnalytics({
      timeRange: config.timeRange,
      filters: config.filters,
      granularity: config.granularity || 'day',
      includeAdvanced: config.includeAdvancedMetrics || false
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: config.enableRealTime ? 30000 : false,
    refetchIntervalInBackground: config.enableRealTime
  });

  // Query for business analytics
  const businessAnalyticsQuery = useQuery({
    queryKey: ['catalogAnalytics', 'business', config.timeRange, config.filters],
    queryFn: () => catalogAnalyticsService.getBusinessAnalytics({
      timeRange: config.timeRange,
      filters: config.filters
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: config.includeAdvancedMetrics
  });

  // Query for technical analytics
  const technicalAnalyticsQuery = useQuery({
    queryKey: ['catalogAnalytics', 'technical', config.timeRange, config.filters],
    queryFn: () => catalogAnalyticsService.getTechnicalAnalytics({
      timeRange: config.timeRange,
      filters: config.filters
    }),
    staleTime: 5 * 60 * 1000,
    enabled: config.includeAdvancedMetrics
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (options: ExportOptions) => catalogAnalyticsService.exportAnalytics(options),
    onSuccess: (data, variables) => {
      // Handle successful export (e.g., download file)
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else if (data.blob) {
        const url = URL.createObjectURL(data.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalog-analytics-${new Date().toISOString().split('T')[0]}.${variables.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {
      console.error('Export failed:', error);
    }
  });

  // Refresh all analytics data
  const refreshAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalogAnalytics'] }),
        queryClient.refetchQueries({ queryKey: ['catalogAnalytics'] })
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Export analytics data
  const exportAnalytics = useCallback(async (options: ExportOptions) => {
    return exportMutation.mutateAsync(options);
  }, [exportMutation]);

  // Combined analytics data
  const usageAnalytics = useMemo<UsageAnalyticsModule | null>(() => {
    if (!usageAnalyticsQuery.data) return null;

    const data = usageAnalyticsQuery.data;
    return {
      id: `usage-analytics-${Date.now()}`,
      name: 'Usage Analytics',
      totalUsage: data.totalUsage || {},
      userEngagement: data.userEngagement || {},
      assetPopularity: data.assetPopularity || {},
      usageTrends: data.trends || [],
      seasonalPatterns: data.seasonalPatterns || [],
      userBehavior: data.userBehavior || {},
      accessPatterns: data.accessPatterns || {},
      usageRecommendations: data.recommendations || [],
      performanceMetrics: data.performance || {}
    };
  }, [usageAnalyticsQuery.data]);

  const loading = usageAnalyticsQuery.isLoading || 
                  businessAnalyticsQuery.isLoading || 
                  technicalAnalyticsQuery.isLoading ||
                  isRefreshing;

  const error = usageAnalyticsQuery.error?.message || 
                businessAnalyticsQuery.error?.message || 
                technicalAnalyticsQuery.error?.message ||
                exportMutation.error?.message;

  return {
    usageAnalytics,
    businessAnalytics: businessAnalyticsQuery.data || null,
    technicalAnalytics: technicalAnalyticsQuery.data || null,
    loading,
    error,
    isRefreshing,
    refreshAnalytics,
    exportAnalytics,
    exportLoading: exportMutation.isPending
  };
};

// ============================================================================
// USAGE ANALYTICS SPECIFIC HOOK
// ============================================================================

interface UseUsageAnalyticsConfig {
  timeRange: TimePeriod;
  filters: AnalyticsFilter[];
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  includePatterns?: boolean;
  includePredictions?: boolean;
}

export const useUsageAnalytics = (config: UseUsageAnalyticsConfig) => {
  const query = useQuery({
    queryKey: ['usageAnalytics', config.timeRange, config.filters, config.granularity],
    queryFn: async () => {
      const [metrics, trends, behavior] = await Promise.all([
        catalogAnalyticsService.getUsageMetrics(config),
        catalogAnalyticsService.getUsageTrends(config),
        config.includePatterns ? catalogAnalyticsService.getUserBehaviorAnalysis(config) : null
      ]);

      return {
        usageMetrics: metrics,
        trendData: trends,
        behaviorAnalysis: behavior,
        userEngagement: metrics?.userEngagement || null,
        assetPopularity: metrics?.assetPopularity || null
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30000 // 30 seconds
  });

  return {
    usageMetrics: query.data?.usageMetrics || null,
    userEngagement: query.data?.userEngagement || null,
    assetPopularity: query.data?.assetPopularity || null,
    trendData: query.data?.trendData || [],
    behaviorAnalysis: query.data?.behaviorAnalysis || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
};

// ============================================================================
// REAL-TIME METRICS HOOK
// ============================================================================

export const useRealTimeMetrics = (config: RealTimeConfig) => {
  const [metrics, setMetrics] = useState<any>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [latency, setLatency] = useState<number>(0);
  const wsManager = useRef<WebSocketManager | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPingTime = useRef<number>(0);

  useEffect(() => {
    if (!config.enabled) {
      if (wsManager.current) {
        wsManager.current.disconnect();
        wsManager.current = null;
      }
      return;
    }

    wsManager.current = getWebSocketManager();
    
    const unsubscribe = wsManager.current.subscribe('analytics-metrics', (data) => {
      if (data.type === 'metrics_update' && config.metrics.includes(data.metric)) {
        setMetrics(prev => ({
          ...prev,
          [data.metric]: data.value,
          timestamp: data.timestamp
        }));
      } else if (data.type === 'pong') {
        const currentTime = Date.now();
        setLatency(currentTime - lastPingTime.current);
      }
    });

    // Monitor connection status
    const statusInterval = setInterval(() => {
      if (wsManager.current) {
        setConnectionStatus(wsManager.current.getConnectionStatus());
      }
    }, 1000);

    // Send periodic pings for latency measurement
    pingInterval.current = setInterval(() => {
      if (wsManager.current && wsManager.current.getConnectionStatus() === 'connected') {
        lastPingTime.current = Date.now();
        wsManager.current.send({ type: 'ping', timestamp: lastPingTime.current });
      }
    }, 5000);

    // Subscribe to metrics
    if (wsManager.current.getConnectionStatus() === 'connected') {
      wsManager.current.send({
        type: 'subscribe_metrics',
        metrics: config.metrics,
        updateInterval: config.updateInterval
      });
    }

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
    };
  }, [config.enabled, config.metrics, config.updateInterval]);

  return {
    realTimeMetrics: metrics,
    connectionStatus,
    latency,
    isConnected: connectionStatus === 'connected'
  };
};

// ============================================================================
// ANALYTICS DASHBOARD HOOK
// ============================================================================

interface UseDashboardConfig {
  dashboardId?: string;
  timeRange: TimePeriod;
  filters: AnalyticsFilter[];
  enableRealTime?: boolean;
  widgets?: string[];
}

export const useAnalyticsDashboard = (config: UseDashboardConfig) => {
  const [dashboardConfig, setDashboardConfig] = useState<AnalyticsDashboardConfig | null>(null);
  const [widgets, setWidgets] = useState<AnalyticsWidget[]>([]);

  // Load dashboard configuration
  const dashboardQuery = useQuery({
    queryKey: ['analyticsDashboard', config.dashboardId],
    queryFn: () => catalogAnalyticsService.getDashboardConfig(config.dashboardId),
    enabled: !!config.dashboardId,
    staleTime: 10 * 60 * 1000
  });

  // Load widget data
  const widgetsQuery = useQuery({
    queryKey: ['analyticsWidgets', config.widgets, config.timeRange, config.filters],
    queryFn: () => catalogAnalyticsService.getWidgetsData({
      widgets: config.widgets || [],
      timeRange: config.timeRange,
      filters: config.filters
    }),
    enabled: !!(config.widgets && config.widgets.length > 0),
    staleTime: 5 * 60 * 1000,
    refetchInterval: config.enableRealTime ? 30000 : false
  });

  // Save dashboard configuration
  const saveDashboardMutation = useMutation({
    mutationFn: (dashboard: Partial<CatalogAnalyticsDashboard>) => 
      catalogAnalyticsService.saveDashboardConfig(dashboard),
    onSuccess: () => {
      dashboardQuery.refetch();
    }
  });

  const updateDashboardConfig = useCallback((updates: Partial<AnalyticsDashboardConfig>) => {
    setDashboardConfig(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const addWidget = useCallback((widget: AnalyticsWidget) => {
    setWidgets(prev => [...prev, widget]);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const saveDashboard = useCallback(async (dashboard: Partial<CatalogAnalyticsDashboard>) => {
    return saveDashboardMutation.mutateAsync(dashboard);
  }, [saveDashboardMutation]);

  useEffect(() => {
    if (dashboardQuery.data) {
      setDashboardConfig(dashboardQuery.data.config);
      setWidgets(dashboardQuery.data.widgets || []);
    }
  }, [dashboardQuery.data]);

  return {
    dashboard: dashboardQuery.data || null,
    dashboardConfig,
    widgets: widgetsQuery.data || widgets,
    loading: dashboardQuery.isLoading || widgetsQuery.isLoading,
    error: dashboardQuery.error?.message || widgetsQuery.error?.message,
    updateDashboardConfig,
    addWidget,
    removeWidget,
    saveDashboard,
    saveLoading: saveDashboardMutation.isPending
  };
};

// ============================================================================
// ANALYTICS INSIGHTS HOOK
// ============================================================================

export const useAnalyticsInsights = (config: AnalyticsConfig) => {
  const query = useQuery({
    queryKey: ['analyticsInsights', config.timeRange, config.filters],
    queryFn: () => catalogAnalyticsService.getAnalyticsInsights({
      timeRange: config.timeRange,
      filters: config.filters,
      includeRecommendations: true,
      includeAnomalies: true,
      includePredictions: true
    }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: config.enableRealTime ? 5 * 60 * 1000 : false // 5 minutes when real-time
  });

  const generateInsight = useMutation({
    mutationFn: (params: { type: string; context: any }) => 
      catalogAnalyticsService.generateInsight(params),
    onSuccess: () => {
      query.refetch();
    }
  });

  return {
    insights: query.data?.insights || [],
    recommendations: query.data?.recommendations || [],
    anomalies: query.data?.anomalies || [],
    predictions: query.data?.predictions || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    generateInsight: generateInsight.mutateAsync,
    generatingInsight: generateInsight.isPending,
    refetch: query.refetch
  };
};

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export {
  useCatalogAnalytics,
  useUsageAnalytics,
  useRealTimeMetrics,
  useAnalyticsDashboard,
  useAnalyticsInsights
};

// Export types for external use
export type {
  AnalyticsConfig,
  ExportOptions,
  RealTimeConfig,
  UseUsageAnalyticsConfig,
  UseDashboardConfig
};