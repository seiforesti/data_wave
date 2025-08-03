// RBACNavigation.tsx - Enterprise-grade navigation component for RBAC system
// Provides intelligent navigation with RBAC integration, dynamic routing, and advanced UX patterns

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Shield,
  Users,
  Database,
  Settings,
  Activity,
  Eye,
  Lock,
  Unlock,
  FileText,
  Folder,
  Search,
  Bell,
  Star,
  Bookmark,
  Heart,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreHorizontal,
  Home,
  Archive,
  Tag,
  Globe,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  Link,
  ExternalLink,
  Share,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Zap,
  Target,
  Gauge,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  Package,
  Truck,
  Building,
  Factory,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  Medal,
  Flag,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  QuestionMark,
  X,
  Menu,
  Sidebar,
  PanelLeft,
  Layout,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Move,
  MousePointer,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Percent,
  Calculator,
  Ruler,
  Scissors,
  Paperclip,
  Pin,
  Pushpin,
  Magnet,
  Key,
  KeyRound,
  LockKeyhole,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
  Security,
  Verified,
  BadgeCheck,
  UserCog,
  UserShield,
  Crown,
  Gem,
  Diamond,
  Sparkles,
  Wand2,
  Magic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { LoadingSpinner, Skeleton } from '../shared/LoadingStates';

// Navigation item interfaces
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  description?: string;
  shortcut?: string;
  category?: string;
  order?: number;
  
  // Permissions and visibility
  permission?: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  hidden?: boolean;
  disabled?: boolean;
  beta?: boolean;
  new?: boolean;
  deprecated?: boolean;
  
  // Hierarchy
  children?: NavigationItem[];
  parent?: string;
  level?: number;
  
  // Behavior
  external?: boolean;
  openInNewTab?: boolean;
  onClick?: () => void;
  
  // Styling
  className?: string;
  activeClassName?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // Metadata
  lastAccessed?: Date;
  accessCount?: number;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
  
  // Analytics
  trackingId?: string;
  eventCategory?: string;
  eventAction?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon?: React.ReactNode;
  order: number;
  permission?: string;
  collapsed?: boolean;
  items: NavigationItem[];
}

export interface NavigationConfig {
  layout: 'sidebar' | 'topbar' | 'hybrid';
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  showIcons: boolean;
  showLabels: boolean;
  showBadges: boolean;
  showTooltips: boolean;
  showShortcuts: boolean;
  enableSearch: boolean;
  enableFavorites: boolean;
  enableBookmarks: boolean;
  enableRecents: boolean;
  enableCollapse: boolean;
  maxRecentItems: number;
  collapsedByDefault: boolean;
  persistState: boolean;
  animationDuration: number;
  hoverDelay: number;
}

export interface RBACNavigationProps {
  config?: Partial<NavigationConfig>;
  className?: string;
  variant?: 'full' | 'mini' | 'overlay';
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: number;
  height?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  customItems?: NavigationItem[];
  onNavigate?: (item: NavigationItem) => void;
  onFavorite?: (item: NavigationItem) => void;
  onBookmark?: (item: NavigationItem) => void;
  showHeader?: boolean;
  showFooter?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

// Custom hooks for navigation
const useNavigationConfig = () => {
  const [config, setConfig] = useState<NavigationConfig>({
    layout: 'sidebar',
    theme: 'auto',
    density: 'comfortable',
    showIcons: true,
    showLabels: true,
    showBadges: true,
    showTooltips: true,
    showShortcuts: true,
    enableSearch: true,
    enableFavorites: true,
    enableBookmarks: true,
    enableRecents: true,
    enableCollapse: true,
    maxRecentItems: 10,
    collapsedByDefault: false,
    persistState: true,
    animationDuration: 200,
    hoverDelay: 300,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('rbac-navigation-config');
    if (savedConfig) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      } catch (error) {
        console.error('Failed to parse navigation config:', error);
      }
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<NavigationConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      if (newConfig.persistState) {
        localStorage.setItem('rbac-navigation-config', JSON.stringify(newConfig));
      }
      return newConfig;
    });
  }, []);

  return { config, updateConfig };
};

