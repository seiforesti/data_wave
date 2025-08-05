/**
 * Racine Dashboard Utilities
 * ==========================
 * 
 * Advanced dashboard utility functions for the Racine Main Manager system
 * that provide intelligent dashboard management, widget orchestration, and
 * real-time analytics across all 7 data governance groups.
 * 
 * Features:
 * - Dynamic dashboard composition
 * - Cross-group KPI aggregation
 * - Real-time data visualization
 * - Predictive analytics integration
 * - Custom widget development
 * - Dashboard personalization
 * - Performance optimization
 * - Interactive drill-down analytics
 */

import {
  DashboardConfiguration,
  DashboardWidget,
  DashboardLayout,
  KPIMetric,
  AlertConfiguration,
  AnalyticsFilter,
  UUID,
  ISODateString
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface DashboardMetrics {
  totalWidgets: number;
  activeWidgets: number;
  totalKPIs: number;
  alertsTriggered: number;
  averageLoadTime: number;
  userEngagement: number;
  dataFreshness: number;
  performanceScore: number;
}

export interface WidgetConfiguration {
  id: string;
  type: string;
  title: string;
  description: string;
  dataSource: string;
  query: string;
  visualization: VisualizationConfig;
  filters: AnalyticsFilter[];
  refreshInterval: number;
  size: { width: number; height: number };
  position: { x: number; y: number };
  dependencies: string[];
  permissions: string[];
  settings: Record<string, any>;
}

export interface VisualizationConfig {
  type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'heatmap' | 'treemap';
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'bubble';
  colors: string[];
  axes: { x: string; y: string; z?: string };
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  groupBy: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' };
  limit: number;
  animations: boolean;
  interactive: boolean;
}

export interface KPICalculation {
  id: string;
  name: string;
  formula: string;
  inputs: string[];
  target: number;
  threshold: { warning: number; critical: number };
  trend: 'up' | 'down' | 'stable';
  variance: number;
  historicalData: { date: string; value: number }[];
}

export interface DashboardTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: string;
  shadows: Record<string, string>;
}

export interface DrillDownConfig {
  enabled: boolean;
  levels: DrillDownLevel[];
  navigation: 'modal' | 'sidebar' | 'new_tab';
  breadcrumbs: boolean;
  filters: boolean;
}

export interface DrillDownLevel {
  id: string;
  name: string;
  dimension: string;
  aggregation: string;
  visualization: VisualizationConfig;
  filters: AnalyticsFilter[];
}

export interface DashboardInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  relatedWidgets: string[];
  metadata: Record<string, any>;
  createdAt: ISODateString;
}

export interface DashboardExport {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png';
  options: {
    includeCharts: boolean;
    includeData: boolean;
    includeInsights: boolean;
    dateRange: { start: string; end: string };
    filters: AnalyticsFilter[];
    template?: string;
  };
}

// =============================================================================
// DASHBOARD COMPOSITION UTILITIES
// =============================================================================

/**
 * Create a new dashboard configuration
 */
