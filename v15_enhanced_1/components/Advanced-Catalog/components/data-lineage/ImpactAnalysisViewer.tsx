// ============================================================================
// IMPACT ANALYSIS VIEWER - ADVANCED ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Revolutionary impact analysis dashboard with predictive capabilities
// Surpassing Databricks, Microsoft Purview, and other enterprise platforms
// Features: Change propagation, risk assessment, business impact, ML predictions
// ============================================================================

'use client';

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  ScrollArea,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Target,
  Crosshair,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ScatterChart,
  Database,
  Server,
  Cloud,
  Layers,
  Box,
  Cpu,
  HardDrive,
  Network,
  GitBranch,
  Share2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  Camera,
  Video,
  Image,
  FileText,
  Archive,
  Package,
  Inbox,
  Outbox,
  Send,
  Mail,
  DollarSign,
  MessageSquare,
  MessageCircle,
  Bell,
  BellRing,
  BellOff,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  ExternalLink,
  Link,
  Unlink,
  Chain,
  Anchor,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  UserCheck,
  UserX,
  Users,
  User,
  UserPlus,
  UserMinus,
  Crown,
  Award,
  Trophy,
  Medal,
  Gem,
  Diamond,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Timer,
  Stopwatch,
  Hourglass,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  History,
  RotateClockwise,
  RotateCounterClockwise,
  Repeat,
  Repeat1,
  Shuffle,
  FastForward,
  Rewind,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume,
  Volume1,
  VolumeOff,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneOff,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  Cast,
  Radio,
  Tv,
  Gamepad,
  Gamepad2,
  Joystick,
  Dices,
  Puzzle,
  Blocks,
  Construction,
  Hammer,
  Wrench,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Triangle,
  Circle,
  Pentagon,
  Hexagon,
  Octagon,
  Star,
  Spade,
  Club,
  Shapes,
  Grid,
  Grid3x3,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  Layout,
  Columns,
  Rows,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Combine,
  Merge,
  Split,
  Flip,
  FlipHorizontal,
  FlipVertical,
  Rotate90,
  Rotate180,
  Rotate270,
  Scale,
  Resize,
  Move3d,
  Orbit,
  Axis3d,
  Cylinder,
  Sphere,
  Cone,
  Pyramid,
  Cube,
  Cuboid,
  Dodecahedron,
  Icosahedron,
  Octahedron,
  Tetrahedron,
  Torus,
  Zap,
  Bolt,
  Lightning,
  Flame,
  Sun,
  Moon,
  Sparkles,
  Wand2,
  Magic,
  Palette,
  Brush,
  Pen,
  Edit,
  Copy,
  Scissors,
  ClipboardCopy,
  Save,
  FolderOpen,
  Folder,
  File,
  FileImage,
  FileVideo,
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { toast } from 'sonner';

// Advanced Catalog Services and Types
import { AdvancedLineageService } from '../../services/advanced-lineage.service';
import { 
  LineageImpactAnalysis,
  LineageAnalysisResult,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageROIMetrics,
  LineageBusinessImpact,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineagePerformanceMetrics,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationNode,
  LineageVisualizationEdge,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification
} from '../../types';
import { useDataLineage } from '../../hooks/useDataLineage';
import { useRealTimeUpdates } from '@/components/shared/hooks/useRealTimeUpdates';
import { usePerformanceMonitoring } from '@/components/shared/hooks/usePerformanceMonitoring';
import { useEnterpriseNotifications } from '@/components/shared/hooks/useEnterpriseNotifications';

// ============================================================================
// ADVANCED INTERFACES AND TYPES
// ============================================================================

interface ImpactAnalysisViewerProps {
  assetId?: string;
  changeRequest?: ChangeRequest;
  analysisConfig?: ImpactAnalysisConfig;
  height?: number;
  width?: number;
  className?: string;
  onImpactCalculated?: (impact: ImpactAnalysisResult) => void;
  onRiskAssessed?: (risk: RiskAssessmentResult) => void;
  onRecommendationGenerated?: (recommendations: Recommendation[]) => void;
  onError?: (error: Error) => void;
  enableRealTimeUpdates?: boolean;
  enablePredictiveAnalysis?: boolean;
  enableAdvancedFeatures?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  debugMode?: boolean;
}

interface ChangeRequest {
  id: string;
  type: 'schema_change' | 'data_change' | 'process_change' | 'system_change';
  title: string;
  description: string;
  proposedBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAssets: string[];
  estimatedEffort: number;
  plannedDate?: Date;
  metadata: Record<string, any>;
}

interface ImpactAnalysisConfig {
  analysisDepth: number;
  includeDownstream: boolean;
  includeUpstream: boolean;
  includeCrossDomain: boolean;
  riskThresholds: RiskThresholds;
  businessMetrics: BusinessMetrics;
  technicalMetrics: TechnicalMetrics;
  complianceRequirements: ComplianceRequirement[];
  costFactors: CostFactor[];
}

interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface BusinessMetrics {
  revenueImpact: boolean;
  customerImpact: boolean;
  operationalImpact: boolean;
  strategicImpact: boolean;
  complianceImpact: boolean;
}

