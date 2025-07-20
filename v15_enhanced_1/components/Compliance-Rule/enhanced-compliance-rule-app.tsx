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
  Home, Building, Factory, Store, Warehouse, Office, School, Hospital,
  CreditCard, Monitor, Wifi, HardDrive, Cpu, MemoryStick, Network
} from 'lucide-react'

// Enterprise Integration
import { EnterpriseComplianceProvider, useEnterpriseCompliance } from './enterprise-integration'
import { ComplianceHooks } from './hooks/use-enterprise-features'

// Enhanced Components with Enterprise Integration
import ComplianceRuleList from './components/ComplianceRuleList'
import ComplianceRuleDashboard from './components/ComplianceRuleDashboard'
import ComplianceRuleSettings from './components/ComplianceRuleSettings'
import ComplianceReports from './components/ComplianceReports'
import ComplianceWorkflows from './components/ComplianceWorkflows'
import ComplianceIntegrations from './components/ComplianceIntegrations'
import ComplianceIssueList from './components/ComplianceIssueList'

// Modal Components
import { ComplianceRuleCreateModal } from './components/ComplianceRuleCreateModal'
import { ComplianceRuleEditModal } from './components/ComplianceRuleEditModal'
import { ComplianceRuleDetails } from './components/ComplianceRuleDetails'
import { IntegrationCreateModal } from './components/IntegrationCreateModal'
import { IntegrationEditModal } from './components/IntegrationEditModal'
import { ReportCreateModal } from './components/ReportCreateModal'
import { ReportEditModal } from './components/ReportEditModal'
import { WorkflowCreateModal } from './components/WorkflowCreateModal'
import { WorkflowEditModal } from './components/WorkflowEditModal'

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
                ))}
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Advanced Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{ insights: any[]; trends: any[]; metrics: any }> = ({ insights, trends, metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Compliance Trends</span>
          </CardTitle>
          <CardDescription>Real-time compliance performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 flex items-center justify-center border">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Interactive compliance trend visualization</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time data processing...</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400"
              >
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{insight.title || 'Risk Prediction'}</p>
                    <p className="text-xs text-muted-foreground">{insight.description || 'AI-powered compliance insight'}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {insight.confidence || 95}% confidence
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-xs text-green-600">98ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Hit Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-16 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full w-5/6 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-xs text-blue-600">94%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Sync</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Advanced Risk Assessment Panel
const RiskAssessmentPanel: React.FC<{ riskData: any; onUpdate: () => void }> = ({ riskData, onUpdate }) => {
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('overall')
  
  const riskCategories = [
    { id: 'overall', label: 'Overall Risk', color: 'red', value: 72 },
    { id: 'data', label: 'Data Risk', color: 'orange', value: 68 },
    { id: 'access', label: 'Access Risk', color: 'yellow', value: 45 },
    { id: 'compliance', label: 'Compliance Risk', color: 'blue', value: 82 }
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-500" />
          <span>Risk Assessment Matrix</span>
        </CardTitle>
        <CardDescription>Real-time risk analysis and predictive insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {riskCategories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRiskCategory === category.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setSelectedRiskCategory(category.id)}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold text-${category.color}-500 mb-1`}>
                  {category.value}%
                </div>
                <div className="text-sm text-muted-foreground">{category.label}</div>
                <div className="mt-2">
                  <Progress value={category.value} className="h-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Risk Factors</h4>
            <div className="space-y-2">
              {[
                { factor: 'Data Exposure', level: 'High', value: 85 },
                { factor: 'Access Controls', level: 'Medium', value: 60 },
                { factor: 'Audit Trail', level: 'Low', value: 25 },
                { factor: 'Encryption', level: 'Medium', value: 55 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">{item.factor}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.level === 'High' ? 'destructive' : item.level === 'Medium' ? 'default' : 'secondary'}>
                      {item.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-8">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Recommendations</h4>
            <div className="space-y-2">
              {[
                'Implement additional data encryption',
                'Review access control policies',
                'Enhance audit logging mechanisms',
                'Update compliance documentation'
              ].map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Advanced Workflow Orchestration Panel
const WorkflowOrchestrationPanel: React.FC<{ workflows: any[]; onExecute: (id: string) => void }> = ({ workflows, onExecute }) => {
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([])



  // Load active workflows from backend
  const [loadingWorkflows, setLoadingWorkflows] = useState(false)

  useEffect(() => {
    const loadActiveWorkflows = async () => {
      setLoadingWorkflows(true)
      try {
        const response = await ComplianceAPIs.ComplianceManagement.getWorkflows({
          status: 'active',
          limit: 5
        })
        setActiveWorkflows(response.data || [])
      } catch (error) {
        console.error('Failed to load active workflows:', error)
        enterprise.sendNotification('error', 'Failed to load active workflows')
      } finally {
        setLoadingWorkflows(false)
      }
    }

    loadActiveWorkflows()
  }, [enterprise])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Workflow className="h-5 w-5 text-purple-500" />
          <span>Workflow Orchestration</span>
        </CardTitle>
        <CardDescription>Automated compliance workflow management and execution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Active Workflows</h4>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Workflow
              </Button>
            </div>
            <div className="space-y-3">
              {loadingWorkflows ? (
                <div className="text-center py-4">Loading workflows...</div>
              ) : activeWorkflows.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No active workflows</div>
              ) : (
                activeWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{workflow.name}</h5>
                    <Badge variant={workflow.status === 'in_progress' ? 'default' : 'secondary'}>
                      {workflow.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Steps: {workflow.completedSteps}/{workflow.steps}</span>
                      <span>Due: {workflow.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">Assigned to {workflow.assignee}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Workflow Templates</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'SOC 2 Type II Assessment', category: 'Security', icon: Shield },
                { name: 'GDPR Data Mapping', category: 'Privacy', icon: Database },
                { name: 'HIPAA Risk Assessment', category: 'Healthcare', icon: Hospital },
                { name: 'PCI DSS Validation', category: 'Financial', icon: CreditCard }
              ].map((template, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onExecute(`template-${index}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <template.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Real-time Collaboration Panel
const CollaborationPanel: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: 'John Doe', role: 'Compliance Manager', status: 'online', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'Risk Analyst', status: 'online', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', role: 'Auditor', status: 'away', avatar: 'MJ' }
  ])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-green-500" />
          <span>Real-time Collaboration</span>
        </CardTitle>
        <CardDescription>Active team members and shared workspaces</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Active Users</h4>
            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{user.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Shared Workspaces</h4>
            <div className="space-y-2">
              {[
                { name: 'Q1 Compliance Review', members: 5, activity: 'High' },
                { name: 'Risk Assessment 2024', members: 3, activity: 'Medium' },
                { name: 'Audit Preparation', members: 7, activity: 'High' }
              ].map((workspace, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{workspace.name}</h5>
                    <Badge variant={workspace.activity === 'High' ? 'default' : 'secondary'}>
                      {workspace.activity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{workspace.members} members</span>
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Quick Actions Component
const QuickActions: React.FC = () => {
  const { executeAction, startWorkflow } = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'QuickActions'
  })

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const handleAction = async (actionId: string, action: () => Promise<any>) => {
    setIsLoading(prev => ({ ...prev, [actionId]: true }))
    try {
      await action()
      toast.success('Action completed successfully')
    } catch (error) {
      toast.error('Action failed')
    } finally {
      setIsLoading(prev => ({ ...prev, [actionId]: false }))
    }
  }

  const actions = [
    {
      id: 'new-assessment',
      label: 'New Assessment',
      description: 'Start compliance assessment',
      icon: <Scan className="h-5 w-5" />,
      color: 'from-blue-500 to-blue-600',
      action: () => executeAction('create_assessment', {})
    },
    {
      id: 'import-framework',
      label: 'Import Framework',
      description: 'Add compliance framework',
      icon: <Download className="h-5 w-5" />,
      color: 'from-green-500 to-green-600',
      action: () => executeAction('import_framework', {})
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      description: 'Create compliance report',
      icon: <FileText className="h-5 w-5" />,
      color: 'from-purple-500 to-purple-600',
      action: () => executeAction('generate_report', {})
    },
    {
      id: 'sync-integrations',
      label: 'Sync Integrations',
      description: 'Update external data',
      icon: <RefreshCw className="h-5 w-5" />,
      color: 'from-indigo-500 to-indigo-600',
      action: () => executeAction('sync_integrations', {})
    },
    {
      id: 'risk-analysis',
      label: 'Risk Analysis',
      description: 'Run risk assessment',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'from-orange-500 to-orange-600',
      action: () => executeAction('risk_analysis', {})
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      description: 'View activity logs',
      icon: <Activity className="h-5 w-5" />,
      color: 'from-teal-500 to-teal-600',
      action: () => executeAction('audit_trail', {})
    },
    {
      id: 'workflow-automation',
      label: 'Automate Workflow',
      description: 'Set up automation',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-yellow-500 to-yellow-600',
      action: () => startWorkflow('automation_workflow', {})
    },
    {
      id: 'collaboration',
      label: 'Team Workspace',
      description: 'Join collaboration',
      icon: <Users className="h-5 w-5" />,
      color: 'from-pink-500 to-pink-600',
      action: () => executeAction('create_workspace', {})
    }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {actions.map((action) => (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card 
              className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
              onClick={() => handleAction(action.id, action.action)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <CardContent className="p-4 relative z-10">
                <div className="text-center space-y-2">
                  <div className={`mx-auto w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                    {isLoading[action.id] ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      action.icon
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
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

  // Modal state management
  const [modals, setModals] = useState({
    createRequirement: false,
    editRequirement: false,
    viewRequirement: false,
    createIntegration: false,
    editIntegration: false,
    createReport: false,
    editReport: false,
    createWorkflow: false,
    editWorkflow: false
  })
  
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Modal handlers
  const openModal = useCallback((modalName: string, item?: any) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
    if (item) setSelectedItem(item)
  }, [])

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
    setSelectedItem(null)
  }, [])

  const closeAllModals = useCallback(() => {
    setModals({
      createRequirement: false,
      editRequirement: false,
      viewRequirement: false,
      createIntegration: false,
      editIntegration: false,
      createReport: false,
      editReport: false,
      createWorkflow: false,
      editWorkflow: false
    })
    setSelectedItem(null)
  }, [])

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

        {/* Advanced Analytics Dashboard */}
        <AnalyticsDashboard insights={insights} trends={[]} metrics={metrics} />

        {/* Risk Assessment Panel */}
        <RiskAssessmentPanel riskData={null} onUpdate={refreshData} />

        {/* Workflow Orchestration Panel */}
        <WorkflowOrchestrationPanel workflows={[]} onExecute={(id) => console.log('Execute workflow:', id)} />

        {/* Collaboration Panel */}
        <CollaborationPanel />

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
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-9">
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
            <TabsTrigger value="issues" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Issues</span>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Scan className="h-5 w-5 text-blue-500" />
                            <span>Active Assessments</span>
                          </div>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            New Assessment
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Ongoing compliance assessments and their progress
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              id: 'assess-001',
                              framework: 'SOC 2 Type II',
                              progress: 75,
                              status: 'in_progress',
                              assessor: 'External Auditor',
                              dueDate: '2024-03-15',
                              findings: 3,
                              lastActivity: '2 hours ago'
                            },
                            {
                              id: 'assess-002',
                              framework: 'GDPR Compliance',
                              progress: 45,
                              status: 'pending_review',
                              assessor: 'Internal Team',
                              dueDate: '2024-03-30',
                              findings: 7,
                              lastActivity: '1 day ago'
                            },
                            {
                              id: 'assess-003',
                              framework: 'HIPAA Security Rule',
                              progress: 90,
                              status: 'near_completion',
                              assessor: 'Healthcare Specialist',
                              dueDate: '2024-02-28',
                              findings: 1,
                              lastActivity: '30 minutes ago'
                            }
                          ].map((assessment) => (
                            <motion.div
                              key={assessment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">{assessment.framework}</h4>
                                  <p className="text-sm text-muted-foreground">Assessor: {assessment.assessor}</p>
                                </div>
                                <Badge variant={
                                  assessment.status === 'in_progress' ? 'default' :
                                  assessment.status === 'near_completion' ? 'secondary' : 'outline'
                                }>
                                  {assessment.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span className="font-medium">{assessment.progress}%</span>
                                </div>
                                <Progress value={assessment.progress} className="h-2" />
                                
                                <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                                  <div>
                                    <span className="text-muted-foreground">Due Date</span>
                                    <p className="font-medium">{assessment.dueDate}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Findings</span>
                                    <p className="font-medium text-orange-600">{assessment.findings}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Last Activity</span>
                                    <p className="font-medium">{assessment.lastActivity}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  <Button size="sm" variant="ghost">
                                    <Download className="h-3 w-3 mr-1" />
                                    Export
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Assessment Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            {
                              title: 'Risk Trend Analysis',
                              description: 'Overall risk decreasing by 12% this quarter',
                              type: 'positive',
                              icon: TrendingDown
                            },
                            {
                              title: 'Control Effectiveness',
                              description: '94% of controls are operating effectively',
                              type: 'positive',
                              icon: Shield
                            },
                            {
                              title: 'Remediation Progress',
                              description: '23 gaps closed, 8 remain open',
                              type: 'warning',
                              icon: Target
                            }
                          ].map((insight, index) => (
                            <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-400">
                              <div className="flex items-start space-x-2">
                                <insight.icon className="h-4 w-4 text-green-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">{insight.title}</p>
                                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Assessment Templates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { name: 'SOC 2 Type I', duration: '4-6 weeks', complexity: 'Medium' },
                            { name: 'ISO 27001', duration: '8-12 weeks', complexity: 'High' },
                            { name: 'NIST Framework', duration: '6-8 weeks', complexity: 'Medium' },
                            { name: 'Custom Assessment', duration: 'Variable', complexity: 'Custom' }
                          ].map((template, index) => (
                            <div key={index} className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{template.name}</p>
                                  <p className="text-xs text-muted-foreground">{template.duration}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {template.complexity}
                                </Badge>
                              </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  {[
                    { label: 'Compliance Score', value: '94.2%', change: '+2.1%', trend: 'up', color: 'green' },
                    { label: 'Risk Level', value: 'Medium', change: '-5%', trend: 'down', color: 'yellow' },
                    { label: 'Open Findings', value: '12', change: '-8', trend: 'down', color: 'orange' },
                    { label: 'Controls Tested', value: '247', change: '+15', trend: 'up', color: 'blue' }
                  ].map((metric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 opacity-5`} />
                        <CardContent className="p-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{metric.label}</p>
                              <p className="text-2xl font-bold">{metric.value}</p>
                            </div>
                            <div className={`p-2 rounded-full bg-${metric.color}-100`}>
                              {metric.trend === 'up' ? (
                                <TrendingUp className={`h-4 w-4 text-${metric.color}-600`} />
                              ) : (
                                <TrendingDown className={`h-4 w-4 text-${metric.color}-600`} />
                              )}
                            </div>
                          </div>
                          <p className={`text-xs mt-1 text-${metric.color}-600`}>
                            {metric.change} from last period
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span>Compliance Trends</span>
                      </CardTitle>
                      <CardDescription>
                        Historical compliance performance and predictive analytics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex space-x-4">
                            <Button size="sm" variant="outline">6M</Button>
                            <Button size="sm" variant="outline">1Y</Button>
                            <Button size="sm" variant="default">2Y</Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-xs">Compliance Score</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-xs">Risk Level</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <LineChart className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Interactive trend visualization</p>
                            <p className="text-xs text-muted-foreground mt-1">Real-time compliance analytics</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-sm font-medium">Peak Score</p>
                            <p className="text-lg font-bold text-green-600">98.5%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Avg Score</p>
                            <p className="text-lg font-bold text-blue-600">94.2%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Trend</p>
                            <p className="text-lg font-bold text-purple-600">+2.1%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <PieChart className="h-5 w-5 text-purple-500" />
                          <span>Risk Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { category: 'Low Risk', percentage: 65, color: 'green' },
                            { category: 'Medium Risk', percentage: 25, color: 'yellow' },
                            { category: 'High Risk', percentage: 8, color: 'orange' },
                            { category: 'Critical Risk', percentage: 2, color: 'red' }
                          ].map((risk, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{risk.category}</span>
                                <span className="font-medium">{risk.percentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${risk.percentage}%` }}
                                  transition={{ delay: index * 0.2, duration: 0.8 }}
                                  className={`h-2 rounded-full bg-${risk.color}-500`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-orange-500" />
                          <span>Key Metrics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { metric: 'Time to Remediation', value: '12.5 days', target: '< 15 days', status: 'good' },
                            { metric: 'Control Effectiveness', value: '94.2%', target: '> 90%', status: 'good' },
                            { metric: 'Audit Readiness', value: '87%', target: '> 85%', status: 'good' },
                            { metric: 'Policy Compliance', value: '96.8%', target: '> 95%', status: 'excellent' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div>
                                <p className="text-sm font-medium">{item.metric}</p>
                                <p className="text-xs text-muted-foreground">Target: {item.target}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{item.value}</p>
                                <Badge variant={item.status === 'excellent' ? 'default' : 'secondary'} className="text-xs">
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span>Framework Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { framework: 'SOC 2', score: 96, controls: 24, status: 'compliant' },
                          { framework: 'GDPR', score: 92, controls: 18, status: 'compliant' },
                          { framework: 'HIPAA', score: 88, controls: 32, status: 'partial' },
                          { framework: 'PCI DSS', score: 94, controls: 28, status: 'compliant' }
                        ].map((framework, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{framework.framework}</h4>
                              <Badge variant={framework.status === 'compliant' ? 'default' : 'secondary'}>
                                {framework.status}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Compliance Score</span>
                                <span className="font-medium">{framework.score}%</span>
                              </div>
                              <Progress value={framework.score} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {framework.controls} controls assessed
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span>AI Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            title: 'Automate Access Reviews',
                            description: 'Implement automated quarterly access reviews to reduce manual effort by 60%',
                            impact: 'High',
                            effort: 'Medium'
                          },
                          {
                            title: 'Enhanced Monitoring',
                            description: 'Deploy additional monitoring controls for privileged account activities',
                            impact: 'Medium',
                            effort: 'Low'
                          },
                          {
                            title: 'Policy Updates',
                            description: 'Update data retention policies to align with latest regulatory requirements',
                            impact: 'High',
                            effort: 'Low'
                          },
                          {
                            title: 'Training Program',
                            description: 'Implement security awareness training for all employees',
                            impact: 'Medium',
                            effort: 'Medium'
                          }
                        ].map((rec, index) => (
                          <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{rec.title}</h4>
                              <div className="flex space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {rec.impact} Impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {rec.effort} Effort
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="ghost" className="h-6 px-2">
                                <Plus className="h-3 w-3 mr-1" />
                                Add to Plan
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <ComplianceRuleSettings dataSourceId={dataSourceId} />
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6">
                <ComplianceWorkflows 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <ComplianceIntegrations 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ComplianceReports 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="issues" className="space-y-6">
                <ComplianceIssueList 
                  dataSourceId={dataSourceId}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </TabsContent>

              <TabsContent value="legacy-settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Settings className="h-5 w-5 text-blue-500" />
                          <span>System Configuration</span>
                        </CardTitle>
                        <CardDescription>Configure system-wide compliance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="assessment-frequency">Assessment Frequency</Label>
                              <Select defaultValue="quarterly">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                                  <SelectItem value="annual">Annual</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="risk-threshold">Risk Threshold</Label>
                              <Select defaultValue="medium">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="auto-remediation" />
                              <Label htmlFor="auto-remediation">Enable Auto-Remediation</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="real-time-monitoring" defaultChecked />
                              <Label htmlFor="real-time-monitoring">Real-time Monitoring</Label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="notification-email">Notification Email</Label>
                              <Input 
                                id="notification-email" 
                                type="email" 
                                placeholder="compliance@company.com"
                                defaultValue="compliance@company.com"
                              />
                            </div>

                            <div>
                              <Label htmlFor="retention-period">Data Retention (days)</Label>
                              <Input 
                                id="retention-period" 
                                type="number" 
                                placeholder="365"
                                defaultValue="365"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="audit-logging" defaultChecked />
                              <Label htmlFor="audit-logging">Audit Logging</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="ai-insights" defaultChecked />
                              <Label htmlFor="ai-insights">AI Insights</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Boxes className="h-5 w-5 text-purple-500" />
                          <span>Integration Settings</span>
                        </CardTitle>
                        <CardDescription>Manage external system integrations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { 
                              name: 'ServiceNow GRC', 
                              status: 'connected', 
                              lastSync: '2 hours ago',
                              icon: Server,
                              config: { url: 'https://company.service-now.com', sync_frequency: 'hourly' }
                            },
                            { 
                              name: 'Qualys VMDR', 
                              status: 'connected', 
                              lastSync: '1 day ago',
                              icon: Shield,
                              config: { api_endpoint: 'https://qualysapi.qg2.apps.qualys.com', sync_frequency: 'daily' }
                            },
                            { 
                              name: 'Microsoft Purview', 
                              status: 'error', 
                              lastSync: '3 days ago',
                              icon: Cloud,
                              config: { tenant_id: 'xxx-xxx-xxx', sync_frequency: 'real_time' }
                            },
                            { 
                              name: 'Jira Service Management', 
                              status: 'pending', 
                              lastSync: 'Never',
                              icon: Boxes,
                              config: { base_url: 'https://company.atlassian.net', sync_frequency: 'manual' }
                            }
                          ].map((integration, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-muted rounded">
                                    <integration.icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{integration.name}</h4>
                                    <p className="text-sm text-muted-foreground">Last sync: {integration.lastSync}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={
                                    integration.status === 'connected' ? 'default' :
                                    integration.status === 'error' ? 'destructive' : 'secondary'
                                  }>
                                    {integration.status}
                                  </Badge>
                                  <Button size="sm" variant="outline">
                                    <Settings className="h-3 w-3 mr-1" />
                                    Configure
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {Object.entries(integration.config).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-muted-foreground">{key.replace('_', ' ')}: </span>
                                    <span className="font-medium">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-green-500" />
                          <span>User Management</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Active Users</span>
                            <Badge variant="secondary">24</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Admin Users</span>
                            <Badge variant="secondary">3</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Guest Users</span>
                            <Badge variant="secondary">7</Badge>
                          </div>
                          <Separator />
                          <Button size="sm" className="w-full">
                            <Plus className="h-3 w-3 mr-1" />
                            Add User
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-orange-500" />
                          <span>Notification Settings</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { label: 'Assessment Due', enabled: true },
                            { label: 'Risk Threshold Exceeded', enabled: true },
                            { label: 'Compliance Gap Identified', enabled: true },
                            { label: 'Workflow Approval Required', enabled: false },
                            { label: 'Integration Errors', enabled: true },
                            { label: 'Weekly Summary', enabled: false }
                          ].map((notification, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{notification.label}</span>
                              <Switch defaultChecked={notification.enabled} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Download className="h-5 w-5 text-blue-500" />
                          <span>Export & Backup</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Database className="h-4 w-4 mr-2" />
                            Backup Configuration
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Modal Components */}
      <ComplianceRuleCreateModal
        isOpen={modals.createRequirement}
        onClose={() => closeModal('createRequirement')}
        onSuccess={(requirement) => {
          closeModal('createRequirement')
          refreshData()
        }}
        dataSourceId={dataSourceId}
      />

      <ComplianceRuleEditModal
        isOpen={modals.editRequirement}
        onClose={() => closeModal('editRequirement')}
        requirement={selectedItem}
        onSuccess={(requirement) => {
          closeModal('editRequirement')
          refreshData()
        }}
      />

      <ComplianceRuleDetails
        isOpen={modals.viewRequirement}
        onClose={() => closeModal('viewRequirement')}
        requirement={selectedItem}
        onEdit={(requirement) => {
          closeModal('viewRequirement')
          openModal('editRequirement', requirement)
        }}
        onDelete={(requirement) => {
          closeModal('viewRequirement')
          refreshData()
        }}
      />

      <IntegrationCreateModal
        isOpen={modals.createIntegration}
        onClose={() => closeModal('createIntegration')}
        onSuccess={(integration) => {
          closeModal('createIntegration')
          refreshData()
        }}
        dataSourceId={dataSourceId}
      />

      <IntegrationEditModal
        isOpen={modals.editIntegration}
        onClose={() => closeModal('editIntegration')}
        integration={selectedItem}
        onSuccess={(integration) => {
          closeModal('editIntegration')
          refreshData()
        }}
      />

      <ReportCreateModal
        isOpen={modals.createReport}
        onClose={() => closeModal('createReport')}
        onSuccess={(report) => {
          closeModal('createReport')
          refreshData()
        }}
        dataSourceId={dataSourceId}
      />

      <ReportEditModal
        isOpen={modals.editReport}
        onClose={() => closeModal('editReport')}
        report={selectedItem}
        onSuccess={(report) => {
          closeModal('editReport')
          refreshData()
        }}
      />

      <WorkflowCreateModal
        isOpen={modals.createWorkflow}
        onClose={() => closeModal('createWorkflow')}
        onSuccess={(workflow) => {
          closeModal('createWorkflow')
          refreshData()
        }}
        dataSourceId={dataSourceId}
      />

      <WorkflowEditModal
        isOpen={modals.editWorkflow}
        onClose={() => closeModal('editWorkflow')}
        workflow={selectedItem}
        onSuccess={(workflow) => {
          closeModal('editWorkflow')
          refreshData()
        }}
      />

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
