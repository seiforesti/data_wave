from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.db_session import get_session, get_db
from app.services.auth_service import get_user_by_email, get_session_by_token
from app.services.rbac_service import get_user_effective_permissions_rbac

# ===============================================================================
# COMPREHENSIVE PERMISSION CONSTANTS FOR 6 DATA GOVERNANCE GROUPS
# ===============================================================================

# === DATA SOURCES PERMISSIONS ===
PERMISSION_DATASOURCE_VIEW = "datasource.view"
PERMISSION_DATASOURCE_CREATE = "datasource.create"
PERMISSION_DATASOURCE_EDIT = "datasource.edit"
PERMISSION_DATASOURCE_DELETE = "datasource.delete"
PERMISSION_DATASOURCE_CONNECT = "datasource.connect"
PERMISSION_DATASOURCE_SCHEDULE = "datasource.schedule"
PERMISSION_DATASOURCE_MONITOR = "datasource.monitor"
PERMISSION_DATASOURCE_BACKUP = "datasource.backup"
PERMISSION_DATASOURCE_RESTORE = "datasource.restore"
PERMISSION_DATASOURCE_EXPORT = "datasource.export"
PERMISSION_DATASOURCE_IMPORT = "datasource.import"
PERMISSION_DATASOURCE_DISCOVERY = "datasource.discovery"
PERMISSION_DATASOURCE_QUALITY = "datasource.quality"
PERMISSION_DATASOURCE_LINEAGE = "datasource.lineage"
PERMISSION_DATASOURCE_SECURITY = "datasource.security"

# === ADVANCED CATALOG PERMISSIONS ===
PERMISSION_CATALOG_VIEW = "catalog.view"
PERMISSION_CATALOG_CREATE = "catalog.create"
PERMISSION_CATALOG_EDIT = "catalog.edit"
PERMISSION_CATALOG_DELETE = "catalog.delete"
PERMISSION_CATALOG_PUBLISH = "catalog.publish"
PERMISSION_CATALOG_APPROVE = "catalog.approve"
PERMISSION_CATALOG_DISCOVER = "catalog.discover"
PERMISSION_CATALOG_SEARCH = "catalog.search"
PERMISSION_CATALOG_EXPORT = "catalog.export"
PERMISSION_CATALOG_IMPORT = "catalog.import"
PERMISSION_CATALOG_ANALYTICS = "catalog.analytics"
PERMISSION_CATALOG_LINEAGE = "catalog.lineage"
PERMISSION_CATALOG_QUALITY = "catalog.quality"
PERMISSION_CATALOG_COLLABORATION = "catalog.collaboration"
PERMISSION_CATALOG_GOVERNANCE = "catalog.governance"

# === CLASSIFICATIONS PERMISSIONS ===
PERMISSION_CLASSIFICATION_VIEW = "classification.view"
PERMISSION_CLASSIFICATION_CREATE = "classification.create"
PERMISSION_CLASSIFICATION_EDIT = "classification.edit"
PERMISSION_CLASSIFICATION_DELETE = "classification.delete"
PERMISSION_CLASSIFICATION_APPLY = "classification.apply"
PERMISSION_CLASSIFICATION_REMOVE = "classification.remove"
PERMISSION_CLASSIFICATION_AUTOMATE = "classification.automate"
PERMISSION_CLASSIFICATION_ML_TRAIN = "classification.ml.train"
PERMISSION_CLASSIFICATION_AI_ENHANCE = "classification.ai.enhance"
PERMISSION_CLASSIFICATION_EXPORT = "classification.export"
PERMISSION_CLASSIFICATION_IMPORT = "classification.import"
PERMISSION_CLASSIFICATION_ANALYTICS = "classification.analytics"
PERMISSION_CLASSIFICATION_AUDIT = "classification.audit"

# === COMPLIANCE RULE PERMISSIONS ===
PERMISSION_COMPLIANCE_VIEW = "compliance.view"
PERMISSION_COMPLIANCE_CREATE = "compliance.create"
PERMISSION_COMPLIANCE_EDIT = "compliance.edit"
PERMISSION_COMPLIANCE_DELETE = "compliance.delete"
PERMISSION_COMPLIANCE_EXECUTE = "compliance.execute"
PERMISSION_COMPLIANCE_SCHEDULE = "compliance.schedule"
PERMISSION_COMPLIANCE_MONITOR = "compliance.monitor"
PERMISSION_COMPLIANCE_REPORT = "compliance.report"
PERMISSION_COMPLIANCE_AUDIT = "compliance.audit"
PERMISSION_COMPLIANCE_REMEDIATE = "compliance.remediate"
PERMISSION_COMPLIANCE_FRAMEWORK = "compliance.framework"
PERMISSION_COMPLIANCE_RISK = "compliance.risk"
PERMISSION_COMPLIANCE_WORKFLOW = "compliance.workflow"
PERMISSION_COMPLIANCE_EXPORT = "compliance.export"

