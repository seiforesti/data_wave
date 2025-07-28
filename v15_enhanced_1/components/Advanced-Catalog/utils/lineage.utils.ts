/**
 * Advanced Lineage Utility Functions
 * Maps to: advanced_lineage_service.py, lineage_service.py, data_lineage_models.py
 * 
 * Comprehensive utility functions for lineage computation, graph processing,
 * path analysis, and impact calculations.
 */

import type {
  DataLineageNode,
  DataLineageEdge,
  LineageGraph,
  LineageDirection,
  LineageDepth,
  LineageImpactAnalysis,
  LineageVisualizationConfig,
  LineageMetrics,
  ColumnLineageMapping,
  TransformationLineage,
  LineagePathAnalysis,
  LineageValidationResult,
  LineageAnomalyDetection,
  LineageQualityMetrics,
  LineagePerformanceMetrics,
} from '../types/lineage.types';

import type {
  IntelligentDataAsset,
  EnterpriseDataLineage,
} from '../types/catalog-core.types';

// ===================== LINEAGE GRAPH UTILITIES =====================

/**
 * Build lineage graph from nodes and edges
 */
export const buildLineageGraph = (
  nodes: DataLineageNode[],
  edges: DataLineageEdge[]
): LineageGraph => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  // Build adjacency lists for efficient traversal
  const upstreamMap = new Map<string, DataLineageEdge[]>();
  const downstreamMap = new Map<string, DataLineageEdge[]>();

  edges.forEach(edge => {
    // Downstream relationships
    if (!downstreamMap.has(edge.sourceId)) {
      downstreamMap.set(edge.sourceId, []);
    }
    downstreamMap.get(edge.sourceId)!.push(edge);

    // Upstream relationships
    if (!upstreamMap.has(edge.targetId)) {
      upstreamMap.set(edge.targetId, []);
    }
    upstreamMap.get(edge.targetId)!.push(edge);
  });

  return {
    nodes,
    edges,
    nodeMap,
    upstreamMap,
    downstreamMap,
    metrics: calculateGraphMetrics(nodes, edges),
  };
};

/**
 * Calculate graph metrics
 */
export const calculateGraphMetrics = (
  nodes: DataLineageNode[],
  edges: DataLineageEdge[]
): any => {
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  
  // Calculate node degrees
  const inDegrees = new Map<string, number>();
  const outDegrees = new Map<string, number>();
  
  edges.forEach(edge => {
    inDegrees.set(edge.targetId, (inDegrees.get(edge.targetId) || 0) + 1);
    outDegrees.set(edge.sourceId, (outDegrees.get(edge.sourceId) || 0) + 1);
  });

  // Find root nodes (no incoming edges) and leaf nodes (no outgoing edges)
  const rootNodes = nodes.filter(node => !inDegrees.has(node.id));
  const leafNodes = nodes.filter(node => !outDegrees.has(node.id));

  // Calculate complexity metrics
  const maxInDegree = Math.max(...Array.from(inDegrees.values()), 0);
  const maxOutDegree = Math.max(...Array.from(outDegrees.values()), 0);
  const avgInDegree = totalNodes > 0 ? Array.from(inDegrees.values()).reduce((a, b) => a + b, 0) / totalNodes : 0;
  const avgOutDegree = totalNodes > 0 ? Array.from(outDegrees.values()).reduce((a, b) => a + b, 0) / totalNodes : 0;

  return {
    totalNodes,
    totalEdges,
    rootNodes: rootNodes.length,
    leafNodes: leafNodes.length,
    maxInDegree,
    maxOutDegree,
    avgInDegree,
    avgOutDegree,
    density: totalNodes > 1 ? (2 * totalEdges) / (totalNodes * (totalNodes - 1)) : 0,
    complexity: calculateComplexityScore(totalNodes, totalEdges, maxInDegree, maxOutDegree),
  };
};

/**
 * Calculate lineage complexity score
 */
