// RBACBreadcrumb.tsx - Enterprise-grade breadcrumb navigation component for RBAC system
// Provides intelligent breadcrumb navigation with dynamic route detection and RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Shield,
  Users,
  Settings,
  Database,
  Activity,
  Eye,
  Lock,
  Crown,
  Key,
  Group,
  FolderOpen,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Filter,
  Star,
  Bookmark,
  History,
  Clock,
  MapPin,
  Globe,
  Tag,
  Hash,
  FileText,
  File,
  Folder,
  Server,
  Cloud,
  HardDrive,
  Network,
  Code,
  Terminal,
  Scan,
  ScanLine,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Share,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Navigation,
  Compass,
  Map,
  Route,
  Flag,
  Target,
  Zap,
  Gauge,
  BarChart3,
  PieChart,
  TrendingUp,
  Layers,
  Component,
  Package,
  Box,
  Workflow,
  GitBranch,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Sun,
  Moon,
  Monitor,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  ListMusic,
  Music,
  Headphones,
  Speaker,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Image,
  ImageOff,
  Paperclip,
  Link as LinkIcon,
  Unlink,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Code2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Brush,
  Pen,
  PenTool,
  Eraser,
  Scissors,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  ClipboardCheck,
  ClipboardX,
  Save,
  SaveAll,
  FolderPlus,
  FolderMinus,
  FolderCheck,
  FolderX,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileBarChart,
  Grid,
  LayoutGrid,
  LayoutList,
  Columns,
  Rows,
  Table,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Sidebar,
  SidebarOpen,
  SidebarClose,
  Menu,
  MenuSquare,
  MoreVertical,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  Move,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan as ScanIcon,
  QrCode,
  Barcode,
  Hash as HashIcon,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Ruble,
  IndianRupee,
  Bitcoin,
  Banknote,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  Abacus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { LoadingSpinner } from '../shared/LoadingStates';

// Breadcrumb types and interfaces
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isLoading?: boolean;
  permission?: string;
  metadata?: {
    type?: 'page' | 'section' | 'action' | 'entity';
    entityId?: string | number;
    category?: string;
    description?: string;
    lastModified?: Date;
    status?: 'active' | 'inactive' | 'pending' | 'error';
  };
  children?: BreadcrumbItem[];
  actions?: BreadcrumbAction[];
}

export interface BreadcrumbAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  permission?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost';
  shortcut?: string;
  tooltip?: string;
}

export interface BreadcrumbConfig {
  showHome: boolean;
  showIcons: boolean;
  showActions: boolean;
  showMetadata: boolean;
  maxItems: number;
  separator: 'chevron' | 'slash' | 'arrow' | 'dot';
  variant: 'default' | 'compact' | 'detailed' | 'minimal';
  interactive: boolean;
  collapsible: boolean;
  showTooltips: boolean;
  animationsEnabled: boolean;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
    };
  };
}

export interface RBACBreadcrumbProps {
  config?: Partial<BreadcrumbConfig>;
  customItems?: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  onActionClick?: (action: BreadcrumbAction, item: BreadcrumbItem) => void;
  className?: string;
  maxWidth?: string;
  showOverflow?: boolean;
  homeHref?: string;
  homeLabel?: string;
}

