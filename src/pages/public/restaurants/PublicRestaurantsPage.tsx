import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    BadgeCheck,
    Flame,
    MapPin,
    Search,
    Star,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import AppImage from "@/components/AppImage"
import {
    AttentionModal,
    CreateRestaurantBanner,
    FilterTabs,
    MOCK_NEARBY_RESTAURANTS,
    MOCK_POSTS,
    PostCard,
} from "@/features/public/restaurants"
import type { FeedFilter, FeedLocationSelection, FeedPost } from "@/features/public/restaurants"
import { PublicRestaurantsLayout } from "@/layouts/public/PublicRestaurantsLayout"
import { logout as logoutApi } from "@/lib/api/auths"
import { useAuthStore } from "@/stores/auth-store"
import { useUserStore } from "@/stores/user-store"

const INITIAL_DISPLAY_COUNT = 3
const LOAD_MORE_STEP = 3
const LOAD_MORE_DELAY_MS = 300
const ATTENTION_MODAL_DELAY_MS = 3000
const ATTENTION_MODAL_STORAGE_KEY = "hasSeenAttentionModal"
const FAB_SCROLL_THRESHOLD = 200

const TRENDING_TOPICS = [
    { tag: "#BuffetNướng", posts: "2.4K bài viết" },
    { tag: "#KhuyếnMãi30", posts: "1.8K bài viết" },
    { tag: "#CàPhêĐàLạt", posts: "1.2K bài viết" },
    { tag: "#LẩuThái", posts: "956 bài viết" },
    { tag: "#PhởHàNội", posts: "784 bài viết" },
]

