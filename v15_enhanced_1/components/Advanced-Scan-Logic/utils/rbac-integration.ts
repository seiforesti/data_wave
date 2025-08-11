/**
 * 🔐 RBAC Integration for Advanced Scan Logic
 * ============================================
 * 
 * Enterprise-grade RBAC integration that provides seamless security
 * integration for all Advanced Scan Logic components and operations.
 * 
 * Maps to backend: rbac_service.py, role_service.py, auth_service.py
 * 
 * Features:
 * - Scan logic specific permission checks
 * - Role-based access control for scan operations
 * - Resource-level security for scan workflows
 * - Advanced condition-based access control
 * - Hierarchical permission inheritance
 * - Real-time permission validation
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { 
  hasPermission, 
  hasPermissions, 
  getUserEffectivePermissions,
  hasAnyRole,
  hasAllRoles,
  logRbacAction,
  generateCorrelationId
} from '../../Advanced_RBAC_Datagovernance_System/utils/rbac.utils';

import type { 
  User, 
  Permission, 
  PermissionCheck 
} from '../../Advanced_RBAC_Datagovernance_System/types/user.types';

// ============================================================================
// SCAN LOGIC SPECIFIC PERMISSIONS
// ============================================================================

export const SCAN_LOGIC_PERMISSIONS = {
  // Advanced Analytics Permissions
  ANALYTICS_VIEW: 'scan.analytics.view',
  ANALYTICS_CREATE: 'scan.analytics.create',
  ANALYTICS_EDIT: 'scan.analytics.edit',
  ANALYTICS_DELETE: 'scan.analytics.delete',
  ANALYTICS_EXPORT: 'scan.analytics.export',
  ANALYTICS_ADMIN: 'scan.analytics.admin',
  
  // Performance Optimization Permissions
  PERFORMANCE_VIEW: 'scan.performance.view',
  PERFORMANCE_OPTIMIZE: 'scan.performance.optimize',
  PERFORMANCE_CONFIGURE: 'scan.performance.configure',
  PERFORMANCE_ADMIN: 'scan.performance.admin',
  
  // Real-Time Monitoring Permissions
  MONITORING_VIEW: 'scan.monitoring.view',
  MONITORING_CREATE: 'scan.monitoring.create',
  MONITORING_EDIT: 'scan.monitoring.edit',
  MONITORING_DELETE: 'scan.monitoring.delete',
  MONITORING_ALERTS: 'scan.monitoring.alerts',
  MONITORING_ADMIN: 'scan.monitoring.admin',
  
  // Scan Coordination Permissions
  COORDINATION_VIEW: 'scan.coordination.view',
  COORDINATION_EXECUTE: 'scan.coordination.execute',
  COORDINATION_SCHEDULE: 'scan.coordination.schedule',
  COORDINATION_CANCEL: 'scan.coordination.cancel',
  COORDINATION_ADMIN: 'scan.coordination.admin',
  
  // Scan Intelligence Permissions
  INTELLIGENCE_VIEW: 'scan.intelligence.view',
  INTELLIGENCE_ANALYZE: 'scan.intelligence.analyze',
  INTELLIGENCE_PREDICT: 'scan.intelligence.predict',
  INTELLIGENCE_TRAIN: 'scan.intelligence.train',
  INTELLIGENCE_ADMIN: 'scan.intelligence.admin',
  
  // Scan Orchestration Permissions
  ORCHESTRATION_VIEW: 'scan.orchestration.view',
  ORCHESTRATION_CREATE: 'scan.orchestration.create',
  ORCHESTRATION_EDIT: 'scan.orchestration.edit',
  ORCHESTRATION_EXECUTE: 'scan.orchestration.execute',
  ORCHESTRATION_DELETE: 'scan.orchestration.delete',
  ORCHESTRATION_ADMIN: 'scan.orchestration.admin',
  
  // Security Compliance Permissions
  SECURITY_VIEW: 'scan.security.view',
  SECURITY_AUDIT: 'scan.security.audit',
  SECURITY_CONFIGURE: 'scan.security.configure',
  SECURITY_REMEDIATE: 'scan.security.remediate',
  SECURITY_ADMIN: 'scan.security.admin',
  
  // Workflow Management Permissions
  WORKFLOW_VIEW: 'scan.workflow.view',
  WORKFLOW_CREATE: 'scan.workflow.create',
  WORKFLOW_EDIT: 'scan.workflow.edit',
  WORKFLOW_EXECUTE: 'scan.workflow.execute',
  WORKFLOW_DELETE: 'scan.workflow.delete',
  WORKFLOW_ADMIN: 'scan.workflow.admin',
  
  // System Administration Permissions
  SYSTEM_VIEW: 'scan.system.view',
  SYSTEM_CONFIGURE: 'scan.system.configure',
  SYSTEM_ADMIN: 'scan.system.admin'
} as const;

// ============================================================================
// SCAN LOGIC RESOURCES
// ============================================================================

export const SCAN_LOGIC_RESOURCES = {
  // Analytics Resources
  ANALYTICS_DASHBOARD: 'scan.analytics.dashboard',
  ANALYTICS_REPORT: 'scan.analytics.report',
  ANALYTICS_MODEL: 'scan.analytics.model',
  ANALYTICS_METRIC: 'scan.analytics.metric',
  
  // Performance Resources
  PERFORMANCE_PROFILE: 'scan.performance.profile',
  PERFORMANCE_OPTIMIZATION: 'scan.performance.optimization',
  PERFORMANCE_BENCHMARK: 'scan.performance.benchmark',
  
  // Monitoring Resources
  MONITORING_ALERT: 'scan.monitoring.alert',
  MONITORING_METRIC: 'scan.monitoring.metric',
  MONITORING_DASHBOARD: 'scan.monitoring.dashboard',
  
  // Coordination Resources
  COORDINATION_PLAN: 'scan.coordination.plan',
  COORDINATION_SCHEDULE: 'scan.coordination.schedule',
  COORDINATION_EXECUTION: 'scan.coordination.execution',
  
  // Intelligence Resources
  INTELLIGENCE_MODEL: 'scan.intelligence.model',
  INTELLIGENCE_PREDICTION: 'scan.intelligence.prediction',
  INTELLIGENCE_INSIGHT: 'scan.intelligence.insight',
  
  // Orchestration Resources
  ORCHESTRATION_WORKFLOW: 'scan.orchestration.workflow',
  ORCHESTRATION_PIPELINE: 'scan.orchestration.pipeline',
  ORCHESTRATION_RULE: 'scan.orchestration.rule',
  
  // Security Resources
  SECURITY_POLICY: 'scan.security.policy',
  SECURITY_AUDIT: 'scan.security.audit',
  SECURITY_COMPLIANCE: 'scan.security.compliance',
  
  // Workflow Resources
  WORKFLOW_TEMPLATE: 'scan.workflow.template',
  WORKFLOW_INSTANCE: 'scan.workflow.instance',
  WORKFLOW_STEP: 'scan.workflow.step'
} as const;

// ============================================================================
// SCAN LOGIC ROLES
// ============================================================================

export const SCAN_LOGIC_ROLES = {
  SCAN_ADMIN: 'scan_admin',
  SCAN_MANAGER: 'scan_manager',
  SCAN_ANALYST: 'scan_analyst',
  SCAN_OPERATOR: 'scan_operator',
  SCAN_VIEWER: 'scan_viewer',
  SECURITY_OFFICER: 'security_officer',
  PERFORMANCE_ENGINEER: 'performance_engineer',
  DATA_STEWARD: 'data_steward'
} as const;

// ============================================================================
// PERMISSION CHECKING UTILITIES
// ============================================================================

/**
 * Check if user has permission for specific scan logic operation
 */
