/**
 * Advanced Quality Utility Functions
 * Maps to: catalog_quality_service.py, data_profiling_service.py, catalog_quality_models.py
 * 
 * Comprehensive utility functions for quality calculations, profiling analysis,
 * rule validation, and quality scoring algorithms.
 */

import type {
  DataQualityRule,
  QualityAssessment,
  QualityScorecard,
  QualityMetrics,
  QualityDimension,
  QualityIssue,
  QualityRecommendation,
  QualityTrend,
  QualityBenchmark,
  QualityValidationResult,
  QualityAnomalyDetection,
  DataProfilingResult,
  StatisticalProfile,
  DataDistribution,
  OutlierDetection,
  QualityThreshold,
} from '../types/quality.types';

import type {
  IntelligentDataAsset,
  DataQualityAssessment,
} from '../types/catalog-core.types';

// ===================== QUALITY SCORING UTILITIES =====================

/**
 * Calculate overall quality score for an asset
 */
export const calculateOverallQualityScore = (
  assessments: QualityAssessment[]
): number => {
  if (assessments.length === 0) return 0;

  const dimensionWeights = {
    completeness: 0.25,
    accuracy: 0.25,
    consistency: 0.20,
    validity: 0.15,
    uniqueness: 0.10,
    timeliness: 0.05,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  assessments.forEach(assessment => {
    const dimension = assessment.dimension as keyof typeof dimensionWeights;
    const weight = dimensionWeights[dimension] || 0.1;
    weightedSum += assessment.score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
};

/**
 * Calculate quality score for specific dimension
 */
export const calculateDimensionScore = (
  dimension: QualityDimension,
  value: number,
  total: number,
  thresholds?: QualityThreshold
): number => {
  if (total === 0) return 0;

  const ratio = value / total;
  
  switch (dimension) {
    case 'completeness':
      return calculateCompletenessScore(ratio, thresholds);
    case 'accuracy':
      return calculateAccuracyScore(ratio, thresholds);
    case 'consistency':
      return calculateConsistencyScore(ratio, thresholds);
    case 'validity':
      return calculateValidityScore(ratio, thresholds);
    case 'uniqueness':
      return calculateUniquenessScore(ratio, thresholds);
    case 'timeliness':
      return calculateTimelinessScore(ratio, thresholds);
    default:
      return ratio * 100;
  }
};

/**
 * Calculate completeness score
 */
export const calculateCompletenessScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.98;
  const good = thresholds?.good || 0.95;
  const acceptable = thresholds?.acceptable || 0.90;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

/**
 * Calculate accuracy score
 */
export const calculateAccuracyScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.99;
  const good = thresholds?.good || 0.97;
  const acceptable = thresholds?.acceptable || 0.94;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

/**
 * Calculate consistency score
 */
export const calculateConsistencyScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.97;
  const good = thresholds?.good || 0.94;
  const acceptable = thresholds?.acceptable || 0.90;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

/**
 * Calculate validity score
 */
export const calculateValidityScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.98;
  const good = thresholds?.good || 0.95;
  const acceptable = thresholds?.acceptable || 0.92;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

/**
 * Calculate uniqueness score
 */
export const calculateUniquenessScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.99;
  const good = thresholds?.good || 0.97;
  const acceptable = thresholds?.acceptable || 0.95;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

/**
 * Calculate timeliness score
 */
export const calculateTimelinessScore = (
  ratio: number,
  thresholds?: QualityThreshold
): number => {
  const excellent = thresholds?.excellent || 0.95;
  const good = thresholds?.good || 0.90;
  const acceptable = thresholds?.acceptable || 0.85;

  if (ratio >= excellent) return 100;
  if (ratio >= good) return 85 + ((ratio - good) / (excellent - good)) * 15;
  if (ratio >= acceptable) return 70 + ((ratio - acceptable) / (good - acceptable)) * 15;
  return Math.max(0, ratio * 70);
};

// ===================== QUALITY RULE UTILITIES =====================

/**
 * Validate quality rule definition
 */
export const validateQualityRule = (rule: DataQualityRule): QualityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate rule name
  if (!rule.name || rule.name.trim().length === 0) {
    errors.push('Rule name is required');
  }

  // Validate rule expression
  if (!rule.expression || rule.expression.trim().length === 0) {
    errors.push('Rule expression is required');
  } else {
    try {
      // Basic SQL syntax validation (simplified)
      validateSQLExpression(rule.expression);
    } catch (error) {
      errors.push(`Invalid expression: ${error}`);
    }
  }

  // Validate thresholds
  if (rule.thresholds) {
    if (rule.thresholds.critical !== undefined && rule.thresholds.critical < 0) {
      errors.push('Critical threshold must be non-negative');
    }
    if (rule.thresholds.warning !== undefined && rule.thresholds.warning < 0) {
      errors.push('Warning threshold must be non-negative');
    }
  }

  // Performance warnings
  if (rule.expression.toLowerCase().includes('select *')) {
    warnings.push('SELECT * may impact performance on large datasets');
  }

  const isValid = errors.length === 0;
  const score = isValid ? (warnings.length === 0 ? 100 : 85) : 0;

  return {
    isValid,
    score,
    errors,
    warnings,
    recommendations: generateRuleRecommendations(rule, errors, warnings),
  };
};

/**
 * Basic SQL expression validation
 */
export const validateSQLExpression = (expression: string): void => {
  // Remove comments and normalize
  const cleaned = expression.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim();
  
  // Check for dangerous operations
  const dangerousPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /truncate\s+table/i,
    /alter\s+table/i,
    /create\s+table/i,
    /insert\s+into/i,
    /update\s+.*\s+set/i,
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(cleaned)) {
      throw new Error('Dangerous SQL operations are not allowed in quality rules');
    }
  });

  // Basic syntax checks
  if (cleaned.length === 0) {
    throw new Error('Expression cannot be empty');
  }

  // Check for balanced parentheses
  let parenthesesCount = 0;
  for (const char of cleaned) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) {
      throw new Error('Unbalanced parentheses in expression');
    }
  }
  if (parenthesesCount !== 0) {
    throw new Error('Unbalanced parentheses in expression');
  }
};

