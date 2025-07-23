from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime

from app.core.deps import get_db_session, get_current_user
from app.services.enterprise_catalog_service import EnterpriseCatalogService
from app.services.intelligent_discovery_service import IntelligentDiscoveryService
from app.models.advanced_catalog_models import (
    CatalogEntry, SemanticTag, BusinessGlossary, DataAsset,
    SearchResult, SearchFilter, SearchContext
)
from app.models.auth_models import User

router = APIRouter(prefix="/semantic-search", tags=["Semantic Search"])

# Pydantic Models for API
class SemanticSearchRequest(BaseModel):
    query: str
    search_type: Optional[str] = "comprehensive"  # comprehensive, semantic, keyword, fuzzy
    filters: Optional[Dict[str, Any]] = {}
    context: Optional[Dict[str, Any]] = {}
    limit: Optional[int] = 20
    include_suggestions: Optional[bool] = True
    include_facets: Optional[bool] = True

class SearchSuggestionRequest(BaseModel):
    partial_query: str
    context: Optional[Dict[str, Any]] = {}
    limit: Optional[int] = 10

class SemanticAnalysisRequest(BaseModel):
    text: str
    analysis_type: Optional[str] = "full"  # full, entities, concepts, relationships
    include_context: Optional[bool] = True

class BusinessTermRequest(BaseModel):
    term: str
    definition: str
    category: Optional[str] = None
    synonyms: Optional[List[str]] = []
    related_terms: Optional[List[str]] = []
    business_context: Optional[Dict[str, Any]] = {}

