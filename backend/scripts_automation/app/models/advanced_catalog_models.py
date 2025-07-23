"""
📚 ADVANCED CATALOG MODELS  
Enterprise-grade data catalog models for comprehensive data asset management, intelligent discovery,
semantic search, and advanced catalog intelligence with full enterprise integration.

This module provides the foundation for:
- Comprehensive Data Asset Discovery and Management
- Intelligent Semantic Search and Recommendation Systems
- Advanced Metadata Management and Enrichment
- Enterprise-Grade Data Governance and Stewardship
- Real-Time Catalog Analytics and Business Intelligence
- Cross-System Integration with All Data Governance Groups
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from decimal import Decimal

# Import cross-system integration models
from .scan_models import DataSource, ScanJob
from .advanced_scan_rule_models import IntelligentScanRule
from .policy_models import ComplianceRule
from .classification_models import ClassificationResult


class AssetType(str, Enum):
    """Types of data assets in the catalog"""
    DATABASE = "database"               # Database systems
    TABLE = "table"                     # Database tables
    VIEW = "view"                       # Database views
    COLUMN = "column"                   # Table columns
    SCHEMA = "schema"                   # Database schemas
    FILE = "file"                       # File-based assets
    DATASET = "dataset"                 # Logical datasets
    API = "api"                         # API endpoints
    STREAM = "stream"                   # Data streams
    REPORT = "report"                   # Reports and dashboards
    MODEL = "model"                     # ML models
    PIPELINE = "pipeline"               # Data pipelines
    TRANSFORMATION = "transformation"   # Data transformations
    METRIC = "metric"                   # Business metrics
    DOCUMENT = "document"               # Documentation assets


class CatalogStatus(str, Enum):
    """Status states for catalog assets"""
    DISCOVERED = "discovered"           # Recently discovered
    PROFILING = "profiling"             # Data profiling in progress
    CATALOGED = "cataloged"             # Fully cataloged
    VERIFIED = "verified"               # Manually verified
    DEPRECATED = "deprecated"           # Marked as deprecated
    ARCHIVED = "archived"               # Archived asset
    DELETED = "deleted"                 # Deleted from source
    QUARANTINED = "quarantined"         # Quality issues found
    UNKNOWN = "unknown"                 # Status unknown


class DataQualityLevel(str, Enum):
    """Data quality assessment levels"""
    EXCELLENT = "excellent"             # 95-100% quality score
    GOOD = "good"                       # 80-94% quality score
    FAIR = "fair"                       # 60-79% quality score
    POOR = "poor"                       # 40-59% quality score
    CRITICAL = "critical"               # Below 40% quality score
    UNKNOWN = "unknown"                 # Quality not assessed


class AccessLevel(str, Enum):
    """Access levels for catalog assets"""
    PUBLIC = "public"                   # Publicly accessible
    INTERNAL = "internal"               # Internal organization access
    RESTRICTED = "restricted"           # Restricted access
    CONFIDENTIAL = "confidential"       # Confidential data
    SECRET = "secret"                   # Secret/classified data
    PRIVATE = "private"                 # Private access only


class BusinessCriticality(str, Enum):
    """Business criticality levels for assets"""
    MISSION_CRITICAL = "mission_critical"      # Mission-critical assets
    BUSINESS_CRITICAL = "business_critical"    # Business-critical assets
    IMPORTANT = "important"                    # Important assets
    STANDARD = "standard"                      # Standard importance
    LOW = "low"                               # Low importance
    EXPERIMENTAL = "experimental"              # Experimental assets


class StewardshipRole(str, Enum):
    """Data stewardship roles"""
    DATA_OWNER = "data_owner"           # Data owner
    DATA_STEWARD = "data_steward"       # Data steward
    TECHNICAL_OWNER = "technical_owner"  # Technical owner
    BUSINESS_OWNER = "business_owner"   # Business owner
    CUSTODIAN = "custodian"             # Data custodian
    CONSUMER = "consumer"               # Data consumer
    ANALYST = "analyst"                 # Data analyst
    SCIENTIST = "scientist"             # Data scientist


class CatalogEntryType(str, Enum):
    """Types of catalog entries"""
    ASSET = "asset"                     # Physical data asset
    LOGICAL_ENTITY = "logical_entity"   # Logical data entity
    BUSINESS_TERM = "business_term"     # Business terminology
    DATA_PRODUCT = "data_product"       # Data product
    SERVICE = "service"                 # Data service
    COLLECTION = "collection"           # Asset collection
    DOMAIN = "domain"                   # Data domain
    CONCEPT = "concept"                 # Data concept


class EnterpriseDataAsset(SQLModel, table=True):
    """
    Comprehensive enterprise data asset model with advanced metadata management,
    lineage tracking, quality assessment, and business context integration.
    """
    __tablename__ = "enterprise_data_assets"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_uuid: str = Field(index=True, unique=True, description="Unique asset identifier")
    asset_name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    version: str = Field(default="1.0.0", max_length=50)
    
    # Asset Classification
    asset_type: AssetType = Field(index=True)
    catalog_entry_type: CatalogEntryType = Field(default=CatalogEntryType.ASSET, index=True)
    business_domain: Optional[str] = Field(max_length=100, index=True)
    data_domain: Optional[str] = Field(max_length=100, index=True)
    functional_area: Optional[str] = Field(max_length=100)
    
    # Physical Location and Structure
    physical_location: Optional[str] = Field(max_length=500)
    logical_location: Optional[str] = Field(max_length=500)
    storage_format: Optional[str] = Field(max_length=100)
    schema_definition: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    data_structure: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Source Integration
    data_source_id: Optional[int] = Field(foreign_key="datasource.id", index=True)
    source_system: Optional[str] = Field(max_length=255)
    source_database: Optional[str] = Field(max_length=255)
    source_schema: Optional[str] = Field(max_length=255)
    source_table: Optional[str] = Field(max_length=255)
    
    # Asset Hierarchy and Relationships
    parent_asset_id: Optional[int] = Field(foreign_key="enterprise_data_assets.id")
    root_asset_id: Optional[int] = Field(foreign_key="enterprise_data_assets.id")
    asset_path: Optional[str] = Field(max_length=1000)
    hierarchy_level: int = Field(default=0, ge=0)
    children_count: int = Field(default=0, ge=0)
    
    # Status and Lifecycle
    status: CatalogStatus = Field(default=CatalogStatus.DISCOVERED, index=True)
    lifecycle_stage: str = Field(default="active", max_length=50, index=True)
    is_active: bool = Field(default=True, index=True)
    is_deprecated: bool = Field(default=False, index=True)
    deprecation_reason: Optional[str] = Field(max_length=500)
    retirement_date: Optional[datetime] = None
    
    # Data Quality and Profiling
    data_quality_level: DataQualityLevel = Field(default=DataQualityLevel.UNKNOWN, index=True)
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    validity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    uniqueness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Statistical Profile
    record_count: Optional[int] = Field(ge=0)
    column_count: Optional[int] = Field(ge=0)
    data_size_bytes: Optional[int] = Field(ge=0)
    null_percentage: Optional[float] = Field(ge=0.0, le=100.0)
    distinct_value_count: Optional[int] = Field(ge=0)
    statistical_profile: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context and Semantics
    business_purpose: Optional[str] = Field(max_length=500)
    business_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    business_criticality: BusinessCriticality = Field(default=BusinessCriticality.STANDARD, index=True)
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    usage_frequency: int = Field(default=0, ge=0)
    user_count: int = Field(default=0, ge=0)
    
    # Security and Compliance
    access_level: AccessLevel = Field(default=AccessLevel.INTERNAL, index=True)
    data_classification: Optional[str] = Field(max_length=100, index=True)
    sensitivity_level: Optional[str] = Field(max_length=50, index=True)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    privacy_flags: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    retention_policy: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Data Governance and Stewardship
    data_stewards: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_owners: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    technical_owners: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    stewardship_roles: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    governance_status: str = Field(default="unmanaged", max_length=50, index=True)
    
    # Metadata and Enrichment
    technical_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    business_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    operational_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Tags and Categories
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    categories: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    aliases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Search and Discovery
    searchable_content: Optional[str] = Field(sa_column=Column(Text))
    semantic_embedding: Optional[List[float]] = Field(sa_column=Column(JSON))
    search_weight: float = Field(default=1.0, ge=0.1, le=10.0)
    discovery_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Usage Analytics and Patterns
    access_count: int = Field(default=0, ge=0)
    download_count: int = Field(default=0, ge=0)
    query_count: int = Field(default=0, ge=0)
    last_accessed: Optional[datetime] = Field(index=True)
    peak_usage_time: Optional[datetime] = None
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Lineage and Relationships
    upstream_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    downstream_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    related_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    lineage_depth: int = Field(default=0, ge=0)
    impact_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Change Management and Versioning
    change_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_evolution: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    breaking_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    version_history: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and Validation
    data_validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    validation_status: str = Field(default="not_validated", max_length=50, index=True)
    last_validation: Optional[datetime] = None
    
    # Performance and Optimization
    query_performance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    performance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    cost_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Documentation and Learning Resources
    documentation_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    sample_queries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    usage_examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    training_materials: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    discovered_at: Optional[datetime] = Field(index=True)
    last_profiled: Optional[datetime] = None
    last_scanned: Optional[datetime] = None
    next_scan_scheduled: Optional[datetime] = None
    
    # Relationships
    parent_asset: Optional["EnterpriseDataAsset"] = Relationship(back_populates="child_assets", sa_relationship_kwargs={"foreign_keys": "EnterpriseDataAsset.parent_asset_id"})
    child_assets: List["EnterpriseDataAsset"] = Relationship(back_populates="parent_asset", sa_relationship_kwargs={"foreign_keys": "EnterpriseDataAsset.parent_asset_id"})
    catalog_entries: List["CatalogEntry"] = Relationship(back_populates="data_asset")
    asset_relationships: List["AssetRelationship"] = Relationship(back_populates="source_asset", sa_relationship_kwargs={"foreign_keys": "AssetRelationship.source_asset_id"})
    quality_assessments: List["DataQualityAssessment"] = Relationship(back_populates="asset")
    lineage_entries: List["DataLineageEntry"] = Relationship(back_populates="asset")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_asset_type_domain', 'asset_type', 'business_domain'),
        Index('ix_asset_quality', 'quality_score', 'data_quality_level'),
        Index('ix_asset_usage', 'usage_frequency', 'access_count'),
        Index('ix_asset_business', 'business_criticality', 'business_value_score'),
        Index('ix_asset_governance', 'governance_status', 'access_level'),
        Index('ix_asset_hierarchy', 'parent_asset_id', 'hierarchy_level'),
        CheckConstraint('quality_score >= 0.0 AND quality_score <= 1.0'),
        CheckConstraint('business_value_score >= 0.0 AND business_value_score <= 10.0'),
        CheckConstraint('hierarchy_level >= 0'),
        UniqueConstraint('asset_uuid'),
    )


class CatalogEntry(SQLModel, table=True):
    """
    Comprehensive catalog entry model for managing metadata, relationships,
    and business context of data assets with enterprise governance integration.
    """
    __tablename__ = "catalog_entries"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    entry_uuid: str = Field(index=True, unique=True)
    entry_name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    entry_type: CatalogEntryType = Field(index=True)
    
    # Asset Association
    data_asset_id: Optional[int] = Field(foreign_key="enterprise_data_assets.id", index=True)
    asset_reference: Optional[str] = Field(max_length=500)
    
    # Catalog Organization
    catalog_domain: str = Field(max_length=100, index=True)
    catalog_category: str = Field(max_length=100, index=True)
    catalog_subcategory: Optional[str] = Field(max_length=100)
    collection_memberships: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Context
    business_description: Optional[str] = Field(sa_column=Column(Text))
    business_purpose: Optional[str] = Field(max_length=500)
    business_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    stakeholders: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Technical Details
    technical_description: Optional[str] = Field(sa_column=Column(Text))
    implementation_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    configuration_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    system_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata Enrichment
    semantic_annotations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ontology_mappings: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    concept_relationships: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    knowledge_graph_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Content and Structure
    content_summary: Optional[str] = Field(sa_column=Column(Text))
    data_samples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_documentation: Optional[str] = Field(sa_column=Column(Text))
    field_descriptions: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Trust
    data_quality_indicators: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    trust_score: float = Field(default=0.0, ge=0.0, le=1.0)
    reliability_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    data_freshness: Optional[datetime] = None
    
    # Usage and Analytics
    popularity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    usage_statistics: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    user_feedback: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    rating_average: float = Field(default=0.0, ge=0.0, le=5.0)
    review_count: int = Field(default=0, ge=0)
    
    # Discovery and Search
    searchable_text: Optional[str] = Field(sa_column=Column(Text))
    search_keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    semantic_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    search_boost_factor: float = Field(default=1.0, ge=0.1, le=10.0)
    
    # Recommendations and Suggestions
    related_entries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommended_by_ml: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    similarity_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Collaboration and Social Features
    bookmarks_count: int = Field(default=0, ge=0)
    shares_count: int = Field(default=0, ge=0)
    comments_count: int = Field(default=0, ge=0)
    collaboration_metrics: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Certification and Approval
    certification_status: str = Field(default="uncertified", max_length=50, index=True)
    certified_by: Optional[str] = Field(max_length=255)
    certification_date: Optional[datetime] = None
    certification_notes: Optional[str] = Field(max_length=1000)
    approval_workflow: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    entry_status: str = Field(default="draft", max_length=50, index=True)
    publication_status: str = Field(default="private", max_length=50, index=True)
    version_number: str = Field(default="1.0.0", max_length=20)
    is_featured: bool = Field(default=False, index=True)
    is_promoted: bool = Field(default=False)
    
    # Access Control and Security
    visibility_level: str = Field(default="internal", max_length=50, index=True)
    access_permissions: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    security_labels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_handling_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # External Integration
    external_references: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    api_endpoints: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    integration_points: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    synchronization_status: str = Field(default="synced", max_length=50)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published_at: Optional[datetime] = None
    last_reviewed: Optional[datetime] = None
    review_due_date: Optional[datetime] = None
    
    # Relationships
    data_asset: Optional[EnterpriseDataAsset] = Relationship(back_populates="catalog_entries")
    comments: List["CatalogComment"] = Relationship(back_populates="catalog_entry")
    ratings: List["CatalogRating"] = Relationship(back_populates="catalog_entry")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_entry_domain_category', 'catalog_domain', 'catalog_category'),
        Index('ix_entry_search', 'popularity_score', 'trust_score'),
        Index('ix_entry_status', 'entry_status', 'certification_status'),
        Index('ix_entry_visibility', 'visibility_level', 'is_featured'),
        CheckConstraint('trust_score >= 0.0 AND trust_score <= 1.0'),
        CheckConstraint('popularity_score >= 0.0 AND popularity_score <= 1.0'),
        CheckConstraint('rating_average >= 0.0 AND rating_average <= 5.0'),
        UniqueConstraint('entry_uuid'),
    )


class AssetRelationship(SQLModel, table=True):
    """
    Comprehensive relationship management between data assets with
    semantic understanding, strength scoring, and relationship analytics.
    """
    __tablename__ = "asset_relationships"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    relationship_uuid: str = Field(index=True, unique=True)
    source_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    target_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    
    # Relationship Classification
    relationship_type: str = Field(max_length=100, index=True)  # lineage, similarity, hierarchy, dependency
    relationship_subtype: Optional[str] = Field(max_length=100)
    relationship_direction: str = Field(default="bidirectional", max_length=50)  # unidirectional, bidirectional
    relationship_category: str = Field(max_length=100, index=True)
    
    # Relationship Strength and Confidence
    strength_score: float = Field(default=0.5, ge=0.0, le=1.0)
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    reliability_score: float = Field(default=0.5, ge=0.0, le=1.0)
    evidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    
    # Relationship Details
    relationship_description: Optional[str] = Field(max_length=500)
    business_context: Optional[str] = Field(max_length=500)
    technical_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    relationship_properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Discovery and Validation
    discovery_method: str = Field(max_length=100, index=True)  # manual, automated, ml_inferred, rule_based
    discovery_algorithm: Optional[str] = Field(max_length=100)
    validation_status: str = Field(default="pending", max_length=50, index=True)
    validation_method: Optional[str] = Field(max_length=100)
    validated_by: Optional[str] = Field(max_length=255)
    validation_date: Optional[datetime] = None
    
    # Semantic Understanding
    semantic_similarity: Optional[float] = Field(ge=0.0, le=1.0)
    ontological_relationship: Optional[str] = Field(max_length=100)
    concept_mappings: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    semantic_annotations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage and Analytics
    usage_frequency: int = Field(default=0, ge=0)
    access_count: int = Field(default=0, ge=0)
    query_count: int = Field(default=0, ge=0)
    last_used: Optional[datetime] = None
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Impact
    business_importance: float = Field(default=0.0, ge=0.0, le=1.0)
    impact_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    dependency_criticality: str = Field(default="low", max_length=50)
    business_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Data Lineage Specific
    lineage_type: Optional[str] = Field(max_length=100)  # direct, derived, aggregated, transformed
    transformation_logic: Optional[str] = Field(sa_column=Column(Text))
    transformation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_flow_direction: Optional[str] = Field(max_length=50)
    
    # Quality and Trust
    relationship_quality: float = Field(default=0.0, ge=0.0, le=1.0)
    data_consistency: Optional[float] = Field(ge=0.0, le=1.0)
    synchronization_status: str = Field(default="unknown", max_length=50)
    quality_issues: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and Enrichment
    relationship_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    labels: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    is_system_generated: bool = Field(default=False)
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    discovered_at: Optional[datetime] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    
    # Relationships
    source_asset: Optional[EnterpriseDataAsset] = Relationship(back_populates="asset_relationships", sa_relationship_kwargs={"foreign_keys": "AssetRelationship.source_asset_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_relationship_type_strength', 'relationship_type', 'strength_score'),
        Index('ix_relationship_validation', 'validation_status', 'discovery_method'),
        Index('ix_relationship_business', 'business_importance', 'dependency_criticality'),
        Index('ix_relationship_quality', 'relationship_quality', 'confidence_score'),
        CheckConstraint('strength_score >= 0.0 AND strength_score <= 1.0'),
        CheckConstraint('confidence_score >= 0.0 AND confidence_score <= 1.0'),
        CheckConstraint('source_asset_id != target_asset_id'),
        UniqueConstraint('relationship_uuid'),
    )


class DataQualityAssessment(SQLModel, table=True):
    """
    Comprehensive data quality assessment model with detailed metrics,
    issue tracking, and improvement recommendations.
    """
    __tablename__ = "data_quality_assessments"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_uuid: str = Field(index=True, unique=True)
    asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    
    # Assessment Configuration
    assessment_name: str = Field(max_length=255, index=True)
    assessment_type: str = Field(max_length=100, index=True)  # manual, automated, continuous, scheduled
    assessment_scope: str = Field(max_length=100)  # full, sample, incremental, targeted
    assessment_methodology: str = Field(max_length=100)
    
    # Quality Dimensions
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    validity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    uniqueness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    timeliness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Overall Quality Metrics
    overall_quality_score: float = Field(default=0.0, ge=0.0, le=1.0, index=True)
    quality_grade: str = Field(max_length=10, index=True)  # A+, A, B+, B, C+, C, D, F
    quality_level: DataQualityLevel = Field(default=DataQualityLevel.UNKNOWN, index=True)
    quality_trend: str = Field(default="stable", max_length=50)  # improving, degrading, stable
    
    # Detailed Quality Analysis
    quality_rules_evaluated: int = Field(default=0, ge=0)
    quality_rules_passed: int = Field(default=0, ge=0)
    quality_rules_failed: int = Field(default=0, ge=0)
    critical_issues_count: int = Field(default=0, ge=0)
    major_issues_count: int = Field(default=0, ge=0)
    minor_issues_count: int = Field(default=0, ge=0)
    
    # Data Profile Summary
    total_records_analyzed: int = Field(default=0, ge=0)
    null_records_count: int = Field(default=0, ge=0)
    duplicate_records_count: int = Field(default=0, ge=0)
    invalid_records_count: int = Field(default=0, ge=0)
    data_type_violations: int = Field(default=0, ge=0)
    
    # Statistical Analysis
    statistical_profile: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    distribution_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    outlier_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality Issues and Findings
    quality_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_anomalies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    business_rule_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Recommendations and Actions
    improvement_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    remediation_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    prevention_strategies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    monitoring_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Assessment Context
    assessment_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sampling_strategy: Optional[str] = Field(max_length=100)
    sample_size: Optional[int] = Field(ge=0)
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0)
    margin_of_error: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Business Impact
    business_impact_score: float = Field(default=0.0, ge=0.0, le=1.0)
    cost_of_poor_quality: Optional[float] = Field(ge=0.0)
    business_risks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    stakeholder_impact: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Assessment Execution
    assessment_duration_minutes: Optional[float] = Field(ge=0.0)
    resources_used: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    assessment_cost: Optional[float] = Field(ge=0.0)
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Validation and Approval
    assessment_status: str = Field(default="completed", max_length=50, index=True)
    validation_status: str = Field(default="pending", max_length=50)
    reviewed_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    review_comments: Optional[str] = Field(sa_column=Column(Text))
    
    # Temporal Management
    assessment_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    data_snapshot_date: datetime = Field(default_factory=datetime.utcnow)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    next_assessment_due: Optional[datetime] = None
    
    # Relationships
    asset: Optional[EnterpriseDataAsset] = Relationship(back_populates="quality_assessments")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_quality_score_level', 'overall_quality_score', 'quality_level'),
        Index('ix_quality_assessment_date', 'assessment_date', 'asset_id'),
        Index('ix_quality_issues', 'critical_issues_count', 'major_issues_count'),
        Index('ix_quality_business', 'business_impact_score', 'cost_of_poor_quality'),
        CheckConstraint('overall_quality_score >= 0.0 AND overall_quality_score <= 1.0'),
        CheckConstraint('completeness_score >= 0.0 AND completeness_score <= 1.0'),
        CheckConstraint('accuracy_score >= 0.0 AND accuracy_score <= 1.0'),
        UniqueConstraint('assessment_uuid'),
    )


class DataLineageEntry(SQLModel, table=True):
    """
    Advanced data lineage tracking with detailed transformation logic,
    impact analysis, and cross-system lineage integration.
    """
    __tablename__ = "data_lineage_entries"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    lineage_uuid: str = Field(index=True, unique=True)
    asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    
    # Lineage Configuration
    lineage_type: str = Field(max_length=100, index=True)  # column, table, schema, system
    lineage_direction: str = Field(max_length=50)  # upstream, downstream, bidirectional
    lineage_depth: int = Field(default=1, ge=1, le=20)
    lineage_scope: str = Field(max_length=100)  # complete, partial, sampled
    
    # Source and Target Information
    source_system: Optional[str] = Field(max_length=255)
    target_system: Optional[str] = Field(max_length=255)
    source_path: Optional[str] = Field(max_length=1000)
    target_path: Optional[str] = Field(max_length=1000)
    transformation_layer: Optional[str] = Field(max_length=100)
    
    # Lineage Graph Structure
    upstream_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    downstream_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    parent_lineage_id: Optional[int] = Field(foreign_key="data_lineage_entries.id")
    lineage_graph: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Transformation Details
    transformation_type: Optional[str] = Field(max_length=100)  # select, join, aggregate, filter, union
    transformation_logic: Optional[str] = Field(sa_column=Column(Text))
    transformation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sql_query: Optional[str] = Field(sa_column=Column(Text))
    transformation_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Column-Level Lineage
    column_mappings: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    field_transformations: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    derived_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    calculated_fields: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Flow Analysis
    data_flow_pattern: Optional[str] = Field(max_length=100)
    flow_frequency: Optional[str] = Field(max_length=50)  # real-time, batch, streaming, scheduled
    flow_volume: Optional[int] = Field(ge=0)
    flow_latency: Optional[float] = Field(ge=0.0)  # seconds
    data_velocity: Optional[float] = Field(ge=0.0)  # records per second
    
    # Impact Analysis
    impact_scope: str = Field(default="unknown", max_length=100)
    downstream_impact_count: int = Field(default=0, ge=0)
    upstream_dependency_count: int = Field(default=0, ge=0)
    criticality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    business_impact: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Trust
    lineage_confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    data_quality_impact: Optional[float] = Field(ge=0.0, le=1.0)
    trust_propagation: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_degradation: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Discovery and Validation
    discovery_method: str = Field(max_length=100)  # manual, automated, ml_inferred, log_analysis
    discovery_tools: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    validation_status: str = Field(default="pending", max_length=50, index=True)
    validation_evidence: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Context
    business_process: Optional[str] = Field(max_length=255)
    data_usage_context: Optional[str] = Field(max_length=500)
    business_rules_applied: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    stakeholder_groups: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Technical Metadata
    processing_engine: Optional[str] = Field(max_length=100)
    execution_environment: Optional[str] = Field(max_length=100)
    runtime_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Change Management
    lineage_version: str = Field(default="1.0.0", max_length=20)
    change_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_evolution_impact: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    breaking_changes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    anomaly_detection: bool = Field(default=False)
    alert_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    last_health_check: Optional[datetime] = None
    
    # Temporal Management
    effective_from: datetime = Field(default_factory=datetime.utcnow)
    effective_until: Optional[datetime] = None
    discovered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_verified: Optional[datetime] = None
    next_verification_due: Optional[datetime] = None
    
    # Relationships
    asset: Optional[EnterpriseDataAsset] = Relationship(back_populates="lineage_entries")
    parent_lineage: Optional["DataLineageEntry"] = Relationship(back_populates="child_lineages", sa_relationship_kwargs={"remote_side": "DataLineageEntry.id"})
    child_lineages: List["DataLineageEntry"] = Relationship(back_populates="parent_lineage", sa_relationship_kwargs={"remote_side": "DataLineageEntry.parent_lineage_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_lineage_type_direction', 'lineage_type', 'lineage_direction'),
        Index('ix_lineage_impact', 'criticality_score', 'downstream_impact_count'),
        Index('ix_lineage_confidence', 'lineage_confidence', 'validation_status'),
        Index('ix_lineage_discovery', 'discovered_at', 'discovery_method'),
        CheckConstraint('lineage_confidence >= 0.0 AND lineage_confidence <= 1.0'),
        CheckConstraint('criticality_score >= 0.0 AND criticality_score <= 1.0'),
        CheckConstraint('lineage_depth >= 1 AND lineage_depth <= 20'),
        UniqueConstraint('lineage_uuid'),
    )


class CatalogComment(SQLModel, table=True):
    """
    User comments and feedback system for catalog entries with
    moderation, threading, and collaboration features.
    """
    __tablename__ = "catalog_comments"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    comment_uuid: str = Field(index=True, unique=True)
    catalog_entry_id: int = Field(foreign_key="catalog_entries.id", index=True)
    
    # Comment Content
    comment_text: str = Field(sa_column=Column(Text))
    comment_type: str = Field(default="general", max_length=50)  # general, question, suggestion, issue
    is_question: bool = Field(default=False)
    is_resolved: bool = Field(default=False)
    
    # Author Information
    author_id: str = Field(max_length=255, index=True)
    author_name: Optional[str] = Field(max_length=255)
    author_role: Optional[str] = Field(max_length=100)
    is_verified_user: bool = Field(default=False)
    
    # Threading and Hierarchy
    parent_comment_id: Optional[int] = Field(foreign_key="catalog_comments.id")
    thread_depth: int = Field(default=0, ge=0, le=10)
    reply_count: int = Field(default=0, ge=0)
    is_thread_starter: bool = Field(default=True)
    
    # Engagement Metrics
    likes_count: int = Field(default=0, ge=0)
    dislikes_count: int = Field(default=0, ge=0)
    helpful_votes: int = Field(default=0, ge=0)
    spam_reports: int = Field(default=0, ge=0)
    
    # Moderation
    moderation_status: str = Field(default="approved", max_length=50, index=True)
    moderated_by: Optional[str] = Field(max_length=255)
    moderation_reason: Optional[str] = Field(max_length=500)
    moderation_date: Optional[datetime] = None
    
    # Visibility and Status
    is_public: bool = Field(default=True)
    is_pinned: bool = Field(default=False)
    is_highlighted: bool = Field(default=False)
    visibility_level: str = Field(default="public", max_length=50)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    catalog_entry: Optional[CatalogEntry] = Relationship(back_populates="comments")
    parent_comment: Optional["CatalogComment"] = Relationship(back_populates="replies", sa_relationship_kwargs={"remote_side": "CatalogComment.id"})
    replies: List["CatalogComment"] = Relationship(back_populates="parent_comment", sa_relationship_kwargs={"remote_side": "CatalogComment.parent_comment_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_comment_entry_author', 'catalog_entry_id', 'author_id'),
        Index('ix_comment_thread', 'parent_comment_id', 'thread_depth'),
        Index('ix_comment_engagement', 'likes_count', 'helpful_votes'),
        Index('ix_comment_moderation', 'moderation_status', 'created_at'),
        CheckConstraint('thread_depth >= 0 AND thread_depth <= 10'),
        UniqueConstraint('comment_uuid'),
    )


class CatalogRating(SQLModel, table=True):
    """
    Rating and review system for catalog entries with
    detailed feedback and quality assessment.
    """
    __tablename__ = "catalog_ratings"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    rating_uuid: str = Field(index=True, unique=True)
    catalog_entry_id: int = Field(foreign_key="catalog_entries.id", index=True)
    
    # Rating Information
    overall_rating: float = Field(ge=1.0, le=5.0, index=True)
    data_quality_rating: Optional[float] = Field(ge=1.0, le=5.0)
    usability_rating: Optional[float] = Field(ge=1.0, le=5.0)
    documentation_rating: Optional[float] = Field(ge=1.0, le=5.0)
    accuracy_rating: Optional[float] = Field(ge=1.0, le=5.0)
    
    # Review Content
    review_title: Optional[str] = Field(max_length=255)
    review_text: Optional[str] = Field(sa_column=Column(Text))
    pros_list: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    cons_list: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Reviewer Information
    reviewer_id: str = Field(max_length=255, index=True)
    reviewer_name: Optional[str] = Field(max_length=255)
    reviewer_expertise: Optional[str] = Field(max_length=100)
    is_verified_reviewer: bool = Field(default=False)
    
    # Usage Context
    use_case_category: Optional[str] = Field(max_length=100)
    usage_duration: Optional[str] = Field(max_length=50)  # weeks, months, years
    data_volume_used: Optional[str] = Field(max_length=50)  # small, medium, large
    
    # Helpfulness and Engagement
    helpful_votes: int = Field(default=0, ge=0)
    not_helpful_votes: int = Field(default=0, ge=0)
    verified_purchase: bool = Field(default=False)
    incentivized_review: bool = Field(default=False)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    catalog_entry: Optional[CatalogEntry] = Relationship(back_populates="ratings")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_rating_entry_score', 'catalog_entry_id', 'overall_rating'),
        Index('ix_rating_quality', 'data_quality_rating', 'usability_rating'),
        Index('ix_rating_helpfulness', 'helpful_votes', 'created_at'),
        CheckConstraint('overall_rating >= 1.0 AND overall_rating <= 5.0'),
        UniqueConstraint('rating_uuid'),
        UniqueConstraint('catalog_entry_id', 'reviewer_id'),  # One rating per user per entry
    )


# ===================== REQUEST AND RESPONSE MODELS =====================

class EnterpriseDataAssetResponse(BaseModel):
    """Response model for enterprise data assets"""
    id: int
    asset_uuid: str
    asset_name: str
    display_name: Optional[str]
    asset_type: AssetType
    business_domain: Optional[str]
    status: CatalogStatus
    data_quality_level: DataQualityLevel
    quality_score: float
    business_criticality: BusinessCriticality
    access_level: AccessLevel
    record_count: Optional[int]
    usage_frequency: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EnterpriseDataAssetCreate(BaseModel):
    """Request model for creating enterprise data assets"""
    asset_name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    asset_type: AssetType
    business_domain: Optional[str] = Field(max_length=100)
    data_domain: Optional[str] = Field(max_length=100)
    physical_location: Optional[str] = Field(max_length=500)
    data_source_id: Optional[int] = None
    business_purpose: Optional[str] = Field(max_length=500)
    business_criticality: BusinessCriticality = BusinessCriticality.STANDARD
    access_level: AccessLevel = AccessLevel.INTERNAL
    tags: Optional[List[str]] = []


class CatalogEntryResponse(BaseModel):
    """Response model for catalog entries"""
    id: int
    entry_uuid: str
    entry_name: str
    display_name: Optional[str]
    entry_type: CatalogEntryType
    catalog_domain: str
    catalog_category: str
    trust_score: float
    popularity_score: float
    rating_average: float
    review_count: int
    certification_status: str
    entry_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CatalogSearchRequest(BaseModel):
    """Request model for catalog search"""
    query: str = Field(min_length=1)
    filters: Optional[Dict[str, Any]] = {}
    domains: Optional[List[str]] = []
    asset_types: Optional[List[AssetType]] = []
    quality_levels: Optional[List[DataQualityLevel]] = []
    access_levels: Optional[List[AccessLevel]] = []
    sort_by: str = Field(default="relevance")
    sort_order: str = Field(default="desc", regex="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    include_facets: bool = True


class CatalogSearchResponse(BaseModel):
    """Response model for catalog search results"""
    total_results: int
    page: int
    page_size: int
    results: List[Dict[str, Any]]
    facets: Optional[Dict[str, List[Dict[str, Any]]]]
    suggestions: Optional[List[str]]
    search_time_ms: float


class AssetRelationshipCreate(BaseModel):
    """Request model for creating asset relationships"""
    source_asset_id: int
    target_asset_id: int
    relationship_type: str = Field(min_length=1, max_length=100)
    relationship_subtype: Optional[str] = Field(max_length=100)
    strength_score: float = Field(default=0.5, ge=0.0, le=1.0)
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    relationship_description: Optional[str] = Field(max_length=500)
    discovery_method: str = Field(min_length=1, max_length=100)


class DataQualityReport(BaseModel):
    """Data quality assessment report"""
    asset_uuid: str
    asset_name: str
    assessment_date: datetime
    overall_quality_score: float
    quality_level: DataQualityLevel
    quality_dimensions: Dict[str, float]
    issues_summary: Dict[str, int]
    recommendations: List[str]
    business_impact: Dict[str, Any]
    trend_analysis: Dict[str, Any]


# ===================== UTILITY FUNCTIONS =====================

def generate_asset_uuid() -> str:
    """Generate a unique UUID for data assets"""
    return f"asset_{uuid.uuid4().hex[:12]}"


def generate_catalog_uuid() -> str:
    """Generate a unique UUID for catalog entries"""
    return f"catalog_{uuid.uuid4().hex[:12]}"


def calculate_quality_grade(quality_score: float) -> str:
    """Calculate quality grade based on score"""
    if quality_score >= 0.95:
        return "A+"
    elif quality_score >= 0.90:
        return "A"
    elif quality_score >= 0.85:
        return "B+"
    elif quality_score >= 0.80:
        return "B"
    elif quality_score >= 0.70:
        return "C+"
    elif quality_score >= 0.60:
        return "C"
    elif quality_score >= 0.50:
        return "D"
    else:
        return "F"


def calculate_trust_score(
    quality_score: float,
    usage_frequency: int,
    validation_status: str,
    user_feedback: float
) -> float:
    """Calculate trust score based on multiple factors"""
    # Base trust from quality
    trust = quality_score * 0.4
    
    # Usage frequency contribution (normalized)
    usage_factor = min(usage_frequency / 1000.0, 1.0) * 0.2
    trust += usage_factor
    
    # Validation status contribution
    validation_weight = {
        "validated": 0.3,
        "pending": 0.1,
        "rejected": 0.0
    }
    trust += validation_weight.get(validation_status, 0.0)
    
    # User feedback contribution
    trust += (user_feedback / 5.0) * 0.1
    
    return min(trust, 1.0)


# Export all models and utilities
__all__ = [
    # Enums
    "AssetType", "CatalogStatus", "DataQualityLevel", "AccessLevel", "BusinessCriticality",
    "StewardshipRole", "CatalogEntryType",
    
    # Core Models
    "EnterpriseDataAsset", "CatalogEntry", "AssetRelationship", "DataQualityAssessment",
    "DataLineageEntry", "CatalogComment", "CatalogRating",
    
    # Request/Response Models
    "EnterpriseDataAssetResponse", "EnterpriseDataAssetCreate", "CatalogEntryResponse",
    "CatalogSearchRequest", "CatalogSearchResponse", "AssetRelationshipCreate",
    "DataQualityReport",
    
    # Utilities
    "generate_asset_uuid", "generate_catalog_uuid", "calculate_quality_grade", "calculate_trust_score"
]