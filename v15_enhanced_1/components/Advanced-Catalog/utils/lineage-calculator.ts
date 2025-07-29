// ============================================================================
// LINEAGE CALCULATOR UTILITY - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced lineage calculation, analysis, and visualization utilities
// ============================================================================

import type {
  CatalogAsset,
  LineageNode,
  LineageEdge,
  LineageGraph,
  ImpactAnalysisResult,
  LineageMetrics,
  LineagePath,
  LineageVisualizationConfig
} from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface LineageCalculationOptions {
  maxDepth?: number;
  includeIndirect?: boolean;
  includeMetadata?: boolean;
  filterTypes?: string[];
  excludeTypes?: string[];
  directionality?: 'upstream' | 'downstream' | 'both';
  timeRange?: { start: Date; end: Date };
}

export interface LineageAnalysisResult {
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  avgDepth: number;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  criticalPaths: LineagePath[];
  orphanedNodes: LineageNode[];
  circularDependencies: LineagePath[];
  qualityIssues: LineageQualityIssue[];
  metrics: LineageMetrics;
}

export interface LineageQualityIssue {
  type: 'missing_lineage' | 'circular_dependency' | 'orphaned_node' | 'quality_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedNodes: string[];
  suggestedActions: string[];
}

export interface LineageImpactAnalysis {
  directImpacts: CatalogAsset[];
  indirectImpacts: CatalogAsset[];
  impactRadius: number;
  criticalityScore: number;
  riskAssessment: {
    dataQualityRisk: number;
    businessImpactRisk: number;
    complianceRisk: number;
    overallRisk: number;
  };
  recommendations: string[];
}

export interface LineageOptimizationSuggestion {
  type: 'performance' | 'quality' | 'governance' | 'cost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  affectedAssets: string[];
}

// ============================================================================
// CORE LINEAGE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate comprehensive lineage graph for a given asset
 */
export const calculateLineageGraph = (
  rootAssetId: string,
  allAssets: CatalogAsset[],
  lineageEdges: LineageEdge[],
  options: LineageCalculationOptions = {}
): LineageGraph => {
  const {
    maxDepth = 10,
    includeIndirect = true,
    includeMetadata = true,
    filterTypes = [],
    excludeTypes = [],
    directionality = 'both'
  } = options;

  const visitedNodes = new Set<string>();
  const nodes: LineageNode[] = [];
  const edges: LineageEdge[] = [];
  const nodeDepths = new Map<string, number>();

  const processNode = (assetId: string, depth: number, direction: 'upstream' | 'downstream'): void => {
    if (depth > maxDepth || visitedNodes.has(assetId)) return;

    const asset = allAssets.find(a => a.id === assetId);
    if (!asset) return;

    // Apply type filters
    if (filterTypes.length > 0 && !filterTypes.includes(asset.type)) return;
    if (excludeTypes.length > 0 && excludeTypes.includes(asset.type)) return;

    visitedNodes.add(assetId);
    nodeDepths.set(assetId, depth);

    // Create lineage node
    const lineageNode: LineageNode = {
      id: assetId,
      assetId: assetId,
      name: asset.name,
      type: asset.type,
      depth,
      position: { x: 0, y: 0 }, // Will be calculated later
      metadata: includeMetadata ? {
        description: asset.description,
        tags: asset.tags || [],
        qualityScore: asset.qualityScore,
        lastModified: asset.lastModified,
        owner: asset.owner,
        department: asset.department
      } : undefined,
      isRoot: assetId === rootAssetId,
      isCritical: asset.isCritical || false,
      hasQualityIssues: (asset.qualityScore || 100) < 80
    };

    nodes.push(lineageNode);

    // Find connected edges
    const connectedEdges = lineageEdges.filter(edge => {
      if (direction === 'upstream') {
        return edge.targetAssetId === assetId;
      } else if (direction === 'downstream') {
        return edge.sourceAssetId === assetId;
      }
      return edge.sourceAssetId === assetId || edge.targetAssetId === assetId;
    });

    // Process connected nodes
    connectedEdges.forEach(edge => {
      const nextAssetId = edge.sourceAssetId === assetId ? edge.targetAssetId : edge.sourceAssetId;
      const edgeDirection = edge.sourceAssetId === assetId ? 'downstream' : 'upstream';

      if (directionality === 'both' || directionality === edgeDirection) {
        edges.push(edge);
        
        if (includeIndirect || depth === 0) {
          processNode(nextAssetId, depth + 1, edgeDirection);
        }
      }
    });
  };

  // Start processing from root node
  if (directionality === 'both') {
    processNode(rootAssetId, 0, 'upstream');
    processNode(rootAssetId, 0, 'downstream');
  } else {
    processNode(rootAssetId, 0, directionality);
  }

  // Calculate node positions for visualization
  const positionedNodes = calculateNodePositions(nodes, edges);

  return {
    rootAssetId,
    nodes: positionedNodes,
    edges: edges.filter((edge, index, self) => 
      index === self.findIndex(e => e.id === edge.id)
    ), // Remove duplicates
    metadata: {
      calculatedAt: new Date(),
      options,
      totalDepth: Math.max(...Array.from(nodeDepths.values())),
      nodeCount: nodes.length,
      edgeCount: edges.length
    }
  };
};

