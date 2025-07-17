"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceReportsQuery } from "@/hooks/useDataSources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Download, Plus, Eye, Calendar, BarChart3, PieChart, LineChart } from "lucide-react"

import { useReportsQuery } from "./services/apis"
import { DataSource } from "./types"

interface ReportsProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Report {
  id: string
  name: string
  type: "performance" | "security" | "compliance" | "usage" | "custom"
  status: "draft" | "generating" | "completed" | "failed"
  createdAt: string
  generatedAt?: string
  size: number
  format: "pdf" | "csv" | "json" | "tml"
  description?: string
}

export function DataSourceReports({
  dataSource,
  onNavigateToComponent,
  className = "" }: ReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [filterType, setFilterType] = useState("all")

  const { data: reportsData, isLoading, error, refetch } = useReportsQuery(dataSource.id)

  // Mock data
  const mockReports: Report[] = useMemo(() => ([
    {
      id: "1",
      name: "Monthly Performance Report",
      type: "performance",
      status: "completed",
      createdAt: "2024-01-01T10:00:00Z",
      generatedAt: "2024-01-30T10:00:00Z",
      size: 2048576, // 2MB
      format: "pdf"
    },
    {
      id: "2",
      name: "Security Audit Report",
      type: "security",
      status: "completed",
      createdAt: "2024-01-01T10:00:00Z",
      generatedAt: "2024-01-15T10:00:00Z",
      size: 1048576, // 1MB
      format: "pdf"
    },
    {
      id: "3",
      name: "Usage Analytics",
      type: "usage",
      status: "generating",
      createdAt: "2024-01-04T10:00:00Z",
      size: 0,
      format: "csv"
    }
  ]), [])

  useEffect(() => {
    setReports(mockReports)
  }, [mockReports])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance": return "text-blue-600 dark:text-blue-50"
      case "security": return "text-red-600 dark:text-red-50"
      case "compliance": return "text-green-600 dark:bg-green-50"
      case "usage": return "text-purple-600 dark:bg-purple-50"
      case "custom": return "text-gray-600 dark:bg-gray-50"
      default: return "text-gray-600 dark:bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 dark:bg-green-50"
      case "generating": return "text-yellow-600 dark:bg-yellow-50"
      case "failed": return "text-red-600 dark:text-red-50"
      case "draft": return "text-gray-600 dark:bg-gray-50"
      default: return "text-gray-600 dark:bg-gray-50"
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = filterType === "all" || report.type === filterType
      return matchesType
    })
  }, [reports, filterType])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 text-blue-600" />
            Reports
          </h2>
          <p className="text-muted-foreground">
            Generate and manage reports for {dataSource.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateReport(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Generating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === "generating").length}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(reports.reduce((sum, r) => sum + r.size, 0))}</div>
            <p className="text-xs text-muted-foreground mt-1">All reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            View and manage generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="usage">Usage</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{report.name}</h3>
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.generatedAt && (
                        <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                      )}
                      <span>Size: {formatFileSize(report.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {report.status === "completed" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a new report for this data source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input id="report-name" placeholder="Enter report name" />
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <select id="report-type" className="w-full px-3 py-2 border rounded-md">
                <option value="performance">Performance Report</option>
                <option value="security">Security Report</option>
                <option value="compliance">Compliance Report</option>
                <option value="usage">Usage Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
            <div>
              <Label htmlFor="report-format">Format</Label>
              <select id="report-format" className="w-full px-3 py-2 border rounded-md">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Input id="report-description" placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateReport(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateReport(false)}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected report
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label>Report Name</Label>
                <p className="text-sm">{selectedReport.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm capitalize">{selectedReport.status}</p>
                </div>
                <div>
                  <Label>Format</Label>
                  <p className="text-sm uppercase">{selectedReport.format}</p>
                </div>
                <div>
                  <Label>Size</Label>
                  <p className="text-sm">{formatFileSize(selectedReport.size)}</p>
                </div>
              </div>
              <div>
                <Label>Created</Label>
                <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
              {selectedReport.generatedAt && (
                <div>
                  <Label>Generated</Label>
                  <p className="text-sm">{new Date(selectedReport.generatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            {selectedReport?.status === "completed" && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}