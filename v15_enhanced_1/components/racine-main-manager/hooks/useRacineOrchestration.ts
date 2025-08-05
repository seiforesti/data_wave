/**
 * useRacineOrchestration Hook - System Health and Status Management
 * ================================================================
 * 
 * React hook for managing racine system orchestration, health monitoring,
 * and real-time status updates across all 7 data governance groups.
 * 
 * Features:
 * - Real-time system health monitoring
 * - Cross-group status aggregation
 * - Performance metrics tracking
 * - Alert management and notification
 * - Automatic retry with exponential backoff
 * - Optimistic updates and caching
 * 
 * Backend Integration:
 * - Primary Service: racine_orchestration_service.py
 * - WebSocket: Real-time health updates
 * - Caching: Intelligent cache management with TTL
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  SystemState,
  SystemAlert,
  RacineSystemMetrics,
  RacineSystemStatus,
  RacineGroupType,
  HealthLevel,
  AlertType,
  Priority,
  APIResponse
} from '../types/racine-core.types';

import { racineOrchestrationAPI, RacineWebSocketManager } from '../services/racine-orchestration-apis';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UseRacineOrchestrationOptions {
  enableRealTime?: boolean;
  pollInterval?: number;
  retryAttempts?: number;
  cacheTime?: number;
  staleTime?: number;
}

interface SystemHealthSummary {
  overall_status: RacineSystemStatus;
  overall_health: HealthLevel;
  group_status: Record<RacineGroupType, RacineSystemStatus>;
  active_alerts: SystemAlert[];
  critical_alerts_count: number;
  warning_alerts_count: number;
  healthy_groups_count: number;
  total_groups: number;
  last_updated: string;
}

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
  availability: number;
}

interface UseRacineOrchestrationReturn {
  // System Health
  systemHealth: SystemState | null;
  systemStatus: SystemHealthSummary | null;
  isHealthy: boolean;
  
  // Metrics
  performanceMetrics: PerformanceMetrics | null;
  realtimeMetrics: RacineSystemMetrics[];
  
  // Alerts
  alerts: SystemAlert[];
  criticalAlerts: SystemAlert[];
  unacknowledgedAlerts: SystemAlert[];
  
  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshSystemHealth: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  triggerHealthCheck: () => Promise<void>;
  
  // Real-time
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  enableRealTime: () => void;
  disableRealTime: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  systemHealth: ['racine', 'system', 'health'] as const,
  systemStatus: ['racine', 'system', 'status'] as const,
  performanceMetrics: ['racine', 'performance', 'metrics'] as const,
  alerts: ['racine', 'system', 'alerts'] as const,
  realtimeMetrics: ['racine', 'realtime', 'metrics'] as const,
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useRacineOrchestration(
  options: UseRacineOrchestrationOptions = {}
): UseRacineOrchestrationReturn {
  const {
    enableRealTime: enableRealTimeOption = true,
    pollInterval = 30000, // 30 seconds
    retryAttempts = 3,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
  } = options;

  // State Management
  const [realtimeMetrics, setRealtimeMetrics] = useState<RacineSystemMetrics[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [enableRealTimeState, setEnableRealTimeState] = useState(enableRealTimeOption);

  // Refs
  const wsManagerRef = useRef<RacineWebSocketManager | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query Client
  const queryClient = useQueryClient();

  // ========================================================================
  // SYSTEM HEALTH QUERY
  // ========================================================================

  const {
    data: systemHealth,
    isLoading: isHealthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: QUERY_KEYS.systemHealth,
    queryFn: async (): Promise<SystemState> => {
      const response = await racineOrchestrationAPI.getSystemHealth();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch system health');
      }
      return response.data;
    },
    staleTime,
    cacheTime,
    refetchInterval: enableRealTimeState ? false : pollInterval,
    retry: retryAttempts,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  // ========================================================================
  // SYSTEM STATUS QUERY
  // ========================================================================

  const {
    data: systemStatusData,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: QUERY_KEYS.systemStatus,
    queryFn: async () => {
      const response = await racineOrchestrationAPI.getSystemStatus();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch system status');
      }
      return response.data;
    },
    staleTime,
    cacheTime,
    refetchInterval: enableRealTimeState ? false : pollInterval,
    retry: retryAttempts,
  });

  // ========================================================================
  // PERFORMANCE METRICS QUERY
  // ========================================================================

  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    error: performanceError,
  } = useQuery({
    queryKey: QUERY_KEYS.performanceMetrics,
    queryFn: async (): Promise<PerformanceMetrics> => {
      const response = await racineOrchestrationAPI.getPerformanceAnalytics({
        groups: Object.values(RacineGroupType),
        metric_categories: ['cpu', 'memory', 'network', 'application'],
        time_range: {
          start: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
          end: new Date().toISOString(),
        },
        aggregation_interval: '1m',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch performance metrics');
      }

      // Transform the response data into PerformanceMetrics format
      const metrics = response.data.performance_metrics;
      return {
        cpu_usage: metrics.cpu_usage || 0,
        memory_usage: metrics.memory_usage || 0,
        disk_usage: metrics.disk_usage || 0,
        network_latency: metrics.network_latency || 0,
        active_connections: metrics.active_connections || 0,
        requests_per_minute: metrics.requests_per_minute || 0,
        error_rate: metrics.error_rate || 0,
        availability: metrics.availability || 100,
      };
    },
    staleTime: 30000, // 30 seconds
    cacheTime,
    refetchInterval: enableRealTimeState ? false : pollInterval,
    retry: retryAttempts,
  });

  // ========================================================================
  // ALERTS QUERY
  // ========================================================================

  const {
    data: alertsData,
    isLoading: isAlertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn: async (): Promise<SystemAlert[]> => {
      const response = await racineOrchestrationAPI.getSystemAlerts({
        groups: Object.values(RacineGroupType),
        limit: 100,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch alerts');
      }

      return response.data;
    },
    staleTime: 15000, // 15 seconds
    cacheTime,
    refetchInterval: enableRealTimeState ? false : pollInterval / 2, // More frequent for alerts
    retry: retryAttempts,
  });

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const systemStatus: SystemHealthSummary | null = useMemo(() => {
    if (!systemHealth || !systemStatusData || !alertsData) return null;

    const activeAlerts = alertsData.filter(alert => !alert.is_acknowledged);
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === Priority.CRITICAL);
    const warningAlerts = activeAlerts.filter(alert => alert.severity === Priority.HIGH);

    const healthyGroups = Object.values(systemHealth.group_status).filter(
      status => status === RacineSystemStatus.HEALTHY
    ).length;

    // Determine overall status
    let overallStatus = RacineSystemStatus.HEALTHY;
    if (criticalAlerts.length > 0) {
      overallStatus = RacineSystemStatus.CRITICAL;
    } else if (warningAlerts.length > 0 || healthyGroups < Object.keys(systemHealth.group_status).length) {
      overallStatus = RacineSystemStatus.DEGRADED;
    }

    return {
      overall_status: overallStatus,
      overall_health: systemHealth.overall_health,
      group_status: systemHealth.group_status,
      active_alerts: activeAlerts,
      critical_alerts_count: criticalAlerts.length,
      warning_alerts_count: warningAlerts.length,
      healthy_groups_count: healthyGroups,
      total_groups: Object.keys(systemHealth.group_status).length,
      last_updated: new Date().toISOString(),
    };
  }, [systemHealth, systemStatusData, alertsData]);

  const isHealthy = useMemo(() => {
    return systemStatus?.overall_status === RacineSystemStatus.HEALTHY;
  }, [systemStatus]);

  const criticalAlerts = useMemo(() => {
    return alertsData?.filter(alert => 
      alert.severity === Priority.CRITICAL && !alert.is_acknowledged
    ) || [];
  }, [alertsData]);

  const unacknowledgedAlerts = useMemo(() => {
    return alertsData?.filter(alert => !alert.is_acknowledged) || [];
  }, [alertsData]);

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async ({ alertId, acknowledgment }: { 
      alertId: string; 
      acknowledgment: { acknowledged_by: string; acknowledgment_note?: string; action_taken?: string; }
    }) => {
      const response = await racineOrchestrationAPI.acknowledgeAlert(alertId, acknowledgment);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to acknowledge alert');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update alerts cache
      queryClient.setQueryData<SystemAlert[]>(QUERY_KEYS.alerts, (oldAlerts) => {
        if (!oldAlerts) return oldAlerts;
        return oldAlerts.map(alert => 
          alert.alert_id === variables.alertId 
            ? { ...alert, is_acknowledged: true }
            : alert
        );
      });

      toast.success('Alert acknowledged successfully');
    },
    onError: (error) => {
      toast.error(`Failed to acknowledge alert: ${error.message}`);
    },
  });

  // ========================================================================
  // WEBSOCKET INTEGRATION
  // ========================================================================

  const initializeWebSocket = useCallback(async () => {
    if (!enableRealTimeState) return;

    try {
      setConnectionStatus('connecting');
      
      // Get user ID (this would come from auth context in real app)
      const userId = 'current-user-id'; // TODO: Get from auth context
      
      wsManagerRef.current = new RacineWebSocketManager(userId);
      
      // Subscribe to system health updates
      const unsubscribeHealth = wsManagerRef.current.subscribe('system_health_update', (data) => {
        queryClient.setQueryData(QUERY_KEYS.systemHealth, data);
      });

      // Subscribe to new alerts
      const unsubscribeAlerts = wsManagerRef.current.subscribe('system_alert', (data) => {
        queryClient.setQueryData<SystemAlert[]>(QUERY_KEYS.alerts, (oldAlerts) => {
          if (!oldAlerts) return [data];
          return [data, ...oldAlerts];
        });
        
        // Show toast for critical alerts
        if (data.severity === Priority.CRITICAL) {
          toast.error(`Critical Alert: ${data.title}`, {
            description: data.description,
            duration: 10000,
          });
        }
      });

      // Subscribe to real-time metrics
      const unsubscribeMetrics = wsManagerRef.current.subscribe('realtime_metrics', (data) => {
        setRealtimeMetrics(prev => {
          const updated = [data, ...prev.slice(0, 99)]; // Keep last 100 metrics
          return updated;
        });
      });

      await wsManagerRef.current.connect();
      
      setIsConnected(true);
      setConnectionStatus('connected');

      // Store unsubscribe functions for cleanup
      return () => {
        unsubscribeHealth();
        unsubscribeAlerts();
        unsubscribeMetrics();
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      
      // Retry connection with exponential backoff
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeWebSocket();
      }, Math.min(5000 * Math.pow(2, Math.random()), 30000));
    }
  }, [enableRealTimeState, queryClient]);

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================

  const refreshSystemHealth = useCallback(async () => {
    try {
      await Promise.all([
        refetchHealth(),
        refetchStatus(),
        refetchAlerts(),
      ]);
      toast.success('System health refreshed');
    } catch (error) {
      toast.error('Failed to refresh system health');
      throw error;
    }
  }, [refetchHealth, refetchStatus, refetchAlerts]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    await acknowledgeAlertMutation.mutateAsync({
      alertId,
      acknowledgment: {
        acknowledged_by: 'current-user', // TODO: Get from auth context
        acknowledgment_note: 'Acknowledged via UI',
      },
    });
  }, [acknowledgeAlertMutation]);

  const dismissAlert = useCallback(async (alertId: string) => {
    // TODO: Implement dismiss alert API
    toast.info('Alert dismissed');
  }, []);

  const triggerHealthCheck = useCallback(async () => {
    try {
      // TODO: Implement trigger health check API
      await refreshSystemHealth();
      toast.success('Health check completed');
    } catch (error) {
      toast.error('Health check failed');
      throw error;
    }
  }, [refreshSystemHealth]);

  const enableRealTime = useCallback(() => {
    setEnableRealTimeState(true);
  }, []);

  const disableRealTime = useCallback(() => {
    setEnableRealTimeState(false);
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Initialize WebSocket connection
  useEffect(() => {
    if (enableRealTimeState) {
      const cleanup = initializeWebSocket();
      return () => {
        if (cleanup instanceof Promise) {
          cleanup.then(fn => fn?.());
        }
      };
    }
  }, [initializeWebSocket, enableRealTimeState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================

  const isLoading = isHealthLoading || isStatusLoading || isPerformanceLoading || isAlertsLoading;
  const error = healthError || statusError || performanceError || alertsError;
  const lastUpdated = systemHealth ? new Date() : null;

  return {
    // System Health
    systemHealth: systemHealth || null,
    systemStatus,
    isHealthy,
    
    // Metrics
    performanceMetrics: performanceData || null,
    realtimeMetrics,
    
    // Alerts
    alerts: alertsData || [],
    criticalAlerts,
    unacknowledgedAlerts,
    
    // State
    isLoading,
    isError: !!error,
    error: error as Error | null,
    lastUpdated,
    
    // Actions
    refreshSystemHealth,
    acknowledgeAlert,
    dismissAlert,
    triggerHealthCheck,
    
    // Real-time
    isConnected,
    connectionStatus,
    enableRealTime,
    disableRealTime,
  };
}

export default useRacineOrchestration;