/**
 * Generate rule recommendations
 */
export const generateRuleRecommendations = (
  rule: DataQualityRule,
  errors: string[],
  warnings: string[]
): string[] => {
  const recommendations: string[] = [];

  if (errors.length > 0) {
    recommendations.push('Fix validation errors before saving the rule');
  }

  if (warnings.length > 0) {
    recommendations.push('Consider addressing warnings to improve rule performance');
  }

  if (!rule.description) {
    recommendations.push('Add a description to help others understand the rule purpose');
  }

  if (!rule.thresholds) {
    recommendations.push('Set thresholds to enable automated monitoring');
  }

  if (rule.expression.length > 500) {
    recommendations.push('Consider breaking complex rules into smaller, focused rules');
  }

  return recommendations;
};

// ===================== DATA PROFILING UTILITIES =====================

/**
 * Calculate statistical summary for numeric data
 */
export const calculateStatisticalSummary = (values: number[]): StatisticalProfile => {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      quartiles: { q1: 0, q2: 0, q3: 0 },
      skewness: 0,
      kurtosis: 0,
    };
  }

  const sortedValues = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Median
  const median = count % 2 === 0
    ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2
    : sortedValues[Math.floor(count / 2)];

  // Mode (most frequent value)
  const frequency = new Map<number, number>();
  values.forEach(value => {
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });
  const mode = Array.from(frequency.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  // Variance and Standard Deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  // Min, Max, Range
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  // Quartiles
  const q1Index = Math.floor(count * 0.25);
  const q3Index = Math.floor(count * 0.75);
  const quartiles = {
    q1: sortedValues[q1Index],
    q2: median,
    q3: sortedValues[q3Index],
  };

  // Skewness
  const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0) / count;

  // Kurtosis
  const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0) / count - 3;

  return {
    count,
    mean,
    median,
    mode,
    standardDeviation,
    variance,
    min,
    max,
    range,
    quartiles,
    skewness,
    kurtosis,
  };
};

/**
 * Calculate data distribution
 */