# === SCAN RULE SETS PERMISSIONS ===
PERMISSION_SCAN_RULESET_VIEW = "scan.ruleset.view"
PERMISSION_SCAN_RULESET_CREATE = "scan.ruleset.create"
PERMISSION_SCAN_RULESET_EDIT = "scan.ruleset.edit"
PERMISSION_SCAN_RULESET_DELETE = "scan.ruleset.delete"
PERMISSION_SCAN_RULESET_EXECUTE = "scan.ruleset.execute"
PERMISSION_SCAN_RULESET_SCHEDULE = "scan.ruleset.schedule"
PERMISSION_SCAN_RULESET_CLONE = "scan.ruleset.clone"
PERMISSION_SCAN_RULESET_SHARE = "scan.ruleset.share"
PERMISSION_SCAN_RULESET_MARKETPLACE = "scan.ruleset.marketplace"
PERMISSION_SCAN_RULESET_VALIDATION = "scan.ruleset.validation"
PERMISSION_SCAN_RULESET_OPTIMIZATION = "scan.ruleset.optimization"
PERMISSION_SCAN_RULESET_ANALYTICS = "scan.ruleset.analytics"
PERMISSION_SCAN_RULESET_EXPORT = "scan.ruleset.export"

# === SCAN LOGIC PERMISSIONS ===
PERMISSION_SCAN_VIEW = "scan.view"
PERMISSION_SCAN_CREATE = "scan.create"
PERMISSION_SCAN_EDIT = "scan.edit"
PERMISSION_SCAN_DELETE = "scan.delete"
PERMISSION_SCAN_EXECUTE = "scan.execute"
PERMISSION_SCAN_PAUSE = "scan.pause"
PERMISSION_SCAN_RESUME = "scan.resume"
PERMISSION_SCAN_CANCEL = "scan.cancel"
PERMISSION_SCAN_SCHEDULE = "scan.schedule"
PERMISSION_SCAN_MONITOR = "scan.monitor"
PERMISSION_SCAN_RESULTS = "scan.results"
PERMISSION_SCAN_ANALYTICS = "scan.analytics"
PERMISSION_SCAN_ORCHESTRATION = "scan.orchestration"
PERMISSION_SCAN_INTELLIGENCE = "scan.intelligence"
PERMISSION_SCAN_PERFORMANCE = "scan.performance"

# === SHARED GOVERNANCE PERMISSIONS ===
PERMISSION_WORKFLOW_VIEW = "workflow.view"
PERMISSION_WORKFLOW_MANAGE = "workflow.manage"
PERMISSION_WORKFLOW_CREATE = "workflow.create"
PERMISSION_WORKFLOW_EXECUTE = "workflow.execute"
PERMISSION_COLLABORATION_VIEW = "collaboration.view"
PERMISSION_COLLABORATION_MANAGE = "collaboration.manage"
PERMISSION_WORKSPACE_CREATE = "workspace.create"
PERMISSION_WORKSPACE_EDIT = "workspace.edit"
PERMISSION_ANALYTICS_VIEW = "analytics.view"
PERMISSION_ANALYTICS_MANAGE = "analytics.manage"
PERMISSION_PERFORMANCE_VIEW = "performance.view"
PERMISSION_PERFORMANCE_MANAGE = "performance.manage"
PERMISSION_ALERTS_VIEW = "alerts.view"
PERMISSION_ALERTS_MANAGE = "alerts.manage"
PERMISSION_SECURITY_VIEW = "security.view"
PERMISSION_SECURITY_MANAGE = "security.manage"
PERMISSION_AUDIT_VIEW = "audit.view"
PERMISSION_AUDIT_MANAGE = "audit.manage"