const useNavigationState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('rbac-navigation-favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }

    const savedBookmarks = localStorage.getItem('rbac-navigation-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(new Set(JSON.parse(savedBookmarks)));
      } catch (error) {
        console.error('Failed to parse bookmarks:', error);
      }
    }

    const savedRecents = localStorage.getItem('rbac-navigation-recents');
    if (savedRecents) {
      try {
        setRecentItems(JSON.parse(savedRecents));
      } catch (error) {
        console.error('Failed to parse recent items:', error);
      }
    }
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      localStorage.setItem('rbac-navigation-favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  const toggleBookmark = useCallback((itemId: string) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(itemId)) {
        newBookmarks.delete(itemId);
      } else {
        newBookmarks.add(itemId);
      }
      localStorage.setItem('rbac-navigation-bookmarks', JSON.stringify([...newBookmarks]));
      return newBookmarks;
    });
  }, []);

  const addToRecents = useCallback((item: NavigationItem, maxItems: number = 10) => {
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const newRecents = [{ ...item, lastAccessed: new Date() }, ...filtered].slice(0, maxItems);
      localStorage.setItem('rbac-navigation-recents', JSON.stringify(newRecents));
      return newRecents;
    });
  }, []);

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    expandedGroups,
    setExpandedGroups,
    favorites,
    bookmarks,
    recentItems,
    hoveredItem,
    setHoveredItem,
    toggleFavorite,
    toggleBookmark,
    addToRecents,
    toggleGroupExpansion,
  };
};

