import { complianceEventBus } from '../core/event-bus';
import useComplianceStore from '../core/state-manager';

export interface CollaborationSession {
  id: string;
  name: string;
  type: 'COMPLIANCE_REVIEW' | 'RULE_DESIGN' | 'VIOLATION_ANALYSIS' | 'AUDIT_COLLABORATION';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  participants: CollaborationParticipant[];
  documents: CollaborationDocument[];
  messages: CollaborationMessage[];
  activities: CollaborationActivity[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
  settings: CollaborationSettings;
}

export interface CollaborationParticipant {
  id: string;
  userId: string;
  username: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER' | 'COMMENTER';
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
  joinedAt: Date;
  lastActivity: Date;
  permissions: string[];
}

export interface CollaborationDocument {
  id: string;
  name: string;
  type: 'RULE_DOCUMENT' | 'VIOLATION_REPORT' | 'AUDIT_FINDINGS' | 'COMPLIANCE_POLICY';
  content: string;
  version: number;
  changes: DocumentChange[];
  comments: DocumentComment[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
  };
}

export interface DocumentChange {
  id: string;
  userId: string;
  username: string;
  type: 'INSERT' | 'DELETE' | 'UPDATE' | 'FORMAT';
  position: number;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DocumentComment {
  id: string;
  userId: string;
  username: string;
  content: string;
  position?: number;
  replies: DocumentComment[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationMessage {
  id: string;
  userId: string;
  username: string;
  type: 'TEXT' | 'SYSTEM' | 'ANNOUNCEMENT' | 'ALERT';
  content: string;
  attachments?: MessageAttachment[];
  reactions: MessageReaction[];
  timestamp: Date;
  editedAt?: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  userId: string;
  username: string;
  emoji: string;
  timestamp: Date;
}

export interface CollaborationActivity {
  id: string;
  userId: string;
  username: string;
  type: 'JOINED' | 'LEFT' | 'DOCUMENT_EDITED' | 'COMMENT_ADDED' | 'REACTION_ADDED' | 'STATUS_CHANGED';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface CollaborationSettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  autoSave: boolean;
  versionControl: boolean;
  notifications: {
    messages: boolean;
    documentChanges: boolean;
    participantActivity: boolean;
    mentions: boolean;
  };
  permissions: {
    canEdit: string[];
    canComment: string[];
    canInvite: string[];
    canDelete: string[];
  };
}

export interface CollaborationInvitation {
  id: string;
  sessionId: string;
  invitedBy: string;
  invitedUser: string;
  role: 'EDITOR' | 'VIEWER' | 'COMMENTER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}

class ComplianceCollaborationEngine {
  private sessions: Map<string, CollaborationSession> = new Map();
  private invitations: Map<string, CollaborationInvitation> = new Map();
  private participants: Map<string, CollaborationParticipant> = new Map();
  private subscribers: Map<string, (event: any) => void> = new Map();
  private typingIndicators: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeDefaultSessions();
    this.subscribeToEvents();
    this.startHeartbeat();
  }

  // Initialize default collaboration sessions
  private initializeDefaultSessions(): void {
    // Compliance Review Session
    const complianceReviewSession: CollaborationSession = {
      id: 'compliance-review-session',
      name: 'Compliance Review & Analysis',
      type: 'COMPLIANCE_REVIEW',
      status: 'ACTIVE',
      participants: [],
      documents: [],
      messages: [],
      activities: [],
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['compliance', 'review', 'analysis']
      },
      settings: {
        allowGuestAccess: false,
        requireApproval: true,
        autoSave: true,
        versionControl: true,
        notifications: {
          messages: true,
          documentChanges: true,
          participantActivity: true,
          mentions: true
        },
        permissions: {
          canEdit: ['compliance-manager', 'compliance-analyst'],
          canComment: ['compliance-manager', 'compliance-analyst', 'stakeholder'],
          canInvite: ['compliance-manager'],
          canDelete: ['compliance-manager']
        }
      }
    };

    // Rule Design Session
    const ruleDesignSession: CollaborationSession = {
      id: 'rule-design-session',
      name: 'Compliance Rule Design Workshop',
      type: 'RULE_DESIGN',
      status: 'ACTIVE',
      participants: [],
      documents: [],
      messages: [],
      activities: [],
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['rule-design', 'workshop', 'compliance']
      },
      settings: {
        allowGuestAccess: false,
        requireApproval: false,
        autoSave: true,
        versionControl: true,
        notifications: {
          messages: true,
          documentChanges: true,
          participantActivity: true,
          mentions: true
        },
        permissions: {
          canEdit: ['rule-designer', 'compliance-manager'],
          canComment: ['rule-designer', 'compliance-manager', 'stakeholder'],
          canInvite: ['rule-designer', 'compliance-manager'],
          canDelete: ['rule-designer', 'compliance-manager']
        }
      }
    };

    this.sessions.set(complianceReviewSession.id, complianceReviewSession);
    this.sessions.set(ruleDesignSession.id, ruleDesignSession);
  }

  // Subscribe to compliance events
  private subscribeToEvents(): void {
    complianceEventBus.on('compliance:rule:created', (event) => {
      this.handleRuleCreated(event);
    });

    complianceEventBus.on('compliance:violation:detected', (event) => {
      this.handleViolationDetected(event);
    });

    complianceEventBus.on('compliance:audit:completed', (event) => {
      this.handleAuditCompleted(event);
    });

    complianceEventBus.on('analytics:insight:generated', (event) => {
      this.handleInsightGenerated(event);
    });
  }

  // Handle rule created event
  private handleRuleCreated(event: any): void {
    // Create collaboration session for rule review
    const session = this.createSession({
      name: `Rule Review: ${event.payload.name}`,
      type: 'COMPLIANCE_REVIEW',
      createdBy: event.payload.metadata?.createdBy || 'system',
      tags: ['rule-review', 'compliance']
    });

    // Add rule document
    this.addDocument(session.id, {
      name: 'Rule Specification',
      type: 'RULE_DOCUMENT',
      content: JSON.stringify(event.payload, null, 2),
      createdBy: event.payload.metadata?.createdBy || 'system'
    });

    // Send system message
    this.sendMessage(session.id, {
      userId: 'system',
      username: 'System',
      type: 'SYSTEM',
      content: `New compliance rule "${event.payload.name}" created and added for review.`
    });
  }

  // Handle violation detected event
  private handleViolationDetected(event: any): void {
    // Create or update violation analysis session
    let session = this.findSessionByType('VIOLATION_ANALYSIS');
    
    if (!session) {
      session = this.createSession({
        name: 'Violation Analysis & Remediation',
        type: 'VIOLATION_ANALYSIS',
        createdBy: 'system',
        tags: ['violation-analysis', 'remediation']
      });
    }

    // Add violation report
    this.addDocument(session.id, {
      name: `Violation Report: ${event.payload.id}`,
      type: 'VIOLATION_REPORT',
      content: JSON.stringify(event.payload, null, 2),
      createdBy: 'system'
    });

    // Send alert message
    this.sendMessage(session.id, {
      userId: 'system',
      username: 'System',
      type: 'ALERT',
      content: `New compliance violation detected: ${event.payload.description}`
    });
  }

  // Handle audit completed event
  private handleAuditCompleted(event: any): void {
    // Create audit collaboration session
    const session = this.createSession({
      name: `Audit Review: ${event.payload.name}`,
      type: 'AUDIT_COLLABORATION',
      createdBy: event.payload.metadata?.createdBy || 'system',
      tags: ['audit-review', 'findings']
    });

    // Add audit findings document
    this.addDocument(session.id, {
      name: 'Audit Findings Report',
      type: 'AUDIT_FINDINGS',
      content: JSON.stringify(event.payload, null, 2),
      createdBy: event.payload.metadata?.createdBy || 'system'
    });

    // Send announcement message
    this.sendMessage(session.id, {
      userId: 'system',
      username: 'System',
      type: 'ANNOUNCEMENT',
      content: `Audit "${event.payload.name}" completed with score: ${event.payload.score}/100`
    });
  }

  // Handle insight generated event
  private handleInsightGenerated(event: any): void {
    // Share insight in relevant sessions
    const insight = event.payload;
    
    if (insight.severity === 'HIGH' || insight.severity === 'CRITICAL') {
      // Share in compliance review session
      const reviewSession = this.findSessionByType('COMPLIANCE_REVIEW');
      if (reviewSession) {
        this.sendMessage(reviewSession.id, {
          userId: 'system',
          username: 'Analytics',
          type: 'ALERT',
          content: `High-priority insight: ${insight.title} - ${insight.description}`
        });
      }
    }
  }

  // Create new collaboration session
  createSession(options: {
    name: string;
    type: CollaborationSession['type'];
    createdBy: string;
    tags?: string[];
  }): CollaborationSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      name: options.name,
      type: options.type,
      status: 'ACTIVE',
      participants: [],
      documents: [],
      messages: [],
      activities: [],
      metadata: {
        createdBy: options.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: options.tags || []
      },
      settings: {
        allowGuestAccess: false,
        requireApproval: false,
        autoSave: true,
        versionControl: true,
        notifications: {
          messages: true,
          documentChanges: true,
          participantActivity: true,
          mentions: true
        },
        permissions: {
          canEdit: ['compliance-manager', 'compliance-analyst'],
          canComment: ['compliance-manager', 'compliance-analyst', 'stakeholder'],
          canInvite: ['compliance-manager'],
          canDelete: ['compliance-manager']
        }
      }
    };

