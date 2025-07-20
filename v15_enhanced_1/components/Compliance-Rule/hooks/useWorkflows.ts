"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "../services/enterprise-apis"
import type { ComplianceWorkflow } from "../types"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.workflows.getAll()
      setWorkflows(data)
    } catch (err) {
      console.error("Failed to fetch workflows:", err)
      setError("Failed to load workflows.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load workflows.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const createWorkflow = useCallback(
    async (
      newWorkflow: Omit<
        ComplianceWorkflow,
        "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
      >,
    ) => {
      try {
        const createdWorkflow = await api.workflows.create(newWorkflow)
        setWorkflows((prev) => [...prev, createdWorkflow])
        showNotification({
          type: "success",
          title: "Workflow Created",
          message: `Workflow "${createdWorkflow.name}" has been created.`,
        })
        return createdWorkflow
      } catch (err) {
        console.error("Failed to create workflow:", err)
        setError("Failed to create workflow.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to create workflow.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const updateWorkflow = useCallback(
    async (id: number, updatedFields: Partial<ComplianceWorkflow>) => {
      try {
        const updatedWorkflow = await api.workflows.update(id, updatedFields)
        if (updatedWorkflow) {
          setWorkflows((prev) => prev.map((wf) => (wf.id === id ? updatedWorkflow : wf)))
          showNotification({
            type: "success",
            title: "Workflow Updated",
            message: `Workflow "${updatedWorkflow.name}" has been updated.`,
          })
          return updatedWorkflow
        }
        return undefined
      } catch (err) {
        console.error("Failed to update workflow:", err)
        setError("Failed to update workflow.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to update workflow.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const deleteWorkflow = useCallback(
    async (id: number) => {
      try {
        const success = await api.workflows.delete(id)
        if (success) {
          setWorkflows((prev) => prev.filter((wf) => wf.id !== id))
          showNotification({
            type: "success",
            title: "Workflow Deleted",
            message: "Workflow has been deleted.",
          })
          return true
        }
        return false
      } catch (err) {
        console.error("Failed to delete workflow:", err)
        setError("Failed to delete workflow.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to delete workflow.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const executeWorkflow = useCallback(
    async (id: number) => {
      try {
        const executedWorkflow = await api.workflows.execute(id)
        if (executedWorkflow) {
          setWorkflows((prev) => prev.map((wf) => (wf.id === id ? executedWorkflow : wf)))
          showNotification({
            type: "success",
            title: "Workflow Executed",
            message: `Workflow "${executedWorkflow.name}" executed with status: ${executedWorkflow.last_run_status}.`,
          })
          return executedWorkflow
        }
        return undefined
      } catch (err) {
        console.error("Failed to execute workflow:", err)
        setError("Failed to execute workflow.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to execute workflow.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const toggleWorkflowStatus = useCallback(
    async (id: number) => {
      try {
        const updatedWorkflow = await api.workflows.toggleStatus(id)
        if (updatedWorkflow) {
          setWorkflows((prev) => prev.map((wf) => (wf.id === id ? updatedWorkflow : wf)))
          showNotification({
            type: "success",
            title: "Workflow Status Updated",
            message: `Workflow "${updatedWorkflow.name}" is now ${updatedWorkflow.status}.`,
          })
          return updatedWorkflow
        }
        return undefined
      } catch (err) {
        console.error("Failed to toggle workflow status:", err)
        setError("Failed to toggle workflow status.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to toggle workflow status.",
        })
        throw err
      }
    },
    [showNotification],
  )

  return {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    toggleWorkflowStatus,
  }
}
