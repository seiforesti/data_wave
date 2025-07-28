/**
 * Data Lineage Types - Complete Backend Mapping
 * =============================================
 * 
 * TypeScript types for advanced data lineage functionality.
 * Maps to advanced_lineage_service.py and lineage-related backend services.
 */

import { AssetType, LineageDirection, LineageType, AssetCriticality } from './catalog-core.types';

// ========================= LINEAGE ENUMS =========================

export enum LineageVisualizationType {
  GRAPH = "graph",
  HIERARCHY = "hierarchy",
  SANKEY = "sankey",
  FLOW = "flow",
  NETWORK = "network"
}

export enum ImpactAnalysisType {
  FORWARD = "forward",        // Downstream impact
  BACKWARD = "backward",      // Upstream dependencies
  BIDIRECTIONAL = "bidirectional"
}

export enum LineageDepth {
  IMMEDIATE = 1,
  EXTENDED = 3,
  COMPREHENSIVE = 5,
  UNLIMITED = -1
}

export enum LineageQuality {
  VERIFIED = "verified",
  INFERRED = "inferred",
  ASSUMED = "assumed",
  UNCERTAIN = "uncertain"
}

export enum ChangeImpactLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  MINIMAL = "minimal"
}

// ========================= CORE LINEAGE INTERFACES =========================

export interface LineageGraph {
  id: string;
  center_asset_id: string;
  graph_type: LineageVisualizationType;
  
  // Graph Structure
  nodes: LineageNode[];
  edges: LineageEdge[];
  
  // Graph Metadata
  total_nodes: number;
  total_edges: number;
  max_depth_upstream: number;
  max_depth_downstream: number;
  
  // Analysis Results
  complexity_score: number;
  confidence_score: number;
  completeness_percentage: number;
  
  // Generation Info
  generated_at: string;
  generation_time_ms: number;
  filters_applied?: LineageFilter[];
  
  // Layout Information
  layout_algorithm?: string;
  layout_data?: Record<string, any>;
}

export interface LineageNode {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  full_qualified_name: string;
  
  // Position in Graph
  level: number;
  depth_from_center: number;
  direction: LineageDirection;
  
  // Visual Properties
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: NodeStyle;
  
  // Metadata
  criticality?: AssetCriticality;
  quality_score?: number;
  last_accessed?: string;
  owner?: string;
  
  // Statistics
  upstream_count: number;
  downstream_count: number;
  total_connections: number;
  
  // Analysis
  centrality_score?: number;
  influence_score?: number;
  risk_score?: number;
}

export interface LineageEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  
  // Lineage Details
  lineage_type: LineageType;
  transformation_logic?: string;
  transformation_confidence: number;
  
  // Column-Level Mapping
  column_mappings?: ColumnMapping[];
  
  // Process Information
  process_name?: string;
  process_type?: string;
  execution_frequency?: string;
  last_execution?: string;
  
  // Quality and Trust
  lineage_quality: LineageQuality;
  confidence_score: number;
  verification_status?: string;
  verified_by?: string;
  verified_at?: string;
  
  // Visual Properties
  style?: EdgeStyle;
  path_data?: string;
  
  // Impact Analysis
  impact_weight: number;
  business_criticality?: AssetCriticality;
  
  // Performance
  data_volume?: number;
  processing_time?: number;
  error_rate?: number;
}

export interface ColumnMapping {
  source_column: string;
  target_column: string;
  transformation_type?: string;
  transformation_expression?: string;
  mapping_confidence: number;
  
  // Data Type Information
  source_data_type?: string;
  target_data_type?: string;
  data_type_conversion?: string;
  
  // Quality Impact
  quality_impact?: string;
  data_loss_risk?: string;
}

export interface NodeStyle {
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
  color: string;
  border_color?: string;
  border_width?: number;
  opacity?: number;
  size_factor?: number;
  
  // Labels
  label_color?: string;
  label_size?: number;
  show_details?: boolean;
  
  // Status Indicators
  status_indicators?: Array<{
    type: string;
    color: string;
    position: string;
  }>;
}