export default function PublicRestaurantsPage() {
    const navigate = useNavigate()
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const clearUser = useUserStore((state) => state.clear)
    const profile = useUserStore((state) => state.profile)

    const [activeFilter, setActiveFilter] = useState<FeedFilter>("all")
    const [posts, setPosts] = useState<FeedPost[]>(() => MOCK_POSTS)
    const [selectedLocation, setSelectedLocation] = useState<FeedLocationSelection | null>(null)
    const [displayCount, setDisplayCount] = useState<number>(INITIAL_DISPLAY_COUNT)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [showFAB, setShowFAB] = useState(false)
    const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false)

    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const loadMoreTimeoutRef = useRef<number | null>(null)

    const handleLocationChange = useCallback((location: FeedLocationSelection) => {
        setSelectedLocation(location)
    }, [])

    useEffect(() => {
        const attentionTimer = window.setTimeout(() => {
            const hasSeenAttention = localStorage.getItem(ATTENTION_MODAL_STORAGE_KEY)
            if (!hasSeenAttention) {
                setIsAttentionModalOpen(true)
                localStorage.setItem(ATTENTION_MODAL_STORAGE_KEY, "true")
            }
        }, ATTENTION_MODAL_DELAY_MS)

        return () => {
            window.clearTimeout(attentionTimer)
        }
    }, [])

    useEffect(() => {
        setDisplayCount(INITIAL_DISPLAY_COUNT)
    }, [activeFilter, selectedLocation])

    useEffect(() => {
        const handleScroll = () => {
            const shouldShow = window.scrollY > FAB_SCROLL_THRESHOLD
            setShowFAB((prev) => (prev === shouldShow ? prev : shouldShow))
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    const handleLike = useCallback((postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id !== postId) return post

                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1,
                }
            })
        )
    }, [])

    const handleBookmark = useCallback((postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id !== postId) return post
                return {
                    ...post,
                    bookmarked: !post.bookmarked,
                }
            })
        )
    }, [])

    const handleLogout = useCallback(async () => {
        try {
            await logoutApi()
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            clearAuth()
            clearUser()
            navigate("/auth", { replace: true })
        }
    }, [clearAuth, clearUser, navigate])

    const filteredByLocationPosts = useMemo(() => {
        if (!selectedLocation) return posts

        const { province, district } = selectedLocation

        return posts.filter((post) => {
            if (post.restaurant.provinceCode !== province.code) return false
            if (!district) return true
            return post.restaurant.districtCode === district.code
        })
    }, [posts, selectedLocation])

    const filteredPosts = useMemo(() => {
        if (activeFilter === "all") return filteredByLocationPosts
        return filteredByLocationPosts.filter((post) => post.type === activeFilter)
    }, [activeFilter, filteredByLocationPosts])

    const displayedPosts = useMemo(() => {
        return filteredPosts.slice(0, displayCount)
    }, [displayCount, filteredPosts])

    const nearbyRestaurants = useMemo(() => {
        if (!selectedLocation) return MOCK_NEARBY_RESTAURANTS

        const { province, district } = selectedLocation

        return MOCK_NEARBY_RESTAURANTS.filter((restaurant) => {
            if (restaurant.provinceCode !== province.code) return false
            if (!district) return true
            return restaurant.districtCode === district.code
        })
    }, [selectedLocation])

    const remainingPostsCount = filteredPosts.length - displayedPosts.length
    const hasMorePosts = remainingPostsCount > 0

    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || !hasMorePosts) return

        setIsLoadingMore(true)

        if (loadMoreTimeoutRef.current !== null) {
            window.clearTimeout(loadMoreTimeoutRef.current)
        }

        loadMoreTimeoutRef.current = window.setTimeout(() => {
            setDisplayCount((prevCount) => Math.min(prevCount + LOAD_MORE_STEP, filteredPosts.length))
            setIsLoadingMore(false)
            loadMoreTimeoutRef.current = null
        }, LOAD_MORE_DELAY_MS)
    }, [filteredPosts.length, hasMorePosts, isLoadingMore])

    useEffect(() => {
        return () => {
            if (loadMoreTimeoutRef.current !== null) {
                window.clearTimeout(loadMoreTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const target = loadMoreRef.current
        if (!target || !hasMorePosts || isLoadingMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    handleLoadMore()
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        )

        observer.observe(target)

        return () => {
            observer.disconnect()
        }
    }, [handleLoadMore, hasMorePosts, isLoadingMore])

    return (
        <>
            <PublicRestaurantsLayout
                user={profile}
                onLocationChange={handleLocationChange}
                onLogout={handleLogout}
                showCreateFab={showFAB}
                onOpenAttentionModal={() => setIsAttentionModalOpen(true)}
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <aside className="hidden lg:col-span-3 lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center space-x-2 font-semibold text-foreground">
                                        <MapPin className="h-5 w-5 text-red-500" />
                                        <span>Gần bạn</span>
                                    </h3>
                                    <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                                        Xem tất cả
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {nearbyRestaurants.map((restaurant) => (
                                        <div
                                            key={restaurant.id}
                                            className="flex cursor-pointer items-center space-x-3 rounded-xl p-2 transition-colors hover:bg-secondary"
                                        >
                                            <div className="relative shrink-0">
                                                <AppImage
                                                    src={restaurant.image}
                                                    alt={restaurant.name}
                                                    className="h-12 w-12 rounded-xl object-cover"
                                                    loading="lazy"
                                                />
                                                {restaurant.verified && (
                                                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                                                        <BadgeCheck className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{restaurant.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center">
                                                        <Star className="mr-0.5 h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                        {restaurant.rating}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{restaurant.distance}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-5">
                                <h3 className="mb-3 font-semibold text-foreground">Nhà hàng của bạn</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Quản lý và phát triển nhà hàng của bạn với công cụ chuyên nghiệp!
                                </p>
                                <button
                                    onClick={() => navigate("/restaurants")}
                                    className="w-full rounded-2xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                                >
                                    Khám phá ngay
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="lg:col-span-6">
                        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                        <div className="space-y-6">
                            {displayedPosts.map((post) => (
                                <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
                            ))}
                        </div>

                        {displayedPosts.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                                    <Search className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Không có bài viết</h3>
                                <p className="text-muted-foreground">Chưa có bài viết nào trong danh mục này</p>
                            </div>
                        )}

                        {hasMorePosts && (
                            <div ref={loadMoreRef} className="py-8 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="rounded-2xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <span className="flex items-center space-x-2">
                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            <span>Đang tải...</span>
                                        </span>
                                    ) : (
                                        `Xem thêm bài viết (${remainingPostsCount} còn lại)`
                                    )}
                                </button>
                            </div>
                        )}

                        {displayedPosts.length > 0 && !hasMorePosts && (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">🎉 Bạn đã xem hết tất cả bài viết</p>
                            </div>
                        )}
                    </main>

                    <aside className="hidden lg:col-span-3 lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-5">
                                <h3 className="mb-4 flex items-center space-x-2 font-semibold text-foreground">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span>Đang hot</span>
                                </h3>
                                <div className="space-y-1">
                                    {TRENDING_TOPICS.map((item) => (
                                        <button
                                            key={item.tag}
                                            className="w-full rounded-xl p-2 text-left transition-colors hover:bg-secondary"
                                        >
                                            <p className="text-sm font-semibold text-foreground">{item.tag}</p>
                                            <p className="text-xs text-muted-foreground">{item.posts}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <CreateRestaurantBanner onOpenCreatePage={() => navigate("/restaurants/new")} />
                        </div>
                    </aside>
                </div>
            </PublicRestaurantsLayout>

            <AttentionModal
                isOpen={isAttentionModalOpen}
                onClose={() => setIsAttentionModalOpen(false)}
                onOpenCreatePage={() => navigate("/restaurants/new")}
            />
        </>
    )
}
