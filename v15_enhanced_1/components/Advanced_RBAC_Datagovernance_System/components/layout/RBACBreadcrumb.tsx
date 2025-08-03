// RBACBreadcrumb.tsx - Enterprise-grade breadcrumb navigation component for RBAC system
// Provides intelligent breadcrumb navigation with RBAC integration, dynamic path resolution, and advanced UX patterns

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Home,
  Shield,
  Users,
  Database,
  Settings,
  Activity,
  Eye,
  Lock,
  Unlock,
  Key,
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  Star,
  Heart,
  Bookmark,
  Clock,
  Calendar,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Route,
  Map,
  Layers,
  Grid,
  List,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Link,
  Unlink,
  LinkBreak,
  Share2,
  Send,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Repeat,
  Shuffle,
  Music,
  Video,
  Image,
  Camera,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Tv,
  Radio,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  Battery,
  BatteryLow,
  BatteryCharging,
  Power,
  PowerOff,
  Plug,
  PlugZap,
  Zap,
  Flash,
  Bolt,
  Lightning,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Droplets,
  Wind,
  Thermometer,
  Snowflake,
  Flame,
  Fire,
  Lightbulb,
  Candle,
  Lamp,
  Flashlight,
  Spotlight,
  Target,
  Crosshair,
  Focus,
  Scope,
  Binoculars,
  Telescope,
  Microscope,
  Scan,
  QrCode,
  Barcode,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  PiggyBank,
  Safe,
  Vault,
  Calculator,
  Abacus,
  Scale,
  Ruler,
  Scissors,
  Paperclip,
  Pin,
  Pushpin,
  Thumbtack,
  Magnet,
  Anchor,
  Ship,
  Plane,
  Car,
  Truck,
  Bus,
  Train,
  Bike,
  Motorcycle,
  Scooter,
  Skateboard,
  Rocket,
  Satellite,
  Earth,
  Globe2,
  World,
  Continent,
  Mountain,
  Hill,
  Volcano,
  Desert,
  Forest,
  Tree,
  TreePine,
  TreeDeciduous,
  PalmTree,
  Cactus,
  Flower,
  Rose,
  Tulip,
  Sunflower,
  Cherry,
  Apple,
  Banana,
  Grape,
  Orange,
  Lemon,
  Lime,
  Strawberry,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Carrot,
  Corn,
  Potato,
  Tomato,
  Pepper,
  Cucumber,
  Lettuce,
  Broccoli,
  Onion,
  Garlic,
  Mushroom,
  Herb,
  Leaf,
  Seed,
  Sprout,
  Seedling,
  Plant,
  Pot,
  Watering,
  Garden,
  Park,
  Beach,
  Ocean,
  Lake,
  River,
  Waterfall,
  Bridge,
  Building,
  House,
  Castle,
  Church,
  Mosque,
  Temple,
  School,
  University,
  Library,
  Museum,
  Theater,
  Cinema,
  Stadium,
  Hospital,
  Pharmacy,
  Store,
  Shop,
  Mall,
  Market,
  Restaurant,
  Cafe,
  Bar,
  Hotel,
  Bank,
  Office,
  Factory,
  Warehouse,
  Construction,
  Crane,
  Hammer,
  Wrench,
  Screwdriver,
  Drill,
  Saw,
  Pliers,
  Toolbox,
  Toolkit,
  Gear,
  Cog,
  Settings2,
  Sliders,
  Knob,
  Switch,
  Toggle,
  Button,
  Joystick,
  Gamepad,
  Controller,
  Keyboard,
  Mouse,
  Touchpad,
  Stylus,
  Pen,
  Pencil,
  Brush,
  Paintbrush,
  Palette,
  Canvas,
  Frame,
  Picture,
  Photo,
  Gallery,
  Album,
  Collage,
  Mosaic,
  Pattern,
  Texture,
  Gradient,
  Rainbow,
  Prism,
  Crystal,
  Diamond,
  Gem,
  Ring,
  Necklace,
  Bracelet,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { LoadingSpinner, Skeleton } from '../shared/LoadingStates';

