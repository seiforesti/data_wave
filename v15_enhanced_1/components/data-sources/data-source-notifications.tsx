"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, AlertTriangle, CheckCircle, Info, X, Plus, Settings, Filter } from "lucide-react"

import { useNotificationsQuery } from "./services/apis"
import { DataSource } from "./types"

interface NotificationsProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string
  read: boolean
  category: string
  actionRequired?: boolean
}

export function DataSourceNotifications({
  dataSource,
  onNavigateToComponent,
  className = ""}: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [showSettings, setShowSettings] = useState(false)

  const { data: notificationData, isLoading, error, refetch } = useNotificationsQuery()

  // Mock data
  const mockNotifications: Notification[] = useMemo(() => ([
    {
      id: "1",
      title: "Backup Completed Successfully",
      message: "Full backup of production database completed at 2:00AM",
      type: "success",
      priority: "low",
      createdAt: "2024-01-01T02:00:00.000Z",
      read: false,
      category: "backup"
    },
    {
      id: "2",
      title: "High CPU Usage Detected",
      message: "CPU usage has exceeded 80% in the last 10 minutes",
      type: "warning",
      priority: "high",
      createdAt: "2024-01-01T02:30:00.000Z",
      read: false,
      category: "performance"
    },
    {
      id: "3",
      title: "Connection Timeout Error",
      message: "Database connection timeout occurred during peak hours",
      type: "error",
      priority: "critical",
      createdAt: "2024-01-01T02:15:00.000Z",
      read: true,
      category: "connectivity"
    }
  ]), [])

  useEffect(() => {
    setNotifications(mockNotifications)
  }, [mockNotifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = filterType === "all" || notification.type === filterType
      const matchesPriority = filterPriority === "all" || notification.priority === filterPriority
      return matchesType && matchesPriority
    })
  }, [notifications, filterType, filterPriority])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600 bg-green-50"
      case "warning": return "text-yellow-600 bg-yellow-50"
      case "error": return "text-red-600"
      case "info": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50"
      case "high": return "text-orange-600 bg-orange-50"
      case "medium": return "text-yellow-600 bg-yellow-50"
      case "low": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4" />
      case "warning": return <AlertTriangle className="h-4 w-4" />
      case "error": return <X className="h-4 w-4" />
      case "info": return <Info className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 text-blue-600" />
            Notifications
          </h2>
          <p className="text-muted-foreground">
            Manage alerts and notifications for {dataSource.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => n.priority === "critical").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => 
              new Date(n.createdAt).toDateString() === new Date().toDateString()
            ).length}</div>
            <p className="text-xs text-muted-foreground mt-1">New notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            View and manage system notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 ${notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="font-medium">{notification.title}</h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <Badge variant="default" className="bg-blue-600">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      <span>{notification.category}</span>
                      {notification.actionRequired && (
                        <span className="text-red-600">Action Required</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure notification preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Notifications</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Critical alerts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Performance warnings</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Backup notifications</span>
                </label>
              </div>
            </div>
            <div>
              <Label>In-App Notifications</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Show notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Sound alerts</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}