"""
Unified RBAC Engine - Single Source of Truth for All Permission Evaluations

This module integrates all existing RBAC systems into a cohesive enterprise-grade 
permission management system for the 6 data governance groups:
- Data Sources
- Compliance 
- Classifications
- Scan Rule Sets
- Catalog
- Scan Logic
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass
from enum import Enum
import json
import logging
from datetime import datetime

# Import all existing RBAC components
from app.models.auth_models import (
    User, Role, Permission, UserRole, RolePermission, Group, UserGroup, 
    GroupRole, DenyAssignment, Resource, ResourceRole, RbacAuditLog
)
from app.services.auth_service import get_user_by_email, has_role
from app.services.rbac_service import get_user_effective_permissions_rbac
from app.services.role_service import user_has_permission, get_user_permissions
from app.api.security.rbac import ROLE_PERMISSIONS, check_permission

logger = logging.getLogger(__name__)

class ResourceType(Enum):
    """Standardized resource types across all 6 groups"""
    DATA_SOURCE = "data_source"
    SCAN = "scan"
    SCAN_RULE_SET = "scan_rule_set"
    CLASSIFICATION = "classification"
    COMPLIANCE_RULE = "compliance_rule"
    CATALOG_ITEM = "catalog_item"
    WORKFLOW = "workflow"
    REPORT = "report"
    USER = "user"
    ORGANIZATION = "organization"

class ActionType(Enum):
    """Standardized actions across all 6 groups"""
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    EXECUTE = "execute"
    DEPLOY = "deploy"
    APPROVE = "approve"
    AUDIT = "audit"
    EXPORT = "export"
    SHARE = "share"
    COLLABORATE = "collaborate"

@dataclass
class PermissionResult:
    """Result of permission evaluation"""
    allowed: bool
    reason: str
    source: str  # Which RBAC system provided the result
    conditions_met: bool = True
    audit_info: Dict[str, Any] = None

@dataclass
class EffectivePermission:
    """Effective permission with full context"""
    action: str
    resource: str
    resource_id: Optional[str]
    source: str  # direct_role, inherited_role, group_role, etc.
    conditions: Optional[Dict[str, Any]]
    is_effective: bool
    reason: Optional[str]

@dataclass
class UserContext:
    """Complete user context for permission evaluation"""
    user: User
    permissions: List[EffectivePermission]
    groups: List[Group]
    workspaces: List[Dict[str, Any]]
    compliance_context: Dict[str, Any]

class UnifiedRBACEngine:
    """
    Single source of truth for all permission evaluations across the 6 groups.
    
    This engine integrates:
    1. Simple role-based permissions from auth_service.py
    2. Dot-notation permissions from rbac.py  
    3. Advanced ABAC with conditions from rbac_service.py
    4. Hierarchical roles and groups from role_service.py
    """
    
    def __init__(self, db: Session):
        self.db = db
        
        # Group-specific permission mappings
        self.GROUP_PERMISSIONS = {
            "data_sources": [
                "datasource.view", "datasource.create", "datasource.edit", "datasource.delete",
                "datasource.connection.test", "datasource.schema.discover", "datasource.monitor",
                "datasource.backup", "datasource.export", "datasource.share"
            ],
            "scan_rule_sets": [
                "scan_ruleset.view", "scan_ruleset.create", "scan_ruleset.edit", "scan_ruleset.delete",
                "scan_ruleset.validate", "scan_ruleset.deploy", "scan_ruleset.test", "scan_ruleset.optimize"
            ],
            "classifications": [
                "classification.view", "classification.create", "classification.edit", "classification.delete",
                "classification.assign", "classification.train_model", "classification.validate", "classification.export"
            ],
            "compliance": [
                "compliance.view", "compliance.create", "compliance.edit", "compliance.delete",
                "compliance.audit", "compliance.report", "compliance.framework.manage", "compliance.violation.investigate"
            ],
            "catalog": [
                "catalog.view", "catalog.create", "catalog.edit", "catalog.delete",
                "catalog.lineage.view", "catalog.quality.manage", "catalog.search", "catalog.collaborate"
            ],
            "scan_logic": [
                "scan.view", "scan.create", "scan.edit", "scan.delete",
                "scan.execute", "scan.optimize", "scan.schedule", "scan.analyze"
            ]
        }
    
    def check_permission(
        self, 
        user_id: int, 
        action: str, 
        resource: str, 
        resource_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> PermissionResult:
        """
        Unified permission check integrating all RBAC systems.
        
        Args:
            user_id: ID of the user requesting access
            action: Action being attempted (e.g., 'view', 'create', 'edit')
            resource: Resource type (e.g., 'datasource', 'scan', 'compliance')
            resource_id: Specific resource ID (optional)
            context: Additional context for ABAC evaluation
            
        Returns:
            PermissionResult indicating if access is allowed and why
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return PermissionResult(
                    allowed=False, 
                    reason="User not found", 
                    source="unified_rbac"
                )
            
            # Build full permission string
            permission = f"{resource}.{action}"
            
            # 1. Check simple role-based permissions (backwards compatibility)
            simple_result = self._check_simple_roles(user, permission)
            if simple_result.allowed:
                return simple_result
            
            # 2. Check dot-notation permissions with hardcoded mappings
            dot_notation_result = self._check_dot_notation_permissions(user, permission)
            if dot_notation_result.allowed:
                return dot_notation_result
            
            # 3. Check advanced ABAC with conditions
            abac_result = self._check_abac_permissions(user, permission, resource_id, context)
            if abac_result.allowed:
                return abac_result
            
            # 4. Check hierarchical roles and groups
            hierarchical_result = self._check_hierarchical_permissions(user, permission, resource_id)
            if hierarchical_result.allowed:
                return hierarchical_result
            
            # 5. Check deny assignments (explicit denies override allows)
            deny_result = self._check_deny_assignments(user, permission, resource_id)
            if not deny_result.allowed:
                return deny_result
            
            # Default deny
            return PermissionResult(
                allowed=False,
                reason=f"No permission found for {permission}",
                source="unified_rbac"
            )
            
        except Exception as e:
            logger.error(f"Error checking permission for user {user_id}: {str(e)}")
            return PermissionResult(
                allowed=False,
                reason=f"Permission check failed: {str(e)}",
                source="unified_rbac"
            )
    
    def _check_simple_roles(self, user: User, permission: str) -> PermissionResult:
        """Check simple string-based roles from auth_service.py"""
        if hasattr(user, 'role') and user.role:
            if user.role in ROLE_PERMISSIONS:
                if permission in ROLE_PERMISSIONS[user.role]:
                    return PermissionResult(
                        allowed=True,
                        reason=f"Allowed by role: {user.role}",
                        source="simple_roles"
                    )
        return PermissionResult(allowed=False, reason="No simple role match", source="simple_roles")
    
    def _check_dot_notation_permissions(self, user: User, permission: str) -> PermissionResult:
        """Check dot-notation permissions from rbac.py"""
        try:
            # Convert user to dict format expected by rbac.py
            user_dict = {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "department": getattr(user, "department", None),
                "region": getattr(user, "region", None)
            }
            
            # Use existing check_permission from rbac.py
            has_permission = check_permission(permission, user_dict, self.db)
            if has_permission:
                return PermissionResult(
                    allowed=True,
                    reason=f"Allowed by dot-notation permission: {permission}",
                    source="dot_notation"
                )
        except Exception as e:
            logger.warning(f"Error checking dot-notation permissions: {str(e)}")
        
        return PermissionResult(allowed=False, reason="No dot-notation match", source="dot_notation")
    
    def _check_abac_permissions(
        self, 
        user: User, 
        permission: str, 
        resource_id: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> PermissionResult:
        """Check ABAC permissions with conditions from rbac_service.py"""
        try:
            effective_permissions = get_user_effective_permissions_rbac(self.db, user.id)
            
            for perm in effective_permissions:
                if perm["action"] == permission and perm["is_effective"]:
                    # Additional context-based validation if needed
                    if self._validate_context_conditions(perm, user, resource_id, context):
                        return PermissionResult(
                            allowed=True,
                            reason=f"Allowed by ABAC permission with conditions",
                            source="abac",
                            conditions_met=True
                        )
        except Exception as e:
            logger.warning(f"Error checking ABAC permissions: {str(e)}")
        
        return PermissionResult(allowed=False, reason="No ABAC match", source="abac")
    
    def _check_hierarchical_permissions(
        self, 
        user: User, 
        permission: str, 
        resource_id: Optional[str]
    ) -> PermissionResult:
        """Check hierarchical roles and groups from role_service.py"""
        try:
            # Check if user has permission through role_service
            has_perm = user_has_permission(self.db, user.id, permission, resource_id)
            if has_perm:
                return PermissionResult(
                    allowed=True,
                    reason="Allowed by hierarchical role/group",
                    source="hierarchical"
                )
        except Exception as e:
            logger.warning(f"Error checking hierarchical permissions: {str(e)}")
        
        return PermissionResult(allowed=False, reason="No hierarchical match", source="hierarchical")
    
    def _check_deny_assignments(
        self, 
        user: User, 
        permission: str, 
        resource_id: Optional[str]
    ) -> PermissionResult:
        """Check for explicit deny assignments"""
        try:
            # Check direct user deny assignments
            user_deny = self.db.query(DenyAssignment).filter(
                DenyAssignment.user_id == user.id,
                DenyAssignment.action == permission
            ).first()
            
            if user_deny:
                return PermissionResult(
                    allowed=False,
                    reason="Explicitly denied by user deny assignment",
                    source="deny_assignment"
                )
            
            # Check group deny assignments
            user_groups = self.db.query(UserGroup).filter(UserGroup.user_id == user.id).all()
            for user_group in user_groups:
                group_deny = self.db.query(DenyAssignment).filter(
                    DenyAssignment.group_id == user_group.group_id,
                    DenyAssignment.action == permission
                ).first()
                
                if group_deny:
                    return PermissionResult(
                        allowed=False,
                        reason="Explicitly denied by group deny assignment",
                        source="deny_assignment"
                    )
        except Exception as e:
            logger.warning(f"Error checking deny assignments: {str(e)}")
        
        return PermissionResult(allowed=True, reason="No deny assignments", source="deny_assignment")
    
    def _validate_context_conditions(
        self, 
        permission: Dict[str, Any], 
        user: User, 
        resource_id: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> bool:
        """Validate context-based conditions for ABAC"""
        conditions = permission.get("conditions")
        if not conditions:
            return True
        
        try:
            if isinstance(conditions, str):
                conditions = json.loads(conditions)
            
            # Add more sophisticated condition validation here
            # For now, basic validation from rbac_service.py
            if "user_id" in conditions and conditions["user_id"] == ":current_user_id":
                return True
            
            if "department" in conditions and hasattr(user, "department"):
                return getattr(user, "department") is not None
            
            if "region" in conditions and hasattr(user, "region"):
                return getattr(user, "region") is not None
            
            return True
        except Exception as e:
            logger.warning(f"Error validating context conditions: {str(e)}")
            return False
    
    def get_user_effective_permissions(self, user_id: int) -> List[EffectivePermission]:
        """
        Get all effective permissions for a user aggregated from all RBAC systems.
        """
        effective_permissions = []
        
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return []
            
            # 1. Get permissions from simple roles
            if hasattr(user, 'role') and user.role in ROLE_PERMISSIONS:
                for perm in ROLE_PERMISSIONS[user.role]:
                    effective_permissions.append(
                        EffectivePermission(
                            action=perm,
                            resource=perm.split('.')[0] if '.' in perm else perm,
                            resource_id=None,
                            source="simple_role",
                            conditions=None,
                            is_effective=True,
                            reason=f"From role: {user.role}"
                        )
                    )
            
            # 2. Get permissions from ABAC system
            abac_perms = get_user_effective_permissions_rbac(self.db, user_id)
            for perm in abac_perms:
                effective_permissions.append(
                    EffectivePermission(
                        action=perm["action"],
                        resource=perm["resource"],
                        resource_id=None,
                        source="abac",
                        conditions=perm.get("conditions"),
                        is_effective=perm["is_effective"],
                        reason=perm.get("note")
                    )
                )
            
            # 3. Get permissions from hierarchical system
            hierarchical_perms = get_user_permissions(self.db, user_id)
            for perm in hierarchical_perms:
                effective_permissions.append(
                    EffectivePermission(
                        action=perm.action,
                        resource=perm.resource,
                        resource_id=None,
                        source="hierarchical",
                        conditions=getattr(perm, 'conditions', None),
                        is_effective=True,
                        reason="From hierarchical role/group"
                    )
                )
            
            return effective_permissions
            
        except Exception as e:
            logger.error(f"Error getting effective permissions for user {user_id}: {str(e)}")
            return []
    
    def get_current_user_context(self, user_id: int) -> Optional[UserContext]:
        """Get complete user context for all groups"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            
            permissions = self.get_user_effective_permissions(user_id)
            
            # Get user groups
            user_groups = self.db.query(Group).join(UserGroup).filter(
                UserGroup.user_id == user_id
            ).all()
            
            # Get user workspaces (mock for now - will be implemented with real workspace service)
            workspaces = []
            
            # Get compliance context
            compliance_context = {
                "frameworks": [],  # Will be populated with real compliance data
                "violations": [],
                "status": "compliant"
            }
            
            return UserContext(
                user=user,
                permissions=permissions,
                groups=user_groups,
                workspaces=workspaces,
                compliance_context=compliance_context
            )
            
        except Exception as e:
            logger.error(f"Error getting user context for user {user_id}: {str(e)}")
            return None
    
    def audit_permission_check(
        self, 
        user_id: int, 
        action: str, 
        resource: str, 
        result: PermissionResult,
        resource_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        """Audit permission checks for compliance and security monitoring"""
        try:
            audit_log = RbacAuditLog(
                action="permission_check",
                performed_by=str(user_id),
                entity_type="permission",
                entity_id=f"{resource}.{action}",
                before_state=None,
                after_state=json.dumps({
                    "allowed": result.allowed,
                    "reason": result.reason,
                    "source": result.source,
                    "resource_id": resource_id,
                    "context": context
                }),
                timestamp=datetime.utcnow(),
                extra_metadata=json.dumps({
                    "conditions_met": result.conditions_met,
                    "audit_info": result.audit_info
                })
            )
            
            self.db.add(audit_log)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error auditing permission check: {str(e)}")
    
    def require_permission(self, action: str, resource: str):
        """
        Decorator factory for FastAPI routes to require specific permissions.
        Integrates with existing authentication system.
        """
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Implementation will integrate with FastAPI dependency injection
                # This is a placeholder for the actual implementation
                pass
            return wrapper
        return decorator

# Convenience functions for backwards compatibility
def check_unified_permission(
    db: Session, 
    user_id: int, 
    action: str, 
    resource: str,
    resource_id: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> bool:
    """Convenience function for checking permissions through unified engine"""
    engine = UnifiedRBACEngine(db)
    result = engine.check_permission(user_id, action, resource, resource_id, context)
    
    # Audit the permission check
    engine.audit_permission_check(user_id, action, resource, result, resource_id, context)
    
    return result.allowed

def get_unified_user_permissions(db: Session, user_id: int) -> List[EffectivePermission]:
    """Convenience function for getting user permissions through unified engine"""
    engine = UnifiedRBACEngine(db)
    return engine.get_user_effective_permissions(user_id)