    this.sessions.set(sessionId, session);
    
    // Add creator as owner
    this.addParticipant(sessionId, {
      userId: options.createdBy,
      username: options.createdBy,
      role: 'OWNER',
      status: 'ONLINE'
    });

    // Publish session created event
    complianceEventBus.publish({
      type: 'collaboration:session:created',
      payload: session,
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return session;
  }

  // Add participant to session
  addParticipant(sessionId: string, participant: Omit<CollaborationParticipant, 'id' | 'joinedAt' | 'lastActivity' | 'permissions'>): CollaborationParticipant {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const participantId = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullParticipant: CollaborationParticipant = {
      ...participant,
      id: participantId,
      joinedAt: new Date(),
      lastActivity: new Date(),
      permissions: this.getDefaultPermissions(participant.role)
    };

    session.participants.push(fullParticipant);
    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId: participant.userId,
      username: participant.username,
      type: 'JOINED',
      description: `${participant.username} joined the session`
    });

    // Publish participant joined event
    complianceEventBus.publish({
      type: 'collaboration:participant:joined',
      payload: { sessionId, participant: fullParticipant },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullParticipant;
  }

  // Remove participant from session
  removeParticipant(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const participantIndex = session.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) {
      return false;
    }

    const participant = session.participants[participantIndex];
    session.participants.splice(participantIndex, 1);
    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId: participant.userId,
      username: participant.username,
      type: 'LEFT',
      description: `${participant.username} left the session`
    });

