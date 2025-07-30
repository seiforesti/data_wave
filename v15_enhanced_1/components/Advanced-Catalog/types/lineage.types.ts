// ============================================================================
// ADVANCED CATALOG LINEAGE TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: advanced_lineage_service.py, lineage_service.py, data_lineage_models.py
// ============================================================================

import { 
  EnterpriseDataLineage, 
  DataLineageNode, 
  DataLineageEdge,
  IntelligentDataAsset,
  TimePeriod 
} from './catalog-core.types';

// ============================================================================
// BACKEND-ALIGNED LINEAGE TYPES (advanced_lineage_service.py)
// ============================================================================

// Core backend dataclasses alignment
export interface LineageQuery {
  asset_id: string;
  direction: LineageDirection;
  max_depth: number;
  include_column_lineage: boolean;
  filter_confidence: number;
  filter_asset_types?: string[];
  include_transformations: boolean;
  include_metadata: boolean;
}

export interface LineageNode {
  node_id: string;
  asset_type: string;
  asset_name: string;
  schema_name?: string;
  database_name?: string;
  metadata: Record<string, any>;
  level: number;
  distance: number;
}

export interface LineageEdge {
  source_id: string;
  target_id: string;
  lineage_type: LineageType;
  transformation_type?: TransformationType;
  confidence: number;
  metadata: Record<string, any>;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  root_node: string;
  direction: LineageDirection;
  max_depth: number;
  total_nodes: number;
  total_edges: number;
  query_metadata: Record<string, any>;
}

export interface ImpactAnalysisResult {
  source_asset: string;
  affected_assets: Record<string, any>[];
  impact_score: number;
  critical_path: string[];
  recommended_actions: string[];
  analysis_metadata: Record<string, any>;
}

// Backend Graph Algorithms
export enum GraphAlgorithm {
  BREADTH_FIRST = 'breadth_first',
  DEPTH_FIRST = 'depth_first',
  SHORTEST_PATH = 'shortest_path',
  ALL_PATHS = 'all_paths',
  CRITICAL_PATH = 'critical_path',
  CENTRALITY_BASED = 'centrality_based'
}

export enum LineageUpdateType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BULK_LOAD = 'bulk_load',
  SYNC = 'sync'
}

// Backend API Request Models
export interface LineageQueryRequest {
  asset_id: string;
  direction: LineageDirection;
  max_depth: number;
  include_column_lineage: boolean;
  filter_confidence: number;
  filter_asset_types?: string[];
  include_transformations: boolean;
  include_metadata: boolean;
  algorithm: string;
}

export interface ImpactAnalysisRequest {
  source_asset_id: string;
  change_type: string;
  change_details?: Record<string, any>;
  include_recommendations: boolean;
  analysis_depth: number;
  priority_threshold: number;
}

export interface LineageUpdateRequest {
  update_type: string;
  lineage_data: Record<string, any>;
  source_system: string;
  update_metadata: Record<string, any>;
}

export interface LineageVisualizationRequest {
  asset_ids: string[];
  layout_type: string;
  include_column_level: boolean;
  max_nodes: number;
  visualization_config: Record<string, any>;
}

export interface LineageMetricsRequest {
  time_window: string;
  aggregation_level: string;
  include_predictions: boolean;
  asset_filter?: string[];
}

export interface LineageSearchRequest {
  search_query: string;
  search_type: string;
  max_results: number;
  include_lineage: boolean;
}

// Backend Service Response Types
export interface LineageQueryResponse {
  lineage_graph: {
    nodes: LineageNode[];
    edges: LineageEdge[];
    root_node: string;
    direction: LineageDirection;
    max_depth: number;
    total_nodes: number;
    total_edges: number;
    query_metadata: Record<string, any>;
  };
  execution_time: number;
  cache_hit: boolean;
  algorithm_used: string;
}

export interface LineageStreamResponse {
  update_type: string;
  asset_id: string;
  lineage_data: Record<string, any>;
  timestamp: string;
  source_system: string;
}

export interface LineageDependenciesResponse {
  asset_id: string;
  dependencies: {
    upstream: Record<string, any>[];
    downstream: Record<string, any>[];
    indirect: Record<string, any>[];
  };
  dependency_count: {
    upstream: number;
    downstream: number;
    indirect: number;
  };
  critical_dependencies: string[];
  risk_assessment: Record<string, any>;
}

export interface LineageImpactAnalysisResponse {
  analysis_id: string;
  source_asset_id: string;
  change_type: string;
  affected_assets: Record<string, any>[];
  impact_score: number;
  critical_path: string[];
  recommended_actions: string[];
  risk_level: string;
  business_impact: Record<string, any>;
  technical_impact: Record<string, any>;
  analysis_metadata: Record<string, any>;
  created_at: string;
  status: string;
}

export interface LineageVisualizationResponse {
  visualization_id: string;
  asset_ids: string[];
  graph_data: {
    nodes: LineageNode[];
    edges: LineageEdge[];
  };
  layout_config: Record<string, any>;
  export_formats: string[];
  interactive_url?: string;
  generated_at: string;
}

export interface LineageMetricsResponse {
  time_window: string;
  metrics: {
    total_lineages: number;
    active_lineages: number;
    average_confidence: number;
    coverage_percentage: number;
    discovery_rate: number;
    validation_success_rate: number;
  };
  trends: Record<string, any>[];
  predictions: Record<string, any>[];
  generated_at: string;
}

export interface LineageSearchResponse {
  query: string;
  results: Record<string, any>[];
  total_results: number;
  search_time: number;
  suggestions: string[];
  facets: Record<string, any>;
}

export interface LineageDiscoveryResponse {
  discovery_id: string;
  data_source_ids: number[];
  status: string;
  progress: number;
  discovered_lineages: number;
  errors: string[];
  warnings: string[];
  started_at: string;
  estimated_completion?: string;
}

// Backend Health and Performance Types
export interface LineageHealthResponse {
  status: string;
  uptime: number;
  version: string;
  graph_size: number;
  cache_status: Record<string, any>;
  performance_metrics: Record<string, any>;
  last_graph_update: string;
}

// Backend Batch Operations
export interface BatchImpactAnalysisRequest {
  asset_ids: string[];
  change_type: string;
  analysis_config: Record<string, any>;
}

export interface BatchImpactAnalysisResponse {
  batch_id: string;
  total_assets: number;
  completed_analyses: number;
  failed_analyses: number;
  results: Record<string, LineageImpactAnalysisResponse>;
  summary: Record<string, any>;
  created_at: string;
}

// Backend Real-time Updates
export interface LineageRealTimeUpdate {
  update_id: string;
  update_type: LineageUpdateType;
  asset_id: string;
  lineage_data: Record<string, any>;
  source_system: string;
  timestamp: string;
  user_id?: string;
  validation_status: string;
  impact_assessment?: Record<string, any>;
}

