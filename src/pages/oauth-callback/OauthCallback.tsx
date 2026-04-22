import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { SETTINGS_DEFAULT_PATH } from "@/routes/setting-route-config"

/**
 * Trang callback sau khi Google OAuth hoàn tất.
 * Server redirect về /oauth/callback?access_token=<token>
 * Trang này lưu token và tự chuyển về trang settings.
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  const { token, errorMessage } = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get("access_token")
    const errorCode = params.get("errorCode")

    if (errorCode || !accessToken) {
      const message =
        errorCode === "AUTH_004"
          ? "Tài khoản bị khóa. Vui lòng liên hệ hỗ trợ."
          : "Đăng nhập Google thất bại. Vui lòng thử lại."

      return { token: null, errorMessage: message }
    }

    return { token: accessToken, errorMessage: null }
  }, [])

  useEffect(() => {
    if (errorMessage || !token) {
      if (errorMessage) toast.error(errorMessage)
      return
    }

    setAccessToken(token)
    navigate(SETTINGS_DEFAULT_PATH, { replace: true })
  }, [errorMessage, navigate, setAccessToken, token])

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{errorMessage}</p>
        <a href="/auth/login" className="text-sm underline">Quay lại trang đăng nhập</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Đang xử lý đăng nhập...</p>
    </div>
  )
}
