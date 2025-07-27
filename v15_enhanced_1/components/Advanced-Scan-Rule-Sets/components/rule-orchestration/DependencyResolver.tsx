"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search,
  GitBranch,
  Link,
  Unlink,
  Settings,
  Info,
  Clock,
  Activity,
  Zap,
  Target,
  Network
} from "lucide-react"
import { useOrchestration } from "../../hooks/useOrchestration"
import { DependencyGraph } from "./DependencyGraph"
import { DependencyTable } from "./DependencyTable"
import { CircularProgress } from "@/components/ui/circular-progress"

interface DependencyResolverProps {
  ruleSetId?: number
  className?: string
}

export function DependencyResolver({ ruleSetId, className }: DependencyResolverProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionResults, setResolutionResults] = useState<any>(null)
  const [autoResolve, setAutoResolve] = useState(false)
  const [conflictResolution, setConflictResolution] = useState("auto")

  const {
    dependencies,
    resolveDependencies,
    validateDependencies,
    getDependencyGraph,
    analyzeConflicts,
    autoResolveConflicts,
    isLoading,
    error
  } = useOrchestration()

  const handleResolveDependencies = useCallback(async () => {
    if (!ruleSetId) return
    
    setIsResolving(true)
    try {
      const results = await resolveDependencies(ruleSetId, {
        autoResolve,
        conflictResolution,
        validateBeforeResolve: true
      })
      setResolutionResults(results)
    } catch (err) {
      console.error("Failed to resolve dependencies:", err)
    } finally {
      setIsResolving(false)
    }
  }, [ruleSetId, resolveDependencies, autoResolve, conflictResolution])

  const handleValidateDependencies = useCallback(async () => {
    if (!ruleSetId) return
    
    try {
      const validation = await validateDependencies(ruleSetId)
      console.log("Dependency validation:", validation)
    } catch (err) {
      console.error("Failed to validate dependencies:", err)
    }
  }, [ruleSetId, validateDependencies])

  const handleAnalyzeConflicts = useCallback(async () => {
    if (!ruleSetId) return
    
    try {
      const conflicts = await analyzeConflicts(ruleSetId)
      console.log("Dependency conflicts:", conflicts)
    } catch (err) {
      console.error("Failed to analyze conflicts:", err)
    }
  }, [ruleSetId, analyzeConflicts])

  const filteredDependencies = dependencies?.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dep.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || dep.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const resolvedCount = dependencies?.filter(d => d.status === "resolved").length || 0
  const conflictCount = dependencies?.filter(d => d.status === "conflict").length || 0
  const pendingCount = dependencies?.filter(d => d.status === "pending").length || 0

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Dependency Resolver
              </CardTitle>
              <CardDescription>
                Advanced dependency management and conflict resolution for scan rule orchestration
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeConflicts}
                disabled={isLoading}
              >
                <Target className="h-4 w-4 mr-2" />
                Analyze Conflicts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidateDependencies}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4 mr-2" />
                Validate
              </Button>
              <Button
                onClick={handleResolveDependencies}
                disabled={isLoading || isResolving}
              >
                {isResolving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Resolve Dependencies
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="graph">Dependency Graph</TabsTrigger>
              <TabsTrigger value="table">Dependencies</TabsTrigger>
              <TabsTrigger value="resolution">Resolution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total Dependencies</p>
                        <p className="text-2xl font-bold">{dependencies?.length || 0}</p>
                      </div>
                      <GitBranch className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Conflicts</p>
                        <p className="text-2xl font-bold text-red-600">{conflictCount}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {dependencies && dependencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resolution Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {resolvedCount} of {dependencies.length} resolved
                        </span>
                      </div>
                      <Progress 
                        value={(resolvedCount / dependencies.length) * 100} 
                        className="h-2" 
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {((resolvedCount / dependencies.length) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">
                            {((conflictCount / dependencies.length) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Conflicts</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {((pendingCount / dependencies.length) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {resolutionResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resolution Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Resolved: {resolutionResults.resolved || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Failed: {resolutionResults.failed || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Pending: {resolutionResults.pending || 0}</span>
                      </div>
                      {resolutionResults.performance && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span>Resolution Time: {resolutionResults.performance.duration}ms</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="graph" className="space-y-4">
              <DependencyGraph dependencies={dependencies || []} />
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search dependencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="conflict">Conflict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DependencyTable dependencies={filteredDependencies} />
            </TabsContent>

            <TabsContent value="resolution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoResolve"
                        checked={autoResolve}
                        onChange={(e) => setAutoResolve(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="autoResolve">Auto-resolve conflicts</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Conflict Resolution Strategy</Label>
                      <Select value={conflictResolution} onValueChange={setConflictResolution}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatic</SelectItem>
                          <SelectItem value="manual">Manual Review</SelectItem>
                          <SelectItem value="priority">Priority-based</SelectItem>
                          <SelectItem value="latest">Latest Version</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {resolutionResults?.history?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === "success" ? "bg-green-500" :
                            item.status === "error" ? "bg-red-500" : "bg-yellow-500"
                          }`} />
                          <span className="text-sm">{item.message}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}