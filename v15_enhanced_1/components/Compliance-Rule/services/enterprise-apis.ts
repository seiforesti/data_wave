import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

const enterpriseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

// Add auth token automatically if present
enterpriseApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  if (token) config.headers["Authorization"] = `Bearer ${token}`
  return config
})

export const rules = {
  async getAll(data_source_id: number = 1) {
    const { data } = await enterpriseApi.get(`/compliance/rules`, { params: { data_source_id } })
    return data.data ?? data
  },
  async getById(id: number) {
    const { data } = await enterpriseApi.get(`/compliance/rules/${id}`)
    return data.data ?? data
  },
  async create(newRule: any) {
    const { data } = await enterpriseApi.post(`/compliance/rules`, newRule)
    return data.data ?? data
  },
  async update(id: number, updates: any) {
    const { data } = await enterpriseApi.put(`/compliance/rules/${id}`, updates)
    return data.data ?? data
  },
  async delete(id: number) {
    const { data } = await enterpriseApi.delete(`/compliance/rules/${id}`)
    return data.success ?? true
  },
  async validate(id: number) {
    const { data } = await enterpriseApi.post(`/compliance/rules/${id}/validate`)
    return data.data ?? data
  },
}

export const issues = {
  async getAll(filters: Record<string, any> = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)))
    const { data } = await enterpriseApi.get(`/security/vulnerabilities${params.toString() ? `?${params}` : ""}`)
    return data.data ?? data
  },
  async update(id: number, updates: any) {
    const { data } = await enterpriseApi.post(`/security/vulnerabilities/${id}/remediate`, updates)
    return data.data ?? data
  },
}

export const summary = {
  async get(data_source_id?: number) {
    const { data } = await enterpriseApi.get(`/dashboard/compliance${data_source_id ? `?data_source_id=${data_source_id}` : ""}`)
    return data.data ?? data
  },
}

export const integrations = {
  async getAll(data_source_id: number = 1) {
    const { data } = await enterpriseApi.get(`/data-sources/${data_source_id}/integrations`)
    return data.data?.integrations ?? data
  },
  async create(integration: any, data_source_id: number = 1) {
    const { data } = await enterpriseApi.post(`/data-sources/${data_source_id}/integrations`, integration)
    return data.data ?? data
  },
  async update(id: number, updates: any, data_source_id: number = 1) {
    const { data } = await enterpriseApi.put(`/data-sources/${data_source_id}/integrations/${id}`, updates)
    return data.data ?? data
  },
  async delete(id: number, data_source_id: number = 1) {
    const { data } = await enterpriseApi.delete(`/data-sources/${data_source_id}/integrations/${id}`)
    return data.success ?? true
  },
  async test(id: number) {
    const { data } = await enterpriseApi.post(`/data-sources/integrations/${id}/test`)
    return data
  },
  async toggleStatus(id: number) {
    const { data } = await enterpriseApi.post(`/data-sources/integrations/${id}/toggle`)
    return data.data ?? data
  },
}

export const workflows = {
  async getAll(filters: Record<string, any> = {}) {
    const { data } = await enterpriseApi.get(`/workflow/designer/workflows`, { params: filters })
    return data.data ?? data
  },
  async create(workflow: any) {
    const { data } = await enterpriseApi.post(`/workflow/designer/workflows`, workflow)
    return data.data ?? data
  },
  async update(id: string | number, updates: any) {
    const { data } = await enterpriseApi.put(`/workflow/designer/workflows/${id}`, updates)
    return data.data ?? data
  },
  async delete(id: string | number) {
    const { data } = await enterpriseApi.delete(`/workflow/designer/workflows/${id}`)
    return data.success ?? true
  },
  async execute(id: string | number, payload: any = {}) {
    const { data } = await enterpriseApi.post(`/workflow/workflows/${id}/execute`, payload)
    return data.data ?? data
  },
  async toggleStatus(id: string | number) {
    // No direct endpoint; simulate via update
    const wf = await this.update(id, { status: "inactive" })
    return wf
  },
}

export const reports = {
  async getAll(data_source_id: number = 1) {
    const { data } = await enterpriseApi.get(`/data-sources/${data_source_id}/reports`)
    return data.data?.reports ?? data
  },
  async create(report: any, data_source_id: number = 1) {
    const { data } = await enterpriseApi.post(`/data-sources/${data_source_id}/reports`, report)
    return data.data ?? data
  },
  async update(id: number, updates: any, data_source_id: number = 1) {
    const { data } = await enterpriseApi.put(`/data-sources/${data_source_id}/reports/${id}`, updates)
    return data.data ?? data
  },
  async delete(id: number, data_source_id: number = 1) {
    const { data } = await enterpriseApi.delete(`/data-sources/${data_source_id}/reports/${id}`)
    return data.success ?? true
  },
  async generate(id: number, data_source_id: number = 1) {
    const { data } = await enterpriseApi.post(`/data-sources/${data_source_id}/reports/${id}/generate`)
    return data.data ?? data
  },
}

export const api = {
  rules,
  issues,
  summary,
  integrations,
  workflows,
  reports,
}