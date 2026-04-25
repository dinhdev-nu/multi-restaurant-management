import type { PropsWithChildren, ReactNode } from "react"

interface DashboardLayoutProps extends PropsWithChildren {
    theme: "light" | "dark"
    sidebar: ReactNode
    header: ReactNode
    sidebarCollapsed: boolean
}

export function DashboardLayout({
    theme,
    sidebar,
    header,
    sidebarCollapsed,
    children,
}: DashboardLayoutProps) {
    return (
        <div className={`analysis-reporting ${theme} min-h-screen bg-background overflow-hidden`}>
            {sidebar}
            <div
                className={`dashboard-main-shell flex flex-col h-screen ${sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"}`}
            >
                {header}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
