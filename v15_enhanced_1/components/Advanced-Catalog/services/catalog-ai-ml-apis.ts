/**
 * Catalog AI/ML API Service
 * =========================
 * 
 * Maps to backend services:
 * - ai_service.py (63KB, 1533 lines, AIService)
 * - ml_service.py (68KB, 1696 lines, MLService)
 * - advanced_ai_service.py (39KB, AdvancedAIService)
 * - ai_routes.py (125KB, 2972 lines, 100+ endpoints)
 * - ml_routes.py (84KB, 2065 lines, 80+ endpoints)
 * 
 * Provides comprehensive AI/ML capabilities including semantic analysis,
 * predictive modeling, intelligent recommendations, and automated insights.
 */

import { apiClient } from '@/shared/utils/api-client'
import type {
  // AI Intelligence types
  SemanticAnalysisResult,
  IntelligentRecommendation,
  ContextualInsight,
  AIInsight,
  PredictiveAnalysis,
  
  // ML Model types
  MLModel,
  ModelTraining,
  ModelMetrics,
  ModelPrediction,
  FeatureImportance,
  
  // Semantic types
  SemanticEmbedding,
  SimilarityScore,
  SemanticRelationship,
  
  // Classification types
  AutoClassificationResult,
  ClassificationRule,
  ClassificationConfidence,
  
  // Pattern recognition
  PatternRecognitionResult,
  AnomalyDetectionResult,
  TrendPrediction,
  
  // Request/Response types
  SemanticAnalysisRequest,
  MLTrainingRequest,
  PredictionRequest,
  RecommendationRequest,
  ClassificationRequest
} from '../types/intelligence.types'

import type {
  IntelligentDataAsset,
  DataQualityAssessment,
  BusinessGlossaryTerm
} from '../types/catalog-core.types'

const API_BASE_URL = '/api/v1/catalog/ai-ml'

