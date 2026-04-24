export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export interface DailyOperatingHour {
  closed: boolean
  open: string
  close: string
}

export type OperatingHours = Record<DayKey, DailyOperatingHour>

export interface RestaurantGeoLocation {
  type: "Point"
  coordinates: [number, number]
}

export interface RestaurantSettings {
  auto_confirm_orders?: boolean
  min_order_amount?: number
  delivery_radius_km?: number
  max_advance_booking_days?: number
}

export interface Restaurant {
  _id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  cuisine_type: string | null
  price_range: 1 | 2 | 3 | 4 | null
  logo_url: string | null
  cover_image_url: string | null
  gallery_urls: string[]
  address: string
  city: string
  district: string | null
  ward: string | null
  latitude: number | null
  longitude: number | null
  location: RestaurantGeoLocation
  phone: string | null
  email: string | null
  website: string | null
  operating_hours: OperatingHours
  timezone: string
  currency: "VND" | "USD" | "EUR"
  tax_rate: number
  service_charge_rate: number
  is_published: boolean
  accepts_online_orders: boolean
  settings: RestaurantSettings
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type RestaurantStaffDetail = Omit<Restaurant, "tax_rate" | "service_charge_rate" | "settings">

export type PublicRestaurantDetail = Omit<Restaurant, "owner_id" | "settings">

export interface OwnerRestaurantListItem {
  _id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  website: string | null
  cuisine_type: string | null
  city: string
  operating_hours: OperatingHours
  is_published: boolean
  accepts_online_orders: boolean
  logo_url: string | null
  created_at: string
}

export interface PublicRestaurantSearchItem {
  _id: string
  name: string
  slug: string
  description: string | null
  cuisine_type: string | null
  price_range: 1 | 2 | 3 | 4 | null
  logo_url: string | null
  cover_image_url: string | null
  address: string
  city: string
  district: string | null
  ward: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  operating_hours: OperatingHours
  accepts_online_orders: boolean
  distance_km: number | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface CheckRestaurantSlugPayload {
  slug: string
}

export interface CheckRestaurantSlugResponse {
  available: boolean
}

export interface CreateRestaurantPayload {
  name: string
  slug?: string
  description?: string
  logo_url?: string
  cover_image_url?: string
  gallery_urls?: string[]
  website?: string
  cuisine_type?: string
  price_range?: 1 | 2 | 3 | 4
  address: string
  city: string
  district?: string
  ward?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  timezone?: string
  operating_hours: OperatingHours
}

export type UpdateRestaurantPayload = Partial<
  Omit<CreateRestaurantPayload, "slug" | "operating_hours">
>

export interface UpdateRestaurantHoursPayload {
  operating_hours: OperatingHours
}

export interface UpdateRestaurantFinancialPayload {
  tax_rate?: number
  currency?: "VND" | "USD" | "EUR"
  service_charge_rate?: number
}

export interface UpdateRestaurantSettingsPayload {
  settings: {
    auto_confirm_orders?: boolean
    min_order_amount?: number
    delivery_radius_km?: number
    max_advance_booking_days?: number
  }
}

export interface UpdateRestaurantPublishPayload {
  is_published: boolean
}

export interface UpdateRestaurantOnlineOrdersPayload {
  accepts_online_orders: boolean
}

export interface UpdateRestaurantLogoPayload {
  logo_url: string
}

export interface UpdateRestaurantCoverPayload {
  cover_image_url: string
}

export interface AddRestaurantGalleryImagePayload {
  image_url: string
}

export interface OwnerRestaurantsQuery {
  page?: number
  limit?: number
  status?: "published"
  owner_id?: string
}

export interface PublicRestaurantsSearchQuery {
  city?: string
  cuisine_type?: string
  price_range?: Array<1 | 2 | 3 | 4>
  accepts_online?: boolean
  lat?: number
  lng?: number
  radius_km?: number
  q?: string
  sort?: "distance" | "name"
  page?: number
  limit?: number
}

export interface UpdateOperationResponse {
  updated: true
}

export interface UpdateRestaurantSettingsResponse extends UpdateOperationResponse {
  settings: RestaurantSettings
}

export interface UpdatePublishStatusResponse {
  is_published: boolean
  message: string
}

export interface UpdateOnlineOrdersResponse {
  accepts_online_orders: boolean
  message: string
}

export interface UpdateRestaurantLogoResponse {
  logo_url: string
}

export interface UpdateRestaurantCoverResponse {
  cover_image_url: string
}

export interface RestaurantGalleryResponse {
  gallery_urls: string[]
  count: number
}

export interface DeleteRestaurantResponse {
  deleted: true
  message: string
}
