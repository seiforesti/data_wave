"use client"

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Shield,
  Cloud,
  Search,
  BarChart3,
  Eye,
  Zap,
  Target,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  HelpCircle,
  User,
  LogOut,
  Monitor,
  Palette,
  Globe,
  Lock,
  Building,
  FileText,
  MessageSquare,
  Star,
  Grid,
  List,
  Layers,
  GitBranch,
  Workflow,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Sparkles,
  Brain,
  Bot,
  Radar,
  TestTube,
  Beaker,
  Microscope,
  Crown,
  Rocket,
  Flame,
  Lightbulb,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  LineChart,
  PieChart,
  AreaChart,
  Cog,
  Wrench,
  Tool,
  Package,
  Server,
  CircuitBoard,
  Boxes,
  Archive,
  FolderOpen,
  Folder,
  File,
  Code2,
  Terminal,
  Bug,
  Crosshair,
  Focus,
  Scan,
  SearchX,
  ScanLine,
  Binary,
  Hash,
  Type,
  Key,
  ShieldCheck,
  UserCheck,
  Badge as BadgeIcon,
  Award,
  Medal,
  Trophy,
  Flag,
  Bookmark,
  Heart,
  ThumbsUp,
  Smile,
  Frown,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Route,
  Map,
  MapPin,
  Navigation,
  Compass,
  TreePine,
  Workflow as WorkflowIcon,
} from "lucide-react"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Import both versions
import { DataSourcesApp } from "./data-sources-app"
import { EnterpriseDataSourcesApp } from "./enterprise-data-sources-app"

// ============================================================================
// UNIFIED DATA SOURCES SYSTEM
// ============================================================================

export type SystemPhase = "basic" | "phase1" | "phase2" | "phase3"

interface SystemCapabilities {
  phase: SystemPhase
  features: string[]
  maxDataSources: number
  maxUsers: number
  hasWorkflows: boolean
  hasCollaboration: boolean
  hasAnalytics: boolean
  hasApprovals: boolean
  hasBulkOperations: boolean
  hasRealTimeMonitoring: boolean
  hasAdvancedSecurity: boolean
}

interface UpgradePath {
  from: SystemPhase
  to: SystemPhase
  requirements: string[]
  estimatedTime: string
  benefits: string[]
}

const SYSTEM_CAPABILITIES: Record<SystemPhase, SystemCapabilities> = {
  basic: {
    phase: "basic",
    features: [
      "Data Source Management",
      "Basic Connection Testing",
      "Simple Monitoring",
      "User Management",
      "Basic Security"
    ],
    maxDataSources: 50,
    maxUsers: 10,
    hasWorkflows: false,
    hasCollaboration: false,
    hasAnalytics: false,
    hasApprovals: false,
    hasBulkOperations: false,
    hasRealTimeMonitoring: false,
    hasAdvancedSecurity: false
  },
  phase1: {
    phase: "phase1",
    features: [
      "Core Infrastructure",
      "Event Bus System",
      "State Management",
      "Component Registry",
      "Workflow Engine",
      "Enhanced Monitoring"
    ],
    maxDataSources: 200,
    maxUsers: 50,
    hasWorkflows: true,
    hasCollaboration: false,
    hasAnalytics: false,
    hasApprovals: false,
    hasBulkOperations: false,
    hasRealTimeMonitoring: true,
    hasAdvancedSecurity: false
  },
  phase2: {
    phase: "phase2",
    features: [
      "Advanced Integration",
      "Approval System",
      "Bulk Operations",
      "Correlation Engine",
      "Real-time Collaboration",
      "Advanced Analytics"
    ],
    maxDataSources: 1000,
    maxUsers: 200,
    hasWorkflows: true,
    hasCollaboration: true,
    hasAnalytics: true,
    hasApprovals: true,
    hasBulkOperations: true,
    hasRealTimeMonitoring: true,
    hasAdvancedSecurity: true
  },
  phase3: {
    phase: "phase3",
    features: [
      "Enterprise UI/UX",
      "Advanced Dashboard",
      "Workflow Designer",
      "Collaboration Studio",
      "Analytics Workbench",
      "Enterprise Security"
    ],
    maxDataSources: 10000,
    maxUsers: 1000,
    hasWorkflows: true,
    hasCollaboration: true,
    hasAnalytics: true,
    hasApprovals: true,
    hasBulkOperations: true,
    hasRealTimeMonitoring: true,
    hasAdvancedSecurity: true
  }
}

const UPGRADE_PATHS: UpgradePath[] = [
  {
    from: "basic",
    to: "phase1",
    requirements: [
      "Backend infrastructure setup",
      "Event bus configuration",
      "State management implementation"
    ],
    estimatedTime: "2-3 weeks",
    benefits: [
      "Scalable architecture",
      "Event-driven workflows",
      "Enhanced monitoring"
    ]
  },
  {
    from: "phase1",
    to: "phase2",
    requirements: [
      "Approval system integration",
      "Bulk operations implementation",
      "Real-time collaboration setup"
    ],
    estimatedTime: "3-4 weeks",
    benefits: [
      "Advanced workflow capabilities",
      "Team collaboration",
      "Bulk data operations"
    ]
  },
  {
    from: "phase2",
    to: "phase3",
    requirements: [
      "Advanced UI components",
      "Enterprise dashboard",
      "Workflow designer implementation"
    ],
    estimatedTime: "2-3 weeks",
    benefits: [
      "Enterprise-grade UI/UX",
      "Visual workflow design",
      "Advanced analytics"
    ]
  }
]

// ============================================================================
// UNIFIED DATA SOURCES CONTEXT
// ============================================================================

interface UnifiedDataSourcesContext {
  currentPhase: SystemPhase
  capabilities: SystemCapabilities
  upgradePath: UpgradePath | null
  canUpgrade: boolean
  upgradeSystem: (targetPhase: SystemPhase) => Promise<void>
  getSystemStatus: () => SystemStatus
}

interface SystemStatus {
  phase: SystemPhase
  dataSourceCount: number
  userCount: number
  activeWorkflows: number
  systemHealth: "excellent" | "good" | "warning" | "critical"
  lastUpgrade: Date | null
  nextUpgradeAvailable: boolean
}

const UnifiedDataSourcesContext = createContext<UnifiedDataSourcesContext>({} as UnifiedDataSourcesContext)

// ============================================================================
// UNIFIED DATA SOURCES APP
// ============================================================================

export const UnifiedDataSourcesApp: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<SystemPhase>("basic")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInProgress, setUpgradeInProgress] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    phase: "basic",
    dataSourceCount: 24,
    userCount: 8,
    activeWorkflows: 0,
    systemHealth: "good",
    lastUpgrade: null,
    nextUpgradeAvailable: true
  })

  const capabilities = useMemo(() => SYSTEM_CAPABILITIES[currentPhase], [currentPhase])
  
  const upgradePath = useMemo(() => {
    return UPGRADE_PATHS.find(path => path.from === currentPhase) || null
  }, [currentPhase])

  const canUpgrade = useMemo(() => {
    return upgradePath !== null && systemStatus.nextUpgradeAvailable
  }, [upgradePath, systemStatus.nextUpgradeAvailable])

  const upgradeSystem = useCallback(async (targetPhase: SystemPhase) => {
    setUpgradeInProgress(true)
    
    // Simulate upgrade process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setCurrentPhase(targetPhase)
    setSystemStatus(prev => ({
      ...prev,
      phase: targetPhase,
      lastUpgrade: new Date(),
      nextUpgradeAvailable: false
    }))
    
    setUpgradeInProgress(false)
    setShowUpgradeModal(false)
  }, [])

  const getSystemStatus = useCallback((): SystemStatus => {
    return systemStatus
  }, [systemStatus])

  const contextValue = useMemo(() => ({
    currentPhase,
    capabilities,
    upgradePath,
    canUpgrade,
    upgradeSystem,
    getSystemStatus
  }), [currentPhase, capabilities, upgradePath, canUpgrade, upgradeSystem, getSystemStatus])

  // Render appropriate component based on phase
  const renderComponent = () => {
    switch (currentPhase) {
      case "basic":
        return <DataSourcesApp />
      case "phase1":
      case "phase2":
      case "phase3":
        return <EnterpriseDataSourcesApp />
      default:
        return <DataSourcesApp />
    }
  }

  return (
    <UnifiedDataSourcesContext.Provider value={contextValue}>
      <div className="h-full w-full flex flex-col">
        {/* System Phase Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {currentPhase === "basic" && <Database className="h-5 w-5" />}
                {currentPhase === "phase1" && <Server className="h-5 w-5" />}
                {currentPhase === "phase2" && <Workflow className="h-5 w-5" />}
                {currentPhase === "phase3" && <Crown className="h-5 w-5" />}
                <span className="font-semibold">
                  {currentPhase === "basic" && "Basic Data Sources"}
                  {currentPhase === "phase1" && "Phase 1: Core Infrastructure"}
                  {currentPhase === "phase2" && "Phase 2: Advanced Integration"}
                  {currentPhase === "phase3" && "Phase 3: Enterprise UI/UX"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {systemStatus.dataSourceCount} Data Sources
              </Badge>
            </div>
            
            {canUpgrade && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade System
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderComponent()}
        </div>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                System Upgrade Available
              </DialogTitle>
              <DialogDescription>
                Upgrade your data sources system to unlock advanced features and capabilities.
              </DialogDescription>
            </DialogHeader>
            
            {upgradePath && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Phase</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{upgradePath.from.toUpperCase()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {SYSTEM_CAPABILITIES[upgradePath.from].features.slice(0, 3).join(", ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Upgrade To</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{upgradePath.to.toUpperCase()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {SYSTEM_CAPABILITIES[upgradePath.to].features.slice(0, 3).join(", ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {upgradePath.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {upgradePath.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-blue-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Estimated time: {upgradePath.estimatedTime}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => upgradePath && upgradeSystem(upgradePath.to)}
                disabled={upgradeInProgress}
              >
                {upgradeInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Upgrade
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UnifiedDataSourcesContext.Provider>
  )
}

// Hook to use the unified context
export const useUnifiedDataSources = () => {
  const context = useContext(UnifiedDataSourcesContext)
  if (!context) {
    throw new Error("useUnifiedDataSources must be used within UnifiedDataSourcesApp")
  }
  return context
}

// Export for use in main data-governance page
export default UnifiedDataSourcesApp