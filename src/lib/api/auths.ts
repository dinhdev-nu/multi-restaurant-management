import { apiClient, unwrapResponseData } from "./client"
import type { ApiSuccessResponse } from "./types"

export interface CheckEmailResponse {
  available: boolean
  acction?: "resend_otp"
  hint?: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface LoginPayload {
  identifier: string
  password: string
  remember_me: boolean
}

export interface ForgotPasswordResponse {
  message: string
  session_token: string
}

export interface VerifyResetOtpResponse {
  verified: true
  reset_grant_token: string
}

export interface SessionInfo {
  session_id: string
  device_info: {
    browser: string
    os: string
    device: string
    user_agent: string
  }
  ip_address: string
  created_at: string
  expires_at: string
  is_current: boolean
}

export interface LoginSuccessResponse {
  access_token: string
}

export interface Login2faRequiredResponse {
  state: "2fa_required"
  temp_token: string
  method: "email" | "sms" | "app"
}

export type LoginResponse = LoginSuccessResponse | Login2faRequiredResponse

// ─── Sections 1-2: New user flow (/auths/) ────────────────────────────────

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await apiClient.post<ApiSuccessResponse<CheckEmailResponse>>("/auths/check-email", { email })
  return unwrapResponseData(response)
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ message: string }>>("/auths/register", payload)
}

export async function verifyEmailOtp(email: string, otp: string): Promise<{ verified: boolean }> {
  const response = await apiClient.post<ApiSuccessResponse<{ verified: boolean }>>("/auths/verify-otp", { email, otp })
  return unwrapResponseData(response)
}

export async function resendEmailOtp(email: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ message: string }>>("/auths/resend-otp", { email })
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auths/login", payload)
  return unwrapResponseData(response)
}

// ─── Sections 3-11: Session / security management (/auths/) ───────────────

export async function send2faOtp(tempToken: string): Promise<{ expires_in: number }> {
  const response = await apiClient.post<ApiSuccessResponse<{ message: string; expires_in: number }>>("/auths/2fa/send-otp", {
    temp_token: tempToken,
  })
  const data = unwrapResponseData(response)
  return { expires_in: data.expires_in }
}

export async function verify2faOtp(tempToken: string, otp: string): Promise<{ access_token: string }> {
  const response = await apiClient.post<ApiSuccessResponse<{ access_token: string }>>("/auths/2fa/verify-otp", {
    temp_token: tempToken,
    otp,
  })
  return unwrapResponseData(response)
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const response = await apiClient.post<ApiSuccessResponse<{ access_token: string }>>("/auths/refresh-token")
  return unwrapResponseData(response)
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ logged_out: boolean }>>("/auths/logout")
}

export async function logoutAll(): Promise<{ logged_out_count: number }> {
  const response = await apiClient.post<ApiSuccessResponse<{ logged_out_count: number }>>("/auths/logout-all")
  return unwrapResponseData(response)
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ApiSuccessResponse<ForgotPasswordResponse>>("/auths/forgot-password", { email })
  return unwrapResponseData(response)
}

export async function verifyResetPasswordOtp(sessionToken: string, otp: string): Promise<VerifyResetOtpResponse> {
  const response = await apiClient.post<ApiSuccessResponse<VerifyResetOtpResponse>>("/auths/reset-password/verify-otp", {
    session_token: sessionToken,
    otp,
  })
  return unwrapResponseData(response)
}

export async function resetPassword(resetGrantToken: string, newPassword: string): Promise<void> {
  // NOTE: API field là "grant_token"
  await apiClient.post<ApiSuccessResponse<{ reset: true }>>("/auths/reset-password", {
    grant_token: resetGrantToken,
    new_password: newPassword,
  })
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ changed: true }>>("/auths/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

export async function sendPhoneOtp(phone: string): Promise<{ expires_in: number }> {
  const response = await apiClient.post<ApiSuccessResponse<{ message: string; expires_in: number }>>("/auths/phone/send-otp", {
    phone,
  })
  return unwrapResponseData(response)
}

export async function verifyPhoneOtp(otp: string): Promise<{ verified: true }> {
  const response = await apiClient.post<ApiSuccessResponse<{ verified: true }>>("/auths/phone/verify-otp", { otp })
  return unwrapResponseData(response)
}

export async function enable2fa(password: string): Promise<{ enabled: true }> {
  const response = await apiClient.post<ApiSuccessResponse<{ enabled: true }>>("/auths/2fa/enable", { password })
  return unwrapResponseData(response)
}

export async function disable2fa(password: string): Promise<{ disabled: true }> {
  const response = await apiClient.post<ApiSuccessResponse<{ disabled: true }>>("/auths/2fa/disable", { password })
  return unwrapResponseData(response)
}

export async function getSessions(): Promise<SessionInfo[]> {
  const response = await apiClient.get<ApiSuccessResponse<{ sessions: SessionInfo[] }>>("/auths/sessions")
  return unwrapResponseData(response).sessions
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<{ revoked: boolean }>>("/auths/sessions", {
    data: { session_id: sessionId },
  })
}
