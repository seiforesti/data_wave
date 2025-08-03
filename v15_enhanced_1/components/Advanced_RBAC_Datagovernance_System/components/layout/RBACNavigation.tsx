// RBACNavigation.tsx - Enterprise-grade navigation component for RBAC system
// Provides hierarchical navigation structure with advanced RBAC integration and intelligent UX

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Home,
  Shield,
  Users,
  Settings,
  Database,
  Activity,
  Eye,
  Lock,
  Unlock,
  Search,
  Star,
  Bookmark,
  History,
  Clock,
  Zap,
  Filter,
  Grid,
  List,
  Layers,
  Globe,
  MapPin,
  Target,
  Gauge,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  FolderOpen,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Minus,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Share,
  Download,
  Upload,
  RefreshCw,
  HelpCircle,
  MessageCircle,
  Bell,
  Mail,
  Calendar,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Group,
  Crown,
  Key,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Scan,
  ScanLine,
  ScanText,
  ScanSearch,
  Code,
  Braces,
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
  Flag,
  Bookmark as BookmarkIcon,
  Tag,
  Hash,
  At,
  Phone,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Tv,
  Speaker,
  Headphones,
  Mic,
  Camera,
  Video,
  Image,
  File,
  Folder,
  FolderPlus,
  FolderMinus,
  FolderCheck,
  FolderX,
  Package,
  PackageOpen,
  PackageCheck,
  PackageX,
  Box,
  Container,
  Layers3,
  Component,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Bus,
  Train,
  Rocket,
  Satellite as SatelliteIcon,
  Earth,
  Sun,
  Moon,
  Star as StarIcon,
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
  List as ListIcon,
  ListOrdered,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Wink,
  Kiss,
  Surprised,
  Confused,
  Sleepy,
  Dizzy,
  Expressionless,
  Neutral,
  Thinking,
  Shushing,
  Hugging,
  Saluting,
  Partying,
  Sleeping,
  Sneezing,
  Vomiting,
  HotFace,
  ColdFace,
  WoozyFace,
  DisguisedFace,
  PleadingFace
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { LoadingSpinner } from '../shared/LoadingStates';

// Navigation types and interfaces
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning' | 'success';
    count?: number;
  };
  children?: NavigationItem[];
  permission?: string;
  requiredRole?: string;
  requiredGroup?: string;
  hidden?: boolean;
  disabled?: boolean;
  external?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  shortcut?: string;
  tooltip?: string;
  description?: string;
  category?: string;
  order?: number;
  favorite?: boolean;
  recent?: boolean;
  quickAccess?: boolean;
  metadata?: Record<string, any>;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsed?: boolean;
  permission?: string;
  order?: number;
  icon?: React.ReactNode;
  description?: string;
}

export interface NavigationConfig {
  layout: 'sidebar' | 'horizontal' | 'mega' | 'tabs';
  collapsible: boolean;
  searchable: boolean;
  favorites: boolean;
  recents: boolean;
  breadcrumbs: boolean;
  badges: boolean;
  tooltips: boolean;
  animations: boolean;
  keyboardNavigation: boolean;
  contextMenus: boolean;
  dragAndDrop: boolean;
  persistence: boolean;
  theme: {
    variant: 'default' | 'compact' | 'comfortable' | 'spacious';
    colors: {
      background: string;
      foreground: string;
      muted: string;
      accent: string;
      border: string;
    };
  };
}

export interface RBACNavigationProps {
  config?: Partial<NavigationConfig>;
  items?: NavigationItem[];
  groups?: NavigationGroup[];
  onItemClick?: (item: NavigationItem) => void;
  onGroupToggle?: (groupId: string, collapsed: boolean) => void;
  className?: string;
  collapsed?: boolean;
  searchPlaceholder?: string;
  emptyStateText?: string;
  loadingText?: string;
}

// Custom hooks for navigation functionality
const useNavigationState = () => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recents, setRecents] = useState<NavigationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const addToRecents = useCallback((item: NavigationItem) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.id !== item.id);
      return [item, ...filtered].slice(0, 10);
    });
  }, []);

  return {
    expandedGroups,
    expandedItems,
    favorites,
    recents,
    searchQuery,
    selectedItem,
    setSearchQuery,
    setSelectedItem,
    toggleGroup,
    toggleItem,
    toggleFavorite,
    addToRecents
  };
};

const useKeyboardNavigation = (
  items: NavigationItem[],
  onItemSelect: (item: NavigationItem) => void
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            onItemSelect(items[focusedIndex]);
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onItemSelect]);

  return { focusedIndex, setFocusedIndex };
};

// Default navigation structure for RBAC system
const getDefaultNavigation = (): NavigationGroup[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    order: 1,
    icon: <Home className="w-4 h-4" />,
    items: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/rbac/dashboard',
        icon: <Grid className="w-4 h-4" />,
        description: 'System overview and key metrics'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/rbac/analytics',
        icon: <BarChart3 className="w-4 h-4" />,
        permission: 'analytics:read',
        description: 'Advanced analytics and reporting'
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        href: '/rbac/monitoring',
        icon: <Activity className="w-4 h-4" />,
        permission: 'monitoring:read',
        description: 'Real-time system monitoring'
      }
    ]
  },
  {
    id: 'identity',
    label: 'Identity & Access',
    order: 2,
    icon: <Shield className="w-4 h-4" />,
    items: [
      {
        id: 'users',
        label: 'Users',
        href: '/rbac/users',
        icon: <Users className="w-4 h-4" />,
        permission: 'users:read',
        description: 'User management and profiles',
        badge: { text: 'Active', variant: 'success' }
      },
      {
        id: 'roles',
        label: 'Roles',
        href: '/rbac/roles',
        icon: <Crown className="w-4 h-4" />,
        permission: 'roles:read',
        description: 'Role definitions and assignments'
      },
      {
        id: 'permissions',
        label: 'Permissions',
        href: '/rbac/permissions',
        icon: <Key className="w-4 h-4" />,
        permission: 'permissions:read',
        description: 'Permission management'
      },
      {
        id: 'groups',
        label: 'Groups',
        href: '/rbac/groups',
        icon: <Group className="w-4 h-4" />,
        permission: 'groups:read',
        description: 'User groups and hierarchies'
      },
      {
        id: 'access-requests',
        label: 'Access Requests',
        href: '/rbac/access-requests',
        icon: <UserPlus className="w-4 h-4" />,
        permission: 'access_requests:read',
        description: 'Pending and processed access requests',
        badge: { text: '3', variant: 'warning', count: 3 }
      }
    ]
  },
  {
    id: 'data-governance',
    label: 'Data Governance',
    order: 3,
    icon: <Database className="w-4 h-4" />,
    items: [
      {
        id: 'data-sources',
        label: 'Data Sources',
        href: '/data-sources',
        icon: <Server className="w-4 h-4" />,
        permission: 'data_sources:read',
        description: 'Connected data sources and connectors'
      },
      {
        id: 'catalog',
        label: 'Data Catalog',
        href: '/catalog',
        icon: <FolderOpen className="w-4 h-4" />,
        permission: 'catalog:read',
        description: 'Data asset catalog and metadata'
      },
      {
        id: 'classifications',
        label: 'Classifications',
        href: '/classifications',
        icon: <Tag className="w-4 h-4" />,
        permission: 'classifications:read',
        description: 'Data classification and tagging'
      },
      {
        id: 'scan-rules',
        label: 'Scan Rules',
        href: '/scan-rule-sets',
        icon: <ScanLine className="w-4 h-4" />,
        permission: 'scan_rules:read',
        description: 'Data scanning rules and policies'
      },
      {
        id: 'scan-logic',
        label: 'Scan Logic',
        href: '/scan-logic',
        icon: <Scan className="w-4 h-4" />,
        permission: 'scan_logic:read',
        description: 'Advanced scanning logic and engines'
      }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    order: 4,
    icon: <ShieldCheck className="w-4 h-4" />,
    items: [
      {
        id: 'compliance-rules',
        label: 'Compliance Rules',
        href: '/compliance-rule',
        icon: <FileText className="w-4 h-4" />,
        permission: 'compliance:read',
        description: 'Compliance rules and regulations'
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '/rbac/audit',
        icon: <History className="w-4 h-4" />,
        permission: 'audit:read',
        description: 'System audit logs and trails'
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/rbac/reports',
        icon: <FileText className="w-4 h-4" />,
        permission: 'reports:read',
        description: 'Compliance reports and documentation'
      },
      {
        id: 'violations',
        label: 'Violations',
        href: '/rbac/violations',
        icon: <AlertTriangle className="w-4 h-4" />,
        permission: 'violations:read',
        description: 'Policy violations and incidents',
        badge: { text: '2', variant: 'destructive', count: 2 }
      }
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    order: 5,
    icon: <Settings className="w-4 h-4" />,
    items: [
      {
        id: 'system-config',
        label: 'System Configuration',
        href: '/rbac/system',
        icon: <Settings className="w-4 h-4" />,
        permission: 'system:admin',
        description: 'System-wide configuration settings'
      },
      {
        id: 'security-policies',
        label: 'Security Policies',
        href: '/rbac/security',
        icon: <Lock className="w-4 h-4" />,
        permission: 'security:admin',
        description: 'Security policies and configurations'
      },
      {
        id: 'integrations',
        label: 'Integrations',
        href: '/rbac/integrations',
        icon: <Globe className="w-4 h-4" />,
        permission: 'integrations:admin',
        description: 'External system integrations'
      },
      {
        id: 'backup-recovery',
        label: 'Backup & Recovery',
        href: '/rbac/backup',
        icon: <Archive className="w-4 h-4" />,
        permission: 'backup:admin',
        description: 'System backup and recovery options'
      }
    ]
  }
];

// Navigation item component
const NavigationItemComponent: React.FC<{
  item: NavigationItem;
  level: number;
  isExpanded: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
  onToggle: () => void;
  onFavoriteToggle: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  config: NavigationConfig;
}> = ({
  item,
  level,
  isExpanded,
  isFavorite,
  isSelected,
  isFocused,
  onClick,
  onToggle,
  onFavoriteToggle,
  onContextMenu,
  config
}) => {
  const { hasPermission } = usePermissionCheck();
  const hasChildren = item.children && item.children.length > 0;
  const canAccess = !item.permission || hasPermission(item.permission);

  if (item.hidden || !canAccess) {
    return null;
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    hover: { 
      backgroundColor: 'rgba(var(--accent), 0.1)',
      transition: { duration: 0.15 }
    },
    focus: {
      backgroundColor: 'rgba(var(--accent), 0.15)',
      boxShadow: '0 0 0 2px rgba(var(--accent), 0.3)'
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn(
        "relative group",
        level > 0 && "ml-4"
      )}
    >
      <motion.div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200",
          "hover:bg-accent/10 focus:bg-accent/15 focus:outline-none focus:ring-2 focus:ring-accent/30",
          isSelected && "bg-accent/20 text-accent-foreground",
          isFocused && "bg-accent/15 ring-2 ring-accent/30",
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          config.theme.variant === 'compact' && "px-2 py-1.5 text-xs",
          config.theme.variant === 'spacious' && "px-4 py-3 text-base"
        )}
        onClick={onClick}
        onContextMenu={onContextMenu}
        animate={isFocused ? "focus" : "visible"}
        tabIndex={0}
        role="button"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-disabled={item.disabled}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <motion.button
            className="flex items-center justify-center w-4 h-4 hover:bg-accent/20 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3" />
          </motion.button>
        )}

        {/* Item Icon */}
        {item.icon && (
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.15 }}
          >
            {item.icon}
          </motion.div>
        )}

        {/* Item Label */}
        <span className="flex-1 truncate">{item.label}</span>

        {/* Badge */}
        {item.badge && config.badges && (
          <motion.div
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              item.badge.variant === 'primary' && "bg-primary text-primary-foreground",
              item.badge.variant === 'secondary' && "bg-secondary text-secondary-foreground",
              item.badge.variant === 'destructive' && "bg-destructive text-destructive-foreground",
              item.badge.variant === 'warning' && "bg-yellow-500 text-white",
              item.badge.variant === 'success' && "bg-green-500 text-white",
              (!item.badge.variant || item.badge.variant === 'default') && "bg-muted text-muted-foreground"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {item.badge.text}
          </motion.div>
        )}

        {/* Favorite Toggle */}
        {config.favorites && (
          <motion.button
            className={cn(
              "opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-opacity",
              isFavorite && "opacity-100 text-yellow-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
          </motion.button>
        )}

        {/* External Link Indicator */}
        {item.external && (
          <ExternalLink className="w-3 h-3 opacity-60" />
        )}

        {/* Keyboard Shortcut */}
        {item.shortcut && (
          <span className="text-xs opacity-60 font-mono">{item.shortcut}</span>
        )}
      </motion.div>

      {/* Tooltip */}
      {config.tooltips && (item.tooltip || item.description) && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          {item.tooltip || item.description}
        </div>
      )}

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-4 border-l border-border/50 ml-2">
              {item.children?.map((child) => (
                <NavigationItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                  isExpanded={false}
                  isFavorite={false}
                  isSelected={false}
                  isFocused={false}
                  onClick={() => {}}
                  onToggle={() => {}}
                  onFavoriteToggle={() => {}}
                  onContextMenu={() => {}}
                  config={config}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Navigation group component
const NavigationGroupComponent: React.FC<{
  group: NavigationGroup;
  isExpanded: boolean;
  onToggle: () => void;
  config: NavigationConfig;
  navigationState: any;
  onItemClick: (item: NavigationItem) => void;
}> = ({ group, isExpanded, onToggle, config, navigationState, onItemClick }) => {
  const { hasPermission } = usePermissionCheck();
  const canAccess = !group.permission || hasPermission(group.permission);

  if (!canAccess) {
    return null;
  }

  const groupVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={groupVariants}
      initial="hidden"
      animate="visible"
      className="mb-4"
    >
      {/* Group Header */}
      <motion.button
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg transition-colors",
          config.theme.variant === 'compact' && "px-2 py-1.5 text-xs",
          config.theme.variant === 'spacious' && "px-4 py-3 text-base"
        )}
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(var(--muted), 0.5)' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Group Icon */}
        {group.icon && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {group.icon}
          </motion.div>
        )}

        {/* Expand/Collapse Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Group Label */}
        <span className="flex-1 text-left">{group.label}</span>

        {/* Item Count */}
        <span className="text-xs opacity-60">
          {group.items.filter(item => 
            !item.hidden && (!item.permission || hasPermission(item.permission))
          ).length}
        </span>
      </motion.button>

      {/* Group Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-2 mt-1 space-y-1">
              {group.items.map((item) => (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  level={0}
                  isExpanded={navigationState.expandedItems.has(item.id)}
                  isFavorite={navigationState.favorites.has(item.id)}
                  isSelected={navigationState.selectedItem === item.id}
                  isFocused={false}
                  onClick={() => onItemClick(item)}
                  onToggle={() => navigationState.toggleItem(item.id)}
                  onFavoriteToggle={() => navigationState.toggleFavorite(item.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Handle context menu
                  }}
                  config={config}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Search component
const NavigationSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = "Search navigation...", className }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={cn(
        "relative mb-4",
        className
      )}
      whileFocusWithin={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "placeholder:text-muted-foreground transition-all duration-200"
          )}
        />
        {value && (
          <motion.button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent/20 rounded"
            onClick={() => onChange('')}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </div>
      
      {/* Search suggestions or results could go here */}
      <AnimatePresence>
        {isFocused && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {/* Search results would be rendered here */}
            <div className="p-2 text-sm text-muted-foreground">
              Search functionality can be extended here
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main RBACNavigation component
export const RBACNavigation: React.FC<RBACNavigationProps> = ({
  config: configOverrides = {},
  items,
  groups,
  onItemClick,
  onGroupToggle,
  className,
  collapsed = false,
  searchPlaceholder,
  emptyStateText = "No navigation items available",
  loadingText = "Loading navigation..."
}) => {
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const { isConnected, connectionState } = useRBACWebSocket();
  const router = useRouter();
  const pathname = usePathname();

  // Navigation state management
  const navigationState = useNavigationState();

  // Configuration with defaults
  const config: NavigationConfig = useMemo(() => ({
    layout: 'sidebar',
    collapsible: true,
    searchable: true,
    favorites: true,
    recents: true,
    breadcrumbs: true,
    badges: true,
    tooltips: true,
    animations: true,
    keyboardNavigation: true,
    contextMenus: true,
    dragAndDrop: false,
    persistence: true,
    theme: {
      variant: 'default',
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))'
      }
    },
    ...configOverrides
  }), [configOverrides]);

  // Navigation data
  const navigationGroups = useMemo(() => {
    return groups || getDefaultNavigation();
  }, [groups]);

  // Filtered navigation based on search
  const filteredGroups = useMemo(() => {
    if (!navigationState.searchQuery) {
      return navigationGroups;
    }

    const query = navigationState.searchQuery.toLowerCase();
    return navigationGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [navigationGroups, navigationState.searchQuery]);

  // Handle item click
  const handleItemClick = useCallback((item: NavigationItem) => {
    if (item.disabled) return;

    // Update selected item
    navigationState.setSelectedItem(item.id);

    // Add to recents
    navigationState.addToRecents(item);

    // Handle navigation
    if (item.href) {
      if (item.external) {
        window.open(item.href, item.target || '_blank');
      } else {
        router.push(item.href);
      }
    }

    // Custom onClick handler
    if (item.onClick) {
      item.onClick();
    }

    // Parent callback
    if (onItemClick) {
      onItemClick(item);
    }
  }, [navigationState, router, onItemClick]);

  // Keyboard navigation
  const flattenedItems = useMemo(() => {
    const items: NavigationItem[] = [];
    filteredGroups.forEach(group => {
      group.items.forEach(item => {
        items.push(item);
        if (item.children && navigationState.expandedItems.has(item.id)) {
          items.push(...item.children);
        }
      });
    });
    return items;
  }, [filteredGroups, navigationState.expandedItems]);

  const { focusedIndex } = useKeyboardNavigation(flattenedItems, handleItemClick);

  // Update selected item based on current pathname
  useEffect(() => {
    const findItemByPath = (items: NavigationItem[], path: string): NavigationItem | null => {
      for (const item of items) {
        if (item.href === path) {
          return item;
        }
        if (item.children) {
          const found = findItemByPath(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const allItems = navigationGroups.flatMap(group => group.items);
    const currentItem = findItemByPath(allItems, pathname);
    
    if (currentItem) {
      navigationState.setSelectedItem(currentItem.id);
    }
  }, [pathname, navigationGroups, navigationState]);

  // Loading state
  if (userLoading) {
    return (
      <div className={cn("p-4 space-y-4", className)}>
        <div className="text-center">
          <LoadingSpinner size="sm" />
          <p className="text-sm text-muted-foreground mt-2">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredGroups.length === 0) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <div className="text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyStateText}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.nav
      className={cn(
        "flex flex-col h-full overflow-hidden",
        config.theme.variant === 'compact' && "text-sm",
        config.theme.variant === 'spacious' && "text-base",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Connection Status */}
      {!isConnected && (
        <motion.div
          className="px-3 py-2 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Connection unstable</span>
          </div>
        </motion.div>
      )}

      {/* Search */}
      {config.searchable && (
        <div className="px-3">
          <NavigationSearch
            value={navigationState.searchQuery}
            onChange={navigationState.setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Favorites */}
      {config.favorites && navigationState.favorites.size > 0 && (
        <motion.div
          className="px-3 mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
            Favorites
          </div>
          <div className="space-y-1">
            {/* Render favorite items */}
          </div>
        </motion.div>
      )}

      {/* Recent Items */}
      {config.recents && navigationState.recents.length > 0 && (
        <motion.div
          className="px-3 mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
            Recent
          </div>
          <div className="space-y-1">
            {navigationState.recents.slice(0, 5).map((item) => (
              <NavigationItemComponent
                key={`recent-${item.id}`}
                item={item}
                level={0}
                isExpanded={false}
                isFavorite={navigationState.favorites.has(item.id)}
                isSelected={navigationState.selectedItem === item.id}
                isFocused={false}
                onClick={() => handleItemClick(item)}
                onToggle={() => {}}
                onFavoriteToggle={() => navigationState.toggleFavorite(item.id)}
                onContextMenu={() => {}}
                config={config}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {filteredGroups.map((group) => (
          <NavigationGroupComponent
            key={group.id}
            group={group}
            isExpanded={navigationState.expandedGroups.has(group.id)}
            onToggle={() => {
              navigationState.toggleGroup(group.id);
              if (onGroupToggle) {
                onGroupToggle(group.id, navigationState.expandedGroups.has(group.id));
              }
            }}
            config={config}
            navigationState={navigationState}
            onItemClick={handleItemClick}
          />
        ))}
      </div>

      {/* Navigation Footer */}
      <motion.div
        className="px-3 py-2 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>v2.0.0</span>
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default RBACNavigation;