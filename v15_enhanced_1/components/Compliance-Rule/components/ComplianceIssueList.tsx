"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw,
  AlertTriangle,
  Info,
  Database,
  TableIcon,
  Columns,
  FileText,
  User,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import type { ComplianceIssue } from "../types"
import { LoadingSpinner } from "../../Scan-Rule-Sets/components/LoadingSpinner"
import { ErrorBoundary } from "../../Scan-Rule-Sets/components/ErrorBoundary"
import { formatDateTime } from "@/utils/formatDateTime"

interface ComplianceIssueListProps {
  issues: ComplianceIssue[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  onUpdateIssueStatus: (
    id: number,
    status: ComplianceIssue["status"],
    notes?: string,
  ) => Promise<ComplianceIssue | undefined>
  onAssignIssue: (id: number, assignee: string) => Promise<ComplianceIssue | undefined>
  onEscalateIssue: (id: number) => Promise<ComplianceIssue | undefined>
}

export function ComplianceIssueList({
  issues,
  isLoading,
  error,
  onRefresh,
  onUpdateIssueStatus,
  onAssignIssue,
  onEscalateIssue,
}: ComplianceIssueListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof ComplianceIssue>("detected_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter(
      (issue) =>
        issue.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.data_source_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterSeverity !== "all") {
      filtered = filtered.filter((issue) => issue.severity === filterSeverity)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((issue) => issue.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (sortBy === "detected_at" || sortBy === "resolved_at") {
        const dateA = aValue ? new Date(aValue as string).getTime() : 0
        const dateB = bValue ? new Date(bValue as string).getTime() : 0
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      // Fallback for other types or mixed types
      return 0
    })
  }, [issues, searchTerm, filterSeverity, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof ComplianceIssue) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
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

  const getStatusBadgeVariant = (status: ComplianceIssue["status"]) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in_progress":
        return "default"
      case "resolved":
      case "closed":
      case "false_positive":
        return "secondary"
      case "accepted_risk":
        return "outline"
      default:
        return "outline"
    }
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

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> Compliance Issues
          </h2>
          <Button onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Issues
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
              <SelectItem value="accepted_risk">Accepted Risk</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort("severity")}>
                    Severity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Rule Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("detected_at")}>
                    Detected At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedIssues.length > 0 ? (
                filteredAndSortedIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSeverityIcon(issue.severity)}
                        <span className={getSeverityColor(issue.severity)}>
                          {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{issue.rule_name}</TableCell>
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
                      <Badge variant={getStatusBadgeVariant(issue.status)}>
                        {issue.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                          issue.status.replace(/_/g, " ").slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(issue.detected_at)}</TableCell>
                    <TableCell>
                      {issue.assigned_to ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {issue.assigned_to.split("@")[0]}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => console.log("View issue details", issue.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onUpdateIssueStatus(issue.id, "in_progress")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateIssueStatus(issue.id, "resolved")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateIssueStatus(issue.id, "false_positive")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark False Positive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAssignIssue(issue.id, "current-user@example.com")}>
                            <User className="mr-2 h-4 w-4" />
                            Assign to Me
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEscalateIssue(issue.id)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Escalate Issue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No compliance issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ErrorBoundary>
  )
}
