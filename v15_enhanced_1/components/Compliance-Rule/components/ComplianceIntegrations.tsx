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
  PlusCircle,
  Edit,
  Trash2,
  ToggleRight,
  ToggleLeft,
  RefreshCw,
  MoreHorizontal,
  Plug,
  Mail,
  Webhook,
} from "lucide-react"
import { useIntegrations } from "../hooks/useIntegrations"
import type { IntegrationConfig } from "../types"
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
import { IntegrationCreateModal } from "./IntegrationCreateModal"
import { IntegrationEditModal } from "./IntegrationEditModal"

type ComplianceIntegrationsProps = {}

export function ComplianceIntegrations() {
  const {
    integrations,
    isLoading,
    error,
    fetchIntegrations,
    deleteIntegration,
    testIntegration,
    toggleIntegrationStatus,
    createIntegration,
    updateIntegration,
  } = useIntegrations()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof IntegrationConfig>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [testingIntegrationId, setTestingIntegrationId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [integrationToDelete, setIntegrationToDelete] = useState<IntegrationConfig | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | null>(null)

  const filteredAndSortedIntegrations = useMemo(() => {
    let filtered = integrations.filter(
      (integration) =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterType !== "all") {
      filtered = filtered.filter((integration) => integration.type === filterType)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((integration) => integration.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (sortBy === "created_at" || sortBy === "last_synced_at") {
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
  }, [integrations, searchTerm, filterType, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof IntegrationConfig) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleCreateIntegrationSuccess = async (
    newIntegrationData: Omit<
      IntegrationConfig,
      "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
    >,
  ) => {
    await createIntegration(newIntegrationData)
    setIsCreateModalOpen(false)
  }

  const handleEditIntegrationClick = (integration: IntegrationConfig) => {
    setEditingIntegration(integration)
    setIsEditModalOpen(true)
  }

  const handleEditIntegrationSuccess = async (updatedIntegration: IntegrationConfig) => {
    await updateIntegration(updatedIntegration.id, updatedIntegration)
    setIsEditModalOpen(false)
    setEditingIntegration(null)
  }

  const handleTestIntegrationClick = async (integration: IntegrationConfig) => {
    setTestingIntegrationId(integration.id)
    try {
      await testIntegration(integration.id)
    } finally {
      setTestingIntegrationId(null)
    }
  }

  const handleToggleStatus = async (integration: IntegrationConfig) => {
    try {
      await toggleIntegrationStatus(integration.id)
    } catch (err) {
      // Error handled by useIntegrations hook
    }
  }

  const handleDeleteClick = (integration: IntegrationConfig) => {
    setIntegrationToDelete(integration)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (integrationToDelete) {
      try {
        await deleteIntegration(integrationToDelete.id)
      } finally {
        setIntegrationToDelete(null)
        setShowDeleteConfirm(false)
      }
    }
  }

  const getStatusBadgeVariant = (status: IntegrationConfig["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSystemIcon = (system: string) => {
    switch (system) {
      case "jira":
        return <img src="/placeholder.svg?height=16&width=16" alt="Jira" className="h-4 w-4" />
      case "servicenow":
        return <img src="/placeholder.svg?height=16&width=16" alt="ServiceNow" className="h-4 w-4" />
      case "slack":
        return <img src="/placeholder.svg?height=16&width=16" alt="Slack" className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "custom_webhook":
        return <Webhook className="h-4 w-4" />
      default:
        return <Plug className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="text-center text-red-500 p-4">{error}</div>
        <Button onClick={fetchIntegrations} className="mt-4">
          Retry
        </Button>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">External Integrations</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Integration
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="jira">Jira</SelectItem>
              <SelectItem value="servicenow">ServiceNow</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="custom_webhook">Custom Webhook</SelectItem>
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
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort("name")}>
                    Integration Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedIntegrations.length > 0 ? (
                filteredAndSortedIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getSystemIcon(integration.type)}
                        {integration.name}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{integration.type.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(integration.status)}>
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </Badge>
                      {integration.status === "error" && integration.error_message && (
                        <div className="text-xs text-red-500 mt-1">{integration.error_message}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {integration.last_synced_at ? formatDateTime(integration.last_synced_at) : "Never"}
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
                          <DropdownMenuItem onClick={() => handleEditIntegrationClick(integration)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Configuration
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTestIntegrationClick(integration)}
                            disabled={testingIntegrationId === integration.id}
                          >
                            {testingIntegrationId === integration.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plug className="mr-2 h-4 w-4" />
                            )}
                            {testingIntegrationId === integration.id ? "Testing..." : "Test Connection"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(integration)}>
                            {integration.status === "active" ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(integration)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Integration
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No external integrations configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <IntegrationCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateIntegrationSuccess}
      />

      {editingIntegration && (
        <IntegrationEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingIntegration(null)
          }}
          integration={editingIntegration}
          onSuccess={handleEditIntegrationSuccess}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the integration "{integrationToDelete?.name}"
              and remove its data from our servers.
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