export class CatalogAIMLApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ===================== SEMANTIC ANALYSIS =====================

  /**
   * Perform semantic analysis on data assets
   * Maps to: AIService.perform_semantic_analysis()
   */
  async performSemanticAnalysis(request: SemanticAnalysisRequest): Promise<SemanticAnalysisResult> {
    return apiClient.post(`${this.baseUrl}/semantic/analyze`, request)
  }

  /**
   * Generate semantic embeddings for assets
   * Maps to: AIService.generate_semantic_embeddings()
   */
  async generateSemanticEmbeddings(
    assetIds: string[],
    includeColumns: boolean = true
  ): Promise<Array<{
    assetId: string
    embedding: number[]
    metadata: {
      dimensions: number
      model: string
      confidence: number
    }
    columnEmbeddings?: Array<{
      columnName: string
      embedding: number[]
      semanticType: string
    }>
  }>> {
    return apiClient.post(`${this.baseUrl}/semantic/embeddings`, {
      asset_ids: assetIds,
      include_columns: includeColumns
    })
  }

  /**
   * Calculate semantic similarity between assets
   * Maps to: AIService.calculate_semantic_similarity()
   */
  async calculateSemanticSimilarity(
    sourceAssetId: string,
    targetAssetIds: string[],
    method: 'cosine' | 'euclidean' | 'manhattan' = 'cosine'
  ): Promise<Array<{
    targetAssetId: string
    similarity: number
    semanticRelationships: SemanticRelationship[]
    explanation: string
  }>> {
    return apiClient.post(`${this.baseUrl}/semantic/similarity`, {
      source_asset_id: sourceAssetId,
      target_asset_ids: targetAssetIds,
      method
    })
  }

  /**
   * Extract semantic relationships
   * Maps to: AIService.extract_semantic_relationships()
   */
  async extractSemanticRelationships(assetId: string): Promise<{
    relationships: SemanticRelationship[]
    contextualInsights: ContextualInsight[]
    confidenceScore: number
    suggestedTags: string[]
    businessContext: {
      domain: string
      purpose: string
      stakeholders: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/semantic/relationships`, { asset_id: assetId })
  }

  /**
   * Auto-generate asset descriptions
   * Maps to: AIService.generate_asset_descriptions()
   */
  async generateAssetDescriptions(
    assetIds: string[],
    style: 'technical' | 'business' | 'comprehensive' = 'comprehensive'
  ): Promise<Array<{
    assetId: string
    generatedDescription: string
    confidence: number
    keyPhrases: string[]
    suggestedTags: string[]
    businessContext: string
  }>> {
    return apiClient.post(`${this.baseUrl}/semantic/descriptions`, {
      asset_ids: assetIds,
      style
    })
  }

  // ===================== INTELLIGENT RECOMMENDATIONS =====================

  /**
   * Get AI-powered asset recommendations
   * Maps to: AIService.generate_asset_recommendations()
   */
  async getAssetRecommendations(request: RecommendationRequest): Promise<{
    recommendations: IntelligentRecommendation[]
    reasoning: string[]
    confidence: number
    categories: Array<{
      category: string
      count: number
      relevance: number
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/recommendations/assets`, request)
  }

  /**
   * Get personalized asset recommendations
   * Maps to: AIService.get_personalized_recommendations()
   */
  async getPersonalizedRecommendations(
    userId: string,
    context?: {
      currentAsset?: string
      searchHistory?: string[]
      preferences?: Record<string, any>
    }
  ): Promise<{
    recommendations: Array<{
      assetId: string
      assetName: string
      assetType: string
      relevanceScore: number
      reasoning: string
      tags: string[]
    }>
    explanations: string[]
    learningInsights: {
      userProfile: Record<string, any>
      interestAreas: string[]
      recommendations: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/recommendations/personalized`, {
      user_id: userId,
      context: context || {}
    })
  }

  /**
   * Get related assets suggestions
   * Maps to: AIService.suggest_related_assets()
   */
  async suggestRelatedAssets(
    assetId: string,
    relationshipTypes: string[] = ['similar', 'lineage', 'usage'],
    limit: number = 10
  ): Promise<{
    relatedAssets: Array<{
      assetId: string
      assetName: string
      relationshipType: string
      relevanceScore: number
      explanation: string
      sharedAttributes: string[]
    }>
    insights: {
      patterns: string[]
      recommendations: string[]
      opportunities: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/recommendations/related`, {
      asset_id: assetId,
      relationship_types: relationshipTypes,
      limit
    })
  }

  /**
   * Get data usage recommendations
   * Maps to: AIService.recommend_data_usage()
   */
  async recommendDataUsage(
    assetId: string,
    userContext?: {
      role: string
      department: string
      projects: string[]
    }
  ): Promise<{
    usageRecommendations: Array<{
      useCase: string
      description: string
      difficulty: 'easy' | 'medium' | 'hard'
      value: number
      prerequisites: string[]
      steps: string[]
    }>
    bestPractices: string[]
    warnings: string[]
    examples: Array<{
      title: string
      description: string
      code?: string
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/recommendations/usage`, {
      asset_id: assetId,
      user_context: userContext || {}
    })
  }

  // ===================== AUTO-CLASSIFICATION =====================

  /**
   * Auto-classify data assets
   * Maps to: ClassificationService.classify_data_assets()
   */
  async autoClassifyAssets(request: ClassificationRequest): Promise<{
    classifications: Array<{
      assetId: string
      classifications: AutoClassificationResult[]
      confidence: number
      suggestedTags: string[]
      sensitivityLevel: string
    }>
    summary: {
      totalProcessed: number
      classified: number
      highConfidence: number
      needsReview: number
    }
  }> {
    return apiClient.post(`${this.baseUrl}/classification/auto-classify`, request)
  }

  /**
   * Detect sensitive data
   * Maps to: ClassificationService.detect_sensitive_data()
   */
  async detectSensitiveData(
    assetId: string,
    scanDepth: 'column' | 'sample' | 'full' = 'column'
  ): Promise<{
    sensitiveColumns: Array<{
      columnName: string
      dataType: string
      sensitivityType: string
      confidence: number
      examples: string[]
      riskLevel: 'high' | 'medium' | 'low'
      complianceImpact: string[]
    }>
    overallRisk: string
    complianceRequirements: string[]
    recommendations: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/classification/sensitive-data`, {
      asset_id: assetId,
      scan_depth: scanDepth
    })
  }

  /**
   * Suggest classification rules
   * Maps to: AIService.suggest_classification_rules()
   */
  async suggestClassificationRules(
    domain?: string,
    assetTypes?: string[]
  ): Promise<{
    suggestedRules: Array<{
      name: string
      description: string
      conditions: Record<string, any>
      classification: string
      confidence: number
      applicableAssets: string[]
    }>
    patterns: Array<{
      pattern: string
      frequency: number
      classification: string
      examples: string[]
    }>
    recommendations: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/classification/suggest-rules`, {
      domain,
      asset_types: assetTypes || []
    })
  }

  // ===================== PATTERN RECOGNITION =====================

  /**
   * Detect data patterns
   * Maps to: AIService.detect_data_patterns()
   */
  async detectDataPatterns(
    assetIds: string[],
    patternTypes: string[] = ['structural', 'semantic', 'usage', 'quality']
  ): Promise<{
    patterns: Array<{
      type: string
      pattern: string
      description: string
      frequency: number
      assets: string[]
      confidence: number
      significance: 'high' | 'medium' | 'low'
    }>
    insights: PatternRecognitionResult[]
    recommendations: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/patterns/detect`, {
      asset_ids: assetIds,
      pattern_types: patternTypes
    })
  }

  /**
   * Anomaly detection
   * Maps to: AIService.detect_anomalies()
   */
  async detectAnomalies(
    assetId: string,
    detectionType: 'statistical' | 'ml' | 'hybrid' = 'hybrid'
  ): Promise<{
    anomalies: AnomalyDetectionResult[]
    summary: {
      totalAnomalies: number
      severity: Record<string, number>
      types: Record<string, number>
    }
    insights: {
      patterns: string[]
      rootCauses: string[]
      recommendations: string[]
    }
    monitoring: {
      alertThresholds: Record<string, number>
      suggestions: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/patterns/anomalies`, {
      asset_id: assetId,
      detection_type: detectionType
    })
  }

  /**
   * Detect schema evolution patterns
   * Maps to: AIService.detect_schema_evolution()
   */
  async detectSchemaEvolution(assetId: string): Promise<{
    evolutionHistory: Array<{
      timestamp: string
      changes: Array<{
        type: 'added' | 'removed' | 'modified'
        element: string
        details: Record<string, any>
      }>
      impact: string
      version: string
    }>
    patterns: Array<{
      pattern: string
      frequency: number
      trend: string
      prediction: string
    }>
    recommendations: Array<{
      type: string
      description: string
      priority: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/patterns/schema-evolution/${assetId}`)
  }

  // ===================== PREDICTIVE ANALYTICS =====================

  /**
   * Generate predictive insights
   * Maps to: MLService.generate_predictions()
   */
  async generatePredictiveInsights(
    assetId: string,
    predictionTypes: string[] = ['usage', 'quality', 'performance', 'cost'],
    timeHorizon: string = '30d'
  ): Promise<{
    predictions: Array<{
      type: string
      predictions: Array<{
        date: string
        value: number
        confidence: number
        factors: string[]
      }>
      accuracy: number
      trend: string
    }>
    insights: PredictiveAnalysis[]
    recommendations: Array<{
      category: string
      action: string
      impact: string
      timeline: string
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/predictions/insights`, {
      asset_id: assetId,
      prediction_types: predictionTypes,
      time_horizon: timeHorizon
    })
  }

  /**
   * Predict data quality trends
   * Maps to: MLService.predict_quality_trends()
   */
  async predictQualityTrends(
    assetIds: string[],
    timeHorizon: string = '90d'
  ): Promise<Array<{
    assetId: string
    currentQuality: number
    predictions: Array<{
      date: string
      qualityScore: number
      confidence: number
      riskFactors: string[]
    }>
    recommendations: Array<{
      action: string
      expectedImprovement: number
      effort: string
    }>
  }>> {
    return apiClient.post(`${this.baseUrl}/predictions/quality`, {
      asset_ids: assetIds,
      time_horizon: timeHorizon
    })
  }

  /**
   * Predict usage patterns
   * Maps to: MLService.predict_usage_patterns()
   */
  async predictUsagePatterns(
    assetId: string,
    timeHorizon: string = '60d'
  ): Promise<{
    currentUsage: {
      daily: number
      weekly: number
      monthly: number
      trend: string
    }
    predictions: Array<{
      date: string
      predictedUsage: number
      confidence: number
      factors: string[]
    }>
    seasonality: {
      detected: boolean
      patterns: Array<{
        period: string
        strength: number
      }>
    }
    insights: {
      peaks: string[]
      valleys: string[]
      trends: string[]
      recommendations: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/predictions/usage`, {
      asset_id: assetId,
      time_horizon: timeHorizon
    })
  }

  // ===================== ML MODEL MANAGEMENT =====================

  /**
   * Train ML models for catalog intelligence
   * Maps to: MLService.train_model()
   */
  async trainMLModel(request: MLTrainingRequest): Promise<{
    modelId: string
    trainingStatus: 'started' | 'in_progress' | 'completed' | 'failed'
    metrics: ModelMetrics
    estimatedCompletion: string
    modelInfo: {
      type: string
      algorithm: string
      features: string[]
      targetVariable: string
    }
  }> {
    return apiClient.post(`${this.baseUrl}/models/train`, request)
  }

  /**
   * Get ML model performance
   * Maps to: MLService.get_model_performance()
   */
  async getModelPerformance(modelId: string): Promise<{
    model: MLModel
    performance: ModelMetrics
    featureImportance: FeatureImportance[]
    validationResults: {
      accuracy: number
      precision: number
      recall: number
      f1Score: number
      confusionMatrix: number[][]
    }
    recommendations: string[]
  }> {
    return apiClient.get(`${this.baseUrl}/models/${modelId}/performance`)
  }

  /**
   * Make predictions using trained models
   * Maps to: MLService.make_prediction()
   */
  async makePrediction(request: PredictionRequest): Promise<{
    predictions: ModelPrediction[]
    confidence: number
    explanation: {
      keyFactors: string[]
      reasoning: string
      alternatives: Array<{
        prediction: any
        probability: number
      }>
    }
    modelInfo: {
      modelId: string
      version: string
      lastTrained: string
    }
  }> {
    return apiClient.post(`${this.baseUrl}/models/predict`, request)
  }

  /**
   * Get available ML models
   * Maps to: MLService.list_models()
   */
  async getAvailableModels(category?: string): Promise<{
    models: Array<{
      id: string
      name: string
      description: string
      category: string
      version: string
      status: string
      accuracy: number
      lastTrained: string
      usageCount: number
    }>
    categories: Array<{
      name: string
      count: number
      description: string
    }>
  }> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    
    return apiClient.get(`${this.baseUrl}/models?${params.toString()}`)
  }

  // ===================== CONTEXTUAL INTELLIGENCE =====================

  /**
   * Generate contextual insights
   * Maps to: AdvancedAIService.generate_contextual_insights()
   */
  async generateContextualInsights(
    assetId: string,
    context: {
      userRole?: string
      businessDomain?: string
      analysisGoal?: string
      timeframe?: string
    }
  ): Promise<{
    insights: ContextualInsight[]
    recommendations: Array<{
      category: string
      insight: string
      action: string
      priority: string
      impact: string
    }>
    contextualFactors: Array<{
      factor: string
      relevance: number
      explanation: string
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/intelligence/contextual`, {
      asset_id: assetId,
      context
    })
  }

  /**
   * Generate business intelligence
   * Maps to: AdvancedAIService.generate_business_intelligence()
   */
  async generateBusinessIntelligence(
    assetIds: string[],
    businessQuestions: string[]
  ): Promise<{
    intelligence: Array<{
      question: string
      answer: string
      confidence: number
      supportingData: Array<{
        assetId: string
        evidence: string
        relevance: number
      }>
      visualizations: Array<{
        type: string
        data: any
        description: string
      }>
    }>
    insights: AIInsight[]
    recommendations: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/intelligence/business`, {
      asset_ids: assetIds,
      business_questions: businessQuestions
    })
  }

  /**
   * Auto-generate tags and metadata
   * Maps to: AIService.auto_generate_tags()
   */
  async autoGenerateTagsAndMetadata(
    assetIds: string[],
    includeBusinessContext: boolean = true
  ): Promise<Array<{
    assetId: string
    suggestedTags: Array<{
      tag: string
      confidence: number
      category: string
      reasoning: string
    }>
    metadata: Record<string, any>
    businessContext: {
      domain: string
      purpose: string
      stakeholders: string[]
      useCases: string[]
    }
  }>> {
    return apiClient.post(`${this.baseUrl}/intelligence/auto-tag`, {
      asset_ids: assetIds,
      include_business_context: includeBusinessContext
    })
  }

  // ===================== AI MODEL MONITORING =====================

  /**
   * Monitor AI model drift
   * Maps to: MLService.monitor_model_drift()
   */
  async monitorModelDrift(modelId: string): Promise<{
    driftScore: number
    driftType: 'data' | 'concept' | 'prediction' | 'none'
    metrics: {
      inputDrift: number
      outputDrift: number
      performanceDrift: number
    }
    recommendations: Array<{
      action: string
      urgency: string
      description: string
    }>
    trends: Array<{
      date: string
      driftScore: number
      performance: number
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/models/${modelId}/drift`)
  }

  /**
   * Retrain models automatically
   * Maps to: MLService.auto_retrain_model()
   */
  async autoRetrainModel(
    modelId: string,
    options?: {
      triggerThreshold?: number
      useLatestData?: boolean
      preserveBaseline?: boolean
    }
  ): Promise<{
    retrainingId: string
    status: string
    estimatedCompletion: string
    newModelId?: string
    improvements: {
      expectedAccuracyGain: number
      dataFreshness: string
      featureUpdates: string[]
    }
  }> {
    return apiClient.post(`${this.baseUrl}/models/${modelId}/retrain`, options || {})
  }

  /**
   * Get AI system health
   * Maps to: AIService.get_system_health()
   */
  async getAISystemHealth(): Promise<{
    overallHealth: 'healthy' | 'warning' | 'critical'
    components: Array<{
      component: string
      status: string
      performance: number
      issues: string[]
    }>
    metrics: {
      activeModels: number
      trainingJobs: number
      predictionLoad: number
      errorRate: number
    }
    recommendations: string[]
  }> {
    return apiClient.get(`${this.baseUrl}/system/health`)
  }

  // ===================== REAL-TIME AI PROCESSING =====================

  /**
   * Process real-time AI requests
   * Maps to: Real-time AI processing endpoints
   */
  async processRealTimeRequest(
    requestType: string,
    data: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<{
    requestId: string
    status: 'processing' | 'completed' | 'failed'
    result?: any
    estimatedCompletion?: string
    queuePosition?: number
  }> {
    return apiClient.post(`${this.baseUrl}/real-time/process`, {
      request_type: requestType,
      data,
      priority
    })
  }

  /**
   * Subscribe to AI insights stream
   * Maps to: WebSocket AI insights streaming
   */
  subscribeToAIInsights(
    filters: {
      assetIds?: string[]
      insightTypes?: string[]
      minimumConfidence?: number
    },
    callback: (insight: AIInsight) => void
  ): () => void {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/insights/stream`)
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ filters }))
    }
    
    ws.onmessage = (event) => {
      const insight = JSON.parse(event.data)
      callback(insight)
    }
    
    return () => {
      ws.close()
    }
  }
}

// Create singleton instance
export const catalogAIMLApiClient = new CatalogAIMLApiClient()

// Export default
export default catalogAIMLApiClient