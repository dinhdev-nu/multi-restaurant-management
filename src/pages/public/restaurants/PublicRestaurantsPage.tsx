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
    PostCard,
} from "@/features/public/restaurants"
import type { FeedFilter, FeedLocationSelection, FeedPost } from "@/features/public/restaurants"
import { MOCK_PROVINCES } from "@/features/new/constants"
import { PublicRestaurantsLayout } from "@/layouts/public/PublicRestaurantsLayout"
import { logout as logoutApi } from "@/services/auths"
import { searchPublicRestaurants } from "@/services/restaurants"
import { toAppError } from "@/services/error"
import type { PublicRestaurantSearchItem } from "@/types/restaurant-type"
import { useAuthStore } from "@/stores/auth-store"
import { useUserStore } from "@/stores/user-store"

const PUBLIC_RESTAURANT_PAGE = 1
const PUBLIC_RESTAURANT_LIMIT = 5
const INITIAL_DISPLAY_COUNT = PUBLIC_RESTAURANT_LIMIT
const LOAD_MORE_STEP = PUBLIC_RESTAURANT_LIMIT
const LOAD_MORE_DELAY_MS = 300
const ATTENTION_MODAL_DELAY_MS = 3000
const ATTENTION_MODAL_STORAGE_KEY = "hasSeenAttentionModal"
const FAB_SCROLL_THRESHOLD = 200
const DEFAULT_PROVINCE = MOCK_PROVINCES[0] ?? { code: 1, name: "Hà Nội" }

const FEED_TYPES: Exclude<FeedFilter, "all">[] = ["promotion", "new_menu", "feedback", "event", "experience"]
const FEED_TIMESTAMPS = ["1 giờ trước", "3 giờ trước", "5 giờ trước", "8 giờ trước", "12 giờ trước"]
const FALLBACK_RESTAURANT_IMAGE = "/assets/home/image.png"

const TRENDING_TOPICS = [
    { tag: "#BuffetNướng", posts: "2.4K bài viết" },
    { tag: "#KhuyếnMãi30", posts: "1.8K bài viết" },
    { tag: "#CàPhêĐàLạt", posts: "1.2K bài viết" },
    { tag: "#LẩuThái", posts: "956 bài viết" },
    { tag: "#PhởHàNội", posts: "784 bài viết" },
]

