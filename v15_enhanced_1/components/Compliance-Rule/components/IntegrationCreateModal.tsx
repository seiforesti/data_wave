"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Settings,
  Zap,
  MessageSquare,
  Mail,
  Bell,
  Webhook,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TestTube,
  RefreshCw
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceIntegration } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  integration_type: z.enum(["grc_tool", "security_scanner", "audit_platform", "risk_management", "documentation", "ticketing"]),
  provider: z.enum(["jira", "servicenow", "slack", "teams", "email", "pagerduty", "custom_webhook"]),
  config: z
    .string()
    .optional()
    .transform((str: string) => {
      try {
        return str ? JSON.parse(str) : {}
      } catch {
        return {}
      }
    })
    .refine((val: any) => typeof val === "object" && val !== null, {
      message: "Configuration must be a valid JSON object",
    }),
  sync_frequency: z.enum(["real_time", "hourly", "daily", "weekly", "manual"]).default("daily"),
  status: z.enum(["active", "inactive", "testing"]).default("testing"),
  supported_frameworks: z.array(z.string()).default([])
})

type FormData = z.infer<typeof formSchema>

interface IntegrationCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (integration: ComplianceIntegration) => void
  dataSourceId?: number
}

const integrationTypeOptions = [
  { value: "grc_tool", label: "GRC Tool", description: "Governance, Risk & Compliance platforms" },
  { value: "security_scanner", label: "Security Scanner", description: "Security scanning and monitoring tools" },
  { value: "audit_platform", label: "Audit Platform", description: "Audit management and tracking systems" },
  { value: "risk_management", label: "Risk Management", description: "Risk assessment and mitigation tools" },
  { value: "documentation", label: "Documentation", description: "Documentation and knowledge management" },
  { value: "ticketing", label: "Ticketing System", description: "Issue tracking and workflow management" }
]

const providerOptions = [
  { 
    value: "jira", 
    label: "Jira", 
    description: "Atlassian Jira issue tracking",
    icon: Settings,
    category: "ticketing"
  },
  { 
    value: "servicenow", 
    label: "ServiceNow", 
    description: "ServiceNow IT service management",
    icon: Settings,
    category: "ticketing"
  },
  { 
    value: "slack", 
    label: "Slack", 
    description: "Slack team communication",
    icon: MessageSquare,
    category: "communication"
  },
  { 
    value: "teams", 
    label: "Microsoft Teams", 
    description: "Microsoft Teams collaboration",
    icon: MessageSquare,
    category: "communication"
  },
  { 
    value: "email", 
    label: "Email", 
    description: "Email notifications and alerts",
    icon: Mail,
    category: "communication"
  },
  { 
    value: "pagerduty", 
    label: "PagerDuty", 
    description: "PagerDuty incident management",
    icon: Bell,
    category: "alerting"
  },
  { 
    value: "custom_webhook", 
    label: "Custom Webhook", 
    description: "Custom HTTP endpoint integration",
    icon: Webhook,
    category: "custom"
  },
]