export const createDashboard = (
  name: string,
  type: string,
  owner: string,
  groups: string[],
  settings: Partial<DashboardConfiguration> = {}
): DashboardConfiguration => {
  return {
    id: generateUUID(),
    name,
    type,
    description: settings.description || `Dashboard for ${groups.join(', ')}`,
    owner,
    groups,
    widgets: [],
    layout: {
      type: 'grid',
      columns: 12,
      rows: 'auto',
      gap: 16,
      responsive: true,
      breakpoints: {
        xs: 480,
        sm: 768,
        md: 1024,
        lg: 1280,
        xl: 1920
      }
    },
    filters: [],
    kpis: [],
    alerts: [],
    theme: settings.theme || 'default',
    settings: {
      autoRefresh: true,
      refreshInterval: 300, // 5 minutes
      showFilters: true,
      showExport: true,
      allowDrillDown: true,
      enableInsights: true,
      ...settings.settings
    },
    permissions: settings.permissions || {
      view: ['authenticated'],
      edit: [owner],
      share: [owner],
      export: ['authenticated']
    },
    analytics: {
      views: 0,
      lastViewed: new Date().toISOString(),
      averageViewTime: 0,
      interactions: 0,
      exports: 0,
      shares: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRefresh: new Date().toISOString()
  };
};

/**
 * Add widget to dashboard
 */
export const addWidgetToDashboard = (
  dashboard: DashboardConfiguration,
  widgetConfig: Omit<WidgetConfiguration, 'id'>,
  position?: { x: number; y: number }
): DashboardConfiguration => {
  const widget: DashboardWidget = {
    id: generateUUID(),
    type: widgetConfig.type,
    title: widgetConfig.title,
    description: widgetConfig.description,
    dataSource: widgetConfig.dataSource,
    query: widgetConfig.query,
    visualization: widgetConfig.visualization,
    filters: widgetConfig.filters,
    refreshInterval: widgetConfig.refreshInterval,
    size: widgetConfig.size,
    position: position || findOptimalPosition(dashboard, widgetConfig.size),
    dependencies: widgetConfig.dependencies,
    permissions: widgetConfig.permissions,
    settings: widgetConfig.settings,
    data: null,
    loading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  dashboard.widgets.push(widget);
  dashboard.updatedAt = new Date().toISOString();

  return dashboard;
};

/**
 * Create cross-group KPI widget
 */
export const createCrossGroupKPI = (
  name: string,
  groups: string[],
  metrics: string[],
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): WidgetConfiguration => {
  return {
    id: generateUUID(),
    type: 'cross-group-kpi',
    title: name,
    description: `Cross-group KPI aggregating ${metrics.join(', ')} across ${groups.join(', ')}`,
    dataSource: 'cross-group-aggregator',
    query: buildCrossGroupQuery(groups, metrics, aggregation),
    visualization: {
      type: 'metric',
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      axes: { x: 'group', y: 'value' },
      aggregation,
      groupBy: groups,
      sortBy: { field: 'value', direction: 'desc' },
      limit: 10,
      animations: true,
      interactive: true
    },
    filters: [],
    refreshInterval: 300,
    size: { width: 4, height: 2 },
    position: { x: 0, y: 0 },
    dependencies: groups.map(group => `${group}-service`),
    permissions: ['view', 'export'],
    settings: {
      showTrend: true,
      showComparison: true,
      alertThreshold: 0.1,
      precision: 2
    }
  };
};

/**
 * Create predictive analytics widget
 */
export const createPredictiveWidget = (
  name: string,
  dataSource: string,
  targetMetric: string,
  predictionHorizon: number = 30
): WidgetConfiguration => {
  return {
    id: generateUUID(),
    type: 'predictive-analytics',
    title: name,
    description: `Predictive analysis for ${targetMetric} over ${predictionHorizon} days`,
    dataSource,
    query: buildPredictiveQuery(targetMetric, predictionHorizon),
    visualization: {
      type: 'chart',
      chartType: 'line',
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      axes: { x: 'date', y: 'value' },
      aggregation: 'avg',
      groupBy: ['prediction_type'],
      sortBy: { field: 'date', direction: 'asc' },
      limit: 1000,
      animations: true,
      interactive: true
    },
    filters: [
      {
        field: 'date',
        operator: 'gte',
        value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'date'
      }
    ],
    refreshInterval: 3600, // 1 hour
    size: { width: 8, height: 4 },
    position: { x: 0, y: 0 },
    dependencies: ['ml-service', 'analytics-service'],
    permissions: ['view', 'export'],
    settings: {
      showConfidenceInterval: true,
      showHistorical: true,
      modelType: 'auto',
      seasonality: 'auto'
    }
  };
};

// =============================================================================
// WIDGET ORCHESTRATION UTILITIES
// =============================================================================

/**
 * Calculate widget dependencies and execution order
 */
export const calculateWidgetDependencies = (
  widgets: DashboardWidget[]
): { executionOrder: string[]; dependencyGraph: Record<string, string[]> } => {
  const dependencyGraph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize graph
  widgets.forEach(widget => {
    dependencyGraph[widget.id] = widget.dependencies || [];
    inDegree[widget.id] = 0;
  });

  // Calculate in-degrees
  widgets.forEach(widget => {
    (widget.dependencies || []).forEach(dep => {
      if (inDegree[dep] !== undefined) {
        inDegree[widget.id]++;
      }
    });
  });

  // Topological sort
  const executionOrder: string[] = [];
  const queue: string[] = [];

  // Find widgets with no dependencies
  Object.keys(inDegree).forEach(widgetId => {
    if (inDegree[widgetId] === 0) {
      queue.push(widgetId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    executionOrder.push(current);

    // Update in-degrees of dependent widgets
    widgets.forEach(widget => {
      if ((widget.dependencies || []).includes(current)) {
        inDegree[widget.id]--;
        if (inDegree[widget.id] === 0) {
          queue.push(widget.id);
        }
      }
    });
  }

  return { executionOrder, dependencyGraph };
};

/**
 * Optimize widget refresh intervals based on data freshness requirements
 */
export const optimizeRefreshIntervals = (
  widgets: DashboardWidget[],
  constraints: {
    maxConcurrentRequests: number;
    priorityWeights: Record<string, number>;
    dataFreshnessRequirements: Record<string, number>;
  }
): Record<string, number> => {
  const optimizedIntervals: Record<string, number> = {};

  widgets.forEach(widget => {
    const priority = constraints.priorityWeights[widget.type] || 1;
    const freshnessReq = constraints.dataFreshnessRequirements[widget.dataSource] || 300;
    const currentInterval = widget.refreshInterval;

    // Calculate optimal interval based on priority and freshness requirements
    let optimalInterval = Math.max(
      freshnessReq,
      Math.floor(currentInterval * (2 - priority))
    );

    // Adjust for system load
    const loadFactor = widgets.length / constraints.maxConcurrentRequests;
    if (loadFactor > 1) {
      optimalInterval *= Math.ceil(loadFactor);
    }

    optimizedIntervals[widget.id] = optimalInterval;
  });

  return optimizedIntervals;
};

/**
 * Generate widget layout suggestions
 */
export const generateLayoutSuggestions = (
  widgets: DashboardWidget[],
  screenSize: { width: number; height: number },
  layoutType: 'grid' | 'masonry' | 'flow' = 'grid'
): DashboardLayout => {
  const suggestions: DashboardLayout = {
    type: layoutType,
    columns: 12,
    rows: 'auto',
    gap: 16,
    responsive: true,
    breakpoints: {
      xs: 480,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1920
    }
  };

  // Sort widgets by priority and size
  const sortedWidgets = [...widgets].sort((a, b) => {
    const priorityA = getWidgetPriority(a);
    const priorityB = getWidgetPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // Larger widgets first
    return (b.size.width * b.size.height) - (a.size.width * a.size.height);
  });

  // Calculate optimal positions
  const positions = calculateOptimalPositions(sortedWidgets, suggestions.columns);
  
  // Update widget positions
  sortedWidgets.forEach((widget, index) => {
    widget.position = positions[index];
  });

  return suggestions;
};

// =============================================================================
// KPI CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate cross-group KPI
 */
export const calculateCrossGroupKPI = (
  kpiConfig: KPICalculation,
  groupData: Record<string, any[]>
): { value: number; trend: 'up' | 'down' | 'stable'; variance: number } => {
  const values: number[] = [];
  
  // Extract values from all groups
  Object.entries(groupData).forEach(([group, data]) => {
    const groupValues = extractValuesFromData(data, kpiConfig.inputs);
    values.push(...groupValues);
  });

  // Calculate KPI value using formula
  const currentValue = evaluateFormula(kpiConfig.formula, values);
  
  // Calculate trend
  const historicalValues = kpiConfig.historicalData.map(d => d.value);
  const trend = calculateTrend(currentValue, historicalValues);
  
  // Calculate variance
  const variance = calculateVariance(currentValue, historicalValues);

  return {
    value: currentValue,
    trend,
    variance
  };
};

/**
 * Generate KPI recommendations
 */
export const generateKPIRecommendations = (
  kpis: KPICalculation[],
  currentValues: Record<string, number>
): DashboardInsight[] => {
  const recommendations: DashboardInsight[] = [];

  kpis.forEach(kpi => {
    const currentValue = currentValues[kpi.id];
    const target = kpi.target;
    const threshold = kpi.threshold;

    // Performance vs target
    if (currentValue < target * 0.8) {
      recommendations.push({
        id: generateUUID(),
        type: 'recommendation',
        title: `Improve ${kpi.name}`,
        description: `${kpi.name} is ${Math.round((1 - currentValue/target) * 100)}% below target`,
        confidence: 0.8,
        impact: currentValue < target * 0.5 ? 'critical' : 'high',
        actionable: true,
        relatedWidgets: [kpi.id],
        metadata: {
          currentValue,
          target,
          gap: target - currentValue
        },
        createdAt: new Date().toISOString()
      });
    }

    // Threshold violations
    if (currentValue < threshold.critical) {
      recommendations.push({
        id: generateUUID(),
        type: 'anomaly',
        title: `Critical Alert: ${kpi.name}`,
        description: `${kpi.name} has fallen below critical threshold`,
        confidence: 0.95,
        impact: 'critical',
        actionable: true,
        relatedWidgets: [kpi.id],
        metadata: {
          currentValue,
          threshold: threshold.critical,
          severity: 'critical'
        },
        createdAt: new Date().toISOString()
      });
    } else if (currentValue < threshold.warning) {
      recommendations.push({
        id: generateUUID(),
        type: 'anomaly',
        title: `Warning: ${kpi.name}`,
        description: `${kpi.name} is approaching critical levels`,
        confidence: 0.85,
        impact: 'medium',
        actionable: true,
        relatedWidgets: [kpi.id],
        metadata: {
          currentValue,
          threshold: threshold.warning,
          severity: 'warning'
        },
        createdAt: new Date().toISOString()
      });
    }
  });

  return recommendations.sort((a, b) => {
    const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
};

// =============================================================================
// ANALYTICS AND INSIGHTS UTILITIES
// =============================================================================

/**
 * Detect anomalies in dashboard data
 */
export const detectDataAnomalies = (
  widgets: DashboardWidget[],
  historicalData: Record<string, any[]>,
  sensitivity: number = 0.8
): DashboardInsight[] => {
  const anomalies: DashboardInsight[] = [];

  widgets.forEach(widget => {
    const widgetData = widget.data;
    const historical = historicalData[widget.id] || [];

    if (!widgetData || historical.length < 10) {
      return; // Need sufficient historical data
    }

    // Statistical anomaly detection
    const currentValues = extractNumericValues(widgetData);
    const historicalValues = historical.flatMap(extractNumericValues);

    const anomalyScore = detectStatisticalAnomalies(currentValues, historicalValues, sensitivity);

    if (anomalyScore > 0.7) {
      anomalies.push({
        id: generateUUID(),
        type: 'anomaly',
        title: `Data Anomaly in ${widget.title}`,
        description: `Unusual patterns detected in ${widget.title} data`,
        confidence: anomalyScore,
        impact: anomalyScore > 0.9 ? 'critical' : anomalyScore > 0.8 ? 'high' : 'medium',
        actionable: true,
        relatedWidgets: [widget.id],
        metadata: {
          anomalyScore,
          affectedMetrics: currentValues.length,
          detectionMethod: 'statistical'
        },
        createdAt: new Date().toISOString()
      });
    }
  });

  return anomalies;
};

/**
 * Generate predictive insights
 */
export const generatePredictiveInsights = (
  widgets: DashboardWidget[],
  forecastHorizon: number = 30
): DashboardInsight[] => {
  const insights: DashboardInsight[] = [];

  widgets.forEach(widget => {
    if (widget.type === 'predictive-analytics' && widget.data) {
      const predictions = extractPredictions(widget.data);
      
      predictions.forEach(prediction => {
        if (prediction.confidence > 0.7) {
          insights.push({
            id: generateUUID(),
            type: 'prediction',
            title: `Forecast: ${widget.title}`,
            description: prediction.description,
            confidence: prediction.confidence,
            impact: prediction.impact,
            actionable: true,
            relatedWidgets: [widget.id],
            metadata: {
              forecastValue: prediction.value,
              forecastDate: prediction.date,
              confidence: prediction.confidence,
              model: prediction.model
            },
            createdAt: new Date().toISOString()
          });
        }
      });
    }
  });

  return insights;
};

/**
 * Calculate dashboard performance metrics
 */
export const calculateDashboardMetrics = (
  dashboard: DashboardConfiguration,
  performanceData: {
    loadTimes: number[];
    interactions: number;
    errors: number;
    refreshes: number;
  }
): DashboardMetrics => {
  const totalWidgets = dashboard.widgets.length;
  const activeWidgets = dashboard.widgets.filter(w => !w.error && w.data).length;
  const totalKPIs = dashboard.kpis.length;
  const alertsTriggered = dashboard.alerts.filter(a => a.status === 'triggered').length;
  
  const averageLoadTime = performanceData.loadTimes.length > 0
    ? performanceData.loadTimes.reduce((sum, time) => sum + time, 0) / performanceData.loadTimes.length
    : 0;

  const userEngagement = calculateEngagementScore(
    performanceData.interactions,
    dashboard.analytics.views,
    dashboard.analytics.averageViewTime
  );

  const dataFreshness = calculateDataFreshness(dashboard.widgets);
  const performanceScore = calculatePerformanceScore({
    loadTime: averageLoadTime,
    errorRate: performanceData.errors / performanceData.refreshes,
    activeWidgetRatio: activeWidgets / totalWidgets,
    engagement: userEngagement
  });

  return {
    totalWidgets,
    activeWidgets,
    totalKPIs,
    alertsTriggered,
    averageLoadTime,
    userEngagement,
    dataFreshness,
    performanceScore
  };
};

// =============================================================================
// EXPORT AND SHARING UTILITIES
// =============================================================================

/**
 * Export dashboard data
 */
export const exportDashboard = (
  dashboard: DashboardConfiguration,
  exportConfig: DashboardExport
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      let exportData: any;

      switch (exportConfig.format) {
        case 'json':
          exportData = exportToJSON(dashboard, exportConfig.options);
          resolve(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }));
          break;

        case 'csv':
          exportData = exportToCSV(dashboard, exportConfig.options);
          resolve(new Blob([exportData], { type: 'text/csv' }));
          break;

        case 'excel':
          exportData = exportToExcel(dashboard, exportConfig.options);
          resolve(exportData);
          break;

        case 'pdf':
          exportData = exportToPDF(dashboard, exportConfig.options);
          resolve(exportData);
          break;

        case 'png':
          exportData = exportToPNG(dashboard, exportConfig.options);
          resolve(exportData);
          break;

        default:
          reject(new Error(`Unsupported export format: ${exportConfig.format}`));
      }
    } catch (error) {
      reject(error);
    }
  });
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate UUID
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Find optimal position for new widget
 */
const findOptimalPosition = (
  dashboard: DashboardConfiguration,
  size: { width: number; height: number }
): { x: number; y: number } => {
  const columns = dashboard.layout.columns;
  const occupiedPositions = new Set<string>();

  // Mark occupied positions
  dashboard.widgets.forEach(widget => {
    for (let x = widget.position.x; x < widget.position.x + widget.size.width; x++) {
      for (let y = widget.position.y; y < widget.position.y + widget.size.height; y++) {
        occupiedPositions.add(`${x},${y}`);
      }
    }
  });

  // Find first available position
  for (let y = 0; y < 100; y++) { // Reasonable upper limit
    for (let x = 0; x <= columns - size.width; x++) {
      let canPlace = true;
      
      // Check if position is available
      for (let dx = 0; dx < size.width && canPlace; dx++) {
        for (let dy = 0; dy < size.height && canPlace; dy++) {
          if (occupiedPositions.has(`${x + dx},${y + dy}`)) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: 0 }; // Fallback
};

/**
 * Build cross-group query
 */
const buildCrossGroupQuery = (
  groups: string[],
  metrics: string[],
  aggregation: string
): string => {
  const groupQueries = groups.map(group => 
    `SELECT '${group}' as group_name, ${aggregation}(${metrics.join(', ')}) as value FROM ${group}_metrics`
  );

  return `
    WITH cross_group_data AS (
      ${groupQueries.join(' UNION ALL ')}
    )
    SELECT 
      group_name,
      value,
      value / SUM(value) OVER () * 100 as percentage
    FROM cross_group_data
    ORDER BY value DESC
  `;
};

/**
 * Build predictive query
 */
const buildPredictiveQuery = (targetMetric: string, horizon: number): string => {
  return `
    SELECT 
      date,
      actual_value,
      predicted_value,
      confidence_lower,
      confidence_upper,
      prediction_type
    FROM ml_predictions 
    WHERE 
      metric = '${targetMetric}' 
      AND date >= CURRENT_DATE - INTERVAL '90 days'
      AND date <= CURRENT_DATE + INTERVAL '${horizon} days'
    ORDER BY date
  `;
};

/**
 * Get widget priority
 */
const getWidgetPriority = (widget: DashboardWidget): number => {
  const priorityMap: Record<string, number> = {
    'cross-group-kpi': 10,
    'predictive-analytics': 9,
    'alert-summary': 8,
    'performance-metric': 7,
    'trend-chart': 6,
    'data-table': 5
  };

  return priorityMap[widget.type] || 1;
};

/**
 * Calculate optimal positions for widgets
 */
const calculateOptimalPositions = (
  widgets: DashboardWidget[],
  columns: number
): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  const occupiedRows: boolean[][] = [];

  widgets.forEach(widget => {
    const position = findNextAvailablePosition(occupiedRows, widget.size, columns);
    positions.push(position);
    
    // Mark positions as occupied
    markPositionOccupied(occupiedRows, position, widget.size);
  });

  return positions;
};

/**
 * Find next available position
 */
const findNextAvailablePosition = (
  occupiedRows: boolean[][],
  size: { width: number; height: number },
  columns: number
): { x: number; y: number } => {
  for (let y = 0; y < 100; y++) {
    if (!occupiedRows[y]) {
      occupiedRows[y] = new Array(columns).fill(false);
    }

    for (let x = 0; x <= columns - size.width; x++) {
      if (canPlaceWidget(occupiedRows, { x, y }, size)) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: 0 }; // Fallback
};

/**
 * Check if widget can be placed at position
 */
const canPlaceWidget = (
  occupiedRows: boolean[][],
  position: { x: number; y: number },
  size: { width: number; height: number }
): boolean => {
  for (let dy = 0; dy < size.height; dy++) {
    const row = position.y + dy;
    if (!occupiedRows[row]) {
      occupiedRows[row] = new Array(12).fill(false);
    }

    for (let dx = 0; dx < size.width; dx++) {
      const col = position.x + dx;
      if (occupiedRows[row][col]) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Mark position as occupied
 */
const markPositionOccupied = (
  occupiedRows: boolean[][],
  position: { x: number; y: number },
  size: { width: number; height: number }
): void => {
  for (let dy = 0; dy < size.height; dy++) {
    const row = position.y + dy;
    if (!occupiedRows[row]) {
      occupiedRows[row] = new Array(12).fill(false);
    }

    for (let dx = 0; dx < size.width; dx++) {
      const col = position.x + dx;
      occupiedRows[row][col] = true;
    }
  }
};

/**
 * Extract values from data
 */
const extractValuesFromData = (data: any[], inputs: string[]): number[] => {
  return data.flatMap(item => 
    inputs.map(input => parseFloat(item[input]) || 0)
  ).filter(value => !isNaN(value));
};

/**
 * Evaluate formula
 */
const evaluateFormula = (formula: string, values: number[]): number => {
  // Simple formula evaluation - in production, use a proper expression parser
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Replace placeholders in formula
  const evaluatedFormula = formula
    .replace(/SUM/g, sum.toString())
    .replace(/AVG/g, avg.toString())
    .replace(/COUNT/g, count.toString())
    .replace(/MIN/g, min.toString())
    .replace(/MAX/g, max.toString());

  try {
    return eval(evaluatedFormula);
  } catch {
    return 0;
  }
};

/**
 * Calculate trend
 */
const calculateTrend = (currentValue: number, historicalValues: number[]): 'up' | 'down' | 'stable' => {
  if (historicalValues.length < 2) return 'stable';

  const recentAvg = historicalValues.slice(-5).reduce((sum, val) => sum + val, 0) / Math.min(5, historicalValues.length);
  const change = (currentValue - recentAvg) / recentAvg;

  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'stable';
};

/**
 * Calculate variance
 */
const calculateVariance = (currentValue: number, historicalValues: number[]): number => {
  if (historicalValues.length === 0) return 0;

  const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  return Math.abs(currentValue - mean) / mean;
};

/**
 * Extract numeric values from data
 */
const extractNumericValues = (data: any): number[] => {
  if (Array.isArray(data)) {
    return data.flatMap(extractNumericValues);
  }

  if (typeof data === 'object' && data !== null) {
    return Object.values(data).flatMap(extractNumericValues);
  }

  const num = parseFloat(data);
  return isNaN(num) ? [] : [num];
};

/**
 * Detect statistical anomalies
 */
const detectStatisticalAnomalies = (
  currentValues: number[],
  historicalValues: number[],
  sensitivity: number
): number => {
  if (historicalValues.length < 10) return 0;

  const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  const stdDev = Math.sqrt(
    historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length
  );

  let anomalyScore = 0;
  currentValues.forEach(value => {
    const zScore = Math.abs(value - mean) / stdDev;
    if (zScore > 2 * sensitivity) {
      anomalyScore = Math.max(anomalyScore, Math.min(1, zScore / 3));
    }
  });

  return anomalyScore;
};

/**
 * Extract predictions from data
 */
const extractPredictions = (data: any): any[] => {
  if (!Array.isArray(data)) return [];

  return data
    .filter(item => item.prediction_type === 'forecast')
    .map(item => ({
      value: item.predicted_value,
      date: item.date,
      confidence: item.confidence || 0.5,
      description: `Predicted value: ${item.predicted_value}`,
      impact: item.predicted_value > item.actual_value ? 'high' : 'medium',
      model: item.model || 'unknown'
    }));
};

/**
 * Calculate engagement score
 */
const calculateEngagementScore = (
  interactions: number,
  views: number,
  averageViewTime: number
): number => {
  if (views === 0) return 0;

  const interactionRate = interactions / views;
  const timeScore = Math.min(1, averageViewTime / 300); // 5 minutes as ideal
  
  return Math.round((interactionRate * 0.6 + timeScore * 0.4) * 100);
};

/**
 * Calculate data freshness
 */
const calculateDataFreshness = (widgets: DashboardWidget[]): number => {
  if (widgets.length === 0) return 100;

  const now = Date.now();
  const freshnessScores = widgets.map(widget => {
    const lastUpdate = new Date(widget.lastUpdated).getTime();
    const age = now - lastUpdate;
    const maxAge = widget.refreshInterval * 1000 * 2; // 2x refresh interval
    
    return Math.max(0, 1 - age / maxAge);
  });

  return Math.round(
    freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length * 100
  );
};

/**
 * Calculate performance score
 */
const calculatePerformanceScore = (metrics: {
  loadTime: number;
  errorRate: number;
  activeWidgetRatio: number;
  engagement: number;
}): number => {
  const loadTimeScore = Math.max(0, 1 - metrics.loadTime / 5000); // 5s as max acceptable
  const errorScore = Math.max(0, 1 - metrics.errorRate);
  const reliabilityScore = metrics.activeWidgetRatio;
  const engagementScore = metrics.engagement / 100;

  return Math.round(
    (loadTimeScore * 0.3 + errorScore * 0.3 + reliabilityScore * 0.2 + engagementScore * 0.2) * 100
  );
};

/**
 * Export to JSON
 */
const exportToJSON = (dashboard: DashboardConfiguration, options: any): any => {
  const exportData: any = {
    dashboard: {
      id: dashboard.id,
      name: dashboard.name,
      type: dashboard.type,
      description: dashboard.description,
      createdAt: dashboard.createdAt,
      updatedAt: dashboard.updatedAt
    }
  };

  if (options.includeData) {
    exportData.widgets = dashboard.widgets.map(widget => ({
      id: widget.id,
      title: widget.title,
      type: widget.type,
      data: widget.data
    }));
  }

  if (options.includeInsights) {
    // Add insights if available
    exportData.insights = []; // Would be populated from actual insights
  }

  return exportData;
};

/**
 * Export to CSV
 */
const exportToCSV = (dashboard: DashboardConfiguration, options: any): string => {
  let csv = 'Widget,Type,Title,Last Updated,Status\n';
  
  dashboard.widgets.forEach(widget => {
    csv += `${widget.id},${widget.type},${widget.title},${widget.lastUpdated},${widget.error ? 'Error' : 'OK'}\n`;
  });

  return csv;
};

/**
 * Export to Excel (placeholder)
 */
const exportToExcel = (dashboard: DashboardConfiguration, options: any): Blob => {
  // In a real implementation, use a library like xlsx
  const data = exportToJSON(dashboard, options);
  return new Blob([JSON.stringify(data)], { type: 'application/vnd.ms-excel' });
};

/**
 * Export to PDF (placeholder)
 */
const exportToPDF = (dashboard: DashboardConfiguration, options: any): Blob => {
  // In a real implementation, use a library like jsPDF
  const data = exportToJSON(dashboard, options);
  return new Blob([JSON.stringify(data)], { type: 'application/pdf' });
};

/**
 * Export to PNG (placeholder)
 */
const exportToPNG = (dashboard: DashboardConfiguration, options: any): Blob => {
  // In a real implementation, use canvas or similar
  return new Blob([''], { type: 'image/png' });
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  createDashboard,
  addWidgetToDashboard,
  createCrossGroupKPI,
  createPredictiveWidget,
  calculateWidgetDependencies,
  optimizeRefreshIntervals,
  generateLayoutSuggestions,
  calculateCrossGroupKPI,
  generateKPIRecommendations,
  detectDataAnomalies,
  generatePredictiveInsights,
  calculateDashboardMetrics,
  exportDashboard
};