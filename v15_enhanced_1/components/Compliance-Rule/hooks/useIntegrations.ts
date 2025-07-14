"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "../services/api"
import type { IntegrationConfig } from "../types"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.integrations.getAll()
      setIntegrations(data)
    } catch (err) {
      console.error("Failed to fetch integrations:", err)
      setError("Failed to load integrations.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load integrations.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showNotification]) // Added showNotification to dependency array

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations]) // Only re-run when fetchIntegrations changes

  const createIntegration = useCallback(
    async (
      newIntegration: Omit<
        IntegrationConfig,
        "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
      >,
    ) => {
      try {
        const createdIntegration = await api.integrations.create(newIntegration)
        setIntegrations((prev) => [...prev, createdIntegration])
        showNotification({
          type: "success",
          title: "Integration Added",
          message: `Integration "${createdIntegration.name}" has been added.`,
        })
        return createdIntegration
      } catch (err) {
        console.error("Failed to create integration:", err)
        setError("Failed to create integration.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to create integration.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const updateIntegration = useCallback(
    async (id: number, updatedFields: Partial<IntegrationConfig>) => {
      try {
        const updatedIntegration = await api.integrations.update(id, updatedFields)
        if (updatedIntegration) {
          setIntegrations((prev) => prev.map((int) => (int.id === id ? updatedIntegration : int)))
          showNotification({
            type: "success",
            title: "Integration Updated",
            message: `Integration "${updatedIntegration.name}" has been updated.`,
          })
          return updatedIntegration
        }
        return undefined
      } catch (err) {
        console.error("Failed to update integration:", err)
        setError("Failed to update integration.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to update integration.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const deleteIntegration = useCallback(
    async (id: number) => {
      try {
        const success = await api.integrations.delete(id)
        if (success) {
          setIntegrations((prev) => prev.filter((int) => int.id !== id))
          showNotification({
            type: "success",
            title: "Integration Deleted",
            message: "Integration has been deleted.",
          })
          return true
        }
        return false
      } catch (err) {
        console.error("Failed to delete integration:", err)
        setError("Failed to delete integration.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to delete integration.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const testIntegration = useCallback(
    async (id: number) => {
      try {
        const result = await api.integrations.test(id)
        if (result.success) {
          showNotification({
            type: "success",
            title: "Test Successful",
            message: result.message,
          })
        } else {
          showNotification({
            type: "error",
            title: "Test Failed",
            message: result.message,
          })
        }
        // Re-fetch integrations to update status/error_message in UI
        fetchIntegrations()
        return result.success
      } catch (err) {
        console.error("Failed to test integration:", err)
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to test integration.",
        })
        return false
      }
    },
    [showNotification, fetchIntegrations],
  )

  const toggleIntegrationStatus = useCallback(
    async (id: number) => {
      try {
        const updatedIntegration = await api.integrations.toggleStatus(id)
        if (updatedIntegration) {
          setIntegrations((prev) => prev.map((int) => (int.id === id ? updatedIntegration : int)))
          showNotification({
            type: "success",
            title: "Integration Status Updated",
            message: `Integration "${updatedIntegration.name}" is now ${updatedIntegration.status}.`,
          })
          return updatedIntegration
        }
        return undefined
      } catch (err) {
        console.error("Failed to toggle integration status:", err)
        setError("Failed to toggle integration status.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to toggle integration status.",
        })
        throw err
      }
    },
    [showNotification],
  )

  return {
    integrations,
    isLoading,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    toggleIntegrationStatus,
  }
}