/**
 * Calculate node positions for optimal visualization
 */
export const calculateNodePositions = (
  nodes: LineageNode[],
  edges: LineageEdge[]
): LineageNode[] => {
  const positioned = [...nodes];
  const levels = new Map<number, LineageNode[]>();
  
  // Group nodes by depth level
  positioned.forEach(node => {
    const level = node.depth;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(node);
  });

  // Position nodes level by level
  const levelHeight = 150;
  const nodeSpacing = 200;

  Array.from(levels.keys()).sort().forEach((level, levelIndex) => {
    const levelNodes = levels.get(level)!;
    const startX = -(levelNodes.length - 1) * nodeSpacing / 2;

    levelNodes.forEach((node, nodeIndex) => {
      node.position = {
        x: startX + nodeIndex * nodeSpacing,
        y: levelIndex * levelHeight
      };
    });
  });

  return positioned;
};

/**
 * Analyze lineage graph for quality and complexity metrics
 */
export const analyzeLineageGraph = (lineageGraph: LineageGraph): LineageAnalysisResult => {
  const { nodes, edges } = lineageGraph;
  
  // Calculate basic metrics
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const avgDepth = nodes.reduce((sum, n) => sum + n.depth, 0) / totalNodes;

  // Determine complexity
  let complexity: 'low' | 'medium' | 'high' | 'very_high' = 'low';
  if (totalNodes > 100 || maxDepth > 8) complexity = 'very_high';
  else if (totalNodes > 50 || maxDepth > 6) complexity = 'high';
  else if (totalNodes > 20 || maxDepth > 4) complexity = 'medium';

  // Find critical paths (longest paths)
  const criticalPaths = findCriticalPaths(lineageGraph);

  // Find orphaned nodes (nodes with no connections)
  const connectedNodeIds = new Set([
    ...edges.map(e => e.sourceAssetId),
    ...edges.map(e => e.targetAssetId)
  ]);
  const orphanedNodes = nodes.filter(n => !connectedNodeIds.has(n.assetId));

  // Detect circular dependencies
  const circularDependencies = detectCircularDependencies(lineageGraph);

  // Identify quality issues
  const qualityIssues = identifyQualityIssues(lineageGraph);

  // Calculate detailed metrics
  const metrics: LineageMetrics = {
    nodeCount: totalNodes,
    edgeCount: totalEdges,
    maxDepth,
    avgDepth,
    fanIn: calculateFanIn(lineageGraph),
    fanOut: calculateFanOut(lineageGraph),
    complexity: calculateComplexityScore(lineageGraph),
    coverage: calculateCoverage(lineageGraph),
    freshness: calculateFreshness(lineageGraph),
    reliability: calculateReliability(lineageGraph)
  };

  return {
    totalNodes,
    totalEdges,
    maxDepth,
    avgDepth,
    complexity,
    criticalPaths,
    orphanedNodes,
    circularDependencies,
    qualityIssues,
    metrics
  };
};

/**
 * Perform impact analysis for changes to a specific asset
 */
