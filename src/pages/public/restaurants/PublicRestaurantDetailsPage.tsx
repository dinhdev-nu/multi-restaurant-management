import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ArrowLeft,
    Building2,
    Clock3,
    Globe,
    MapPin,
    Phone,
    Share2,
    Store,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import AppImage from "@/components/AppImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PublicRestaurantsLayout } from "@/layouts/public/PublicRestaurantsLayout"
import { logout as logoutApi } from "@/services/auths"
import { toAppError } from "@/services/error"
import { getPublicRestaurantBySlug } from "@/services/restaurants"
import { useAuthStore } from "@/stores/auth-store"
import { useUserStore } from "@/stores/user-store"
import type { DayKey, PublicRestaurantDetail } from "@/types/restaurant-type"

const FALLBACK_RESTAURANT_IMAGE = "/assets/home/image.png"

const DAY_LABELS: Record<DayKey, string> = {
    mon: "Thứ 2",
    tue: "Thứ 3",
    wed: "Thứ 4",
    thu: "Thứ 5",
    fri: "Thứ 6",
    sat: "Thứ 7",
    sun: "Chủ nhật",
}

const MOCK_PUBLIC_RESTAURANT_DETAIL: PublicRestaurantDetail = {
    _id: "mock-public-restaurant-detail",
    name: "Gigi Garden Bistro",
    slug: "gigi-garden-bistro",
    description:
        "Không gian ấm cúng theo phong cách sân vườn, nổi bật với thực đơn fusion Việt - Âu và các set tối theo mùa.",
    cuisine_type: "Fusion Việt - Âu",
    price_range: 3,
    logo_url: "/assets/home/image.png",
    cover_image_url: "/assets/home/image.png",
    gallery_urls: ["/assets/home/image.png"],
    address: "129 Nguyễn Trãi",
    city: "Hà Nội",
    district: "Thanh Xuân",
    ward: "Thượng Đình",
    latitude: 21.002121,
    longitude: 105.815062,
    location: {
        type: "Point",
        coordinates: [105.815062, 21.002121],
    },
    phone: "0901 234 567",
    email: "hello@gigigarden.vn",
    website: "https://gigigarden.vn",
    operating_hours: {
        mon: { closed: false, open: "10:00", close: "22:00" },
        tue: { closed: false, open: "10:00", close: "22:00" },
        wed: { closed: false, open: "10:00", close: "22:00" },
        thu: { closed: false, open: "10:00", close: "22:00" },
        fri: { closed: false, open: "10:00", close: "23:00" },
        sat: { closed: false, open: "09:00", close: "23:00" },
        sun: { closed: false, open: "09:00", close: "22:00" },
    },
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    tax_rate: 8,
    service_charge_rate: 5,
    is_published: true,
    accepts_online_orders: true,
    deleted_at: null,
    created_at: "2026-03-11T03:15:24.000Z",
    updated_at: "2026-04-18T09:42:05.000Z",
}

function formatPriceRange(priceRange: PublicRestaurantDetail["price_range"]) {
    if (!priceRange) return "Đang cập nhật"
    return "$".repeat(priceRange)
}

function formatOperatingHour(day: PublicRestaurantDetail["operating_hours"][DayKey]) {
    if (day.closed) return "Đóng cửa"
    return `${day.open} - ${day.close}`
}

function getStatusBadgeClass(isPublished: boolean) {
    return isPublished
        ? "border-emerald-300/80 bg-emerald-500/90 text-white hover:bg-emerald-500"
        : "border-amber-300/80 bg-amber-500/90 text-white hover:bg-amber-500"
}

function resolveTodayKey() {
    const jsDay = new Date().getDay()

    switch (jsDay) {
        case 0:
            return "sun"
        case 1:
            return "mon"
        case 2:
            return "tue"
        case 3:
            return "wed"
        case 4:
            return "thu"
        case 5:
            return "fri"
        default:
            return "sat"
    }
}

export default function PublicRestaurantDetailsPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const clearUser = useUserStore((state) => state.clear)
    const profile = useUserStore((state) => state.profile)

    const [restaurant, setRestaurant] = useState<PublicRestaurantDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isLinkCopied, setIsLinkCopied] = useState(false)

    const handleLogout = useCallback(async () => {
        try {
            await logoutApi()
        } catch (caughtError) {
            console.error("Logout error:", caughtError)
        } finally {
            clearAuth()
            clearUser()
            navigate("/auth", { replace: true })
        }
    }, [clearAuth, clearUser, navigate])

    useEffect(() => {
        let isActive = true

        const loadRestaurant = async () => {
            try {
                setIsLoading(true)
                setError(null)

                if (!slug) {
                    setRestaurant(MOCK_PUBLIC_RESTAURANT_DETAIL)
                    return
                }

                const response = await getPublicRestaurantBySlug(slug)
                if (!isActive) return

                setRestaurant(response)
            } catch (caughtError) {
                if (!isActive) return

                const appError = toAppError(caughtError, "Không thể tải chi tiết nhà hàng.")
                setError(appError.message)
                setRestaurant({
                    ...MOCK_PUBLIC_RESTAURANT_DETAIL,
                    slug: slug ?? MOCK_PUBLIC_RESTAURANT_DETAIL.slug,
                })
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        loadRestaurant()

        return () => {
            isActive = false
        }
    }, [slug])

    const detail = restaurant ?? MOCK_PUBLIC_RESTAURANT_DETAIL

    const fullAddress = useMemo(() => {
        return [detail.address, detail.ward, detail.district, detail.city].filter(Boolean).join(", ")
    }, [detail.address, detail.city, detail.district, detail.ward])

    const galleryImages = useMemo(() => {
        return Array.from(
            new Set(
                [detail.cover_image_url, detail.logo_url, ...detail.gallery_urls].filter(
                    (image): image is string => Boolean(image)
                )
            )
        )
    }, [detail.cover_image_url, detail.gallery_urls, detail.logo_url])

    const todayKey = resolveTodayKey()
    const todayHour = detail.operating_hours[todayKey]

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setIsLinkCopied(true)
            window.setTimeout(() => setIsLinkCopied(false), 1400)
        } catch (caughtError) {
            console.error("Failed to copy link:", caughtError)
        }
    }, [])

    const handleOrderByPhone = useCallback(() => {
        if (!detail.phone) return
        window.location.href = `tel:${detail.phone.replace(/\s+/g, "")}`
    }, [detail.phone])

    return (
        <PublicRestaurantsLayout
            user={profile}
            onLogout={handleLogout}
            showCreateFab={false}
            onOpenAttentionModal={() => undefined}
        >
            <div className="space-y-4 pb-24 lg:pb-6">
                <Card className="sticky top-20 z-30 border border-border bg-card/95 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate("/public/restaurants")}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Danh sách
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={handleCopyLink}
                                >
                                    <Share2 className="h-4 w-4" />
                                    {isLinkCopied ? "Đã sao chép" : "Chia sẻ"}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={handleOrderByPhone}
                                    disabled={!detail.phone}
                                >
                                    <Phone className="h-4 w-4" />
                                    Gọi đặt món
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    disabled={!detail.accepts_online_orders}
                                >
                                    <Store className="h-4 w-4" />
                                    {detail.accepts_online_orders ? "Đặt món online" : "Chưa hỗ trợ online"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <section className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error} Hiện đang hiển thị dữ liệu mẫu để tiếp tục trải nghiệm giao diện.
                    </section>
                )}

                {isLoading ? (
                    <section className="space-y-4">
                        <div className="h-56 animate-pulse rounded-3xl bg-muted/40" />
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="h-40 animate-pulse rounded-2xl bg-muted/40 lg:col-span-2" />
                            <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <Card className="relative overflow-hidden rounded-3xl border border-border bg-card lg:col-span-5">
                                <AppImage
                                    src={detail.cover_image_url ?? detail.logo_url ?? FALLBACK_RESTAURANT_IMAGE}
                                    alt={detail.name}
                                    className="h-[240px] w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <Badge
                                        className={`mb-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm ${getStatusBadgeClass(detail.is_published)}`}
                                    >
                                        {detail.is_published ? "Đang hoạt động" : "Tạm ẩn"}
                                    </Badge>
                                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{detail.name}</h1>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        <Badge variant="outline" className="inline-flex items-center gap-1 rounded-full border-white/35 bg-black/25 px-2.5 py-1 font-medium text-white/95 backdrop-blur-sm">
                                            {detail.cuisine_type ?? "Đa dạng món"}
                                        </Badge>
                                        <Badge variant="outline" className="inline-flex items-center gap-1 rounded-full border-white/35 bg-black/25 px-2.5 py-1 font-medium text-white/95 backdrop-blur-sm">
                                            Mức giá: {formatPriceRange(detail.price_range)}
                                        </Badge>
                                        {detail.accepts_online_orders && (
                                            <Badge className="inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-500/90 px-2.5 py-1 font-semibold text-white shadow-sm hover:bg-emerald-500">
                                                Online
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-2xl border border-border bg-card lg:col-span-7">
                                <CardHeader className="pb-1">
                                    <CardTitle>Thông tin nhanh</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                        {detail.description ?? "Nhà hàng đang hoàn thiện thông tin chi tiết."}
                                    </p>

                                    <Separator />

                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div className="flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                            <span className="line-clamp-2">{fullAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{detail.phone ?? "Đang cập nhật"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                                            <Building2 className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{detail.email ?? "Đang cập nhật"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                                            <Globe className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{detail.website ?? "Đang cập nhật"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <Card className="rounded-2xl border border-border bg-card lg:col-span-7">
                                <CardHeader className="pb-1">
                                    <CardTitle>Giờ mở cửa</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Clock3 className="h-4 w-4" />
                                                Hôm nay ({DAY_LABELS[todayKey]})
                                            </span>
                                            <span className="font-semibold text-foreground">{formatOperatingHour(todayHour)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                        {(Object.keys(DAY_LABELS) as DayKey[]).map((dayKey) => (
                                            <div
                                                key={dayKey}
                                                className="flex items-center justify-between rounded-lg border border-border/60 px-2.5 py-2 text-sm text-muted-foreground"
                                            >
                                                <span>{DAY_LABELS[dayKey]}</span>
                                                <span>{formatOperatingHour(detail.operating_hours[dayKey])}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border border-border bg-card lg:col-span-5">
                                <CardHeader className="pb-1">
                                    <CardTitle>Hình ảnh nổi bật</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {galleryImages.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Nhà hàng chưa thêm hình ảnh.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {galleryImages.slice(0, 4).map((image, index) => (
                                                <AppImage
                                                    key={`${image}-${index}`}
                                                    src={image}
                                                    alt={`${detail.name} ${index + 1}`}
                                                    className="h-28 w-full rounded-xl border border-border object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </>
                )}
            </div>
        </PublicRestaurantsLayout>
    )
}