export const calculateComplexityScore = (
  nodes: number,
  edges: number,
  maxInDegree: number,
  maxOutDegree: number
): number => {
  // Complexity factors
  const sizeFactor = Math.log(nodes + 1) * 0.3;
  const connectivityFactor = edges > 0 ? Math.log(edges + 1) * 0.4 : 0;
  const branchingFactor = Math.max(maxInDegree, maxOutDegree) * 0.3;
  
  return Math.min(sizeFactor + connectivityFactor + branchingFactor, 10);
};

// ===================== LINEAGE TRAVERSAL UTILITIES =====================

/**
 * Traverse lineage graph in specified direction
 */
export const traverseLineage = (
  graph: LineageGraph,
  startNodeId: string,
  direction: LineageDirection,
  maxDepth: number = 10
): DataLineageNode[] => {
  const visited = new Set<string>();
  const result: DataLineageNode[] = [];
  
  const traverse = (nodeId: string, depth: number) => {
    if (depth > maxDepth || visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    const node = graph.nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    const adjacencyMap = direction === 'upstream' ? graph.upstreamMap :
                        direction === 'downstream' ? graph.downstreamMap :
                        new Map([...graph.upstreamMap, ...graph.downstreamMap]);

    const edges = adjacencyMap.get(nodeId) || [];
    edges.forEach(edge => {
      const nextNodeId = direction === 'upstream' ? edge.sourceId : edge.targetId;
      traverse(nextNodeId, depth + 1);
    });
  };

  traverse(startNodeId, 0);
  return result;
};

/**
 * Find all paths between two nodes
 */
export const findLineagePaths = (
  graph: LineageGraph,
  sourceId: string,
  targetId: string,
  maxDepth: number = 10
): string[][] => {
  const paths: string[][] = [];
  
  const findPaths = (currentId: string, currentPath: string[], depth: number) => {
    if (depth > maxDepth || currentPath.includes(currentId)) {
      return;
    }

    const newPath = [...currentPath, currentId];
    
    if (currentId === targetId) {
      paths.push(newPath);
      return;
    }

    const edges = graph.downstreamMap.get(currentId) || [];
    edges.forEach(edge => {
      findPaths(edge.targetId, newPath, depth + 1);
    });
  };

  findPaths(sourceId, [], 0);
  return paths;
};

/**
 * Calculate shortest path between nodes
 */
export const calculateShortestPath = (
  graph: LineageGraph,
  sourceId: string,
  targetId: string
): string[] | null => {
  const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [sourceId] }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    if (nodeId === targetId) {
      return path;
    }

    if (visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);

    const edges = graph.downstreamMap.get(nodeId) || [];
    edges.forEach(edge => {
      if (!visited.has(edge.targetId)) {
        queue.push({
          nodeId: edge.targetId,
          path: [...path, edge.targetId]
        });
      }
    });
  }

  return null;
};

// ===================== LINEAGE ANALYSIS UTILITIES =====================

/**
 * Analyze lineage impact for changes
 */
export const analyzeLineageImpact = (
  graph: LineageGraph,
  changedNodeId: string,
  changeType: 'schema' | 'data' | 'logic' | 'removal'
): LineageImpactAnalysis => {
  const impactedNodes = traverseLineage(graph, changedNodeId, 'downstream');
  const impactedUpstream = traverseLineage(graph, changedNodeId, 'upstream');
  
  // Calculate impact severity based on change type and affected nodes
  const severity = calculateImpactSeverity(changeType, impactedNodes.length);
  
  // Categorize impact by node types
  const impactByType = categorizeImpactByType(impactedNodes);
  
  // Identify critical paths
  const criticalPaths = identifyCriticalPaths(graph, changedNodeId, impactedNodes);

  return {
    changedNodeId,
    changeType,
    severity,
    impactedNodesCount: impactedNodes.length,
    impactedNodes: impactedNodes.map(node => node.id),
    upstreamDependencies: impactedUpstream.map(node => node.id),
    impactByType,
    criticalPaths,
    recommendations: generateImpactRecommendations(changeType, severity, impactedNodes),
    estimatedEffort: estimateChangeEffort(changeType, impactedNodes.length),
  };
};

/**
 * Calculate impact severity
 */
export const calculateImpactSeverity = (
  changeType: string,
  impactedCount: number
): 'low' | 'medium' | 'high' | 'critical' => {
  const baseScore = {
    schema: 3,
    data: 2,
    logic: 2,
    removal: 4,
  }[changeType] || 1;

  const countMultiplier = impactedCount > 50 ? 3 : 
                         impactedCount > 20 ? 2 : 
                         impactedCount > 5 ? 1.5 : 1;

  const totalScore = baseScore * countMultiplier;

  if (totalScore >= 10) return 'critical';
  if (totalScore >= 7) return 'high';
  if (totalScore >= 4) return 'medium';
  return 'low';
};

/**
 * Categorize impact by node types
 */
export const categorizeImpactByType = (nodes: DataLineageNode[]): Record<string, number> => {
  const categories: Record<string, number> = {};
  
  nodes.forEach(node => {
    const type = node.assetType || 'unknown';
    categories[type] = (categories[type] || 0) + 1;
  });

  return categories;
};

/**
 * Identify critical paths in lineage
 */
export const identifyCriticalPaths = (
  graph: LineageGraph,
  sourceId: string,
  impactedNodes: DataLineageNode[]
): string[][] => {
  const criticalPaths: string[][] = [];
  
  // Find paths to high-value or production assets
  const criticalTargets = impactedNodes.filter(node => 
    node.criticality === 'high' || 
    node.environment === 'production' ||
    node.tags?.includes('critical')
  );

  criticalTargets.forEach(target => {
    const paths = findLineagePaths(graph, sourceId, target.id);
    criticalPaths.push(...paths);
  });

  return criticalPaths;
};

/**
 * Generate impact recommendations
 */
export const generateImpactRecommendations = (
  changeType: string,
  severity: string,
  impactedNodes: DataLineageNode[]
): string[] => {
  const recommendations: string[] = [];

  if (severity === 'critical' || severity === 'high') {
    recommendations.push('Schedule change during maintenance window');
    recommendations.push('Notify all stakeholders before implementation');
    recommendations.push('Prepare rollback plan');
  }

  if (changeType === 'schema') {
    recommendations.push('Update data contracts and documentation');
    recommendations.push('Test downstream transformations');
  }

  if (changeType === 'removal') {
    recommendations.push('Verify no active dependencies exist');
    recommendations.push('Archive related metadata and history');
  }

  if (impactedNodes.length > 20) {
    recommendations.push('Consider phased rollout approach');
    recommendations.push('Implement automated testing');
  }

  return recommendations;
};

/**
 * Estimate change effort
 */
export const estimateChangeEffort = (
  changeType: string,
  impactedCount: number
): { hours: number; risk: string; complexity: string } => {
  const baseHours = {
    schema: 4,
    data: 2,
    logic: 3,
    removal: 1,
  }[changeType] || 2;

  const hours = baseHours + (impactedCount * 0.5);
  
  const risk = hours > 20 ? 'high' : hours > 10 ? 'medium' : 'low';
  const complexity = impactedCount > 30 ? 'high' : impactedCount > 10 ? 'medium' : 'low';

  return { hours: Math.ceil(hours), risk, complexity };
};

// ===================== LINEAGE VALIDATION UTILITIES =====================

/**
 * Validate lineage accuracy
 */
export const validateLineageAccuracy = (
  graph: LineageGraph,
  actualConnections: Map<string, string[]>
): LineageValidationResult => {
  const issues: string[] = [];
  const missingConnections: string[] = [];
  const incorrectConnections: string[] = [];
  
  // Check for missing connections
  actualConnections.forEach((targets, source) => {
    const graphTargets = graph.downstreamMap.get(source)?.map(edge => edge.targetId) || [];
    targets.forEach(target => {
      if (!graphTargets.includes(target)) {
        missingConnections.push(`${source} -> ${target}`);
      }
    });
  });

  // Check for incorrect connections
  graph.edges.forEach(edge => {
    const actualTargets = actualConnections.get(edge.sourceId) || [];
    if (!actualTargets.includes(edge.targetId)) {
      incorrectConnections.push(`${edge.sourceId} -> ${edge.targetId}`);
    }
  });

  const accuracy = 1 - (missingConnections.length + incorrectConnections.length) / 
                      (graph.edges.length + missingConnections.length);

  return {
    accuracy: Math.max(0, accuracy),
    issues: issues.length,
    missingConnections,
    incorrectConnections,
    recommendations: generateValidationRecommendations(accuracy, issues.length),
  };
};

/**
 * Generate validation recommendations
 */
export const generateValidationRecommendations = (
  accuracy: number,
  issuesCount: number
): string[] => {
  const recommendations: string[] = [];

  if (accuracy < 0.8) {
    recommendations.push('Comprehensive lineage audit required');
    recommendations.push('Review data source discovery configuration');
  }

  if (accuracy < 0.9) {
    recommendations.push('Increase lineage scanning frequency');
    recommendations.push('Validate critical data pipelines manually');
  }

  if (issuesCount > 10) {
    recommendations.push('Implement automated lineage validation');
    recommendations.push('Set up lineage quality monitoring');
  }

  return recommendations;
};

// ===================== LINEAGE ANOMALY DETECTION =====================

/**
 * Detect lineage anomalies
 */
export const detectLineageAnomalies = (
  current: LineageGraph,
  historical: LineageGraph[]
): LineageAnomalyDetection => {
  const anomalies: any[] = [];
  
  // Detect structural changes
  const structuralAnomalies = detectStructuralAnomalies(current, historical);
  anomalies.push(...structuralAnomalies);

  // Detect performance anomalies
  const performanceAnomalies = detectPerformanceAnomalies(current, historical);
  anomalies.push(...performanceAnomalies);

  // Detect data quality anomalies
  const qualityAnomalies = detectQualityAnomalies(current, historical);
  anomalies.push(...qualityAnomalies);

  return {
    anomalies,
    severity: calculateAnomalySeverity(anomalies),
    recommendations: generateAnomalyRecommendations(anomalies),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Detect structural anomalies in lineage
 */
export const detectStructuralAnomalies = (
  current: LineageGraph,
  historical: LineageGraph[]
): any[] => {
  const anomalies: any[] = [];
  
  if (historical.length === 0) return anomalies;

  const baseline = historical[historical.length - 1];
  
  // Check for new nodes
  const newNodes = current.nodes.filter(node => 
    !baseline.nodes.some(baseNode => baseNode.id === node.id)
  );
  
  if (newNodes.length > 0) {
    anomalies.push({
      type: 'new_nodes',
      severity: 'info',
      message: `${newNodes.length} new nodes detected`,
      details: newNodes.map(node => node.id),
    });
  }

  // Check for removed nodes
  const removedNodes = baseline.nodes.filter(node => 
    !current.nodes.some(currentNode => currentNode.id === node.id)
  );
  
  if (removedNodes.length > 0) {
    anomalies.push({
      type: 'removed_nodes',
      severity: removedNodes.length > 5 ? 'high' : 'medium',
      message: `${removedNodes.length} nodes removed`,
      details: removedNodes.map(node => node.id),
    });
  }

  return anomalies;
};

/**
 * Detect performance anomalies
 */
export const detectPerformanceAnomalies = (
  current: LineageGraph,
  historical: LineageGraph[]
): any[] => {
  const anomalies: any[] = [];
  
  // This would integrate with actual performance metrics
  // For now, return empty array as placeholder
  
  return anomalies;
};

/**
 * Detect quality anomalies
 */
export const detectQualityAnomalies = (
  current: LineageGraph,
  historical: LineageGraph[]
): any[] => {
  const anomalies: any[] = [];
  
  // This would integrate with quality metrics
  // For now, return empty array as placeholder
  
  return anomalies;
};

/**
 * Calculate anomaly severity
 */
export const calculateAnomalySeverity = (anomalies: any[]): 'low' | 'medium' | 'high' | 'critical' => {
  if (anomalies.some(a => a.severity === 'critical')) return 'critical';
  if (anomalies.some(a => a.severity === 'high')) return 'high';
  if (anomalies.some(a => a.severity === 'medium')) return 'medium';
  return 'low';
};

/**
 * Generate anomaly recommendations
 */
export const generateAnomalyRecommendations = (anomalies: any[]): string[] => {
  const recommendations: string[] = [];
  
  if (anomalies.some(a => a.type === 'removed_nodes')) {
    recommendations.push('Investigate unexpected node removals');
    recommendations.push('Check data pipeline health');
  }

  if (anomalies.length > 5) {
    recommendations.push('Schedule lineage system review');
    recommendations.push('Increase monitoring frequency');
  }

  return recommendations;
};

// ===================== LINEAGE VISUALIZATION UTILITIES =====================

/**
 * Generate lineage visualization layout
 */
export const generateVisualizationLayout = (
  graph: LineageGraph,
  config: LineageVisualizationConfig
): any => {
  const { layout = 'hierarchical', direction = 'top-to-bottom' } = config;
  
  switch (layout) {
    case 'hierarchical':
      return generateHierarchicalLayout(graph, direction);
    case 'force':
      return generateForceLayout(graph);
    case 'circular':
      return generateCircularLayout(graph);
    default:
      return generateHierarchicalLayout(graph, direction);
  }
};

/**
 * Generate hierarchical layout
 */
export const generateHierarchicalLayout = (
  graph: LineageGraph,
  direction: string
): any => {
  // This would implement actual layout algorithm
  // Placeholder implementation
  return {
    nodes: graph.nodes.map((node, index) => ({
      ...node,
      x: (index % 5) * 200,
      y: Math.floor(index / 5) * 150,
    })),
    edges: graph.edges,
  };
};

/**
 * Generate force-directed layout
 */
export const generateForceLayout = (graph: LineageGraph): any => {
  // Placeholder for force-directed layout algorithm
  return {
    nodes: graph.nodes,
    edges: graph.edges,
  };
};

/**
 * Generate circular layout
 */
export const generateCircularLayout = (graph: LineageGraph): any => {
  // Placeholder for circular layout algorithm
  return {
    nodes: graph.nodes,
    edges: graph.edges,
  };
};

// ===================== LINEAGE METRICS UTILITIES =====================

/**
 * Calculate comprehensive lineage metrics
 */
export const calculateLineageMetrics = (graph: LineageGraph): LineageMetrics => {
  const basic = calculateGraphMetrics(graph.nodes, graph.edges);
  
  return {
    ...basic,
    coverage: calculateLineageCoverage(graph),
    freshness: calculateLineageFreshness(graph),
    accuracy: 0.95, // This would come from validation
    completeness: calculateLineageCompleteness(graph),
    performance: calculateLineagePerformance(graph),
  };
};

/**
 * Calculate lineage coverage
 */
export const calculateLineageCoverage = (graph: LineageGraph): number => {
  // This would calculate actual coverage based on discovered vs expected assets
  return 0.85; // Placeholder
};

/**
 * Calculate lineage freshness
 */
export const calculateLineageFreshness = (graph: LineageGraph): number => {
  // This would calculate based on last update timestamps
  return 0.92; // Placeholder
};

/**
 * Calculate lineage completeness
 */
export const calculateLineageCompleteness = (graph: LineageGraph): number => {
  // This would calculate based on metadata completeness
  return 0.88; // Placeholder
};

/**
 * Calculate lineage performance score
 */
export const calculateLineagePerformance = (graph: LineageGraph): number => {
  // This would calculate based on query and update performance
  return 0.91; // Placeholder
};

export default {
  buildLineageGraph,
  calculateGraphMetrics,
  traverseLineage,
  findLineagePaths,
  analyzeLineageImpact,
  validateLineageAccuracy,
  detectLineageAnomalies,
  generateVisualizationLayout,
  calculateLineageMetrics,
};