// RBACHeader.tsx - Enterprise-grade header component for RBAC system
// Provides comprehensive header functionality with user context, notifications, and advanced features

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
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Activity,
  Clock,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  Heart,
  Bookmark,
  Share,
  Download,
  Upload,
  Copy,
  Link,
  ExternalLink,
  Home,
  Dashboard,
  Database,
  FileText,
  Folder,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  Crown,
  Badge,
  Award,
  Trophy,
  Target,
  Zap,
  Gauge,
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  RotateCcw,
  Maximize,
  Minimize,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  Trash2,
  Archive,
  Tag,
  Flag,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  QuestionMark,
  MessageSquare,
  MessageCircle,
  Send,
  Inbox,
  Archive as ArchiveIcon,
  Trash,
  MarkAsRead,
  MarkAsUnread,
  Pin,
  Unpin,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  Bluetooth,
  BluetoothConnected,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  CloudOff,
  Package,
  Truck,
  Building,
  Factory,
  Briefcase,
  GraduationCap,
  Layers,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitMerge,
  Palette,
  Brush,
  Paintbrush,
  Image,
  Camera,
  Video,
  Music,
  Headphones,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume,
  VolumeDown,
  VolumeUp,
  Mute,
  Unmute,
  Fullscreen,
  ExitFullscreen,
  PictureInPicture,
  Cast,
  AirPlay,
  Bluetooth as BluetoothIcon,
  Usb,
  Cable,
  Router,
  Ethernet,
  Antenna,
  Satellite,
  Radio,
  Tv,
  Monitor as MonitorIcon,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  MousePointer,
  Mouse,
  Keyboard,
  Gamepad,
  Joystick,
  Headset,
  Speaker,
  Microphone,
  Webcam,
  Printer,
  Scanner,
  Fax,
  Projector,
  Screen,
  FlashlightOn,
  FlashlightOff,
  Flashlight,
  Lamp,
  Lightbulb,
  Power,
  PowerOff,
  Plug,
  PlugZap,
  Cable as CableIcon,
  Usb as UsbIcon,
  SdCard,
  MemoryStick,
  HardDisk,
  Disc,
  Save,
  Folder as FolderIcon,
  File,
  FileEdit,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FileSearch,
  FileType,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Pdf,
  Doc,
  Ppt,
  Xls,
  Zip,
  Rar,
  Tar,
  Gz,
  Bz2,
  Xml,
  Html,
  Css,
  Js,
  Ts,
  Python,
  Java,
  Cpp,
  CSharp,
  Go,
  Rust,
  Swift,
  Kotlin,
  Dart,
  Ruby,
  Php,
  Perl,
  Shell,
  Bash,
  Powershell,
  Cmd,
  Sql,
  NoSql,
  Json,
  Yaml,
  Toml,
  Ini,
  Cfg,
  Conf,
  Log,
  Txt,
  Md,
  Rst,
  Tex,
  Latex,
  Bibtex,
  Csv,
  Tsv,
  Excel,
  Word,
  PowerPoint,
  Pdf as PdfIcon,
  Zip as ZipIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Skeleton } from '../shared/LoadingStates';

// Header interfaces
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'security' | 'system' | 'user' | 'data';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
  persistent?: boolean;
  dismissible?: boolean;
  userId?: number;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  icon?: React.ReactNode;
}

export interface UserMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  separator?: boolean;
  permission?: string;
  variant?: 'default' | 'destructive';
  shortcut?: string;
  disabled?: boolean;
  badge?: string | number;
  description?: string;
}

export interface HeaderAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  permission?: string;
  badge?: string | number;
  tooltip?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  hotkey?: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accent: string;
  radius: number;
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
}

export interface HeaderConfig {
  showLogo: boolean;
  showSearch: boolean;
  showNotifications: boolean;
  showThemeToggle: boolean;
  showUserMenu: boolean;
  showBreadcrumbs: boolean;
  showActions: boolean;
  maxNotifications: number;
  searchPlaceholder: string;
  logoText?: string;
  logoIcon?: React.ReactNode;
  height: number;
  sticky: boolean;
  blur: boolean;
  border: boolean;
  shadow: boolean;
}

