/**
 * Advanced Intelligence Utility Functions
 * Maps to: intelligent_discovery_service.py, semantic_search_service.py, 
 *          catalog_recommendation_service.py, ai_service.py, ml_service.py
 * 
 * Comprehensive utility functions for AI/ML processing, semantic analysis,
 * intelligent discovery, and recommendation algorithms.
 */

import type {
  IntelligentDiscoveryRequest,
  IntelligentDiscoveryResult,
  SemanticSearchRequest,
  SemanticSearchResult,
  RecommendationRequest,
  Recommendation,
  PersonalizedRecommendation,
  UsagePatternAnalysis,
  IntelligenceInsight,
  PatternRecognition,
  TrendAnalysis,
  SmartSuggestion,
  SearchContext,
  QueryInterpretation,
} from '../types/intelligence.types';

import type {
  SemanticAnalysisRequest,
  SemanticAnalysisResult,
  SemanticEmbedding,
  SimilarityScore,
  AutoClassificationResult,
  MLModelMetrics,
  PredictiveInsight,
} from '../types/ai-ml.types';

import type {
  IntelligentDataAsset,
  SemanticRelationship,
} from '../types/catalog-core.types';

// ===================== SEMANTIC ANALYSIS UTILITIES =====================

/**
 * Calculate semantic similarity between text strings
 */