export const performImpactAnalysis = (
  targetAssetId: string,
  lineageGraph: LineageGraph,
  changeType: 'schema' | 'data' | 'location' | 'access' = 'data'
): LineageImpactAnalysis => {
  const { nodes, edges } = lineageGraph;
  
  const directlyConnected = new Set<string>();
  const indirectlyConnected = new Set<string>();

  // Find directly connected assets
  edges.forEach(edge => {
    if (edge.sourceAssetId === targetAssetId) {
      directlyConnected.add(edge.targetAssetId);
    }
    if (edge.targetAssetId === targetAssetId) {
      directlyConnected.add(edge.sourceAssetId);
    }
  });

  // Find indirectly connected assets (propagate impact)
  const visited = new Set([targetAssetId]);
  const queue = Array.from(directlyConnected);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    
    visited.add(currentId);
    indirectlyConnected.add(currentId);

    // Find next level connections
    edges.forEach(edge => {
      const nextId = edge.sourceAssetId === currentId ? edge.targetAssetId : edge.sourceAssetId;
      if (!visited.has(nextId) && !queue.includes(nextId)) {
        queue.push(nextId);
      }
    });
  }

  // Get asset details for impacted assets
  const getAssetsByIds = (assetIds: Set<string>) => 
    Array.from(assetIds).map(id => nodes.find(n => n.assetId === id)).filter(Boolean) as LineageNode[];

  const directImpacts = getAssetsByIds(directlyConnected);
  const indirectImpacts = getAssetsByIds(indirectlyConnected);

  // Calculate impact metrics
  const impactRadius = Math.max(...Array.from(indirectlyConnected).map(id => {
    const node = nodes.find(n => n.assetId === id);
    return node ? node.depth : 0;
  }));

  const criticalityScore = calculateCriticalityScore(directImpacts, indirectImpacts);

  // Risk assessment
  const riskAssessment = {
    dataQualityRisk: calculateDataQualityRisk(directImpacts, indirectImpacts),
    businessImpactRisk: calculateBusinessImpactRisk(directImpacts, indirectImpacts),
    complianceRisk: calculateComplianceRisk(directImpacts, indirectImpacts),
    overallRisk: 0
  };
  riskAssessment.overallRisk = 
    (riskAssessment.dataQualityRisk + riskAssessment.businessImpactRisk + riskAssessment.complianceRisk) / 3;

  // Generate recommendations
  const recommendations = generateImpactRecommendations(
    changeType,
    directImpacts,
    indirectImpacts,
    riskAssessment
  );

  return {
    directImpacts: directImpacts.map(n => ({
      id: n.assetId,
      name: n.name,
      type: n.type,
      qualityScore: n.metadata?.qualityScore
    })) as CatalogAsset[],
    indirectImpacts: indirectImpacts.map(n => ({
      id: n.assetId,
      name: n.name,
      type: n.type,
      qualityScore: n.metadata?.qualityScore
    })) as CatalogAsset[],
    impactRadius,
    criticalityScore,
    riskAssessment,
    recommendations
  };
};

/**
 * Generate optimization suggestions for lineage improvements
 */