export async function checkScanPermission(
  userId: number,
  action: string,
  resource: string,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  const correlationId = generateCorrelationId();
  
  try {
    const result = await hasPermission(userId, action, resource, conditions);
    
    // Log the permission check for audit
    await logRbacAction('permission_check', `user_${userId}`, {
      resource_type: 'scan_logic',
      resource_id: resource,
      status: result.allowed ? 'granted' : 'denied',
      correlation_id: correlationId,
      note: `Scan logic permission check: ${action} on ${resource}`
    });
    
    return result;
  } catch (error) {
    console.error('Scan permission check failed:', error);
    return {
      user_id: userId,
      action,
      resource,
      conditions,
      allowed: false,
      reason: 'Permission check failed'
    };
  }
}

/**
 * Check multiple scan logic permissions at once
 */
export async function checkScanPermissions(
  userId: number,
  permissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
): Promise<PermissionCheck[]> {
  const correlationId = generateCorrelationId();
  
  try {
    const results = await hasPermissions(userId, permissions);
    
    // Log bulk permission check
    await logRbacAction('bulk_permission_check', `user_${userId}`, {
      resource_type: 'scan_logic',
      status: 'completed',
      correlation_id: correlationId,
      note: `Bulk scan logic permission check for ${permissions.length} permissions`
    });
    
    return results;
  } catch (error) {
    console.error('Bulk scan permission check failed:', error);
    return permissions.map(perm => ({
      user_id: userId,
      action: perm.action,
      resource: perm.resource,
      conditions: perm.conditions,
      allowed: false,
      reason: 'Bulk permission check failed'
    }));
  }
}

