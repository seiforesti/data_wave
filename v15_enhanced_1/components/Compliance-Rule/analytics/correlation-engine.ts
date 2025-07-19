import { complianceEventBus } from '../core/event-bus';
import useComplianceStore from '../core/state-manager';

export interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  sourceEvents: string[];
  targetEvents: string[];
  conditions: CorrelationCondition[];
  actions: CorrelationAction[];
  enabled: boolean;
  priority: number;
}

export interface CorrelationCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'REGEX';
  value: any;
  timeWindow?: number; // in milliseconds
}

export interface CorrelationAction {
  type: 'ALERT' | 'ANALYSIS' | 'WORKFLOW' | 'NOTIFICATION' | 'REPORT';
  parameters: Record<string, any>;
}

export interface CorrelationResult {
  id: string;
  ruleId: string;
  ruleName: string;
  sourceEvents: any[];
  targetEvents: any[];
  confidence: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ComplianceInsight {
  id: string;
  type: 'TREND' | 'ANOMALY' | 'PATTERN' | 'RISK' | 'OPPORTUNITY';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  data: any;
  recommendations: string[];
  timestamp: Date;
  tags: string[];
}

export interface ComplianceTrend {
  metric: string;
  timeRange: string;
  data: Array<{
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
  }>;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
  changeRate: number;
}

export interface ComplianceAnomaly {
  id: string;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  context: Record<string, any>;
}

class ComplianceCorrelationEngine {
  private correlationRules: Map<string, CorrelationRule> = new Map();
  private eventBuffer: Map<string, any[]> = new Map();
  private insights: ComplianceInsight[] = [];
  private trends: Map<string, ComplianceTrend> = new Map();
  private anomalies: ComplianceAnomaly[] = [];
  private subscribers: Map<string, (insight: ComplianceInsight) => void> = new Map();

  constructor() {
    this.initializeDefaultCorrelationRules();
    this.subscribeToEvents();
    this.startPeriodicAnalysis();
  }

  // Initialize default correlation rules
  private initializeDefaultCorrelationRules(): void {
    // Rule: Multiple violations in short time
    const multipleViolationsRule: CorrelationRule = {
      id: 'multiple-violations-rule',
      name: 'Multiple Violations Detection',
      description: 'Detects when multiple violations occur in a short time period',
      sourceEvents: ['compliance:violation:detected'],
      targetEvents: ['compliance:violation:detected'],
      conditions: [
        {
          field: 'timestamp',
          operator: 'GREATER_THAN',
          value: Date.now() - 3600000, // Last hour
          timeWindow: 3600000
        }
      ],
      actions: [
        {
          type: 'ALERT',
          parameters: {
            severity: 'HIGH',
            message: 'Multiple compliance violations detected in short time period'
          }
        },
        {
          type: 'ANALYSIS',
          parameters: {
            analysisType: 'pattern-analysis',
            depth: 'detailed'
          }
        }
      ],
      enabled: true,
      priority: 1
    };

    // Rule: Rule changes followed by violations
    const ruleChangeViolationRule: CorrelationRule = {
      id: 'rule-change-violation-rule',
      name: 'Rule Change Impact Analysis',
      description: 'Analyzes impact of rule changes on violation patterns',
      sourceEvents: ['compliance:rule:updated'],
      targetEvents: ['compliance:violation:detected'],
      conditions: [
        {
          field: 'ruleId',
          operator: 'EQUALS',
          value: '${sourceEvent.ruleId}',
          timeWindow: 86400000 // 24 hours
        }
      ],
      actions: [
        {
          type: 'ANALYSIS',
          parameters: {
            analysisType: 'impact-analysis',
            scope: 'rule-change-impact'
          }
        },
        {
          type: 'REPORT',
          parameters: {
            reportType: 'rule-change-impact-report',
            recipients: ['compliance-managers']
          }
        }
      ],
      enabled: true,
      priority: 2
    };

    // Rule: Audit completion with findings
    const auditFindingsRule: CorrelationRule = {
      id: 'audit-findings-rule',
      name: 'Audit Findings Correlation',
      description: 'Correlates audit findings with existing violations',
      sourceEvents: ['compliance:audit:completed'],
      targetEvents: ['compliance:violation:detected'],
      conditions: [
        {
          field: 'findingsCount',
          operator: 'GREATER_THAN',
          value: 0,
          timeWindow: 604800000 // 7 days
        }
      ],
      actions: [
        {
          type: 'ANALYSIS',
          parameters: {
            analysisType: 'audit-findings-correlation',
            scope: 'comprehensive'
          }
        },
        {
          type: 'WORKFLOW',
          parameters: {
            workflowType: 'audit-findings-remediation',
            priority: 'HIGH'
          }
        }
      ],
      enabled: true,
      priority: 3
    };

    this.correlationRules.set(multipleViolationsRule.id, multipleViolationsRule);
    this.correlationRules.set(ruleChangeViolationRule.id, ruleChangeViolationRule);
    this.correlationRules.set(auditFindingsRule.id, auditFindingsRule);
  }

