import { Route } from "react-router-dom"

import PosPage from "@/pages/pos/PosPage"

export const POS_ROUTE_PATH = "/pos"

export function PosRoute() {
    return <Route path={`${POS_ROUTE_PATH}/*`} element={<PosPage />} />
}
