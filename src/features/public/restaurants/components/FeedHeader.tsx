import { Bell, Building2, LogOut, Search, UserCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import LocationSelector from "./LocationSelector"
import type { FeedLocationSelection, FeedUser } from "../types"

interface FeedHeaderProps {
    user: FeedUser | null
    onLocationChange?: (location: FeedLocationSelection) => void
    onLogout: () => Promise<void> | void
}

function getDisplayName(user: FeedUser | null): string {
    return user?.full_name ?? user?.user_name ?? "User"
}

function getAvatarUrl(user: FeedUser | null): string | null {
    return user?.avatar_url ?? user?.avatar ?? user?.profileImage ?? null
}

function getInitial(user: FeedUser | null): string {
    const candidate = user?.email?.[0] ?? user?.full_name?.[0] ?? user?.user_name?.[0] ?? "U"
    return candidate.toUpperCase()
}

export default function FeedHeader({ user, onLocationChange, onLogout }: FeedHeaderProps) {
    const navigate = useNavigate()

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex cursor-pointer items-center space-x-3"
                    >
                        <div className="rounded-xl bg-gray-900 px-3 py-1.5">
                            <span className="text-xl font-black tracking-tight text-white">
                                GI<span className="text-[#AFFF00]">GI</span>
                            </span>
                        </div>
                        <h1 className="hidden text-xl font-bold text-foreground sm:block">Feed</h1>
                    </button>

                    <div className="mx-8 hidden max-w-2xl flex-1 lg:flex">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                name="feed-search"
                                type="text"
                                placeholder="Tìm kiếm nhà hàng, món ăn..."
                                className="w-full rounded-full border border-border bg-secondary py-2.5 pl-12 pr-4 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            aria-label="Tìm kiếm"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        <LocationSelector onLocationChange={onLocationChange} />

                        <button
                            type="button"
                            aria-label="Thông báo"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
                        </button>

                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2 rounded-full px-3 py-1.5 transition-colors hover:bg-secondary"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-900">
                                            {getAvatarUrl(user) ? (
                                                <img
                                                    src={getAvatarUrl(user) ?? ""}
                                                    alt={getDisplayName(user)}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-white">{getInitial(user)}</span>
                                            )}
                                        </div>
                                        <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground md:block">
                                            {getDisplayName(user)}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 overflow-hidden rounded-2xl border border-border bg-popover p-0 shadow-lg"
                                >
                                    <div className="border-b border-border p-4">
                                        <p className="text-sm font-semibold text-foreground">{getDisplayName(user)}</p>
                                        <p className="truncate text-xs text-muted-foreground">{user.email ?? "No email"}</p>
                                    </div>

                                    <div className="py-2">
                                        <DropdownMenuLabel className="px-4 pb-1 pt-0 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                            Tài khoản
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                            className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-foreground"
                                            onSelect={() => navigate("/profile")}
                                        >
                                            <UserCircle className="mr-2 h-5 w-5" />
                                            <span>Hồ sơ</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-foreground"
                                            onSelect={() => navigate("/restaurants")}
                                        >
                                            <Building2 className="mr-2 h-5 w-5" />
                                            <span>Nhà hàng</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="mx-0 my-1 bg-border" />

                                        <DropdownMenuItem
                                            className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
                                            onSelect={() => {
                                                void onLogout()
                                            }}
                                        >
                                            <LogOut className="mr-2 h-5 w-5" />
                                            <span>Đăng xuất</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
