import { cn } from "@/lib/utils";
import { Bell, Search, Calendar, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/stores/user-store";

function getInitials(fullName: string | undefined | null): string {
  if (!fullName?.trim()) return "?"
  const parts = fullName.trim().split(/\s+/)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

interface HeaderProps {
  isDark: boolean
  onToggle: () => void
}

export function Header({ isDark, onToggle }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const profile = useUserStore((state) => state.profile)
  const initials = getInitials(profile?.full_name)

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <span className="text-2xl font-black tracking-tighter leading-none">
            <span className="text-foreground">Gi</span>
            <span className="text-accent">Gi</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div
          className={cn(
            "relative hidden sm:flex items-center transition-all duration-300",
            searchFocused ? "w-64" : "w-48"
          )}
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary ring-1 ring-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all duration-200"
          />
        </div>

        {/* Dark / Light toggle */}
        <button
          onClick={onToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </button>

        {/* User avatar */}
        <button className="w-9 h-9 rounded-lg overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-accent/50 transition-all duration-200">
          <div className="w-full h-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-semibold text-accent-foreground">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
}
