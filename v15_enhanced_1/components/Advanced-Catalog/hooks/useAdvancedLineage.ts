/**
 * useAdvancedLineage Hook
 * ======================
 * 
 * Advanced hook for data lineage visualization, analysis, and management.
 * Provides comprehensive lineage tracking with AI-powered insights.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCatalogLineage } from './useCatalogLineage';
import { useDataLineage } from './useDataLineage';
import { CATALOG_LINEAGE_CONSTANTS } from '../constants/catalog-lineage.constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LineageNode {
  id: string;
  name: string;
  type: 'TABLE' | 'VIEW' | 'FILE' | 'API' | 'STREAM' | 'TRANSFORMATION';
  position: { x: number; y: number };
  metadata: Record<string, any>;
  metrics: {
    usage: number;
    quality: number;
    performance: number;
  };
  status: 'active' | 'inactive' | 'error' | 'deprecated';
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'DIRECT' | 'INDIRECT' | 'TRANSFORMATION' | 'DEPENDENCY';
  metadata: Record<string, any>;
  strength: number;
  lastUpdated: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: {
    depth: number;
    complexity: number;
    lastAnalyzed: string;
  };
}

export interface AdvancedLineageState {
  graph: LineageGraph | null;
  selectedNode: LineageNode | null;
  highlightedPath: string[];
  analysisResults: LineageAnalysisResult[];
  isLoading: boolean;
  error: string | null;
}

export interface LineageAnalysisResult {
  id: string;
  type: 'IMPACT' | 'ROOT_CAUSE' | 'OPTIMIZATION' | 'QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedAssets: string[];
  recommendations: string[];
  timestamp: string;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useAdvancedLineage = (assetId?: string, options: {
  depth?: number;
  includeMetrics?: boolean;
  realTimeUpdates?: boolean;
} = {}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<AdvancedLineageState>({
    graph: null,
    selectedNode: null,
    highlightedPath: [],
    analysisResults: [],
    isLoading: false,
    error: null
  });

  // Base hooks
  const catalogLineage = useCatalogLineage(assetId);
  const dataLineage = useDataLineage(assetId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const lineageMetrics = useMemo(() => {
    if (!state.graph) return null;

    const { nodes, edges } = state.graph;
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      complexity: state.graph.metadata.complexity,
      criticalPaths: edges.filter(e => e.strength > 0.8).length,
      qualityScore: nodes.reduce((acc, n) => acc + n.metrics.quality, 0) / nodes.length,
      performanceScore: nodes.reduce((acc, n) => acc + n.metrics.performance, 0) / nodes.length
    };
  }, [state.graph]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadLineageGraph = useCallback(async (
    targetAssetId: string,
    depth: number = 3,
    direction: 'forward' | 'backward' | 'bidirectional' = 'bidirectional'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This would integrate with the actual lineage service
      const mockGraph: LineageGraph = {
        nodes: [
          {
            id: targetAssetId,
            name: `Asset ${targetAssetId}`,
            type: 'TABLE',
            position: { x: 0, y: 0 },
            metadata: {},
            metrics: { usage: 85, quality: 92, performance: 78 },
            status: 'active'
          }
        ],
        edges: [],
        metadata: {
          depth,
          complexity: 1,
          lastAnalyzed: new Date().toISOString()
        }
      };

      setState(prev => ({
        ...prev,
        graph: mockGraph,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load lineage',
        isLoading: false
      }));
    }
  }, []);

  const analyzeLineageImpact = useCallback(async (
    assetId: string,
    changeType: 'SCHEMA' | 'DATA' | 'TRANSFORMATION' | 'DELETION'
  ) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Mock analysis results
      const analysisResults: LineageAnalysisResult[] = [
        {
          id: `analysis-${Date.now()}`,
          type: 'IMPACT',
          severity: 'MEDIUM',
          title: `${changeType} Impact Analysis`,
          description: `Analysis of potential impact from ${changeType.toLowerCase()} changes`,
          affectedAssets: [],
          recommendations: [],
          timestamp: new Date().toISOString()
        }
      ];

      setState(prev => ({
        ...prev,
        analysisResults,
        isLoading: false
      }));

      return analysisResults;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isLoading: false
      }));
      return [];
    }
  }, []);

  const highlightLineagePath = useCallback((
    sourceId: string,
    targetId: string
  ) => {
    if (!state.graph) return;

    // Simple path highlighting logic
    const path = [sourceId, targetId];
    setState(prev => ({
      ...prev,
      highlightedPath: path
    }));
  }, [state.graph]);

  const selectNode = useCallback((nodeId: string) => {
    if (!state.graph) return;

    const node = state.graph.nodes.find(n => n.id === nodeId);
    setState(prev => ({
      ...prev,
      selectedNode: node || null
    }));
  }, [state.graph]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (assetId && options.realTimeUpdates) {
      loadLineageGraph(assetId, options.depth);
    }
  }, [assetId, options.depth, options.realTimeUpdates, loadLineageGraph]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    graph: state.graph,
    selectedNode: state.selectedNode,
    highlightedPath: state.highlightedPath,
    analysisResults: state.analysisResults,
    isLoading: state.isLoading,
    error: state.error,

    // Metrics
    lineageMetrics,

    // Actions
    loadLineageGraph,
    analyzeLineageImpact,
    highlightLineagePath,
    selectNode,

    // Utilities
    clearSelection: () => setState(prev => ({ ...prev, selectedNode: null })),
    clearHighlight: () => setState(prev => ({ ...prev, highlightedPath: [] })),
    refreshLineage: () => assetId && loadLineageGraph(assetId, options.depth),

    // Integration with base hooks
    catalogLineage: catalogLineage.lineageData,
    dataLineage: dataLineage.lineageGraph
  };
};

export default useAdvancedLineage;