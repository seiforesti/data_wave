/**
 * Advanced Metadata Types - Enterprise Metadata Management Platform
 * ================================================================
 * 
 * Complete mapping to backend metadata models and services:
 * - Metadata enrichment and automation
 * - Schema management and evolution
 * - Business glossary and terminology
 * - Tag and classification systems
 * - Metadata governance and quality
 * - Metadata lineage tracking
 * - Data harmonization and standardization
 * - Metadata analytics and insights
 */

// ========================= CORE METADATA TYPES =========================

export interface MetadataEnrichmentRequest {
  asset_id: string;
  enrichment_type: 'automatic' | 'manual' | 'ai_assisted' | 'crowdsourced';
  enrichment_scope: string[];
  quality_threshold?: number;
  validation_rules?: ValidationRule[];
  context_information?: Record<string, any>;
}

export interface MetadataEnrichmentResult {
  enrichment_id: string;
  asset_id: string;
  enrichments_applied: EnrichmentOperation[];
  quality_scores: QualityScore[];
  validation_results: ValidationResult[];
  metadata_delta: MetadataDelta;
  confidence_metrics: ConfidenceMetrics;
  enrichment_timestamp: string;
}

export interface EnrichmentOperation {
  operation_id: string;
  operation_type: 'add' | 'update' | 'derive' | 'infer' | 'validate';
  field_path: string;
  old_value?: any;
  new_value: any;
  enrichment_source: string;
  confidence_score: number;
  method_used: string;
}

export interface ValidationRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'format' | 'range' | 'pattern' | 'business_logic' | 'reference';
  rule_definition: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  auto_fix: boolean;
}

export interface ValidationResult {
  rule_id: string;
  field_path: string;
  validation_status: 'passed' | 'failed' | 'warning' | 'skipped';
  validation_message?: string;
  suggested_fix?: any;
  impact_assessment: string;
}

export interface QualityScore {
  dimension: string;
  score: number;
  max_score: number;
  contributing_factors: Record<string, number>;
  improvement_suggestions: string[];
}

export interface MetadataDelta {
  additions: Record<string, any>;
  modifications: Record<string, { old: any; new: any }>;
  deletions: string[];
  summary: DeltaSummary;
}

export interface DeltaSummary {
  total_changes: number;
  fields_added: number;
  fields_modified: number;
  fields_removed: number;
  quality_improvement: number;
}

export interface ConfidenceMetrics {
  overall_confidence: number;
  source_reliability: Record<string, number>;
  method_accuracy: Record<string, number>;
  validation_coverage: number;
  human_review_needed: boolean;
}

// ========================= SCHEMA MANAGEMENT =========================

export interface SchemaDefinition {
  schema_id: string;
  schema_name: string;
  schema_version: string;
  schema_type: 'table' | 'view' | 'file' | 'api' | 'stream';
  created_at: string;
  created_by: string;
  fields: SchemaField[];
  constraints: SchemaConstraint[];
  indexes: SchemaIndex[];
  relationships: SchemaRelationship[];
  metadata: SchemaMetadata;
  evolution_history: SchemaEvolution[];
}

export interface SchemaField {
  field_id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  is_primary_key: boolean;
  default_value?: any;
  description?: string;
  business_name?: string;
  data_classification?: string;
  sensitivity_level?: string;
  format_pattern?: string;
  validation_rules: ValidationRule[];
  annotations: Record<string, any>;
}

export interface SchemaConstraint {
  constraint_id: string;
  constraint_type: 'unique' | 'check' | 'foreign_key' | 'not_null' | 'custom';
  constraint_definition: any;
  affected_fields: string[];
  constraint_description?: string;
  enforcement_level: 'strict' | 'advisory' | 'disabled';
}

export interface SchemaIndex {
  index_id: string;
  index_name: string;
  index_type: 'primary' | 'unique' | 'composite' | 'partial' | 'functional';
  indexed_fields: string[];
  index_properties: Record<string, any>;
  performance_impact: PerformanceImpact;
}

export interface PerformanceImpact {
  storage_overhead: number;
  query_improvement: number;
  maintenance_cost: number;
  usage_statistics: Record<string, number>;
}

export interface SchemaRelationship {
  relationship_id: string;
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_many' | 'inheritance';
  source_schema: string;
  target_schema: string;
  join_conditions: JoinCondition[];
  cardinality: string;
  relationship_strength: number;
}

export interface JoinCondition {
  source_field: string;
  target_field: string;
  join_type: 'inner' | 'left' | 'right' | 'full' | 'cross';
  condition_operator: string;
}

export interface SchemaMetadata {
  business_owner: string;
  technical_owner: string;
  domain: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  usage_frequency: number;
  data_volume: number;
  retention_policy: string;
  compliance_requirements: string[];
  tags: string[];
}

export interface SchemaEvolution {
  evolution_id: string;
  previous_version: string;
  current_version: string;
  change_type: 'field_addition' | 'field_removal' | 'type_change' | 'constraint_change';
  changes: SchemaChange[];
  migration_script?: string;
  backward_compatible: boolean;
  change_timestamp: string;
  change_reason: string;
}

export interface SchemaChange {
  change_id: string;
  change_operation: 'add' | 'remove' | 'modify' | 'rename';
  element_type: 'field' | 'constraint' | 'index' | 'relationship';
  element_path: string;
  old_definition?: any;
  new_definition?: any;
  breaking_change: boolean;
  impact_assessment: ChangeImpact;
}

export interface ChangeImpact {
  affected_systems: string[];
  affected_queries: number;
  migration_complexity: 'simple' | 'moderate' | 'complex';
  estimated_downtime: number;
  rollback_plan: string;
}

// ========================= BUSINESS GLOSSARY =========================

export interface BusinessTerm {
  term_id: string;
  term_name: string;
  definition: string;
  business_definition?: string;
  technical_definition?: string;
  domain: string;
  category: string;
  status: 'draft' | 'approved' | 'deprecated' | 'retired';
  created_at: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  synonyms: string[];
  acronyms: string[];
  related_terms: RelatedTerm[];
  usage_examples: UsageExample[];
  business_rules: BusinessRule[];
  data_mappings: DataMapping[];
  steward_info: StewardInfo;
}

export interface RelatedTerm {
  term_id: string;
  term_name: string;
  relationship_type: 'synonym' | 'antonym' | 'broader' | 'narrower' | 'related';
  relationship_strength: number;
  relationship_description?: string;
}

export interface UsageExample {
  example_id: string;
  context: string;
  example_text: string;
  example_type: 'definition' | 'calculation' | 'business_rule' | 'scenario';
  source_system?: string;
}

export interface BusinessRule {
  rule_id: string;
  rule_name: string;
  rule_description: string;
  rule_type: 'validation' | 'calculation' | 'derivation' | 'business_logic';
  rule_expression?: string;
  rule_precedence: number;
  exceptions: RuleException[];
}

export interface RuleException {
  exception_id: string;
  exception_condition: string;
  exception_action: string;
  exception_rationale: string;
}

export interface DataMapping {
  mapping_id: string;
  source_system: string;
  source_field: string;
  mapping_type: 'direct' | 'calculated' | 'derived' | 'transformed';
  transformation_logic?: string;
  mapping_confidence: number;
  validation_status: string;
}

export interface StewardInfo {
  business_steward: string;
  technical_steward: string;
  subject_matter_expert?: string;
  review_cycle: string;
  last_reviewed: string;
  next_review_due: string;
}

export interface GlossaryCategory {
  category_id: string;
  category_name: string;
  parent_category?: string;
  description?: string;
  category_owner: string;
  term_count: number;
  subcategories: string[];
  governance_rules: CategoryGovernance[];
}

export interface CategoryGovernance {
  rule_type: string;
  rule_description: string;
  enforcement_level: 'mandatory' | 'recommended' | 'optional';
  approval_required: boolean;
  reviewers: string[];
}

// ========================= TAG & CLASSIFICATION =========================

export interface TagSystem {
  system_id: string;
  system_name: string;
  system_type: 'hierarchical' | 'flat' | 'faceted' | 'collaborative';
  description?: string;
  tag_categories: TagCategory[];
  governance_policy: TagGovernance;
  usage_statistics: TagUsageStats;
}

export interface TagCategory {
  category_id: string;
  category_name: string;
  parent_category?: string;
  description?: string;
  allowed_values?: string[];
  validation_pattern?: string;
  is_mandatory: boolean;
  is_multi_valued: boolean;
  category_type: 'system' | 'business' | 'technical' | 'user_defined';
  permissions: TagPermissions;
}

export interface TagPermissions {
  can_create: string[];
  can_assign: string[];
  can_modify: string[];
  can_delete: string[];
  approval_required: boolean;
  approvers: string[];
}

export interface TagGovernance {
  approval_workflow: boolean;
  quality_standards: TagQualityStandard[];
  lifecycle_rules: TagLifecycleRule[];
  audit_settings: TagAuditSettings;
}

export interface TagQualityStandard {
  standard_id: string;
  standard_name: string;
  quality_criteria: string[];
  minimum_score: number;
  enforcement_action: string;
}

