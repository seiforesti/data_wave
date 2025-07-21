import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, FunnelChart, Funnel,
  LabelList, Sankey
} from 'recharts';
import {
  BarChart3, TrendingUp, Activity, DollarSign, Users, Target, Award,
  Clock, Database, Monitor, Cpu, AlertTriangle, CheckCircle, XCircle,
  Info, Settings, Search, Filter, Download, Upload, Refresh, Play,
  Pause, Stop, MoreVertical, Eye, Edit, Trash2, Plus, Minus, ArrowUp,
  ArrowDown, ArrowRight, Calendar, Globe, Shield, Lock, Unlock, Star,
  Heart, Bookmark, Share, MessageSquare, Bell, Mail, Phone, Video,
  Mic, Camera, Image, File, Folder, Archive, Tag, Flag, Map,
  Navigation, Compass, Route, Layers, Grid, List, Table, Kanban,
  Timeline, Chart, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Building, Briefcase, Calculator, CreditCard, FileText, Presentation,
  Lightbulb, Zap, Brain, Network, Bot, Workflow, GitBranch, Boxes,
  Package, Server, Cloud, HardDrive, Wifi, Bluetooth, Smartphone,
  Laptop, Desktop, Tablet, Watch, Headphones, Speaker, Gamepad2,
  Joystick, Home, Car, Plane, Train, Ship, Truck, Bike, Bus,
  Rocket, Satellite, Radar, Microscope, Telescope, Atom, Dna,
  Fingerprint, QrCode, Barcode, ScanLine, CameraOff, Volume2,
  VolumeX, Maximize, Minimize, RotateCcw, RotateCw, FlipHorizontal,
  FlipVertical, Copy, Cut, Paste, Scissors, PaintBucket, Palette,
  Brush, Pen, PenTool, Eraser, Ruler, Move, MousePointer, Hand,
  GripHorizontal, GripVertical, CornerDownLeft, CornerDownRight,
  CornerUpLeft, CornerUpRight, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, ChevronsDown, ChevronsUp, ChevronsLeft, ChevronsRight,
  Menu, X, Hash, AtSign, Percent, Ampersand, Quote, Italic, Bold,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Indent, Outdent, WrapText, Type, FontBold, FontItalic,
  Superscript, Subscript, Code, Code2, Terminal, Command as CommandIcon,
  Option, Alt, Shift, Ctrl, Enter, Space, Tab, Backspace, Delete,
  Insert, PageUp, PageDown, End, Home as HomeIcon, ArrowBigDown,
  ArrowBigUp, ArrowBigLeft, ArrowBigRight, Circle, Square, Triangle,
  Diamond, Pentagon, Hexagon, Octagon, Star as StarIcon, Heart as HeartIcon,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown, TrendingDown, Minus as MinusIcon,
  Equal, NotEqual, MoreHorizontal, MoreVertical as MoreVerticalIcon,
  Ellipsis, DotSquare, CheckSquare, XSquare, MinusSquare, PlusSquare,
  PlaySquare, PauseOctagon, StopCircle, SkipBack, SkipForward,
  Rewind, FastForward, Repeat, Repeat1, Shuffle, Volume, Volume1,
  VolumeOff, Mic2, MicOff, Radio, Disc, Disc2, Disc3, Music,
  Music2, Music3, Music4, Headphones as HeadphonesIcon, Airplay,
  Cast, Tv, Tv2, Radio as RadioIcon, Podcast, Rss, Wifi as WifiIcon,
  WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero,
  Antenna, Bluetooth as BluetoothIcon, BluetoothConnected, BluetoothOff,
  BluetoothSearching, Nfc, Usb, HardDrive as HardDriveIcon, Hdd,
  ScanEye, ScanFace, ScanSearch, ScanText, Scan, QrCode as QrCodeIcon,
  Barcode as BarcodeIcon, BarcodeScanner, ScanLine as ScanLineIcon,
  Fingerprint as FingerprintIcon, ShieldCheck, ShieldAlert, ShieldClose,
  ShieldEllipsis, ShieldMinus, ShieldOff, ShieldPlus, ShieldQuestion,
  ShieldX, Lock as LockIcon, LockKeyhole, LockKeyholeOpen, LockOpen,
  Unlock as UnlockIcon, Key, KeyRound, KeySquare, Keypad, Safe,
  Vault, BankNote, Banknote, Coins, CreditCard as CreditCardIcon,
  Wallet, Receipt, ReceiptEuro, ReceiptIndianRupee, ReceiptJapaneseYen,
  ReceiptPound, ReceiptRussianRuble, ReceiptSwissFranc, ReceiptText,
  PiggyBank, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';

// Lazy load components for better performance
const FrameworkManager = lazy(() => import('./v1-manual/FrameworkManager'));
const RuleEngine = lazy(() => import('./v1-manual/RuleEngine'));
const PolicyOrchestrator = lazy(() => import('./v1-manual/PolicyOrchestrator'));
const BulkOperationCenter = lazy(() => import('./v1-manual/BulkOperationCenter'));
const AuditTrailAnalyzer = lazy(() => import('./v1-manual/AuditTrailAnalyzer'));
const ComplianceDashboard = lazy(() => import('./v1-manual/ComplianceDashboard'));

const MLModelOrchestrator = lazy(() => import('./v2-ml/MLModelOrchestrator'));
const TrainingPipelineManager = lazy(() => import('./v2-ml/TrainingPipelineManager'));
const AdaptiveLearningCenter = lazy(() => import('./v2-ml/AdaptiveLearningCenter'));
const HyperparameterOptimizer = lazy(() => import('./v2-ml/HyperparameterOptimizer'));
const DriftDetectionMonitor = lazy(() => import('./v2-ml/DriftDetectionMonitor'));
const FeatureEngineeringStudio = lazy(() => import('./v2-ml/FeatureEngineeringStudio'));
const ModelEnsembleBuilder = lazy(() => import('./v2-ml/ModelEnsembleBuilder'));
const MLAnalyticsDashboard = lazy(() => import('./v2-ml/MLAnalyticsDashboard'));

const AIIntelligenceOrchestrator = lazy(() => import('./v3-ai/AIIntelligenceOrchestrator'));
const ConversationManager = lazy(() => import('./v3-ai/ConversationManager'));
const ExplainableReasoningViewer = lazy(() => import('./v3-ai/ExplainableReasoningViewer'));
const AutoTaggingEngine = lazy(() => import('./v3-ai/AutoTaggingEngine'));
const WorkloadOptimizer = lazy(() => import('./v3-ai/WorkloadOptimizer'));
const RealTimeIntelligenceStream = lazy(() => import('./v3-ai/RealTimeIntelligenceStream'));
const KnowledgeSynthesizer = lazy(() => import('./v3-ai/KnowledgeSynthesizer'));
const AIAnalyticsDashboard = lazy(() => import('./v3-ai/AIAnalyticsDashboard'));

const ClassificationWorkflow = lazy(() => import('./orchestration/ClassificationWorkflow'));
const IntelligenceCoordinator = lazy(() => import('./orchestration/IntelligenceCoordinator'));
const BusinessIntelligenceHub = lazy(() => import('./orchestration/BusinessIntelligenceHub'));

// Import custom hooks and utilities
import { useClassificationState } from './core/hooks/useClassificationState';
import { useAIIntelligence } from './core/hooks/useAIIntelligence';
import { aiApi } from './core/api/aiApi';
import { websocketApi } from './core/api/websocketApi';

// TypeScript Interfaces for Classifications SPA
interface ClassificationsSPAState {
  isLoading: boolean;
  error: string | null;
  currentView: ClassificationView;
  currentVersion: ClassificationVersion;
  currentComponent: string | null;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  settingsOpen: boolean;
  profileOpen: boolean;
  searchQuery: string;
  globalFilters: GlobalFilter[];
  recentActivities: Activity[];
  systemStatus: SystemStatus;
  userPreferences: UserPreferences;
  theme: Theme;
  layout: LayoutConfiguration;
  performance: PerformanceMetrics;
  analytics: AnalyticsData;
  notifications: Notification[];
  shortcuts: KeyboardShortcut[];
  integrations: Integration[];
  security: SecurityConfiguration;
  collaboration: CollaborationSettings;
  automation: AutomationSettings;
  monitoring: MonitoringConfiguration;
  compliance: ComplianceSettings;
  governance: GovernanceConfiguration;
  realTimeMode: boolean;
  autoSave: boolean;
  debugMode: boolean;
  maintenanceMode: boolean;
  featureFlags: FeatureFlag[];
  experiments: Experiment[];
  telemetry: TelemetryData;
  feedback: FeedbackData[];
  support: SupportConfiguration;
  documentation: DocumentationLinks;
  tutorials: Tutorial[];
  onboarding: OnboardingState;
  accessibility: AccessibilitySettings;
  localization: LocalizationSettings;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  contextMenu: ContextMenuItem[];
  dragDropState: DragDropState;
  clipboard: ClipboardData;
  undoRedoStack: UndoRedoState;
  bulkOperations: BulkOperationState;
  dataExport: DataExportState;
  dataImport: DataImportState;
  backup: BackupConfiguration;
  recovery: RecoveryConfiguration;
  versioning: VersioningConfiguration;
  migration: MigrationState;
  deployment: DeploymentConfiguration;
  scaling: ScalingConfiguration;
  optimization: OptimizationSettings;
  caching: CacheConfiguration;
  cdn: CDNConfiguration;
  api: APIConfiguration;
  webhooks: WebhookConfiguration;
  events: EventConfiguration;
  logging: LoggingConfiguration;
  metrics: MetricsConfiguration;
  alerts: AlertConfiguration;
  health: HealthCheckConfiguration;
  status: StatusPageConfiguration;
  maintenance: MaintenanceConfiguration;
  updates: UpdateConfiguration;
  patches: PatchConfiguration;
  hotfixes: HotfixConfiguration
}

interface ClassificationView {
  id: string;
  name: string;
  type: ViewType;
  layout: ViewLayout;
  components: ViewComponent[];
  filters: ViewFilter[];
  sorting: ViewSorting;
  grouping: ViewGrouping;
  pagination: ViewPagination;
  customization: ViewCustomization;
  permissions: ViewPermissions;
  sharing: ViewSharing;
  bookmarks: ViewBookmark[];
  history: ViewHistory[];
  preferences: ViewPreferences;
  metadata: ViewMetadata;
}

interface SystemStatus {
  overall: OverallStatus;
  services: ServiceStatus[];
  infrastructure: InfrastructureStatus;
  performance: PerformanceStatus;
  security: SecurityStatus;
  compliance: ComplianceStatus;
  monitoring: MonitoringStatus;
  alerts: AlertStatus[];
  incidents: IncidentStatus[];
  maintenance: MaintenanceStatus;
  updates: UpdateStatus;
  health: HealthStatus;
  availability: AvailabilityStatus;
  reliability: ReliabilityStatus;
  scalability: ScalabilityStatus;
  efficiency: EfficiencyStatus;
  quality: QualityStatus;
  satisfaction: SatisfactionStatus;
}

interface UserPreferences {
  theme: ThemePreference;
  layout: LayoutPreference;
  navigation: NavigationPreference;
  dashboard: DashboardPreference;
  notifications: NotificationPreference;
  accessibility: AccessibilityPreference;
  localization: LocalizationPreference;
  privacy: PrivacyPreference;
  security: SecurityPreference;
  performance: PerformancePreference;
  automation: AutomationPreference;
  collaboration: CollaborationPreference;
  integration: IntegrationPreference;
  customization: CustomizationPreference;
  shortcuts: ShortcutPreference[];
  bookmarks: BookmarkPreference[];
  history: HistoryPreference;
  search: SearchPreference;
  filters: FilterPreference[];
  views: ViewPreference[];
  exports: ExportPreference;
  imports: ImportPreference;
  backup: BackupPreference;
  sync: SyncPreference;
  offline: OfflinePreference;
  mobile: MobilePreference;
  desktop: DesktopPreference;
  web: WebPreference;
  api: APIPreference;
  webhooks: WebhookPreference;
  events: EventPreference;
  logging: LoggingPreference;
  monitoring: MonitoringPreference;
  analytics: AnalyticsPreference;
  feedback: FeedbackPreference;
  support: SupportPreference;
  documentation: DocumentationPreference;
  tutorials: TutorialPreference;
  onboarding: OnboardingPreference;
  experiments: ExperimentPreference;
  features: FeaturePreference[];
}

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user: ActivityUser;
  context: ActivityContext;
  metadata: ActivityMetadata;
  severity: ActivitySeverity;
  category: ActivityCategory;
  tags: string[];
  related: RelatedActivity[];
  actions: ActivityAction[];
  status: ActivityStatus;
  visibility: ActivityVisibility;
  retention: ActivityRetention;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  category: NotificationCategory;
  source: NotificationSource;
  target: NotificationTarget;
  actions: NotificationAction[];
  status: NotificationStatus;
  read: boolean;
  dismissed: boolean;
  archived: boolean;
  metadata: NotificationMetadata;
  delivery: NotificationDelivery;
  tracking: NotificationTracking;
  preferences: NotificationPreferences;
  automation: NotificationAutomation;
  escalation: NotificationEscalation;
  grouping: NotificationGrouping;
  batching: NotificationBatching;
  throttling: NotificationThrottling;
  filtering: NotificationFiltering;
  routing: NotificationRouting;
  formatting: NotificationFormatting;
  localization: NotificationLocalization;
  personalization: NotificationPersonalization;
  analytics: NotificationAnalytics;
  feedback: NotificationFeedback;
  compliance: NotificationCompliance;
  security: NotificationSecurity;
  privacy: NotificationPrivacy;
}

