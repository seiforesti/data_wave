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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, FileText, Mail, Filter, CalendarDays } from "lucide-react"
import type { ComplianceReport } from "../types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["summary", "detail", "trend", "custom"]),
  format: z.enum(["pdf", "csv", "json", "xlsx"]),
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
        return z.NEVER // Indicate a parsing error
      }
    })
    .refine((val) => typeof val === "object" && val !== null, {
      message: "Filters must be a valid JSON object",
    }),
  template_id: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ReportCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (
    report: Omit<
      ComplianceReport,
      "id" | "created_at" | "status" | "generated_by" | "updated_at" | "updated_by" | "last_generated_at" | "file_url"
    >,
  ) => void
}

const reportTypeOptions = [
  { value: "summary", label: "Summary", description: "High-level overview" },
  { value: "detail", label: "Detail", description: "Granular findings" },
  { value: "trend", label: "Trend", description: "Historical performance" },
  { value: "custom", label: "Custom", description: "User-defined content" },
]

const reportFormatOptions = ["pdf", "csv", "json", "xlsx"]
const reportScheduleOptions = ["daily", "weekly", "monthly", "quarterly", "on_demand"]

export function ReportCreateModal({ isOpen, onClose, onSuccess }: ReportCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)

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
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      // Convert recipients array back to comma-separated string for API if needed, or handle in API
      // For now, the transform handles it.
      await onSuccess(
        data as Omit<
          ComplianceReport,
          | "id"
          | "created_at"
          | "status"
          | "generated_by"
          | "updated_at"
          | "updated_by"
          | "last_generated_at"
          | "file_url"
        >,
      )
      form.reset()
      onClose()
    } catch (error) {
      console.error("Failed to create report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Report
          </DialogTitle>
          <DialogDescription>Define the properties for your new compliance report.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Details</CardTitle>
                  <CardDescription>Basic information about the report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of the report content." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                              {reportTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
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
                                <SelectItem key={option} value={option}>
                                  {option.toUpperCase()}
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
                              <SelectItem key={option} value={option}>
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4" />
                                  {option.charAt(0).toUpperCase() + option.slice(1).replace("_", " ")}
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
                </CardContent>
              </Card>

              <Card className="mt-4">
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
                            placeholder="e.g., user1@example.com, user2@example.com"
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
                            placeholder='e.g., {"severity": "critical", "data_source_id": 1}'
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
                            <Filter className="h-3 w-3" />
                            Define data filters in JSON format (e.g., `{'severity": "critical'}`).
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional template ID for custom reports" {...field} />
                        </FormControl>
                        <FormDescription>Specify a custom template ID if applicable.</FormDescription>
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
                {isLoading ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
