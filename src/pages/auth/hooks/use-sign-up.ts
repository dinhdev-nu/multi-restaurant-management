import { useState, useEffect } from "react"
import { checkEmail, register, resendEmailOtp, verifyEmailOtp } from "@/lib/api/auths"
import { toAppError } from "@/lib/api/error"

type Step = "info" | "password" | "otp"

interface SignUpForm {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  otp: string
  password: string
  confirmPassword: string
}

interface OtpMethod {
  id: string
  label: string
  icon: string
  description?: string
}

export interface UseSignUpReturn {
  step: Step
  setStep: (step: Step) => void
  form: SignUpForm
  errorMessage: string | null
  handleChange: (field: keyof SignUpForm, value: string) => void
  handleIdentifierChange: (value: string) => void
  isLoading: boolean
  isSendingOtp: boolean
  otpCountdown: number
  showMethodModal: boolean
  setShowMethodModal: (show: boolean) => void
  getAvailableMethods: () => OtpMethod[]
  handleContinue: () => void
  handleMethodSelect: (methodId: string) => void
  handleResendOtp: () => void
  handleVerifyOtp: () => void
  handleCreateAccount: () => void
  reset: () => void
  onClose: () => void
}

const INITIAL_FORM: SignUpForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  otp: "",
  password: "",
  confirmPassword: "",
}

interface UseSignUpOptions {
  onSuccess?: () => void
}

export function useSignUp({ onSuccess: _onSuccess }: UseSignUpOptions): UseSignUpReturn {
  const [step, setStep] = useState<Step>("info")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [showMethodModal, setShowMethodModal] = useState(false)
  const [form, setForm] = useState<SignUpForm>(INITIAL_FORM)

  const reset = () => {
    setForm(INITIAL_FORM)
    setStep("info")
    setErrorMessage(null)
    setOtpCountdown(0)
    setIsSendingOtp(false)
    setShowMethodModal(false)
  }

  const onClose = () => {
    reset()
    // TODO: handle close (e.g. navigate away)
  }

  const handleChange = (field: keyof SignUpForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleIdentifierChange = (value: string) => {
    const isPhone = /^[+\d]/.test(value) && /^\+?\d[\d\s\-()]*$/.test(value)
    if (isPhone) {
      setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
    } else {
      setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
    }
  }

  // Reset OTP when identifier changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, otp: "" }))
    setOtpCountdown(0)
  }, [form.email, form.phoneNumber])

  // Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCountdown])

  const handleContinue = () => {
    const run = async () => {
      const identifier = (form.email || form.phoneNumber).trim()
      if (!identifier) {
        setErrorMessage("Please enter email or phone number")
        return
      }

      setErrorMessage(null)
      setIsLoading(true)
      try {
        if (form.email) {
          const result = await checkEmail(form.email)
          if (!result.available && result.acction === "resend_otp") {
            await resendEmailOtp(form.email)
            setOtpCountdown(60)
            setStep("otp")
            return
          }

          if (!result.available) {
            setErrorMessage("Email is already in use")
            return
          }

          setStep("password")
          return
        }

        setShowMethodModal(true)
      } catch (error) {
        const appError = toAppError(error, "Unable to continue sign-up")
        setErrorMessage(appError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }

  const getAvailableMethods = (): OtpMethod[] => {
    if (form.phoneNumber) return [
      { id: "sms", label: "SMS", icon: "💬", description: "Receive code via SMS" },
      { id: "telegram", label: "Telegram", icon: "✈️", description: "Receive code via Telegram" },
    ]
    return []
  }

  const handleMethodSelect = (_method: string) => {
    setShowMethodModal(false)
    // API đăng ký yêu cầu email — phone-only không được hỗ trợ
    setErrorMessage("Đăng ký yêu cầu địa chỉ email. Vui lòng nhập email của bạn.")
  }

  const handleResendOtp = () => {
    const run = async () => {
      if (otpCountdown > 0 || isSendingOtp || !form.email) return
      setErrorMessage(null)
      setIsSendingOtp(true)
      try {
        await resendEmailOtp(form.email)
        setOtpCountdown(60)
      } catch (error) {
        const appError = toAppError(error, "Unable to resend OTP")
        setErrorMessage(appError.message)
      } finally {
        setIsSendingOtp(false)
      }
    }

    void run()
  }

  const handleVerifyOtp = () => {
    const run = async () => {
      if (!form.email || (form.otp || "").trim().length < 6) return
      setErrorMessage(null)
      setIsLoading(true)
      try {
        await verifyEmailOtp(form.email, form.otp)
        reset()
      } catch (error) {
        const appError = toAppError(error, "OTP verification failed")
        setErrorMessage(appError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }

  const handleCreateAccount = () => {
    const run = async () => {
      const { password, confirmPassword, email, phoneNumber, firstName, lastName } = form
      if (!email) {
        setErrorMessage("Email is required for registration")
        return
      }
      if (!password || password !== confirmPassword) return

      setErrorMessage(null)
      setIsLoading(true)
      try {
        const fullName = `${firstName} ${lastName}`.trim()
        await register({
          email,
          password,
          full_name: fullName,
          phone: phoneNumber || undefined,
        })
        setOtpCountdown(60)
        setStep("otp")
      } catch (error) {
        const appError = toAppError(error, "Unable to create account")
        setErrorMessage(appError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }

  return {
    step, setStep,
    form, handleChange, handleIdentifierChange,
    errorMessage,
    isLoading, isSendingOtp,
    otpCountdown,
    showMethodModal, setShowMethodModal,
    getAvailableMethods,
    handleContinue,
    handleMethodSelect,
    handleResendOtp,
    handleVerifyOtp,
    handleCreateAccount,
    reset,
    onClose,
  }
}
