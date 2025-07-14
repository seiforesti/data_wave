"use client"

import { useState, useEffect, useCallback } from "react"
import type { ComplianceReport } from "../types"
import { api } from "../services/api"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

export function useReports() {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.reports.getAll()
      setReports(data)
    } catch (err) {
      console.error("Failed to fetch compliance reports:", err)
      setError("Failed to load compliance reports.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load compliance reports.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const createReport = useCallback(
    async (
      newReport: Omit<
        ComplianceReport,
        "id" | "created_at" | "status" | "generated_by" | "updated_at" | "updated_by" | "last_generated_at" | "file_url"
      >,
    ) => {
      try {
        const createdReport = await api.reports.create(newReport)
        setReports((prev) => [...prev, createdReport])
        showNotification({
          type: "success",
          title: "Report Created",
          message: `Compliance report "${createdReport.name}" has been created.`,
        })
        return createdReport
      } catch (err) {
        console.error("Failed to create compliance report:", err)
        setError("Failed to create compliance report.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to create compliance report.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const updateReport = useCallback(
    async (id: number, updatedFields: Partial<ComplianceReport>) => {
      try {
        const updatedReport = await api.reports.update(id, updatedFields)
        if (updatedReport) {
          setReports((prev) => prev.map((report) => (report.id === id ? updatedReport : report)))
          showNotification({
            type: "success",
            title: "Report Updated",
            message: `Compliance report "${updatedReport.name}" has been updated.`,
          })
          return updatedReport
        }
        return undefined
      } catch (err) {
        console.error("Failed to update compliance report:", err)
        setError("Failed to update compliance report.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to update compliance report.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const deleteReport = useCallback(
    async (id: number) => {
      try {
        const success = await api.reports.delete(id)
        if (success) {
          setReports((prev) => prev.filter((r) => r.id !== id))
          showNotification({
            type: "success",
            title: "Report Deleted",
            message: "Compliance report has been deleted.",
          })
          return true
        }
        return false
      } catch (err) {
        console.error("Failed to delete compliance report:", err)
        setError("Failed to delete compliance report.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to delete compliance report.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const generateReport = useCallback(
    async (id: number) => {
      try {
        const generatedReport = await api.reports.generate(id)
        if (generatedReport) {
          setReports((prev) => prev.map((r) => (r.id === id ? generatedReport : r)))
          showNotification({
            type: "success",
            title: "Report Generated",
            message: `Report "${generatedReport.name}" generated successfully.`,
          })
          return generatedReport
        }
        return undefined
      } catch (err) {
        console.error("Failed to generate report:", err)
        setError("Failed to generate report.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to generate report.",
        })
        throw err
      }
    },
    [showNotification],
  )

  return {
    reports,
    isLoading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
  }
}
