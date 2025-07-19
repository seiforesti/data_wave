"use client"

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Plug, 
  Zap,
  TrendingUp,
  Brain,
  Workflow,
  Bell,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Stop,
  MessageSquare,
  GitBranch
} from 'lucide-react'

// Import enhanced enterprise hooks
import { useEnterpriseComplianceFeatures } from './hooks/use-enterprise-compliance'
import { useComplianceMonitoring } from './hooks/use-enterprise-compliance'
import { useComplianceAI } from './hooks/use-enterprise-compliance'
import { useComplianceWorkflows } from './hooks/use-enterprise-compliance'
import { useComplianceAnalytics } from './hooks/use-enterprise-compliance'
import { useComplianceReporting } from './hooks/use-enterprise-compliance'

// Import existing components (enhanced versions would be created)
import { ComplianceRuleList } from './components/ComplianceRuleList'
import { ComplianceRuleCreateModal } from './components/ComplianceRuleCreateModal'
import { ComplianceRuleEditModal } from './components/ComplianceRuleEditModal'
import { ComplianceRuleDetails } from './components/ComplianceRuleDetails'
import { ComplianceDashboard } from './components/ComplianceDashboard'
import { ComplianceIssueList } from './components/ComplianceIssueList'
import { ComplianceReports } from './components/ComplianceReports'
import { ComplianceIntegrations } from './components/ComplianceIntegrations'
import { ComplianceWorkflows } from './components/ComplianceWorkflows'

// Import the Three Phases UI Components
import AnalyticsWorkbench from './ui/analytics/analytics-workbench'
import CollaborationStudio from './ui/collaboration/collaboration-studio'
import WorkflowDesigner from './ui/workflow/workflow-designer'
import EnterpriseDashboard from './ui/dashboard/enterprise-dashboard'

// Import types
import type { ComplianceRequirement, ComplianceAssessment, ComplianceGap } from './services/enhanced-compliance-apis'

interface EnhancedComplianceRuleAppProps {
  dataSourceId?: number
  initialConfig?: {
    enableAnalytics?: boolean
    enableCollaboration?: boolean
    enableWorkflows?: boolean
    enableRealTimeMonitoring?: boolean
    enableAIInsights?: boolean
    enableCrossGroupIntegration?: boolean
  }
}

