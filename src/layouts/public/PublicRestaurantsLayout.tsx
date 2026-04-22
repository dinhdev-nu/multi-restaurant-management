import type { PropsWithChildren } from "react"
import { CircleUserRound, Heart, Home, Plus, Search, Store } from "lucide-react"

import type { FeedLocationSelection, FeedUser } from "@/features/public/restaurants"
import { FeedHeader } from "@/features/public/restaurants"

interface PublicRestaurantsLayoutProps extends PropsWithChildren {
    user: FeedUser | null
    onLocationChange?: (location: FeedLocationSelection) => void
    onLogout: () => Promise<void> | void
    showCreateFab: boolean
    onOpenAttentionModal: () => void
}

export function PublicRestaurantsLayout({
    user,
    onLocationChange,
    onLogout,
    showCreateFab,
    onOpenAttentionModal,
    children,
}: PublicRestaurantsLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <FeedHeader user={user} onLocationChange={onLocationChange} onLogout={onLogout} />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-sm lg:hidden">
                <div className="flex items-center justify-around px-4 py-3">
                    <button className="flex flex-col items-center space-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Home className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-foreground">Trang chủ</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Tìm kiếm</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Yêu thích</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                            <CircleUserRound className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Cá nhân</span>
                    </button>
                </div>
            </nav>

            <button
                onClick={onOpenAttentionModal}
                className={`group fixed bottom-20 right-4 z-40 transition-all duration-300 lg:hidden ${showCreateFab ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0"}`}
            >
                <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform group-hover:scale-110">
                        <Store className="h-6 w-6" />
                    </div>

                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 animate-pulse">
                        <Plus className="h-3 w-3 text-white" />
                    </div>

                    <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg">
                            Tạo nhà hàng
                            <div className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-t border-border bg-popover" />
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}