export interface EdgeStyle {
  color: string;
  width: number;
  dash_pattern?: number[];
  opacity?: number;
  arrow_size?: number;
  
  // Animation
  animated?: boolean;
  animation_speed?: number;
  
  // Labels
  show_label?: boolean;
  label_position?: 'start' | 'middle' | 'end';
  label_text?: string;
}

// ========================= LINEAGE ANALYSIS INTERFACES =========================

export interface ImpactAnalysis {
  analysis_id: string;
  center_asset_id: string;
  analysis_type: ImpactAnalysisType;
  analysis_depth: LineageDepth;
  
  // Affected Assets
  affected_assets: ImpactedAsset[];
  total_affected_count: number;
  
  // Impact Assessment
  overall_impact_level: ChangeImpactLevel;
  business_impact_score: number;
  technical_impact_score: number;
  risk_score: number;
  
  // Breakdown by Criticality
  critical_assets: number;
  high_impact_assets: number;
  medium_impact_assets: number;
  low_impact_assets: number;
  
  // Change Propagation
  propagation_paths: PropagationPath[];
  max_propagation_depth: number;
  estimated_propagation_time?: number;
  
  // Recommendations
  recommendations: ImpactRecommendation[];
  mitigation_strategies: string[];
  rollback_plan?: string[];
  
  // Analysis Metadata
  generated_at: string;
  analysis_duration_ms: number;
  confidence_level: number;
}

export interface ImpactedAsset {
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  
  // Impact Assessment
  impact_level: ChangeImpactLevel;
  impact_score: number;
  impact_description: string;
  
  // Path to Impact
  path_from_source: string[];
  distance_from_source: number;
  propagation_probability: number;
  
  // Business Context
  business_criticality?: AssetCriticality;
  business_owner?: string;
  affected_processes?: string[];
  affected_users?: string[];
  
  // Technical Details
  expected_changes: string[];
  required_actions: string[];
  estimated_effort?: string;
  
  // Dependencies
  dependent_assets: string[];
  blocking_dependencies: string[];
}

export interface PropagationPath {
  path_id: string;
  source_asset_id: string;
  target_asset_id: string;
  
  // Path Details
  path_nodes: string[];
  path_length: number;
  propagation_probability: number;
  
  // Impact Characteristics
  impact_amplification: number;
  delay_factors: string[];
  risk_factors: string[];
  
  // Business Impact
  business_processes_affected: string[];
  estimated_downtime?: number;
  recovery_time?: number;
}

export interface ImpactRecommendation {
  recommendation_id: string;
  recommendation_type: 'preventive' | 'mitigative' | 'recovery';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Recommendation Details
  title: string;
  description: string;
  rationale: string;
  
  // Implementation
  implementation_steps: string[];
  estimated_effort_hours: number;
  required_skills: string[];
  dependencies: string[];
  
  // Expected Outcomes
  expected_risk_reduction: number;
  expected_impact_reduction: number;
  success_probability: number;
  
  // Cost-Benefit
  implementation_cost?: number;
  potential_savings?: number;
  roi_estimate?: number;
}

// ========================= LINEAGE DISCOVERY INTERFACES =========================

export interface LineageDiscovery {
  discovery_id: string;
  discovery_method: 'query_analysis' | 'metadata_analysis' | 'schema_analysis' | 'manual_mapping';
  
  // Scope
  source_systems: string[];
  target_systems: string[];
  discovery_scope: 'full' | 'incremental' | 'targeted';
  
  // Configuration
  discovery_config: LineageDiscoveryConfig;
  
  // Results
  lineage_relationships: DiscoveredLineage[];
  confidence_threshold: number;
  
  // Discovery Statistics
  total_relationships_found: number;
  high_confidence_relationships: number;
  medium_confidence_relationships: number;
  low_confidence_relationships: number;
  
  // Quality Metrics
  discovery_accuracy?: number;
  false_positive_rate?: number;
  coverage_percentage: number;
  
