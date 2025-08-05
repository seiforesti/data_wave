// ============================================================================
// RACINE MAIN MANAGER - CROSS-GROUP CONFIGURATIONS
// ============================================================================

import {
  GroupConfiguration,
  WorkspaceConfiguration,
  LayoutConfiguration,
  ViewMode,
  LayoutMode,
  PerformanceMetrics,
  WorkflowTemplate,
  PipelineTemplate,
  DashboardConfig
} from '../types/racine-core.types'

// ============================================================================
// SUPPORTED GROUPS CONFIGURATION
// ============================================================================

export const SUPPORTED_GROUPS: GroupConfiguration[] = [
  {
    id: 'data-sources',
    name: 'DATA_SOURCES',
    displayName: 'Data Sources',
    description: 'Comprehensive data source management and connectivity',
    version: '2.0.0',
    status: 'active',
    capabilities: [
      'connection_management',
      'data_discovery',
      'schema_analysis',
      'real_time_monitoring',
      'performance_optimization',
      'security_scanning',
      'compliance_validation'
    ],
    endpoints: {
      base: '/api/data-sources',
      health: '/api/data-sources/health',
      metrics: '/api/data-sources/metrics',
      operations: '/api/data-sources/operations',
      websocket: '/ws/data-sources'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      supportedConnectors: ['SQL', 'NoSQL', 'Cloud', 'File', 'API', 'Streaming'],
      maxConnections: 1000,
      features: ['auto_discovery', 'schema_evolution', 'data_profiling']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'scan-rule-sets',
    name: 'SCAN_RULE_SETS',
    displayName: 'Advanced Scan Rule Sets',
    description: 'Intelligent rule management and pattern recognition',
    version: '2.1.0',
    status: 'active',
    capabilities: [
      'rule_designer',
      'pattern_library',
      'ai_suggestions',
      'validation_engine',
      'template_management',
      'version_control',
      'collaboration',
      'analytics'
    ],
    endpoints: {
      base: '/api/scan-rule-sets',
      health: '/api/scan-rule-sets/health',
      metrics: '/api/scan-rule-sets/metrics',
      operations: '/api/scan-rule-sets/operations',
      websocket: '/ws/scan-rule-sets'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      supportedLanguages: ['SQL', 'Python', 'RegEx', 'NLP'],
      ruleTypes: ['classification', 'validation', 'transformation', 'quality'],
      aiCapabilities: ['pattern_detection', 'optimization', 'recommendations']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'classifications',
    name: 'CLASSIFICATIONS',
    displayName: 'Classifications',
    description: 'Enterprise-grade data classification and sensitivity management',
    version: '1.8.0',
    status: 'active',
    capabilities: [
      'auto_classification',
      'sensitivity_detection',
      'policy_enforcement',
      'compliance_mapping',
      'ml_classification',
      'custom_taxonomies',
      'audit_trails'
    ],
    endpoints: {
      base: '/api/classifications',
      health: '/api/classifications/health',
      metrics: '/api/classifications/metrics',
      operations: '/api/classifications/operations',
      websocket: '/ws/classifications'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      classificationTypes: ['PII', 'PHI', 'Financial', 'Confidential', 'Public'],
      sensitivityLevels: ['Low', 'Medium', 'High', 'Critical'],
      complianceFrameworks: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'compliance-rules',
    name: 'COMPLIANCE_RULES',
    displayName: 'Compliance Rules',
    description: 'Comprehensive compliance management and regulatory adherence',
    version: '1.9.0',
    status: 'active',
    capabilities: [
      'policy_management',
      'compliance_monitoring',
      'risk_assessment',
      'audit_automation',
      'regulatory_reporting',
      'violation_detection',
      'remediation_workflows'
    ],
    endpoints: {
      base: '/api/compliance-rules',
      health: '/api/compliance-rules/health',
      metrics: '/api/compliance-rules/metrics',
      operations: '/api/compliance-rules/operations',
      websocket: '/ws/compliance-rules'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      regulations: ['GDPR', 'CCPA', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO27001'],
      riskLevels: ['Low', 'Medium', 'High', 'Critical'],
      reportTypes: ['Compliance', 'Risk', 'Audit', 'Violation']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'advanced-catalog',
    name: 'ADVANCED_CATALOG',
    displayName: 'Advanced Catalog',
    description: 'AI-powered data catalog with intelligent discovery',
    version: '2.2.0',
    status: 'active',
    capabilities: [
      'ai_discovery',
      'semantic_search',
      'data_lineage',
      'quality_management',
      'collaboration',
      'analytics',
      'recommendations',
      'metadata_enrichment'
    ],
    endpoints: {
      base: '/api/advanced-catalog',
      health: '/api/advanced-catalog/health',
      metrics: '/api/advanced-catalog/metrics',
      operations: '/api/advanced-catalog/operations',
      websocket: '/ws/advanced-catalog'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      catalogTypes: ['Data Assets', 'Schemas', 'Tables', 'Views', 'APIs'],
      discoveryMethods: ['Automated', 'Manual', 'Scheduled', 'Event-driven'],
      qualityMetrics: ['Completeness', 'Accuracy', 'Consistency', 'Timeliness']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'scan-logic',
    name: 'SCAN_LOGIC',
    displayName: 'Advanced Scan Logic',
    description: 'Enterprise scan orchestration and intelligence platform',
    version: '2.3.0',
    status: 'active',
    capabilities: [
      'scan_orchestration',
      'intelligence_engine',
      'performance_optimization',
      'workflow_management',
      'real_time_monitoring',
      'security_compliance',
      'advanced_analytics',
      'predictive_insights'
    ],
    endpoints: {
      base: '/api/scan-logic',
      health: '/api/scan-logic/health',
      metrics: '/api/scan-logic/metrics',
      operations: '/api/scan-logic/operations',
      websocket: '/ws/scan-logic'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      scanTypes: ['Full', 'Incremental', 'Differential', 'Smart'],
      orchestrationModes: ['Sequential', 'Parallel', 'Conditional', 'Adaptive'],
      intelligenceFeatures: ['Pattern Recognition', 'Anomaly Detection', 'Predictive Analysis']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  },
  {
    id: 'rbac-system',
    name: 'RBAC_SYSTEM',
    displayName: 'RBAC System',
    description: 'Role-based access control and security management',
    version: '1.7.0',
    status: 'active',
    capabilities: [
      'role_management',
      'permission_control',
      'access_monitoring',
      'security_audit',
      'policy_enforcement',
      'identity_management',
      'session_control'
    ],
    endpoints: {
      base: '/api/rbac',
      health: '/api/rbac/health',
      metrics: '/api/rbac/metrics',
      operations: '/api/rbac/operations',
      websocket: '/ws/rbac'
    },
    permissions: [
      'read', 'write', 'execute', 'admin', 'collaborate', 'export'
    ],
    metadata: {
      roleTypes: ['System Admin', 'Data Admin', 'Analyst', 'Viewer', 'Custom'],
      permissionLevels: ['None', 'Read', 'Write', 'Execute', 'Admin'],
      securityFeatures: ['MFA', 'SSO', 'Session Management', 'Audit Logging']
    },
    lastSync: new Date(),
    healthStatus: 'healthy'
  }
]

// ============================================================================
// DEFAULT WORKSPACE CONFIGURATION
// ============================================================================

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfiguration = {
  id: 'default',
  name: 'Default Workspace',
  description: 'Default workspace for new users',
  type: 'personal',
  owner: 'system',
  members: [],
  groups: SUPPORTED_GROUPS.map(g => g.id),
  resources: [],
  settings: {
    isPublic: false,
    allowInvites: true,
    requireApproval: false,
    retentionPolicy: 90,
    backupEnabled: true,
    encryptionEnabled: true,
    auditEnabled: true,
    integrations: []
  },
  analytics: {
    usage: {
      activeUsers: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      pageViews: 0,
      featureUsage: {},
      apiCalls: 0
    },
    performance: {
      loadTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
      renderTime: 0
    },
    collaboration: {
      activeCollaborations: 0,
      totalParticipants: 0,
      messagesExchanged: 0,
      documentsShared: 0,
      averageResponseTime: 0,
      engagementScore: 0
    },
    costs: {
      computeCosts: 0,
      storageCosts: 0,
      networkCosts: 0,
      licenseCosts: 0,
      totalCosts: 0,
      costPerUser: 0,
      budgetUtilization: 0
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  lastAccessed: new Date()
}

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export const LAYOUT_PRESETS: Record<string, LayoutConfiguration> = {
  default: {
    mode: 'unified',
    sidebarCollapsed: false,
    theme: 'system',
    responsive: true,
    animations: true,
    accessibility: true
  },
  compact: {
    mode: 'unified',
    sidebarCollapsed: true,
    theme: 'system',
    responsive: true,
    animations: false,
    accessibility: true
  },
  split: {
    mode: 'split',
    sidebarCollapsed: false,
    theme: 'system',
    responsive: true,
    animations: true,
    accessibility: true
  },
  tabbed: {
    mode: 'tabbed',
    sidebarCollapsed: false,
    theme: 'system',
    responsive: true,
    animations: true,
    accessibility: true
  },
  fullscreen: {
    mode: 'fullscreen',
    sidebarCollapsed: true,
    theme: 'system',
    responsive: true,
    animations: false,
    accessibility: true
  }
}

// ============================================================================
// VIEW MODES
// ============================================================================

export const VIEW_MODES: Record<ViewMode, { label: string; icon: string; description: string }> = {
  dashboard: {
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Executive and operational dashboards'
  },
  workflows: {
    label: 'Workflows',
    icon: 'GitBranch',
    description: 'Cross-group workflow orchestration'
  },
  pipelines: {
    label: 'Pipelines',
    icon: 'Workflow',
    description: 'Advanced pipeline management'
  },
  activity: {
    label: 'Activity',
    icon: 'Activity',
    description: 'Activity tracking and analytics'
  },
  collaboration: {
    label: 'Collaboration',
    icon: 'Users',
    description: 'Team collaboration and communication'
  },
  profile: {
    label: 'Profile',
    icon: 'User',
    description: 'User profile and settings'
  },
  settings: {
    label: 'Settings',
    icon: 'Settings',
    description: 'System and workspace settings'
  }
}

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  MAX_LOAD_TIME: 3000, // 3 seconds
  MAX_MEMORY: 100 * 1024 * 1024, // 100MB
  MAX_API_LATENCY: 1000, // 1 second
  MAX_RENDER_TIME: 500, // 500ms
  WARNING_MEMORY: 75 * 1024 * 1024, // 75MB
  WARNING_LOAD_TIME: 2000, // 2 seconds
  WARNING_API_LATENCY: 500, // 500ms
  MAX_CONCURRENT_USERS: 10000,
  MAX_WEBSOCKET_CONNECTIONS: 5000,
  CACHE_TTL: 300000, // 5 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  BATCH_SIZE: 100,
  PAGINATION_LIMIT: 50
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  
  // Racine Manager Endpoints
  RACINE: {
    HEALTH: '/api/racine/health',
    METRICS: '/api/racine/metrics',
    ORCHESTRATION: '/api/racine/orchestration',
    CROSS_GROUP: '/api/racine/cross-group',
    WORKFLOWS: '/api/racine/workflows',
    PIPELINES: '/api/racine/pipelines',
    AI_ASSISTANT: '/api/racine/ai-assistant',
    ACTIVITY: '/api/racine/activity',
    COLLABORATION: '/api/racine/collaboration',
    DASHBOARDS: '/api/racine/dashboards',
    WORKSPACES: '/api/racine/workspaces',
    USERS: '/api/racine/users'
  },

  // Group-specific endpoints
  DATA_SOURCES: '/api/data-sources',
  SCAN_RULE_SETS: '/api/scan-rule-sets',
  CLASSIFICATIONS: '/api/classifications',
  COMPLIANCE_RULES: '/api/compliance-rules',
  ADVANCED_CATALOG: '/api/advanced-catalog',
  SCAN_LOGIC: '/api/scan-logic',
  RBAC: '/api/rbac',

  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    PERMISSIONS: '/api/auth/permissions'
  }
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'data-discovery-workflow',
    name: 'Data Discovery Workflow',
    description: 'Automated data discovery across multiple sources',
    category: 'Discovery',
    groups: ['data-sources', 'advanced-catalog', 'classifications'],
    steps: [
      {
        id: 'connect-sources',
        name: 'Connect Data Sources',
        type: 'connection',
        groupId: 'data-sources',
        serviceId: 'connection-service',
        operation: 'discover_sources',
        parameters: { auto_discovery: true },
        dependencies: [],
        conditions: [],
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000
        },
        timeout: 300000
      },
      {
        id: 'analyze-schemas',
        name: 'Analyze Schemas',
        type: 'analysis',
        groupId: 'advanced-catalog',
        serviceId: 'discovery-service',
        operation: 'analyze_schemas',
        parameters: { include_metadata: true },
        dependencies: ['connect-sources'],
        conditions: [],
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'linear',
          initialDelay: 2000,
          maxDelay: 8000
        },
        timeout: 600000
      },
      {
        id: 'classify-data',
        name: 'Classify Data',
        type: 'classification',
        groupId: 'classifications',
        serviceId: 'classification-service',
        operation: 'auto_classify',
        parameters: { sensitivity_detection: true },
        dependencies: ['analyze-schemas'],
        conditions: [],
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 5000
        },
        timeout: 900000
      }
    ],
    triggers: [
      {
        id: 'scheduled-trigger',
        type: 'scheduled',
        config: {
          schedule: '0 2 * * *', // Daily at 2 AM
          timezone: 'UTC'
        },
        isActive: true
      }
    ],
    estimatedDuration: 1800000, // 30 minutes
    tags: ['automated', 'discovery', 'classification']
  },
  {
    id: 'compliance-audit-workflow',
    name: 'Compliance Audit Workflow',
    description: 'Comprehensive compliance audit across all data assets',
    category: 'Compliance',
    groups: ['compliance-rules', 'classifications', 'advanced-catalog'],
    steps: [
      {
        id: 'scan-compliance',
        name: 'Scan for Compliance Issues',
        type: 'scan',
        groupId: 'compliance-rules',
        serviceId: 'compliance-service',
        operation: 'audit_scan',
        parameters: { include_all_frameworks: true },
        dependencies: [],
        conditions: [],
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'exponential',
          initialDelay: 2000,
          maxDelay: 10000
        },
        timeout: 1200000
      },
      {
        id: 'validate-classifications',
        name: 'Validate Data Classifications',
        type: 'validation',
        groupId: 'classifications',
        serviceId: 'validation-service',
        operation: 'validate_classifications',
        parameters: { strict_mode: true },
        dependencies: ['scan-compliance'],
        conditions: [],
        retryPolicy: {
          maxRetries: 1,
          backoffStrategy: 'linear',
          initialDelay: 3000,
          maxDelay: 6000
        },
        timeout: 900000
      },
      {
        id: 'generate-report',
        name: 'Generate Audit Report',
        type: 'reporting',
        groupId: 'advanced-catalog',
        serviceId: 'reporting-service',
        operation: 'generate_audit_report',
        parameters: { format: 'comprehensive' },
        dependencies: ['validate-classifications'],
        conditions: [],
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'linear',
          initialDelay: 1000,
          maxDelay: 3000
        },
        timeout: 300000
      }
    ],
    triggers: [
      {
        id: 'monthly-trigger',
        type: 'scheduled',
        config: {
          schedule: '0 0 1 * *', // Monthly on 1st at midnight
          timezone: 'UTC'
        },
        isActive: true
      }
    ],
    estimatedDuration: 2400000, // 40 minutes
    tags: ['compliance', 'audit', 'reporting']
  }
]

// ============================================================================
// PIPELINE TEMPLATES
// ============================================================================

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'data-quality-pipeline',
    name: 'Data Quality Pipeline',
    description: 'End-to-end data quality assessment and improvement',
    category: 'Quality',
    groups: ['data-sources', 'scan-rule-sets', 'advanced-catalog'],
    stages: [
      {
        id: 'data-profiling',
        name: 'Data Profiling',
        type: 'profiling',
        groupId: 'data-sources',
        operations: [
          {
            id: 'profile-data',
            name: 'Profile Data Sources',
            type: 'profiling',
            serviceId: 'profiling-service',
            parameters: { include_statistics: true },
            validation: [],
            monitoring: {
              enabled: true,
              metrics: ['completion_rate', 'error_rate'],
              alertThresholds: { error_rate: 0.1 }
            }
          }
        ],
        dependencies: [],
        parallelExecution: false,
        continueOnError: false
      },
      {
        id: 'quality-rules',
        name: 'Apply Quality Rules',
        type: 'validation',
        groupId: 'scan-rule-sets',
        operations: [
          {
            id: 'apply-rules',
            name: 'Apply Quality Rules',
            type: 'validation',
            serviceId: 'rule-engine',
            parameters: { rule_type: 'quality' },
            validation: [],
            monitoring: {
              enabled: true,
              metrics: ['rules_applied', 'violations_found'],
              alertThresholds: { violation_rate: 0.2 }
            }
          }
        ],
        dependencies: ['data-profiling'],
        parallelExecution: false,
        continueOnError: true
      },
      {
        id: 'catalog-update',
        name: 'Update Catalog',
        type: 'cataloging',
        groupId: 'advanced-catalog',
        operations: [
          {
            id: 'update-metadata',
            name: 'Update Metadata',
            type: 'update',
            serviceId: 'catalog-service',
            parameters: { include_quality_metrics: true },
            validation: [],
            monitoring: {
              enabled: true,
              metrics: ['items_updated', 'metadata_enriched'],
              alertThresholds: { update_failure_rate: 0.05 }
            }
          }
        ],
        dependencies: ['quality-rules'],
        parallelExecution: false,
        continueOnError: false
      }
    ],
    config: {
      maxParallelStages: 2,
      timeout: 3600000, // 1 hour
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        initialDelay: 5000,
        maxDelay: 30000
      },
      notifications: [
        {
          channel: 'email',
          events: ['completion', 'failure'],
          template: 'pipeline_notification',
          recipients: ['admin@company.com']
        }
      ],
      logging: {
        level: 'info',
        destinations: ['file', 'database'],
        format: 'json',
        retention: 30
      },
      security: {
        encryption: true,
        accessControl: true,
        auditLogging: true,
        dataClassification: 'internal'
      }
    },
    estimatedDuration: 2700000, // 45 minutes
    tags: ['quality', 'profiling', 'validation']
  }
]

