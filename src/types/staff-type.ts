export type StaffPosition = "manager" | "cashier" | "waiter" | "kitchen" | "delivery"

export type StaffStatus = "active" | "inactive" | "on_leave" | "terminated"

export interface StaffPermissions {
  can_discount: boolean
  can_cancel_order: boolean
  can_process_payment: boolean
  can_refund: boolean
  can_view_reports: boolean
  can_manage_tables: boolean
  can_manage_menu: boolean
}

export interface StaffSummary {
  id: string
  employee_code: string
  full_name: string
  phone?: string | null
  email?: string | null
  position: StaffPosition
  status: StaffStatus
  hire_date: string
  avatar_url: string | null
  user_id: string
  created_at: string
}

export interface StaffDetail {
  _id: string
  restaurant_id: string
  user_id: string
  employee_code: string
  full_name: string
  phone: string | null
  email: string | null
  position: StaffPosition
  hire_date: string
  avatar_url: string | null
  status: StaffStatus
  permissions?: StaffPermissions
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface StaffPaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ListStaffResponseData {
  data: StaffSummary[]
  pagination: StaffPaginationMeta
}

export interface CreateStaffPayload {
  user_id: string
  employee_code: string
  full_name: string
  position: StaffPosition
  hire_date: string
  phone?: string
  email?: string
  status?: StaffStatus
  avatar_url?: string
}

export interface CreateStaffResponseData {
  id: string
  employee_code: string
  full_name: string
  email: string | null
  phone: string | null
  position: StaffPosition
  hire_date: string
  status: StaffStatus
  user_id: string
  created_at: string
}

export interface ListStaffQuery {
  status?: StaffStatus
  position?: StaffPosition
  page?: number
  limit?: number
}

export interface UpdateStaffInfoPayload {
  full_name?: string
  position?: StaffPosition
  hire_date?: string
  phone?: string
  email?: string
}

export interface UpdateStaffInfoResponseData {
  updated: boolean
  staff: StaffSummary & {
    phone: string | null
    email: string | null
    updated_at: string
    permissions: StaffPermissions
  }
}

export interface UpdateStaffStatusPayload {
  status: StaffStatus
  reason?: string
}

export interface UpdateStaffStatusResponseData {
  unchanged: boolean
  status: StaffStatus
  warnings: string[]
}

export interface UpdateStaffLinkAccountPayload {
  user_id: string
}

export interface UpdateStaffLinkAccountResponseData {
  linked: boolean
  user_id: string
}

export interface UpdateStaffPermissionsPayload {
  can_discount?: boolean
  can_cancel_order?: boolean
  can_process_payment?: boolean
  can_refund?: boolean
  can_view_reports?: boolean
  can_manage_tables?: boolean
  can_manage_menu?: boolean
}

export interface UpdateStaffPermissionsResponseData {
  updated: boolean
  permissions: StaffPermissions
}

export interface UpdateStaffAvatarPayload {
  avatar_url: string
}

export interface UpdateStaffAvatarResponseData {
  avatar_url: string | null
}

export interface DeleteStaffResponseData {
  deleted: boolean
}

export type StaffApiEndpoint =
  | "create"
  | "list"
  | "detail"
  | "update-info"
  | "update-status"
  | "link-account"
  | "update-permissions"
  | "update-avatar"
  | "delete"

export type StaffApiErrorCode =
  | "INVALID_ID_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "CONFLICT_ERROR"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR"

export const STAFF_API_ERROR_CODES_BY_ENDPOINT: Record<StaffApiEndpoint, readonly StaffApiErrorCode[]> = {
  create: [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "USER_NOT_FOUND",
    "CONFLICT_ERROR",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  list: [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "INTERNAL_ERROR",
  ],
  detail: [
    "INVALID_ID_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "INTERNAL_ERROR",
  ],
  "update-info": [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  "update-status": [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  "link-account": [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "USER_NOT_FOUND",
    "CONFLICT_ERROR",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  "update-permissions": [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  "update-avatar": [
    "INVALID_ID_ERROR",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
  delete: [
    "INVALID_ID_ERROR",
    "UNAUTHORIZED",
    "TOKEN_EXPIRED",
    "FORBIDDEN",
    "RESOURCE_NOT_FOUND",
    "CONFLICT_ERROR",
    "TOO_MANY_REQUESTS",
    "INTERNAL_ERROR",
  ],
}
