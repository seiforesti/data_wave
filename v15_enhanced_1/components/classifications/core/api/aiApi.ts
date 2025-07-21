// Advanced AI API Integration for Classifications
// Comprehensive AI conversation, reasoning, and intelligence API client

import { toast } from 'sonner';

// AI API Types
export interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'nlp' | 'vision' | 'multimodal' | 'embedding';
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  version: string;
  status: 'active' | 'inactive' | 'training' | 'deployed' | 'failed';
  capabilities: string[];
  configuration: AIModelConfiguration;
  performance?: AIModelPerformance;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata: Record<string, any>;
}

export interface AIModelConfiguration {
  maxTokens: number;
  temperature: number;
  topP: number;
  topK?: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  systemPrompt?: string;
  contextWindow: number;
  streaming: boolean;
  functionCalling: boolean;
  toolUse: boolean;
  multimodal: boolean;
  safeguards: {
    contentFiltering: boolean;
    toxicityDetection: boolean;
    biasDetection: boolean;
    privacyProtection: boolean;
  };
}

export interface AIModelPerformance {
  averageLatency: number;
  tokensPerSecond: number;
  accuracy: number;
  coherence: number;
  relevance: number;
  safety: number;
  costPerToken: number;
  uptime: number;
  errorRate: number;
}

export interface AIConversation {
  id: string;
  title: string;
  modelId: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  messages: AIMessage[];
  context: ConversationContext;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  settings: ConversationSettings;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
  reasoning?: ReasoningStep[];
  confidence?: number;
  citations?: Citation[];
  attachments?: Attachment[];
}

export interface MessageMetadata {
  tokenCount: number;
  processingTime: number;
  model: string;
  temperature: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  safety: {
    flagged: boolean;
    categories: string[];
    scores: Record<string, number>;
  };
}

export interface ReasoningStep {
  step: number;
  type: 'analysis' | 'synthesis' | 'evaluation' | 'application';
  description: string;
  evidence: string[];
  confidence: number;
  alternatives?: string[];
}

export interface Citation {
  id: string;
  source: string;
  url?: string;
  title: string;
  excerpt: string;
  relevance: number;
  credibility: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'data';
  url: string;
  size: number;
  metadata: Record<string, any>;
}

export interface ConversationContext {
  domain: string;
  purpose: string;
  classification: string;
  entities: ExtractedEntity[];
  topics: string[];
  sentiment: SentimentAnalysis;
  intent: IntentAnalysis;
  knowledgeBase: string[];
  constraints: string[];
  preferences: Record<string, any>;
}

export interface ConversationSettings {
  maxMessages: number;
  autoSave: boolean;
  enableReasoning: boolean;
  enableCitations: boolean;
  enableMultimodal: boolean;
  privacyMode: boolean;
  collaborativeMode: boolean;
  realTimeTranscription: boolean;
}

export interface ExtractedEntity {
  text: string;
  label: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
  metadata: Record<string, any>;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
}

export interface IntentAnalysis {
  primary: string;
  confidence: number;
  alternatives: Array<{
    intent: string;
    confidence: number;
  }>;
  parameters: Record<string, any>;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'structured' | 'unstructured' | 'hybrid';
  status: 'active' | 'indexing' | 'error';
  documents: number;
  size: number;
  lastUpdated: string;
  embeddings: EmbeddingConfiguration;
  searchConfiguration: SearchConfiguration;
}

export interface EmbeddingConfiguration {
  model: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dot_product';
  indexType: 'flat' | 'ivf' | 'hnsw';
}

export interface SearchConfiguration {
  maxResults: number;
  similarityThreshold: number;
  enableReranking: boolean;
  enableFiltering: boolean;
  boostFactors: Record<string, number>;
}

export interface AITask {
  id: string;
  type: 'classification' | 'extraction' | 'generation' | 'analysis' | 'translation';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: any;
  output?: any;
  configuration: TaskConfiguration;
  progress: TaskProgress;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface TaskConfiguration {
  modelId: string;
  parameters: Record<string, any>;
  timeout: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number;
  };
}

export interface TaskProgress {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  estimatedTimeRemaining?: number;
  throughput?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  requestId: string;
  metadata?: {
    executionTime: number;
    cacheHit: boolean;
    dataSource: string;
    modelUsed?: string;
    tokensUsed?: number;
    cost?: number;
  };
}