// Backend Validation and Governance
export interface LineageValidationResponse {
  validation_id: string;
  asset_id: string;
  validation_rules: Record<string, any>[];
  results: Record<string, any>[];
  overall_status: string;
  issues_found: number;
  recommendations: string[];
  validated_at: string;
}

export interface LineageGovernanceResponse {
  policies: Record<string, any>[];
  compliance_status: Record<string, any>;
  violations: Record<string, any>[];
  recommendations: string[];
  last_assessment: string;
}

// ============================================================================
// ADVANCED LINEAGE TYPES (advanced_lineage_service.py)
// ============================================================================

export interface LineageVisualization {
  id: string;
  name: string;
  description?: string;
  
  // Visualization Configuration
  config: LineageVisualizationConfig;
  
  // Graph Data
  nodes: LineageVisualizationNode[];
  edges: LineageVisualizationEdge[];
  
  // Layout Configuration
  layout: LineageLayoutConfig;
  
  // Filters & Views
  filters: LineageFilter[];
  views: LineageView[];
  
  // Interactive Features
  interactionConfig: LineageInteractionConfig;
  
  // Performance
  performance: LineageVisualizationPerformance;
  
  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
}

export interface LineageVisualizationNode {
  id: string;
  assetId: string;
  nodeType: LineageNodeType;
  
  // Visual Properties
  position: NodePosition;
  style: NodeStyle;
  
  // Node Data
  data: LineageNodeData;
  
  // Metadata
  metadata: LineageNodeMetadata;
  
  // State
  state: LineageNodeState;
  
  // Interactions
  interactions: NodeInteraction[];
}

export interface LineageVisualizationEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  
  // Edge Properties
  edgeType: LineageEdgeType;
  transformationType: TransformationType;
  
  // Visual Properties
  style: EdgeStyle;
  path?: EdgePath;
  
  // Edge Data
  data: LineageEdgeData;
  
  // Metadata
  metadata: LineageEdgeMetadata;
  
  // State
  state: LineageEdgeState;
  
  // Confidence & Quality
  confidence: number;
  quality: LineageQuality;
}

export interface LineageTraversalEngine {
  id: string;
  name: string;
  
  // Traversal Configuration
  config: TraversalConfig;
  
  // Traversal Algorithms
  algorithms: TraversalAlgorithm[];
  
  // Path Finding
  pathFinder: LineagePathFinder;
  
  // Impact Analysis
  impactAnalyzer: LineageImpactAnalyzer;
  
  // Performance
  performance: TraversalPerformance;
  
  // Cache
  cache: TraversalCache;
}

export interface LineageImpactAnalysis {
  id: string;
  sourceAssetId: string;
  analysisType: ImpactAnalysisType;
  
  // Impact Results
  impactedAssets: ImpactedAsset[];
  impactRadius: number;
  
  // Impact Categories
  directImpacts: DirectImpact[];
  indirectImpacts: IndirectImpact[];
  cascadingImpacts: CascadingImpact[];
  
  // Risk Assessment
  riskAssessment: LineageRiskAssessment;
  
  // Business Impact
  businessImpact: LineageBusinessImpact;
  
  // Technical Impact
  technicalImpact: LineageTechnicalImpact;
  
  // Recommendations
  mitigationRecommendations: MitigationRecommendation[];
  
  // Analysis Metadata
  analysisMetadata: ImpactAnalysisMetadata;
  
  // Timestamps
  analyzedAt: Date;
  validUntil?: Date;
}

// ============================================================================
// MISSING TYPES FOR IMPACT ANALYSIS VIEWER
// ============================================================================

export interface LineageAnalysisResult {
  id: string;
  sourceAssetId: string;
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'COVERAGE' | 'QUALITY';
  
  // Results
  results: LineageImpactAnalysis;
  
  // Metadata
  metadata: {
    executionTime: number;
    confidence: number;
    dataQuality: number;
    lastUpdated: Date;
  };
  
  // Performance
  performance: {
    nodesAnalyzed: number;
    edgesTraversed: number;
    processingTime: number;
  };
}

export interface LineageRiskAssessment {
  id: string;
  sourceAssetId: string;
  
  // Overall Risk
  overallRisk: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    factors: RiskFactor[];
  };
  
  // Risk Categories
  riskCategories: RiskCategory[];
  
  // Risk Mitigation
  riskMitigation: RiskMitigation[];
  
  // Contingency Plans
  contingencyPlans: ContingencyPlan[];
  
  // Monitoring Plan
  monitoringPlan: MonitoringPlan;
  
  // Assessment Metadata
  assessedAt: Date;
  validUntil?: Date;
}

export interface LineageCostAnalysis {
  id: string;
  sourceAssetId: string;
  
  // Total Cost
  totalCost: {
    directCosts: number;
    indirectCosts: number;
    opportunityCosts: number;
    riskCosts: number;
    totalCost: number;
    currency: string;
  };
  
  // Cost Breakdown
  costByCategory: CategoryCost[];
  costByPhase: PhaseCost[];
  costByAsset: AssetCost[];
  
  // ROI Analysis
  roi: ROIAnalysis;
  
  // Sensitivity Analysis
  sensitivity: SensitivityAnalysis;
  
  // Cost Scenarios
  scenarios: CostScenario[];
  
  // Analysis Metadata
  analyzedAt: Date;
  currency: string;
}

export interface LineageROIMetrics {
  investment: number;
  benefits: BenefitItem[];
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
}

export interface LineageBusinessImpact {
  id: string;
  sourceAssetId: string;
  
  // Business Metrics
  revenueImpact: number;
  customerImpact: number;
  operationalImpact: number;
  strategicImpact: number;
  complianceImpact: number;
  brandImpact: number;
  
  // Impact Categories
  categories: BusinessImpactCategory[];
  
  // Business Processes Affected
  affectedProcesses: BusinessProcess[];
  
  // Stakeholder Impact
  stakeholderImpact: StakeholderImpact[];
  
  // Business Continuity
  businessContinuity: BusinessContinuityAssessment;
}

export interface LineageEfficiencyMetrics {
  processingTime: number;
  resourceUtilization: number;
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
}

export interface LineageUsageStatistics {
  totalQueries: number;
  avgQueriesPerDay: number;
  peakUsageTimes: TimeWindow[];
  userDistribution: UserUsageDistribution[];
  queryPatterns: QueryPattern[];
  performanceMetrics: PerformanceMetric[];
}

export interface LineageHealthMetrics {
  overallHealth: number;
  dataQuality: number;
  schemaHealth: number;
  connectivityHealth: number;
  performanceHealth: number;
  governanceHealth: number;
}

export interface LineageReliabilityMetrics {
  uptime: number;
  availability: number;
  errorRate: number;
  meanTimeBetweenFailures: number;
  meanTimeToRecovery: number;
  dataConsistency: number;
}

export interface LineageAvailabilityMetrics {
  currentAvailability: number;
  targetAvailability: number;
  monthlyAvailability: number;
  yearlyAvailability: number;
  downtimeEvents: DowntimeEvent[];
  maintenanceWindows: MaintenanceWindow[];
}

