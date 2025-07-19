import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText,
  Shield,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import useComplianceStore, { ComplianceEnterpriseUtils } from '../../core/state-manager';
import { complianceCorrelationEngine } from '../../analytics/correlation-engine';
import { complianceCollaborationEngine } from '../../collaboration/realtime-collaboration';
import { complianceWorkflowEngine } from '../../core/workflow-engine';

interface DashboardMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface ComplianceTrend {
  date: string;
  complianceScore: number;
  violations: number;
  audits: number;
}

const EnterpriseComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [trendData, setTrendData] = useState<ComplianceTrend[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [collaborationStats, setCollaborationStats] = useState<any>({});
  const [workflowStats, setWorkflowStats] = useState<any>({});

  const {
    rules,
    violations,
    audits,
    analytics,
    updateAnalytics
  } = useComplianceStore();

  // Generate mock trend data
  const generateTrendData = (): ComplianceTrend[] => {
    const data: ComplianceTrend[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        complianceScore: 85 + Math.random() * 15,
        violations: Math.floor(Math.random() * 20),
        audits: Math.floor(Math.random() * 5)
      });
    }
    
    return data;
  };

  // Calculate dashboard metrics
  const calculateMetrics = (): DashboardMetric[] => {
    const complianceScore = ComplianceEnterpriseUtils.calculateComplianceScore(rules, violations);
    const riskScore = ComplianceEnterpriseUtils.calculateRiskScore(violations);
    const openViolations = violations.filter(v => v.status === 'OPEN').length;
    const activeRules = rules.filter(r => r.status === 'ACTIVE').length;
    const completedAudits = audits.filter(a => a.status === 'COMPLETED').length;

    return [
      {
        label: 'Compliance Score',
        value: complianceScore,
        change: 2.5,
        trend: 'up',
        icon: <Shield className="h-4 w-4" />,
        color: complianceScore >= 80 ? 'text-green-600' : complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        label: 'Risk Score',
        value: riskScore,
        change: -1.2,
        trend: 'down',
        icon: <AlertTriangle className="h-4 w-4" />,
        color: riskScore <= 20 ? 'text-green-600' : riskScore <= 50 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        label: 'Open Violations',
        value: openViolations,
        change: -3,
        trend: 'down',
        icon: <AlertTriangle className="h-4 w-4" />,
        color: openViolations <= 5 ? 'text-green-600' : openViolations <= 15 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        label: 'Active Rules',
        value: activeRules,
        change: 1,
        trend: 'up',
        icon: <FileText className="h-4 w-4" />,
        color: 'text-blue-600'
      },
      {
        label: 'Completed Audits',
        value: completedAudits,
        change: 2,
        trend: 'up',
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600'
      },
      {
        label: 'Collaboration Sessions',
        value: collaborationStats.activeSessions || 0,
        change: 0,
        trend: 'stable',
        icon: <Users className="h-4 w-4" />,
        color: 'text-purple-600'
      }
    ];
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    
    try {
      // Update analytics
      updateAnalytics();
      
      // Get insights from correlation engine
      const correlationInsights = complianceCorrelationEngine.getInsights();
      setInsights(correlationInsights.slice(-5));
      
      // Get collaboration stats
      const collabStats = complianceCollaborationEngine.getCollaborationStats();
      setCollaborationStats(collabStats);
      
      // Get workflow stats
      const workflowStats = complianceWorkflowEngine.getWorkflowStats();
      setWorkflowStats(workflowStats);
      
      // Update metrics
      setMetrics(calculateMetrics());
      
      // Update trend data
      setTrendData(generateTrendData());
      
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    refreshDashboard();
    
    // Set up periodic refresh
    const interval = setInterval(refreshDashboard, 300000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [rules, violations, audits]);

  // Violation severity distribution data
  const violationSeverityData = [
    { name: 'Critical', value: violations.filter(v => v.severity === 'CRITICAL').length, color: '#ef4444' },
    { name: 'High', value: violations.filter(v => v.severity === 'HIGH').length, color: '#f97316' },
    { name: 'Medium', value: violations.filter(v => v.severity === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low', value: violations.filter(v => v.severity === 'LOW').length, color: '#22c55e' }
  ];

  // Rule category distribution data
  const ruleCategoryData = [
    { name: 'Data Privacy', value: rules.filter(r => r.category === 'DATA_PRIVACY').length },
    { name: 'Security', value: rules.filter(r => r.category === 'SECURITY').length },
    { name: 'Quality', value: rules.filter(r => r.category === 'QUALITY').length },
    { name: 'Governance', value: rules.filter(r => r.category === 'GOVERNANCE').length },
    { name: 'Other', value: rules.filter(r => !['DATA_PRIVACY', 'SECURITY', 'QUALITY', 'GOVERNANCE'].includes(r.category)).length }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time compliance monitoring and analytics
          </p>
        </div>
        <Button 
          onClick={refreshDashboard} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              <div className={metric.color}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toFixed(1)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                ) : (
                  <Activity className="h-3 w-3 mr-1 text-gray-600" />
                )}
                {Math.abs(metric.change)}% from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Compliance Trend Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
                <CardDescription>
                  Compliance score over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
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
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Violation Severity Distribution */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Violation Severity</CardTitle>
                <CardDescription>
                  Distribution by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={violationSeverityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {violationSeverityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest compliance events and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'rule' && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'violation' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {activity.type === 'audit' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.type === 'rule' && `Rule "${activity.data.name}" updated`}
                        {activity.type === 'violation' && `Violation detected: ${activity.data.description}`}
                        {activity.type === 'audit' && `Audit "${activity.data.name}" completed`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Violations Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Violations Trend</CardTitle>
                <CardDescription>
                  Violation count over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="violations" 
                      stroke="#ef4444" 
                      fill="#fef2f2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rule Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Rule Categories</CardTitle>
                <CardDescription>
                  Distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ruleCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Current collaboration sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collaborationStats.activeSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {collaborationStats.totalSessions || 0} total sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>
                  Active collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collaborationStats.totalParticipants || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Total messages exchanged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collaborationStats.totalMessages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time communication
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Collaboration Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Collaboration Sessions</CardTitle>
              <CardDescription>
                Current collaborative work sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceCollaborationEngine.getActiveSessions().slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{session.name}</h4>
                      <p className="text-sm text-muted-foreground">{session.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {session.participants.length} participants
                      </Badge>
                      <Badge variant="outline">
                        {session.documents.length} documents
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Workflows</CardTitle>
                <CardDescription>
                  All workflow instances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowStats.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
                <CardDescription>
                  Currently running
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowStats.active || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed</CardTitle>
                <CardDescription>
                  Successfully finished
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowStats.completed || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Failed</CardTitle>
                <CardDescription>
                  Failed workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowStats.failed || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Average completion time and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Duration</span>
                    <span>{Math.round((workflowStats.averageDuration || 0) / 1000 / 60)} minutes</span>
                  </div>
                  <Progress value={Math.min(100, (workflowStats.averageDuration || 0) / 1000 / 60)} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
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
                            {insight.confidence.toFixed(1)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(insight.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Recommendations:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insight.recommendations.map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="flex items-start">
                              <span className="mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseComplianceDashboard;