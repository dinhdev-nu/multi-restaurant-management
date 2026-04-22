import type { LucideIcon } from "lucide-react"
import { CalendarDays, Flame, House, Sparkles, Star, Tag } from "lucide-react"

import type { FeedFilter } from "../types"

interface FilterTab {
    id: FeedFilter
    label: string
    icon: LucideIcon
    color: string
}

interface FilterTabsProps {
    activeFilter: FeedFilter
    onFilterChange: (filter: FeedFilter) => void
}

const FILTERS: FilterTab[] = [
    { id: "all", label: "Tất cả", icon: House, color: "text-gray-700" },
    { id: "promotion", label: "Khuyến mãi", icon: Tag, color: "text-red-500" },
    { id: "new_menu", label: "Menu mới", icon: Sparkles, color: "text-purple-500" },
    { id: "feedback", label: "Review", icon: Star, color: "text-yellow-500" },
    { id: "event", label: "Sự kiện", icon: CalendarDays, color: "text-blue-500" },
    { id: "experience", label: "Kinh nghiệm", icon: Flame, color: "text-orange-500" },
]

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
    return (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="scrollbar-hide flex items-center space-x-2 overflow-x-auto">
                {FILTERS.map((filter) => {
                    const IconComponent = filter.icon
                    const isActive = activeFilter === filter.id

                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`flex shrink-0 items-center space-x-2 whitespace-nowrap rounded-2xl px-4 py-2.5 transition-all duration-200 ${isActive
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-background text-foreground hover:bg-secondary"
                                }`}
                        >
                            <IconComponent className={`h-4 w-4 ${isActive ? "text-primary-foreground" : filter.color}`} />
                            <span className="text-sm font-medium">{filter.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