export interface LineageScalabilityMetrics {
  currentScale: ScaleMetrics;
  scalingLimits: ScalingLimits;
  growthTrends: GrowthTrend[];
  capacityPlan: CapacityPlan;
  scalingRecommendations: ScalingRecommendation[];
}

export interface LineagePerformanceMetrics {
  queryPerformance: QueryPerformance;
  indexingPerformance: IndexingPerformance;
  updatePerformance: UpdatePerformance;
  networkPerformance: NetworkPerformance;
  resourceUtilization: ResourceUtilization;
}

export interface LineageQualityContext {
  dataQuality: DataQualityMetrics;
  schemaQuality: SchemaQualityMetrics;
  lineageQuality: LineageQualityMetrics;
  metadataQuality: MetadataQualityMetrics;
}

export interface LineageSecurityContext {
  accessControls: AccessControl[];
  encryptionStatus: EncryptionStatus;
  auditTrail: AuditEvent[];
  securityClassification: SecurityClassification;
  vulnerabilities: SecurityVulnerability[];
}

export interface LineageComplianceContext {
  regulations: ComplianceRegulation[];
  policies: CompliancePolicy[];
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  certifications: ComplianceCertification[];
}

export interface LineageOperationalContext {
  environment: string;
  deployment: DeploymentInfo;
  monitoring: MonitoringConfiguration;
  alerts: AlertConfiguration[];
  maintenance: MaintenanceSchedule[];
}

export interface LineageBusinessContext {
  businessFunction: string;
  businessProcess: string;
  businessOwner: string;
  stakeholders: Stakeholder[];
  businessRules: BusinessRule[];
  kpis: KPI[];
}

export interface LineageDataContext {
  dataTypes: DataTypeInfo[];
  dataVolume: DataVolumeMetrics;
  dataFlow: DataFlowMetrics;
  dataRetention: DataRetentionPolicy;
  dataArchival: DataArchivalPolicy;
}

export interface LineageTechnicalContext {
  platform: string;
  technology: string;
  version: string;
  configuration: TechnicalConfiguration;
  dependencies: TechnicalDependency[];
  integrations: TechnicalIntegration[];
}

export interface LineageGovernanceContext {
  policies: GovernancePolicy[];
  standards: GovernanceStandard[];
  procedures: GovernanceProcedure[];
  roles: GovernanceRole[];
  responsibilities: GovernanceResponsibility[];
}

export interface LineageMetadata {
  id: string;
  version: string;
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
  source: string;
  confidence: number;
  tags: string[];
  annotations: Annotation[];
}

export interface LineageValidationResult {
  id: string;
  lineageId: string;
  validationRuleId: string;
  
  // Validation Outcome
  passed: boolean;
  score: number;
  confidence: number;
  
  // Details
  details: ValidationDetails;
  evidence: ValidationEvidence[];
  
  // Issues Found
  issues: ValidationIssue[];
  
  // Recommendations
  recommendations: ValidationRecommendation[];
  
  // Performance
  validationDuration: number;
  
  // Timestamps
  validatedAt: Date;
}

export interface LineageOptimizationSuggestion {
  id: string;
  type: 'PERFORMANCE' | 'COST' | 'QUALITY' | 'GOVERNANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Suggestion Details
  title: string;
  description: string;
  rationale: string;
  
  // Impact Assessment
  expectedBenefit: string;
  estimatedEffort: number;
  riskLevel: string;
  
  // Implementation
  implementationSteps: string[];
  resources: string[];
  timeline: number;
  
  // Metrics
  successMetrics: string[];
  validationCriteria: string[];
}

export interface LineageComplianceStatus {
  id: string;
  assetId: string;
  
  // Overall Compliance
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'UNKNOWN';
  complianceScore: number;
  
  // Regulation Compliance
  regulationCompliance: RegulationCompliance[];
  
  // Policy Compliance
  policyCompliance: PolicyCompliance[];
  
  // Violations
  violations: ComplianceViolation[];
  
  // Remediation
  remediationPlan: RemediationAction[];
  
  // Assessment Details
  lastAssessed: Date;
  nextAssessment: Date;
  assessedBy: string;
}

export interface LineageSecurityClassification {
  id: string;
  assetId: string;
  
  // Classification Level
  classificationLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET';
  
  // Data Categories
  dataCategories: DataCategory[];
  
  // Sensitivity Indicators
  sensitivityIndicators: SensitivityIndicator[];
  
  // Access Requirements
  accessRequirements: AccessRequirement[];
  
  // Handling Instructions
  handlingInstructions: HandlingInstruction[];
  
  // Classification Metadata
  classifiedBy: string;
  classifiedAt: Date;
  reviewDate: Date;
  declassificationDate?: Date;
}

// ============================================================================
// LINEAGE DISCOVERY & TRACKING TYPES
// ============================================================================

export interface LineageDiscoveryJob {
  id: string;
  name: string;
  status: LineageDiscoveryStatus;
  
  // Discovery Configuration
  config: LineageDiscoveryConfig;
  
  // Scope
  scope: LineageDiscoveryScope;
  
  // Execution
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: LineageDiscoveryProgress;
  
  // Results
  results: LineageDiscoveryResults;
  
  // Performance
  performance: LineageDiscoveryPerformance;
  
  // Errors & Warnings
  errors: LineageDiscoveryError[];
  warnings: LineageDiscoveryWarning[];
}

export interface LineageDiscoveryResults {
  totalLineagesDiscovered: number;
  newLineagesFound: number;
  existingLineagesUpdated: number;
  invalidLineagesRemoved: number;
  
  // Discovery Breakdown
  discoveryByMethod: DiscoveryMethodBreakdown[];
  discoveryByType: LineageTypeBreakdown[];
  
  // Quality Metrics
  averageConfidence: number;
  highConfidenceLineages: number;
  
  // Detailed Results
  discoveredLineages: DiscoveredLineageRelation[];
  updatedLineages: UpdatedLineageRelation[];
  
  // Performance
  discoveryRate: number;
  processingTime: number;
}

export interface LineageTracking {
  id: string;
  assetId: string;
  
  // Tracking Configuration
  config: LineageTrackingConfig;
  
  // Change Detection
  changeDetection: LineageChangeDetection;
  
  // Evolution History
  evolutionHistory: LineageEvolution[];
  
  // Monitoring
  monitoring: LineageMonitoring;
  
  // Alerts
  alerts: LineageAlert[];
  
  // Performance
  performance: LineageTrackingPerformance;
}

export interface LineageEvolution {
  id: string;
  lineageId: string;
  evolutionType: LineageEvolutionType;
  
  // Change Details
  changes: LineageChange[];
  changeReason: LineageChangeReason;
  
  // Impact
  impact: LineageEvolutionImpact;
  
  // Validation
  validated: boolean;
  validationResults: LineageValidationResult[];
  
  // Timestamps
  evolvedAt: Date;
  detectedAt: Date;
  validatedAt?: Date;
}

// ============================================================================
// LINEAGE QUALITY & VALIDATION TYPES
// ============================================================================

