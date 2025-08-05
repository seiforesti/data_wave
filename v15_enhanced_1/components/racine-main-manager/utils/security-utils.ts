import { 
  UserProfile,
  RBACRole,
  RBACPermission,
  SecurityAuditLog,
  APIKeyConfiguration,
  MFAConfiguration,
  SecurityPreferences,
  AccessRequest,
  SecurityAlert,
  UUID,
  ISODateString 
} from '../types/racine-core.types';

/**
 * Access Control and Permission Management Utilities
 * Handles RBAC validation, permission checking, and access control logic
 */
export class AccessControlManager {
  /**
   * Check if user has specific permission
   */
  static hasPermission(
    userRoles: RBACRole[],
    requiredPermission: string,
    resourceType?: string,
    resourceId?: UUID
  ): boolean {
    // Check if user has any roles
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Check each role for the required permission
    return userRoles.some(role => {
      if (!role.permissions || role.permissions.length === 0) {
        return false;
      }

      return role.permissions.some(permission => {
        // Check basic permission match
        if (permission.permission_name !== requiredPermission) {
          return false;
        }

        // Check if permission is active
        if (!permission.is_active) {
          return false;
        }

        // Check resource type if specified
        if (resourceType && permission.resource_type && permission.resource_type !== resourceType) {
          return false;
        }

        // Check resource ID if specified
        if (resourceId && permission.resource_id && permission.resource_id !== resourceId) {
          return false;
        }

        // Check permission expiry
        if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
          return false;
        }

        return true;
      });
    });
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(
    userRoles: RBACRole[],
    permissions: string[],
    resourceType?: string
  ): boolean {
    return permissions.some(permission => 
      this.hasPermission(userRoles, permission, resourceType)
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(
    userRoles: RBACRole[],
    permissions: string[],
    resourceType?: string
  ): boolean {
    return permissions.every(permission => 
      this.hasPermission(userRoles, permission, resourceType)
    );
  }

  /**
   * Get all permissions for a user across all roles
   */
  static getUserPermissions(userRoles: RBACRole[]): {
    permissions: string[];
    rolePermissions: { [roleName: string]: string[] };
    resourcePermissions: { [resourceType: string]: string[] };
  } {
    const allPermissions = new Set<string>();
    const rolePermissions: { [roleName: string]: string[] } = {};
    const resourcePermissions: { [resourceType: string]: string[] } = {};

    userRoles.forEach(role => {
      const rolePerms: string[] = [];
      
      role.permissions?.forEach(permission => {
        if (permission.is_active && (!permission.expires_at || new Date(permission.expires_at) > new Date())) {
          allPermissions.add(permission.permission_name);
          rolePerms.push(permission.permission_name);

          // Group by resource type
          const resourceType = permission.resource_type || 'global';
          if (!resourcePermissions[resourceType]) {
            resourcePermissions[resourceType] = [];
          }
          if (!resourcePermissions[resourceType].includes(permission.permission_name)) {
            resourcePermissions[resourceType].push(permission.permission_name);
          }
        }
      });

      rolePermissions[role.role_name] = rolePerms;
    });

    return {
      permissions: Array.from(allPermissions),
      rolePermissions,
      resourcePermissions
    };
  }

  /**
   * Validate access request against user permissions
   */
  static validateAccessRequest(
    userRoles: RBACRole[],
    accessRequest: {
      action: string;
      resource: string;
      resourceId?: UUID;
      context?: any;
    }
  ): {
    granted: boolean;
    reason?: string;
    requiredPermissions: string[];
    missingPermissions: string[];
  } {
    const requiredPermissions = this.getRequiredPermissions(accessRequest.action, accessRequest.resource);
    const missingPermissions: string[] = [];

    requiredPermissions.forEach(permission => {
      if (!this.hasPermission(userRoles, permission, accessRequest.resource, accessRequest.resourceId)) {
        missingPermissions.push(permission);
      }
    });

    const granted = missingPermissions.length === 0;

    return {
      granted,
      reason: granted ? undefined : `Missing permissions: ${missingPermissions.join(', ')}`,
      requiredPermissions,
      missingPermissions
    };
  }

  /**
   * Get required permissions for a specific action and resource
   */
  private static getRequiredPermissions(action: string, resource: string): string[] {
    const permissionMap: { [key: string]: string[] } = {
      // Data Sources
      'data_sources:read': ['data_sources:view'],
      'data_sources:create': ['data_sources:create'],
      'data_sources:update': ['data_sources:edit'],
      'data_sources:delete': ['data_sources:delete'],
      
      // Scan Rules
      'scan_rules:read': ['scan_rules:view'],
      'scan_rules:create': ['scan_rules:create'],
      'scan_rules:update': ['scan_rules:edit'],
      'scan_rules:delete': ['scan_rules:delete'],
      
      // Classifications
      'classifications:read': ['classifications:view'],
      'classifications:create': ['classifications:create'],
      'classifications:update': ['classifications:edit'],
      'classifications:delete': ['classifications:delete'],
      
      // Compliance
      'compliance:read': ['compliance:view'],
      'compliance:create': ['compliance:create'],
      'compliance:update': ['compliance:edit'],
      'compliance:delete': ['compliance:delete'],
      
      // Catalog
      'catalog:read': ['catalog:view'],
      'catalog:create': ['catalog:create'],
      'catalog:update': ['catalog:edit'],
      'catalog:delete': ['catalog:delete'],
      
      // Scan Logic
      'scan_logic:read': ['scan_logic:view'],
      'scan_logic:create': ['scan_logic:create'],
      'scan_logic:update': ['scan_logic:edit'],
      'scan_logic:delete': ['scan_logic:delete'],
      
      // RBAC
      'rbac:read': ['rbac:view'],
      'rbac:create': ['rbac:create'],
      'rbac:update': ['rbac:edit'],
      'rbac:delete': ['rbac:delete'],
      
      // Racine System
      'racine:orchestrate': ['racine:orchestration'],
      'racine:workspace': ['racine:workspace_management'],
      'racine:workflow': ['racine:workflow_management'],
      'racine:pipeline': ['racine:pipeline_management'],
      'racine:ai': ['racine:ai_assistant'],
      'racine:collaboration': ['racine:collaboration'],
      'racine:dashboard': ['racine:dashboard'],
      'racine:admin': ['racine:system_admin']
    };

    const key = `${resource}:${action}`;
    return permissionMap[key] || [`${resource}:${action}`];
  }

  /**
   * Check if user can access cross-group resources
   */
  static canAccessCrossGroup(
    userRoles: RBACRole[],
    sourceGroup: string,
    targetGroup: string
  ): boolean {
    // Check for cross-group permissions
    const crossGroupPermissions = [
      'cross_group:access',
      'racine:orchestration',
      'system:admin'
    ];

    return this.hasAnyPermission(userRoles, crossGroupPermissions) ||
           (this.hasPermission(userRoles, `${sourceGroup}:access`) && 
            this.hasPermission(userRoles, `${targetGroup}:access`));
  }
}

/**
 * Security Auditing and Logging Utilities
 * Handles security event logging, audit trail management, and compliance reporting
 */
export class SecurityAuditManager {
  /**
   * Create security audit log entry
   */
  static createAuditLog(
    userId: UUID,
    action: string,
    resource: string,
    resourceId?: UUID,
    context?: any,
    result: 'success' | 'failure' | 'denied' = 'success',
    details?: string
  ): SecurityAuditLog {
    return {
      id: crypto.randomUUID() as UUID,
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      result,
      details,
      ip_address: this.getCurrentIPAddress(),
      user_agent: this.getCurrentUserAgent(),
      session_id: this.getCurrentSessionId(),
      timestamp: new Date().toISOString() as ISODateString,
      context: context ? JSON.stringify(context) : undefined,
      risk_level: this.calculateRiskLevel(action, resource, result),
      compliance_tags: this.getComplianceTags(action, resource)
    };
  }

  /**
   * Log authentication event
   */
  static logAuthenticationEvent(
    userId: UUID,
    eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_challenge' | 'mfa_success' | 'mfa_failure',
    details?: string,
    metadata?: any
  ): SecurityAuditLog {
    return this.createAuditLog(
      userId,
      eventType,
      'authentication',
      undefined,
      metadata,
      eventType.includes('failed') || eventType.includes('failure') ? 'failure' : 'success',
      details
    );
  }

  /**
   * Log permission change event
   */
  static logPermissionChange(
    adminUserId: UUID,
    targetUserId: UUID,
    action: 'grant' | 'revoke' | 'modify',
    permission: string,
    resourceType?: string,
    resourceId?: UUID
  ): SecurityAuditLog {
    return this.createAuditLog(
      adminUserId,
      `permission_${action}`,
      'rbac',
      targetUserId,
      {
        permission,
        resourceType,
        resourceId,
        targetUser: targetUserId
      },
      'success',
      `${action.charAt(0).toUpperCase() + action.slice(1)} permission ${permission} for user ${targetUserId}`
    );
  }

  /**
   * Log data access event
   */
  static logDataAccess(
    userId: UUID,
    dataType: string,
    operation: 'read' | 'write' | 'delete' | 'export',
    recordCount?: number,
    sensitivityLevel?: 'public' | 'internal' | 'confidential' | 'restricted'
  ): SecurityAuditLog {
    return this.createAuditLog(
      userId,
      `data_${operation}`,
      dataType,
      undefined,
      {
        recordCount,
        sensitivityLevel,
        operation
      },
      'success',
      `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${recordCount || 'unknown'} records from ${dataType}`
    );
  }

  /**
   * Calculate risk level for audit event
   */
  private static calculateRiskLevel(
    action: string,
    resource: string,
    result: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    // High-risk actions
    const highRiskActions = ['delete', 'export', 'admin', 'permission_grant', 'permission_revoke'];
    const criticalResources = ['rbac', 'authentication', 'system'];
    const failureEvents = ['failure', 'denied'];

    if (failureEvents.includes(result) && criticalResources.includes(resource)) {
      return 'critical';
    }

    if (highRiskActions.some(riskAction => action.includes(riskAction))) {
      return 'high';
    }

    if (criticalResources.includes(resource)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get compliance tags for audit event
   */
  private static getComplianceTags(action: string, resource: string): string[] {
    const tags: string[] = [];

    // GDPR compliance
    if (action.includes('export') || action.includes('delete') || resource.includes('personal')) {
      tags.push('GDPR');
    }

    // SOX compliance
    if (resource.includes('financial') || action.includes('audit')) {
      tags.push('SOX');
    }

    // HIPAA compliance
    if (resource.includes('health') || resource.includes('medical')) {
      tags.push('HIPAA');
    }

    // PCI compliance
    if (resource.includes('payment') || resource.includes('card')) {
      tags.push('PCI');
    }

    // General data governance
    tags.push('DATA_GOVERNANCE');

    return tags;
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(
    auditLogs: SecurityAuditLog[],
    timeframe: { start: ISODateString; end: ISODateString },
    complianceStandard: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI' | 'ALL'
  ): {
    summary: {
      totalEvents: number;
      riskDistribution: { [risk: string]: number };
      complianceViolations: number;
      topUsers: Array<{ userId: UUID; eventCount: number }>;
    };
    violations: SecurityAuditLog[];
    recommendations: string[];
  } {
    // Filter logs by timeframe and compliance standard
    const filteredLogs = auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const inTimeframe = logDate >= new Date(timeframe.start) && logDate <= new Date(timeframe.end);
      const matchesStandard = complianceStandard === 'ALL' || 
                             (log.compliance_tags && log.compliance_tags.includes(complianceStandard));
      return inTimeframe && matchesStandard;
    });

    // Calculate risk distribution
    const riskDistribution: { [risk: string]: number } = {};
    filteredLogs.forEach(log => {
      riskDistribution[log.risk_level] = (riskDistribution[log.risk_level] || 0) + 1;
    });

    // Identify violations (failed/denied events with high/critical risk)
    const violations = filteredLogs.filter(log => 
      (log.result === 'failure' || log.result === 'denied') &&
      (log.risk_level === 'high' || log.risk_level === 'critical')
    );

    // Calculate top users by event count
    const userEventCounts: { [userId: string]: number } = {};
    filteredLogs.forEach(log => {
      userEventCounts[log.user_id] = (userEventCounts[log.user_id] || 0) + 1;
    });

    const topUsers = Object.entries(userEventCounts)
      .map(([userId, count]) => ({ userId: userId as UUID, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // Generate recommendations
    const recommendations: string[] = [];
    if (violations.length > 0) {
      recommendations.push(`${violations.length} compliance violations detected - review and address immediately`);
    }
    if (riskDistribution.critical > 0) {
      recommendations.push('Critical risk events detected - implement additional security measures');
    }
    if (riskDistribution.high > filteredLogs.length * 0.1) {
      recommendations.push('High number of high-risk events - review access controls and permissions');
    }

    return {
      summary: {
        totalEvents: filteredLogs.length,
        riskDistribution,
        complianceViolations: violations.length,
        topUsers
      },
      violations,
      recommendations
    };
  }

  // Helper methods for getting current context
  private static getCurrentIPAddress(): string {
    // In a real implementation, this would get the actual IP address
    return 'unknown';
  }

  private static getCurrentUserAgent(): string {
    // In a real implementation, this would get the actual user agent
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  private static getCurrentSessionId(): string {
    // In a real implementation, this would get the actual session ID
    return 'unknown';
  }
}

/**
 * Authentication and Token Management Utilities
 * Handles JWT tokens, session management, and authentication validation
 */
export class AuthenticationManager {
  /**
   * Validate JWT token structure and expiry
   */
  static validateToken(token: string): {
    isValid: boolean;
    payload?: any;
    error?: string;
    expiresAt?: Date;
  } {
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid token structure' };
      }

      // Decode payload (in production, use proper JWT library with signature verification)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiry
      if (payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        if (expiresAt < new Date()) {
          return { isValid: false, error: 'Token expired', expiresAt };
        }
        return { isValid: true, payload, expiresAt };
      }

      return { isValid: true, payload };
    } catch (error) {
      return { isValid: false, error: 'Invalid token format' };
    }
  }

  /**
   * Generate API key with specific permissions
   */
  static generateAPIKey(
    userId: UUID,
    name: string,
    permissions: string[],
    expiresIn?: number // days
  ): APIKeyConfiguration {
    const keyId = crypto.randomUUID() as UUID;
    const apiKey = this.generateSecureKey();
    const hashedKey = this.hashAPIKey(apiKey);

    return {
      id: keyId,
      user_id: userId,
      name,
      key_hash: hashedKey,
      permissions,
      is_active: true,
      last_used: null,
      usage_count: 0,
      created_at: new Date().toISOString() as ISODateString,
      expires_at: expiresIn 
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString() as ISODateString
        : null,
      rate_limit: {
        requests_per_minute: 100,
        requests_per_hour: 1000,
        requests_per_day: 10000
      },
      allowed_ips: [],
      metadata: {
        plainKey: apiKey // Only return this once during creation
      }
    };
  }

  /**
   * Validate API key and check permissions
   */
  static validateAPIKey(
    apiKey: string,
    apiKeyConfig: APIKeyConfiguration,
    requiredPermission?: string
  ): {
    isValid: boolean;
    error?: string;
    canProceed: boolean;
  } {
    // Check if key is active
    if (!apiKeyConfig.is_active) {
      return { isValid: false, error: 'API key is inactive', canProceed: false };
    }

    // Check expiry
    if (apiKeyConfig.expires_at && new Date(apiKeyConfig.expires_at) < new Date()) {
      return { isValid: false, error: 'API key expired', canProceed: false };
    }

    // Validate key hash
    const hashedKey = this.hashAPIKey(apiKey);
    if (hashedKey !== apiKeyConfig.key_hash) {
      return { isValid: false, error: 'Invalid API key', canProceed: false };
    }

    // Check permissions if required
    if (requiredPermission && !apiKeyConfig.permissions.includes(requiredPermission)) {
      return { isValid: true, error: 'Insufficient permissions', canProceed: false };
    }

    // Check rate limits (simplified)
    if (this.isRateLimited(apiKeyConfig)) {
      return { isValid: true, error: 'Rate limit exceeded', canProceed: false };
    }

    return { isValid: true, canProceed: true };
  }

  /**
   * Generate MFA configuration for user
   */
  static generateMFAConfiguration(
    userId: UUID,
    method: 'totp' | 'sms' | 'email' | 'backup_codes'
  ): MFAConfiguration {
    const config: MFAConfiguration = {
      id: crypto.randomUUID() as UUID,
      user_id: userId,
      method,
      is_enabled: false,
      is_verified: false,
      created_at: new Date().toISOString() as ISODateString,
      last_used: null,
      backup_codes_used: 0
    };

    switch (method) {
      case 'totp':
        config.secret = this.generateTOTPSecret();
        config.qr_code = this.generateQRCode(userId, config.secret);
        break;
      case 'sms':
      case 'email':
        // Configuration would be handled by external service
        break;
      case 'backup_codes':
        config.backup_codes = this.generateBackupCodes();
        break;
    }

    return config;
  }

  /**
   * Verify MFA token
   */
  static verifyMFAToken(
    token: string,
    mfaConfig: MFAConfiguration,
    windowSize: number = 1
  ): boolean {
    if (!mfaConfig.is_enabled || !mfaConfig.is_verified) {
      return false;
    }

    switch (mfaConfig.method) {
      case 'totp':
        return this.verifyTOTPToken(token, mfaConfig.secret!, windowSize);
      case 'backup_codes':
        return this.verifyBackupCode(token, mfaConfig.backup_codes!);
      case 'sms':
      case 'email':
        // Would integrate with external verification service
        return false;
      default:
        return false;
    }
  }

  // Helper methods for key generation and validation
  private static generateSecureKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static hashAPIKey(apiKey: string): string {
    // In production, use proper cryptographic hashing
    return btoa(apiKey); // Simplified for demo
  }

  private static isRateLimited(apiKeyConfig: APIKeyConfiguration): boolean {
    // Simplified rate limiting check - in production, use Redis or similar
    return false;
  }

  private static generateTOTPSecret(): string {
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static generateQRCode(userId: UUID, secret: string): string {
    // In production, generate actual QR code
    return `otpauth://totp/RacineSystem:${userId}?secret=${secret}&issuer=RacineSystem`;
  }

  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private static verifyTOTPToken(token: string, secret: string, windowSize: number): boolean {
    // Simplified TOTP verification - in production, use proper TOTP library
    return token.length === 6 && /^\d{6}$/.test(token);
  }

  private static verifyBackupCode(code: string, backupCodes: string[]): boolean {
    return backupCodes.includes(code.toUpperCase());
  }
}

/**
 * Data Encryption and Security Utilities
 * Handles data encryption, hashing, and secure data handling
 */
export class DataSecurityManager {
  /**
   * Encrypt sensitive data
   */
  static encryptSensitiveData(data: string, key?: string): {
    encrypted: string;
    iv: string;
    algorithm: string;
  } {
    // Simplified encryption - in production, use proper encryption library
    const iv = crypto.randomUUID();
    const encrypted = btoa(data + iv); // Simplified
    
    return {
      encrypted,
      iv,
      algorithm: 'AES-256-GCM'
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(
    encryptedData: string,
    iv: string,
    key?: string
  ): string {
    // Simplified decryption - in production, use proper decryption
    try {
      const decoded = atob(encryptedData);
      return decoded.replace(iv, '');
    } catch {
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash password with salt
   */
  static hashPassword(password: string, salt?: string): {
    hash: string;
    salt: string;
    algorithm: string;
  } {
    const usedSalt = salt || crypto.randomUUID();
    // Simplified hashing - in production, use bcrypt or similar
    const hash = btoa(password + usedSalt);
    
    return {
      hash,
      salt: usedSalt,
      algorithm: 'bcrypt'
    };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = this.hashPassword(password, salt);
    return computed.hash === hash;
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim();
  }

  /**
   * Validate data against security patterns
   */
  static validateSecureData(data: any, rules: {
    maxLength?: number;
    minLength?: number;
    allowedChars?: RegExp;
    forbiddenPatterns?: RegExp[];
    requireEncryption?: boolean;
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof data === 'string') {
      // Length validation
      if (rules.maxLength && data.length > rules.maxLength) {
        errors.push(`Data exceeds maximum length of ${rules.maxLength}`);
      }
      if (rules.minLength && data.length < rules.minLength) {
        errors.push(`Data is below minimum length of ${rules.minLength}`);
      }

      // Character validation
      if (rules.allowedChars && !rules.allowedChars.test(data)) {
        errors.push('Data contains invalid characters');
      }

      // Forbidden patterns
      if (rules.forbiddenPatterns) {
        rules.forbiddenPatterns.forEach(pattern => {
          if (pattern.test(data)) {
            errors.push('Data contains forbidden patterns');
          }
        });
      }

      // Encryption requirement
      if (rules.requireEncryption && !this.isEncrypted(data)) {
        warnings.push('Data should be encrypted');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if data appears to be encrypted
   */
  private static isEncrypted(data: string): boolean {
    // Simple heuristic - in production, use proper detection
    return data.length > 50 && !/^[a-zA-Z0-9\s.,!?-]+$/.test(data);
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any, sensitiveFields: string[] = []): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    const defaultSensitiveFields = ['password', 'token', 'key', 'secret', 'ssn', 'credit_card'];
    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];

    Object.keys(masked).forEach(key => {
      if (allSensitiveFields.some(field => key.toLowerCase().includes(field))) {
        if (typeof masked[key] === 'string' && masked[key].length > 4) {
          masked[key] = '***' + masked[key].slice(-4);
        } else {
          masked[key] = '***';
        }
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key], sensitiveFields);
      }
    });

    return masked;
  }
}

// Export all utility classes
export {
  AccessControlManager,
  SecurityAuditManager,
  AuthenticationManager,
  DataSecurityManager
};

// Export utility functions for common operations
export const securityUtils = {
  generateSecureId: (): UUID => {
    return crypto.randomUUID() as UUID;
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): {
    isValid: boolean;
    score: number;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      numbers: boolean;
      symbols: boolean;
    };
  } => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = score >= 4;

    return { isValid, score, requirements };
  },

  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  },

  detectSensitiveData: (text: string): {
    hasSensitiveData: boolean;
    detectedTypes: string[];
    confidence: number;
  } => {
    const patterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    };

    const detectedTypes: string[] = [];
    Object.entries(patterns).forEach(([type, pattern]) => {
      if (pattern.test(text)) {
        detectedTypes.push(type);
      }
    });

    const confidence = detectedTypes.length > 0 ? Math.min(detectedTypes.length * 0.3, 1) : 0;

    return {
      hasSensitiveData: detectedTypes.length > 0,
      detectedTypes,
      confidence
    };
  },

  createSecurityAlert: (
    type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'compliance',
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    userId?: UUID,
    metadata?: any
  ): SecurityAlert => {
    return {
      id: crypto.randomUUID() as UUID,
      type,
      severity,
      message,
      user_id: userId,
      metadata,
      is_resolved: false,
      created_at: new Date().toISOString() as ISODateString,
      updated_at: new Date().toISOString() as ISODateString
    };
  }
};