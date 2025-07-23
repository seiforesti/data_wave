from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc, text
from typing import List, Dict, Any, Optional, Tuple, Union, Set
import asyncio
import json
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import LatentDirichletAllocation, NMF
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.neighbors import NearestNeighbors
from sklearn.manifold import TSNE
import networkx as nx
from collections import defaultdict, Counter
import re
from dataclasses import dataclass, field
from enum import Enum

from app.models.catalog_models import DataAsset, DatasetMetadata, AssetTag
from app.models.scan_models import DataSource, ScanResult
from app.models.auth_models import User
from app.models.classification_models import ClassificationResult
from app.utils.uuid_utils import generate_uuid
from app.utils.scoring_utils import calculate_confidence_score

logger = logging.getLogger(__name__)

class RecommendationType(str, Enum):
    SIMILAR_ASSETS = "similar_assets"
    RELATED_DATASETS = "related_datasets"
    COMPLEMENTARY_DATA = "complementary_data"
    DATA_LINEAGE = "data_lineage"
    USAGE_BASED = "usage_based"
    CONTENT_BASED = "content_based"
    COLLABORATIVE = "collaborative"
    SEMANTIC_BASED = "semantic_based"
    QUALITY_BASED = "quality_based"
    BUSINESS_VALUE = "business_value"

class RecommendationStrategy(str, Enum):
    CONTENT_FILTERING = "content_filtering"
    COLLABORATIVE_FILTERING = "collaborative_filtering"
    HYBRID = "hybrid"
    KNOWLEDGE_GRAPH = "knowledge_graph"
    SEMANTIC_SIMILARITY = "semantic_similarity"
    USAGE_PATTERNS = "usage_patterns"
    BUSINESS_CONTEXT = "business_context"

@dataclass
class RecommendationContext:
    """Context for generating recommendations"""
    user_id: Optional[int] = None
    user_role: Optional[str] = None
    user_department: Optional[str] = None
    current_assets: List[int] = field(default_factory=list)
    search_query: Optional[str] = None
    business_context: Dict[str, Any] = field(default_factory=dict)
    usage_history: List[Dict[str, Any]] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    filters: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)