export const calculateSemanticSimilarity = (
  text1: string,
  text2: string,
  embeddings1?: number[],
  embeddings2?: number[]
): SimilarityScore => {
  // If embeddings are provided, use cosine similarity
  if (embeddings1 && embeddings2) {
    const similarity = cosineSimilarity(embeddings1, embeddings2);
    return {
      score: similarity,
      method: 'cosine',
      confidence: similarity > 0.8 ? 'high' : similarity > 0.5 ? 'medium' : 'low',
    };
  }

  // Fallback to text-based similarity
  const textSimilarity = calculateTextSimilarity(text1, text2);
  return {
    score: textSimilarity,
    method: 'text',
    confidence: textSimilarity > 0.7 ? 'high' : textSimilarity > 0.4 ? 'medium' : 'low',
  };
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Calculate text similarity using Jaccard index
 */
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  const tokens1 = new Set(tokenizeText(text1));
  const tokens2 = new Set(tokenizeText(text2));

  const intersection = new Set([...tokens1].filter(token => tokens2.has(token)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Tokenize text for similarity analysis
 */
export const tokenizeText = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
};

/**
 * Extract key terms from text
 */
export const extractKeyTerms = (text: string, maxTerms: number = 10): string[] => {
  const tokens = tokenizeText(text);
  const frequency = new Map<string, number>();

  // Count term frequency
  tokens.forEach(token => {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });

  // Sort by frequency and return top terms
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([term]) => term);
};

// ===================== RECOMMENDATION UTILITIES =====================

/**
 * Calculate recommendation score based on multiple factors
 */
export const calculateRecommendationScore = (
  similarity: number,
  popularity: number,
  recency: number,
  userPreference: number = 0.5,
  weights: {
    similarity: number;
    popularity: number;
    recency: number;
    preference: number;
  } = { similarity: 0.4, popularity: 0.3, recency: 0.2, preference: 0.1 }
): number => {
  const weightedScore = 
    similarity * weights.similarity +
    popularity * weights.popularity +
    recency * weights.recency +
    userPreference * weights.preference;

  return Math.min(1, Math.max(0, weightedScore));
};

/**
 * Generate personalized recommendations
 */
export const generatePersonalizedRecommendations = (
  items: any[],
  userProfile: any,
  context: any
): PersonalizedRecommendation[] => {
  return items.map(item => {
    // Calculate various scoring factors
    const similarityScore = calculateContextSimilarity(item, context);
    const popularityScore = calculatePopularityScore(item);
    const recencyScore = calculateRecencyScore(item);
    const userPreferenceScore = calculateUserPreference(item, userProfile);

    const score = calculateRecommendationScore(
      similarityScore,
      popularityScore,
      recencyScore,
      userPreferenceScore
    );

    return {
      itemId: item.id,
      itemType: item.type || 'asset',
      score,
      reason: generateRecommendationReason(score, {
        similarity: similarityScore,
        popularity: popularityScore,
        recency: recencyScore,
        preference: userPreferenceScore,
      }),
      confidence: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
      metadata: item,
    };
  }).sort((a, b) => b.score - a.score);
};

/**
 * Calculate context similarity
 */
export const calculateContextSimilarity = (item: any, context: any): number => {
  if (!context || !item) return 0;

  let similarity = 0;
  let factors = 0;

  // Compare asset types
  if (context.assetType && item.assetType) {
    similarity += context.assetType === item.assetType ? 1 : 0;
    factors++;
  }

  // Compare tags
  if (context.tags && item.tags) {
    const commonTags = context.tags.filter((tag: string) => item.tags.includes(tag));
    similarity += commonTags.length / Math.max(context.tags.length, item.tags.length);
    factors++;
  }

  // Compare domains
  if (context.domain && item.domain) {
    similarity += context.domain === item.domain ? 1 : 0;
    factors++;
  }

  return factors > 0 ? similarity / factors : 0;
};

/**
 * Calculate popularity score
 */
export const calculatePopularityScore = (item: any): number => {
  const views = item.viewCount || 0;
  const downloads = item.downloadCount || 0;
  const references = item.referenceCount || 0;

  // Normalize scores (simple approach)
  const maxViews = 10000;
  const maxDownloads = 1000;
  const maxReferences = 100;

  const viewScore = Math.min(views / maxViews, 1);
  const downloadScore = Math.min(downloads / maxDownloads, 1);
  const referenceScore = Math.min(references / maxReferences, 1);

  return (viewScore * 0.4 + downloadScore * 0.3 + referenceScore * 0.3);
};

/**
 * Calculate recency score
 */
export const calculateRecencyScore = (item: any): number => {
  if (!item.lastModified && !item.createdAt) return 0.5;

  const lastUpdate = new Date(item.lastModified || item.createdAt);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  // Items updated within 30 days get full score, decay after that
  if (daysSinceUpdate <= 30) return 1;
  if (daysSinceUpdate <= 90) return 0.8;
  if (daysSinceUpdate <= 180) return 0.6;
  if (daysSinceUpdate <= 365) return 0.4;
  return 0.2;
};

/**
 * Calculate user preference score
 */
export const calculateUserPreference = (item: any, userProfile: any): number => {
  if (!userProfile) return 0.5;

  let preferenceScore = 0;
  let factors = 0;

  // Check preferred asset types
  if (userProfile.preferredAssetTypes && item.assetType) {
    const isPreferred = userProfile.preferredAssetTypes.includes(item.assetType);
    preferenceScore += isPreferred ? 1 : 0.3;
    factors++;
  }

  // Check preferred domains
  if (userProfile.preferredDomains && item.domain) {
    const isPreferred = userProfile.preferredDomains.includes(item.domain);
    preferenceScore += isPreferred ? 1 : 0.3;
    factors++;
  }

  // Check historical interactions
  if (userProfile.interactions) {
    const hasInteracted = userProfile.interactions.some((interaction: any) => 
      interaction.itemId === item.id
    );
    preferenceScore += hasInteracted ? 0.8 : 0.5;
    factors++;
  }

  return factors > 0 ? preferenceScore / factors : 0.5;
};

/**
 * Generate recommendation reason
 */
export const generateRecommendationReason = (
  score: number,
  factors: {
    similarity: number;
    popularity: number;
    recency: number;
    preference: number;
  }
): string => {
  const reasons: string[] = [];

  if (factors.similarity > 0.7) {
    reasons.push('highly relevant to your context');
  }

  if (factors.popularity > 0.7) {
    reasons.push('popular among users');
  }

  if (factors.recency > 0.8) {
    reasons.push('recently updated');
  }

  if (factors.preference > 0.7) {
    reasons.push('matches your preferences');
  }

  if (reasons.length === 0) {
    return 'may be of interest';
  }

  return reasons.join(' and ');
};

// ===================== PATTERN ANALYSIS UTILITIES =====================

/**
 * Analyze usage patterns
 */
export const analyzeUsagePatterns = (
  usageData: any[],
  timeWindow: string = '30d'
): UsagePatternAnalysis => {
  if (usageData.length === 0) {
    return {
      patterns: [],
      trends: [],
      anomalies: [],
      insights: [],
      confidence: 'low',
    };
  }

  // Group usage by time periods
  const patterns = detectUsagePatterns(usageData);
  const trends = detectUsageTrends(usageData);
  const anomalies = detectUsageAnomalies(usageData);
  const insights = generateUsageInsights(patterns, trends, anomalies);

  return {
    patterns,
    trends,
    anomalies,
    insights,
    confidence: calculatePatternConfidence(patterns, trends),
  };
};

/**
 * Detect usage patterns
 */
export const detectUsagePatterns = (usageData: any[]): any[] => {
  const patterns: any[] = [];

  // Detect daily patterns
  const hourlyUsage = groupUsageByHour(usageData);
  const peakHours = findPeakUsageHours(hourlyUsage);
  
  if (peakHours.length > 0) {
    patterns.push({
      type: 'temporal',
      pattern: 'peak_hours',
      description: `Peak usage during ${peakHours.join(', ')}`,
      confidence: 0.8,
    });
  }

  // Detect weekly patterns
  const weeklyUsage = groupUsageByDayOfWeek(usageData);
  const peakDays = findPeakUsageDays(weeklyUsage);
  
  if (peakDays.length > 0) {
    patterns.push({
      type: 'temporal',
      pattern: 'peak_days',
      description: `Higher usage on ${peakDays.join(', ')}`,
      confidence: 0.7,
    });
  }

  return patterns;
};

/**
 * Group usage data by hour
 */
export const groupUsageByHour = (usageData: any[]): Map<number, number> => {
  const hourlyUsage = new Map<number, number>();

  usageData.forEach(usage => {
    const hour = new Date(usage.timestamp).getHours();
    hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + 1);
  });

  return hourlyUsage;
};

