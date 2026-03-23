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

export interface UserProfile {
  _id: string
  email: string
  phone: string | null
  full_name: string
  avatar_url: string | null
  date_of_birth: string | null
  gender: "male" | "female" | "other" | null
  system_role: "admin" | "user"
  status: "active" | "inactive" | "banned" | "pending"
  email_verified_at: string | null
  phone_verified_at: string | null
  last_login_at: string | null
  two_factor_enabled: boolean
  preferences: {
    language: "en" | "vi"
    theme: "light" | "dark" | "system"
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  created_at: string
  updated_at: string
  is_email_verified?: boolean
  is_phone_verified?: boolean
}

export interface UpdateProfilePayload {
  full_name?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
}

export interface UpdatePreferencesPayload {
  language?: "en" | "vi"
  theme?: "light" | "dark" | "system"
  notifications?: {
    email?: boolean
    phone?: boolean
    push?: boolean
  }
}
