// Advanced ML API Integration for Classifications
// Comprehensive ML model management, training, and inference API client

import { toast } from 'sonner';

// ML API Types
export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'cv';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'huggingface';
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'stopped';
  version: string;
  accuracy?: number;
  loss?: number;
  f1Score?: number;
  precision?: number;
  recall?: number;
  auc?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  metadata: Record<string, any>;
  configuration: ModelConfiguration;
  performance?: ModelPerformance;
}

export interface ModelConfiguration {
  algorithm: string;
  hyperparameters: Record<string, any>;
  features: string[];
  targetColumn?: string;
  validationSplit: number;
  crossValidationFolds?: number;
  earlyStoppingPatience?: number;
  maxTrainingTime?: number;
  autoHyperparameterTuning: boolean;
  preprocessing: {
    scaleFeatures: boolean;
    handleMissingValues: 'drop' | 'mean' | 'median' | 'mode' | 'forward_fill';
    encodeCategorical: 'onehot' | 'label' | 'target';
    featureSelection: boolean;
    dimensionalityReduction?: 'pca' | 'tsne' | 'umap';
  };
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  loss: number;
  confusionMatrix?: number[][];
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
  trainingTime: number;
  inferenceTime: number;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'preparing' | 'training' | 'validating' | 'completed' | 'failed' | 'stopped';
  progress: TrainingProgress;
  startTime: string;
  endTime?: string;
  datasetId: string;
  datasetSize: number;
  configuration: ModelConfiguration;
  metrics?: ModelPerformance;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    data?: any;
  }>;
  artifacts: Array<{
    id: string;
    name: string;
    type: 'model' | 'weights' | 'config' | 'metrics' | 'plot';
    url: string;
    size: number;
  }>;
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage?: number;
    diskUsage: number;
  };
}

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  trainingLoss: number;
  validationLoss: number;
  trainingAccuracy?: number;
  validationAccuracy?: number;
  estimatedTimeRemaining: number;
  elapsedTime: number;
  learningRate: number;
  batchSize: number;
}

export interface Prediction {
  id: string;
  modelId: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: string;
  metadata: Record<string, any>;
  explanation?: {
    featureImportance: Array<{
      feature: string;
      importance: number;
    }>;
    shap?: any;
    lime?: any;
  };
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  endpoint: string;
  status: 'deploying' | 'active' | 'inactive' | 'failed';
  replicas: number;
  autoScaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCpuUtilization: number;
    targetMemoryUtilization: number;
  };
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  monitoring: {
    enabled: boolean;
    metricsEndpoint: string;
    alerting: boolean;
  };
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  models: string[];
  metrics: Record<string, any>;
  parameters: Record<string, any>;
  results: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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
  };
}

// ML API Client Class
class MLApiClient {
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
        throw new Error(`ML API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        requestId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('ML API request failed:', error);
      throw error;
    }
  }

  // Model Management
  async getModels(): Promise<ApiResponse<MLModel[]>> {
    return this.request('/api/v1/ml/models');
  }

  async getModel(id: string): Promise<ApiResponse<MLModel>> {
    return this.request(`/api/v1/ml/models/${id}`);
  }

  async createModel(config: Omit<MLModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MLModel>> {
    return this.request('/api/v1/ml/models', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async updateModel(id: string, updates: Partial<MLModel>): Promise<ApiResponse<MLModel>> {
    return this.request(`/api/v1/ml/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteModel(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ml/models/${id}`, {
      method: 'DELETE'
    });
  }

  // Training Management
  async getTrainingJobs(): Promise<ApiResponse<TrainingJob[]>> {
    return this.request('/api/v1/ml/training/jobs');
  }

  async getTrainingJob(id: string): Promise<ApiResponse<TrainingJob>> {
    return this.request(`/api/v1/ml/training/jobs/${id}`);
  }

  async startTraining(modelId: string, datasetId: string, config?: Partial<ModelConfiguration>): Promise<ApiResponse<TrainingJob>> {
    return this.request('/api/v1/ml/training/start', {
      method: 'POST',
      body: JSON.stringify({
        modelId,
        datasetId,
        configuration: config
      })
    });
  }

  async stopTraining(jobId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ml/training/jobs/${jobId}/stop`, {
      method: 'POST'
    });
  }

  async getTrainingLogs(jobId: string): Promise<ApiResponse<TrainingJob['logs']>> {
    return this.request(`/api/v1/ml/training/jobs/${jobId}/logs`);
  }

