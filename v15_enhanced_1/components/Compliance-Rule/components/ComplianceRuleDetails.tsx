"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  TableIcon,
  Columns,
  FileText,
  ExternalLink,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"
import type { ComplianceRule, ComplianceIssue } from "../types"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ComplianceRuleDetailsProps {
  rule: ComplianceRule
  onBack: () => void
  onEdit: (rule: ComplianceRule) => void
  onDelete: (rule: ComplianceRule) => void
}

const mockIssues: ComplianceIssue[] = [
  {
    id: 1,
    rule_id: 1,
    rule_name: "PII Detection Rule",
    data_source_id: 1,
    data_source_name: "Customer Database",
    entity_type: "column",
    entity_name: "email_address",
    schema_name: "public",
    table_name: "customers",
    description: "Email addresses detected without proper encryption",
    severity: "critical",
    status: "open",
    detected_at: "2024-01-20T10:30:00Z",
    business_impact: "High risk of GDPR violation",
    estimated_cost: 50000,
    remediation_effort: "medium",
    external_ticket_id: "COMP-123",
    external_system: "jira",
    sla_deadline: "2024-01-22T10:30:00Z",
    escalated: false,
    escalation_level: 0,
    workflow_status: {
      stage: "triage",
      progress: 25,
      next_action: "Assign to security team",
      due_date: "2024-01-21T10:30:00Z",
      automation_enabled: true,
    },
  },
]

const mockValidationResults = {
  rule_id: 1,
  validation_timestamp: "2024-01-20T08:00:00Z",
  pass_rate: 85.5,
  total_entities: 1250,
  passing_entities: 1069,
  data_source_results: [
    {
      data_source_id: 1,
      data_source_name: "Customer Database",
      pass_rate: 82.3,
      total_entities: 650,
      passing_entities: 535,
      entity_type_breakdown: {
        column: { total: 450, passing: 380 },
        table: { total: 200, passing: 155 },
      },
    },
    {
      data_source_id: 2,
      data_source_name: "Analytics Warehouse",
      pass_rate: 89.1,
      total_entities: 600,
      passing_entities: 534,
      entity_type_breakdown: {
        column: { total: 400, passing: 356 },
        table: { total: 200, passing: 178 },
      },
    },
  ],
  sample_violations: [
    {
      entity_type: "column",
      entity_name: "customer_email",
      schema_name: "public",
      table_name: "customers",
      data_source_id: 1,
      reason: "Email format validation failed",
    },
  ],
}

const mockTrendData = [
  { date: "2024-01-01", pass_rate: 78.2, violations: 45 },
  { date: "2024-01-08", pass_rate: 81.5, violations: 38 },
  { date: "2024-01-15", pass_rate: 85.5, violations: 32 },
  { date: "2024-01-22", pass_rate: 87.1, violations: 28 },
]

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"]

