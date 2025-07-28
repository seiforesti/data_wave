/**
 * Catalog Intelligence Types - AI/ML Analytics & Recommendations
 * ============================================================
 * 
 * Maps to catalog_intelligence_models.py with comprehensive AI/ML types
 * for semantic understanding, recommendations, and intelligent insights.
 */

import { BaseModel, TimestampedModel } from './base.types';

// ====================== SEMANTIC UNDERSTANDING ======================

export interface SemanticEmbedding extends BaseModel {
  id: string;
  asset_id: string;
  embedding_type: 'text' | 'schema' | 'usage' | 'context';
  embedding_vector: number[];
  dimension: number;
  model_name: string;
  model_version: string;
  confidence_score: number;
  last_updated: string;
  metadata: Record<string, any>;
}

export interface SemanticRelationship extends BaseModel {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  relationship_type: SemanticRelationshipType;
  similarity_score: number;
  confidence_level: number;
  semantic_distance: number;
  relationship_strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  discovered_method: 'embedding_similarity' | 'usage_pattern' | 'schema_analysis' | 'manual';
  evidence: Record<string, any>;
  validated: boolean;
  validation_score?: number;
}

export enum SemanticRelationshipType {
  SIMILAR_CONTENT = 'similar_content',
  SCHEMA_SIMILARITY = 'schema_similarity',
  USAGE_CORRELATION = 'usage_correlation',
  CONCEPTUAL_RELATION = 'conceptual_relation',
  FUNCTIONAL_EQUIVALENT = 'functional_equivalent',
  DATA_LINEAGE = 'data_lineage',
  TEMPORAL_RELATION = 'temporal_relation',
  CONTEXTUAL_SIMILARITY = 'contextual_similarity'
}

// ====================== AI RECOMMENDATION ENGINE ======================

export interface RecommendationEngine extends BaseModel {
  id: string;
  engine_name: string;
  engine_type: RecommendationEngineType;
  model_configuration: ModelConfiguration;
  training_data_sources: string[];
  last_trained: string;
  model_metrics: ModelMetrics;
  active: boolean;
  version: string;
  performance_history: PerformanceMetric[];
}

export enum RecommendationEngineType {
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  HYBRID = 'hybrid',
  DEEP_LEARNING = 'deep_learning',
  GRAPH_BASED = 'graph_based',
  SEMANTIC_MATCHING = 'semantic_matching'
}

export interface ModelConfiguration {
  algorithm: string;
  hyperparameters: Record<string, any>;
  feature_engineering: FeatureConfig[];
  training_parameters: TrainingConfig;
  validation_strategy: ValidationStrategy;
}

export interface FeatureConfig {
  feature_name: string;
  feature_type: 'categorical' | 'numerical' | 'text' | 'embedding' | 'graph';
  weight: number;
  preprocessing_steps: string[];
  enabled: boolean;
}

export interface TrainingConfig {
  batch_size: number;
  epochs: number;
  learning_rate: number;
  regularization: Record<string, number>;
  early_stopping: boolean;
  validation_split: number;
}

export interface ValidationStrategy {
  method: 'cross_validation' | 'time_split' | 'random_split';
  folds?: number;
  test_size: number;
  metrics: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  coverage: number;
  diversity: number;
  novelty: number;
  custom_metrics: Record<string, number>;
}

export interface PerformanceMetric {
  timestamp: string;
  metric_name: string;
  value: number;
  context: Record<string, any>;
}

// ====================== ASSET RECOMMENDATIONS ======================

export interface AssetRecommendation extends BaseModel {
  id: string;
  user_id: string;
  recommended_asset_id: string;
  recommendation_type: RecommendationType;
  confidence_score: number;
  relevance_score: number;
  ranking_position: number;
  recommendation_context: RecommendationContext;
  explanation: RecommendationExplanation;
  interaction_history: UserInteraction[];
  feedback_received?: RecommendationFeedback;
  recommendation_status: 'pending' | 'shown' | 'clicked' | 'dismissed' | 'bookmarked';
  expiry_date?: string;
}

export enum RecommendationType {
  SIMILAR_ASSETS = 'similar_assets',
  FREQUENTLY_USED_TOGETHER = 'frequently_used_together',
  TRENDING_IN_DOMAIN = 'trending_in_domain',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  COST_OPTIMIZATION = 'cost_optimization',
  COMPLIANCE_RELATED = 'compliance_related',
  SKILL_BASED = 'skill_based',
  PROJECT_RELEVANT = 'project_relevant',
  SEASONAL_PATTERN = 'seasonal_pattern'
}

export interface RecommendationContext {
  user_role: string;
  current_project?: string;
  search_context?: string;
  usage_patterns: UsagePattern[];
  time_context: 'morning' | 'afternoon' | 'evening' | 'weekend';
  seasonal_context?: string;
  team_context?: string[];
}

export interface UsagePattern {
  pattern_type: string;
  frequency: number;
  time_ranges: string[];
  assets_involved: string[];
  confidence: number;
}

export interface RecommendationExplanation {
  primary_reason: string;
  detailed_reasoning: string[];
  evidence_points: EvidencePoint[];
  similar_users?: string[];
  historical_success_rate: number;
}

export interface EvidencePoint {
  evidence_type: 'usage_similarity' | 'content_similarity' | 'temporal_pattern' | 'team_usage';
  strength: number;
  description: string;
  supporting_data: Record<string, any>;
}

export interface UserInteraction {
  interaction_type: 'view' | 'download' | 'query' | 'bookmark' | 'share';
  timestamp: string;
  duration?: number;
  context: Record<string, any>;
}

export interface RecommendationFeedback {
  feedback_type: 'positive' | 'negative' | 'neutral';
  explicit_rating?: number; // 1-5 scale
  feedback_reason?: string;
  timestamp: string;
  feedback_context: Record<string, any>;
}

// ====================== USAGE PATTERN ANALYSIS ======================

export interface AssetUsagePattern extends BaseModel {
  id: string;
  asset_id: string;
  pattern_type: UsagePatternType;
  pattern_definition: PatternDefinition;
  detection_confidence: number;
  pattern_strength: number;
  temporal_characteristics: TemporalCharacteristics;
  user_segments: UserSegment[];
  business_impact: BusinessImpact;
  anomaly_indicators: AnomalyIndicator[];
  prediction_accuracy: number;
}

export enum UsagePatternType {
  DAILY_ROUTINE = 'daily_routine',
  WEEKLY_CYCLE = 'weekly_cycle',
  MONTHLY_PATTERN = 'monthly_pattern',
  SEASONAL_PATTERN = 'seasonal_pattern',
  EVENT_DRIVEN = 'event_driven',
  BURST_PATTERN = 'burst_pattern',
  GRADUAL_GROWTH = 'gradual_growth',
  DECLINING_USAGE = 'declining_usage',
  IRREGULAR_SPIKES = 'irregular_spikes'
}

export interface PatternDefinition {
  description: string;
  mathematical_model: string;
  key_parameters: Record<string, number>;
  detection_algorithm: string;
  pattern_examples: PatternExample[];
}

export interface PatternExample {
  timestamp_range: { start: string; end: string };
  observed_values: number[];
  pattern_score: number;
  annotations: string[];
}

export interface TemporalCharacteristics {
  periodicity: number; // in hours
  amplitude: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  seasonal_factors: Record<string, number>;
  time_zones_affected: string[];
  peak_hours: number[];
  low_activity_hours: number[];
}

export interface UserSegment {
  segment_id: string;
  segment_name: string;
  user_count: number;
  contribution_percentage: number;
  characteristic_behavior: Record<string, any>;
  geographic_distribution?: Record<string, number>;
}

export interface BusinessImpact {
  revenue_correlation: number;
  cost_implications: CostImplication;
  operational_dependency: OperationalDependency;
  strategic_importance: 'low' | 'medium' | 'high' | 'critical';
  sla_requirements: SLARequirement[];
}

export interface CostImplication {
  compute_cost_impact: number;
  storage_cost_impact: number;
  bandwidth_cost_impact: number;
  maintenance_cost_impact: number;
  optimization_potential: number;
}

export interface OperationalDependency {
  dependent_systems: string[];
  dependency_strength: Record<string, number>;
  failure_impact_radius: string[];
  recovery_time_objective: number; // in minutes
  recovery_point_objective: number; // in minutes
}

export interface SLARequirement {
  metric_name: string;
  target_value: number;
  current_performance: number;
  compliance_percentage: number;
  breach_consequences: string[];
}

export interface AnomalyIndicator {
  anomaly_type: 'spike' | 'drop' | 'drift' | 'missing_data' | 'unusual_pattern';
  detection_timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  affected_metrics: string[];
  potential_causes: string[];
  recommended_actions: string[];
}

// ====================== INTELLIGENCE INSIGHTS ======================

export interface IntelligenceInsight extends BaseModel {
  id: string;
  insight_type: InsightType;
  asset_ids: string[];
  insight_category: InsightCategory;
  title: string;
  description: string;
  detailed_analysis: string;
  evidence: InsightEvidence[];
  confidence_level: number;
  business_value_score: number;
  actionable_recommendations: ActionableRecommendation[];
  stakeholders: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'reviewing' | 'in_progress' | 'implemented' | 'dismissed';
  implementation_effort: ImplementationEffort;
  expected_impact: ExpectedImpact;
  risk_assessment: RiskAssessment;
}

export enum InsightType {
  USAGE_OPTIMIZATION = 'usage_optimization',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  COST_REDUCTION = 'cost_reduction',
  SECURITY_ENHANCEMENT = 'security_enhancement',
  COMPLIANCE_GAP = 'compliance_gap',
  DATA_GOVERNANCE = 'data_governance',
  PERFORMANCE_BOTTLENECK = 'performance_bottleneck',
  REDUNDANCY_DETECTION = 'redundancy_detection',
  INTEGRATION_OPPORTUNITY = 'integration_opportunity',
  TREND_ANALYSIS = 'trend_analysis'
}

export enum InsightCategory {
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  REGULATORY = 'regulatory',
  FINANCIAL = 'financial',
  TECHNICAL = 'technical'
}

export interface InsightEvidence {
  evidence_type: 'statistical' | 'comparative' | 'temporal' | 'predictive' | 'qualitative';
  data_source: string;
  metrics: Record<string, number>;
  visualizations: VisualizationSpec[];
  supporting_documents: string[];
  external_references?: string[];
}

export interface VisualizationSpec {
  chart_type: string;
  data_query: string;
  configuration: Record<string, any>;
  title: string;
  description: string;
}

export interface ActionableRecommendation {
  action_id: string;
  action_title: string;
  action_description: string;
  action_type: 'immediate' | 'short_term' | 'long_term';
  estimated_effort_hours: number;
  required_skills: string[];
  dependencies: string[];
  success_criteria: SuccessCriteria[];
  rollback_plan?: string;
}

export interface SuccessCriteria {
  metric_name: string;
  target_value: number;
  measurement_method: string;
  timeframe: string;
}

export interface ImplementationEffort {
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  estimated_hours: number;
  required_resources: Resource[];
  timeline_weeks: number;
  dependencies: string[];
  risks: string[];
}

export interface Resource {
  resource_type: 'human' | 'technical' | 'financial';
  quantity: number;
  skills_required?: string[];
  cost_estimate?: number;
}

export interface ExpectedImpact {
  financial_impact: FinancialImpact;
  operational_impact: OperationalImpact;
  strategic_impact: StrategicImpact;
  timeline_to_impact: string;
  confidence_interval: { min: number; max: number };
}

export interface FinancialImpact {
  cost_savings_annual: number;
  revenue_opportunity: number;
  investment_required: number;
  roi_percentage: number;
  payback_period_months: number;
}

export interface OperationalImpact {
  efficiency_improvement_percentage: number;
  quality_improvement_score: number;
  automation_potential: number;
  process_simplification: string[];
  risk_reduction_score: number;
}

export interface StrategicImpact {
  competitive_advantage: string[];
  innovation_enablement: string[];
  scalability_improvement: number;
  compliance_enhancement: string[];
  stakeholder_satisfaction: number;
}

export interface RiskAssessment {
  implementation_risks: Risk[];
  business_risks: Risk[];
  technical_risks: Risk[];
  overall_risk_score: number;
  mitigation_strategies: MitigationStrategy[];
}

export interface Risk {
  risk_type: string;
  description: string;
  probability: number;
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  early_warning_indicators: string[];
}

export interface MitigationStrategy {
  strategy_name: string;
  description: string;
  effectiveness_score: number;
  implementation_cost: number;
  monitoring_requirements: string[];
}

// ====================== COLLABORATION INSIGHTS ======================

