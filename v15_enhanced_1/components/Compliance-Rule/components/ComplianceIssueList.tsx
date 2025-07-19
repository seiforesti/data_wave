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
  AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, PlusCircle, 
  Eye, Edit, Trash2, Search, Filter, User, Calendar
} from "lucide-react"

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { 
  ComplianceGap, 
  ComplianceComponentProps 
} from '../types'

interface ComplianceIssueListProps extends ComplianceComponentProps {
  onCreateIssue?: () => void
  onEditIssue?: (issue: ComplianceGap) => void
  onViewIssue?: (issue: ComplianceGap) => void
  onDeleteIssue?: (issue: ComplianceGap) => void
}

const ComplianceIssueList: React.FC<ComplianceIssueListProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  onCreateIssue,
  onEditIssue,
  onViewIssue,
  onDeleteIssue
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceIssueList',
    dataSourceId
  })
  
  // State
  const [issues, setIssues] = useState<ComplianceGap[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [activeTab, setActiveTab] = useState('all')

  // Mock data for clean output
  const mockIssues: ComplianceGap[] = [
    {
      id: 1,
      data_source_id: dataSourceId || 1,
      requirement_id: 1,
      gap_title: 'Missing Access Control Documentation',
      gap_description: 'No formal documentation exists for access control procedures and policies',
      current_state: 'Informal access control processes in place',
      desired_state: 'Formal documented access control policies and procedures',
      gap_analysis: 'Gap exists due to lack of formal documentation and standardized procedures',
      severity: 'high',
      status: 'open',
      remediation_plan: 'Create comprehensive access control documentation including policies, procedures, and role definitions',
      remediation_steps: [
        {
          id: 'step-1',
          step_number: 1,
          title: 'Document Current Processes',
          description: 'Document existing access control processes and identify gaps',
          status: 'completed',
          assigned_to: 'security-team',
          estimated_effort: '2 weeks',
          due_date: '2024-01-15T00:00:00Z',
          completion_date: '2024-01-14T16:00:00Z',
          dependencies: [],
          deliverables: ['Current process documentation'],
          acceptance_criteria: ['All current processes documented and reviewed']
        },
        {
          id: 'step-2',
          step_number: 2,
          title: 'Create Formal Policies',
          description: 'Create formal access control policies based on requirements',
          status: 'in_progress',
          assigned_to: 'compliance-officer',
          estimated_effort: '3 weeks',
          due_date: '2024-02-05T00:00:00Z',
          completion_date: null,
          dependencies: ['step-1'],
          deliverables: ['Access control policy document'],
          acceptance_criteria: ['Policy approved by management']
        }
      ],
      assigned_to: 'compliance-officer',
      due_date: '2024-02-15T00:00:00Z',
      progress_percentage: 40,
      last_updated_by: 'john.smith',
      business_impact: 'Medium - May affect audit compliance',
      technical_impact: 'Low - No immediate technical changes required',
      cost_estimate: 15000,
      effort_estimate: '6 weeks',
      priority: 3,
      dependencies: [],
      related_gaps: [],
      approval_required: true,
      budget_approved: true,
      resources_allocated: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-14T16:00:00Z',
      created_by: 'system',
      updated_by: 'john.smith',
      version: 2,
      metadata: {}
    },
    {
      id: 2,
      data_source_id: dataSourceId || 1,
      requirement_id: 2,
      gap_title: 'Insufficient Data Encryption',
      gap_description: 'Data at rest is not encrypted according to GDPR requirements',
      current_state: 'Some data encrypted, but not all sensitive data',
      desired_state: 'All sensitive personal data encrypted at rest',
      gap_analysis: 'Critical gap in data protection that could lead to regulatory violations',
      severity: 'critical',
      status: 'in_progress',
      remediation_plan: 'Implement comprehensive data encryption for all sensitive data',
      remediation_steps: [
        {
          id: 'step-1',
          step_number: 1,
          title: 'Data Classification',
          description: 'Classify all data and identify sensitive information',
          status: 'completed',
          assigned_to: 'data-team',
          estimated_effort: '2 weeks',
          due_date: '2024-01-10T00:00:00Z',
          completion_date: '2024-01-09T14:00:00Z',
          dependencies: [],
          deliverables: ['Data classification matrix'],
          acceptance_criteria: ['All data classified and approved']
        },
        {
          id: 'step-2',
          step_number: 2,
          title: 'Encryption Implementation',
          description: 'Implement encryption for all classified sensitive data',
          status: 'in_progress',
          assigned_to: 'security-team',
          estimated_effort: '4 weeks',
          due_date: '2024-02-07T00:00:00Z',
          completion_date: null,
          dependencies: ['step-1'],
          deliverables: ['Encrypted data storage'],
          acceptance_criteria: ['All sensitive data encrypted']
        }
      ],
      assigned_to: 'security-team',
      due_date: '2024-02-07T00:00:00Z',
      progress_percentage: 60,
      last_updated_by: 'jane.doe',
      business_impact: 'High - Regulatory compliance risk',
      technical_impact: 'High - Requires infrastructure changes',
      cost_estimate: 50000,
      effort_estimate: '8 weeks',
      priority: 1,
      dependencies: [],
      related_gaps: [3],
      approval_required: true,
      budget_approved: true,
      resources_allocated: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      created_by: 'system',
      updated_by: 'jane.doe',
      version: 3,
      metadata: {}
    },
    {
      id: 3,
      data_source_id: dataSourceId || 1,
      requirement_id: 3,
      gap_title: 'Incomplete Audit Logging',
      gap_description: 'Audit logs do not capture all required events for SOC 2 compliance',
      current_state: 'Basic logging in place but missing critical events',
      desired_state: 'Comprehensive audit logging covering all required events',
      gap_analysis: 'Logging gaps identified during SOC 2 readiness assessment',
      severity: 'medium',
      status: 'resolved',
      remediation_plan: 'Enhance logging infrastructure to capture all required audit events',
      remediation_steps: [
        {
          id: 'step-1',
          step_number: 1,
          title: 'Logging Requirements Analysis',
          description: 'Analyze SOC 2 logging requirements and current gaps',
          status: 'completed',
          assigned_to: 'audit-team',
          estimated_effort: '1 week',
          due_date: '2024-01-08T00:00:00Z',
          completion_date: '2024-01-07T12:00:00Z',
          dependencies: [],
          deliverables: ['Logging requirements document'],
          acceptance_criteria: ['Requirements approved by auditor']
        },
        {
          id: 'step-2',
          step_number: 2,
          title: 'Logging Implementation',
          description: 'Implement enhanced logging across all systems',
          status: 'completed',
          assigned_to: 'devops-team',
          estimated_effort: '3 weeks',
          due_date: '2024-01-29T00:00:00Z',
          completion_date: '2024-01-28T18:00:00Z',
          dependencies: ['step-1'],
          deliverables: ['Enhanced logging system'],
          acceptance_criteria: ['All required events logged']
        }
      ],
      assigned_to: 'devops-team',
      due_date: '2024-01-29T00:00:00Z',
      progress_percentage: 100,
      last_updated_by: 'mike.johnson',
      business_impact: 'Medium - Affects audit readiness',
      technical_impact: 'Medium - Requires system configuration changes',
      cost_estimate: 25000,
      effort_estimate: '4 weeks',
      priority: 2,
      dependencies: [],
      related_gaps: [2],
      approval_required: false,
      budget_approved: true,
      resources_allocated: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-28T18:00:00Z',
      created_by: 'system',
      updated_by: 'mike.johnson',
      version: 4,
      metadata: {}
    }
  ]

  // Load issues
  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true)
      try {
        // Use mock data for clean output
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
        setIssues(mockIssues)
      } catch (error) {
        console.error('Failed to load issues:', error)
        onError?.('Failed to load compliance issues')
      } finally {
        setLoading(false)
      }
    }

    loadIssues()
  }, [dataSourceId])

  // Filter issues based on active tab and search
  const filteredIssues = issues.filter(issue => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'open' && issue.status !== 'open') return false
      if (activeTab === 'in_progress' && issue.status !== 'in_progress') return false
      if (activeTab === 'resolved' && issue.status !== 'resolved') return false
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        issue.gap_title.toLowerCase().includes(searchLower) ||
        issue.gap_description.toLowerCase().includes(searchLower) ||
        issue.severity.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'in_progress':
        return 'secondary'
      case 'resolved':
        return 'default'
      case 'accepted_risk':
        return 'outline'
      case 'deferred':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'accepted_risk':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'deferred':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Issues</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage compliance gaps and remediation efforts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreateIssue}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.severity || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value || undefined }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.assigned_to || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, assigned_to: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Assignees</SelectItem>
              <SelectItem value="compliance-officer">Compliance Officer</SelectItem>
              <SelectItem value="security-team">Security Team</SelectItem>
              <SelectItem value="devops-team">DevOps Team</SelectItem>
              <SelectItem value="audit-team">Audit Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
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
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'All compliance issues have been resolved'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateIssue}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Issue
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(issue.status)}
                            <CardTitle className="text-base line-clamp-1">
                              {issue.gap_title}
                            </CardTitle>
                            <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {issue.gap_description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Status and Progress */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {issue.progress_percentage}%
                            </span>
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${issue.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Assignee and Due Date */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{issue.assigned_to?.replace('-', ' ') || 'Unassigned'}</span>
                          </div>
                          {issue.due_date && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                Due {new Date(issue.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Current Remediation Step */}
                        {issue.remediation_steps.length > 0 && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Current Step</span>
                              <span className="text-xs text-muted-foreground">
                                {issue.remediation_steps.filter(s => s.status === 'completed').length} of {issue.remediation_steps.length} completed
                              </span>
                            </div>
                            {(() => {
                              const currentStep = issue.remediation_steps.find(s => s.status === 'in_progress') || 
                                                issue.remediation_steps.find(s => s.status === 'pending')
                              return currentStep ? (
                                <div>
                                  <p className="text-sm">{currentStep.title}</p>
                                  <p className="text-xs text-muted-foreground">{currentStep.description}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-green-600">All steps completed</p>
                              )
                            })()}
                          </div>
                        )}

                        {/* Impact and Cost */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Business Impact</span>
                            <p className="font-medium">{issue.business_impact}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost Estimate</span>
                            <p className="font-medium">
                              {issue.cost_estimate ? `$${issue.cost_estimate.toLocaleString()}` : 'TBD'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewIssue?.(issue)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditIssue?.(issue)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle update progress
                              }}
                            >
                              Update Progress
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteIssue?.(issue)
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
  )
}

export default ComplianceIssueList
