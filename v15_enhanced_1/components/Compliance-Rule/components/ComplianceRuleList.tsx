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
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Info,
  MoreHorizontal,
} from "lucide-react"
import { useComplianceRules } from "../hooks/useComplianceRules"
import type { ComplianceRule } from "../types"
import { LoadingSpinner } from "../../Scan-Rule-Sets/components/LoadingSpinner"
import { ErrorBoundary } from "../../Scan-Rule-Sets/components/ErrorBoundary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"
import { formatDateTime } from "@/utils/formatDateTime"

interface ComplianceRuleListProps {
  onViewDetails: (rule: ComplianceRule) => void
  onEditRule: (rule: ComplianceRule) => void
  onDeleteRule: (rule: ComplianceRule) => void
  onCreateRule: () => void
  onValidateRule: (ruleId: number) => void
  onRefresh: () => void
}

export function ComplianceRuleList({
  onViewDetails,
  onEditRule,
  onDeleteRule,
  onCreateRule,
  onValidateRule,
  onRefresh,
}: ComplianceRuleListProps) {
  const { rules, isLoading, error, fetchRules, deleteRule, toggleRule, validateRule } = useComplianceRules()
  const { showNotification } = useNotifications()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof ComplianceRule>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<ComplianceRule | null>(null)
  const [validatingRuleId, setValidatingRuleId] = useState<number | null>(null)

  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules.filter(
      (rule) =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (filterCategory !== "all") {
      filtered = filtered.filter((rule) => rule.category === filterCategory)
    }
    if (filterSeverity !== "all") {
      filtered = filtered.filter((rule) => rule.severity === filterSeverity)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((rule) => rule.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      // Fallback for other types or mixed types, or if values are null/undefined
      return 0
    })
  }, [rules, searchTerm, filterCategory, filterSeverity, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof ComplianceRule) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleDeleteClick = (rule: ComplianceRule) => {
    setRuleToDelete(rule)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (ruleToDelete) {
      try {
        await deleteRule(ruleToDelete.id)
        onDeleteRule(ruleToDelete) // Notify parent component
        showNotification({
          type: "success",
          title: "Rule Deleted",
          message: `Compliance rule "${ruleToDelete.name}" has been deleted.`,
        })
      } catch (err) {
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to delete compliance rule.",
        })
      } finally {
        setRuleToDelete(null)
        setShowDeleteConfirm(false)
      }
    }
  }

  const handleToggleRule = async (rule: ComplianceRule) => {
    try {
      await toggleRule(rule.id)
    } catch (err) {
      // Error handled by useComplianceRules hook
    }
  }

  const handleValidateRule = async (rule: ComplianceRule) => {
    setValidatingRuleId(rule.id)
    try {
      await validateRule(rule.id)
    } catch (err) {
      // Error handled by useComplianceRules hook
    } finally {
      setValidatingRuleId(null)
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="text-center text-red-500 p-4">{error}</div>
        <Button onClick={fetchRules} className="mt-4">
          Retry
        </Button>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compliance Rules</h2>
          <Button onClick={onCreateRule}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Rule
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Data Protection">Data Protection</SelectItem>
              <SelectItem value="Access Control">Access Control</SelectItem>
              <SelectItem value="Data Quality">Data Quality</SelectItem>
              <SelectItem value="Regulatory Compliance">Regulatory Compliance</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Privacy">Privacy</SelectItem>
              <SelectItem value="Governance">Governance</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort("name")}>
                    Rule Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("category")}>
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("severity")}>
                    Severity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("pass_rate")}>
                    Pass Rate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Last Validated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRules.length > 0 ? (
                filteredAndSortedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSeverityIcon(rule.severity)}
                        {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <div className="text-sm">{rule.pass_rate.toFixed(1)}%</div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${rule.pass_rate}%` }} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(rule.last_validation)}</TableCell>
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
                          <DropdownMenuItem onClick={() => onViewDetails(rule)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditRule(rule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Rule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleRule(rule)}>
                            {rule.status === "active" ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleValidateRule(rule)}
                            disabled={validatingRuleId === rule.id}
                          >
                            {validatingRuleId === rule.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            {validatingRuleId === rule.id ? "Validating..." : "Run Validation"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(rule)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Rule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No compliance rules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the compliance rule "{ruleToDelete?.name}" and
              remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  )
}
