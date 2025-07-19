"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, FileText, Mail, Filter, CalendarDays, Clock, Users, Download, Loader2, Info } from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceReport } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["summary", "detail", "trend", "custom", "executive", "technical"]),
  format: z.enum(["pdf", "csv", "json", "xlsx", "html"]),
  schedule: z.enum(["daily", "weekly", "monthly", "quarterly", "on_demand"]).optional(),
  recipients: z
    .string()
    .optional()
    .transform((str) => (str ? str.split(",").map((s) => s.trim()) : [])),
  filters: z
    .string()
    .optional()
    .transform((str) => {
      try {
        return str ? JSON.parse(str) : {}
      } catch {
        return {}
      }
    })
    .refine((val) => typeof val === "object" && val !== null, {
      message: "Filters must be a valid JSON object",
    }),
  template_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  auto_generate: z.boolean().default(false),
  include_charts: z.boolean().default(true),
  include_recommendations: z.boolean().default(true),
  compliance_frameworks: z.array(z.string()).default([])
})

type FormData = z.infer<typeof formSchema>

interface ReportCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (report: ComplianceReport) => void
  dataSourceId?: number
}

const reportTypeOptions = [
  { 
    value: "summary", 
    label: "Summary", 
    description: "High-level overview of compliance status",
    icon: FileText,
    category: "standard"
  },
  { 
    value: "detail", 
    label: "Detail", 
    description: "Granular findings and specific violations",
    icon: FileText,
    category: "standard"
  },
  { 
    value: "trend", 
    label: "Trend", 
    description: "Historical performance and trend analysis",
    icon: FileText,
    category: "analytics"
  },
  { 
    value: "executive", 
    label: "Executive", 
    description: "Executive summary for leadership",
    icon: Users,
    category: "executive"
  },
  { 
    value: "technical", 
    label: "Technical", 
    description: "Technical details for IT and security teams",
    icon: FileText,
    category: "technical"
  },
  { 
    value: "custom", 
    label: "Custom", 
    description: "User-defined content and structure",
    icon: FileText,
    category: "custom"
  },
]

const reportFormatOptions = [
  { value: "pdf", label: "PDF", description: "Portable Document Format" },
  { value: "xlsx", label: "Excel", description: "Microsoft Excel spreadsheet" },
  { value: "csv", label: "CSV", description: "Comma-separated values" },
  { value: "html", label: "HTML", description: "Web page format" },
  { value: "json", label: "JSON", description: "JavaScript Object Notation" }
]

const reportScheduleOptions = [
  { value: "on_demand", label: "On Demand", description: "Generate manually when needed" },
  { value: "daily", label: "Daily", description: "Generate every day" },
  { value: "weekly", label: "Weekly", description: "Generate every week" },
  { value: "monthly", label: "Monthly", description: "Generate every month" },
  { value: "quarterly", label: "Quarterly", description: "Generate every quarter" }
]

const complianceFrameworks = [
  "GDPR", "HIPAA", "PCI DSS", "SOX", "CCPA", "GLBA", "ISO 27001", "NIST", "SOC 2", "FISMA"
]

// Clean mock data for demonstration
const mockReportTemplates = {
  summary: {
    sections: ["executive_summary", "compliance_overview", "key_metrics", "recommendations"],
    default_filters: { severity: ["high", "critical"], status: ["open", "in_progress"] },
    charts: ["compliance_score_trend", "violations_by_category", "remediation_progress"]
  },
  detail: {
    sections: ["detailed_findings", "violation_details", "remediation_plans", "evidence"],
    default_filters: { include_resolved: false, detailed_view: true },
    charts: ["violation_timeline", "severity_distribution", "data_source_breakdown"]
  },
  trend: {
    sections: ["trend_analysis", "historical_data", "projections", "benchmarks"],
    default_filters: { time_range: "last_12_months", include_predictions: true },
    charts: ["compliance_trend", "improvement_metrics", "forecast_chart"]
  },
  executive: {
    sections: ["executive_summary", "strategic_overview", "risk_assessment", "budget_impact"],
    default_filters: { executive_view: true, high_level_only: true },
    charts: ["risk_heatmap", "compliance_dashboard", "cost_analysis"]
  },
  technical: {
    sections: ["technical_findings", "system_details", "implementation_guides", "api_logs"],
    default_filters: { technical_details: true, include_logs: true },
    charts: ["system_performance", "error_analysis", "integration_status"]
  },
  custom: {
    sections: ["custom_content"],
    default_filters: {},
    charts: []
  }
}

