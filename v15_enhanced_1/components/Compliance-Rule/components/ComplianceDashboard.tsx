"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Users,
  FileText,
  Brain,
  Zap
} from "lucide-react"
import { useEnterpriseComplianceFeatures, useComplianceAnalytics } from "../hooks/use-enterprise-compliance"
import { LoadingSpinner } from "../../Scan-Rule-Sets/components/LoadingSpinner"
import { ErrorBoundary } from "../../Scan-Rule-Sets/components/ErrorBoundary"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ComplianceDashboardProps {
  dataSourceId?: number
  refreshInterval?: number
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"] // Red, Orange, Yellow, Green, Blue

export function ComplianceDashboard({ 
  dataSourceId,
  refreshInterval = 30000 
}: ComplianceDashboardProps) {
  const enterprise = useEnterpriseComplianceFeatures({
    componentName: 'compliance-dashboard',
    dataSourceId,
    enableRealTimeMonitoring: true,
    enableAIInsights: true
  })
  
  const analytics = useComplianceAnalytics(dataSourceId)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const getComplianceStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'partially_compliant':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (enterprise.isLoading || analytics.isLoading) {
    return <LoadingSpinner />
  }

  if (enterprise.error || analytics.error) {
    return (
      <ErrorBoundary>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load compliance data. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header with Real-time Status */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time compliance monitoring and insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
            <Button variant="outline" onClick={() => enterprise.refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enterprise.status?.overall_score || 0}%
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Progress 
                  value={enterprise.status?.overall_score || 0} 
                  className="flex-1"
                />
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requirements</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enterprise.requirements?.length || 0}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-sm text-green-600">
                  {enterprise.status?.compliant_requirements || 0} compliant
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-red-600">
                  {enterprise.status?.non_compliant_requirements || 0} non-compliant
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enterprise.assessments?.filter(a => a.status === 'in_progress').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {enterprise.assessments?.filter(a => a.status === 'pending').length || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Gaps</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {enterprise.gaps?.filter(g => g.risk_level === 'critical').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {enterprise.gaps?.filter(g => g.risk_level === 'high').length || 0} high risk
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trends
              </CardTitle>
              <CardDescription>
                Compliance score over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trends}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Compliance Score']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance_score" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#complianceGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Framework Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Framework Compliance
              </CardTitle>
              <CardDescription>
                Compliance status by framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.frameworkStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="framework" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                  <Bar dataKey="compliance_percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution and Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Risk Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Distribution
              </CardTitle>
              <CardDescription>
                Distribution of requirements by risk level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.riskDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest compliance assessments and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enterprise.recentActivity?.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getStatusIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                ))}
                {(!enterprise.recentActivity || enterprise.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="mx-auto h-8 w-8 mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Recommendations */}
        {enterprise.aiInsights && enterprise.aiInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent recommendations to improve compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {enterprise.aiInsights.slice(0, 4).map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Alerts */}
        {enterprise.realTimeAlerts && enterprise.realTimeAlerts.length > 0 && (
          <div className="space-y-2">
            {enterprise.realTimeAlerts.map((alert, index) => (
              <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.title}:</strong> {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