export interface TagLifecycleRule {
  rule_id: string;
  rule_name: string;
  lifecycle_stage: 'creation' | 'active' | 'deprecated' | 'retired';
  trigger_condition: string;
  action: string;
  notification_required: boolean;
}

export interface TagAuditSettings {
  audit_enabled: boolean;
  audit_events: string[];
  retention_period: number;
  audit_trail_access: string[];
}

export interface TagUsageStats {
  total_tags: number;
  active_tags: number;
  most_used_tags: TagUsageMetric[];
  tag_adoption_rate: number;
  quality_score: number;
}

export interface TagUsageMetric {
  tag_id: string;
  tag_name: string;
  usage_count: number;
  asset_coverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AssetTag {
  tag_id: string;
  asset_id: string;
  tag_category: string;
  tag_value: string;
  assigned_by: string;
  assigned_at: string;
  tag_source: 'manual' | 'automated' | 'inherited' | 'imported';
  confidence_score?: number;
  validation_status: 'validated' | 'pending' | 'disputed';
  context_information?: Record<string, any>;
}

export interface ClassificationScheme {
  scheme_id: string;
  scheme_name: string;
  scheme_type: 'sensitivity' | 'criticality' | 'domain' | 'lifecycle' | 'quality';
  description?: string;
  classification_levels: ClassificationLevel[];
  inheritance_rules: InheritanceRule[];
  governance_policy: ClassificationGovernance;
}

export interface ClassificationLevel {
  level_id: string;
  level_name: string;
  level_value: number;
  description: string;
  color_code?: string;
  icon?: string;
  access_restrictions: AccessRestriction[];
  handling_instructions: string[];
}

export interface AccessRestriction {
  restriction_type: string;
  restriction_value: any;
  exception_conditions?: string[];
  override_permissions?: string[];
}

export interface InheritanceRule {
  rule_id: string;
  rule_name: string;
  inheritance_direction: 'parent_to_child' | 'child_to_parent' | 'bidirectional';
  inheritance_logic: string;
  conflict_resolution: 'highest' | 'lowest' | 'manual' | 'weighted';
}

export interface ClassificationGovernance {
  classification_authority: string[];
  approval_required: boolean;
  audit_trail: boolean;
  periodic_review: boolean;
  review_frequency: string;
  compliance_reporting: boolean;
}

// ========================= METADATA GOVERNANCE =========================

export interface MetadataPolicy {
  policy_id: string;
  policy_name: string;
  policy_type: 'quality' | 'completeness' | 'consistency' | 'accuracy' | 'timeliness';
  description: string;
  scope: PolicyScope;
  rules: PolicyRule[];
  enforcement_level: 'advisory' | 'warning' | 'blocking';
  created_at: string;
  created_by: string;
  status: 'draft' | 'active' | 'suspended' | 'retired';
}

export interface PolicyScope {
  asset_types: string[];
  data_domains: string[];
  systems: string[];
  metadata_fields: string[];
  exclusions?: string[];
}

export interface PolicyRule {
  rule_id: string;
  rule_name: string;
  rule_expression: string;
  rule_type: 'validation' | 'transformation' | 'enrichment' | 'standardization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_remediation: boolean;
  remediation_action?: string;
}

export interface MetadataCompliance {
  compliance_id: string;
  asset_id: string;
  compliance_framework: string;
  compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'unknown';
  compliance_score: number;
  policy_violations: PolicyViolation[];
  remediation_plan?: RemediationPlan;
  last_assessed: string;
  next_assessment: string;
}

export interface PolicyViolation {
  violation_id: string;
  policy_id: string;
  rule_id: string;
  violation_type: string;
  violation_description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_fields: string[];
  detected_at: string;
  resolution_status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

export interface RemediationPlan {
  plan_id: string;
  plan_name: string;
  remediation_steps: RemediationStep[];
  estimated_effort: number;
  target_completion: string;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface RemediationStep {
  step_id: string;
  step_name: string;
  step_description: string;
  step_type: 'manual' | 'automated' | 'semi_automated';
  estimated_duration: number;
  dependencies: string[];
  resources_required: string[];
  success_criteria: string[];
}

// ========================= METADATA LINEAGE =========================

export interface MetadataLineage {
  lineage_id: string;
  source_asset: string;
  target_asset: string;
  lineage_type: 'field_level' | 'table_level' | 'system_level' | 'process_level';
  transformation_logic?: string;
  lineage_confidence: number;
  created_at: string;
  last_verified: string;
  verification_method: string;
  lineage_path: LineageNode[];
}

export interface LineageNode {
  node_id: string;
  asset_id: string;
  asset_type: string;
  transformation_type?: string;
  transformation_details?: any;
  node_position: number;
  upstream_nodes: string[];
  downstream_nodes: string[];
}

export interface MetadataHarmonization {
  harmonization_id: string;
  harmonization_name: string;
  source_schemas: string[];
  target_schema: string;
  harmonization_rules: HarmonizationRule[];
  mapping_confidence: number;
  harmonization_status: 'draft' | 'active' | 'deprecated';
  created_at: string;
  last_updated: string;
}

export interface HarmonizationRule {
  rule_id: string;
  rule_type: 'field_mapping' | 'value_standardization' | 'format_conversion' | 'semantic_alignment';
  source_elements: string[];
  target_element: string;
  transformation_logic: string;
  validation_criteria: string[];
  rule_confidence: number;
}

// ========================= METADATA ANALYTICS =========================

export interface MetadataMetrics {
  metric_id: string;
  metric_name: string;
  metric_type: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'usage';
  metric_value: number;
  metric_unit: string;
  measurement_date: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  benchmark_comparison: BenchmarkComparison;
}

export interface BenchmarkComparison {
  benchmark_type: 'industry' | 'internal' | 'best_practice';
  benchmark_value: number;
  variance_percentage: number;
  performance_rating: 'below' | 'meets' | 'exceeds' | 'leader';
}

export interface MetadataInsight {
  insight_id: string;
  insight_type: 'quality_issue' | 'usage_pattern' | 'governance_gap' | 'optimization_opportunity';
  title: string;
  description: string;
  affected_assets: string[];
  impact_assessment: InsightImpact;
  recommendations: InsightRecommendation[];
  generated_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface InsightImpact {
  business_impact: string;
  technical_impact: string;
  user_impact: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  affected_processes: string[];
}

export interface InsightRecommendation {
  recommendation_id: string;
  recommendation_text: string;
  action_type: 'immediate' | 'short_term' | 'long_term';
  effort_estimate: string;
  expected_benefit: string;
  implementation_priority: number;
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface MetadataSearchRequest {
  query: string;
  search_type: 'semantic' | 'exact' | 'fuzzy' | 'advanced';
  filters: MetadataFilter[];
  facets: string[];
  sort_criteria: SortCriteria[];
  pagination: PaginationOptions;
}

export interface MetadataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'in' | 'range';
  value: any;
  boost?: number;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface PaginationOptions {
  page: number;
  page_size: number;
  offset?: number;
  total_count?: number;
}

export interface MetadataSearchResponse {
  results: MetadataSearchResult[];
  facets: SearchFacet[];
  aggregations: SearchAggregation[];
  pagination: PaginationInfo;
  search_metadata: SearchMetadata;
}

export interface MetadataSearchResult {
  asset_id: string;
  score: number;
  highlighted_fields: Record<string, string[]>;
  metadata_snippet: Record<string, any>;
  relevance_factors: RelevanceFactor[];
}

export interface SearchFacet {
  facet_name: string;
  facet_values: FacetValue[];
  facet_type: 'terms' | 'range' | 'histogram' | 'date_range';
}

export interface FacetValue {
  value: any;
  count: number;
  selected: boolean;
}

export interface SearchAggregation {
  aggregation_name: string;
  aggregation_type: string;
  aggregation_result: any;
}

export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_results: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SearchMetadata {
  query_time: number;
  total_hits: number;
  max_score: number;
  search_suggestions: string[];
  did_you_mean?: string;
}

export interface RelevanceFactor {
  factor_name: string;
  factor_weight: number;
  factor_contribution: number;
  factor_explanation: string;
}

export interface BulkMetadataOperation {
  operation_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'validate' | 'enrich';
  target_assets: string[];
  operation_payload: any;
  batch_size: number;
  operation_options: OperationOptions;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: OperationProgress;
}

export interface OperationOptions {
  skip_validation: boolean;
  force_update: boolean;
  create_backup: boolean;
  notification_settings: NotificationSettings;
  rollback_on_error: boolean;
}

export interface OperationProgress {
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  progress_percentage: number;
  estimated_completion: string;
  current_status: string;
}

export interface NotificationSettings {
  notify_on_completion: boolean;
  notify_on_error: boolean;
  notification_recipients: string[];
  notification_channels: string[];
}

// Export main metadata API interface
export interface MetadataAPI {
  enrichment: MetadataEnrichmentResult;
  schemas: SchemaDefinition[];
  glossary: BusinessTerm[];
  tags: AssetTag[];
  classifications: ClassificationScheme[];
  governance: MetadataPolicy[];
  lineage: MetadataLineage[];
  harmonization: MetadataHarmonization[];
  analytics: MetadataMetrics[];
  insights: MetadataInsight[];
}