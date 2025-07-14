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
import { ArrowUpDown, PlusCircle, Edit, Trash2, Play, Pause, RefreshCw, Zap, MoreHorizontal } from "lucide-react"
import { useWorkflows } from "../hooks/useWorkflows"
import type { ComplianceWorkflow } from "../types"
import { LoadingSpinner } from "../../Scan-Rule-Sets/components/LoadingSpinner"
import { ErrorBoundary } from "../../Scan-Rule-Sets/components/ErrorBoundary"
import { formatDateTime } from "@/utils/formatDateTime"
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
import { WorkflowCreateModal } from "./WorkflowCreateModal"
import { WorkflowEditModal } from "./WorkflowEditModal"

type ComplianceWorkflowsProps = {}

export function ComplianceWorkflows() {
  const {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    deleteWorkflow,
    executeWorkflow,
    toggleWorkflowStatus,
    createWorkflow,
    updateWorkflow,
  } = useWorkflows()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrigger, setFilterTrigger] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof ComplianceWorkflow>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [executingWorkflowId, setExecutingWorkflowId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<ComplianceWorkflow | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<ComplianceWorkflow | null>(null)

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows.filter(
      (workflow) =>
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterTrigger !== "all") {
      filtered = filtered.filter((workflow) => workflow.trigger === filterTrigger)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((workflow) => workflow.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (sortBy === "created_at" || sortBy === "last_run_at") {
        const dateA = aValue ? new Date(aValue as string).getTime() : 0
        const dateB = bValue ? new Date(bValue as string).getTime() : 0
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      // Fallback for other types or mixed types
      return 0
    })
  }, [workflows, searchTerm, filterTrigger, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof ComplianceWorkflow) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleCreateWorkflowSuccess = async (
    newWorkflowData: Omit<
      ComplianceWorkflow,
      "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
    >,
  ) => {
    await createWorkflow(newWorkflowData)
    setIsCreateModalOpen(false)
  }

  const handleEditWorkflowClick = (workflow: ComplianceWorkflow) => {
    setEditingWorkflow(workflow)
    setIsEditModalOpen(true)
  }

  const handleEditWorkflowSuccess = async (updatedWorkflow: ComplianceWorkflow) => {
    await updateWorkflow(updatedWorkflow.id, updatedWorkflow)
    setIsEditModalOpen(false)
    setEditingWorkflow(null)
  }

  const handleExecuteWorkflowClick = async (workflow: ComplianceWorkflow) => {
    setExecutingWorkflowId(workflow.id)
    try {
      await executeWorkflow(workflow.id)
    } finally {
      setExecutingWorkflowId(null)
    }
  }

  const handleToggleStatus = async (workflow: ComplianceWorkflow) => {
    try {
      await toggleWorkflowStatus(workflow.id)
    } catch (err) {
      // Error handled by useWorkflows hook
    }
  }

  const handleDeleteClick = (workflow: ComplianceWorkflow) => {
    setWorkflowToDelete(workflow)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (workflowToDelete) {
      try {
        await deleteWorkflow(workflowToDelete.id)
      } finally {
        setWorkflowToDelete(null)
        setShowDeleteConfirm(false)
      }
    }
  }

  const getStatusBadgeVariant = (status: ComplianceWorkflow["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getLastRunStatusBadgeVariant = (status: ComplianceWorkflow["last_run_status"]) => {
    switch (status) {
      case "success":
        return "default"
      case "failed":
        return "destructive"
      case "running":
        return "default" // Or a specific variant for running
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
        <Button onClick={fetchWorkflows} className="mt-4">
          Retry
        </Button>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compliance Workflows</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Workflow
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterTrigger} onValueChange={setFilterTrigger}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              <SelectItem value="rule_violation">Rule Violation</SelectItem>
              <SelectItem value="issue_status_change">Issue Status Change</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
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
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort("name")}>
                    Workflow Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Last Run Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedWorkflows.length > 0 ? (
                filteredAndSortedWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell className="capitalize">{workflow.trigger.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(workflow.status)}>
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{workflow.last_run_at ? formatDateTime(workflow.last_run_at) : "Never"}</TableCell>
                    <TableCell>
                      {workflow.last_run_status ? (
                        <Badge variant={getLastRunStatusBadgeVariant(workflow.last_run_status)}>
                          {workflow.last_run_status.replace(/_/g, " ").charAt(0).toUpperCase() +
                            workflow.last_run_status.replace(/_/g, " ").slice(1)}
                        </Badge>
                      ) : (
                        "N/A"
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
                          <DropdownMenuItem onClick={() => handleEditWorkflowClick(workflow)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Workflow
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExecuteWorkflowClick(workflow)}
                            disabled={executingWorkflowId === workflow.id || workflow.status === "inactive"}
                          >
                            {executingWorkflowId === workflow.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="mr-2 h-4 w-4" />
                            )}
                            {executingWorkflowId === workflow.id ? "Executing..." : "Run Now"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                            {workflow.status === "active" ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(workflow)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Workflow
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No compliance workflows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <WorkflowCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateWorkflowSuccess}
      />

      {editingWorkflow && (
        <WorkflowEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingWorkflow(null)
          }}
          workflow={editingWorkflow}
          onSuccess={handleEditWorkflowSuccess}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow "{workflowToDelete?.name}" and
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
