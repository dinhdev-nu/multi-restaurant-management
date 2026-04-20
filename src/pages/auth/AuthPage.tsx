import { AuthCard } from "@/features/auth/components/AuthCard"
import type { AuthRouteMode } from "@/features/auth/constants"
import { AuthLayout } from "@/layouts/auth/AuthLayout"

interface AuthPageProps {
    mode?: AuthRouteMode
}

export default function AuthPage({ mode = "login" }: AuthPageProps) {
    return (
        <AuthLayout>
            <AuthCard mode={mode} />
        </AuthLayout>
    )
}
