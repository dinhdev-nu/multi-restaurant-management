import { Route } from "react-router-dom"

import PublicRestaurantsPage from "@/pages/public/restaurants/PublicRestaurantsPage"

export const PUBLIC_RESTAURANTS_ROUTE_PATH = "/public/restaurants"

export function PublicRestaurantsRoute() {
    return <Route path={PUBLIC_RESTAURANTS_ROUTE_PATH} element={<PublicRestaurantsPage />} />
}
