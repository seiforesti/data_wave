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
  Shield,
  Target,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useEnterpriseComplianceFeatures } from "../hooks/use-enterprise-compliance"
import type { ComplianceRequirement } from "../services/enhanced-compliance-apis"
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
  requirements: ComplianceRequirement[]
  onView: (requirement: ComplianceRequirement) => void
  onEdit: (requirement: ComplianceRequirement) => void
  onDelete: (requirement: ComplianceRequirement) => void
  onCreateRule: () => void
  onValidateRule: (ruleId: number) => void
  onRefresh: () => void
}

export function ComplianceRuleList({
  requirements,
  onView,
  onEdit,
  onDelete,
  onCreateRule,
  onValidateRule,
  onRefresh,
}: ComplianceRuleListProps) {
  const enterprise = useEnterpriseComplianceFeatures({
    componentName: 'compliance-rule-list'
  })
  const { showNotification } = useNotifications()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof ComplianceRequirement>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<ComplianceRequirement | null>(null)
  const [validatingRequirementId, setValidatingRequirementId] = useState<number | null>(null)

  const filteredAndSortedRequirements = useMemo(() => {
    let filtered = requirements.filter(
      (requirement) =>
        requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        requirement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        requirement.framework.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterCategory !== "all") {
      filtered = filtered.filter((requirement) => requirement.category === filterCategory)
    }

    if (filterSeverity !== "all") {
      filtered = filtered.filter((requirement) => requirement.risk_level === filterSeverity)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((requirement) => requirement.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [requirements, searchTerm, filterCategory, filterSeverity, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof ComplianceRequirement) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleDeleteClick = (requirement: ComplianceRequirement) => {
    setRequirementToDelete(requirement)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (requirementToDelete) {
      try {
        await onDelete(requirementToDelete)
        showNotification("Compliance requirement deleted successfully", "success")
        setShowDeleteConfirm(false)
        setRequirementToDelete(null)
        onRefresh()
      } catch (error) {
        showNotification("Failed to delete compliance requirement", "error")
      }
    }
  }

  const handleValidate = async (requirementId: number) => {
    setValidatingRequirementId(requirementId)
    try {
      await onValidateRule(requirementId)
      showNotification("Compliance requirement validated successfully", "success")
    } catch (error) {
      showNotification("Failed to validate compliance requirement", "error")
    } finally {
      setValidatingRequirementId(null)
    }
  }

  const getStatusBadge = (status: ComplianceRequirement['status']) => {
    const variants = {
      compliant: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      non_compliant: { color: "bg-red-100 text-red-800", icon: XCircle },
      partially_compliant: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      not_assessed: { color: "bg-gray-100 text-gray-800", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800", icon: RefreshCw }
    }
    const variant = variants[status]
    const Icon = variant.icon
    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getRiskBadge = (riskLevel: ComplianceRequirement['risk_level']) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return (
      <Badge className={variants[riskLevel]}>
        {riskLevel.toUpperCase()}
      </Badge>
    )
  }

  if (enterprise.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Access Control">Access Control</SelectItem>
                <SelectItem value="Data Protection">Data Protection</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Encryption">Encryption</SelectItem>
                <SelectItem value="Audit">Audit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
                <SelectItem value="not_assessed">Not Assessed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={onCreateRule}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("framework")}>
                  <div className="flex items-center">
                    Framework
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Last Assessed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRequirements.map((requirement) => (
                <TableRow key={requirement.id}>
                  <TableCell>
                    <Badge variant="outline">{requirement.framework.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{requirement.title}</div>
                      <div className="text-sm text-muted-foreground">{requirement.requirement_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{requirement.category}</TableCell>
                  <TableCell>{getStatusBadge(requirement.status)}</TableCell>
                  <TableCell>{getRiskBadge(requirement.risk_level)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">{requirement.compliance_percentage}%</div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${requirement.compliance_percentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {requirement.last_assessed ? formatDateTime(requirement.last_assessed) : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(requirement)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(requirement)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleValidate(requirement.id)}>
                          <Shield className="mr-2 h-4 w-4" />
                          {validatingRequirementId === requirement.id ? "Validating..." : "Validate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(requirement)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedRequirements.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No requirements found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || filterCategory !== "all" || filterSeverity !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating a new compliance requirement"}
            </p>
            {!searchTerm && filterCategory === "all" && filterSeverity === "all" && filterStatus === "all" && (
              <Button className="mt-4" onClick={onCreateRule}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the compliance requirement
                "{requirementToDelete?.title}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  )
}