export const calculateDataDistribution = (
  values: any[],
  bins: number = 10
): DataDistribution => {
  const distribution = new Map<any, number>();
  const total = values.length;

  // Count frequencies
  values.forEach(value => {
    const key = typeof value === 'number' ? Math.floor(value / bins) * bins : value;
    distribution.set(key, (distribution.get(key) || 0) + 1);
  });

  // Convert to percentages
  const distributionData = Array.from(distribution.entries()).map(([value, count]) => ({
    value,
    count,
    percentage: (count / total) * 100,
  }));

  // Calculate entropy (measure of data diversity)
  const entropy = distributionData.reduce((acc, { percentage }) => {
    const p = percentage / 100;
    return acc - (p > 0 ? p * Math.log2(p) : 0);
  }, 0);

  return {
    data: distributionData,
    entropy,
    uniqueValues: distribution.size,
    totalValues: total,
    diversity: distribution.size / total,
  };
};

/**
 * Detect outliers using IQR method
 */
export const detectOutliersIQR = (values: number[]): OutlierDetection => {
  if (values.length === 0) {
    return {
      outliers: [],
      lowerBound: 0,
      upperBound: 0,
      method: 'IQR',
      outlierCount: 0,
      outlierPercentage: 0,
    };
  }

  const sortedValues = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values.filter(value => value < lowerBound || value > upperBound);

  return {
    outliers,
    lowerBound,
    upperBound,
    method: 'IQR',
    outlierCount: outliers.length,
    outlierPercentage: (outliers.length / values.length) * 100,
  };
};

/**
 * Detect outliers using Z-score method
 */
export const detectOutliersZScore = (
  values: number[],
  threshold: number = 3
): OutlierDetection => {
  if (values.length === 0) {
    return {
      outliers: [],
      lowerBound: 0,
      upperBound: 0,
      method: 'Z-Score',
      outlierCount: 0,
      outlierPercentage: 0,
    };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  const outliers = values.filter(value => {
    const zScore = Math.abs((value - mean) / standardDeviation);
    return zScore > threshold;
  });

  const lowerBound = mean - threshold * standardDeviation;
  const upperBound = mean + threshold * standardDeviation;

  return {
    outliers,
    lowerBound,
    upperBound,
    method: 'Z-Score',
    outlierCount: outliers.length,
    outlierPercentage: (outliers.length / values.length) * 100,
  };
};

// ===================== QUALITY TREND ANALYSIS =====================

/**
 * Calculate quality trends over time
 */
export const calculateQualityTrends = (
  historicalScores: { timestamp: string; score: number }[]
): QualityTrend => {
  if (historicalScores.length < 2) {
    return {
      trend: 'stable',
      slope: 0,
      correlation: 0,
      volatility: 0,
      prediction: null,
    };
  }

  const scores = historicalScores.map(h => h.score);
  const n = scores.length;

  // Calculate linear regression
  const xValues = scores.map((_, index) => index);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = scores.reduce((a, b) => a + b, 0) / n;

  const numerator = xValues.reduce((acc, x, i) => acc + (x - xMean) * (scores[i] - yMean), 0);
  const denominator = xValues.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0);

  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Calculate correlation coefficient
  const xStdDev = Math.sqrt(xValues.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0) / n);
  const yStdDev = Math.sqrt(scores.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0) / n);
  const correlation = (xStdDev * yStdDev) !== 0 ? numerator / (n * xStdDev * yStdDev) : 0;

  // Calculate volatility (standard deviation of changes)
  const changes = scores.slice(1).map((score, i) => score - scores[i]);
  const volatility = Math.sqrt(changes.reduce((acc, change) => acc + Math.pow(change, 2), 0) / changes.length);

  // Determine trend direction
  let trend: 'improving' | 'declining' | 'stable';
  if (Math.abs(slope) < 0.1) {
    trend = 'stable';
  } else {
    trend = slope > 0 ? 'improving' : 'declining';
  }

  // Simple prediction for next period
  const lastScore = scores[scores.length - 1];
  const prediction = lastScore + slope;

  return {
    trend,
    slope,
    correlation,
    volatility,
    prediction: Math.max(0, Math.min(100, prediction)),
  };
};

// ===================== QUALITY BENCHMARK UTILITIES =====================

/**
 * Compare asset quality against benchmarks
 */
