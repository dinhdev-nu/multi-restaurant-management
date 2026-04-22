import { Route } from "react-router-dom"

import DashboardPage from "@/pages/dashboard/DashboardPage"

export const DASHBOARD_ROUTE_PATH = "/dashboard"

export function DashboardRoute() {
    return <Route path={DASHBOARD_ROUTE_PATH} element={<DashboardPage />} />
}