// Custom hooks for breadcrumb functionality
const useRouteDetection = () => {
  const pathname = usePathname();
  const { hasPermission } = usePermissionCheck();

  // Route mapping for the RBAC system and data governance platform
  const routeMap = useMemo(() => ({
    '/': {
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      type: 'page' as const
    },
    '/rbac': {
      label: 'RBAC System',
      icon: <Shield className="w-4 h-4" />,
      type: 'section' as const
    },
    '/rbac/dashboard': {
      label: 'Dashboard',
      icon: <Grid className="w-4 h-4" />,
      type: 'page' as const
    },
    '/rbac/users': {
      label: 'Users',
      icon: <Users className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'users:read'
    },
    '/rbac/users/create': {
      label: 'Create User',
      icon: <UserPlus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'users:create'
    },
    '/rbac/users/[id]': {
      label: 'User Details',
      icon: <UserCheck className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'users:read'
    },
    '/rbac/users/[id]/edit': {
      label: 'Edit User',
      icon: <Edit className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'users:update'
    },
    '/rbac/roles': {
      label: 'Roles',
      icon: <Crown className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'roles:read'
    },
    '/rbac/roles/create': {
      label: 'Create Role',
      icon: <Plus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'roles:create'
    },
    '/rbac/roles/[id]': {
      label: 'Role Details',
      icon: <Crown className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'roles:read'
    },
    '/rbac/permissions': {
      label: 'Permissions',
      icon: <Key className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'permissions:read'
    },
    '/rbac/groups': {
      label: 'Groups',
      icon: <Group className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'groups:read'
    },
    '/rbac/access-requests': {
      label: 'Access Requests',
      icon: <UserPlus className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'access_requests:read'
    },
    '/rbac/audit': {
      label: 'Audit Logs',
      icon: <History className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'audit:read'
    },
    '/rbac/settings': {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'settings:read'
    },
    '/rbac/security': {
      label: 'Security',
      icon: <ShieldCheck className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'security:read'
    },
    '/data-sources': {
      label: 'Data Sources',
      icon: <Server className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'data_sources:read'
    },
    '/data-sources/create': {
      label: 'Add Data Source',
      icon: <Plus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'data_sources:create'
    },
    '/data-sources/[id]': {
      label: 'Data Source Details',
      icon: <Database className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'data_sources:read'
    },
    '/catalog': {
      label: 'Data Catalog',
      icon: <FolderOpen className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'catalog:read'
    },
    '/catalog/assets': {
      label: 'Assets',
      icon: <Package className="w-4 h-4" />,
      type: 'page' as const,
      permission: 'catalog:read'
    },
    '/catalog/assets/[id]': {
      label: 'Asset Details',
      icon: <Box className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'catalog:read'
    },
    '/classifications': {
      label: 'Classifications',
      icon: <Tag className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'classifications:read'
    },
    '/classifications/create': {
      label: 'Create Classification',
      icon: <Plus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'classifications:create'
    },
    '/scan-rule-sets': {
      label: 'Scan Rule Sets',
      icon: <ScanLine className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'scan_rules:read'
    },
    '/scan-rule-sets/create': {
      label: 'Create Rule Set',
      icon: <Plus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'scan_rules:create'
    },
    '/scan-rule-sets/[id]': {
      label: 'Rule Set Details',
      icon: <ScanLine className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'scan_rules:read'
    },
    '/scan-logic': {
      label: 'Scan Logic',
      icon: <Scan className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'scan_logic:read'
    },
    '/scan-logic/run': {
      label: 'Run Scan',
      icon: <Play className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'scan:execute'
    },
    '/compliance-rule': {
      label: 'Compliance Rules',
      icon: <FileText className="w-4 h-4" />,
      type: 'section' as const,
      permission: 'compliance:read'
    },
    '/compliance-rule/create': {
      label: 'Create Rule',
      icon: <Plus className="w-4 h-4" />,
      type: 'action' as const,
      permission: 'compliance:create'
    },
    '/compliance-rule/[id]': {
      label: 'Rule Details',
      icon: <FileText className="w-4 h-4" />,
      type: 'entity' as const,
      permission: 'compliance:read'
    }
  }), []);

  // Generate breadcrumb items from current pathname
  const generateBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home item
    breadcrumbs.push({
      id: 'home',
      label: 'Home',
      href: '/',
      icon: <Home className="w-4 h-4" />,
      metadata: { type: 'page' }
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      
      // Check for dynamic routes (with [id] parameters)
      let routeKey = currentPath;
      const routeInfo = routeMap[routeKey as keyof typeof routeMap];
      
      // If not found, try with dynamic route pattern
      if (!routeInfo && /\/\d+$/.test(currentPath)) {
        const dynamicRoute = currentPath.replace(/\/\d+$/, '/[id]');
        const dynamicRouteInfo = routeMap[dynamicRoute as keyof typeof routeMap];
        if (dynamicRouteInfo) {
          const entityId = segments[i];
          breadcrumbs.push({
            id: `${dynamicRoute}-${entityId}`,
            label: `${dynamicRouteInfo.label} #${entityId}`,
            href: currentPath,
            icon: dynamicRouteInfo.icon,
            isActive: i === segments.length - 1,
            metadata: {
              type: dynamicRouteInfo.type,
              entityId: entityId
            }
          });
          continue;
        }
      }

      if (routeInfo) {
        // Check permissions
        if (routeInfo.permission && !hasPermission(routeInfo.permission)) {
          continue;
        }

        breadcrumbs.push({
          id: routeKey,
          label: routeInfo.label,
          href: currentPath,
          icon: routeInfo.icon,
          isActive: i === segments.length - 1,
          permission: routeInfo.permission,
          metadata: {
            type: routeInfo.type
          }
        });
      } else {
        // Fallback for unknown routes
        const label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' ');
        breadcrumbs.push({
          id: routeKey,
          label: label,
          href: currentPath,
          isActive: i === segments.length - 1,
          metadata: { type: 'page' }
        });
      }
    }

    return breadcrumbs;
  }, [pathname, routeMap, hasPermission]);

  return {
    breadcrumbs: generateBreadcrumbs(),
    routeMap
  };
};

