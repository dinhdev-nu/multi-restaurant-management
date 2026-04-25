import { apiClient, unwrapResponseData } from "./client"
import type { ApiSuccessResponse } from "./types"
import type {
  AddRestaurantGalleryImagePayload,
  CheckRestaurantSlugPayload,
  CheckRestaurantSlugResponse,
  CreateRestaurantPayload,
  DeleteRestaurantResponse,
  OwnerRestaurantListItem,
  OwnerRestaurantsQuery,
  PaginatedResponse,
  PublicRestaurantDetail,
  PublicRestaurantsSearchQuery,
  PublicRestaurantSearchItem,
  Restaurant,
  RestaurantGalleryResponse,
  RestaurantStaffDetail,
  UpdateOnlineOrdersResponse,
  UpdateOperationResponse,
  UpdatePublishStatusResponse,
  UpdateRestaurantCoverPayload,
  UpdateRestaurantCoverResponse,
  UpdateRestaurantFinancialPayload,
  UpdateRestaurantHoursPayload,
  UpdateRestaurantLogoPayload,
  UpdateRestaurantLogoResponse,
  UpdateRestaurantOnlineOrdersPayload,
  UpdateRestaurantPayload,
  UpdateRestaurantPublishPayload,
  UpdateRestaurantSettingsPayload,
  UpdateRestaurantSettingsResponse,
} from "@/types/restaurant-type"

function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (Array.isArray(value)) {
        return value.length > 0
      }

      return true
    })
  ) as Partial<T>
}

export async function checkRestaurantSlug(payload: CheckRestaurantSlugPayload): Promise<CheckRestaurantSlugResponse> {
  const response = await apiClient.post<ApiSuccessResponse<CheckRestaurantSlugResponse>>("/restaurants/check-slug", payload)
  return unwrapResponseData(response)
}

export async function createRestaurant(payload: CreateRestaurantPayload): Promise<Restaurant> {
  const response = await apiClient.post<ApiSuccessResponse<Restaurant>>("/restaurants", payload)
  return unwrapResponseData(response)
}

export async function getOwnerRestaurants(query: OwnerRestaurantsQuery = {}): Promise<PaginatedResponse<OwnerRestaurantListItem>> {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<OwnerRestaurantListItem>>>("/restaurants", {
    params: compactParams(query),
  })
  return unwrapResponseData(response)
}

export async function getRestaurantDetail(restaurantId: string): Promise<Restaurant | RestaurantStaffDetail> {
  const response = await apiClient.get<ApiSuccessResponse<Restaurant | RestaurantStaffDetail>>(`/restaurants/${restaurantId}`)
  return unwrapResponseData(response)
}

export async function updateRestaurant(restaurantId: string, payload: UpdateRestaurantPayload): Promise<UpdateOperationResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOperationResponse>>(`/restaurants/${restaurantId}`, payload)
  return unwrapResponseData(response)
}

export async function updateRestaurantHours(
  restaurantId: string,
  payload: UpdateRestaurantHoursPayload
): Promise<UpdateOperationResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOperationResponse>>(
    `/restaurants/${restaurantId}/hours`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantFinancial(
  restaurantId: string,
  payload: UpdateRestaurantFinancialPayload
): Promise<UpdateOperationResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOperationResponse>>(
    `/restaurants/${restaurantId}/financial`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantSettings(
  restaurantId: string,
  payload: UpdateRestaurantSettingsPayload
): Promise<UpdateRestaurantSettingsResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateRestaurantSettingsResponse>>(
    `/restaurants/${restaurantId}/settings`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantPublishStatus(
  restaurantId: string,
  payload: UpdateRestaurantPublishPayload
): Promise<UpdatePublishStatusResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdatePublishStatusResponse>>(
    `/restaurants/${restaurantId}/publish`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantOnlineOrders(
  restaurantId: string,
  payload: UpdateRestaurantOnlineOrdersPayload
): Promise<UpdateOnlineOrdersResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOnlineOrdersResponse>>(
    `/restaurants/${restaurantId}/online-orders`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantLogo(
  restaurantId: string,
  payload: UpdateRestaurantLogoPayload
): Promise<UpdateRestaurantLogoResponse> {
  const response = await apiClient.put<ApiSuccessResponse<UpdateRestaurantLogoResponse>>(`/restaurants/${restaurantId}/logo`, payload)
  return unwrapResponseData(response)
}

export async function updateRestaurantCover(
  restaurantId: string,
  payload: UpdateRestaurantCoverPayload
): Promise<UpdateRestaurantCoverResponse> {
  const response = await apiClient.put<ApiSuccessResponse<UpdateRestaurantCoverResponse>>(`/restaurants/${restaurantId}/cover`, payload)
  return unwrapResponseData(response)
}

export async function addRestaurantGalleryImage(
  restaurantId: string,
  payload: AddRestaurantGalleryImagePayload
): Promise<RestaurantGalleryResponse> {
  const response = await apiClient.post<ApiSuccessResponse<RestaurantGalleryResponse>>(
    `/restaurants/${restaurantId}/gallery`,
    payload
  )
  return unwrapResponseData(response)
}

export async function removeRestaurantGalleryImage(restaurantId: string, index: number): Promise<RestaurantGalleryResponse> {
  const response = await apiClient.delete<ApiSuccessResponse<RestaurantGalleryResponse>>(
    `/restaurants/${restaurantId}/gallery/${index}`
  )
  return unwrapResponseData(response)
}

export async function deleteRestaurant(restaurantId: string): Promise<DeleteRestaurantResponse> {
  const response = await apiClient.delete<ApiSuccessResponse<DeleteRestaurantResponse>>(`/restaurants/${restaurantId}`)
  return unwrapResponseData(response)
}

export async function searchPublicRestaurants(
  query: PublicRestaurantsSearchQuery
): Promise<PaginatedResponse<PublicRestaurantSearchItem>> {
  const params = new URLSearchParams()

  const appendParam = (key: string, value: string | number | boolean | null | undefined) => {
    if (value === undefined || value === null) return
    params.append(key, String(value))
  }

  const appendArrayParam = (key: string, value: Array<string | number | boolean> | undefined) => {
    if (!value?.length) return
    for (const item of value) {
      params.append(key, String(item))
    }
  }

  appendParam("city", query.city)
  appendParam("cuisine_type", query.cuisine_type)
  appendArrayParam("price_range", query.price_range)
  appendParam("accepts_online", query.accepts_online)
  appendParam("lat", query.lat)
  appendParam("lng", query.lng)
  appendParam("radius_km", query.radius_km)
  appendParam("q", query.q)
  appendParam("sort", query.sort)
  appendParam("page", query.page)
  appendParam("limit", query.limit)

  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<PublicRestaurantSearchItem>>>(
    "/public/restaurants",
    {
      params,
    }
  )
  return unwrapResponseData(response)
}

export async function getPublicRestaurantBySlug(slug: string): Promise<PublicRestaurantDetail> {
  const response = await apiClient.get<ApiSuccessResponse<PublicRestaurantDetail>>(`/public/restaurants/${slug}`)
  return unwrapResponseData(response)
}
