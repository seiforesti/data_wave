// ============================================================================
// SEMANTIC SEARCH ENGINE - ADVANCED SEARCH COMPONENT (2300+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Semantic Search Component
// Natural language processing, query expansion, relevance ranking,
// faceted search, and AI-powered query understanding
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef, useContext } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// Icons
import {
  Search,
  SearchCheck,
  SearchX,
  ScanSearch,
  SearchCode,
  Sparkles,
  Brain,
  Zap,
  Target,
  Focus,
  Radar,
  Crosshair,
  ScanLine,
  Eye,
  EyeOff,
  Filter,
  FilterX,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Grid3X3,
  List,
  LayoutGrid,
  LayoutList,
  Map,
  Globe,
  Calendar,
  Clock,
  Timer,
  Stopwatch,
  History,
  BookOpen,
  Book,
  Library,
  Bookmark,
  BookmarkCheck,
  Tag,
  Tags,
  Hash,
  AtSign,
  Percent,
  Star,
  StarOff,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  BarChart2,
  AreaChart,
  ScatterChart,
  Loader2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronsLeftRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerDownRight,
  CornerUpRight,
  Move,
  MoveHorizontal,
  MoveVertical,
  Navigation,
  Navigation2,
  Compass,
  MapPin,
  Route,
  Plus,
  Minus,
  X,
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings,
  Sliders,
  Cog,
  Wrench,
  Tool,
  Hammer,
  Spanner,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Building,
  Building2,
  Home,
  MapIcon,
  Layers,
  Database,
  Table,
  Columns,
  Rows,
  Grid,
  FileText,
  File,
  Files,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  Archive,
  Package,
  Box,
  Container,
  Inbox,
  Outbox,
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  Video,
  Share,
  Share2,
  ExternalLink,
  Link,
  LinkIcon,
  Unlink,
  Copy,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  Download,
  Upload,
  Import,
  Export,
  Save,
  Edit,
  Edit2,
  Edit3,
  Pencil,
  PenTool,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Trash,
  Trash2,
  Delete,
  Eraser,
  Scissors,
  Cut,
  Code,
  Code2,
  Terminal,
  Command,
  Keyboard,
  Mouse,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Battery,
  BatteryFull,
  BatteryHalf,
  BatteryLow,
  Power,
  PowerOff,
  Plug,
  Cable,
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  VolumeX,
  Headphones,
  Speaker,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Image,
  Images,
  Film,
  Video as VideoIcon,
  Music,
  Radio,
  Disc,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Record,
  FastForward,
  Rewind,
  Repeat,
  Repeat1,
  ListMusic,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarHeart,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  CalendarX,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Umbrella,
  Rainbow,
  Snowflake,
  Flame,
  Droplets,
  Wind,
  Zap as ZapIcon,
  Lightbulb,
  Flashlight,
  Candle,
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWallDown,
  LampWallUp,
  Sun as SunIcon,
  Moon as MoonIcon,
  Stars,
  CloudMoon,
  CloudSunRain,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Glasses,
  Aperture,
  Focus as FocusIcon,
  ScanFace,
  ScanEye,
  Fingerprint,
  ShieldCheck,
  Shield,
  ShieldAlert,
  ShieldX,
  Lock,
  LockOpen,
  Unlock,
  Key,
  KeyRound,
  KeySquare,
  Gauge,
  Speedometer,
  Timer as TimerIcon,
  Clock3,
  Clock6,
  Clock9,
  Clock12,
  AlarmClock,
  Hourglass,
  Sandglass,
  Award,
  Medal,
  Trophy,
  Crown,
  Gem,
  Diamond,
  Coins,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  IndianRupee,
  Bitcoin,
  CreditCard,
  Banknote,
  Receipt,
  Calculator,
  Scale,
  Weight,
  Ruler,
  Tape,
  Pencil as PencilIcon,
  Pen,
  Brush,
  Paintbrush,
  Palette,
  Pipette,
  Swatch,
  Wand,
  Wand2,
  Sparkle,
  Sparkles as SparklesIcon,
  Confetti,
  PartyPopper,
  Gift,
  GiftCard,
  Cake,
  Candy,
  Cherry,
  Apple,
  Banana,
  Grape,
  Orange,
  Lemon,
  Strawberry,
  Carrot,
  Coffee,
  Cup,
  Wine,
  Beer,
  Martini,
  Pizza,
  Sandwich,
  IceCream,
  Car,
  Bus,
  Truck,
  Train,
  Plane,
  Ship,
  Boat,
  Bike,
  Motorcycle,
  Scooter,
  Taxi,
  Fuel,
  ParkingCircle,
  ParkingSquare,
  MapPinned,
  Milestone,
  Signpost,
  Construction,
  Hammer as HammerIcon,
  Wrench as WrenchIcon,
  Screwdriver,
  Drill,
  Saw,
  Anvil,
  Pickaxe,
  Shovel,
  Rake,
  Scissors as ScissorsIcon,
  Ruler as RulerIcon,
  TestTube,
  Microscope,
  Telescope,
  Magnet,
  Atom,
  Dna,
  FlaskConical,
  FlaskRound,
  Beaker,
  Pill,
  Syringe,
  Stethoscope,
  Thermometer as ThermometerIcon,
  Bandage,
  Cross,
  Plus as PlusIcon,
  Heart as HeartIcon,
  Activity as ActivityIcon,
  Pulse,
  Waves,
  Radio as RadioIcon,
  Radar as RadarIcon,
  Satellite,
  SatelliteDish,
  Antenna,
  Tower,
  Rss,
  Wifi as WifiIcon,
  Bluetooth,
  Nfc,
  QrCode,
  Barcode,
  ScanBarcode,
  Qr,
  ScanQr,
  Fingerprint as FingerprintIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  ShieldCheck as ShieldCheckIcon,
  Eye as SearchIcon,
  Binoculars,
  Telescope as TelescopeIcon,
  MagnifyingGlass,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  FullScreen,
  Crop,
  Move3d,
  RotateCw as RotateCwIcon,
  RotateCcw as RotateCcwIcon,
  FlipHorizontal,
  FlipVertical,
  Transform,
  Layers as LayersIcon,
  Layout,
  LayoutDashboard,
  LayoutTemplate,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Sidebar,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Ellipsis,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Binary,
  Hash as HashIcon,
  Braces,
  Brackets,
  Parentheses,
  Ampersand,
  AtSign as AtSignIcon,
  Percent as PercentIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';

// Chart Components
import {
  ResponsiveContainer,
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
  Tooltip as RechartsTooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  TreeMap,
  Sankey,
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush,
  ErrorBar
} from 'recharts';

// Text highlighting utility
import Highlighter from 'react-highlight-words';

// Advanced Catalog Types
import {
  IntelligentDataAsset,
  CatalogApiResponse,
  DataAssetType,
  AssetStatus,
  SensitivityLevel,
  DataQualityAssessment,
  SemanticEmbedding,
  DataAssetSchema,
  DataColumn,
  SchemaFormat,
  DataType,
  TechnicalMetadata,
  BusinessGlossaryTerm,
  SearchFilter,
  TimePeriod,
  DataLineage,
  DataLineageNode,
  AssetRelationship,
  AssetTag,
  AssetAnnotation,
  AssetMetrics,
  AssetUsage,
  AssetOwnership,
  AssetClassification,
  AssetCompliance
} from '../../types';

// Services
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { catalogAIService } from '../../services/catalog-ai.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { semanticSearchService } from '../../services/semantic-search.service';
import { dataLineageService } from '../../services/data-lineage.service';

// Hooks
import { 
  useCatalogDiscovery,
  useCatalogIntelligence,
  useMetadataManagement,
  useAdvancedSearch,
  useAssetRecommendations,
  useAssetTracking,
  useSearchAnalytics
} from '../../hooks';

// Utilities
import { 
  cn,
  formatDate,
  formatNumber,
  formatBytes,
  debounce,
  throttle,
  capitalize,
  truncate
} from '@/lib/utils';

// Constants
import {
  ASSET_TYPES,
  ASSET_STATUSES,
  SENSITIVITY_LEVELS,
  QUALITY_THRESHOLDS,
  SEARCH_OPERATORS,
  SORT_OPTIONS,
  VIEW_MODES,
  FILTER_CATEGORIES,
  SEARCH_TYPES,
  RANKING_ALGORITHMS,
  UI_CONSTANTS
} from '../../constants';

// ============================================================================
// SEMANTIC SEARCH ENGINE INTERFACES
// ============================================================================

interface SemanticSearchConfiguration {
  id: string;
  name: string;
  description: string;
  searchEngine: SearchEngineConfig;
  queryProcessing: QueryProcessingConfig;
  ranking: RankingConfig;
  faceting: FacetingConfig;
  highlighting: HighlightingConfig;
  autocomplete: AutocompleteConfig;
  analytics: SearchAnalyticsConfig;
  personalization: SearchPersonalizationConfig;
}

interface SearchEngineConfig {
  algorithm: SearchAlgorithm;
  indexFields: IndexField[];
  semanticModels: SemanticModel[];
  embedding: EmbeddingConfig;
  fuzzySearch: FuzzySearchConfig;
  synonyms: SynonymConfig;
  stemming: StemmingConfig;
  stopWords: StopWordsConfig;
}

type SearchAlgorithm = 
  | 'ELASTICSEARCH'
  | 'OPENSEARCH'
  | 'SOLR'
  | 'VESPA'
  | 'NEURAL_SEARCH'
  | 'HYBRID_SEARCH'
  | 'VECTOR_SEARCH';

interface IndexField {
  name: string;
  type: FieldType;
  weight: number;
  analyzer: string;
  searchable: boolean;
  facetable: boolean;
  sortable: boolean;
  highlightable: boolean;
  semantic: boolean;
}

type FieldType = 
  | 'TEXT'
  | 'KEYWORD'
  | 'NUMERIC'
  | 'DATE'
  | 'BOOLEAN'
  | 'GEO_POINT'
  | 'VECTOR'
  | 'NESTED'
  | 'OBJECT';

interface SemanticModel {
  id: string;
  name: string;
  type: SemanticModelType;
  version: string;
  dimensions: number;
  accuracy: number;
  latency: number;
  enabled: boolean;
}

type SemanticModelType = 
  | 'BERT'
  | 'SENTENCE_TRANSFORMERS'
  | 'WORD2VEC'
  | 'FASTTEXT'
  | 'GLOVE'
  | 'CUSTOM_EMBEDDINGS'
  | 'MULTIMODAL';

interface EmbeddingConfig {
  model: string;
  dimensions: number;
  similarity: SimilarityMetric;
  threshold: number;
  maxCandidates: number;
}

type SimilarityMetric = 'COSINE' | 'EUCLIDEAN' | 'DOT_PRODUCT' | 'MANHATTAN';

interface FuzzySearchConfig {
  enabled: boolean;
  editDistance: number;
  prefixLength: number;
  maxExpansions: number;
  transpositions: boolean;
}

interface SynonymConfig {
  enabled: boolean;
  synonymSets: SynonymSet[];
  expansion: SynonymExpansion;
}

interface SynonymSet {
  id: string;
  terms: string[];
  weight: number;
  bidirectional: boolean;
}

type SynonymExpansion = 'QUERY' | 'INDEX' | 'BOTH';

interface StemmingConfig {
  enabled: boolean;
  language: string;
  aggressive: boolean;
  customRules: string[];
}

interface StopWordsConfig {
  enabled: boolean;
  language: string;
  customStopWords: string[];
}

interface QueryProcessingConfig {
  parsing: QueryParsingConfig;
  expansion: QueryExpansionConfig;
  rewriting: QueryRewritingConfig;
  validation: QueryValidationConfig;
}

interface QueryParsingConfig {
  naturalLanguage: boolean;
  structuredQuery: boolean;
  booleanOperators: boolean;
  fieldQueries: boolean;
  rangeQueries: boolean;
  wildcards: boolean;
  regex: boolean;
  proximitySearch: boolean;
}

interface QueryExpansionConfig {
  enabled: boolean;
  synonyms: boolean;
  stemming: boolean;
  semanticSimilarity: boolean;
  contextualTerms: boolean;
  maxExpansions: number;
  minThreshold: number;
}

interface QueryRewritingConfig {
  enabled: boolean;
  spellCorrection: boolean;
  intentDetection: boolean;
  entityRecognition: boolean;
  queryClassification: boolean;
  contextAwareness: boolean;
}

interface QueryValidationConfig {
  enabled: boolean;
  syntaxCheck: boolean;
  fieldValidation: boolean;
  typeValidation: boolean;
  rangeValidation: boolean;
  suggestCorrections: boolean;
}

interface RankingConfig {
  algorithm: RankingAlgorithm;
  factors: RankingFactor[];
  learning: LearningToRankConfig;
  boosting: BoostingConfig;
  diversification: DiversificationConfig;
}

type RankingAlgorithm = 
  | 'TF_IDF'
  | 'BM25'
  | 'LEARNING_TO_RANK'
  | 'NEURAL_RANKING'
  | 'HYBRID_RANKING';

interface RankingFactor {
  name: string;
  weight: number;
  function: RankingFunction;
  enabled: boolean;
}

type RankingFunction = 
  | 'RELEVANCE'
  | 'FRESHNESS'
  | 'POPULARITY'
  | 'QUALITY'
  | 'AUTHORITY'
  | 'PERSONALIZATION'
  | 'SEMANTIC_SIMILARITY';

interface LearningToRankConfig {
  enabled: boolean;
  model: LTRModel;
  features: LTRFeature[];
  training: TrainingConfig;
}

type LTRModel = 'XGBOOST' | 'LIGHTGBM' | 'CATBOOST' | 'NEURAL_NETWORK';

interface LTRFeature {
  name: string;
  type: FeatureType;
  weight: number;
  normalization: string;
}

type FeatureType = 'QUERY' | 'DOCUMENT' | 'INTERACTION' | 'CONTEXT';

interface TrainingConfig {
  dataSource: string;
  updateFrequency: string;
  evaluationMetrics: string[];
  validationSplit: number;
}

interface BoostingConfig {
  staticBoosts: StaticBoost[];
  dynamicBoosts: DynamicBoost[];
  negativeBoosts: NegativeBoost[];
}

interface StaticBoost {
  field: string;
  value: any;
  factor: number;
  type: BoostType;
}

interface DynamicBoost {
  function: string;
  parameters: Record<string, any>;
  factor: number;
}

interface NegativeBoost {
  condition: string;
  penalty: number;
}

type BoostType = 'MULTIPLICATIVE' | 'ADDITIVE' | 'EXPONENTIAL';

interface DiversificationConfig {
  enabled: boolean;
  algorithm: DiversificationAlgorithm;
  maxSimilarity: number;
  fields: string[];
}

type DiversificationAlgorithm = 'MMR' | 'XQUAD' | 'CLUSTERING' | 'MAXIMAL_MARGINAL_RELEVANCE';

interface FacetingConfig {
  enabled: boolean;
  facets: FacetDefinition[];
  hierarchical: HierarchicalFacetConfig;
  statistical: StatisticalFacetConfig;
  dynamic: DynamicFacetConfig;
}

interface FacetDefinition {
  field: string;
  label: string;
  type: FacetType;
  size: number;
  minCount: number;
  sort: FacetSort;
  excludeFilters: boolean;
}

type FacetType = 'TERMS' | 'RANGE' | 'DATE_RANGE' | 'HISTOGRAM' | 'STATISTICAL';
type FacetSort = 'COUNT' | 'ALPHABETICAL' | 'RELEVANCE' | 'VALUE';

interface HierarchicalFacetConfig {
  enabled: boolean;
  separator: string;
  maxLevels: number;
  showCounts: boolean;
}

interface StatisticalFacetConfig {
  enabled: boolean;
  fields: string[];
  percentiles: number[];
  distribution: boolean;
}

interface DynamicFacetConfig {
  enabled: boolean;
  maxFacets: number;
  algorithm: string;
  threshold: number;
}

interface HighlightingConfig {
  enabled: boolean;
  fields: string[];
  fragmentSize: number;
  maxFragments: number;
  preTags: string[];
  postTags: string[];
  encoder: string;
  type: HighlightType;
}

type HighlightType = 'UNIFIED' | 'PLAIN' | 'FVH' | 'POSTINGS';

interface AutocompleteConfig {
  enabled: boolean;
  minCharacters: number;
  maxSuggestions: number;
  fuzzy: boolean;
  contextual: boolean;
  personalized: boolean;
  categories: AutocompleteCategory[];
}

interface AutocompleteCategory {
  name: string;
  fields: string[];
  weight: number;
  template: string;
}

interface SearchAnalyticsConfig {
  enabled: boolean;
  tracking: TrackingConfig;
  metrics: AnalyticsMetric[];
  reporting: ReportingConfig;
  optimization: OptimizationConfig;
}

interface TrackingConfig {
  queries: boolean;
  clicks: boolean;
  conversions: boolean;
  sessions: boolean;
  performance: boolean;
  errors: boolean;
}

interface AnalyticsMetric {
  name: string;
  type: MetricType;
  aggregation: string;
  dimensions: string[];
}

type MetricType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'TIMER';

interface ReportingConfig {
  frequency: string;
  format: string[];
  recipients: string[];
  dashboard: boolean;
}

interface OptimizationConfig {
  autoTuning: boolean;
  abTesting: boolean;
  recommendations: boolean;
  alerting: AlertingConfig;
}

interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: string[];
}

