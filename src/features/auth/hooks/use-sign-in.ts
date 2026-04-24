import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  login,
  send2faOtp, verify2faOtp,
  forgotPassword, verifyResetPasswordOtp, resetPassword,
} from "@/services/auths"
import { SETTINGS_DEFAULT_PATH } from "@/routes/setting-route-config"
import { toAppError } from "@/services/error"
import { useAuthStore } from "@/stores/auth-store"

interface SignInForm {
  email: string
  phoneNumber: string
  password: string
}

export type SignInStep =
  | "credentials"
  | "2fa"
  | "forgot-email"
  | "forgot-otp"
  | "forgot-reset"
  | "forgot-done"

export interface UseSignInReturn {
  form: SignInForm
  isLoading: boolean
  isSendingTwoFaOtp: boolean
  signInStep: SignInStep
  setSignInStep: (step: SignInStep) => void
  twoFaCode: string
  twoFaCountdown: number
  errorMessage: string | null
  rememberMe: boolean
  setRememberMe: (value: boolean) => void
  setTwoFaCode: (value: string) => void
  handleIdentifierChange: (value: string) => void
  handlePasswordChange: (value: string) => void
  handleForgotPassword: () => void
  handleBackFromTwoFa: () => void
  handleResendTwoFaOtp: () => Promise<void>
  handleVerifyTwoFa: () => Promise<void>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleGoogleLogin: () => void
  handleAppleLogin: () => void
  // Forgot password
  forgotEmail: string
  setForgotEmail: (v: string) => void
  forgotOtp: string
  setForgotOtp: (v: string) => void
  forgotNewPassword: string
  setForgotNewPassword: (v: string) => void
  forgotConfirmPassword: string
  setForgotConfirmPassword: (v: string) => void
  forgotCountdown: number
  isResendingForgotOtp: boolean
  handleForgotSubmitEmail: () => Promise<void>
  handleForgotResendOtp: () => Promise<void>
  handleForgotVerifyOtp: () => Promise<void>
  handleForgotResetPassword: () => Promise<void>
  handleBackToSignIn: () => void
}