  async downloadTrainingArtifacts(jobId: string, artifactId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/ml/training/jobs/${jobId}/artifacts/${artifactId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artifact-${artifactId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  // Inference Management
  async runInference(request: {
    modelId: string;
    data: any;
    includeExplanations?: boolean;
    confidenceThreshold?: number;
  }): Promise<ApiResponse<Prediction>> {
    return this.request('/api/v1/ml/inference', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async batchInference(requests: Array<{
    modelId: string;
    data: any;
    includeExplanations?: boolean;
  }>): Promise<ApiResponse<Prediction[]>> {
    return this.request('/api/v1/ml/inference/batch', {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
  }

  async cancelInference(requestId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ml/inference/${requestId}/cancel`, {
      method: 'POST'
    });
  }

  // Deployment Management
  async getDeployments(): Promise<ApiResponse<ModelDeployment[]>> {
    return this.request('/api/v1/ml/deployments');
  }

  async deployModel(
    modelId: string, 
    environment: ModelDeployment['environment'],
    config?: Partial<ModelDeployment>
  ): Promise<ApiResponse<ModelDeployment>> {
    return this.request('/api/v1/ml/deployments', {
      method: 'POST',
      body: JSON.stringify({
        modelId,
        environment,
        ...config
      })
    });
  }

  async updateDeployment(deploymentId: string, updates: Partial<ModelDeployment>): Promise<ApiResponse<ModelDeployment>> {
    return this.request(`/api/v1/ml/deployments/${deploymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async scaleDeployment(deploymentId: string, replicas: number): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ml/deployments/${deploymentId}/scale`, {
      method: 'POST',
      body: JSON.stringify({ replicas })
    });
  }

  async undeployModel(deploymentId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/ml/deployments/${deploymentId}`, {
      method: 'DELETE'
    });
  }

  // Experiment Management
  async getExperiments(): Promise<ApiResponse<Experiment[]>> {
    return this.request('/api/v1/ml/experiments');
  }

  async createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Experiment>> {
    return this.request('/api/v1/ml/experiments', {
      method: 'POST',
      body: JSON.stringify(experiment)
    });
  }

  // Model Operations
  async validateModel(modelId: string, testDatasetId: string): Promise<ApiResponse<ModelPerformance>> {
    return this.request(`/api/v1/ml/models/${modelId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ testDatasetId })
    });
  }

  async explainPrediction(modelId: string, input: any): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/ml/models/${modelId}/explain`, {
      method: 'POST',
      body: JSON.stringify({ input })
    });
  }

  async compareModels(modelIds: string[]): Promise<ApiResponse<any>> {
    return this.request('/api/v1/ml/models/compare', {
      method: 'POST',
      body: JSON.stringify({ modelIds })
    });
  }

  // AutoML Operations
  async autoML(datasetId: string, targetColumn: string, problemType: MLModel['type']): Promise<ApiResponse<TrainingJob>> {
    return this.request('/api/v1/ml/automl', {
      method: 'POST',
      body: JSON.stringify({
        datasetId,
        targetColumn,
        problemType
      })
    });
  }

  async hyperparameterTuning(modelId: string, searchSpace: Record<string, any>): Promise<ApiResponse<TrainingJob>> {
    return this.request(`/api/v1/ml/models/${modelId}/hyperparameter-tuning`, {
      method: 'POST',
      body: JSON.stringify({ searchSpace })
    });
  }

  // Monitoring and Observability
  async getModelMetrics(modelId: string, timeRange?: string): Promise<ApiResponse<any>> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request(`/api/v1/ml/models/${modelId}/metrics${params}`);
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request('/api/v1/ml/system/health');
  }

  // Utilities
  async exportModel(modelId: string, format: 'onnx' | 'tensorflow' | 'pytorch' | 'pickle'): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/ml/models/${modelId}/export?format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  async importModel(file: File, metadata: Partial<MLModel>): Promise<ApiResponse<MLModel>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.baseUrl}/api/v1/ml/models/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Performance Analytics
  async getPerformanceMetrics(): Promise<ApiResponse<{
    accuracy: number;
    throughput: number;
    latency: number;
    errorRate: number;
  }>> {
    return this.request('/api/v1/ml/metrics/performance');
  }

  // Real-time WebSocket connection for ML updates
  createWebSocketConnection(onMessage: (data: any) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/api/v1/ml/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('ML WebSocket connected');
      toast.success('ML real-time connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('ML WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log('ML WebSocket disconnected');
      toast.warning('ML real-time connection lost');
    };

    ws.onerror = (error) => {
      console.error('ML WebSocket error:', error);
      toast.error('ML real-time connection error');
    };

    return ws;
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    toast.success('ML API cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const mlApi = new MLApiClient();
export default mlApi;