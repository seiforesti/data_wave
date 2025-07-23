"""Add advanced enterprise governance models

Revision ID: 20250130_advanced_governance
Revises: 20250627_add_advanced_rbac_models
Create Date: 2025-01-30 12:00:00.000000

This migration adds all the advanced enterprise models for:
- Scan-Rule-Sets Group: IntelligentScanRule, RulePatternLibrary, etc.
- Data Catalog Group: IntelligentDataAsset, EnterpriseDataLineage, etc.  
- Scan Logic Group: ScanOrchestrationMaster, ScanWorkflowExecution, etc.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import sqlmodel


# revision identifiers
revision = '20250130_advanced_governance'
down_revision = '20250627_add_advanced_rbac_models'
branch_labels = None
depends_on = None


def upgrade():
    # ===================== SCAN-RULE-SETS GROUP MODELS =====================
    
    # IntelligentScanRule table
    op.create_table('intelligent_scan_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rule_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('complexity_level', sa.String(), nullable=False),
        sa.Column('pattern_type', sa.String(), nullable=False),
        sa.Column('optimization_strategy', sa.String(), nullable=False),
        sa.Column('execution_strategy', sa.String(), nullable=False),
        sa.Column('rule_expression', sa.Text(), nullable=False),
        sa.Column('conditions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('actions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('parameters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('pattern_config', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('regex_patterns', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ml_model_references', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('semantic_keywords', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ml_model_config', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_context_awareness', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('learning_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('confidence_threshold', sa.Float(), nullable=False, server_default='0.85'),
        sa.Column('adaptive_learning_rate', sa.Float(), nullable=False, server_default='0.01'),
        sa.Column('parallel_execution', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('max_parallel_threads', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('resource_requirements', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('timeout_seconds', sa.Integer(), nullable=False, server_default='300'),
        sa.Column('memory_limit_mb', sa.Integer(), nullable=True),
        sa.Column('cpu_limit_percent', sa.Float(), nullable=True),
        sa.Column('target_data_types', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('supported_databases', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('cloud_compatibility', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('data_source_filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('business_impact_level', sa.String(), nullable=False, server_default='medium'),
        sa.Column('business_domain', sa.String(length=100), nullable=True),
        sa.Column('cost_per_execution', sa.Float(), nullable=True),
        sa.Column('roi_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('compliance_requirements', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('sensitivity_levels', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('quality_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('validation_status', sa.String(), nullable=False, server_default='draft'),
        sa.Column('validation_results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('version', sa.String(length=20), nullable=False, server_default='1.0.0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_executed', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('execution_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('success_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('average_execution_time', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_data_processed', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for IntelligentScanRule
    op.create_index('ix_intelligent_scan_rules_rule_id', 'intelligent_scan_rules', ['rule_id'], unique=True)
    op.create_index('ix_intelligent_scan_rules_name', 'intelligent_scan_rules', ['name'])
    op.create_index('ix_intelligent_scan_rules_complexity_level', 'intelligent_scan_rules', ['complexity_level'])
    op.create_index('ix_intelligent_scan_rules_pattern_type', 'intelligent_scan_rules', ['pattern_type'])
    op.create_index('ix_intelligent_scan_rules_business_impact_level', 'intelligent_scan_rules', ['business_impact_level'])
    op.create_index('ix_intelligent_scan_rules_business_domain', 'intelligent_scan_rules', ['business_domain'])
    op.create_index('ix_intelligent_scan_rules_validation_status', 'intelligent_scan_rules', ['validation_status'])
    op.create_index('ix_intelligent_scan_rules_is_active', 'intelligent_scan_rules', ['is_active'])
    op.create_index('ix_intelligent_scan_rules_created_at', 'intelligent_scan_rules', ['created_at'])
    op.create_index('ix_intelligent_scan_rules_updated_at', 'intelligent_scan_rules', ['updated_at'])
    op.create_index('ix_intelligent_scan_rules_performance', 'intelligent_scan_rules', ['success_rate', 'average_execution_time'])

    # RulePatternLibrary table
    op.create_table('rule_pattern_library',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pattern_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('pattern_type', sa.String(), nullable=False),
        sa.Column('pattern_expression', sa.Text(), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('success_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('performance_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_rule_pattern_library_pattern_id', 'rule_pattern_library', ['pattern_id'], unique=True)
    op.create_index('ix_rule_pattern_library_name', 'rule_pattern_library', ['name'])
    op.create_index('ix_rule_pattern_library_category', 'rule_pattern_library', ['category'])
    op.create_index('ix_rule_pattern_library_pattern_type', 'rule_pattern_library', ['pattern_type'])

    # RuleExecutionHistory table
    op.create_table('rule_execution_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('execution_id', sa.String(), nullable=False),
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Float(), nullable=True),
        sa.Column('data_source_id', sa.Integer(), nullable=True),
        sa.Column('records_processed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_matched', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('accuracy_score', sa.Float(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('execution_context', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('resource_usage', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('executed_by', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['rule_id'], ['intelligent_scan_rules.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_rule_execution_history_execution_id', 'rule_execution_history', ['execution_id'], unique=True)
    op.create_index('ix_rule_execution_history_rule_id', 'rule_execution_history', ['rule_id'])
    op.create_index('ix_rule_execution_history_status', 'rule_execution_history', ['status'])
    op.create_index('ix_rule_execution_history_start_time', 'rule_execution_history', ['start_time'])

    # ===================== DATA CATALOG GROUP MODELS =====================
    
    # IntelligentDataAsset table
    op.create_table('intelligent_data_assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('asset_id', sa.String(), nullable=False),
        sa.Column('qualified_name', sa.String(length=500), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('asset_type', sa.String(), nullable=False),
        sa.Column('asset_status', sa.String(), nullable=False, server_default='active'),
        sa.Column('data_source_id', sa.Integer(), nullable=True),
        sa.Column('schema_name', sa.String(length=255), nullable=True),
        sa.Column('table_name', sa.String(length=255), nullable=True),
        sa.Column('column_name', sa.String(length=255), nullable=True),
        sa.Column('data_type', sa.String(length=100), nullable=True),
        sa.Column('nullable', sa.Boolean(), nullable=True),
        sa.Column('primary_key', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('foreign_key', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('discovery_method', sa.String(), nullable=False, server_default='automated_scan'),
        sa.Column('asset_criticality', sa.String(), nullable=False, server_default='medium'),
        sa.Column('data_sensitivity', sa.String(), nullable=False, server_default='internal'),
        sa.Column('business_domains', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('steward_users', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('owner_users', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('technical_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('business_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('data_quality_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('completeness_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('accuracy_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('consistency_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('freshness_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('validity_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('usage_frequency', sa.String(), nullable=False, server_default='unknown'),
        sa.Column('access_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_accessed', sa.DateTime(), nullable=True),
        sa.Column('business_value_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('risk_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('compliance_tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('classification_labels', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('semantic_tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('custom_tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_generated_insights', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ml_predictions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('recommendation_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_certified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('certification_level', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('discovered_at', sa.DateTime(), nullable=True),
        sa.Column('last_profiled', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['data_source_id'], ['data_sources.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for IntelligentDataAsset
    op.create_index('ix_intelligent_data_assets_asset_id', 'intelligent_data_assets', ['asset_id'], unique=True)
    op.create_index('ix_intelligent_data_assets_qualified_name', 'intelligent_data_assets', ['qualified_name'], unique=True)
    op.create_index('ix_intelligent_data_assets_display_name', 'intelligent_data_assets', ['display_name'])
    op.create_index('ix_intelligent_data_assets_asset_type', 'intelligent_data_assets', ['asset_type'])
    op.create_index('ix_intelligent_data_assets_asset_status', 'intelligent_data_assets', ['asset_status'])
    op.create_index('ix_intelligent_data_assets_data_source_id', 'intelligent_data_assets', ['data_source_id'])
    op.create_index('ix_intelligent_data_assets_discovery_method', 'intelligent_data_assets', ['discovery_method'])
    op.create_index('ix_intelligent_data_assets_asset_criticality', 'intelligent_data_assets', ['asset_criticality'])
    op.create_index('ix_intelligent_data_assets_data_sensitivity', 'intelligent_data_assets', ['data_sensitivity'])
    op.create_index('ix_intelligent_data_assets_usage_frequency', 'intelligent_data_assets', ['usage_frequency'])
    op.create_index('ix_intelligent_data_assets_is_active', 'intelligent_data_assets', ['is_active'])
    op.create_index('ix_intelligent_data_assets_is_certified', 'intelligent_data_assets', ['is_certified'])
    op.create_index('ix_intelligent_data_assets_created_at', 'intelligent_data_assets', ['created_at'])
    op.create_index('ix_intelligent_data_assets_updated_at', 'intelligent_data_assets', ['updated_at'])
    op.create_index('ix_intelligent_data_assets_quality_scores', 'intelligent_data_assets', ['data_quality_score', 'business_value_score'])

    # EnterpriseDataLineage table
    op.create_table('enterprise_data_lineage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lineage_id', sa.String(), nullable=False),
        sa.Column('source_asset_id', sa.Integer(), nullable=False),
        sa.Column('target_asset_id', sa.Integer(), nullable=False),
        sa.Column('lineage_type', sa.String(), nullable=False),
        sa.Column('lineage_direction', sa.String(), nullable=False),
        sa.Column('transformation_logic', sa.Text(), nullable=True),
        sa.Column('transformation_type', sa.String(length=100), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('detection_method', sa.String(), nullable=False),
        sa.Column('process_name', sa.String(length=255), nullable=True),
        sa.Column('process_type', sa.String(length=100), nullable=True),
        sa.Column('execution_frequency', sa.String(length=50), nullable=True),
        sa.Column('last_execution', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('impact_analysis', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('discovered_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['source_asset_id'], ['intelligent_data_assets.id'], ),
        sa.ForeignKeyConstraint(['target_asset_id'], ['intelligent_data_assets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_enterprise_data_lineage_lineage_id', 'enterprise_data_lineage', ['lineage_id'], unique=True)
    op.create_index('ix_enterprise_data_lineage_source_asset_id', 'enterprise_data_lineage', ['source_asset_id'])
    op.create_index('ix_enterprise_data_lineage_target_asset_id', 'enterprise_data_lineage', ['target_asset_id'])
    op.create_index('ix_enterprise_data_lineage_lineage_type', 'enterprise_data_lineage', ['lineage_type'])
    op.create_index('ix_enterprise_data_lineage_lineage_direction', 'enterprise_data_lineage', ['lineage_direction'])

    # DataQualityAssessment table
    op.create_table('data_quality_assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.String(), nullable=False),
        sa.Column('asset_id', sa.Integer(), nullable=False),
        sa.Column('assessment_type', sa.String(), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('completeness_score', sa.Float(), nullable=False),
        sa.Column('accuracy_score', sa.Float(), nullable=False),
        sa.Column('consistency_score', sa.Float(), nullable=False),
        sa.Column('validity_score', sa.Float(), nullable=False),
        sa.Column('freshness_score', sa.Float(), nullable=False),
        sa.Column('uniqueness_score', sa.Float(), nullable=False),
        sa.Column('assessment_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('quality_issues', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('recommendations', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('rules_applied', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('sample_size', sa.Integer(), nullable=True),
        sa.Column('total_records', sa.Integer(), nullable=True),
        sa.Column('assessment_duration', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('assessed_by', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['intelligent_data_assets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_data_quality_assessments_assessment_id', 'data_quality_assessments', ['assessment_id'])
    op.create_index('ix_data_quality_assessments_asset_id', 'data_quality_assessments', ['asset_id'])
    op.create_index('ix_data_quality_assessments_assessment_type', 'data_quality_assessments', ['assessment_type'])

    # ===================== SCAN LOGIC GROUP MODELS =====================
    
    # ScanOrchestrationMaster table
    op.create_table('scan_orchestration_master',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('orchestration_id', sa.String(), nullable=False),
        sa.Column('orchestration_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('orchestration_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='initializing'),
        sa.Column('execution_mode', sa.String(), nullable=False, server_default='standard'),
        sa.Column('scheduling_strategy', sa.String(), nullable=False, server_default='intelligent'),
        sa.Column('priority_level', sa.String(), nullable=False, server_default='normal'),
        sa.Column('optimization_goal', sa.String(), nullable=False, server_default='balanced'),
        sa.Column('stage_definitions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('dependency_graph', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('stages_total', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('stages_completed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('tasks_total', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('tasks_completed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('progress_percentage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('scheduled_start', sa.DateTime(), nullable=True),
        sa.Column('actual_start', sa.DateTime(), nullable=True),
        sa.Column('estimated_completion', sa.DateTime(), nullable=True),
        sa.Column('actual_completion', sa.DateTime(), nullable=True),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.Column('max_execution_time', sa.Integer(), nullable=True),
        sa.Column('execution_duration', sa.Float(), nullable=True),
        sa.Column('target_data_sources', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('target_assets', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('target_rules', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('scope_filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('workflow_definition', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('resource_requirements', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('resource_allocation', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('current_stage', sa.String(length=255), nullable=True),
        sa.Column('current_task', sa.String(length=255), nullable=True),
        sa.Column('performance_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('quality_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('cost_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('estimated_cost', sa.Float(), nullable=True),
        sa.Column('actual_cost', sa.Float(), nullable=True),
        sa.Column('ai_optimization_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('optimization_results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('requires_approval', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('approval_status', sa.String(length=50), nullable=True),
        sa.Column('approved_by', sa.String(length=255), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('execution_results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error_log', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('alert_thresholds', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('notification_config', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('audit_trail', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for ScanOrchestrationMaster
    op.create_index('ix_scan_orchestration_master_orchestration_id', 'scan_orchestration_master', ['orchestration_id'], unique=True)
    op.create_index('ix_scan_orchestration_master_orchestration_name', 'scan_orchestration_master', ['orchestration_name'])
    op.create_index('ix_scan_orchestration_master_orchestration_type', 'scan_orchestration_master', ['orchestration_type'])
    op.create_index('ix_scan_orchestration_master_status', 'scan_orchestration_master', ['status'])
    op.create_index('ix_scan_orchestration_master_priority_level', 'scan_orchestration_master', ['priority_level'])
    op.create_index('ix_scan_orchestration_master_scheduling_strategy', 'scan_orchestration_master', ['scheduling_strategy'])
    op.create_index('ix_scan_orchestration_master_scheduled_start', 'scan_orchestration_master', ['scheduled_start'])
    op.create_index('ix_scan_orchestration_master_created_at', 'scan_orchestration_master', ['created_at'])
    op.create_index('ix_scan_orchestration_master_is_active', 'scan_orchestration_master', ['is_active'])

    # ScanWorkflowExecution table
    op.create_table('scan_workflow_execution',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('execution_id', sa.String(), nullable=False),
        sa.Column('orchestration_id', sa.Integer(), nullable=False),
        sa.Column('workflow_name', sa.String(length=255), nullable=False),
        sa.Column('workflow_type', sa.String(), nullable=False),
        sa.Column('stage_name', sa.String(length=255), nullable=False),
        sa.Column('stage_order', sa.Integer(), nullable=False),
        sa.Column('task_name', sa.String(length=255), nullable=False),
        sa.Column('task_type', sa.String(length=100), nullable=False),
        sa.Column('task_order', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('priority_level', sa.String(), nullable=False, server_default='normal'),
        sa.Column('dependencies', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('execution_config', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('input_parameters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('output_results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('progress_percentage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('queued_at', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Float(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_retries', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('resource_usage', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('performance_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('quality_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('business_impact', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('warning_messages', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('executed_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['orchestration_id'], ['scan_orchestration_master.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_scan_workflow_execution_execution_id', 'scan_workflow_execution', ['execution_id'], unique=True)
    op.create_index('ix_scan_workflow_execution_orchestration_id', 'scan_workflow_execution', ['orchestration_id'])
    op.create_index('ix_scan_workflow_execution_workflow_name', 'scan_workflow_execution', ['workflow_name'])
    op.create_index('ix_scan_workflow_execution_status', 'scan_workflow_execution', ['status'])
    op.create_index('ix_scan_workflow_execution_stage_order', 'scan_workflow_execution', ['stage_order'])
    op.create_index('ix_scan_workflow_execution_task_order', 'scan_workflow_execution', ['task_order'])

    # ScanResourceAllocation table
    op.create_table('scan_resource_allocation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('allocation_id', sa.String(), nullable=False),
        sa.Column('orchestration_id', sa.Integer(), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=False),
        sa.Column('resource_name', sa.String(length=255), nullable=False),
        sa.Column('allocated_amount', sa.Float(), nullable=False),
        sa.Column('reserved_amount', sa.Float(), nullable=False),
        sa.Column('used_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('allocation_start', sa.DateTime(), nullable=False),
        sa.Column('allocation_end', sa.DateTime(), nullable=True),
        sa.Column('usage_metrics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('cost_per_unit', sa.Float(), nullable=True),
        sa.Column('total_cost', sa.Float(), nullable=True),
        sa.Column('optimization_suggestions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('allocated_by', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['orchestration_id'], ['scan_orchestration_master.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_scan_resource_allocation_allocation_id', 'scan_resource_allocation', ['allocation_id'], unique=True)
    op.create_index('ix_scan_resource_allocation_orchestration_id', 'scan_resource_allocation', ['orchestration_id'])
    op.create_index('ix_scan_resource_allocation_resource_type', 'scan_resource_allocation', ['resource_type'])
    op.create_index('ix_scan_resource_allocation_is_active', 'scan_resource_allocation', ['is_active'])

    # Add foreign key constraints with existing tables
    op.create_foreign_key(
        'fk_enhanced_scan_rule_sets_intelligent_rule',
        'enhanced_scan_rule_sets', 'intelligent_scan_rules',
        ['base_rule_set_id'], ['id']
    )


def downgrade():
    # Drop all tables in reverse order (due to foreign key constraints)
    op.drop_table('scan_resource_allocation')
    op.drop_table('scan_workflow_execution')
    op.drop_table('scan_orchestration_master')
    op.drop_table('data_quality_assessments')
    op.drop_table('enterprise_data_lineage')
    op.drop_table('intelligent_data_assets')
    op.drop_table('rule_execution_history')
    op.drop_table('rule_pattern_library')
    op.drop_table('intelligent_scan_rules')