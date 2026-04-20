import { Bell, Shield, User, type LucideIcon } from "lucide-react"

import { NotificationSection } from "./NotificationSection"
import { ProfileSection } from "./ProfileSection"
import { SecuritySection } from "./SecuritySection"

export type AccountSectionId = "profile" | "notifications" | "security"

export interface SettingsNavItem {
  id: AccountSectionId
  label: string
  icon: LucideIcon
  relativePath: string
  routePath: string
  href: string
}

export const SETTINGS_BASE_PATH = "/settings"
const ACCOUNT_SEGMENT = "account"

export const ACCOUNT_SECTION_RELATIVE_PATHS: Record<AccountSectionId, string> = {
  profile: "profile",
  notifications: "notifications",
  security: "security",
}

export const ACCOUNT_SECTION_ROUTE_PATHS: Record<AccountSectionId, string> = {
  profile: `${ACCOUNT_SEGMENT}/${ACCOUNT_SECTION_RELATIVE_PATHS.profile}`,
  notifications: `${ACCOUNT_SEGMENT}/${ACCOUNT_SECTION_RELATIVE_PATHS.notifications}`,
  security: `${ACCOUNT_SEGMENT}/${ACCOUNT_SECTION_RELATIVE_PATHS.security}`,
}

export const ACCOUNT_SECTION_PATHS: Record<AccountSectionId, string> = {
  profile: `${SETTINGS_BASE_PATH}/${ACCOUNT_SECTION_ROUTE_PATHS.profile}`,
  notifications: `${SETTINGS_BASE_PATH}/${ACCOUNT_SECTION_ROUTE_PATHS.notifications}`,
  security: `${SETTINGS_BASE_PATH}/${ACCOUNT_SECTION_ROUTE_PATHS.security}`,
}

export const ACCOUNT_DEFAULT_PATH = ACCOUNT_SECTION_PATHS.profile

const ACCOUNT_ITEMS: Array<Pick<SettingsNavItem, "id" | "label" | "icon">> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
]

export const ACCOUNT_NAV_ITEMS: SettingsNavItem[] = ACCOUNT_ITEMS.map((item) => ({
  ...item,
  relativePath: ACCOUNT_SECTION_RELATIVE_PATHS[item.id],
  routePath: ACCOUNT_SECTION_ROUTE_PATHS[item.id],
  href: ACCOUNT_SECTION_PATHS[item.id],
}))

export function findActiveAccountNavItem(pathname: string): SettingsNavItem | null {
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  return ACCOUNT_NAV_ITEMS.find((item) => item.href === normalizedPath) ?? null
}

export { ProfileSection, NotificationSection, SecuritySection }