interface AlertThreshold {
  metric: string;
  operator: string;
  value: number;
  severity: AlertSeverity;
}

type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface SearchPersonalizationConfig {
  enabled: boolean;
  userProfiles: boolean;
  recommendations: boolean;
  history: HistoryConfig;
  preferences: PreferencesConfig;
  social: SocialConfig;
}

interface HistoryConfig {
  enabled: boolean;
  retention: number;
  maxEntries: number;
  categories: string[];
}

interface PreferencesConfig {
  explicit: boolean;
  implicit: boolean;
  learning: boolean;
  categories: string[];
}

interface SocialConfig {
  collaborative: boolean;
  trending: boolean;
  recommendations: boolean;
  sharing: boolean;
}

interface SearchQuery {
  id: string;
  text: string;
  type: SearchQueryType;
  filters: SearchFilter[];
  facets: FacetFilter[];
  sorting: SortOptions[];
  pagination: PaginationOptions;
  highlighting: HighlightOptions;
  context: SearchContext;
  personalization: PersonalizationContext;
}

type SearchQueryType = 
  | 'FULL_TEXT'
  | 'SEMANTIC'
  | 'HYBRID'
  | 'STRUCTURED'
  | 'NATURAL_LANGUAGE'
  | 'FACETED'
  | 'FEDERATED';

interface FacetFilter {
  field: string;
  values: any[];
  operator: FacetOperator;
  exclude: boolean;
}

type FacetOperator = 'AND' | 'OR' | 'NOT';

interface SortOptions {
  field: string;
  direction: SortDirection;
  mode: SortMode;
  missing: SortMissing;
}

type SortDirection = 'ASC' | 'DESC';
type SortMode = 'MIN' | 'MAX' | 'SUM' | 'AVG' | 'MEDIAN';
type SortMissing = 'FIRST' | 'LAST' | 'CUSTOM';

interface PaginationOptions {
  offset: number;
  limit: number;
  deep: boolean;
  searchAfter?: any[];
}

interface HighlightOptions {
  fields: string[];
  fragmentSize: number;
  maxFragments: number;
  requireFieldMatch: boolean;
}

interface SearchContext {
  userId: string;
  sessionId: string;
  timestamp: Date;
  source: string;
  location: GeographicLocation;
  device: DeviceContext;
  intent: SearchIntent;
}

interface GeographicLocation {
  country: string;
  region: string;
  city: string;
  coordinates: [number, number];
  timezone: string;
}

interface DeviceContext {
  type: DeviceType;
  os: string;
  browser: string;
  screen: ScreenSize;
  mobile: boolean;
}

type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'SMART_TV' | 'WEARABLE';

