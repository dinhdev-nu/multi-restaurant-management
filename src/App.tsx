import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import NotFoundPage from "@/pages/not-found"
import OAuthCallbackPage from "@/pages/oauth-callback"
import { NewRestaurantRoute } from "@/routes/new-restaurant-route"
import { PosRoute } from "@/routes/pos-route"
import RestaurantSelectorPage from "@/pages/restaurant-selector"
import Dashboard from "@/pages/dashboard"
import { Toaster } from "@/components/ui/sonner"
import CustomerOrdering from "./pages/customer-ordering"
import { HomeRoutes } from "@/routes/home-routes"
import { SETTINGS_DEFAULT_PATH } from "@/routes/setting-route-config"
import { SettingRoutes } from "@/routes/setting-routes"
import { AuthRoutes } from "@/routes/auth-routes"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {HomeRoutes()}
        {AuthRoutes()}
        {SettingRoutes()}
        <Route path="/profile/*" element={<Navigate to={SETTINGS_DEFAULT_PATH} replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {PosRoute()}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        {NewRestaurantRoute()}
        <Route path="/restaurants" element={<RestaurantSelectorPage />} />
        <Route path="/customer-ordering/*" element={<CustomerOrdering />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