export interface LineageQualityAssessment {
  id: string;
  lineageId: string;
  assessmentType: LineageQualityAssessmentType;
  
  // Quality Dimensions
  completeness: LineageCompleteness;
  accuracy: LineageAccuracy;
  consistency: LineageConsistency;
  freshness: LineageFreshness;
  
  // Overall Quality
  overallScore: number;
  qualityGrade: LineageQualityGrade;
  
  // Quality Issues
  issues: LineageQualityIssue[];
  
  // Improvements
  improvements: LineageQualityImprovement[];
  
  // Recommendations
  recommendations: LineageQualityRecommendation[];
  
  // Timestamps
  assessedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface LineageValidationEngine {
  id: string;
  name: string;
  version: string;
  
  // Validation Rules
  rules: LineageValidationRule[];
  
  // Validation Methods
  methods: LineageValidationMethod[];
  
  // Configuration
  config: ValidationEngineConfig;
  
  // Performance
  performance: ValidationEnginePerformance;
  
  // Metrics
  metrics: ValidationEngineMetric[];
}

export interface LineageValidationResult {
  id: string;
  lineageId: string;
  validationRuleId: string;
  
  // Validation Outcome
  passed: boolean;
  score: number;
  confidence: number;
  
  // Details
  details: ValidationDetails;
  evidence: ValidationEvidence[];
  
  // Issues Found
  issues: ValidationIssue[];
  
  // Recommendations
  recommendations: ValidationRecommendation[];
  
  // Performance
  validationDuration: number;
  
  // Timestamps
  validatedAt: Date;
}

// ============================================================================
// LINEAGE ANALYTICS & INSIGHTS TYPES
// ============================================================================

export interface LineageAnalytics {
  id: string;
  name: string;
  
  // Analytics Configuration
  config: LineageAnalyticsConfig;
  
  // Network Analytics
  networkAnalytics: LineageNetworkAnalytics;
  
  // Flow Analytics
  flowAnalytics: LineageFlowAnalytics;
  
  // Pattern Analytics
  patternAnalytics: LineagePatternAnalytics;
  
  // Impact Analytics
  impactAnalytics: LineageImpactAnalytics;
  
  // Trend Analytics
  trendAnalytics: LineageTrendAnalytics;
  
  // Insights
  insights: LineageAnalyticsInsight[];
  
  // Performance
  performance: LineageAnalyticsPerformance;
}

export interface LineageNetworkAnalytics {
  id: string;
  
  // Network Metrics
  totalNodes: number;
  totalEdges: number;
  networkDensity: number;
  
  // Centrality Metrics
  centralityMetrics: CentralityMetric[];
  
  // Clustering
  clusteringCoefficient: number;
  clusters: LineageCluster[];
  
  // Connectivity
  connectivity: NetworkConnectivity;
  
  // Path Analytics
  pathAnalytics: NetworkPathAnalytics;
  
  // Robustness
  robustness: NetworkRobustness;
}

export interface LineageFlowAnalytics {
  id: string;
  
  // Flow Metrics
  totalFlows: number;
  activeFlows: number;
  flowVelocity: number;
  
  // Flow Patterns
  flowPatterns: FlowPattern[];
  
  // Bottlenecks
  bottlenecks: FlowBottleneck[];
  
  // Flow Quality
  flowQuality: FlowQualityMetric[];
  
  // Throughput
  throughput: FlowThroughput;
  
  // Performance
  flowPerformance: FlowPerformanceMetric[];
}

export interface LineagePatternAnalytics {
  id: string;
  
  // Common Patterns
  commonPatterns: LineagePattern[];
  
  // Anti-patterns
  antiPatterns: LineageAntiPattern[];
  
  // Pattern Frequency
  patternFrequency: PatternFrequencyAnalysis;
  
  // Pattern Evolution
  patternEvolution: PatternEvolutionAnalysis;
  
  // Best Practices
  bestPractices: LineageBestPractice[];
  
  // Recommendations
  patternRecommendations: PatternRecommendation[];
}

// ============================================================================
// LINEAGE REPORTING TYPES
// ============================================================================

export interface LineageReport {
  id: string;
  name: string;
  type: LineageReportType;
  
  // Report Configuration
  config: LineageReportConfig;
  
  // Content
  content: LineageReportContent;
  
  // Visualizations
  visualizations: LineageVisualization[];
  
  // Metadata
  metadata: LineageReportMetadata;
  
  // Distribution
  distribution: LineageReportDistribution;
  
  // Status
  status: LineageReportStatus;
  
  // Timestamps
  generatedAt: Date;
  lastUpdated: Date;
}

export interface LineageDocumentation {
  id: string;
  lineageId: string;
  
  // Documentation Content
  description: string;
  businessContext: string;
  technicalDetails: string;
  
  // Transformation Logic
  transformationLogic: TransformationDocumentation[];
  
  // Data Flow
  dataFlow: DataFlowDocumentation;
  
  // Dependencies
  dependencies: DependencyDocumentation[];
  
  // Quality Notes
  qualityNotes: QualityDocumentation[];
  
  // Maintenance
  maintenanceNotes: MaintenanceDocumentation[];
  
  // Version Control
  version: string;
  changeLog: DocumentationChangeLog[];
  
  // Approval
  approvalStatus: DocumentationApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum LineageNodeType {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET',
  TRANSFORMATION = 'TRANSFORMATION',
  AGGREGATION = 'AGGREGATION',
  FILTER = 'FILTER',
  JOIN = 'JOIN',
  UNION = 'UNION',
  SPLIT = 'SPLIT'
}

export enum LineageEdgeType {
  DATA_FLOW = 'DATA_FLOW',
  TRANSFORMATION = 'TRANSFORMATION',
  DEPENDENCY = 'DEPENDENCY',
  TRIGGER = 'TRIGGER',
  CONTROL_FLOW = 'CONTROL_FLOW'
}

export enum TransformationType {
  COPY = 'COPY',
  FILTER = 'FILTER',
  AGGREGATE = 'AGGREGATE',
  JOIN = 'JOIN',
  UNION = 'UNION',
  TRANSFORM = 'TRANSFORM',
  CALCULATE = 'CALCULATE',
  SPLIT = 'SPLIT',
  MERGE = 'MERGE',
  CLEANSE = 'CLEANSE'
}

export enum LineageDiscoveryStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum ImpactAnalysisType {
  DOWNSTREAM = 'DOWNSTREAM',
  UPSTREAM = 'UPSTREAM',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  COMPREHENSIVE = 'COMPREHENSIVE'
}

export enum LineageEvolutionType {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  DELETION = 'DELETION',
  SCHEMA_CHANGE = 'SCHEMA_CHANGE',
  TRANSFORMATION_CHANGE = 'TRANSFORMATION_CHANGE',
  DEPENDENCY_CHANGE = 'DEPENDENCY_CHANGE'
}

export enum LineageQualityGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum LineageQualityAssessmentType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID',
  CONTINUOUS = 'CONTINUOUS'
}

export enum LineageReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  IMPACT_ANALYSIS = 'IMPACT_ANALYSIS',
  QUALITY_REPORT = 'QUALITY_REPORT',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  PERFORMANCE_REPORT = 'PERFORMANCE_REPORT'
}

