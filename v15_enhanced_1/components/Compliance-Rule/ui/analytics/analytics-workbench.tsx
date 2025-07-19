import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Activity,
  Brain,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Zap
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import useComplianceStore from '../../core/state-manager';
import { complianceCorrelationEngine, ComplianceInsight, ComplianceTrend } from '../../analytics/correlation-engine';
import { useEnterpriseCompliance } from '../../hooks/use-enterprise-compliance';

interface AnalyticsQuery {
  id: string;
  name: string;
  type: 'TREND' | 'CORRELATION' | 'PREDICTION' | 'ANOMALY';
  query: string;
  parameters: Record<string, any>;
  schedule?: string;
  enabled: boolean;
}

interface AnalyticsModel {
  id: string;
  name: string;
  type: 'REGRESSION' | 'CLASSIFICATION' | 'CLUSTERING' | 'FORECASTING';
  status: 'TRAINING' | 'READY' | 'DEPLOYED' | 'FAILED';
  accuracy: number;
  lastTrained: Date;
  features: string[];
}

const AnalyticsWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [queries, setQueries] = useState<AnalyticsQuery[]>([]);
  const [models, setModels] = useState<AnalyticsModel[]>([]);
  const [insights, setInsights] = useState<ComplianceInsight[]>([]);
  const [trends, setTrends] = useState<Map<string, ComplianceTrend>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [customQuery, setCustomQuery] = useState('');

  const {
    rules,
    violations,
    audits,
    analytics,
    updateAnalytics
  } = useComplianceStore();

  const {
    realTimeMetrics,
    aiInsights,
    workflowMetrics,
    collaborationMetrics
  } = useEnterpriseCompliance();

  // Initialize analytics data
  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Get insights from correlation engine
      const correlationInsights = complianceCorrelationEngine.getInsights();
      setInsights(correlationInsights);

      // Get trends
      const trendData = complianceCorrelationEngine.getTrends();
      setTrends(trendData);

      // Load sample queries and models
      setQueries([
        {
          id: 'q1',
          name: 'Compliance Trend Analysis',
          type: 'TREND',
          query: 'SELECT compliance_score, DATE(created_at) as date FROM compliance_metrics WHERE created_at >= NOW() - INTERVAL 30 DAY',
          parameters: { timeRange: '30d' },
          enabled: true
        },
        {
          id: 'q2',
          name: 'Violation Correlation Analysis',
          type: 'CORRELATION',
          query: 'SELECT rule_id, violation_count, severity FROM violations GROUP BY rule_id, severity',
          parameters: { threshold: 0.7 },
          enabled: true
        },
        {
          id: 'q3',
          name: 'Risk Prediction Model',
          type: 'PREDICTION',
          query: 'PREDICT risk_score FROM compliance_data USING features(rule_count, violation_history, audit_frequency)',
          parameters: { model: 'linear_regression' },
          enabled: false
        }
      ]);

      setModels([
        {
          id: 'm1',
          name: 'Compliance Score Predictor',
          type: 'REGRESSION',
          status: 'READY',
          accuracy: 0.89,
          lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          features: ['rule_count', 'violation_history', 'audit_frequency', 'framework_complexity']
        },
        {
          id: 'm2',
          name: 'Violation Risk Classifier',
          type: 'CLASSIFICATION',
          status: 'DEPLOYED',
          accuracy: 0.94,
          lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          features: ['data_sensitivity', 'access_patterns', 'user_behavior', 'system_events']
        },
        {
          id: 'm3',
          name: 'Anomaly Detection Model',
          type: 'CLUSTERING',
          status: 'TRAINING',
          accuracy: 0.0,
          lastTrained: new Date(),
          features: ['event_patterns', 'temporal_features', 'user_profiles', 'system_metrics']
        }
      ]);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  // Filter insights based on search and severity
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesSearch = searchTerm === '' || 
        insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = filterSeverity === 'all' || insight.severity === filterSeverity;
      
      return matchesSearch && matchesSeverity;
    });
  }, [insights, searchTerm, filterSeverity]);

  // Execute custom analytics query
  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock results based on query type
      const mockResult = {
        id: `insight-${Date.now()}`,
        type: 'TREND' as const,
        title: 'Custom Analytics Result',
        description: `Results from custom query: ${customQuery.substring(0, 50)}...`,
        severity: 'MEDIUM' as const,
        confidence: 0.8,
        data: { queryResults: 'Mock data based on custom query' },
        recommendations: ['Review custom analysis results', 'Consider scheduling regular execution'],
        timestamp: new Date(),
        tags: ['custom', 'analytics']
      };

      setInsights(prev => [mockResult, ...prev]);
    } catch (error) {
      console.error('Error executing custom query:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compliance trend data for charts
  const complianceTrendData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        complianceScore: 85 + Math.random() * 15,
        riskScore: 20 + Math.random() * 30,
        violations: Math.floor(Math.random() * 25),
        audits: Math.floor(Math.random() * 8)
      });
    }
    
    return data;
  }, []);

  // Violation pattern data
  const violationPatternData = [
    { category: 'Data Privacy', count: violations.filter(v => v.entityType === 'DATA_PRIVACY').length, severity: 'HIGH' },
    { category: 'Security', count: violations.filter(v => v.entityType === 'SECURITY').length, severity: 'CRITICAL' },
    { category: 'Quality', count: violations.filter(v => v.entityType === 'QUALITY').length, severity: 'MEDIUM' },
    { category: 'Governance', count: violations.filter(v => v.entityType === 'GOVERNANCE').length, severity: 'LOW' }
  ];

  // Risk correlation data
  const riskCorrelationData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      riskScore: Math.random() * 100,
      complianceScore: 100 - (Math.random() * 50 + 25),
      violationCount: Math.floor(Math.random() * 30),
      framework: ['GDPR', 'SOX', 'HIPAA', 'PCI-DSS'][Math.floor(Math.random() * 4)]
    }));
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Workbench</h1>
          <p className="text-muted-foreground">
            Advanced compliance analytics and AI-powered insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {insights.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Queries</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queries.filter(q => q.enabled).length}</div>
            <p className="text-xs text-muted-foreground">
              {queries.length} total queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Models</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(m => m.status === 'DEPLOYED').length}</div>
            <p className="text-xs text-muted-foreground">
              {models.length} total models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="queries">Custom Queries</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          insight.severity === 'CRITICAL' ? 'destructive' :
                          insight.severity === 'HIGH' ? 'default' :
                          'secondary'
                        }
                      >
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Insight Type */}
                    <div className="flex items-center space-x-2">
                      {insight.type === 'TREND' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                      {insight.type === 'ANOMALY' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {insight.type === 'PATTERN' && <Activity className="h-4 w-4 text-green-600" />}
                      {insight.type === 'RISK' && <Target className="h-4 w-4 text-orange-600" />}
                      {insight.type === 'OPPORTUNITY' && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                      <span className="text-sm font-medium">{insight.type}</span>
                    </div>

                    {/* Recommendations */}
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start">
                              <CheckCircle className="h-3 w-3 mt-0.5 mr-2 text-green-600" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground">
                      Generated: {new Date(insight.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Compliance Score Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score Trend</CardTitle>
                <CardDescription>30-day compliance score evolution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={complianceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="complianceScore" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Compliance Score"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk vs Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Risk vs Compliance</CardTitle>
                <CardDescription>Risk and compliance correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={complianceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      name="Risk Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="complianceScore" 
                      stroke="#22c55e" 
                      name="Compliance Score"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Violation Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Violation Patterns by Category</CardTitle>
              <CardDescription>Distribution and severity of violations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={violationPatternData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk-Compliance Correlation Analysis</CardTitle>
              <CardDescription>Relationship between risk factors and compliance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={riskCorrelationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="riskScore" 
                    name="Risk Score" 
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="complianceScore" 
                    name="Compliance Score" 
                    domain={[0, 100]}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="Data Points" 
                    dataKey="violationCount" 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {models.filter(m => m.type === 'FORECASTING' || m.type === 'REGRESSION').map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>
                    {model.type} • Accuracy: {(model.accuracy * 100).toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Model Accuracy</span>
                        <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {model.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Last trained: {model.lastTrained.toLocaleDateString()}
                      </span>
                      <Badge variant={
                        model.status === 'DEPLOYED' ? 'default' :
                        model.status === 'READY' ? 'secondary' :
                        model.status === 'TRAINING' ? 'outline' :
                        'destructive'
                      }>
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Queries Tab */}
        <TabsContent value="queries" className="space-y-4">
          {/* Query Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Analytics Query</CardTitle>
              <CardDescription>Execute custom SQL-like queries on compliance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="SELECT compliance_score, violation_count FROM compliance_data WHERE date >= '2024-01-01'"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={executeCustomQuery} 
                  disabled={isAnalyzing || !customQuery.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Query
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Queries</CardTitle>
              <CardDescription>Pre-built analytics queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queries.map((query) => (
                  <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{query.name}</h4>
                      <p className="text-sm text-muted-foreground">{query.type}</p>
                      <code className="text-xs bg-muted p-1 rounded">
                        {query.query.substring(0, 60)}...
                      </code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={query.enabled} />
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <CardDescription>{model.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={
                        model.status === 'DEPLOYED' ? 'default' :
                        model.status === 'READY' ? 'secondary' :
                        model.status === 'TRAINING' ? 'outline' :
                        'destructive'
                      }>
                        {model.status}
                      </Badge>
                    </div>

                    {/* Accuracy */}
                    {model.status !== 'TRAINING' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Accuracy</span>
                          <span>{(model.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={model.accuracy * 100} />
                      </div>
                    )}

                    {/* Features Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Features</span>
                      <span className="text-sm">{model.features.length}</span>
                    </div>

                    {/* Last Trained */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Trained</span>
                      <span className="text-sm text-muted-foreground">
                        {model.lastTrained.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Retrain
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Deploy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Model Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
              <CardDescription>Accuracy comparison across all models</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={models.filter(m => m.status !== 'TRAINING')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                  <Bar dataKey="accuracy" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsWorkbench;