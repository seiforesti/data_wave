"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText, Download, Calendar, Clock, CheckCircle, AlertCircle,
  RefreshCw, PlusCircle, Eye, Edit, Trash2, Filter, Search
} from "lucide-react"

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import { PermissionProvider, PermissionGuard } from '@/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/components/shared/PermissionGuard'
import { PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_MANAGE } from '@/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/constants/permissions.constants'
import type { 
  ComplianceReport, 
  ComplianceComponentProps 
} from '../types'

interface ComplianceReportsProps extends ComplianceComponentProps {
  onCreateReport?: () => void
  onEditReport?: (report: ComplianceReport) => void
  onViewReport?: (report: ComplianceReport) => void
  onDeleteReport?: (report: ComplianceReport) => void
}

const ComplianceReports: React.FC<ComplianceReportsProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  onCreateReport,
  onEditReport,
  onViewReport,
  onDeleteReport
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceReports',
    dataSourceId
  })
  
  const auditFeatures = ComplianceHooks.useAuditFeatures('compliance_report')
  
  // State
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [activeTab, setActiveTab] = useState('all')

  // Replaced mock with backend API integration via ComplianceAPIs.Audit.getComplianceReports
  const mockReports: ComplianceReport[] = [] // legacy placeholder not used; will be removed after verification

  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      try {
        const response = await ComplianceAPIs.Audit.getComplianceReports({
          data_source_id: dataSourceId,
          framework: filters.framework,
          report_type: filters.report_type,
          status: filters.status,
          page: 1,
          limit: 100
        })
        setReports(response.data || [])
      } catch (error) {
        console.error('Failed to load reports:', error)
        onError?.('Failed to load compliance reports')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [dataSourceId])

  // Filter reports based on active tab and search
  const filteredReports = reports.filter(report => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'completed' && report.status !== 'completed') return false
      if (activeTab === 'scheduled' && report.status !== 'scheduled') return false
      if (activeTab === 'generating' && report.status !== 'generating') return false
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        report.name.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.report_type.toLowerCase().includes(searchLower) ||
        (report.framework && report.framework.toLowerCase().includes(searchLower))
      )
    }

    return true
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'generating':
        return 'secondary'
      case 'scheduled':
        return 'outline'
      case 'failed':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'generating':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Handle download
  const handleDownload = async (report: ComplianceReport) => {
    if (!report.file_url) return

    try {
      const blob = await ComplianceAPIs.Audit.downloadReport(report.id as number)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.name}.${report.file_format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      enterprise.sendNotification('success', 'Report downloaded successfully')
    } catch (error) {
      console.error('Failed to download report:', error)
      enterprise.sendNotification('error', 'Failed to download report')
    }
  }

  // Handle regenerate
  const handleRegenerate = async (report: ComplianceReport) => {
    try {
      await ComplianceAPIs.Audit.generateReport(report.id as number, { force_regenerate: true })
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: 'generating' } : r
      ))
      enterprise.sendNotification('success', 'Report regeneration started')
    } catch (error) {
      console.error('Failed to regenerate report:', error)
      enterprise.sendNotification('error', 'Failed to regenerate report')
    }
  }

  return (
    <PermissionProvider>
      <PermissionGuard permission={PERMISSION_COMPLIANCE_VIEW}>
        <div className={`space-y-6 ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage compliance reports and documentation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <PermissionGuard permission={PERMISSION_COMPLIANCE_MANAGE} fallback={null} showUnauthorized={false}>
            <Button size="sm" onClick={onCreateReport}>
              <PlusCircle className="h-4 w-4 mr-1" />
              New Report
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.report_type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, report_type: value || undefined }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="compliance_status">Compliance Status</SelectItem>
              <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
              <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
              <SelectItem value="audit_trail">Audit Trail</SelectItem>
              <SelectItem value="executive_summary">Executive Summary</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.framework || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, framework: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Frameworks</SelectItem>
              <SelectItem value="SOC 2">SOC 2</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="PCI DSS">PCI DSS</SelectItem>
              <SelectItem value="ISO 27001">ISO 27001</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="generating">Generating</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first report'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateReport}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2">
                            {report.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {report.description}
                          </CardDescription>
                        </div>
                        <div className="ml-2">
                          {getStatusIcon(report.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Status and Type */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(report.status)}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.report_type.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Framework */}
                        {report.framework && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>Framework: {report.framework}</span>
                          </div>
                        )}

                        {/* Schedule info */}
                        {report.schedule && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{report.schedule.frequency}</span>
                          </div>
                        )}

                        {/* Generated date */}
                        {report.generated_at && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(report.generated_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewReport?.(report)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditReport?.(report)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {report.status === 'completed' && report.file_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(report)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {report.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRegenerate(report)
                                }}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Regenerate
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteReport?.(report)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
        </div>
      </PermissionGuard>
    </PermissionProvider>
  )
}

export default ComplianceReports