# === LEGACY PERMISSIONS (For backward compatibility) ===
PERMISSION_DASHBOARD_VIEW = "dashboard.view"
PERMISSION_DASHBOARD_EXPORT = "dashboard.export"
PERMISSION_LINEAGE_VIEW = "lineage.view"
PERMISSION_LINEAGE_EXPORT = "lineage.export"
PERMISSION_DATA_PROFILING_VIEW = "data_profiling.view"
PERMISSION_DATA_PROFILING_RUN = "data_profiling.run"
PERMISSION_CUSTOM_SCAN_RULES_VIEW = "custom_scan_rules.view"
PERMISSION_CUSTOM_SCAN_RULES_CREATE = "custom_scan_rules.create"
PERMISSION_CUSTOM_SCAN_RULES_EDIT = "custom_scan_rules.edit"
PERMISSION_CUSTOM_SCAN_RULES_DELETE = "custom_scan_rules.delete"
PERMISSION_INCREMENTAL_SCAN_VIEW = "incremental_scan.view"
PERMISSION_INCREMENTAL_SCAN_RUN = "incremental_scan.run"
PERMISSION_INCREMENTAL_SCAN_CREATE = "incremental_scan.create"

# ===============================================================================
# COMPREHENSIVE ROLE PERMISSIONS MAPPING
# ===============================================================================