export function useSignIn(): UseSignInReturn {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const tempToken = useAuthStore((state) => state.tempToken)
  const setTempToken = useAuthStore((state) => state.setTempToken)
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [isSendingTwoFaOtp, setIsSendingTwoFaOtp] = useState(false)
  const [signInStep, setSignInStep] = useState<SignInStep>("credentials")
  const [twoFaCode, setTwoFaCode] = useState("")
  const [twoFaCountdown, setTwoFaCountdown] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [form, setForm] = useState<SignInForm>({ email: "", phoneNumber: "", password: "" })

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotOtp, setForgotOtp] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("")
  const [forgotSessionToken, setForgotSessionToken] = useState("")
  const [forgotResetGrantToken, setForgotResetGrantToken] = useState("")
  const [forgotCountdown, setForgotCountdown] = useState(0)
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false)

  useEffect(() => {
    if (twoFaCountdown <= 0) return
    const timer = setTimeout(() => setTwoFaCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [twoFaCountdown])

  useEffect(() => {
    if (forgotCountdown <= 0) return
    const timer = setTimeout(() => setForgotCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [forgotCountdown])

  const handleIdentifierChange = (value: string) => {
    const isPhone = /^[+\d]/.test(value) && /^\+?\d[\d\s\-()]*$/.test(value)
    if (isPhone) {
      setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
    } else {
      setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
    }
  }

  const handlePasswordChange = (value: string) =>
    setForm((prev) => ({ ...prev, password: value }))

  const handleForgotPassword = () => {
    setForgotEmail(form.email || "")
    setSignInStep("forgot-email")
    setErrorMessage(null)
  }

  const handleBackFromTwoFa = () => {
    setSignInStep("credentials")
    setTwoFaCode("")
    setTwoFaCountdown(0)
    setTempToken(null)
    setErrorMessage(null)
  }

  const handleBackToSignIn = () => {
    setSignInStep("credentials")
    setForgotEmail("")
    setForgotOtp("")
    setForgotNewPassword("")
    setForgotConfirmPassword("")
    setForgotSessionToken("")
    setForgotResetGrantToken("")
    setForgotCountdown(0)
    setErrorMessage(null)
  }

  const handleResendTwoFaOtp = async () => {
    if (!tempToken || twoFaCountdown > 0 || isSendingTwoFaOtp) return
    setIsSendingTwoFaOtp(true)
    try {
      const { expires_in } = await send2faOtp(tempToken)
      setTwoFaCountdown(expires_in)
    } catch (error) {
      toast.error(toAppError(error, "Unable to resend 2FA OTP").message)
    } finally {
      setIsSendingTwoFaOtp(false)
    }
  }

  const handleVerifyTwoFa = async () => {
    if (!tempToken || twoFaCode.trim().length < 6) return
    setIsLoading(true)
    try {
      const result = await verify2faOtp(tempToken, twoFaCode)
      setAccessToken(result.access_token)
      setTempToken(null)
      navigate(SETTINGS_DEFAULT_PATH)
    } catch (error) {
      toast.error(toAppError(error, "2FA verification failed").message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const identifier = (form.email || form.phoneNumber).trim()
    if (!identifier || !form.password) {
      setErrorMessage("Please enter email/phone and password")
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    try {
      const result = await login({
        identifier,
        password: form.password,
        remember_me: rememberMe,
      })
      if ("state" in result && result.state === "2fa_required") {
        setTempToken(result.temp_token)
        setSignInStep("2fa")
        const { expires_in } = await send2faOtp(result.temp_token)
        setTwoFaCountdown(expires_in)
        setTwoFaCode("")
        return
      }

      if (!("access_token" in result)) {
        toast.error("Login response is invalid")
        return
      }

      setTempToken(null)
      setAccessToken(result.access_token)
      navigate(SETTINGS_DEFAULT_PATH)
    } catch (error) {
      toast.error(toAppError(error, "Sign-in failed").message)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Forgot password handlers ──────────────────────────────────────────────

  const handleForgotSubmitEmail = async () => {
    const email = forgotEmail.trim()
    if (!email) {
      setErrorMessage("Please enter your email address")
      return
    }
    setErrorMessage(null)
    setIsLoading(true)
    try {
      const { session_token } = await forgotPassword(email)
      setForgotSessionToken(session_token)
      setSignInStep("forgot-otp")
      setForgotCountdown(60)
    } catch (error) {
      toast.error(toAppError(error, "Unable to send reset OTP").message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotResendOtp = async () => {
    if (!forgotEmail.trim() || forgotCountdown > 0 || isResendingForgotOtp) return
    setIsResendingForgotOtp(true)
    try {
      const { session_token } = await forgotPassword(forgotEmail.trim())
      setForgotSessionToken(session_token)
      setForgotCountdown(60)
    } catch (error) {
      toast.error(toAppError(error, "Unable to resend OTP").message)
    } finally {
      setIsResendingForgotOtp(false)
    }
  }

  const handleForgotVerifyOtp = async () => {
    if (forgotOtp.trim().length < 6) return
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const { reset_grant_token } = await verifyResetPasswordOtp(forgotSessionToken, forgotOtp)
      setForgotResetGrantToken(reset_grant_token)
      setSignInStep("forgot-reset")
    } catch (error) {
      toast.error(toAppError(error, "Mã OTP không hợp lệ").message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotResetPassword = async () => {
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }
    if (forgotNewPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters")
      return
    }
    setErrorMessage(null)
    setIsLoading(true)
    try {
      await resetPassword(forgotResetGrantToken, forgotNewPassword)
      setSignInStep("forgot-done")
    } catch (error) {
      toast.error(toAppError(error, "Unable to reset password").message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auths/oauth/google`
  }

  const handleAppleLogin = () => {
    // TODO: implement Apple OAuth
  }

  return {
    form,
    isLoading,
    isSendingTwoFaOtp,
    signInStep,
    setSignInStep,
    twoFaCode,
    twoFaCountdown,
    errorMessage,
    rememberMe,
    setRememberMe,
    setTwoFaCode,
    handleIdentifierChange,
    handlePasswordChange,
    handleForgotPassword,
    handleBackFromTwoFa,
    handleResendTwoFaOtp,
    handleVerifyTwoFa,
    handleSubmit,
    handleGoogleLogin,
    handleAppleLogin,
    // Forgot password
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    forgotNewPassword,
    setForgotNewPassword,
    forgotConfirmPassword,
    setForgotConfirmPassword,
    forgotCountdown,
    isResendingForgotOtp,
    handleForgotSubmitEmail,
    handleForgotResendOtp,
    handleForgotVerifyOtp,
    handleForgotResetPassword,
    handleBackToSignIn,
  }
}
