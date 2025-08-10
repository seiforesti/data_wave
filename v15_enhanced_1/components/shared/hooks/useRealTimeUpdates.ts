/**
 * useRealTimeUpdates Hook
 * ======================
 * 
 * Shared hook for real-time updates across the platform.
 * Provides WebSocket integration and real-time data synchronization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RealTimeUpdateConfig {
  endpoint: string;
  interval?: number;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface RealTimeState {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: string | null;
  error: string | null;
  reconnectAttempts: number;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useRealTimeUpdates = (config: RealTimeUpdateConfig) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isConnecting: false,
    lastUpdate: null,
    error: null,
    reconnectAttempts: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  const connect = useCallback(() => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(config.endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          error: null
        }));
        config.onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString()
          }));
          config.onUpdate?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        config.onDisconnect?.();

        // Auto-reconnect if enabled
        if (config.autoReconnect && state.reconnectAttempts < (config.maxReconnectAttempts || 5)) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
            connect();
          }, Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000));
        }
      };

      ws.onerror = (error) => {
        const errorMessage = 'WebSocket connection failed';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isConnecting: false,
          isConnected: false
        }));
        config.onError?.(new Error(errorMessage));
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false
      }));
      config.onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }, [config, state.isConnecting, state.isConnected, state.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false
    }));
  }, []);

  // ============================================================================
  // POLLING FALLBACK
  // ============================================================================

  const startPolling = useCallback(() => {
    if (!config.interval) return;

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(config.endpoint.replace('ws://', 'http://').replace('wss://', 'https://'));
        if (response.ok) {
          const data = await response.json();
          setState(prev => ({
            ...prev,
            lastUpdate: new Date().toISOString()
          }));
          config.onUpdate?.(data);
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, config.interval);
  }, [config]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Auto-connect on mount
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    lastUpdate: state.lastUpdate,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,

    // Actions
    connect,
    disconnect,
    startPolling,
    stopPolling,

    // Utilities
    forceReconnect: () => {
      disconnect();
      setTimeout(connect, 1000);
    }
  };
};

export default useRealTimeUpdates;