ROLE_PERMISSIONS = {
    "admin": [
        # Data Sources - Full access
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CREATE, PERMISSION_DATASOURCE_EDIT, 
        PERMISSION_DATASOURCE_DELETE, PERMISSION_DATASOURCE_CONNECT, PERMISSION_DATASOURCE_SCHEDULE,
        PERMISSION_DATASOURCE_MONITOR, PERMISSION_DATASOURCE_BACKUP, PERMISSION_DATASOURCE_RESTORE,
        PERMISSION_DATASOURCE_EXPORT, PERMISSION_DATASOURCE_IMPORT, PERMISSION_DATASOURCE_DISCOVERY,
        PERMISSION_DATASOURCE_QUALITY, PERMISSION_DATASOURCE_LINEAGE, PERMISSION_DATASOURCE_SECURITY,
        
        # Catalog - Full access
        PERMISSION_CATALOG_VIEW, PERMISSION_CATALOG_CREATE, PERMISSION_CATALOG_EDIT, PERMISSION_CATALOG_DELETE,
        PERMISSION_CATALOG_PUBLISH, PERMISSION_CATALOG_APPROVE, PERMISSION_CATALOG_DISCOVER, PERMISSION_CATALOG_SEARCH,
        PERMISSION_CATALOG_EXPORT, PERMISSION_CATALOG_IMPORT, PERMISSION_CATALOG_ANALYTICS, PERMISSION_CATALOG_LINEAGE,
        PERMISSION_CATALOG_QUALITY, PERMISSION_CATALOG_COLLABORATION, PERMISSION_CATALOG_GOVERNANCE,
        
        # Classifications - Full access
        PERMISSION_CLASSIFICATION_VIEW, PERMISSION_CLASSIFICATION_CREATE, PERMISSION_CLASSIFICATION_EDIT,
        PERMISSION_CLASSIFICATION_DELETE, PERMISSION_CLASSIFICATION_APPLY, PERMISSION_CLASSIFICATION_REMOVE,
        PERMISSION_CLASSIFICATION_AUTOMATE, PERMISSION_CLASSIFICATION_ML_TRAIN, PERMISSION_CLASSIFICATION_AI_ENHANCE,
        PERMISSION_CLASSIFICATION_EXPORT, PERMISSION_CLASSIFICATION_IMPORT, PERMISSION_CLASSIFICATION_ANALYTICS,
        PERMISSION_CLASSIFICATION_AUDIT,
        
        # Compliance - Full access
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_CREATE, PERMISSION_COMPLIANCE_EDIT, PERMISSION_COMPLIANCE_DELETE,
        PERMISSION_COMPLIANCE_EXECUTE, PERMISSION_COMPLIANCE_SCHEDULE, PERMISSION_COMPLIANCE_MONITOR, PERMISSION_COMPLIANCE_REPORT,
        PERMISSION_COMPLIANCE_AUDIT, PERMISSION_COMPLIANCE_REMEDIATE, PERMISSION_COMPLIANCE_FRAMEWORK, PERMISSION_COMPLIANCE_RISK,
        PERMISSION_COMPLIANCE_WORKFLOW, PERMISSION_COMPLIANCE_EXPORT,
        
        # Scan Rule Sets - Full access
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_CREATE, PERMISSION_SCAN_RULESET_EDIT, PERMISSION_SCAN_RULESET_DELETE,
        PERMISSION_SCAN_RULESET_EXECUTE, PERMISSION_SCAN_RULESET_SCHEDULE, PERMISSION_SCAN_RULESET_CLONE, PERMISSION_SCAN_RULESET_SHARE,
        PERMISSION_SCAN_RULESET_MARKETPLACE, PERMISSION_SCAN_RULESET_VALIDATION, PERMISSION_SCAN_RULESET_OPTIMIZATION,
        PERMISSION_SCAN_RULESET_ANALYTICS, PERMISSION_SCAN_RULESET_EXPORT,
        
        # Scan Logic - Full access
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE,
        PERMISSION_SCAN_EXECUTE, PERMISSION_SCAN_PAUSE, PERMISSION_SCAN_RESUME, PERMISSION_SCAN_CANCEL,
        PERMISSION_SCAN_SCHEDULE, PERMISSION_SCAN_MONITOR, PERMISSION_SCAN_RESULTS, PERMISSION_SCAN_ANALYTICS,
        PERMISSION_SCAN_ORCHESTRATION, PERMISSION_SCAN_INTELLIGENCE, PERMISSION_SCAN_PERFORMANCE,
        
        # Shared Governance - Full access
        PERMISSION_WORKFLOW_VIEW, PERMISSION_WORKFLOW_MANAGE, PERMISSION_WORKFLOW_CREATE, PERMISSION_WORKFLOW_EXECUTE,
        PERMISSION_COLLABORATION_VIEW, PERMISSION_COLLABORATION_MANAGE, PERMISSION_WORKSPACE_CREATE, PERMISSION_WORKSPACE_EDIT,
        PERMISSION_ANALYTICS_VIEW, PERMISSION_ANALYTICS_MANAGE, PERMISSION_PERFORMANCE_VIEW, PERMISSION_PERFORMANCE_MANAGE,
        PERMISSION_ALERTS_VIEW, PERMISSION_ALERTS_MANAGE, PERMISSION_SECURITY_VIEW, PERMISSION_SECURITY_MANAGE,
        PERMISSION_AUDIT_VIEW, PERMISSION_AUDIT_MANAGE,
        
        # Legacy permissions
        PERMISSION_DASHBOARD_VIEW, PERMISSION_DASHBOARD_EXPORT, PERMISSION_LINEAGE_VIEW, PERMISSION_LINEAGE_EXPORT,
        PERMISSION_DATA_PROFILING_VIEW, PERMISSION_DATA_PROFILING_RUN, PERMISSION_CUSTOM_SCAN_RULES_VIEW,
        PERMISSION_CUSTOM_SCAN_RULES_CREATE, PERMISSION_CUSTOM_SCAN_RULES_EDIT, PERMISSION_CUSTOM_SCAN_RULES_DELETE,
        PERMISSION_INCREMENTAL_SCAN_VIEW, PERMISSION_INCREMENTAL_SCAN_RUN, PERMISSION_INCREMENTAL_SCAN_CREATE
    ],
    
    "data_steward": [
        # Data Sources - Create, Edit, Monitor
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CREATE, PERMISSION_DATASOURCE_EDIT,
        PERMISSION_DATASOURCE_CONNECT, PERMISSION_DATASOURCE_SCHEDULE, PERMISSION_DATASOURCE_MONITOR,
        PERMISSION_DATASOURCE_DISCOVERY, PERMISSION_DATASOURCE_QUALITY, PERMISSION_DATASOURCE_LINEAGE,
        
        # Catalog - Create, Edit, Publish
        PERMISSION_CATALOG_VIEW, PERMISSION_CATALOG_CREATE, PERMISSION_CATALOG_EDIT, PERMISSION_CATALOG_PUBLISH,
        PERMISSION_CATALOG_DISCOVER, PERMISSION_CATALOG_SEARCH, PERMISSION_CATALOG_ANALYTICS, PERMISSION_CATALOG_LINEAGE,
        PERMISSION_CATALOG_QUALITY, PERMISSION_CATALOG_COLLABORATION,
        
        # Classifications - Apply, Create patterns
        PERMISSION_CLASSIFICATION_VIEW, PERMISSION_CLASSIFICATION_CREATE, PERMISSION_CLASSIFICATION_APPLY,
        PERMISSION_CLASSIFICATION_AUTOMATE, PERMISSION_CLASSIFICATION_ANALYTICS,
        
        # Compliance - Execute, Monitor, Report
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_EXECUTE, PERMISSION_COMPLIANCE_MONITOR,
        PERMISSION_COMPLIANCE_REPORT, PERMISSION_COMPLIANCE_WORKFLOW,
        
        # Scan Rule Sets - Create, Execute, Share
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_CREATE, PERMISSION_SCAN_RULESET_EXECUTE,
        PERMISSION_SCAN_RULESET_SHARE, PERMISSION_SCAN_RULESET_ANALYTICS,
        
        # Scan Logic - Execute, Monitor
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, PERMISSION_SCAN_EXECUTE, PERMISSION_SCAN_MONITOR,
        PERMISSION_SCAN_RESULTS, PERMISSION_SCAN_ANALYTICS,
        
        # Shared Governance - Limited management
        PERMISSION_WORKFLOW_VIEW, PERMISSION_WORKFLOW_CREATE, PERMISSION_WORKFLOW_EXECUTE,
        PERMISSION_COLLABORATION_VIEW, PERMISSION_COLLABORATION_MANAGE, PERMISSION_WORKSPACE_CREATE,
        PERMISSION_ANALYTICS_VIEW, PERMISSION_PERFORMANCE_VIEW, PERMISSION_ALERTS_VIEW,
        PERMISSION_SECURITY_VIEW, PERMISSION_AUDIT_VIEW
    ],
    
    "data_analyst": [
        # Data Sources - View, Connect for analysis
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CONNECT, PERMISSION_DATASOURCE_DISCOVERY,
        PERMISSION_DATASOURCE_QUALITY, PERMISSION_DATASOURCE_LINEAGE,
        
        # Catalog - Search, Discover, Analytics
        PERMISSION_CATALOG_VIEW, PERMISSION_CATALOG_DISCOVER, PERMISSION_CATALOG_SEARCH,
        PERMISSION_CATALOG_ANALYTICS, PERMISSION_CATALOG_LINEAGE, PERMISSION_CATALOG_QUALITY,
        PERMISSION_CATALOG_COLLABORATION,
        
        # Classifications - View, Analytics
        PERMISSION_CLASSIFICATION_VIEW, PERMISSION_CLASSIFICATION_ANALYTICS,
        
        # Compliance - View, Report
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_REPORT,
        
        # Scan Rule Sets - View, Analytics
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_ANALYTICS,
        
        # Scan Logic - View, Results
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_RESULTS, PERMISSION_SCAN_ANALYTICS,
        
        # Shared Governance - View only
        PERMISSION_WORKFLOW_VIEW, PERMISSION_COLLABORATION_VIEW, PERMISSION_ANALYTICS_VIEW,
        PERMISSION_PERFORMANCE_VIEW, PERMISSION_ALERTS_VIEW, PERMISSION_SECURITY_VIEW, PERMISSION_AUDIT_VIEW
    ],
    
    "viewer": [
        # Data Sources - View only
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_DISCOVERY, PERMISSION_DATASOURCE_LINEAGE,
        
        # Catalog - View, Search
        PERMISSION_CATALOG_VIEW, PERMISSION_CATALOG_DISCOVER, PERMISSION_CATALOG_SEARCH, PERMISSION_CATALOG_LINEAGE,
        
        # Classifications - View only
        PERMISSION_CLASSIFICATION_VIEW,
        
        # Compliance - View only
        PERMISSION_COMPLIANCE_VIEW,
        
        # Scan Rule Sets - View only
        PERMISSION_SCAN_RULESET_VIEW,
        
        # Scan Logic - View only
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_RESULTS,
        
        # Shared Governance - View only
        PERMISSION_WORKFLOW_VIEW, PERMISSION_COLLABORATION_VIEW, PERMISSION_ANALYTICS_VIEW,
        PERMISSION_PERFORMANCE_VIEW, PERMISSION_SECURITY_VIEW
    ],
    
    "compliance_officer": [
        # Data Sources - Monitor compliance
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_MONITOR, PERMISSION_DATASOURCE_SECURITY,
        
        # Catalog - Governance focus
        PERMISSION_CATALOG_VIEW, PERMISSION_CATALOG_GOVERNANCE, PERMISSION_CATALOG_SEARCH,
        
        # Classifications - Full compliance focus
        PERMISSION_CLASSIFICATION_VIEW, PERMISSION_CLASSIFICATION_APPLY, PERMISSION_CLASSIFICATION_AUDIT,
        PERMISSION_CLASSIFICATION_ANALYTICS,
        
        # Compliance - Full access
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_CREATE, PERMISSION_COMPLIANCE_EDIT, PERMISSION_COMPLIANCE_DELETE,
        PERMISSION_COMPLIANCE_EXECUTE, PERMISSION_COMPLIANCE_SCHEDULE, PERMISSION_COMPLIANCE_MONITOR, PERMISSION_COMPLIANCE_REPORT,
        PERMISSION_COMPLIANCE_AUDIT, PERMISSION_COMPLIANCE_REMEDIATE, PERMISSION_COMPLIANCE_FRAMEWORK, PERMISSION_COMPLIANCE_RISK,
        PERMISSION_COMPLIANCE_WORKFLOW, PERMISSION_COMPLIANCE_EXPORT,
        
        # Scan Rule Sets - Compliance focused
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_CREATE, PERMISSION_SCAN_RULESET_EXECUTE,
        PERMISSION_SCAN_RULESET_VALIDATION, PERMISSION_SCAN_RULESET_ANALYTICS,
        
        # Scan Logic - Compliance monitoring
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EXECUTE, PERMISSION_SCAN_MONITOR, PERMISSION_SCAN_RESULTS,
        
        # Shared Governance - Audit focus
        PERMISSION_WORKFLOW_VIEW, PERMISSION_ANALYTICS_VIEW, PERMISSION_AUDIT_VIEW, PERMISSION_AUDIT_MANAGE,
        PERMISSION_SECURITY_VIEW, PERMISSION_SECURITY_MANAGE
    ]
}

