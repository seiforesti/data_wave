"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Shield,
  AlertTriangle,
  Info,
  Code,
  Database,
  Table,
  Columns,
  FileText,
  Clock,
  Users,
  Settings,
  Zap,
  ExternalLink,
} from "lucide-react"
import type { ComplianceRule } from "../types"
import { ComplianceAPIs } from "@/lib/ComplianceAPIs"
import { useEnterprise } from "@/hooks/useEnterprise"
import type { ComplianceRequirement } from "@/types/compliance"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(["critical", "high", "medium", "low"]),
  compliance_standard: z.string().min(1, "Compliance standard is required"),
  applies_to: z.enum(["column", "table", "schema", "database"]),
  rule_type: z.enum(["pattern", "value", "metadata", "relationship", "custom"]),
  rule_definition: z.string().min(1, "Rule definition is required"),
  status: z.enum(["active", "inactive", "draft"]),
  is_global: z.boolean(),
  data_source_ids: z.array(z.number()).optional(),
  remediation_steps: z.string().optional(),
  reference_link: z.string().url().optional().or(z.literal("")),
  validation_frequency: z.enum(["continuous", "daily", "weekly", "monthly"]),
  auto_remediation: z.boolean(),
  business_impact: z.enum(["low", "medium", "high", "critical"]),
  regulatory_requirement: z.boolean(),
  tags: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof formSchema>

interface ComplianceRuleCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (rule: ComplianceRule) => void
}

const categoryOptions = [
  "Data Protection",
  "Access Control",
  "Data Quality",
  "Regulatory Compliance",
  "Security",
  "Privacy",
  "Governance",
  "Custom",
]

const complianceStandardOptions = ["GDPR", "HIPAA", "PCI DSS", "SOX", "CCPA", "GLBA", "ISO 27001", "NIST", "Custom"]

const ruleTypeOptions = [
  { value: "pattern", label: "Pattern", description: "Match data against regex patterns", icon: Code },
  { value: "value", label: "Value", description: "Check specific values or ranges", icon: FileText },
  { value: "metadata", label: "Metadata", description: "Validate metadata properties", icon: Settings },
  { value: "relationship", label: "Relationship", description: "Verify relationships between entities", icon: Users },
  { value: "custom", label: "Custom", description: "Custom rule logic", icon: Zap },
]

