import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import NotFoundPage from "@/pages/not-found/NotFoundPage"
import OAuthCallbackPage from "@/pages/oauth-callback/OauthCallback"
import { NewRestaurantRoute } from "@/routes/new-restaurant-route"
import { PublicOrderingRoute } from "@/routes/public-ordering-route"
import { PosRoute } from "@/routes/pos-route"
import { PublicRestaurantsRoute } from "@/routes/public-restaurants-route"
import RestaurantSelectorPage from "@/pages/restaurant-selector"
import { DashboardRoute } from "@/routes/dashboard-route"
import { Toaster } from "@/components/ui/sonner"
import { HomeRoutes } from "@/routes/home-routes"
import { SETTINGS_DEFAULT_PATH } from "@/routes/setting-route-config"
import { SettingRoutes } from "@/routes/setting-routes"
import { AuthRoutes } from "@/routes/auth-routes"
import PublicRestaurantDetailsPage from "./pages/public/restaurants/PublicRestaurantDetailsPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {HomeRoutes()}
        {AuthRoutes()}
        {SettingRoutes()}
        <Route path="/profile/*" element={<Navigate to={SETTINGS_DEFAULT_PATH} replace />} />
        {DashboardRoute()}
        {PosRoute()}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        {NewRestaurantRoute()}
        <Route path="/restaurants" element={<RestaurantSelectorPage />} />
        <Route path="/public/restaurants/:slug" element={<PublicRestaurantDetailsPage />} />
        {PublicRestaurantsRoute()}
        {PublicOrderingRoute()}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
