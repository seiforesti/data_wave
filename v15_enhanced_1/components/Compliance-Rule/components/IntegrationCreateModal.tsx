"use client"

import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Mail, Webhook, Settings } from "lucide-react"
import type { IntegrationConfig } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(["jira", "servicenow", "slack", "email", "custom_webhook"]),
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
      message: "Configuration must be a valid JSON object",
    }),
})

type FormData = z.infer<typeof formSchema>

interface IntegrationCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (
    integration: Omit<
      IntegrationConfig,
      "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
    >,
  ) => void
}

const integrationTypeOptions = [
  {
    value: "jira",
    label: "Jira",
    icon: () => <img src="/placeholder.svg?height=16&width=16" alt="Jira" className="h-4 w-4" />,
  },
  {
    value: "servicenow",
    label: "ServiceNow",
    icon: () => <img src="/placeholder.svg?height=16&width=16" alt="ServiceNow" className="h-4 w-4" />,
  },
  {
    value: "slack",
    label: "Slack",
    icon: () => <img src="/placeholder.svg?height=16&width=16" alt="Slack" className="h-4 w-4" />,
  },
  { value: "email", label: "Email", icon: Mail },
  { value: "custom_webhook", label: "Custom Webhook", icon: Webhook },
]

export function IntegrationCreateModal({ isOpen, onClose, onSuccess }: IntegrationCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "jira",
      config: {},
    },
  })

  const watchType = form.watch("type")

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      await onSuccess(
        data as Omit<
          IntegrationConfig,
          "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
        >,
      )
      form.reset()
      onClose()
    } catch (error) {
      console.error("Failed to create integration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConfigPlaceholder = (type: string) => {
    switch (type) {
      case "jira":
        return 'e.g., {"url": "https://jira.company.com", "api_key": "...", "project_key": "COMP"}'
      case "servicenow":
        return 'e.g., {"instance_url": "https://company.service-now.com", "username": "...", "password": "..."}'
      case "slack":
        return 'e.g., {"webhook_url": "https://hooks.slack.com/...", "channel": "#alerts"}'
      case "email":
        return 'e.g., {"smtp_server": "smtp.company.com", "port": 587, "from_address": "alerts@company.com"}'
      case "custom_webhook":
        return 'e.g., {"webhook_url": "https://api.company.com/custom-hook", "headers": {"Authorization": "Bearer ..."}}'
      default:
        return "Enter configuration in JSON format"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add New Integration
          </DialogTitle>
          <DialogDescription>Configure a new external system integration.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integration Details</CardTitle>
                  <CardDescription>Basic information and connection settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jira Issue Tracker" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
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
                            {integrationTypeOptions.map((option) => {
                              const Icon = option.icon
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon />
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
                    name="config"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuration (JSON) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={getConfigPlaceholder(watchType)}
                            className="min-h-[150px] font-mono"
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
                            Enter the connection configuration in JSON format.
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </ScrollArea>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Integration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