const useNavigationItems = (customItems?: NavigationItem[]) => {
  const { user, hasPermission } = useCurrentUser();
  
  const defaultNavigationGroups: NavigationGroup[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      order: 1,
      items: [
        {
          id: 'overview',
          label: 'Overview',
          path: '/rbac/dashboard',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'System overview and analytics',
          permission: 'rbac.dashboard.read',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          path: '/rbac/analytics',
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Advanced analytics and insights',
          permission: 'rbac.analytics.read',
        },
        {
          id: 'reports',
          label: 'Reports',
          path: '/rbac/reports',
          icon: <FileText className="w-4 h-4" />,
          description: 'Generate and view reports',
          permission: 'rbac.reports.read',
          badge: 'New',
          badgeVariant: 'success',
        },
      ],
    },
    {
      id: 'identity',
      label: 'Identity & Access',
      icon: <Shield className="w-4 h-4" />,
      order: 2,
      permission: 'rbac.identity.read',
      items: [
        {
          id: 'users',
          label: 'Users',
          path: '/rbac/users',
          icon: <Users className="w-4 h-4" />,
          description: 'Manage user accounts and profiles',
          permission: 'rbac.users.read',
          shortcut: 'U',
        },
        {
          id: 'roles',
          label: 'Roles',
          path: '/rbac/roles',
          icon: <UserShield className="w-4 h-4" />,
          description: 'Define and manage user roles',
          permission: 'rbac.roles.read',
          shortcut: 'R',
        },
        {
          id: 'permissions',
          label: 'Permissions',
          path: '/rbac/permissions',
          icon: <Key className="w-4 h-4" />,
          description: 'Configure access permissions',
          permission: 'rbac.permissions.read',
          shortcut: 'P',
        },
        {
          id: 'groups',
          label: 'Groups',
          path: '/rbac/groups',
          icon: <Users className="w-4 h-4" />,
          description: 'Organize users into groups',
          permission: 'rbac.groups.read',
          shortcut: 'G',
        },
        {
          id: 'access-requests',
          label: 'Access Requests',
          path: '/rbac/access-requests',
          icon: <UserPlus className="w-4 h-4" />,
          description: 'Review and approve access requests',
          permission: 'rbac.access_requests.read',
          badge: '3',
          badgeVariant: 'warning',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: <Database className="w-4 h-4" />,
      order: 3,
      permission: 'rbac.resources.read',
      items: [
        {
          id: 'data-sources',
          label: 'Data Sources',
          path: '/rbac/data-sources',
          icon: <Database className="w-4 h-4" />,
          description: 'Manage data source connections',
          permission: 'rbac.data_sources.read',
        },
        {
          id: 'catalog',
          label: 'Data Catalog',
          path: '/rbac/catalog',
          icon: <Folder className="w-4 h-4" />,
          description: 'Browse and discover data assets',
          permission: 'rbac.catalog.read',
        },
        {
          id: 'classifications',
          label: 'Classifications',
          path: '/rbac/classifications',
          icon: <Tag className="w-4 h-4" />,
          description: 'Data classification and labeling',
          permission: 'rbac.classifications.read',
        },
        {
          id: 'scan-rules',
          label: 'Scan Rules',
          path: '/rbac/scan-rules',
          icon: <Scan className="w-4 h-4" />,
          description: 'Configure data scanning rules',
          permission: 'rbac.scan_rules.read',
        },
      ],
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
      order: 4,
      permission: 'rbac.governance.read',
      items: [
        {
          id: 'compliance',
          label: 'Compliance',
          path: '/rbac/compliance',
          icon: <CheckCircle className="w-4 h-4" />,
          description: 'Monitor compliance status',
          permission: 'rbac.compliance.read',
        },
        {
          id: 'policies',
          label: 'Policies',
          path: '/rbac/policies',
          icon: <FileText className="w-4 h-4" />,
          description: 'Manage governance policies',
          permission: 'rbac.policies.read',
        },
        {
          id: 'lineage',
          label: 'Data Lineage',
          path: '/rbac/lineage',
          icon: <GitBranch className="w-4 h-4" />,
          description: 'Track data lineage and dependencies',
          permission: 'rbac.lineage.read',
          beta: true,
        },
        {
          id: 'quality',
          label: 'Data Quality',
          path: '/rbac/quality',
          icon: <Award className="w-4 h-4" />,
          description: 'Monitor data quality metrics',
          permission: 'rbac.quality.read',
        },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: <Activity className="w-4 h-4" />,
      order: 5,
      permission: 'rbac.monitoring.read',
      items: [
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          path: '/rbac/audit-logs',
          icon: <FileText className="w-4 h-4" />,
          description: 'View system audit trails',
          permission: 'rbac.audit.read',
        },
        {
          id: 'sessions',
          label: 'Active Sessions',
          path: '/rbac/sessions',
          icon: <Activity className="w-4 h-4" />,
          description: 'Monitor active user sessions',
          permission: 'rbac.sessions.read',
        },
        {
          id: 'security-events',
          label: 'Security Events',
          path: '/rbac/security-events',
          icon: <AlertTriangle className="w-4 h-4" />,
          description: 'Track security incidents',
          permission: 'rbac.security.read',
          badge: '!',
          badgeVariant: 'destructive',
        },
        {
          id: 'system-health',
          label: 'System Health',
          path: '/rbac/system-health',
          icon: <Gauge className="w-4 h-4" />,
          description: 'Monitor system performance',
          permission: 'rbac.system.read',
        },
      ],
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: <Settings className="w-4 h-4" />,
      order: 6,
      permission: 'rbac.admin.read',
      items: [
        {
          id: 'system-settings',
          label: 'System Settings',
          path: '/rbac/settings/system',
          icon: <Settings className="w-4 h-4" />,
          description: 'Configure system preferences',
          permission: 'rbac.settings.read',
        },
        {
          id: 'integrations',
          label: 'Integrations',
          path: '/rbac/integrations',
          icon: <Link className="w-4 h-4" />,
          description: 'Manage external integrations',
          permission: 'rbac.integrations.read',
        },
        {
          id: 'backup-restore',
          label: 'Backup & Restore',
          path: '/rbac/backup',
          icon: <Archive className="w-4 h-4" />,
          description: 'System backup and recovery',
          permission: 'rbac.backup.read',
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          path: '/rbac/maintenance',
          icon: <Wrench className="w-4 h-4" />,
          description: 'System maintenance tools',
          permission: 'rbac.maintenance.read',
          badge: 'Beta',
          badgeVariant: 'info',
        },
      ],
    },
  ], []);

  const filteredGroups = useMemo(() => {
    return defaultNavigationGroups
      .filter(group => !group.permission || hasPermission(group.permission))
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.permission || hasPermission(item.permission))
      }))
      .filter(group => group.items.length > 0);
  }, [defaultNavigationGroups, hasPermission]);

  const allItems = useMemo(() => {
    const items: NavigationItem[] = [];
    filteredGroups.forEach(group => {
      items.push(...group.items);
    });
    if (customItems) {
      items.push(...customItems);
    }
    return items;
  }, [filteredGroups, customItems]);

  return { navigationGroups: filteredGroups, allItems };
};