interface ScreenSize {
  width: number;
  height: number;
  density: number;
}

interface SearchIntent {
  primary: IntentCategory;
  confidence: number;
  entities: ExtractedEntity[];
  sentiment: Sentiment;
}

type IntentCategory = 
  | 'INFORMATIONAL'
  | 'NAVIGATIONAL'
  | 'TRANSACTIONAL'
  | 'INVESTIGATIONAL'
  | 'COMMERCIAL';

interface ExtractedEntity {
  text: string;
  type: EntityType;
  confidence: number;
  position: [number, number];
}

type EntityType = 
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'DATE'
  | 'TIME'
  | 'MONEY'
  | 'PERCENT'
  | 'ASSET_TYPE'
  | 'FIELD_NAME'
  | 'COLUMN_NAME'
  | 'TABLE_NAME'
  | 'DATABASE_NAME';

interface Sentiment {
  score: number;
  label: SentimentLabel;
  confidence: number;
}

type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

interface PersonalizationContext {
  profile: UserProfile;
  history: SearchHistory[];
  preferences: UserPreferences;
  social: SocialContext;
}

interface UserProfile {
  id: string;
  role: string;
  department: string;
  expertise: string[];
  interests: string[];
  behavior: BehaviorProfile;
}

interface BehaviorProfile {
  searchFrequency: number;
  queryComplexity: QueryComplexity;
  preferredAssetTypes: DataAssetType[];
  interactionPatterns: InteractionPattern[];
}

type QueryComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'EXPERT';

interface InteractionPattern {
  type: InteractionType;
  frequency: number;
  duration: number;
  context: string;
}

type InteractionType = 
  | 'SEARCH'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'SHARE'
  | 'BOOKMARK'
  | 'COMMENT'
  | 'RATE'
  | 'TAG';

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
  clickedResults: string[];
  dwellTime: number;
  satisfaction: number;
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  defaultFilters: SearchFilter[];
  defaultSort: SortOptions[];
  resultsPerPage: number;
  highlightStyle: string;
}

interface SocialContext {
  connections: string[];
  groups: string[];
  sharedQueries: string[];
  collaborativeFilters: string[];
}

interface SearchResult {
  id: string;
  asset: IntelligentDataAsset;
  score: number;
  explanation: ScoreExplanation;
  highlights: ResultHighlight;
  similarResults: string[];
  relatedQueries: string[];
  personalization: PersonalizationScore;
}

interface ScoreExplanation {
  totalScore: number;
  factors: ScoreFactor[];
  normalization: string;
  algorithm: string;
}

interface ScoreFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

interface ResultHighlight {
  title: string[];
  description: string[];
  content: string[];
  metadata: Record<string, string[]>;
}

interface PersonalizationScore {
  relevance: number;
  authority: number;
  freshness: number;
  popularity: number;
  userAlignment: number;
}

interface SearchFacet {
  field: string;
  label: string;
  type: FacetType;
  values: FacetValue[];
  selected: string[];
  stats?: FacetStats;
}

interface FacetValue {
  value: any;
  label: string;
  count: number;
  selected: boolean;
  refined: boolean;
}

interface FacetStats {
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
  missing: number;
}

interface SearchSuggestion {
  id: string;
  text: string;
  category: string;
  score: number;
  type: SuggestionType;
  metadata: SuggestionMetadata;
}

type SuggestionType = 
  | 'QUERY_COMPLETION'
  | 'QUERY_SUGGESTION'
  | 'SPELL_CORRECTION'
  | 'ENTITY_SUGGESTION'
  | 'TRENDING_QUERY'
  | 'PERSONALIZED_SUGGESTION';

interface SuggestionMetadata {
  frequency: number;
  recency: number;
  popularity: number;
  personalization: number;
  context: string[];
}

// ============================================================================
// SEARCH QUERY BUILDER COMPONENT
// ============================================================================

