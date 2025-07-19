"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Users, 
  Zap,
  Play,
  Square,
  BarChart3,
  Shield,
  Target,
  Timer,
  FileText,
  AlertCircle
} from "lucide-react"
import { useEnterpriseScanSystem } from "./hooks/use-enterprise-scan-system"
import { cn } from "@/lib/utils"

interface ScanMonitoringDashboardProps {
  className?: string
}

export function ScanMonitoringDashboard({ className }: ScanMonitoringDashboardProps) {
  const {
    // Data
    activeRuns,
    metrics,
    analytics,
    statistics,
    realTimeUpdates,
    isRealTimeEnabled,
    
    // Loading states
    loading,
    activeRunsLoading,
    analyticsLoading,
    
    // Error states
    error,
    activeRunsError,
    analyticsError,
    
    // Actions
    cancelScan,
    toggleRealTime,
    clearRealTimeUpdates,
    refreshData,
    clearError,
    
    // Mutation states
    isCancellingScan
  } = useEnterpriseScanSystem()

  const [selectedTab, setSelectedTab] = useState("overview")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, refreshData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600000)
    const minutes = Math.floor((duration % 3600000) / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading monitoring dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scan Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics for data scanning operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealTime}
            className={cn(isRealTimeEnabled && "bg-green-50 border-green-200")}
          >
            {isRealTimeEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isRealTimeEnabled ? "Real-time ON" : "Real-time OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" size="sm" onClick={clearError} className="ml-2 p-0 h-auto">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeScans}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeScans > 0 ? "Currently running" : "No active scans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedScans} of {metrics.totalScans} scans completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalIssues} total issues detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.avgScanDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Average scan completion time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-runs">Active Runs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="real-time">Real-time Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Active Scans Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Active Scans</span>
                  <Badge variant="secondary">{activeRuns.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Currently running scan operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeRunsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : activeRuns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active scans</p>
                    <p className="text-sm">All scan operations are idle</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activeRuns.slice(0, 5).map((run) => (
                        <div key={run.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className={cn("w-3 h-3 rounded-full", getStatusColor(run.status))} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{run.scanName}</p>
                            <p className="text-xs text-muted-foreground">
                              {run.dataSourceName} • Started {formatTimestamp(run.startTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{run.progress}%</p>
                            <Progress value={run.progress} className="w-16 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest scan operations and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {realTimeUpdates.slice(0, 10).map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 border rounded">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {update.type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(update.timestamp)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {JSON.stringify(update.data)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active-runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Scan Runs</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{activeRuns.length} Active</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={cn(autoRefresh && "bg-green-50 border-green-200")}
                  >
                    <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
                    Auto-refresh
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Monitor and manage currently running scan operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeRunsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : activeRuns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Active Scans</h3>
                  <p>All scan operations are currently idle or completed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRuns.map((run) => (
                    <Card key={run.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold">{run.scanName}</h3>
                              <Badge variant="secondary">{run.status}</Badge>
                              <Badge variant="outline">{run.dataSourceName}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="text-lg font-semibold">{run.progress}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Entities Scanned</p>
                                <p className="text-lg font-semibold">{run.entitiesScanned}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Issues Found</p>
                                <p className="text-lg font-semibold">{run.issuesFound}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="text-lg font-semibold">
                                  {run.duration ? formatDuration(run.duration) : "Running..."}
                                </p>
                              </div>
                            </div>

                            <Progress value={run.progress} className="w-full h-3 mb-4" />
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Started: {formatTimestamp(run.startTime)}</span>
                              <span>Triggered by: {run.triggeredBy}</span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelScan(run.id)}
                              disabled={isCancellingScan}
                            >
                              <Square className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Scan Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Scan Statistics</span>
                </CardTitle>
                <CardDescription>
                  Overview of scan performance and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{metrics.totalScans}</p>
                        <p className="text-sm text-muted-foreground">Total Scans</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{metrics.completedScans}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{metrics.failedScans}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{metrics.dataSourcesScanned}</p>
                        <p className="text-sm text-muted-foreground">Data Sources</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="text-sm font-medium">{metrics.successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.successRate} className="w-full" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Duration</span>
                        <span className="text-sm font-medium">{formatDuration(metrics.avgScanDuration)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Issue Distribution</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of detected issues by severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="text-sm">Critical</span>
                      </div>
                      <Badge variant="destructive">{metrics.criticalIssues}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm">High</span>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {metrics.highIssues}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Medium</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {metrics.mediumIssues}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Low</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {metrics.lowIssues}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.totalIssues}</p>
                    <p className="text-sm text-muted-foreground">Total Issues Detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="real-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-time Updates</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{realTimeUpdates.length} Updates</Badge>
                  <Button variant="outline" size="sm" onClick={clearRealTimeUpdates}>
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Live feed of scan operations and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {realTimeUpdates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Real-time Updates</h3>
                      <p>Updates will appear here as scan operations progress</p>
                    </div>
                  ) : (
                    realTimeUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                        <div className={cn(
                          "w-3 h-3 rounded-full mt-2",
                          update.type === 'scan_progress' && "bg-blue-500",
                          update.type === 'scan_completed' && "bg-green-500",
                          update.type === 'scan_failed' && "bg-red-500",
                          update.type === 'issue_detected' && "bg-orange-500",
                          update.type === 'schedule_triggered' && "bg-purple-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              {update.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatTimestamp(update.timestamp)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {JSON.stringify(update.data, null, 2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}