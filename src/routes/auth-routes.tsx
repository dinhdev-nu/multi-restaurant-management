import { Navigate, Route } from "react-router-dom"

import { AUTH_ROUTE_PATHS } from "@/features/auth/constants"
import AuthPage from "@/pages/auth/AuthPage"

export function AuthRoutes() {
    return (
        <>
            <Route path="/auth" element={<Navigate to={AUTH_ROUTE_PATHS.login} replace />} />
            <Route path={AUTH_ROUTE_PATHS.register} element={<AuthPage mode="register" />} />
            <Route path={AUTH_ROUTE_PATHS["verify-email"]} element={<AuthPage mode="verify-email" />} />
            <Route path={AUTH_ROUTE_PATHS.login} element={<AuthPage mode="login" />} />
            <Route path={AUTH_ROUTE_PATHS["2fa"]} element={<AuthPage mode="2fa" />} />
            <Route path={AUTH_ROUTE_PATHS["forgot-password"]} element={<AuthPage mode="forgot-password" />} />
            <Route path={AUTH_ROUTE_PATHS["reset-password-verify"]} element={<AuthPage mode="reset-password-verify" />} />
            <Route path={AUTH_ROUTE_PATHS["reset-password"]} element={<AuthPage mode="reset-password" />} />
        </>
    )
}
