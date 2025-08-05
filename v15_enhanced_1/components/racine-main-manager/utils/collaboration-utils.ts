/**
 * Advanced Collaboration Utilities
 * Provides comprehensive utilities for the master collaboration system
 */

import { 
  CollaborationHub, 
  CollaborationSession, 
  CollaborationParticipant, 
  CollaborationDocument, 
  CollaborationMessage, 
  CollaborationTask, 
  CollaborationAnalytics,
  CollaborationPermission,
  CollaborationNotification,
  CollaborationEvent,
  UUID,
  ISODateString 
} from '../types/racine-core.types';

/**
 * Collaboration Hub Management Utilities
 * Provides utilities for managing collaboration hubs across all groups
 */
export class CollaborationHubManager {
  /**
   * Create a new collaboration hub with proper initialization
   */
  static createHub(
    name: string,
    type: 'project' | 'team' | 'cross_group' | 'temporary',
    ownerId: UUID,
    groupIds: string[],
    settings?: Partial<CollaborationHub['settings']>
  ): Partial<CollaborationHub> {
    return {
      name,
      type,
      owner_id: ownerId,
      connected_groups: groupIds,
      settings: {
        is_public: false,
        allow_external_collaborators: false,
        auto_archive_inactive: true,
        require_approval_for_join: true,
        enable_real_time_collaboration: true,
        max_participants: 50,
        retention_policy: '1_year',
        ...settings
      },
      status: 'active',
      created_at: new Date().toISOString() as ISODateString,
      updated_at: new Date().toISOString() as ISODateString
    };
  }

  /**
   * Validate hub permissions for a user
   */
  static validateHubPermissions(
    hub: CollaborationHub,
    userId: UUID,
    requiredPermission: CollaborationPermission['permission_type']
  ): boolean {
    // Check if user is owner
    if (hub.owner_id === userId) {
      return true;
    }

    // Check participant permissions
    const participant = hub.participants.find(p => p.user_id === userId);
    if (!participant) {
      return false;
    }

    // Check specific permissions
    return participant.permissions.some(p => 
      p.permission_type === requiredPermission && p.granted
    );
  }

  /**
   * Get hub statistics and metrics
   */
  static getHubMetrics(hub: CollaborationHub): {
    totalParticipants: number;
    activeParticipants: number;
    totalSessions: number;
    activeSessions: number;
    totalDocuments: number;
    totalMessages: number;
    averageSessionDuration: number;
    collaborationScore: number;
  } {
    const activeParticipants = hub.participants.filter(p => p.status === 'active').length;
    const activeSessions = hub.sessions.filter(s => s.status === 'active').length;
    
    const totalSessionDuration = hub.sessions.reduce((acc, session) => {
      if (session.ended_at) {
        return acc + (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime());
      }
      return acc;
    }, 0);

    const averageSessionDuration = hub.sessions.length > 0 
      ? totalSessionDuration / hub.sessions.length / (1000 * 60) // in minutes
      : 0;

    // Calculate collaboration score based on activity
    const collaborationScore = Math.min(100, 
      (activeParticipants * 10) + 
      (activeSessions * 5) + 
      (hub.documents.length * 2) + 
      (hub.messages.length * 0.1)
    );

    return {
      totalParticipants: hub.participants.length,
      activeParticipants,
      totalSessions: hub.sessions.length,
      activeSessions,
      totalDocuments: hub.documents.length,
      totalMessages: hub.messages.length,
      averageSessionDuration,
      collaborationScore
    };
  }
}

/**
 * Collaboration Session Management Utilities
 * Handles session lifecycle, participant coordination, and real-time features
 */
export class CollaborationSessionManager {
  /**
   * Create a new collaboration session
   */
  static createSession(
    hubId: UUID,
    initiatorId: UUID,
    type: 'meeting' | 'workshop' | 'review' | 'brainstorm' | 'planning',
    title: string,
    agenda?: string[]
  ): Partial<CollaborationSession> {
    return {
      hub_id: hubId,
      initiator_id: initiatorId,
      type,
      title,
      agenda: agenda || [],
      status: 'scheduled',
      started_at: new Date().toISOString() as ISODateString,
      settings: {
        allow_screen_sharing: true,
        enable_recording: false,
        require_moderator_approval: false,
        max_duration_minutes: 120,
        auto_end_when_empty: true
      },
      created_at: new Date().toISOString() as ISODateString,
      updated_at: new Date().toISOString() as ISODateString
    };
  }

