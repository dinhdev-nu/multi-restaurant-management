import { useState } from "react"
import { Bell, CirclePlus, LogOut, Moon, Search, Settings2, Store, Sun, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AUTH_ROUTE_PATHS } from "@/features/auth/constants"
import { ACCOUNT_SECTION_PATHS } from "@/features/settings/account"
import { logout } from "@/services/auths"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { useUserStore } from "@/stores/user-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(fullName: string | undefined | null): string {
    if (!fullName?.trim()) return "?"

    const parts = fullName.trim().split(/\s+/)

    return parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
}

interface SettingsHeaderProps {
    isDark: boolean
    onToggle: () => void
}

export function SettingsHeader({ isDark, onToggle }: SettingsHeaderProps) {
    const [searchFocused, setSearchFocused] = useState(false)
    const navigate = useNavigate()
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const clearUser = useUserStore((state) => state.clear)
    const profile = useUserStore((state) => state.profile)
    const initials = getInitials(profile?.full_name)

    const handleLogout = async () => {
        try {
            await logout()
        } catch {
            // Continue local logout even when API call fails.
        }

        clearAuth()
        clearUser()
        navigate(AUTH_ROUTE_PATHS.login, { replace: true })
    }

    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-6">
                <a href="/" className="flex items-center">
                    <span className="text-2xl font-black tracking-tighter leading-none">
                        <span className="text-foreground">Gi</span>
                        <span className="text-accent">Gi</span>
                    </span>
                </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div
                    className={cn(
                        "relative hidden sm:flex items-center transition-all duration-300",
                        searchFocused ? "w-64" : "w-48"
                    )}
                >
                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                        name="search"
                        type="text"
                        placeholder="Search…"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary ring-1 ring-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all duration-200"
                    />
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                    type="button"
                    className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                    aria-label="Open notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="size-9 rounded-full overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-border transition-all duration-200"
                            aria-label="Open account menu"
                        >
                            <Avatar className="size-full">
                                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "User"} />
                                <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60 rounded-xl border-border bg-popover/95 p-1.5 shadow-lg backdrop-blur-sm">
                        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                            <span className="text-foreground">{profile?.full_name ?? "Tài khoản"}</span>
                            <span className="text-xs font-normal text-muted-foreground">{profile?.email ?? "Chưa có email"}</span>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Quản lý
                        </DropdownMenuLabel>

                        <DropdownMenuGroup>
                            <DropdownMenuItem className="rounded-lg px-2.5 py-2 font-medium" onSelect={() => navigate("/restaurants")}>
                                <Store />
                                Nhà hàng của bạn
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg px-2.5 py-2 font-medium" onSelect={() => navigate("/restaurants/new")}>
                                <CirclePlus />
                                Đăng ký đối tác
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Tài khoản
                        </DropdownMenuLabel>

                        <DropdownMenuGroup>
                            <DropdownMenuItem className="rounded-lg px-2.5 py-2 font-medium" onSelect={() => navigate(ACCOUNT_SECTION_PATHS.profile)}>
                                <UserRound />
                                Hồ sơ
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg px-2.5 py-2 font-medium" onSelect={() => navigate(ACCOUNT_SECTION_PATHS.security)}>
                                <Settings2 />
                                Cài đặt
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="rounded-lg px-2.5 py-2 font-medium" variant="destructive" onSelect={() => void handleLogout()}>
                            <LogOut />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
