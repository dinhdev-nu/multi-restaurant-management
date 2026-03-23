import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"

/**
 * Trang callback sau khi Google OAuth hoàn tất.
 * Server redirect về /oauth/callback?access_token=<token>
 * Trang này lưu token và tự chuyển về /profile.
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token")
    const errorCode = params.get("errorCode")

    if (errorCode || !token) {
      const message = errorCode === "AUTH_004"
        ? "Tài khoản bị khóa. Vui lòng liên hệ hỗ trợ."
        : "Đăng nhập Google thất bại. Vui lòng thử lại."
      toast.error(message)
      setError(message)
      return
    }

    setAccessToken(token)
    navigate("/profile", { replace: true })
  }, [navigate, setAccessToken])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <a href="/auths" className="text-sm underline">Quay lại trang đăng nhập</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Đang xử lý đăng nhập...</p>
    </div>
  )
}