// Breadcrumb interfaces
export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  description?: string;
  category?: string;
  permission?: string;
  isActive?: boolean;
  isClickable?: boolean;
  isDropdown?: boolean;
  children?: BreadcrumbItem[];
  metadata?: Record<string, any>;
  lastAccessed?: Date;
  accessCount?: number;
  isFavorite?: boolean;
  isProtected?: boolean;
  isExternal?: boolean;
  tooltip?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning' | 'success' | 'info';
}

export interface BreadcrumbConfig {
  maxItems: number;
  showHome: boolean;
  showIcons: boolean;
  showTooltips: boolean;
  showDropdowns: boolean;
  showCollapseButton: boolean;
  enableKeyboardNavigation: boolean;
  enableContextMenu: boolean;
  separatorIcon: React.ReactNode;
  collapseIcon: React.ReactNode;
  homeIcon: React.ReactNode;
  variant: 'default' | 'minimal' | 'pill' | 'underline';
  size: 'sm' | 'md' | 'lg';
  theme: 'light' | 'dark' | 'auto';
  animationDuration: number;
  hoverDelay: number;
}

export interface NavigationPath {
  segments: BreadcrumbItem[];
  totalDepth: number;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BreadcrumbAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  permission?: string;
  shortcut?: string;
  tooltip?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
}

export interface RBACBreadcrumbProps {
  config?: Partial<BreadcrumbConfig>;
  items?: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
  onFavorite?: (item: BreadcrumbItem) => void;
  actions?: BreadcrumbAction[];
  className?: string;
  variant?: 'default' | 'minimal' | 'compact';
  showActions?: boolean;
  showFavorites?: boolean;
  showHistory?: boolean;
  maxVisibleItems?: number;
  autoCollapse?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  customSeparator?: React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
}

