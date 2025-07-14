import type {
  ComplianceRule,
  ComplianceIssue,
  ComplianceSummary,
  ComplianceReport,
  IntegrationConfig,
  ComplianceWorkflow,
  WorkflowExecution,
} from "../types"

// Mock Data
let mockComplianceRules: ComplianceRule[] = [
  {
    id: 1,
    name: "PII Data Encryption Rule",
    description: "Ensures all Personally Identifiable Information (PII) columns are encrypted at rest.",
    category: "Data Protection",
    severity: "critical",
    compliance_standard: "GDPR",
    applies_to: "column",
    rule_type: "pattern",
    rule_definition: '{"regex": ".*(email|ssn|credit_card|phone_number).*", "case_sensitive": false}',
    status: "active",
    is_global: true,
    data_source_ids: [],
    remediation_steps: "Encrypt the identified column using AES-256 encryption. Update data dictionary.",
    reference_link: "https://example.com/gdpr-encryption-guidelines",
    validation_frequency: "daily",
    auto_remediation: false,
    business_impact: "critical",
    regulatory_requirement: true,
    tags: ["PII", "Encryption", "GDPR"],
    created_at: "2023-01-15T10:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-01-20T14:30:00Z",
    updated_by: "admin@example.com",
    pass_rate: 98.5,
    total_entities: 1200,
    passing_entities: 1182,
    failing_entities: 18,
    last_validation: "2024-07-10T08:00:00Z",
    escalation_rules: [],
    audit_trail: [],
  },
  {
    id: 2,
    name: "Data Retention Policy for Logs",
    description: "Ensures log data is purged after 90 days as per company policy.",
    category: "Data Lifecycle",
    severity: "high",
    compliance_standard: "Internal Policy",
    applies_to: "table",
    rule_type: "metadata",
    rule_definition: '{"retention_period_days": 90, "field": "created_at"}',
    status: "active",
    is_global: false,
    data_source_ids: [1, 3],
    remediation_steps: "Implement automated data purging script for affected tables.",
    validation_frequency: "weekly",
    auto_remediation: true,
    business_impact: "medium",
    regulatory_requirement: false,
    tags: ["Logs", "Retention", "Automation"],
    created_at: "2023-03-01T11:00:00Z",
    created_by: "data.owner@example.com",
    updated_at: "2024-06-25T09:15:00Z",
    updated_by: "data.owner@example.com",
    pass_rate: 95.0,
    total_entities: 50,
    passing_entities: 47,
    failing_entities: 3,
    last_validation: "2024-07-08T10:00:00Z",
    escalation_rules: [],
    audit_trail: [],
  },
  {
    id: 3,
    name: "Access Control for Financial Data",
    description: "Verifies that only authorized roles have access to financial tables.",
    category: "Access Control",
    severity: "critical",
    compliance_standard: "SOX",
    applies_to: "table",
    rule_type: "relationship",
    rule_definition: '{"required_roles": ["finance_admin", "auditor"], "table_prefix": "fin_"}',
    status: "active",
    is_global: false,
    data_source_ids: [2],
    remediation_steps: "Revoke unauthorized access. Review and update IAM policies.",
    validation_frequency: "daily",
    auto_remediation: false,
    business_impact: "critical",
    regulatory_requirement: true,
    tags: ["Access Control", "SOX", "Security"],
    created_at: "2023-05-10T09:30:00Z",
    created_by: "security.lead@example.com",
    updated_at: "2024-07-01T16:00:00Z",
    updated_by: "security.lead@example.com",
    pass_rate: 100.0,
    total_entities: 25,
    passing_entities: 25,
    failing_entities: 0,
    last_validation: "2024-07-10T08:00:00Z",
    escalation_rules: [],
    audit_trail: [],
  },
  {
    id: 4,
    name: "Data Quality: Customer Name Format",
    description: "Ensures customer names adhere to a standard format (e.g., Title Case).",
    category: "Data Quality",
    severity: "medium",
    compliance_standard: "Internal Policy",
    applies_to: "column",
    rule_type: "pattern",
    rule_definition: '{"regex": "^[A-Z][a-z]+(?: [A-Z][a-z]+)*$"}',
    status: "active",
    is_global: true,
    data_source_ids: [],
    remediation_steps: "Cleanse data using a data quality tool or script.",
    validation_frequency: "weekly",
    auto_remediation: false,
    business_impact: "low",
    regulatory_requirement: false,
    tags: ["Data Quality", "Customer Data"],
    created_at: "2023-07-20T14:00:00Z",
    created_by: "data.steward@example.com",
    updated_at: "2024-05-15T11:00:00Z",
    updated_by: "data.steward@example.com",
    pass_rate: 90.0,
    total_entities: 5000,
    passing_entities: 4500,
    failing_entities: 500,
    last_validation: "2024-07-05T12:00:00Z",
    escalation_rules: [],
    audit_trail: [],
  },
  {
    id: 5,
    name: "Database Schema Naming Convention",
    description: "Verifies that all new database schemas follow the 'proj_env_name' convention.",
    category: "Governance",
    severity: "low",
    compliance_standard: "Internal Policy",
    applies_to: "schema",
    rule_type: "pattern",
    rule_definition: '{"regex": "^[a-z]{3}_(dev|qa|prod)_[a-z_]+$"}',
    status: "inactive",
    is_global: true,
    data_source_ids: [],
    remediation_steps: "Rename non-compliant schemas. Update schema creation guidelines.",
    validation_frequency: "monthly",
    auto_remediation: false,
    business_impact: "low",
    regulatory_requirement: false,
    tags: ["Schema", "Naming", "Governance"],
    created_at: "2023-09-01T09:00:00Z",
    created_by: "platform.eng@example.com",
    updated_at: "2024-04-01T10:00:00Z",
    updated_by: "platform.eng@example.com",
    pass_rate: 80.0,
    total_entities: 100,
    passing_entities: 80,
    failing_entities: 20,
    last_validation: "2024-06-01T09:00:00Z",
    escalation_rules: [],
    audit_trail: [],
  },
]

const mockComplianceIssues: ComplianceIssue[] = [
  {
    id: 101,
    rule_id: 1,
    rule_name: "PII Data Encryption Rule",
    data_source_id: 1,
    data_source_name: "Customer Database",
    entity_type: "column",
    entity_name: "customer_email",
    schema_name: "public",
    table_name: "customers",
    description: "Unencrypted email column detected in 'customers' table.",
    severity: "critical",
    status: "open",
    detected_at: "2024-07-10T08:05:00Z",
    business_impact: "High risk of GDPR violation",
    estimated_cost: 50000,
    remediation_effort: "medium",
    external_ticket_id: "JIRA-123",
    external_system: "jira",
    sla_deadline: "2024-07-12T08:05:00Z",
    escalated: true,
    escalation_level: 1,
    workflow_status: {
      stage: "triage",
      progress: 25,
      next_action: "Assign to security team",
      due_date: "2024-07-11T08:05:00Z",
      automation_enabled: true,
    },
    tags: ["PII", "Encryption"],
    audit_trail: [
      { timestamp: "2024-07-10T08:05:00Z", user: "system", action: "Issue detected", details: {} },
      { timestamp: "2024-07-10T08:10:00Z", user: "system", action: "Escalated to Level 1", details: {} },
    ],
  },
  {
    id: 102,
    rule_id: 2,
    rule_name: "Data Retention Policy for Logs",
    data_source_id: 3,
    data_source_name: "Audit Logs DB",
    entity_type: "table",
    entity_name: "old_user_activity",
    schema_name: "audit",
    table_name: "user_activity",
    description: "Log table 'old_user_activity' exceeds 90-day retention policy.",
    severity: "high",
    status: "in_progress",
    detected_at: "2024-07-08T10:15:00Z",
    assigned_to: "dev.ops@example.com",
    remediation_effort: "low",
    workflow_status: {
      stage: "remediation",
      progress: 75,
      next_action: "Verify purging script",
      due_date: "2024-07-15T10:15:00Z",
      automation_enabled: true,
    },
    tags: ["Retention", "Logs"],
    audit_trail: [
      { timestamp: "2024-07-08T10:15:00Z", user: "system", action: "Issue detected", details: {} },
      { timestamp: "2024-07-08T10:20:00Z", user: "system", action: "Auto-remediation initiated", details: {} },
    ],
  },
  {
    id: 103,
    rule_id: 4,
    rule_name: "Data Quality: Customer Name Format",
    data_source_id: 1,
    data_source_name: "Customer Database",
    entity_type: "column",
    entity_name: "customer_name",
    schema_name: "public",
    table_name: "customers",
    description: "Customer name 'john doe' does not follow Title Case format.",
    severity: "medium",
    status: "open",
    detected_at: "2024-07-05T12:30:00Z",
    assigned_to: "data.steward@example.com",
    remediation_effort: "medium",
    workflow_status: {
      stage: "triage",
      progress: 10,
      next_action: "Review data quality report",
      due_date: "2024-07-14T12:30:00Z",
      automation_enabled: false,
    },
    tags: ["Data Quality"],
    audit_trail: [{ timestamp: "2024-07-05T12:30:00Z", user: "system", action: "Issue detected", details: {} }],
  },
  {
    id: 104,
    rule_id: 1,
    rule_name: "PII Data Encryption Rule",
    data_source_id: 2,
    data_source_name: "Analytics Warehouse",
    entity_type: "column",
    entity_name: "user_ssn_hash",
    schema_name: "analytics",
    table_name: "user_profiles",
    description: "SSN hash column found, but encryption status is unclear.",
    severity: "low",
    status: "resolved",
    detected_at: "2024-07-01T09:00:00Z",
    resolved_at: "2024-07-02T11:00:00Z",
    assigned_to: "security.analyst@example.com",
    remediation_effort: "low",
    workflow_status: {
      stage: "closed",
      progress: 100,
      next_action: "None",
      due_date: "2024-07-02T09:00:00Z",
      automation_enabled: false,
    },
    tags: ["PII", "Encryption"],
    audit_trail: [
      { timestamp: "2024-07-01T09:00:00Z", user: "system", action: "Issue detected", details: {} },
      {
        timestamp: "2024-07-02T11:00:00Z",
        user: "security.analyst@example.com",
        action: "Issue resolved",
        details: { resolution: "Confirmed encrypted" },
      },
    ],
  },
]

let mockComplianceReports: ComplianceReport[] = [
  {
    id: 1,
    name: "Monthly GDPR Compliance Summary",
    description: "Overview of GDPR compliance status for the past month.",
    type: "summary",
    format: "pdf",
    schedule: "monthly",
    recipients: ["ceo@example.com", "cto@example.com"],
    filters: { compliance_standard: "GDPR", period: "last_month" },
    template_id: "gdpr-summary-template",
    last_generated_at: "2024-07-01T08:00:00Z",
    generated_by: "reporting.user@example.com",
    status: "completed",
    file_url: "/reports/gdpr_summary_jul_2024.pdf",
    created_at: "2023-12-01T09:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-06-15T10:00:00Z",
    updated_by: "admin@example.com",
  },
  {
    id: 2,
    name: "Critical Issues Detail Report",
    description: "Detailed report on all open critical compliance issues.",
    type: "detail",
    format: "csv",
    schedule: "weekly",
    recipients: ["security@example.com"],
    filters: { severity: "critical", status: "open" },
    template_id: "critical-issues-template",
    last_generated_at: "2024-07-08T15:00:00Z",
    generated_by: "reporting.user@example.com",
    status: "completed",
    file_url: "/reports/critical_issues_jul_08_2024.csv",
    created_at: "2024-01-10T10:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-07-05T11:00:00Z",
    updated_by: "admin@example.com",
  },
  {
    id: 3,
    name: "PCI DSS Audit Report",
    description: "Annual report for PCI DSS compliance audit.",
    type: "audit",
    format: "pdf",
    schedule: "on_demand",
    recipients: ["auditors@example.com"],
    filters: { compliance_standard: "PCI DSS" },
    template_id: "pci-audit-template",
    last_generated_at: null,
    generated_by: null,
    status: "pending",
    file_url: null,
    created_at: "2024-03-01T13:00:00Z",
    created_by: "compliance@example.com",
    updated_at: "2024-03-01T13:00:00Z",
    updated_by: "compliance@example.com",
  },
]

let mockIntegrations: IntegrationConfig[] = [
  {
    id: 1,
    name: "Jira Integration",
    type: "jira",
    status: "active",
    config: {
      url: "https://yourcompany.atlassian.net",
      api_key: "sk-jira-xyz",
      project_key: "COMP",
      issue_type: "Task",
    },
    last_synced_at: "2024-07-10T16:00:00Z",
    created_at: "2023-06-01T10:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-07-01T10:00:00Z",
    updated_by: "admin@example.com",
  },
  {
    id: 2,
    name: "Slack Notifications",
    type: "slack",
    status: "active",
    config: {
      webhook_url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      channel: "#compliance-alerts",
    },
    last_synced_at: "2024-07-10T16:05:00Z",
    created_at: "2023-08-15T11:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-07-01T11:00:00Z",
    updated_by: "admin@example.com",
  },
  {
    id: 3,
    name: "ServiceNow Integration",
    type: "servicenow",
    status: "inactive",
    config: {
      instance_url: "https://yourcompany.service-now.com",
      username: "api_user",
      password: "password",
    },
    last_synced_at: null,
    created_at: "2024-01-20T14:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-01-20T14:00:00Z",
    updated_by: "admin@example.com",
  },
]

let mockWorkflows: ComplianceWorkflow[] = [
  {
    id: 1,
    name: "Critical PII Violation Remediation",
    description: "Automated workflow for critical PII data encryption rule violations.",
    trigger: "rule_violation",
    trigger_config: { rule_id: 1, severity: "critical" },
    actions: [
      {
        id: "action-1",
        type: "create_issue",
        config: { severity: "critical", assigned_to: "security_team" },
        order: 1,
      },
      {
        id: "action-2",
        type: "send_notification",
        config: { target: "slack", message: "Critical PII violation detected!" },
        order: 2,
      },
      { id: "action-3", type: "run_remediation", config: { script_name: "encrypt_column.sh" }, order: 3 },
    ],
    status: "active",
    created_at: "2024-02-01T09:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-06-01T09:00:00Z",
    updated_by: "admin@example.com",
    last_run_at: "2024-07-10T08:05:00Z",
    last_run_status: "success",
    execution_history: [
      {
        id: "exec-1",
        workflow_id: 1,
        started_at: "2024-07-10T08:05:00Z",
        completed_at: "2024-07-10T08:06:00Z",
        status: "completed",
        triggered_by: "system",
        context: { issueId: 101 },
      },
    ],
  },
  {
    id: 2,
    name: "High Severity Issue Escalation",
    description: "Escalates high severity issues if not resolved within 24 hours.",
    trigger: "issue_status_change",
    trigger_config: { status: "open", severity: "high", time_since_detection_hours: 24 },
    actions: [
      { id: "action-4", type: "update_issue", config: { status: "escalated", escalation_level: 1 }, order: 1 },
      {
        id: "action-5",
        type: "send_notification",
        config: { target: "email", recipients: ["management@example.com"] },
        order: 2,
      },
    ],
    status: "active",
    created_at: "2024-03-10T10:00:00Z",
    created_by: "admin@example.com",
    updated_at: "2024-03-10T10:00:00Z",
    updated_by: "admin@example.com",
    last_run_at: "2024-07-08T10:15:00Z",
    last_run_status: "success",
    execution_history: [
      {
        id: "exec-2",
        workflow_id: 2,
        started_at: "2024-07-08T10:15:00Z",
        completed_at: "2024-07-08T10:16:00Z",
        status: "completed",
        triggered_by: "system",
        context: { issueId: 102 },
      },
    ],
  },
  {
    id: 3,
    name: "Monthly Compliance Report Generation",
    description: "Generates the monthly compliance summary report.",
    trigger: "scheduled",
    trigger_config: { frequency: "monthly", day_of_month: 1, time: "08:00" },
    actions: [{ id: "action-6", type: "run_remediation", config: { report_id: 1 }, order: 1 }], // Reusing run_remediation for report generation
    status: "inactive",
    created_at: "2024-04-01T10:00:00Z",
    created_by: "reporting.user@example.com",
    updated_at: "2024-04-01T10:00:00Z",
    updated_by: "reporting.user@example.com",
    last_run_at: null,
    last_run_status: null,
    execution_history: [],
  },
]

