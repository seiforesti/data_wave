/**
 * usePerformanceMonitoring Hook
 * ============================
 * 
 * Shared hook for performance monitoring across the platform.
 * Provides comprehensive performance tracking and optimization insights.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  bundleSize: number;
  cacheHitRatio: number;
  errorRate: number;
  userInteractionLatency: number;
}

export interface PerformanceThresholds {
  renderTime: { good: number; fair: number; poor: number };
  memoryUsage: { good: number; fair: number; poor: number };
  networkLatency: { good: number; fair: number; poor: number };
  errorRate: { good: number; fair: number; poor: number };
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  alerts: PerformanceAlert[];
  trends: PerformanceTrend[];
  lastCheck: string | null;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: keyof PerformanceMetrics;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface PerformanceTrend {
  metric: keyof PerformanceMetrics;
  values: { timestamp: string; value: number }[];
  direction: 'improving' | 'degrading' | 'stable';
}

// ============================================================================
// DEFAULT THRESHOLDS
// ============================================================================

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTime: { good: 100, fair: 300, poor: 1000 },
  memoryUsage: { good: 50, fair: 100, poor: 200 },
  networkLatency: { good: 100, fair: 500, poor: 2000 },
  errorRate: { good: 0.1, fair: 1, poor: 5 }
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const usePerformanceMonitoring = (
  componentName?: string,
  thresholds: Partial<PerformanceThresholds> = {}
) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<PerformanceState>({
    metrics: {
      renderTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      bundleSize: 0,
      cacheHitRatio: 100,
      errorRate: 0,
      userInteractionLatency: 0
    },
    isMonitoring: false,
    alerts: [],
    trends: [],
    lastCheck: null
  });

  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const measurementStartRef = useRef<number>(0);
  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // ============================================================================
  // PERFORMANCE MEASUREMENT
  // ============================================================================

  const startMeasurement = useCallback((measurementName: string) => {
    measurementStartRef.current = performance.now();
    performance.mark(`${measurementName}-start`);
  }, []);

  const endMeasurement = useCallback((measurementName: string) => {
    const endTime = performance.now();
    performance.mark(`${measurementName}-end`);
    
    try {
      performance.measure(measurementName, `${measurementName}-start`, `${measurementName}-end`);
      const measure = performance.getEntriesByName(measurementName)[0];
      
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          renderTime: measure.duration
        },
        lastCheck: new Date().toISOString()
      }));

      return measure.duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return endTime - measurementStartRef.current;
    }
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usageInMB = memInfo.usedJSHeapSize / 1048576; // Convert to MB
      
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          memoryUsage: usageInMB
        }
      }));

      return usageInMB;
    }
    return 0;
  }, []);

  const measureNetworkLatency = useCallback(async (endpoint?: string) => {
    const testEndpoint = endpoint || '/api/health';
    const startTime = performance.now();
    
    try {
      await fetch(testEndpoint, { method: 'HEAD' });
      const latency = performance.now() - startTime;
      
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          networkLatency: latency
        }
      }));

      return latency;
    } catch (error) {
      return -1; // Indicate error
    }
  }, []);

  // ============================================================================
  // MONITORING CONTROLS
  // ============================================================================

  const startMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: true }));

    // Set up performance observer
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            setState(prev => ({
              ...prev,
              metrics: {
                ...prev.metrics,
                renderTime: entry.duration
              }
            }));
          }
        });
      });

      performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }

    // Start periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage();
      measureNetworkLatency();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, [measureMemoryUsage, measureNetworkLatency]);

  const stopMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: false }));
    
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }
  }, []);

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  const checkThresholds = useCallback(() => {
    const newAlerts: PerformanceAlert[] = [];

    Object.entries(state.metrics).forEach(([metric, value]) => {
      const threshold = mergedThresholds[metric as keyof PerformanceMetrics];
      if (!threshold) return;

      let alertType: 'warning' | 'error' | 'critical' | null = null;
      
      if (value > threshold.poor) {
        alertType = 'critical';
      } else if (value > threshold.fair) {
        alertType = 'error';
      } else if (value > threshold.good) {
        alertType = 'warning';
      }

      if (alertType) {
        newAlerts.push({
          id: `${metric}-${Date.now()}`,
          type: alertType,
          metric: metric as keyof PerformanceMetrics,
          message: `${metric} is ${alertType}: ${value}`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setState(prev => ({
        ...prev,
        alerts: [...prev.alerts, ...newAlerts]
      }));
    }
  }, [state.metrics, mergedThresholds]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    checkThresholds();
  }, [checkThresholds]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    metrics: state.metrics,
    isMonitoring: state.isMonitoring,
    alerts: state.alerts,
    trends: state.trends,
    lastCheck: state.lastCheck,

    // Controls
    startMonitoring,
    stopMonitoring,

    // Measurements
    startMeasurement,
    endMeasurement,
    measureMemoryUsage,
    measureNetworkLatency,

    // Utilities
    clearAlerts: () => setState(prev => ({ ...prev, alerts: [] })),
    resolveAlert: (alertId: string) => setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    })),

    // Performance Score
    getPerformanceScore: () => {
      const scores = Object.entries(state.metrics).map(([metric, value]) => {
        const threshold = mergedThresholds[metric as keyof PerformanceMetrics];
        if (!threshold) return 100;
        
        if (value <= threshold.good) return 100;
        if (value <= threshold.fair) return 75;
        if (value <= threshold.poor) return 50;
        return 25;
      });
      
      return scores.reduce((acc, score) => acc + score, 0) / scores.length;
    }
  };
};

export default usePerformanceMonitoring;