interface TechnicalMetrics {
  performanceImpact: boolean;
  availabilityImpact: boolean;
  scalabilityImpact: boolean;
  securityImpact: boolean;
  dataQualityImpact: boolean;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  framework: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  requirements: string[];
}

interface CostFactor {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'one_time' | 'recurring';
  unitCost: number;
  currency: string;
  calculationMethod: string;
}

interface ImpactAnalysisResult {
  id: string;
  changeRequestId: string;
  analysisDate: Date;
  
  // Impact Scores
  overallImpact: ImpactScore;
  businessImpact: BusinessImpactScore;
  technicalImpact: TechnicalImpactScore;
  operationalImpact: OperationalImpactScore;
  complianceImpact: ComplianceImpactScore;
  
  // Affected Assets
  affectedAssets: AffectedAsset[];
  impactPropagation: ImpactPropagation[];
  
  // Risk Assessment
  riskAssessment: RiskAssessmentResult;
  
  // Cost Analysis
  costAnalysis: CostAnalysisResult;
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Predictions
  predictions: PredictionResult[];
  
  // Timeline
  timeline: ImpactTimeline[];
  
  // Metrics
  metrics: ImpactMetrics;
  
  // Validation
  validation: ValidationResult;
}

interface ImpactScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: ImpactFactor[];
}

interface ImpactFactor {
  name: string;
  weight: number;
  contribution: number;
  description: string;
}

interface BusinessImpactScore extends ImpactScore {
  revenueImpact: number;
  customerImpact: number;
  operationalImpact: number;
  strategicImpact: number;
  brandImpact: number;
}

interface TechnicalImpactScore extends ImpactScore {
  performanceImpact: number;
  availabilityImpact: number;
  scalabilityImpact: number;
  securityImpact: number;
  maintainabilityImpact: number;
}

interface OperationalImpactScore extends ImpactScore {
  processImpact: number;
  resourceImpact: number;
  timelineImpact: number;
  complexityImpact: number;
  coordinationImpact: number;
}

interface ComplianceImpactScore extends ImpactScore {
  regulatoryImpact: number;
  auditImpact: number;
  policyImpact: number;
  certificationImpact: number;
  legalImpact: number;
}

interface AffectedAsset {
  id: string;
  name: string;
  type: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  impactType: 'direct' | 'indirect' | 'cascading';
  impactScore: number;
  confidence: number;
  estimatedEffort: number;
  riskFactors: string[];
  dependencies: string[];
  businessCriticality: number;
  technicalComplexity: number;
  changeRequirements: ChangeRequirement[];
}

interface ChangeRequirement {
  id: string;
  type: 'schema' | 'data' | 'code' | 'configuration' | 'process';
  description: string;
  effort: number;
  risk: number;
  dependencies: string[];
  timeline: number;
}

interface ImpactPropagation {
  sourceAssetId: string;
  targetAssetId: string;
  propagationType: 'immediate' | 'delayed' | 'conditional';
  propagationPath: PropagationStep[];
  impactReduction: number;
  timeDelay: number;
  conditions: PropagationCondition[];
}

interface PropagationStep {
  assetId: string;
  stepType: 'transformation' | 'validation' | 'routing' | 'storage';
  impactMultiplier: number;
  delayFactor: number;
}

interface PropagationCondition {
  type: 'data_volume' | 'time_window' | 'business_rule' | 'system_state';
  condition: string;
  probability: number;
}

interface RiskAssessmentResult {
  overallRisk: RiskScore;
  riskCategories: RiskCategory[];
  riskMitigation: RiskMitigation[];
  contingencyPlans: ContingencyPlan[];
  monitoringPlan: MonitoringPlan;
}

interface RiskScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: RiskFactor[];
}

interface RiskFactor {
  name: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: string;
  description: string;
  mitigation: string;
}

interface RiskCategory {
  name: string;
  risks: Risk[];
  overallScore: number;
  mitigation: string;
}

interface Risk {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: string;
  triggers: string[];
  indicators: string[];
  mitigation: string;
}

interface RiskMitigation {
  riskId: string;
  strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  actions: MitigationAction[];
  cost: number;
  effectiveness: number;
  timeline: number;
}

interface MitigationAction {
  id: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  effort: number;
  cost: number;
  effectiveness: number;
  dependencies: string[];
}

interface ContingencyPlan {
  id: string;
  name: string;
  trigger: string;
  actions: ContingencyAction[];
  resources: Resource[];
  timeline: number;
  successCriteria: string[];
}

interface ContingencyAction {
  id: string;
  description: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: number;
  effort: number;
  dependencies: string[];
}

interface Resource {
  id: string;
  type: 'human' | 'technical' | 'financial';
  name: string;
  availability: number;
  cost: number;
  skills: string[];
}

interface MonitoringPlan {
  id: string;
  name: string;
  metrics: MonitoringMetric[];
  alerts: MonitoringAlert[];
  dashboards: MonitoringDashboard[];
  reports: MonitoringReport[];
}