/**
 * Check if user has required scan logic role
 */
export async function hasScanRole(userId: number, roleName: string): Promise<boolean> {
  try {
    return await hasAnyRole(userId, [roleName]);
  } catch (error) {
    console.error('Scan role check failed:', error);
    return false;
  }
}

/**
 * Check if user has any of the scan admin roles
 */
export async function isScanAdmin(userId: number): Promise<boolean> {
  try {
    return await hasAnyRole(userId, [
      SCAN_LOGIC_ROLES.SCAN_ADMIN,
      'admin',
      'system_admin'
    ]);
  } catch (error) {
    console.error('Scan admin check failed:', error);
    return false;
  }
}

/**
 * Check if user can manage scan workflows
 */
export async function canManageScanWorkflows(userId: number): Promise<boolean> {
  try {
    return await hasAnyRole(userId, [
      SCAN_LOGIC_ROLES.SCAN_ADMIN,
      SCAN_LOGIC_ROLES.SCAN_MANAGER,
      'admin'
    ]);
  } catch (error) {
    console.error('Scan workflow management check failed:', error);
    return false;
  }
}

/**
 * Check if user can view scan analytics
 */
export async function canViewScanAnalytics(userId: number): Promise<boolean> {
  try {
    const result = await checkScanPermission(
      userId,
      SCAN_LOGIC_PERMISSIONS.ANALYTICS_VIEW,
      SCAN_LOGIC_RESOURCES.ANALYTICS_DASHBOARD
    );
    return result.allowed;
  } catch (error) {
    console.error('Scan analytics view check failed:', error);
    return false;
  }
}

/**
 * Check if user can perform security operations
 */
export async function canPerformSecurityOperations(userId: number): Promise<boolean> {
  try {
    return await hasAnyRole(userId, [
      SCAN_LOGIC_ROLES.SCAN_ADMIN,
      SCAN_LOGIC_ROLES.SECURITY_OFFICER,
      'admin'
    ]);
  } catch (error) {
    console.error('Security operations check failed:', error);
    return false;
  }
}

// ============================================================================
// RESOURCE-SPECIFIC PERMISSION CHECKS
// ============================================================================

/**
 * Check permission for specific scan workflow
 */
export async function checkWorkflowPermission(
  userId: number,
  action: string,
  workflowId: string,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  const resource = `${SCAN_LOGIC_RESOURCES.WORKFLOW_INSTANCE}.${workflowId}`;
  return await checkScanPermission(userId, action, resource, {
    ...conditions,
    workflow_id: workflowId
  });
}

/**
 * Check permission for specific analytics dashboard
 */
export async function checkDashboardPermission(
  userId: number,
  action: string,
  dashboardId: string,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  const resource = `${SCAN_LOGIC_RESOURCES.ANALYTICS_DASHBOARD}.${dashboardId}`;
  return await checkScanPermission(userId, action, resource, {
    ...conditions,
    dashboard_id: dashboardId
  });
}

/**
 * Check permission for specific scan execution
 */
export async function checkScanExecutionPermission(
  userId: number,
  action: string,
  scanId: string,
  conditions?: Record<string, any>
): Promise<PermissionCheck> {
  const resource = `${SCAN_LOGIC_RESOURCES.COORDINATION_EXECUTION}.${scanId}`;
  return await checkScanPermission(userId, action, resource, {
    ...conditions,
    scan_id: scanId
  });
}

// ============================================================================
// CONTEXT-AWARE PERMISSION CHECKS
// ============================================================================

/**
 * Get user's effective scan logic permissions
 */
export async function getUserScanPermissions(userId: number): Promise<Permission[]> {
  try {
    const allPermissions = await getUserEffectivePermissions(userId);
    
    // Filter for scan logic permissions
    return allPermissions.filter(permission => 
      permission.action.startsWith('scan.') || 
      permission.resource.startsWith('scan.')
    );
  } catch (error) {
    console.error('Failed to get user scan permissions:', error);
    return [];
  }
}

/**
 * Check if user can access scan component
 */
