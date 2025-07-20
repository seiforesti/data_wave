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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Target,
  Loader2,
  Lightbulb,
  Settings,
  Activity,
  BarChart3
} from "lucide-react"
import { useEnterpriseFeatures } from "../hooks/use-enterprise-features"
import { ComplianceAPIs } from "../services/enterprise-apis"
import type { ComplianceRequirement } from "../types"

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

interface ComplianceRuleEditModalProps {
  isOpen: boolean
  onClose: () => void
  requirement: ComplianceRequirement | null
  onSuccess: (requirement: ComplianceRequirement) => void
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

export function ComplianceRuleEditModal({ isOpen, onClose, requirement, onSuccess }: ComplianceRuleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dataSources, setDataSources] = useState<any[]>([])
  const [frameworks, setFrameworks] = useState<any[]>([])

  const { 
    executeAction, 
    sendNotification, 
    getMetrics 
  } = useEnterpriseFeatures({
    componentName: 'ComplianceRuleEditModal',
    complianceId: requirement?.id,
    enableAnalytics: true,
    enableMonitoring: true,
    enableWorkflows: true
  })

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

  // Load data sources and frameworks
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dataSourcesData, frameworksData] = await Promise.all([
          ComplianceAPIs.Management.getDataSources(),
          ComplianceAPIs.Framework.getFrameworks()
        ])
        
        setDataSources(dataSourcesData)
        setFrameworks(frameworksData)
      } catch (error) {
        console.error('Failed to load data:', error)
        sendNotification('error', 'Failed to load data sources and frameworks')
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen, sendNotification])

  // Populate form when requirement changes
  useEffect(() => {
    if (requirement && isOpen) {
      form.reset({
        name: requirement.name || "",
        description: requirement.description || "",
        category: requirement.category || "",
        severity: requirement.severity || "medium",
        compliance_standard: requirement.compliance_standard || "",
        applies_to: requirement.applies_to || "column",
        rule_type: requirement.rule_type || "pattern",
        rule_definition: requirement.rule_definition || "",
        status: requirement.status || "active",
        is_global: requirement.is_global ?? true,
        data_source_ids: requirement.data_source_ids || [],
        remediation_steps: requirement.remediation_steps || "",
        reference_link: requirement.reference_link || "",
        validation_frequency: requirement.validation_frequency || "daily",
        auto_remediation: requirement.auto_remediation || false,
        business_impact: requirement.business_impact || "medium",
        regulatory_requirement: requirement.regulatory_requirement || false,
        tags: requirement.tags || [],
      })
    }
  }, [requirement, isOpen, form])

  const onSubmit = async (data: FormData) => {
    if (!requirement) return

    try {
      setIsLoading(true)

      const updatedRequirement = await ComplianceAPIs.Management.updateRequirement(
        requirement.id, 
        data,
        "current-user@company.com"
      )

      sendNotification('success', 'Compliance rule updated successfully')
      onSuccess(updatedRequirement)
      onClose()
    } catch (error) {
      console.error("Failed to update rule:", error)
      sendNotification('error', 'Failed to update compliance rule')
    } finally {
      setIsLoading(false)
    }
  }

  if (!requirement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Compliance Rule
          </DialogTitle>
          <DialogDescription>
            Update the compliance rule details and configuration
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 pr-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the fundamental properties of the compliance rule</CardDescription>
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                          <Select onValueChange={field.onChange} value={field.value}>
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

                {/* Rule Definition */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rule Definition</CardTitle>
                    <CardDescription>Update how the rule evaluates data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rule_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rule Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rule type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pattern">Pattern</SelectItem>
                                <SelectItem value="value">Value</SelectItem>
                                <SelectItem value="metadata">Metadata</SelectItem>
                                <SelectItem value="relationship">Relationship</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="column">Column</SelectItem>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="schema">Schema</SelectItem>
                                <SelectItem value="database">Database</SelectItem>
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
                              placeholder="Enter rule definition..."
                              className="min-h-[120px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Define the logic for this compliance rule</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                          <FormDescription>Provide guidance on how to fix violations</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Business Impact & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Impact & Settings</CardTitle>
                    <CardDescription>Configure business impact and operational settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="business_impact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Impact</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                        name="validation_frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validation Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="continuous">Continuous</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often should this rule be validated</FormDescription>
                            <FormMessage />
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
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Rule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