    // Publish participant left event
    complianceEventBus.publish({
      type: 'collaboration:participant:left',
      payload: { sessionId, participant },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return true;
  }

  // Add document to session
  addDocument(sessionId: string, document: Omit<CollaborationDocument, 'id' | 'version' | 'changes' | 'comments' | 'metadata'>): CollaborationDocument {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const documentId = `document-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullDocument: CollaborationDocument = {
      ...document,
      id: documentId,
      version: 1,
      changes: [],
      comments: [],
      metadata: {
        createdBy: document.createdBy,
        createdAt: new Date(),
        updatedBy: document.createdBy,
        updatedAt: new Date()
      }
    };

    session.documents.push(fullDocument);
    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId: document.createdBy,
      username: document.createdBy,
      type: 'DOCUMENT_EDITED',
      description: `${document.createdBy} added document: ${document.name}`
    });

    // Publish document added event
    complianceEventBus.publish({
      type: 'collaboration:document:added',
      payload: { sessionId, document: fullDocument },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullDocument;
  }

  // Update document
  updateDocument(sessionId: string, documentId: string, userId: string, content: string): CollaborationDocument {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const document = session.documents.find(d => d.id === documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Create change record
    const change: DocumentChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username: userId,
      type: 'UPDATE',
      position: 0,
      content,
      timestamp: new Date()
    };

    document.changes.push(change);
    document.content = content;
    document.version++;
    document.metadata.updatedBy = userId;
    document.metadata.updatedAt = new Date();

    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId,
      username: userId,
      type: 'DOCUMENT_EDITED',
      description: `${userId} updated document: ${document.name}`
    });

    // Publish document updated event
    complianceEventBus.publish({
      type: 'collaboration:document:updated',
      payload: { sessionId, documentId, change },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return document;
  }

  // Add comment to document
  addComment(sessionId: string, documentId: string, comment: Omit<DocumentComment, 'id' | 'replies' | 'resolved' | 'createdAt' | 'updatedAt'>): DocumentComment {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const document = session.documents.find(d => d.id === documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullComment: DocumentComment = {
      ...comment,
      id: commentId,
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    document.comments.push(fullComment);
    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId: comment.userId,
      username: comment.username,
      type: 'COMMENT_ADDED',
      description: `${comment.username} added a comment to ${document.name}`
    });

    // Publish comment added event
    complianceEventBus.publish({
      type: 'collaboration:comment:added',
      payload: { sessionId, documentId, comment: fullComment },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullComment;
  }

  // Send message to session
  sendMessage(sessionId: string, message: Omit<CollaborationMessage, 'id' | 'reactions' | 'timestamp'>): CollaborationMessage {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullMessage: CollaborationMessage = {
      ...message,
      id: messageId,
      reactions: [],
      timestamp: new Date()
    };

    session.messages.push(fullMessage);
    session.metadata.updatedAt = new Date();

    // Add activity for non-system messages
    if (message.type !== 'SYSTEM') {
      this.addActivity(sessionId, {
        userId: message.userId,
        username: message.username,
        type: 'JOINED', // Using JOINED as placeholder, would need specific activity type
        description: `${message.username} sent a message`
      });
    }

    // Publish message sent event
    complianceEventBus.publish({
      type: 'collaboration:message:sent',
      payload: { sessionId, message: fullMessage },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullMessage;
  }

  // Add reaction to message
  addReaction(sessionId: string, messageId: string, reaction: Omit<MessageReaction, 'timestamp'>): MessageReaction {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message = session.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    const fullReaction: MessageReaction = {
      ...reaction,
      timestamp: new Date()
    };

    message.reactions.push(fullReaction);
    session.metadata.updatedAt = new Date();

    // Add activity
    this.addActivity(sessionId, {
      userId: reaction.userId,
      username: reaction.username,
      type: 'REACTION_ADDED',
      description: `${reaction.username} reacted with ${reaction.emoji}`
    });

    // Publish reaction added event
    complianceEventBus.publish({
      type: 'collaboration:reaction:added',
      payload: { sessionId, messageId, reaction: fullReaction },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullReaction;
  }

  // Add activity to session
  private addActivity(sessionId: string, activity: Omit<CollaborationActivity, 'id'>): CollaborationActivity {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullActivity: CollaborationActivity = {
      ...activity,
      id: activityId,
      timestamp: new Date()
    };

    session.activities.push(fullActivity);

    // Keep only last 100 activities
    if (session.activities.length > 100) {
      session.activities.splice(0, session.activities.length - 100);
    }

    return fullActivity;
  }

  // Get default permissions for role
  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case 'OWNER':
        return ['read', 'write', 'comment', 'invite', 'delete', 'manage'];
      case 'EDITOR':
        return ['read', 'write', 'comment'];
      case 'VIEWER':
        return ['read', 'comment'];
      case 'COMMENTER':
        return ['read', 'comment'];
      default:
        return ['read'];
    }
  }

  // Find session by type
  private findSessionByType(type: CollaborationSession['type']): CollaborationSession | undefined {
    return Array.from(this.sessions.values()).find(session => session.type === type);
  }

  // Start heartbeat for participant status updates
  private startHeartbeat(): void {
    setInterval(() => {
      this.updateParticipantStatus();
    }, 30000); // Every 30 seconds
  }

  // Update participant status
  private updateParticipantStatus(): void {
    for (const [sessionId, session] of this.sessions) {
      for (const participant of session.participants) {
        const timeSinceLastActivity = Date.now() - participant.lastActivity.getTime();
        
        if (timeSinceLastActivity > 300000) { // 5 minutes
          participant.status = 'AWAY';
        } else if (timeSinceLastActivity > 600000) { // 10 minutes
          participant.status = 'OFFLINE';
        }
      }
    }
  }

  // Subscribe to collaboration events
  subscribe(callback: (event: any) => void): string {
    const id = `collaboration-subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(id, callback);
    return id;
  }

  // Unsubscribe from collaboration events
  unsubscribe(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  // Get session by ID
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all sessions
  getAllSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }

  // Get sessions by type
  getSessionsByType(type: CollaborationSession['type']): CollaborationSession[] {
    return this.getAllSessions().filter(session => session.type === type);
  }

  // Get active sessions
  getActiveSessions(): CollaborationSession[] {
    return this.getAllSessions().filter(session => session.status === 'ACTIVE');
  }

  // Get collaboration statistics
  getCollaborationStats(): {
    totalSessions: number;
    activeSessions: number;
    totalParticipants: number;
    totalMessages: number;
    totalDocuments: number;
  } {
    const sessions = this.getAllSessions();
    const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
    
    const totalParticipants = sessions.reduce((sum, s) => sum + s.participants.length, 0);
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    const totalDocuments = sessions.reduce((sum, s) => sum + s.documents.length, 0);

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalParticipants,
      totalMessages,
      totalDocuments
    };
  }