// Additional type definitions
type ClassificationVersion = 'v1-manual' | 'v2-ml' | 'v3-ai' | 'orchestration' | 'all';
type ViewType = 'dashboard' | 'table' | 'grid' | 'list' | 'kanban' | 'timeline' | 'calendar' | 'map' | 'chart' | 'graph';
type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'share' | 'collaborate' | 'analyze' | 'optimize';
type ActivitySeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
type ActivityCategory = 'user' | 'system' | 'security' | 'performance' | 'compliance' | 'integration' | 'automation';
type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled' | 'archived';
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert' | 'reminder' | 'update' | 'announcement';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
type NotificationCategory = 'system' | 'security' | 'performance' | 'user' | 'business' | 'technical' | 'operational';
type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';
type Theme = 'light' | 'dark' | 'auto' | 'high-contrast' | 'custom';
type OverallStatus = 'healthy' | 'degraded' | 'partial-outage' | 'major-outage' | 'maintenance';

// Constants
const CLASSIFICATION_VERSIONS = [
  {
    id: 'v1-manual',
    name: 'Manual & Rule-Based',
    description: 'Traditional classification with manual rules and policies',
    icon: Settings,
    color: 'blue',
    components: [
      { id: 'framework-manager', name: 'Framework Manager', icon: Building },
      { id: 'rule-engine', name: 'Rule Engine', icon: Zap },
      { id: 'policy-orchestrator', name: 'Policy Orchestrator', icon: Shield },
      { id: 'bulk-operation-center', name: 'Bulk Operation Center', icon: Package },
      { id: 'audit-trail-analyzer', name: 'Audit Trail Analyzer', icon: Search },
      { id: 'compliance-dashboard', name: 'Compliance Dashboard', icon: CheckCircle }
    ]
  },
  {
    id: 'v2-ml',
    name: 'ML-Driven',
    description: 'Machine learning powered classification and analysis',
    icon: Brain,
    color: 'green',
    components: [
      { id: 'ml-model-orchestrator', name: 'ML Model Orchestrator', icon: Network },
      { id: 'training-pipeline-manager', name: 'Training Pipeline Manager', icon: GitBranch },
      { id: 'adaptive-learning-center', name: 'Adaptive Learning Center', icon: TrendingUp },
      { id: 'hyperparameter-optimizer', name: 'Hyperparameter Optimizer', icon: Target },
      { id: 'drift-detection-monitor', name: 'Drift Detection Monitor', icon: AlertTriangle },
      { id: 'feature-engineering-studio', name: 'Feature Engineering Studio', icon: Wrench },
      { id: 'model-ensemble-builder', name: 'Model Ensemble Builder', icon: Boxes },
      { id: 'ml-analytics-dashboard', name: 'ML Analytics Dashboard', icon: BarChart3 }
    ]
  },
  {
    id: 'v3-ai',
    name: 'AI-Intelligent',
    description: 'Advanced AI with cognitive processing and reasoning',
    icon: Zap,
    color: 'purple',
    components: [
      { id: 'ai-intelligence-orchestrator', name: 'AI Intelligence Orchestrator', icon: Brain },
      { id: 'conversation-manager', name: 'Conversation Manager', icon: MessageSquare },
      { id: 'explainable-reasoning-viewer', name: 'Explainable Reasoning Viewer', icon: Eye },
      { id: 'auto-tagging-engine', name: 'Auto Tagging Engine', icon: Tag },
      { id: 'workload-optimizer', name: 'Workload Optimizer', icon: Cpu },
      { id: 'real-time-intelligence-stream', name: 'Real-Time Intelligence Stream', icon: Activity },
      { id: 'knowledge-synthesizer', name: 'Knowledge Synthesizer', icon: Lightbulb },
      { id: 'ai-analytics-dashboard', name: 'AI Analytics Dashboard', icon: PieChart }
    ]
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    description: 'Cross-version coordination and business intelligence',
    icon: Workflow,
    color: 'orange',
    components: [
      { id: 'classification-workflow', name: 'Classification Workflow', icon: GitBranch },
      { id: 'intelligence-coordinator', name: 'Intelligence Coordinator', icon: Network },
      { id: 'business-intelligence-hub', name: 'Business Intelligence Hub', icon: BarChart3 }
    ]
  }
] as const;

const QUICK_ACTIONS = [
  { id: 'new-classification', name: 'New Classification', icon: Plus, shortcut: 'Ctrl+N' },
  { id: 'import-data', name: 'Import Data', icon: Upload, shortcut: 'Ctrl+I' },
  { id: 'export-results', name: 'Export Results', icon: Download, shortcut: 'Ctrl+E' },
  { id: 'run-analysis', name: 'Run Analysis', icon: Play, shortcut: 'Ctrl+R' },
  { id: 'schedule-task', name: 'Schedule Task', icon: Calendar, shortcut: 'Ctrl+S' },
  { id: 'view-reports', name: 'View Reports', icon: FileText, shortcut: 'Ctrl+V' },
  { id: 'manage-models', name: 'Manage Models', icon: Database, shortcut: 'Ctrl+M' },
  { id: 'system-health', name: 'System Health', icon: Monitor, shortcut: 'Ctrl+H' }
] as const;

const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+K', action: 'Open Command Palette', category: 'Navigation' },
  { key: 'Ctrl+/', action: 'Toggle Sidebar', category: 'Navigation' },
  { key: 'Ctrl+B', action: 'Toggle Bookmarks', category: 'Navigation' },
  { key: 'Ctrl+F', action: 'Search', category: 'Search' },
  { key: 'Ctrl+G', action: 'Global Search', category: 'Search' },
  { key: 'Ctrl+N', action: 'New Item', category: 'Actions' },
  { key: 'Ctrl+S', action: 'Save', category: 'Actions' },
  { key: 'Ctrl+Z', action: 'Undo', category: 'Actions' },
  { key: 'Ctrl+Y', action: 'Redo', category: 'Actions' },
  { key: 'Ctrl+D', action: 'Duplicate', category: 'Actions' },
  { key: 'Delete', action: 'Delete Selected', category: 'Actions' },
  { key: 'Ctrl+A', action: 'Select All', category: 'Selection' },
  { key: 'Ctrl+C', action: 'Copy', category: 'Clipboard' },
  { key: 'Ctrl+V', action: 'Paste', category: 'Clipboard' },
  { key: 'Ctrl+X', action: 'Cut', category: 'Clipboard' },
  { key: 'F1', action: 'Help', category: 'System' },
  { key: 'F5', action: 'Refresh', category: 'System' },
  { key: 'F11', action: 'Fullscreen', category: 'View' },
  { key: 'Ctrl+Plus', action: 'Zoom In', category: 'View' },
  { key: 'Ctrl+Minus', action: 'Zoom Out', category: 'View' },
  { key: 'Ctrl+0', action: 'Reset Zoom', category: 'View' }
] as const;

const THEMES = [
  { id: 'light', name: 'Light', description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes for long sessions' },
  { id: 'auto', name: 'Auto', description: 'Follows system preference' },
  { id: 'high-contrast', name: 'High Contrast', description: 'Enhanced accessibility' },
  { id: 'custom', name: 'Custom', description: 'Personalized color scheme' }
] as const;

const STATUS_INDICATORS = {
  healthy: { color: 'green', icon: CheckCircle, label: 'All systems operational' },
  degraded: { color: 'yellow', icon: AlertTriangle, label: 'Some systems degraded' },
  'partial-outage': { color: 'orange', icon: AlertTriangle, label: 'Partial service outage' },
  'major-outage': { color: 'red', icon: XCircle, label: 'Major service outage' },
  maintenance: { color: 'blue', icon: Settings, label: 'Scheduled maintenance' }
} as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// Mock data generators
const generateSystemStatus = (): SystemStatus => ({
  overall: 'healthy',
  services: [
    { id: 'api', name: 'API Gateway', status: 'healthy', uptime: 99.9, responseTime: 45 },
    { id: 'database', name: 'Database', status: 'healthy', uptime: 99.8, responseTime: 12 },
    { id: 'ml-engine', name: 'ML Engine', status: 'degraded', uptime: 98.5, responseTime: 230 },
    { id: 'ai-processor', name: 'AI Processor', status: 'healthy', uptime: 99.7, responseTime: 180 },
    { id: 'storage', name: 'Storage', status: 'healthy', uptime: 99.9, responseTime: 8 },
    { id: 'cache', name: 'Cache Layer', status: 'healthy', uptime: 99.6, responseTime: 3 }
  ],
  infrastructure: {} as InfrastructureStatus,
  performance: {} as PerformanceStatus,
  security: {} as SecurityStatus,
  compliance: {} as ComplianceStatus,
  monitoring: {} as MonitoringStatus,
  alerts: [],
  incidents: [],
  maintenance: {} as MaintenanceStatus,
  updates: {} as UpdateStatus,
  health: {} as HealthStatus,
  availability: {} as AvailabilityStatus,
  reliability: {} as ReliabilityStatus,
  scalability: {} as ScalabilityStatus,
  efficiency: {} as EfficiencyStatus,
  quality: {} as QualityStatus,
  satisfaction: {} as SatisfactionStatus
});

const generateRecentActivities = (): Activity[] => [
  {
    id: 'activity-001',
    type: 'create',
    title: 'New ML Model Deployed',
    description: 'Document classifier v2.1 has been successfully deployed to production',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    user: { id: 'user-001', name: 'Alice Johnson', avatar: '/avatars/alice.jpg' },
    context: { component: 'ml-model-orchestrator', version: 'v2-ml' },
    metadata: { model: 'document-classifier-v2.1', accuracy: 94.5 },
    severity: 'medium',
    category: 'system',
    tags: ['deployment', 'ml', 'production'],
    related: [],
    actions: [],
    status: 'completed',
    visibility: 'public',
    retention: {} as ActivityRetention
  },
  {
    id: 'activity-002',
    type: 'analyze',
    title: 'Performance Analysis Completed',
    description: 'Weekly performance analysis shows 12% improvement in processing speed',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    user: { id: 'user-002', name: 'Bob Smith', avatar: '/avatars/bob.jpg' },
    context: { component: 'ai-analytics-dashboard', version: 'v3-ai' },
    metadata: { improvement: 12, metric: 'processing-speed' },
    severity: 'low',
    category: 'performance',
    tags: ['analysis', 'performance', 'improvement'],
    related: [],
    actions: [],
    status: 'completed',
    visibility: 'public',
    retention: {} as ActivityRetention
  },
  {
    id: 'activity-003',
    type: 'update',
    title: 'Security Policy Updated',
    description: 'Enhanced security policies for data classification have been implemented',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: { id: 'user-003', name: 'Carol Davis', avatar: '/avatars/carol.jpg' },
    context: { component: 'policy-orchestrator', version: 'v1-manual' },
    metadata: { policies: 3, level: 'enhanced' },
    severity: 'high',
    category: 'security',
    tags: ['security', 'policy', 'compliance'],
    related: [],
    actions: [],
    status: 'completed',
    visibility: 'restricted',
    retention: {} as ActivityRetention
  }
];

const generateNotifications = (): Notification[] => [
  {
    id: 'notif-001',
    type: 'warning',
    title: 'Model Drift Detected',
    message: 'The sentiment analysis model is showing signs of drift. Consider retraining.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    priority: 'high',
    category: 'technical',
    source: { id: 'drift-monitor', name: 'Drift Detection Monitor' },
    target: { users: ['ml-team'], roles: ['data-scientist'] },
    actions: [
      { id: 'retrain', label: 'Retrain Model', type: 'primary' },
      { id: 'investigate', label: 'Investigate', type: 'secondary' }
    ],
    status: 'sent',
    read: false,
    dismissed: false,
    archived: false,
    metadata: { model: 'sentiment-analyzer', drift: 0.23 },
    delivery: {} as NotificationDelivery,
    tracking: {} as NotificationTracking,
    preferences: {} as NotificationPreferences,
    automation: {} as NotificationAutomation,
    escalation: {} as NotificationEscalation,
    grouping: {} as NotificationGrouping,
    batching: {} as NotificationBatching,
    throttling: {} as NotificationThrottling,
    filtering: {} as NotificationFiltering,
    routing: {} as NotificationRouting,
    formatting: {} as NotificationFormatting,
    localization: {} as NotificationLocalization,
    personalization: {} as NotificationPersonalization,
    analytics: {} as NotificationAnalytics,
    feedback: {} as NotificationFeedback,
    compliance: {} as NotificationCompliance,
    security: {} as NotificationSecurity,
    privacy: {} as NotificationPrivacy
  },
  {
    id: 'notif-002',
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily system backup has been completed successfully.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: 'low',
    category: 'system',
    source: { id: 'backup-service', name: 'Backup Service' },
    target: { users: ['admin'], roles: ['system-admin'] },
    actions: [],
    status: 'delivered',
    read: true,
    dismissed: false,
    archived: false,
    metadata: { size: '2.3GB', duration: '45min' },
    delivery: {} as NotificationDelivery,
    tracking: {} as NotificationTracking,
    preferences: {} as NotificationPreferences,
    automation: {} as NotificationAutomation,
    escalation: {} as NotificationEscalation,
    grouping: {} as NotificationGrouping,
    batching: {} as NotificationBatching,
    throttling: {} as NotificationThrottling,
    filtering: {} as NotificationFiltering,
    routing: {} as NotificationRouting,
    formatting: {} as NotificationFormatting,
    localization: {} as NotificationLocalization,
    personalization: {} as NotificationPersonalization,
    analytics: {} as NotificationAnalytics,
    feedback: {} as NotificationFeedback,
    compliance: {} as NotificationCompliance,
    security: {} as NotificationSecurity,
    privacy: {} as NotificationPrivacy
  },
  {
    id: 'notif-003',
    type: 'info',
    title: 'New Feature Available',
    message: 'Real-time intelligence streaming is now available in the AI-Intelligent version.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    priority: 'medium',
    category: 'user',
    source: { id: 'feature-service', name: 'Feature Service' },
    target: { users: ['all'], roles: ['user'] },
    actions: [
      { id: 'learn-more', label: 'Learn More', type: 'primary' },
      { id: 'dismiss', label: 'Dismiss', type: 'secondary' }
    ],
    status: 'delivered',
    read: false,
    dismissed: false,
    archived: false,
    metadata: { feature: 'real-time-streaming', version: 'v3-ai' },
    delivery: {} as NotificationDelivery,
    tracking: {} as NotificationTracking,
    preferences: {} as NotificationPreferences,
    automation: {} as NotificationAutomation,
    escalation: {} as NotificationEscalation,
    grouping: {} as NotificationGrouping,
    batching: {} as NotificationBatching,
    throttling: {} as NotificationThrottling,
    filtering: {} as NotificationFiltering,
    routing: {} as NotificationRouting,
    formatting: {} as NotificationFormatting,
    localization: {} as NotificationLocalization,
    personalization: {} as NotificationPersonalization,
    analytics: {} as NotificationAnalytics,
    feedback: {} as NotificationFeedback,
    compliance: {} as NotificationCompliance,
    security: {} as NotificationSecurity,
    privacy: {} as NotificationPrivacy
  }
];

const generatePerformanceMetrics = () => ({
  cpu: { current: 45, average: 52, peak: 78 },
  memory: { current: 68, average: 71, peak: 89 },
  network: { current: 23, average: 28, peak: 45 },
  storage: { current: 34, average: 36, peak: 52 },
  requests: { current: 1250, average: 1180, peak: 2340 },
  errors: { current: 12, average: 8, peak: 23 },
  latency: { current: 145, average: 167, peak: 289 },
  throughput: { current: 890, average: 856, peak: 1456 }
});

const generateAnalyticsData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      hour: hour.getHours(),
      users: Math.floor(50 + Math.random() * 200),
      classifications: Math.floor(100 + Math.random() * 500),
      accuracy: 90 + Math.random() * 8,
      processing_time: 100 + Math.random() * 100
    });
  }
  return data;
};

// Loading component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Component
export const ClassificationsSPA: React.FC = () => {
  // State Management
  const [state, setState] = useState<ClassificationsSPAState>({
    isLoading: false,
    error: null,
    currentView: {
      id: 'dashboard',
      name: 'Dashboard',
      type: 'dashboard',
      layout: {} as ViewLayout,
      components: [],
      filters: [],
      sorting: {} as ViewSorting,
      grouping: {} as ViewGrouping,
      pagination: {} as ViewPagination,
      customization: {} as ViewCustomization,
      permissions: {} as ViewPermissions,
      sharing: {} as ViewSharing,
      bookmarks: [],
      history: [],
      preferences: {} as ViewPreferences,
      metadata: {} as ViewMetadata
    },
    currentVersion: 'all',
    currentComponent: null,
    sidebarOpen: true,
    commandPaletteOpen: false,
    notificationsOpen: false,
    settingsOpen: false,
    profileOpen: false,
    searchQuery: '',
    globalFilters: [],
    recentActivities: generateRecentActivities(),
    systemStatus: generateSystemStatus(),
    userPreferences: {} as UserPreferences,
    theme: 'light',
    layout: {} as LayoutConfiguration,
    performance: {} as PerformanceMetrics,
    analytics: {} as AnalyticsData,
    notifications: generateNotifications(),
    shortcuts: [],
    integrations: [],
    security: {} as SecurityConfiguration,
    collaboration: {} as CollaborationSettings,
    automation: {} as AutomationSettings,
    monitoring: {} as MonitoringConfiguration,
    compliance: {} as ComplianceSettings,
    governance: {} as GovernanceConfiguration,
    realTimeMode: true,
    autoSave: true,
    debugMode: false,
    maintenanceMode: false,
    featureFlags: [],
    experiments: [],
    telemetry: {} as TelemetryData,
    feedback: [],
    support: {} as SupportConfiguration,
    documentation: {} as DocumentationLinks,
    tutorials: [],
    onboarding: {} as OnboardingState,
    accessibility: {} as AccessibilitySettings,
    localization: {} as LocalizationSettings,
    breadcrumbs: [
      { id: 'home', label: 'Classifications', href: '/' }
    ],
    quickActions: [],
    contextMenu: [],
    dragDropState: {} as DragDropState,
    clipboard: {} as ClipboardData,
    undoRedoStack: {} as UndoRedoState,
    bulkOperations: {} as BulkOperationState,
    dataExport: {} as DataExportState,
    dataImport: {} as DataImportState,
    backup: {} as BackupConfiguration,
    recovery: {} as RecoveryConfiguration,
    versioning: {} as VersioningConfiguration,
    migration: {} as MigrationState,
    deployment: {} as DeploymentConfiguration,
    scaling: {} as ScalingConfiguration,
    optimization: {} as OptimizationSettings,
    caching: {} as CacheConfiguration,
    cdn: {} as CDNConfiguration,
    api: {} as APIConfiguration,
    webhooks: {} as WebhookConfiguration,
    events: {} as EventConfiguration,
    logging: {} as LoggingConfiguration,
    metrics: {} as MetricsConfiguration,
    alerts: {} as AlertConfiguration,
    health: {} as HealthCheckConfiguration,
    status: {} as StatusPageConfiguration,
    maintenance: {} as MaintenanceConfiguration,
    updates: {} as UpdateConfiguration,
    patches: {} as PatchConfiguration,
    hotfixes: {} as HotfixConfiguration
  });

  // Custom hooks
  const { classifications, updateClassification } = useClassificationState();
  const { aiModels, aiAgents, startIntelligence, stopIntelligence } = useAIIntelligence();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  // Memoized data
  const performanceMetrics = useMemo(() => generatePerformanceMetrics(), []);
  const analyticsData = useMemo(() => generateAnalyticsData(), []);
  const filteredVersions = useMemo(() => {
    if (state.currentVersion === 'all') return CLASSIFICATION_VERSIONS;
    return CLASSIFICATION_VERSIONS.filter(v => v.id === state.currentVersion);
  }, [state.currentVersion]);

  // Effects
  useEffect(() => {
    // Initialize real-time updates
    if (state.realTimeMode) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.realTimeMode]);

  useEffect(() => {
    // Initialize WebSocket connection
    if (state.realTimeMode) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [state.realTimeMode]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
            break;
          case '/':
            event.preventDefault();
            setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
            break;
          case 'f':
            event.preventDefault();
            // Focus search input
            break;
          case 'n':
            event.preventDefault();
            handleQuickAction('new-classification');
            break;
          case 'r':
            event.preventDefault();
            handleRefreshData();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setState(prev => ({
          ...prev,
          commandPaletteOpen: false,
          notificationsOpen: false,
          settingsOpen: false,
          profileOpen: false
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WebSocket initialization
  const initializeWebSocket = useCallback(() => {
    try {
      websocketRef.current = websocketApi.connect('classifications-spa');
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Real-time connection failed' }));
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Refresh system status, activities, and notifications
      const [systemStatus, activities, notifications] = await Promise.all([
        aiApi.getSystemStatus(),
        aiApi.getRecentActivities(),
        aiApi.getNotifications()
      ]);

      setState(prev => ({
        ...prev,
        systemStatus,
        recentActivities: activities,
        notifications,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      systemStatus: { ...prev.systemStatus, ...data.systemStatus },
      recentActivities: data.activities || prev.recentActivities,
      notifications: data.notifications || prev.notifications,
      performance: { ...prev.performance, ...data.performance }
    }));
  }, []);

  const handleVersionChange = useCallback((version: ClassificationVersion) => {
    setState(prev => ({
      ...prev,
      currentVersion: version,
      currentComponent: null,
      breadcrumbs: [
        { id: 'home', label: 'Classifications', href: '/' },
        { id: version, label: CLASSIFICATION_VERSIONS.find(v => v.id === version)?.name || version, href: `/${version}` }
      ]
    }));
  }, []);

  const handleComponentSelect = useCallback((componentId: string) => {
    const version = CLASSIFICATION_VERSIONS.find(v => 
      v.components.some(c => c.id === componentId)
    );
    const component = version?.components.find(c => c.id === componentId);
    
    setState(prev => ({
      ...prev,
      currentComponent: componentId,
      breadcrumbs: [
        { id: 'home', label: 'Classifications', href: '/' },
        { id: version?.id || '', label: version?.name || '', href: `/${version?.id}` },
        { id: componentId, label: component?.name || componentId, href: `/${version?.id}/${componentId}` }
      ]
    }));
  }, []);

  const handleQuickAction = useCallback(async (actionId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      switch (actionId) {
        case 'new-classification':
          // Handle new classification
          break;
        case 'import-data':
          // Handle data import
          break;
        case 'export-results':
          // Handle export
          break;
        case 'run-analysis':
          // Handle analysis
          break;
        case 'schedule-task':
          // Handle task scheduling
          break;
        case 'view-reports':
          // Handle reports
          break;
        case 'manage-models':
          // Handle model management
          break;
        case 'system-health':
          // Handle system health
          break;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Action failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleNotificationAction = useCallback(async (notificationId: string, actionId: string) => {
    try {
      await aiApi.handleNotificationAction(notificationId, actionId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }, []);

  const handleThemeChange = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    // Apply theme to document
    document.documentElement.className = theme;
  }, []);

  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    // Implement search logic
  }, []);

  // Utility functions
  const formatUptime = (uptime: number): string => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatResponseTime = (time: number): string => {
    return `${time}ms`;
  };

  const getStatusColor = (status: string): string => {
    return STATUS_INDICATORS[status as keyof typeof STATUS_INDICATORS]?.color || 'gray';
  };

  const getUnreadNotificationsCount = (): number => {
    return state.notifications.filter(n => !n.read).length;
  };

  const renderComponent = useCallback(() => {
    if (!state.currentComponent) return null;

    const componentMap: { [key: string]: React.ComponentType } = {
      'framework-manager': FrameworkManager,
      'rule-engine': RuleEngine,
      'policy-orchestrator': PolicyOrchestrator,
      'bulk-operation-center': BulkOperationCenter,
      'audit-trail-analyzer': AuditTrailAnalyzer,
      'compliance-dashboard': ComplianceDashboard,
      'ml-model-orchestrator': MLModelOrchestrator,
      'training-pipeline-manager': TrainingPipelineManager,
      'adaptive-learning-center': AdaptiveLearningCenter,
      'hyperparameter-optimizer': HyperparameterOptimizer,
      'drift-detection-monitor': DriftDetectionMonitor,
      'feature-engineering-studio': FeatureEngineeringStudio,
      'model-ensemble-builder': ModelEnsembleBuilder,
      'ml-analytics-dashboard': MLAnalyticsDashboard,
      'ai-intelligence-orchestrator': AIIntelligenceOrchestrator,
      'conversation-manager': ConversationManager,
      'explainable-reasoning-viewer': ExplainableReasoningViewer,
      'auto-tagging-engine': AutoTaggingEngine,
      'workload-optimizer': WorkloadOptimizer,
      'real-time-intelligence-stream': RealTimeIntelligenceStream,
      'knowledge-synthesizer': KnowledgeSynthesizer,
      'ai-analytics-dashboard': AIAnalyticsDashboard,
      'classification-workflow': ClassificationWorkflow,
      'intelligence-coordinator': IntelligenceCoordinator,
      'business-intelligence-hub': BusinessIntelligenceHub
    };

    const Component = componentMap[state.currentComponent];
    if (!Component) return <div>Component not found</div>;

    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner message={`Loading ${state.currentComponent}...`} />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    );
  }, [state.currentComponent]);

  // Render functions
  const renderSidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-background border-r transition-transform duration-300 z-40 ${
      state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } w-64`}>
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Classifications</h1>
              <p className="text-xs text-muted-foreground">Enterprise Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-1">
                {QUICK_ACTIONS.slice(0, 4).map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Classification Versions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Classification Versions</h3>
              <div className="space-y-2">
                {CLASSIFICATION_VERSIONS.map((version) => (
                  <div key={version.id}>
                    <Button
                      variant={state.currentVersion === version.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleVersionChange(version.id)}
                    >
                      <version.icon className="h-4 w-4 mr-2" />
                      {version.name}
                    </Button>
                    
                    {state.currentVersion === version.id && (
                      <div className="ml-6 mt-1 space-y-1">
                        {version.components.map((component) => (
                          <Button
                            key={component.id}
                            variant={state.currentComponent === component.id ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleComponentSelect(component.id)}
                          >
                            <component.icon className="h-3 w-3 mr-2" />
                            {component.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* System Status */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall</span>
                  <Badge variant="outline" className={`text-${getStatusColor(state.systemStatus.overall)}-600`}>
                    {state.systemStatus.overall}
                  </Badge>
                </div>
                {state.systemStatus.services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{service.name}</span>
                    <span className={`text-${getStatusColor(service.status)}-600`}>
                      {formatUptime(service.uptime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="/avatars/user.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">John Doe</div>
                  <div className="text-xs text-muted-foreground">Admin</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2">
            {state.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => {
                    if (index === 0) {
                      setState(prev => ({ ...prev, currentVersion: 'all', currentComponent: null }));
                    } else if (index === 1) {
                      handleVersionChange(crumb.id as ClassificationVersion);
                    }
                  }}
                >
                  {crumb.label}
                </Button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classifications, models, or workflows..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Command Palette */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, commandPaletteOpen: true }))}
          >
            <CommandIcon className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {getUnreadNotificationsCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {getUnreadNotificationsCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm">
                    Mark all read
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {state.notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${!notification.read ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <h5 className="font-medium mt-1">{notification.title}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            {notification.actions.length > 0 && (
                              <div className="flex space-x-2 mt-2">
                                {notification.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    size="sm"
                                    variant={action.type === 'primary' ? 'default' : 'outline'}
                                    onClick={() => handleNotificationAction(notification.id, action.id)}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Monitor className="h-4 w-4 mr-2" />
                System Health
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Database className="h-4 w-4 mr-2" />
                Data Management
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Security
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Theme
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {THEMES.map((theme) => (
                      <DropdownMenuItem
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id as Theme)}
                      >
                        {theme.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Real-time indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-xs text-muted-foreground">
              {state.realTimeMode ? 'Live' : 'Static'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Classifications Platform</h2>
            <p className="text-muted-foreground">
              Enterprise-grade classification system with AI-powered intelligence and advanced analytics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Classification
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classifications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              3 models training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.7%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Classification Analytics</CardTitle>
            <CardDescription>
              24-hour classification activity and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" fill={CHART_COLORS[0]} stroke={CHART_COLORS[0]} fillOpacity={0.3} />
                  <Bar dataKey="classifications" fill={CHART_COLORS[1]} />
                  <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS[2]} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {state.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Classification Versions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CLASSIFICATION_VERSIONS.map((version) => (
          <Card key={version.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVersionChange(version.id)}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-${version.color}-100 dark:bg-${version.color}-900 flex items-center justify-center`}>
                  <version.icon className={`h-6 w-6 text-${version.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{version.name}</CardTitle>
                  <CardDescription className="text-sm">{version.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Components</span>
                  <Badge variant="outline">{version.components.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Explore {version.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Real-time system performance and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{performanceMetrics.cpu.current}%</span>
              </div>
              <Progress value={performanceMetrics.cpu.current} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{performanceMetrics.memory.current}%</span>
              </div>
              <Progress value={performanceMetrics.memory.current} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-muted-foreground">{performanceMetrics.network.current}%</span>
              </div>
              <Progress value={performanceMetrics.network.current} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-muted-foreground">{performanceMetrics.storage.current}%</span>
              </div>
              <Progress value={performanceMetrics.storage.current} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommandPalette = () => (
    <Dialog open={state.commandPaletteOpen} onOpenChange={(open) => setState(prev => ({ ...prev, commandPaletteOpen: open }))}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Type a command or search for anything
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              {QUICK_ACTIONS.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    handleQuickAction(action.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Navigation">
              {CLASSIFICATION_VERSIONS.map((version) => (
                <CommandItem
                  key={version.id}
                  onSelect={() => {
                    handleVersionChange(version.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <version.icon className="h-4 w-4 mr-2" />
                  Go to {version.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Components">
              {CLASSIFICATION_VERSIONS.flatMap(v => v.components).map((component) => (
                <CommandItem
                  key={component.id}
                  onSelect={() => {
                    handleComponentSelect(component.id);
                    setState(prev => ({ ...prev, commandPaletteOpen: false }));
                  }}
                >
                  <component.icon className="h-4 w-4 mr-2" />
                  Open {component.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );

  // Main render
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          state.sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          {/* Header */}
          {renderHeader()}

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-200">{state.error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, error: null }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {state.isLoading && (
                <div className="mb-6">
                  <LoadingSpinner />
                </div>
              )}

              {/* Render current view */}
              {state.currentComponent ? renderComponent() : renderDashboard()}
            </div>
          </main>
        </div>

        {/* Command Palette */}
        {renderCommandPalette()}

        {/* Overlay for mobile sidebar */}
        {state.sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default ClassificationsSPA;