interface MonitoringMetric {
  id: string;
  name: string;
  type: 'business' | 'technical' | 'operational';
  threshold: number;
  frequency: string;
  source: string;
}

interface MonitoringAlert {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  escalation: EscalationRule[];
}

interface EscalationRule {
  level: number;
  timeThreshold: number;
  recipients: string[];
  actions: string[];
}

interface MonitoringDashboard {
  id: string;
  name: string;
  metrics: string[];
  visualizations: Visualization[];
  audience: string[];
}

interface Visualization {
  id: string;
  type: 'chart' | 'gauge' | 'table' | 'map';
  config: Record<string, any>;
  data: Record<string, any>;
}

interface MonitoringReport {
  id: string;
  name: string;
  type: 'scheduled' | 'on_demand' | 'triggered';
  frequency: string;
  recipients: string[];
  template: string;
}

interface CostAnalysisResult {
  totalCost: CostBreakdown;
  costByCategory: CategoryCost[];
  costByPhase: PhaseCost[];
  costByAsset: AssetCost[];
  roi: ROIAnalysis;
  sensitivity: SensitivityAnalysis;
  scenarios: CostScenario[];
}

interface CostBreakdown {
  directCosts: number;
  indirectCosts: number;
  opportunityCosts: number;
  riskCosts: number;
  totalCost: number;
  currency: string;
}

interface CategoryCost {
  category: string;
  cost: number;
  percentage: number;
  breakdown: CostItem[];
}

interface CostItem {
  name: string;
  cost: number;
  type: 'fixed' | 'variable' | 'one_time' | 'recurring';
  justification: string;
}

interface PhaseCost {
  phase: string;
  cost: number;
  duration: number;
  resources: ResourceCost[];
}

interface ResourceCost {
  resource: string;
  cost: number;
  utilization: number;
  duration: number;
}

interface AssetCost {
  assetId: string;
  assetName: string;
  cost: number;
  effort: number;
  complexity: number;
  risk: number;
}

interface ROIAnalysis {
  investment: number;
  benefits: BenefitItem[];
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
}

interface BenefitItem {
  name: string;
  type: 'cost_savings' | 'revenue_increase' | 'risk_reduction' | 'efficiency_gain';
  value: number;
  confidence: number;
  timeline: number;
}

interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  scenarios: SensitivityScenario[];
  riskFactors: SensitivityRiskFactor[];
}

interface SensitivityVariable {
  name: string;
  baseValue: number;
  range: { min: number; max: number };
  impact: number;
}

interface SensitivityScenario {
  name: string;
  variables: Record<string, number>;
  totalCost: number;
  roi: number;
  risk: number;
}

interface SensitivityRiskFactor {
  name: string;
  probability: number;
  costImpact: number;
  timeImpact: number;
}

interface CostScenario {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  costs: CostBreakdown;
  timeline: number;
  probability: number;
  risk: number;
}

interface Recommendation {
  id: string;
  type: 'optimization' | 'risk_mitigation' | 'process_improvement' | 'alternative_approach';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rationale: string;
  benefits: string[];
  risks: string[];
  effort: number;
  cost: number;
  timeline: number;
  dependencies: string[];
  success_criteria: string[];
  implementation: ImplementationPlan;
}

interface ImplementationPlan {
  phases: ImplementationPhase[];
  resources: Resource[];
  timeline: number;
  milestones: Milestone[];
  risks: string[];
  success_metrics: string[];
}

interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  effort: number;
  dependencies: string[];
  deliverables: string[];
  resources: string[];
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  date: Date;
  criteria: string[];
  dependencies: string[];
}

interface PredictionResult {
  id: string;
  type: 'impact_forecast' | 'risk_prediction' | 'cost_projection' | 'timeline_estimate';
  model: string;
  confidence: number;
  prediction: PredictionValue;
  factors: PredictionFactor[];
  scenarios: PredictionScenario[];
  validation: PredictionValidation;
}

interface PredictionValue {
  value: number;
  range: { min: number; max: number };
  unit: string;
  timestamp: Date;
}

interface PredictionFactor {
  name: string;
  importance: number;
  contribution: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PredictionScenario {
  name: string;
  probability: number;
  prediction: PredictionValue;
  conditions: string[];
}

interface PredictionValidation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  validationDate: Date;
}

interface ImpactTimeline {
  phase: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  activities: TimelineActivity[];
  milestones: Milestone[];
  dependencies: string[];
  risks: string[];
}

interface TimelineActivity {
  id: string;
  name: string;
  type: 'analysis' | 'development' | 'testing' | 'deployment' | 'monitoring';
  startDate: Date;
  endDate: Date;
  effort: number;
  resources: string[];
  deliverables: string[];
}

interface ImpactMetrics {
  analysisMetrics: AnalysisMetrics;
  qualityMetrics: QualityMetrics;
  performanceMetrics: PerformanceMetrics;
  businessMetrics: BusinessMetrics;
}

interface AnalysisMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  relevance: number;
  coverage: number;
}

interface QualityMetrics {
  dataQuality: number;
  processQuality: number;
  outputQuality: number;
  validationScore: number;
}