export async function canAccessScanComponent(
  userId: number,
  componentType: string,
  componentId?: string
): Promise<boolean> {
  try {
    const componentPermissionMap: Record<string, { action: string; resource: string }> = {
      'advanced-analytics': {
        action: SCAN_LOGIC_PERMISSIONS.ANALYTICS_VIEW,
        resource: SCAN_LOGIC_RESOURCES.ANALYTICS_DASHBOARD
      },
      'performance-optimization': {
        action: SCAN_LOGIC_PERMISSIONS.PERFORMANCE_VIEW,
        resource: SCAN_LOGIC_RESOURCES.PERFORMANCE_PROFILE
      },
      'real-time-monitoring': {
        action: SCAN_LOGIC_PERMISSIONS.MONITORING_VIEW,
        resource: SCAN_LOGIC_RESOURCES.MONITORING_DASHBOARD
      },
      'scan-coordination': {
        action: SCAN_LOGIC_PERMISSIONS.COORDINATION_VIEW,
        resource: SCAN_LOGIC_RESOURCES.COORDINATION_PLAN
      },
      'scan-intelligence': {
        action: SCAN_LOGIC_PERMISSIONS.INTELLIGENCE_VIEW,
        resource: SCAN_LOGIC_RESOURCES.INTELLIGENCE_MODEL
      },
      'scan-orchestration': {
        action: SCAN_LOGIC_PERMISSIONS.ORCHESTRATION_VIEW,
        resource: SCAN_LOGIC_RESOURCES.ORCHESTRATION_WORKFLOW
      },
      'security-compliance': {
        action: SCAN_LOGIC_PERMISSIONS.SECURITY_VIEW,
        resource: SCAN_LOGIC_RESOURCES.SECURITY_POLICY
      },
      'workflow-management': {
        action: SCAN_LOGIC_PERMISSIONS.WORKFLOW_VIEW,
        resource: SCAN_LOGIC_RESOURCES.WORKFLOW_TEMPLATE
      }
    };
    
    const componentPerms = componentPermissionMap[componentType];
    if (!componentPerms) {
      console.warn(`Unknown scan component type: ${componentType}`);
      return false;
    }
    
    const resource = componentId 
      ? `${componentPerms.resource}.${componentId}`
      : componentPerms.resource;
    
    const result = await checkScanPermission(
      userId,
      componentPerms.action,
      resource
    );
    
    return result.allowed;
  } catch (error) {
    console.error('Component access check failed:', error);
    return false;
  }
}

// ============================================================================
// PERMISSION VALIDATION UTILITIES
// ============================================================================

/**
 * Validate scan logic permission format
 */
export function validateScanPermission(action: string, resource: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate action format
  if (!action.startsWith('scan.')) {
    errors.push('Scan logic actions must start with "scan."');
  }
  
  const validActionPrefixes = [
    'scan.analytics.',
    'scan.performance.',
    'scan.monitoring.',
    'scan.coordination.',
    'scan.intelligence.',
    'scan.orchestration.',
    'scan.security.',
    'scan.workflow.',
    'scan.system.'
  ];
  
  if (!validActionPrefixes.some(prefix => action.startsWith(prefix))) {
    errors.push('Invalid scan logic action prefix');
  }
  
  // Validate resource format
  if (!resource.startsWith('scan.')) {
    errors.push('Scan logic resources must start with "scan."');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get required permissions for scan operation
 */
export function getRequiredScanPermissions(operationType: string): string[] {
  const operationPermissions: Record<string, string[]> = {
    'create_workflow': [
      SCAN_LOGIC_PERMISSIONS.WORKFLOW_CREATE,
      SCAN_LOGIC_PERMISSIONS.ORCHESTRATION_VIEW
    ],
    'execute_scan': [
      SCAN_LOGIC_PERMISSIONS.COORDINATION_EXECUTE,
      SCAN_LOGIC_PERMISSIONS.MONITORING_VIEW
    ],
    'view_analytics': [
      SCAN_LOGIC_PERMISSIONS.ANALYTICS_VIEW
    ],
    'configure_security': [
      SCAN_LOGIC_PERMISSIONS.SECURITY_CONFIGURE,
      SCAN_LOGIC_PERMISSIONS.SECURITY_ADMIN
    ],
    'optimize_performance': [
      SCAN_LOGIC_PERMISSIONS.PERFORMANCE_OPTIMIZE,
      SCAN_LOGIC_PERMISSIONS.PERFORMANCE_CONFIGURE
    ]
  };
  
  return operationPermissions[operationType] || [];
}

export default {
  SCAN_LOGIC_PERMISSIONS,
  SCAN_LOGIC_RESOURCES,
  SCAN_LOGIC_ROLES,
  checkScanPermission,
  checkScanPermissions,
  hasScanRole,
  isScanAdmin,
  canManageScanWorkflows,
  canViewScanAnalytics,
  canPerformSecurityOperations,
  checkWorkflowPermission,
  checkDashboardPermission,
  checkScanExecutionPermission,
  getUserScanPermissions,
  canAccessScanComponent,
  validateScanPermission,
  getRequiredScanPermissions
};