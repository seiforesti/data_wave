// Enhanced Compliance Enterprise APIs
// Comprehensive compliance management with real-time monitoring, AI insights, and cross-group integration

import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ComplianceRequirement {
  id: number
  data_source_id: number
  framework: string
  requirement_id: string
  title: string
  description: string
  category: string
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed' | 'in_progress'
  compliance_percentage: number
  last_assessed?: string
  next_assessment?: string
  assessor?: string
  assessment_notes?: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  remediation_plan?: string
  remediation_deadline?: string
  remediation_owner?: string
  created_at: string
  updated_at: string
}

export interface ComplianceAssessment {
  id: number
  data_source_id: number
  framework: string
  assessment_type: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired'
  scheduled_date?: string
  started_date?: string
  completed_date?: string
  assessor?: string
  assessment_firm?: string
  overall_score?: number
  compliant_requirements: number
  non_compliant_requirements: number
  total_requirements: number
  findings: any[]
  recommendations: string[]
  report_file?: string
  certificate_file?: string
  created_at: string
  updated_at: string
}

export interface ComplianceGap {
  id: number
  data_source_id: number
  requirement_id: number
  gap_title: string
  gap_description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  remediation_plan?: string
  remediation_steps: string[]
  assigned_to?: string
  due_date?: string
  progress_percentage: number
  last_updated_by?: string
  business_impact?: string
  technical_impact?: string
  created_at: string
  updated_at: string
}

export interface ComplianceStatus {
  overall_score: number
  frameworks: any[]
  requirements: ComplianceRequirement[]
  recent_assessments: ComplianceAssessment[]
  gaps: ComplianceGap[]
  recommendations: string[]
  next_assessment_due?: string
}

export interface ComplianceOverview {
  total_data_sources: number
  compliant_data_sources: number
  non_compliant_data_sources: number
  compliance_percentage: number
  frameworks: Record<string, any>
  recent_violations: any[]
  upcoming_assessments: any[]
  risk_summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export interface ComplianceTrends {
  timeframe: string
  data: {
    date: string
    compliance_score: number
    violations_count: number
    assessments_completed: number
  }[]
  insights: string[]
  recommendations: string[]
}

export interface ComplianceRiskAssessment {
  overall_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: {
    factor: string
    score: number
    impact: string
    mitigation: string
  }[]
  compliance_gaps: ComplianceGap[]
  recommendations: string[]
}

export interface ComplianceRecommendation {
  id: string
  type: 'requirement' | 'assessment' | 'gap' | 'workflow'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  impact: string
  effort: 'low' | 'medium' | 'high'
  estimated_completion: string
  related_items: any[]
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Compliance Status & Overview
export const getComplianceStatus = async (dataSourceId: number): Promise<ComplianceStatus> => {
  const response = await axios.get(`/api/compliance/status/${dataSourceId}`)
  return response.data
}

export const getComplianceOverview = async (): Promise<ComplianceOverview> => {
  const response = await axios.get('/api/compliance/overview')
  return response.data
}

// Compliance Requirements
export const getComplianceRequirements = async (
  dataSourceId: number,
  framework?: string,
  status?: string
): Promise<ComplianceRequirement[]> => {
  const params = new URLSearchParams()
  if (framework) params.append('framework', framework)
  if (status) params.append('status', status)
  
  const response = await axios.get(`/api/compliance/requirements/${dataSourceId}?${params}`)
  return response.data
}

export const createComplianceRequirement = async (requirementData: Partial<ComplianceRequirement>): Promise<ComplianceRequirement> => {
  const response = await axios.post('/api/compliance/requirements', requirementData)
  return response.data
}

export const updateComplianceRequirement = async (
  requirementId: number,
  updateData: Partial<ComplianceRequirement>
): Promise<ComplianceRequirement> => {
  const response = await axios.put(`/api/compliance/requirements/${requirementId}`, updateData)
  return response.data
}

export const deleteComplianceRequirement = async (requirementId: number): Promise<void> => {
  await axios.delete(`/api/compliance/requirements/${requirementId}`)
}

// Compliance Assessments
export const getComplianceAssessments = async (
  dataSourceId: number,
  limit: number = 10
): Promise<ComplianceAssessment[]> => {
  const response = await axios.get(`/api/compliance/assessments/${dataSourceId}?limit=${limit}`)
  return response.data
}

export const startComplianceAssessment = async (assessmentData: Partial<ComplianceAssessment>): Promise<ComplianceAssessment> => {
  const response = await axios.post('/api/compliance/assessments', assessmentData)
  return response.data
}

export const updateAssessmentStatus = async (
  assessmentId: number,
  status: string
): Promise<void> => {
  await axios.put(`/api/compliance/assessments/${assessmentId}/status`, { status })
}

// Compliance Gaps
export const getComplianceGaps = async (
  dataSourceId: number,
  status?: string,
  severity?: string
): Promise<ComplianceGap[]> => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (severity) params.append('severity', severity)
  
