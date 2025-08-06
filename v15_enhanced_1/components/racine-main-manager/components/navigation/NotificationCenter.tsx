'use client'

/**
 * 🔔 NOTIFICATION CENTER COMPONENT
 * 
 * Advanced notification system that aggregates alerts, updates, and messages from all 7 groups
 * with intelligent prioritization, real-time delivery, and comprehensive management features.
 * Surpasses enterprise platforms with AI-powered notification filtering and smart categorization.
 * 
 * Features:
 * - Multi-Group Notification Aggregation: Real-time notifications from all 7 groups
 * - Advanced Notification Management: Read/unread, categories, filtering, bulk actions
 * - Real-Time Delivery System: WebSocket-based updates, push notifications, scheduling
 * - Intelligent Prioritization: AI-powered priority scoring, smart grouping, correlation
 * - Cross-Group Integration: Notification threading, workflow alerts, system-wide alerts
 * 
 * @version 1.0.0
 * @enterprise-grade true
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  BellIcon,
  BellRingIcon,
  BellOffIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  UsersIcon,
  DatabaseIcon,
  SearchIcon,
  FilterIcon,
  SettingsIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ArchiveIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  VolumeXIcon,
  Volume2Icon,
  SendIcon,
  CalendarIcon,
  TagIcon,
  LinkIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from 'lucide-react'

// Types
import type {
  NotificationContext,
  NotificationData,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationFilter,
  NotificationPreferences,
  NotificationRule,
  NotificationTemplate,
  NotificationDelivery,
  CrossGroupNotification,
  SystemNotification,
  UserNotification,
  WorkflowNotification,
  AlertNotification,
  NavigationContext,
  SystemHealth,
  CrossGroupState,
  User,
} from '../../types/racine-core.types'

// Hooks and Services
import {
  useActivityTracker,
  useRacineOrchestration,
  useCrossGroupIntegration,
  useUserManagement,
} from '../../hooks'
import {
  activityTrackingAPI,
  racineOrchestrationAPI,
  crossGroupIntegrationAPI,
} from '../../services'

// Utils and Constants
import {
  formatRelativeTime,
  formatDateTime,
  formatNumber,
  prioritizeNotifications,
  groupNotifications,
  filterNotifications,
  searchNotifications,
} from '../../utils/dashboard-utils'
import {
  NOTIFICATION_CONFIGS,
  CROSS_GROUP_CONFIGS,
  PRIORITY_LEVELS,
  NOTIFICATION_TYPES,
} from '../../constants/cross-group-configs'

// Component Props Interface
interface NotificationCenterProps {
  currentUser: User
  navigationContext: NavigationContext
  systemHealth: SystemHealth
  crossGroupState: CrossGroupState
  isOpen?: boolean
  position?: 'dropdown' | 'sidebar' | 'modal' | 'fullscreen'
  maxNotifications?: number
  autoRefresh?: boolean
  enableRealTime?: boolean
  onNotificationClick?: (notification: NotificationData) => void
  onNotificationAction?: (notificationId: string, action: string) => void
  onClose?: () => void
  className?: string
}

// Notification State Interface
interface NotificationState {
  isLoading: boolean
  error: string | null
  notifications: NotificationData[]
  unreadCount: number
  selectedNotifications: string[]
  filters: NotificationFilter
  searchQuery: string
  selectedCategory: NotificationCategory | 'all'
  selectedPriority: NotificationPriority | 'all'
  sortBy: 'timestamp' | 'priority' | 'category' | 'group'
  sortOrder: 'asc' | 'desc'
  preferences: NotificationPreferences
  isRealTimeEnabled: boolean
  lastRefresh: Date
  expandedNotifications: Set<string>
}

// Notification Categories Configuration
const NOTIFICATION_CATEGORIES = {
  system: {
    label: 'System',
    icon: AlertTriangleIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  workflow: {
    label: 'Workflows',
    icon: PlayIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  data: {
    label: 'Data',
    icon: DatabaseIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  user: {
    label: 'User',
    icon: UserIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  collaboration: {
    label: 'Collaboration',
    icon: UsersIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  security: {
    label: 'Security',
    icon: AlertTriangleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  performance: {
    label: 'Performance',
    icon: ClockIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
}

// Priority Configuration
const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    badge: 'destructive',
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    badge: 'default',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'secondary',
  },
  low: {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    badge: 'outline',
  },
}

/**
 * NotificationCenter Component
 * 
 * Comprehensive notification management system with real-time updates,
 * intelligent filtering, and cross-group integration.
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  navigationContext,
  systemHealth,
  crossGroupState,
  isOpen = false,
  position = 'dropdown',
  maxNotifications = 100,
  autoRefresh = true,
  enableRealTime = true,
  onNotificationClick,
  onNotificationAction,
  onClose,
  className = '',
}) => {
  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // State Management
  const [notificationState, setNotificationState] = useState<NotificationState>({
    isLoading: true,
    error: null,
    notifications: [],
    unreadCount: 0,
    selectedNotifications: [],
    filters: {
      categories: [],
      priorities: [],
      groups: [],
      dateRange: { start: null, end: null },
      readStatus: 'all',
    },
    searchQuery: '',
    selectedCategory: 'all',
    selectedPriority: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    preferences: {
      enableSound: true,
      enableDesktop: true,
      enableEmail: false,
      enableSMS: false,
      quietHours: { start: '22:00', end: '08:00' },
      categories: Object.keys(NOTIFICATION_CATEGORIES),
      autoMarkRead: false,
      groupSimilar: true,
      maxNotifications: maxNotifications,
    },
    isRealTimeEnabled: enableRealTime,
    lastRefresh: new Date(),
    expandedNotifications: new Set(),
  })

  const [selectedView, setSelectedView] = useState<'all' | 'unread' | 'archived' | 'settings'>('all')
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Hooks
  const {
    trackActivity,
    getNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    archiveNotification,
  } = useActivityTracker(currentUser.id, navigationContext)

  const {
    systemNotifications,
    workflowNotifications,
    alertNotifications,
  } = useRacineOrchestration(currentUser.id, {
    isInitialized: true,
    currentView: 'notifications',
    activeWorkspaceId: navigationContext.workspaceId || '',
    layoutMode: 'notification',
    sidebarCollapsed: false,
    loading: false,
    error: null,
    systemHealth,
    lastActivity: new Date(),
    performanceMetrics: {},
  })

  const {
    crossGroupNotifications,
    integrationAlerts,
  } = useCrossGroupIntegration(currentUser.id, crossGroupState)

  // WebSocket connection for real-time notifications
  const initializeWebSocket = useCallback(() => {
    if (!enableRealTime || !isOpen) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000'}/ws/notifications/${currentUser.id}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('Notification WebSocket connected')
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as NotificationData
          handleNewNotification(notification)
        } catch (error) {
          console.error('Failed to parse WebSocket notification:', error)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('Notification WebSocket error:', error)
      }
      
      wsRef.current.onclose = () => {
        console.log('Notification WebSocket disconnected')
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }, [enableRealTime, isOpen, currentUser.id])

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification: NotificationData) => {
    setNotificationState(prev => {
      const updatedNotifications = [notification, ...prev.notifications]
        .slice(0, prev.preferences.maxNotifications)
      
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length
      
      // Play notification sound if enabled
      if (prev.preferences.enableSound && !notification.isRead) {
        playNotificationSound()
      }
      
      // Show desktop notification if enabled
      if (prev.preferences.enableDesktop && !notification.isRead) {
        showDesktopNotification(notification)
      }
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount,
        lastRefresh: new Date(),
      }
    })
    
    // Track notification activity
    trackActivity({
      type: 'notification_received',
      details: {
        notificationId: notification.id,
        category: notification.category,
        priority: notification.priority,
      },
    })
  }, [trackActivity])

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      setNotificationState(prev => ({ ...prev, isLoading: true, error: null }))

      // Parallel loading from all sources
      const [
        userNotifications,
        systemAlerts,
        workflowAlerts,
        crossGroupAlerts,
      ] = await Promise.all([
        getNotifications({
          userId: currentUser.id,
          limit: maxNotifications,
          filters: notificationState.filters,
        }),
        racineOrchestrationAPI.getSystemNotifications({
          userId: currentUser.id,
          includeSystemHealth: true,
        }),
        racineOrchestrationAPI.getWorkflowNotifications({
          userId: currentUser.id,
          workspaceId: navigationContext.workspaceId,
        }),
        crossGroupIntegrationAPI.getCrossGroupNotifications({
          userId: currentUser.id,
          groups: Object.keys(crossGroupState.connectedGroups || {}),
        }),
      ])

      // Merge and prioritize notifications
      const allNotifications = [
        ...userNotifications,
        ...systemAlerts,
        ...workflowAlerts,
        ...crossGroupAlerts,
      ]

      const processedNotifications = prioritizeNotifications(
        allNotifications,
        notificationState.preferences
      )

      const unreadCount = processedNotifications.filter(n => !n.isRead).length

      setNotificationState(prev => ({
        ...prev,
        isLoading: false,
        notifications: processedNotifications,
        unreadCount,
        lastRefresh: new Date(),
      }))

    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotificationState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      }))
    }
  }, [
    currentUser.id,
    maxNotifications,
    notificationState.filters,
    navigationContext.workspaceId,
    crossGroupState.connectedGroups,
    getNotifications,
  ])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore audio play errors (e.g., user hasn't interacted with page yet)
        })
      } catch (error) {
        // Ignore audio errors
      }
    }
  }, [])

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
      })
      
      desktopNotification.onclick = () => {
        window.focus()
        if (onNotificationClick) {
          onNotificationClick(notification)
        }
        desktopNotification.close()
      }
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        desktopNotification.close()
      }, 5000)
    }
  }, [onNotificationClick])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notificationState.notifications]

    // Apply view filter
    switch (selectedView) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead)
        break
      case 'archived':
        filtered = filtered.filter(n => n.isArchived)
        break
      case 'all':
        filtered = filtered.filter(n => !n.isArchived)
        break
    }

    // Apply category filter
    if (notificationState.selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === notificationState.selectedCategory)
    }

    // Apply priority filter
    if (notificationState.selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === notificationState.selectedPriority)
    }

    // Apply search filter
    if (notificationState.searchQuery) {
      const query = notificationState.searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.group?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (notificationState.sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'group':
          comparison = (a.group || '').localeCompare(b.group || '')
          break
      }
      
      return notificationState.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [
    notificationState.notifications,
    notificationState.selectedCategory,
    notificationState.selectedPriority,
    notificationState.searchQuery,
    notificationState.sortBy,
    notificationState.sortOrder,
    selectedView,
  ])

  // Notification actions
  const handleNotificationClick = useCallback((notification: NotificationData) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead([notification.id])
    }
    
    // Expand/collapse notification
    setNotificationState(prev => {
      const newExpanded = new Set(prev.expandedNotifications)
      if (newExpanded.has(notification.id)) {
        newExpanded.delete(notification.id)
      } else {
        newExpanded.add(notification.id)
      }
      return { ...prev, expandedNotifications: newExpanded }
    })
    
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }, [onNotificationClick])

  const handleMarkAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await Promise.all(notificationIds.map(id => markAsRead(id)))
      
      setNotificationState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        ),
        unreadCount: prev.unreadCount - notificationIds.length,
        selectedNotifications: prev.selectedNotifications.filter(id => !notificationIds.includes(id)),
      }))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }, [markAsRead])

  const handleMarkAsUnread = useCallback(async (notificationIds: string[]) => {
    try {
      await Promise.all(notificationIds.map(id => markAsUnread(id)))
      
      setNotificationState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          notificationIds.includes(n.id) ? { ...n, isRead: false } : n
        ),
        unreadCount: prev.unreadCount + notificationIds.length,
        selectedNotifications: prev.selectedNotifications.filter(id => !notificationIds.includes(id)),
      }))
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error)
    }
  }, [markAsUnread])

  const handleArchive = useCallback(async (notificationIds: string[]) => {
    try {
      await Promise.all(notificationIds.map(id => archiveNotification(id)))
      
      setNotificationState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          notificationIds.includes(n.id) ? { ...n, isArchived: true } : n
        ),
        selectedNotifications: prev.selectedNotifications.filter(id => !notificationIds.includes(id)),
      }))
    } catch (error) {
      console.error('Failed to archive notifications:', error)
    }
  }, [archiveNotification])

  const handleDelete = useCallback(async (notificationIds: string[]) => {
    try {
      await Promise.all(notificationIds.map(id => deleteNotification(id)))
      
      setNotificationState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => !notificationIds.includes(n.id)),
        unreadCount: prev.unreadCount - notificationIds.filter(id => {
          const notification = prev.notifications.find(n => n.id === id)
          return notification && !notification.isRead
        }).length,
        selectedNotifications: prev.selectedNotifications.filter(id => !notificationIds.includes(id)),
      }))
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    }
  }, [deleteNotification])

  const handleSelectNotification = useCallback((notificationId: string, selected: boolean) => {
    setNotificationState(prev => ({
      ...prev,
      selectedNotifications: selected
        ? [...prev.selectedNotifications, notificationId]
        : prev.selectedNotifications.filter(id => id !== notificationId),
    }))
  }, [])

  const handleSelectAll = useCallback(() => {
    const allIds = filteredNotifications.map(n => n.id)
    setNotificationState(prev => ({
      ...prev,
      selectedNotifications: allIds,
    }))
  }, [filteredNotifications])

  const handleDeselectAll = useCallback(() => {
    setNotificationState(prev => ({
      ...prev,
      selectedNotifications: [],
    }))
  }, [])

  const handleBulkAction = useCallback((action: string) => {
    const selectedIds = notificationState.selectedNotifications
    if (selectedIds.length === 0) return

    switch (action) {
      case 'markRead':
        handleMarkAsRead(selectedIds)
        break
      case 'markUnread':
        handleMarkAsUnread(selectedIds)
        break
      case 'archive':
        handleArchive(selectedIds)
        break
      case 'delete':
        handleDelete(selectedIds)
        break
    }
  }, [notificationState.selectedNotifications, handleMarkAsRead, handleMarkAsUnread, handleArchive, handleDelete])

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && isOpen) {
      refreshIntervalRef.current = setInterval(loadNotifications, 30000) // Refresh every 30 seconds
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [autoRefresh, isOpen, loadNotifications])

  // WebSocket setup
  useEffect(() => {
    if (isOpen) {
      initializeWebSocket()
      return () => {
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    }
  }, [isOpen, initializeWebSocket])

  // Initial load
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  // Request notification permission on mount
  useEffect(() => {
    if (notificationState.preferences.enableDesktop) {
      requestNotificationPermission()
    }
  }, [notificationState.preferences.enableDesktop, requestNotificationPermission])

  // Render notification item
  const renderNotificationItem = (notification: NotificationData) => {
    const categoryConfig = NOTIFICATION_CATEGORIES[notification.category] || NOTIFICATION_CATEGORIES.system
    const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium
    const isExpanded = notificationState.expandedNotifications.has(notification.id)
    const isSelected = notificationState.selectedNotifications.includes(notification.id)

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
          !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-start space-x-3">
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectNotification(notification.id, !!checked)}
            className="mt-1"
          />

          {/* Category icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${categoryConfig.bgColor}`}>
            <categoryConfig.icon className={`h-4 w-4 ${categoryConfig.color}`} />
          </div>

          {/* Notification content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 
                  className={`font-medium truncate cursor-pointer ${!notification.isRead ? 'font-semibold' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.title}
                </h4>
                <Badge variant={priorityConfig.badge as any} className="text-xs">
                  {priorityConfig.label}
                </Badge>
                {notification.group && (
                  <Badge variant="outline" className="text-xs">
                    {notification.group}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(notification.timestamp)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notification.isRead ? (
                      <DropdownMenuItem onClick={() => handleMarkAsUnread([notification.id])}>
                        <EyeOffIcon className="h-4 w-4 mr-2" />
                        Mark as unread
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleMarkAsRead([notification.id])}>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleArchive([notification.id])}>
                      <ArchiveIcon className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete([notification.id])}
                      className="text-red-600"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {notification.message}
            </p>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 border-t mt-2">
                    {notification.details && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-1">Details:</h5>
                        <p className="text-sm text-muted-foreground">{notification.details}</p>
                      </div>
                    )}
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Actions:</h5>
                        <div className="flex flex-wrap gap-2">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={action.primary ? 'default' : 'outline'}
                              onClick={() => {
                                if (onNotificationAction) {
                                  onNotificationAction(notification.id, action.id)
                                }
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {notification.links && notification.links.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Related:</h5>
                        <div className="space-y-1">
                          {notification.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              {link.label}
                              <ExternalLinkIcon className="h-3 w-3 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>ID: {notification.id}</span>
                      <span>{formatDateTime(notification.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
          )}
        </div>
      </motion.div>
    )
  }

  // Render loading state
  if (notificationState.isLoading && notificationState.notifications.length === 0) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (notificationState.error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Failed to load notifications: {notificationState.error}
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                className="ml-2"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const containerClasses = {
    dropdown: 'w-96 max-h-[600px]',
    sidebar: 'w-full h-full',
    modal: 'w-full max-w-4xl max-h-[80vh]',
    fullscreen: 'w-full h-full',
  }

  return (
    <TooltipProvider>
      <Card className={`${containerClasses[position]} ${className}`}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notificationState.unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {notificationState.unreadCount}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {position !== 'dropdown' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreferencesOpen(true)}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={loadNotifications}
                disabled={notificationState.isLoading}
              >
                <RefreshCwIcon className={`h-4 w-4 ${notificationState.isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search and filters */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={notificationState.searchQuery}
                  onChange={(e) => setNotificationState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={notificationState.selectedCategory}
                onValueChange={(value) => setNotificationState(prev => ({ 
                  ...prev, 
                  selectedCategory: value as NotificationCategory | 'all' 
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(NOTIFICATION_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk actions */}
            {notificationState.selectedNotifications.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {notificationState.selectedNotifications.length} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('markRead')}>
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                    <ArchiveIcon className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Tabs */}
        <div className="px-6">
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notificationState.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notificationState.unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* All/Unread/Archived Tabs */}
            {['all', 'unread', 'archived'].includes(selectedView) && (
              <TabsContent value={selectedView} className="mt-4">
                <CardContent className="p-0">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedView === 'unread' 
                          ? "You're all caught up!" 
                          : selectedView === 'archived'
                          ? "No archived notifications"
                          : "No notifications to display"
                        }
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-3 p-1">
                        <AnimatePresence>
                          {filteredNotifications.map(renderNotificationItem)}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound notifications</Label>
                        <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
                      </div>
                      <Switch
                        checked={notificationState.preferences.enableSound}
                        onCheckedChange={(checked) => setNotificationState(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, enableSound: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Desktop notifications</Label>
                        <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                      </div>
                      <Switch
                        checked={notificationState.preferences.enableDesktop}
                        onCheckedChange={(checked) => setNotificationState(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, enableDesktop: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto mark as read</Label>
                        <p className="text-sm text-muted-foreground">Automatically mark notifications as read when clicked</p>
                      </div>
                      <Switch
                        checked={notificationState.preferences.autoMarkRead}
                        onCheckedChange={(checked) => setNotificationState(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, autoMarkRead: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Group similar notifications</Label>
                        <p className="text-sm text-muted-foreground">Group related notifications together</p>
                      </div>
                      <Switch
                        checked={notificationState.preferences.groupSimilar}
                        onCheckedChange={(checked) => setNotificationState(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, groupSimilar: checked }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Notification Categories</h4>
                  <div className="space-y-2">
                    {Object.entries(NOTIFICATION_CATEGORIES).map(([key, config]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          checked={notificationState.preferences.categories.includes(key)}
                          onCheckedChange={(checked) => {
                            setNotificationState(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                categories: checked
                                  ? [...prev.preferences.categories, key]
                                  : prev.preferences.categories.filter(c => c !== key)
                              }
                            }))
                          }}
                        />
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${config.bgColor}`}>
                          <config.icon className={`h-3 w-3 ${config.color}`} />
                        </div>
                        <Label>{config.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedView('all')}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Save preferences to backend
                    // Implementation would go here
                    setSelectedView('all')
                  }}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </TooltipProvider>
  )
}

export default NotificationCenter