export const generateLineageOptimizations = (
  lineageGraph: LineageGraph,
  analysisResult: LineageAnalysisResult
): LineageOptimizationSuggestion[] => {
  const suggestions: LineageOptimizationSuggestion[] = [];

  // Performance optimizations
  if (analysisResult.complexity === 'very_high') {
    suggestions.push({
      type: 'performance',
      priority: 'high',
      description: 'Consider breaking down complex lineage paths to improve query performance',
      estimatedImpact: 'Reduce lineage query time by 40-60%',
      implementationComplexity: 'high',
      affectedAssets: findMostConnectedAssets(lineageGraph).map(n => n.assetId)
    });
  }

  // Quality improvements
  if (analysisResult.qualityIssues.length > 0) {
    suggestions.push({
      type: 'quality',
      priority: 'medium',
      description: 'Address missing lineage connections and quality issues',
      estimatedImpact: 'Improve lineage completeness by 25-40%',
      implementationComplexity: 'medium',
      affectedAssets: analysisResult.qualityIssues.flatMap(issue => issue.affectedNodes)
    });
  }

  // Governance improvements
  if (analysisResult.orphanedNodes.length > 0) {
    suggestions.push({
      type: 'governance',
      priority: 'medium',
      description: 'Connect orphaned assets to improve data governance coverage',
      estimatedImpact: 'Increase governance visibility by 15-30%',
      implementationComplexity: 'low',
      affectedAssets: analysisResult.orphanedNodes.map(n => n.assetId)
    });
  }

  // Cost optimizations
  if (analysisResult.metrics.complexity > 0.8) {
    suggestions.push({
      type: 'cost',
      priority: 'low',
      description: 'Optimize data pipelines to reduce processing costs',
      estimatedImpact: 'Reduce processing costs by 20-35%',
      implementationComplexity: 'high',
      affectedAssets: analysisResult.criticalPaths.flatMap(path => path.nodeIds)
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findCriticalPaths = (lineageGraph: LineageGraph): LineagePath[] => {
  const { nodes, edges } = lineageGraph;
  const paths: LineagePath[] = [];

  // Find paths longer than threshold
  const minPathLength = Math.max(3, Math.floor(nodes.length * 0.1));
  
  // Implementation would use graph traversal algorithms
  // This is a simplified version
  const rootNodes = nodes.filter(n => n.isRoot);
  
  rootNodes.forEach(root => {
    const path = findLongestPath(root.assetId, lineageGraph);
    if (path.nodeIds.length >= minPathLength) {
      paths.push(path);
    }
  });

  return paths;
};

const findLongestPath = (startNodeId: string, lineageGraph: LineageGraph): LineagePath => {
  // Simplified implementation - would use proper graph algorithms
  return {
    id: `path_${startNodeId}`,
    nodeIds: [startNodeId],
    edgeIds: [],
    length: 1,
    direction: 'downstream',
    isCritical: false
  };
};

const detectCircularDependencies = (lineageGraph: LineageGraph): LineagePath[] => {
  const { edges } = lineageGraph;
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: LineagePath[] = [];

  const dfs = (nodeId: string, currentPath: string[]): void => {
    if (recursionStack.has(nodeId)) {
      // Found a cycle
      const cycleStart = currentPath.indexOf(nodeId);
      const cyclePath = currentPath.slice(cycleStart);
      
      cycles.push({
        id: `cycle_${Date.now()}`,
        nodeIds: cyclePath,
        edgeIds: [],
        length: cyclePath.length,
        direction: 'circular',
        isCritical: true
      });
      return;
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Find outgoing edges
    const outgoingEdges = edges.filter(e => e.sourceAssetId === nodeId);
    outgoingEdges.forEach(edge => {
      dfs(edge.targetAssetId, [...currentPath, nodeId]);
    });

    recursionStack.delete(nodeId);
  };

  // Check all nodes for cycles
  lineageGraph.nodes.forEach(node => {
    if (!visited.has(node.assetId)) {
      dfs(node.assetId, []);
    }
  });

  return cycles;
};

const identifyQualityIssues = (lineageGraph: LineageGraph): LineageQualityIssue[] => {
  const issues: LineageQualityIssue[] = [];
  const { nodes, edges } = lineageGraph;

  // Check for missing lineage
  const expectedConnections = nodes.length * 1.5; // Heuristic
  if (edges.length < expectedConnections * 0.6) {
    issues.push({
      type: 'missing_lineage',
      severity: 'medium',
      description: 'Lineage appears incomplete - many assets lack proper connections',
      affectedNodes: nodes.filter(n => {
        const connections = edges.filter(e => 
          e.sourceAssetId === n.assetId || e.targetAssetId === n.assetId
        ).length;
        return connections === 0;
      }).map(n => n.assetId),
      suggestedActions: [
        'Review data pipelines for missing connections',
        'Implement automated lineage discovery',
        'Validate data flow documentation'
      ]
    });
  }

  // Check for quality degradation
  const qualityIssueNodes = nodes.filter(n => n.hasQualityIssues);
  if (qualityIssueNodes.length > nodes.length * 0.3) {
    issues.push({
      type: 'quality_degradation',
      severity: 'high',
      description: 'High percentage of assets have quality issues',
      affectedNodes: qualityIssueNodes.map(n => n.assetId),
      suggestedActions: [
        'Implement data quality monitoring',
        'Review data validation rules',
        'Address upstream quality issues'
      ]
    });
  }

  return issues;
};

const calculateFanIn = (lineageGraph: LineageGraph): number => {
  const { nodes, edges } = lineageGraph;
  const inDegrees = nodes.map(node => {
    return edges.filter(edge => edge.targetAssetId === node.assetId).length;
  });
  return inDegrees.reduce((sum, degree) => sum + degree, 0) / nodes.length;
};

const calculateFanOut = (lineageGraph: LineageGraph): number => {
  const { nodes, edges } = lineageGraph;
  const outDegrees = nodes.map(node => {
    return edges.filter(edge => edge.sourceAssetId === node.assetId).length;
  });
  return outDegrees.reduce((sum, degree) => sum + degree, 0) / nodes.length;
};

const calculateComplexityScore = (lineageGraph: LineageGraph): number => {
  const { nodes, edges } = lineageGraph;
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  
  // Normalized complexity score (0-1)
  const densityScore = Math.min(edgeCount / (nodeCount * nodeCount), 1);
  const depthScore = Math.min(maxDepth / 10, 1);
  const sizeScore = Math.min(nodeCount / 100, 1);
  
  return (densityScore + depthScore + sizeScore) / 3;
};

const calculateCoverage = (lineageGraph: LineageGraph): number => {
  const { nodes, edges } = lineageGraph;
  const connectedNodes = new Set([
    ...edges.map(e => e.sourceAssetId),
    ...edges.map(e => e.targetAssetId)
  ]);
  return connectedNodes.size / nodes.length;
};

const calculateFreshness = (lineageGraph: LineageGraph): number => {
  const { nodes } = lineageGraph;
  const now = new Date();
  const freshnessScores = nodes.map(node => {
    if (!node.metadata?.lastModified) return 0;
    const daysSinceUpdate = (now.getTime() - node.metadata.lastModified.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSinceUpdate / 30); // Freshness decays over 30 days
  });
  return freshnessScores.reduce((sum, score) => sum + score, 0) / nodes.length;
};

const calculateReliability = (lineageGraph: LineageGraph): number => {
  const { nodes } = lineageGraph;
  const qualityScores = nodes
    .filter(n => n.metadata?.qualityScore !== undefined)
    .map(n => n.metadata!.qualityScore! / 100);
  
  if (qualityScores.length === 0) return 0.5; // Default when no quality data
  return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
};

const calculateCriticalityScore = (directImpacts: LineageNode[], indirectImpacts: LineageNode[]): number => {
  const directWeight = 1.0;
  const indirectWeight = 0.5;
  
  const directScore = directImpacts.length * directWeight;
  const indirectScore = indirectImpacts.length * indirectWeight;
  
  return Math.min((directScore + indirectScore) / 10, 1); // Normalized to 0-1
};

const calculateDataQualityRisk = (directImpacts: LineageNode[], indirectImpacts: LineageNode[]): number => {
  const allImpacts = [...directImpacts, ...indirectImpacts];
  const qualityIssues = allImpacts.filter(n => n.hasQualityIssues).length;
  return Math.min(qualityIssues / allImpacts.length, 1);
};

const calculateBusinessImpactRisk = (directImpacts: LineageNode[], indirectImpacts: LineageNode[]): number => {
  const allImpacts = [...directImpacts, ...indirectImpacts];
  const criticalAssets = allImpacts.filter(n => n.isCritical).length;
  return Math.min(criticalAssets / Math.max(allImpacts.length, 1), 1);
};

const calculateComplianceRisk = (directImpacts: LineageNode[], indirectImpacts: LineageNode[]): number => {
  // Simplified compliance risk calculation
  const allImpacts = [...directImpacts, ...indirectImpacts];
  const regulatedTypes = ['personal_data', 'financial_data', 'health_data'];
  const regulatedAssets = allImpacts.filter(n => 
    regulatedTypes.some(type => n.type.toLowerCase().includes(type))
  ).length;
  return Math.min(regulatedAssets / Math.max(allImpacts.length, 1), 1);
};

const generateImpactRecommendations = (
  changeType: string,
  directImpacts: LineageNode[],
  indirectImpacts: LineageNode[],
  riskAssessment: any
): string[] => {
  const recommendations: string[] = [];

  if (directImpacts.length > 5) {
    recommendations.push('Consider phased rollout due to high number of direct impacts');
  }

  if (riskAssessment.overallRisk > 0.7) {
    recommendations.push('Implement comprehensive testing before deployment');
    recommendations.push('Set up monitoring for affected downstream systems');
  }

  if (riskAssessment.complianceRisk > 0.5) {
    recommendations.push('Review compliance requirements for affected regulated data');
  }

  if (changeType === 'schema') {
    recommendations.push('Validate schema compatibility with downstream consumers');
    recommendations.push('Consider backwards compatibility strategies');
  }

  return recommendations;
};

const findMostConnectedAssets = (lineageGraph: LineageGraph): LineageNode[] => {
  const { nodes, edges } = lineageGraph;
  
  const connectionCounts = nodes.map(node => ({
    node,
    connections: edges.filter(edge => 
      edge.sourceAssetId === node.assetId || edge.targetAssetId === node.assetId
    ).length
  }));

  return connectionCounts
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5)
    .map(item => item.node);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateLineageGraph,
  calculateNodePositions,
  analyzeLineageGraph,
  performImpactAnalysis,
  generateLineageOptimizations
};

export type {
  LineageCalculationOptions,
  LineageAnalysisResult,
  LineageQualityIssue,
  LineageImpactAnalysis,
  LineageOptimizationSuggestion
};