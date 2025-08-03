// RBACHeader.tsx - Enterprise-grade header component for RBAC system
// Provides user context, notifications, search, settings, and advanced RBAC features

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  Crown,
  Key,
  Users,
  Database,
  Activity,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Globe,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Star,
  Heart,
  Bookmark,
  Share,
  Download,
  Upload,
  RefreshCw,
  Maximize,
  Minimize,
  X,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Menu,
  Grid,
  List,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  Zap,
  Gauge,
  Target,
  Flag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Group,
  Fingerprint,
  Scan,
  ScanLine,
  Code,
  Terminal,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Memory,
  Network,
  Wifi,
  WifiOff,
  Bluetooth,
  Radio,
  Satellite,
  Radar,
  Navigation,
  Compass,
  Map,
  Route,
  Tag,
  Hash,
  At,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Copy,
  ExternalLink,
  FileText,
  File,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
  Layers,
  Component,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Bus,
  Train,
  Rocket,
  Earth,
  Sparkles,
  Flame,
  Droplet,
  Leaf,
  Flower,
  Tree,
  Mountain,
  Waves,
  Wind,
  Snowflake,
  Umbrella,
  Rainbow,
  Palette,
  Brush,
  Pen,
  Pencil,
  PenTool,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { LoadingSpinner, WebSocketConnectionLoading } from '../shared/LoadingStates';

// Header types and interfaces
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
  actionUrl?: string;
  actionText?: string;
  category?: string;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  permission?: string;
  category?: string;
  shortcut?: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning' | 'success';
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  department?: string;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended';
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
  };
}

export interface HeaderConfig {
  layout: 'fixed' | 'sticky' | 'static';
  height: number;
  showBreadcrumbs: boolean;
  showSearch: boolean;
  showNotifications: boolean;
  showQuickActions: boolean;
  showUserMenu: boolean;
  showThemeToggle: boolean;
  showConnectionStatus: boolean;
  maxNotifications: number;
  searchPlaceholder: string;
  theme: {
    variant: 'default' | 'compact' | 'spacious';
    background: 'solid' | 'blur' | 'transparent';
  };
  animations: {
    enabled: boolean;
    duration: number;
  };
}

export interface RBACHeaderProps {
  config?: Partial<HeaderConfig>;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onQuickActionClick?: (action: QuickAction) => void;
  className?: string;
  children?: React.ReactNode;
  customActions?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showMenuButton?: boolean;
}

// Custom hooks for header functionality
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light';
      // In a real app, this would update the theme in the document or context
      return newTheme;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - in real app, this would come from backend
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'security',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected for your account',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        urgent: true,
        actionUrl: '/rbac/security/alerts',
        actionText: 'View Details',
        category: 'security'
      },
      {
        id: '2',
        type: 'info',
        title: 'Access Request',
        message: 'New access request from John Doe for Data Sources module',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        urgent: false,
        actionUrl: '/rbac/access-requests',
        actionText: 'Review Request',
        category: 'access'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Policy Violation',
        message: 'Data export performed outside business hours',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        urgent: false,
        actionUrl: '/rbac/violations',
        actionText: 'Investigate',
        category: 'compliance'
      },
      {
        id: '4',
        type: 'success',
        title: 'Backup Completed',
        message: 'Daily system backup completed successfully',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        read: true,
        urgent: false,
        category: 'system'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      const wasUnread = prev.find(n => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return filtered;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

const useQuickActions = () => {
  const { hasPermission } = usePermissionCheck();

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'create-user',
      label: 'Create User',
      icon: <UserPlus className="w-4 h-4" />,
      href: '/rbac/users/create',
      permission: 'users:create',
      category: 'identity',
      shortcut: 'Ctrl+U',
      description: 'Create a new user account'
    },
    {
      id: 'create-role',
      label: 'Create Role',
      icon: <Crown className="w-4 h-4" />,
      href: '/rbac/roles/create',
      permission: 'roles:create',
      category: 'identity',
      shortcut: 'Ctrl+R',
      description: 'Define a new role'
    },
    {
      id: 'scan-data',
      label: 'Run Scan',
      icon: <Scan className="w-4 h-4" />,
      href: '/scan-logic/run',
      permission: 'scan:execute',
      category: 'governance',
      description: 'Execute data scanning'
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: <Download className="w-4 h-4" />,
      onClick: () => {
        // Trigger export dialog
      },
      permission: 'data:export',
      category: 'data',
      description: 'Export system data'
    },
    {
      id: 'system-health',
      label: 'System Health',
      icon: <Activity className="w-4 h-4" />,
      href: '/rbac/monitoring',
      permission: 'monitoring:read',
      category: 'monitoring',
      description: 'View system health status'
    }
  ], []);

  const filteredActions = useMemo(() => 
    quickActions.filter(action => !action.permission || hasPermission(action.permission))
  , [quickActions, hasPermission]);

  return { quickActions: filteredActions };
};

