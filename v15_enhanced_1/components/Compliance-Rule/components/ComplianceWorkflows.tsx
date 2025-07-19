"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Play, Pause, Square, RotateCcw, Clock, CheckCircle, AlertCircle,
  RefreshCw, PlusCircle, Eye, Edit, Trash2, Search, Users, 
  ArrowRight, Calendar, Timer
} from "lucide-react"

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { 
  ComplianceWorkflow, 
  ComplianceWorkflowExecution,
  ComplianceComponentProps 
} from '../types'

interface ComplianceWorkflowsProps extends ComplianceComponentProps {
  onCreateWorkflow?: () => void
  onEditWorkflow?: (workflow: ComplianceWorkflow) => void
  onViewWorkflow?: (workflow: ComplianceWorkflow) => void
  onDeleteWorkflow?: (workflow: ComplianceWorkflow) => void
}

const ComplianceWorkflows: React.FC<ComplianceWorkflowsProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  onCreateWorkflow,
  onEditWorkflow,
  onViewWorkflow,
  onDeleteWorkflow
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceWorkflows',
    dataSourceId
  })
  
  const workflowIntegration = ComplianceHooks.useWorkflowIntegration()
  
  // State
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([])
  const [activeExecutions, setActiveExecutions] = useState<ComplianceWorkflowExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [activeTab, setActiveTab] = useState('all')

  // Mock data for clean output
  const mockWorkflows: ComplianceWorkflow[] = [
    {
      id: 1,
      name: 'SOC 2 Annual Assessment',
      description: 'Automated workflow for conducting SOC 2 Type II annual assessments',
      workflow_type: 'assessment',
      status: 'active',
      steps: [
        {
          id: 'step-1',
          name: 'Preparation',
          type: 'manual',
          description: 'Prepare assessment documentation and scope',
          assignee: 'compliance-team',
          due_date_offset: 7,
          required: true,
          conditions: {},
          actions: [],
          status: 'completed',
          started_at: '2024-01-01T09:00:00Z',
          completed_at: '2024-01-08T17:00:00Z',
          notes: 'All documentation prepared and scope defined',
          attachments: [],
          sub_steps: []
        },
        {
          id: 'step-2',
          name: 'Evidence Collection',
          type: 'automated',
          description: 'Collect evidence from various systems',
          assignee: 'system',
          due_date_offset: 14,
          required: true,
          conditions: {},
          actions: [],
          status: 'in_progress',
          started_at: '2024-01-08T09:00:00Z',
          completed_at: null,
          notes: null,
          attachments: [],
          sub_steps: []
        },
        {
          id: 'step-3',
          name: 'Review and Approval',
          type: 'approval',
          description: 'Review collected evidence and approve assessment',
          assignee: 'audit-manager',
          due_date_offset: 21,
          required: true,
          conditions: {},
          actions: [],
          status: 'pending',
          started_at: null,
          completed_at: null,
          notes: null,
          attachments: [],
          sub_steps: []
        }
      ],
      current_step: 1,
      assigned_to: 'compliance-team',
      due_date: '2024-02-01T00:00:00Z',
      priority: 'high',
      triggers: [
        {
          id: 'trigger-1',
          type: 'scheduled',
          config: { cron: '0 0 1 1 *' },
          enabled: true
        }
      ],
      conditions: {},
      variables: {},
      execution_history: [],
      approval_chain: [],
      escalation_rules: [],
      sla_requirements: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-08T17:00:00Z',
      created_by: 'admin',
      updated_by: 'system',
      version: 1,
      metadata: {}
    },
    {
      id: 2,
      name: 'GDPR Data Subject Request',
      description: 'Automated workflow for handling GDPR data subject access requests',
      workflow_type: 'remediation',
      status: 'active',
      steps: [
        {
          id: 'step-1',
          name: 'Request Validation',
          type: 'automated',
          description: 'Validate incoming data subject request',
          assignee: 'system',
          due_date_offset: 1,
          required: true,
          conditions: {},
          actions: [],
          status: 'completed',
          started_at: '2024-01-10T10:00:00Z',
          completed_at: '2024-01-10T10:30:00Z',
          notes: 'Request validated successfully',
          attachments: [],
          sub_steps: []
        },
        {
          id: 'step-2',
          name: 'Data Collection',
          type: 'automated',
          description: 'Collect personal data from all systems',
          assignee: 'system',
          due_date_offset: 15,
          required: true,
          conditions: {},
          actions: [],
          status: 'in_progress',
          started_at: '2024-01-10T11:00:00Z',
          completed_at: null,
          notes: null,
          attachments: [],
          sub_steps: []
        },
        {
          id: 'step-3',
          name: 'Response Preparation',
          type: 'manual',
          description: 'Prepare response package for data subject',
          assignee: 'privacy-officer',
          due_date_offset: 25,
          required: true,
          conditions: {},
          actions: [],
          status: 'pending',
          started_at: null,
          completed_at: null,
          notes: null,
          attachments: [],
          sub_steps: []
        }
      ],
      current_step: 1,
      assigned_to: 'privacy-officer',
      due_date: '2024-02-04T00:00:00Z',
      priority: 'urgent',
      triggers: [
        {
          id: 'trigger-1',
          type: 'event',
          config: { event_type: 'data_subject_request' },
          enabled: true
        }
      ],
      conditions: {},
      variables: {},
      execution_history: [],
      approval_chain: [],
      escalation_rules: [],
      sla_requirements: [],
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T11:00:00Z',
      created_by: 'system',
      updated_by: 'system',
      version: 1,
      metadata: {}
    },
    {
      id: 3,
      name: 'Risk Assessment Review',
      description: 'Quarterly risk assessment review and update workflow',
      workflow_type: 'review',
      status: 'paused',
      steps: [
        {
          id: 'step-1',
          name: 'Risk Identification',
          type: 'manual',
          description: 'Identify and document new risks',
          assignee: 'risk-team',
          due_date_offset: 7,
          required: true,
          conditions: {},
          actions: [],
          status: 'completed',
          started_at: '2024-01-01T09:00:00Z',
          completed_at: '2024-01-07T17:00:00Z',
          notes: 'New risks identified and documented',
          attachments: [],
          sub_steps: []
        },
        {
          id: 'step-2',
          name: 'Risk Analysis',
          type: 'manual',
          description: 'Analyze impact and likelihood of identified risks',
          assignee: 'risk-analyst',
          due_date_offset: 14,
          required: true,
          conditions: {},
          actions: [],
          status: 'paused',
          started_at: '2024-01-08T09:00:00Z',
          completed_at: null,
          notes: 'Paused pending additional information',
          attachments: [],
          sub_steps: []
        }
      ],
      current_step: 1,
      assigned_to: 'risk-analyst',
      due_date: '2024-01-31T00:00:00Z',
      priority: 'medium',
      triggers: [
        {
          id: 'trigger-1',
          type: 'scheduled',
          config: { cron: '0 0 1 */3 *' },
          enabled: true
        }
      ],
      conditions: {},
      variables: {},
      execution_history: [],
      approval_chain: [],
      escalation_rules: [],
      sla_requirements: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-08T09:00:00Z',
      created_by: 'admin',
      updated_by: 'risk-analyst',
      version: 1,
      metadata: {}
    }
  ]

  // Load workflows
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true)
      try {
        // Use mock data for clean output
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
        setWorkflows(mockWorkflows)
      } catch (error) {
        console.error('Failed to load workflows:', error)
        onError?.('Failed to load compliance workflows')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
  }, [dataSourceId])

  // Filter workflows based on active tab and search
  const filteredWorkflows = workflows.filter(workflow => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'active' && workflow.status !== 'active') return false
      if (activeTab === 'paused' && workflow.status !== 'paused') return false
      if (activeTab === 'completed' && workflow.status !== 'completed') return false
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description.toLowerCase().includes(searchLower) ||
        workflow.workflow_type.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'paused':
        return 'secondary'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      case 'failed':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <Square className="h-4 w-4 text-red-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Calculate workflow progress
  const calculateProgress = (workflow: ComplianceWorkflow) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
    return (completedSteps / workflow.steps.length) * 100
  }

  // Handle workflow actions
  const handleStartWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      await ComplianceAPIs.WorkflowAutomation.startWorkflow(workflow.id as number)
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'active' } : w
      ))
      enterprise.sendNotification('success', 'Workflow started successfully')
    } catch (error) {
      console.error('Failed to start workflow:', error)
      enterprise.sendNotification('error', 'Failed to start workflow')
    }
  }

  const handlePauseWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      // Note: This would need the instance ID in a real implementation
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'paused' } : w
      ))
      enterprise.sendNotification('success', 'Workflow paused successfully')
    } catch (error) {
      console.error('Failed to pause workflow:', error)
      enterprise.sendNotification('error', 'Failed to pause workflow')
    }
  }

  const handleResumeWorkflow = async (workflow: ComplianceWorkflow) => {
    try {
      // Note: This would need the instance ID in a real implementation
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'active' } : w
      ))
      enterprise.sendNotification('success', 'Workflow resumed successfully')
    } catch (error) {
      console.error('Failed to resume workflow:', error)
      enterprise.sendNotification('error', 'Failed to resume workflow')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Automate and manage compliance processes and workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreateWorkflow}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.workflow_type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, workflow_type: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="remediation">Remediation</SelectItem>
              <SelectItem value="approval">Approval</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value || undefined }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                      <div className="h-2 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workflows found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first workflow'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateWorkflow}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(workflow.status)}
                            <CardTitle className="text-base line-clamp-1">
                              {workflow.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {workflow.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Status and Priority */}
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(workflow.status)}>
                            {workflow.status}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {workflow.workflow_type}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(workflow.priority)}>
                              {workflow.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(calculateProgress(workflow))}%</span>
                          </div>
                          <Progress value={calculateProgress(workflow)} className="h-2" />
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>
                              Step {workflow.current_step + 1} of {workflow.steps.length}
                            </span>
                          </div>
                        </div>

                        {/* Current Step */}
                        {workflow.steps[workflow.current_step] && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                Current: {workflow.steps[workflow.current_step].name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {workflow.steps[workflow.current_step].type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {workflow.steps[workflow.current_step].description}
                            </p>
                          </div>
                        )}

                        {/* Assignee and Due Date */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{workflow.assigned_to}</span>
                          </div>
                          {workflow.due_date && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(workflow.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewWorkflow?.(workflow)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditWorkflow?.(workflow)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {workflow.status === 'paused' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleResumeWorkflow(workflow)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Resume
                              </Button>
                            )}
                            {workflow.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePauseWorkflow(workflow)
                                }}
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </Button>
                            )}
                            {(workflow.status === 'draft' || workflow.status === 'paused') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartWorkflow(workflow)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteWorkflow?.(workflow)
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

export default ComplianceWorkflows
