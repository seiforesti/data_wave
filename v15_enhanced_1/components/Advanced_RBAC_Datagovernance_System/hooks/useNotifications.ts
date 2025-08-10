/**
 * useNotifications Hook - RBAC System
 * ===================================
 * 
 * Hook for managing notifications within the RBAC system.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RBACNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  userId?: string;
  roleId?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: RBACNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useNotifications = (userId?: string) => {
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

  const loadNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock notifications - would integrate with actual notification service
      const mockNotifications: RBACNotification[] = [
        {
          id: '1',
          title: 'Access Request Pending',
          message: 'New access request requires your approval',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          userId
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
  }, [userId]);

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

  const addNotification = useCallback((
    notification: Omit<RBACNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: RBACNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1
    }));
  }, []);

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
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    loadNotifications,
    markAsRead,
    addNotification,

    // Utilities
    markAllAsRead: () => setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    })),

    clearAll: () => setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }))
  };
};

export default useNotifications;