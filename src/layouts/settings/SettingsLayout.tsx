import { useEffect, useMemo, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { ACCOUNT_NAV_ITEMS, findActiveAccountNavItem } from "@/features/settings/account"

import { SettingsHeader } from "./SettingsHeader"
import { SettingsSidebar } from "./SettingsSidebar"

export function SettingsLayout() {
    const [isDark, setIsDark] = useState(false)
    const { pathname } = useLocation()

    const activeItem = useMemo(() => findActiveAccountNavItem(pathname), [pathname])

    useEffect(() => {
        const html = document.documentElement

        if (isDark) html.classList.add("dark")
        else html.classList.remove("dark")

        return () => html.classList.remove("dark")
    }, [isDark])

    return (
        <div className={`settings-page${isDark ? " dark" : ""} flex min-h-screen flex-col bg-background`}>
            <SettingsHeader isDark={isDark} onToggle={() => setIsDark((value) => !value)} />

            <div className="mx-auto flex-1 w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="order-first lg:order-none">
                        <SettingsSidebar items={ACCOUNT_NAV_ITEMS} />
                    </aside>

                    <main className="mx-auto w-full max-w-5xl lg:max-w-none">
                        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:px-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                    Settings / Account
                                </p>
                                <h1 className="text-xl font-semibold text-foreground">
                                    {activeItem?.label ?? "Settings"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage account profile, notifications, and security settings.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
