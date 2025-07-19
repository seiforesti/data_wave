"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Icons from Lucide React
import {
  Shield, AlertTriangle, CheckCircle, Clock, Users, FileText, BarChart3, Settings,
  Search, Filter, Download, Upload, RefreshCw, Plus, Edit, Trash2, Eye, Calendar,
  TrendingUp, TrendingDown, Activity, Zap, Target, Award, Bell, MessageSquare,
  ChevronRight, ChevronDown, ExternalLink, Copy, Share2, Bookmark, Star,
  Play, Pause, Square, SkipForward, Rewind, FastForward, Volume2,
  Database, Cloud, Server, Lock, Unlock, Key, Fingerprint, Scan,
  GitBranch, GitCommit, GitMerge, Code, Terminal, Bug, Lightbulb,
  PieChart, LineChart, BarChart, Gauge, Radar, Map, Globe, Layers,
  Workflow, Boxes, Package, Truck, Plane, Ship, Train, Car,
  Home, Building, Factory, Store, Warehouse, Office, School, Hospital
} from 'lucide-react'

// Enterprise Integration
import { EnterpriseComplianceProvider, useEnterpriseCompliance } from './enterprise-integration'
import { ComplianceHooks } from './hooks/use-enterprise-features'

// Existing Components (we'll enhance these)
import ComplianceRuleList from './components/ComplianceRuleList'
import ComplianceRuleDashboard from './components/ComplianceRuleDashboard'
import ComplianceRuleReports from './components/ComplianceRuleReports'
import ComplianceRuleIntegrations from './components/ComplianceRuleIntegrations'
import ComplianceRuleWorkflows from './components/ComplianceRuleWorkflows'
import ComplianceRuleSettings from './components/ComplianceRuleSettings'

// Advanced Enterprise Components
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  onClick?: () => void
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, trend, icon, color = 'blue', onClick, loading 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-100',
    green: 'from-green-500 to-green-600 text-green-100',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-100',
    red: 'from-red-500 to-red-600 text-red-100',
    purple: 'from-purple-500 to-purple-600 text-purple-100',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-100'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
          onClick ? 'hover:shadow-xl' : ''
        }`}
        onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold mb-1">
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              value
            )}
          </div>
          {change !== undefined && (
            <p className="text-xs text-muted-foreground flex items-center">
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
              {trend === 'stable' && <Activity className="h-3 w-3 mr-1 text-gray-500" />}
              <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="ml-1">from last month</span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Real-time Status Indicator
const StatusIndicator: React.FC<{ 
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  label?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ status, label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    unknown: 'bg-gray-500'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} ${statusColors[status]} rounded-full animate-pulse`} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