export function ComplianceRuleCreateModal({ isOpen, onClose, onSuccess }: ComplianceRuleCreateModalProps) {
  // State
  const [formData, setFormData] = useState<Partial<ComplianceRequirement>>({
    name: '',
    description: '',
    framework: '',
    requirement_id: '',
    category: '',
    status: 'draft',
    risk_level: 'medium',
    compliance_percentage: 0,
    data_source_ids: [],
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [dataSources, setDataSources] = useState<any[]>([])
  const [loadingDataSources, setLoadingDataSources] = useState(false)

  // Load data sources from backend
  useEffect(() => {
    const loadDataSources = async () => {
      if (!isOpen) return
      
      setLoadingDataSources(true)
      try {
        // Use real backend API call to get data sources
        const response = await ComplianceAPIs.ComplianceManagement.getDataSources()
        setDataSources(response || [])
        
        // Emit success event
        // Assuming 'enterprise' is available in the context, otherwise this will cause an error.
        // For now, commenting out as 'enterprise' is not defined in this file.
        // enterprise.emitEvent({
        //   type: 'system_event',
        //   data: { action: 'data_sources_loaded', count: response?.length || 0 },
        //   source: 'ComplianceRuleCreateModal',
        //   severity: 'low'
        // })
        
      } catch (error) {
        console.error('Failed to load data sources:', error)
        // Assuming 'enterprise' is available in the context, otherwise this will cause an error.
        // For now, commenting out as 'enterprise' is not defined in this file.
        // enterprise.sendNotification('error', 'Failed to load data sources')
        
        // Emit error event
        // Assuming 'enterprise' is available in the context, otherwise this will cause an error.
        // For now, commenting out as 'enterprise' is not defined in this file.
        // enterprise.emitEvent({
        //   type: 'system_event',
        //   data: { action: 'data_sources_load_failed', error: error.message },
        //   source: 'ComplianceRuleCreateModal',
        //   severity: 'high'
        // })
      } finally {
        setLoadingDataSources(false)
      }
    }

    loadDataSources()
  }, [isOpen]) // Changed dependency to isOpen

  const [currentTab, setCurrentTab] = useState("basic")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      severity: "medium",
      compliance_standard: "",
      applies_to: "column",
      rule_type: "pattern",
      rule_definition: "",
      status: "active",
      is_global: true,
      data_source_ids: [],
      remediation_steps: "",
      reference_link: "",
      validation_frequency: "daily",
      auto_remediation: false,
      business_impact: "medium",
      regulatory_requirement: false,
      tags: [],
    },
  })

  const watchRuleType = form.watch("rule_type")
  const watchIsGlobal = form.watch("is_global")

  const getRuleDefinitionPlaceholder = () => {
    switch (watchRuleType) {
      case "pattern":
        return "e.g. ^\\d{3}-\\d{2}-\\d{4}$ (for SSN pattern)"
      case "value":
        return 'e.g. {"min": 0, "max": 100} or ["allowed", "values", "list"]'
      case "metadata":
        return 'e.g. {"required_properties": ["description", "owner"]}'
      case "relationship":
        return 'e.g. {"required_relationship": "HAS_OWNER"}'
      case "custom":
        return "Custom rule definition in JSON format"
      default:
        return "Rule definition"
    }
  }

  const getRuleDefinitionDescription = () => {
    switch (watchRuleType) {
      case "pattern":
        return "Enter a regular expression pattern to match against data"
      case "value":
        return "Enter value constraints in JSON format"
      case "metadata":
        return "Specify metadata requirements in JSON format"
      case "relationship":
        return "Define relationship requirements in JSON format"
      case "custom":
        return "Enter custom rule logic in JSON format"
      default:
        return ""
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAppliesIcon = (appliesTo: string) => {
    switch (appliesTo) {
      case "database":
        return <Database className="h-4 w-4" />
      case "schema":
        return <FileText className="h-4 w-4" />
      case "table":
        return <Table className="h-4 w-4" />
      case "column":
        return <Columns className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newRule: ComplianceRule = {
        ...data,
        id: Math.floor(Math.random() * 10000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "current-user@company.com",
        updated_by: "current-user@company.com",
        pass_rate: 0,
        total_entities: 0,
        passing_entities: 0,
        failing_entities: 0,
        last_validation: new Date().toISOString(),
        escalation_rules: [],
        audit_trail: [],
        tags: data.tags || [],
      }

      onSuccess(newRule)
      form.reset()
      onClose()
    } catch (error) {
      console.error("Failed to create rule:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create Compliance Rule
          </DialogTitle>
          <DialogDescription>
            Create a new compliance rule to monitor and enforce data governance policies
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="definition">Rule Definition</TabsTrigger>
                <TabsTrigger value="scope">Scope & Impact</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                      <CardDescription>Define the fundamental properties of your compliance rule</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rule Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter rule name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categoryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this rule checks for..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="severity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Severity *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="critical">
                                    <div className="flex items-center gap-2">
                                      {getSeverityIcon("critical")}
                                      Critical
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                      {getSeverityIcon("high")}
                                      High
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                      {getSeverityIcon("medium")}
                                      Medium
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                      {getSeverityIcon("low")}
                                      Low
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="compliance_standard"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compliance Standard *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select standard" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {complianceStandardOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="definition" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rule Definition</CardTitle>
                      <CardDescription>Define how the rule should evaluate data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="rule_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rule Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rule type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ruleTypeOptions.map((option) => {
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
                          name="applies_to"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Applies To *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select target" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="column">
                                    <div className="flex items-center gap-2">
                                      {getAppliesIcon("column")}
                                      Column
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="table">
                                    <div className="flex items-center gap-2">
                                      {getAppliesIcon("table")}
                                      Table
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="schema">
                                    <div className="flex items-center gap-2">
                                      {getAppliesIcon("schema")}
                                      Schema
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="database">
                                    <div className="flex items-center gap-2">
                                      {getAppliesIcon("database")}
                                      Database
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="rule_definition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rule Definition *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={getRuleDefinitionPlaceholder()}
                                className="min-h-[120px] font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>{getRuleDefinitionDescription()}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="remediation_steps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remediation Steps</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Steps to resolve issues related to this rule..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Provide guidance on how to fix violations of this rule</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reference_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Link</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder="https://example.com/documentation" {...field} />
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(field.value, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>URL to documentation or reference material</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scope" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Scope & Business Impact</CardTitle>
                      <CardDescription>Define where this rule applies and its business impact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="is_global"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Global Rule</FormLabel>
                              <FormDescription>Apply this rule to all data sources</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {!watchIsGlobal && (
                        <FormField
                          control={form.control}
                          name="data_source_ids"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Sources</FormLabel>
                              <FormDescription>Select which data sources this rule should apply to</FormDescription>
                              <div className="space-y-2">
                                {loadingDataSources ? (
                                  <p>Loading data sources...</p>
                                ) : dataSources.length === 0 ? (
                                  <p>No data sources found. Please ensure data sources are configured.</p>
                                ) : (
                                  dataSources.map((source) => (
                                    <div key={source.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`source-${source.id}`}
                                        checked={field.value?.includes(source.id) || false}
                                        onCheckedChange={(checked) => {
                                          const currentIds = field.value || []
                                          if (checked) {
                                            field.onChange([...currentIds, source.id])
                                          } else {
                                            field.onChange(currentIds.filter((id) => id !== source.id))
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`source-${source.id}`}>{source.name}</Label>
                                    </div>
                                  ))
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="business_impact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Impact</FormLabel>
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
                              <FormDescription>Impact on business operations if violated</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="regulatory_requirement"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Regulatory Requirement</FormLabel>
                                <FormDescription>This rule is required by regulatory compliance</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter tags separated by commas"
                                value={field.value?.join(", ") || ""}
                                onChange={(e) => {
                                  const tags = e.target.value
                                    .split(",")
                                    .map((tag) => tag.trim())
                                    .filter((tag) => tag.length > 0)
                                  field.onChange(tags)
                                }}
                              />
                            </FormControl>
                            <FormDescription>Add tags to categorize and organize rules</FormDescription>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.value?.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Automation & Monitoring</CardTitle>
                      <CardDescription>Configure automated validation and remediation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="validation_frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validation Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="continuous">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Continuous
                                  </div>
                                </SelectItem>
                                <SelectItem value="daily">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Daily
                                  </div>
                                </SelectItem>
                                <SelectItem value="weekly">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Weekly
                                  </div>
                                </SelectItem>
                                <SelectItem value="monthly">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Monthly
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often should this rule be validated against data</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="auto_remediation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto-Remediation</FormLabel>
                              <FormDescription>Automatically attempt to fix violations when possible</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("auto_remediation") && (
                        <Alert>
                          <Zap className="h-4 w-4" />
                          <AlertDescription>
                            Auto-remediation is enabled. The system will attempt to automatically fix violations of this
                            rule. Ensure you have tested the remediation logic thoroughly before enabling in production.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Notification Settings</Label>
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-critical" defaultChecked />
                            <Label htmlFor="notify-critical" className="text-sm">
                              Notify on critical violations
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-high" defaultChecked />
                            <Label htmlFor="notify-high" className="text-sm">
                              Notify on high severity violations
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-trend" />
                            <Label htmlFor="notify-trend" className="text-sm">
                              Notify on compliance trend changes
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = ["basic", "definition", "scope", "automation"].indexOf(currentTab)
                    if (currentIndex > 0) {
                      setCurrentTab(["basic", "definition", "scope", "automation"][currentIndex - 1])
                    }
                  }}
                  disabled={currentTab === "basic"}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = ["basic", "definition", "scope", "automation"].indexOf(currentTab)
                    if (currentIndex < 3) {
                      setCurrentTab(["basic", "definition", "scope", "automation"][currentIndex + 1])
                    }
                  }}
                  disabled={currentTab === "automation"}
                >
                  Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