export enum LineageReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED'
}

export enum DocumentationApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_UPDATE = 'NEEDS_UPDATE'
}

// ============================================================================
// MISSING ENUMS FOR BACKEND ALIGNMENT
// ============================================================================

export enum LineageDirection {
  UPSTREAM = 'UPSTREAM',
  DOWNSTREAM = 'DOWNSTREAM',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum LineageType {
  DATA_FLOW = 'DATA_FLOW',
  TRANSFORMATION = 'TRANSFORMATION',
  DEPENDENCY = 'DEPENDENCY',
  TRIGGER = 'TRIGGER',
  CONTROL_FLOW = 'CONTROL_FLOW'
}

export enum TransformationType {
  COPY = 'COPY',
  FILTER = 'FILTER',
  AGGREGATE = 'AGGREGATE',
  JOIN = 'JOIN',
  UNION = 'UNION',
  TRANSFORM = 'TRANSFORM',
  CALCULATE = 'CALCULATE',
  SPLIT = 'SPLIT',
  MERGE = 'MERGE',
  CLEANSE = 'CLEANSE'
}

export enum LineageVisualizationConfig {
  HIERARCHICAL = 'HIERARCHICAL',
  FORCE_DIRECTED = 'FORCE_DIRECTED',
  CIRCULAR = 'CIRCULAR',
  TREE = 'TREE',
  NETWORK = 'NETWORK'
}

export enum LineageLayoutConfig {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  GRID = 'GRID',
  RADIAL = 'RADIAL',
  LINEAR = 'LINEAR'
}

export enum LineageInteractionConfig {
  ZOOM = 'ZOOM',
  PAN = 'PAN',
  SELECT = 'SELECT',
  HIGHLIGHT = 'HIGHLIGHT',
  FILTER = 'FILTER',
  SEARCH = 'SEARCH'
}

export enum LineageVisualizationPerformance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  OPTIMIZED = 'OPTIMIZED'
}

export enum LineageNodeState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PROCESSING = 'PROCESSING'
}

export enum LineageEdgeState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  VALIDATING = 'VALIDATING'
}

export enum LineageQuality {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  UNKNOWN = 'UNKNOWN'
}

export enum LineageDiscoveryStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum ImpactAnalysisType {
  DOWNSTREAM = 'DOWNSTREAM',
  UPSTREAM = 'UPSTREAM',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  COMPREHENSIVE = 'COMPREHENSIVE'
}

export enum LineageEvolutionType {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  DELETION = 'DELETION',
  SCHEMA_CHANGE = 'SCHEMA_CHANGE',
  TRANSFORMATION_CHANGE = 'TRANSFORMATION_CHANGE',
  DEPENDENCY_CHANGE = 'DEPENDENCY_CHANGE'
}

export enum LineageQualityGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum LineageQualityAssessmentType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID',
  CONTINUOUS = 'CONTINUOUS'
}

export enum LineageReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  IMPACT_ANALYSIS = 'IMPACT_ANALYSIS',
  QUALITY_REPORT = 'QUALITY_REPORT',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  PERFORMANCE_REPORT = 'PERFORMANCE_REPORT'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

// Missing supporting types for backend alignment
export interface NodePosition {
  x: number;
  y: number;
  z?: number;
}

export interface NodeStyle {
  color: string;
  size: number;
  shape: NodeShape;
  icon?: string;
  label?: NodeLabel;
  border?: NodeBorder;
}

export interface EdgeStyle {
  color: string;
  width: number;
  style: EdgeLineStyle;
  arrow?: EdgeArrow;
  label?: EdgeLabel;
}

export interface LineageNodeData {
  asset: IntelligentDataAsset;
  transformations: any[];
  metadata: Record<string, any>;
  metrics: Record<string, number>;
}

export interface LineageEdgeData {
  transformation: any;
  metadata: Record<string, any>;
  metrics: Record<string, number>;
  confidence: number;
}

export interface LineageFilter {
  id: string;
  name: string;
  type: FilterType;
  criteria: FilterCriteria;
  enabled: boolean;
}

export interface LineageView {
  id: string;
  name: string;
  description?: string;
  filters: LineageFilter[];
  layout: LineageLayoutConfig;
  customizations: ViewCustomization[];
}

export interface ImpactedAsset {
  assetId: string;
  asset: IntelligentDataAsset;
  impactLevel: ImpactLevel;
  impactType: ImpactType;
  distance: number;
  pathCount: number;
  riskLevel: RiskLevel;
}

export interface LineageCluster {
  id: string;
  name: string;
  nodes: string[];
  density: number;
  cohesion: number;
  purpose: ClusterPurpose;
}

export interface FlowPattern {
  id: string;
  type: FlowPatternType;
  frequency: number;
  strength: number;
  examples: FlowPatternExample[];
}

export interface LineagePattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  frequency: number;
  examples: PatternExample[];
  bestPractice: boolean;
}

// Additional supporting types
export interface NodeLabel {
  text: string;
  position: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER';
  fontSize: number;
  color: string;
}

export interface NodeBorder {
  width: number;
  color: string;
  style: 'SOLID' | 'DASHED' | 'DOTTED';
}

export interface EdgeArrow {
  type: 'NONE' | 'SINGLE' | 'DOUBLE';
  size: number;
  color: string;
}

export interface EdgeLabel {
  text: string;
  position: 'START' | 'MIDDLE' | 'END';
  fontSize: number;
  color: string;
}

export interface EdgePath {
  type: 'STRAIGHT' | 'CURVED' | 'ORTHOGONAL';
  points: NodePosition[];
}

export interface LineageNodeMetadata {
  confidence: number;
  lastUpdated: Date;
  source: string;
  version: string;
  tags: string[];
}

export interface LineageEdgeMetadata {
  confidence: number;
  lastUpdated: Date;
  source: string;
  version: string;
  transformationLogic: string;
}

export interface NodeInteraction {
  type: 'CLICK' | 'HOVER' | 'DRAG' | 'SELECT';
  enabled: boolean;
  callback?: string;
}

export interface FilterCriteria {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
}

export interface ViewCustomization {
  type: 'COLOR' | 'SIZE' | 'SHAPE' | 'LABEL' | 'LAYOUT';
  target: string;
  value: any;
}

export interface FlowPatternExample {
  id: string;
  description: string;
  frequency: number;
  confidence: number;
}

export interface PatternExample {
  id: string;
  description: string;
  frequency: number;
  confidence: number;
}

// Risk and Impact Types
export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  impact: number;
  mitigation: string;
}

export interface RiskCategory {
  id: string;
  name: string;
  description: string;
  factors: RiskFactor[];
  overallRisk: number;
}