function formatDistance(distanceKm?: number | null) {
    if (distanceKm === null || distanceKm === undefined) return "Đang cập nhật"
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`
    return `${distanceKm.toFixed(1)} km`
}

function buildFeedContent(restaurant: PublicRestaurantSearchItem, type: Exclude<FeedFilter, "all">) {
    const cuisine = restaurant.cuisine_type ?? "món đặc trưng"
    const location = [restaurant.district, restaurant.city].filter(Boolean).join(", ") || restaurant.city

    switch (type) {
        case "promotion":
            return `Khám phá ưu đãi nổi bật tại ${restaurant.name} với ${cuisine}. Đặt bàn sớm để giữ chỗ đẹp và nhận ưu đãi tốt hơn.`
        case "new_menu":
            return `${restaurant.name} vừa cập nhật thực đơn mới với các món ${cuisine}. Thử ngay lựa chọn phù hợp cho bữa trưa hoặc buổi tối.`
        case "feedback":
            return `Khách hàng tại ${location} đang đánh giá cao ${restaurant.name} vì chất lượng món ăn và không gian phục vụ ổn định.`
        case "event":
            return `Sự kiện ẩm thực tại ${restaurant.name} đang thu hút nhiều lượt quan tâm. Đây là điểm dừng chân đáng thử cho cuối tuần.`
        case "experience":
            return `Một địa điểm đáng lưu lại ở ${location}: ${restaurant.name} phù hợp cho trải nghiệm ăn uống nhanh, gọn và dễ đặt online.`
    }
}

function mapRestaurantToPost(
    restaurant: PublicRestaurantSearchItem,
    index: number,
    provinceCode: number,
    districtCode: number | null
): FeedPost {
    const type = FEED_TYPES[index % FEED_TYPES.length]
    const image = restaurant.cover_image_url ?? restaurant.logo_url ?? FALLBACK_RESTAURANT_IMAGE
    const tags = [
        restaurant.cuisine_type,
        restaurant.accepts_online_orders ? "dat-online" : "tai-quan",
        restaurant.price_range ? `hang-${restaurant.price_range}` : null,
    ].filter((tag): tag is string => Boolean(tag))

    return {
        id: restaurant._id,
        type,
        restaurant: {
            name: restaurant.name,
            avatar: image,
            verified: Boolean(restaurant.logo_url || restaurant.cover_image_url),
            location: [restaurant.district, restaurant.city].filter(Boolean).join(", ") || restaurant.city,
            provinceCode,
            districtCode: districtCode ?? undefined,
        },
        timestamp: FEED_TIMESTAMPS[index % FEED_TIMESTAMPS.length],
        content: buildFeedContent(restaurant, type),
        tags,
        images: restaurant.cover_image_url ? [restaurant.cover_image_url] : restaurant.logo_url ? [restaurant.logo_url] : undefined,
        liked: false,
        bookmarked: false,
        likes: 400 + index * 87,
        comments: 24 + index * 5,
        shares: 9 + index * 3,
    }
}

function mapRestaurantToNearby(
    restaurant: PublicRestaurantSearchItem,
    index: number,
    provinceCode: number,
    districtCode: number | null
) {
    return {
        id: restaurant._id,
        name: restaurant.name,
        image: restaurant.logo_url ?? restaurant.cover_image_url ?? FALLBACK_RESTAURANT_IMAGE,
        rating: Number((4.4 + ((index + 1) % 5) * 0.1).toFixed(1)),
        distance: formatDistance(restaurant.distance_km),
        verified: Boolean(restaurant.logo_url || restaurant.cover_image_url),
        provinceCode,
        districtCode: districtCode ?? undefined,
    }
}

export default function PublicRestaurantsPage() {
    const navigate = useNavigate()
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const clearUser = useUserStore((state) => state.clear)
    const profile = useUserStore((state) => state.profile)

    const [activeFilter, setActiveFilter] = useState<FeedFilter>("all")
    const [selectedLocation, setSelectedLocation] = useState<FeedLocationSelection | null>(null)
    const [restaurants, setRestaurants] = useState<PublicRestaurantSearchItem[]>([])
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [displayCount, setDisplayCount] = useState<number>(INITIAL_DISPLAY_COUNT)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [showFAB, setShowFAB] = useState(false)
    const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false)
    const [isRestaurantsLoading, setIsRestaurantsLoading] = useState(true)
    const [restaurantsError, setRestaurantsError] = useState<string | null>(null)
    const [restaurantsErrorMeta, setRestaurantsErrorMeta] = useState<{ code?: string; status?: number } | null>(null)

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
        let isActive = true

        const loadRestaurants = async () => {
            try {
                setIsRestaurantsLoading(true)
                setRestaurantsError(null)
                setRestaurantsErrorMeta(null)

                const response = await searchPublicRestaurants({
                    page: PUBLIC_RESTAURANT_PAGE,
                    limit: PUBLIC_RESTAURANT_LIMIT,
                })

                if (!isActive) return

                const provinceCode = DEFAULT_PROVINCE.code
                const districtCode = null

                setRestaurants(response.data)
                setPosts(
                    response.data.map((restaurant, index) =>
                        mapRestaurantToPost(restaurant, index, provinceCode, districtCode)
                    )
                )
            } catch (caughtError) {
                if (!isActive) return

                const appError = toAppError(caughtError, "Không thể tải nhà hàng công khai.")
                setRestaurants([])
                setPosts([])
                setRestaurantsError(appError.message)
                setRestaurantsErrorMeta({ code: appError.errorCode, status: appError.status })
            } finally {
                if (isActive) {
                    setIsRestaurantsLoading(false)
                }
            }
        }

        loadRestaurants()

        return () => {
            isActive = false
        }
    }, [])

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
        return posts
    }, [posts])

    const filteredPosts = useMemo(() => {
        if (activeFilter === "all") return filteredByLocationPosts
        return filteredByLocationPosts.filter((post) => post.type === activeFilter)
    }, [activeFilter, filteredByLocationPosts])

    const displayedPosts = useMemo(() => {
        return filteredPosts.slice(0, displayCount)
    }, [displayCount, filteredPosts])

    const nearbyRestaurants = useMemo(() => {
        if (!restaurants.length) return []

        const provinceCode = selectedLocation?.province.code ?? DEFAULT_PROVINCE.code
        const districtCode = selectedLocation?.district?.code ?? null

        return restaurants.slice(0, 4).map((restaurant, index) =>
            mapRestaurantToNearby(restaurant, index, provinceCode, districtCode)
        )
    }, [restaurants, selectedLocation])

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
                                    {isRestaurantsLoading && nearbyRestaurants.length === 0 && (
                                        <div className="space-y-3">
                                            <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                                            <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                                            <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                                        </div>
                                    )}
                                    {!isRestaurantsLoading && nearbyRestaurants.map((restaurant) => (
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
                                    {!isRestaurantsLoading && nearbyRestaurants.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Không tìm thấy nhà hàng phù hợp.</p>
                                    )}
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

                        {restaurantsError && (
                            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-2">
                                <div className="font-medium">{restaurantsError}</div>
                                {restaurantsErrorMeta && (restaurantsErrorMeta.status || restaurantsErrorMeta.code) && (
                                    <div className="text-xs text-destructive/80">
                                        {restaurantsErrorMeta.status ? `HTTP ${restaurantsErrorMeta.status}` : ""}
                                        {restaurantsErrorMeta.status && restaurantsErrorMeta.code ? " • " : ""}
                                        {restaurantsErrorMeta.code ?? ""}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-6">
                            {displayedPosts.map((post) => (
                                <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
                            ))}
                        </div>

                        {!isRestaurantsLoading && displayedPosts.length === 0 && !restaurantsError && (
                            <div className="py-20 text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                                    <Search className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Không có nhà hàng</h3>
                                <p className="text-muted-foreground">Chưa tìm thấy nhà hàng nào phù hợp với bộ lọc hiện tại</p>
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
                                <p className="text-sm text-muted-foreground">🎉 Bạn đã xem hết tất cả nhà hàng trong danh sách này</p>
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