  const response = await axios.get(`/api/compliance/gaps/${dataSourceId}?${params}`)
  return response.data
}

export const createComplianceGap = async (gapData: Partial<ComplianceGap>): Promise<ComplianceGap> => {
  const response = await axios.post('/api/compliance/gaps', gapData)
  return response.data
}

export const updateComplianceGap = async (
  gapId: number,
  updateData: Partial<ComplianceGap>
): Promise<ComplianceGap> => {
  const response = await axios.put(`/api/compliance/gaps/${gapId}`, updateData)
  return response.data
}

// Compliance Analytics
export const getComplianceTrends = async (
  dataSourceId?: number,
  framework?: string,
  days: number = 30
): Promise<ComplianceTrends> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  if (framework) params.append('framework', framework)
  params.append('days', days.toString())
  
  const response = await axios.get(`/api/compliance/analytics/trends?${params}`)
  return response.data
}

export const getComplianceRiskAssessment = async (
  dataSourceId?: number
): Promise<ComplianceRiskAssessment> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  
  const response = await axios.get(`/api/compliance/analytics/risk-assessment?${params}`)
  return response.data
}

export const getComplianceRecommendations = async (
  dataSourceId?: number
): Promise<ComplianceRecommendation[]> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  
  const response = await axios.get(`/api/compliance/analytics/recommendations?${params}`)
  return response.data
}

// Compliance Workflows
export const triggerAutomatedComplianceCheck = async (
  dataSourceId: number,
  frameworks: string[]
): Promise<void> => {
  await axios.post('/api/compliance/workflows/automated-check', {
    data_source_id: dataSourceId,
    frameworks
  })
}

export const createRemediationWorkflow = async (gapId: number): Promise<any> => {
  const response = await axios.post('/api/compliance/workflows/remediation', { gap_id: gapId })
  return response.data
}

// Compliance Reporting
export const generateComplianceReport = async (
  dataSourceId?: number,
  framework?: string,
  reportType: string = 'comprehensive'
): Promise<void> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  if (framework) params.append('framework', framework)
  params.append('report_type', reportType)
  
  await axios.get(`/api/compliance/reports/generate?${params}`)
}

export const exportComplianceData = async (
  dataSourceId?: number,
  format: string = 'json'
): Promise<{ export_url: string }> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  params.append('format', format)
  
  const response = await axios.get(`/api/compliance/reports/export?${params}`)
  return response.data
}

// Compliance Integrations
export const getComplianceFrameworks = async (): Promise<any[]> => {
  const response = await axios.get('/api/compliance/integrations/frameworks')
  return response.data
}

export const validateComplianceIntegration = async (integrationConfig: any): Promise<any> => {
  const response = await axios.post('/api/compliance/integrations/validate', integrationConfig)
  return response.data
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

// Compliance Status & Overview Hooks
export const useComplianceStatus = (dataSourceId: number) => {
  return useQuery({
    queryKey: ['compliance', 'status', dataSourceId],
    queryFn: () => getComplianceStatus(dataSourceId),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    enabled: !!dataSourceId
  })
}

export const useComplianceOverview = () => {
  return useQuery({
    queryKey: ['compliance', 'overview'],
    queryFn: getComplianceOverview,
    staleTime: 300000, // 5 minutes
    refetchInterval: 120000 // 2 minutes
  })
}

// Compliance Requirements Hooks
export const useComplianceRequirements = (
  dataSourceId: number,
  framework?: string,
  status?: string
) => {
  return useQuery({
    queryKey: ['compliance', 'requirements', dataSourceId, framework, status],
    queryFn: () => getComplianceRequirements(dataSourceId, framework, status),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    enabled: !!dataSourceId
  })
}

export const useCreateComplianceRequirement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createComplianceRequirement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'requirements'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    }
  })
}

export const useUpdateComplianceRequirement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ requirementId, updateData }: { requirementId: number; updateData: Partial<ComplianceRequirement> }) =>
      updateComplianceRequirement(requirementId, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'requirements'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    }
  })
}

export const useDeleteComplianceRequirement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteComplianceRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'requirements'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    }
  })
}

// Compliance Assessments Hooks
export const useComplianceAssessments = (dataSourceId: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['compliance', 'assessments', dataSourceId, limit],
    queryFn: () => getComplianceAssessments(dataSourceId, limit),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    enabled: !!dataSourceId
  })
}

export const useStartComplianceAssessment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: startComplianceAssessment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'assessments'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
    }
  })
}

export const useUpdateAssessmentStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ assessmentId, status }: { assessmentId: number; status: string }) =>
      updateAssessmentStatus(assessmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'assessments'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
    }
  })
}

// Compliance Gaps Hooks
export const useComplianceGaps = (
  dataSourceId: number,
  status?: string,
  severity?: string
) => {
  return useQuery({
    queryKey: ['compliance', 'gaps', dataSourceId, status, severity],
    queryFn: () => getComplianceGaps(dataSourceId, status, severity),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    enabled: !!dataSourceId
  })
}

