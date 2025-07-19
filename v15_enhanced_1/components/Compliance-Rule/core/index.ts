// Core Enterprise Components for Compliance-Rule Group

// Event Bus - Cross-group communication
export { default as complianceEventBus, complianceEventBus as eventBus } from './event-bus';
export type { ComplianceEvent, ComplianceEventSubscriber } from './event-bus';

// State Manager - Centralized state management
export { default as useComplianceStore } from './state-manager';
export type { 
  ComplianceRule, 
  ComplianceViolation, 
  ComplianceAudit, 
  ComplianceState,
  ComplianceCondition,
  ComplianceAction,
  ComplianceFinding
} from './state-manager';

// Workflow Engine - Automated workflow orchestration
export { default as complianceWorkflowEngine, complianceWorkflowEngine as workflowEngine } from './workflow-engine';
export type { 
  Workflow, 
  WorkflowStep, 
  WorkflowTemplate, 
  WorkflowCondition, 
  CorrelationAction 
} from './workflow-engine';

// Analytics Engine - Advanced analytics and insights
export { default as complianceCorrelationEngine, complianceCorrelationEngine as correlationEngine } from '../analytics/correlation-engine';
export type { 
  CorrelationRule, 
  CorrelationResult, 
  ComplianceInsight, 
  ComplianceTrend, 
  ComplianceAnomaly 
} from '../analytics/correlation-engine';

// Collaboration Engine - Real-time collaboration
export { default as complianceCollaborationEngine, complianceCollaborationEngine as collaborationEngine } from '../collaboration/realtime-collaboration';
export type { 
  CollaborationSession, 
  CollaborationParticipant, 
  CollaborationDocument, 
  CollaborationMessage,
  CollaborationActivity,
  CollaborationSettings,
  CollaborationInvitation
} from '../collaboration/realtime-collaboration';

// Enterprise Hooks
export { default as useEnterpriseCompliance } from '../hooks/use-enterprise-compliance';

// Enterprise API Services
export { default as enhancedComplianceAPIs } from '../services/enhanced-compliance-apis';

// Main Enterprise App
export { default as EnhancedComplianceRuleApp } from '../enhanced-compliance-rule-app';

// Utility Functions
export const createComplianceRule = (rule: Partial<ComplianceRule>): ComplianceRule => {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: rule.name || 'New Compliance Rule',
    description: rule.description || '',
    category: rule.category || 'GENERAL',
    severity: rule.severity || 'MEDIUM',
    status: rule.status || 'DRAFT',
    framework: rule.framework || 'GENERAL',
    regulations: rule.regulations || [],
    conditions: rule.conditions || [],
    actions: rule.actions || [],
    metadata: {
      createdBy: rule.metadata?.createdBy || 'system',
      createdAt: new Date(),
      updatedBy: rule.metadata?.updatedBy || 'system',
      updatedAt: new Date(),
      version: rule.metadata?.version || '1.0.0',
      tags: rule.metadata?.tags || []
    }
  };
};

export const createComplianceViolation = (violation: Partial<ComplianceViolation>): ComplianceViolation => {
  return {
    id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ruleId: violation.ruleId || '',
    entityId: violation.entityId || '',
    entityType: violation.entityType || 'UNKNOWN',
    severity: violation.severity || 'MEDIUM',
    status: violation.status || 'OPEN',
    description: violation.description || '',
    detectedAt: violation.detectedAt || new Date(),
    remediationSteps: violation.remediationSteps || [],
    metadata: violation.metadata || {}
  };
};

export const createComplianceAudit = (audit: Partial<ComplianceAudit>): ComplianceAudit => {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: audit.name || 'New Compliance Audit',
    description: audit.description || '',
    framework: audit.framework || 'GENERAL',
    status: audit.status || 'PLANNED',
    startDate: audit.startDate || new Date(),
    scope: audit.scope || [],
    findings: audit.findings || [],
    score: audit.score || 0,
    metadata: audit.metadata || {}
  };
};

// Enterprise Constants
export const COMPLIANCE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const COMPLIANCE_STATUSES = ['ACTIVE', 'INACTIVE', 'DRAFT'] as const;
export const VIOLATION_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'] as const;
export const AUDIT_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const;

// Enterprise Configuration
export const ENTERPRISE_CONFIG = {
  // Analytics Configuration
  analytics: {
    correlationCheckInterval: 300000, // 5 minutes
    insightRetentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    anomalyDetectionThreshold: 0.5,
    trendAnalysisWindow: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Collaboration Configuration
  collaboration: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxParticipants: 50,
    maxDocuments: 100,
    maxMessages: 1000,
    typingIndicatorTimeout: 3000 // 3 seconds
  },
  
  // Workflow Configuration
  workflow: {
    maxRetryAttempts: 3,
    stepTimeout: 300000, // 5 minutes
    workflowTimeout: 24 * 60 * 60 * 1000, // 24 hours
    autoEscalation: true
  },
  
  // Event Bus Configuration
  eventBus: {
    maxListeners: 100,
    eventHistorySize: 1000,
    crossGroupPropagation: true
  },
  
  // State Management Configuration
  stateManagement: {
    persistenceEnabled: true,
    autoSaveInterval: 60000, // 1 minute
    maxStateSize: 10 * 1024 * 1024 // 10MB
  }
};

