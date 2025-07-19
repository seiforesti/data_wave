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
  Edit,
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
  HelpCircle,
  Loader2,
  CheckCircle,
  Activity,
  BarChart3
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceRule } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(["critical", "high", "medium", "low"]),
  compliance_standard: z.string().min(1, "Compliance standard is required"),
  applies_to: z.enum(["column", "table", "schema", "database"]),
  rule_type: z.enum(["pattern", "value", "metadata", "relationship", "custom"]),
  rule_definition: z.string().min(1, "Rule definition is required"),
  status: z.enum(["active", "inactive", "draft", "archived"]),
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

interface ComplianceRuleEditModalProps {
  isOpen: boolean
  onClose: () => void
  rule: ComplianceRule
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

// Data sources will be loaded from API

// Rule definition templates
const ruleDefinitionTemplates = {
  pattern: {
    email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    ssn: '^\\d{3}-\\d{2}-\\d{4}$',
    phone: '^\\+?[1-9]\\d{1,14}$',
    credit_card: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$'
  },
  value: {
    age_range: '{"min": 0, "max": 150}',
    allowed_countries: '["US", "CA", "UK", "DE", "FR"]',
    status_values: '["active", "inactive", "pending", "suspended"]'
  },
  metadata: {
    required_tags: '{"required_properties": ["owner", "classification", "retention_period"]}',
    data_lineage: '{"required_lineage": true, "source_tracking": true}'
  },
  relationship: {
    foreign_key: '{"required_relationship": "REFERENCES", "target_table": "users"}',
    hierarchy: '{"parent_child": true, "max_depth": 5}'
  },
  custom: {
    business_logic: '{"function": "validate_business_rule", "parameters": {"threshold": 100}}'
  }
}

export function ComplianceRuleEditModal({ isOpen, onClose, rule, onSuccess }: ComplianceRuleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingRule, setIsTestingRule] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [ruleTemplates, setRuleTemplates] = useState<any>({})
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [dataSources, setDataSources] = useState<any[]>([])
  const [frameworks, setFrameworks] = useState<any[]>([])

  const { 
    executeAction, 
    sendNotification, 
    getMetrics,
    isLoading: enterpriseLoading 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleEditModal',
    complianceId: rule.id,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      compliance_standard: rule.compliance_standard,
      applies_to: rule.applies_to,
      rule_type: rule.rule_type,
      rule_definition: rule.rule_definition,
      status: rule.status,
      is_global: rule.is_global,
      data_source_ids: rule.data_source_ids,
      remediation_steps: rule.remediation_steps || "",
      reference_link: rule.reference_link || "",
      validation_frequency: rule.validation_frequency,
      auto_remediation: rule.auto_remediation,
      business_impact: rule.business_impact,
      regulatory_requirement: rule.regulatory_requirement,
      tags: rule.tags || [],
    },
  })

  // Load templates, data sources, and frameworks from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setTemplatesLoading(true)
        const [templatesData, dataSourcesData, frameworksData] = await Promise.all([
          ComplianceAPIs.Management.getRuleTemplates(),
          // Load data sources from data governance API
          fetch('/api/data-sources').then(res => res.json()).catch(() => []),
          ComplianceAPIs.Framework.getFrameworks()
        ])
        
        setRuleTemplates(templatesData)
        setDataSources(dataSourcesData)
        setFrameworks(frameworksData)
      } catch (error) {
        console.error('Failed to load data:', error)
        sendNotification('error', 'Failed to load rule templates and data sources')
        
        // Fallback to basic data
        setDataSources([])
        setFrameworks([])
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen, sendNotification])

  // Reset form when rule changes
  useEffect(() => {
    if (rule) {
      form.reset({
        name: rule.name,
        description: rule.description,
        category: rule.category,
        severity: rule.severity,
        compliance_standard: rule.compliance_standard,
        applies_to: rule.applies_to,
        rule_type: rule.rule_type,
        rule_definition: rule.rule_definition,
        status: rule.status,
        is_global: rule.is_global,
        data_source_ids: rule.data_source_ids,
        remediation_steps: rule.remediation_steps || "",
        reference_link: rule.reference_link || "",
        validation_frequency: rule.validation_frequency,
        auto_remediation: rule.auto_remediation,
        business_impact: rule.business_impact,
        regulatory_requirement: rule.regulatory_requirement,
        tags: rule.tags || [],
      })
    }
  }, [rule, form])

  const watchRuleType = form.watch("rule_type")
  const watchIsGlobal = form.watch("is_global")

  const getRuleDefinitionPlaceholder = () => {
    const templates = ruleDefinitionTemplates[watchRuleType as keyof typeof ruleDefinitionTemplates]
    if (templates) {
      const templateKeys = Object.keys(templates)
      const firstTemplate = templates[templateKeys[0] as keyof typeof templates]
      return firstTemplate
    }
    return "Enter rule definition"
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

  const loadRuleTemplate = (templateKey: string) => {
    const templates = ruleDefinitionTemplates[watchRuleType as keyof typeof ruleDefinitionTemplates]
    if (templates && templates[templateKey as keyof typeof templates]) {
      form.setValue('rule_definition', templates[templateKey as keyof typeof templates])
      sendNotification('info', `${templateKey} template loaded successfully`)
    }
  }

  const handleTestRule = async () => {
    try {
      const ruleDefinition = form.getValues('rule_definition')
      if (!ruleDefinition) {
        sendNotification('warning', 'Please enter a rule definition first')
        return
      }

      await executeAction('testRule', { 
        ruleDefinition,
        ruleType: watchRuleType,
        appliesTo: form.getValues('applies_to')
      })
      sendNotification('success', 'Rule test completed successfully')
    } catch (error) {
      sendNotification('error', 'Rule test failed. Please check your definition.')
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

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)

      // Update rule using enterprise API
      const updatedRuleData = {
        ...data,
        id: rule.id,
        updated_at: new Date().toISOString(),
        updated_by: "current-user@company.com",
        tags: data.tags || [],
      }

      await executeAction('updateComplianceRule', updatedRuleData)

      const updatedRule: ComplianceRule = {
        ...rule,
        ...updatedRuleData,
      }

      onSuccess(updatedRule)
      sendNotification('success', `Compliance rule "${data.name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Failed to update rule:", error)
      sendNotification('error', 'Failed to update compliance rule. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            Edit Compliance Rule
          </DialogTitle>
          <DialogDescription>Update the compliance rule configuration and settings</DialogDescription>
        </DialogHeader>

        {/* Rule Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSeverityIcon(rule.severity)}
                      {rule.severity}
                    </Badge>
                    <Badge variant="secondary">{rule.category}</Badge>
                    <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    <span className={getComplianceScoreColor(rule.pass_rate)}>{rule.pass_rate.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Current Pass Rate</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleTestRule} disabled={enterpriseLoading}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Test Rule
                    </Button>
                    <Button variant="outline" size="sm" disabled={enterpriseLoading}>
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="definition">Rule Definition</TabsTrigger>
                <TabsTrigger value="scope">Scope & Impact</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] mt-4">
                <AnimatePresence mode="wait">
                  <TabsContent value="basic" className="space-y-4">
                    <motion.div
                      key="basic"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Basic Information</CardTitle>
                          <CardDescription>Update the fundamental properties of your compliance rule</CardDescription>
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
                                    <SelectItem value="active">
                                      <Badge variant="default">Active</Badge>
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      <Badge variant="secondary">Inactive</Badge>
                                    </SelectItem>
                                    <SelectItem value="draft">
                                      <Badge variant="outline">Draft</Badge>
                                    </SelectItem>
                                    <SelectItem value="archived">
                                      <Badge variant="destructive">Archived</Badge>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {rule.is_global !== undefined && (
                            <Alert>
                              <HelpCircle className="h-4 w-4" />
                              <AlertDescription>
                                The global scope setting cannot be changed after rule creation to maintain data consistency.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="definition" className="space-y-4">
                    <motion.div
                      key="definition"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Rule Definition</CardTitle>
                          <CardDescription>Update how the rule should evaluate data</CardDescription>
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

                          {/* Rule Definition Templates */}
                          {watchRuleType && ruleDefinitionTemplates[watchRuleType as keyof typeof ruleDefinitionTemplates] && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Quick Templates</Label>
                              <div className="flex flex-wrap gap-2">
                                {Object.keys(ruleDefinitionTemplates[watchRuleType as keyof typeof ruleDefinitionTemplates]).map((templateKey) => (
                                  <Button
                                    key={templateKey}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadRuleTemplate(templateKey)}
                                  >
                                    {templateKey.replace('_', ' ')}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

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
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="scope" className="space-y-4">
                    <motion.div
                      key="scope"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
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
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled // Disable editing after creation
                                  />
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
                                  <div className="grid grid-cols-2 gap-2">
                                    {dataSources.map((source) => (
                                      <div key={source.id} className="flex items-center space-x-2 p-2 border rounded">
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
                                        <Label htmlFor={`source-${source.id}`} className="flex-1">
                                          <div className="font-medium">{source.name}</div>
                                          <div className="text-xs text-muted-foreground">{source.type}</div>
                                        </Label>
                                      </div>
                                    ))}
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
                                      <SelectItem value="low">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                                          Low
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="medium">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                          Medium
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="high">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                                          High
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="critical">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-red-500" />
                                          Critical
                                        </div>
                                      </SelectItem>
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
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="automation" className="space-y-4">
                    <motion.div
                      key="automation"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
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
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
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
                <Button type="submit" disabled={isLoading || enterpriseLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