// AI API Client Class
class AIApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = crypto.randomUUID();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Request-ID': requestId,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        requestId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI API request failed:', error);
      throw error;
    }
  }

  // AI Model Management
  async getAIModels(): Promise<ApiResponse<AIModel[]>> {
    return this.request('/api/v1/ai/models');
  }

  async getAIModel(id: string): Promise<ApiResponse<AIModel>> {
    return this.request(`/api/v1/ai/models/${id}`);
  }

  async createAIModel(config: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<AIModel>> {
    return this.request('/api/v1/ai/models', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async updateAIModel(id: string, updates: Partial<AIModel>): Promise<ApiResponse<AIModel>> {
    return this.request(`/api/v1/ai/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteAIModel(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ai/models/${id}`, {
      method: 'DELETE'
    });
  }

  // Conversation Management
  async getConversations(): Promise<ApiResponse<AIConversation[]>> {
    return this.request('/api/v1/ai/conversations');
  }

  async getConversation(id: string): Promise<ApiResponse<AIConversation>> {
    return this.request(`/api/v1/ai/conversations/${id}`);
  }

  async createConversation(config: {
    title: string;
    modelId: string;
    context?: Partial<ConversationContext>;
    settings?: Partial<ConversationSettings>;
  }): Promise<ApiResponse<AIConversation>> {
    return this.request('/api/v1/ai/conversations', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async updateConversation(id: string, updates: Partial<AIConversation>): Promise<ApiResponse<AIConversation>> {
    return this.request(`/api/v1/ai/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ai/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  // Message Management
  async sendMessage(conversationId: string, content: string, options?: {
    role?: AIMessage['role'];
    enableReasoning?: boolean;
    enableCitations?: boolean;
    temperature?: number;
    maxTokens?: number;
  }): Promise<ApiResponse<AIMessage>> {
    return this.request(`/api/v1/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        ...options
      })
    });
  }

  async streamMessage(conversationId: string, content: string, onChunk: (chunk: string) => void, options?: {
    role?: AIMessage['role'];
    enableReasoning?: boolean;
    enableCitations?: boolean;
    temperature?: number;
    maxTokens?: number;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/ai/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'text/stream'
      },
      body: JSON.stringify({
        content,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getMessages(conversationId: string, options?: {
    limit?: number;
    offset?: number;
    role?: AIMessage['role'];
  }): Promise<ApiResponse<AIMessage[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.role) params.append('role', options.role);

    return this.request(`/api/v1/ai/conversations/${conversationId}/messages?${params}`);
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ai/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // AI Task Management
  async createTask(task: Omit<AITask, 'id' | 'status' | 'progress' | 'createdAt'>): Promise<ApiResponse<AITask>> {
    return this.request('/api/v1/ai/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }

  async getTask(id: string): Promise<ApiResponse<AITask>> {
    return this.request(`/api/v1/ai/tasks/${id}`);
  }

  async getTasks(filters?: {
    type?: AITask['type'];
    status?: AITask['status'];
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<AITask[]>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return this.request(`/api/v1/ai/tasks?${params}`);
  }

  async cancelTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ai/tasks/${id}/cancel`, {
      method: 'POST'
    });
  }

  // Knowledge Base Management
  async getKnowledgeBases(): Promise<ApiResponse<KnowledgeBase[]>> {
    return this.request('/api/v1/ai/knowledge-bases');
  }

  async createKnowledgeBase(config: Omit<KnowledgeBase, 'id' | 'status' | 'documents' | 'size' | 'lastUpdated'>): Promise<ApiResponse<KnowledgeBase>> {
    return this.request('/api/v1/ai/knowledge-bases', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<ApiResponse<KnowledgeBase>> {
    return this.request(`/api/v1/ai/knowledge-bases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async searchKnowledgeBase(id: string, query: string, options?: {
    maxResults?: number;
    threshold?: number;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<{
    results: Array<{
      id: string;
      content: string;
      score: number;
      metadata: Record<string, any>;
    }>;
    total: number;
  }>> {
    return this.request(`/api/v1/ai/knowledge-bases/${id}/search`, {
      method: 'POST',
      body: JSON.stringify({
        query,
        ...options
      })
    });
  }

  async addDocumentToKnowledgeBase(id: string, document: {
    content: string;
    metadata: Record<string, any>;
  }): Promise<ApiResponse<{ documentId: string }>> {
    return this.request(`/api/v1/ai/knowledge-bases/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify(document)
    });
  }

  // AI Intelligence Operations
  async generateExplanation(modelId: string, input: any, options?: {
    type?: 'feature_importance' | 'decision_tree' | 'counterfactual' | 'comprehensive';
    includeVisualization?: boolean;
    maxLength?: number;
  }): Promise<ApiResponse<{
    explanation: string;
    reasoning: ReasoningStep[];
    confidence: number;
    visualizations?: Array<{
      type: string;
      data: any;
      config: any;
    }>;
  }>> {
    return this.request(`/api/v1/ai/models/${modelId}/explain`, {
      method: 'POST',
      body: JSON.stringify({
        input,
        ...options
      })
    });
  }

  async synthesizeKnowledge(sources: string[], query: string, options?: {
    maxLength?: number;
    includeReferences?: boolean;
    synthesisType?: 'summary' | 'comparison' | 'analysis' | 'insights';
  }): Promise<ApiResponse<{
    synthesis: string;
    sources: Citation[];
    confidence: number;
    keyInsights: string[];
  }>> {
    return this.request('/api/v1/ai/knowledge/synthesize', {
      method: 'POST',
      body: JSON.stringify({
        sources,
        query,
        ...options
      })
    });
  }

  async analyzeText(text: string, analyses: Array<'sentiment' | 'entities' | 'topics' | 'intent' | 'language'>): Promise<ApiResponse<{
    sentiment?: SentimentAnalysis;
    entities?: ExtractedEntity[];
    topics?: Array<{ topic: string; confidence: number }>;
    intent?: IntentAnalysis;
    language?: { language: string; confidence: number };
  }>> {
    return this.request('/api/v1/ai/analyze/text', {
      method: 'POST',
      body: JSON.stringify({
        text,
        analyses
      })
    });
  }

  // Workflow and Optimization
  async optimizeWorkload(workloadId: string, criteria: {
    optimize_for: 'cost' | 'speed' | 'quality' | 'balanced';
    constraints: Record<string, any>;
    preferences: Record<string, any>;
  }): Promise<ApiResponse<{
    optimizedConfiguration: Record<string, any>;
    expectedImprovement: {
      cost: number;
      speed: number;
      quality: number;
    };
    recommendations: string[];
  }>> {
    return this.request(`/api/v1/ai/workloads/${workloadId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }

  async createIntelligenceStream(config: {
    sources: string[];
    filters: Record<string, any>;
    aggregation: 'real_time' | 'batched' | 'on_demand';
    outputFormat: 'structured' | 'natural' | 'hybrid';
  }): Promise<ApiResponse<{ streamId: string; endpoint: string }>> {
    return this.request('/api/v1/ai/intelligence/streams', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Classification-specific AI operations
  async classifyContent(content: string, framework: string, options?: {
    confidence_threshold?: number;
    include_explanations?: boolean;
    use_ensemble?: boolean;
  }): Promise<ApiResponse<{
    classification: string;
    confidence: number;
    alternatives: Array<{ label: string; confidence: number }>;
    explanation?: string;
    reasoning?: ReasoningStep[];
  }>> {
    return this.request('/api/v1/ai/classify', {
      method: 'POST',
      body: JSON.stringify({
        content,
        framework,
        ...options
      })
    });
  }

  async suggestClassificationRules(examples: Array<{
    content: string;
    classification: string;
  }>): Promise<ApiResponse<{
    rules: Array<{
      pattern: string;
      confidence: number;
      coverage: number;
      precision: number;
    }>;
    recommendations: string[];
  }>> {
    return this.request('/api/v1/ai/classification/suggest-rules', {
      method: 'POST',
      body: JSON.stringify({ examples })
    });
  }

  // Performance Analytics
  async getPerformanceMetrics(): Promise<ApiResponse<{
    accuracy: number;
    throughput: number;
    latency: number;
    errorRate: number;
    tokensPerSecond: number;
    costPerRequest: number;
  }>> {
    return this.request('/api/v1/ai/metrics/performance');
  }

  async getUsageAnalytics(timeRange?: string): Promise<ApiResponse<{
    requests: number;
    tokens: number;
    cost: number;
    models: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
      averageLatency: number;
    }>;
    trends: Array<{
      timestamp: string;
      requests: number;
      tokens: number;
      cost: number;
    }>;
  }>> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request(`/api/v1/ai/analytics/usage${params}`);
  }

  // Real-time WebSocket connection for AI updates
  createWebSocketConnection(onMessage: (data: any) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/api/v1/ai/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('AI WebSocket connected');
      toast.success('AI real-time connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('AI WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log('AI WebSocket disconnected');
      toast.warning('AI real-time connection lost');
    };

    ws.onerror = (error) => {
      console.error('AI WebSocket error:', error);
      toast.error('AI real-time connection error');
    };

    return ws;
  }

  // Utilities
  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    models: Record<string, 'available' | 'unavailable'>;
    latency: number;
    uptime: number;
  }>> {
    return this.request('/api/v1/ai/health');
  }

  async validateConfiguration(config: any): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>> {
    return this.request('/api/v1/ai/validate-config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    toast.success('AI API cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const aiApi = new AIApiClient();
export default aiApi;