"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "../services/api"
import type { ComplianceRule } from "../types"
import { useNotifications } from "../../Scan-Rule-Sets/hooks/useNotifications"

export function useComplianceRules() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotifications()

  const fetchRules = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.rules.getAll()
      setRules(data)
    } catch (err) {
      console.error("Failed to fetch compliance rules:", err)
      setError("Failed to load compliance rules.")
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to load compliance rules.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const createRule = useCallback(
    async (
      newRule: Omit<
        ComplianceRule,
        | "id"
        | "created_at"
        | "updated_at"
        | "pass_rate"
        | "total_entities"
        | "passing_entities"
        | "failing_entities"
        | "last_validation"
        | "escalation_rules"
        | "audit_trail"
      >,
    ) => {
      try {
        const createdRule = await api.rules.create(newRule)
        setRules((prev) => [...prev, createdRule])
        showNotification({
          type: "success",
          title: "Rule Created",
          message: `Compliance rule "${createdRule.name}" has been created.`,
        })
        return createdRule
      } catch (err) {
        console.error("Failed to create compliance rule:", err)
        setError("Failed to create compliance rule.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to create compliance rule.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const updateRule = useCallback(
    async (id: number, updatedFields: Partial<ComplianceRule>) => {
      try {
        const updatedRule = await api.rules.update(id, updatedFields)
        if (updatedRule) {
          setRules((prev) => prev.map((rule) => (rule.id === id ? updatedRule : rule)))
          showNotification({
            type: "success",
            title: "Rule Updated",
            message: `Compliance rule "${updatedRule.name}" has been updated.`,
          })
          return updatedRule
        }
        return undefined
      } catch (err) {
        console.error("Failed to update compliance rule:", err)
        setError("Failed to update compliance rule.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to update compliance rule.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const deleteRule = useCallback(
    async (id: number) => {
      try {
        const success = await api.rules.delete(id)
        if (success) {
          setRules((prev) => prev.filter((rule) => rule.id !== id))
          showNotification({
            type: "success",
            title: "Rule Deleted",
            message: "Compliance rule has been deleted.",
          })
          return true
        }
        return false
      } catch (err) {
        console.error("Failed to delete compliance rule:", err)
        setError("Failed to delete compliance rule.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to delete compliance rule.",
        })
        throw err
      }
    },
    [showNotification],
  )

  const toggleRule = useCallback(
    async (id: number) => {
      const ruleToToggle = rules.find((rule) => rule.id === id)
      if (!ruleToToggle) return

      const newStatus = ruleToToggle.status === "active" ? "inactive" : "active"
      try {
        const updatedRule = await api.rules.update(id, { status: newStatus })
        if (updatedRule) {
          setRules((prev) => prev.map((rule) => (rule.id === id ? updatedRule : rule)))
          showNotification({
            type: "success",
            title: "Rule Status Updated",
            message: `Rule "${updatedRule.name}" is now ${newStatus}.`,
          })
          return updatedRule
        }
        return undefined
      } catch (err) {
        console.error("Failed to toggle rule status:", err)
        setError("Failed to toggle rule status.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to toggle rule status.",
        })
        throw err
      }
    },
    [rules, showNotification],
  )

  const validateRule = useCallback(
    async (id: number) => {
      try {
        const validatedRule = await api.rules.validate(id)
        if (validatedRule) {
          setRules((prev) => prev.map((rule) => (rule.id === id ? validatedRule : rule)))
          showNotification({
            type: "success",
            title: "Validation Complete",
            message: `Rule "${validatedRule.name}" validated successfully.`,
          })
          return validatedRule
        }
        return undefined
      } catch (err) {
        console.error("Failed to validate rule:", err)
        setError("Failed to validate rule.")
        showNotification({
          type: "error",
          title: "Error",
          message: "Failed to validate rule.",
        })
        throw err
      }
    },
    [showNotification],
  )

  return {
    rules,
    isLoading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    validateRule,
  }
}
