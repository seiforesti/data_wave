import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Brain, 
  Target,
  Activity,
  Zap,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  TreeMap,
  Cell
} from 'recharts';
import { useEnterpriseCompliance } from '../hooks/use-enterprise-compliance';
import { complianceCorrelationEngine } from '../analytics/correlation-engine';

interface RiskFactor {
  id: string;
  name: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  impact: number;
  riskScore: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  mitigation: string[];
  lastAssessed: Date;
}

interface RiskScenario {
  id: string;
  name: string;
  description: string;
  likelihood: number;
  impact: number;
  riskLevel: number;
  scenarios: string[];
  mitigationStrategies: string[];
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'REGRESSION' | 'CLASSIFICATION' | 'TIME_SERIES';
  accuracy: number;
  predictions: Array<{
    timeframe: string;
    riskScore: number;
    confidence: number;
  }>;
}

const AdvancedRiskAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  const {
    realTimeMetrics,
    aiInsights,
    crossGroupData
  } = useEnterpriseCompliance({
    componentName: 'advanced-risk-assessment',
    enableAnalytics: true,
    enableAIInsights: true,
    enableCrossGroupIntegration: true
  });

  // Load risk assessment data
  useEffect(() => {
    loadRiskData();
    const interval = setInterval(loadRiskData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadRiskData = async () => {
    setIsAnalyzing(true);
    try {
      // Generate ML-powered risk factors
      const riskFactorsData: RiskFactor[] = [
        {
          id: 'rf1',
          name: 'Data Privacy Violations',
          category: 'PRIVACY',
          severity: 'HIGH',
          probability: 0.75,
          impact: 0.9,
          riskScore: 85,
          trend: 'INCREASING',
          mitigation: ['Enhanced monitoring', 'Staff training', 'Policy updates'],
          lastAssessed: new Date()
        },
        {
          id: 'rf2',
          name: 'Regulatory Non-Compliance',
          category: 'REGULATORY',
          severity: 'CRITICAL',
          probability: 0.6,
          impact: 0.95,
          riskScore: 92,
          trend: 'STABLE',
          mitigation: ['Compliance audits', 'Process automation', 'Regular reviews'],
          lastAssessed: new Date()
        },
        {
          id: 'rf3',
          name: 'Data Quality Issues',
          category: 'QUALITY',
          severity: 'MEDIUM',
          probability: 0.8,
          impact: 0.6,
          riskScore: 68,
          trend: 'DECREASING',
          mitigation: ['Data validation', 'Quality metrics', 'Automated checks'],
          lastAssessed: new Date()
        },
        {
          id: 'rf4',
          name: 'Security Vulnerabilities',
          category: 'SECURITY',
          severity: 'HIGH',
          probability: 0.7,
          impact: 0.85,
          riskScore: 81,
          trend: 'INCREASING',
          mitigation: ['Security patches', 'Access controls', 'Monitoring'],
          lastAssessed: new Date()
        }
      ];

      // Generate risk scenarios
      const scenariosData: RiskScenario[] = [
        {
          id: 'rs1',
          name: 'Data Breach Scenario',
          description: 'Unauthorized access to sensitive compliance data',
          likelihood: 0.25,
          impact: 0.95,
          riskLevel: 89,
          scenarios: ['External attack', 'Insider threat', 'System vulnerability'],
          mitigationStrategies: ['Multi-factor authentication', 'Encryption', 'Access monitoring']
        },
        {
          id: 'rs2',
          name: 'Regulatory Audit Failure',
          description: 'Failure to meet regulatory compliance requirements',
          likelihood: 0.35,
          impact: 0.8,
          riskLevel: 76,
          scenarios: ['Missing documentation', 'Process gaps', 'Policy violations'],
          mitigationStrategies: ['Documentation review', 'Process automation', 'Regular audits']
        }
      ];

      // Generate predictive models
      const modelsData: PredictiveModel[] = [
        {
          id: 'pm1',
          name: 'Risk Trend Predictor',
          type: 'TIME_SERIES',
          accuracy: 0.87,
          predictions: [
            { timeframe: '1 month', riskScore: 78, confidence: 0.92 },
            { timeframe: '3 months', riskScore: 82, confidence: 0.85 },
            { timeframe: '6 months', riskScore: 75, confidence: 0.78 },
            { timeframe: '1 year', riskScore: 71, confidence: 0.65 }
          ]
        }
      ];

      setRiskFactors(riskFactorsData);
      setRiskScenarios(scenariosData);
      setPredictiveModels(modelsData);

    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate overall risk score
  const overallRiskScore = useMemo(() => {
    if (riskFactors.length === 0) return 0;
    const weightedSum = riskFactors.reduce((sum, factor) => {
      const weight = factor.severity === 'CRITICAL' ? 4 : 
                   factor.severity === 'HIGH' ? 3 : 
                   factor.severity === 'MEDIUM' ? 2 : 1;
      return sum + (factor.riskScore * weight);
    }, 0);
    const totalWeight = riskFactors.reduce((sum, factor) => {
      return sum + (factor.severity === 'CRITICAL' ? 4 : 
                   factor.severity === 'HIGH' ? 3 : 
                   factor.severity === 'MEDIUM' ? 2 : 1);
    }, 0);
    return Math.round(weightedSum / totalWeight);
  }, [riskFactors]);

  // Risk radar chart data
  const radarData = useMemo(() => {
    const categories = ['PRIVACY', 'REGULATORY', 'QUALITY', 'SECURITY', 'OPERATIONAL'];
    return categories.map(category => {
      const categoryFactors = riskFactors.filter(f => f.category === category);
      const avgRisk = categoryFactors.length > 0 
        ? categoryFactors.reduce((sum, f) => sum + f.riskScore, 0) / categoryFactors.length 
        : 0;
      return {
        category,
        risk: avgRisk,
        fullMark: 100
      };
    });
  }, [riskFactors]);

  // Risk trend data
  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        riskScore: overallRiskScore + (Math.random() - 0.5) * 20,
        predicted: false
      });
    }
    // Add predictions
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        riskScore: overallRiskScore + (Math.random() - 0.5) * 15,
        predicted: true
      });
    }
    return data;
  }, [overallRiskScore]);

  // Risk matrix data
  const riskMatrixData = useMemo(() => {
    return riskFactors.map(factor => ({
      x: factor.probability * 100,
      y: factor.impact * 100,
      z: factor.riskScore,
      name: factor.name,
      severity: factor.severity
    }));
  }, [riskFactors]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'DECREASING': return <TrendingDown className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Risk Assessment</h1>
          <p className="text-muted-foreground">
            ML-powered risk analysis with predictive modeling and scenario planning
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadRiskData} variant="outline" size="sm" disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRiskScore}</div>
            <Progress value={overallRiskScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallRiskScore >= 80 ? 'High Risk' : 
               overallRiskScore >= 60 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risk Factors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskFactors.filter(f => f.severity === 'CRITICAL').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Scenarios</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskScenarios.length}</div>
            <p className="text-xs text-muted-foreground">
              Active scenarios monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictiveModels.length > 0 ? (predictiveModels[0].accuracy * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              ML model accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="scenarios">Risk Scenarios</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
        </TabsList>

        {/* Risk Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Risk Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Category Analysis</CardTitle>
                <CardDescription>Multi-dimensional risk assessment across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Risk Score" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Trend & Predictions</CardTitle>
                <CardDescription>Historical trends with ML-powered predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#ef4444" 
                      fill="#fecaca" 
                      name="Risk Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Factors Tab */}
        <TabsContent value="factors" className="space-y-4">
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <Card key={factor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{factor.name}</CardTitle>
                      <CardDescription>Category: {factor.category}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(factor.severity)}>
                        {factor.severity}
                      </Badge>
                      {getTrendIcon(factor.trend)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Risk Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Probability</div>
                        <div className="text-2xl font-bold">{(factor.probability * 100).toFixed(0)}%</div>
                        <Progress value={factor.probability * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Impact</div>
                        <div className="text-2xl font-bold">{(factor.impact * 100).toFixed(0)}%</div>
                        <Progress value={factor.impact * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Risk Score</div>
                        <div className="text-2xl font-bold">{factor.riskScore}</div>
                        <Progress value={factor.riskScore} className="mt-1" />
                      </div>
                    </div>

                    {/* Mitigation Strategies */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Mitigation Strategies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {factor.mitigation.map((strategy, index) => (
                          <Badge key={index} variant="outline">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Last Assessed */}
                    <div className="text-xs text-muted-foreground">
                      Last assessed: {factor.lastAssessed.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="space-y-4">
            {riskScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Scenario Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Likelihood</div>
                        <div className="text-2xl font-bold">{(scenario.likelihood * 100).toFixed(0)}%</div>
                        <Progress value={scenario.likelihood * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Impact</div>
                        <div className="text-2xl font-bold">{(scenario.impact * 100).toFixed(0)}%</div>
                        <Progress value={scenario.impact * 100} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Risk Level</div>
                        <div className="text-2xl font-bold">{scenario.riskLevel}</div>
                        <Progress value={scenario.riskLevel} className="mt-1" />
                      </div>
                    </div>

                    {/* Scenario Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Possible Scenarios:</h4>
                        <ul className="text-sm space-y-1">
                          {scenario.scenarios.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-2 text-orange-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Mitigation Strategies:</h4>
                        <ul className="text-sm space-y-1">
                          {scenario.mitigationStrategies.map((strategy, index) => (
                            <li key={index} className="flex items-center">
                              <Shield className="h-3 w-3 mr-2 text-green-600" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {predictiveModels.map((model) => (
            <Card key={model.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {model.name}
                  <Badge variant="outline">
                    {(model.accuracy * 100).toFixed(1)}% Accuracy
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {model.type} model for risk forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {model.predictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{prediction.timeframe}</div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(prediction.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{prediction.riskScore}</div>
                        <div className="text-sm text-muted-foreground">Risk Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Risk Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Probability vs Impact Matrix</CardTitle>
              <CardDescription>
                Interactive risk matrix showing probability, impact, and risk scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={riskMatrixData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Probability" 
                    unit="%" 
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Impact" 
                    unit="%" 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p>Probability: {data.x}%</p>
                            <p>Impact: {data.y}%</p>
                            <p>Risk Score: {data.z}</p>
                            <p>Severity: {data.severity}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Risk Factors" dataKey="z" fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedRiskAssessment;