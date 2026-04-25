import { ChevronRight, Clock3, Search, Store } from "lucide-react"

import AppImage from "@/components/AppImage"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { PublicRestaurantSearchItem } from "@/types/restaurant-type"
import { MOCK_PROVINCES, PRICE_RANGES, cuisineTypes, type SelectOption } from "@/features/new/constants"

const FALLBACK_RESTAURANT_IMAGE = "/assets/home/image.png"

export type SearchFilters = {
    city: string
    cuisine_type: string
    price_range: string[]
    accepts_online: boolean | null
    radius_km: string
    sort: "name" | "distance"
    lat: number | null
    lng: number | null
}

type PublicHeaderSearchContentProps = {
    searchQuery: string
    searchFilters: SearchFilters
    isSearchLoading: boolean
    searchError: string | null
    searchResults: PublicRestaurantSearchItem[]
    isLocating: boolean
    onSelectRestaurant: (restaurant: PublicRestaurantSearchItem) => void
    onUseCurrentLocation: () => void
    onClearLocation: () => void
    onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
    onSelectOpenChange: (open: boolean) => void
}

export default function PublicHeaderSearchContent({
    searchQuery,
    searchFilters,
    isSearchLoading,
    searchError,
    searchResults,
    isLocating,
    onSelectRestaurant,
    onUseCurrentLocation,
    onClearLocation,
    onFilterChange,
    onSelectOpenChange,
}: PublicHeaderSearchContentProps) {
    const renderSearchFilters = () => (
        <div className="flex flex-col gap-3 border-b border-border/70 p-3">
            <div className="flex flex-wrap gap-2">
                {searchFilters.lat !== null && searchFilters.lng !== null ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                        Đang dùng vị trí hiện tại
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                        Chưa dùng vị trí hiện tại
                    </span>
                )}

                <button
                    type="button"
                    onClick={onUseCurrentLocation}
                    disabled={isLocating}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                    {isLocating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
                </button>

                {(searchFilters.lat !== null || searchFilters.lng !== null) && (
                    <button
                        type="button"
                        onClick={onClearLocation}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                        Xóa vị trí
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">City</span>
                    <Select value={searchFilters.city} onValueChange={(value) => onFilterChange("city", value)} onOpenChange={onSelectOpenChange}>
                        <SelectTrigger size="sm" className="h-9 w-full rounded-xl border-border bg-background px-3 text-sm text-foreground">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} className="min-w-[12rem]">
                            {MOCK_PROVINCES.map((province: SelectOption) => (
                                <SelectItem key={province.code} value={province.name}>
                                    {province.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">Cuisine</span>
                    <Select value={searchFilters.cuisine_type} onValueChange={(value) => onFilterChange("cuisine_type", value)} onOpenChange={onSelectOpenChange}>
                        <SelectTrigger size="sm" className="h-9 w-full rounded-xl border-border bg-background px-3 text-sm text-foreground">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} className="min-w-[12rem]">
                            {cuisineTypes.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>

                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">Price</span>
                    <ToggleGroup
                        type="multiple"
                        value={searchFilters.price_range}
                        onValueChange={(value) => onFilterChange("price_range", value)}
                        variant="outline"
                        size="sm"
                        spacing={0}
                        className="grid w-full grid-cols-4 overflow-hidden rounded-xl border border-border bg-background"
                    >
                        {PRICE_RANGES.map((priceRange) => (
                            <ToggleGroupItem
                                key={priceRange}
                                value={String(priceRange)}
                                className="h-9 flex-1 rounded-none border-0 text-xs font-semibold text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                                {"$".repeat(priceRange)}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </label>

                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">Online</span>
                    <Select
                        value={searchFilters.accepts_online === null ? "__all__" : searchFilters.accepts_online ? "true" : "false"}
                        onValueChange={(value) => onFilterChange("accepts_online", value === "__all__" ? null : value === "true")}
                        onOpenChange={onSelectOpenChange}
                    >
                        <SelectTrigger size="sm" className="h-9 w-full rounded-xl border-border bg-background px-3 text-sm text-foreground">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} className="min-w-[12rem]">
                            <SelectItem value="__all__">Tất cả</SelectItem>
                            <SelectItem value="true">Có</SelectItem>
                            <SelectItem value="false">Không</SelectItem>
                        </SelectContent>
                    </Select>
                </label>

                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">Radius</span>
                    <Select value={searchFilters.radius_km} onValueChange={(value) => onFilterChange("radius_km", value)} onOpenChange={onSelectOpenChange}>
                        <SelectTrigger size="sm" className="h-9 w-full rounded-xl border-border bg-background px-3 text-sm text-foreground">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} className="min-w-[12rem]">
                            <SelectItem value="1">1 km</SelectItem>
                            <SelectItem value="3">3 km</SelectItem>
                            <SelectItem value="5">5 km</SelectItem>
                            <SelectItem value="10">10 km</SelectItem>
                        </SelectContent>
                    </Select>
                </label>

                <label className="space-y-1 text-xs">
                    <span className="font-medium text-muted-foreground">Sort</span>
                    <Select value={searchFilters.sort} onValueChange={(value) => onFilterChange("sort", value === "distance" ? "distance" : "name")} onOpenChange={onSelectOpenChange}>
                        <SelectTrigger size="sm" className="h-9 w-full rounded-xl border-border bg-background px-3 text-sm text-foreground">
                            <SelectValue placeholder="Name" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} className="min-w-[12rem]">
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="distance">Distance</SelectItem>
                        </SelectContent>
                    </Select>
                </label>
            </div>
        </div>
    )

    const hasQuery = searchQuery.trim().length > 0

    return (
        <>
            {renderSearchFilters()}

            <div className="max-h-[24rem] overflow-auto p-2">
                {isSearchLoading && (
                    <div className="space-y-2 p-2">
                        <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
                        <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
                        <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
                    </div>
                )}

                {!isSearchLoading && searchError && (
                    <div className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive">{searchError}</div>
                )}

                {!isSearchLoading && !searchError && searchResults.length > 0 && searchResults.map((restaurant) => {
                    const image = restaurant.cover_image_url ?? restaurant.logo_url ?? FALLBACK_RESTAURANT_IMAGE
                    const location = [restaurant.district, restaurant.city].filter(Boolean).join(", ") || restaurant.city

                    return (
                        <button
                            key={restaurant._id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onSelectRestaurant(restaurant)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
                        >
                            <AppImage
                                src={image}
                                alt={restaurant.name}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                                loading="lazy"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-foreground">{restaurant.name}</p>
                                    {restaurant.accepts_online_orders && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                            Online
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{location}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <Store className="h-3.5 w-3.5" />
                                        {restaurant.cuisine_type ?? "Nhà hàng"}
                                    </span>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        Xem chi tiết
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                    )
                })}

                {!isSearchLoading && !searchError && searchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                        <Search className="h-10 w-10 text-muted-foreground/70" />
                        <div>
                            <p className="text-sm font-medium text-foreground">{hasQuery ? "Không tìm thấy nhà hàng" : "Nhập từ khóa để tìm kiếm"}</p>
                            <p className="text-xs text-muted-foreground">{hasQuery ? "Thử đổi từ khóa khác" : "Gõ tên nhà hàng, món ăn hoặc khu vực"}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}