// Simulate API calls with a delay
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  rules: {
    async getAll(): Promise<ComplianceRule[]> {
      await simulateDelay(500)
      return mockComplianceRules
    },
    async getById(id: number): Promise<ComplianceRule | undefined> {
      await simulateDelay(300)
      return mockComplianceRules.find((rule) => rule.id === id)
    },
    async create(
      newRule: Omit<
        ComplianceRule,
        | "id"
        | "created_at"
        | "updated_at"
        | "pass_rate"
        | "total_entities"
        | "passing_entities"
        | "failing_entities"
        | "last_validation"
        | "escalation_rules"
        | "audit_trail"
      >,
    ): Promise<ComplianceRule> {
      await simulateDelay(700)
      const rule: ComplianceRule = {
        ...newRule,
        id: Date.now(), // Simple ID generation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pass_rate: 100, // New rules start with 100% pass rate
        total_entities: 0,
        passing_entities: 0,
        failing_entities: 0,
        last_validation: new Date().toISOString(),
        escalation_rules: [],
        audit_trail: [
          {
            timestamp: new Date().toISOString(),
            user: newRule.created_by || "system",
            action: "Rule created",
            details: { ruleName: newRule.name },
          },
        ],
      }
      mockComplianceRules.push(rule)
      return rule
    },
    async update(id: number, updatedFields: Partial<ComplianceRule>): Promise<ComplianceRule | undefined> {
      await simulateDelay(700)
      const index = mockComplianceRules.findIndex((rule) => rule.id === id)
      if (index > -1) {
        const oldRule = mockComplianceRules[index]
        const updatedRule = {
          ...oldRule,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          audit_trail: [
            ...(oldRule.audit_trail || []),
            {
              timestamp: new Date().toISOString(),
              user: updatedFields.updated_by || "system",
              action: "Rule updated",
              details: { fields: Object.keys(updatedFields) },
            },
          ],
        }
        mockComplianceRules[index] = updatedRule
        return updatedRule
      }
      return undefined
    },
    async delete(id: number): Promise<boolean> {
      await simulateDelay(500)
      const initialLength = mockComplianceRules.length
      mockComplianceRules = mockComplianceRules.filter((rule) => rule.id !== id)
      return mockComplianceRules.length < initialLength
    },
    async validate(id: number): Promise<ComplianceRule | undefined> {
      await simulateDelay(1500) // Simulate a longer validation process
      const rule = mockComplianceRules.find((r) => r.id === id)
      if (rule) {
        const newPassRate = Number.parseFloat((Math.random() * (100 - 80) + 80).toFixed(1)) // Simulate dynamic pass rate
        const newTotalEntities = rule.total_entities > 0 ? rule.total_entities : Math.floor(Math.random() * 1000) + 100
        const newPassingEntities = Math.round(newTotalEntities * (newPassRate / 100))
        const newFailingEntities = newTotalEntities - newPassingEntities

        const updatedRule = {
          ...rule,
          pass_rate: newPassRate,
          total_entities: newTotalEntities,
          passing_entities: newPassingEntities,
          failing_entities: newFailingEntities,
          last_validation: new Date().toISOString(),
          audit_trail: [
            ...(rule.audit_trail || []),
            {
              timestamp: new Date().toISOString(),
              user: "system",
              action: "Rule validated",
              details: { passRate: newPassRate },
            },
          ],
        }
        const index = mockComplianceRules.findIndex((r) => r.id === id)
        mockComplianceRules[index] = updatedRule
        return updatedRule
      }
      return undefined
    },
  },
  issues: {
    async getAll(filters?: { ruleId?: number; status?: string; severity?: string }): Promise<ComplianceIssue[]> {
      await simulateDelay(500)
      let filteredIssues = mockComplianceIssues
      if (filters?.ruleId) {
        filteredIssues = filteredIssues.filter((issue) => issue.rule_id === filters.ruleId)
      }
      if (filters?.status) {
        filteredIssues = filteredIssues.filter((issue) => issue.status === filters.status)
      }
      if (filters?.severity) {
        filteredIssues = filteredIssues.filter((issue) => issue.severity === filters.severity)
      }
      return filteredIssues
    },
    async getById(id: number): Promise<ComplianceIssue | undefined> {
      await simulateDelay(300)
      return mockComplianceIssues.find((issue) => issue.id === id)
    },
    async update(id: number, updatedFields: Partial<ComplianceIssue> = {}): Promise<ComplianceIssue | undefined> {
      await simulateDelay(700)
      const index = mockComplianceIssues.findIndex((issue) => issue.id === id)
      if (index > -1) {
        const oldIssue = mockComplianceIssues[index]
        const safeFields = updatedFields ?? {}
        const updatedIssue = {
          ...oldIssue,
          ...safeFields,
          audit_trail: [
            ...(oldIssue.audit_trail || []),
            {
              timestamp: new Date().toISOString(),
              user: safeFields.assigned_to || "system",
              action: "Issue updated",
              details: { fields: Object.keys(safeFields) },
            },
          ],
        }
        mockComplianceIssues[index] = updatedIssue
        return updatedIssue
      }
      return undefined
    },
  },
  summary: {
    async get(): Promise<ComplianceSummary> {
      await simulateDelay(600)
      const totalRules = mockComplianceRules.length
      const activeRules = mockComplianceRules.filter((r) => r.status === "active").length
      const inactiveRules = totalRules - activeRules

      const totalIssues = mockComplianceIssues.length
      const openIssues = mockComplianceIssues.filter((i) => i.status === "open" || i.status === "in_progress").length
      const resolvedIssues = mockComplianceIssues.filter(
        (i) => i.status === "resolved" || i.status === "closed" || i.status === "false_positive",
      ).length

      const criticalIssues = mockComplianceIssues.filter((i) => i.severity === "critical").length
      const highIssues = mockComplianceIssues.filter((i) => i.severity === "high").length
      const mediumIssues = mockComplianceIssues.filter((i) => i.severity === "medium").length
      const lowIssues = mockComplianceIssues.filter((i) => i.severity === "low").length

      const overallComplianceScore =
        Number.parseFloat((mockComplianceRules.reduce((sum, r) => sum + r.pass_rate, 0) / totalRules).toFixed(1)) || 0

      const complianceTrend = [
        { date: "2024-04-01", score: 85.0 },
        { date: "2024-05-01", score: 87.5 },
        { date: "2024-06-01", score: 90.2 },
        { date: "2024-07-01", score: overallComplianceScore },
      ]

      const issuesBySeverity = [
        { severity: "critical", count: criticalIssues },
        { severity: "high", count: highIssues },
        { severity: "medium", count: mediumIssues },
        { severity: "low", count: lowIssues },
      ]

      const issuesByCategory: { [key: string]: number } = {}
      mockComplianceIssues.forEach((issue) => {
        const rule = mockComplianceRules.find((r) => r.id === issue.rule_id)
        if (rule) {
          issuesByCategory[rule.category] = (issuesByCategory[rule.category] || 0) + 1
        }
      })

      const regulatoryComplianceStatus = [
        {
          standard: "GDPR",
          compliant: true,
          issues: mockComplianceIssues.filter((i) => i.rule_name === "PII Data Encryption Rule").length,
        },
        { standard: "HIPAA", compliant: true, issues: 0 },
        {
          standard: "SOX",
          compliant: true,
          issues: mockComplianceIssues.filter((i) => i.rule_name === "Access Control for Financial Data").length,
        },
      ]

      const sensitiveDataExposureScore = Number.parseFloat((Math.random() * 100).toFixed(1))
      const riskScore = Number.parseFloat((Math.random() * 100).toFixed(1))
      const averageRemediationTimeHours = Number.parseFloat((Math.random() * 24 + 1).toFixed(1))

      const dataSourceCompliance = [
        {
          id: 1,
          name: "Customer Database",
          score: 92.5,
          issues: mockComplianceIssues.filter((i) => i.data_source_id === 1).length,
        },
        {
          id: 2,
          name: "Analytics Warehouse",
          score: 98.0,
          issues: mockComplianceIssues.filter((i) => i.data_source_id === 2).length,
        },
        {
          id: 3,
          name: "Transaction System",
          score: 85.0,
          issues: mockComplianceIssues.filter((i) => i.data_source_id === 3).length,
        },
      ]

      return {
        total_rules: totalRules,
        active_rules: activeRules,
        inactive_rules: inactiveRules,
        total_issues: totalIssues,
        open_issues: openIssues,
        resolved_issues: resolvedIssues,
        critical_issues: criticalIssues,
        high_issues: highIssues,
        medium_issues: mediumIssues,
        low_issues: lowIssues,
        overall_compliance_score: overallComplianceScore,
        compliance_trend: complianceTrend,
        issues_by_category: Object.entries(issuesByCategory).map(([category, count]) => ({ category, count })),
        issues_by_severity: issuesBySeverity,
        regulatory_compliance_status: regulatoryComplianceStatus,
        sensitive_data_exposure_score: sensitiveDataExposureScore,
        risk_score: riskScore,
        average_remediation_time_hours: averageRemediationTimeHours,
        data_source_compliance: dataSourceCompliance,
      }
    },
  },
  reports: {
    async getAll(): Promise<ComplianceReport[]> {
      await simulateDelay(500)
      return mockComplianceReports
    },
    async create(
      newReport: Omit<ComplianceReport, "id" | "created_at" | "status" | "generated_by" | "updated_at" | "updated_by">,
    ): Promise<ComplianceReport> {
      await simulateDelay(700)
      const report: ComplianceReport = {
        ...newReport,
        id: Date.now(),
        created_at: new Date().toISOString(),
        created_by: "current-user@example.com",
        status: "pending",
        last_generated_at: null,
        generated_by: null,
        file_url: null,
      }
      mockComplianceReports.push(report)
      return report
    },
    async update(id: number, updatedFields: Partial<ComplianceReport>): Promise<ComplianceReport | undefined> {
      await simulateDelay(700)
      const index = mockComplianceReports.findIndex((report) => report.id === id)
      if (index > -1) {
        const oldReport = mockComplianceReports[index]
        const updatedReport = {
          ...oldReport,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          updated_by: "current-user@example.com",
        }
        mockComplianceReports[index] = updatedReport
        return updatedReport
      }
      return undefined
    },
    async delete(id: number): Promise<boolean> {
      await simulateDelay(500)
      const initialLength = mockComplianceReports.length
      mockComplianceReports = mockComplianceReports.filter((report) => report.id !== id)
      return mockComplianceReports.length < initialLength
    },
    async generate(id: number): Promise<ComplianceReport | undefined> {
      await simulateDelay(2000) // Simulate report generation time
      const report = mockComplianceReports.find((r) => r.id === id)
      if (report) {
        const updatedReport = {
          ...report,
          status: "completed" as const,
          last_generated_at: new Date().toISOString(),
          file_url: `/reports/${report.name.toLowerCase().replace(/\s/g, "_")}_${Date.now()}.${report.format}`,
          generated_by: "system",
        }
        const index = mockComplianceReports.findIndex((r) => r.id === id)
        mockComplianceReports[index] = updatedReport
        return updatedReport
      }
      return undefined
    },
  },
  integrations: {
    async getAll(): Promise<IntegrationConfig[]> {
      await simulateDelay(500)
      return mockIntegrations
    },
    async create(
      newIntegration: Omit<
        IntegrationConfig,
        "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
      >,
    ): Promise<IntegrationConfig> {
      await simulateDelay(700)
      const integration: IntegrationConfig = {
        ...newIntegration,
        id: Date.now(),
        created_at: new Date().toISOString(),
        created_by: "current-user@example.com",
        status: "active", // Assume active on creation
        last_synced_at: null,
      }
      mockIntegrations.push(integration)
      return integration
    },
    async update(id: number, updatedFields: Partial<IntegrationConfig>): Promise<IntegrationConfig | undefined> {
      await simulateDelay(700)
      const index = mockIntegrations.findIndex((integration) => integration.id === id)
      if (index > -1) {
        const oldIntegration = mockIntegrations[index]
        const updatedIntegration = {
          ...oldIntegration,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          updated_by: "current-user@example.com",
        }
        mockIntegrations[index] = updatedIntegration
        return updatedIntegration
      }
      return undefined
    },
    async delete(id: number): Promise<boolean> {
      await simulateDelay(500)
      const initialLength = mockIntegrations.length
      mockIntegrations = mockIntegrations.filter((integration) => integration.id !== id)
      return mockIntegrations.length < initialLength
    },
    async test(id: number): Promise<{ success: boolean; message: string }> {
      await simulateDelay(1000)
      const integration = mockIntegrations.find((i) => i.id === id)
      if (integration) {
        if (Math.random() > 0.1) {
          // 90% success rate
          const updatedIntegration = { ...integration, status: "active" as const, error_message: undefined }
          const index = mockIntegrations.findIndex((i) => i.id === id)
          mockIntegrations[index] = updatedIntegration
          return { success: true, message: `Integration '${integration.name}' tested successfully.` }
        } else {
          const updatedIntegration = { ...integration, status: "error" as const, error_message: "Connection failed." }
          const index = mockIntegrations.findIndex((i) => i.id === id)
          mockIntegrations[index] = updatedIntegration
          return { success: false, message: `Failed to connect to '${integration.name}'. Check configuration.` }
        }
      }
      return { success: false, message: "Integration not found." }
    },
    async toggleStatus(id: number): Promise<IntegrationConfig | undefined> {
      await simulateDelay(500)
      const index = mockIntegrations.findIndex((integration) => integration.id === id)
      if (index > -1) {
        const currentStatus = mockIntegrations[index].status
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        mockIntegrations[index] = { ...mockIntegrations[index], status: newStatus }
        return mockIntegrations[index]
      }
      return undefined
    },
  },
  workflows: {
    async getAll(): Promise<ComplianceWorkflow[]> {
      await simulateDelay(500)
      return mockWorkflows
    },
    async create(
      newWorkflow: Omit<
        ComplianceWorkflow,
        "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
      >,
    ): Promise<ComplianceWorkflow> {
      await simulateDelay(700)
      const workflow: ComplianceWorkflow = {
        ...newWorkflow,
        id: Date.now(),
        created_at: new Date().toISOString(),
        created_by: "current-user@example.com",
        last_run_at: null,
        last_run_status: null,
        execution_history: [],
      }
      mockWorkflows.push(workflow)
      return workflow
    },
    async update(id: number, updatedFields: Partial<ComplianceWorkflow>): Promise<ComplianceWorkflow | undefined> {
      await simulateDelay(700)
      const index = mockWorkflows.findIndex((workflow) => workflow.id === id)
      if (index > -1) {
        const oldWorkflow = mockWorkflows[index]
        const updatedWorkflow = {
          ...oldWorkflow,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          updated_by: "current-user@example.com",
        }
        mockWorkflows[index] = updatedWorkflow
        return updatedWorkflow
      }
      return undefined
    },
    async delete(id: number): Promise<boolean> {
      await simulateDelay(500)
      const initialLength = mockWorkflows.length
      mockWorkflows = mockWorkflows.filter((workflow) => workflow.id !== id)
      return mockWorkflows.length < initialLength
    },
    async execute(id: number): Promise<ComplianceWorkflow | undefined> {
      await simulateDelay(1500) // Simulate execution time
      const workflow = mockWorkflows.find((w) => w.id === id)
      if (workflow) {
        const success = Math.random() > 0.2 // 80% success rate
        const executionId = `exec-${Date.now()}`
        const newExecution: WorkflowExecution = {
          id: executionId,
          workflow_id: id,
          started_at: new Date().toISOString(),
          completed_at: new Date(Date.now() + 1000).toISOString(), // 1 second later
          status: success ? "completed" : "failed",
          triggered_by: "manual",
          context: {},
          error_message: success ? undefined : "Simulated execution failure.",
        }

        const updatedWorkflow = {
          ...workflow,
          last_run_at: new Date().toISOString(),
          last_run_status: success ? "success" : "failed",
          execution_history: [...(workflow.execution_history || []), newExecution],
        }
        const index = mockWorkflows.findIndex((w) => w.id === id)
        mockWorkflows[index] = updatedWorkflow
        return updatedWorkflow
      }
      return undefined
    },
    async toggleStatus(id: number): Promise<ComplianceWorkflow | undefined> {
      await simulateDelay(500)
      const index = mockWorkflows.findIndex((workflow) => workflow.id === id)
      if (index > -1) {
        const currentStatus = mockWorkflows[index].status
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        mockWorkflows[index] = { ...mockWorkflows[index], status: newStatus }
        return mockWorkflows[index]
      }
      return undefined
    },
  },
}