export const useCreateComplianceGap = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createComplianceGap,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'gaps'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    }
  })
}

export const useUpdateComplianceGap = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ gapId, updateData }: { gapId: number; updateData: Partial<ComplianceGap> }) =>
      updateComplianceGap(gapId, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'gaps'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
    }
  })
}

// Compliance Analytics Hooks
export const useComplianceTrends = (
  dataSourceId?: number,
  framework?: string,
  days: number = 30
) => {
  return useQuery({
    queryKey: ['compliance', 'trends', dataSourceId, framework, days],
    queryFn: () => getComplianceTrends(dataSourceId, framework, days),
    staleTime: 600000, // 10 minutes
    refetchInterval: 300000 // 5 minutes
  })
}

export const useComplianceRiskAssessment = (dataSourceId?: number) => {
  return useQuery({
    queryKey: ['compliance', 'risk-assessment', dataSourceId],
    queryFn: () => getComplianceRiskAssessment(dataSourceId),
    staleTime: 600000, // 10 minutes
    refetchInterval: 300000 // 5 minutes
  })
}

export const useComplianceRecommendations = (dataSourceId?: number) => {
  return useQuery({
    queryKey: ['compliance', 'recommendations', dataSourceId],
    queryFn: () => getComplianceRecommendations(dataSourceId),
    staleTime: 600000, // 10 minutes
    refetchInterval: 300000 // 5 minutes
  })
}

// Compliance Workflows Hooks
export const useTriggerAutomatedComplianceCheck = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dataSourceId, frameworks }: { dataSourceId: number; frameworks: string[] }) =>
      triggerAutomatedComplianceCheck(dataSourceId, frameworks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'requirements'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'gaps'] })
    }
  })
}

export const useCreateRemediationWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createRemediationWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'gaps'] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    }
  })
}

// Compliance Reporting Hooks
export const useGenerateComplianceReport = () => {
  return useMutation({
    mutationFn: ({ dataSourceId, framework, reportType }: {
      dataSourceId?: number
      framework?: string
      reportType?: string
    }) => generateComplianceReport(dataSourceId, framework, reportType)
  })
}

export const useExportComplianceData = () => {
  return useMutation({
    mutationFn: ({ dataSourceId, format }: { dataSourceId?: number; format?: string }) =>
      exportComplianceData(dataSourceId, format)
  })
}

// Compliance Integrations Hooks
export const useComplianceFrameworks = () => {
  return useQuery({
    queryKey: ['compliance', 'frameworks'],
    queryFn: getComplianceFrameworks,
    staleTime: 1800000, // 30 minutes
  })
}

export const useValidateComplianceIntegration = () => {
  return useMutation({
    mutationFn: validateComplianceIntegration
  })
}

// ============================================================================
// ENTERPRISE FEATURES
// ============================================================================

// Real-time compliance monitoring
export const useComplianceMonitoring = (dataSourceId?: number) => {
  const { data: status } = useComplianceStatus(dataSourceId || 0)
  const { data: gaps } = useComplianceGaps(dataSourceId || 0)
  const { data: trends } = useComplianceTrends(dataSourceId)
  const { data: riskAssessment } = useComplianceRiskAssessment(dataSourceId)
  
  return {
    status,
    gaps,
    trends,
    riskAssessment,
    hasViolations: gaps?.some(gap => gap.status === 'open'),
    criticalGaps: gaps?.filter(gap => gap.severity === 'critical') || [],
    highRiskGaps: gaps?.filter(gap => gap.severity === 'high') || [],
    complianceScore: status?.overall_score || 0,
    riskLevel: riskAssessment?.risk_level || 'low'
  }
}

// AI-powered compliance insights
export const useComplianceAI = (dataSourceId?: number) => {
  const { data: recommendations } = useComplianceRecommendations(dataSourceId)
  const { data: trends } = useComplianceTrends(dataSourceId)
  const { data: riskAssessment } = useComplianceRiskAssessment(dataSourceId)
  
  return {
    recommendations,
    trends,
    riskAssessment,
    insights: trends?.insights || [],
    aiRecommendations: recommendations?.filter(rec => rec.priority === 'high' || rec.priority === 'critical') || [],
    riskFactors: riskAssessment?.risk_factors || []
  }
}

// Cross-group integration
export const useComplianceCrossGroupIntegration = (dataSourceId?: number) => {
  const { data: status } = useComplianceStatus(dataSourceId || 0)
  const { data: gaps } = useComplianceGaps(dataSourceId || 0)
  
  // This would integrate with data sources, scan logic, and data catalog
  const crossGroupData = {
    dataSourceCompliance: status,
    scanResultsCompliance: [], // Would integrate with scan logic
    catalogEntityCompliance: [], // Would integrate with data catalog
    complianceGaps: gaps
  }
  
  return crossGroupData
}