import { apiClient, unwrapResponseData } from "./client"
import { toAppError } from "./error"
import type { ApiSuccessResponse, AppError } from "./types"
import type {
  CreateStaffPayload,
  CreateStaffResponseData,
  DeleteStaffResponseData,
  ListStaffQuery,
  ListStaffResponseData,
  StaffApiEndpoint,
  StaffApiErrorCode,
  StaffDetail,
  UpdateStaffAvatarPayload,
  UpdateStaffAvatarResponseData,
  UpdateStaffInfoPayload,
  UpdateStaffInfoResponseData,
  UpdateStaffLinkAccountPayload,
  UpdateStaffLinkAccountResponseData,
  UpdateStaffPermissionsPayload,
  UpdateStaffPermissionsResponseData,
  UpdateStaffStatusPayload,
  UpdateStaffStatusResponseData,
} from "@/types/staff-type"

const STAFF_ENDPOINT_FALLBACK_MESSAGE: Record<StaffApiEndpoint, string> = {
  create: "Khong the tao nhan vien",
  list: "Khong the tai danh sach nhan vien",
  detail: "Khong the tai chi tiet nhan vien",
  "update-info": "Khong the cap nhat thong tin nhan vien",
  "update-status": "Khong the cap nhat trang thai nhan vien",
  "link-account": "Khong the lien ket tai khoan nhan vien",
  "update-permissions": "Khong the cap nhat quyen nhan vien",
  "update-avatar": "Khong the cap nhat avatar nhan vien",
  delete: "Khong the xoa nhan vien",
}

const STAFF_ERROR_MESSAGE_BY_CODE: Record<StaffApiErrorCode, string> = {
  INVALID_ID_ERROR: "ID nha hang hoac ID nhan vien khong hop le",
  VALIDATION_ERROR: "Du lieu gui len khong hop le",
  UNAUTHORIZED: "Phien dang nhap khong hop le",
  TOKEN_EXPIRED: "Phien dang nhap da het han",
  FORBIDDEN: "Ban khong co quyen thuc hien hanh dong nay",
  RESOURCE_NOT_FOUND: "Khong tim thay tai nguyen staff",
  USER_NOT_FOUND: "Khong tim thay tai khoan nguoi dung lien ket",
  CONFLICT_ERROR: "Du lieu staff bi xung dot",
  TOO_MANY_REQUESTS: "Ban thao tac qua nhanh, vui long thu lai sau",
  INTERNAL_ERROR: "He thong gap loi noi bo",
}

const STAFF_ENDPOINT_ERROR_OVERRIDES: Partial<Record<StaffApiEndpoint, Partial<Record<StaffApiErrorCode, string>>>> = {
  create: {
    CONFLICT_ERROR: "Ma nhan vien hoac tai khoan lien ket da ton tai trong nha hang",
  },
  "link-account": {
    CONFLICT_ERROR: "Tai khoan moi da duoc lien ket voi nhan vien khac",
  },
  delete: {
    CONFLICT_ERROR: "Nhan vien dang phu trach don active, khong the xoa",
  },
}

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

function resolveStaffErrorMessage(endpoint: StaffApiEndpoint, appError: AppError): string {
  const code = appError.errorCode as StaffApiErrorCode | undefined
  if (!code) {
    return appError.message
  }

  const override = STAFF_ENDPOINT_ERROR_OVERRIDES[endpoint]?.[code]
  if (override) {
    return override
  }

  return STAFF_ERROR_MESSAGE_BY_CODE[code] ?? appError.message
}

export function toStaffEndpointError(endpoint: StaffApiEndpoint, error: unknown): AppError {
  const appError = toAppError(error, STAFF_ENDPOINT_FALLBACK_MESSAGE[endpoint])
  return {
    ...appError,
    message: resolveStaffErrorMessage(endpoint, appError),
  }
}

export async function createRestaurantStaff(
  restaurantId: string,
  payload: CreateStaffPayload
): Promise<CreateStaffResponseData> {
  const response = await apiClient.post<ApiSuccessResponse<CreateStaffResponseData>>(
    `/restaurants/${restaurantId}/staff`,
    payload
  )
  return unwrapResponseData(response)
}

export async function listRestaurantStaff(
  restaurantId: string,
  query: ListStaffQuery = {}
): Promise<ListStaffResponseData> {
  const response = await apiClient.get<ApiSuccessResponse<ListStaffResponseData>>(`/restaurants/${restaurantId}/staff`, {
    params: compactParams(query),
  })
  return unwrapResponseData(response)
}

export async function getRestaurantStaffDetail(
  restaurantId: string,
  staffId: string
): Promise<StaffDetail> {
  const response = await apiClient.get<ApiSuccessResponse<StaffDetail>>(`/restaurants/${restaurantId}/staff/${staffId}`)
  return unwrapResponseData(response)
}

export async function updateRestaurantStaffInfo(
  restaurantId: string,
  staffId: string,
  payload: UpdateStaffInfoPayload
): Promise<UpdateStaffInfoResponseData> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateStaffInfoResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantStaffStatus(
  restaurantId: string,
  staffId: string,
  payload: UpdateStaffStatusPayload
): Promise<UpdateStaffStatusResponseData> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateStaffStatusResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}/status`,
    payload
  )
  return unwrapResponseData(response)
}

export async function linkRestaurantStaffAccount(
  restaurantId: string,
  staffId: string,
  payload: UpdateStaffLinkAccountPayload
): Promise<UpdateStaffLinkAccountResponseData> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateStaffLinkAccountResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}/link-account`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantStaffPermissions(
  restaurantId: string,
  staffId: string,
  payload: UpdateStaffPermissionsPayload
): Promise<UpdateStaffPermissionsResponseData> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateStaffPermissionsResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}/permissions`,
    payload
  )
  return unwrapResponseData(response)
}

export async function updateRestaurantStaffAvatar(
  restaurantId: string,
  staffId: string,
  payload: UpdateStaffAvatarPayload
): Promise<UpdateStaffAvatarResponseData> {
  const response = await apiClient.put<ApiSuccessResponse<UpdateStaffAvatarResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}/avatar`,
    payload
  )
  return unwrapResponseData(response)
}

export async function deleteRestaurantStaff(
  restaurantId: string,
  staffId: string
): Promise<DeleteStaffResponseData> {
  const response = await apiClient.delete<ApiSuccessResponse<DeleteStaffResponseData>>(
    `/restaurants/${restaurantId}/staff/${staffId}`
  )
  return unwrapResponseData(response)
}
