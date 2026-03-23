import { useState } from "react"
import { Mail, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import type { UseSignInReturn } from "../hooks/use-sign-in"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface SignInFormProps {
  hook: UseSignInReturn
}

export function SignInForm({ hook }: SignInFormProps) {
  const {
    form,
    isLoading,
    isSendingTwoFaOtp,
    signInStep,
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
    // forgot password
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
  } = hook

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ─── 2FA ──────────────────────────────────────────────────────────────────

  if (signInStep === "2fa") {
    return (
      <div className="space-y-5 p-1">
        <button
          type="button"
          onClick={handleBackFromTwoFa}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Two-factor authentication</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code we sent to your device</p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={twoFaCode} onChange={setTwoFaCode}>
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
          <span className="text-gray-500">Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResendTwoFaOtp}
            disabled={twoFaCountdown > 0 || isSendingTwoFaOtp}
            className={[
              "font-medium transition-colors",
              twoFaCountdown > 0 || isSendingTwoFaOtp ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-gray-600",
            ].join(" ")}
          >
            {isSendingTwoFaOtp ? "Sending..." : twoFaCountdown > 0 ? `Resend in ${twoFaCountdown}s` : "Resend"}
          </button>
        </div>

        <Button
          type="button"
          onClick={handleVerifyTwoFa}
          disabled={isLoading || twoFaCode.trim().length < 6}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify and sign in"}
        </Button>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    )
  }

  // ─── Forgot — Step 1: Enter email ─────────────────────────────────────────

  if (signInStep === "forgot-email") {
    return (
      <div className="space-y-5 p-1">
        <button
          type="button"
          onClick={handleBackToSignIn}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reset password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset OTP</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgotSubmitEmail()}
              className="pl-10"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button
          type="button"
          onClick={handleForgotSubmitEmail}
          disabled={isLoading || !forgotEmail.trim()}
          className="w-full"
        >
          {isLoading ? "Sending..." : "Send reset code"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 2: Enter OTP ───────────────────────────────────────────

  if (signInStep === "forgot-otp") {
    return (
      <div className="space-y-5 p-1">
        <button
          type="button"
          onClick={() => handleBackToSignIn()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Enter OTP</h2>
          <p className="text-sm text-gray-500 mt-1">
            We sent a 6-digit code to <span className="font-medium text-gray-700">{forgotEmail}</span>
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={forgotOtp} onChange={setForgotOtp}>
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
          <span className="text-gray-500">Didn&apos;t receive it?</span>
          <button
            type="button"
            onClick={handleForgotResendOtp}
            disabled={forgotCountdown > 0 || isResendingForgotOtp}
            className={[
              "font-medium transition-colors",
              forgotCountdown > 0 || isResendingForgotOtp ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-gray-600",
            ].join(" ")}
          >
            {isResendingForgotOtp ? "Sending..." : forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : "Resend"}
          </button>
        </div>

        <Button
          type="button"
          onClick={handleForgotVerifyOtp}
          disabled={isLoading || forgotOtp.trim().length < 6}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify code"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 3: New password ────────────────────────────────────────

  if (signInStep === "forgot-reset") {
    return (
      <div className="space-y-5 p-1">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">New password</h2>
          <p className="text-sm text-gray-500 mt-1">Your identity is verified. Set a new password.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={forgotNewPassword}
              onChange={(e) => setForgotNewPassword(e.target.value)}
              className="pr-10"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={forgotConfirmPassword}
              onChange={(e) => setForgotConfirmPassword(e.target.value)}
              className="pr-10"
              placeholder="Re-enter password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button
          type="button"
          onClick={handleForgotResetPassword}
          disabled={isLoading || !forgotNewPassword || !forgotConfirmPassword}
          className="w-full"
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 4: Done ────────────────────────────────────────────────

  if (signInStep === "forgot-done") {
    return (
      <div className="space-y-5 p-1 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Password reset!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your password has been reset successfully. Sign in with your new password.
          </p>
        </div>
        <Button type="button" onClick={handleBackToSignIn} className="w-full">
          Back to sign in
        </Button>
      </div>
    )
  }

  // ─── Credentials (default) ────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1" autoComplete="off">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {/* Identifier */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-identifier">Email or phone</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="signin-identifier"
            type="text"
            value={form.email || form.phoneNumber}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            className="pl-10 pr-16"
            placeholder="Email or phone number"
            autoComplete="username"
          />
          {(form.email || form.phoneNumber) && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded pointer-events-none">
              {form.email ? "Email" : "Phone"}
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="pr-10"
            placeholder="Password"
            autoComplete="current-password"
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

      {/* Remember me + forgot */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label htmlFor="remember-me" className="cursor-pointer font-normal text-gray-600">
            Remember me
          </Label>
        </div>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </form>
  )
}
