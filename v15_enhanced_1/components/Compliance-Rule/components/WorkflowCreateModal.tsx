"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Bell,
  Ticket,
  Play,
  CheckCircle,
  Edit,
  Webhook,
} from "lucide-react"
import type { ComplianceWorkflow } from "../types"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  trigger: z.enum(["rule_violation", "issue_status_change", "manual", "scheduled"]),
  trigger_config: z
    .string()
    .optional()
    .transform((str) => {
      try {
        return str ? JSON.parse(str) : {}
      } catch {
        return z.NEVER // Indicate a parsing error
      }
    })
    .refine((val) => typeof val === "object" && val !== null, {
      message: "Trigger configuration must be a valid JSON object",
    }),
  actions: z.array(
    z.object({
      id: z.string().optional(), // Will be generated if not provided
      type: z.enum([
        "create_issue",
        "send_notification",
        "update_issue",
        "run_remediation",
        "call_webhook",
        "approval",
      ]),
      config: z
        .string()
        .optional()
        .transform((str) => {
          try {
            return str ? JSON.parse(str) : {}
          } catch {
            return z.NEVER // Indicate a parsing error
          }
        })
        .refine((val) => typeof val === "object" && val !== null, {
          message: "Action configuration must be a valid JSON object",
        }),
      order: z.number(),
    }),
  ),
  status: z.enum(["active", "inactive"]),
})

type FormData = z.infer<typeof formSchema>

interface WorkflowCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (
    workflow: Omit<
      ComplianceWorkflow,
      "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
    >,
  ) => void
}

const triggerOptions = [
  { value: "rule_violation", label: "Rule Violation", description: "Triggered when a rule is violated." },
  {
    value: "issue_status_change",
    label: "Issue Status Change",
    description: "Triggered when an issue's status changes.",
  },
  { value: "manual", label: "Manual", description: "Triggered manually by a user." },
  { value: "scheduled", label: "Scheduled", description: "Triggered at a specific time/interval." },
]

const actionTypeOptions = [
  { value: "create_issue", label: "Create Issue", icon: Ticket },
  { value: "send_notification", label: "Send Notification", icon: Bell },
  { value: "update_issue", label: "Update Issue", icon: Edit },
  { value: "run_remediation", label: "Run Remediation", icon: Play },
  { value: "call_webhook", label: "Call Webhook", icon: Webhook },
  { value: "approval", label: "Require Approval", icon: CheckCircle },
]

export function WorkflowCreateModal({ isOpen, onClose, onSuccess }: WorkflowCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      trigger: "manual",
      trigger_config: {},
      actions: [],
      status: "active",
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "actions",
  })

  const watchTrigger = form.watch("trigger")

  const getTriggerConfigPlaceholder = (triggerType: string) => {
    switch (triggerType) {
      case "rule_violation":
        return 'e.g., {"rule_id": 1, "severity": "critical"}'
      case "issue_status_change":
        return 'e.g., {"issue_id": 101, "old_status": "open", "new_status": "in_progress"}'
      case "scheduled":
        return 'e.g., {"frequency": "daily", "time": "08:00"}'
      default:
        return "Enter trigger configuration in JSON format"
    }
  }

  const getActionConfigPlaceholder = (actionType: string) => {
    switch (actionType) {
      case "create_issue":
        return 'e.g., {"severity": "high", "assigned_to": "security_team"}'
      case "send_notification":
        return 'e.g., {"target": "slack", "channel": "#alerts", "message": "New issue detected!"}'
      case "update_issue":
        return 'e.g., {"issue_id": 123, "status": "resolved", "notes": "Fixed by script"}'
      case "run_remediation":
        return 'e.g., {"script_name": "mask_pii.sh", "parameters": {"column": "email"}}'
      case "call_webhook":
        return 'e.g., {"url": "https://api.example.com/webhook", "method": "POST", "body": {"event": "workflow_completed"}}'
      case "approval":
        return 'e.g., {"approvers": ["manager@example.com"], "timeout_hours": 24}'
      default:
        return "Enter action configuration in JSON format"
    }
  }

  const addAction = () => {
    append({
      id: `action-${Date.now()}`,
      type: "send_notification",
      config: {},
      order: fields.length + 1,
    })
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const workflowData = {
        ...data,
        actions: data.actions.map((action, index) => ({ ...action, order: index + 1 })), // Ensure correct order
      }
      await onSuccess(
        workflowData as Omit<
          ComplianceWorkflow,
          "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
        >,
      )
      form.reset()
      onClose()
    } catch (error) {
      console.error("Failed to create workflow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Workflow
          </DialogTitle>
          <DialogDescription>Define an automated workflow for compliance tasks.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Details</CardTitle>
                  <CardDescription>Basic information and trigger settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Critical Issue Escalation" {...field} />
                        </FormControl>
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
                          <Textarea placeholder="Describe what this workflow automates." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select trigger type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {triggerOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium capitalize">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchTrigger !== "manual" && (
                    <FormField
                      control={form.control}
                      name="trigger_config"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Configuration (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={getTriggerConfigPlaceholder(watchTrigger)}
                              className="min-h-[100px] font-mono"
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
                              Define specific conditions for the trigger in JSON format.
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Workflow Actions</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addAction}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Action
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No actions defined yet. Click "Add Action" to start.
                    </p>
                  )}
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Action {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => move(index, index - 1)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => move(index, index + 1)}
                            disabled={index === fields.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <FormField
                        control={form.control}
                        name={`actions.${index}.type`}
                        render={({ field: actionTypeField }) => (
                          <FormItem>
                            <FormLabel>Action Type *</FormLabel>
                            <Select onValueChange={actionTypeField.onChange} defaultValue={actionTypeField.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {actionTypeOptions.map((option) => {
                                  const Icon = option.icon
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {option.label}
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
                        name={`actions.${index}.config`}
                        render={({ field: actionConfigField }) => (
                          <FormItem>
                            <FormLabel>Action Configuration (JSON)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={getActionConfigPlaceholder(form.getValues(`actions.${index}.type`))}
                                className="min-h-[100px] font-mono"
                                value={JSON.stringify(actionConfigField.value, null, 2)}
                                onChange={(e) => {
                                  try {
                                    actionConfigField.onChange(JSON.parse(e.target.value))
                                  } catch {
                                    // Invalid JSON, don't update field.value
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              <div className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                Define parameters for this action in JSON format.
                              </div>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Workflow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