// Navigation item component
const NavigationItemComponent: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  config: NavigationConfig;
  onNavigate: (item: NavigationItem) => void;
  onFavorite: (itemId: string) => void;
  onBookmark: (itemId: string) => void;
  isFavorite: boolean;
  isBookmarked: boolean;
  onHover: (itemId: string | null) => void;
}> = ({
  item,
  isActive,
  isCollapsed,
  config,
  onNavigate,
  onFavorite,
  onBookmark,
  isFavorite,
  isBookmarked,
  onHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      onHover(item.id);
    }, config.hoverDelay);
  }, [item.id, config.hoverDelay, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!item.disabled) {
      onNavigate(item);
    }
  }, [item, onNavigate]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite(item.id);
  }, [item.id, onFavorite]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark(item.id);
  }, [item.id, onBookmark]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const itemVariants = {
    rest: { x: 0, scale: 1 },
    hover: { x: 4, scale: 1.02 },
    active: { x: 8, scale: 1.05 },
  };

  const badgeVariants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <motion.div
      className={cn(
        'relative group',
        item.className
      )}
      variants={itemVariants}
      animate={isActive ? 'active' : isHovered ? 'hover' : 'rest'}
      transition={{ duration: config.animationDuration / 1000 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-50 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400': isActive,
            'text-gray-700 dark:text-gray-300': !isActive,
            'justify-center': isCollapsed && config.showIcons,
            'px-2': isCollapsed,
          },
          item.activeClassName && isActive ? item.activeClassName : ''
        )}
        title={isCollapsed ? item.label : item.description}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Icon */}
        {config.showIcons && item.icon && (
          <span className={cn(
            'flex-shrink-0 transition-colors duration-200',
            {
              'text-blue-600 dark:text-blue-400': isActive,
              'text-gray-500 dark:text-gray-400': !isActive,
            }
          )}>
            {item.icon}
          </span>
        )}

        {/* Label and badges */}
        {!isCollapsed && (
          <>
            {config.showLabels && (
              <span className="flex-1 text-left font-medium truncate">
                {item.label}
              </span>
            )}

            {/* Badges and indicators */}
            <div className="flex items-center gap-1">
              {/* New/Beta/Deprecated indicators */}
              {item.new && (
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                  badgeVariants.success
                )}>
                  New
                </span>
              )}
              {item.beta && (
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                  badgeVariants.info
                )}>
                  Beta
                </span>
              )}
              {item.deprecated && (
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                  badgeVariants.warning
                )}>
                  Deprecated
                </span>
              )}

              {/* Custom badge */}
              {config.showBadges && item.badge && (
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                  badgeVariants[item.badgeVariant || 'default']
                )}>
                  {item.badge}
                </span>
              )}

              {/* Keyboard shortcut */}
              {config.showShortcuts && item.shortcut && (
                <kbd className="hidden group-hover:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {item.shortcut}
                </kbd>
              )}
            </div>
          </>
        )}

        {/* Action buttons (shown on hover) */}
        {!isCollapsed && (config.enableFavorites || config.enableBookmarks) && (
          <div className={cn(
            'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            { 'opacity-100': isFavorite || isBookmarked }
          )}>
            {config.enableFavorites && (
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200',
                  {
                    'text-yellow-500': isFavorite,
                    'text-gray-400': !isFavorite,
                  }
                )}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {config.enableBookmarks && (
              <button
                onClick={handleBookmarkClick}
                className={cn(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200',
                  {
                    'text-blue-500': isBookmarked,
                    'text-gray-400': !isBookmarked,
                  }
                )}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Bookmark className="w-3 h-3" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {isCollapsed && config.showTooltips && isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="absolute left-full top-0 ml-2 z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
        >
          {item.label}
          {item.shortcut && (
            <span className="ml-2 text-gray-400">
              {item.shortcut}
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Navigation group component
const NavigationGroup: React.FC<{
  group: NavigationGroup;
  isCollapsed: boolean;
  isExpanded: boolean;
  config: NavigationConfig;
  currentPath: string;
  onToggleExpanded: (groupId: string) => void;
  onNavigate: (item: NavigationItem) => void;
  onFavorite: (itemId: string) => void;
  onBookmark: (itemId: string) => void;
  favorites: Set<string>;
  bookmarks: Set<string>;
  onHover: (itemId: string | null) => void;
}> = ({
  group,
  isCollapsed,
  isExpanded,
  config,
  currentPath,
  onToggleExpanded,
  onNavigate,
  onFavorite,
  onBookmark,
  favorites,
  bookmarks,
  onHover,
}) => {
  const handleToggleExpanded = useCallback(() => {
    if (config.enableCollapse) {
      onToggleExpanded(group.id);
    }
  }, [group.id, config.enableCollapse, onToggleExpanded]);

  return (
    <div className="space-y-1">
      {/* Group header */}
      {!isCollapsed && (
        <button
          onClick={handleToggleExpanded}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
            'hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
            { 'cursor-default': !config.enableCollapse }
          )}
          disabled={!config.enableCollapse}
        >
          {group.icon && (
            <span className="flex-shrink-0">
              {group.icon}
            </span>
          )}
          <span className="flex-1 text-left">{group.label}</span>
          {config.enableCollapse && (
            <span className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
        </button>
      )}

      {/* Group items */}
      <AnimatePresence>
        {(isCollapsed || isExpanded) && (
          <motion.div
            initial={!isCollapsed ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: config.animationDuration / 1000 }}
            className="space-y-0.5"
          >
            {group.items.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                isActive={currentPath === item.path}
                isCollapsed={isCollapsed}
                config={config}
                onNavigate={onNavigate}
                onFavorite={handleFavorite}
                onBookmark={handleBookmark}
                isFavorite={favorites.has(item.id)}
                isBookmarked={bookmarks.has(item.id)}
                onHover={onHover}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Search component
const NavigationSearch: React.FC<{
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ query, onQueryChange, placeholder = 'Search navigation...', className }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'transition-all duration-200',
            {
              'ring-2 ring-blue-500 border-transparent': isFocused,
            }
          )}
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Main RBACNavigation component
export const RBACNavigation: React.FC<RBACNavigationProps> = ({
  config: configOverrides = {},
  className,
  variant = 'full',
  position = 'left',
  width = 280,
  height,
  collapsible = true,
  collapsed: controlledCollapsed,
  onCollapse,
  customItems,
  onNavigate: onNavigateProp,
  onFavorite: onFavoriteProp,
  onBookmark: onBookmarkProp,
  showHeader = true,
  showFooter = true,
  showSearch = true,
  searchPlaceholder = 'Search navigation...',
  emptyMessage = 'No navigation items found',
  loadingMessage = 'Loading navigation...',
  errorMessage = 'Failed to load navigation',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasPermission, isLoading: userLoading } = useCurrentUser();
  const { config, updateConfig } = useNavigationConfig();
  const {
    searchQuery,
    setSearchQuery,
    expandedGroups,
    setExpandedGroups,
    favorites,
    bookmarks,
    recentItems,
    hoveredItem,
    setHoveredItem,
    toggleFavorite,
    toggleBookmark,
    addToRecents,
    toggleGroupExpansion,
  } = useNavigationState();
  const { navigationGroups, allItems } = useNavigationItems(customItems);

  // Merge config with overrides
  const finalConfig = useMemo(() => ({
    ...config,
    ...configOverrides,
  }), [config, configOverrides]);

  // Handle collapse state
  const [internalCollapsed, setInternalCollapsed] = useState(finalConfig.collapsedByDefault);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setInternalCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  }, [isCollapsed, onCollapse]);

  // Initialize expanded groups
  useEffect(() => {
    if (!finalConfig.enableCollapse) {
      setExpandedGroups(new Set(navigationGroups.map(g => g.id)));
    } else {
      setExpandedGroups(new Set(navigationGroups.filter(g => !g.collapsed).map(g => g.id)));
    }
  }, [navigationGroups, finalConfig.enableCollapse, setExpandedGroups]);

  // Filter items based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return navigationGroups;
    }

    const query = searchQuery.toLowerCase();
    return navigationGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [navigationGroups, searchQuery]);

  // Handle navigation
  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      if (item.external) {
        window.open(item.path, item.openInNewTab ? '_blank' : '_self');
      } else {
        router.push(item.path);
      }
    }

    // Add to recent items
    if (finalConfig.enableRecents) {
      addToRecents(item, finalConfig.maxRecentItems);
    }

    // Call external handler
    onNavigateProp?.(item);
  }, [router, finalConfig.enableRecents, finalConfig.maxRecentItems, addToRecents, onNavigateProp]);

  // Handle favorite toggle
  const handleFavorite = useCallback((itemId: string) => {
    toggleFavorite(itemId);
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      onFavoriteProp?.(item);
    }
  }, [toggleFavorite, allItems, onFavoriteProp]);

  // Handle bookmark toggle
  const handleBookmark = useCallback((itemId: string) => {
    toggleBookmark(itemId);
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      onBookmarkProp?.(item);
    }
  }, [toggleBookmark, allItems, onBookmarkProp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle collapse with Ctrl+B
      if (e.ctrlKey && e.key === 'b' && collapsible) {
        e.preventDefault();
        handleToggleCollapse();
      }

      // Navigate with shortcuts
      if (e.altKey) {
        const item = allItems.find(i => i.shortcut?.toLowerCase() === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          handleNavigate(item);
        }
      }

      // Focus search with Ctrl+K
      if (e.ctrlKey && e.key === 'k' && finalConfig.enableSearch) {
        e.preventDefault();
        const searchInput = document.querySelector('[data-navigation-search]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleCollapse, handleNavigate, allItems, collapsible, finalConfig.enableSearch]);

  if (userLoading) {
    return (
      <div className={cn('flex flex-col', className)} style={{ width: isCollapsed ? 60 : width }}>
        <div className="p-4">
          <LoadingSpinner size="sm" message={loadingMessage} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn('flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400', className)}>
        <Lock className="w-8 h-8 mb-2" />
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  return (
    <motion.nav
      initial={false}
      animate={{ width: isCollapsed ? 60 : width }}
      transition={{ duration: finalConfig.animationDuration / 1000 }}
      className={cn(
        'flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'h-full overflow-hidden',
        className
      )}
      style={{ height }}
    >
      {/* Header */}
      {showHeader && (
        <div className={cn(
          'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800',
          { 'px-2': isCollapsed }
        )}>
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
          {collapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Search */}
      {!isCollapsed && showSearch && finalConfig.enableSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <NavigationSearch
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Navigation content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Favorites section */}
            {!isCollapsed && finalConfig.enableFavorites && favorites.size > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Star className="w-3 h-3" />
                  <span>Favorites</span>
                </div>
                <div className="space-y-0.5">
                  {allItems
                    .filter(item => favorites.has(item.id))
                    .map(item => (
                      <NavigationItemComponent
                        key={`favorite-${item.id}`}
                        item={item}
                        isActive={pathname === item.path}
                        isCollapsed={false}
                        config={finalConfig}
                        onNavigate={handleNavigate}
                        onFavorite={handleFavorite}
                        onBookmark={handleBookmark}
                        isFavorite={favorites.has(item.id)}
                        isBookmarked={bookmarks.has(item.id)}
                        onHover={setHoveredItem}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Recent items section */}
            {!isCollapsed && finalConfig.enableRecents && recentItems.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span>Recent</span>
                </div>
                <div className="space-y-0.5">
                  {recentItems.slice(0, 5).map(item => (
                    <NavigationItemComponent
                      key={`recent-${item.id}`}
                      item={item}
                      isActive={pathname === item.path}
                      isCollapsed={false}
                      config={finalConfig}
                      onNavigate={handleNavigate}
                      onFavorite={handleFavorite}
                      onBookmark={handleBookmark}
                      isFavorite={favorites.has(item.id)}
                      isBookmarked={bookmarks.has(item.id)}
                      onHover={setHoveredItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main navigation groups */}
            {filteredGroups.map(group => (
              <NavigationGroup
                key={group.id}
                group={group}
                isCollapsed={isCollapsed}
                isExpanded={expandedGroups.has(group.id)}
                config={finalConfig}
                currentPath={pathname}
                onToggleExpanded={toggleGroupExpansion}
                onNavigate={handleNavigate}
                onFavorite={handleFavorite}
                onBookmark={handleBookmark}
                favorites={favorites}
                bookmarks={bookmarks}
                onHover={setHoveredItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className={cn(
          'p-4 border-t border-gray-200 dark:border-gray-800',
          { 'px-2': isCollapsed }
        )}>
          {!isCollapsed ? (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>RBAC Data Governance</p>
              <p>v2.0.0</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default RBACNavigation;