  // Execution Info
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface LineageDiscoveryConfig {
  // Analysis Methods
  enable_query_analysis: boolean;
  enable_metadata_analysis: boolean;
  enable_schema_analysis: boolean;
  enable_naming_pattern_analysis: boolean;
  
  // Confidence Thresholds
  minimum_confidence: number;
  high_confidence_threshold: number;
  
  // Scope Filters
  include_patterns?: string[];
  exclude_patterns?: string[];
  max_analysis_depth: number;
  
  // Performance Settings
  max_concurrent_analyses: number;
  analysis_timeout_seconds: number;
  batch_size: number;
  
  // Quality Settings
  validate_discovered_lineage: boolean;
  require_evidence: boolean;
  evidence_threshold: number;
}

export interface DiscoveredLineage {
  relationship_id: string;
  source_asset_id: string;
  target_asset_id: string;
  
  // Relationship Details
  lineage_type: LineageType;
  direction: LineageDirection;
  confidence_score: number;
  
  // Discovery Evidence
  discovery_method: string;
  evidence: LineageEvidence[];
  evidence_strength: number;
  
  // Relationship Properties
  transformation_logic?: string;
  column_mappings?: ColumnMapping[];
  
  // Quality Assessment
  validation_status: 'pending' | 'validated' | 'rejected' | 'uncertain';
  validation_notes?: string;
  manual_verification?: boolean;
  
  // Metadata
  discovered_at: string;
  last_validated?: string;
  validation_score?: number;
}

export interface LineageEvidence {
  evidence_type: 'query_pattern' | 'metadata_reference' | 'schema_similarity' | 'naming_convention';
  evidence_strength: number;
  evidence_data: Record<string, any>;
  
  // Evidence Details
  description: string;
  source_location?: string;
  confidence_contribution: number;
  
  // Validation
  is_validated: boolean;
  validation_method?: string;
  validator?: string;
}

// ========================= LINEAGE VISUALIZATION INTERFACES =========================

export interface LineageVisualization {
  visualization_id: string;
  graph_id: string;
  visualization_type: LineageVisualizationType;
  
  // Layout Configuration
  layout_algorithm: string;
  layout_parameters: Record<string, any>;
  
  // Visual Configuration
  node_style_config: NodeStyleConfig;
  edge_style_config: EdgeStyleConfig;
  
  // Interaction Settings
  zoom_enabled: boolean;
  pan_enabled: boolean;
  selection_enabled: boolean;
  hover_details_enabled: boolean;
  
  // Display Options
  show_labels: boolean;
  show_tooltips: boolean;
  show_minimap: boolean;
  show_legend: boolean;
  
  // Performance Settings
  enable_virtualization: boolean;
  max_visible_nodes: number;
  level_of_detail_enabled: boolean;
  
  // Export Options
  export_formats: string[];
  
  // State Management
  current_viewport?: ViewportState;
  selected_nodes?: string[];
  highlighted_paths?: string[];
}

export interface NodeStyleConfig {
  default_style: NodeStyle;
  style_mappings: Array<{
    condition: string;
    style: Partial<NodeStyle>;
  }>;
  
  // Asset Type Styles
  asset_type_styles: Record<AssetType, Partial<NodeStyle>>;
  
  // Quality-based Styling
  quality_color_scale: Array<{
    threshold: number;
    color: string;
  }>;
  
  // Size Scaling
  size_metric?: 'centrality' | 'connections' | 'criticality' | 'usage';
  size_scale_factor: number;
}

export interface EdgeStyleConfig {
  default_style: EdgeStyle;
  style_mappings: Array<{
    condition: string;
    style: Partial<EdgeStyle>;
  }>;
  
  // Lineage Type Styles
  lineage_type_styles: Record<LineageType, Partial<EdgeStyle>>;
  
  // Confidence-based Styling
  confidence_color_scale: Array<{
    threshold: number;
    color: string;
  }>;
  
  // Width Scaling
  width_metric?: 'confidence' | 'volume' | 'frequency' | 'criticality';
  width_scale_factor: number;
}

export interface ViewportState {
  center_x: number;
  center_y: number;
  zoom_level: number;
  rotation?: number;
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface LineageGraphRequest {
  center_asset_id: string;
  depth_upstream?: number;
  depth_downstream?: number;
  include_column_lineage?: boolean;
  visualization_type?: LineageVisualizationType;
  filters?: LineageFilter;
  layout_algorithm?: string;
}

export interface LineageFilter {
  asset_types?: AssetType[];
  lineage_types?: LineageType[];
  min_confidence?: number;
  quality_levels?: LineageQuality[];
  include_inactive?: boolean;
  