export interface RiskMitigation {
  id: string;
  name: string;
  description: string;
  effectiveness: number;
  cost: number;
  timeline: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ContingencyPlan {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  resources: string[];
}

export interface MonitoringPlan {
  id: string;
  name: string;
  metrics: string[];
  frequency: string;
  thresholds: Record<string, number>;
  alerts: string[];
}

// Business Impact Types
export interface BusinessImpactCategory {
  id: string;
  name: string;
  description: string;
  impactScore: number;
  affectedStakeholders: string[];
  mitigationActions: string[];
}

export interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactScore: number;
  affectedSystems: string[];
}

export interface StakeholderImpact {
  id: string;
  name: string;
  role: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  concerns: string[];
  communicationPlan: string;
}

export interface BusinessContinuityAssessment {
  id: string;
  name: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recoveryTime: number;
  recoveryPoint: number;
  dependencies: string[];
}

// Cost Analysis Types
export interface CategoryCost {
  category: string;
  directCost: number;
  indirectCost: number;
  totalCost: number;
  percentage: number;
}

export interface PhaseCost {
  phase: string;
  cost: number;
  duration: number;
  resources: string[];
}

export interface AssetCost {
  assetId: string;
  assetName: string;
  cost: number;
  costType: 'DIRECT' | 'INDIRECT' | 'OPPORTUNITY' | 'RISK';
}

export interface ROIAnalysis {
  investment: number;
  benefits: BenefitItem[];
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
}

export interface BenefitItem {
  id: string;
  name: string;
  description: string;
  value: number;
  timeframe: number;
  confidence: number;
}

export interface SensitivityAnalysis {
  scenarios: SensitivityScenario[];
  keyVariables: string[];
  riskFactors: string[];
}

export interface SensitivityScenario {
  id: string;
  name: string;
  description: string;
  assumptions: Record<string, any>;
  results: Record<string, number>;
}

export interface CostScenario {
  id: string;
  name: string;
  description: string;
  assumptions: Record<string, any>;
  totalCost: number;
  breakdown: Record<string, number>;
}

// Analytics Types
export interface CentralityMetric {
  nodeId: string;
  betweenness: number;
  closeness: number;
  degree: number;
  eigenvector: number;
}

export interface NetworkConnectivity {
  density: number;
  clustering: number;
  diameter: number;
  averagePathLength: number;
  connectivity: number;
}

export interface NetworkPathAnalytics {
  shortestPaths: number;
  averagePathLength: number;
  pathDistribution: Record<string, number>;
  bottlenecks: string[];
}

export interface NetworkRobustness {
  nodeRobustness: number;
  edgeRobustness: number;
  criticalNodes: string[];
  criticalEdges: string[];
}

export interface FlowBottleneck {
  id: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
  recommendations: string[];
}

export interface FlowQualityMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface FlowThroughput {
  current: number;
  capacity: number;
  utilization: number;
  bottlenecks: string[];
}

export interface FlowPerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

export interface LineagePattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  frequency: number;
  examples: PatternExample[];
  bestPractice: boolean;
}

export interface LineageAntiPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  impact: string;
  mitigation: string;
}

export interface PatternFrequencyAnalysis {
  patternId: string;
  frequency: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  confidence: number;
}

export interface PatternEvolutionAnalysis {
  patternId: string;
  evolution: 'EMERGING' | 'MATURING' | 'DECLINING' | 'STABLE';
  factors: string[];
  predictions: string[];
}

export interface LineageBestPractice {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  implementation: string[];
  examples: string[];
}

