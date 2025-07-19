"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3, TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle,
  Clock, Users, FileText, Activity, Target, Award, Zap, Database,
  RefreshCw, Filter, Download, Settings, Bell, Calendar, Globe,
  PieChart, LineChart, BarChart, Gauge, Eye, ExternalLink
} from "lucide-react"

// Enterprise Integration
import { useEnterpriseFeatures } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { ComplianceMetrics, ComplianceInsight, ComplianceEvent } from '../types'

interface ComplianceRuleDashboardProps {
  dataSourceId?: number
  searchQuery?: string
  filters?: Record<string, any>
  insights?: ComplianceInsight[]
  alerts?: ComplianceEvent[]
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color?: string
  loading?: boolean
  onClick?: () => void
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, trend, icon, color = 'blue', loading, onClick 
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`cursor-pointer ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                {change !== undefined && (
                  <div className={`flex items-center text-sm ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="ml-1">{Math.abs(change)}%</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full bg-${color}-100`}>
                {icon}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ComplianceRuleDashboard: React.FC<ComplianceRuleDashboardProps> = ({
  dataSourceId,
  searchQuery,
  filters,
  insights = [],
  alerts = []
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const enterprise = useEnterpriseCompliance()
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'ComplianceRuleDashboard',
    dataSourceId,
    enableAnalytics: true,
    enableMonitoring: true
  })

  // Load real dashboard data from multiple APIs
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        const [
          metricsData,
          trendsData,
          frameworksData,
          riskData,
          activitiesData,
          insightsData
        ] = await Promise.all([
          ComplianceAPIs.Analytics.getComplianceMetrics({
            data_source_id: dataSourceId,
            date_range: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            },
            granularity: 'daily'
          }),
          ComplianceAPIs.Analytics.getComplianceTrends({
            data_source_id: dataSourceId,
            period: selectedTimeRange
          }),
          ComplianceAPIs.Framework.getFrameworks(),
          ComplianceAPIs.Risk.getRiskAssessment(dataSourceId?.toString() || '1'),
          ComplianceAPIs.Audit.getAuditTrail('compliance', dataSourceId?.toString() || '1', {
            limit: 10
          }),
          ComplianceAPIs.Analytics.generateComplianceInsights({
            data_source_id: dataSourceId,
            analysis_type: 'performance'
          })
        ])

        setDashboardData({
          metrics: metricsData,
          trends: trendsData,
          frameworks: frameworksData,
          risk: riskData,
          activities: activitiesData.data,
          insights: insightsData.insights
        })

      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        enterprise.sendNotification('error', 'Failed to load dashboard data')
        
        // Set empty state instead of mock data
        setDashboardData({
          metrics: {
            overall_score: 0,
            framework_scores: {},
            risk_distribution: {},
            trends: [],
            benchmarks: {}
          },
          trends: [],
          frameworks: [],
          risk: {
            overall_risk_score: 0,
            risk_level: 'low',
            risk_factors: [],
            risk_trends: [],
            recommendations: []
          },
          activities: [],
          insights: []
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [dataSourceId, selectedTimeRange, enterprise])

  // Real-time data refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      if (dashboardData) {
        try {
          const updatedMetrics = await ComplianceAPIs.Analytics.getComplianceMetrics({
            data_source_id: dataSourceId
          })
          setDashboardData((prev: any) => ({
            ...prev,
            metrics: updatedMetrics
          }))
        } catch (error) {
          console.error('Failed to refresh metrics:', error)
        }
      }
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [dashboardData, dataSourceId])

  const renderOverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MetricCard
        title="Compliance Score"
        value={`${dashboardData?.metrics?.overall_score || 0}%`}
        change={5.2}
        trend="up"
        icon={<Shield className="h-6 w-6 text-blue-600" />}
        color="blue"
        loading={loading}
      />
      <MetricCard
        title="Active Rules"
        value={Object.keys(dashboardData?.metrics?.framework_scores || {}).length}
        change={2.1}
        trend="up"
        icon={<FileText className="h-6 w-6 text-green-600" />}
        color="green"
        loading={loading}
      />
      <MetricCard
        title="Risk Level"
        value={dashboardData?.risk?.risk_level?.toUpperCase() || 'LOW'}
        change={-1.8}
        trend="down"
        icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
        color="yellow"
        loading={loading}
      />
      <MetricCard
        title="Issues Resolved"
        value={dashboardData?.metrics?.resolved_issues || 0}
        change={8.3}
        trend="up"
        icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
        color="purple"
        loading={loading}
      />
    </div>
  )

  const renderComplianceTrends = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compliance Trends</CardTitle>
            <CardDescription>Track compliance performance over time</CardDescription>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 bg-muted animate-pulse rounded" />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Compliance trends chart would be rendered here</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderFrameworkPerformance = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Framework Performance</CardTitle>
        <CardDescription>Compliance scores by framework</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                <div className="h-2 bg-muted animate-pulse rounded" />
              </div>
            ))
          ) : Object.entries(dashboardData?.metrics?.framework_scores || {}).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No framework data available</p>
            </div>
          ) : (
            Object.entries(dashboardData?.metrics?.framework_scores || {}).map(([framework, score]: [string, any]) => (
              <div key={framework} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{framework}</span>
                  <span className="text-sm text-muted-foreground">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderRiskDistribution = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>Current risk levels across compliance areas</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : (
          <div className="space-y-4">
            {Object.entries(dashboardData?.metrics?.risk_distribution || {}).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No risk data available</p>
              </div>
            ) : (
              Object.entries(dashboardData?.metrics?.risk_distribution || {}).map(([level, count]: [string, any]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level === 'critical' ? 'bg-red-500' :
                      level === 'high' ? 'bg-orange-500' :
                      level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="capitalize">{level} Risk</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderRecentActivities = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest compliance events and actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))
          ) : dashboardData?.activities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activities</p>
            </div>
          ) : (
            dashboardData?.activities?.map((activity: any, index: number) => (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 mb-4 last:mb-0"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description || activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user_id && `by ${activity.user_id} • `}
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.entity_type || 'System'}
                </Badge>
              </motion.div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )

  const renderAIInsights = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>AI Insights</span>
        </CardTitle>
        <CardDescription>AI-powered compliance recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3 border rounded-lg bg-muted/50 animate-pulse">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ))
          ) : (dashboardData?.insights || insights)?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI insights available</p>
            </div>
          ) : (
            (dashboardData?.insights || insights)?.slice(0, 3).map((insight: ComplianceInsight, index: number) => (
              <motion.div
                key={insight.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
              >
                <div className="flex items-start space-x-3">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{insight.title || 'Optimization Opportunity'}</p>
                    <p className="text-xs text-muted-foreground">{insight.description || 'AI-powered compliance insight'}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {insight.confidence || 95}% confidence
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor compliance performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewMetrics()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderComplianceTrends()}
            {renderFrameworkPerformance()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderRiskDistribution()}
            {renderRecentActivities()}
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          {renderFrameworkPerformance()}
          {renderComplianceTrends()}
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          {renderRiskDistribution()}
          {renderRecentActivities()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderAIInsights()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceRuleDashboard