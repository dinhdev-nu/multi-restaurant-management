import { Route } from "react-router-dom"
import { HomePage } from "@/pages/home/HomePage"

export function HomeRoutes() {
    return <Route path="/" element={<HomePage />} />
}