export interface PatternRecommendation {
  id: string;
  type: 'ADOPT' | 'AVOID' | 'MODIFY' | 'REPLACE';
  pattern: string;
  rationale: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Time and Performance Types
export interface TimeWindow {
  start: Date;
  end: Date;
  duration: number;
}

export interface UserUsageDistribution {
  userId: string;
  userName: string;
  usageCount: number;
  percentage: number;
}

export interface QueryPattern {
  id: string;
  pattern: string;
  frequency: number;
  performance: number;
  optimization: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface ScaleMetrics {
  nodes: number;
  edges: number;
  storage: number;
  memory: number;
  cpu: number;
}

export interface ScalingLimits {
  maxNodes: number;
  maxEdges: number;
  maxStorage: number;
  maxMemory: number;
  maxCpu: number;
}

export interface GrowthTrend {
  metric: string;
  currentValue: number;
  growthRate: number;
  projection: number;
  timeframe: number;
}

export interface CapacityPlan {
  id: string;
  name: string;
  currentCapacity: ScaleMetrics;
  projectedCapacity: ScaleMetrics;
  scalingActions: ScalingAction[];
  timeline: number;
}

export interface ScalingAction {
  id: string;
  type: 'HORIZONTAL' | 'VERTICAL' | 'OPTIMIZATION';
  description: string;
  cost: number;
  timeline: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ScalingRecommendation {
  id: string;
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  description: string;
  rationale: string;
  cost: number;
  benefit: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Quality Types
export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  uniqueness: number;
}

export interface SchemaQualityMetrics {
  structure: number;
  naming: number;
  documentation: number;
  standardization: number;
  evolution: number;
}

export interface LineageQualityMetrics {
  completeness: number;
  accuracy: number;
  freshness: number;
  consistency: number;
  traceability: number;
}

export interface MetadataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  relevance: number;
  accessibility: number;
}

// Security Types
export interface AccessControl {
  id: string;
  type: 'ROLE_BASED' | 'ATTRIBUTE_BASED' | 'POLICY_BASED';
  subjects: string[];
  resources: string[];
  actions: string[];
  conditions: Record<string, any>;
}

export interface EncryptionStatus {
  algorithm: string;
  keySize: number;
  status: 'ENCRYPTED' | 'UNENCRYPTED' | 'PARTIAL';
  lastUpdated: Date;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  details: Record<string, any>;
}

export interface SecurityVulnerability {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  remediation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

// Compliance Types
export interface ComplianceRegulation {
  id: string;
  name: string;
  version: string;
  jurisdiction: string;
  requirements: ComplianceRequirement[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: ComplianceRequirement[];
  enforcement: 'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL';
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
}

export interface ComplianceViolation {
  id: string;
  requirement: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  remediation: string;
}

export interface ComplianceCertification {
  id: string;
  name: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

// Operational Types
export interface DeploymentInfo {
  environment: string;
  version: string;
  deploymentDate: Date;
  status: 'ACTIVE' | 'DEPRECATED' | 'MAINTENANCE';
}

export interface MonitoringConfiguration {
  enabled: boolean;
  metrics: string[];
  thresholds: Record<string, number>;
  alerts: AlertConfiguration[];
}

export interface AlertConfiguration {
  id: string;
  name: string;
  condition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actions: string[];
  enabled: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  type: 'PLANNED' | 'EMERGENCY';
  description: string;
  startTime: Date;
  endTime: Date;
  impact: 'NONE' | 'MINIMAL' | 'MODERATE' | 'HIGH';
}

// Business Types
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  contact: string;
  responsibilities: string[];
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

// Data Types
export interface DataTypeInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  examples: string[];
  constraints: string[];
}

export interface DataVolumeMetrics {
  current: number;
  historical: number;
  projected: number;
  unit: string;
  growthRate: number;
}

export interface DataFlowMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
  unit: string;
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  retentionPeriod: number;
  retentionUnit: 'DAYS' | 'MONTHS' | 'YEARS';
  archivalPolicy: string;
  deletionPolicy: string;
}

export interface DataArchivalPolicy {
  id: string;
  name: string;
  archivalTrigger: string;
  archivalLocation: string;
  retrievalPolicy: string;
  retentionPeriod: number;
}

// Technical Types
export interface TechnicalConfiguration {
  id: string;
  name: string;
  value: string;
  category: string;
  description: string;
  lastUpdated: Date;
}

export interface TechnicalDependency {
  id: string;
  name: string;
  version: string;
  type: 'REQUIRED' | 'OPTIONAL' | 'CONFLICTING';
  description: string;
}

export interface TechnicalIntegration {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSync: Date;
}

// Governance Types
export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  scope: string;
  enforcement: 'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL';
}

export interface GovernanceStandard {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  compliance: string[];
}

export interface GovernanceProcedure {
  id: string;
  name: string;
  description: string;
  steps: string[];
  responsible: string;
  timeline: number;
}

export interface GovernanceRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  responsibilities: string[];
  reportingTo: string;
}

export interface GovernanceResponsibility {
  id: string;
  name: string;
  description: string;
  owner: string;
  stakeholders: string[];
  metrics: string[];
}

// Validation Types
export interface ValidationDetails {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PASSED' | 'FAILED' | 'WARNING';
}

export interface ValidationEvidence {
  id: string;
  type: 'DATA' | 'METADATA' | 'LOG' | 'DOCUMENT';
  source: string;
  content: string;
  timestamp: Date;
}

export interface ValidationIssue {
  id: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  suggestion: string;
}

export interface ValidationRecommendation {
  id: string;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  effort: number;
  impact: number;
}

// Discovery Types
export interface LineageDiscoveryConfig {
  id: string;
  name: string;
  description: string;
  methods: DiscoveryMethod[];
  scope: LineageDiscoveryScope;
  schedule: DiscoverySchedule;
}

export interface DiscoveryMethod {
  id: string;
  name: string;
  type: 'SQL_PARSING' | 'METADATA_ANALYSIS' | 'EXECUTION_LOGS' | 'AI_DISCOVERY';
  enabled: boolean;
  confidence: number;
  configuration: Record<string, any>;
}

export interface LineageDiscoveryScope {
  dataSources: string[];
  assetTypes: string[];
  timeRange: TimeRange;
  filters: Record<string, any>;
}

export interface DiscoverySchedule {
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startTime: string;
  enabled: boolean;
  lastRun: Date;
  nextRun: Date;
}

export interface LineageDiscoveryProgress {
  totalAssets: number;
  processedAssets: number;
  discoveredLineages: number;
  errors: number;
  warnings: number;
  estimatedCompletion: Date;
}

export interface LineageDiscoveryPerformance {
  startTime: Date;
  endTime?: Date;
  duration: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface LineageDiscoveryError {
  id: string;
  type: string;
  message: string;
  assetId?: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface LineageDiscoveryWarning {
  id: string;
  type: string;
  message: string;
  assetId?: string;
  timestamp: Date;
  suggestion: string;
}

export interface DiscoveredLineageRelation {
  id: string;
  sourceAsset: string;
  targetAsset: string;
  confidence: number;
  discoveryMethod: string;
  metadata: Record<string, any>;
}

export interface UpdatedLineageRelation {
  id: string;
  assetId: string;
  changes: Record<string, any>;
  reason: string;
  timestamp: Date;
}

export interface DiscoveryMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
  averageConfidence: number;
}

export interface LineageTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  averageConfidence: number;
}

// Evolution Types
export interface LineageChange {
  id: string;
  type: LineageEvolutionType;
  description: string;
  before: Record<string, any>;
  after: Record<string, any>;
  timestamp: Date;
}

export interface LineageChangeReason {
  id: string;
  reason: string;
  category: 'BUSINESS' | 'TECHNICAL' | 'COMPLIANCE' | 'OPERATIONAL';
  description: string;
  approvedBy: string;
}

export interface LineageEvolutionImpact {
  id: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedAssets: string[];
}

// Tracking Types
export interface LineageTrackingConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  frequency: string;
  scope: string[];
}

export interface LineageChangeDetection {
  id: string;
  enabled: boolean;
  methods: string[];
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  notifications: string[];
}

export interface LineageMonitoring {
  id: string;
  enabled: boolean;
  metrics: string[];
  thresholds: Record<string, number>;
  alerts: LineageAlert[];
}

export interface LineageAlert {
  id: string;
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface LineageTrackingPerformance {
  id: string;
  trackingRate: number;
  accuracy: number;
  latency: number;
  resourceUsage: number;
}

// Analytics Types
export interface LineageAnalyticsConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metrics: string[];
  timeRange: TimeRange;
}

export interface LineageNetworkAnalytics {
  id: string;
  totalNodes: number;
  totalEdges: number;
  networkDensity: number;
  centralityMetrics: CentralityMetric[];
  clusteringCoefficient: number;
  clusters: LineageCluster[];
  connectivity: NetworkConnectivity;
  pathAnalytics: NetworkPathAnalytics;
  robustness: NetworkRobustness;
}

export interface LineageFlowAnalytics {
  id: string;
  totalFlows: number;
  activeFlows: number;
  flowVelocity: number;
  flowPatterns: FlowPattern[];
  bottlenecks: FlowBottleneck[];
  flowQuality: FlowQualityMetric[];
  throughput: FlowThroughput;
  flowPerformance: FlowPerformanceMetric[];
}

export interface LineagePatternAnalytics {
  id: string;
  commonPatterns: LineagePattern[];
  antiPatterns: LineageAntiPattern[];
  patternFrequency: PatternFrequencyAnalysis;
  patternEvolution: PatternEvolutionAnalysis;
  bestPractices: LineageBestPractice[];
  patternRecommendations: PatternRecommendation[];
}

export interface LineageImpactAnalytics {
  id: string;
  impactAssessments: number;
  averageImpactScore: number;
  criticalPaths: string[];
  riskFactors: RiskFactor[];
  mitigationStrategies: RiskMitigation[];
}

export interface LineageTrendAnalytics {
  id: string;
  growthTrends: GrowthTrend[];
  adoptionTrends: Record<string, number>;
  performanceTrends: Record<string, number>;
  qualityTrends: Record<string, number>;
}

export interface LineageAnalyticsInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

export interface LineageAnalyticsPerformance {
  id: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  throughput: number;
}

// Reporting Types
export interface LineageReportConfig {
  id: string;
  name: string;
  description: string;
  type: LineageReportType;
  format: 'PDF' | 'HTML' | 'JSON' | 'CSV';
  schedule: string;
}

