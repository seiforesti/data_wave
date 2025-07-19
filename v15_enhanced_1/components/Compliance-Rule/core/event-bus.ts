import { EventEmitter } from 'events';

export interface ComplianceEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface ComplianceEventSubscriber {
  id: string;
  handler: (event: ComplianceEvent) => Promise<void> | void;
  filter?: (event: ComplianceEvent) => boolean;
}

class ComplianceEventBus extends EventEmitter {
  private subscribers: Map<string, ComplianceEventSubscriber> = new Map();
  private eventHistory: ComplianceEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  // Publish events to all subscribers
  async publish(event: ComplianceEvent): Promise<void> {
    try {
      // Add to history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Emit to all listeners
      this.emit(event.type, event);

      // Notify specific subscribers
      for (const [id, subscriber] of this.subscribers) {
        if (!subscriber.filter || subscriber.filter(event)) {
          try {
            await subscriber.handler(event);
          } catch (error) {
            console.error(`Error in subscriber ${id}:`, error);
          }
        }
      }

      // Cross-group event propagation
      await this.propagateToOtherGroups(event);
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }

  // Subscribe to specific event types
  subscribe(subscriber: ComplianceEventSubscriber): string {
    this.subscribers.set(subscriber.id, subscriber);
    return subscriber.id;
  }

  // Unsubscribe from events
  unsubscribe(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  // Get event history
  getEventHistory(filter?: (event: ComplianceEvent) => boolean): ComplianceEvent[] {
    if (!filter) return [...this.eventHistory];
    return this.eventHistory.filter(filter);
  }

  // Cross-group event propagation
  private async propagateToOtherGroups(event: ComplianceEvent): Promise<void> {
    // Compliance events that should trigger other group actions
    const crossGroupEvents = {
      'compliance:rule:created': ['scan-rule-sets', 'data-catalog'],
      'compliance:rule:updated': ['scan-rule-sets', 'data-catalog'],
      'compliance:rule:deleted': ['scan-rule-sets', 'data-catalog'],
      'compliance:violation:detected': ['data-catalog', 'scan-logic'],
      'compliance:violation:resolved': ['data-catalog', 'scan-logic'],
      'compliance:audit:completed': ['data-catalog', 'scan-logic'],
      'compliance:policy:changed': ['scan-rule-sets', 'data-catalog', 'scan-logic']
    };

    const targetGroups = crossGroupEvents[event.type as keyof typeof crossGroupEvents];
    if (targetGroups) {
      // Emit to global event bus for cross-group communication
      this.emit('cross-group:propagate', {
        event,
        targetGroups,
        source: 'compliance-rule'
      });
    }
  }

  // Compliance-specific event helpers
  async publishRuleCreated(rule: any): Promise<void> {
    await this.publish({
      type: 'compliance:rule:created',
      payload: rule,
      timestamp: new Date(),
      source: 'compliance-rule'
    });
  }

  async publishRuleUpdated(rule: any): Promise<void> {
    await this.publish({
      type: 'compliance:rule:updated',
      payload: rule,
      timestamp: new Date(),
      source: 'compliance-rule'
    });
  }

  async publishViolationDetected(violation: any): Promise<void> {
    await this.publish({
      type: 'compliance:violation:detected',
      payload: violation,
      timestamp: new Date(),
      source: 'compliance-rule'
    });
  }

  async publishAuditCompleted(audit: any): Promise<void> {
    await this.publish({
      type: 'compliance:audit:completed',
      payload: audit,
      timestamp: new Date(),
      source: 'compliance-rule'
    });
  }

  // Real-time compliance monitoring
  startRealTimeMonitoring(): void {
    // Monitor compliance rule changes
    this.on('compliance:rule:created', (event) => {
      console.log('New compliance rule created:', event.payload);
    });

    this.on('compliance:rule:updated', (event) => {
      console.log('Compliance rule updated:', event.payload);
    });

    this.on('compliance:violation:detected', (event) => {
      console.log('Compliance violation detected:', event.payload);
    });

    this.on('compliance:audit:completed', (event) => {
      console.log('Compliance audit completed:', event.payload);
    });
  }

  // Get compliance statistics
  getComplianceStats(): {
    totalRules: number;
    activeRules: number;
    violations: number;
    audits: number;
    lastUpdated: Date;
  } {
    const recentEvents = this.eventHistory.filter(
      event => event.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    return {
      totalRules: recentEvents.filter(e => e.type.includes('rule:created')).length,
      activeRules: recentEvents.filter(e => e.type.includes('rule:updated')).length,
      violations: recentEvents.filter(e => e.type.includes('violation')).length,
      audits: recentEvents.filter(e => e.type.includes('audit')).length,
      lastUpdated: recentEvents.length > 0 ? recentEvents[recentEvents.length - 1].timestamp : new Date()
    };
  }
}

// Export singleton instance
export const complianceEventBus = new ComplianceEventBus();

// Start real-time monitoring
complianceEventBus.startRealTimeMonitoring();

export default complianceEventBus;