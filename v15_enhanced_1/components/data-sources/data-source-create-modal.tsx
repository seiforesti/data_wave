"use client"

import type React from "react"
import { useState } from "react"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface DataSourceCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (ds: { name: string; type: string }) => void
}

interface FormData {
  name: string
  source_type: string
  location: string
  host: string
  port: number
  username: string
  password: string
  database_name: string
  description: string
}

const dataSourceTypes = [
  {
    value: "mysql",
    label: "MySQL",
    defaultPort: 3306,
    icon: <Database className="h-4 w-4" />,
    description: "MySQL relational database",
  },
  {
    value: "postgresql",
    label: "PostgreSQL",
    defaultPort: 5432,
    icon: <Database className="h-4 w-4" />,
    description: "PostgreSQL relational database",
  },
  {
    value: "mongodb",
    label: "MongoDB",
    defaultPort: 27017,
    icon: <Database className="h-4 w-4" />,
    description: "MongoDB document database",
  },
]

export function DataSourceCreateModal({ open, onClose, onSuccess }: DataSourceCreateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    source_type: "postgresql",
    location: "on-premise",
    host: "",
    port: 5432,
    username: "",
    password: "",
    database_name: "",
    description: "",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleTypeChange = (type: string) => {
    const selectedType = dataSourceTypes.find((t) => t.value === type)
    setFormData((prev) => ({
      ...prev,
      source_type: type,
      port: selectedType?.defaultPort || 0,
    }))
    if (errors.source_type) {
      setErrors((prev) => ({ ...prev, source_type: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.source_type) newErrors.source_type = "Type is required"
    if (!formData.host.trim()) newErrors.host = "Host is required"
    if (!formData.port || formData.port <= 0) newErrors.port = "Valid port is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    if (formData.source_type !== "mongodb" && !formData.database_name.trim()) {
      newErrors.database_name = "Database name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (onSuccess) {
        await onSuccess({ name: formData.name, type: formData.source_type })
      }
      onClose()
    } catch (error: any) {
      setSubmitError(error.message || "Failed to create data source")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = dataSourceTypes.find((t) => t.value === formData.source_type)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add New Data Source
          </DialogTitle>
          <DialogDescription>
            Connect to your database or data warehouse to start cataloging and governing your data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Data Source Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="My Database"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_type">Data Source Type *</Label>
                  <Select value={formData.source_type} onValueChange={handleTypeChange}>
                    <SelectTrigger className={errors.source_type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.source_type && <p className="text-sm text-destructive">{errors.source_type}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="On-Premise / Cloud"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Details</CardTitle>
              {selectedType && (
                <CardDescription className="flex items-center gap-2">
                  {selectedType.icon}
                  <span>Connecting to {selectedType.label}</span>
                  <Badge variant="outline">Port {formData.port}</Badge>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => handleInputChange("host", e.target.value)}
                    placeholder="localhost or IP address"
                    className={errors.host ? "border-destructive" : ""}
                  />
                  {errors.host && <p className="text-sm text-destructive">{errors.host}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port || ""}
                    onChange={(e) => handleInputChange("port", Number.parseInt(e.target.value) || 0)}
                    placeholder="3306"
                    className={errors.port ? "border-destructive" : ""}
                  />
                  {errors.port && <p className="text-sm text-destructive">{errors.port}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Database username"
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Database password"
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              </div>

              {formData.source_type !== "mongodb" && (
                <div className="space-y-2">
                  <Label htmlFor="database_name">Database Name *</Label>
                  <Input
                    id="database_name"
                    value={formData.database_name}
                    onChange={(e) => handleInputChange("database_name", e.target.value)}
                    placeholder="Database or schema name"
                    className={errors.database_name ? "border-destructive" : ""}
                  />
                  {errors.database_name && <p className="text-sm text-destructive">{errors.database_name}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Data Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
