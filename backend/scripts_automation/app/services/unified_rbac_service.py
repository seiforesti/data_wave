"""
Unified RBAC Service for Advanced Data Governance System
========================================================

This service provides comprehensive role-based access control for all 6 data governance groups:
- Data Sources
- Advanced Catalog  
- Classifications
- Compliance Rules
- Scan Rule Sets
- Scan Logic

Features:
- Hierarchical permissions with inheritance
- Resource-level access control
- Attribute-based access control (ABAC)
- Cross-group permission validation
- Real-time permission evaluation
- Audit logging for all access decisions
"""

from typing import Dict, List, Optional, Any, Set, Tuple
from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.models.auth_models import (
    User, Role, Permission, RolePermission, Group, UserGroup, GroupRole,
    ResourceRole, RbacAuditLog, Resource, DenyAssignment
)
from app.services.rbac_service import get_user_effective_permissions_rbac
from app.api.security.rbac import (
    ROLE_PERMISSIONS, get_user_group_permissions, 
    has_group_access, check_permission
)


class UnifiedRBACService:
    """
    Unified RBAC service for comprehensive access control across all data governance groups
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_cache = {}
        self.cache_timeout = 300  # 5 minutes
        
    # ===============================================================================
    # CORE PERMISSION EVALUATION
    # ===============================================================================
    
    def evaluate_permission(
        self, 
        user_id: int, 
        action: str, 
        resource_type: str,
        resource_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """
        Comprehensive permission evaluation with audit logging
        
        Args:
            user_id: ID of the user requesting access
            action: Action being requested (view, create, edit, delete, etc.)
            resource_type: Type of resource (datasource, catalog, classification, etc.)
            resource_id: Specific resource ID (optional)
            context: Additional context for ABAC evaluation
            
        Returns:
            Tuple of (is_allowed: bool, reason: str)
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, "User not found"
            
            if not user.is_active:
                return False, "User account is inactive"
            
            # Check deny assignments first
            if self._has_deny_assignment(user_id, action, resource_type, resource_id):
                self._log_access_decision(
                    user_id, action, resource_type, resource_id, 
                    False, "Explicit deny assignment"
                )
                return False, "Access explicitly denied"
            
            # Build permission string
            permission = f"{resource_type}.{action}"
            
            # Check role-based permissions
            has_permission = self._check_role_permissions(user, permission)
            
            # Check resource-specific permissions if resource_id provided
            if resource_id and not has_permission:
                has_permission = self._check_resource_permissions(
                    user_id, permission, resource_type, resource_id
                )
            
            # Apply ABAC conditions if context provided
            if has_permission and context:
                has_permission, abac_reason = self._evaluate_abac_conditions(
                    user, permission, context
                )
                if not has_permission:
                    self._log_access_decision(
                        user_id, action, resource_type, resource_id,
                        False, f"ABAC condition failed: {abac_reason}"
                    )
                    return False, f"Access condition not met: {abac_reason}"
            
            # Log successful access
            if has_permission:
                self._log_access_decision(
                    user_id, action, resource_type, resource_id,
                    True, "Permission granted"
                )
            else:
                self._log_access_decision(
                    user_id, action, resource_type, resource_id,
                    False, "Insufficient permissions"
                )
            
            return has_permission, "Access granted" if has_permission else "Insufficient permissions"
            
        except Exception as e:
            self._log_access_decision(
                user_id, action, resource_type, resource_id,
                False, f"Error during evaluation: {str(e)}"
            )
            return False, f"Permission evaluation error: {str(e)}"
    
    def _check_role_permissions(self, user: User, permission: str) -> bool:
        """Check if user has permission through their roles"""
        # Check simple role-based permissions first
        user_role = getattr(user, 'role', 'viewer')
        if user_role in ROLE_PERMISSIONS:
            if permission in ROLE_PERMISSIONS[user_role]:
                return True
        
        # Check advanced RBAC permissions
        effective_permissions = get_user_effective_permissions_rbac(self.db, user.id)
        for perm in effective_permissions:
            if perm.get('action') == permission and perm.get('is_effective'):
                return True
        
        return False
    
    def _check_resource_permissions(
        self, 
        user_id: int, 
        permission: str, 
        resource_type: str, 
        resource_id: str
    ) -> bool:
        """Check resource-specific permissions"""
        # Get resource roles for this user and resource
        resource_roles = self.db.query(ResourceRole).filter(
            ResourceRole.user_id == user_id,
            ResourceRole.resource_type == resource_type,
            ResourceRole.resource_id == resource_id
        ).all()
        
        for resource_role in resource_roles:
            role = self.db.query(Role).filter(Role.id == resource_role.role_id).first()
            if role:
                # Check if this role has the required permission
                role_permissions = self.db.query(Permission).join(
                    RolePermission, Permission.id == RolePermission.permission_id
                ).filter(RolePermission.role_id == role.id).all()
                
                for perm in role_permissions:
                    if perm.action == permission:
                        return True
        
        return False
    
    def _has_deny_assignment(
        self, 
        user_id: int, 
        action: str, 
        resource: str, 
        resource_id: Optional[str] = None
    ) -> bool:
        """Check if there's an explicit deny assignment"""
        # Direct user deny
        deny = self.db.query(DenyAssignment).filter(
            DenyAssignment.user_id == user_id,
            DenyAssignment.action == action,
            DenyAssignment.resource == resource
        ).first()
        
        if deny:
            return True
        
        # Group-based deny
        user_groups = self.db.query(UserGroup).filter(UserGroup.user_id == user_id).all()
        group_ids = [ug.group_id for ug in user_groups]
        
        if group_ids:
            group_deny = self.db.query(DenyAssignment).filter(
                DenyAssignment.group_id.in_(group_ids),
                DenyAssignment.action == action,
                DenyAssignment.resource == resource
            ).first()
            
            if group_deny:
                return True
        
        return False
    
    def _evaluate_abac_conditions(
        self, 
        user: User, 
        permission: str, 
        context: Dict[str, Any]
    ) -> Tuple[bool, str]:
        """Evaluate attribute-based access control conditions"""
        try:
            # Get permissions with conditions
            permissions = self.db.query(Permission).filter(
                Permission.action == permission,
                Permission.conditions.isnot(None)
            ).all()
            
            for perm in permissions:
                if perm.conditions:
                    conditions = json.loads(perm.conditions)
                    
                    # Evaluate conditions
                    if not self._evaluate_condition(user, conditions, context):
                        return False, f"Condition not met: {perm.conditions}"
            
            return True, "All conditions met"
            
        except Exception as e:
            return False, f"Condition evaluation error: {str(e)}"
    
    def _evaluate_condition(
        self, 
        user: User, 
        conditions: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> bool:
        """Evaluate a specific ABAC condition"""
        for key, expected_value in conditions.items():
            if key == "user_id" and expected_value == ":current_user_id":
                if context.get("user_id") != user.id:
                    return False
            elif key == "department" and expected_value == ":user_department":
                if context.get("department") != getattr(user, "department", None):
                    return False
            elif key == "region" and expected_value == ":user_region":
                if context.get("region") != getattr(user, "region", None):
                    return False
            elif key == "time_range":
                current_hour = datetime.now().hour
                start_hour = expected_value.get("start", 0)
                end_hour = expected_value.get("end", 23)
                if not (start_hour <= current_hour <= end_hour):
                    return False
            # Add more condition types as needed
        
        return True
    
    def _log_access_decision(
        self,
        user_id: int,
        action: str,
        resource_type: str,
        resource_id: Optional[str],
        granted: bool,
        reason: str
    ):
        """Log access decision for audit purposes"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            user_email = user.email if user else f"user_id:{user_id}"
            
            audit_log = RbacAuditLog(
                action="access_check",
                performed_by=user_email,
                target_user=user_email,
                resource_type=resource_type,
                resource_id=resource_id,
                status="granted" if granted else "denied",
                note=f"Action: {action}, Reason: {reason}",
                timestamp=datetime.utcnow(),
                entity_type="permission",
                entity_id=f"{resource_type}.{action}",
                extra_metadata=json.dumps({
                    "action": action,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "granted": granted,
                    "reason": reason
                })
            )
            
            self.db.add(audit_log)
            self.db.commit()
            
        except Exception as e:
            # Don't fail the main operation if audit logging fails
            print(f"Audit logging failed: {e}")
    
    # ===============================================================================
    # GROUP-SPECIFIC PERMISSION METHODS
    # ===============================================================================
    
    def can_access_datasource(
        self, 
        user_id: int, 
        action: str, 
        datasource_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check data source permissions"""
        return self.evaluate_permission(
            user_id, action, "datasource", datasource_id, context
        )
    
    def can_access_catalog(
        self, 
        user_id: int, 
        action: str, 
        catalog_item_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check catalog permissions"""
        return self.evaluate_permission(
            user_id, action, "catalog", catalog_item_id, context
        )
    
    def can_access_classification(
        self, 
        user_id: int, 
        action: str, 
        classification_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check classification permissions"""
        return self.evaluate_permission(
            user_id, action, "classification", classification_id, context
        )
    
    def can_access_compliance(
        self, 
        user_id: int, 
        action: str, 
        compliance_rule_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check compliance permissions"""
        return self.evaluate_permission(
            user_id, action, "compliance", compliance_rule_id, context
        )
    
    def can_access_scan_ruleset(
        self, 
        user_id: int, 
        action: str, 
        ruleset_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check scan ruleset permissions"""
        return self.evaluate_permission(
            user_id, action, "scan.ruleset", ruleset_id, context
        )
    
    def can_access_scan(
        self, 
        user_id: int, 
        action: str, 
        scan_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Check scan logic permissions"""
        return self.evaluate_permission(
            user_id, action, "scan", scan_id, context
        )
    
    # ===============================================================================
    # CROSS-GROUP PERMISSION VALIDATION
    # ===============================================================================
    
    def validate_cross_group_access(
        self, 
        user_id: int, 
        operations: List[Dict[str, Any]]
    ) -> Dict[str, Tuple[bool, str]]:
        """
        Validate multiple permissions across different groups in a single call
        
        Args:
            user_id: User ID
            operations: List of operations, each containing:
                - group: Group name (datasource, catalog, etc.)
                - action: Action to perform
                - resource_id: Optional resource ID
                - context: Optional context
        
        Returns:
            Dictionary mapping operation keys to (allowed, reason) tuples
        """
        results = {}
        
        for i, operation in enumerate(operations):
            group = operation.get('group')
            action = operation.get('action')
            resource_id = operation.get('resource_id')
            context = operation.get('context')
            
            operation_key = f"{group}_{action}_{i}"
            
            try:
                allowed, reason = self.evaluate_permission(
                    user_id, action, group, resource_id, context
                )
                results[operation_key] = (allowed, reason)
            except Exception as e:
                results[operation_key] = (False, f"Validation error: {str(e)}")
        
        return results
    
    def get_user_accessible_resources(
        self, 
        user_id: int, 
        resource_type: str,
        action: str = "view"
    ) -> List[Dict[str, Any]]:
        """
        Get all resources of a given type that the user can access
        """
        accessible_resources = []
        
        # Get all resources of the specified type
        if resource_type == "datasource":
            # This would typically query your data source table
            # For now, return a placeholder
            pass
        elif resource_type == "catalog":
            # Query catalog items
            pass
        # Add other resource types as needed
        
        return accessible_resources
    
    def get_user_permissions_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get a comprehensive summary of user permissions across all groups
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Get group permissions
        current_user = {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
        
        group_permissions = get_user_group_permissions(current_user, self.db)
        
        # Get effective permissions from RBAC
        effective_permissions = get_user_effective_permissions_rbac(self.db, user_id)
        
        return {
            "user_id": user_id,
            "user_email": user.email,
            "primary_role": user.role,
            "group_permissions": group_permissions,
            "effective_permissions": effective_permissions,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    # ===============================================================================
    # UTILITY METHODS
    # ===============================================================================
    
    def clear_permission_cache(self, user_id: Optional[int] = None):
        """Clear permission cache for a user or all users"""
        if user_id:
            cache_key = f"permissions_{user_id}"
            if cache_key in self.permission_cache:
                del self.permission_cache[cache_key]
        else:
            self.permission_cache.clear()
    
    def refresh_user_permissions(self, user_id: int):
        """Refresh cached permissions for a user"""
        self.clear_permission_cache(user_id)
        # Pre-load permissions into cache
        return self.get_user_permissions_summary(user_id)


# ===============================================================================
# FACTORY FUNCTION
# ===============================================================================

def get_unified_rbac_service(db: Session) -> UnifiedRBACService:
    """Factory function to get unified RBAC service instance"""
    return UnifiedRBACService(db)


# ===============================================================================
# FASTAPI DEPENDENCY
# ===============================================================================

from fastapi import Depends
from app.db_session import get_db

def get_rbac_service(db: Session = Depends(get_db)) -> UnifiedRBACService:
    """FastAPI dependency to get RBAC service"""
    return get_unified_rbac_service(db)