"use client"

import { useState, useEffect, Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  Command,
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Import all the advanced components
import { DataSourceGrid } from "./data-source-grid"
import { DataSourceDetails } from "./data-source-details"
import { DataSourceMonitoring } from "./data-source-monitoring"
import { DataSourceCloudConfig } from "./data-source-cloud-config"
import { DataSourceDiscovery } from "./data-source-discovery"
import { DataSourceQualityAnalytics } from "./data-source-quality-analytics"
import { DataSourceGrowthAnalytics } from "./data-source-growth-analytics"
import { DataSourceWorkspaceManagement } from "./data-source-workspace-management"

// Types and services
import { DataSource } from "./types"
import { useDataSourcesQuery, useUserQuery, useNotificationsQuery } from "./services/apis"

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Navigation items
const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: Database,
    description: "Data sources overview and management",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: Activity,
    description: "Real-time monitoring and health metrics",
  },
  {
    id: "discovery",
    label: "Data Discovery",
    icon: Search,
    description: "Discover and catalog data assets",
  },
  {
    id: "quality",
    label: "Quality Analytics",
    icon: Shield,
    description: "Data quality metrics and insights",
  },
  {
    id: "growth",
    label: "Growth Analytics",
    icon: TrendingUp,
    description: "Growth patterns and predictions",
  },
  {
    id: "cloud",
    label: "Cloud Config",
    icon: Cloud,
    description: "Cloud provider configurations",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: Users,
    description: "Team collaboration and sharing",
  },
]

interface DataSourcesAppProps {
  className?: string
}

function DataSourcesAppContent({ className }: DataSourcesAppProps) {
  const [activeView, setActiveView] = useState("overview")
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [notifications, setNotifications] = useState(true)

  // Queries
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError } = useDataSourcesQuery()
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: userNotifications } = useNotificationsQuery()

  // Auto-select first data source if none selected
  useEffect(() => {
    if (dataSources && dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0])
    }
  }, [dataSources, selectedDataSource])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "connected":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const renderContent = () => {
    if (!selectedDataSource) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Source Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a data source from the sidebar to get started
            </p>
            {dataSources && dataSources.length === 0 && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Data Source
              </Button>
            )}
          </div>
        </div>
      )
    }

    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-6">
            <DataSourceDetails dataSource={selectedDataSource} />
            <DataSourceGrid dataSources={[selectedDataSource]} />
          </div>
        )
      case "monitoring":
        return <DataSourceMonitoring dataSource={selectedDataSource} />
      case "discovery":
        return <DataSourceDiscovery dataSource={selectedDataSource} />
      case "quality":
        return <DataSourceQualityAnalytics dataSource={selectedDataSource} />
      case "growth":
        return <DataSourceGrowthAnalytics dataSource={selectedDataSource} />
      case "cloud":
        return <DataSourceCloudConfig dataSource={selectedDataSource} />
      case "workspaces":
        return <DataSourceWorkspaceManagement dataSource={selectedDataSource} />
      default:
        return <DataSourceDetails dataSource={selectedDataSource} />
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "border-r"}`}>
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                  onClick={() => {
                    setActiveView(item.id)
                    if (mobile) setMobileMenuOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {(!sidebarCollapsed || mobile) && (
                    <span className="ml-2">{item.label}</span>
                  )}
                </Button>
              )
            })}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Data Sources List */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            {(!sidebarCollapsed || mobile) && (
              <h3 className="font-medium text-sm">Data Sources</h3>
            )}
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {dataSourcesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : (
              dataSources?.map((dataSource) => (
                <Button
                  key={dataSource.id}
                  variant={selectedDataSource?.id === dataSource.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                  onClick={() => {
                    setSelectedDataSource(dataSource)
                    if (mobile) setMobileMenuOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Database className="h-4 w-4 flex-shrink-0" />
                    {(!sidebarCollapsed || mobile) && (
                      <div className="flex-1 min-w-0 text-left">
                        <p className="truncate">{dataSource.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant={getStatusBadgeVariant(dataSource.status)}
                            className="text-xs"
                          >
                            {dataSource.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {dataSource.type}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      {!mobile && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col ${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300`}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data sources, metrics, or insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {userNotifications && userNotifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {userNotifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <Separator />
                  {userNotifications && userNotifications.length > 0 ? (
                    userNotifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex-col items-start">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          {selectedDataSource && (
            <div className="px-4 py-2 border-t bg-muted/50">
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Data Sources</span>
                <ChevronRight className="h-3 w-3 mx-1" />
                <span className="font-medium text-foreground">{selectedDataSource.name}</span>
                <ChevronRight className="h-3 w-3 mx-1" />
                <span className="font-medium text-foreground">
                  {navigationItems.find(item => item.id === activeView)?.label}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </div>
              }
            >
              <div className="p-6">
                {dataSourcesError ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data Sources</h3>
                        <p className="text-muted-foreground mb-4">
                          Failed to load data sources. Please try again.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  renderContent()
                )}
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

export function DataSourcesApp(props: DataSourcesAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataSourcesAppContent {...props} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