  // Subscribe to compliance events
  private subscribeToEvents(): void {
    complianceEventBus.on('compliance:rule:created', (event) => {
      this.processEvent('compliance:rule:created', event);
    });

    complianceEventBus.on('compliance:rule:updated', (event) => {
      this.processEvent('compliance:rule:updated', event);
    });

    complianceEventBus.on('compliance:violation:detected', (event) => {
      this.processEvent('compliance:violation:detected', event);
    });

    complianceEventBus.on('compliance:audit:completed', (event) => {
      this.processEvent('compliance:audit:completed', event);
    });

    complianceEventBus.on('workflow:completed', (event) => {
      this.processEvent('workflow:completed', event);
    });
  }

  // Process incoming events
  private processEvent(eventType: string, event: any): void {
    // Add to event buffer
    if (!this.eventBuffer.has(eventType)) {
      this.eventBuffer.set(eventType, []);
    }
    this.eventBuffer.get(eventType)!.push(event);

    // Clean old events (keep last 1000 events per type)
    const events = this.eventBuffer.get(eventType)!;
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    // Check correlation rules
    this.checkCorrelationRules(eventType, event);
  }

  // Check correlation rules for a given event
  private checkCorrelationRules(eventType: string, event: any): void {
    for (const [ruleId, rule] of this.correlationRules) {
      if (!rule.enabled) continue;

      // Check if this event matches source or target events
      if (rule.sourceEvents.includes(eventType) || rule.targetEvents.includes(eventType)) {
        this.evaluateCorrelationRule(rule, event);
      }
    }
  }