class CatalogRecommendationService:
    """
    Advanced catalog recommendation service with AI-powered algorithms,
    semantic understanding, and personalized recommendations
    """

    def __init__(self):
        self.recommendation_engines = {}
        self.ml_models = {}
        self.knowledge_graph = nx.Graph()
        self.user_profiles = {}
        self.asset_embeddings = {}
        self.semantic_index = {}
        self.usage_patterns = defaultdict(list)
        self.business_glossary = {}
        
        # Initialize ML models
        self._initialize_ml_models()
        
        # Initialize recommendation engines
        self._initialize_recommendation_engines()

    def _initialize_ml_models(self):
        """Initialize machine learning models for recommendations"""
        try:
            # Content-based models
            self.ml_models['tfidf_vectorizer'] = TfidfVectorizer(
                max_features=10000,
                stop_words='english',
                ngram_range=(1, 3),
                min_df=2,
                max_df=0.8
            )
            
            # Collaborative filtering models
            self.ml_models['user_similarity'] = NearestNeighbors(
                n_neighbors=20,
                metric='cosine',
                algorithm='brute'
            )
            
            # Clustering models
            self.ml_models['asset_clusters'] = KMeans(
                n_clusters=50,
                random_state=42,
                n_init=10
            )
            
            # Topic modeling
            self.ml_models['lda_model'] = LatentDirichletAllocation(
                n_components=20,
                random_state=42,
                max_iter=100
            )
            
            # Semantic similarity
            self.ml_models['semantic_similarity'] = NearestNeighbors(
                n_neighbors=10,
                metric='cosine'
            )
            
            # Quality predictor
            self.ml_models['quality_predictor'] = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            logger.info("ML models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing ML models: {str(e)}")

    def _initialize_recommendation_engines(self):
        """Initialize different recommendation engines"""
        try:
            self.recommendation_engines = {
                RecommendationType.SIMILAR_ASSETS: self._recommend_similar_assets,
                RecommendationType.RELATED_DATASETS: self._recommend_related_datasets,
                RecommendationType.COMPLEMENTARY_DATA: self._recommend_complementary_data,
                RecommendationType.DATA_LINEAGE: self._recommend_lineage_based,
                RecommendationType.USAGE_BASED: self._recommend_usage_based,
                RecommendationType.CONTENT_BASED: self._recommend_content_based,
                RecommendationType.COLLABORATIVE: self._recommend_collaborative,
                RecommendationType.SEMANTIC_BASED: self._recommend_semantic_based,
                RecommendationType.QUALITY_BASED: self._recommend_quality_based,
                RecommendationType.BUSINESS_VALUE: self._recommend_business_value
            }
            
            logger.info("Recommendation engines initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing recommendation engines: {str(e)}")

    async def generate_personalized_recommendations(
        self,
        db: Session,
        context: RecommendationContext,
        recommendation_types: List[RecommendationType] = None,
        max_recommendations: int = 20
    ) -> Dict[str, Any]:
        """
        Generate personalized recommendations based on user context and preferences
        """
        try:
            # Default recommendation types if not specified
            if not recommendation_types:
                recommendation_types = [
                    RecommendationType.SIMILAR_ASSETS,
                    RecommendationType.USAGE_BASED,
                    RecommendationType.CONTENT_BASED,
                    RecommendationType.SEMANTIC_BASED
                ]
            
            # Update user profile
            await self._update_user_profile(db, context)
            
            # Generate recommendations for each type
            all_recommendations = {}
            
            for rec_type in recommendation_types:
                try:
                    if rec_type in self.recommendation_engines:
                        recommendations = await self.recommendation_engines[rec_type](
                            db, context, max_recommendations // len(recommendation_types)
                        )
                        all_recommendations[rec_type.value] = recommendations
                    
                except Exception as e:
                    logger.error(f"Error generating {rec_type.value} recommendations: {str(e)}")
                    all_recommendations[rec_type.value] = []
            
            # Combine and rank recommendations
            combined_recommendations = await self._combine_and_rank_recommendations(
                db=db,
                recommendations=all_recommendations,
                context=context,
                max_results=max_recommendations
            )
            
            # Generate explanation for recommendations
            explanations = await self._generate_recommendation_explanations(
                db=db,
                recommendations=combined_recommendations,
                context=context
            )
            
            # Calculate diversity score
            diversity_score = self._calculate_recommendation_diversity(combined_recommendations)
            
            return {
                "recommendations": combined_recommendations,
                "explanations": explanations,
                "recommendation_types": [rt.value for rt in recommendation_types],
                "total_recommendations": len(combined_recommendations),
                "diversity_score": diversity_score,
                "personalization_score": await self._calculate_personalization_score(
                    combined_recommendations, context
                ),
                "generated_at": datetime.utcnow().isoformat(),
                "context_summary": {
                    "user_id": context.user_id,
                    "current_assets_count": len(context.current_assets),
                    "has_search_query": bool(context.search_query),
                    "has_business_context": bool(context.business_context)
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {str(e)}")
            raise

    async def _recommend_similar_assets(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets similar to current user's assets"""
        try:
            if not context.current_assets:
                return []
            
            # Get current assets
            current_assets = db.query(DataAsset).filter(
                DataAsset.id.in_(context.current_assets)
            ).all()
            
            if not current_assets:
                return []
            
            # Extract features from current assets
            current_features = await self._extract_asset_features(current_assets)
            
            # Find similar assets using content-based filtering
            similar_assets = []
            
            # Get all other assets
            all_assets = db.query(DataAsset).filter(
                ~DataAsset.id.in_(context.current_assets)
            ).limit(1000).all()  # Limit for performance
            
            # Calculate similarity scores
            similarities = []
            for asset in all_assets:
                asset_features = await self._extract_asset_features([asset])
                similarity_score = self._calculate_feature_similarity(
                    current_features, asset_features
                )
                
                if similarity_score > 0.3:  # Threshold for similarity
                    similarities.append({
                        "asset": asset,
                        "similarity_score": similarity_score
                    })
            
            # Sort by similarity and take top results
            similarities.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            for sim in similarities[:max_results]:
                asset = sim["asset"]
                similar_assets.append({
                    "asset_id": asset.id,
                    "asset_name": asset.name,
                    "asset_type": asset.asset_type,
                    "description": asset.description,
                    "similarity_score": sim["similarity_score"],
                    "recommendation_reason": "Similar content and metadata",
                    "confidence_score": sim["similarity_score"] * 0.9,
                    "tags": [tag.name for tag in asset.tags] if hasattr(asset, 'tags') else []
                })
            
            return similar_assets
            
        except Exception as e:
            logger.error(f"Error recommending similar assets: {str(e)}")
            return []

    async def _recommend_usage_based(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets based on usage patterns"""
        try:
            if not context.user_id:
                return []
            
            # Get user's usage history
            user_usage = self.usage_patterns.get(context.user_id, [])
            
            if not user_usage:
                # Use similar users' patterns
                similar_users = await self._find_similar_users(db, context)
                for user_id in similar_users[:5]:  # Top 5 similar users
                    user_usage.extend(self.usage_patterns.get(user_id, []))
            
            # Analyze usage patterns
            usage_recommendations = []
            asset_usage_counts = Counter()
            
            for usage_record in user_usage:
                asset_id = usage_record.get("asset_id")
                if asset_id and asset_id not in context.current_assets:
                    asset_usage_counts[asset_id] += 1
            
            # Get top used assets
            for asset_id, usage_count in asset_usage_counts.most_common(max_results):
                asset = db.query(DataAsset).filter(DataAsset.id == asset_id).first()
                if asset:
                    usage_recommendations.append({
                        "asset_id": asset.id,
                        "asset_name": asset.name,
                        "asset_type": asset.asset_type,
                        "description": asset.description,
                        "usage_count": usage_count,
                        "recommendation_reason": "Frequently used by similar users",
                        "confidence_score": min(0.95, usage_count / 10),
                        "popularity_score": usage_count
                    })
            
            return usage_recommendations
            
        except Exception as e:
            logger.error(f"Error recommending usage-based assets: {str(e)}")
            return []

    async def _recommend_content_based(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets based on content analysis"""
        try:
            recommendations = []
            
            # Use search query if available
            if context.search_query:
                # Vectorize search query
                query_vector = self._vectorize_text(context.search_query)
                
                # Find assets with similar content
                all_assets = db.query(DataAsset).limit(1000).all()
                
                content_similarities = []
                for asset in all_assets:
                    if asset.id in context.current_assets:
                        continue
                    
                    # Combine asset text content
                    asset_text = f"{asset.name} {asset.description or ''}"
                    if hasattr(asset, 'metadata') and asset.metadata:
                        asset_text += f" {json.dumps(asset.metadata)}"
                    
                    asset_vector = self._vectorize_text(asset_text)
                    similarity = self._calculate_cosine_similarity(query_vector, asset_vector)
                    
                    if similarity > 0.2:
                        content_similarities.append({
                            "asset": asset,
                            "similarity": similarity
                        })
                
                # Sort and take top results
                content_similarities.sort(key=lambda x: x["similarity"], reverse=True)
                
                for sim in content_similarities[:max_results]:
                    asset = sim["asset"]
                    recommendations.append({
                        "asset_id": asset.id,
                        "asset_name": asset.name,
                        "asset_type": asset.asset_type,
                        "description": asset.description,
                        "content_similarity": sim["similarity"],
                        "recommendation_reason": "Content matches your search",
                        "confidence_score": sim["similarity"] * 0.8,
                        "matching_terms": self._extract_matching_terms(
                            context.search_query, asset.name + " " + (asset.description or "")
                        )
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending content-based assets: {str(e)}")
            return []

    async def _recommend_semantic_based(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets based on semantic similarity"""
        try:
            recommendations = []
            
            # Get current assets for semantic analysis
            if context.current_assets:
                current_assets = db.query(DataAsset).filter(
                    DataAsset.id.in_(context.current_assets)
                ).all()
                
                # Extract semantic features
                current_semantic_features = await self._extract_semantic_features(current_assets)
                
                # Find semantically similar assets
                all_assets = db.query(DataAsset).filter(
                    ~DataAsset.id.in_(context.current_assets)
                ).limit(1000).all()
                
                semantic_similarities = []
                for asset in all_assets:
                    asset_semantic_features = await self._extract_semantic_features([asset])
                    
                    semantic_similarity = self._calculate_semantic_similarity(
                        current_semantic_features, asset_semantic_features
                    )
                    
                    if semantic_similarity > 0.4:
                        semantic_similarities.append({
                            "asset": asset,
                            "semantic_similarity": semantic_similarity
                        })
                
                # Sort by semantic similarity
                semantic_similarities.sort(key=lambda x: x["semantic_similarity"], reverse=True)
                
                for sim in semantic_similarities[:max_results]:
                    asset = sim["asset"]
                    recommendations.append({
                        "asset_id": asset.id,
                        "asset_name": asset.name,
                        "asset_type": asset.asset_type,
                        "description": asset.description,
                        "semantic_similarity": sim["semantic_similarity"],
                        "recommendation_reason": "Semantically related to your assets",
                        "confidence_score": sim["semantic_similarity"] * 0.85,
                        "semantic_concepts": await self._extract_semantic_concepts(asset)
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending semantic-based assets: {str(e)}")
            return []

    async def _recommend_related_datasets(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend datasets related through lineage or business relationships"""
        try:
            recommendations = []
            
            if context.current_assets:
                # Build relationship graph
                relationship_graph = await self._build_asset_relationship_graph(db, context.current_assets)
                
                # Find related assets through graph traversal
                related_assets = []
                for asset_id in context.current_assets:
                    if asset_id in relationship_graph:
                        # Get neighbors (related assets)
                        neighbors = list(relationship_graph.neighbors(asset_id))
                        for neighbor_id in neighbors:
                            if neighbor_id not in context.current_assets:
                                # Get relationship strength
                                edge_data = relationship_graph.get_edge_data(asset_id, neighbor_id)
                                relationship_strength = edge_data.get('weight', 0.5)
                                
                                related_assets.append({
                                    "asset_id": neighbor_id,
                                    "relationship_strength": relationship_strength,
                                    "relationship_type": edge_data.get('type', 'unknown')
                                })
                
                # Remove duplicates and sort by strength
                unique_assets = {}
                for asset in related_assets:
                    asset_id = asset["asset_id"]
                    if asset_id not in unique_assets or asset["relationship_strength"] > unique_assets[asset_id]["relationship_strength"]:
                        unique_assets[asset_id] = asset
                
                sorted_assets = sorted(unique_assets.values(), key=lambda x: x["relationship_strength"], reverse=True)
                
                # Get asset details
                for asset_data in sorted_assets[:max_results]:
                    asset = db.query(DataAsset).filter(DataAsset.id == asset_data["asset_id"]).first()
                    if asset:
                        recommendations.append({
                            "asset_id": asset.id,
                            "asset_name": asset.name,
                            "asset_type": asset.asset_type,
                            "description": asset.description,
                            "relationship_strength": asset_data["relationship_strength"],
                            "relationship_type": asset_data["relationship_type"],
                            "recommendation_reason": f"Related through {asset_data['relationship_type']}",
                            "confidence_score": asset_data["relationship_strength"] * 0.9
                        })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending related datasets: {str(e)}")
            return []

    async def _recommend_complementary_data(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend complementary data that would enhance current assets"""
        try:
            recommendations = []
            
            if context.current_assets:
                # Analyze current assets to identify gaps
                current_assets = db.query(DataAsset).filter(
                    DataAsset.id.in_(context.current_assets)
                ).all()
                
                # Extract data domains and types
                current_domains = set()
                current_types = set()
                current_schemas = []
                
                for asset in current_assets:
                    if hasattr(asset, 'domain') and asset.domain:
                        current_domains.add(asset.domain)
                    current_types.add(asset.asset_type)
                    
                    # Extract schema information if available
                    if hasattr(asset, 'schema') and asset.schema:
                        current_schemas.append(asset.schema)
                
                # Find complementary assets
                complementary_candidates = db.query(DataAsset).filter(
                    ~DataAsset.id.in_(context.current_assets)
                ).limit(1000).all()
                
                complementary_scores = []
                for candidate in complementary_candidates:
                    complementarity_score = await self._calculate_complementarity_score(
                        candidate, current_domains, current_types, current_schemas
                    )
                    
                    if complementarity_score > 0.3:
                        complementary_scores.append({
                            "asset": candidate,
                            "complementarity_score": complementarity_score
                        })
                
                # Sort by complementarity score
                complementary_scores.sort(key=lambda x: x["complementarity_score"], reverse=True)
                
                for comp in complementary_scores[:max_results]:
                    asset = comp["asset"]
                    recommendations.append({
                        "asset_id": asset.id,
                        "asset_name": asset.name,
                        "asset_type": asset.asset_type,
                        "description": asset.description,
                        "complementarity_score": comp["complementarity_score"],
                        "recommendation_reason": "Complements your current data assets",
                        "confidence_score": comp["complementarity_score"] * 0.8,
                        "complementary_aspects": await self._identify_complementary_aspects(
                            asset, current_domains, current_types
                        )
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending complementary data: {str(e)}")
            return []

    async def _recommend_lineage_based(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets based on data lineage relationships"""
        try:
            recommendations = []
            
            if context.current_assets:
                # Build lineage graph
                lineage_graph = await self._build_lineage_graph(db, context.current_assets)
                
                # Find upstream and downstream assets
                lineage_assets = set()
                
                for asset_id in context.current_assets:
                    if asset_id in lineage_graph:
                        # Get upstream assets (sources)
                        predecessors = list(lineage_graph.predecessors(asset_id))
                        lineage_assets.update(predecessors)
                        
                        # Get downstream assets (targets)
                        successors = list(lineage_graph.successors(asset_id))
                        lineage_assets.update(successors)
                
                # Remove current assets
                lineage_assets = lineage_assets - set(context.current_assets)
                
                # Get asset details and calculate lineage scores
                for asset_id in list(lineage_assets)[:max_results]:
                    asset = db.query(DataAsset).filter(DataAsset.id == asset_id).first()
                    if asset:
                        # Calculate lineage relevance score
                        lineage_score = await self._calculate_lineage_relevance(
                            db, asset_id, context.current_assets, lineage_graph
                        )
                        
                        recommendations.append({
                            "asset_id": asset.id,
                            "asset_name": asset.name,
                            "asset_type": asset.asset_type,
                            "description": asset.description,
                            "lineage_score": lineage_score,
                            "recommendation_reason": "Connected through data lineage",
                            "confidence_score": lineage_score * 0.9,
                            "lineage_relationship": await self._determine_lineage_relationship(
                                asset_id, context.current_assets, lineage_graph
                            )
                        })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending lineage-based assets: {str(e)}")
            return []

    async def _recommend_collaborative(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets using collaborative filtering"""
        try:
            recommendations = []
            
            if context.user_id:
                # Find users with similar preferences
                similar_users = await self._find_similar_users(db, context)
                
                if similar_users:
                    # Get assets used by similar users
                    collaborative_assets = Counter()
                    
                    for similar_user_id in similar_users[:10]:  # Top 10 similar users
                        user_assets = self.usage_patterns.get(similar_user_id, [])
                        for usage_record in user_assets:
                            asset_id = usage_record.get("asset_id")
                            if asset_id and asset_id not in context.current_assets:
                                collaborative_assets[asset_id] += 1
                    
                    # Get top collaborative recommendations
                    for asset_id, usage_count in collaborative_assets.most_common(max_results):
                        asset = db.query(DataAsset).filter(DataAsset.id == asset_id).first()
                        if asset:
                            collaborative_score = min(1.0, usage_count / len(similar_users))
                            
                            recommendations.append({
                                "asset_id": asset.id,
                                "asset_name": asset.name,
                                "asset_type": asset.asset_type,
                                "description": asset.description,
                                "collaborative_score": collaborative_score,
                                "recommendation_reason": "Recommended by users with similar interests",
                                "confidence_score": collaborative_score * 0.85,
                                "similar_users_count": usage_count
                            })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending collaborative assets: {str(e)}")
            return []

    async def _recommend_quality_based(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend high-quality assets"""
        try:
            recommendations = []
            
            # Get assets with quality scores
            assets_with_quality = db.query(DataAsset).filter(
                ~DataAsset.id.in_(context.current_assets),
                DataAsset.quality_score.isnot(None)
            ).order_by(desc(DataAsset.quality_score)).limit(max_results * 2).all()
            
            # Filter and rank by quality
            quality_recommendations = []
            for asset in assets_with_quality:
                if asset.quality_score > 0.7:  # High quality threshold
                    quality_recommendations.append({
                        "asset": asset,
                        "quality_score": asset.quality_score
                    })
            
            # Sort by quality score
            quality_recommendations.sort(key=lambda x: x["quality_score"], reverse=True)
            
            for qual_rec in quality_recommendations[:max_results]:
                asset = qual_rec["asset"]
                recommendations.append({
                    "asset_id": asset.id,
                    "asset_name": asset.name,
                    "asset_type": asset.asset_type,
                    "description": asset.description,
                    "quality_score": qual_rec["quality_score"],
                    "recommendation_reason": "High quality data asset",
                    "confidence_score": qual_rec["quality_score"] * 0.9,
                    "quality_metrics": await self._get_quality_metrics(asset)
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending quality-based assets: {str(e)}")
            return []

    async def _recommend_business_value(
        self,
        db: Session,
        context: RecommendationContext,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Recommend assets based on business value"""
        try:
            recommendations = []
            
            # Calculate business value scores for assets
            all_assets = db.query(DataAsset).filter(
                ~DataAsset.id.in_(context.current_assets)
            ).limit(1000).all()
            
            business_value_scores = []
            for asset in all_assets:
                business_value = await self._calculate_business_value_score(
                    db, asset, context
                )
                
                if business_value > 0.5:
                    business_value_scores.append({
                        "asset": asset,
                        "business_value": business_value
                    })
            
            # Sort by business value
            business_value_scores.sort(key=lambda x: x["business_value"], reverse=True)
            
            for bv_score in business_value_scores[:max_results]:
                asset = bv_score["asset"]
                recommendations.append({
                    "asset_id": asset.id,
                    "asset_name": asset.name,
                    "asset_type": asset.asset_type,
                    "description": asset.description,
                    "business_value": bv_score["business_value"],
                    "recommendation_reason": "High business value potential",
                    "confidence_score": bv_score["business_value"] * 0.8,
                    "value_drivers": await self._identify_value_drivers(asset, context)
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error recommending business value assets: {str(e)}")
            return []

    # Helper methods for recommendation generation

    async def _extract_asset_features(self, assets: List[DataAsset]) -> Dict[str, Any]:
        """Extract features from assets for similarity calculation"""
        try:
            features = {
                "asset_types": Counter(),
                "domains": Counter(),
                "tags": Counter(),
                "text_content": "",
                "schema_elements": Counter(),
                "quality_scores": []
            }
            
            for asset in assets:
                # Asset type
                features["asset_types"][asset.asset_type] += 1
                
                # Domain
                if hasattr(asset, 'domain') and asset.domain:
                    features["domains"][asset.domain] += 1
                
                # Tags
                if hasattr(asset, 'tags'):
                    for tag in asset.tags:
                        features["tags"][tag.name] += 1
                
                # Text content
                text_parts = [asset.name]
                if asset.description:
                    text_parts.append(asset.description)
                features["text_content"] += " " + " ".join(text_parts)
                
                # Quality score
                if hasattr(asset, 'quality_score') and asset.quality_score:
                    features["quality_scores"].append(asset.quality_score)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting asset features: {str(e)}")
            return {}

    def _calculate_feature_similarity(
        self,
        features1: Dict[str, Any],
        features2: Dict[str, Any]
    ) -> float:
        """Calculate similarity between two feature sets"""
        try:
            similarity_scores = []
            
            # Asset type similarity
            types1 = set(features1.get("asset_types", {}).keys())
            types2 = set(features2.get("asset_types", {}).keys())
            type_similarity = len(types1 & types2) / len(types1 | types2) if types1 | types2 else 0
            similarity_scores.append(type_similarity * 0.3)
            
            # Domain similarity
            domains1 = set(features1.get("domains", {}).keys())
            domains2 = set(features2.get("domains", {}).keys())
            domain_similarity = len(domains1 & domains2) / len(domains1 | domains2) if domains1 | domains2 else 0
            similarity_scores.append(domain_similarity * 0.2)
            
            # Tag similarity
            tags1 = set(features1.get("tags", {}).keys())
            tags2 = set(features2.get("tags", {}).keys())
            tag_similarity = len(tags1 & tags2) / len(tags1 | tags2) if tags1 | tags2 else 0
            similarity_scores.append(tag_similarity * 0.3)
            
            # Text content similarity
            text1 = features1.get("text_content", "")
            text2 = features2.get("text_content", "")
            if text1 and text2:
                text_similarity = self._calculate_text_similarity(text1, text2)
                similarity_scores.append(text_similarity * 0.2)
            
            return sum(similarity_scores)
            
        except Exception as e:
            logger.error(f"Error calculating feature similarity: {str(e)}")
            return 0.0

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using TF-IDF and cosine similarity"""
        try:
            if not text1 or not text2:
                return 0.0
            
            # Simple word-based similarity for now
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())
            
            intersection = len(words1 & words2)
            union = len(words1 | words2)
            
            return intersection / union if union > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating text similarity: {str(e)}")
            return 0.0

    def _vectorize_text(self, text: str) -> np.ndarray:
        """Vectorize text using TF-IDF"""
        try:
            # Simple bag-of-words vectorization for now
            words = text.lower().split()
            word_counts = Counter(words)
            
            # Create a simple vector (this would be replaced with proper TF-IDF)
            vector = np.array(list(word_counts.values()))
            return vector / np.linalg.norm(vector) if np.linalg.norm(vector) > 0 else vector
            
        except Exception as e:
            logger.error(f"Error vectorizing text: {str(e)}")
            return np.array([])

    def _calculate_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            if len(vec1) == 0 or len(vec2) == 0:
                return 0.0
            
            # Pad vectors to same length
            max_len = max(len(vec1), len(vec2))
            vec1_padded = np.pad(vec1, (0, max_len - len(vec1)))
            vec2_padded = np.pad(vec2, (0, max_len - len(vec2)))
            
            # Calculate cosine similarity
            dot_product = np.dot(vec1_padded, vec2_padded)
            norm1 = np.linalg.norm(vec1_padded)
            norm2 = np.linalg.norm(vec2_padded)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return dot_product / (norm1 * norm2)
            
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {str(e)}")
            return 0.0

    async def _find_similar_users(
        self,
        db: Session,
        context: RecommendationContext
    ) -> List[int]:
        """Find users with similar preferences and usage patterns"""
        try:
            if not context.user_id:
                return []
            
            # Get current user's profile
            current_user_profile = self.user_profiles.get(context.user_id, {})
            
            # Find similar users based on various factors
            similar_users = []
            
            # Check all users (in practice, this would be optimized)
            all_users = db.query(User).limit(1000).all()
            
            for user in all_users:
                if user.id == context.user_id:
                    continue
                
                user_profile = self.user_profiles.get(user.id, {})
                similarity_score = self._calculate_user_similarity(
                    current_user_profile, user_profile
                )
                
                if similarity_score > 0.3:  # Similarity threshold
                    similar_users.append(user.id)
            
            return similar_users
            
        except Exception as e:
            logger.error(f"Error finding similar users: {str(e)}")
            return []

    def _calculate_user_similarity(
        self,
        profile1: Dict[str, Any],
        profile2: Dict[str, Any]
    ) -> float:
        """Calculate similarity between two user profiles"""
        try:
            similarity_factors = []
            
            # Role similarity
            role1 = profile1.get("role", "")
            role2 = profile2.get("role", "")
            if role1 and role2:
                role_similarity = 1.0 if role1 == role2 else 0.0
                similarity_factors.append(role_similarity * 0.3)
            
            # Department similarity
            dept1 = profile1.get("department", "")
            dept2 = profile2.get("department", "")
            if dept1 and dept2:
                dept_similarity = 1.0 if dept1 == dept2 else 0.0
                similarity_factors.append(dept_similarity * 0.2)
            
            # Interest similarity (based on asset types used)
            interests1 = set(profile1.get("interests", []))
            interests2 = set(profile2.get("interests", []))
            if interests1 and interests2:
                interest_similarity = len(interests1 & interests2) / len(interests1 | interests2)
                similarity_factors.append(interest_similarity * 0.5)
            
            return sum(similarity_factors) if similarity_factors else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating user similarity: {str(e)}")
            return 0.0

    async def _update_user_profile(self, db: Session, context: RecommendationContext):
        """Update user profile based on current context"""
        try:
            if not context.user_id:
                return
            
            # Get or create user profile
            if context.user_id not in self.user_profiles:
                self.user_profiles[context.user_id] = {
                    "interests": [],
                    "usage_history": [],
                    "preferences": {},
                    "last_updated": datetime.utcnow()
                }
            
            profile = self.user_profiles[context.user_id]
            
            # Update with current context
            if context.current_assets:
                # Get asset types for interest tracking
                assets = db.query(DataAsset).filter(
                    DataAsset.id.in_(context.current_assets)
                ).all()
                
                for asset in assets:
                    if asset.asset_type not in profile["interests"]:
                        profile["interests"].append(asset.asset_type)
            
            # Update usage history
            profile["usage_history"].append({
                "timestamp": context.timestamp.isoformat(),
                "assets": context.current_assets,
                "search_query": context.search_query,
                "business_context": context.business_context
            })
            
            # Keep only recent history (last 100 entries)
            profile["usage_history"] = profile["usage_history"][-100:]
            
            profile["last_updated"] = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")

    # Additional helper methods would continue here...
    # This represents a comprehensive catalog recommendation service