export interface RBACHeaderProps {
  config?: Partial<HeaderConfig>;
  actions?: HeaderAction[];
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onUserAction?: (action: UserMenuAction) => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'compact';
  position?: 'sticky' | 'fixed' | 'static';
  showMenuButton?: boolean;
  customContent?: React.ReactNode;
  breadcrumbComponent?: React.ReactNode;
}

// Custom hooks
const useHeaderConfig = () => {
  const [config, setConfig] = useState<HeaderConfig>({
    showLogo: true,
    showSearch: true,
    showNotifications: true,
    showThemeToggle: true,
    showUserMenu: true,
    showBreadcrumbs: true,
    showActions: true,
    maxNotifications: 50,
    searchPlaceholder: 'Search...',
    logoText: 'RBAC System',
    height: 64,
    sticky: true,
    blur: true,
    border: true,
    shadow: true,
  });

  const updateConfig = useCallback((updates: Partial<HeaderConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return { config, updateConfig };
};

const useTheme = () => {
  const [theme, setTheme] = useState<ThemeConfig>({
    mode: 'system',
    accent: 'blue',
    radius: 8,
    density: 'comfortable',
    animations: true,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('rbac-theme');
    if (savedTheme) {
      try {
        setTheme(prev => ({ ...prev, ...JSON.parse(savedTheme) }));
      } catch (error) {
        console.error('Failed to parse theme config:', error);
      }
    }
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setTheme(prev => {
      const newTheme = { ...prev, ...updates };
      localStorage.setItem('rbac-theme', JSON.stringify(newTheme));
      
      // Apply theme to document
      if (updates.mode) {
        const isDark = updates.mode === 'dark' || 
          (updates.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      }
      
      return newTheme;
    });
  }, []);

  // Apply system theme changes
  useEffect(() => {
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      handleChange(); // Apply initial state
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme.mode]);

  return { theme, updateTheme };
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'security',
            title: 'Security Alert',
            message: 'New login from unknown device detected',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            read: false,
            priority: 'high',
            category: 'security',
            dismissible: true,
            actions: [
              {
                id: 'view-details',
                label: 'View Details',
                action: () => console.log('View security details'),
                variant: 'primary',
              },
              {
                id: 'dismiss',
                label: 'Dismiss',
                action: () => console.log('Dismiss notification'),
              },
            ],
          },
          {
            id: '2',
            type: 'system',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will begin in 2 hours',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            read: false,
            priority: 'medium',
            category: 'system',
            dismissible: true,
          },
          {
            id: '3',
            type: 'user',
            title: 'Access Request',
            message: 'John Doe requested access to Finance Database',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: true,
            priority: 'medium',
            category: 'access',
            dismissible: true,
          },
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? prev - 1 : prev;
    });
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
  };
};

const useGlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual search API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResults = [
        {
          id: '1',
          type: 'user',
          title: 'John Doe',
          description: 'Senior Data Analyst',
          path: '/rbac/users/1',
          icon: <User className="w-4 h-4" />,
        },
        {
          id: '2',
          type: 'role',
          title: 'Data Scientist',
          description: 'Access to analytics tools and datasets',
          path: '/rbac/roles/2',
          icon: <Shield className="w-4 h-4" />,
        },
        {
          id: '3',
          type: 'resource',
          title: 'Customer Database',
          description: 'Primary customer data repository',
          path: '/rbac/resources/3',
          icon: <Database className="w-4 h-4" />,
        },
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      search(newQuery);
    }, 300);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    isOpen,
    setIsOpen,
    handleQueryChange,
    setQuery,
  };
};

