import { create } from "zustand"
import { setClientToken } from "@/lib/api/client"

const ACCESS_TOKEN_KEY = "gigi_access_token"

interface AuthState {
  accessToken: string | null
  tempToken: string | null
  setAccessToken: (token: string | null) => void
  setTempToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Đọc token từ localStorage để UI hiểu trạng thái đăng nhập ngay khi load
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  tempToken: null,
  setAccessToken: (token) => {
    setClientToken(token)
    set({ accessToken: token })
  },
  setTempToken: (token) => set({ tempToken: token }),
  clearAuth: () => {
    setClientToken(null)
    set({ accessToken: null, tempToken: null })
  },
}))