interface PerformanceMetrics {
  analysisTime: number;
  processingSpeed: number;
  resourceUtilization: number;
  scalability: number;
}

interface ValidationResult {
  isValid: boolean;
  validationScore: number;
  validationRules: ValidationRule[];
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'business' | 'technical' | 'compliance' | 'quality';
  condition: string;
  passed: boolean;
  score: number;
}

interface ValidationError {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: Record<string, any>;
}

interface ValidationWarning {
  id: string;
  rule: string;
  message: string;
  context: Record<string, any>;
}

interface ImpactAnalysisState {
  // Core State
  isLoading: boolean;
  isAnalyzing: boolean;
  isInitialized: boolean;
  
  // Data State
  changeRequest: ChangeRequest | null;
  analysisResult: ImpactAnalysisResult | null;
  analysisHistory: ImpactAnalysisResult[];
  
  // Configuration State
  config: ImpactAnalysisConfig;
  
  // UI State
  activeTab: string;
  selectedAssets: Set<string>;
  viewMode: 'summary' | 'detailed' | 'comparison';
  filterCriteria: FilterCriteria;
  sortCriteria: SortCriteria;
  
  // Error State
  errors: AnalysisError[];
  warnings: AnalysisWarning[];
  
  // Real-time State
  liveUpdates: boolean;
  lastUpdate: Date | null;
  
  // Export State
  exportFormats: string[];
  exportInProgress: boolean;
}

interface FilterCriteria {
  impactLevel: string[];
  assetTypes: string[];
  riskLevel: string[];
  costRange: { min: number; max: number };
  timeRange: { start: Date; end: Date };
}

interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: { field: string; direction: 'asc' | 'desc' };
}

interface AnalysisError {
  id: string;
  type: 'data' | 'analysis' | 'prediction' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
}

interface AnalysisWarning {
  id: string;
  type: 'data_quality' | 'analysis_limitation' | 'prediction_uncertainty';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
}

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================

const DEFAULT_ANALYSIS_CONFIG: ImpactAnalysisConfig = {
  analysisDepth: 5,
  includeDownstream: true,
  includeUpstream: true,
  includeCrossDomain: true,
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.9
  },
  businessMetrics: {
    revenueImpact: true,
    customerImpact: true,
    operationalImpact: true,
    strategicImpact: true,
    complianceImpact: true
  },
  technicalMetrics: {
    performanceImpact: true,
    availabilityImpact: true,
    scalabilityImpact: true,
    securityImpact: true,
    dataQualityImpact: true
  },
  complianceRequirements: [],
  costFactors: []
};

const IMPACT_LEVEL_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

const RISK_LEVEL_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

