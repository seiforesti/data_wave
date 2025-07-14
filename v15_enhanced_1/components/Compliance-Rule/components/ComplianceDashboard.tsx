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
} from "recharts"
import { LayoutDashboard, ShieldCheck, AlertTriangle, RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"
import type { ComplianceSummary } from "../types"
import { LoadingSpinner } from "../../Scan-Rule-Sets/components/LoadingSpinner"
import { ErrorBoundary } from "../../Scan-Rule-Sets/components/ErrorBoundary"
import { format } from "date-fns"

interface ComplianceDashboardProps {
  summary: ComplianceSummary | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"] // Red, Orange, Yellow, Green, Blue

export function ComplianceDashboard({ summary, isLoading, error, onRefresh }: ComplianceDashboardProps) {
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

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="text-center text-red-500 p-4">{error}</div>
        <Button onClick={onRefresh} className="mt-4">
          Retry
        </Button>
      </ErrorBoundary>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No compliance data available.</p>
        <Button onClick={onRefresh} className="mt-4">
          Load Data
        </Button>
      </div>
    )
  }

  const issuesBySeverityChartData = summary.issues_by_severity.map((item) => ({
    name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    value: item.count,
    color:
      COLORS[["critical", "high", "medium", "low"].indexOf(item.severity as "critical" | "high" | "medium" | "low")],
  }))

  const issuesByCategoryChartData = summary.issues_by_category.map((item) => ({
    name: item.category,
    value: item.count,
  }))

  const complianceTrendData = summary.compliance_trend.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    score: item.score,
  }))

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" /> Compliance Dashboard
          </h2>
          <Button onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance Score</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceScoreColor(summary.overall_compliance_score)}`}>
                {summary.overall_compliance_score.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.active_rules} active rules out of {summary.total_rules}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.open_issues}</div>
              <p className="text-xs text-muted-foreground">Total {summary.total_issues} issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.critical_issues}</div>
              <p className="text-xs text-muted-foreground">
                High: {summary.high_issues}, Medium: {summary.medium_issues}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Remediation Time</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.average_remediation_time_hours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">For resolved issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Trend & Issues by Severity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Score Trend</CardTitle>
              <CardDescription>Overall compliance score over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Compliance Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issues by Severity</CardTitle>
              <CardDescription>Distribution of open issues by severity level.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={issuesBySeverityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {issuesBySeverityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {issuesBySeverityChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues by Category & Data Source Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
              <CardDescription>Number of issues grouped by compliance category.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issuesByCategoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Number of Issues" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Source Compliance</CardTitle>
              <CardDescription>Compliance score and issues per data source.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.data_source_compliance.map((ds) => (
                <div key={ds.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{ds.name}</span>
                    </div>
                    <Badge variant="outline" className={getComplianceScoreColor(ds.score)}>
                      {ds.score.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={ds.score} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Issues: {ds.issues}</span>
                    <span>
                      {ds.score >= 90 ? (
                        <CheckCircle className="h-3 w-3 text-green-500 inline-block mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 inline-block mr-1" />
                      )}
                      {ds.score >= 90 ? "Compliant" : "Non-compliant"}
                    </span>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Compliance & Sensitive Data Exposure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Status</CardTitle>
              <CardDescription>Compliance status against key regulatory standards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.regulatory_compliance_status.map((reg) => (
                <div key={reg.standard} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reg.compliant ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{reg.standard}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.issues > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {reg.issues} Issues
                      </Badge>
                    )}
                    <Badge variant={reg.compliant ? "default" : "destructive"}>
                      {reg.compliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sensitive Data Exposure Risk</CardTitle>
              <CardDescription>Assessment of sensitive data exposure risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exposure Score</span>
                <span
                  className={`text-2xl font-bold ${getComplianceScoreColor(100 - summary.sensitive_data_exposure_score)}`}
                >
                  {summary.sensitive_data_exposure_score.toFixed(1)}
                </span>
              </div>
              <Progress value={100 - summary.sensitive_data_exposure_score} className="h-2" />
              <p className="text-xs text-muted-foreground">Lower score indicates lower risk.</p>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <span className={`text-2xl font-bold ${getComplianceScoreColor(100 - summary.risk_score)}`}>
                  {summary.risk_score.toFixed(1)}
                </span>
              </div>
              <Progress value={100 - summary.risk_score} className="h-2" />
              <p className="text-xs text-muted-foreground">Aggregated risk across all compliance areas.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
