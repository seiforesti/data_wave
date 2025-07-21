// Advanced Enterprise WebSocket API Integration
// Real-time communication with intelligent features and enterprise-grade reliability

import { toast } from 'sonner';

// WebSocket event types
export type WebSocketEventType = 
  | 'classification-updates'
  | 'system-metrics'
  | 'notifications'
  | 'ml-metrics'
  | 'training-progress'
  | 'inference-metrics'
  | 'ai-conversations'
  | 'ai-reasoning'
  | 'ai-streaming'
  | 'resource-utilization'
  | 'performance-alerts'
  | 'workflow-updates'
  | 'audit-events'
  | 'user-activity'
  | 'collaboration-events';

export interface WebSocketMessage {
  id: string;
  type: WebSocketEventType;
  timestamp: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requiresAck?: boolean;
  retryCount?: number;
  metadata?: {
    source: string;
    version: string;
    userId?: string;
    sessionId?: string;
    correlationId?: string;
  };
}

export interface WebSocketSubscription {
  id: string;
  eventType: WebSocketEventType;
  callback: (data: any) => void;
  filters?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  batchSize?: number;
  throttleMs?: number;
  lastProcessed?: number;
}

export interface WebSocketConfig {
  url?: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
  enableCompression?: boolean;
  enableBatching?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  enableMetrics?: boolean;
  enableLogging?: boolean;
  authToken?: string;
  customHeaders?: Record<string, string>;
}

export interface ConnectionMetrics {
  connectTime: number;
  lastPingTime: number;
  lastPongTime: number;
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  reconnectCount: number;
  errorCount: number;
  avgLatency: number;
  connectionUptime: number;
  throughput: {
    messagesPerSecond: number;
    bytesPerSecond: number;
  };
  quality: {
    stability: number; // 0-1
    reliability: number; // 0-1
    performance: number; // 0-1
  };
}

export interface QueuedMessage {
  message: WebSocketMessage;
  timestamp: number;
  attempts: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

// Advanced WebSocket Client with Enterprise Features
class WebSocketApiClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private batchTimer: NodeJS.Timeout | null = null;
  private batchedMessages: WebSocketMessage[] = [];
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' = 'disconnected';
  private metrics: ConnectionMetrics;
  private reconnectAttempts = 0;
  private lastHeartbeat = 0;
  private performanceHistory: Array<{ timestamp: number; latency: number; throughput: number }> = [];

  // Event handlers
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || this.getWebSocketUrl(),
      protocols: config.protocols || ['classification-protocol-v1'],
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      messageQueueSize: config.messageQueueSize || 1000,
      enableCompression: config.enableCompression ?? true,
      enableBatching: config.enableBatching ?? true,
      batchSize: config.batchSize || 10,
      batchTimeout: config.batchTimeout || 100,
      enableMetrics: config.enableMetrics ?? true,
      enableLogging: config.enableLogging ?? true,
      authToken: config.authToken || localStorage.getItem('auth_token') || '',
      customHeaders: config.customHeaders || {}
    };

    this.metrics = this.initializeMetrics();
    this.setupPerformanceMonitoring();
  }

  private getWebSocketUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return baseUrl.replace('http', 'ws') + '/api/v1/ws/classification';
  }

  private initializeMetrics(): ConnectionMetrics {
    return {
      connectTime: 0,
      lastPingTime: 0,
      lastPongTime: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnectCount: 0,
      errorCount: 0,
      avgLatency: 0,
      connectionUptime: 0,
      throughput: {
        messagesPerSecond: 0,
        bytesPerSecond: 0
      },
      quality: {
        stability: 1.0,
        reliability: 1.0,
        performance: 1.0
      }
    };
  }

  private setupPerformanceMonitoring(): void {
    if (this.config.enableMetrics) {
      setInterval(() => {
        this.calculatePerformanceMetrics();
        this.optimizeConnection();
      }, 10000); // Update metrics every 10 seconds
    }
  }

  private calculatePerformanceMetrics(): void {
    const now = Date.now();
    const windowSize = 60000; // 1 minute window
    
    // Filter recent performance data
    this.performanceHistory = this.performanceHistory.filter(
      entry => now - entry.timestamp < windowSize
    );

    if (this.performanceHistory.length > 0) {
      // Calculate averages
      const avgLatency = this.performanceHistory.reduce((sum, entry) => sum + entry.latency, 0) / this.performanceHistory.length;
      const avgThroughput = this.performanceHistory.reduce((sum, entry) => sum + entry.throughput, 0) / this.performanceHistory.length;
      
      this.metrics.avgLatency = avgLatency;
      this.metrics.throughput.messagesPerSecond = avgThroughput;
      
      // Calculate quality metrics
      this.metrics.quality.performance = Math.max(0, Math.min(1, 1 - (avgLatency / 1000))); // Normalize latency
      this.metrics.quality.stability = Math.max(0, Math.min(1, 1 - (this.metrics.errorCount / Math.max(1, this.metrics.messagesReceived))));
      this.metrics.quality.reliability = Math.max(0, Math.min(1, 1 - (this.reconnectAttempts / 10)));
    }

    // Update connection uptime
    if (this.connectionState === 'connected' && this.metrics.connectTime > 0) {
      this.metrics.connectionUptime = now - this.metrics.connectTime;
    }
  }

  private optimizeConnection(): void {
    const quality = this.metrics.quality;
    
    // Auto-adjust batch size based on performance
    if (quality.performance < 0.5 && this.config.batchSize > 5) {
      this.config.batchSize = Math.max(5, this.config.batchSize - 1);
      if (this.config.enableLogging) {
        console.log('WebSocket: Reduced batch size for better performance:', this.config.batchSize);
      }
    } else if (quality.performance > 0.8 && this.config.batchSize < 20) {
      this.config.batchSize = Math.min(20, this.config.batchSize + 1);
      if (this.config.enableLogging) {
        console.log('WebSocket: Increased batch size for better throughput:', this.config.batchSize);
      }
    }

    // Adjust heartbeat interval based on stability
    if (quality.stability < 0.7) {
      this.config.heartbeatInterval = Math.max(15000, this.config.heartbeatInterval - 5000);
    } else if (quality.stability > 0.9) {
      this.config.heartbeatInterval = Math.min(60000, this.config.heartbeatInterval + 5000);
    }
  }

  // Connection Management
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    
    try {
      const wsUrl = new URL(this.config.url);
      
      // Add authentication and metadata as query parameters
      if (this.config.authToken) {
        wsUrl.searchParams.append('token', this.config.authToken);
      }
      wsUrl.searchParams.append('client_version', process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0');
      wsUrl.searchParams.append('session_id', this.generateSessionId());
      wsUrl.searchParams.append('timestamp', Date.now().toString());

      this.ws = new WebSocket(wsUrl.toString(), this.config.protocols);
      
      // Configure WebSocket options
      if (this.config.enableCompression && 'extensions' in this.ws) {
        // Enable compression if supported
        (this.ws as any).extensions = 'permessage-deflate';
      }

      this.setupWebSocketEventHandlers();
      
      // Wait for connection to establish
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });

    } catch (error) {
      this.connectionState = 'error';
      this.metrics.errorCount++;
      throw error;
    }
  }

  private setupWebSocketEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.connectionState = 'connected';
      this.metrics.connectTime = Date.now();
      this.reconnectAttempts = 0;
      
      this.startHeartbeat();
      this.processQueuedMessages();
      
      if (this.config.enableLogging) {
        console.log('WebSocket: Connected successfully');
      }
      
      toast.success('Real-time connection established', {
        description: 'All features are now available'
      });

      // Emit connection event
      this.emit('connected', { timestamp: new Date().toISOString() });
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      
      if (this.config.enableLogging) {
        console.log('WebSocket: Connection closed', { code: event.code, reason: event.reason });
      }

      if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      } else {
        toast.error('Real-time connection lost', {
          description: 'Some features may be limited'
        });
      }

      // Emit disconnection event
      this.emit('disconnected', { 
        code: event.code, 
        reason: event.reason, 
        timestamp: new Date().toISOString() 
      });
    };

    this.ws.onerror = (error) => {
      this.connectionState = 'error';
      this.metrics.errorCount++;
      
      if (this.config.enableLogging) {
        console.error('WebSocket: Error occurred', error);
      }

      // Emit error event
      this.emit('error', { 
        error: error.toString(), 
        timestamp: new Date().toISOString() 
      });
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const startTime = performance.now();
      const messageSize = new Blob([event.data]).size;
      
      this.metrics.messagesReceived++;
      this.metrics.bytesReceived += messageSize;

      let message: WebSocketMessage;
      
      try {
        message = JSON.parse(event.data);
      } catch (parseError) {
        if (this.config.enableLogging) {
          console.error('WebSocket: Failed to parse message', parseError);
        }
        return;
      }

      // Handle different message types
      switch (message.type) {
        case 'heartbeat-response':
          this.handleHeartbeatResponse(message);
          break;
        
        case 'ack':
          this.handleAcknowledgment(message);
          break;
        
        default:
          this.processMessage(message);
          break;
      }

      // Record performance metrics
      const processingTime = performance.now() - startTime;
      this.performanceHistory.push({
        timestamp: Date.now(),
        latency: processingTime,
        throughput: 1000 / processingTime // messages per second equivalent
      });

      // Trim performance history to prevent memory leaks
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-500);
      }

    } catch (error) {
      this.metrics.errorCount++;
      if (this.config.enableLogging) {
        console.error('WebSocket: Error handling message', error);
      }
    }
  }

  private processMessage(message: WebSocketMessage): void {
    // Send acknowledgment if required
    if (message.requiresAck) {
      this.sendAcknowledgment(message.id);
    }

    // Find matching subscriptions
    const matchingSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.eventType === message.type);

    // Apply filters and process
    for (const subscription of matchingSubscriptions) {
      if (this.matchesFilters(message, subscription.filters)) {
        // Apply throttling
        const now = Date.now();
        if (subscription.throttleMs && subscription.lastProcessed) {
          if (now - subscription.lastProcessed < subscription.throttleMs) {
            continue; // Skip due to throttling
          }
        }
        subscription.lastProcessed = now;

        // Execute callback with error handling
        try {
          subscription.callback(message.data);
        } catch (error) {
          if (this.config.enableLogging) {
            console.error('WebSocket: Subscription callback error', error);
          }
        }
      }
    }

    // Emit generic event
    this.emit(message.type, message.data);
  }

  private matchesFilters(message: WebSocketMessage, filters?: Record<string, any>): boolean {
    if (!filters) return true;

    for (const [key, expectedValue] of Object.entries(filters)) {
      const actualValue = this.getNestedValue(message.data, key);
      if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private handleHeartbeatResponse(message: WebSocketMessage): void {
    this.metrics.lastPongTime = Date.now();
    const latency = this.metrics.lastPongTime - this.metrics.lastPingTime;
    
    // Update latency metrics
    if (this.metrics.avgLatency === 0) {
      this.metrics.avgLatency = latency;
    } else {
      this.metrics.avgLatency = (this.metrics.avgLatency * 0.9) + (latency * 0.1); // Exponential moving average
    }
  }

  private handleAcknowledgment(message: WebSocketMessage): void {
    const messageId = message.data.messageId;
    const pending = this.pendingMessages.get(messageId);
    
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(message.data);
      this.pendingMessages.delete(messageId);
    }
  }

  private sendAcknowledgment(messageId: string): void {
    const ackMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'ack' as WebSocketEventType,
      timestamp: new Date().toISOString(),
      data: { messageId },
      priority: 'high'
    };

    this.sendMessage(ackMessage);
  }

  // Heartbeat Management
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === 'connected') {
        this.sendHeartbeat();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendHeartbeat(): void {
    this.metrics.lastPingTime = Date.now();
    const heartbeatMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'heartbeat' as WebSocketEventType,
      timestamp: new Date().toISOString(),
      data: { timestamp: this.metrics.lastPingTime },
      priority: 'low'
    };

    this.sendMessage(heartbeatMessage);
  }

  // Reconnection Management
  private scheduleReconnect(): void {
    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    this.metrics.reconnectCount++;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    if (this.config.enableLogging) {
      console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    }

    toast.info('Reconnecting...', {
      description: `Attempt ${this.reconnectAttempts} of ${this.config.maxReconnectAttempts}`
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        if (this.config.enableLogging) {
          console.error('WebSocket: Reconnection failed', error);
        }
        
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          toast.error('Failed to reconnect', {
            description: 'Maximum reconnection attempts reached'
          });
        }
      });
    }, delay);
  }

  // Message Management
  private sendMessage(message: WebSocketMessage): void {
    if (this.connectionState !== 'connected' || !this.ws) {
      this.queueMessage(message);
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      const messageSize = new Blob([messageStr]).size;
      
      this.ws.send(messageStr);
      
      this.metrics.messagesSent++;
      this.metrics.bytesSent += messageSize;

      if (this.config.enableLogging) {
        console.debug('WebSocket: Message sent', { type: message.type, id: message.id });
      }

    } catch (error) {
      this.metrics.errorCount++;
      if (this.config.enableLogging) {
        console.error('WebSocket: Failed to send message', error);
      }
      this.queueMessage(message);
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      // Remove oldest low-priority message
      const lowPriorityIndex = this.messageQueue.findIndex(q => q.priority === 'low');
      if (lowPriorityIndex !== -1) {
        this.messageQueue.splice(lowPriorityIndex, 1);
      } else {
        this.messageQueue.shift(); // Remove oldest message
      }
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      attempts: 0,
      priority: message.priority
    });

    // Sort by priority
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private processQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.connectionState === 'connected') {
      const queuedMessage = this.messageQueue.shift()!;
      queuedMessage.attempts++;
      
      if (queuedMessage.attempts <= 3) {
        this.sendMessage(queuedMessage.message);
      } else {
        if (this.config.enableLogging) {
          console.warn('WebSocket: Dropping message after 3 attempts', queuedMessage.message.id);
        }
      }
    }
  }

  // Public API Methods
  async send(type: WebSocketEventType, data: any, options: {
    priority?: 'low' | 'normal' | 'high' | 'critical';
    requiresAck?: boolean;
    timeout?: number;
  } = {}): Promise<any> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type,
      timestamp: new Date().toISOString(),
      data,
      priority: options.priority || 'normal',
      requiresAck: options.requiresAck || false,
      metadata: {
        source: 'client',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        sessionId: this.generateSessionId()
      }
    };

    if (options.requiresAck) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingMessages.delete(message.id);
          reject(new Error('Message acknowledgment timeout'));
        }, options.timeout || 30000);

        this.pendingMessages.set(message.id, { resolve, reject, timeout });
        this.sendMessage(message);
      });
    } else {
      this.sendMessage(message);
      return Promise.resolve();
    }
  }

  subscribe(eventType: WebSocketEventType, callback: (data: any) => void, options: {
    filters?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    throttleMs?: number;
  } = {}): string {
    const subscription: WebSocketSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      callback,
      filters: options.filters,
      priority: options.priority || 'normal',
      throttleMs: options.throttleMs
    };

    this.subscriptions.set(subscription.id, subscription);
    
    if (this.config.enableLogging) {
      console.log('WebSocket: Subscribed to', eventType, 'with ID', subscription.id);
    }

    return subscription.id;
  }

  unsubscribe(subscriptionId: string): void {
    if (this.subscriptions.delete(subscriptionId)) {
      if (this.config.enableLogging) {
        console.log('WebSocket: Unsubscribed', subscriptionId);
      }
    }
  }

  disconnect(): void {
    this.connectionState = 'disconnected';
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    // Clear pending messages
    for (const [, pending] of this.pendingMessages) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingMessages.clear();

    if (this.config.enableLogging) {
      console.log('WebSocket: Disconnected');
    }
  }

  // Event Emitter Methods
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          if (this.config.enableLogging) {
            console.error('WebSocket: Event handler error', error);
          }
        }
      }
    }
  }

  // Utility Methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return localStorage.getItem('ws_session_id') || (() => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ws_session_id', sessionId);
      return sessionId;
    })();
  }

  // Public Getters
  get isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  get connectionStatus(): string {
    return this.connectionState;
  }

  get getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  get queueSize(): number {
    return this.messageQueue.length;
  }

  get subscriptionCount(): number {
    return this.subscriptions.size;
  }

  // Configuration Management
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableLogging) {
      console.log('WebSocket: Configuration updated', newConfig);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    if (this.connectionState !== 'connected') {
      return false;
    }

    try {
      await this.send('heartbeat', { healthCheck: true }, { 
        requiresAck: true, 
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  // Performance Optimization
  optimizePerformance(): void {
    // Clear old performance data
    const cutoff = Date.now() - 300000; // 5 minutes
    this.performanceHistory = this.performanceHistory.filter(
      entry => entry.timestamp > cutoff
    );

    // Optimize message queue
    if (this.messageQueue.length > this.config.messageQueueSize * 0.8) {
      // Remove old low-priority messages
      this.messageQueue = this.messageQueue.filter(
        msg => msg.priority !== 'low' || Date.now() - msg.timestamp < 60000
      );
    }

    if (this.config.enableLogging) {
      console.log('WebSocket: Performance optimization completed');
    }
  }
}

// Export singleton instance
export const websocketApi = new WebSocketApiClient();
export default websocketApi;