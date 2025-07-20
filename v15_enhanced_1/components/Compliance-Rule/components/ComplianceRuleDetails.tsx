"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Eye,
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Activity,
  Target,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceRequirement } from "../types"

interface ComplianceRuleDetailsProps {
  isOpen: boolean
  onClose: () => void
  requirement: ComplianceRequirement | null
  onEdit?: (requirement: ComplianceRequirement) => void
  onDelete?: (requirement: ComplianceRequirement) => void
}

<<<<<<< HEAD
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"]

export function ComplianceRuleDetails({ isOpen, onClose, requirement, onEdit, onDelete }: ComplianceRuleDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isValidating, setIsValidating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationResults, setValidationResults] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
=======
export function ComplianceRuleDetails({ 
  isOpen, 
  onClose, 
  requirement, 
  onEdit, 
  onDelete 
}: ComplianceRuleDetailsProps) {
  // State
  const [requirement, setRequirement] = useState<ComplianceRequirement | null>(null)
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([])
  const [relatedRequirements, setRelatedRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
>>>>>>> 78c9608 (Refactor compliance components with real API calls and enhanced features)

  const { 
    executeAction, 
    sendNotification, 
    getMetrics 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleDetails',
    complianceId: requirement?.id,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

<<<<<<< HEAD
  // Load rule details and related data from API
  useEffect(() => {
    const loadRuleData = async () => {
      if (!requirement) return
      
      try {
        setIsLoading(true)
        
        // Load validation results
        const validation = await ComplianceAPIs.Management.validateRule(requirement.id)
        setValidationResults(validation)
        
        // Load related issues/gaps for this rule
        const issuesResponse = await ComplianceAPIs.Management.getIssues({
          rule_id: requirement.id,
          limit: 10
        })
        setIssues(issuesResponse.data)
        
        // Load rule evaluation history for trend analysis
        const history = await ComplianceAPIs.Management.getEvaluationHistory(requirement.id)
        setTrendData(history.data || [])
        
        // Load analytics data
        const analyticsData = await ComplianceAPIs.Management.getInsights(requirement.id)
        setAnalytics(analyticsData)
        
      } catch (error) {
        console.error('Failed to load rule data:', error)
        sendNotification('error', 'Failed to load rule details')
      } finally {
        setIsLoading(false)
      }
=======
  // Load requirement details from backend
  useEffect(() => {
    const loadRequirementDetails = async () => {
      if (!requirementId) return
      
      setLoading(true)
      try {
        // Load main requirement data
        const requirementData = await ComplianceAPIs.ComplianceManagement.getRequirement(requirementId)
        setRequirement(requirementData)
        
        // Load evaluation history
        const evaluationsResponse = await ComplianceAPIs.ComplianceManagement.getRuleEvaluations(requirementId, {
          page: 1,
          limit: 10
        })
        setAssessmentHistory(evaluationsResponse.data || [])
        
        // Load related requirements (same framework)
        if (requirementData.framework) {
          const relatedResponse = await ComplianceAPIs.ComplianceManagement.getRequirements({
            framework: requirementData.framework,
            limit: 5
          })
          setRelatedRequirements((relatedResponse.data || []).filter(r => r.id !== requirementId))
        }
        
        // Emit success event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'requirement_details_loaded', requirement_id: requirementId },
          source: 'ComplianceRuleDetails',
          severity: 'low'
        })
        
      } catch (error) {
        console.error('Failed to load requirement details:', error)
        enterprise.sendNotification('error', 'Failed to load compliance requirement details')
        onError?.('Failed to load compliance requirement details')
        
        // Emit error event
        enterprise.emitEvent({
          type: 'system_event',
          data: { action: 'requirement_details_load_failed', error: error.message },
          source: 'ComplianceRuleDetails',
          severity: 'high'
        })
      } finally {
        setLoading(false)
      }
    }

    loadRequirementDetails()
  }, [requirementId, enterprise])

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      non_compliant: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle },
      partially_compliant: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Clock },
      not_assessed: { variant: 'outline' as const, color: 'text-gray-600', icon: FileText },
      in_progress: { variant: 'secondary' as const, color: 'text-blue-600', icon: Activity }
>>>>>>> 78c9608 (Refactor compliance components with real API calls and enhanced features)
    }

    if (isOpen && requirement) {
      loadRuleData()
    }
  }, [isOpen, requirement, sendNotification])

  const handleValidateRule = async () => {
    if (!requirement) return
    
    try {
      setIsValidating(true)
      const results = await ComplianceAPIs.Management.validateRule(requirement.id)
      setValidationResults(results)
      sendNotification('success', 'Rule validation completed')
    } catch (error) {
      console.error('Failed to validate rule:', error)
      sendNotification('error', 'Failed to validate rule')
    } finally {
      setIsValidating(false)
    }
  }

  const handleEvaluateRule = async () => {
    if (!requirement) return
    
    try {
      setIsLoading(true)
      await ComplianceAPIs.Management.evaluateRequirement(requirement.id, {
        run_scans: true,
        include_performance_check: true,
        include_security_check: true
      })
      sendNotification('success', 'Rule evaluation started')
      
      // Refresh data after evaluation
      setTimeout(() => {
        if (requirement) {
          loadRuleData()
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to evaluate rule:', error)
      sendNotification('error', 'Failed to evaluate rule')
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50"
      case "high": return "text-orange-600 bg-orange-50"
      case "medium": return "text-yellow-600 bg-yellow-50"
      case "low": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "inactive": return "text-gray-600 bg-gray-50"
      case "draft": return "text-yellow-600 bg-yellow-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Rule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rule Information</span>
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(requirement?.severity || 'medium')}>
                {requirement?.severity?.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(requirement?.status || 'active')}>
                {requirement?.status?.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{requirement?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="text-sm">{requirement?.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Compliance Standard</label>
              <p className="text-sm">{requirement?.compliance_standard}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Impact</label>
              <p className="text-sm capitalize">{requirement?.business_impact}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm mt-1">{requirement?.description}</p>
          </div>
          
          {requirement?.remediation_steps && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Remediation Steps</label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{requirement.remediation_steps}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Current compliance status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{requirement?.pass_rate || 0}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{requirement?.total_entities || 0}</div>
              <div className="text-sm text-muted-foreground">Total Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{requirement?.failing_entities || 0}</div>
              <div className="text-sm text-muted-foreground">Failing</div>
            </div>
          </div>
          
          <Progress value={requirement?.pass_rate || 0} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Last Evaluated: {requirement?.last_evaluated_at ? new Date(requirement.last_evaluated_at).toLocaleDateString() : 'Never'}</span>
            <span>Next Evaluation: {requirement?.next_evaluation_at ? new Date(requirement.next_evaluation_at).toLocaleDateString() : 'Not scheduled'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest compliance issues for this rule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{issue.gap_title || 'Compliance Issue'}</p>
                      <p className="text-xs text-muted-foreground">{issue.gap_description || 'Issue description'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {issue.severity || 'medium'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderValidationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rule Validation</span>
            <Button 
              onClick={handleValidateRule} 
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Rule
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Validate rule syntax and logic against current data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationResults ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {validationResults.is_valid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Rule is valid</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Rule has validation errors</span>
                  </>
                )}
              </div>
              
              {validationResults.errors && validationResults.errors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Validation Errors</label>
                  {validationResults.errors.map((error: string, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              
              {validationResults.warnings && validationResults.warnings.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Warnings</label>
                  {validationResults.warnings.map((warning: string, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Validate Rule" to check rule syntax and logic</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation History</CardTitle>
          <CardDescription>Historical evaluation results and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Trend chart visualization</p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Total Entities</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trendData.slice(0, 10).map((evaluation, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(evaluation.evaluated_at || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{evaluation.pass_rate || 0}%</span>
                          {evaluation.pass_rate > 90 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{evaluation.total_entities || 0}</TableCell>
                      <TableCell>
                        <Badge variant={evaluation.pass_rate > 90 ? "default" : "destructive"}>
                          {evaluation.pass_rate > 90 ? "Compliant" : "Non-Compliant"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No evaluation history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  if (!requirement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {requirement.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information and performance metrics for this compliance rule
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="validation">
              {renderValidationTab()}
            </TabsContent>

            <TabsContent value="history">
              {renderHistoryTab()}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEvaluateRule}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Evaluate Rule
                </>
              )}
            </Button>
            {requirement.reference_link && (
              <Button
                variant="outline"
                onClick={() => window.open(requirement.reference_link, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Reference
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(requirement)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