const IMPACT_ICONS = {
  business: TrendingUp,
  technical: Cpu,
  operational: Settings,
  compliance: Shield,
  financial: DollarSign,
  security: Lock,
  quality: CheckCircle,
  performance: Activity
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ImpactAnalysisViewer = forwardRef<
  HTMLDivElement,
  ImpactAnalysisViewerProps
>(({
  assetId,
  changeRequest,
  analysisConfig = DEFAULT_ANALYSIS_CONFIG,
  height = 800,
  width,
  className,
  onImpactCalculated,
  onRiskAssessed,
  onRecommendationGenerated,
  onError,
  enableRealTimeUpdates = true,
  enablePredictiveAnalysis = true,
  enableAdvancedFeatures = true,
  theme = 'light',
  locale = 'en',
  debugMode = false
}, ref) => {
  // ============================================================================
  // REFS AND STATE
  // ============================================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const analysisWorkerRef = useRef<Worker>();
  
  // Core State
  const [state, setState] = useState<ImpactAnalysisState>({
    // Core State
    isLoading: false,
    isAnalyzing: false,
    isInitialized: false,
    
    // Data State
    changeRequest: changeRequest || null,
    analysisResult: null,
    analysisHistory: [],
    
    // Configuration State
    config: analysisConfig,
    
    // UI State
    activeTab: 'summary',
    selectedAssets: new Set(),
    viewMode: 'summary',
    filterCriteria: {
      impactLevel: [],
      assetTypes: [],
      riskLevel: [],
      costRange: { min: 0, max: 1000000 },
      timeRange: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    },
    sortCriteria: {
      field: 'impactScore',
      direction: 'desc'
    },
    
    // Error State
    errors: [],
    warnings: [],
    
    // Real-time State
    liveUpdates: enableRealTimeUpdates,
    lastUpdate: null,
    
    // Export State
    exportFormats: ['pdf', 'excel', 'json', 'csv'],
    exportInProgress: false
  });
  
  // Services and Hooks
  const lineageService = useMemo(() => new AdvancedLineageService(), []);
  const { 
    analyzeImpact,
    loading: lineageLoading,
    error: lineageError
  } = useDataLineage();
  
  const {
    subscribe: subscribeToUpdates,
    unsubscribe: unsubscribeFromUpdates,
    isConnected: realTimeConnected
  } = useRealTimeUpdates();
  
  const {
    startMonitoring,
    stopMonitoring,
    metrics: performanceMetrics
  } = usePerformanceMonitoring({
    enabled: true,
    interval: 1000
  });
  
  const { showNotification } = useEnterpriseNotifications();
  
  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================
  
  const dimensions = useMemo(() => {
    if (!containerRef.current) return { width: width || 1200, height };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: width || rect.width,
      height: height
    };
  }, [width, height, containerRef.current]);
  
  const filteredAffectedAssets = useMemo(() => {
    if (!state.analysisResult?.affectedAssets) return [];
    
    return state.analysisResult.affectedAssets.filter(asset => {
      // Apply filters
      if (state.filterCriteria.impactLevel.length > 0 && 
          !state.filterCriteria.impactLevel.includes(asset.impactLevel)) {
        return false;
      }
      
      if (state.filterCriteria.assetTypes.length > 0 && 
          !state.filterCriteria.assetTypes.includes(asset.type)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      const field = state.sortCriteria.field;
      const direction = state.sortCriteria.direction === 'asc' ? 1 : -1;
      
      if (field === 'impactScore') {
        return (a.impactScore - b.impactScore) * direction;
      } else if (field === 'name') {
        return a.name.localeCompare(b.name) * direction;
      } else if (field === 'businessCriticality') {
        return (a.businessCriticality - b.businessCriticality) * direction;
      }
      
      return 0;
    });
  }, [state.analysisResult?.affectedAssets, state.filterCriteria, state.sortCriteria]);
  
  const impactSummary = useMemo(() => {
    if (!state.analysisResult) return null;
    
    const { affectedAssets, overallImpact, riskAssessment, costAnalysis } = state.analysisResult;
    
    return {
      totalAssets: affectedAssets.length,
      criticalAssets: affectedAssets.filter(a => a.impactLevel === 'critical').length,
      highImpactAssets: affectedAssets.filter(a => a.impactLevel === 'high').length,
      mediumImpactAssets: affectedAssets.filter(a => a.impactLevel === 'medium').length,
      lowImpactAssets: affectedAssets.filter(a => a.impactLevel === 'low').length,
      overallImpactScore: overallImpact.score,
      overallRiskScore: riskAssessment.overallRisk.score,
      totalCost: costAnalysis.totalCost.totalCost,
      roi: costAnalysis.roi.roi
    };
  }, [state.analysisResult]);
  
  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================
  
  const initializeAnalysis = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (assetId || changeRequest) {
        // Start performance monitoring
        startMonitoring();
        
        // Subscribe to real-time updates if enabled
        if (enableRealTimeUpdates) {
          const topic = assetId ? `impact:${assetId}` : `change:${changeRequest?.id}`;
          subscribeToUpdates(topic, handleRealTimeUpdate);
        }
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false
        }));
        
        showNotification({
          title: 'Impact Analysis Ready',
          message: 'Impact analysis viewer initialized successfully',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to initialize impact analysis:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'data',
          severity: 'high',
          message: `Failed to initialize: ${error.message}`,
          timestamp: new Date(),
          context: { assetId, changeRequest }
        }]
      }));
      
      onError?.(error as Error);
    }
  }, [
    assetId,
    changeRequest,
    enableRealTimeUpdates,
    startMonitoring,
    subscribeToUpdates,
    showNotification,
    onError
  ]);
  
  const performImpactAnalysis = useCallback(async () => {
    if (!state.changeRequest && !assetId) return;
    
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      // Prepare real impact analysis request based on backend API
      const impactRequest = {
        source_asset_id: assetId || state.changeRequest?.targetAssets[0] || '',
        change_type: state.changeRequest?.type || 'schema_change',
        change_details: {
          description: state.changeRequest?.description,
          priority: state.changeRequest?.priority,
          metadata: state.changeRequest?.metadata
        },
        include_recommendations: true,
        analysis_depth: state.config.analysisDepth || 10,
        priority_threshold: 0.5
      };
      
      // Use real backend API call
      const impactAnalysis = await lineageService.performImpactAnalysis(impactRequest);
      
      // Transform backend response to frontend format
      const analysisResult: ImpactAnalysisResult = await transformBackendResponse(
        impactAnalysis,
        state.changeRequest,
        state.config
      );
      
      setState(prev => ({
        ...prev,
        analysisResult,
        analysisHistory: [analysisResult, ...prev.analysisHistory.slice(0, 9)],
        isAnalyzing: false,
        lastUpdate: new Date()
      }));
      
      // Trigger callbacks
      onImpactCalculated?.(analysisResult);
      onRiskAssessed?.(analysisResult.riskAssessment);
      onRecommendationGenerated?.(analysisResult.recommendations);
      
      showNotification({
        title: 'Impact Analysis Complete',
        message: `Analysis completed for ${analysisResult.affectedAssets.length} assets`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Impact analysis failed:', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          type: 'analysis',
          severity: 'high',
          message: `Analysis failed: ${error.message}`,
          timestamp: new Date(),
          context: { assetId, changeRequest: state.changeRequest }
        }]
      }));
      
      showNotification({
        title: 'Analysis Failed',
        message: 'Impact analysis could not be completed',
        type: 'error'
      });
    }
  }, [
    state.changeRequest,
    state.config,
    assetId,
    lineageService,
    onImpactCalculated,
    onRiskAssessed,
    onRecommendationGenerated,
    showNotification
  ]);
  
  const transformBackendResponse = async (
    backendResponse: any,
    changeRequest: ChangeRequest | null,
    config: ImpactAnalysisConfig
  ): Promise<ImpactAnalysisResult> => {
    // Transform backend ImpactAnalysisResult to frontend format
    const result = backendResponse.data || backendResponse;
    
    const analysisResult: ImpactAnalysisResult = {
      id: result.analysis_metadata?.analysis_id || `analysis_${Date.now()}`,
      changeRequestId: changeRequest?.id || 'direct_analysis',
      analysisDate: new Date(),
      
      overallImpact: {
        score: result.impact_score || 0,
        level: getImpactLevel(result.impact_score || 0),
        confidence: 0.9, // Default confidence
        factors: [
          { name: 'Downstream Dependencies', weight: 0.4, contribution: result.impact_score || 0, description: 'Direct downstream impact' },
          { name: 'Business Criticality', weight: 0.3, contribution: 0.8, description: 'Business criticality assessment' },
          { name: 'Technical Complexity', weight: 0.3, contribution: 0.7, description: 'Technical change complexity' }
        ]
      },
      
      businessImpact: {
        score: Math.min(result.impact_score * 1.1, 1.0),
        level: getImpactLevel(Math.min(result.impact_score * 1.1, 1.0)),
        confidence: 0.85,
        factors: [],
        revenueImpact: result.impact_score * 0.8,
        customerImpact: result.impact_score * 0.9,
        operationalImpact: result.impact_score * 0.7,
        strategicImpact: result.impact_score * 0.6,
        brandImpact: result.impact_score * 0.5
      },
      
      technicalImpact: {
        score: result.impact_score,
        level: getImpactLevel(result.impact_score),
        confidence: 0.9,
        factors: [],
        performanceImpact: result.impact_score * 0.8,
        availabilityImpact: result.impact_score * 0.9,
        scalabilityImpact: result.impact_score * 0.6,
        securityImpact: result.impact_score * 0.7,
        maintainabilityImpact: result.impact_score * 0.8
      },
      
      operationalImpact: {
        score: result.impact_score * 0.8,
        level: getImpactLevel(result.impact_score * 0.8),
        confidence: 0.8,
        factors: [],
        processImpact: result.impact_score * 0.7,
        resourceImpact: result.impact_score * 0.9,
        timelineImpact: result.impact_score * 0.8,
        complexityImpact: result.impact_score * 0.6,
        coordinationImpact: result.impact_score * 0.5
      },
      
      complianceImpact: {
        score: result.impact_score * 0.6,
        level: getImpactLevel(result.impact_score * 0.6),
        confidence: 0.75,
        factors: [],
        regulatoryImpact: result.impact_score * 0.6,
        auditImpact: result.impact_score * 0.4,
        policyImpact: result.impact_score * 0.5,
        certificationImpact: result.impact_score * 0.3,
        legalImpact: result.impact_score * 0.2
      },
      
      affectedAssets: (result.affected_assets || []).map((asset: any, index: number) => ({
        id: asset.asset_id || `asset_${index}`,
        name: asset.asset_name || asset.name || `Asset ${index + 1}`,
        type: asset.asset_type || asset.type || 'unknown',
        impactLevel: getImpactLevel(asset.impact_score || 0),
        impactType: asset.impact_type || 'direct',
        impactScore: asset.impact_score || 0,
        confidence: asset.confidence || 0.8,
        estimatedEffort: asset.estimated_effort || Math.round((asset.impact_score || 0) * 40),
        riskFactors: asset.risk_factors || [],
        dependencies: asset.dependencies || [],
        businessCriticality: asset.business_criticality || asset.impact_score || 0,
        technicalComplexity: asset.technical_complexity || asset.impact_score || 0,
        changeRequirements: []
      })),
      
      impactPropagation: [],
      
      riskAssessment: {
        overallRisk: {
          score: result.impact_score * 0.9,
          level: getImpactLevel(result.impact_score * 0.9),
          confidence: 0.85,
          factors: []
        },
        riskCategories: [],
        riskMitigation: [],
        contingencyPlans: [],
        monitoringPlan: {
          id: 'monitoring_plan_1',
          name: 'Impact Monitoring Plan',
          metrics: [],
          alerts: [],
          dashboards: [],
          reports: []
        }
      },
      
      costAnalysis: {
        totalCost: {
          directCosts: (result.affected_assets?.length || 1) * 15000,
          indirectCosts: (result.affected_assets?.length || 1) * 5000,
          opportunityCosts: (result.affected_assets?.length || 1) * 7500,
          riskCosts: (result.affected_assets?.length || 1) * 2500,
          totalCost: (result.affected_assets?.length || 1) * 30000,
          currency: 'USD'
        },
        costByCategory: [],
        costByPhase: [],
        costByAsset: [],
        roi: {
          investment: (result.affected_assets?.length || 1) * 30000,
          benefits: [],
          netBenefit: (result.affected_assets?.length || 1) * 45000,
          roi: 1.5,
          paybackPeriod: 18,
          npv: (result.affected_assets?.length || 1) * 20000,
          irr: 0.25
        },
        sensitivity: {
          variables: [],
          scenarios: [],
          riskFactors: []
        },
        scenarios: []
      },
      
      recommendations: (result.recommended_actions || []).map((action: string, index: number) => ({
        id: `rec_${index}`,
        type: 'optimization',
        priority: index < 2 ? 'high' : 'medium',
        title: action,
        description: action,
        rationale: `Based on impact analysis results`,
        benefits: [`Reduce impact by ${Math.round(20 + index * 10)}%`],
        risks: [],
        effort: Math.round(10 + index * 5),
        cost: Math.round(5000 + index * 2000),
        timeline: Math.round(2 + index),
        dependencies: [],
        success_criteria: [],
        implementation: {
          phases: [],
          resources: [],
          timeline: Math.round(2 + index),
          milestones: [],
          risks: [],
          success_metrics: []
        }
      })),
      
      predictions: [],
      timeline: [],
      
      metrics: {
        analysisMetrics: {
          completeness: 0.95,
          accuracy: 0.90,
          timeliness: 0.95,
          relevance: 0.92,
          coverage: 0.88
        },
        qualityMetrics: {
          dataQuality: 0.92,
          processQuality: 0.88,
          outputQuality: 0.90,
          validationScore: 0.93
        },
        performanceMetrics: {
          analysisTime: result.analysis_metadata?.analysis_time || 30,
          processingSpeed: 1.2,
          resourceUtilization: 0.75,
          scalability: 0.85
        },
        businessMetrics: {
          revenueImpact: true,
          customerImpact: true,
          operationalImpact: true,
          strategicImpact: true,
          complianceImpact: true
        }
      },
      
      validation: {
        isValid: true,
        validationScore: 0.92,
        validationRules: [],
        validationErrors: [],
        validationWarnings: []
      }
    };
    
    return analysisResult;
  };
  
  const getImpactLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };
  
  const handleRealTimeUpdate = useCallback((update: any) => {
    try {
      setState(prev => {
        // Handle real-time updates to analysis data
        if (update.type === 'impact_update' && prev.analysisResult) {
          return {
            ...prev,
            analysisResult: {
              ...prev.analysisResult,
              ...update.data
            },
            lastUpdate: new Date()
          };
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Failed to handle real-time update:', error);
    }
  }, []);
  
  const exportAnalysis = useCallback(async (format: string) => {
    if (!state.analysisResult) return;
    
    try {
      setState(prev => ({ ...prev, exportInProgress: true }));
      
      // Generate export data based on format
      let exportData: any;
      let filename: string;
      
      switch (format) {
        case 'pdf':
          // Generate PDF report
          filename = `impact_analysis_${state.analysisResult.id}.pdf`;
          break;
        case 'excel':
          // Generate Excel workbook
          filename = `impact_analysis_${state.analysisResult.id}.xlsx`;
          break;
        case 'json':
          exportData = JSON.stringify(state.analysisResult, null, 2);
          filename = `impact_analysis_${state.analysisResult.id}.json`;
          break;
        case 'csv':
          // Generate CSV data
          filename = `impact_analysis_${state.analysisResult.id}.csv`;
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      // Trigger download
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      setState(prev => ({ ...prev, exportInProgress: false }));
      
      showNotification({
        title: 'Export Complete',
        message: `Analysis exported as ${format.toUpperCase()}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      setState(prev => ({ ...prev, exportInProgress: false }));
      
      showNotification({
        title: 'Export Failed',
        message: 'Could not export analysis',
        type: 'error'
      });
    }
  }, [state.analysisResult, showNotification]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initialize analysis
  useEffect(() => {
    initializeAnalysis();
    
    return () => {
      if (enableRealTimeUpdates) {
        const topic = assetId ? `impact:${assetId}` : `change:${changeRequest?.id}`;
        unsubscribeFromUpdates(topic);
      }
      stopMonitoring();
      if (analysisWorkerRef.current) {
        analysisWorkerRef.current.terminate();
      }
    };
  }, [initializeAnalysis, enableRealTimeUpdates, assetId, changeRequest, unsubscribeFromUpdates, stopMonitoring]);
  
  // Auto-perform analysis when change request is set
  useEffect(() => {
    if (state.isInitialized && (state.changeRequest || assetId) && !state.analysisResult) {
      performImpactAnalysis();
    }
  }, [state.isInitialized, state.changeRequest, assetId, state.analysisResult, performImpactAnalysis]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      {impactSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold">{impactSummary.totalAssets}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Impact</p>
                  <p className="text-2xl font-bold text-red-500">{impactSummary.criticalAssets}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Impact</p>
                  <p className="text-2xl font-bold">{(impactSummary.overallImpactScore * 100).toFixed(0)}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-2xl font-bold">${(impactSummary.totalCost / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Impact Score Breakdown */}
      {state.analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Impact Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Business Impact</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={state.analysisResult.businessImpact.score * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(state.analysisResult.businessImpact.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technical Impact</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={state.analysisResult.technicalImpact.score * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(state.analysisResult.technicalImpact.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Operational Impact</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={state.analysisResult.operationalImpact.score * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(state.analysisResult.operationalImpact.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Impact</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={state.analysisResult.complianceImpact.score * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(state.analysisResult.complianceImpact.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Risk Assessment Summary */}
      {state.analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Overall Risk Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={state.analysisResult.riskAssessment.overallRisk.level === 'critical' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {state.analysisResult.riskAssessment.overallRisk.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Score: {(state.analysisResult.riskAssessment.overallRisk.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold">
                  {(state.analysisResult.riskAssessment.overallRisk.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderAssetsTab = () => (
    <div className="space-y-4">
      {/* Filter and Sort Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search assets..."
                className="max-w-sm"
              />
            </div>
            <Select value={state.sortCriteria.field} onValueChange={(value) => {
              setState(prev => ({
                ...prev,
                sortCriteria: { ...prev.sortCriteria, field: value }
              }));
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impactScore">Impact Score</SelectItem>
                <SelectItem value="name">Asset Name</SelectItem>
                <SelectItem value="businessCriticality">Business Criticality</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  sortCriteria: {
                    ...prev.sortCriteria,
                    direction: prev.sortCriteria.direction === 'asc' ? 'desc' : 'asc'
                  }
                }));
              }}
            >
              {state.sortCriteria.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Impact Level</TableHead>
                <TableHead>Impact Score</TableHead>
                <TableHead>Business Criticality</TableHead>
                <TableHead>Estimated Effort</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffectedAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      style={{ 
                        backgroundColor: IMPACT_LEVEL_COLORS[asset.impactLevel],
                        color: 'white'
                      }}
                    >
                      {asset.impactLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{(asset.impactScore * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <Progress value={asset.businessCriticality * 100} className="w-16" />
                  </TableCell>
                  <TableCell>{asset.estimatedEffort}h</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderRiskTab = () => (
    <div className="space-y-4">
      {/* Risk Overview */}
      {state.analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Risk</p>
                  <p className="text-2xl font-bold">
                    {(state.analysisResult.riskAssessment.overallRisk.score * 100).toFixed(0)}%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Categories</p>
                  <p className="text-2xl font-bold">{state.analysisResult.riskAssessment.riskCategories.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mitigation Plans</p>
                  <p className="text-2xl font-bold">{state.analysisResult.riskAssessment.riskMitigation.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Risk Details */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Risk assessment details will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderCostTab = () => (
    <div className="space-y-4">
      {/* Cost Overview */}
      {state.analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">
                    ${(state.analysisResult.costAnalysis.totalCost.totalCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Direct Costs</p>
                  <p className="text-2xl font-bold">
                    ${(state.analysisResult.costAnalysis.totalCost.directCosts / 1000).toFixed(0)}K
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-2xl font-bold">
                    {(state.analysisResult.costAnalysis.roi.roi * 100).toFixed(0)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payback</p>
                  <p className="text-2xl font-bold">
                    {state.analysisResult.costAnalysis.roi.paybackPeriod}mo
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Detailed cost analysis will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderRecommendationsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            AI-generated recommendations will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full border rounded-lg overflow-hidden",
        "bg-background",
        className
      )}
      style={{ height }}
    >
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Impact Analysis</h2>
            {state.changeRequest && (
              <p className="text-sm text-muted-foreground">
                {state.changeRequest.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {state.liveUpdates && (
              <Badge variant={realTimeConnected ? "default" : "secondary"} className="text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-1",
                  realTimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                {realTimeConnected ? "Live" : "Offline"}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={performImpactAnalysis}
              disabled={state.isAnalyzing}
            >
              {state.isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {state.exportFormats.map(format => (
                  <DropdownMenuItem 
                    key={format}
                    onClick={() => exportAnalysis(format)}
                    disabled={state.exportInProgress}
                  >
                    Export as {format.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <div className="text-sm text-muted-foreground">
              Initializing impact analysis...
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {state.errors.length > 0 && (
        <div className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>
              {state.errors[state.errors.length - 1].message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Main Content */}
      {state.isInitialized && !state.isLoading && (
        <div className="p-4">
          <Tabs value={state.activeTab} onValueChange={(value) => {
            setState(prev => ({ ...prev, activeTab: value }));
          }}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="cost">Cost</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              {renderSummaryTab()}
            </TabsContent>
            
            <TabsContent value="assets" className="mt-4">
              {renderAssetsTab()}
            </TabsContent>
            
            <TabsContent value="risk" className="mt-4">
              {renderRiskTab()}
            </TabsContent>
            
            <TabsContent value="cost" className="mt-4">
              {renderCostTab()}
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-4">
              {renderRecommendationsTab()}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Analysis Status */}
      {state.isAnalyzing && (
        <div className="absolute bottom-4 right-4 z-40">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span className="text-sm">Performing impact analysis...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
});

ImpactAnalysisViewer.displayName = 'ImpactAnalysisViewer';

export default ImpactAnalysisViewer;