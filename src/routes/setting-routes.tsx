import { Navigate, Route } from "react-router-dom"

import {
    ACCOUNT_SECTION_RELATIVE_PATHS,
    ACCOUNT_SECTION_ROUTE_PATHS,
    NotificationSection,
    ProfileSection,
    SecuritySection,
    SETTINGS_BASE_PATH,
} from "@/features/settings/account"
import { ListRestaurantsSection } from "@/features/settings/manages/ListRestaurantsSection"
import { SettingsLayout } from "@/layouts/settings/SettingsLayout"
import AccountPage from "@/pages/settings/AccountPage"

export function SettingRoutes() {
    return (
        <Route path={SETTINGS_BASE_PATH} element={<SettingsLayout />}>
            <Route index element={<Navigate to={ACCOUNT_SECTION_ROUTE_PATHS.profile} replace />} />

            <Route path="account" element={<AccountPage />}>
                <Route index element={<Navigate to={ACCOUNT_SECTION_RELATIVE_PATHS.profile} replace />} />
                <Route path={ACCOUNT_SECTION_RELATIVE_PATHS.profile} element={<ProfileSection />} />
                <Route path={ACCOUNT_SECTION_RELATIVE_PATHS.notifications} element={<NotificationSection />} />
                <Route path={ACCOUNT_SECTION_RELATIVE_PATHS.security} element={<SecuritySection />} />
                <Route path="*" element={<Navigate to={ACCOUNT_SECTION_RELATIVE_PATHS.profile} replace />} />
            </Route>

            <Route path="manage/restaurants" element={<ListRestaurantsSection />} />

            <Route path="*" element={<Navigate to={ACCOUNT_SECTION_ROUTE_PATHS.profile} replace />} />
        </Route>
    )
}
