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
  Download,
  Share2,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { useReports } from "../hooks/useReports"
import type { ComplianceReport } from "../types"
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
import { ReportCreateModal } from "./ReportCreateModal"
import { ReportEditModal } from "./ReportEditModal"

type ComplianceReportsProps = {}

export function ComplianceReports() {
  const { reports, isLoading, error, fetchReports, deleteReport, generateReport, createReport, updateReport } =
    useReports()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState<keyof ComplianceReport>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<ComplianceReport | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<ComplianceReport | null>(null)

  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter(
      (report) =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterType !== "all") {
      filtered = filtered.filter((report) => report.type === filterType)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((report) => report.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (sortBy === "created_at" || sortBy === "last_generated_at") {
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
  }, [reports, searchTerm, filterType, filterStatus, sortBy, sortDirection])

  const handleSort = (column: keyof ComplianceReport) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleCreateReportSuccess = async (
    newReportData: Omit<
      ComplianceReport,
      "id" | "created_at" | "status" | "generated_by" | "updated_at" | "updated_by" | "last_generated_at" | "file_url"
    >,
  ) => {
    await createReport(newReportData)
    setIsCreateModalOpen(false)
  }

  const handleEditReportClick = (report: ComplianceReport) => {
    setEditingReport(report)
    setIsEditModalOpen(true)
  }

  const handleEditReportSuccess = async (updatedReport: ComplianceReport) => {
    await updateReport(updatedReport.id, updatedReport)
    setIsEditModalOpen(false)
    setEditingReport(null)
  }

  const handleGenerateReportClick = async (report: ComplianceReport) => {
    setGeneratingReportId(report.id)
    try {
      await generateReport(report.id)
    } finally {
      setGeneratingReportId(null)
    }
  }

  const handleDeleteClick = (report: ComplianceReport) => {
    setReportToDelete(report)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (reportToDelete) {
      try {
        await deleteReport(reportToDelete.id)
      } finally {
        setReportToDelete(null)
        setShowDeleteConfirm(false)
      }
    }
  }

  const getStatusBadgeVariant = (status: ComplianceReport["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
      case "generating":
        return "secondary"
      case "failed":
        return "destructive"
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
        <Button onClick={fetchReports} className="mt-4">
          Retry
        </Button>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compliance Reports</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Report
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search reports..."
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
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detail">Detail</SelectItem>
              <SelectItem value="trend">Trend</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort("name")}>
                    Report Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedReports.length > 0 ? (
                filteredAndSortedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell className="capitalize">{report.type}</TableCell>
                    <TableCell className="uppercase">{report.format}</TableCell>
                    <TableCell className="capitalize">{report.schedule || "On-demand"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.last_generated_at ? formatDateTime(report.last_generated_at) : "N/A"}</TableCell>
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
                          {report.file_url && report.status === "completed" && (
                            <DropdownMenuItem onClick={() => window.open(report.file_url, "_blank")}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleGenerateReportClick(report)}
                            disabled={generatingReportId === report.id || report.status === "generating"}
                          >
                            {generatingReportId === report.id || report.status === "generating" ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            {generatingReportId === report.id || report.status === "generating"
                              ? "Generating..."
                              : "Generate Now"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Share report", report.id)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditReportClick(report)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Report
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(report)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No compliance reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReportCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateReportSuccess}
      />

      {editingReport && (
        <ReportEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingReport(null)
          }}
          report={editingReport}
          onSuccess={handleEditReportSuccess}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report "{reportToDelete?.name}" and remove
              its data from our servers.
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