interface QueryBuilderProps {
  query: SearchQuery;
  onQueryChange: (query: SearchQuery) => void;
  configuration: SemanticSearchConfiguration;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({
  query,
  onQueryChange,
  configuration,
  suggestions,
  isLoading
}) => {
  const [queryText, setQueryText] = useState(query.text);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [debouncedQuery] = useDebounce(queryText, 300);

  // Update query when debounced text changes
  useEffect(() => {
    if (debouncedQuery !== query.text) {
      onQueryChange({
        ...query,
        text: debouncedQuery
      });
    }
  }, [debouncedQuery, query, onQueryChange]);

  const handleQueryTypeChange = useCallback((type: SearchQueryType) => {
    onQueryChange({
      ...query,
      type
    });
  }, [query, onQueryChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          const suggestion = suggestions[selectedSuggestion];
          setQueryText(suggestion.text);
          setShowSuggestions(false);
          setSelectedSuggestion(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestion]);

  const getSuggestionIcon = useCallback((type: SuggestionType) => {
    switch (type) {
      case 'QUERY_COMPLETION': return SearchCheck;
      case 'QUERY_SUGGESTION': return Lightbulb;
      case 'SPELL_CORRECTION': return Edit;
      case 'ENTITY_SUGGESTION': return Tag;
      case 'TRENDING_QUERY': return TrendingUp;
      case 'PERSONALIZED_SUGGESTION': return User;
      default: return Search;
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            {configuration.searchEngine.semanticModels.length > 0 && (
              <Brain className="h-3 w-3 text-purple-500" />
            )}
          </div>
          
          <Input
            ref={inputRef}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search assets with natural language or structured queries..."
            className="pl-12 pr-20 text-base"
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Badge variant="outline" className="text-xs">
                    {query.type.replace('_', ' ')}
                  </Badge>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={query.type}
                  onValueChange={(value) => handleQueryTypeChange(value as SearchQueryType)}
                >
                  <DropdownMenuRadioItem value="FULL_TEXT">
                    Full Text Search
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="SEMANTIC">
                    Semantic Search
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="HYBRID">
                    Hybrid Search
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="NATURAL_LANGUAGE">
                    Natural Language
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="STRUCTURED">
                    Structured Query
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className="h-8 px-2"
            >
              <Sliders className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
            <ScrollArea className="max-h-80">
              <div className="p-2">
                {suggestions.map((suggestion, index) => {
                  const Icon = getSuggestionIcon(suggestion.type);
                  return (
                    <button
                      key={suggestion.id}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors",
                        index === selectedSuggestion && "bg-muted"
                      )}
                      onClick={() => {
                        setQueryText(suggestion.text);
                        setShowSuggestions(false);
                        setSelectedSuggestion(-1);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            <Highlighter
                              searchWords={queryText.split(' ').filter(Boolean)}
                              textToHighlight={suggestion.text}
                              highlightClassName="bg-yellow-200 text-yellow-900"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {suggestion.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.score * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Advanced Query Options */}
      {isAdvancedMode && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Search Fields</Label>
              <div className="mt-2 space-y-2">
                {configuration.searchEngine.indexFields
                  .filter(field => field.searchable)
                  .map((field) => (
                    <div key={field.name} className="flex items-center gap-2">
                      <Checkbox id={field.name} />
                      <Label htmlFor={field.name} className="text-sm">
                        {field.name}
                        {field.semantic && (
                          <Brain className="inline h-3 w-3 ml-1 text-purple-500" />
                        )}
                      </Label>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {field.weight}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Search Options</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fuzzy" className="text-sm">Fuzzy Search</Label>
                  <Switch id="fuzzy" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="synonyms" className="text-sm">Synonyms</Label>
                  <Switch id="synonyms" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="stemming" className="text-sm">Stemming</Label>
                  <Switch id="stemming" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="semantic" className="text-sm">Semantic Similarity</Label>
                  <Switch id="semantic" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// SEARCH FACETS COMPONENT
// ============================================================================

interface SearchFacetsProps {
  facets: SearchFacet[];
  onFacetChange: (field: string, values: any[]) => void;
  configuration: FacetingConfig;
  isLoading: boolean;
}

const SearchFacets: React.FC<SearchFacetsProps> = ({
  facets,
  onFacetChange,
  configuration,
  isLoading
}) => {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  const toggleFacet = useCallback((field: string) => {
    setExpandedFacets(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const handleFacetValueChange = useCallback((field: string, value: any, checked: boolean) => {
    const facet = facets.find(f => f.field === field);
    if (!facet) return;

    const currentValues = facet.selected;
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFacetChange(field, newValues);
  }, [facets, onFacetChange]);

  const clearFacet = useCallback((field: string) => {
    onFacetChange(field, []);
  }, [onFacetChange]);

  const getFacetIcon = useCallback((type: FacetType) => {
    switch (type) {
      case 'TERMS': return Tag;
      case 'RANGE': return BarChart3;
      case 'DATE_RANGE': return Calendar;
      case 'HISTOGRAM': return BarChart2;
      case 'STATISTICAL': return PieChart;
      default: return Filter;
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="space-y-1">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-muted/50 animate-pulse rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Refine Results
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {facets.map((facet) => {
            const Icon = getFacetIcon(facet.type);
            const isExpanded = expandedFacets.has(facet.field);
            const hasSelections = facet.selected.length > 0;

            return (
              <div key={facet.field} className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleFacet(facet.field)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                  >
                    <Icon className="h-3 w-3" />
                    {facet.label}
                    {hasSelections && (
                      <Badge variant="secondary" className="text-xs">
                        {facet.selected.length}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  
                  {hasSelections && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFacet(facet.field)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {isExpanded && (
                  <div className="space-y-1 ml-5">
                    {facet.type === 'TERMS' && (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {facet.values.map((value) => (
                          <div key={value.value} className="flex items-center gap-2">
                            <Checkbox
                              id={`${facet.field}-${value.value}`}
                              checked={value.selected}
                              onCheckedChange={(checked) => 
                                handleFacetValueChange(facet.field, value.value, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`${facet.field}-${value.value}`}
                              className="flex-1 text-xs cursor-pointer"
                            >
                              <span className="truncate">{value.label}</span>
                              <span className="text-muted-foreground ml-1">
                                ({formatNumber(value.count)})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {facet.type === 'RANGE' && facet.stats && (
                      <div className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          Range: {formatNumber(facet.stats.min)} - {formatNumber(facet.stats.max)}
                        </div>
                        <Slider
                          value={[facet.stats.min, facet.stats.max]}
                          min={facet.stats.min}
                          max={facet.stats.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}

                    {facet.type === 'DATE_RANGE' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">From</Label>
                            <Input type="date" className="h-8 text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">To</Label>
                            <Input type="date" className="h-8 text-xs" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// SEARCH RESULTS COMPONENT
// ============================================================================

interface SearchResultsProps {
  results: SearchResult[];
  query: SearchQuery;
  totalCount: number;
  isLoading: boolean;
  configuration: SemanticSearchConfiguration;
  onResultClick: (result: SearchResult) => void;
  onResultAction: (result: SearchResult, action: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  totalCount,
  isLoading,
  configuration,
  onResultClick,
  onResultAction
}) => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list');

  const getAssetIcon = useCallback((assetType: DataAssetType) => {
    switch (assetType) {
      case 'TABLE': return Table;
      case 'VIEW': return Eye;
      case 'FILE': return File;
      case 'API': return Network;
      case 'STREAM': return Activity;
      case 'MODEL': return Brain;
      default: return Database;
    }
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  }, []);

  const renderHighlights = useCallback((highlights: ResultHighlight) => {
    const allHighlights = [
      ...(highlights.title || []),
      ...(highlights.description || []),
      ...(highlights.content || [])
    ];

    if (allHighlights.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {allHighlights.slice(0, 3).map((highlight, index) => (
          <div
            key={index}
            className="text-xs text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: highlight }}
          />
        ))}
      </div>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-3 bg-muted/50 animate-pulse rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 animate-pulse rounded" />
                <div className="h-3 bg-muted/50 animate-pulse rounded w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <SearchX className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search query or filters
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Search Tips
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Found {formatNumber(totalCount)} results in {formatNumber(performance.now())}ms
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Relevance</DropdownMenuItem>
              <DropdownMenuItem>Date Modified</DropdownMenuItem>
              <DropdownMenuItem>Name A-Z</DropdownMenuItem>
              <DropdownMenuItem>Quality Score</DropdownMenuItem>
              <DropdownMenuItem>Popularity</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="border-0 rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="border-0 rounded-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="border-0 rounded-l-none"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className={cn(
        "space-y-4",
        viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
      )}>
        {results.map((result) => {
          const AssetIcon = getAssetIcon(result.asset.assetType);
          const isSelected = selectedResult === result.id;

          return (
            <motion.div
              key={result.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected && "ring-2 ring-blue-500"
                )}
                onClick={() => {
                  setSelectedResult(result.id);
                  onResultClick(result);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
                      <AssetIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {result.highlights.title?.length > 0 ? (
                              <span dangerouslySetInnerHTML={{ 
                                __html: result.highlights.title[0] 
                              }} />
                            ) : (
                              result.asset.name
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {result.asset.assetType}
                            </Badge>
                            <div className={cn("text-xs font-medium", getScoreColor(result.score))}>
                              {Math.round(result.score * 100)}% match
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onResultAction(result, 'view')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onResultAction(result, 'bookmark')}>
                              <Bookmark className="h-4 w-4 mr-2" />
                              Bookmark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onResultAction(result, 'share')}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onResultAction(result, 'similar')}>
                              <Target className="h-4 w-4 mr-2" />
                              Find Similar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {result.highlights.description?.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span dangerouslySetInnerHTML={{ 
                            __html: result.highlights.description[0] 
                          }} />
                        </div>
                      )}

                      {renderHighlights(result.highlights)}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {result.asset.ownership && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {result.asset.ownership.owner}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(result.asset.lastModified)}
                        </div>
                        {result.asset.qualityAssessment && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {Math.round(result.asset.qualityAssessment.overallScore * 100)}% quality
                          </div>
                        )}
                      </div>

                      {result.asset.tags && result.asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.asset.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {result.asset.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{result.asset.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Explanation */}
                  {configuration.ranking.algorithm === 'LEARNING_TO_RANK' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Info className="h-3 w-3" />
                          Relevance factors:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.explanation.factors.slice(0, 3).map((factor) => (
                            <div key={factor.name} className="flex items-center gap-1">
                              <span>{factor.name}:</span>
                              <span className="font-medium">
                                {Math.round(factor.score * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SEMANTIC SEARCH ENGINE COMPONENT
// ============================================================================

const SemanticSearchEngine: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    id: 'default_search',
    text: '',
    type: 'HYBRID',
    filters: [],
    facets: [],
    sorting: [{ field: '_score', direction: 'DESC', mode: 'MAX', missing: 'LAST' }],
    pagination: { offset: 0, limit: 20, deep: false },
    highlighting: { fields: ['*'], fragmentSize: 150, maxFragments: 3, requireFieldMatch: false },
    context: {
      userId: '',
      sessionId: '',
      timestamp: new Date(),
      source: 'search_interface',
      location: {
        country: '',
        region: '',
        city: '',
        coordinates: [0, 0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      device: {
        type: 'DESKTOP',
        os: '',
        browser: '',
        screen: { width: window.innerWidth, height: window.innerHeight, density: window.devicePixelRatio },
        mobile: /Mobile|Android/i.test(navigator.userAgent)
      },
      intent: {
        primary: 'INFORMATIONAL',
        confidence: 0.5,
        entities: [],
        sentiment: { score: 0, label: 'NEUTRAL', confidence: 0.5 }
      }
    },
    personalization: {
      profile: {
        id: '',
        role: '',
        department: '',
        expertise: [],
        interests: [],
        behavior: {
          searchFrequency: 0,
          queryComplexity: 'MODERATE',
          preferredAssetTypes: [],
          interactionPatterns: []
        }
      },
      history: [],
      preferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'YYYY-MM-DD',
        numberFormat: 'en-US',
        defaultFilters: [],
        defaultSort: [{ field: '_score', direction: 'DESC', mode: 'MAX', missing: 'LAST' }],
        resultsPerPage: 20,
        highlightStyle: 'default'
      },
      social: {
        connections: [],
        groups: [],
        sharedQueries: [],
        collaborativeFilters: []
      }
    }
  });

  const [configuration, setConfiguration] = useState<SemanticSearchConfiguration>({
    id: 'default_semantic_search',
    name: 'Default Semantic Search',
    description: 'Standard semantic search configuration with AI capabilities',
    searchEngine: {
      algorithm: 'HYBRID_SEARCH',
      indexFields: [
        { name: 'name', type: 'TEXT', weight: 3.0, analyzer: 'standard', searchable: true, facetable: false, sortable: true, highlightable: true, semantic: true },
        { name: 'description', type: 'TEXT', weight: 2.0, analyzer: 'standard', searchable: true, facetable: false, sortable: false, highlightable: true, semantic: true },
        { name: 'content', type: 'TEXT', weight: 1.5, analyzer: 'standard', searchable: true, facetable: false, sortable: false, highlightable: true, semantic: true },
        { name: 'assetType', type: 'KEYWORD', weight: 1.0, analyzer: 'keyword', searchable: true, facetable: true, sortable: true, highlightable: false, semantic: false },
        { name: 'tags', type: 'KEYWORD', weight: 1.2, analyzer: 'keyword', searchable: true, facetable: true, sortable: false, highlightable: false, semantic: true },
        { name: 'owner', type: 'KEYWORD', weight: 0.8, analyzer: 'keyword', searchable: true, facetable: true, sortable: true, highlightable: false, semantic: false }
      ],
      semanticModels: [
        { id: 'sentence_bert', name: 'Sentence-BERT', type: 'SENTENCE_TRANSFORMERS', version: '1.0.0', dimensions: 768, accuracy: 0.85, latency: 150, enabled: true }
      ],
      embedding: {
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        dimensions: 384,
        similarity: 'COSINE',
        threshold: 0.7,
        maxCandidates: 100
      },
      fuzzySearch: {
        enabled: true,
        editDistance: 2,
        prefixLength: 1,
        maxExpansions: 50,
        transpositions: true
      },
      synonyms: {
        enabled: true,
        synonymSets: [],
        expansion: 'QUERY'
      },
      stemming: {
        enabled: true,
        language: 'english',
        aggressive: false,
        customRules: []
      },
      stopWords: {
        enabled: true,
        language: 'english',
        customStopWords: []
      }
    },
    queryProcessing: {
      parsing: {
        naturalLanguage: true,
        structuredQuery: true,
        booleanOperators: true,
        fieldQueries: true,
        rangeQueries: true,
        wildcards: true,
        regex: false,
        proximitySearch: true
      },
      expansion: {
        enabled: true,
        synonyms: true,
        stemming: true,
        semanticSimilarity: true,
        contextualTerms: true,
        maxExpansions: 10,
        minThreshold: 0.6
      },
      rewriting: {
        enabled: true,
        spellCorrection: true,
        intentDetection: true,
        entityRecognition: true,
        queryClassification: true,
        contextAwareness: true
      },
      validation: {
        enabled: true,
        syntaxCheck: true,
        fieldValidation: true,
        typeValidation: true,
        rangeValidation: true,
        suggestCorrections: true
      }
    },
    ranking: {
      algorithm: 'HYBRID_RANKING',
      factors: [
        { name: 'text_relevance', weight: 0.4, function: 'RELEVANCE', enabled: true },
        { name: 'semantic_similarity', weight: 0.3, function: 'SEMANTIC_SIMILARITY', enabled: true },
        { name: 'freshness', weight: 0.1, function: 'FRESHNESS', enabled: true },
        { name: 'quality', weight: 0.1, function: 'QUALITY', enabled: true },
        { name: 'popularity', weight: 0.1, function: 'POPULARITY', enabled: true }
      ],
      learning: {
        enabled: false,
        model: 'XGBOOST',
        features: [],
        training: {
          dataSource: '',
          updateFrequency: 'weekly',
          evaluationMetrics: ['ndcg', 'map', 'mrr'],
          validationSplit: 0.2
        }
      },
      boosting: {
        staticBoosts: [],
        dynamicBoosts: [],
        negativeBoosts: []
      },
      diversification: {
        enabled: true,
        algorithm: 'MMR',
        maxSimilarity: 0.8,
        fields: ['assetType', 'department']
      }
    },
    faceting: {
      enabled: true,
      facets: [
        { field: 'assetType', label: 'Asset Type', type: 'TERMS', size: 10, minCount: 1, sort: 'COUNT', excludeFilters: false },
        { field: 'owner', label: 'Owner', type: 'TERMS', size: 10, minCount: 1, sort: 'COUNT', excludeFilters: false },
        { field: 'tags', label: 'Tags', type: 'TERMS', size: 15, minCount: 1, sort: 'COUNT', excludeFilters: false },
        { field: 'lastModified', label: 'Last Modified', type: 'DATE_RANGE', size: 5, minCount: 1, sort: 'VALUE', excludeFilters: false }
      ],
      hierarchical: {
        enabled: false,
        separator: '/',
        maxLevels: 3,
        showCounts: true
      },
      statistical: {
        enabled: true,
        fields: ['qualityScore', 'usage'],
        percentiles: [25, 50, 75, 95],
        distribution: true
      },
      dynamic: {
        enabled: false,
        maxFacets: 5,
        algorithm: 'mutual_information',
        threshold: 0.1
      }
    },
    highlighting: {
      enabled: true,
      fields: ['name', 'description', 'content'],
      fragmentSize: 150,
      maxFragments: 3,
      preTags: ['<mark>'],
      postTags: ['</mark>'],
      encoder: 'html',
      type: 'UNIFIED'
    },
    autocomplete: {
      enabled: true,
      minCharacters: 2,
      maxSuggestions: 10,
      fuzzy: true,
      contextual: true,
      personalized: true,
      categories: [
        { name: 'assets', fields: ['name', 'description'], weight: 1.0, template: '{name} ({assetType})' },
        { name: 'tags', fields: ['tags'], weight: 0.8, template: 'tag: {tag}' },
        { name: 'owners', fields: ['owner'], weight: 0.6, template: 'by {owner}' }
      ]
    },
    analytics: {
      enabled: true,
      tracking: {
        queries: true,
        clicks: true,
        conversions: true,
        sessions: true,
        performance: true,
        errors: true
      },
      metrics: [
        { name: 'query_count', type: 'COUNTER', aggregation: 'sum', dimensions: ['user', 'query_type'] },
        { name: 'response_time', type: 'HISTOGRAM', aggregation: 'avg', dimensions: ['query_type'] },
        { name: 'click_through_rate', type: 'GAUGE', aggregation: 'avg', dimensions: ['position'] }
      ],
      reporting: {
        frequency: 'daily',
        format: ['json', 'csv'],
        recipients: ['admin@company.com'],
        dashboard: true
      },
      optimization: {
        autoTuning: false,
        abTesting: false,
        recommendations: true,
        alerting: {
          enabled: true,
          thresholds: [
            { metric: 'response_time', operator: '>', value: 1000, severity: 'WARNING' },
            { metric: 'error_rate', operator: '>', value: 0.05, severity: 'ERROR' }
          ],
          channels: ['email', 'slack']
        }
      }
    },
    personalization: {
      enabled: true,
      userProfiles: true,
      recommendations: true,
      history: {
        enabled: true,
        retention: 30,
        maxEntries: 1000,
        categories: ['searches', 'views', 'downloads']
      },
      preferences: {
        explicit: true,
        implicit: true,
        learning: true,
        categories: ['domains', 'asset_types', 'owners']
      },
      social: {
        collaborative: false,
        trending: true,
        recommendations: true,
        sharing: true
      }
    }
  });

  // Queries
  const { 
    data: searchResults, 
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['semantic-search', searchQuery],
    queryFn: () => semanticSearchService.search(searchQuery, configuration),
    enabled: searchQuery.text.length > 0,
    staleTime: 30000
  });

  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', searchQuery.text],
    queryFn: () => semanticSearchService.getSuggestions(searchQuery.text, configuration.autocomplete),
    enabled: searchQuery.text.length >= configuration.autocomplete.minCharacters,
    staleTime: 10000
  });

  const { data: facets } = useQuery({
    queryKey: ['search-facets', searchQuery],
    queryFn: () => semanticSearchService.getFacets(searchQuery, configuration.faceting),
    enabled: configuration.faceting.enabled && searchQuery.text.length > 0,
    staleTime: 60000
  });

  // Mutations
  const trackSearchMutation = useMutation({
    mutationFn: (query: SearchQuery) => semanticSearchService.trackSearch(query),
    onError: (error) => {
      console.error('Failed to track search:', error);
    }
  });

  const trackClickMutation = useMutation({
    mutationFn: (data: { query: SearchQuery; result: SearchResult; position: number }) => 
      semanticSearchService.trackClick(data.query, data.result, data.position),
    onError: (error) => {
      console.error('Failed to track click:', error);
    }
  });

  // Event handlers
  const handleQueryChange = useCallback((newQuery: SearchQuery) => {
    setSearchQuery(newQuery);
    if (newQuery.text !== searchQuery.text) {
      trackSearchMutation.mutate(newQuery);
    }
  }, [searchQuery.text, trackSearchMutation]);

  const handleFacetChange = useCallback((field: string, values: any[]) => {
    const newFacets = searchQuery.facets.filter(f => f.field !== field);
    if (values.length > 0) {
      newFacets.push({
        field,
        values,
        operator: 'OR',
        exclude: false
      });
    }
    
    setSearchQuery(prev => ({
      ...prev,
      facets: newFacets
    }));
  }, [searchQuery.facets]);

  const handleResultClick = useCallback((result: SearchResult) => {
    const position = searchResults?.data?.results?.findIndex(r => r.id === result.id) ?? -1;
    trackClickMutation.mutate({
      query: searchQuery,
      result,
      position
    });
  }, [searchQuery, searchResults, trackClickMutation]);

  const handleResultAction = useCallback((result: SearchResult, action: string) => {
    switch (action) {
      case 'view':
        // Navigate to asset details
        break;
      case 'bookmark':
        // Add to bookmarks
        break;
      case 'share':
        // Share asset
        break;
      case 'similar':
        // Find similar assets
        setSearchQuery(prev => ({
          ...prev,
          text: `similar to "${result.asset.name}"`,
          type: 'SEMANTIC'
        }));
        break;
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              Semantic Search Engine
            </h1>
            <p className="text-muted-foreground">
              AI-powered search with natural language understanding and semantic similarity
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {configuration.searchEngine.algorithm.replace('_', ' ')}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Search Query Builder */}
        <QueryBuilder
          query={searchQuery}
          onQueryChange={handleQueryChange}
          configuration={configuration}
          suggestions={suggestions?.data?.suggestions || []}
          isLoading={isSearching}
        />
      </div>

      {/* Search Results Area */}
      <div className="flex-1 min-h-0 flex">
        {/* Facets Sidebar */}
        {configuration.faceting.enabled && (
          <div className="w-80 border-r p-6 overflow-y-auto">
            <SearchFacets
              facets={facets?.data?.facets || []}
              onFacetChange={handleFacetChange}
              configuration={configuration.faceting}
              isLoading={!facets && searchQuery.text.length > 0}
            />
          </div>
        )}

        {/* Main Results */}
        <div className="flex-1 p-6 overflow-y-auto">
          {searchError ? (
            <Card className="p-8">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">Search Error</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchError.message || 'An error occurred while searching'}
                  </p>
                </div>
                <Button onClick={() => refetchSearch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Search
                </Button>
              </div>
            </Card>
          ) : (
            <SearchResults
              results={searchResults?.data?.results || []}
              query={searchQuery}
              totalCount={searchResults?.data?.totalCount || 0}
              isLoading={isSearching}
              configuration={configuration}
              onResultClick={handleResultClick}
              onResultAction={handleResultAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearchEngine;