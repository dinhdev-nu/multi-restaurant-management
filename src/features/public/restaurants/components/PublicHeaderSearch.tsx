import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { searchPublicRestaurants } from "@/services/restaurants"
import { toAppError } from "@/services/error"
import type { PublicRestaurantSearchItem } from "@/types/restaurant-type"
import PublicHeaderSearchContent, { type SearchFilters } from "./PublicHeaderSearchContent.tsx"

const PUBLIC_RESTAURANT_PAGE = 1
const PUBLIC_RESTAURANT_LIMIT = 5
const SEARCH_DEBOUNCE_MS = 250

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
    city: "",
    cuisine_type: "",
    price_range: [],
    accepts_online: null,
    radius_km: "5",
    sort: "name",
    lat: null,
    lng: null,
}

type PublicHeaderSearchProps = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

export default function PublicHeaderSearch({ isOpen, onOpenChange }: PublicHeaderSearchProps) {
    const navigate = useNavigate()
    const desktopSearchInputRef = useRef<HTMLInputElement | null>(null)
    const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
    const desktopSearchAreaRef = useRef<HTMLDivElement | null>(null)
    const mobileSearchAreaRef = useRef<HTMLDivElement | null>(null)
    const isSelectOpenRef = useRef(false)
    const searchTimeoutRef = useRef<number | null>(null)
    const locationRequestIdRef = useRef(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<PublicRestaurantSearchItem[]>([])
    const [isSearchLoading, setIsSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS)

    useEffect(() => {
        if (!isOpen) return

        const activeInput = window.innerWidth >= 1024 ? desktopSearchInputRef.current : mobileSearchInputRef.current
        activeInput?.focus()
    }, [isOpen])

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!isOpen) return

            const target = event.target
            if (!(target instanceof Element)) return

            const insideDesktop = desktopSearchAreaRef.current?.contains(target) ?? false
            const insideMobile = mobileSearchAreaRef.current?.contains(target) ?? false
            const insideSelectOverlay = Boolean(
                target.closest("[data-slot='select-content']") ||
                target.closest("[data-slot='select-item']") ||
                target.closest("[data-slot='select-trigger']")
            )

            if (insideDesktop || insideMobile || insideSelectOverlay || isSelectOpenRef.current) return

            onOpenChange(false)
        }

        document.addEventListener("pointerdown", handlePointerDown, true)

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown, true)
        }
    }, [isOpen, onOpenChange])

    useEffect(() => {
        if (!isOpen) {
            setSearchResults([])
            setSearchError(null)
            setIsSearchLoading(false)
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current)
            }
            return
        }

        if (searchTimeoutRef.current !== null) {
            window.clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = window.setTimeout(async () => {
            const trimmedQuery = searchQuery.trim()
            const priceRangeValues = searchFilters.price_range.length
                ? (searchFilters.price_range.map(Number) as Array<1 | 2 | 3 | 4>)
                : undefined
            const radiusValue = searchFilters.radius_km ? Number(searchFilters.radius_km) : undefined
            const acceptsOnlineValue = searchFilters.accepts_online === null ? undefined : searchFilters.accepts_online

            try {
                setIsSearchLoading(true)
                setSearchError(null)

                const response = await searchPublicRestaurants({
                    page: PUBLIC_RESTAURANT_PAGE,
                    limit: PUBLIC_RESTAURANT_LIMIT,
                    city: searchFilters.city.trim() || undefined,
                    cuisine_type: searchFilters.cuisine_type.trim() || undefined,
                    price_range: priceRangeValues,
                    accepts_online: acceptsOnlineValue,
                    lat: searchFilters.lat ?? undefined,
                    lng: searchFilters.lng ?? undefined,
                    radius_km: searchFilters.lat !== null && searchFilters.lng !== null ? radiusValue : undefined,
                    q: trimmedQuery || undefined,
                    sort: searchFilters.lat !== null && searchFilters.lng !== null ? "distance" : searchFilters.sort,
                })

                console.log("Search results:", response)

                setSearchResults(response.data)
            } catch (caughtError) {
                const appError = toAppError(caughtError, "Không thể tải danh sách nhà hàng.")
                setSearchResults([])
                setSearchError(appError.message)
            } finally {
                setIsSearchLoading(false)
            }
        }, SEARCH_DEBOUNCE_MS)

        return () => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [isOpen, searchFilters, searchQuery])

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const handleRestaurantSelect = (restaurant: PublicRestaurantSearchItem) => {
        onOpenChange(false)
        setSearchQuery("")
        setSearchResults([])
        navigate(`/public/restaurants/${restaurant.slug}`)
    }

    const setFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        setSearchFilters((prev) => ({ ...prev, [key]: value }))
        onOpenChange(true)
    }

    const handleSelectOpenChange = (open: boolean) => {
        isSelectOpenRef.current = open

        if (open) {
            onOpenChange(true)
        }
    }

    const clearLocationFilter = () => {
        setSearchFilters((prev) => ({ ...prev, lat: null, lng: null }))
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setSearchError("Trình duyệt không hỗ trợ định vị.")
            return
        }

        const requestId = ++locationRequestIdRef.current
        setIsLocating(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (requestId !== locationRequestIdRef.current) return

                setSearchFilters((prev) => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    sort: "distance",
                }))
                setIsLocating(false)
                onOpenChange(true)
            },
            (error) => {
                if (requestId !== locationRequestIdRef.current) return

                setIsLocating(false)
                setSearchError(error.message || "Không thể lấy vị trí hiện tại.")
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
        )
    }

    return (
        <>
            <div ref={desktopSearchAreaRef} className="relative mx-8 hidden max-w-2xl flex-1 lg:block">
                <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        ref={desktopSearchInputRef}
                        name="feed-search"
                        type="text"
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value)
                            onOpenChange(true)
                        }}
                        onFocus={() => onOpenChange(true)}
                        placeholder="Tìm kiếm nhà hàng, món ăn..."
                        className="w-full rounded-full border border-border bg-secondary py-2.5 pl-12 pr-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            aria-label="Xóa tìm kiếm"
                            onClick={() => {
                                setSearchQuery("")
                                onOpenChange(true)
                                desktopSearchInputRef.current?.focus()
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {isOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
                        <PublicHeaderSearchContent
                            searchQuery={searchQuery}
                            searchFilters={searchFilters}
                            isSearchLoading={isSearchLoading}
                            searchError={searchError}
                            searchResults={searchResults}
                            isLocating={isLocating}
                            onSelectRestaurant={handleRestaurantSelect}
                            onUseCurrentLocation={handleUseCurrentLocation}
                            onClearLocation={clearLocationFilter}
                            onFilterChange={setFilter}
                            onSelectOpenChange={handleSelectOpenChange}
                        />
                    </div>
                )}
            </div>

            <div className="lg:hidden">
                {isOpen && (
                    <div ref={mobileSearchAreaRef} className="relative mt-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value)
                                    onOpenChange(true)
                                }}
                                placeholder="Tìm kiếm nhà hàng, món ăn..."
                                className="w-full rounded-2xl border border-border bg-secondary py-3 pl-12 pr-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    aria-label="Xóa tìm kiếm"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
                            <PublicHeaderSearchContent
                                searchQuery={searchQuery}
                                searchFilters={searchFilters}
                                isSearchLoading={isSearchLoading}
                                searchError={searchError}
                                searchResults={searchResults}
                                isLocating={isLocating}
                                onSelectRestaurant={handleRestaurantSelect}
                                onUseCurrentLocation={handleUseCurrentLocation}
                                onClearLocation={clearLocationFilter}
                                onFilterChange={setFilter}
                                onSelectOpenChange={handleSelectOpenChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
