import apiClient from './base'

export interface HealthStatus {
  status: string
  application: string
  version: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export const fetchHealth = async (): Promise<ApiResponse<HealthStatus>> => {
  const response = await apiClient.get<ApiResponse<HealthStatus>>('/v1/health')
  return response.data
}
