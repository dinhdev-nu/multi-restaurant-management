import type { PropsWithChildren } from "react"

export function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen">
                <main className="flex w-full items-center justify-center px-4 py-10 sm:px-8">{children}</main>
            </div>
        </div>
    )
}