// Search component
const GlobalSearch: React.FC<{
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}> = ({ placeholder = "Search everything...", onSearch, className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    // Mock search results - in real app, this would call search API
    if (searchQuery.trim()) {
      setResults([
        { id: '1', type: 'user', title: 'John Doe', subtitle: 'Administrator', href: '/rbac/users/1' },
        { id: '2', type: 'role', title: 'Data Analyst', subtitle: 'Role', href: '/rbac/roles/data-analyst' },
        { id: '3', type: 'permission', title: 'data:read', subtitle: 'Permission', href: '/rbac/permissions/data-read' },
        { id: '4', type: 'resource', title: 'Customer Database', subtitle: 'Data Source', href: '/data-sources/customer-db' }
      ]);
    } else {
      setResults([]);
    }
  }, [onSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        searchRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-20 py-2 bg-muted/50 border border-border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background",
            "placeholder:text-muted-foreground transition-all duration-200"
          )}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                    whileHover={{ backgroundColor: 'rgba(var(--accent), 0.1)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      {result.type === 'user' && <User className="w-4 h-4" />}
                      {result.type === 'role' && <Crown className="w-4 h-4" />}
                      {result.type === 'permission' && <Key className="w-4 h-4" />}
                      {result.type === 'resource' && <Database className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                <div className="mb-3 font-medium">Quick Actions</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-xs">
                    <kbd className="px-1 py-0.5 bg-muted border rounded">Ctrl+U</kbd>
                    <span>Create User</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-xs">
                    <kbd className="px-1 py-0.5 bg-muted border rounded">Ctrl+R</kbd>
                    <span>Create Role</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notifications panel
const NotificationsPanel: React.FC<{
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}> = ({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <motion.button
        className={cn(
          "relative p-2 rounded-lg hover:bg-accent/10 transition-colors",
          isOpen && "bg-accent/10"
        )}
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <motion.button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={onMarkAllAsRead}
                    whileHover={{ scale: 1.05 }}
                  >
                    Mark all read
                  </motion.button>
                )}
                <button
                  className="p-1 hover:bg-accent/20 rounded"
                  onClick={onToggle}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent/5 transition-colors cursor-pointer",
                        !notification.read && "bg-accent/5"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                        }
                        if (onNotificationClick) {
                          onNotificationClick(notification);
                        }
                      }}
                      whileHover={{ backgroundColor: 'rgba(var(--accent), 0.05)' }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={cn(
                                "font-medium text-sm",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                                {notification.urgent && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {notification.actionText && (
                                  <span className="text-xs text-accent hover:underline">
                                    {notification.actionText}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-accent rounded-full" />
                              )}
                              <button
                                className="p-1 hover:bg-accent/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border text-center">
                <button className="text-sm text-accent hover:underline">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick actions panel
const QuickActionsPanel: React.FC<{
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}> = ({ actions, onActionClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className={cn(
          "p-2 rounded-lg hover:bg-accent/10 transition-colors",
          isOpen && "bg-accent/10"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/10 transition-colors text-center"
                  onClick={() => {
                    if (onActionClick) {
                      onActionClick(action);
                    }
                    setIsOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="text-xs bg-muted px-1 py-0.5 rounded">
                      {action.shortcut}
                    </kbd>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// User menu
const UserMenu: React.FC<{
  user: UserProfile;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      href: '/rbac/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      href: '/rbac/settings'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
      href: '/rbac/security'
    },
    {
      id: 'theme',
      label: `Theme: ${theme}`,
      icon: theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />,
      onClick: toggleTheme
    },
    { id: 'divider' },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      href: '/help'
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: onLogout,
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="relative">
      <motion.button
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors",
          isOpen && "bg-accent/10"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
          {user.fullName?.split(' ').map(n => n[0]).join('') || user.username[0].toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">{user.fullName || user.username}</div>
          <div className="text-xs text-muted-foreground">{user.role}</div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                  {user.fullName?.split(' ').map(n => n[0]).join('') || user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.fullName || user.username}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
              </div>
              {user.lastLogin && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Last login: {user.lastLogin.toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => (
                item.id === 'divider' ? (
                  <div key="divider" className="my-2 border-t border-border" />
                ) : (
                  <motion.button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/10 transition-colors",
                      item.variant === 'destructive' && "text-red-600 hover:bg-red-50"
                    )}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: item.variant === 'destructive' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--accent), 0.1)' }}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </motion.button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main RBACHeader component
export const RBACHeader: React.FC<RBACHeaderProps> = ({
  config: configOverrides = {},
  onMenuToggle,
  onSearch,
  onNotificationClick,
  onQuickActionClick,
  className,
  children,
  customActions,
  title,
  subtitle,
  showMenuButton = true
}) => {
  const { currentUser, isLoading: userLoading, logout } = useCurrentUser();
  const { isConnected, connectionState } = useRBACWebSocket();
  const router = useRouter();

  // Header configuration
  const config: HeaderConfig = useMemo(() => ({
    layout: 'sticky',
    height: 64,
    showBreadcrumbs: true,
    showSearch: true,
    showNotifications: true,
    showQuickActions: true,
    showUserMenu: true,
    showThemeToggle: true,
    showConnectionStatus: true,
    maxNotifications: 50,
    searchPlaceholder: 'Search users, roles, permissions...',
    theme: {
      variant: 'default',
      background: 'blur'
    },
    animations: {
      enabled: true,
      duration: 200
    },
    ...configOverrides
  }), [configOverrides]);

  // Hooks
  const notifications = useNotifications();
  const { quickActions } = useQuickActions();

  // Handle menu toggle
  const handleMenuToggle = useCallback(() => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  }, [onMenuToggle]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  // Handle quick action click
  const handleQuickActionClick = useCallback((action: QuickAction) => {
    if (action.href) {
      router.push(action.href);
    }
    if (action.onClick) {
      action.onClick();
    }
    if (onQuickActionClick) {
      onQuickActionClick(action);
    }
  }, [router, onQuickActionClick]);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: config.animations.duration / 1000,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.header
      className={cn(
        "w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        config.layout === 'fixed' && "fixed top-0 z-50",
        config.layout === 'sticky' && "sticky top-0 z-40",
        config.theme.background === 'solid' && "bg-background",
        config.theme.background === 'transparent' && "bg-transparent",
        config.theme.variant === 'compact' && "h-12",
        config.theme.variant === 'spacious' && "h-20",
        className
      )}
      style={{ height: config.height }}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center h-full px-4 lg:px-6">
        {/* Menu Button */}
        {showMenuButton && (
          <motion.button
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors mr-2 lg:hidden"
            onClick={handleMenuToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}

        {/* Title Section */}
        {(title || subtitle) && (
          <div className="flex-1 min-w-0 mr-4">
            {title && (
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        )}

        {/* Connection Status */}
        {config.showConnectionStatus && !isConnected && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg mr-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-800">Reconnecting...</span>
          </motion.div>
        )}

        {/* Search */}
        {config.showSearch && (
          <div className="hidden md:block flex-1 max-w-lg mr-4">
            <GlobalSearch
              placeholder={config.searchPlaceholder}
              onSearch={onSearch}
            />
          </div>
        )}

        {/* Custom Actions */}
        {customActions && (
          <div className="flex items-center gap-2 mr-4">
            {customActions}
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          {config.showSearch && (
            <motion.button
              className="p-2 rounded-lg hover:bg-accent/10 transition-colors md:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
          )}

          {/* Quick Actions */}
          {config.showQuickActions && quickActions.length > 0 && (
            <QuickActionsPanel
              actions={quickActions}
              onActionClick={handleQuickActionClick}
            />
          )}

          {/* Notifications */}
          {config.showNotifications && (
            <NotificationsPanel
              notifications={notifications.notifications}
              unreadCount={notifications.unreadCount}
              isOpen={notifications.isOpen}
              onToggle={() => notifications.setIsOpen(!notifications.isOpen)}
              onNotificationClick={onNotificationClick}
              onMarkAsRead={notifications.markAsRead}
              onMarkAllAsRead={notifications.markAllAsRead}
              onDelete={notifications.deleteNotification}
            />
          )}

          {/* User Menu */}
          {config.showUserMenu && currentUser && (
            <UserMenu
              user={currentUser}
              onLogout={handleLogout}
            />
          )}

          {/* Loading State */}
          {userLoading && (
            <div className="p-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Children */}
        {children}
      </div>
    </motion.header>
  );
};

export default RBACHeader;