export function ReportCreateModal({ isOpen, onClose, onSuccess, dataSourceId }: ReportCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const { 
    executeAction, 
    sendNotification, 
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ReportCreateModal',
    dataSourceId,
    enableAnalytics: true,
    enableMonitoring: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "summary",
      format: "pdf",
      schedule: "on_demand",
      recipients: [],
      filters: {},
      template_id: "",
      priority: "medium",
      auto_generate: false,
      include_charts: true,
      include_recommendations: true,
      compliance_frameworks: []
    },
  })

  const watchType = form.watch("type")
  const watchFormat = form.watch("format")

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      // Create report using enterprise API
      const reportData = {
        ...data,
        data_source_id: dataSourceId,
        status: 'pending',
        generated_by: "current-user@company.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "current-user@company.com",
        updated_by: "current-user@company.com"
      }

      const result = await executeAction('createReport', reportData)
      
      const newReport: ComplianceReport = {
        id: Math.floor(Math.random() * 10000),
        ...reportData,
        file_url: null,
        last_generated_at: null,
        generation_time: null,
        file_size: null,
        download_count: 0,
        metadata: {
          version: '1.0',
          template_used: mockReportTemplates[data.type as keyof typeof mockReportTemplates],
          generation_settings: {
            include_charts: data.include_charts,
            include_recommendations: data.include_recommendations,
            frameworks: data.compliance_frameworks
          }
        }
      }

      onSuccess(newReport)
      sendNotification('success', `Report "${data.name}" created successfully`)
      form.reset()
      onClose()
    } catch (error) {
      console.error("Failed to create report:", error)
      sendNotification('error', 'Failed to create report')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    const formData = form.getValues()
    try {
      const preview = await executeAction('previewReport', {
        type: formData.type,
        filters: formData.filters,
        template: mockReportTemplates[formData.type as keyof typeof mockReportTemplates]
      })
      setPreviewData(preview)
      sendNotification('info', 'Report preview generated')
    } catch (error) {
      sendNotification('error', 'Failed to generate preview')
    }
  }

  const loadTemplate = () => {
    const template = mockReportTemplates[watchType as keyof typeof mockReportTemplates]
    if (template) {
      form.setValue('filters', template.default_filters)
      sendNotification('info', 'Template loaded successfully')
    }
  }

  const getEstimatedSize = () => {
    const baseSize = watchFormat === 'pdf' ? '2-5 MB' : 
                    watchFormat === 'xlsx' ? '1-3 MB' : 
                    watchFormat === 'csv' ? '0.5-2 MB' : 
                    watchFormat === 'html' ? '1-4 MB' : '0.1-1 MB'
    return baseSize
  }

  const getGenerationTime = () => {
    const baseTime = watchType === 'detail' ? '5-15 minutes' :
                     watchType === 'trend' ? '10-30 minutes' :
                     watchType === 'technical' ? '15-45 minutes' : '2-10 minutes'
    return baseTime
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
              <PlusCircle className="h-5 w-5" />
            </motion.div>
            Create New Report
          </DialogTitle>
          <DialogDescription>Define the properties and configuration for your new compliance report.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Details</CardTitle>
                    <CardDescription>Basic information about the report.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Monthly Compliance Overview" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of the report content and purpose..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Report Configuration */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Report Configuration</CardTitle>
                      <CardDescription>Define the type, format, and content settings.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={loadTemplate}>
                      Load Template
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(
                                  reportTypeOptions.reduce((acc, option) => {
                                    if (!acc[option.category]) acc[option.category] = []
                                    acc[option.category].push(option)
                                    return acc
                                  }, {} as Record<string, typeof reportTypeOptions>)
                                ).map(([category, options]) => (
                                  <div key={category}>
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                      {category}
                                    </div>
                                    {options.map((option) => {
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
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output Format *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reportFormatOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Download className="h-4 w-4" />
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
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportScheduleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{option.label}</div>
                                      <div className="text-xs text-muted-foreground">{option.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>How often should this report be generated?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="include_charts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Include Charts</FormLabel>
                              <FormDescription className="text-xs">Add visual charts and graphs</FormDescription>
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
                        name="include_recommendations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Include Recommendations</FormLabel>
                              <FormDescription className="text-xs">Add remediation suggestions</FormDescription>
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
                  </CardContent>
                </Card>

                {/* Compliance Frameworks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Frameworks</CardTitle>
                    <CardDescription>Select which compliance frameworks to include in the report.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="compliance_frameworks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frameworks</FormLabel>
                          <FormDescription>Select the compliance frameworks to analyze</FormDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {complianceFrameworks.map((framework) => (
                              <Badge
                                key={framework}
                                variant={field.value?.includes(framework) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || []
                                  if (current.includes(framework)) {
                                    field.onChange(current.filter(f => f !== framework))
                                  } else {
                                    field.onChange([...current, framework])
                                  }
                                }}
                              >
                                {framework}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Distribution & Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution & Filters</CardTitle>
                    <CardDescription>Configure recipients and data filters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="recipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipients</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., compliance-team@company.com, ciso@company.com"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => {
                                const emails = e.target.value
                                  .split(",")
                                  .map((email) => email.trim())
                                  .filter((email) => email.length > 0)
                                field.onChange(emails)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Comma-separated email addresses for report distribution.</FormDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value?.map((recipient, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {recipient}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="filters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filters (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='e.g., {"severity": ["high", "critical"], "status": ["open"], "time_range": "last_30_days"}'
                              className="min-h-[100px] font-mono text-sm"
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
                              <Filter className="h-3 w-3" />
                              Define data filters in JSON format to customize report content.
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Report Estimates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Estimates</CardTitle>
                    <CardDescription>Estimated generation time and file size.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getEstimatedSize()}</div>
                        <div className="text-sm text-muted-foreground">Estimated Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getGenerationTime()}</div>
                        <div className="text-sm text-muted-foreground">Generation Time</div>
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreview}
                          className="flex items-center gap-2"
                        >
                          <Info className="h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    {previewData && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Preview generated successfully. The report will include {previewData.sections?.length || 0} sections 
                          and approximately {previewData.estimatedRecords || 0} data records.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
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
                  "Create Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
