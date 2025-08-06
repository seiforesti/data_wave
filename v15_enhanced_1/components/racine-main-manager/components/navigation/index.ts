/**
 * 🧭 RACINE NAVIGATION GROUP - INTELLIGENT NAVIGATION SYSTEM
 * 
 * This module provides the complete navigation system for the Racine Main Manager,
 * including adaptive navigation, global search, notifications, and analytics that
 * surpass Databricks, Azure, and Microsoft Purview in intelligence and user experience.
 * 
 * Components:
 * - AppNavbar: Global intelligent navbar (2500+ lines)
 * - AppSidebar: Adaptive sidebar with 7 SPA orchestration (2300+ lines)
 * - ContextualBreadcrumbs: Smart breadcrumbs with cross-group context (1800+ lines)
 * - GlobalSearchInterface: Unified search across all groups (2200+ lines)
 * - QuickActionsPanel: Context-aware quick actions (1600+ lines)
 * - NotificationCenter: Multi-group notification hub (2000+ lines)
 * - NavigationAnalytics: Navigation behavior analytics (1400+ lines)
 * 
 * @author Racine AI System
 * @version 1.0.0
 * @enterprise-grade true
 */

// Core Navigation Components
export { default as AppNavbar } from './AppNavbar'
export { default as AppSidebar } from './AppSidebar'
export { default as ContextualBreadcrumbs } from './ContextualBreadcrumbs'
export { default as GlobalSearchInterface } from './GlobalSearchInterface'
export { default as QuickActionsPanel } from './QuickActionsPanel'
export { default as NotificationCenter } from './NotificationCenter'
export { default as NavigationAnalytics } from './NavigationAnalytics'

// Navigation Types
export type {
  NavigationContext,
  NavigationPreferences,
  NavigationAnalyticsData,
  SystemHealthStatus,
  CrossGroupNavigationState,
  UserNavigationBehavior,
  SearchContext,
  NotificationContext,
  QuickActionContext,
  BreadcrumbContext
} from '../../types/racine-core.types'

// Navigation Hooks
export {
  useNavigation,
  useGlobalSearch,
  useNotificationCenter,
  useQuickActions,
  useBreadcrumbNavigation,
  useNavigationAnalytics
} from '../../hooks'

// Navigation Constants
export {
  NAVIGATION_CONFIGS,
  SEARCH_CONFIGS,
  NOTIFICATION_CONFIGS,
  QUICK_ACTION_CONFIGS,
  BREADCRUMB_CONFIGS,
  ANALYTICS_CONFIGS
} from '../../constants/cross-group-configs'