  // Create invitation
  createInvitation(sessionId: string, invitation: Omit<CollaborationInvitation, 'id' | 'status' | 'createdAt'>): CollaborationInvitation {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const invitationId = `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullInvitation: CollaborationInvitation = {
      ...invitation,
      id: invitationId,
      status: 'PENDING',
      createdAt: new Date()
    };

    this.invitations.set(invitationId, fullInvitation);

    // Publish invitation created event
    complianceEventBus.publish({
      type: 'collaboration:invitation:created',
      payload: fullInvitation,
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return fullInvitation;
  }

  // Accept invitation
  acceptInvitation(invitationId: string, userId: string): boolean {
    const invitation = this.invitations.get(invitationId);
    if (!invitation) {
      return false;
    }

    if (invitation.status !== 'PENDING') {
      return false;
    }

    invitation.status = 'ACCEPTED';

    // Add participant to session
    this.addParticipant(invitation.sessionId, {
      userId,
      username: userId,
      role: invitation.role,
      status: 'ONLINE'
    });

    // Publish invitation accepted event
    complianceEventBus.publish({
      type: 'collaboration:invitation:accepted',
      payload: { invitation, userId },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return true;
  }

  // Decline invitation
  declineInvitation(invitationId: string): boolean {
    const invitation = this.invitations.get(invitationId);
    if (!invitation || invitation.status !== 'PENDING') {
      return false;
    }

    invitation.status = 'DECLINED';

    // Publish invitation declined event
    complianceEventBus.publish({
      type: 'collaboration:invitation:declined',
      payload: invitation,
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });

    return true;
  }

  // Set typing indicator
  setTypingIndicator(sessionId: string, userId: string, isTyping: boolean): void {
    if (!this.typingIndicators.has(sessionId)) {
      this.typingIndicators.set(sessionId, new Set());
    }

    const indicators = this.typingIndicators.get(sessionId)!;
    
    if (isTyping) {
      indicators.add(userId);
    } else {
      indicators.delete(userId);
    }

    // Publish typing indicator event
    complianceEventBus.publish({
      type: 'collaboration:typing:indicator',
      payload: { sessionId, userId, isTyping },
      timestamp: new Date(),
      source: 'compliance-collaboration'
    });
  }

  // Get typing indicators for session
  getTypingIndicators(sessionId: string): string[] {
    const indicators = this.typingIndicators.get(sessionId);
    return indicators ? Array.from(indicators) : [];
  }
}

// Export singleton instance
export const complianceCollaborationEngine = new ComplianceCollaborationEngine();

export default complianceCollaborationEngine;