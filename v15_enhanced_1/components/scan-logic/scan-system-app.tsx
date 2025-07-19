"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Plus, 
  Pause, 
  Calendar, 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Monitor,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react"
import { useEnterpriseScanSystem } from "./hooks/use-enterprise-scan-system"
import { ScanList } from "./scan-list"
import { ScanCreateModal } from "./scan-create-modal"
import { ScanScheduleList } from "./scan-schedule-list"
import { ScanDetails } from "./scan-details"
import { ScanMonitoringDashboard } from "./scan-monitoring-dashboard"

export function ScanSystemApp() {
  const {
    // Data
    scanConfigs,
    scanRuns,
    scanSchedules,
    activeRuns,
    metrics,
    analytics,
    statistics,
    realTimeUpdates,
    isRealTimeEnabled,
    
    // Loading states
    loading,
    scanConfigsLoading,
    scanRunsLoading,
    scanSchedulesLoading,
    
    // Error states
    error,
    scanConfigsError,
    scanRunsError,
    scanSchedulesError,
    
    // Actions
    createScan,
    updateScan,
    deleteScan,
    runScan,
    cancelScan,
    updateSchedule,
    refreshData,
    clearError,
    toggleRealTime,
    
    // Mutation states
    isCreatingScan,
    isUpdatingScan,
    isDeletingScan,
    isRunningScan,
    isCancellingScan
  } = useEnterpriseScanSystem()

  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedScanRun, setSelectedScanRun] = useState<string | null>(null)
  const [showMonitoring, setShowMonitoring] = useState(false)

  // Calculate enhanced statistics
  const stats = {
    totalScans: scanConfigs.length,
    activeScans: scanConfigs.filter((s) => s.status === "active").length,
    runningScans: activeRuns.length,
    scheduledScans: scanSchedules.filter((s) => s.enabled).length,
    recentIssues: metrics.totalIssues,
    successRate: metrics.successRate,
    avgDuration: metrics.avgScanDuration,
    criticalIssues: metrics.criticalIssues
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span>Loading scan system...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" size="sm" onClick={clearError} className="ml-2 p-0 h-auto">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (selectedScanRun) {
    return <ScanDetails runId={selectedScanRun} onBack={() => setSelectedScanRun(null)} />
  }

  if (showMonitoring) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowMonitoring(false)}>
            ← Back to Scan System
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTime}
              className={isRealTimeEnabled ? "bg-green-50 border-green-200" : ""}
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
        <ScanMonitoringDashboard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Scan System</h1>
          <p className="text-muted-foreground">
            Advanced data discovery, governance, and real-time monitoring platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowMonitoring(true)}>
            <Monitor className="h-4 w-4 mr-2" />
            Monitoring Dashboard
          </Button>
          <Button onClick={() => setShowCreateModal(true)} disabled={isCreatingScan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Scan
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeScans} active configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.runningScans}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedScans} of {metrics.totalScans} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentIssues} total issues detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status Bar */}
      {activeRuns.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {activeRuns.length} scan{activeRuns.length > 1 ? 's' : ''} currently running
                  </p>
                  <p className="text-xs text-blue-700">
                    {activeRuns.map(run => run.scanName).join(', ')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMonitoring(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Monitor className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scans, runs, or schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scan Configurations</TabsTrigger>
          <TabsTrigger value="runs">Scan Runs</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                  <Badge variant="secondary">{realTimeUpdates.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Latest scan operations and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {realTimeUpdates.slice(0, 5).map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 border rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {update.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeUpdates.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common scan system operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setShowCreateModal(true)}
                    disabled={isCreatingScan}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Scan Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowMonitoring(true)}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Open Monitoring Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={refreshData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          <ScanList
            scans={scanConfigs.filter(
              (scan) =>
                scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scan.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            onEdit={(scan) => {
              // Handle edit
              console.log("Edit scan:", scan)
            }}
            onDelete={deleteScan}
            onRun={runScan}
            onDuplicate={(scan) => {
              // Handle duplicate
              console.log("Duplicate scan:", scan)
            }}
            loading={scanConfigsLoading}
            isRunningScan={isRunningScan}
            isDeletingScan={isDeletingScan}
          />
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <div className="space-y-4">
            {scanRunsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : scanRuns
              .filter((run) => run.scanName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((run) => (
                <Card key={run.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3" onClick={() => setSelectedScanRun(run.id)}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{run.scanName}</CardTitle>
                        <CardDescription>
                          {run.dataSourceName} • Started {new Date(run.startTime).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            run.status === "completed"
                              ? "default"
                              : run.status === "running"
                              ? "secondary"
                              : run.status === "failed"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {run.status}
                        </Badge>
                        {run.status === "running" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelScan(run.id)
                            }}
                            disabled={isCancellingScan}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <ScanScheduleList
            schedules={scanSchedules.filter(
              (schedule) =>
                schedule.scanName.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            onEdit={(schedule) => {
              // Handle edit
              console.log("Edit schedule:", schedule)
            }}
            onToggle={(schedule) => {
              // Handle toggle
              console.log("Toggle schedule:", schedule)
            }}
            loading={scanSchedulesLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Create Scan Modal */}
      {showCreateModal && (
        <ScanCreateModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={createScan}
          loading={isCreatingScan}
        />
      )}
    </div>
  )
}
