import type { SignInStep } from "./hooks/use-sign-in"

export type AuthRouteMode =
  | "register"
  | "verify-email"
  | "login"
  | "2fa"
  | "forgot-password"
  | "reset-password-verify"
  | "reset-password"

export const AUTH_ROUTE_PATHS: Record<AuthRouteMode, string> = {
  register: "/auth/register",
  "verify-email": "/auth/verify-email",
  login: "/auth/login",
  "2fa": "/auth/2fa",
  "forgot-password": "/auth/forgot-password",
  "reset-password-verify": "/auth/reset-password/verify",
  "reset-password": "/auth/reset-password",
}

export const SIGNIN_STEP_TO_PATH: Record<SignInStep, string> = {
  credentials: AUTH_ROUTE_PATHS.login,
  "2fa": AUTH_ROUTE_PATHS["2fa"],
  "forgot-email": AUTH_ROUTE_PATHS["forgot-password"],
  "forgot-otp": AUTH_ROUTE_PATHS["reset-password-verify"],
  "forgot-reset": AUTH_ROUTE_PATHS["reset-password"],
  "forgot-done": AUTH_ROUTE_PATHS["reset-password"],
}

export const SIGNUP_STEP_TO_PATH: Record<"info" | "password" | "otp", string> = {
  info: AUTH_ROUTE_PATHS.register,
  password: AUTH_ROUTE_PATHS.register,
  otp: AUTH_ROUTE_PATHS["verify-email"],
}

export function isSignUpMode(mode: AuthRouteMode): boolean {
  return mode === "register" || mode === "verify-email"
}