// ============================================================================
// DASHBOARD CONFIGURATIONS
// ============================================================================

export const DASHBOARD_CONFIGS: Record<string, DashboardConfig> = {
  executive: {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level metrics and KPIs for executives',
    type: 'executive',
    refreshInterval: 300000, // 5 minutes
    widgets: [
      {
        id: 'system-health',
        type: 'status',
        title: 'System Health',
        position: { x: 0, y: 0, w: 3, h: 2 },
        dataSource: 'system-metrics',
        config: { showDetails: false }
      },
      {
        id: 'data-quality-score',
        type: 'gauge',
        title: 'Data Quality Score',
        position: { x: 3, y: 0, w: 3, h: 2 },
        dataSource: 'quality-metrics',
        config: { threshold: 0.8 }
      },
      {
        id: 'compliance-status',
        type: 'pie',
        title: 'Compliance Status',
        position: { x: 6, y: 0, w: 3, h: 2 },
        dataSource: 'compliance-metrics',
        config: { showLegend: true }
      },
      {
        id: 'cost-overview',
        type: 'line',
        title: 'Cost Overview',
        position: { x: 0, y: 2, w: 6, h: 3 },
        dataSource: 'cost-metrics',
        config: { timeRange: '30d' }
      },
      {
        id: 'user-activity',
        type: 'bar',
        title: 'User Activity',
        position: { x: 6, y: 2, w: 3, h: 3 },
        dataSource: 'activity-metrics',
        config: { groupBy: 'day' }
      }
    ],
    filters: [
      {
        field: 'timeRange',
        type: 'daterange',
        defaultValue: '7d',
        options: ['1d', '7d', '30d', '90d']
      }
    ],
    permissions: ['executive', 'admin'],
    isDefault: true
  },
  operational: {
    id: 'operational-dashboard',
    name: 'Operational Dashboard',
    description: 'Detailed operational metrics and monitoring',
    type: 'operational',
    refreshInterval: 60000, // 1 minute
    widgets: [
      {
        id: 'active-jobs',
        type: 'list',
        title: 'Active Jobs',
        position: { x: 0, y: 0, w: 4, h: 3 },
        dataSource: 'job-metrics',
        config: { maxItems: 10 }
      },
      {
        id: 'error-rate',
        type: 'line',
        title: 'Error Rate',
        position: { x: 4, y: 0, w: 4, h: 3 },
        dataSource: 'error-metrics',
        config: { threshold: 0.05 }
      },
      {
        id: 'resource-usage',
        type: 'area',
        title: 'Resource Usage',
        position: { x: 8, y: 0, w: 4, h: 3 },
        dataSource: 'resource-metrics',
        config: { stack: true }
      },
      {
        id: 'pipeline-status',
        type: 'table',
        title: 'Pipeline Status',
        position: { x: 0, y: 3, w: 6, h: 4 },
        dataSource: 'pipeline-metrics',
        config: { sortable: true }
      },
      {
        id: 'alerts',
        type: 'alert',
        title: 'Active Alerts',
        position: { x: 6, y: 3, w: 6, h: 4 },
        dataSource: 'alert-metrics',
        config: { severity: 'high' }
      }
    ],
    filters: [
      {
        field: 'environment',
        type: 'select',
        defaultValue: 'production',
        options: ['development', 'staging', 'production']
      },
      {
        field: 'group',
        type: 'multiselect',
        defaultValue: 'all',
        options: SUPPORTED_GROUPS.map(g => ({ value: g.id, label: g.displayName }))
      }
    ],
    permissions: ['admin', 'operator', 'analyst'],
    isDefault: false
  }
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const NOTIFICATION_TEMPLATES = {
  SYSTEM_ALERT: {
    title: 'System Alert: {{alertType}}',
    message: 'Alert detected in {{source}}: {{message}}',
    priority: 'high',
    channels: ['email', 'slack']
  },
  JOB_COMPLETION: {
    title: 'Job Completed: {{jobName}}',
    message: 'Job {{jobName}} completed {{status}} in {{duration}}',
    priority: 'medium',
    channels: ['email']
  },
  WORKFLOW_FAILURE: {
    title: 'Workflow Failed: {{workflowName}}',
    message: 'Workflow {{workflowName}} failed at step {{failedStep}}',
    priority: 'high',
    channels: ['email', 'slack', 'teams']
  },
  COMPLIANCE_VIOLATION: {
    title: 'Compliance Violation Detected',
    message: 'Violation of {{regulation}} detected in {{resource}}',
    priority: 'critical',
    channels: ['email', 'slack', 'teams', 'webhook']
  },
  DATA_QUALITY_ISSUE: {
    title: 'Data Quality Issue: {{issueType}}',
    message: 'Quality issue detected in {{dataSource}}: {{description}}',
    priority: 'medium',
    channels: ['email']
  }
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  AI_ASSISTANT: process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true',
  REAL_TIME_COLLABORATION: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
  ADVANCED_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  WORKFLOW_BUILDER: process.env.NEXT_PUBLIC_ENABLE_WORKFLOWS === 'true',
  PIPELINE_MANAGER: process.env.NEXT_PUBLIC_ENABLE_PIPELINES === 'true',
  ACTIVITY_TRACKING: process.env.NEXT_PUBLIC_ENABLE_ACTIVITY_TRACKING === 'true',
  CUSTOM_DASHBOARDS: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_DASHBOARDS === 'true',
  MULTI_WORKSPACE: process.env.NEXT_PUBLIC_ENABLE_MULTI_WORKSPACE === 'true',
  EXTERNAL_INTEGRATIONS: process.env.NEXT_PUBLIC_ENABLE_INTEGRATIONS === 'true',
  MOBILE_SUPPORT: process.env.NEXT_PUBLIC_ENABLE_MOBILE === 'true'
}

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================

export {
  SUPPORTED_GROUPS as default,
  DEFAULT_WORKSPACE_CONFIG,
  LAYOUT_PRESETS,
  VIEW_MODES,
  PERFORMANCE_THRESHOLDS,
  API_ENDPOINTS,
  WORKFLOW_TEMPLATES,
  PIPELINE_TEMPLATES,
  DASHBOARD_CONFIGS,
  NOTIFICATION_TEMPLATES,
  FEATURE_FLAGS
}

// Helper type definitions for templates
interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  groups: string[]
  steps: any[]
  triggers: any[]
  estimatedDuration: number
  tags: string[]
}

interface PipelineTemplate {
  id: string
  name: string
  description: string
  category: string
  groups: string[]
  stages: any[]
  config: any
  estimatedDuration: number
  tags: string[]
}

interface DashboardConfig {
  id: string
  name: string
  description: string
  type: string
  refreshInterval: number
  widgets: any[]
  filters: any[]
  permissions: string[]
  isDefault: boolean
}