  // Evaluate a correlation rule
  private evaluateCorrelationRule(rule: CorrelationRule, triggerEvent: any): void {
    try {
      // Get relevant events from buffer
      const sourceEvents = this.getEventsFromBuffer(rule.sourceEvents);
      const targetEvents = this.getEventsFromBuffer(rule.targetEvents);

      // Check conditions
      const conditionsMet = this.checkConditions(rule.conditions, {
        sourceEvents,
        targetEvents,
        triggerEvent
      });

      if (conditionsMet) {
        // Create correlation result
        const correlationResult: CorrelationResult = {
          id: `correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          ruleName: rule.name,
          sourceEvents,
          targetEvents,
          confidence: this.calculateConfidence(rule, sourceEvents, targetEvents),
          timestamp: new Date(),
          metadata: {
            triggerEvent,
            conditions: rule.conditions
          }
        };

        // Execute actions
        this.executeCorrelationActions(rule.actions, correlationResult);

        // Generate insights
        this.generateInsightsFromCorrelation(correlationResult);
      }
    } catch (error) {
      console.error(`Error evaluating correlation rule ${rule.id}:`, error);
    }
  }

  // Get events from buffer
  private getEventsFromBuffer(eventTypes: string[]): any[] {
    const events: any[] = [];
    
    for (const eventType of eventTypes) {
      const bufferEvents = this.eventBuffer.get(eventType) || [];
      events.push(...bufferEvents);
    }

    return events;
  }

  // Check correlation conditions
  private checkConditions(conditions: CorrelationCondition[], context: any): boolean {
    return conditions.every(condition => {
      const value = this.extractFieldValue(condition.field, context);
      
      switch (condition.operator) {
        case 'EQUALS':
          return value === condition.value;
        case 'NOT_EQUALS':
          return value !== condition.value;
        case 'GREATER_THAN':
          return value > condition.value;
        case 'LESS_THAN':
          return value < condition.value;
        case 'CONTAINS':
          return String(value).includes(String(condition.value));
        case 'REGEX':
          return new RegExp(condition.value).test(String(value));
        default:
          return false;
      }
    });
  }

  // Extract field value from context
  private extractFieldValue(field: string, context: any): any {
    // Handle template variables like ${sourceEvent.ruleId}
    if (field.startsWith('${') && field.endsWith('}')) {
      const path = field.slice(2, -1);
      const parts = path.split('.');
      let value = context;
      
      for (const part of parts) {
        value = value?.[part];
      }
      
      return value;
    }

    // Direct field access
    return context[field];
  }

  // Calculate correlation confidence
  private calculateConfidence(rule: CorrelationRule, sourceEvents: any[], targetEvents: any[]): number {
    // Simple confidence calculation based on event frequency and rule complexity
    const totalEvents = sourceEvents.length + targetEvents.length;
    const ruleComplexity = rule.conditions.length + rule.actions.length;
    
    let confidence = Math.min(totalEvents / 10, 1) * 0.7; // Base confidence from event frequency
    confidence += Math.min(ruleComplexity / 5, 1) * 0.3; // Additional confidence from rule complexity
    
    return Math.min(confidence, 1);
  }

  // Execute correlation actions
  private async executeCorrelationActions(actions: CorrelationAction[], result: CorrelationResult): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'ALERT':
            await this.executeAlertAction(action, result);
            break;
          case 'ANALYSIS':
            await this.executeAnalysisAction(action, result);
            break;
          case 'WORKFLOW':
            await this.executeWorkflowAction(action, result);
            break;
          case 'NOTIFICATION':
            await this.executeNotificationAction(action, result);
            break;
          case 'REPORT':
            await this.executeReportAction(action, result);
            break;
        }
      } catch (error) {
        console.error(`Error executing correlation action ${action.type}:`, error);
      }
    }
  }

  // Execute alert action
  private async executeAlertAction(action: CorrelationAction, result: CorrelationResult): Promise<void> {
    const alert = {
      id: `alert-${Date.now()}`,
      type: 'CORRELATION_ALERT',
      severity: action.parameters.severity || 'MEDIUM',
      message: action.parameters.message || `Correlation detected: ${result.ruleName}`,
      correlationResult: result,
      timestamp: new Date()
    };

    // Publish alert event
    await complianceEventBus.publish({
      type: 'analytics:alert:created',
      payload: alert,
      timestamp: new Date(),
      source: 'compliance-analytics'
    });
  }

  // Execute analysis action
  private async executeAnalysisAction(action: CorrelationAction, result: CorrelationResult): Promise<void> {
    const analysis = {
      id: `analysis-${Date.now()}`,
      type: action.parameters.analysisType || 'correlation-analysis',
      correlationResult: result,
      scope: action.parameters.scope || 'standard',
      timestamp: new Date()
    };

    // Perform analysis based on type
    switch (action.parameters.analysisType) {
      case 'pattern-analysis':
        await this.performPatternAnalysis(analysis);
        break;
      case 'impact-analysis':
        await this.performImpactAnalysis(analysis);
        break;
      case 'audit-findings-correlation':
        await this.performAuditFindingsCorrelation(analysis);
        break;
      default:
        await this.performStandardAnalysis(analysis);
    }
  }

  // Execute workflow action
  private async executeWorkflowAction(action: CorrelationAction, result: CorrelationResult): Promise<void> {
    const workflowRequest = {
      id: `workflow-${Date.now()}`,
      type: action.parameters.workflowType || 'correlation-response',
      correlationResult: result,
      priority: action.parameters.priority || 'MEDIUM',
      timestamp: new Date()
    };

    // Publish workflow request event
    await complianceEventBus.publish({
      type: 'analytics:workflow:requested',
      payload: workflowRequest,
      timestamp: new Date(),
      source: 'compliance-analytics'
    });
  }

  // Execute notification action
  private async executeNotificationAction(action: CorrelationAction, result: CorrelationResult): Promise<void> {
    const notification = {
      id: `notification-${Date.now()}`,
      type: 'CORRELATION_NOTIFICATION',
      recipients: action.parameters.recipients || [],
      message: `Correlation detected: ${result.ruleName}`,
      correlationResult: result,
      timestamp: new Date()
    };

    // Publish notification event
    await complianceEventBus.publish({
      type: 'analytics:notification:sent',
      payload: notification,
      timestamp: new Date(),
      source: 'compliance-analytics'
    });
  }

  // Execute report action
  private async executeReportAction(action: CorrelationAction, result: CorrelationResult): Promise<void> {
    const report = {
      id: `report-${Date.now()}`,
      type: action.parameters.reportType || 'correlation-report',
      correlationResult: result,
      recipients: action.parameters.recipients || [],
      timestamp: new Date()
    };

    // Publish report event
    await complianceEventBus.publish({
      type: 'analytics:report:generated',
      payload: report,
      timestamp: new Date(),
      source: 'compliance-analytics'
    });
  }

  // Perform pattern analysis
  private async performPatternAnalysis(analysis: any): Promise<void> {
    const pattern = {
      id: `pattern-${Date.now()}`,
      type: 'EVENT_PATTERN',
      events: analysis.correlationResult.sourceEvents,
      frequency: this.calculateEventFrequency(analysis.correlationResult.sourceEvents),
      confidence: analysis.correlationResult.confidence,
      timestamp: new Date()
    };

    // Generate insight from pattern
    this.generateInsight({
      type: 'PATTERN',
      title: 'Event Pattern Detected',
      description: `Detected recurring pattern in compliance events with ${pattern.confidence.toFixed(2)} confidence`,
      severity: pattern.confidence > 0.8 ? 'HIGH' : 'MEDIUM',
      confidence: pattern.confidence,
      data: pattern,
      recommendations: [
        'Investigate root cause of pattern',
        'Consider implementing preventive measures',
        'Monitor pattern frequency for changes'
      ],
      timestamp: new Date(),
      tags: ['pattern', 'correlation', 'compliance']
    });
  }

  // Perform impact analysis
  private async performImpactAnalysis(analysis: any): Promise<void> {
    const impact = {
      id: `impact-${Date.now()}`,
      type: 'RULE_CHANGE_IMPACT',
      affectedRules: this.extractAffectedRules(analysis.correlationResult),
      violationIncrease: this.calculateViolationIncrease(analysis.correlationResult),
      riskScore: this.calculateRiskScore(analysis.correlationResult),
      timestamp: new Date()
    };

    // Generate insight from impact analysis
    this.generateInsight({
      type: 'RISK',
      title: 'Rule Change Impact Detected',
      description: `Rule changes resulted in ${impact.violationIncrease}% increase in violations`,
      severity: impact.riskScore > 0.7 ? 'HIGH' : 'MEDIUM',
      confidence: analysis.correlationResult.confidence,
      data: impact,
      recommendations: [
        'Review rule change implementation',
        'Consider rule adjustment or rollback',
        'Monitor impact over time'
      ],
      timestamp: new Date(),
      tags: ['impact', 'rule-change', 'risk']
    });
  }

  // Perform audit findings correlation
  private async performAuditFindingsCorrelation(analysis: any): Promise<void> {
    const correlation = {
      id: `audit-correlation-${Date.now()}`,
      type: 'AUDIT_FINDINGS_CORRELATION',
      auditFindings: this.extractAuditFindings(analysis.correlationResult),
      relatedViolations: this.extractRelatedViolations(analysis.correlationResult),
      correlationStrength: this.calculateCorrelationStrength(analysis.correlationResult),
      timestamp: new Date()
    };

    // Generate insight from audit correlation
    this.generateInsight({
      type: 'PATTERN',
      title: 'Audit Findings Correlation',
      description: `Found ${correlation.correlationStrength.toFixed(2)} correlation between audit findings and violations`,
      severity: correlation.correlationStrength > 0.8 ? 'HIGH' : 'MEDIUM',
      confidence: analysis.correlationResult.confidence,
      data: correlation,
      recommendations: [
        'Investigate common root causes',
        'Implement systemic fixes',
        'Enhance monitoring for similar issues'
      ],
      timestamp: new Date(),
      tags: ['audit', 'correlation', 'findings']
    });
  }

  // Perform standard analysis
  private async performStandardAnalysis(analysis: any): Promise<void> {
    const standardAnalysis = {
      id: `standard-${Date.now()}`,
      type: 'STANDARD_CORRELATION_ANALYSIS',
      eventCount: analysis.correlationResult.sourceEvents.length + analysis.correlationResult.targetEvents.length,
      timeSpan: this.calculateTimeSpan(analysis.correlationResult),
      confidence: analysis.correlationResult.confidence,
      timestamp: new Date()
    };

    // Generate insight from standard analysis
    this.generateInsight({
      type: 'TREND',
      title: 'Correlation Analysis Complete',
      description: `Analyzed ${standardAnalysis.eventCount} events over ${standardAnalysis.timeSpan} time period`,
      severity: 'MEDIUM',
      confidence: analysis.correlationResult.confidence,
      data: standardAnalysis,
      recommendations: [
        'Review correlation results',
        'Consider additional analysis if needed',
        'Monitor for similar patterns'
      ],
      timestamp: new Date(),
      tags: ['analysis', 'correlation', 'standard']
    });
  }

  // Generate insights from correlation
  private generateInsightsFromCorrelation(result: CorrelationResult): void {
    // Generate trend insight
    this.generateInsight({
      type: 'TREND',
      title: 'Correlation Trend Detected',
      description: `Detected correlation trend: ${result.ruleName}`,
      severity: result.confidence > 0.8 ? 'HIGH' : 'MEDIUM',
      confidence: result.confidence,
      data: result,
      recommendations: [
        'Monitor correlation frequency',
        'Investigate underlying causes',
        'Consider preventive measures'
      ],
      timestamp: new Date(),
      tags: ['correlation', 'trend', 'compliance']
    });
  }

  // Generate insight
  private generateInsight(insight: ComplianceInsight): void {
    this.insights.push(insight);
    
    // Keep only last 100 insights
    if (this.insights.length > 100) {
      this.insights.splice(0, this.insights.length - 100);
    }

    // Notify subscribers
    this.notifySubscribers(insight);

    // Publish insight event
    complianceEventBus.publish({
      type: 'analytics:insight:generated',
      payload: insight,
      timestamp: new Date(),
      source: 'compliance-analytics'
    });
  }

  // Start periodic analysis
  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, 300000); // Every 5 minutes
  }

  // Perform periodic analysis
  private performPeriodicAnalysis(): void {
    this.analyzeTrends();
    this.detectAnomalies();
    this.generatePeriodicInsights();
  }

  // Analyze trends
  private analyzeTrends(): void {
    const store = useComplianceStore.getState();
    
    // Analyze violation trends
    const violationTrend = this.calculateTrend('violations', store.violations);
    this.trends.set('violations', violationTrend);

    // Analyze rule activity trends
    const ruleActivityTrend = this.calculateTrend('rule-activity', store.rules);
    this.trends.set('rule-activity', ruleActivityTrend);

    // Analyze compliance score trends
    const complianceScoreTrend = this.calculateTrend('compliance-score', store.analytics);
    this.trends.set('compliance-score', complianceScoreTrend);
  }

  // Calculate trend for a metric
  private calculateTrend(metric: string, data: any[]): ComplianceTrend {
    // Simple trend calculation (in real implementation, use more sophisticated algorithms)
    const timeRange = '24h';
    const dataPoints = data.slice(-24).map((item, index) => ({
      timestamp: new Date(Date.now() - (24 - index) * 3600000),
      value: this.extractMetricValue(metric, item),
      metadata: item
    }));

    const values = dataPoints.map(d => d.value);
    const changeRate = values.length > 1 ? (values[values.length - 1] - values[0]) / values[0] : 0;
    
    let trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
    if (Math.abs(changeRate) < 0.05) {
      trend = 'STABLE';
    } else if (changeRate > 0.1) {
      trend = 'INCREASING';
    } else if (changeRate < -0.1) {
      trend = 'DECREASING';
    } else {
      trend = 'VOLATILE';
    }

    return {
      metric,
      timeRange,
      data: dataPoints,
      trend,
      changeRate
    };
  }

  // Extract metric value from data
  private extractMetricValue(metric: string, data: any): number {
    switch (metric) {
      case 'violations':
        return data.severity === 'CRITICAL' ? 4 : 
               data.severity === 'HIGH' ? 3 :
               data.severity === 'MEDIUM' ? 2 : 1;
      case 'rule-activity':
        return data.status === 'ACTIVE' ? 1 : 0;
      case 'compliance-score':
        return data.complianceScore || 0;
      default:
        return 0;
    }
  }

  // Detect anomalies
  private detectAnomalies(): void {
    const store = useComplianceStore.getState();
    
    // Detect violation anomalies
    this.detectViolationAnomalies(store.violations);
    
    // Detect compliance score anomalies
    this.detectComplianceScoreAnomalies(store.analytics);
  }

  // Detect violation anomalies
  private detectViolationAnomalies(violations: any[]): void {
    const recentViolations = violations.filter(v => 
      v.detectedAt > new Date(Date.now() - 3600000) // Last hour
    );

    const expectedViolations = 5; // Expected violations per hour
    const actualViolations = recentViolations.length;
    const deviation = Math.abs(actualViolations - expectedViolations) / expectedViolations;

    if (deviation > 0.5) { // 50% deviation threshold
      const anomaly: ComplianceAnomaly = {
        id: `anomaly-${Date.now()}`,
        metric: 'violations',
        expectedValue: expectedViolations,
        actualValue: actualViolations,
        deviation,
        severity: deviation > 1 ? 'HIGH' : 'MEDIUM',
        timestamp: new Date(),
        context: { recentViolations }
      };

      this.anomalies.push(anomaly);
      
      // Generate insight from anomaly
      this.generateInsight({
        type: 'ANOMALY',
        title: 'Violation Rate Anomaly',
        description: `Detected ${deviation.toFixed(2)}x deviation in violation rate`,
        severity: anomaly.severity,
        confidence: 0.8,
        data: anomaly,
        recommendations: [
          'Investigate root cause of increased violations',
          'Check for system issues or rule changes',
          'Review recent compliance activities'
        ],
        timestamp: new Date(),
        tags: ['anomaly', 'violations', 'rate']
      });
    }
  }

  // Detect compliance score anomalies
  private detectComplianceScoreAnomalies(analytics: any): void {
    const currentScore = analytics.complianceScore;
    const expectedScore = 85; // Expected compliance score
    const deviation = Math.abs(currentScore - expectedScore) / expectedScore;

    if (deviation > 0.1) { // 10% deviation threshold
      const anomaly: ComplianceAnomaly = {
        id: `anomaly-${Date.now()}`,
        metric: 'compliance-score',
        expectedValue: expectedScore,
        actualValue: currentScore,
        deviation,
        severity: deviation > 0.2 ? 'HIGH' : 'MEDIUM',
        timestamp: new Date(),
        context: { analytics }
      };

      this.anomalies.push(anomaly);
      
      // Generate insight from anomaly
      this.generateInsight({
        type: 'ANOMALY',
        title: 'Compliance Score Anomaly',
        description: `Compliance score deviated by ${(deviation * 100).toFixed(1)}% from expected`,
        severity: anomaly.severity,
        confidence: 0.8,
        data: anomaly,
        recommendations: [
          'Review recent compliance violations',
          'Check rule effectiveness',
          'Analyze compliance trends'
        ],
        timestamp: new Date(),
        tags: ['anomaly', 'compliance-score']
      });
    }
  }

  // Generate periodic insights
  private generatePeriodicInsights(): void {
    const store = useComplianceStore.getState();
    
    // Generate compliance health insight
    this.generateComplianceHealthInsight(store);
    
    // Generate efficiency insight
    this.generateEfficiencyInsight(store);
  }

  // Generate compliance health insight
  private generateComplianceHealthInsight(store: any): void {
    const healthScore = this.calculateComplianceHealthScore(store);
    
    this.generateInsight({
      type: 'TREND',
      title: 'Compliance Health Assessment',
      description: `Overall compliance health score: ${healthScore.toFixed(1)}/100`,
      severity: healthScore < 70 ? 'HIGH' : healthScore < 85 ? 'MEDIUM' : 'LOW',
      confidence: 0.9,
      data: { healthScore, analytics: store.analytics },
      recommendations: [
        healthScore < 70 ? 'Immediate action required to improve compliance' :
        healthScore < 85 ? 'Monitor and improve compliance processes' :
        'Maintain current compliance standards'
      ],
      timestamp: new Date(),
      tags: ['health', 'compliance', 'assessment']
    });
  }

  // Calculate compliance health score
  private calculateComplianceHealthScore(store: any): number {
    const { analytics } = store;
    const complianceScore = analytics.complianceScore || 0;
    const activeRules = analytics.activeRules || 0;
    const totalRules = analytics.totalRules || 1;
    const ruleActivity = activeRules / totalRules;
    
    return (complianceScore * 0.7) + (ruleActivity * 30);
  }

  // Generate efficiency insight
  private generateEfficiencyInsight(store: any): void {
    const efficiencyScore = this.calculateEfficiencyScore(store);
    
    this.generateInsight({
      type: 'OPPORTUNITY',
      title: 'Compliance Efficiency Analysis',
      description: `Compliance efficiency score: ${efficiencyScore.toFixed(1)}/100`,
      severity: efficiencyScore < 60 ? 'HIGH' : efficiencyScore < 80 ? 'MEDIUM' : 'LOW',
      confidence: 0.8,
      data: { efficiencyScore, store },
      recommendations: [
        efficiencyScore < 60 ? 'Implement automation to improve efficiency' :
        efficiencyScore < 80 ? 'Optimize compliance processes' :
        'Maintain current efficiency levels'
      ],
      timestamp: new Date(),
      tags: ['efficiency', 'optimization', 'automation']
    });
  }

  // Calculate efficiency score
  private calculateEfficiencyScore(store: any): number {
    // Simple efficiency calculation based on various factors
    const { analytics, rules, violations } = store;
    
    const automationScore = analytics.activeRules / Math.max(analytics.totalRules, 1) * 100;
    const resolutionScore = violations.filter((v: any) => v.status === 'RESOLVED').length / Math.max(violations.length, 1) * 100;
    const complianceScore = analytics.complianceScore || 0;
    
    return (automationScore * 0.4) + (resolutionScore * 0.3) + (complianceScore * 0.3);
  }

  // Subscribe to insights
  subscribe(callback: (insight: ComplianceInsight) => void): string {
    const id = `insight-subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(id, callback);
    return id;
  }

  // Unsubscribe from insights
  unsubscribe(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  // Notify subscribers
  private notifySubscribers(insight: ComplianceInsight): void {
    this.subscribers.forEach(callback => {
      try {
        callback(insight);
      } catch (error) {
        console.error('Error in insight subscriber:', error);
      }
    });
  }

  // Get insights
  getInsights(): ComplianceInsight[] {
    return [...this.insights];
  }

  // Get trends
  getTrends(): Map<string, ComplianceTrend> {
    return new Map(this.trends);
  }

  // Get anomalies
  getAnomalies(): ComplianceAnomaly[] {
    return [...this.anomalies];
  }

  // Get correlation rules
  getCorrelationRules(): CorrelationRule[] {
    return Array.from(this.correlationRules.values());
  }

  // Add correlation rule
  addCorrelationRule(rule: CorrelationRule): void {
    this.correlationRules.set(rule.id, rule);
  }

  // Remove correlation rule
  removeCorrelationRule(ruleId: string): boolean {
    return this.correlationRules.delete(ruleId);
  }

  // Get analytics statistics
  getAnalyticsStats(): {
    totalInsights: number;
    totalTrends: number;
    totalAnomalies: number;
    activeRules: number;
    averageConfidence: number;
  } {
    const totalInsights = this.insights.length;
    const totalTrends = this.trends.size;
    const totalAnomalies = this.anomalies.length;
    const activeRules = this.correlationRules.size;
    const averageConfidence = this.insights.length > 0
      ? this.insights.reduce((sum, insight) => sum + insight.confidence, 0) / this.insights.length
      : 0;

    return {
      totalInsights,
      totalTrends,
      totalAnomalies,
      activeRules,
      averageConfidence
    };
  }
}

// Export singleton instance
export const complianceCorrelationEngine = new ComplianceCorrelationEngine();

export default complianceCorrelationEngine;