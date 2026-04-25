import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getOwnerRestaurants } from "@/services/restaurants";
import type { OwnerRestaurantListItem } from "@/types/restaurant-type";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Mail,
    Phone,
    Store,
    Settings,
    Share2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

type RestaurantTier = "Công khai" | "Bản nháp";

const tierColors: Record<RestaurantTier, string> = {
    "Công khai": "bg-primary/10 text-primary border-primary/25",
    "Bản nháp": "bg-muted text-muted-foreground border-border",
};

function getRestaurantReadinessScore(restaurant: OwnerRestaurantListItem) {
    let score = 45;

    if (restaurant.is_published) score += 25;
    if (restaurant.accepts_online_orders) score += 20;
    if (restaurant.email || restaurant.phone) score += 5;
    if (restaurant.website) score += 5;

    return Math.min(score, 100);
}

function getRestaurantTrend(restaurant: OwnerRestaurantListItem): "up" | "down" | "stable" {
    if (restaurant.is_published && restaurant.accepts_online_orders) return "up";
    if (!restaurant.is_published && !restaurant.accepts_online_orders) return "down";
    return "stable";
}

function formatCreatedDate(value: string) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function getHealthBarClass(score: number) {
    if (score >= 80) return "bg-primary";
    if (score >= 60) return "bg-amber-500";
    return "bg-destructive";
}

function getHealthTextClass(score: number) {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
}

export function ListRestaurantsSection() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<OwnerRestaurantListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function loadRestaurants() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getOwnerRestaurants({ page: 1, limit: 10 });
                console.log("Fetched restaurants:", response);
                if (!isActive) return;

                setRestaurants(response.data);
            } catch {
                if (!isActive) return;

                setError("Không thể tải danh sách nhà hàng.");
                setRestaurants([]);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadRestaurants();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div>
            {error && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4 xl:gap-5">
                {isLoading &&
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card
                            key={`restaurant-skeleton-${index}`}
                            className="h-full border-border bg-card animate-pulse"
                        >
                            <CardContent className="flex h-full flex-col p-5">
                                <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-muted" />
                                        <div className="min-w-0 space-y-2">
                                            <div className="h-4 w-28 rounded bg-muted" />
                                            <div className="h-3 w-20 rounded bg-muted" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-20 rounded-full bg-muted" />
                                </div>
                                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="h-3 w-32 rounded bg-muted" />
                                        <div className="h-3 w-28 rounded bg-muted" />
                                        <div className="h-3 w-24 rounded bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-full rounded bg-muted" />
                                        <div className="h-3 w-full rounded bg-muted" />
                                        <div className="h-3 w-3/4 rounded bg-muted" />
                                    </div>
                                </div>
                                <div className="mt-auto border-t border-border pt-4 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="h-3 w-28 rounded bg-muted" />
                                        <div className="h-3 w-16 rounded bg-muted" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 flex-1 rounded border border-border bg-muted/40" />
                                        <div className="h-10 flex-1 rounded border border-border bg-muted/40" />
                                        <div className="h-10 w-10 rounded bg-muted/40" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                {!isLoading &&
                    restaurants.map((restaurant, index) => {
                        const readinessScore = getRestaurantReadinessScore(restaurant);
                        const trend = getRestaurantTrend(restaurant);
                        const tier: RestaurantTier = restaurant.is_published ? "Công khai" : "Bản nháp";
                        const needsVerification =
                            !restaurant.is_published || !restaurant.accepts_online_orders;

                        return (
                            <Card
                                key={restaurant._id}
                                className="h-full border-border bg-card transition-colors duration-200 group animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                <CardContent className="flex h-full flex-col p-5">
                                    <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src={restaurant.logo_url ?? undefined}
                                                    alt={restaurant.name}
                                                />
                                                <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                                                    {restaurant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {restaurant.name}
                                                </h3>
                                                <p className="truncate text-sm text-muted-foreground">{restaurant.cuisine_type ?? "Chưa phân loại"}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${tierColors[tier]} shrink-0 border`}>
                                            {tier === "Công khai" ? "Công khai" : "Bản nháp - Cần xác nhận"}
                                        </Badge>
                                    </div>

                                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{restaurant.city}</span>
                                            </div>
                                            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{restaurant.email ?? "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span className="truncate">{restaurant.phone ?? "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span className="text-muted-foreground">Mã slug</span>
                                                <span className="font-medium text-foreground tabular-nums">
                                                    {restaurant.slug}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span className="text-muted-foreground">Đơn online</span>
                                                <span className="font-medium text-foreground tabular-nums">
                                                    {restaurant.accepts_online_orders ? "Bật" : "Tắt"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span className="text-muted-foreground">Tạo lúc</span>
                                                <span className="font-medium text-foreground">{formatCreatedDate(restaurant.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Score */}
                                    <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Điểm sẵn sàng</span>
                                            {trend === "up" && (
                                                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                            )}
                                            {trend === "down" && (
                                                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-[width] duration-700 ease-out",
                                                        getHealthBarClass(readinessScore)
                                                    )}
                                                    style={{ width: `${readinessScore}%` }}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-sm font-semibold tabular-nums",
                                                    getHealthTextClass(readinessScore)
                                                )}
                                            >
                                                {readinessScore}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                                        <Button variant="outline" size="sm" className="h-10 flex-1 bg-transparent">
                                            <Store className="w-3.5 h-3.5 mr-1.5" />
                                            Bán hàng
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-10 flex-1 bg-transparent"
                                            onClick={() =>
                                                navigate(`/dashboard/${restaurant._id}`, {
                                                    state: {
                                                        restaurant: {
                                                            _id: restaurant._id,
                                                            name: restaurant.name,
                                                            logo_url: restaurant.logo_url,
                                                        },
                                                    },
                                                })
                                            }
                                            title={
                                                needsVerification
                                                    ? "Xác nhận nhà hàng: bật đặt hàng và publish cho khách"
                                                    : "Mở trang quản lý"
                                            }
                                        >
                                            <Settings className="w-3.5 h-3.5 mr-1.5" />
                                            {needsVerification ? "Quản lý xác nhận" : "Quản lý"}
                                        </Button>
                                        <Button variant="ghost" size="sm" aria-label={`Chia sẻ ${restaurant.name}`}>
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                {!isLoading && restaurants.length === 0 && !error && (
                    <div className="col-span-full rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                        Chưa có nhà hàng nào.
                    </div>
                )}
            </div>
        </div>
    );
}