/**
 * Find peak usage hours
 */
export const findPeakUsageHours = (hourlyUsage: Map<number, number>): number[] => {
  if (hourlyUsage.size === 0) return [];

  const values = Array.from(hourlyUsage.values());
  const maxUsage = Math.max(...values);
  const threshold = maxUsage * 0.8; // 80% of max usage

  return Array.from(hourlyUsage.entries())
    .filter(([_, usage]) => usage >= threshold)
    .map(([hour, _]) => hour)
    .sort();
};

/**
 * Group usage data by day of week
 */
export const groupUsageByDayOfWeek = (usageData: any[]): Map<string, number> => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyUsage = new Map<string, number>();

  usageData.forEach(usage => {
    const dayIndex = new Date(usage.timestamp).getDay();
    const dayName = days[dayIndex];
    dailyUsage.set(dayName, (dailyUsage.get(dayName) || 0) + 1);
  });

  return dailyUsage;
};

/**
 * Find peak usage days
 */
export const findPeakUsageDays = (dailyUsage: Map<string, number>): string[] => {
  if (dailyUsage.size === 0) return [];

  const values = Array.from(dailyUsage.values());
  const maxUsage = Math.max(...values);
  const threshold = maxUsage * 0.8;

  return Array.from(dailyUsage.entries())
    .filter(([_, usage]) => usage >= threshold)
    .map(([day, _]) => day);
};

/**
 * Detect usage trends
 */
export const detectUsageTrends = (usageData: any[]): any[] => {
  // This would implement more sophisticated trend analysis
  // For now, return simple trend detection
  const trends: any[] = [];

  if (usageData.length > 7) {
    const recentUsage = usageData.slice(-7);
    const earlierUsage = usageData.slice(-14, -7);

    const recentAvg = recentUsage.length;
    const earlierAvg = earlierUsage.length;

    if (recentAvg > earlierAvg * 1.2) {
      trends.push({
        type: 'increasing',
        description: 'Usage is increasing',
        confidence: 0.7,
      });
    } else if (recentAvg < earlierAvg * 0.8) {
      trends.push({
        type: 'decreasing',
        description: 'Usage is decreasing',
        confidence: 0.7,
      });
    }
  }

  return trends;
};

/**
 * Detect usage anomalies
 */
export const detectUsageAnomalies = (usageData: any[]): any[] => {
  // Simple anomaly detection based on outliers
  const anomalies: any[] = [];

  // This would implement more sophisticated anomaly detection
  // For now, return placeholder
  return anomalies;
};

