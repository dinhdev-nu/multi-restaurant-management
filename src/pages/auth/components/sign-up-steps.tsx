import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Mail, Eye, EyeOff, ArrowLeft, ChevronRight } from "lucide-react"
import { OtpMethodModal } from "./otp-method-modal"
import type { UseSignUpReturn } from "../hooks/use-sign-up"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "info" | "otp" | "password"

const STEP_ORDER: Step[] = ["info", "password", "otp"]

// ── Slide variants ────────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
}

// ── Step 1: Name + Identifier ─────────────────────────────────────────────────
interface StepInfoProps {
  form: UseSignUpReturn["form"]
  isLoading: boolean
  handleChange: UseSignUpReturn["handleChange"]
  handleIdentifierChange: UseSignUpReturn["handleIdentifierChange"]
  onContinue: () => void
}

function StepInfo({ form, isLoading, handleChange, handleIdentifierChange, onContinue }: StepInfoProps) {
  return (
    <div className="space-y-4 p-1">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your details to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-identifier">Email or phone</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="signup-identifier"
            type="text"
            value={form.email || form.phoneNumber}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            className="pl-10 pr-16"
            placeholder="Email or phone number"
            autoComplete="off"
          />
          {(form.email || form.phoneNumber) && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded pointer-events-none">
              {form.email ? "Email" : "Phone"}
            </span>
          )}
        </div>
      </div>

      <Button type="button" onClick={onContinue} disabled={isLoading} className="w-full mt-2 gap-1.5">
        {isLoading ? "Checking..." : (
          <>
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  )
}

// ── Step 2: OTP ───────────────────────────────────────────────────────────────
interface StepOtpProps {
  form: UseSignUpReturn["form"]
  isLoading: boolean
  isSendingOtp: boolean
  otpCountdown: number
  handleChange: UseSignUpReturn["handleChange"]
  onVerify: () => void
  onResend: () => void
  onBack: () => void
}

function StepOtp({ form, isLoading, isSendingOtp, otpCountdown, handleChange, onVerify, onResend, onBack }: StepOtpProps) {
  const identifier = form.email || form.phoneNumber

  return (
    <div className="space-y-5 p-1">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Check your {form.email ? "inbox" : "phone"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We sent a 6-digit code to{" "}
          <span className="text-gray-700 font-medium">{identifier}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={form.otp || ""}
          onChange={(value) => handleChange("otp", value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Didn't receive the code?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={otpCountdown > 0 || isSendingOtp}
          className={[
            "font-medium transition-colors",
            otpCountdown > 0 || isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-gray-600",
          ].join(" ")}
        >
          {isSendingOtp ? "Sending..." : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend"}
        </button>
      </div>

      <Button
        type="button"
        onClick={onVerify}
        disabled={isLoading || (form.otp || "").trim().length < 6}
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Verify code"}
      </Button>
    </div>
  )
}

// ── Step 3: Password ──────────────────────────────────────────────────────────
interface StepPasswordProps {
  form: UseSignUpReturn["form"]
  isLoading: boolean
  handleChange: UseSignUpReturn["handleChange"]
  onSubmit: () => void
  onBack: () => void
}

function StepPassword({ form, isLoading, handleChange, onSubmit, onBack }: StepPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const mismatch = form.confirmPassword && form.password !== form.confirmPassword

  return (
    <div className="space-y-4 p-1">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create a password</h2>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">Password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Password"
            className="pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Confirm password"
            className={["pr-10", mismatch ? "ring-2 ring-red-400" : ""].join(" ")}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {mismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !form.password || !!mismatch}
        className="w-full mt-2"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
interface SignUpStepsProps {
  hook: UseSignUpReturn
}

export function SignUpSteps({ hook }: SignUpStepsProps) {
  const {
    step, setStep,
    form, errorMessage, handleChange, handleIdentifierChange,
    isLoading, isSendingOtp, otpCountdown,
    showMethodModal, setShowMethodModal,
    getAvailableMethods,
    handleContinue, handleMethodSelect, handleResendOtp, handleVerifyOtp, handleCreateAccount,
  } = hook

  const [direction, setDirection] = useState(1)

  const navigate = (newStep: Step) => {
    setDirection(STEP_ORDER.indexOf(newStep) > STEP_ORDER.indexOf(step) ? 1 : -1)
    setStep(newStep)
  }

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        >
          {step === "info" && (
            <StepInfo
              form={form}
              isLoading={isLoading}
              handleChange={handleChange}
              handleIdentifierChange={handleIdentifierChange}
              onContinue={handleContinue}
            />
          )}
          {step === "password" && (
            <StepPassword
              form={form}
              isLoading={isLoading}
              handleChange={handleChange}
              onSubmit={handleCreateAccount}
              onBack={() => navigate("info")}
            />
          )}
          {step === "otp" && (
            <StepOtp
              form={form}
              isLoading={isLoading}
              isSendingOtp={isSendingOtp}
              otpCountdown={otpCountdown}
              handleChange={handleChange}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBack={() => navigate("password")}
            />
          )}

          {errorMessage && (
            <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {showMethodModal && (
        <OtpMethodModal
          methods={getAvailableMethods()}
          isSendingOtp={isSendingOtp}
          onSelect={handleMethodSelect}
          onClose={() => setShowMethodModal(false)}
        />
      )}
    </div>
  )
}