export interface CollaborationInsight extends BaseModel {
  id: string;
  insight_type: CollaborationInsightType;
  team_id?: string;
  user_ids: string[];
  asset_ids: string[];
  collaboration_patterns: CollaborationPattern[];
  team_dynamics: TeamDynamics;
  knowledge_gaps: KnowledgeGap[];
  collaboration_opportunities: CollaborationOpportunity[];
  efficiency_metrics: EfficiencyMetrics;
  recommendations: CollaborationRecommendation[];
}

export enum CollaborationInsightType {
  TEAM_EFFICIENCY = 'team_efficiency',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  EXPERTISE_MAPPING = 'expertise_mapping',
  COLLABORATION_GAPS = 'collaboration_gaps',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization',
  CROSS_TEAM_SYNERGY = 'cross_team_synergy'
}

export interface CollaborationPattern {
  pattern_name: string;
  participants: string[];
  frequency: number;
  duration_average: number;
  success_rate: number;
  asset_types_involved: string[];
  time_patterns: string[];
  communication_channels: string[];
}

export interface TeamDynamics {
  team_size: number;
  expertise_distribution: Record<string, number>;
  collaboration_frequency: number;
  knowledge_sharing_score: number;
  decision_making_speed: number;
  conflict_resolution_effectiveness: number;
  innovation_index: number;
}

export interface KnowledgeGap {
  gap_area: string;
  affected_users: string[];
  impact_severity: number;
  knowledge_sources: string[];
  learning_resources: string[];
  estimated_learning_time: number;
}

export interface CollaborationOpportunity {
  opportunity_type: string;
  potential_participants: string[];
  expected_benefits: string[];
  implementation_complexity: number;
  success_probability: number;
  resource_requirements: string[];
}

export interface EfficiencyMetrics {
  task_completion_time: number;
  rework_percentage: number;
  knowledge_reuse_rate: number;
  communication_efficiency: number;
  decision_quality_score: number;
  learning_velocity: number;
}

export interface CollaborationRecommendation {
  recommendation_type: string;
  target_users: string[];
  action_items: string[];
  expected_outcomes: string[];
  success_metrics: string[];
  implementation_timeline: string;
}

// ====================== REQUEST/RESPONSE TYPES ======================

export interface IntelligenceAnalysisRequest {
  asset_ids?: string[];
  user_id?: string;
  team_id?: string;
  analysis_types: InsightType[];
  time_range?: {
    start: string;
    end: string;
  };
  include_predictions?: boolean;
  confidence_threshold?: number;
}

export interface IntelligenceAnalysisResponse {
  insights: IntelligenceInsight[];
  usage_patterns: AssetUsagePattern[];
  recommendations: AssetRecommendation[];
  collaboration_insights: CollaborationInsight[];
  summary_metrics: Record<string, number>;
  analysis_metadata: {
    generated_at: string;
    analysis_duration_ms: number;
    data_quality_score: number;
    coverage_percentage: number;
  };
}

export interface RecommendationRequest {
  user_id: string;
  context?: RecommendationContext;
  recommendation_types?: RecommendationType[];
  max_recommendations?: number;
  exclude_assets?: string[];
  include_explanations?: boolean;
}

export interface RecommendationResponse {
  recommendations: AssetRecommendation[];
  total_count: number;
  personalization_score: number;
  recommendation_metadata: {
    algorithm_used: string;
    model_version: string;
    confidence_threshold: number;
    generation_time_ms: number;
  };
}

export interface SemanticSearchRequest {
  query: string;
  embedding_types?: string[];
  similarity_threshold?: number;
  max_results?: number;
  boost_factors?: Record<string, number>;
  filters?: Record<string, any>;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  semantic_relationships: SemanticRelationship[];
  query_understanding: QueryUnderstanding;
  search_metadata: {
    total_results: number;
    search_time_ms: number;
    model_used: string;
    query_expansion?: string[];
  };
}

export interface SemanticSearchResult {
  asset_id: string;
  similarity_score: number;
  semantic_distance: number;
  matching_aspects: string[];
  explanation: string;
  highlighted_content?: Record<string, string>;
}

export interface QueryUnderstanding {
  intent: string;
  entities: ExtractedEntity[];
  concepts: string[];
  refined_query: string;
  confidence_score: number;
}

export interface ExtractedEntity {
  entity_type: string;
  entity_value: string;
  confidence: number;
  start_position: number;
  end_position: number;
}