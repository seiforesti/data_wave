import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { complianceEventBus } from './event-bus';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  framework: string;
  regulations: string[];
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    version: string;
    tags: string[];
  };
}

export interface ComplianceCondition {
  id: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'REGEX' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ComplianceAction {
  id: string;
  type: 'ALERT' | 'BLOCK' | 'LOG' | 'QUARANTINE' | 'NOTIFY';
  parameters: Record<string, any>;
  priority: number;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  entityId: string;
  entityType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  remediationSteps: string[];
  metadata: Record<string, any>;
}

export interface ComplianceAudit {
  id: string;
  name: string;
  description: string;
  framework: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startDate: Date;
  endDate?: Date;
  scope: string[];
  findings: ComplianceFinding[];
  score: number;
  metadata: Record<string, any>;
}

export interface ComplianceFinding {
  id: string;
  ruleId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface ComplianceState {
  // Core state
  rules: ComplianceRule[];
  violations: ComplianceViolation[];
  audits: ComplianceAudit[];
  loading: boolean;
  error: string | null;

  // UI state
  selectedRule: ComplianceRule | null;
  selectedViolation: ComplianceViolation | null;
  selectedAudit: ComplianceAudit | null;
  filters: {
    category: string;
    severity: string;
    status: string;
    framework: string;
  };
  viewMode: 'list' | 'grid' | 'timeline';

  // Analytics state
  analytics: {
    totalRules: number;
    activeRules: number;
    violationsBySeverity: Record<string, number>;
    complianceScore: number;
    recentActivity: any[];
  };

  // Actions
  setRules: (rules: ComplianceRule[]) => void;
  addRule: (rule: ComplianceRule) => void;
  updateRule: (id: string, updates: Partial<ComplianceRule>) => void;
  deleteRule: (id: string) => void;
  
  setViolations: (violations: ComplianceViolation[]) => void;
  addViolation: (violation: ComplianceViolation) => void;
  updateViolation: (id: string, updates: Partial<ComplianceViolation>) => void;
  resolveViolation: (id: string) => void;
  
  setAudits: (audits: ComplianceAudit[]) => void;
  addAudit: (audit: ComplianceAudit) => void;
  updateAudit: (id: string, updates: Partial<ComplianceAudit>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setSelectedRule: (rule: ComplianceRule | null) => void;
  setSelectedViolation: (violation: ComplianceViolation | null) => void;
  setSelectedAudit: (audit: ComplianceAudit | null) => void;
  
  setFilters: (filters: Partial<ComplianceState['filters']>) => void;
  setViewMode: (mode: 'list' | 'grid' | 'timeline') => void;
  
  updateAnalytics: () => void;
  
  // Bulk operations
  bulkUpdateRules: (ids: string[], updates: Partial<ComplianceRule>) => void;
  bulkDeleteRules: (ids: string[]) => void;
  bulkResolveViolations: (ids: string[]) => void;
  
  // Search and filtering
  searchRules: (query: string) => ComplianceRule[];
  getRulesByCategory: (category: string) => ComplianceRule[];
  getViolationsBySeverity: (severity: string) => ComplianceViolation[];
  getActiveAudits: () => ComplianceAudit[];
  
  // Real-time updates
  subscribeToEvents: () => void;
  unsubscribeFromEvents: () => void;
}

const useComplianceStore = create<ComplianceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        rules: [],
        violations: [],
        audits: [],
        loading: false,
        error: null,
        
        selectedRule: null,
        selectedViolation: null,
        selectedAudit: null,
        filters: {
          category: '',
          severity: '',
          status: '',
          framework: ''
        },
        viewMode: 'list',
        
        analytics: {
          totalRules: 0,
          activeRules: 0,
          violationsBySeverity: {},
          complianceScore: 0,
          recentActivity: []
        },

        // Rule actions
        setRules: (rules) => set({ rules }),
        
        addRule: (rule) => {
          set((state) => ({ rules: [...state.rules, rule] }));
          complianceEventBus.publishRuleCreated(rule);
        },
        
        updateRule: (id, updates) => {
          set((state) => ({
            rules: state.rules.map(rule => 
              rule.id === id ? { ...rule, ...updates, metadata: { ...rule.metadata, updatedAt: new Date() } } : rule
            )
          }));
          const updatedRule = get().rules.find(rule => rule.id === id);
          if (updatedRule) {
            complianceEventBus.publishRuleUpdated(updatedRule);
          }
        },
        
        deleteRule: (id) => {
          set((state) => ({ rules: state.rules.filter(rule => rule.id !== id) }));
        },

        // Violation actions
        setViolations: (violations) => set({ violations }),
        
        addViolation: (violation) => {
          set((state) => ({ violations: [...state.violations, violation] }));
          complianceEventBus.publishViolationDetected(violation);
        },
        
        updateViolation: (id, updates) => {
          set((state) => ({
            violations: state.violations.map(violation => 
              violation.id === id ? { ...violation, ...updates } : violation
            )
          }));
        },
        
        resolveViolation: (id) => {
          set((state) => ({
            violations: state.violations.map(violation => 
              violation.id === id 
                ? { ...violation, status: 'RESOLVED', resolvedAt: new Date() }
                : violation
            )
          }));
        },

        // Audit actions
        setAudits: (audits) => set({ audits }),
        
        addAudit: (audit) => {
          set((state) => ({ audits: [...state.audits, audit] }));
          complianceEventBus.publishAuditCompleted(audit);
        },
        
        updateAudit: (id, updates) => {
          set((state) => ({
            audits: state.audits.map(audit => 
              audit.id === id ? { ...audit, ...updates } : audit
            )
          }));
        },

        // UI actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        setSelectedRule: (rule) => set({ selectedRule: rule }),
        setSelectedViolation: (violation) => set({ selectedViolation: violation }),
        setSelectedAudit: (audit) => set({ selectedAudit: audit }),
        
        setFilters: (filters) => set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
        
        setViewMode: (viewMode) => set({ viewMode }),

        // Analytics
        updateAnalytics: () => {
          const state = get();
          const totalRules = state.rules.length;
          const activeRules = state.rules.filter(rule => rule.status === 'ACTIVE').length;
          
          const violationsBySeverity = state.violations.reduce((acc, violation) => {
            acc[violation.severity] = (acc[violation.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const complianceScore = totalRules > 0 
            ? ((totalRules - state.violations.filter(v => v.status === 'OPEN').length) / totalRules) * 100
            : 100;
          
          const recentActivity = [
            ...state.rules.slice(-5).map(rule => ({ type: 'rule', data: rule, timestamp: rule.metadata.updatedAt })),
            ...state.violations.slice(-5).map(violation => ({ type: 'violation', data: violation, timestamp: violation.detectedAt })),
            ...state.audits.slice(-5).map(audit => ({ type: 'audit', data: audit, timestamp: audit.startDate }))
          ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
          
          set({
            analytics: {
              totalRules,
              activeRules,
              violationsBySeverity,
              complianceScore,
              recentActivity
            }
          });
        },

        // Bulk operations
        bulkUpdateRules: (ids, updates) => {
          set((state) => ({
            rules: state.rules.map(rule => 
              ids.includes(rule.id) 
                ? { ...rule, ...updates, metadata: { ...rule.metadata, updatedAt: new Date() } }
                : rule
            )
          }));
        },
        
        bulkDeleteRules: (ids) => {
          set((state) => ({ rules: state.rules.filter(rule => !ids.includes(rule.id)) }));
        },
        
        bulkResolveViolations: (ids) => {
          set((state) => ({
            violations: state.violations.map(violation => 
              ids.includes(violation.id)
                ? { ...violation, status: 'RESOLVED', resolvedAt: new Date() }
                : violation
            )
          }));
        },

        // Search and filtering
        searchRules: (query) => {
          const state = get();
          return state.rules.filter(rule => 
            rule.name.toLowerCase().includes(query.toLowerCase()) ||
            rule.description.toLowerCase().includes(query.toLowerCase()) ||
            rule.category.toLowerCase().includes(query.toLowerCase())
          );
        },
        
        getRulesByCategory: (category) => {
          const state = get();
          return state.rules.filter(rule => rule.category === category);
        },
        
        getViolationsBySeverity: (severity) => {
          const state = get();
          return state.violations.filter(violation => violation.severity === severity);
        },
        
        getActiveAudits: () => {
          const state = get();
          return state.audits.filter(audit => audit.status === 'IN_PROGRESS');
        },

        // Real-time updates
        subscribeToEvents: () => {
          complianceEventBus.on('compliance:rule:created', (event) => {
            get().addRule(event.payload);
          });
          
          complianceEventBus.on('compliance:rule:updated', (event) => {
            get().updateRule(event.payload.id, event.payload);
          });
          
          complianceEventBus.on('compliance:violation:detected', (event) => {
            get().addViolation(event.payload);
          });
          
          complianceEventBus.on('compliance:audit:completed', (event) => {
            get().addAudit(event.payload);
          });
        },
        
        unsubscribeFromEvents: () => {
          complianceEventBus.removeAllListeners();
        }
      }),
      {
        name: 'compliance-store',
        partialize: (state) => ({
          rules: state.rules,
          violations: state.violations,
          audits: state.audits,
          filters: state.filters,
          viewMode: state.viewMode
        })
      }
    )
  )
);

export default useComplianceStore;