/**
 * Generate usage insights
 */
export const generateUsageInsights = (
  patterns: any[],
  trends: any[],
  anomalies: any[]
): string[] => {
  const insights: string[] = [];

  patterns.forEach(pattern => {
    insights.push(`Detected ${pattern.description.toLowerCase()}`);
  });

  trends.forEach(trend => {
    insights.push(trend.description);
  });

  if (anomalies.length > 0) {
    insights.push(`Found ${anomalies.length} usage anomalies`);
  }

  return insights;
};

/**
 * Calculate pattern confidence
 */
export const calculatePatternConfidence = (patterns: any[], trends: any[]): 'low' | 'medium' | 'high' => {
  const totalPatterns = patterns.length + trends.length;
  const avgConfidence = (patterns.concat(trends))
    .reduce((sum, item) => sum + (item.confidence || 0), 0) / Math.max(totalPatterns, 1);

  if (avgConfidence > 0.8) return 'high';
  if (avgConfidence > 0.5) return 'medium';
  return 'low';
};

// ===================== INTELLIGENT DISCOVERY UTILITIES =====================

/**
 * Score discovery results based on relevance
 */
export const scoreDiscoveryResults = (
  results: any[],
  searchContext: any
): any[] => {
  return results.map(result => {
    const relevanceScore = calculateRelevanceScore(result, searchContext);
    const qualityScore = calculateDataQualityScore(result);
    const freshnessScore = calculateFreshnessScore(result);
    
    const overallScore = (
      relevanceScore * 0.5 +
      qualityScore * 0.3 +
      freshnessScore * 0.2
    );

    return {
      ...result,
      score: overallScore,
      relevanceScore,
      qualityScore,
      freshnessScore,
    };
  }).sort((a, b) => b.score - a.score);
};

/**
 * Calculate relevance score for discovery results
 */
export const calculateRelevanceScore = (result: any, context: any): number => {
  if (!context) return 0.5;

  let score = 0;
  let factors = 0;

  // Text similarity
  if (context.query && result.name) {
    score += calculateTextSimilarity(context.query, result.name);
    factors++;
  }

  // Type matching
  if (context.assetType && result.assetType) {
    score += context.assetType === result.assetType ? 1 : 0.3;
    factors++;
  }

  // Domain matching
  if (context.domain && result.domain) {
    score += context.domain === result.domain ? 1 : 0.3;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
};

/**
 * Calculate data quality score
 */
export const calculateDataQualityScore = (result: any): number => {
  // This would integrate with actual quality metrics
  return result.qualityScore || 0.7;
};

/**
 * Calculate freshness score
 */
export const calculateFreshnessScore = (result: any): number => {
  if (!result.lastModified) return 0.5;

  const lastUpdate = new Date(result.lastModified);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate <= 7) return 1;
  if (daysSinceUpdate <= 30) return 0.8;
  if (daysSinceUpdate <= 90) return 0.6;
  if (daysSinceUpdate <= 365) return 0.4;
  return 0.2;
};

/**
 * Generate smart suggestions based on context
 */
export const generateSmartSuggestions = (
  query: string,
  context: any,
  limit: number = 5
): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];

  // Query completion suggestions
  if (query.length > 2) {
    suggestions.push({
      type: 'completion',
      text: `${query} dataset`,
      confidence: 0.8,
      reason: 'Popular completion',
    });

    suggestions.push({
      type: 'completion',
      text: `${query} table`,
      confidence: 0.7,
      reason: 'Common asset type',
    });
  }

  // Context-based suggestions
  if (context?.domain) {
    suggestions.push({
      type: 'filter',
      text: `domain:${context.domain}`,
      confidence: 0.9,
      reason: 'Based on current context',
    });
  }

  return suggestions.slice(0, limit);
};

export default {
  calculateSemanticSimilarity,
  cosineSimilarity,
  calculateTextSimilarity,
  tokenizeText,
  extractKeyTerms,
  calculateRecommendationScore,
  generatePersonalizedRecommendations,
  analyzeUsagePatterns,
  scoreDiscoveryResults,
  generateSmartSuggestions,
};