export interface LineageReportContent {
  id: string;
  sections: ReportSection[];
  charts: ReportChart[];
  tables: ReportTable[];
  summary: ReportSummary;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
}

export interface ReportChart {
  id: string;
  type: string;
  title: string;
  data: Record<string, any>;
  config: Record<string, any>;
}

export interface ReportTable {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
  summary: Record<string, any>;
}

export interface ReportSummary {
  id: string;
  keyMetrics: Record<string, number>;
  highlights: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface LineageReportMetadata {
  id: string;
  generatedBy: string;
  generatedAt: Date;
  version: string;
  dataSource: string;
  filters: Record<string, any>;
}

export interface LineageReportDistribution {
  id: string;
  recipients: string[];
  method: 'EMAIL' | 'API' | 'DASHBOARD';
  schedule: string;
  format: string;
}

export interface LineageReportStatus {
  id: string;
  status: LineageReportStatus;
  progress: number;
  message: string;
  errors: string[];
  warnings: string[];
}

// Documentation Types
export interface TransformationDocumentation {
  id: string;
  name: string;
  description: string;
  logic: string;
  parameters: Record<string, any>;
  examples: string[];
}

export interface DataFlowDocumentation {
  id: string;
  name: string;
  description: string;
  flow: string[];
  transformations: TransformationDocumentation[];
  quality: Record<string, any>;
}

export interface DependencyDocumentation {
  id: string;
  name: string;
  type: string;
  description: string;
  impact: string;
  mitigation: string;
}

export interface QualityDocumentation {
  id: string;
  name: string;
  description: string;
  metrics: Record<string, number>;
  issues: string[];
  improvements: string[];
}

export interface MaintenanceDocumentation {
  id: string;
  name: string;
  description: string;
  schedule: string;
  procedures: string[];
  contacts: string[];
}

export interface DocumentationChangeLog {
  id: string;
  version: string;
  date: Date;
  author: string;
  changes: string[];
  reason: string;
}

// Performance Types
export interface QueryPerformance {
  avgResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface IndexingPerformance {
  indexSize: number;
  indexBuildTime: number;
  indexUpdateTime: number;
  indexEfficiency: number;
}

export interface UpdatePerformance {
  avgUpdateTime: number;
  maxUpdateTime: number;
  updateThroughput: number;
  updateErrorRate: number;
}

export interface NetworkPerformance {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  connectionCount: number;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
}

// Downtime and Maintenance Types
export interface DowntimeEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  reason: string;
  impact: 'MINIMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  resolution: string;
}

export interface MaintenanceWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'PLANNED' | 'EMERGENCY';
  description: string;
  impact: 'NONE' | 'MINIMAL' | 'MODERATE' | 'HIGH';
}

// Data Categories and Sensitivity
export interface DataCategory {
  id: string;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  regulations: string[];
}

export interface SensitivityIndicator {
  id: string;
  name: string;
  description: string;
  type: 'PATTERN' | 'KEYWORD' | 'REGEX' | 'ML_MODEL';
  confidence: number;
}

export interface AccessRequirement {
  id: string;
  type: 'AUTHENTICATION' | 'AUTHORIZATION' | 'ENCRYPTION' | 'AUDIT';
  description: string;
  mandatory: boolean;
}

export interface HandlingInstruction {
  id: string;
  type: string;
  description: string;
  requirements: string[];
  restrictions: string[];
}

// Regulation Compliance
export interface RegulationCompliance {
  id: string;
  regulation: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  score: number;
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
}

export interface PolicyCompliance {
  id: string;
  policy: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  score: number;
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
}

export interface RemediationAction {
  id: string;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeline: number;
  resources: string[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface NodeStyle {
  color: string;
  size: number;
  shape: NodeShape;
  icon?: string;
  label?: NodeLabel;
  border?: NodeBorder;
}

export interface EdgeStyle {
  color: string;
  width: number;
  style: EdgeLineStyle;
  arrow?: EdgeArrow;
  label?: EdgeLabel;
}

export interface LineageNodeData {
  asset: IntelligentDataAsset;
  transformations: any[];
  metadata: Record<string, any>;
  metrics: Record<string, number>;
}

export interface LineageEdgeData {
  transformation: any;
  metadata: Record<string, any>;
  metrics: Record<string, number>;
  confidence: number;
}

export interface LineageFilter {
  id: string;
  name: string;
  type: FilterType;
  criteria: FilterCriteria;
  enabled: boolean;
}

export interface LineageView {
  id: string;
  name: string;
  description?: string;
  filters: LineageFilter[];
  layout: LineageLayoutConfig;
  customizations: ViewCustomization[];
}

export interface ImpactedAsset {
  assetId: string;
  asset: IntelligentDataAsset;
  impactLevel: ImpactLevel;
  impactType: ImpactType;
  distance: number;
  pathCount: number;
  riskLevel: RiskLevel;
}

export interface LineageCluster {
  id: string;
  name: string;
  nodes: string[];
  density: number;
  cohesion: number;
  purpose: ClusterPurpose;
}

export interface FlowPattern {
  id: string;
  type: FlowPatternType;
  frequency: number;
  strength: number;
  examples: FlowPatternExample[];
}

export interface LineagePattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  frequency: number;
  examples: PatternExample[];
  bestPractice: boolean;
}

export enum NodeShape {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  DIAMOND = 'DIAMOND',
  TRIANGLE = 'TRIANGLE',
  HEXAGON = 'HEXAGON'
}

export enum EdgeLineStyle {
  SOLID = 'SOLID',
  DASHED = 'DASHED',
  DOTTED = 'DOTTED',
  CURVED = 'CURVED'
}

export enum FilterType {
  ASSET_TYPE = 'ASSET_TYPE',
  TRANSFORMATION_TYPE = 'TRANSFORMATION_TYPE',
  CONFIDENCE_LEVEL = 'CONFIDENCE_LEVEL',
  TIME_RANGE = 'TIME_RANGE',
  BUSINESS_DOMAIN = 'BUSINESS_DOMAIN'
}

export enum ImpactLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ImpactType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  CASCADING = 'CASCADING',
  SYSTEMIC = 'SYSTEMIC'
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ClusterPurpose {
  DATA_PROCESSING = 'DATA_PROCESSING',
  ANALYTICS = 'ANALYTICS',
  REPORTING = 'REPORTING',
  INTEGRATION = 'INTEGRATION',
  ARCHIVE = 'ARCHIVE'
}

export enum FlowPatternType {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL = 'PARALLEL',
  BRANCHING = 'BRANCHING',
  MERGING = 'MERGING',
  CIRCULAR = 'CIRCULAR'
}

export enum PatternType {
  ARCHITECTURAL = 'ARCHITECTURAL',
  PROCESSING = 'PROCESSING',
  INTEGRATION = 'INTEGRATION',
  QUALITY = 'QUALITY',
  GOVERNANCE = 'GOVERNANCE'
}