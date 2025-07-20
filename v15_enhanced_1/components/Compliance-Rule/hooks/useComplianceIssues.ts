"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "../services/enterprise-apis"
import type { ComplianceIssue } from "../types"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

interface UseComplianceIssuesOptions {
  ruleId?: number
  status?: string
  severity?: string
}

export function useComplianceIssues(options?: UseComplianceIssuesOptions) {
  const [issues, setIssues] = useState<ComplianceIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchIssues = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.issues.getAll(options)
      setIssues(data)
    } catch (err) {
      console.error("Failed to fetch compliance issues:", err)
      setError("Failed to load compliance issues.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load compliance issues.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [options, showNotification])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const updateIssue = useCallback(
    async (id: number, updatedFields: Partial<ComplianceIssue>) => {
      try {
        const updatedIssue = await api.issues.update(id, updatedFields)
        if (updatedIssue) {
          setIssues((prev) => prev.map((issue) => (issue.id === id ? updatedIssue : issue)))
          showNotification({
            type: "success",
            title: "Issue Updated",
            message: `Compliance issue #${updatedIssue.id} has been updated.`,
          })
          return updatedIssue
        }
        return undefined
      } catch (err) {
        console.error("Failed to update compliance issue:", err)
        setError("Failed to update compliance issue.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to update compliance issue.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const assignIssue = useCallback(
    async (id: number, assignedTo: string) => {
      try {
        const updatedIssue = await api.issues.update(id, { assigned_to: assignedTo })
        if (updatedIssue) {
          setIssues((prev) => prev.map((issue) => (issue.id === id ? updatedIssue : issue)))
          showNotification({
            type: "success",
            title: "Issue Assigned",
            message: `Issue #${updatedIssue.id} assigned to ${assignedTo}.`,
          })
          return updatedIssue
        }
        return undefined
      } catch (err) {
        console.error("Failed to assign issue:", err)
        setError("Failed to assign issue.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to assign issue.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const changeIssueStatus = useCallback(
    async (id: number, status: ComplianceIssue["status"]) => {
      try {
        const updatedIssue = await api.issues.update(id, {
          status: status,
          resolved_at:
            status === "resolved" || status === "closed" || status === "false_positive"
              ? new Date().toISOString()
              : undefined,
        })
        if (updatedIssue) {
          setIssues((prev) => prev.map((issue) => (issue.id === id ? updatedIssue : issue)))
          showNotification({
            type: "success",
            title: "Issue Status Updated",
            message: `Issue #${updatedIssue.id} status changed to ${status}.`,
          })
          return updatedIssue
        }
        return undefined
      } catch (err) {
        console.error("Failed to change issue status:", err)
        setError("Failed to change issue status.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to change issue status.",
        })
        throw err
      }
    },
    [showNotification],
  )

  return {
    issues,
    isLoading,
    error,
    fetchIssues,
    updateIssue,
    assignIssue,
    changeIssueStatus,
  }
}