  /**
   * Calculate session health score
   */
  static calculateSessionHealth(session: CollaborationSession): {
    score: number;
    factors: {
      participation: number;
      engagement: number;
      productivity: number;
      technical: number;
    };
    recommendations: string[];
  } {
    const factors = {
      participation: Math.min(100, session.participants.length * 20),
      engagement: session.messages ? Math.min(100, session.messages.length * 2) : 0,
      productivity: session.shared_documents ? Math.min(100, session.shared_documents.length * 10) : 0,
      technical: session.connection_quality || 100
    };

    const score = Object.values(factors).reduce((acc, val) => acc + val, 0) / 4;

    const recommendations: string[] = [];
    if (factors.participation < 50) recommendations.push('Consider inviting more relevant participants');
    if (factors.engagement < 30) recommendations.push('Encourage more active participation');
    if (factors.productivity < 40) recommendations.push('Share more collaborative documents');
    if (factors.technical < 80) recommendations.push('Check network connectivity');

    return { score, factors, recommendations };
  }

  /**
   * Generate session summary
   */
  static generateSessionSummary(session: CollaborationSession): {
    duration: number;
    participantCount: number;
    messageCount: number;
    documentsShared: number;
    keyTopics: string[];
    actionItems: string[];
    decisions: string[];
  } {
    const duration = session.ended_at 
      ? new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
      : 0;

    return {
      duration: Math.round(duration / (1000 * 60)), // in minutes
      participantCount: session.participants.length,
      messageCount: session.messages?.length || 0,
      documentsShared: session.shared_documents?.length || 0,
      keyTopics: session.agenda || [],
      actionItems: session.action_items || [],
      decisions: session.decisions || []
    };
  }
}

/**
 * Document Collaboration Utilities
 * Handles collaborative document management, versioning, and real-time editing
 */
export class DocumentCollaborationManager {
  /**
   * Create collaborative document metadata
   */
  static createDocumentMetadata(
    title: string,
    type: 'document' | 'spreadsheet' | 'presentation' | 'diagram' | 'code',
    ownerId: UUID,
    hubId: UUID
  ): Partial<CollaborationDocument> {
    return {
      title,
      type,
      owner_id: ownerId,
      hub_id: hubId,
      status: 'draft',
      version: '1.0.0',
      permissions: {
        can_view: [],
        can_edit: [],
        can_comment: [],
        can_share: []
      },
      collaboration_settings: {
        allow_simultaneous_editing: true,
        track_changes: true,
        require_approval_for_changes: false,
        auto_save_interval: 30,
        conflict_resolution: 'last_writer_wins'
      },
      created_at: new Date().toISOString() as ISODateString,
      updated_at: new Date().toISOString() as ISODateString
    };
  }

  /**
   * Resolve document conflicts
   */
  static resolveConflicts(
    baseVersion: any,
    userChanges: any[],
    strategy: 'merge' | 'latest_wins' | 'manual'
  ): {
    resolvedContent: any;
    conflicts: Array<{
      path: string;
      baseValue: any;
      conflictingValues: any[];
      resolution: any;
    }>;
  } {
    const conflicts: any[] = [];
    let resolvedContent = { ...baseVersion };

    if (strategy === 'latest_wins') {
      // Apply the most recent change
      const latestChange = userChanges[userChanges.length - 1];
      resolvedContent = { ...resolvedContent, ...latestChange };
    } else if (strategy === 'merge') {
      // Attempt to merge non-conflicting changes
      userChanges.forEach(change => {
        Object.keys(change).forEach(key => {
          if (resolvedContent[key] !== change[key]) {
            if (resolvedContent[key] === baseVersion[key]) {
              // No conflict, apply change
              resolvedContent[key] = change[key];
            } else {
              // Conflict detected
              conflicts.push({
                path: key,
                baseValue: baseVersion[key],
                conflictingValues: [resolvedContent[key], change[key]],
                resolution: change[key] // Default to latest
              });
              resolvedContent[key] = change[key];
            }
          }
        });
      });
    }

    return { resolvedContent, conflicts };
  }

