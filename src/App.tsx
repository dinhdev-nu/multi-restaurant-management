import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/home"
import AuthPage from "@/pages/auth"
import ProfilePage from "@/pages/profile"
import NotFoundPage from "@/pages/not-found"
import OAuthCallbackPage from "@/pages/oauth-callback"
import CreateRestaurantPage from "@/pages/new"
import RestaurantSelectorPage from "@/pages/restaurant-selector"
import Dashboard from "@/pages/dashboard"
import POS from "@/pages/pos/POS"
import { Toaster } from "@/components/ui/sonner"
import CustomerOrdering from "./pages/customer-ordering"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auths" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/new" element={<CreateRestaurantPage />} />
        <Route path="/restaurant-selector" element={<RestaurantSelectorPage />} />
        <Route path="/customer-ordering/*" element={<CustomerOrdering />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
