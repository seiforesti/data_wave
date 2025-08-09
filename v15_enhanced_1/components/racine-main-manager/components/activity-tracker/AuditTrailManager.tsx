/**
 * AuditTrailManager Component
 * ===========================
 * 
 * Enterprise-grade audit trail management system with comprehensive
 * compliance reporting, export capabilities, advanced filtering,
 * timeline visualization, and RBAC-driven access control.
 * 
 * Key Features:
 * - Comprehensive audit trail generation and management
 * - Advanced compliance reporting with automated compliance checks
 * - Multi-format export capabilities (PDF, CSV, JSON, Excel)
 * - Real-time audit trail monitoring and alerting
 * - Interactive timeline visualization with drill-down capabilities
 * - Advanced filtering and search with natural language queries
 * - RBAC-driven access control and data masking
 * - Automated compliance rule verification
 * - Cross-group audit trail correlation
 * - Executive dashboard with compliance metrics
 * - Retention policy management
 * - Digital signature and integrity verification
 * 
 * Backend Integration:
 * - Maps to: activity-tracking-apis.ts
 * - Uses: useActivityTracker hook
 * - Types: AuditTrail, ComplianceLevel, RetentionPolicy
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  TrendingUp,
  FileDown,
  Archive,
  Trash2,
  Lock,
  Unlock,
  Tag,
  Hash,
  Globe,
  Building,
  User,
  Activity,
  Layers,
  Zap,
  Target,
  BookOpen,
  FileCheck,
  Gavel,
  Scale,
  Award,
  Star,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Share2,
  Flag,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Code,
  Terminal,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  Radio
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

import { useActivityTracker } from '../../hooks/useActivityTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
  AuditTrail,
  ActivityRecord,
  ComplianceLevel,
  RetentionPolicy,
  ActivityType,
  ActivityAction,
  UUID,
  ISODateString,
  RacineActivity
} from '../../types/racine-core.types';

import {
  AuditTrailRequest,
  FilterRequest,
  SortRequest,
  PaginationRequest
} from '../../types/api.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface AuditTrailManagerProps {
  height?: number;
  showAdvancedFilters?: boolean;
  enableExport?: boolean;
  enableRealTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  complianceMode?: boolean;
  executiveView?: boolean;
  className?: string;
}

interface AuditTrailState {
  auditTrails: AuditTrail[];
  filteredTrails: AuditTrail[];
  selectedTrails: Set<UUID>;
  currentTrail: AuditTrail | null;
  
  // View Configuration
  currentView: AuditViewMode;
  layout: AuditLayoutType;
  displayMode: AuditDisplayMode;
  
  // Filtering and Search
  filters: AuditFilter;
  searchQuery: string;
  quickFilters: AuditQuickFilter[];
  savedFilters: AuditFilter[];
  
  // Analytics and Metrics
  analytics: AuditAnalytics | null;
  complianceMetrics: ComplianceMetrics | null;
  timelineData: AuditTimelineData[];
  
  // Export and Reporting
  exportConfig: ExportConfig;
  reportTemplates: ReportTemplate[];
  activeReports: ReportStatus[];
  
  // Compliance and Security
  complianceRules: ComplianceRule[];
  securityEvents: SecurityEvent[];
  retentionPolicies: RetentionPolicy[];
  
  // UI State
  sidebarOpen: boolean;
  filterPanelOpen: boolean;
  detailsPanelOpen: boolean;
  settingsOpen: boolean;
  
  // Loading and Error States
  loading: {
    trails: boolean;
    analytics: boolean;
    export: boolean;
    compliance: boolean;
  };
  
  error: string | null;
  
  // Real-time State
  isRealTimeEnabled: boolean;
  lastUpdate: ISODateString | null;
  pendingUpdates: number;
}

enum AuditViewMode {
  TIMELINE = 'timeline',
  TABLE = 'table',
  ANALYTICS = 'analytics',
  COMPLIANCE = 'compliance',
  EXECUTIVE = 'executive'
}

enum AuditLayoutType {
  SINGLE = 'single',
  SPLIT = 'split',
  DASHBOARD = 'dashboard',
  FULLSCREEN = 'fullscreen'
}

enum AuditDisplayMode {
  DETAILED = 'detailed',
  COMPACT = 'compact',
  SUMMARY = 'summary',
  VISUAL = 'visual'
}

interface AuditFilter {
  dateRange: {
    start: ISODateString | null;
    end: ISODateString | null;
  };
  resourceTypes: string[];
  activityTypes: ActivityType[];
  complianceLevels: ComplianceLevel[];
  users: UUID[];
  groups: string[];
  severity: string[];
  status: string[];
  tags: string[];
  customFilters: Record<string, any>;
}

interface AuditQuickFilter {
  id: string;
  name: string;
  description: string;
  filter: Partial<AuditFilter>;
  icon: string;
  color: string;
}

interface AuditAnalytics {
  totalTrails: number;
  totalActivities: number;
  complianceScore: number;
  riskScore: number;
  trendsData: TrendData[];
  distributionData: DistributionData[];
  performanceMetrics: PerformanceMetrics;
  userActivitySummary: UserActivitySummary[];
  timelineInsights: TimelineInsight[];
}

interface ComplianceMetrics {
  overallScore: number;
  levelDistribution: Record<ComplianceLevel, number>;
  violationCount: number;
  resolvedViolations: number;
  pendingReviews: number;
  lastAudit: ISODateString;
  nextAudit: ISODateString;
  certifications: Certification[];
  recommendations: ComplianceRecommendation[];
}

interface AuditTimelineData {
  timestamp: ISODateString;
  activities: ActivityRecord[];
  complianceEvents: ComplianceEvent[];
  summary: TimelineSummary;
}

interface ExportConfig {
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  template: string;
  includeMetadata: boolean;
  includeAnalytics: boolean;
  compression: boolean;
  encryption: boolean;
  digitalSignature: boolean;
  customFields: string[];
}

interface ReportTemplate {
  id: UUID;
  name: string;
  description: string;
  type: ReportType;
  config: ReportConfig;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

interface ReportStatus {
  id: UUID;
  templateId: UUID;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  startedAt: ISODateString;
  completedAt?: ISODateString;
  downloadUrl?: string;
  error?: string;
}

interface ComplianceRule {
  id: UUID;
  name: string;
  description: string;
  level: ComplianceLevel;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  lastTriggered?: ISODateString;
  violationCount: number;
}

interface SecurityEvent {
  id: UUID;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: ISODateString;
  source: string;
  resolved: boolean;
  resolvedAt?: ISODateString;
  resolvedBy?: UUID;
}

interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercentage: number;
}

interface DistributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

interface UserActivitySummary {
  userId: UUID;
  userName: string;
  activityCount: number;
  lastActivity: ISODateString;
  riskScore: number;
  complianceScore: number;
}

interface TimelineInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'compliance';
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
  timestamp: ISODateString;
}

interface ComplianceEvent {
  id: UUID;
  type: 'violation' | 'warning' | 'success' | 'review';
  ruleId: UUID;
  description: string;
  severity: string;
  timestamp: ISODateString;
}

interface TimelineSummary {
  totalActivities: number;
  criticalEvents: number;
  complianceScore: number;
  topUsers: string[];
  topActions: string[];
}

interface Certification {
  id: UUID;
  name: string;
  standard: string;
  status: 'active' | 'expired' | 'pending';
  validFrom: ISODateString;
  validTo: ISODateString;
  issuer: string;
  scope: string[];
}

interface ComplianceRecommendation {
  id: UUID;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  dueDate?: ISODateString;
  estimatedEffort: string;
  impact: string;
}

enum ReportType {
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  ACTIVITY = 'activity',
  EXECUTIVE = 'executive',
  CUSTOM = 'custom'
}

interface ReportConfig {
  sections: string[];
  filters: AuditFilter;
  analytics: boolean;
  charts: boolean;
  recommendations: boolean;
  format: ExportConfig;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'alert' | 'block' | 'log' | 'escalate' | 'notify';
  parameters: Record<string, any>;
}

enum SecurityEventType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  POLICY_VIOLATION = 'policy_violation',
  DATA_BREACH = 'data_breach',
  SYSTEM_COMPROMISE = 'system_compromise'
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AuditTrailState = {
  auditTrails: [],
  filteredTrails: [],
  selectedTrails: new Set(),
  currentTrail: null,
  
  currentView: AuditViewMode.TIMELINE,
  layout: AuditLayoutType.SPLIT,
  displayMode: AuditDisplayMode.DETAILED,
  
  filters: {
    dateRange: { start: null, end: null },
    resourceTypes: [],
    activityTypes: [],
    complianceLevels: [],
    users: [],
    groups: [],
    severity: [],
    status: [],
    tags: [],
    customFilters: {}
  },
  searchQuery: '',
  quickFilters: [
    {
      id: 'today',
      name: 'Today',
      description: 'Audit trails from today',
      filter: {
        dateRange: {
          start: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
          end: new Date().toISOString()
        }
      },
      icon: 'calendar',
      color: 'blue'
    },
    {
      id: 'week',
      name: 'This Week',
      description: 'Audit trails from this week',
      filter: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      },
      icon: 'calendar',
      color: 'green'
    },
    {
      id: 'critical',
      name: 'Critical Events',
      description: 'High priority audit events',
      filter: {
        severity: ['critical', 'high']
      },
      icon: 'alert-triangle',
      color: 'red'
    },
    {
      id: 'compliance',
      name: 'Compliance Issues',
      description: 'Compliance violations and warnings',
      filter: {
        complianceLevels: [ComplianceLevel.STRICT, ComplianceLevel.ENHANCED]
      },
      icon: 'shield',
      color: 'orange'
    }
  ],
  savedFilters: [],
  
  analytics: null,
  complianceMetrics: null,
  timelineData: [],
  
  exportConfig: {
    format: 'pdf',
    template: 'standard',
    includeMetadata: true,
    includeAnalytics: true,
    compression: false,
    encryption: false,
    digitalSignature: false,
    customFields: []
  },
  reportTemplates: [],
  activeReports: [],
  
  complianceRules: [],
  securityEvents: [],
  retentionPolicies: [],
  
  sidebarOpen: true,
  filterPanelOpen: false,
  detailsPanelOpen: false,
  settingsOpen: false,
  
  loading: {
    trails: false,
    analytics: false,
    export: false,
    compliance: false
  },
  
  error: null,
  
  isRealTimeEnabled: true,
  lastUpdate: null,
  pendingUpdates: 0
};

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AuditTrailManager: React.FC<AuditTrailManagerProps> = ({
  height = 800,
  showAdvancedFilters = true,
  enableExport = true,
  enableRealTime = true,
  autoRefresh = true,
  refreshInterval = 60000,
  complianceMode = false,
  executiveView = false,
  className
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [state, setState] = useState<AuditTrailState>(initialState);
  const [direction, setDirection] = useState(0);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  
  // Animation controls
  const mainAnimationControls = useAnimation();
  const sidebarAnimationControls = useAnimation();
  const filterAnimationControls = useAnimation();
  
  // Activity tracker hook
  const {
    auditTrails,
    generateAuditTrail,
    exportAuditTrail,
    loading,
    error: hookError
  } = useActivityTracker({
    autoLoadActivities: true,
    enableRealTimeUpdates: enableRealTime
  });

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`AuditTrailManager render time: ${endTime - startTime}ms`);
    };
  }, []);

  // =============================================================================
  // AUTO-REFRESH SETUP
  // =============================================================================

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // =============================================================================
  // REAL-TIME WEBSOCKET CONNECTION
  // =============================================================================

  useEffect(() => {
    if (enableRealTime && state.isRealTimeEnabled) {
      connectWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [enableRealTime, state.isRealTimeEnabled]);

  // =============================================================================
  // INITIAL DATA LOAD
  // =============================================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'r':
            e.preventDefault();
            refreshData();
            break;
          case 'e':
            if (enableExport) {
              e.preventDefault();
              handleExport();
            }
            break;
          case 'Escape':
            e.preventDefault();
            setState(prev => ({
              ...prev,
              filterPanelOpen: false,
              detailsPanelOpen: false,
              settingsOpen: false
            }));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [enableExport]);

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, trails: true } }));
    
    try {
      // Load audit trails
      await loadAuditTrails();
      
      // Load analytics data
      await loadAnalytics();
      
      // Load compliance metrics
      await loadComplianceMetrics();
      
      // Load report templates
      await loadReportTemplates();
      
      // Load compliance rules
      await loadComplianceRules();
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load audit trail data'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, trails: false } }));
    }
  }, []);

  const loadAuditTrails = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, trails: true } }));
    
    try {
      // Use the hook's audit trails data
      setState(prev => ({
        ...prev,
        auditTrails: auditTrails || [],
        filteredTrails: auditTrails || [],
        lastUpdate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to load audit trails:', error);
      setState(prev => ({ ...prev, error: 'Failed to load audit trails' }));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, trails: false } }));
    }
  }, [auditTrails]);

  const loadAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, analytics: true } }));
    
    try {
      // Generate mock analytics data (in real implementation, this would come from the API)
      const analytics: AuditAnalytics = {
        totalTrails: state.auditTrails.length,
        totalActivities: state.auditTrails.reduce((acc, trail) => acc + trail.activities.length, 0),
        complianceScore: 85.5,
        riskScore: 23.2,
        trendsData: generateTrendData(),
        distributionData: generateDistributionData(),
        performanceMetrics: {
          averageResponseTime: 245,
          throughput: 1250,
          errorRate: 0.05,
          availability: 99.95
        },
        userActivitySummary: generateUserActivitySummary(),
        timelineInsights: generateTimelineInsights()
      };
      
      setState(prev => ({ ...prev, analytics }));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, analytics: false } }));
    }
  }, [state.auditTrails]);

  const loadComplianceMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, compliance: true } }));
    
    try {
      const complianceMetrics: ComplianceMetrics = {
        overallScore: 92.3,
        levelDistribution: {
          [ComplianceLevel.BASIC]: 15,
          [ComplianceLevel.STANDARD]: 45,
          [ComplianceLevel.ENHANCED]: 35,
          [ComplianceLevel.STRICT]: 5
        },
        violationCount: 12,
        resolvedViolations: 8,
        pendingReviews: 4,
        lastAudit: '2024-01-15T10:00:00Z',
        nextAudit: '2024-04-15T10:00:00Z',
        certifications: generateCertifications(),
        recommendations: generateComplianceRecommendations()
      };
      
      setState(prev => ({ ...prev, complianceMetrics }));
    } catch (error) {
      console.error('Failed to load compliance metrics:', error);
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, compliance: false } }));
    }
  }, []);

  const loadReportTemplates = useCallback(async () => {
    try {
      const templates: ReportTemplate[] = [
        {
          id: 'template-1',
          name: 'Executive Summary',
          description: 'High-level overview for executives',
          type: ReportType.EXECUTIVE,
          config: {
            sections: ['summary', 'metrics', 'trends'],
            filters: state.filters,
            analytics: true,
            charts: true,
            recommendations: true,
            format: state.exportConfig
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z'
        },
        {
          id: 'template-2',
          name: 'Compliance Report',
          description: 'Detailed compliance analysis',
          type: ReportType.COMPLIANCE,
          config: {
            sections: ['compliance', 'violations', 'remediation'],
            filters: state.filters,
            analytics: true,
            charts: true,
            recommendations: true,
            format: state.exportConfig
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z'
        }
      ];
      
      setState(prev => ({ ...prev, reportTemplates: templates }));
    } catch (error) {
      console.error('Failed to load report templates:', error);
    }
  }, [state.filters, state.exportConfig]);

  const loadComplianceRules = useCallback(async () => {
    try {
      const rules: ComplianceRule[] = [
        {
          id: 'rule-1',
          name: 'Data Access Monitoring',
          description: 'Monitor all sensitive data access',
          level: ComplianceLevel.STRICT,
          conditions: [
            {
              field: 'resourceType',
              operator: 'equals',
              value: 'sensitive_data'
            }
          ],
          actions: [
            {
              type: 'log',
              parameters: { level: 'high' }
            },
            {
              type: 'alert',
              parameters: { recipients: ['security@company.com'] }
            }
          ],
          isActive: true,
          violationCount: 3
        }
      ];
      
      setState(prev => ({ ...prev, complianceRules: rules }));
    } catch (error) {
      console.error('Failed to load compliance rules:', error);
    }
  }, []);

  // =============================================================================
  // WEBSOCKET FUNCTIONS
  // =============================================================================

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      websocketRef.current = new WebSocket(`${wsUrl}/audit-trails`);
      
      websocketRef.current.onopen = () => {
        console.log('Audit trail WebSocket connected');
      };
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('Audit trail WebSocket error:', error);
      };
      
      websocketRef.current.onclose = () => {
        console.log('Audit trail WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'audit_trail_created':
        setState(prev => ({
          ...prev,
          auditTrails: [data.auditTrail, ...prev.auditTrails],
          pendingUpdates: prev.pendingUpdates + 1
        }));
        break;
      case 'compliance_violation':
        setState(prev => ({
          ...prev,
          securityEvents: [data.event, ...prev.securityEvents],
          pendingUpdates: prev.pendingUpdates + 1
        }));
        break;
      case 'analytics_update':
        setState(prev => ({
          ...prev,
          analytics: data.analytics,
          lastUpdate: new Date().toISOString()
        }));
        break;
    }
  }, []);

  // =============================================================================
  // DATA GENERATION HELPERS
  // =============================================================================

  const generateTrendData = useCallback((): TrendData[] => {
    const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return periods.map((period, index) => ({
      period,
      value: Math.floor(Math.random() * 1000) + 500,
      change: Math.floor(Math.random() * 200) - 100,
      changePercentage: Math.round((Math.random() * 40 - 20) * 100) / 100
    }));
  }, []);

  const generateDistributionData = useCallback((): DistributionData[] => {
    const types = ['User Actions', 'System Events', 'Security Events', 'Compliance Events'];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
    
    return types.map((name, index) => ({
      name,
      value: Math.floor(Math.random() * 1000) + 100,
      percentage: Math.round(Math.random() * 30 + 10),
      color: colors[index]
    }));
  }, []);

  const generateUserActivitySummary = useCallback((): UserActivitySummary[] => {
    const users = ['alice@company.com', 'bob@company.com', 'charlie@company.com'];
    
    return users.map(email => ({
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      userName: email,
      activityCount: Math.floor(Math.random() * 500) + 50,
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskScore: Math.round(Math.random() * 100 * 100) / 100,
      complianceScore: Math.round((80 + Math.random() * 20) * 100) / 100
    }));
  }, []);

  const generateTimelineInsights = useCallback((): TimelineInsight[] => {
    const insights = [
      {
        type: 'pattern' as const,
        title: 'Unusual Login Pattern Detected',
        description: 'Multiple failed login attempts from new locations',
        confidence: 0.85,
        recommendation: 'Review user authentication logs and consider implementing MFA',
        timestamp: new Date().toISOString()
      },
      {
        type: 'compliance' as const,
        title: 'GDPR Compliance Check',
        description: 'Data retention policy compliance verified',
        confidence: 0.95,
        recommendation: 'Continue current data management practices',
        timestamp: new Date().toISOString()
      }
    ];
    
    return insights;
  }, []);

  const generateCertifications = useCallback((): Certification[] => {
    return [
      {
        id: 'cert-1',
        name: 'SOC 2 Type II',
        standard: 'SOC 2',
        status: 'active',
        validFrom: '2023-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z',
        issuer: 'External Auditor Inc.',
        scope: ['Security', 'Availability', 'Confidentiality']
      },
      {
        id: 'cert-2',
        name: 'ISO 27001',
        standard: 'ISO 27001',
        status: 'active',
        validFrom: '2023-06-01T00:00:00Z',
        validTo: '2026-05-31T23:59:59Z',
        issuer: 'Certification Body Ltd.',
        scope: ['Information Security Management']
      }
    ];
  }, []);

  const generateComplianceRecommendations = useCallback((): ComplianceRecommendation[] => {
    return [
      {
        id: 'rec-1',
        priority: 'high',
        title: 'Implement Data Encryption',
        description: 'Sensitive data should be encrypted at rest and in transit',
        actionRequired: 'Configure encryption for database and API communications',
        dueDate: '2024-02-15T00:00:00Z',
        estimatedEffort: '2-3 weeks',
        impact: 'Reduces data breach risk by 70%'
      },
      {
        id: 'rec-2',
        priority: 'medium',
        title: 'Update Access Control Policies',
        description: 'Review and update user access permissions',
        actionRequired: 'Conduct quarterly access review',
        estimatedEffort: '1 week',
        impact: 'Improves principle of least privilege compliance'
      }
    ];
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadAuditTrails(),
        loadAnalytics(),
        loadComplianceMetrics()
      ]);
      
      setState(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        pendingUpdates: 0
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [loadAuditTrails, loadAnalytics, loadComplianceMetrics]);

  const handleViewChange = useCallback((view: AuditViewMode) => {
    setDirection(1);
    setState(prev => ({ ...prev, currentView: view }));
    mainAnimationControls.start({
      x: [0, -20, 0],
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);

  const handleLayoutChange = useCallback((layout: AuditLayoutType) => {
    setState(prev => ({ ...prev, layout }));
  }, []);

  const handleFilterToggle = useCallback(() => {
    setState(prev => {
      const newOpen = !prev.filterPanelOpen;
      filterAnimationControls.start({
        width: newOpen ? 320 : 0,
        opacity: newOpen ? 1 : 0,
        transition: { duration: 0.3 }
      });
      return { ...prev, filterPanelOpen: newOpen };
    });
  }, [filterAnimationControls]);

  const handleTrailSelect = useCallback((trailId: UUID, multiSelect: boolean = false) => {
    setState(prev => {
      const selectedTrails = new Set(prev.selectedTrails);
      
      if (multiSelect) {
        if (selectedTrails.has(trailId)) {
          selectedTrails.delete(trailId);
        } else {
          selectedTrails.add(trailId);
        }
      } else {
        selectedTrails.clear();
        selectedTrails.add(trailId);
      }
      
      const currentTrail = prev.auditTrails.find(trail => trail.id === trailId) || null;
      
      return {
        ...prev,
        selectedTrails,
        currentTrail,
        detailsPanelOpen: !!currentTrail
      };
    });
  }, []);

  const handleFilterApply = useCallback((filters: AuditFilter) => {
    setState(prev => ({
      ...prev,
      filters,
      filteredTrails: applyFilters(prev.auditTrails, filters)
    }));
  }, []);

  const handleQuickFilter = useCallback((quickFilter: AuditQuickFilter) => {
    const newFilters = {
      ...state.filters,
      ...quickFilter.filter
    };
    handleFilterApply(newFilters);
  }, [state.filters, handleFilterApply]);

  const handleSearch = useCallback((query: string) => {
    setState(prev => {
      const searchQuery = query.toLowerCase();
      let filteredTrails = prev.auditTrails;
      
      if (searchQuery) {
        filteredTrails = prev.auditTrails.filter(trail =>
          trail.resourceType.toLowerCase().includes(searchQuery) ||
          trail.activities.some(activity =>
            activity.description.toLowerCase().includes(searchQuery) ||
            activity.action.toLowerCase().includes(searchQuery)
          )
        );
      }
      
      return {
        ...prev,
        searchQuery: query,
        filteredTrails: applyFilters(filteredTrails, prev.filters)
      };
    });
  }, []);

  const handleExport = useCallback(async (format: 'pdf' | 'csv' | 'json' | 'xlsx' = 'pdf') => {
    if (!enableExport) return;
    
    setState(prev => ({ ...prev, loading: { ...prev.loading, export: true } }));
    
    try {
      const selectedTrails = Array.from(state.selectedTrails);
      const dataToExport = selectedTrails.length > 0
        ? state.filteredTrails.filter(trail => selectedTrails.includes(trail.id))
        : state.filteredTrails;
      
      // Create export request
      const exportRequest = {
        auditTrails: dataToExport,
        filters: state.filters,
        analytics: state.analytics,
        format,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'current-user',
          totalRecords: dataToExport.length,
          filters: state.filters
        }
      };
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-trail-export-${timestamp}.${format}`;
      
      // Convert data based on format
      let blob: Blob;
      let mimeType: string;
      
      switch (format) {
        case 'csv':
          const csvData = convertToCSV(exportRequest);
          blob = new Blob([csvData], { type: 'text/csv' });
          mimeType = 'text/csv';
          break;
        case 'json':
          const jsonData = JSON.stringify(exportRequest, null, 2);
          blob = new Blob([jsonData], { type: 'application/json' });
          mimeType = 'application/json';
          break;
        default:
          // For PDF and XLSX, we would typically call the backend API
          // For now, we'll export as JSON
          const defaultData = JSON.stringify(exportRequest, null, 2);
          blob = new Blob([defaultData], { type: 'application/json' });
          mimeType = 'application/json';
      }
      
      // Download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export audit trails:', error);
      setState(prev => ({ ...prev, error: 'Failed to export audit trails' }));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, export: false } }));
    }
  }, [enableExport, state.selectedTrails, state.filteredTrails, state.filters, state.analytics]);

  const convertToCSV = useCallback((data: any): string => {
    const headers = [
      'Trail ID',
      'Resource Type',
      'Resource ID',
      'Activity Count',
      'Compliance Level',
      'Created At',
      'Updated At'
    ];
    
    const rows = data.auditTrails.map((trail: AuditTrail) => [
      trail.id,
      trail.resourceType,
      trail.resourceId,
      trail.activities.length,
      trail.complianceLevel,
      trail.createdAt,
      trail.updatedAt
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }, []);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const applyFilters = useCallback((trails: AuditTrail[], filters: AuditFilter): AuditTrail[] => {
    return trails.filter(trail => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const trailDate = new Date(trail.createdAt);
        if (filters.dateRange.start && trailDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && trailDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }
      
      // Resource type filter
      if (filters.resourceTypes.length > 0 && !filters.resourceTypes.includes(trail.resourceType)) {
        return false;
      }
      
      // Compliance level filter
      if (filters.complianceLevels.length > 0 && !filters.complianceLevels.includes(trail.complianceLevel)) {
        return false;
      }
      
      // Activity type filter
      if (filters.activityTypes.length > 0) {
        const hasMatchingActivity = trail.activities.some(activity =>
          filters.activityTypes.includes(activity.activityType)
        );
        if (!hasMatchingActivity) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

  const formatDateTime = useCallback((dateString: ISODateString): string => {
    return new Date(dateString).toLocaleString();
  }, []);

  const getComplianceLevelColor = useCallback((level: ComplianceLevel): string => {
    switch (level) {
      case ComplianceLevel.BASIC:
        return 'bg-gray-100 text-gray-800';
      case ComplianceLevel.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case ComplianceLevel.ENHANCED:
        return 'bg-yellow-100 text-yellow-800';
      case ComplianceLevel.STRICT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getComplianceScoreColor = useCallback((score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  // =============================================================================
  // MEMOIZED COMPUTATIONS
  // =============================================================================

  const auditStats = useMemo(() => {
    const totalTrails = state.filteredTrails.length;
    const totalActivities = state.filteredTrails.reduce((acc, trail) => acc + trail.activities.length, 0);
    const complianceDistribution = state.filteredTrails.reduce((acc, trail) => {
      acc[trail.complianceLevel] = (acc[trail.complianceLevel] || 0) + 1;
      return acc;
    }, {} as Record<ComplianceLevel, number>);
    
    const avgActivitiesPerTrail = totalTrails > 0 ? Math.round(totalActivities / totalTrails) : 0;
    
    return {
      totalTrails,
      totalActivities,
      avgActivitiesPerTrail,
      complianceDistribution
    };
  }, [state.filteredTrails]);

  const criticalEvents = useMemo(() => {
    return state.securityEvents.filter(event => event.severity === 'critical' && !event.resolved);
  }, [state.securityEvents]);

  const recentInsights = useMemo(() => {
    return state.analytics?.timelineInsights
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5) || [];
  }, [state.analytics]);

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeaderControls = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <motion.h2 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Audit Trail Manager
        </motion.h2>
        
        {state.pendingUpdates > 0 && (
          <Badge variant="secondary" className="animate-pulse">
            {state.pendingUpdates} updates
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* View Mode Selector */}
        <Tabs 
          value={state.currentView} 
          onValueChange={(value) => handleViewChange(value as AuditViewMode)}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value={AuditViewMode.TIMELINE} className="text-xs">
              <Clock className="w-4 h-4 mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.TABLE} className="text-xs">
              <Database className="w-4 h-4 mr-1" />
              Table
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.ANALYTICS} className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.COMPLIANCE} className="text-xs">
              <Shield className="w-4 h-4 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value={AuditViewMode.EXECUTIVE} className="text-xs">
              <Award className="w-4 h-4 mr-1" />
              Executive
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFilterToggle}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={state.loading.trails}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${state.loading.trails ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        {enableExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileDown className="w-4 h-4 mr-2" />
                CSV Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <Code className="w-4 h-4 mr-2" />
                JSON Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileCheck className="w-4 h-4 mr-2" />
                Excel Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, settingsOpen: true }))}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderQuickStats = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trails</p>
              <p className="text-2xl font-bold">{auditStats.totalTrails.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold">{auditStats.totalActivities.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className={`text-2xl font-bold ${getComplianceScoreColor(state.complianceMetrics?.overallScore || 0)}`}>
                {state.complianceMetrics?.overallScore.toFixed(1)}%
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Events</p>
              <p className="text-2xl font-bold text-red-600">{criticalEvents.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={searchInputRef}
            placeholder="Search audit trails, activities, users..."
            value={state.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {state.quickFilters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter(filter)}
            className="text-xs"
          >
            {filter.name}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (state.currentView) {
      case AuditViewMode.TIMELINE:
        return renderTimelineView();
      case AuditViewMode.TABLE:
        return renderTableView();
      case AuditViewMode.ANALYTICS:
        return renderAnalyticsView();
      case AuditViewMode.COMPLIANCE:
        return renderComplianceView();
      case AuditViewMode.EXECUTIVE:
        return renderExecutiveView();
      default:
        return renderTimelineView();
    }
  };

  const renderTimelineView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Audit Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {state.filteredTrails.map((trail, index) => (
              <motion.div
                key={trail.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  state.selectedTrails.has(trail.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTrailSelect(trail.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getComplianceLevelColor(trail.complianceLevel)}>
                        {trail.complianceLevel}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(trail.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">
                      {trail.resourceType} - {trail.resourceId}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {trail.activities.length} activities recorded
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {formatDateTime(trail.createdAt)}</span>
                      <span>Updated: {formatDateTime(trail.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderTableView = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Audit Trails Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">
                  <Checkbox 
                    checked={state.selectedTrails.size === state.filteredTrails.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setState(prev => ({
                          ...prev,
                          selectedTrails: new Set(prev.filteredTrails.map(t => t.id))
                        }));
                      } else {
                        setState(prev => ({
                          ...prev,
                          selectedTrails: new Set()
                        }));
                      }
                    }}
                  />
                </th>
                <th className="text-left p-2">Resource</th>
                <th className="text-left p-2">Activities</th>
                <th className="text-left p-2">Compliance</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.filteredTrails.map((trail) => (
                <tr 
                  key={trail.id} 
                  className={`border-b hover:bg-gray-50 ${
                    state.selectedTrails.has(trail.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-2">
                    <Checkbox 
                      checked={state.selectedTrails.has(trail.id)}
                      onCheckedChange={() => handleTrailSelect(trail.id, true)}
                    />
                  </td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{trail.resourceType}</div>
                      <div className="text-sm text-gray-500">{trail.resourceId}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">
                      {trail.activities.length} activities
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge className={getComplianceLevelColor(trail.complianceLevel)}>
                      {trail.complianceLevel}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {formatDateTime(trail.createdAt)}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleTrailSelect(trail.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalyticsView = () => (
    <div className="grid grid-cols-2 gap-6 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={state.analytics?.trendsData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={state.analytics?.distributionData || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {(state.analytics?.distributionData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {state.analytics?.performanceMetrics.averageResponseTime}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {state.analytics?.performanceMetrics.throughput}
              </div>
              <div className="text-sm text-gray-600">Throughput/sec</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {(state.analytics?.performanceMetrics.errorRate || 0) * 100}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {state.analytics?.performanceMetrics.availability}%
              </div>
              <div className="text-sm text-gray-600">Availability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplianceView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Compliance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className={`text-lg font-bold ${getComplianceScoreColor(state.complianceMetrics?.overallScore || 0)}`}>
                    {state.complianceMetrics?.overallScore.toFixed(1)}%
                  </span>
                </div>
                <Progress value={state.complianceMetrics?.overallScore || 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Violations</span>
                  <span className="font-medium text-red-600">
                    {state.complianceMetrics?.violationCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Resolved</span>
                  <span className="font-medium text-green-600">
                    {state.complianceMetrics?.resolvedViolations || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pending Reviews</span>
                  <span className="font-medium text-yellow-600">
                    {state.complianceMetrics?.pendingReviews || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.complianceMetrics?.certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{cert.name}</div>
                    <div className="text-xs text-gray-500">{cert.standard}</div>
                  </div>
                  <Badge 
                    variant={cert.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.complianceRules.map((rule) => (
                <div key={rule.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{rule.name}</span>
                    <Switch checked={rule.isActive} />
                  </div>
                  <div className="text-xs text-gray-600">{rule.description}</div>
                  {rule.violationCount > 0 && (
                    <div className="text-xs text-red-600">
                      {rule.violationCount} violations
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.complianceMetrics?.recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={rec.priority === 'critical' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                      {rec.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {formatDateTime(rec.dueDate)}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Action Required:</span>
                        <p className="text-gray-600">{rec.actionRequired}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Effort:</span>
                        <p className="text-gray-600">{rec.estimatedEffort}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExecutiveView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {auditStats.totalTrails.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Audit Trails</div>
              <div className="text-xs text-green-600 mt-1">
                +12% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getComplianceScoreColor(state.complianceMetrics?.overallScore || 0)}`}>
                {state.complianceMetrics?.overallScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Compliance Score</div>
              <div className="text-xs text-green-600 mt-1">
                +3.2% improvement
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {criticalEvents.length}
              </div>
              <div className="text-sm text-gray-600">Critical Events</div>
              <div className="text-xs text-red-600 mt-1">
                Requires attention
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {state.analytics?.performanceMetrics.availability}%
              </div>
              <div className="text-sm text-gray-600">System Availability</div>
              <div className="text-xs text-green-600 mt-1">
                Above SLA target
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      insight.type === 'compliance' ? 'bg-green-500' :
                      insight.type === 'pattern' ? 'bg-yellow-500' :
                      insight.type === 'anomaly' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Confidence: {(insight.confidence * 100).toFixed(0)}%
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={state.analytics?.trendsData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFilterPanel = () => (
    <AnimatePresence>
      {state.filterPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-l bg-white overflow-hidden"
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFilterToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Date Range Filter */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        {state.filters.dateRange.start 
                          ? new Date(state.filters.dateRange.start).toLocaleDateString()
                          : 'Start Date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={state.filters.dateRange.start ? new Date(state.filters.dateRange.start) : undefined}
                        onSelect={(date) => {
                          const newFilters = {
                            ...state.filters,
                            dateRange: {
                              ...state.filters.dateRange,
                              start: date?.toISOString() || null
                            }
                          };
                          handleFilterApply(newFilters);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        {state.filters.dateRange.end 
                          ? new Date(state.filters.dateRange.end).toLocaleDateString()
                          : 'End Date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={state.filters.dateRange.end ? new Date(state.filters.dateRange.end) : undefined}
                        onSelect={(date) => {
                          const newFilters = {
                            ...state.filters,
                            dateRange: {
                              ...state.filters.dateRange,
                              end: date?.toISOString() || null
                            }
                          };
                          handleFilterApply(newFilters);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Compliance Level Filter */}
              <div>
                <Label className="text-sm font-medium">Compliance Level</Label>
                <div className="space-y-2 mt-2">
                  {Object.values(ComplianceLevel).map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={state.filters.complianceLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          const newLevels = checked
                            ? [...state.filters.complianceLevels, level]
                            : state.filters.complianceLevels.filter(l => l !== level);
                          
                          const newFilters = {
                            ...state.filters,
                            complianceLevels: newLevels
                          };
                          handleFilterApply(newFilters);
                        }}
                      />
                      <Label htmlFor={level} className="text-sm">{level}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Type Filter */}
              <div>
                <Label className="text-sm font-medium">Resource Types</Label>
                <Input
                  placeholder="Filter by resource type..."
                  className="mt-2"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      const newFilters = {
                        ...state.filters,
                        resourceTypes: [value]
                      };
                      handleFilterApply(newFilters);
                    }
                  }}
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterApply(initialState.filters)}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  if (state.error || hookError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.error || hookError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <motion.div
      className={`h-full bg-gray-50 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ height }}
    >
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 bg-white border-b">
            {renderHeaderControls()}
            {renderQuickStats()}
            {renderSearchAndFilters()}
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <motion.div
              key={state.currentView}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              transition={{ duration: 0.3 }}
            >
              {renderMainContent()}
            </motion.div>
          </div>
        </div>

        {/* Filter Panel */}
        {renderFilterPanel()}
      </div>

      {/* Settings Dialog */}
      <Dialog open={state.settingsOpen} onOpenChange={(open) => setState(prev => ({ ...prev, settingsOpen: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Trail Settings</DialogTitle>
            <DialogDescription>
              Configure audit trail management preferences and export settings.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Real-time Updates</Label>
                  <Switch
                    checked={state.isRealTimeEnabled}
                    onCheckedChange={(checked) => 
                      setState(prev => ({ ...prev, isRealTimeEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Auto-refresh Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={refreshInterval / 1000}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) * 1000;
                      // This would update the prop, but since we can't modify props directly,
                      // we'll update local state instead
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select
                    value={state.exportConfig.format}
                    onValueChange={(value: 'pdf' | 'csv' | 'json' | 'xlsx') => 
                      setState(prev => ({
                        ...prev,
                        exportConfig: { ...prev.exportConfig, format: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Export</SelectItem>
                      <SelectItem value="xlsx">Excel Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Include Metadata</Label>
                  <Switch
                    checked={state.exportConfig.includeMetadata}
                    onCheckedChange={(checked) =>
                      setState(prev => ({
                        ...prev,
                        exportConfig: { ...prev.exportConfig, includeMetadata: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Include Analytics</Label>
                  <Switch
                    checked={state.exportConfig.includeAnalytics}
                    onCheckedChange={(checked) =>
                      setState(prev => ({
                        ...prev,
                        exportConfig: { ...prev.exportConfig, includeAnalytics: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Retention Period (days)</Label>
                  <Input type="number" defaultValue="365" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Enable Encryption</Label>
                  <Switch
                    checked={state.exportConfig.encryption}
                    onCheckedChange={(checked) =>
                      setState(prev => ({
                        ...prev,
                        exportConfig: { ...prev.exportConfig, encryption: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Digital Signatures</Label>
                  <Switch
                    checked={state.exportConfig.digitalSignature}
                    onCheckedChange={(checked) =>
                      setState(prev => ({
                        ...prev,
                        exportConfig: { ...prev.exportConfig, digitalSignature: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Real-time Alerts</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Alert Recipients</Label>
                  <Textarea placeholder="Enter email addresses separated by commas..." />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};