export function EnhancedComplianceRuleApp({ 
  dataSourceId,
  initialConfig = {
    enableAnalytics: true,
    enableCollaboration: true,
    enableWorkflows: true,
    enableRealTimeMonitoring: true,
    enableAIInsights: true,
    enableCrossGroupIntegration: true
  }
}: EnhancedComplianceRuleAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null)
  const [selectedGap, setSelectedGap] = useState<ComplianceGap | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [isGapModalOpen, setIsGapModalOpen] = useState(false)

  // Enterprise compliance features
  const enterprise = useEnterpriseComplianceFeatures({
    componentName: 'enhanced-compliance-rule-app',
    dataSourceId,
    ...initialConfig
  })

  // Specialized hooks
  const monitoring = useComplianceMonitoring(dataSourceId)
  const ai = useComplianceAI(dataSourceId)
  const workflows = useComplianceWorkflows()
  const analytics = useComplianceAnalytics(dataSourceId)
  const reporting = useComplianceReporting()

  // ============================================================================
  // REAL-TIME ALERTS HANDLING
  // ============================================================================

  useEffect(() => {
    if (enterprise.realTimeAlerts.length > 0) {
      // Handle real-time alerts
      enterprise.realTimeAlerts.forEach(alert => {
        enterprise.sendNotification('alert', alert.message, alert)
      })
    }
  }, [enterprise.realTimeAlerts])

  // ============================================================================
  // AI INSIGHTS HANDLING
  // ============================================================================

  useEffect(() => {
    if (enterprise.aiInsights.length > 0) {
      // Handle AI insights
      enterprise.aiInsights.forEach(insight => {
        if (insight.priority === 'critical') {
          enterprise.sendNotification('critical', insight.description, insight)
        }
      })
    }
  }, [enterprise.aiInsights])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateRequirement = async (requirementData: Partial<ComplianceRequirement>) => {
    try {
      await enterprise.executeAction('create_requirement', requirementData)
      setIsCreateModalOpen(false)
      enterprise.sendNotification('success', 'Compliance requirement created successfully')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to create compliance requirement')
    }
  }

  const handleUpdateRequirement = async (requirement: ComplianceRequirement) => {
    try {
      await enterprise.executeAction('update_requirement', {
        requirementId: requirement.id,
        updateData: requirement
      })
      setIsEditModalOpen(false)
      setSelectedRequirement(null)
      enterprise.sendNotification('success', 'Compliance requirement updated successfully')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to update compliance requirement')
    }
  }

  const handleDeleteRequirement = async (requirement: ComplianceRequirement) => {
    try {
      await enterprise.executeAction('delete_requirement', { requirementId: requirement.id })
      setSelectedRequirement(null)
      enterprise.sendNotification('success', 'Compliance requirement deleted successfully')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to delete compliance requirement')
    }
  }

  const handleStartAssessment = async (assessmentData: Partial<ComplianceAssessment>) => {
    try {
      await enterprise.executeAction('start_assessment', assessmentData)
      setIsAssessmentModalOpen(false)
      enterprise.sendNotification('success', 'Compliance assessment started successfully')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to start compliance assessment')
    }
  }

  const handleCreateGap = async (gapData: Partial<ComplianceGap>) => {
    try {
      await enterprise.executeAction('create_gap', gapData)
      setIsGapModalOpen(false)
      enterprise.sendNotification('success', 'Compliance gap created successfully')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to create compliance gap')
    }
  }

  const handleTriggerAutomatedCheck = async () => {
    try {
      await enterprise.executeAction('trigger_automated_check', {
        dataSourceId: dataSourceId || 0,
        frameworks: ['SOC2', 'GDPR', 'HIPAA']
      })
      enterprise.sendNotification('success', 'Automated compliance check initiated')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to trigger automated compliance check')
    }
  }

  const handleGenerateReport = async () => {
    try {
      await enterprise.executeAction('generate_report', {
        dataSourceId,
        reportType: 'comprehensive'
      })
      enterprise.sendNotification('success', 'Compliance report generation initiated')
    } catch (error) {
      enterprise.sendNotification('error', 'Failed to generate compliance report')
    }
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderSystemHealth = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {monitoring.complianceScore}%
            </div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {enterprise.getMetrics().totalRequirements}
            </div>
            <div className="text-sm text-muted-foreground">Total Requirements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {enterprise.getMetrics().criticalGaps}
            </div>
            <div className="text-sm text-muted-foreground">Critical Gaps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {enterprise.getMetrics().riskScore}
            </div>
            <div className="text-sm text-muted-foreground">Risk Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRealTimeAlerts = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Real-Time Alerts
          <Badge variant="destructive" className="ml-2">
            {enterprise.realTimeAlerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enterprise.realTimeAlerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No active alerts
          </div>
        ) : (
          <div className="space-y-2">
            {enterprise.realTimeAlerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderAIInsights = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
          <Badge variant="secondary" className="ml-2">
            {enterprise.aiInsights.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enterprise.aiInsights.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No AI insights available
          </div>
        ) : (
          <div className="space-y-3">
            {enterprise.aiInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={insight.priority === 'critical' ? 'destructive' : 'secondary'}>
                    {insight.priority}
                  </Badge>
                  <span className="font-medium">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                {insight.action && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => enterprise.executeAction(insight.action)}
                  >
                    Take Action
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderQuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={enterprise.isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Requirement
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTriggerAutomatedCheck}
            disabled={workflows.isWorkflowRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Auto Check
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateReport}
            disabled={reporting.isGenerating}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderComplianceTrends = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Compliance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.trends ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Score Trend</span>
              <span className="text-sm text-muted-foreground">
                Last 30 days
              </span>
            </div>
            <Progress value={monitoring.complianceScore} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {enterprise.getMetrics().compliantRequirements}
                </div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {enterprise.getMetrics().nonCompliantRequirements}
                </div>
                <div className="text-xs text-muted-foreground">Non-Compliant</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {enterprise.getMetrics().openGaps}
                </div>
                <div className="text-xs text-muted-foreground">Open Gaps</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No trend data available
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (enterprise.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading enterprise compliance features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Compliance Management</h1>
          <p className="text-muted-foreground">
            Advanced compliance monitoring with AI insights and real-time alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={monitoring.isCompliant ? "default" : "destructive"}>
            {monitoring.isCompliant ? "Compliant" : "Non-Compliant"}
          </Badge>
          <Badge variant="outline">
            Risk Level: {monitoring.riskLevel}
          </Badge>
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderSystemHealth()}
          {renderComplianceTrends()}
        </div>
        <div>
          {renderQuickActions()}
          {renderRealTimeAlerts()}
        </div>
      </div>

      {/* AI Insights */}
      {initialConfig.enableAIInsights && renderAIInsights()}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Requirements
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Gaps
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <EnterpriseDashboard />
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Compliance Requirements</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
          <ComplianceRuleList 
            requirements={enterprise.requirements}
            onEdit={(requirement) => {
              setSelectedRequirement(requirement)
              setIsEditModalOpen(true)
            }}
            onDelete={handleDeleteRequirement}
            onView={(requirement) => setSelectedRequirement(requirement)}
          />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Compliance Assessments</h2>
            <Button onClick={() => setIsAssessmentModalOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          </div>
          {/* Assessment list component would go here */}
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Compliance Gaps</h2>
            <Button onClick={() => setIsGapModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Gap
            </Button>
          </div>
          <ComplianceIssueList 
            gaps={enterprise.gaps}
            onEdit={(gap) => {
              setSelectedGap(gap)
              // Handle gap editing
            }}
            onRemediate={(gap) => {
              enterprise.executeAction('create_remediation_workflow', { gapId: gap.id })
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsWorkbench />
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationStudio />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <WorkflowDesigner />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <h2 className="text-2xl font-bold">Compliance Reports</h2>
          <ComplianceReports />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {isCreateModalOpen && (
        <ComplianceRuleCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateRequirement}
          frameworks={enterprise.frameworks}
        />
      )}

      {isEditModalOpen && selectedRequirement && (
        <ComplianceRuleEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          requirement={selectedRequirement}
          onSubmit={handleUpdateRequirement}
          frameworks={enterprise.frameworks}
        />
      )}

      {/* Error Handling */}
      {Object.values(enterprise.errors).some(error => error) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Some data failed to load. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Export the enhanced compliance app
export default EnhancedComplianceRuleApp

// Named export for flexibility
export { EnhancedComplianceRuleApp }

// Missing Plus component import
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)