@router.post("/search", response_model=Dict[str, Any])
async def semantic_search(
    request: SemanticSearchRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform semantic search across all catalog assets with AI-powered understanding
    """
    try:
        # Execute semantic search
        search_results = await EnterpriseCatalogService.semantic_search(
            db=db,
            query=request.query,
            search_type=request.search_type,
            filters=request.filters,
            context=request.context,
            user_id=current_user.id,
            limit=request.limit
        )

        # Get search suggestions if requested
        suggestions = []
        if request.include_suggestions:
            suggestions = await EnterpriseCatalogService.get_search_suggestions(
                db=db,
                query=request.query,
                context=request.context,
                limit=5
            )

        # Get search facets if requested
        facets = {}
        if request.include_facets:
            facets = await EnterpriseCatalogService.get_search_facets(
                db=db,
                query=request.query,
                filters=request.filters
            )

        # Calculate search analytics
        search_analytics = await EnterpriseCatalogService.calculate_search_analytics(
            db=db,
            query=request.query,
            results=search_results,
            user_id=current_user.id
        )

        return {
            "success": True,
            "query": request.query,
            "search_type": request.search_type,
            "results": search_results,
            "total_results": len(search_results),
            "suggestions": suggestions,
            "facets": facets,
            "analytics": search_analytics,
            "search_time": search_analytics.get("search_time_ms", 0),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")

@router.get("/suggestions", response_model=Dict[str, Any])
async def get_search_suggestions(
    query: str = Query(..., description="Partial search query"),
    context: Optional[str] = Query(None, description="Search context as JSON string"),
    limit: int = Query(10, description="Maximum number of suggestions"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get real-time search suggestions based on partial query
    """
    try:
        import json
        context_dict = json.loads(context) if context else {}

        suggestions = await EnterpriseCatalogService.get_search_suggestions(
            db=db,
            query=query,
            context=context_dict,
            limit=limit
        )

        # Get popular searches
        popular_searches = await EnterpriseCatalogService.get_popular_searches(
            db=db,
            user_id=current_user.id,
            limit=5
        )

        # Get recent searches
        recent_searches = await EnterpriseCatalogService.get_recent_searches(
            db=db,
            user_id=current_user.id,
            limit=5
        )

        return {
            "success": True,
            "query": query,
            "suggestions": suggestions,
            "popular_searches": popular_searches,
            "recent_searches": recent_searches,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

@router.post("/analyze-text", response_model=Dict[str, Any])
async def analyze_semantic_content(
    request: SemanticAnalysisRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform semantic analysis on text content to extract entities, concepts, and relationships
    """
    try:
        # Perform semantic analysis
        analysis_results = await IntelligentDiscoveryService.analyze_semantic_content(
            db=db,
            text=request.text,
            analysis_type=request.analysis_type,
            include_context=request.include_context
        )

        # Extract business terms
        business_terms = await EnterpriseCatalogService.extract_business_terms(
            db=db,
            text=request.text
        )

        # Get related assets
        related_assets = await EnterpriseCatalogService.find_related_assets(
            db=db,
            semantic_content=analysis_results,
            limit=10
        )

        return {
            "success": True,
            "text": request.text,
            "analysis_type": request.analysis_type,
            "semantic_analysis": analysis_results,
            "business_terms": business_terms,
            "related_assets": related_assets,
            "confidence_score": analysis_results.get("confidence_score", 0.0),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic analysis failed: {str(e)}")

@router.get("/business-glossary", response_model=Dict[str, Any])
async def get_business_glossary(
    category: Optional[str] = Query(None, description="Filter by category"),
    search_term: Optional[str] = Query(None, description="Search within glossary"),
    limit: int = Query(50, description="Maximum number of terms"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get business glossary with semantic search capabilities
    """
    try:
        glossary_terms = await EnterpriseCatalogService.get_business_glossary(
            db=db,
            category=category,
            search_term=search_term,
            limit=limit,
            offset=offset
        )

        # Get glossary statistics
        glossary_stats = await EnterpriseCatalogService.get_glossary_statistics(db=db)

        # Get term relationships
        term_relationships = await EnterpriseCatalogService.get_term_relationships(
            db=db,
            terms=[term["term"] for term in glossary_terms]
        )

        return {
            "success": True,
            "terms": glossary_terms,
            "total_terms": glossary_stats.get("total_terms", 0),
            "categories": glossary_stats.get("categories", []),
            "relationships": term_relationships,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "has_more": len(glossary_terms) == limit
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get business glossary: {str(e)}")

@router.post("/business-glossary/terms", response_model=Dict[str, Any])
async def create_business_term(
    request: BusinessTermRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new business term in the glossary
    """
    try:
        # Create business term
        business_term = await EnterpriseCatalogService.create_business_term(
            db=db,
            term=request.term,
            definition=request.definition,
            category=request.category,
            synonyms=request.synonyms,
            related_terms=request.related_terms,
            business_context=request.business_context,
            created_by=current_user.id
        )

        # Update semantic index
        await EnterpriseCatalogService.update_semantic_index(
            db=db,
            term=business_term
        )

        # Emit event
        await EnterpriseCatalogService.emit_event(
            db=db,
            event_type="business_term_created",
            entity_type="business_term",
            entity_id=business_term["id"],
            metadata={
                "term": request.term,
                "category": request.category,
                "created_by": current_user.id
            }
        )

        return {
            "success": True,
            "business_term": business_term,
            "message": f"Business term '{request.term}' created successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create business term: {str(e)}")

@router.get("/faceted-search", response_model=Dict[str, Any])
async def faceted_search(
    query: Optional[str] = Query(None, description="Search query"),
    facets: Optional[str] = Query(None, description="Facet filters as JSON"),
    sort_by: Optional[str] = Query("relevance", description="Sort criteria"),
    sort_order: Optional[str] = Query("desc", description="Sort order"),
    limit: int = Query(20, description="Results limit"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform faceted search with advanced filtering and sorting
    """
    try:
        import json
        facet_filters = json.loads(facets) if facets else {}

        # Execute faceted search
        search_results = await EnterpriseCatalogService.faceted_search(
            db=db,
            query=query,
            facets=facet_filters,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            offset=offset,
            user_id=current_user.id
        )

        # Get available facets
        available_facets = await EnterpriseCatalogService.get_available_facets(
            db=db,
            query=query,
            current_facets=facet_filters
        )

        # Get search statistics
        search_stats = await EnterpriseCatalogService.get_search_statistics(
            db=db,
            query=query,
            facets=facet_filters
        )

        return {
            "success": True,
            "query": query,
            "results": search_results,
            "facets": available_facets,
            "statistics": search_stats,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": search_stats.get("total_results", 0),
                "has_more": len(search_results) == limit
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Faceted search failed: {str(e)}")

@router.get("/semantic-similarity/{asset_id}", response_model=Dict[str, Any])
async def find_similar_assets(
    asset_id: int,
    similarity_threshold: float = Query(0.7, description="Minimum similarity score"),
    limit: int = Query(10, description="Maximum similar assets"),
    include_metadata: bool = Query(True, description="Include asset metadata"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Find semantically similar assets using AI-powered similarity analysis
    """
    try:
        # Find similar assets
        similar_assets = await EnterpriseCatalogService.find_similar_assets(
            db=db,
            asset_id=asset_id,
            similarity_threshold=similarity_threshold,
            limit=limit,
            include_metadata=include_metadata
        )

        # Get asset details
        source_asset = await EnterpriseCatalogService.get_catalog_entry(
            db=db,
            entry_id=asset_id
        )

        # Calculate similarity explanations
        similarity_explanations = await EnterpriseCatalogService.explain_similarity(
            db=db,
            source_asset=source_asset,
            similar_assets=similar_assets
        )

        return {
            "success": True,
            "source_asset": source_asset,
            "similar_assets": similar_assets,
            "similarity_explanations": similarity_explanations,
            "similarity_threshold": similarity_threshold,
            "total_found": len(similar_assets),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity search failed: {str(e)}")

@router.post("/index/rebuild", response_model=Dict[str, Any])
async def rebuild_semantic_index(
    force: bool = Query(False, description="Force rebuild even if recent"),
    include_content: bool = Query(True, description="Include content analysis"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Rebuild the semantic search index with latest AI models
    """
    try:
        # Check permissions
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")

        # Start index rebuild
        rebuild_task = await EnterpriseCatalogService.rebuild_semantic_index(
            db=db,
            force=force,
            include_content=include_content,
            initiated_by=current_user.id
        )

        return {
            "success": True,
            "task_id": rebuild_task["task_id"],
            "estimated_duration": rebuild_task["estimated_duration"],
            "status": "started",
            "message": "Semantic index rebuild initiated",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Index rebuild failed: {str(e)}")

@router.get("/analytics", response_model=Dict[str, Any])
async def get_search_analytics(
    time_range: str = Query("7d", description="Time range: 1d, 7d, 30d, 90d"),
    include_trends: bool = Query(True, description="Include trend analysis"),
    include_popular: bool = Query(True, description="Include popular searches"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive search analytics and insights
    """
    try:
        # Get search analytics
        analytics = await EnterpriseCatalogService.get_search_analytics(
            db=db,
            time_range=time_range,
            user_id=current_user.id if not current_user.is_admin else None
        )

        # Get search trends if requested
        trends = {}
        if include_trends:
            trends = await EnterpriseCatalogService.get_search_trends(
                db=db,
                time_range=time_range
            )

        # Get popular searches if requested
        popular_searches = []
        if include_popular:
            popular_searches = await EnterpriseCatalogService.get_popular_searches(
                db=db,
                time_range=time_range,
                limit=20
            )

        return {
            "success": True,
            "time_range": time_range,
            "analytics": analytics,
            "trends": trends,
            "popular_searches": popular_searches,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get search analytics: {str(e)}")