import { 
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  ClassificationAuditLog,
  ClassificationTag,
  ClassificationStats,
  HealthCheckResult,
  CreateFrameworkRequest,
  UpdateFrameworkRequest,
  CreateRuleRequest,
  UpdateRuleRequest,
  ApplyRulesRequest,
  BulkUploadRequest,
  ClassificationFilters,
  PaginationParams,
  PaginatedResponse,
  PatternTestResult
} from '@/components/classification/types/classification.types';

const BASE_URL = '/api/classifications';

class ClassificationApi {
  // Framework Management
  async getFrameworks(
    filters?: ClassificationFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ClassificationFramework>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
      if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    }
    
    if (filters) {
      if (filters.search_query) params.append('search', filters.search_query);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    }

    const response = await fetch(`${BASE_URL}/frameworks?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getFramework(id: number): Promise<ClassificationFramework> {
    const response = await fetch(`${BASE_URL}/frameworks/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async createFramework(data: CreateFrameworkRequest): Promise<ClassificationFramework> {
    const response = await fetch(`${BASE_URL}/frameworks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async updateFramework(id: number, data: UpdateFrameworkRequest): Promise<ClassificationFramework> {
    const response = await fetch(`${BASE_URL}/frameworks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async deleteFramework(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/frameworks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  async duplicateFramework(id: number, newName: string): Promise<ClassificationFramework> {
    const response = await fetch(`${BASE_URL}/frameworks/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Rule Management
  async getRules(
    frameworkId?: number,
    filters?: ClassificationFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ClassificationRule>> {
    const params = new URLSearchParams();
    
    if (frameworkId) params.append('framework_id', frameworkId.toString());
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
      if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    }
    
    if (filters) {
      if (filters.search_query) params.append('search', filters.search_query);
      if (filters.rule_types?.length) {
        filters.rule_types.forEach(type => params.append('rule_types', type));
      }
      if (filters.sensitivity_labels?.length) {
        filters.sensitivity_labels.forEach(label => params.append('sensitivity_labels', label));
      }
      if (filters.scopes?.length) {
        filters.scopes.forEach(scope => params.append('scopes', scope));
      }
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    }

    const response = await fetch(`${BASE_URL}/rules?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getRule(id: number): Promise<ClassificationRule> {
    const response = await fetch(`${BASE_URL}/rules/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async createRule(data: CreateRuleRequest): Promise<ClassificationRule> {
    const response = await fetch(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async updateRule(id: number, data: UpdateRuleRequest): Promise<ClassificationRule> {
    const response = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async deleteRule(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  async testRulePattern(ruleId: number, testString: string): Promise<PatternTestResult> {
    const response = await fetch(`${BASE_URL}/rules/${ruleId}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_string: testString })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Rule Application
  async applyRules(data: ApplyRulesRequest): Promise<{ task_id: string; message: string }> {
    const response = await fetch(`${BASE_URL}/apply-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async applyFrameworkRules(
    frameworkId: number,
    targetType: 'scan_results' | 'catalog_items' | 'data_sources',
    targetIds: number[],
    applyInBackground = true
  ): Promise<{ task_id?: string; results?: ClassificationResult[]; message: string }> {
    const response = await fetch(`${BASE_URL}/frameworks/${frameworkId}/apply-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_type: targetType,
        target_ids: targetIds,
        apply_in_background: applyInBackground
      })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async applySingleRule(
    ruleId: number,
    targetType: 'scan_results' | 'catalog_items' | 'data_sources',
    targetIds: number[]
  ): Promise<ClassificationResult[]> {
    const response = await fetch(`${BASE_URL}/rules/${ruleId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_type: targetType,
        target_ids: targetIds
      })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Classification Results
  async getResults(
    filters?: ClassificationFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ClassificationResult>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
      if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    }
    
    if (filters) {
      if (filters.framework_ids?.length) {
        filters.framework_ids.forEach(id => params.append('framework_ids', id.toString()));
      }
      if (filters.sensitivity_labels?.length) {
        filters.sensitivity_labels.forEach(label => params.append('sensitivity_labels', label));
      }
      if (filters.confidence_levels?.length) {
        filters.confidence_levels.forEach(level => params.append('confidence_levels', level));
      }
      if (filters.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }
      if (filters.search_query) params.append('search', filters.search_query);
    }

    const response = await fetch(`${BASE_URL}/results?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getResult(id: number): Promise<ClassificationResult> {
    const response = await fetch(`${BASE_URL}/results/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async deleteResult(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/results/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Bulk Upload
  async uploadBulkData(data: BulkUploadRequest): Promise<{ task_id: string; message: string }> {
    const response = await fetch(`${BASE_URL}/bulk-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getBulkUploadTemplate(uploadType: 'rules' | 'dictionaries' | 'frameworks'): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/bulk-upload/template?upload_type=${uploadType}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.blob();
  }

  // Tags Management
  async getTags(): Promise<ClassificationTag[]> {
    const response = await fetch(`${BASE_URL}/tags`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async createTag(data: { name: string; color?: string; description?: string }): Promise<ClassificationTag> {
    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async deleteTag(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/tags/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Audit Trail
  async getAuditLogs(
    filters?: {
      entity_type?: string;
      entity_id?: number;
      action_type?: string;
      user_id?: number;
      start_date?: string;
      end_date?: string;
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ClassificationAuditLog>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
      if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }

    const response = await fetch(`${BASE_URL}/audit-logs?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Statistics and Analytics
  async getStats(): Promise<ClassificationStats> {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getFrameworkStats(frameworkId: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/frameworks/${frameworkId}/stats`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Health Check
  async getHealthCheck(): Promise<HealthCheckResult> {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Data Source Settings
  async getDataSourceSettings(dataSourceId: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/data-sources/${dataSourceId}/settings`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async updateDataSourceSettings(
    dataSourceId: number, 
    settings: {
      auto_classify?: boolean;
      default_framework_id?: number;
      classification_schedule?: string;
      notification_settings?: Record<string, any>;
    }
  ): Promise<any> {
    const response = await fetch(`${BASE_URL}/data-sources/${dataSourceId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Background Task Status
  async getTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/status`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}

export const classificationApi = new ClassificationApi();
export default classificationApi;