def get_current_user(session_token: str = Cookie(None), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get the current user from the session token."""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_session = get_session_by_token(db, session_token)
    if not user_session or not user_session.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = user_session.user
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "department": getattr(user, "department", None),
        "region": getattr(user, "region", None)
    }

def check_permission(permission: str, current_user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)) -> bool:
    """Check if the current user has the specified permission."""
    # For simple role-based permissions
    if current_user.get("role") in ROLE_PERMISSIONS:
        if permission in ROLE_PERMISSIONS[current_user["role"]]:
            return True
    
    # For more complex RBAC with conditions
    user_id = current_user.get("id")
    if user_id:
        effective_permissions = get_user_effective_permissions_rbac(db, user_id)
        for perm in effective_permissions:
            if perm["action"] == permission and perm["is_effective"]:
                return True
    
    return False

def require_permission(permission: str):
    """Dependency factory to require a specific permission."""
    def dependency(current_user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
        has_permission = check_permission(permission, current_user, db)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to perform this action. Required permission: {permission}"
            )
        return current_user
    return dependency

# ===============================================================================
# CONVENIENCE PERMISSION DECORATORS FOR 6 GROUPS
# ===============================================================================

def require_datasource_permission(action: str):
    """Require specific data source permission"""
    return require_permission(f"datasource.{action}")

def require_catalog_permission(action: str):
    """Require specific catalog permission"""
    return require_permission(f"catalog.{action}")

def require_classification_permission(action: str):
    """Require specific classification permission"""
    return require_permission(f"classification.{action}")

def require_compliance_permission(action: str):
    """Require specific compliance permission"""
    return require_permission(f"compliance.{action}")

def require_scan_ruleset_permission(action: str):
    """Require specific scan ruleset permission"""
    return require_permission(f"scan.ruleset.{action}")

def require_scan_permission(action: str):
    """Require specific scan logic permission"""
    return require_permission(f"scan.{action}")

# ===============================================================================
# GROUP PERMISSION CHECKS
# ===============================================================================

def has_group_access(group: str, action: str, current_user: Dict[str, Any], db: Session) -> bool:
    """Check if user has access to a specific group and action"""
    permission = f"{group}.{action}"
    return check_permission(permission, current_user, db)

def get_user_group_permissions(current_user: Dict[str, Any], db: Session) -> Dict[str, List[str]]:
    """Get all permissions organized by group for the current user"""
    user_role = current_user.get("role", "viewer")
    permissions = ROLE_PERMISSIONS.get(user_role, [])
    
    groups = {
        "datasource": [],
        "catalog": [],
        "classification": [],
        "compliance": [],
        "scan_ruleset": [],
        "scan": [],
        "workflow": [],
        "collaboration": [],
        "analytics": [],
        "security": [],
        "audit": []
    }
    
    for perm in permissions:
        if "." in perm:
            group, action = perm.split(".", 1)
            if group in groups:
                groups[group].append(action)
    
    return groups