export function ComplianceRuleDetails({ rule, onBack, onEdit, onDelete }: ComplianceRuleDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isValidating, setIsValidating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [validationResults, setValidationResults] = useState(mockValidationResults)
  const [issues] = useState(mockIssues)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

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

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "database":
        return <Database className="h-4 w-4" />
      case "schema":
        return <FileText className="h-4 w-4" />
      case "table":
        return <TableIcon className="h-4 w-4" />
      case "column":
        return <Columns className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleValidate = async () => {
    setIsValidating(true)
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsValidating(false)
  }

  const handleDelete = () => {
    setShowDeleteDialog(false)
    onDelete(rule)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  }

  const issuesBySeverity = [
    { name: "Critical", value: issues.filter((i) => i.severity === "critical").length, color: "#ef4444" },
    { name: "High", value: issues.filter((i) => i.severity === "high").length, color: "#f97316" },
    { name: "Medium", value: issues.filter((i) => i.severity === "medium").length, color: "#eab308" },
    { name: "Low", value: issues.filter((i) => i.severity === "low").length, color: "#22c55e" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{rule.name}</h1>
            <p className="text-muted-foreground">{rule.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={isValidating}>
            {isValidating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isValidating ? "Validating..." : "Validate Rule"}
          </Button>
          <Button variant="outline" onClick={() => onEdit(rule)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Rule Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">{rule.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getSeverityIcon(rule.severity)}
                  {rule.severity}
                </Badge>
                <Badge variant="secondary">{rule.category}</Badge>
                <Badge variant="outline">{rule.compliance_standard}</Badge>
                <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                {rule.is_global && <Badge variant="outline">Global</Badge>}
                {rule.regulatory_requirement && <Badge variant="destructive">Regulatory</Badge>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                <span className={getComplianceScoreColor(rule.pass_rate)}>{rule.pass_rate.toFixed(1)}%</span>
              </div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
              <Progress value={rule.pass_rate} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues" className="relative">
            Issues
            {issues.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {issues.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="definition">Definition</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rule Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rule Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pass Rate</span>
                  <span className={`font-semibold ${getComplianceScoreColor(rule.pass_rate)}`}>
                    {rule.pass_rate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={rule.pass_rate} />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Entities</span>
                  <span className="font-semibold">{rule.total_entities.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Passing</span>
                  <span className="font-semibold text-green-600">{rule.passing_entities.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Failing</span>
                  <span className="font-semibold text-red-600">{rule.failing_entities.toLocaleString()}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{formatDate(rule.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{formatDate(rule.updated_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Validation</span>
                    <span className="text-sm">{formatDate(rule.last_validation)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rule Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getEntityIcon(rule.applies_to)}
                    <span className="text-sm">
                      Applies to <strong>{rule.applies_to}s</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Validates <strong>{rule.validation_frequency}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rule.auto_remediation ? (
                      <Zap className="h-4 w-4 text-green-500" />
                    ) : (
                      <Zap className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Auto-remediation {rule.auto_remediation ? "enabled" : "disabled"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">
                      Business impact: <strong>{rule.business_impact}</strong>
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {rule.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issues Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={issuesBySeverity}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={50}
                            dataKey="value"
                          >
                            {issuesBySeverity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {issuesBySeverity.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No issues found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Remediation and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Remediation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {rule.remediation_steps ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{rule.remediation_steps}</pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No remediation steps provided.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reference & Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Created by</div>
                  <div className="text-sm">{rule.created_by}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Last updated by</div>
                  <div className="text-sm">{rule.updated_by}</div>
                </div>

                {rule.reference_link && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Reference Link</div>
                    <Button variant="outline" size="sm" onClick={() => window.open(rule.reference_link, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Issues</CardTitle>
              <CardDescription>Issues detected by this compliance rule</CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Data Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(issue.severity)}
                            <span className={getSeverityColor(issue.severity)}>{issue.severity}</span>
                          </div>
                        </TableCell>
                        <TableCell>{issue.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEntityIcon(issue.entity_type)}
                            <div>
                              <div className="font-medium">{issue.entity_name}</div>
                              {issue.schema_name && issue.table_name && (
                                <div className="text-xs text-muted-foreground">
                                  {issue.schema_name}.{issue.table_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{issue.data_source_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              issue.status === "open"
                                ? "destructive"
                                : issue.status === "in_progress"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {issue.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(issue.detected_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No issues found for this rule</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="definition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rule Definition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Rule Type</div>
                  <Badge variant="outline">{rule.rule_type}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Definition</div>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm font-mono">{rule.rule_definition}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Applies To</div>
                  <div className="flex items-center gap-2">
                    {getEntityIcon(rule.applies_to)}
                    <span className="capitalize">{rule.applies_to}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Scope Type</div>
                  <Badge variant={rule.is_global ? "default" : "secondary"}>
                    {rule.is_global ? "Global" : "Data Source Specific"}
                  </Badge>
                </div>

                {!rule.is_global && rule.data_source_ids.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Applied to Data Sources</div>
                    <div className="space-y-1">
                      {rule.data_source_ids.map((id) => (
                        <Badge key={id} variant="outline">
                          Data Source {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Validation Frequency</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{rule.validation_frequency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Results</CardTitle>
              <CardDescription>Latest validation results for this rule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    <span className={getComplianceScoreColor(validationResults.pass_rate)}>
                      {validationResults.pass_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                  <Progress value={validationResults.pass_rate} className="mt-2" />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">{validationResults.total_entities.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Entities</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.passing_entities.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Passing</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {(validationResults.total_entities - validationResults.passing_entities).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Failing</div>
                </div>
              </div>

              <Separator />

              {/* Data Source Results */}
              <div className="space-y-4">
                <h4 className="font-medium">Results by Data Source</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validationResults.data_source_results.map((result) => (
                    <Card key={result.data_source_id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{result.data_source_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Pass Rate</span>
                          <span className={`font-semibold ${getComplianceScoreColor(result.pass_rate)}`}>
                            {result.pass_rate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={result.pass_rate} />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Entities</span>
                          <span className="text-sm">
                            {result.passing_entities} / {result.total_entities}
                          </span>
                        </div>

                        {result.entity_type_breakdown && (
                          <div className="space-y-1">
                            {Object.entries(result.entity_type_breakdown).map(([type, breakdown]) => (
                              <div key={type} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground capitalize">{type}s</span>
                                <span>
                                  {breakdown.passing} / {breakdown.total}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sample Violations */}
              {validationResults.sample_violations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Sample Violations</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.sample_violations.map((violation, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEntityIcon(violation.entity_type)}
                              {violation.entity_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {violation.schema_name && violation.table_name
                              ? `${violation.schema_name}.${violation.table_name}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{violation.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Trend</CardTitle>
              <CardDescription>Historical compliance performance for this rule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MMM d")} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                      formatter={(value, name) => [
                        name === "pass_rate" ? `${value}%` : value,
                        name === "pass_rate" ? "Pass Rate" : "Violations",
                      ]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pass_rate"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="pass_rate"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="violations"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="violations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Pass Rate</span>
                  <span className="font-semibold">
                    {(mockTrendData.reduce((sum, d) => sum + d.pass_rate, 0) / mockTrendData.length).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trend</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-semibold">Improving</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Violations</span>
                  <span className="font-semibold">{mockTrendData.reduce((sum, d) => sum + d.violations, 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-remediation</span>
                  <Badge variant={rule.auto_remediation ? "default" : "secondary"}>
                    {rule.auto_remediation ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Validation Frequency</span>
                  <Badge variant="outline">{rule.validation_frequency}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Escalation Rules</span>
                  <Badge variant="outline">{rule.escalation_rules.length} configured</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Impact Level</span>
                  <Badge variant={rule.business_impact === "critical" ? "destructive" : "outline"}>
                    {rule.business_impact}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Regulatory</span>
                  <Badge variant={rule.regulatory_requirement ? "destructive" : "secondary"}>
                    {rule.regulatory_requirement ? "Required" : "Optional"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance Standard</span>
                  <Badge variant="outline">{rule.compliance_standard}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Compliance Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{rule.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
