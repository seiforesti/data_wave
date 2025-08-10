/**
 * Catalog Lineage Constants
 * ========================
 * 
 * Constants for data lineage visualization, graph configurations,
 * and lineage analysis settings.
 */

// ============================================================================
// LINEAGE VISUALIZATION CONSTANTS
// ============================================================================

export const LINEAGE_GRAPH_CONFIG = {
  // Node Configuration
  NODE: {
    DEFAULT_SIZE: 60,
    MIN_SIZE: 40,
    MAX_SIZE: 120,
    SPACING: {
      HORIZONTAL: 200,
      VERTICAL: 150,
      CLUSTER: 300
    },
    COLORS: {
      TABLE: '#3B82F6',
      VIEW: '#10B981',
      FILE: '#F59E0B',
      API: '#8B5CF6',
      STREAM: '#EF4444',
      TRANSFORMATION: '#06B6D4',
      DEFAULT: '#6B7280'
    }
  },

  // Edge Configuration
  EDGE: {
    DEFAULT_WIDTH: 2,
    HIGHLIGHTED_WIDTH: 4,
    COLORS: {
      DIRECT: '#3B82F6',
      INDIRECT: '#9CA3AF',
      TRANSFORMATION: '#10B981',
      DEPENDENCY: '#F59E0B',
      ERROR: '#EF4444'
    },
    STYLES: {
      SOLID: 'solid',
      DASHED: 'dashed',
      DOTTED: 'dotted'
    }
  },

  // Layout Configuration
  LAYOUT: {
    ALGORITHMS: ['dagre', 'elk', 'cola', 'force-directed'],
    DEFAULT_ALGORITHM: 'dagre',
    DIRECTION: ['TB', 'BT', 'LR', 'RL'],
    DEFAULT_DIRECTION: 'TB'
  }
} as const;

// ============================================================================
// LINEAGE ANALYSIS CONSTANTS
// ============================================================================

export const LINEAGE_ANALYSIS = {
  // Impact Analysis
  IMPACT_TYPES: [
    'DOWNSTREAM_DEPENDENCIES',
    'UPSTREAM_SOURCES',
    'TRANSFORMATION_CHAIN',
    'QUALITY_PROPAGATION',
    'SCHEMA_CHANGES',
    'PERFORMANCE_IMPACT'
  ],

  // Lineage Depth Levels
  DEPTH_LEVELS: {
    IMMEDIATE: 1,
    SHALLOW: 2,
    MEDIUM: 3,
    DEEP: 5,
    COMPREHENSIVE: 10,
    UNLIMITED: -1
  },

  // Analysis Metrics
  METRICS: {
    COMPLEXITY_THRESHOLDS: {
      LOW: 5,
      MEDIUM: 15,
      HIGH: 30,
      CRITICAL: 50
    },
    PERFORMANCE_THRESHOLDS: {
      FAST: 100,
      MEDIUM: 500,
      SLOW: 1000,
      CRITICAL: 5000
    }
  }
} as const;

// ============================================================================
// LINEAGE VISUALIZATION SETTINGS
// ============================================================================

export const LINEAGE_VISUALIZATION = {
  // Animation Settings
  ANIMATIONS: {
    TRANSITION_DURATION: 300,
    HIGHLIGHT_DURATION: 150,
    FADE_DURATION: 200,
    ZOOM_DURATION: 400
  },

  // Interaction Settings
  INTERACTIONS: {
    HOVER_DELAY: 100,
    CLICK_TIMEOUT: 300,
    DOUBLE_CLICK_TIMEOUT: 500,
    DRAG_THRESHOLD: 5
  },

  // Zoom Settings
  ZOOM: {
    MIN_SCALE: 0.1,
    MAX_SCALE: 3.0,
    DEFAULT_SCALE: 1.0,
    SCALE_STEP: 0.1
  },

  // Minimap Settings
  MINIMAP: {
    WIDTH: 200,
    HEIGHT: 150,
    POSITION: 'bottom-right',
    OPACITY: 0.8
  }
} as const;

// ============================================================================
// LINEAGE QUERY CONSTANTS
// ============================================================================

export const LINEAGE_QUERIES = {
  // Query Types
  TYPES: [
    'FORWARD_LINEAGE',
    'BACKWARD_LINEAGE',
    'BIDIRECTIONAL_LINEAGE',
    'IMPACT_ANALYSIS',
    'ROOT_CAUSE_ANALYSIS',
    'DEPENDENCY_CHAIN'
  ],

  // Query Filters
  FILTERS: {
    TIME_RANGES: [
      { label: 'Last Hour', value: '1h' },
      { label: 'Last 24 Hours', value: '24h' },
      { label: 'Last Week', value: '7d' },
      { label: 'Last Month', value: '30d' },
      { label: 'Last Quarter', value: '90d' },
      { label: 'All Time', value: 'all' }
    ],
    ASSET_TYPES: [
      'TABLE',
      'VIEW',
      'FILE',
      'API',
      'STREAM',
      'TRANSFORMATION',
      'PIPELINE'
    ],
    RELATIONSHIP_TYPES: [
      'DIRECT_DEPENDENCY',
      'INDIRECT_DEPENDENCY',
      'TRANSFORMATION',
      'AGGREGATION',
      'JOIN',
      'UNION',
      'FILTER'
    ]
  }
} as const;

// ============================================================================
// LINEAGE TEMPLATES
// ============================================================================

export const LINEAGE_TEMPLATES = {
  // Predefined Layouts
  LAYOUTS: {
    HIERARCHICAL: {
      name: 'Hierarchical',
      algorithm: 'dagre',
      direction: 'TB',
      spacing: { horizontal: 200, vertical: 150 }
    },
    CIRCULAR: {
      name: 'Circular',
      algorithm: 'cola',
      direction: 'TB',
      spacing: { horizontal: 150, vertical: 150 }
    },
    FORCE_DIRECTED: {
      name: 'Force Directed',
      algorithm: 'force-directed',
      direction: 'TB',
      spacing: { horizontal: 100, vertical: 100 }
    }
  },

  // View Templates
  VIEWS: {
    OVERVIEW: {
      name: 'Overview',
      depth: 2,
      showMetrics: true,
      showLabels: true,
      compactMode: false
    },
    DETAILED: {
      name: 'Detailed',
      depth: 5,
      showMetrics: true,
      showLabels: true,
      compactMode: false
    },
    COMPACT: {
      name: 'Compact',
      depth: 3,
      showMetrics: false,
      showLabels: false,
      compactMode: true
    }
  }
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const CATALOG_LINEAGE_CONSTANTS = {
  GRAPH_CONFIG: LINEAGE_GRAPH_CONFIG,
  ANALYSIS: LINEAGE_ANALYSIS,
  VISUALIZATION: LINEAGE_VISUALIZATION,
  QUERIES: LINEAGE_QUERIES,
  TEMPLATES: LINEAGE_TEMPLATES
} as const;

export default CATALOG_LINEAGE_CONSTANTS;