// Enterprise Types
export type ComplianceSeverity = typeof COMPLIANCE_SEVERITIES[number];
export type ComplianceStatus = typeof COMPLIANCE_STATUSES[number];
export type ViolationStatus = typeof VIOLATION_STATUSES[number];
export type AuditStatus = typeof AUDIT_STATUSES[number];

// Enterprise Interfaces
export interface EnterpriseComplianceConfig {
  analytics: typeof ENTERPRISE_CONFIG.analytics;
  collaboration: typeof ENTERPRISE_CONFIG.collaboration;
  workflow: typeof ENTERPRISE_CONFIG.workflow;
  eventBus: typeof ENTERPRISE_CONFIG.eventBus;
  stateManagement: typeof ENTERPRISE_CONFIG.stateManagement;
}

export interface EnterpriseComplianceMetrics {
  totalRules: number;
  activeRules: number;
  totalViolations: number;
  openViolations: number;
  resolvedViolations: number;
  totalAudits: number;
  completedAudits: number;
  complianceScore: number;
  averageResolutionTime: number;
  workflowEfficiency: number;
}

// Enterprise Utilities
export class ComplianceEnterpriseUtils {
  // Calculate compliance score
  static calculateComplianceScore(rules: ComplianceRule[], violations: ComplianceViolation[]): number {
    if (rules.length === 0) return 100;
    
    const activeRules = rules.filter(rule => rule.status === 'ACTIVE');
    const openViolations = violations.filter(violation => violation.status === 'OPEN');
    
    const baseScore = (activeRules.length / rules.length) * 100;
    const violationPenalty = (openViolations.length / activeRules.length) * 20;
    
    return Math.max(0, Math.min(100, baseScore - violationPenalty));
  }

  // Calculate risk score
  static calculateRiskScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 0;
    
    const severityWeights = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4
    };
    
    const totalWeight = violations.reduce((sum, violation) => {
      return sum + (severityWeights[violation.severity] || 1);
    }, 0);
    
    return Math.min(100, (totalWeight / violations.length) * 25);
  }

  // Generate compliance report
  static generateComplianceReport(
    rules: ComplianceRule[], 
    violations: ComplianceViolation[], 
    audits: ComplianceAudit[]
  ): {
    summary: string;
    metrics: EnterpriseComplianceMetrics;
    recommendations: string[];
  } {
    const metrics: EnterpriseComplianceMetrics = {
      totalRules: rules.length,
      activeRules: rules.filter(rule => rule.status === 'ACTIVE').length,
      totalViolations: violations.length,
      openViolations: violations.filter(v => v.status === 'OPEN').length,
      resolvedViolations: violations.filter(v => v.status === 'RESOLVED').length,
      totalAudits: audits.length,
      completedAudits: audits.filter(a => a.status === 'COMPLETED').length,
      complianceScore: this.calculateComplianceScore(rules, violations),
      averageResolutionTime: this.calculateAverageResolutionTime(violations),
      workflowEfficiency: this.calculateWorkflowEfficiency(audits)
    };

    const summary = `Compliance Report: ${metrics.complianceScore.toFixed(1)}% compliance score with ${metrics.openViolations} open violations.`;

    const recommendations: string[] = [];
    
    if (metrics.complianceScore < 80) {
      recommendations.push('Immediate action required to improve compliance score');
    }
    
    if (metrics.openViolations > 10) {
      recommendations.push('High number of open violations - prioritize resolution');
    }
    
    if (metrics.workflowEfficiency < 70) {
      recommendations.push('Workflow efficiency below target - review processes');
    }

    return { summary, metrics, recommendations };
  }

  // Calculate average resolution time
  private static calculateAverageResolutionTime(violations: ComplianceViolation[]): number {
    const resolvedViolations = violations.filter(v => v.status === 'RESOLVED' && v.resolvedAt);
    
    if (resolvedViolations.length === 0) return 0;
    
    const totalTime = resolvedViolations.reduce((sum, violation) => {
      return sum + (violation.resolvedAt!.getTime() - violation.detectedAt.getTime());
    }, 0);
    
    return totalTime / resolvedViolations.length;
  }

  // Calculate workflow efficiency
  private static calculateWorkflowEfficiency(audits: ComplianceAudit[]): number {
    const completedAudits = audits.filter(a => a.status === 'COMPLETED');
    
    if (completedAudits.length === 0) return 0;
    
    const averageScore = completedAudits.reduce((sum, audit) => sum + audit.score, 0) / completedAudits.length;
    return averageScore;
  }
}

// Export default enterprise configuration
export default {
  eventBus: complianceEventBus,
  stateManager: useComplianceStore,
  workflowEngine: complianceWorkflowEngine,
  correlationEngine: complianceCorrelationEngine,
  collaborationEngine: complianceCollaborationEngine,
  config: ENTERPRISE_CONFIG,
  utils: ComplianceEnterpriseUtils
};