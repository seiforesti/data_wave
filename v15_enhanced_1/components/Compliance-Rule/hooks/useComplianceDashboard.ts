"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "../services/enterprise-apis"
import type { ComplianceSummary } from "../types"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

interface DashboardData {
  metrics: any
  recentIssues: any[]
  trends: any[]
  topViolatedRules: Array<{
    rule: any
    violationCount: number
    trend: "up" | "down" | "stable"
  }>
  complianceByCategory: Array<{
    category: string
    compliant: number
    nonCompliant: number
    percentage: number
  }>
}

interface UseComplianceDashboardReturn {
  summary: ComplianceSummary | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useComplianceDashboard() {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.summary.get()
      setSummary(data)
    } catch (err) {
      console.error("Failed to fetch compliance summary:", err)
      setError("Failed to load compliance dashboard data.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load compliance dashboard data.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const refreshData = useCallback(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    isLoading,
    error,
    refreshData,
  }
}
