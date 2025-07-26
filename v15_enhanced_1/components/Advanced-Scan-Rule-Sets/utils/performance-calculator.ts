/**
 * Performance Calculator Utility
 * 
 * Advanced performance analysis and calculation utilities for
 * scan rule execution, optimization, and benchmarking
 */

import type {
  ValidationRule,
  ValidationPerformance,
  ValidationAnalytics,
  ValidationQuality,
  ValidationOptimizationResult
} from '../types/validation.types';

import type {
  ScanRuleSet,
  RulePerformanceBaseline,
  RuleOptimizationJob,
  RuleExecutionHistory
} from '../types/scan-rules.types';

// ============================================================================
// PERFORMANCE INTERFACES
// ============================================================================

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
  latency: number;
  efficiency: number;
  scalability: number;
  reliability: number;
  availability: number;
  responseTime: number;
  errorRate: number;
  successRate: number;
  utilization: number;
  bottlenecks: string[];
  optimizations: string[];
  recommendations: string[];
}

export interface PerformanceAnalysis {
  ruleId: string;
  metrics: PerformanceMetrics;
  baseline: PerformanceBaseline;
  comparison: PerformanceComparison;
  trends: PerformanceTrend[];
  insights: PerformanceInsight[];
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: Date;
}

export interface PerformanceBaseline {
  averageExecutionTime: number;
  averageMemoryUsage: number;
  averageCpuUsage: number;
  averageThroughput: number;
  averageLatency: number;
  averageEfficiency: number;
  historicalData: PerformanceMetrics[];
  percentile95: PerformanceMetrics;
  percentile99: PerformanceMetrics;
  minValues: PerformanceMetrics;
  maxValues: PerformanceMetrics;
}

export interface PerformanceComparison {
  executionTime: { current: number; baseline: number; difference: number; percentage: number };
  memoryUsage: { current: number; baseline: number; difference: number; percentage: number };
  cpuUsage: { current: number; baseline: number; difference: number; percentage: number };
  throughput: { current: number; baseline: number; difference: number; percentage: number };
  latency: { current: number; baseline: number; difference: number; percentage: number };
  efficiency: { current: number; baseline: number; difference: number; percentage: number };
  overall: { current: number; baseline: number; difference: number; percentage: number };
}

export interface PerformanceTrend {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'improving' | 'stable' | 'declining';
  slope: number;
  confidence: number;
  prediction: number;
}

export interface PerformanceInsight {
  id: string;
  type: 'performance' | 'optimization' | 'bottleneck' | 'anomaly' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  confidence: number;
  actionable: boolean;
  recommendation: string;
  timestamp: Date;
}

export interface PerformanceOptimization {
  id: string;
  type: 'algorithm' | 'caching' | 'parallelization' | 'resource' | 'configuration';
  title: string;
  description: string;
  currentValue: number;
  optimizedValue: number;
  improvement: number;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  implementation: string;
  validation: string[];
  roi: number;
  priority: number;
}

// ============================================================================
// PERFORMANCE CALCULATOR CLASS
// ============================================================================

