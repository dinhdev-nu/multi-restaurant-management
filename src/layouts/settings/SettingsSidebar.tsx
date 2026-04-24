import { ChevronRight, CirclePlus, Store, type LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

interface SidebarNavItem {
    id: string
    label: string
    icon: LucideIcon
    href: string
}

const MANAGEMENT_NAV_ITEMS: SidebarNavItem[] = [
    { id: "restaurants", label: "Restaurants", icon: Store, href: "/settings/manage/restaurants" },
    { id: "add-restaurant", label: "Add Restaurant", icon: CirclePlus, href: "/restaurants/new" },
]

interface SettingsSidebarProps {
    items: SidebarNavItem[]
}

function SettingsSidebarItem({ item }: { item: SidebarNavItem }) {
    const Icon = item.icon

    return (
        <NavLink
            key={item.id}
            to={item.href}
            className="group relative block rounded-xl touch-manipulation focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            {({ isActive }) => (
                <div
                    className={cn(
                        "flex min-w-0 items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                    )}
                >
                    <Icon
                        className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <ChevronRight
                        className={cn(
                            "ml-auto h-4 w-4 transition-opacity transition-transform",
                            isActive
                                ? "translate-x-0 text-primary/80"
                                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        )}
                    />
                </div>
            )}
        </NavLink>
    )
}

export function SettingsSidebar({ items }: SettingsSidebarProps) {
    return (
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <nav aria-label="Settings navigation" className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
                <div className="flex flex-col gap-4">
                    <p className="border-b border-border/80 px-3 pb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                        Account
                    </p>

                    <div className="flex flex-col gap-1">
                        {items.map((item) => (
                            <SettingsSidebarItem key={item.id} item={item} />
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="border-b border-border/80 px-3 pb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                            Management
                        </p>

                        <div className="flex flex-col gap-1">
                            {MANAGEMENT_NAV_ITEMS.map((item) => (
                                <SettingsSidebarItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}
