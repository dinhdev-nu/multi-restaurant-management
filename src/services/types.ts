export interface ApiErrorResponse {
  success: boolean
  errorCode: string
  message: string
  details: unknown | null
  path: string
  correlationId: string
  timestamp: string
}

export interface ApiSuccessResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  correlationId: string
  timestamp: string
}

export interface AppError {
  status?: number
  errorCode?: string
  message: string
  details?: unknown | null
}
