/**
 * useEnterpriseNotifications Hook
 * ==============================
 * 
 * Shared hook for enterprise-grade notifications across the platform.
 * Provides comprehensive notification management with real-time delivery.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  action: () => void;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationFilters {
  type?: string[];
  priority?: string[];
  category?: string[];
  read?: boolean;
  timeRange?: { start: string; end: string };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useEnterpriseNotifications = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  });

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadNotifications = useCallback(async (filters?: NotificationFilters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock notification data - would integrate with actual notification service
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Data Quality Alert',
          message: 'Data quality issues detected in customer database',
          type: 'warning',
          priority: 'high',
          category: 'data-quality',
          timestamp: new Date().toISOString(),
          read: false,
          dismissed: false,
          actions: [
            {
              id: 'investigate',
              label: 'Investigate',
              type: 'primary',
              action: () => console.log('Investigating...')
            }
          ]
        }
      ];

      const unreadCount = mockNotifications.filter(n => !n.read).length;

      setState(prev => ({
        ...prev,
        notifications: mockNotifications,
        unreadCount,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
        isLoading: false
      }));
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({
        ...notification,
        read: true
      })),
      unreadCount: 0
    }));
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, dismissed: true }
          : notification
      )
    }));
  }, []);

  const createNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }));

    return newNotification.id;
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getFilteredNotifications = useCallback((filters?: NotificationFilters) => {
    let filtered = state.notifications;

    if (filters) {
      if (filters.type?.length) {
        filtered = filtered.filter(n => filters.type!.includes(n.type));
      }
      if (filters.priority?.length) {
        filtered = filtered.filter(n => filters.priority!.includes(n.priority));
      }
      if (filters.category?.length) {
        filtered = filtered.filter(n => filters.category!.includes(n.category));
      }
      if (filters.read !== undefined) {
        filtered = filtered.filter(n => n.read === filters.read);
      }
      if (filters.timeRange) {
        filtered = filtered.filter(n => 
          new Date(n.timestamp) >= new Date(filters.timeRange!.start) &&
          new Date(n.timestamp) <= new Date(filters.timeRange!.end)
        );
      }
    }

    return filtered.filter(n => !n.dismissed);
  }, [state.notifications]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    notifications: state.notifications.filter(n => !n.dismissed),
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    createNotification,

    // Utilities
    getFilteredNotifications,
    
    // Quick helpers
    showSuccess: (title: string, message: string) => createNotification({
      title,
      message,
      type: 'success',
      priority: 'medium',
      category: 'system'
    }),
    
    showError: (title: string, message: string) => createNotification({
      title,
      message,
      type: 'error',
      priority: 'high',
      category: 'system'
    }),
    
    showWarning: (title: string, message: string) => createNotification({
      title,
      message,
      type: 'warning',
      priority: 'medium',
      category: 'system'
    }),
    
    showInfo: (title: string, message: string) => createNotification({
      title,
      message,
      type: 'info',
      priority: 'low',
      category: 'system'
    })
  };
};

export default useEnterpriseNotifications;