  // Time Filters
  last_execution_after?: string;
  created_after?: string;
  
  // Business Filters
  owners?: string[];
  criticality_levels?: AssetCriticality[];
  business_domains?: string[];
}

export interface ImpactAnalysisRequest {
  asset_id: string;
  analysis_type: ImpactAnalysisType;
  analysis_depth?: LineageDepth;
  change_description?: string;
  include_recommendations?: boolean;
  
  // Simulation Parameters
  simulate_change?: boolean;
  change_impact_percentage?: number;
  change_duration?: string;
}

export interface LineageSearchRequest {
  // Search Query
  query?: string;
  search_type: 'asset_name' | 'transformation_logic' | 'column_mapping' | 'process_name';
  
  // Lineage Filters
  source_assets?: string[];
  target_assets?: string[];
  lineage_types?: LineageType[];
  
  // Quality Filters
  min_confidence?: number;
  verified_only?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface LineageComparisonRequest {
  baseline_timestamp: string;
  comparison_timestamp: string;
  comparison_scope: 'full' | 'specific_assets';
  asset_ids?: string[];
}

export interface LineageComparisonResponse {
  comparison_id: string;
  baseline_snapshot: string;
  comparison_snapshot: string;
  
  // Change Summary
  changes_summary: {
    total_changes: number;
    relationships_added: number;
    relationships_removed: number;
    relationships_modified: number;
    confidence_changes: number;
  };
  
  // Detailed Changes
  added_relationships: DiscoveredLineage[];
  removed_relationships: DiscoveredLineage[];
  modified_relationships: Array<{
    relationship_id: string;
    changes: Record<string, any>;
  }>;
  
  // Impact Assessment
  impact_analysis: {
    affected_assets: string[];
    risk_level: ChangeImpactLevel;
    recommended_actions: string[];
  };
}

// ========================= ANALYTICS TYPES =========================

export interface LineageAnalytics {
  time_period: {
    start_date: string;
    end_date: string;
  };
  
  // Coverage Metrics
  total_assets_with_lineage: number;
  lineage_coverage_percentage: number;
  column_lineage_coverage: number;
  
  // Quality Metrics
  verified_relationships: number;
  high_confidence_relationships: number;
  avg_confidence_score: number;
  
  // Complexity Metrics
  avg_graph_complexity: number;
  max_lineage_depth: number;
  most_connected_assets: Array<{
    asset_id: string;
    asset_name: string;
    connection_count: number;
  }>;
  
  // Discovery Performance
  relationships_discovered: number;
  discovery_accuracy: number;
  manual_verification_rate: number;
  
  // Impact Analysis Usage
  impact_analyses_performed: number;
  avg_impact_scope: number;
  critical_impacts_identified: number;
  
  // Trends
  lineage_growth_trend: Array<{
    date: string;
    relationship_count: number;
    asset_count: number;
  }>;
  
  quality_improvement_trend: Array<{
    date: string;
    avg_confidence: number;
    verified_percentage: number;
  }>;
}

// ========================= UTILITY TYPES =========================

export type LineageEventType = 
  | 'lineage_discovered'
  | 'lineage_verified'
  | 'lineage_updated'
  | 'impact_analysis_completed'
  | 'critical_path_identified'
  | 'lineage_quality_degraded';

export interface LineageEvent {
  id: string;
  event_type: LineageEventType;
  timestamp: string;
  
  // Event Context
  asset_id?: string;
  relationship_id?: string;
  analysis_id?: string;
  
  // Event Data
  event_data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // User Context
  user_id?: string;
  
  // Notification
  requires_notification: boolean;
  notification_sent: boolean;
}

export type LineageDirection = 'upstream' | 'downstream' | 'bidirectional';

export default {
  LineageVisualizationType,
  ImpactAnalysisType,
  LineageDepth,
  LineageQuality,
  ChangeImpactLevel
};