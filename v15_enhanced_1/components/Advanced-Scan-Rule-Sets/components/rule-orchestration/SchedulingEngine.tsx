"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useOrchestration } from "../../hooks/useOrchestration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  CalendarPlus,
  CalendarMinus,
  CalendarEdit,
  CalendarSearch,
  CalendarHeart,
  CalendarStar,
  CalendarUser,
  CalendarSettings,
  CalendarCog,
  CalendarKey,
  CalendarLock,
  CalendarUnlock,
  CalendarShield,
  CalendarAlert,
  CalendarInfo,
  CalendarHelp,
  CalendarQuestion,
  CalendarWarning,
  CalendarError,
  CalendarSuccess,
  CalendarPending,
  CalendarRunning,
  CalendarCompleted,
  CalendarFailed,
  CalendarCancelled,
  CalendarScheduled,
  CalendarOverdue,
  CalendarDue,
  CalendarUpcoming,
  CalendarPast,
  CalendarToday,
  CalendarTomorrow,
  CalendarYesterday,
  CalendarWeek,
  CalendarMonth,
  CalendarYear,
  CalendarQuarter,
  CalendarSemester,
  CalendarTrimester,
  CalendarBimester,
  CalendarAnnually,
  CalendarBiannually,
  CalendarQuarterly,
  CalendarMonthly,
  CalendarWeekly,
  CalendarDaily,
  CalendarHourly,
  CalendarMinutely,
  CalendarSecondly,
  CalendarCustom,
  CalendarAdvanced,
  CalendarExpert,
  CalendarProfessional,
  CalendarEnterprise,
  CalendarUltimate,
  CalendarPremium,
  CalendarPro,
  CalendarBasic,
  CalendarStarter,
  CalendarFree,
  CalendarTrial,
  CalendarDemo,
  CalendarTest,
  CalendarDev,
  CalendarStaging,
  CalendarProduction,
  CalendarLive,
  CalendarBeta,
  CalendarAlpha,
  CalendarRC,
  CalendarRelease,
  CalendarSnapshot,
  CalendarNightly,
  CalendarWeekly,
  CalendarDaily,
  CalendarHourly,
  CalendarMinutely,
  CalendarSecondly,
  CalendarCustom,
  CalendarAdvanced,
  CalendarExpert,
  CalendarProfessional,
  CalendarEnterprise,
  CalendarUltimate,
  CalendarPremium,
  CalendarPro,
  CalendarBasic,
  CalendarStarter,
  CalendarFree,
  CalendarTrial,
  CalendarDemo,
  CalendarTest,
  CalendarDev,
  CalendarStaging,
  CalendarProduction,
  CalendarLive,
  CalendarBeta,
  CalendarAlpha,
  CalendarRC,
  CalendarRelease,
  CalendarSnapshot,
  CalendarNightly,
} from "lucide-react"

interface SchedulingEngineProps {
  ruleSetId?: number
  embedded?: boolean
}

interface Schedule {
  id: string
  name: string
  description: string
  enabled: boolean
  cronExpression: string
  timezone: string
  nextRun: string
  lastRun?: string
  status: "active" | "paused" | "stopped" | "error"
  priority: "low" | "medium" | "high" | "critical"
  retryCount: number
  maxRetries: number
  timeout: number
  dependencies: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface ScheduleExecution {
  id: string
  scheduleId: string
  ruleSetId: number
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  result?: any
  error?: string
  retryCount: number
}

interface CronExpression {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export const SchedulingEngine: React.FC<SchedulingEngineProps> = ({
  ruleSetId,
  embedded = false,
}) => {
  // State management
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [executions, setExecutions] = useState<ScheduleExecution[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showExecutionDialog, setShowExecutionDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("schedules")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("nextRun")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cronExpression: "0 0 * * *",
    timezone: "UTC",
    priority: "medium" as const,
    retryCount: 3,
    timeout: 3600,
    dependencies: [] as string[],
    tags: [] as string[],
  })

  // Cron expression builder state
  const [cronBuilder, setCronBuilder] = useState<CronExpression>({
    minute: "0",
    hour: "0",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  })

  // Hooks
  const { getSchedules, createSchedule, updateSchedule, deleteSchedule, executeSchedule } = useOrchestration()