export const compareAgainstBenchmarks = (
  assetScore: number,
  benchmarks: QualityBenchmark[]
): {
  percentile: number;
  rank: string;
  comparison: string;
} => {
  if (benchmarks.length === 0) {
    return {
      percentile: 50,
      rank: 'Unknown',
      comparison: 'No benchmarks available',
    };
  }

  const scores = benchmarks.map(b => b.score).sort((a, b) => a - b);
  const betterThan = scores.filter(score => score < assetScore).length;
  const percentile = (betterThan / scores.length) * 100;

  let rank: string;
  if (percentile >= 90) rank = 'Excellent';
  else if (percentile >= 75) rank = 'Good';
  else if (percentile >= 50) rank = 'Average';
  else if (percentile >= 25) rank = 'Below Average';
  else rank = 'Poor';

  const medianScore = scores[Math.floor(scores.length / 2)];
  const difference = assetScore - medianScore;
  const comparison = difference > 0 
    ? `${difference.toFixed(1)} points above median`
    : `${Math.abs(difference).toFixed(1)} points below median`;

  return { percentile, rank, comparison };
};

// ===================== QUALITY RECOMMENDATION ENGINE =====================

/**
 * Generate quality improvement recommendations
 */
export const generateQualityRecommendations = (
  assessment: QualityAssessment,
  profiling: DataProfilingResult
): QualityRecommendation[] => {
  const recommendations: QualityRecommendation[] = [];

  // Completeness recommendations
  if (assessment.dimension === 'completeness' && assessment.score < 90) {
    recommendations.push({
      type: 'completeness',
      priority: assessment.score < 70 ? 'high' : 'medium',
      title: 'Improve Data Completeness',
      description: 'Address missing values in critical fields',
      actions: [
        'Implement data validation at source',
        'Add required field constraints',
        'Set up data quality monitoring',
      ],
      estimatedImpact: 'high',
      estimatedEffort: 'medium',
    });
  }

  // Accuracy recommendations
  if (assessment.dimension === 'accuracy' && assessment.score < 85) {
    recommendations.push({
      type: 'accuracy',
      priority: 'high',
      title: 'Enhance Data Accuracy',
      description: 'Validate and correct inaccurate data',
      actions: [
        'Implement data validation rules',
        'Add cross-reference checks',
        'Set up automated data cleansing',
      ],
      estimatedImpact: 'high',
      estimatedEffort: 'high',
    });
  }

  // Add more recommendation logic based on profiling results
  if (profiling.outlierPercentage > 5) {
    recommendations.push({
      type: 'consistency',
      priority: 'medium',
      title: 'Address Data Outliers',
      description: `${profiling.outlierPercentage.toFixed(1)}% of values are outliers`,
      actions: [
        'Review outlier values for accuracy',
        'Implement outlier detection rules',
        'Consider data transformation techniques',
      ],
      estimatedImpact: 'medium',
      estimatedEffort: 'low',
    });
  }

  return recommendations;
};

/**
 * Calculate quality improvement ROI
 */
export const calculateQualityROI = (
  currentScore: number,
  targetScore: number,
  dataVolume: number,
  businessValue: number
): {
  potentialImprovement: number;
  estimatedValue: number;
  roi: number;
} => {
  const potentialImprovement = targetScore - currentScore;
  const improvementRatio = potentialImprovement / 100;
  
  // Estimate value based on data volume and business value
  const baseValue = dataVolume * businessValue * 0.001; // Simplified calculation
  const estimatedValue = baseValue * improvementRatio;
  
  // Assume implementation cost is 20% of potential value
  const implementationCost = estimatedValue * 0.2;
  const roi = implementationCost > 0 ? (estimatedValue / implementationCost) * 100 : 0;

  return {
    potentialImprovement,
    estimatedValue,
    roi,
  };
};

export default {
  calculateOverallQualityScore,
  calculateDimensionScore,
  validateQualityRule,
  calculateStatisticalSummary,
  calculateDataDistribution,
  detectOutliersIQR,
  detectOutliersZScore,
  calculateQualityTrends,
  compareAgainstBenchmarks,
  generateQualityRecommendations,
  calculateQualityROI,
};