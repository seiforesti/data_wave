export interface ComplianceRule {
  id: number
  name: string
  description: string
  category: string // e.g., "Data Protection", "Access Control", "Data Quality"
  severity: "critical" | "high" | "medium" | "low"
  compliance_standard: string // e.g., "GDPR", "HIPAA", "PCI DSS"
  applies_to: "column" | "table" | "schema" | "database"
  rule_type: "pattern" | "value" | "metadata" | "relationship" | "custom"
  rule_definition: string // JSON string or regex pattern
  status: "active" | "inactive" | "draft" | "archived"
  is_global: boolean // True if applies to all data sources, false if specific
  data_source_ids: number[] // List of data source IDs if not global
  remediation_steps?: string
  reference_link?: string // URL to external documentation
  validation_frequency: "continuous" | "daily" | "weekly" | "monthly"
  auto_remediation: boolean
  business_impact: "low" | "medium" | "high" | "critical"
  regulatory_requirement: boolean
  tags: string[]
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  pass_rate: number // Percentage of entities passing the rule
  total_entities: number
  passing_entities: number
  failing_entities: number
  last_validation: string // Timestamp of last validation run
  escalation_rules: EscalationRule[]
  audit_trail: AuditEntry[]
}

export interface ComplianceIssue {
  id: number
  rule_id: number
  rule_name: string
  data_source_id: number
  data_source_name: string
  entity_type: "column" | "table" | "schema" | "database"
  entity_name: string
  schema_name?: string
  table_name?: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "in_progress" | "resolved" | "false_positive" | "closed"
  detected_at: string
  resolved_at?: string
  assigned_to?: string
  business_impact?: string
  estimated_cost?: number
  remediation_effort?: "low" | "medium" | "high"
  external_ticket_id?: string
  external_system?: string // e.g., "jira", "servicenow"
  sla_deadline?: string
  escalated: boolean
  escalation_level: number
  workflow_status: WorkflowStatus
  tags?: string[]
  audit_trail?: AuditEntry[]
}

export interface WorkflowStatus {
  stage: string // e.g., "triage", "remediation", "review"
  progress: number // 0-100 percentage
  next_action: string
  due_date?: string
  automation_enabled: boolean
}

export interface EscalationRule {
  id: number
  level: number
  condition: string // e.g., "issue_open_for_24h", "severity_critical"
  action: "notify_team" | "create_ticket" | "auto_remediate"
  target: string // e.g., "security_team@example.com", "JIRA"
}

export interface AuditEntry {
  timestamp: string
  user: string
  action: string // e.g., "Rule created", "Issue status changed", "Rule validated"
  details: Record<string, any>
}

export interface ComplianceSummary {
  total_rules: number
  active_rules: number
  inactive_rules: number
  total_issues: number
  open_issues: number
  resolved_issues: number
  critical_issues: number
  high_issues: number
  medium_issues: number
  low_issues: number
  overall_compliance_score: number // 0-100
  compliance_trend: { date: string; score: number }[]
  issues_by_category: { category: string; count: number }[]
  issues_by_severity: { severity: string; count: number }[]
  regulatory_compliance_status: { standard: string; compliant: boolean; issues: number }[]
  sensitive_data_exposure_score: number // 0-100
  risk_score: number // 0-100
  average_remediation_time_hours: number
  data_source_compliance: { id: number; name: string; score: number; issues: number }[]
}

export interface ComplianceReport {
  id: number
  name: string
  description: string
  type: "summary" | "detail" | "trend" | "custom"
  format: "pdf" | "csv" | "json" | "xlsx"
  schedule?: "daily" | "weekly" | "monthly" | "quarterly" | "on_demand"
  recipients?: string[]
  filters?: Record<string, any>
  template_id?: string
  last_generated_at?: string
  generated_by?: string
  status: "pending" | "generating" | "completed" | "failed"
  file_url?: string
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
}

export interface IntegrationConfig {
  id: number
  name: string
  type: "jira" | "servicenow" | "slack" | "email" | "custom_webhook"
  status: "active" | "inactive" | "error"
  config: Record<string, any> // e.g., { url, api_key, project_id }
  last_synced_at?: string
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
  error_message?: string
}

export interface ComplianceWorkflow {
  id: number
  name: string
  description: string
  trigger: "rule_violation" | "issue_status_change" | "manual" | "scheduled"
  trigger_config: Record<string, any> // e.g., { rule_id, severity, status }
  actions: WorkflowAction[]
  status: "active" | "inactive"
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
  last_run_at?: string
  last_run_status?: "success" | "failed" | "running"
  execution_history?: WorkflowExecution[]
}

export interface WorkflowAction {
  id: string // Unique ID for the action within the workflow
  type: "create_issue" | "send_notification" | "update_issue" | "run_remediation" | "call_webhook" | "approval"
  config: Record<string, any>
  order: number // Order of execution
}

export interface WorkflowExecution {
  id: string
  workflow_id: number
  started_at: string
  completed_at?: string
  status: "running" | "completed" | "failed" | "cancelled"
  triggered_by: string
  context: Record<string, any>
  error_message?: string
}