  /**
   * Calculate document collaboration metrics
   */
  static getDocumentMetrics(document: CollaborationDocument): {
    totalEditors: number;
    activeEditors: number;
    totalVersions: number;
    collaborationIntensity: number;
    lastActivity: ISODateString;
  } {
    const totalEditors = document.editors?.length || 0;
    const activeEditors = document.editors?.filter(e => e.status === 'active').length || 0;
    const totalVersions = document.version_history?.length || 1;
    
    // Calculate collaboration intensity based on recent activity
    const recentActivity = document.version_history?.filter(v => 
      new Date(v.created_at).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    ).length || 0;
    
    const collaborationIntensity = Math.min(100, recentActivity * 10 + activeEditors * 20);

    return {
      totalEditors,
      activeEditors,
      totalVersions,
      collaborationIntensity,
      lastActivity: document.updated_at
    };
  }
}

/**
 * Communication and Messaging Utilities
 * Handles real-time messaging, notifications, and communication flows
 */
export class CollaborationCommunicationManager {
  /**
   * Format message for display
   */
  static formatMessage(message: CollaborationMessage): {
    displayText: string;
    timestamp: string;
    authorName: string;
    messageType: string;
    hasAttachments: boolean;
  } {
    return {
      displayText: message.content,
      timestamp: new Date(message.created_at).toLocaleTimeString(),
      authorName: message.author_name || 'Unknown User',
      messageType: message.type,
      hasAttachments: (message.attachments?.length || 0) > 0
    };
  }

  /**
   * Create notification from collaboration event
   */
  static createNotification(
    event: CollaborationEvent,
    recipientId: UUID
  ): CollaborationNotification {
    return {
      id: crypto.randomUUID() as UUID,
      recipient_id: recipientId,
      type: event.event_type as any,
      title: this.getNotificationTitle(event),
      message: this.getNotificationMessage(event),
      priority: this.getNotificationPriority(event),
      read: false,
      created_at: new Date().toISOString() as ISODateString,
      data: event.event_data
    };
  }

  private static getNotificationTitle(event: CollaborationEvent): string {
    const titles = {
      'hub_created': 'New Collaboration Hub Created',
      'session_started': 'Collaboration Session Started',
      'document_shared': 'Document Shared',
      'message_received': 'New Message',
      'participant_joined': 'New Participant Joined',
      'task_assigned': 'Task Assigned',
      'deadline_approaching': 'Deadline Approaching'
    };
    return titles[event.event_type as keyof typeof titles] || 'Collaboration Update';
  }

  private static getNotificationMessage(event: CollaborationEvent): string {
    // Generate contextual message based on event type and data
    switch (event.event_type) {
      case 'hub_created':
        return `A new collaboration hub "${event.event_data.hub_name}" has been created.`;
      case 'session_started':
        return `Collaboration session "${event.event_data.session_title}" has started.`;
      case 'document_shared':
        return `Document "${event.event_data.document_title}" has been shared with you.`;
      default:
        return 'You have a new collaboration update.';
    }
  }

  private static getNotificationPriority(event: CollaborationEvent): 'low' | 'medium' | 'high' | 'urgent' {
    const highPriorityEvents = ['deadline_approaching', 'urgent_task_assigned'];
    const mediumPriorityEvents = ['session_started', 'document_shared'];
    
    if (highPriorityEvents.includes(event.event_type)) return 'high';
    if (mediumPriorityEvents.includes(event.event_type)) return 'medium';
    return 'low';
  }
}

/**
 * Analytics and Reporting Utilities
 * Provides collaboration analytics, insights, and reporting capabilities
 */
export class CollaborationAnalyticsManager {
  /**
   * Calculate overall collaboration health across hubs
   */
  static calculateCollaborationHealth(hubs: CollaborationHub[]): {
    overallScore: number;
    metrics: {
      activeHubs: number;
      totalParticipants: number;
      averageEngagement: number;
      productivityIndex: number;
    };
    trends: {
      hubGrowth: number;
      participantGrowth: number;
      engagementTrend: number;
    };
    recommendations: string[];
  } {
    const activeHubs = hubs.filter(h => h.status === 'active').length;
    const totalParticipants = hubs.reduce((acc, hub) => acc + hub.participants.length, 0);
    
    const hubMetrics = hubs.map(hub => CollaborationHubManager.getHubMetrics(hub));
    const averageEngagement = hubMetrics.reduce((acc, m) => acc + m.collaborationScore, 0) / hubMetrics.length || 0;
    
    const productivityIndex = hubMetrics.reduce((acc, m) => 
      acc + m.totalDocuments + m.totalMessages * 0.1, 0
    ) / hubs.length || 0;

    const overallScore = (
      (activeHubs / hubs.length * 100) * 0.3 +
      averageEngagement * 0.4 +
      Math.min(100, productivityIndex) * 0.3
    );

    const recommendations: string[] = [];
    if (overallScore < 60) recommendations.push('Consider organizing team collaboration workshops');
    if (averageEngagement < 40) recommendations.push('Implement engagement incentives');
    if (activeHubs < hubs.length * 0.7) recommendations.push('Review and archive inactive hubs');

    return {
      overallScore,
      metrics: {
        activeHubs,
        totalParticipants,
        averageEngagement,
        productivityIndex
      },
      trends: {
        hubGrowth: 0, // Would need historical data
        participantGrowth: 0, // Would need historical data
        engagementTrend: 0 // Would need historical data
      },
      recommendations
    };
  }