export function IntegrationCreateModal({ isOpen, onClose, onSuccess, dataSourceId }: IntegrationCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [integrationTemplates, setIntegrationTemplates] = useState<any>({})
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [frameworks, setFrameworks] = useState<any[]>([])

  const { 
    executeAction, 
    sendNotification, 
    getMetrics,
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'IntegrationCreateModal',
    dataSourceId,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      integration_type: "grc_tool",
      provider: "jira",
      config: {},
      sync_frequency: "daily",
      status: "testing",
      supported_frameworks: []
    },
  })

  // Load templates and frameworks from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setTemplatesLoading(true)
        const [templatesData, frameworksData] = await Promise.all([
          ComplianceAPIs.Integration.getIntegrationTemplates(),
          ComplianceAPIs.Framework.getFrameworks()
        ])
        
        setIntegrationTemplates(templatesData)
        setFrameworks(frameworksData)
      } catch (error) {
        console.error('Failed to load data:', error)
        sendNotification('error', 'Failed to load integration templates and frameworks')
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen, sendNotification])

  const watchType = form.watch("integration_type")
  const watchProvider = form.watch("provider")

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const integrationData = {
        ...data,
        data_source_id: dataSourceId,
        credentials: {}, // Will be extracted from config
        last_synced_at: null,
        last_sync_status: null,
        sync_statistics: {
          total_records: 0,
          records_created: 0,
          records_updated: 0,
          records_failed: 0,
          last_sync_duration: 0,
          average_sync_duration: 0,
          success_rate: 0
        },
        error_message: null,
        error_count: 0,
        data_mapping: {},
        webhook_url: null,
        api_version: "v1",
        rate_limit: 100,
        timeout: 30,
        retry_config: {
          max_retries: 3,
          retry_delay: 1000,
          exponential_backoff: true
        },
        metadata: {
          created_via: 'modal',
          template_used: integrationTemplates[data.provider]?.id || data.provider
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "current-user@company.com",
        updated_by: "current-user@company.com"
      }

      const createdIntegration = await executeAction('createIntegration', integrationData)
      onSuccess(createdIntegration)
      sendNotification('success', `Integration "${data.name}" created successfully`)
      onClose()
      
      // Reset form for next use
      form.reset()
      setTestResult(null)
    } catch (error) {
      console.error("Failed to create integration:", error)
      sendNotification('error', 'Failed to create integration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setIsTestingConnection(true)
      setTestResult(null)
      
      const formData = form.getValues()
      
      // Create a test integration object
      const testData = {
        provider: formData.provider,
        config: formData.config,
        integration_type: formData.integration_type
      }

      // Test the connection using the API
      const result = await ComplianceAPIs.Integration.testIntegration(0) // Use 0 for test
      
      setTestResult({
        success: result.status === 'success',
        message: result.error_message || 'Connection test successful'
      })
      
      if (result.status === 'success') {
        sendNotification('success', 'Connection test successful')
      } else {
        sendNotification('error', `Connection test failed: ${result.error_message}`)
      }
    } catch (error) {
      console.error("Failed to test connection:", error)
      setTestResult({
        success: false,
        message: 'Connection test failed. Please check your configuration.'
      })
      sendNotification('error', 'Failed to test connection')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const loadTemplate = async () => {
    try {
      const template = await ComplianceAPIs.Integration.getIntegrationTemplate(watchProvider)
      if (template) {
        form.setValue('config', template.config || {})
        if (template.default_sync_frequency) {
          form.setValue('sync_frequency', template.default_sync_frequency)
        }
        if (template.supported_frameworks) {
          form.setValue('supported_frameworks', template.supported_frameworks)
        }
        sendNotification('info', 'Integration template loaded successfully')
      } else {
        sendNotification('warning', 'No template available for this provider')
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      sendNotification('error', 'Failed to load integration template')
    }
  }

  const getIntegrationCapabilities = (type: string) => {
    const capabilities = {
      grc_tool: ["Risk Assessment", "Compliance Tracking", "Audit Management"],
      security_scanner: ["Vulnerability Detection", "Security Monitoring", "Threat Analysis"],
      audit_platform: ["Audit Trail", "Evidence Collection", "Compliance Reporting"],
      risk_management: ["Risk Analysis", "Mitigation Planning", "Risk Monitoring"],
      documentation: ["Policy Management", "Procedure Documentation", "Knowledge Base"],
      ticketing: ["Issue Tracking", "Workflow Management", "Incident Response"]
    }
    return capabilities[type as keyof typeof capabilities] || []
  }

  const getConfigPlaceholder = (type: string) => {
    const template = integrationTemplates[type]
    if (template && template.config) {
      return JSON.stringify(template.config, null, 2)
    }
    return JSON.stringify({ message: "Loading template..." }, null, 2)
  }

  const getTestStatusIcon = () => {
    if (isTestingConnection) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    if (testResult?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (testResult?.success === false) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <TestTube className="h-4 w-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Plus className="h-5 w-5" />
            </motion.div>
            Add New Integration
          </DialogTitle>
          <DialogDescription>Configure a new external system integration for compliance notifications and workflow automation.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Basic Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Integration Details</CardTitle>
                    <CardDescription>Basic information and connection settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Compliance Slack Alerts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="integration_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select integration type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {integrationTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Zap className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {providerOptions.map((option) => {
                                const Icon = option.icon
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the purpose and scope of this integration..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Configuration</CardTitle>
                      <CardDescription>Connection settings and authentication details.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={loadTemplate} disabled={templatesLoading}>
                      {templatesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load Template"
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="config"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Configuration (JSON) *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={getConfigPlaceholder(watchType)}
                              className="min-h-[200px] font-mono text-sm"
                              value={JSON.stringify(field.value, null, 2)}
                              onChange={(e) => {
                                try {
                                  field.onChange(JSON.parse(e.target.value))
                                } catch {
                                  // Invalid JSON, don't update field.value
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            <div className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              Enter the connection configuration in JSON format. Use "Load Template" for examples.
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="flex items-center gap-2"
                      >
                        {getTestStatusIcon()}
                        {isTestingConnection ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      {testResult && (
                        <Alert variant={testResult.success ? 'default' : 'destructive'} className="flex-1">
                          <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Settings</CardTitle>
                    <CardDescription>Configure when and how notifications are sent.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="notification_settings.on_compliance_violation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Compliance Violations</FormLabel>
                              <FormDescription className="text-xs">Notify on rule violations and non-compliance issues</FormDescription>
                            </div>
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value} 
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notification_settings.on_assessment_complete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Assessment Completion</FormLabel>
                              <FormDescription className="text-xs">Notify when compliance assessments are completed</FormDescription>
                            </div>
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value} 
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notification_settings.severity_filter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Filter</FormLabel>
                          <FormDescription>Select which severity levels should trigger notifications</FormDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['low', 'medium', 'high', 'critical'].map((severity) => (
                              <Badge
                                key={severity}
                                variant={field.value?.includes(severity as any) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || []
                                  if (current.includes(severity as any)) {
                                    field.onChange(current.filter(s => s !== severity))
                                  } else {
                                    field.onChange([...current, severity])
                                  }
                                }}
                              >
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Capabilities Preview */}
                {watchType && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Integration Capabilities</CardTitle>
                      <CardDescription>Features available with this integration type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getIntegrationCapabilities(watchType).map((capability) => (
                          <Badge key={capability} variant="secondary">
                            {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || enterpriseLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Integration"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
