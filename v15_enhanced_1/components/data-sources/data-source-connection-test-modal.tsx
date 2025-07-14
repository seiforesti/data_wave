"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Database,
  Activity,
  AlertCircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ConnectionTestResult {
  success: boolean
  message?: string
  connection_time_ms?: number
  details?: Record<string, any>
  recommendations?: Array<{
    title: string
    description: string
    severity: "info" | "warning" | "critical"
  }>
}

interface DataSourceConnectionTestModalProps {
  open: boolean
  onClose: () => void
  dataSourceId: number
  onTestConnection?: (id: number) => Promise<ConnectionTestResult>
}

export function DataSourceConnectionTestModal({
  open,
  onClose,
  dataSourceId,
  onTestConnection,
}: DataSourceConnectionTestModalProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<ConnectionTestResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (open && dataSourceId && !result) {
      test()
    }
  }, [open, dataSourceId, result])

  const test = async () => {
    setIsTesting(true)
    setResult(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    if (onTestConnection) {
      try {
        const res = await onTestConnection(dataSourceId)
        setResult(res)
        setProgress(100)
      } catch (e) {
        setResult({ success: false, message: "Unexpected error" })
        setProgress(0)
      }
    } else {
      // Fallback mock
      await new Promise((r) => setTimeout(r, 1000))
      setResult({ success: true, message: "Mock connection successful" })
      setProgress(100)
    }

    clearInterval(progressInterval)
    setIsTesting(false)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatConnectionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Test
          </DialogTitle>
          <DialogDescription>Testing connection to Data Source #{dataSourceId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isTesting ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Activity className="h-8 w-8 animate-spin" />
              <p>Testing connection to data-source #{dataSourceId}…</p>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center gap-4 py-8">
              {result.success ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p className="font-medium">Connection successful</p>
                  {result.message && <p className="text-sm text-muted-foreground">{result.message}</p>}
                </>
              ) : (
                <>
                  <AlertCircleIcon className="h-8 w-8 text-red-500" />
                  <p className="font-medium">Connection failed</p>
                  {result.message && <p className="text-sm text-muted-foreground">{result.message}</p>}
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              Click “Test” to check the connectivity for data-source #{dataSourceId}.
            </p>
          )}

          {result && result.details && Object.keys(result.details).length > 0 && (
            <Card>
              <Collapsible open={expandedSections.has("details")} onOpenChange={() => toggleSection("details")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>Connection Details</span>
                      {expandedSections.has("details") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {Object.entries(result.details).map(([key, value], index) => (
                        <div key={key}>
                          {index > 0 && <Separator />}
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              {typeof value === "boolean" ? (
                                value ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )
                              ) : (
                                <Info className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="font-medium">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {typeof value === "boolean" ? (value ? "Success" : "Failed") : String(value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}

          {result && result.recommendations && result.recommendations.length > 0 && (
            <Card>
              <Collapsible
                open={expandedSections.has("recommendations")}
                onOpenChange={() => toggleSection("recommendations")}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <span>Recommendations</span>
                        <Badge variant="secondary">{result.recommendations.length}</Badge>
                      </div>
                      {expandedSections.has("recommendations") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {result.recommendations.map((recommendation, index) => (
                        <div key={index}>
                          {index > 0 && <Separator />}
                          <div className="flex gap-3 py-2">
                            {getSeverityIcon(recommendation.severity)}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{recommendation.title}</span>
                                <Badge variant={getSeverityVariant(recommendation.severity)} className="text-xs">
                                  {recommendation.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={test} disabled={isTesting}>
            {isTesting ? "Testing…" : result ? "Test Again" : "Test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