  /**
   * Generate collaboration insights
   */
  static generateInsights(analytics: CollaborationAnalytics): {
    topPerformers: Array<{ userId: UUID; score: number; contributions: number }>;
    mostActiveHubs: Array<{ hubId: UUID; activityScore: number }>;
    collaborationPatterns: Array<{ pattern: string; frequency: number; impact: string }>;
    improvementAreas: Array<{ area: string; currentScore: number; targetScore: number; actions: string[] }>;
  } {
    // This would typically integrate with more sophisticated analytics
    return {
      topPerformers: [],
      mostActiveHubs: [],
      collaborationPatterns: [
        { pattern: 'Cross-group collaboration', frequency: 75, impact: 'high' },
        { pattern: 'Document co-creation', frequency: 60, impact: 'medium' },
        { pattern: 'Real-time sessions', frequency: 45, impact: 'high' }
      ],
      improvementAreas: [
        {
          area: 'Session engagement',
          currentScore: 65,
          targetScore: 80,
          actions: ['Implement interactive features', 'Provide engagement training']
        }
      ]
    };
  }
}

/**
 * Cross-Group Collaboration Utilities
 * Handles collaboration across different data governance groups
 */
export class CrossGroupCollaborationManager {
  /**
   * Identify collaboration opportunities across groups
   */
  static identifyCollaborationOpportunities(
    groupData: { [groupId: string]: any },
    userRoles: { [userId: UUID]: string[] }
  ): Array<{
    type: 'data_quality' | 'compliance' | 'classification' | 'scanning';
    groups: string[];
    participants: UUID[];
    priority: 'low' | 'medium' | 'high';
    description: string;
  }> {
    const opportunities: any[] = [];

    // Example: Data quality issues requiring compliance review
    opportunities.push({
      type: 'data_quality',
      groups: ['data_sources', 'compliance'],
      participants: Object.keys(userRoles).filter(userId => 
        userRoles[userId].includes('data_steward') || userRoles[userId].includes('compliance_officer')
      ) as UUID[],
      priority: 'high',
      description: 'Data quality issues detected that require compliance review'
    });

    return opportunities;
  }

  /**
   * Create cross-group collaboration workspace
   */
  static createCrossGroupWorkspace(
    name: string,
    groups: string[],
    coordinatorId: UUID,
    objective: string
  ): {
    workspaceConfig: any;
    requiredPermissions: string[];
    suggestedParticipants: UUID[];
  } {
    return {
      workspaceConfig: {
        name,
        type: 'cross_group',
        groups,
        coordinator_id: coordinatorId,
        objective,
        settings: {
          enable_cross_group_data_sharing: true,
          require_approval_for_sensitive_data: true,
          audit_all_activities: true
        }
      },
      requiredPermissions: [
        'cross_group_collaboration',
        'data_sharing',
        'workspace_management'
      ],
      suggestedParticipants: [] // Would be populated based on group expertise
    };
  }
}

// Export all utility classes
export {
  CollaborationHubManager,
  CollaborationSessionManager,
  DocumentCollaborationManager,
  CollaborationCommunicationManager,
  CollaborationAnalyticsManager,
  CrossGroupCollaborationManager
};

// Export utility functions for common operations
export const collaborationUtils = {
  formatDuration: (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  },

  generateCollaborationId: (): UUID => {
    return crypto.randomUUID() as UUID;
  },

  validateCollaborationPermissions: (
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean => {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  },

  calculateEngagementScore: (
    messages: number,
    documents: number,
    sessions: number,
    timeframe: number
  ): number => {
    return Math.min(100, 
      (messages * 0.5) + 
      (documents * 2) + 
      (sessions * 5)
    ) / Math.max(1, timeframe / 7); // Normalize by weeks
  }
};