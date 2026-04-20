import { useState } from "react"
import { Mail, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import type { UseSignInReturn } from "../hooks/use-sign-in"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

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
    const resendDisabled = twoFaCountdown > 0 || isSendingTwoFaOtp

    return (
      <div className="space-y-5 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBackFromTwoFa}
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft />
          Back
        </Button>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Two-factor authentication</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code we sent to your device</p>
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
          <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendTwoFaOtp}
            disabled={resendDisabled}
            className={cn(
              "h-auto px-2 text-sm font-medium",
              resendDisabled ? "text-muted-foreground" : "text-foreground hover:text-foreground/80"
            )}
          >
            {isSendingTwoFaOtp ? "Sending…" : twoFaCountdown > 0 ? `Resend in ${twoFaCountdown}s` : "Resend"}
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleVerifyTwoFa}
          disabled={isLoading || twoFaCode.trim().length < 6}
          className="w-full"
        >
          {isLoading ? "Verifying…" : "Verify and sign in"}
        </Button>

        {errorMessage && (
          <p className="text-sm text-destructive" role="status" aria-live="polite">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  // ─── Forgot — Step 1: Enter email ─────────────────────────────────────────

  if (signInStep === "forgot-email") {
    return (
      <div className="space-y-5 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBackToSignIn}
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft />
          Back to sign in
        </Button>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Reset password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email to receive a reset OTP</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              name="email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgotSubmitEmail()}
              className="pl-10"
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive" role="status" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <Button
          type="button"
          onClick={handleForgotSubmitEmail}
          disabled={isLoading || !forgotEmail.trim()}
          className="w-full"
        >
          {isLoading ? "Sending…" : "Send reset code"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 2: Enter OTP ───────────────────────────────────────────

  if (signInStep === "forgot-otp") {
    const resendDisabled = forgotCountdown > 0 || isResendingForgotOtp

    return (
      <div className="space-y-5 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleBackToSignIn()}
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft />
          Back
        </Button>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Enter OTP</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{forgotEmail}</span>
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
          <span className="text-muted-foreground">Didn&apos;t receive it?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleForgotResendOtp}
            disabled={resendDisabled}
            className={cn(
              "h-auto px-2 text-sm font-medium",
              resendDisabled ? "text-muted-foreground" : "text-foreground hover:text-foreground/80"
            )}
          >
            {isResendingForgotOtp ? "Sending…" : forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : "Resend"}
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleForgotVerifyOtp}
          disabled={isLoading || forgotOtp.trim().length < 6}
          className="w-full"
        >
          {isLoading ? "Verifying…" : "Verify code"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 3: New password ────────────────────────────────────────

  if (signInStep === "forgot-reset") {
    return (
      <div className="space-y-5 p-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">New password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your identity is verified. Set a new password.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={forgotNewPassword}
              onChange={(e) => setForgotNewPassword(e.target.value)}
              className="pr-10"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
            >
              {showNewPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={forgotConfirmPassword}
              onChange={(e) => setForgotConfirmPassword(e.target.value)}
              className="pr-10"
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive" role="status" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <Button
          type="button"
          onClick={handleForgotResetPassword}
          disabled={isLoading || !forgotNewPassword || !forgotConfirmPassword}
          className="w-full"
        >
          {isLoading ? "Resetting…" : "Reset password"}
        </Button>
      </div>
    )
  }

  // ─── Forgot — Step 4: Done ────────────────────────────────────────────────

  if (signInStep === "forgot-done") {
    return (
      <div className="space-y-5 p-1 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-success" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Password reset!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      {/* Identifier */}
      <div className="space-y-1.5">
        <Label htmlFor="signin-identifier">Email or phone</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-identifier"
            name="identifier"
            type="text"
            value={form.email || form.phoneNumber}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            className="pl-10 pr-16"
            placeholder="Email or phone number"
            autoComplete="username"
            spellCheck={false}
          />
          {(form.email || form.phoneNumber) && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
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
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="pr-10"
            placeholder="Password"
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
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
          <Label htmlFor="remember-me" className="cursor-pointer font-normal text-muted-foreground">
            Remember me
          </Label>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleForgotPassword}
          className="h-auto px-2 text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </Button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>

      {errorMessage && (
        <p className="text-sm text-destructive" role="status" aria-live="polite">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