// Component: Global Search
const GlobalSearch: React.FC<{
  placeholder?: string;
  onSelect?: (result: any) => void;
  className?: string;
}> = ({ placeholder = 'Search...', onSelect, className }) => {
  const { query, results, loading, isOpen, setIsOpen, handleQueryChange } = useGlobalSearch();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((result: any) => {
    setIsOpen(false);
    if (onSelect) {
      onSelect(result);
    } else if (result.path) {
      router.push(result.path);
    }
  }, [onSelect, router, setIsOpen]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, setIsOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const typeIcons = {
    user: <User className="w-4 h-4" />,
    role: <Shield className="w-4 h-4" />,
    permission: <Key className="w-4 h-4" />,
    resource: <Database className="w-4 h-4" />,
    group: <Users className="w-4 h-4" />,
    audit: <FileText className="w-4 h-4" />,
    session: <Activity className="w-4 h-4" />,
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'transition-all duration-200'
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
                      selectedIndex === index && 'bg-gray-50 dark:bg-gray-800'
                    )}
                  >
                    <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {result.icon || typeIcons[result.type as keyof typeof typeIcons] || <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {result.type}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Component: Notifications Panel
const NotificationsPanel: React.FC<{
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'security':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <User className="w-4 h-4 text-green-500" />;
      case 'data':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen && 'bg-gray-100 dark:bg-gray-800'
        )}
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="py-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'relative px-4 py-3 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
                        getPriorityColor(notification.priority),
                        !notification.read && 'bg-blue-50 dark:bg-blue-900/10'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              'text-sm font-medium truncate',
                              notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {notification.actions?.map((action) => (
                                <button
                                  key={action.id}
                                  onClick={action.action}
                                  className={cn(
                                    'text-xs px-2 py-1 rounded transition-colors duration-200',
                                    action.variant === 'primary' && 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800',
                                    action.variant === 'destructive' && 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800',
                                    (!action.variant || action.variant === 'default') && 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                  )}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                              title="Mark as read"
                            >
                              <Eye className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                          {notification.dismissible && (
                            <button
                              onClick={() => onDismiss(notification.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
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

// Component: Theme Toggle
const ThemeToggle: React.FC = () => {
  const { theme, updateTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    const modes: ThemeConfig['mode'][] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    updateTheme({ mode: modes[nextIndex] });
  }, [theme.mode, updateTheme]);

  const getIcon = () => {
    switch (theme.mode) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme.mode) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System mode';
      default:
        return 'Theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title={getLabel()}
    >
      <motion.div
        key={theme.mode}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
        className="text-gray-600 dark:text-gray-300"
      >
        {getIcon()}
      </motion.div>
    </button>
  );
};

// Component: User Menu
const UserMenu: React.FC<{
  onAction?: (action: UserMenuAction) => void;
}> = ({ onAction }) => {
  const { user, logout } = useCurrentUser();
  const { hasPermission } = usePermissionCheck();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userMenuActions: UserMenuAction[] = useMemo(() => [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      action: () => router.push('/rbac/profile'),
      shortcut: 'P',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/rbac/settings'),
      shortcut: 'S',
    },
    {
      id: 'separator-1',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'my-access-requests',
      label: 'My Access Requests',
      icon: <UserPlus className="w-4 h-4" />,
      action: () => router.push('/rbac/my-access-requests'),
      permission: 'rbac.access_requests.read_own',
    },
    {
      id: 'my-sessions',
      label: 'Active Sessions',
      icon: <Activity className="w-4 h-4" />,
      action: () => router.push('/rbac/my-sessions'),
      permission: 'rbac.sessions.read_own',
    },
    {
      id: 'my-audit-logs',
      label: 'My Activity',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/rbac/my-activity'),
      permission: 'rbac.audit.read_own',
    },
    {
      id: 'separator-2',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => router.push('/help'),
    },
    {
      id: 'feedback',
      label: 'Send Feedback',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/feedback'),
    },
    {
      id: 'separator-3',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      action: logout,
      variant: 'destructive',
      shortcut: 'Q',
    },
  ], [router, logout]);

  const visibleActions = userMenuActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  const handleActionClick = useCallback((action: UserMenuAction) => {
    if (!action.disabled) {
      action.action();
      onAction?.(action);
      setIsOpen(false);
    }
  }, [onAction]);

  if (!user) {
    return null;
  }

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'User';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen && 'bg-gray-100 dark:bg-gray-800'
        )}
      >
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={getUserDisplayName()}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getUserInitials()
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
            {user.email}
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            {/* User info header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={getUserDisplayName()}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                  {user.roles && user.roles.length > 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {user.roles.map(role => role.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu actions */}
            <div className="py-2">
              {visibleActions.map((action, index) => (
                action.separator ? (
                  <div key={action.id} className="my-1 border-t border-gray-200 dark:border-gray-700" />
                ) : (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
                      action.variant === 'destructive' && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10',
                      action.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex-shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="truncate">{action.label}</span>
                      {action.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {action.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {action.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {action.badge}
                        </span>
                      )}
                      {action.shortcut && (
                        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {action.shortcut}
                        </kbd>
                      )}
                    </div>
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
  actions = [],
  onMenuToggle,
  onSearch,
  onNotificationClick,
  onUserAction,
  className,
  variant = 'default',
  position = 'sticky',
  showMenuButton = true,
  customContent,
  breadcrumbComponent,
}) => {
  const { config, updateConfig } = useHeaderConfig();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const { user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();

  // Merge config with overrides
  const finalConfig = useMemo(() => ({
    ...config,
    ...configOverrides,
  }), [config, configOverrides]);

  const handleSearch = useCallback((query: string) => {
    onSearch?.(query);
  }, [onSearch]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    onNotificationClick?.(notification);
  }, [markAsRead, onNotificationClick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-global-search]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Menu toggle with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        onMenuToggle?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMenuToggle]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'w-full bg-white dark:bg-gray-900 transition-all duration-200',
        finalConfig.border && 'border-b border-gray-200 dark:border-gray-700',
        finalConfig.shadow && 'shadow-sm',
        finalConfig.blur && 'backdrop-blur-sm bg-white/95 dark:bg-gray-900/95',
        position === 'sticky' && 'sticky top-0 z-40',
        position === 'fixed' && 'fixed top-0 left-0 right-0 z-50',
        variant === 'minimal' && 'border-none shadow-none',
        variant === 'compact' && 'py-2',
        className
      )}
      style={{ height: finalConfig.height }}
    >
      <div className="h-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Menu button */}
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:hidden"
                title="Toggle menu"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}

            {/* Logo */}
            {finalConfig.showLogo && (
              <div className="flex items-center gap-3">
                {finalConfig.logoIcon || <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                {finalConfig.logoText && (
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    {finalConfig.logoText}
                  </span>
                )}
              </div>
            )}

            {/* Breadcrumbs */}
            {finalConfig.showBreadcrumbs && breadcrumbComponent && (
              <div className="hidden md:block">
                {breadcrumbComponent}
              </div>
            )}
          </div>

          {/* Center section */}
          <div className="flex-1 max-w-2xl mx-8">
            {finalConfig.showSearch && (
              <GlobalSearch
                placeholder={finalConfig.searchPlaceholder}
                onSelect={handleSearch}
                className="w-full"
              />
            )}
            {customContent}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Custom actions */}
            {finalConfig.showActions && actions.length > 0 && (
              <div className="flex items-center gap-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    disabled={action.disabled || action.loading}
                    className={cn(
                      'relative p-2 rounded-lg transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                      action.variant === 'secondary' && 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                      (!action.variant || action.variant === 'default' || action.variant === 'ghost') && 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300',
                      action.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    title={action.tooltip || action.label}
                  >
                    {action.loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      action.icon
                    )}
                    {action.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Theme toggle */}
            {finalConfig.showThemeToggle && <ThemeToggle />}

            {/* Notifications */}
            {finalConfig.showNotifications && (
              <NotificationsPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDismiss={dismissNotification}
                onNotificationClick={handleNotificationClick}
              />
            )}

            {/* User menu */}
            {finalConfig.showUserMenu && user && (
              <UserMenu onAction={onUserAction} />
            )}

            {/* Loading state */}
            {userLoading && (
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="hidden md:block">
                  <Skeleton className="w-24 h-4 mb-1" />
                  <Skeleton className="w-32 h-3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default RBACHeader;