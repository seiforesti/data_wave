/**
 * 🔐 Scan Logic RBAC Hook - User Context & Permissions
 * =====================================================
 * 
 * React hook that provides complete RBAC integration for Advanced Scan Logic
 * components, including user context, permission checking, and real-time
 * authorization updates.
 * 
 * Features:
 * - Current user context with scan logic permissions
 * - Real-time permission validation
 * - Component-level access control
 * - Role-based UI adaptation
 * - Performance-optimized permission caching
 * - Comprehensive audit logging
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  checkScanPermission,
  checkScanPermissions,
  canAccessScanComponent,
  getUserScanPermissions,
  isScanAdmin,
  canManageScanWorkflows,
  canViewScanAnalytics,
  canPerformSecurityOperations,
  SCAN_LOGIC_PERMISSIONS,
  SCAN_LOGIC_RESOURCES,
  SCAN_LOGIC_ROLES
} from '../utils/rbac-integration';

import type { 
  User, 
  Permission, 
  PermissionCheck 
} from '../../Advanced_RBAC_Datagovernance_System/types/user.types';

// ============================================================================
// TYPES
// ============================================================================

export interface ScanLogicUserContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  roles: string[];
  capabilities: {
    canViewAnalytics: boolean;
    canManageWorkflows: boolean;
    canPerformSecurity: boolean;
    isAdmin: boolean;
  };
  error: string | null;
}

export interface ScanLogicRBACState {
  userContext: ScanLogicUserContext;
  permissionCache: Map<string, { result: boolean; timestamp: number }>;
  componentAccess: Map<string, boolean>;
  isInitialized: boolean;
}

export interface PermissionHookOptions {
  enableCache?: boolean;
  cacheTimeout?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
  auditPermissionChecks?: boolean;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useScanLogicRBAC(options: PermissionHookOptions = {}) {
  const {
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    enableRealTimeUpdates = true,
    auditPermissionChecks = true
  } = options;

  const { toast } = useToast();
  const permissionCacheRef = useRef(new Map());
  const componentAccessCacheRef = useRef(new Map());

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<ScanLogicRBACState>({
    userContext: {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      permissions: [],
      roles: [],
      capabilities: {
        canViewAnalytics: false,
        canManageWorkflows: false,
        canPerformSecurity: false,
        isAdmin: false
      },
      error: null
    },
    permissionCache: new Map(),
    componentAccess: new Map(),
    isInitialized: false
  });

  // ============================================================================
  // USER CONTEXT INITIALIZATION
  // ============================================================================

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      return userData.user || userData;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }, []);

  const initializeUserContext = useCallback(async () => {
    setState(prev => ({
      ...prev,
      userContext: { ...prev.userContext, isLoading: true, error: null }
    }));

    try {
      const user = await getCurrentUser();
      
      if (!user) {
        setState(prev => ({
          ...prev,
          userContext: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            permissions: [],
            roles: [],
            capabilities: {
              canViewAnalytics: false,
              canManageWorkflows: false,
              canPerformSecurity: false,
              isAdmin: false
            },
            error: null
          },
          isInitialized: true
        }));
        return;
      }

      // Get user's scan logic permissions
      const scanPermissions = await getUserScanPermissions(user.id);
      
      // Get user roles
      const userRoles = user.roles?.map(role => role.name) || [user.role].filter(Boolean);

      // Check capabilities
      const [canViewAnalytics, canManageWorkflows, canPerformSecurity, isAdmin] = await Promise.all([
        canViewScanAnalytics(user.id),
        canManageScanWorkflows(user.id),
        canPerformSecurityOperations(user.id),
        isScanAdmin(user.id)
      ]);

      setState(prev => ({
        ...prev,
        userContext: {
          user,
          isAuthenticated: true,
          isLoading: false,
          permissions: scanPermissions,
          roles: userRoles,
          capabilities: {
            canViewAnalytics,
            canManageWorkflows,
            canPerformSecurity,
            isAdmin
          },
          error: null
        },
        isInitialized: true
      }));

    } catch (error) {
      console.error('Failed to initialize user context:', error);
      setState(prev => ({
        ...prev,
        userContext: {
          ...prev.userContext,
          isLoading: false,
          error: 'Failed to initialize user context'
        },
        isInitialized: true
      }));
    }
  }, [getCurrentUser]);

  // ============================================================================
  // PERMISSION CHECKING UTILITIES
  // ============================================================================

  const hasPermission = useCallback(async (
    action: string,
    resource: string,
    conditions?: Record<string, any>
  ): Promise<boolean> => {
    if (!state.userContext.user) {
      return false;
    }

    const cacheKey = `${action}:${resource}:${JSON.stringify(conditions || {})}`;
    
    // Check cache first if enabled
    if (enableCache) {
      const cached = permissionCacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        return cached.result;
      }
    }

    try {
      const result = await checkScanPermission(
        state.userContext.user.id,
        action,
        resource,
        conditions
      );

      // Cache the result
      if (enableCache) {
        permissionCacheRef.current.set(cacheKey, {
          result: result.allowed,
          timestamp: Date.now()
        });
      }

      return result.allowed;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, [state.userContext.user, enableCache, cacheTimeout]);

  const hasAnyPermission = useCallback(async (
    permissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
  ): Promise<boolean> => {
    if (!state.userContext.user) {
      return false;
    }

    try {
      const results = await checkScanPermissions(state.userContext.user.id, permissions);
      return results.some(result => result.allowed);
    } catch (error) {
      console.error('Bulk permission check failed:', error);
      return false;
    }
  }, [state.userContext.user]);

  const hasAllPermissions = useCallback(async (
    permissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
  ): Promise<boolean> => {
    if (!state.userContext.user) {
      return false;
    }

    try {
      const results = await checkScanPermissions(state.userContext.user.id, permissions);
      return results.every(result => result.allowed);
    } catch (error) {
      console.error('Bulk permission check failed:', error);
      return false;
    }
  }, [state.userContext.user]);

  // ============================================================================
  // COMPONENT ACCESS UTILITIES
  // ============================================================================

  const canAccessComponent = useCallback(async (
    componentType: string,
    componentId?: string
  ): Promise<boolean> => {
    if (!state.userContext.user) {
      return false;
    }

    const cacheKey = `component:${componentType}:${componentId || 'default'}`;
    
    // Check cache first
    if (enableCache) {
      const cached = componentAccessCacheRef.current.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    try {
      const canAccess = await canAccessScanComponent(
        state.userContext.user.id,
        componentType,
        componentId
      );

      // Cache the result
      if (enableCache) {
        componentAccessCacheRef.current.set(cacheKey, canAccess);
      }

      return canAccess;
    } catch (error) {
      console.error('Component access check failed:', error);
      return false;
    }
  }, [state.userContext.user, enableCache]);

  // ============================================================================
  // ROLE-BASED UTILITIES
  // ============================================================================

  const hasRole = useCallback((roleName: string): boolean => {
    return state.userContext.roles.includes(roleName);
  }, [state.userContext.roles]);

  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(role => state.userContext.roles.includes(role));
  }, [state.userContext.roles]);

  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    return roleNames.every(role => state.userContext.roles.includes(role));
  }, [state.userContext.roles]);

  // ============================================================================
  // CONVENIENCE PERMISSION CHECKS
  // ============================================================================

  const canCreateWorkflow = useCallback(async (): Promise<boolean> => {
    return await hasPermission(
      SCAN_LOGIC_PERMISSIONS.WORKFLOW_CREATE,
      SCAN_LOGIC_RESOURCES.WORKFLOW_TEMPLATE
    );
  }, [hasPermission]);

  const canExecuteScan = useCallback(async (): Promise<boolean> => {
    return await hasPermission(
      SCAN_LOGIC_PERMISSIONS.COORDINATION_EXECUTE,
      SCAN_LOGIC_RESOURCES.COORDINATION_EXECUTION
    );
  }, [hasPermission]);

  const canViewDashboard = useCallback(async (dashboardId?: string): Promise<boolean> => {
    const resource = dashboardId 
      ? `${SCAN_LOGIC_RESOURCES.ANALYTICS_DASHBOARD}.${dashboardId}`
      : SCAN_LOGIC_RESOURCES.ANALYTICS_DASHBOARD;
    
    return await hasPermission(
      SCAN_LOGIC_PERMISSIONS.ANALYTICS_VIEW,
      resource
    );
  }, [hasPermission]);

  const canManageSecurityPolicies = useCallback(async (): Promise<boolean> => {
    return await hasPermission(
      SCAN_LOGIC_PERMISSIONS.SECURITY_CONFIGURE,
      SCAN_LOGIC_RESOURCES.SECURITY_POLICY
    );
  }, [hasPermission]);

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  const clearPermissionCache = useCallback(() => {
    permissionCacheRef.current.clear();
    componentAccessCacheRef.current.clear();
  }, []);

  const refreshPermissions = useCallback(async () => {
    clearPermissionCache();
    await initializeUserContext();
  }, [clearPermissionCache, initializeUserContext]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const handlePermissionError = useCallback((error: any, operation: string) => {
    console.error(`Permission error in ${operation}:`, error);
    
    if (auditPermissionChecks) {
      toast({
        title: "Permission Check Failed",
        description: `Failed to verify permissions for ${operation}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [toast, auditPermissionChecks]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize user context on mount
  useEffect(() => {
    initializeUserContext();
  }, [initializeUserContext]);

  // Set up real-time updates if enabled
  useEffect(() => {
    if (!enableRealTimeUpdates || !state.userContext.isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      // Clear cache periodically to ensure fresh permissions
      if (enableCache) {
        const now = Date.now();
        for (const [key, value] of permissionCacheRef.current.entries()) {
          if (now - value.timestamp > cacheTimeout) {
            permissionCacheRef.current.delete(key);
          }
        }
      }
    }, cacheTimeout);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, state.userContext.isAuthenticated, enableCache, cacheTimeout]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const rbacContext = useMemo(() => ({
    // User context
    user: state.userContext.user,
    isAuthenticated: state.userContext.isAuthenticated,
    isLoading: state.userContext.isLoading,
    permissions: state.userContext.permissions,
    roles: state.userContext.roles,
    capabilities: state.userContext.capabilities,
    error: state.userContext.error,
    isInitialized: state.isInitialized,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Component access
    canAccessComponent,
    
    // Role checking
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Convenience checks
    canCreateWorkflow,
    canExecuteScan,
    canViewDashboard,
    canManageSecurityPolicies,
    
    // Utility functions
    clearPermissionCache,
    refreshPermissions,
    
    // Constants
    PERMISSIONS: SCAN_LOGIC_PERMISSIONS,
    RESOURCES: SCAN_LOGIC_RESOURCES,
    ROLES: SCAN_LOGIC_ROLES
  }), [
    state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessComponent,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canCreateWorkflow,
    canExecuteScan,
    canViewDashboard,
    canManageSecurityPolicies,
    clearPermissionCache,
    refreshPermissions
  ]);

  return rbacContext;
}

// ============================================================================
// PERMISSION GUARD COMPONENT
// ============================================================================

export interface PermissionGuardProps {
  permission?: string;
  resource?: string;
  role?: string;
  anyRoles?: string[];
  allRoles?: string[];
  componentType?: string;
  componentId?: string;
  fallback?: React.ReactNode;
  unauthorized?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  resource,
  role,
  anyRoles,
  allRoles,
  componentType,
  componentId,
  fallback = null,
  unauthorized = null,
  children
}: PermissionGuardProps) {
  const rbac = useScanLogicRBAC();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!rbac.isInitialized) {
      return;
    }

    const checkAccess = async () => {
      try {
        let hasAccess = true;

        // Check permission
        if (permission && resource) {
          hasAccess = await rbac.hasPermission(permission, resource);
        }

        // Check role
        if (hasAccess && role) {
          hasAccess = rbac.hasRole(role);
        }

        // Check any roles
        if (hasAccess && anyRoles) {
          hasAccess = rbac.hasAnyRole(anyRoles);
        }

        // Check all roles
        if (hasAccess && allRoles) {
          hasAccess = rbac.hasAllRoles(allRoles);
        }

        // Check component access
        if (hasAccess && componentType) {
          hasAccess = await rbac.canAccessComponent(componentType, componentId);
        }

        setCanAccess(hasAccess);
      } catch (error) {
        console.error('Permission guard check failed:', error);
        setCanAccess(false);
      }
    };

    checkAccess();
  }, [rbac, permission, resource, role, anyRoles, allRoles, componentType, componentId]);

  if (!rbac.isInitialized || canAccess === null) {
    return <>{fallback}</>;
  }

  if (!rbac.isAuthenticated) {
    return <>{unauthorized || <div>Please log in to access this content.</div>}</>;
  }

  if (!canAccess) {
    return <>{unauthorized || <div>You don't have permission to access this content.</div>}</>;
  }

  return <>{children}</>;
}

export default useScanLogicRBAC;