  // Effects
  useEffect(() => {
    loadSchedules()
  }, [ruleSetId])

  useEffect(() => {
    if (activeTab === "executions") {
      loadExecutions()
    }
  }, [activeTab, selectedSchedule])

  // Helper functions
  const loadSchedules = async () => {
    setLoading(true)
    try {
      const result = await getSchedules(ruleSetId)
      setSchedules(result.schedules || [])
    } catch (error) {
      console.error("Error loading schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadExecutions = async () => {
    if (!selectedSchedule) return
    setLoading(true)
    try {
      const result = await getSchedules(selectedSchedule.id)
      setExecutions(result.executions || [])
    } catch (error) {
      console.error("Error loading executions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async () => {
    setLoading(true)
    try {
      const newSchedule = await createSchedule({
        ...formData,
        ruleSetId: ruleSetId || 0,
      })
      setSchedules(prev => [...prev, newSchedule])
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error creating schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return
    setLoading(true)
    try {
      const updatedSchedule = await updateSchedule(selectedSchedule.id, formData)
      setSchedules(prev => prev.map(s => s.id === selectedSchedule.id ? updatedSchedule : s))
      setShowEditDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error updating schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    setLoading(true)
    try {
      await deleteSchedule(scheduleId)
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    } catch (error) {
      console.error("Error deleting schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteSchedule = async (scheduleId: string) => {
    setLoading(true)
    try {
      await executeSchedule(scheduleId)
      await loadExecutions()
    } catch (error) {
      console.error("Error executing schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cronExpression: "0 0 * * *",
      timezone: "UTC",
      priority: "medium",
      retryCount: 3,
      timeout: 3600,
      dependencies: [],
      tags: [],
    })
    setCronBuilder({
      minute: "0",
      hour: "0",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    })
  }

  const buildCronExpression = (cron: CronExpression): string => {
    return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`
  }

  const parseCronExpression = (cron: string): CronExpression => {
    const parts = cron.split(" ")
    return {
      minute: parts[0] || "*",
      hour: parts[1] || "*",
      dayOfMonth: parts[2] || "*",
      month: parts[3] || "*",
      dayOfWeek: parts[4] || "*",
    }
  }

  const getNextRunTime = (cron: string, timezone: string): string => {
    // This would integrate with a cron library to calculate next run time
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CalendarCheck className="h-4 w-4 text-green-500" />
      case "paused": return <CalendarPause className="h-4 w-4 text-yellow-500" />
      case "stopped": return <CalendarX className="h-4 w-4 text-red-500" />
      case "error": return <CalendarAlert className="h-4 w-4 text-red-500" />
      default: return <CalendarClock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredSchedules = useMemo(() => {
    let filtered = schedules

    if (filter !== "all") {
      filtered = filtered.filter(s => s.status === filter)
    }

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Schedule]
      const bValue = b[sortBy as keyof Schedule]
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [schedules, filter, searchQuery, sortBy, sortOrder])

  // Render functions
  const renderScheduleCard = (schedule: Schedule) => (
    <Card key={schedule.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(schedule.status)}
            <CardTitle className="text-lg">{schedule.name}</CardTitle>
            <Badge className={getPriorityColor(schedule.priority)}>
              {schedule.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedSchedule(schedule)
                setFormData({
                  name: schedule.name,
                  description: schedule.description,
                  cronExpression: schedule.cronExpression,
                  timezone: schedule.timezone,
                  priority: schedule.priority,
                  retryCount: schedule.retryCount,
                  timeout: schedule.timeout,
                  dependencies: schedule.dependencies,
                  tags: schedule.tags,
                })
                setCronBuilder(parseCronExpression(schedule.cronExpression))
                setShowEditDialog(true)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExecuteSchedule(schedule.id)}>
                <Play className="h-4 w-4 mr-2" />
                Execute Now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteSchedule(schedule.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{schedule.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cron Expression:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {schedule.cronExpression}
            </code>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timezone:</span>
            <span>{schedule.timezone}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next Run:</span>
            <span>{new Date(schedule.nextRun).toLocaleString()}</span>
          </div>
          {schedule.lastRun && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Run:</span>
              <span>{new Date(schedule.lastRun).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {schedule.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCronBuilder = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        <div>
          <label className="text-sm font-medium">Minute</label>
          <Input
            value={cronBuilder.minute}
            onChange={(e) => {
              setCronBuilder(prev => ({ ...prev, minute: e.target.value }))
              setFormData(prev => ({ 
                ...prev, 
                cronExpression: buildCronExpression({ ...cronBuilder, minute: e.target.value })
              }))
            }}
            placeholder="0-59"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Hour</label>
          <Input
            value={cronBuilder.hour}
            onChange={(e) => {
              setCronBuilder(prev => ({ ...prev, hour: e.target.value }))
              setFormData(prev => ({ 
                ...prev, 
                cronExpression: buildCronExpression({ ...cronBuilder, hour: e.target.value })
              }))
            }}
            placeholder="0-23"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Day of Month</label>
          <Input
            value={cronBuilder.dayOfMonth}
            onChange={(e) => {
              setCronBuilder(prev => ({ ...prev, dayOfMonth: e.target.value }))
              setFormData(prev => ({ 
                ...prev, 
                cronExpression: buildCronExpression({ ...cronBuilder, dayOfMonth: e.target.value })
              }))
            }}
            placeholder="1-31"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Month</label>
          <Input
            value={cronBuilder.month}
            onChange={(e) => {
              setCronBuilder(prev => ({ ...prev, month: e.target.value }))
              setFormData(prev => ({ 
                ...prev, 
                cronExpression: buildCronExpression({ ...cronBuilder, month: e.target.value })
              }))
            }}
            placeholder="1-12"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Day of Week</label>
          <Input
            value={cronBuilder.dayOfWeek}
            onChange={(e) => {
              setCronBuilder(prev => ({ ...prev, dayOfWeek: e.target.value }))
              setFormData(prev => ({ 
                ...prev, 
                cronExpression: buildCronExpression({ ...cronBuilder, dayOfWeek: e.target.value })
              }))
            }}
            placeholder="0-6"
          />
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <div className="text-sm font-medium">Generated Expression:</div>
        <code className="text-lg font-mono">{formData.cronExpression}</code>
      </div>
    </div>
  )

  const renderScheduleForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter schedule name"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter schedule description"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Cron Expression</label>
        {renderCronBuilder()}
      </div>
      <div>
        <label className="text-sm font-medium">Timezone</label>
        <Select
          value={formData.timezone}
          onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            <SelectItem value="Europe/London">London</SelectItem>
            <SelectItem value="Europe/Paris">Paris</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high" | "critical") => 
              setFormData(prev => ({ ...prev, priority: value }))
            }
          >
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
        <div>
          <label className="text-sm font-medium">Max Retries</label>
          <Input
            type="number"
            value={formData.retryCount}
            onChange={(e) => setFormData(prev => ({ ...prev, retryCount: parseInt(e.target.value) }))}
            min="0"
            max="10"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Timeout (seconds)</label>
        <Input
          type="number"
          value={formData.timeout}
          onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
          min="60"
          max="86400"
        />
      </div>
    </div>
  )

  return (
    <div className={`space-y-4 ${embedded ? "p-0" : "p-6"}`}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Scheduling Engine</h1>
              <p className="text-muted-foreground">
                Advanced scheduling and execution management for scan rule sets
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Executions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextRun">Next Run</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>

          {/* Schedules Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map(renderScheduleCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {/* Executions List */}
          <div className="space-y-2">
            {executions.map(execution => (
              <Card key={execution.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={execution.status === "completed" ? "default" : "secondary"}>
                        {execution.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        Execution {execution.id}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.startTime).toLocaleString()}
                    </div>
                  </div>
                  {execution.duration && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Duration: {execution.duration}ms
                    </div>
                  )}
                  {execution.error && (
                    <Alert className="mt-2">
                      <AlertDescription>{execution.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Schedule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Configure a new schedule for scan rule set execution
            </DialogDescription>
          </DialogHeader>
          {renderScheduleForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule} disabled={loading}>
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Modify the schedule configuration
            </DialogDescription>
          </DialogHeader>
          {renderScheduleForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule} disabled={loading}>
              {loading ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}