import { Route } from "react-router-dom"

import PosPage from "@/pages/pos/PosPage"

export const POS_BASE_PATH = "/pos"
export const POS_DEFAULT_SLUG = "gigi-energy"
export const POS_ROUTE_PATH = `${POS_BASE_PATH}/:slug`

export function PosRoute() {
    return <Route path={`${POS_ROUTE_PATH}/*`} element={<PosPage />} />
}