const useBreadcrumbActions = (item: BreadcrumbItem) => {
  const router = useRouter();
  const { hasPermission } = usePermissionCheck();

  const getActionsForItem = useCallback((breadcrumbItem: BreadcrumbItem): BreadcrumbAction[] => {
    const actions: BreadcrumbAction[] = [];
    const { metadata } = breadcrumbItem;

    // Actions based on item type and context
    if (metadata?.type === 'entity') {
      // Entity-specific actions
      if (breadcrumbItem.href?.includes('/users/') && hasPermission('users:update')) {
        actions.push({
          id: 'edit-user',
          label: 'Edit',
          icon: <Edit className="w-3 h-3" />,
          onClick: () => router.push(`${breadcrumbItem.href}/edit`),
          permission: 'users:update',
          tooltip: 'Edit this user'
        });
      }

      if (breadcrumbItem.href?.includes('/roles/') && hasPermission('roles:update')) {
        actions.push({
          id: 'edit-role',
          label: 'Edit',
          icon: <Edit className="w-3 h-3" />,
          onClick: () => router.push(`${breadcrumbItem.href}/edit`),
          permission: 'roles:update',
          tooltip: 'Edit this role'
        });
      }

      // Generic entity actions
      actions.push({
        id: 'copy-link',
        label: 'Copy Link',
        icon: <Copy className="w-3 h-3" />,
        onClick: () => {
          if (breadcrumbItem.href) {
            navigator.clipboard.writeText(window.location.origin + breadcrumbItem.href);
          }
        },
        tooltip: 'Copy link to this item'
      });
    }

    if (metadata?.type === 'page') {
      // Page-specific actions
      actions.push({
        id: 'refresh',
        label: 'Refresh',
        icon: <RefreshCw className="w-3 h-3" />,
        onClick: () => window.location.reload(),
        shortcut: 'F5',
        tooltip: 'Refresh page'
      });

      if (breadcrumbItem.href?.includes('/users') && hasPermission('users:create')) {
        actions.push({
          id: 'create-user',
          label: 'Create User',
          icon: <UserPlus className="w-3 h-3" />,
          onClick: () => router.push('/rbac/users/create'),
          permission: 'users:create',
          variant: 'primary',
          tooltip: 'Create new user'
        });
      }
    }

    return actions;
  }, [router, hasPermission]);

  return getActionsForItem(item);
};

// Breadcrumb item component
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  isLast: boolean;
  separator: BreadcrumbConfig['separator'];
  config: BreadcrumbConfig;
  onItemClick?: (item: BreadcrumbItem) => void;
  onActionClick?: (action: BreadcrumbAction, item: BreadcrumbItem) => void;
}> = ({ item, isLast, separator, config, onItemClick, onActionClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actions = useBreadcrumbActions(item);

  const getSeparatorIcon = () => {
    switch (separator) {
      case 'slash':
        return '/';
      case 'arrow':
        return <ArrowRight className="w-3 h-3" />;
      case 'dot':
        return '•';
      default:
        return <ChevronRight className="w-3 h-3" />;
    }
  };

  const handleItemClick = useCallback(() => {
    if (onItemClick) {
      onItemClick(item);
    }
  }, [item, onItemClick]);

  const handleActionClick = useCallback((action: BreadcrumbAction) => {
    if (onActionClick) {
      onActionClick(action, item);
    }
    setActionsOpen(false);
  }, [item, onActionClick]);

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div className="flex items-center">
      {/* Breadcrumb Item */}
      <motion.div
        className="relative flex items-center group"
        variants={config.animationsEnabled ? itemVariants : undefined}
        initial={config.animationsEnabled ? "hidden" : undefined}
        animate={config.animationsEnabled ? "visible" : undefined}
        whileHover={config.animationsEnabled ? "hover" : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.href && !item.isActive ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg text-sm transition-all duration-200",
              "hover:bg-accent/10 hover:text-accent-foreground",
              config.variant === 'compact' && "px-1 py-0.5 text-xs",
              config.variant === 'detailed' && "px-3 py-2",
              config.variant === 'minimal' && "px-1 py-0.5 hover:bg-transparent",
              item.isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleItemClick}
          >
            {config.showIcons && item.icon && (
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.15 }}
              >
                {item.icon}
              </motion.div>
            )}
            <span className="truncate max-w-[150px]">{item.label}</span>
            {item.isLoading && (
              <LoadingSpinner size="sm" className="ml-1" />
            )}
          </Link>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg text-sm",
              config.variant === 'compact' && "px-1 py-0.5 text-xs",
              config.variant === 'detailed' && "px-3 py-2",
              config.variant === 'minimal' && "px-1 py-0.5",
              item.isActive ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {config.showIcons && item.icon && (
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.15 }}
              >
                {item.icon}
              </motion.div>
            )}
            <span className="truncate max-w-[150px]">{item.label}</span>
            {item.isLoading && (
              <LoadingSpinner size="sm" className="ml-1" />
            )}
          </div>
        )}

        {/* Actions */}
        {config.showActions && actions.length > 0 && isHovered && (
          <motion.div
            className="relative ml-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <button
              className="p-1 rounded hover:bg-accent/20 transition-colors"
              onClick={() => setActionsOpen(!actionsOpen)}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {actionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[120px]"
                >
                  <div className="p-1">
                    {actions.map((action) => (
                      <motion.button
                        key={action.id}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent/10 transition-colors text-left",
                          action.variant === 'primary' && "text-primary",
                          action.variant === 'destructive' && "text-destructive"
                        )}
                        onClick={() => handleActionClick(action)}
                        whileHover={{ backgroundColor: 'rgba(var(--accent), 0.1)' }}
                        title={action.tooltip}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <kbd className="ml-auto text-xs bg-muted px-1 py-0.5 rounded">
                            {action.shortcut}
                          </kbd>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Metadata tooltip */}
        {config.showTooltips && config.showMetadata && item.metadata && isHovered && (
          <motion.div
            className="absolute top-full left-0 mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg z-50 whitespace-nowrap border border-border"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="space-y-1">
              <div className="font-medium">{item.label}</div>
              {item.metadata.type && (
                <div className="text-muted-foreground">
                  Type: {item.metadata.type}
                </div>
              )}
              {item.metadata.entityId && (
                <div className="text-muted-foreground">
                  ID: {item.metadata.entityId}
                </div>
              )}
              {item.metadata.description && (
                <div className="text-muted-foreground max-w-[200px]">
                  {item.metadata.description}
                </div>
              )}
              {item.metadata.status && (
                <div className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                  item.metadata.status === 'active' && "bg-green-100 text-green-800",
                  item.metadata.status === 'inactive' && "bg-gray-100 text-gray-800",
                  item.metadata.status === 'pending' && "bg-yellow-100 text-yellow-800",
                  item.metadata.status === 'error' && "bg-red-100 text-red-800"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    item.metadata.status === 'active' && "bg-green-500",
                    item.metadata.status === 'inactive' && "bg-gray-500",
                    item.metadata.status === 'pending' && "bg-yellow-500",
                    item.metadata.status === 'error' && "bg-red-500"
                  )} />
                  {item.metadata.status}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Separator */}
      {!isLast && (
        <div className={cn(
          "mx-2 text-muted-foreground flex items-center",
          config.variant === 'compact' && "mx-1",
          config.variant === 'minimal' && "mx-1"
        )}>
          {getSeparatorIcon()}
        </div>
      )}
    </div>
  );
};

// Overflow menu component
const OverflowMenu: React.FC<{
  items: BreadcrumbItem[];
  config: BreadcrumbConfig;
  onItemClick?: (item: BreadcrumbItem) => void;
}> = ({ items, config, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MoreHorizontal className="w-4 h-4" />
        <span>{items.length} more</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[200px]"
          >
            <div className="p-2 space-y-1">
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent/10 transition-colors text-left"
                  onClick={() => {
                    if (onItemClick) {
                      onItemClick(item);
                    }
                    setIsOpen(false);
                  }}
                  whileHover={{ backgroundColor: 'rgba(var(--accent), 0.1)' }}
                >
                  {config.showIcons && item.icon && (
                    <div className="flex-shrink-0">{item.icon}</div>
                  )}
                  <span className="truncate">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main RBACBreadcrumb component
export const RBACBreadcrumb: React.FC<RBACBreadcrumbProps> = ({
  config: configOverrides = {},
  customItems,
  onItemClick,
  onActionClick,
  className,
  maxWidth = '100%',
  showOverflow = true,
  homeHref = '/',
  homeLabel = 'Home'
}) => {
  const { currentUser } = useCurrentUser();
  const { breadcrumbs: detectedBreadcrumbs } = useRouteDetection();
  const router = useRouter();

  // Configuration with defaults
  const config: BreadcrumbConfig = useMemo(() => ({
    showHome: true,
    showIcons: true,
    showActions: true,
    showMetadata: true,
    maxItems: 5,
    separator: 'chevron',
    variant: 'default',
    interactive: true,
    collapsible: true,
    showTooltips: true,
    animationsEnabled: true,
    theme: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))'
      }
    },
    ...configOverrides
  }), [configOverrides]);

  // Use custom items or detected breadcrumbs
  const items = useMemo(() => {
    if (customItems) {
      return customItems;
    }

    const breadcrumbs = [...detectedBreadcrumbs];
    
    // Update home item if customized
    if (breadcrumbs.length > 0 && config.showHome) {
      breadcrumbs[0] = {
        ...breadcrumbs[0],
        href: homeHref,
        label: homeLabel
      };
    }

    return breadcrumbs;
  }, [customItems, detectedBreadcrumbs, config.showHome, homeHref, homeLabel]);

  // Handle overflow
  const { visibleItems, overflowItems } = useMemo(() => {
    if (!config.collapsible || items.length <= config.maxItems) {
      return { visibleItems: items, overflowItems: [] };
    }

    // Always show home and last item, collapse middle items
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const middleItems = items.slice(1, -1);
    const maxMiddleItems = config.maxItems - 2; // Reserve space for first and last

    if (middleItems.length <= maxMiddleItems) {
      return { visibleItems: items, overflowItems: [] };
    }

    const visibleMiddleItems = middleItems.slice(-maxMiddleItems);
    const overflowMiddleItems = middleItems.slice(0, -maxMiddleItems);

    return {
      visibleItems: [firstItem, ...visibleMiddleItems, lastItem],
      overflowItems: overflowMiddleItems
    };
  }, [items, config.maxItems, config.collapsible]);

  // Handle item click
  const handleItemClick = useCallback((item: BreadcrumbItem) => {
    if (item.href && config.interactive) {
      router.push(item.href);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  }, [router, config.interactive, onItemClick]);

  // Handle action click
  const handleActionClick = useCallback((action: BreadcrumbAction, item: BreadcrumbItem) => {
    action.onClick();
    if (onActionClick) {
      onActionClick(action, item);
    }
  }, [onActionClick]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  return (
    <motion.nav
      className={cn(
        "flex items-center overflow-hidden",
        config.variant === 'compact' && "text-sm",
        config.variant === 'minimal' && "text-sm",
        config.variant === 'detailed' && "text-base",
        className
      )}
      style={{ maxWidth }}
      variants={config.animationsEnabled ? containerVariants : undefined}
      initial={config.animationsEnabled ? "hidden" : undefined}
      animate={config.animationsEnabled ? "visible" : undefined}
      aria-label="Breadcrumb navigation"
    >
      <div className="flex items-center min-w-0 flex-1">
        {/* Overflow indicator */}
        {showOverflow && overflowItems.length > 0 && (
          <>
            <OverflowMenu
              items={overflowItems}
              config={config}
              onItemClick={handleItemClick}
            />
            <div className={cn(
              "mx-2 text-muted-foreground flex items-center",
              config.variant === 'compact' && "mx-1",
              config.variant === 'minimal' && "mx-1"
            )}>
              <ChevronRight className="w-3 h-3" />
            </div>
          </>
        )}

        {/* Visible breadcrumb items */}
        {visibleItems.map((item, index) => (
          <BreadcrumbItemComponent
            key={item.id}
            item={item}
            isLast={index === visibleItems.length - 1}
            separator={config.separator}
            config={config}
            onItemClick={handleItemClick}
            onActionClick={handleActionClick}
          />
        ))}
      </div>
    </motion.nav>
  );
};

export default RBACBreadcrumb;