// Advanced Search and Filter Component
const AdvancedSearchFilter: React.FC<{
  onSearch: (query: string) => void
  onFilter: (filters: any) => void
  filters: any
  searchPlaceholder?: string
}> = ({ onSearch, onFilter, filters, searchPlaceholder = "Search compliance rules..." }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }, [onSearch])

  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status || ''} onValueChange={(value) => onFilter({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
                  <SelectItem value="not_assessed">Not Assessed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="framework-filter">Framework</Label>
              <Select value={filters.framework || ''} onValueChange={(value) => onFilter({ ...filters, framework: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All frameworks</SelectItem>
                  <SelectItem value="SOC2">SOC 2</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="PCI-DSS">PCI DSS</SelectItem>
                  <SelectItem value="ISO27001">ISO 27001</SelectItem>
                  <SelectItem value="NIST">NIST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="risk-filter">Risk Level</Label>
              <Select value={filters.risk_level || ''} onValueChange={(value) => onFilter({ ...filters, risk_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All risk levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All risk levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => onFilter({})}>
                Clear Filters
              </Button>
              <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Notification Center Component
const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useEnterpriseCompliance()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, [notifications]
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                Mark all read
              </Button>
            )}
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications
                </p>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read ? 'bg-muted/50' : 'bg-background border-primary/20'
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        notification.type === 'error' ? 'bg-red-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Quick Actions Component
const QuickActions: React.FC = () => {
  const { executeAction, startWorkflow } = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'QuickActions'
  })

  const actions = [
    {
      id: 'new-assessment',
      label: 'New Assessment',
      icon: <Scan className="h-4 w-4" />,
      color: 'blue',
      action: () => executeAction('create_assessment', {})
    },
    {
      id: 'import-framework',
      label: 'Import Framework',
      icon: <Download className="h-4 w-4" />,
      color: 'green',
      action: () => executeAction('import_framework', {})
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: <FileText className="h-4 w-4" />,
      color: 'purple',
      action: () => executeAction('generate_report', {})
    },
    {
      id: 'sync-integrations',
      label: 'Sync Integrations',
      icon: <RefreshCw className="h-4 w-4" />,
      color: 'indigo',
      action: () => executeAction('sync_integrations', {})
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {actions.map((action) => (
        <motion.div
          key={action.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="h-20 w-full flex flex-col items-center justify-center space-y-2"
            onClick={action.action}
          >
            {action.icon}
            <span className="text-xs text-center">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

// Main Enhanced Compliance Rule App Component
const EnhancedComplianceRuleApp: React.FC<{ dataSourceId?: number }> = ({ dataSourceId }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const enterprise = useEnterpriseCompliance()
  
  // Hooks for enterprise features
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceRuleApp',
    dataSourceId
  })
  
  const monitoring = ComplianceHooks.useComplianceMonitoring(dataSourceId)
  const riskAssessment = ComplianceHooks.useRiskAssessment(dataSourceId)
  const frameworkIntegration = ComplianceHooks.useFrameworkIntegration()
  const auditFeatures = ComplianceHooks.useAuditFeatures('data_source', dataSourceId?.toString())
  const workflowIntegration = ComplianceHooks.useWorkflowIntegration()
  const analyticsIntegration = ComplianceHooks.useAnalyticsIntegration(dataSourceId)

  // State management
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  // Real-time data refresh
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [metricsData, insightsData, complianceStatus] = await Promise.all([
        enterpriseFeatures.getMetrics(),
        analyticsIntegration.getInsights(),
        monitoring.getComplianceStatus()
      ])
      
      setMetrics(metricsData)
      setInsights(insightsData || [])
      
      // Update URL with current tab
      if (activeTab !== 'dashboard') {
        router.push(`?tab=${activeTab}`, { scroll: false })
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }, [enterpriseFeatures, analyticsIntegration, monitoring, activeTab, router])

  // Initialize data on component mount
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribe = enterprise.addEventListener('*', (event) => {
      if (event.type === 'compliance_alert' || event.type === 'risk_threshold_exceeded') {
        setAlerts(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 alerts
      }
    })

    return unsubscribe
  }, [enterprise])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault()
            refreshData()
            break
          case 'k':
            e.preventDefault()
            // Focus search input
            document.querySelector('input[placeholder*="Search"]')?.focus()
            break
          case '1':
            e.preventDefault()
            setActiveTab('dashboard')
            break
          case '2':
            e.preventDefault()
            setActiveTab('requirements')
            break
          case '3':
            e.preventDefault()
            setActiveTab('assessments')
            break
          case '4':
            e.preventDefault()
            setActiveTab('reports')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refreshData])

  // Render metrics cards
  const renderMetricsCards = () => {
    if (!metrics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Requirements"
          value={metrics.totalRequirements || 0}
          change={5.2}
          trend="up"
          icon={<FileText className="h-4 w-4" />}
          color="blue"
          loading={isLoading}
          onClick={() => setActiveTab('requirements')}
        />
        <MetricCard
          title="Compliance Score"
          value={`${metrics.complianceScore || 0}%`}
          change={2.1}
          trend="up"
          icon={<Target className="h-4 w-4" />}
          color="green"
          loading={isLoading}
          onClick={() => setActiveTab('dashboard')}
        />
        <MetricCard
          title="Open Gaps"
          value={metrics.openGaps || 0}
          change={-8.3}
          trend="down"
          icon={<AlertTriangle className="h-4 w-4" />}
          color="yellow"
          loading={isLoading}
          onClick={() => setActiveTab('gaps')}
        />
        <MetricCard
          title="Risk Score"
          value={metrics.riskScore || 0}
          change={-3.7}
          trend="down"
          icon={<Shield className="h-4 w-4" />}
          color="red"
          loading={isLoading}
          onClick={() => setActiveTab('risk')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Compliance Management</h1>
                  <p className="text-sm text-muted-foreground">
                    Enterprise governance, risk, and compliance platform
                  </p>
                </div>
              </div>
              <StatusIndicator 
                status={enterprise.isConnected ? 'healthy' : 'critical'} 
                label={enterprise.isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refreshData}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data (Ctrl+R)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <NotificationCenter />
              
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Metrics Dashboard */}
        {renderMetricsCards()}

        {/* Quick Actions */}
        <QuickActions />

        {/* Advanced Search and Filters */}
        <AdvancedSearchFilter
          onSearch={setSearchQuery}
          onFilter={setFilters}
          filters={filters}
          searchPlaceholder="Search compliance requirements, assessments, and reports..."
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center space-x-2">
              <Scan className="h-4 w-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Boxes className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="dashboard" className="space-y-6">
                <ComplianceRuleDashboard 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                  insights={insights}
                  alerts={alerts}
                />
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <ComplianceRuleList 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="assessments" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {/* Assessment content will be enhanced */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Assessments</CardTitle>
                        <CardDescription>
                          Ongoing compliance assessments and their progress
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Assessment management interface</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Assessment Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {insights.slice(0, 3).map((insight, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <p className="text-sm font-medium">{insight.title}</p>
                              <p className="text-xs text-muted-foreground">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ComplianceRuleReports 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6">
                <ComplianceRuleWorkflows 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <ComplianceRuleIntegrations 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Trends</CardTitle>
                      <CardDescription>
                        Historical compliance performance and trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Compliance trend chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Analysis</CardTitle>
                      <CardDescription>
                        Risk assessment and predictive analytics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Risk analysis chart</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <ComplianceRuleSettings 
                  dataSourceId={dataSourceId}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                Last updated: {enterprise.lastSync?.toLocaleString() || 'Never'}
              </p>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Performance:</span>
                <Badge variant="outline">
                  {enterprise.performanceMetrics.responseTime.toFixed(0)}ms
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                Enterprise Compliance Platform v2.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Wrapped component with Enterprise Provider
const ComplianceRuleAppWithProvider: React.FC<{ dataSourceId?: number }> = ({ dataSourceId }) => {
  return (
    <EnterpriseComplianceProvider>
      <TooltipProvider>
        <EnhancedComplianceRuleApp dataSourceId={dataSourceId} />
      </TooltipProvider>
    </EnterpriseComplianceProvider>
  )
}

export default ComplianceRuleAppWithProvider