// Custom hooks
const useBreadcrumbConfig = () => {
  const [config, setConfig] = useState<BreadcrumbConfig>({
    maxItems: 8,
    showHome: true,
    showIcons: true,
    showTooltips: true,
    showDropdowns: true,
    showCollapseButton: true,
    enableKeyboardNavigation: true,
    enableContextMenu: true,
    separatorIcon: <ChevronRight className="w-4 h-4" />,
    collapseIcon: <MoreHorizontal className="w-4 h-4" />,
    homeIcon: <Home className="w-4 h-4" />,
    variant: 'default',
    size: 'md',
    theme: 'auto',
    animationDuration: 200,
    hoverDelay: 300,
  });

  const updateConfig = useCallback((updates: Partial<BreadcrumbConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return { config, updateConfig };
};

const usePathResolution = () => {
  const pathname = usePathname();
  const { hasPermission } = usePermissionCheck();

  const resolvePath = useCallback((currentPath: string): BreadcrumbItem[] => {
    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({
      id: 'home',
      label: 'Home',
      path: '/',
      icon: <Home className="w-4 h-4" />,
      description: 'Dashboard home',
      isClickable: true,
    });

    // Map path segments to breadcrumb items
    let currentSegmentPath = '';
    segments.forEach((segment, index) => {
      currentSegmentPath += `/${segment}`;
      
      const breadcrumbItem = mapSegmentToBreadcrumb(segment, currentSegmentPath, index === segments.length - 1);
      
      // Check permissions
      if (!breadcrumbItem.permission || hasPermission(breadcrumbItem.permission)) {
        breadcrumbs.push(breadcrumbItem);
      }
    });

    return breadcrumbs;
  }, [hasPermission]);

  const mapSegmentToBreadcrumb = useCallback((segment: string, fullPath: string, isLast: boolean): BreadcrumbItem => {
    const segmentMappings: Record<string, Partial<BreadcrumbItem>> = {
      'rbac': {
        label: 'RBAC System',
        icon: <Shield className="w-4 h-4" />,
        description: 'Role-Based Access Control system',
        permission: 'rbac.read',
      },
      'dashboard': {
        label: 'Dashboard',
        icon: <Activity className="w-4 h-4" />,
        description: 'System dashboard and analytics',
        permission: 'rbac.dashboard.read',
      },
      'users': {
        label: 'Users',
        icon: <Users className="w-4 h-4" />,
        description: 'User management',
        permission: 'rbac.users.read',
      },
      'roles': {
        label: 'Roles',
        icon: <Shield className="w-4 h-4" />,
        description: 'Role management',
        permission: 'rbac.roles.read',
      },
      'permissions': {
        label: 'Permissions',
        icon: <Key className="w-4 h-4" />,
        description: 'Permission management',
        permission: 'rbac.permissions.read',
      },
      'groups': {
        label: 'Groups',
        icon: <Users className="w-4 h-4" />,
        description: 'Group management',
        permission: 'rbac.groups.read',
      },
      'resources': {
        label: 'Resources',
        icon: <Database className="w-4 h-4" />,
        description: 'Resource management',
        permission: 'rbac.resources.read',
      },
      'audit': {
        label: 'Audit Logs',
        icon: <FileText className="w-4 h-4" />,
        description: 'System audit logs',
        permission: 'rbac.audit.read',
      },
      'audit-logs': {
        label: 'Audit Logs',
        icon: <FileText className="w-4 h-4" />,
        description: 'System audit logs',
        permission: 'rbac.audit.read',
      },
      'sessions': {
        label: 'Sessions',
        icon: <Activity className="w-4 h-4" />,
        description: 'Active user sessions',
        permission: 'rbac.sessions.read',
      },
      'access-requests': {
        label: 'Access Requests',
        icon: <Key className="w-4 h-4" />,
        description: 'Access request management',
        permission: 'rbac.access_requests.read',
      },
      'settings': {
        label: 'Settings',
        icon: <Settings className="w-4 h-4" />,
        description: 'System settings',
        permission: 'rbac.settings.read',
      },
      'data-sources': {
        label: 'Data Sources',
        icon: <Database className="w-4 h-4" />,
        description: 'Data source management',
        permission: 'data_sources.read',
      },
      'catalog': {
        label: 'Data Catalog',
        icon: <Folder className="w-4 h-4" />,
        description: 'Data catalog browser',
        permission: 'catalog.read',
      },
      'classifications': {
        label: 'Classifications',
        icon: <FileText className="w-4 h-4" />,
        description: 'Data classifications',
        permission: 'classifications.read',
      },
      'compliance': {
        label: 'Compliance',
        icon: <Shield className="w-4 h-4" />,
        description: 'Compliance management',
        permission: 'compliance.read',
      },
      'scan-rule-sets': {
        label: 'Scan Rule Sets',
        icon: <Search className="w-4 h-4" />,
        description: 'Data scanning rule sets',
        permission: 'scan_rules.read',
      },
      'scan-logic': {
        label: 'Scan Logic',
        icon: <Search className="w-4 h-4" />,
        description: 'Advanced scan logic',
        permission: 'scan_logic.read',
      },
    };

    const mapping = segmentMappings[segment] || {};
    
    return {
      id: segment,
      label: mapping.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: fullPath,
      icon: mapping.icon || <Folder className="w-4 h-4" />,
      description: mapping.description,
      permission: mapping.permission,
      isActive: isLast,
      isClickable: !isLast,
      category: 'navigation',
      ...mapping,
    };
  }, []);

  return { resolvePath, pathname };
};

const useBreadcrumbHistory = () => {
  const [history, setHistory] = useState<BreadcrumbItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((item: BreadcrumbItem) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.path !== item.path);
      const newHistory = [{ ...item, lastAccessed: new Date() }, ...filtered].slice(0, 20);
      return newHistory;
    });
  }, []);

  const navigateHistory = useCallback((direction: 'back' | 'forward') => {
    if (direction === 'back' && historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    } else if (direction === 'forward' && historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const canGoBack = historyIndex < history.length - 1;
  const canGoForward = historyIndex > 0;

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory,
    canGoBack,
    canGoForward,
  };
};

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedFavorites = localStorage.getItem('rbac-breadcrumb-favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
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
      localStorage.setItem('rbac-breadcrumb-favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  return { favorites, toggleFavorite };
};

// Component: Breadcrumb Item
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  config: BreadcrumbConfig;
  isLast: boolean;
  onNavigate: (item: BreadcrumbItem) => void;
  onFavorite?: (item: BreadcrumbItem) => void;
  isFavorite: boolean;
  showActions?: boolean;
}> = ({ item, config, isLast, onNavigate, onFavorite, isFavorite, showActions = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (item.isClickable && item.path) {
      onNavigate(item);
    }
  }, [item, onNavigate]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(item);
  }, [item, onFavorite]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const badgeVariants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <div ref={dropdownRef} className="relative flex items-center">
      <motion.div
        variants={itemVariants}
        animate={isHovered ? 'hover' : 'rest'}
        whileTap={item.isClickable ? 'tap' : 'rest'}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'group relative flex items-center gap-2 transition-all duration-200',
          config.size === 'sm' && 'text-sm py-1 px-2',
          config.size === 'md' && 'text-sm py-1.5 px-3',
          config.size === 'lg' && 'text-base py-2 px-4',
          config.variant === 'pill' && 'rounded-full',
          config.variant === 'underline' && 'border-b-2 border-transparent',
          item.isClickable && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg',
          item.isActive && config.variant === 'underline' && 'border-blue-500',
          item.isActive && config.variant !== 'underline' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
          !item.isClickable && 'text-gray-900 dark:text-white font-medium',
          item.isClickable && !item.isActive && 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
          item.isProtected && 'border border-yellow-200 dark:border-yellow-800'
        )}
        onClick={handleClick}
        title={config.showTooltips ? item.tooltip || item.description : undefined}
      >
        {/* Icon */}
        {config.showIcons && item.icon && (
          <span className="flex-shrink-0">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span className="truncate font-medium">
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
            badgeVariants[item.badgeVariant || 'default']
          )}>
            {item.badge}
          </span>
        )}

        {/* Indicators */}
        <div className="flex items-center gap-1">
          {item.isProtected && (
            <Lock className="w-3 h-3 text-yellow-500" title="Protected resource" />
          )}
          {item.isExternal && (
            <ExternalLink className="w-3 h-3 text-gray-400" title="External link" />
          )}
          {isFavorite && (
            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" title="Favorited" />
          )}
        </div>

        {/* Dropdown indicator */}
        {config.showDropdowns && item.children && item.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ChevronDown className={cn(
              'w-3 h-3 transition-transform duration-200',
              showDropdown && 'rotate-180'
            )} />
          </button>
        )}

        {/* Action buttons (shown on hover) */}
        {showActions && isHovered && !isLast && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onFavorite && (
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200',
                  isFavorite ? 'text-yellow-500' : 'text-gray-400'
                )}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {showDropdown && item.children && item.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: config.animationDuration / 1000 }}
            className="absolute top-full left-0 right-0 mt-2 min-w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            <div className="py-2">
              {item.children.map((child, index) => (
                <motion.button
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onNavigate(child);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  {child.icon && (
                    <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {child.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {child.label}
                    </span>
                    {child.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {child.description}
                      </div>
                    )}
                  </div>
                  {child.badge && (
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                      badgeVariants[child.badgeVariant || 'default']
                    )}>
                      {child.badge}
                    </span>
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

// Component: Breadcrumb Actions
const BreadcrumbActions: React.FC<{
  actions: BreadcrumbAction[];
  history: BreadcrumbItem[];
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigateHistory: (direction: 'back' | 'forward') => void;
  onAction: (action: BreadcrumbAction) => void;
}> = ({ actions, history, canGoBack, canGoForward, onNavigateHistory, onAction }) => {
  const { hasPermission } = usePermissionCheck();
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  // Close history dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1">
      {/* Navigation history buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigateHistory('back')}
          disabled={!canGoBack}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            canGoBack
              ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              : 'opacity-50 cursor-not-allowed text-gray-400'
          )}
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateHistory('forward')}
          disabled={!canGoForward}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            canGoForward
              ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              : 'opacity-50 cursor-not-allowed text-gray-400'
          )}
          title="Go forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* History dropdown */}
      {history.length > 0 && (
        <div ref={historyRef} className="relative">
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Navigation history"
          >
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <AnimatePresence>
            {showHistoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Navigation History
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto py-2">
                  {history.slice(0, 10).map((item, index) => (
                    <motion.div
                      key={`${item.path}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2"
                    >
                      {item.icon && (
                        <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                          {item.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.path}
                        </div>
                      </div>
                      {item.lastAccessed && (
                        <span className="text-xs text-gray-400">
                          {new Date(item.lastAccessed).toLocaleTimeString()}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Separator */}
      {visibleActions.length > 0 && (
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      )}

      {/* Custom actions */}
      {visibleActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action)}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
            action.variant === 'secondary' && 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
            action.variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
            (!action.variant || action.variant === 'default') && 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          )}
          title={action.tooltip || action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

// Component: Breadcrumb Search
const BreadcrumbSearch: React.FC<{
  items: BreadcrumbItem[];
  onSelect: (item: BreadcrumbItem) => void;
  placeholder?: string;
  className?: string;
}> = ({ items, onSelect, placeholder = 'Search navigation...', className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.path?.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }, [items, query]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex]);
            setIsOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleSelect = useCallback((item: BreadcrumbItem) => {
    onSelect(item);
    setIsOpen(false);
    setQuery('');
  }, [onSelect]);

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'transition-all duration-200'
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            <div className="py-2">
              {filteredItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
                    selectedIndex === index && 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {item.label}
                    </div>
                    {item.path && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.path}
                      </div>
                    )}
                  </div>
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
  items: customItems,
  onNavigate: onNavigateProp,
  onFavorite: onFavoriteProp,
  actions = [],
  className,
  variant = 'default',
  showActions = true,
  showFavorites = true,
  showHistory = true,
  maxVisibleItems,
  autoCollapse = true,
  enableSearch = false,
  searchPlaceholder = 'Search navigation...',
  customSeparator,
  emptyMessage = 'No navigation path available',
  loadingMessage = 'Loading navigation...',
}) => {
  const router = useRouter();
  const { config, updateConfig } = useBreadcrumbConfig();
  const { resolvePath, pathname } = usePathResolution();
  const { history, addToHistory, navigateHistory, canGoBack, canGoForward } = useBreadcrumbHistory();
  const { favorites, toggleFavorite } = useFavorites();
  const { user, isLoading: userLoading } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Merge config with overrides
  const finalConfig = useMemo(() => ({
    ...config,
    ...configOverrides,
  }), [config, configOverrides]);

  // Resolve breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (customItems) {
      return customItems;
    }
    return resolvePath(pathname);
  }, [customItems, resolvePath, pathname]);

  // Handle navigation
  const handleNavigate = useCallback((item: BreadcrumbItem) => {
    if (item.path) {
      if (item.isExternal) {
        window.open(item.path, '_blank');
      } else {
        router.push(item.path);
      }
      addToHistory(item);
    }
    onNavigateProp?.(item);
  }, [router, addToHistory, onNavigateProp]);

  // Handle favorite toggle
  const handleFavorite = useCallback((item: BreadcrumbItem) => {
    toggleFavorite(item.id);
    onFavoriteProp?.(item);
  }, [toggleFavorite, onFavoriteProp]);

  // Handle history navigation
  const handleHistoryNavigation = useCallback((direction: 'back' | 'forward') => {
    const item = navigateHistory(direction);
    if (item && item.path) {
      router.push(item.path);
    }
  }, [navigateHistory, router]);

  // Handle action clicks
  const handleAction = useCallback((action: BreadcrumbAction) => {
    action.action();
  }, []);

  // Determine visible items based on collapse state and max items
  const visibleItems = useMemo(() => {
    const maxItems = maxVisibleItems || finalConfig.maxItems;
    
    if (breadcrumbItems.length <= maxItems || !autoCollapse) {
      return breadcrumbItems;
    }

    if (isCollapsed) {
      // Show first item, ellipsis, and last few items
      const firstItem = breadcrumbItems[0];
      const lastItems = breadcrumbItems.slice(-2);
      return [firstItem, { id: 'ellipsis', label: '...', isClickable: false }, ...lastItems];
    }

    return breadcrumbItems.slice(0, maxItems);
  }, [breadcrumbItems, maxVisibleItems, finalConfig.maxItems, autoCollapse, isCollapsed]);

  // Auto-collapse logic
  useEffect(() => {
    if (autoCollapse && breadcrumbItems.length > (maxVisibleItems || finalConfig.maxItems)) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [breadcrumbItems.length, autoCollapse, maxVisibleItems, finalConfig.maxItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!finalConfig.enableKeyboardNavigation) return;

      // Navigate with Alt + Arrow keys
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && canGoBack) {
          e.preventDefault();
          handleHistoryNavigation('back');
        } else if (e.key === 'ArrowRight' && canGoForward) {
          e.preventDefault();
          handleHistoryNavigation('forward');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finalConfig.enableKeyboardNavigation, canGoBack, canGoForward, handleHistoryNavigation]);

  if (userLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-24 h-6 rounded" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (breadcrumbItems.length === 0) {
    return (
      <div className={cn('flex items-center text-sm text-gray-500 dark:text-gray-400', className)}>
        <Navigation className="w-4 h-4 mr-2" />
        {emptyMessage}
      </div>
    );
  }

  const separator = customSeparator || finalConfig.separatorIcon;

  return (
    <nav
      className={cn(
        'flex items-center gap-1 text-sm',
        variant === 'minimal' && 'text-xs',
        variant === 'compact' && 'gap-0.5',
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {/* Navigation actions */}
      {showActions && (showHistory || actions.length > 0) && (
        <BreadcrumbActions
          actions={actions}
          history={history}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onNavigateHistory={handleHistoryNavigation}
          onAction={handleAction}
        />
      )}

      {/* Search */}
      {enableSearch && (
        <BreadcrumbSearch
          items={breadcrumbItems}
          onSelect={handleNavigate}
          placeholder={searchPlaceholder}
          className="min-w-48"
        />
      )}

      {/* Breadcrumb items */}
      <div className="flex items-center gap-1 overflow-hidden">
        {visibleItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {/* Separator */}
            {index > 0 && (
              <span className="flex-shrink-0 text-gray-400 dark:text-gray-500 mx-1">
                {separator}
              </span>
            )}

            {/* Breadcrumb item */}
            {item.id === 'ellipsis' ? (
              <button
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors duration-200"
                title="Show all items"
              >
                {finalConfig.collapseIcon}
              </button>
            ) : (
              <BreadcrumbItemComponent
                item={item}
                config={finalConfig}
                isLast={index === visibleItems.length - 1}
                onNavigate={handleNavigate}
                onFavorite={showFavorites ? handleFavorite : undefined}
                isFavorite={favorites.has(item.id)}
                showActions={showActions}
              />
            )}
          </React.Fragment>
        ))}

        {/* Collapse button */}
        {finalConfig.showCollapseButton && autoCollapse && breadcrumbItems.length > (maxVisibleItems || finalConfig.maxItems) && !isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors duration-200"
            title="Collapse breadcrumbs"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default RBACBreadcrumb;