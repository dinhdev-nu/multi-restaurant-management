import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    GitBranch,
    Handshake,
    Users,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Building2,
    TrendingUp,
    Settings,
    type LucideIcon,
} from "lucide-react";
import AppImage from "@/components/AppImage";

type SidebarRestaurant = {
    _id: string;
    name: string;
    logo_url?: string | null;
};

type SectionId =
    | "overview"
    | "pipeline"
    | "deals"
    | "customers"
    | "team"
    | "forecasting"
    | "reports"
    | "settings";

interface NavItem {
    id: SectionId;
    label: string;
    icon: LucideIcon;
}

interface SidebarProps {
    restaurant?: SidebarRestaurant | null;
    activeSection: SectionId;
    onSectionChange: (section: SectionId) => void;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
}

const navItems: NavItem[] = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "pipeline", label: "Quy trình", icon: GitBranch },
    { id: "deals", label: "Giao dịch", icon: Handshake },
    { id: "customers", label: "Khách hàng", icon: Building2 },
    { id: "team", label: "Đội ngũ", icon: Users },
    { id: "forecasting", label: "Dự báo", icon: TrendingUp },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar({
    restaurant,
    activeSection,
    onSectionChange,
    collapsed,
    onCollapsedChange,
}: SidebarProps) {
    return (
        <aside
            className={cn(
                "dashboard-sidebar-shell fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
                collapsed ? "w-[72px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-sidebar-border overflow-hidden">
                <div className={cn("flex items-center min-w-0 dashboard-sidebar-label", collapsed ? "gap-0" : "gap-3")}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white ring-1 ring-sidebar-border/60">
                        {restaurant?.logo_url ? (
                            <AppImage
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <CircleDollarSign className="w-5 h-5 text-accent" />
                        )}
                    </div>
                    <span
                        className={cn(
                            "dashboard-sidebar-title font-semibold text-lg text-sidebar-foreground whitespace-nowrap overflow-hidden",
                            collapsed ? "max-w-0 opacity-0 translate-x-[-6px]" : "max-w-[180px] opacity-100 translate-x-0"
                        )}
                    >
                        {restaurant?.name ?? "SalesOps"}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={cn(
                                "dashboard-sidebar-nav-item w-full flex items-center rounded-lg text-sm font-medium group relative overflow-hidden",
                                collapsed ? "justify-center px-2 py-2.5" : "justify-start gap-3 px-3 py-2.5",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-foreground"
                                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                        >
                            {/* Active indicator */}
                            <span
                                className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent transition-all duration-300",
                                    isActive ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <Icon
                                className={cn(
                                    "w-5 h-5 shrink-0 transition-transform duration-200",
                                    isActive ? "text-accent" : "group-hover:scale-110"
                                )}
                            />
                            <span
                                className={cn(
                                    "whitespace-nowrap overflow-hidden transition-all duration-400 ease-in-out",
                                    collapsed ? "max-w-0 opacity-0 translate-x-[-6px]" : "max-w-[160px] opacity-100 translate-x-0"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Collapse button */}
            <div className="p-3 border-t border-sidebar-border">
                <button
                    onClick={() => onCollapsedChange(!collapsed)}
                    className="dashboard-sidebar-collapse-button w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span>Thu gọn</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
