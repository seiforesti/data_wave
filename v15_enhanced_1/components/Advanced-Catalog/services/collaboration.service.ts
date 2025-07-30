// ============================================================================
// COLLABORATION SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced service for collaboration functionality
// Integrates with backend collaboration APIs for real-time team coordination
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  CollaborationActivity,
  TeamMember,
  CollaborationProject,
  CollaborationMetrics,
  CollaborationNotification,
  DataStewardshipTask,
  KnowledgeBaseArticle,
  CommunityDiscussion,
  ExpertConnection,
  CollaborationWorkspace,
  CollaborationInsight
} from '../types/collaboration.types';

import { CatalogApiResponse } from '../types/catalog-core.types';
import { API_CONFIG, buildUrl, buildUrlWithQuery } from '../constants/endpoints';

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class CollaborationService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // ACTIVITIES
  // ============================================================================

  async getActivities(params: { workspaceId?: string; userId?: string }): Promise<CollaborationActivity[]> {
    try {
      const response = await axios.get<CatalogApiResponse<CollaborationActivity[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/activities', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  async getActivityById(id: string): Promise<CollaborationActivity | null> {
    try {
      const response = await axios.get<CatalogApiResponse<CollaborationActivity>>(
        buildUrl(this.baseURL, '/api/v1/collaboration/activities/{id}', { id }),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return null;
    }
  }

  async createActivity(activity: Partial<CollaborationActivity>): Promise<CollaborationActivity> {
    const response = await axios.post<CatalogApiResponse<CollaborationActivity>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/activities'),
      activity,
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  async updateActivity(id: string, updates: Partial<CollaborationActivity>): Promise<CollaborationActivity> {
    const response = await axios.put<CatalogApiResponse<CollaborationActivity>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/activities/{id}', { id }),
      updates,
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  async deleteActivity(id: string): Promise<void> {
    await axios.delete(
      buildUrl(this.baseURL, '/api/v1/collaboration/activities/{id}', { id }),
      { timeout: this.timeout }
    );
  }

  // ============================================================================
  // PROJECTS
  // ============================================================================

  async getProjects(params: { workspaceId?: string; userId?: string }): Promise<CollaborationProject[]> {
    try {
      const response = await axios.get<CatalogApiResponse<CollaborationProject[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/projects', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<CollaborationProject | null> {
    try {
      const response = await axios.get<CatalogApiResponse<CollaborationProject>>(
        buildUrl(this.baseURL, '/api/v1/collaboration/projects/{id}', { id }),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return null;
    }
  }

  async createProject(project: Partial<CollaborationProject>): Promise<CollaborationProject> {
    const response = await axios.post<CatalogApiResponse<CollaborationProject>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/projects'),
      project,
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  async updateProject(id: string, updates: Partial<CollaborationProject>): Promise<CollaborationProject> {
    const response = await axios.put<CatalogApiResponse<CollaborationProject>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/projects/{id}', { id }),
      updates,
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  // ============================================================================
  // TEAM MEMBERS
  // ============================================================================

  async getTeamMembers(workspaceId?: string): Promise<TeamMember[]> {
    try {
      const params = workspaceId ? { workspaceId } : {};
      const response = await axios.get<CatalogApiResponse<TeamMember[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/members', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      return [];
    }
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    try {
      const response = await axios.get<CatalogApiResponse<TeamMember>>(
        buildUrl(this.baseURL, '/api/v1/collaboration/members/{id}', { id }),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch team member:', error);
      return null;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async getNotifications(userId?: string): Promise<CollaborationNotification[]> {
    try {
      const params = userId ? { userId } : {};
      const response = await axios.get<CatalogApiResponse<CollaborationNotification[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/notifications', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    await axios.put(
      buildUrl(this.baseURL, '/api/v1/collaboration/notifications/{id}/read', { id }),
      {},
      { timeout: this.timeout }
    );
  }

  // ============================================================================
  // STEWARDSHIP TASKS
  // ============================================================================

  async getStewardshipTasks(params: { workspaceId?: string; userId?: string }): Promise<DataStewardshipTask[]> {
    try {
      const response = await axios.get<CatalogApiResponse<DataStewardshipTask[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/stewardship/tasks', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch stewardship tasks:', error);
      return [];
    }
  }

  async assignTask(taskId: string, assigneeId: string): Promise<DataStewardshipTask> {
    const response = await axios.put<CatalogApiResponse<DataStewardshipTask>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/stewardship/tasks/{taskId}/assign', { taskId }),
      { assigneeId },
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  // ============================================================================
  // KNOWLEDGE BASE
  // ============================================================================

  async getKnowledgeBase(workspaceId?: string): Promise<KnowledgeBaseArticle[]> {
    try {
      const params = workspaceId ? { workspaceId } : {};
      const response = await axios.get<CatalogApiResponse<KnowledgeBaseArticle[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/knowledge', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
      return [];
    }
  }

  // ============================================================================
  // DISCUSSIONS
  // ============================================================================

  async getDiscussions(workspaceId?: string): Promise<CommunityDiscussion[]> {
    try {
      const params = workspaceId ? { workspaceId } : {};
      const response = await axios.get<CatalogApiResponse<CommunityDiscussion[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/discussions', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
      return [];
    }
  }

  // ============================================================================
  // EXPERTS
  // ============================================================================

  async getExperts(workspaceId?: string): Promise<TeamMember[]> {
    try {
      const params = workspaceId ? { workspaceId } : {};
      const response = await axios.get<CatalogApiResponse<TeamMember[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/experts', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      return [];
    }
  }

  async connectWithExpert(expertId: string, topic: string, description?: string): Promise<ExpertConnection> {
    const response = await axios.post<CatalogApiResponse<ExpertConnection>>(
      buildUrl(this.baseURL, '/api/v1/collaboration/experts/connect'),
      { expertId, topic, description },
      { timeout: this.timeout }
    );
    return response.data.data;
  }

  // ============================================================================
  // WORKSPACES
  // ============================================================================

  async getWorkspaces(userId?: string): Promise<CollaborationWorkspace[]> {
    try {
      const params = userId ? { userId } : {};
      const response = await axios.get<CatalogApiResponse<CollaborationWorkspace[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/workspaces', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
      return [];
    }
  }

  // ============================================================================
  // INSIGHTS
  // ============================================================================

  async getInsights(workspaceId?: string, timeframe?: string): Promise<CollaborationInsight[]> {
    try {
      const params: any = {};
      if (workspaceId) params.workspaceId = workspaceId;
      if (timeframe) params.timeframe = timeframe;

      const response = await axios.get<CatalogApiResponse<CollaborationInsight[]>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/insights', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      return [];
    }
  }

  // ============================================================================
  // METRICS
  // ============================================================================

  async getMetrics(workspaceId?: string, timeframe?: string): Promise<CollaborationMetrics | null> {
    try {
      const params: any = {};
      if (workspaceId) params.workspaceId = workspaceId;
      if (timeframe) params.timeframe = timeframe;

      const response = await axios.get<CatalogApiResponse<CollaborationMetrics>>(
        buildUrlWithQuery(this.baseURL, '/api/v1/collaboration/metrics', undefined, params),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  }
}

// Create and export singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;