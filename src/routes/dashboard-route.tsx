import { Route } from "react-router-dom"

import DashboardPage from "@/pages/dashboard/DashboardPage"

export const DASHBOARD_ROUTE_PATH = "/dashboard"
export const DASHBOARD_BY_ID_ROUTE_PATH = "/dashboard/:id"

export function DashboardRoute() {
    return <Route path={DASHBOARD_BY_ID_ROUTE_PATH} element={<DashboardPage />} />
}
