"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Eye, 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  Settings, 
  TrendingUp, 
  Users, 
  Zap,
  Activity,
  BarChart3,
  Workflow,
  Shield,
  Target,
  Play,
  Copy,
  Trash2,
  Edit,
  MoreHorizontal,
  Bell,
  Lightbulb,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from 'sonner'

import { useEnterpriseScanRuleSets } from './hooks/use-enterprise-scan-rule-sets'
import { ScanRuleSetList } from './components/ScanRuleSetList'
import { ScanRuleSetCreateModal } from './components/ScanRuleSetCreateModal'
import { ScanRuleSetEditModal } from './components/ScanRuleSetEditModal'
import { ScanRuleSetDetails } from './components/ScanRuleSetDetails'
import { ScanRuleVisualizer } from './components/ScanRuleVisualizer'
import { CustomScanRuleList } from './components/CustomScanRuleList'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'

export default function EnhancedScanRuleSetApp() {
  const [activeTab, setActiveTab] = useState('rule-sets')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRuleSet, setSelectedRuleSet] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Enterprise hook
  const {
    ruleSets,
    analytics,
    insights,
    alerts,
    workflows,
    crossGroupData,
    realTimeUpdates,
    systemHealth,
    performanceMetrics,
    isLoading,
    error,
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
    executeRuleSet,
    duplicateRuleSet,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    dismissInsight,
    applyInsightRecommendation,
    toggleRealTimeUpdates,
    refetch,
  } = useEnterpriseScanRuleSets(undefined, searchTerm)

  // Filter rule sets based on search and data source
  const filteredRuleSets = ruleSets?.filter(ruleSet => {
    const matchesSearch = !searchTerm || 
      ruleSet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruleSet.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDataSource = selectedDataSource === 'all' || 
      ruleSet.data_source?.name === selectedDataSource

    return matchesSearch && matchesDataSource
  }) || []

  // Handle rule set operations
  const handleCreateRuleSet = async (data: any) => {
    try {
      await createRuleSet(data)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating rule set:', error)
    }
  }

  const handleUpdateRuleSet = async (id: number, data: any) => {
    try {
      await updateRuleSet(id, data)
      setShowEditModal(false)
      setSelectedRuleSet(null)
    } catch (error) {
      console.error('Error updating rule set:', error)
    }
  }

  const handleDeleteRuleSet = async (id: number) => {
    try {
      await deleteRuleSet(id)
      toast.success('Rule set deleted successfully')
    } catch (error) {
      console.error('Error deleting rule set:', error)
    }
  }

  const handleExecuteRuleSet = async (id: number) => {
    try {
      await executeRuleSet(id)
      toast.success('Scan execution started')
    } catch (error) {
      console.error('Error executing rule set:', error)
    }
  }

  const handleDuplicateRuleSet = async (id: number) => {
    try {
      const ruleSet = ruleSets?.find(rs => rs.id === id)
      if (!ruleSet) return
      
      const newName = `${ruleSet.name} (Copy)`
      await duplicateRuleSet({ id, newName })
    } catch (error) {
      console.error('Error duplicating rule set:', error)
    }
  }

  // Quick actions
  const quickActions = [
    {
      title: 'Create Rule Set',
      description: 'Create a new scan rule set',
      icon: Plus,
      action: () => setShowCreateModal(true),
      color: 'bg-blue-500',
    },
    {
      title: 'Execute All',
      description: 'Execute all active rule sets',
      icon: Play,
      action: async () => {
        const activeRuleSets = ruleSets?.filter(rs => rs.success_rate && rs.success_rate > 80) || []
        for (const ruleSet of activeRuleSets) {
          await executeRuleSet(ruleSet.id)
        }
        toast.success(`Executed ${activeRuleSets.length} rule sets`)
      },
      color: 'bg-green-500',
    },
    {
      title: 'System Health',
      description: 'View system health dashboard',
      icon: Activity,
      action: () => setActiveTab('analytics'),
      color: 'bg-purple-500',
    },
    {
      title: 'Workflows',
      description: 'Manage scan workflows',
      icon: Workflow,
      action: () => setActiveTab('workflows'),
      color: 'bg-orange-500',
    },
  ]

  if (error) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load scan rule sets. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan Rule Sets</h1>
            <p className="text-sm text-gray-600">
              Manage and monitor scan rule sets for data discovery and classification
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTimeUpdates}
              className={realTimeUpdates ? 'bg-green-50 border-green-200' : ''}
            >
              {realTimeUpdates ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              {realTimeUpdates ? 'Live' : 'Offline'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule Set
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {alerts.filter(a => !a.acknowledged).length} active alerts
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAlerts}
                className="text-red-600 hover:text-red-800"
              >
                Clear All
              </Button>
            </div>
          </div>
          <ScrollArea className="h-20 mt-2">
            <div className="flex space-x-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className="w-80">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {alert.message}
                  </AlertDescription>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {insights.length} AI insights available
              </span>
            </div>
          </div>
          <ScrollArea className="h-20 mt-2">
            <div className="flex space-x-2">
              {insights.slice(0, 3).map((insight) => (
                <Card key={insight.id} className="w-80">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                      <Badge variant={insight.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {insight.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex space-x-2">
                      {insight.recommendations.slice(0, 1).map((rec, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => applyInsightRecommendation(insight.id, index)}
                        >
                          Apply
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* System Health Dashboard */}
      {systemHealth && (
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Progress value={systemHealth.score} className="flex-1" />
                  <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.score}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Rule Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.metrics.totalRuleSets}</div>
                <p className="text-xs text-gray-600">Active: {systemHealth.metrics.activeRuleSets}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.metrics.averageSuccessRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Average across all rule sets</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.metrics.totalScans}</div>
                <p className="text-xs text-gray-600">Last 30 days: {systemHealth.metrics.recentScans}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{action.title}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rule-sets">Rule Sets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Rule Sets Tab */}
          <TabsContent value="rule-sets" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scan Rule Sets</CardTitle>
                <CardDescription>
                  Manage and monitor your scan rule sets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search rule sets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dataSource">Data Source</Label>
                    <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Data Sources</SelectItem>
                        {crossGroupData.dataSources.map((ds) => (
                          <SelectItem key={ds.id} value={ds.name}>
                            {ds.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <ScanRuleSetList
                    ruleSets={filteredRuleSets}
                    onEdit={(id) => {
                      setSelectedRuleSet(id)
                      setShowEditModal(true)
                    }}
                    onDelete={handleDeleteRuleSet}
                    onExecute={handleExecuteRuleSet}
                    onDuplicate={handleDuplicateRuleSet}
                    onViewDetails={(id) => {
                      setSelectedRuleSet(id)
                      setShowDetails(true)
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceMetrics ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Success Rate Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Excellent (95%+)</span>
                            <span className="font-medium">{performanceMetrics.successRateDistribution.excellent}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Good (80-94%)</span>
                            <span className="font-medium">{performanceMetrics.successRateDistribution.good}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Fair (60-79%)</span>
                            <span className="font-medium">{performanceMetrics.successRateDistribution.fair}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Poor (<60%)</span>
                            <span className="font-medium">{performanceMetrics.successRateDistribution.poor}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Performers</h4>
                        <div className="space-y-2">
                          {performanceMetrics.topPerformers.map((performer) => (
                            <div key={performer.rule_set_id} className="flex justify-between items-center">
                              <span className="text-sm">{performer.name}</span>
                              <Badge variant="outline">{performer.success_rate.toFixed(1)}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No performance data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Usage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceMetrics?.usageTrends ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Daily Scan Activity</h4>
                        <div className="space-y-2">
                          {performanceMetrics.usageTrends.slice(-7).map((trend) => (
                            <div key={trend.date} className="flex justify-between items-center">
                              <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                              <span className="text-sm font-medium">{trend.scan_count} scans</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Workflow className="h-5 w-5 mr-2" />
                  Active Workflows
                </CardTitle>
                <CardDescription>
                  Monitor and manage scan execution workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflows.length > 0 ? (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <Card key={workflow.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{workflow.name}</CardTitle>
                            <Badge variant={
                              workflow.status === 'completed' ? 'default' :
                              workflow.status === 'running' ? 'secondary' :
                              workflow.status === 'failed' ? 'destructive' : 'outline'
                            }>
                              {workflow.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {workflow.steps.map((step) => (
                              <div key={step.id} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  step.status === 'completed' ? 'bg-green-500' :
                                  step.status === 'running' ? 'bg-blue-500' :
                                  step.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                                }`} />
                                <span className="text-sm">{step.name}</span>
                                {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {step.status === 'running' && <Clock className="h-4 w-4 text-blue-500" />}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active workflows
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription>
                  Generate and view comprehensive reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Performance Report</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Detailed analysis of rule set performance metrics
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium">Compliance Report</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Compliance status and audit trail
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium">Usage Report</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Usage patterns and optimization recommendations
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ScanRuleSetCreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRuleSet}
          dataSources={crossGroupData.dataSources}
        />
      )}

      {showEditModal && selectedRuleSet && (
        <ScanRuleSetEditModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRuleSet(null)
          }}
          onSubmit={(data) => handleUpdateRuleSet(selectedRuleSet, data)}
          ruleSet={ruleSets?.find(rs => rs.id === selectedRuleSet)}
          dataSources={crossGroupData.dataSources}
        />
      )}

      {showDetails && selectedRuleSet && (
        <ScanRuleSetDetails
          open={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedRuleSet(null)
          }}
          ruleSetId={selectedRuleSet}
        />
      )}
    </div>
  )
}