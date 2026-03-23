import axios from "axios"
import type { AxiosResponse } from "axios"
import type { ApiSuccessResponse } from "./types"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""
const ACCESS_TOKEN_KEY = "gigi_access_token"

// Sync in-memory token từ localStorage để tránh đọc localStorage mỗi request
let _accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY)

export function setClientToken(token: string | null): void {
  _accessToken = token
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

interface RequestWithRetryFlag {
  _retry?: boolean
  headers?: Record<string, string>
}

let refreshPromise: Promise<string> | null = null

export function unwrapResponseData<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  return response.data.data
}

/**
 * Gọi khi app khởi động để lấy lại access token từ HttpOnly refresh cookie.
 * Trả về token mới hoặc null nếu cookie hết hạn / không tồn tại.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
  const res = await refreshClient.post<ApiSuccessResponse<{ access_token: string }>>("/auths/refresh-token")
    const token = res.data.data.access_token
    setClientToken(token)
    return token
  } catch {
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const errorCode = error?.response?.data?.errorCode
    const originalConfig = error?.config as (typeof error.config & RequestWithRetryFlag) | undefined

    if (
      status === 401 &&
      errorCode === "AUTH_003" &&
      originalConfig &&
      !originalConfig._retry
    ) {
      originalConfig._retry = true

      try {
        if (!refreshPromise) {
            refreshPromise = refreshClient
              .post<ApiSuccessResponse<{ access_token: string }>>("/auths/refresh-token")
            .then((res) => {
              const newToken = res.data.data.access_token
              setClientToken(newToken)
              return newToken
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const newAccessToken = await refreshPromise
        originalConfig.headers = originalConfig.headers ?? {}
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalConfig)
      } catch (refreshError) {
        setClientToken(null)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