export class AdvancedPerformanceCalculator {
  private config: PerformanceCalculatorConfig;
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private cache: Map<string, PerformanceAnalysis> = new Map();
  private metrics: PerformanceCalculatorMetrics = {
    totalAnalyses: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    averageProcessingTime: 0,
    totalProcessingTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor(config: Partial<PerformanceCalculatorConfig> = {}) {
    this.config = {
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableTrendAnalysis: true,
      enablePredictions: true,
      enableOptimizations: true,
      baselineWindow: 30, // days
      confidenceThreshold: 0.8,
      ...config
    };
  }

  /**
   * Calculate performance metrics for a rule
   */
  async calculatePerformance(
    rule: ValidationRule,
    executionData: RuleExecutionHistory[],
    options: PerformanceCalculationOptions = {}
  ): Promise<PerformanceAnalysis> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(rule, executionData, options);

    // Check cache
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < this.config.cacheTimeout) {
        this.metrics.cacheHits++;
        return cached;
      }
    }

    this.metrics.cacheMisses++;
    this.metrics.totalAnalyses++;

    try {
      // Calculate current metrics
      const currentMetrics = await this.calculateCurrentMetrics(rule, executionData);

      // Get or create baseline
      const baseline = await this.getOrCreateBaseline(rule.id, executionData);

      // Calculate comparison
      const comparison = this.calculateComparison(currentMetrics, baseline);

      // Analyze trends
      const trends = this.config.enableTrendAnalysis 
        ? await this.analyzeTrends(rule.id, executionData)
        : [];

      // Generate insights
      const insights = await this.generateInsights(currentMetrics, baseline, comparison, trends);

      // Calculate overall score
      const score = this.calculateScore(currentMetrics, baseline, comparison);
      const grade = this.calculateGrade(score);

      const result: PerformanceAnalysis = {
        ruleId: rule.id,
        metrics: currentMetrics,
        baseline,
        comparison,
        trends,
        insights,
        score,
        grade,
        timestamp: new Date()
      };

      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
      }

      // Update metrics
      this.updateMetrics(Date.now() - startTime, true);

      return result;

    } catch (error) {
      this.metrics.failedAnalyses++;
      this.updateMetrics(Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Calculate current performance metrics
   */
  private async calculateCurrentMetrics(
    rule: ValidationRule,
    executionData: RuleExecutionHistory[]
  ): Promise<PerformanceMetrics> {
    if (executionData.length === 0) {
      return this.getDefaultMetrics();
    }

    // Calculate averages
    const executionTimes = executionData.map(d => d.executionTime);
    const memoryUsages = executionData.map(d => d.memoryUsage);
    const cpuUsages = executionData.map(d => d.cpuUsage);
    const throughputs = executionData.map(d => d.throughput);
    const latencies = executionData.map(d => d.latency);

    const avgExecutionTime = this.calculateAverage(executionTimes);
    const avgMemoryUsage = this.calculateAverage(memoryUsages);
    const avgCpuUsage = this.calculateAverage(cpuUsages);
    const avgThroughput = this.calculateAverage(throughputs);
    const avgLatency = this.calculateAverage(latencies);

    // Calculate efficiency
    const efficiency = this.calculateEfficiency(avgExecutionTime, avgMemoryUsage, avgCpuUsage);

    // Calculate success rate
    const successCount = executionData.filter(d => d.status === 'success').length;
    const successRate = (successCount / executionData.length) * 100;
    const errorRate = 100 - successRate;

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(avgExecutionTime, avgMemoryUsage, avgCpuUsage);

    // Generate optimizations
    const optimizations = this.generateOptimizations(avgExecutionTime, avgMemoryUsage, avgCpuUsage);

    // Generate recommendations
    const recommendations = this.generateRecommendations(bottlenecks, optimizations);

    return {
      executionTime: avgExecutionTime,
      memoryUsage: avgMemoryUsage,
      cpuUsage: avgCpuUsage,
      throughput: avgThroughput,
      latency: avgLatency,
      efficiency,
      scalability: this.calculateScalability(executionData),
      reliability: this.calculateReliability(executionData),
      availability: this.calculateAvailability(executionData),
      responseTime: avgLatency,
      errorRate,
      successRate,
      utilization: this.calculateUtilization(avgCpuUsage, avgMemoryUsage),
      bottlenecks,
      optimizations,
      recommendations
    };
  }

  /**
   * Get or create performance baseline
   */
  private async getOrCreateBaseline(
    ruleId: string,
    executionData: RuleExecutionHistory[]
  ): Promise<PerformanceBaseline> {
    // Check if baseline exists
    const existingBaseline = this.baselines.get(ruleId);
    if (existingBaseline) {
      return existingBaseline;
    }

    // Create new baseline from historical data
    const historicalMetrics = executionData.map(d => ({
      executionTime: d.executionTime,
      memoryUsage: d.memoryUsage,
      cpuUsage: d.cpuUsage,
      throughput: d.throughput,
      latency: d.latency,
      efficiency: this.calculateEfficiency(d.executionTime, d.memoryUsage, d.cpuUsage),
      scalability: 0,
      reliability: 0,
      availability: 0,
      responseTime: d.latency,
      errorRate: d.status === 'success' ? 0 : 100,
      successRate: d.status === 'success' ? 100 : 0,
      utilization: this.calculateUtilization(d.cpuUsage, d.memoryUsage),
      bottlenecks: [],
      optimizations: [],
      recommendations: []
    }));

    const baseline: PerformanceBaseline = {
      averageExecutionTime: this.calculateAverage(historicalMetrics.map(m => m.executionTime)),
      averageMemoryUsage: this.calculateAverage(historicalMetrics.map(m => m.memoryUsage)),
      averageCpuUsage: this.calculateAverage(historicalMetrics.map(m => m.cpuUsage)),
      averageThroughput: this.calculateAverage(historicalMetrics.map(m => m.throughput)),
      averageLatency: this.calculateAverage(historicalMetrics.map(m => m.latency)),
      averageEfficiency: this.calculateAverage(historicalMetrics.map(m => m.efficiency)),
      historicalData: historicalMetrics,
      percentile95: this.calculatePercentile(historicalMetrics, 95),
      percentile99: this.calculatePercentile(historicalMetrics, 99),
      minValues: this.calculateMinValues(historicalMetrics),
      maxValues: this.calculateMaxValues(historicalMetrics)
    };

    this.baselines.set(ruleId, baseline);
    return baseline;
  }

  /**
   * Calculate performance comparison
   */
  private calculateComparison(
    current: PerformanceMetrics,
    baseline: PerformanceBaseline
  ): PerformanceComparison {
    return {
      executionTime: this.calculateDifference(current.executionTime, baseline.averageExecutionTime),
      memoryUsage: this.calculateDifference(current.memoryUsage, baseline.averageMemoryUsage),
      cpuUsage: this.calculateDifference(current.cpuUsage, baseline.averageCpuUsage),
      throughput: this.calculateDifference(current.throughput, baseline.averageThroughput),
      latency: this.calculateDifference(current.latency, baseline.averageLatency),
      efficiency: this.calculateDifference(current.efficiency, baseline.averageEfficiency),
      overall: this.calculateOverallDifference(current, baseline)
    };
  }

  /**
   * Analyze performance trends
   */
  private async analyzeTrends(
    ruleId: string,
    executionData: RuleExecutionHistory[]
  ): Promise<PerformanceTrend[]> {
    const trends: PerformanceTrend[] = [];

    // Sort data by timestamp
    const sortedData = executionData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Analyze execution time trend
    const executionTimeTrend = this.calculateTrend(
      'executionTime',
      sortedData.map(d => d.executionTime),
      sortedData.map(d => new Date(d.timestamp))
    );
    trends.push(executionTimeTrend);

    // Analyze memory usage trend
    const memoryUsageTrend = this.calculateTrend(
      'memoryUsage',
      sortedData.map(d => d.memoryUsage),
      sortedData.map(d => new Date(d.timestamp))
    );
    trends.push(memoryUsageTrend);

    // Analyze throughput trend
    const throughputTrend = this.calculateTrend(
      'throughput',
      sortedData.map(d => d.throughput),
      sortedData.map(d => new Date(d.timestamp))
    );
    trends.push(throughputTrend);

    return trends;
  }

  /**
   * Generate performance insights
   */
  private async generateInsights(
    current: PerformanceMetrics,
    baseline: PerformanceBaseline,
    comparison: PerformanceComparison,
    trends: PerformanceTrend[]
  ): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];

    // Performance degradation insights
    if (comparison.executionTime.percentage > 20) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'performance',
        title: 'Performance Degradation Detected',
        description: `Execution time increased by ${comparison.executionTime.percentage.toFixed(1)}%`,
        severity: comparison.executionTime.percentage > 50 ? 'high' : 'medium',
        impact: comparison.executionTime.percentage / 100,
        confidence: 0.9,
        actionable: true,
        recommendation: 'Investigate recent changes and optimize rule logic',
        timestamp: new Date()
      });
    }

    // Memory usage insights
    if (comparison.memoryUsage.percentage > 30) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'optimization',
        title: 'Memory Usage Increase',
        description: `Memory usage increased by ${comparison.memoryUsage.percentage.toFixed(1)}%`,
        severity: 'medium',
        impact: comparison.memoryUsage.percentage / 100,
        confidence: 0.85,
        actionable: true,
        recommendation: 'Review memory allocation and implement caching strategies',
        timestamp: new Date()
      });
    }

    // Trend insights
    const decliningTrends = trends.filter(t => t.trend === 'declining');
    if (decliningTrends.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'trend',
        title: 'Performance Trends Declining',
        description: `${decliningTrends.length} metrics showing declining performance`,
        severity: 'high',
        impact: 0.7,
        confidence: 0.8,
        actionable: true,
        recommendation: 'Implement performance monitoring and optimization strategies',
        timestamp: new Date()
      });
    }

    return insights;
  }

  /**
   * Calculate performance score
   */
  private calculateScore(
    current: PerformanceMetrics,
    baseline: PerformanceBaseline,
    comparison: PerformanceComparison
  ): number {
    let score = 100;

    // Deduct points for performance degradation
    if (comparison.executionTime.percentage > 0) {
      score -= comparison.executionTime.percentage * 0.5;
    }

    if (comparison.memoryUsage.percentage > 0) {
      score -= comparison.memoryUsage.percentage * 0.3;
    }

    if (comparison.cpuUsage.percentage > 0) {
      score -= comparison.cpuUsage.percentage * 0.2;
    }

    // Deduct points for low efficiency
    if (current.efficiency < 70) {
      score -= (70 - current.efficiency) * 0.5;
    }

    // Deduct points for high error rate
    if (current.errorRate > 5) {
      score -= current.errorRate * 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate performance grade
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Helper methods
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateEfficiency(executionTime: number, memoryUsage: number, cpuUsage: number): number {
    // Efficiency formula: higher is better
    const timeEfficiency = Math.max(0, 100 - (executionTime / 1000) * 10);
    const memoryEfficiency = Math.max(0, 100 - (memoryUsage / 100) * 5);
    const cpuEfficiency = Math.max(0, 100 - cpuUsage);
    
    return (timeEfficiency + memoryEfficiency + cpuEfficiency) / 3;
  }

  private calculateUtilization(cpuUsage: number, memoryUsage: number): number {
    return (cpuUsage + memoryUsage) / 2;
  }

  private calculateScalability(executionData: RuleExecutionHistory[]): number {
    // Simplified scalability calculation
    return 85; // Placeholder
  }

  private calculateReliability(executionData: RuleExecutionHistory[]): number {
    const successCount = executionData.filter(d => d.status === 'success').length;
    return (successCount / executionData.length) * 100;
  }

  private calculateAvailability(executionData: RuleExecutionHistory[]): number {
    // Simplified availability calculation
    return 99.5; // Placeholder
  }

  private identifyBottlenecks(executionTime: number, memoryUsage: number, cpuUsage: number): string[] {
    const bottlenecks: string[] = [];

    if (executionTime > 5000) {
      bottlenecks.push('High execution time');
    }

    if (memoryUsage > 80) {
      bottlenecks.push('High memory usage');
    }

    if (cpuUsage > 90) {
      bottlenecks.push('High CPU usage');
    }

    return bottlenecks;
  }

  private generateOptimizations(executionTime: number, memoryUsage: number, cpuUsage: number): string[] {
    const optimizations: string[] = [];

    if (executionTime > 3000) {
      optimizations.push('Implement caching strategies');
    }

    if (memoryUsage > 70) {
      optimizations.push('Optimize memory allocation');
    }

    if (cpuUsage > 80) {
      optimizations.push('Consider parallel processing');
    }

    return optimizations;
  }

  private generateRecommendations(bottlenecks: string[], optimizations: string[]): string[] {
    const recommendations: string[] = [];

    if (bottlenecks.length > 0) {
      recommendations.push('Address identified bottlenecks');
    }

    if (optimizations.length > 0) {
      recommendations.push('Implement suggested optimizations');
    }

    recommendations.push('Monitor performance metrics regularly');
    recommendations.push('Set up performance alerts');

    return recommendations;
  }

  private calculateDifference(current: number, baseline: number): {
    current: number;
    baseline: number;
    difference: number;
    percentage: number;
  } {
    const difference = current - baseline;
    const percentage = baseline > 0 ? (difference / baseline) * 100 : 0;

    return {
      current,
      baseline,
      difference,
      percentage
    };
  }

  private calculateOverallDifference(current: PerformanceMetrics, baseline: PerformanceBaseline): {
    current: number;
    baseline: number;
    difference: number;
    percentage: number;
  } {
    const currentScore = this.calculateScore(current, baseline, {
      executionTime: this.calculateDifference(current.executionTime, baseline.averageExecutionTime),
      memoryUsage: this.calculateDifference(current.memoryUsage, baseline.averageMemoryUsage),
      cpuUsage: this.calculateDifference(current.cpuUsage, baseline.averageCpuUsage),
      throughput: this.calculateDifference(current.throughput, baseline.averageThroughput),
      latency: this.calculateDifference(current.latency, baseline.averageLatency),
      efficiency: this.calculateDifference(current.efficiency, baseline.averageEfficiency),
      overall: { current: 0, baseline: 0, difference: 0, percentage: 0 }
    });

    const baselineScore = 100; // Assuming baseline is optimal

    return {
      current: currentScore,
      baseline: baselineScore,
      difference: currentScore - baselineScore,
      percentage: ((currentScore - baselineScore) / baselineScore) * 100
    };
  }

  private calculateTrend(
    metric: string,
    values: number[],
    timestamps: Date[]
  ): PerformanceTrend {
    if (values.length < 2) {
      return {
        metric,
        values,
        timestamps,
        trend: 'stable',
        slope: 0,
        confidence: 0,
        prediction: values[values.length - 1] || 0
      };
    }

    // Simple linear regression
    const n = values.length;
    const xValues = timestamps.map((_, i) => i);
    const yValues = values;

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(slope) < 0.1) {
      trend = 'stable';
    } else if (slope < 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    // Calculate confidence (simplified)
    const confidence = Math.min(0.95, Math.max(0.5, 1 - Math.abs(slope) / 10));

    // Predict next value
    const prediction = slope * n + intercept;

    return {
      metric,
      values,
      timestamps,
      trend,
      slope,
      confidence,
      prediction
    };
  }

  private calculatePercentile(metrics: PerformanceMetrics[], percentile: number): PerformanceMetrics {
    // Simplified percentile calculation
    return metrics[Math.floor((percentile / 100) * metrics.length)] || this.getDefaultMetrics();
  }

  private calculateMinValues(metrics: PerformanceMetrics[]): PerformanceMetrics {
    if (metrics.length === 0) return this.getDefaultMetrics();

    return {
      executionTime: Math.min(...metrics.map(m => m.executionTime)),
      memoryUsage: Math.min(...metrics.map(m => m.memoryUsage)),
      cpuUsage: Math.min(...metrics.map(m => m.cpuUsage)),
      throughput: Math.min(...metrics.map(m => m.throughput)),
      latency: Math.min(...metrics.map(m => m.latency)),
      efficiency: Math.min(...metrics.map(m => m.efficiency)),
      scalability: Math.min(...metrics.map(m => m.scalability)),
      reliability: Math.min(...metrics.map(m => m.reliability)),
      availability: Math.min(...metrics.map(m => m.availability)),
      responseTime: Math.min(...metrics.map(m => m.responseTime)),
      errorRate: Math.min(...metrics.map(m => m.errorRate)),
      successRate: Math.min(...metrics.map(m => m.successRate)),
      utilization: Math.min(...metrics.map(m => m.utilization)),
      bottlenecks: [],
      optimizations: [],
      recommendations: []
    };
  }

  private calculateMaxValues(metrics: PerformanceMetrics[]): PerformanceMetrics {
    if (metrics.length === 0) return this.getDefaultMetrics();

    return {
      executionTime: Math.max(...metrics.map(m => m.executionTime)),
      memoryUsage: Math.max(...metrics.map(m => m.memoryUsage)),
      cpuUsage: Math.max(...metrics.map(m => m.cpuUsage)),
      throughput: Math.max(...metrics.map(m => m.throughput)),
      latency: Math.max(...metrics.map(m => m.latency)),
      efficiency: Math.max(...metrics.map(m => m.efficiency)),
      scalability: Math.max(...metrics.map(m => m.scalability)),
      reliability: Math.max(...metrics.map(m => m.reliability)),
      availability: Math.max(...metrics.map(m => m.availability)),
      responseTime: Math.max(...metrics.map(m => m.responseTime)),
      errorRate: Math.max(...metrics.map(m => m.errorRate)),
      successRate: Math.max(...metrics.map(m => m.successRate)),
      utilization: Math.max(...metrics.map(m => m.utilization)),
      bottlenecks: [],
      optimizations: [],
      recommendations: []
    };
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      throughput: 0,
      latency: 0,
      efficiency: 0,
      scalability: 0,
      reliability: 0,
      availability: 0,
      responseTime: 0,
      errorRate: 0,
      successRate: 0,
      utilization: 0,
      bottlenecks: [],
      optimizations: [],
      recommendations: []
    };
  }

  private generateCacheKey(
    rule: ValidationRule,
    executionData: RuleExecutionHistory[],
    options: PerformanceCalculationOptions
  ): string {
    return `${rule.id}_${executionData.length}_${JSON.stringify(options)}_${Date.now()}`;
  }

  private updateMetrics(processingTime: number, success: boolean): void {
    this.metrics.totalProcessingTime += processingTime;
    this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.totalAnalyses;
    
    if (success) {
      this.metrics.successfulAnalyses++;
    } else {
      this.metrics.failedAnalyses++;
    }
  }

  /**
   * Get calculator metrics
   */
  getMetrics(): PerformanceCalculatorMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface PerformanceCalculatorConfig {
  enableCaching: boolean;
  cacheTimeout: number;
  enableTrendAnalysis: boolean;
  enablePredictions: boolean;
  enableOptimizations: boolean;
  baselineWindow: number;
  confidenceThreshold: number;
}

export interface PerformanceCalculationOptions {
  includeTrends?: boolean;
  includePredictions?: boolean;
  includeOptimizations?: boolean;
  baselineOverride?: PerformanceBaseline;
  confidenceThreshold?: number;
}

export interface PerformanceCalculatorMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  cacheHits: number;
  cacheMisses: number;
}

// ============================================================================
// EXPORT INSTANCE
// ============================================================================

export const performanceCalculator = new AdvancedPerformanceCalculator();