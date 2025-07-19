"use client"

import { useState, useEffect } from "react"
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
import { Edit, FileText, Mail, Filter, CalendarDays, Download, Users, Clock, Activity, Loader2, BarChart } from "lucide-react"
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

interface ReportEditModalProps {
  isOpen: boolean
  onClose: () => void
  report: ComplianceReport
  onSuccess: (report: ComplianceReport) => void
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
    icon: BarChart,
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

export function ReportEditModal({ isOpen, onClose, report, onSuccess }: ReportEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const { 
    executeAction, 
    sendNotification, 
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ReportEditModal',
    complianceId: report.id,
    enableAnalytics: true,
    enableMonitoring: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: report.name,
      description: report.description || "",
      type: report.type,
      format: report.format,
      schedule: report.schedule || "on_demand",
      recipients: report.recipients || [],
      filters: report.filters || {},
      template_id: report.template_id || "",
      priority: report.priority || "medium",
      auto_generate: report.auto_generate || false,
      include_charts: report.metadata?.generation_settings?.include_charts ?? true,
      include_recommendations: report.metadata?.generation_settings?.include_recommendations ?? true,
      compliance_frameworks: report.metadata?.generation_settings?.frameworks || []
    },
  })

  // Reset form with new report data if the report prop changes
  useEffect(() => {
    if (report) {
      form.reset({
        name: report.name,
        description: report.description || "",
        type: report.type,
        format: report.format,
        schedule: report.schedule || "on_demand",
        recipients: report.recipients || [],
        filters: report.filters || {},
        template_id: report.template_id || "",
        priority: report.priority || "medium",
        auto_generate: report.auto_generate || false,
        include_charts: report.metadata?.generation_settings?.include_charts ?? true,
        include_recommendations: report.metadata?.generation_settings?.include_recommendations ?? true,
        compliance_frameworks: report.metadata?.generation_settings?.frameworks || []
      })
    }
  }, [report, form])

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      
      const updatedReport: ComplianceReport = {
        ...report,
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: "current-user@company.com",
        metadata: {
          ...report.metadata,
          generation_settings: {
            include_charts: data.include_charts,
            include_recommendations: data.include_recommendations,
            frameworks: data.compliance_frameworks
          }
        }
      }

      await executeAction('updateReport', {
        id: report.id,
        ...updatedReport
      })

      onSuccess(updatedReport)
      sendNotification('success', `Report "${data.name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Failed to update report:", error)
      sendNotification('error', 'Failed to update report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateNow = async () => {
    try {
      setIsGenerating(true)
      await executeAction('generateReport', { id: report.id })
      sendNotification('success', 'Report generation initiated')
    } catch (error) {
      sendNotification('error', 'Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      generating: 'default',
      completed: 'default',
      failed: 'destructive',
      scheduled: 'secondary'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Activity className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatGenerationTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
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
              <Edit className="h-5 w-5" />
            </motion.div>
            Edit Report: {report.name}
          </DialogTitle>
          <DialogDescription>
            Update the properties and configuration for this compliance report.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Report Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Report Status
                      {getStatusBadge(report.status)}
                    </CardTitle>
                    <CardDescription>Current status and performance metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{report.download_count || 0}</div>
                        <div className="text-sm text-muted-foreground">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatFileSize(report.file_size)}
                        </div>
                        <div className="text-sm text-muted-foreground">File Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {formatGenerationTime(report.generation_time)}
                        </div>
                        <div className="text-sm text-muted-foreground">Generation Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {report.last_generated_at ? new Date(report.last_generated_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm text-muted-foreground">Last Generated</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateNow}
                        disabled={isGenerating || report.status === 'generating'}
                        className="flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate Now'}
                      </Button>
                      
                      {report.file_url && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.open(report.file_url!, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Latest
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
                  <CardHeader>
                    <CardTitle className="text-lg">Report Configuration</CardTitle>
                    <CardDescription>Define the type, format, and content settings.</CardDescription>
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
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isGenerating || enterpriseLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
