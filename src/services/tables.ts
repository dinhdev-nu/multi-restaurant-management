import { apiClient, unwrapResponseData } from './client';
import { toAppError } from './error';
import type { ApiSuccessResponse, AppError } from './types';
import type {
  CreateTablePayload,
  DeleteTableResponse,
  PublicTableScanResponse,
  RegenerateTableQrResponse,
  TableDetailResponse,
  TableListResponse,
  TableQuery,
  TableRecord,
  ToggleTableActiveResponse,
  UpdateTablePayload,
  UpdateTableResponse,
  UpdateTableStatusPayload,
  UpdateTableStatusResponse,
} from '@/types/table-type';

export type TableApiEndpoint =
  | 'create'
  | 'list'
  | 'detail'
  | 'update'
  | 'update-status'
  | 'toggle-active'
  | 'regenerate-qr'
  | 'delete'
  | 'scan-public';

const TABLE_ENDPOINT_FALLBACK_MESSAGE: Record<TableApiEndpoint, string> = {
  create: 'Khong the tao ban',
  list: 'Khong the tai danh sach ban',
  detail: 'Khong the tai chi tiet ban',
  update: 'Khong the cap nhat ban',
  'update-status': 'Khong the cap nhat trang thai ban',
  'toggle-active': 'Khong the doi trang thai hoat dong cua ban',
  'regenerate-qr': 'Khong the tao QR moi cho ban',
  delete: 'Khong the xoa ban',
  'scan-public': 'Khong the quet QR ban',
};

function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    })
  ) as Partial<T>;
}

export function toTableEndpointError(endpoint: TableApiEndpoint, error: unknown): AppError {
  return toAppError(error, TABLE_ENDPOINT_FALLBACK_MESSAGE[endpoint]);
}

export async function createTable(restaurantId: string, payload: CreateTablePayload): Promise<TableRecord> {
  const response = await apiClient.post<ApiSuccessResponse<TableRecord>>(`/restaurants/${restaurantId}/tables`, payload);
  return unwrapResponseData(response);
}

export async function listTables(restaurantId: string, query: TableQuery = {}): Promise<TableListResponse> {
  const response = await apiClient.get<ApiSuccessResponse<TableListResponse>>(`/restaurants/${restaurantId}/tables`, {
    params: compactParams(query),
  });
  return unwrapResponseData(response);
}

export async function getTableDetail(restaurantId: string, tableId: string): Promise<TableDetailResponse> {
  const response = await apiClient.get<ApiSuccessResponse<TableDetailResponse>>(`/restaurants/${restaurantId}/tables/${tableId}`);
  return unwrapResponseData(response);
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  payload: UpdateTablePayload
): Promise<UpdateTableResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateTableResponse>>(
    `/restaurants/${restaurantId}/tables/${tableId}`,
    payload
  );
  return unwrapResponseData(response);
}

export async function updateTableStatus(
  restaurantId: string,
  tableId: string,
  payload: UpdateTableStatusPayload
): Promise<UpdateTableStatusResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateTableStatusResponse>>(
    `/restaurants/${restaurantId}/tables/${tableId}/status`,
    payload
  );
  return unwrapResponseData(response);
}

export async function toggleTableActive(restaurantId: string, tableId: string): Promise<ToggleTableActiveResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<ToggleTableActiveResponse>>(
    `/restaurants/${restaurantId}/tables/${tableId}/toggle`
  );
  return unwrapResponseData(response);
}

export async function regenerateTableQrCode(restaurantId: string, tableId: string): Promise<RegenerateTableQrResponse> {
  const response = await apiClient.post<ApiSuccessResponse<RegenerateTableQrResponse>>(
    `/restaurants/${restaurantId}/tables/${tableId}/qr`
  );
  return unwrapResponseData(response);
}

export async function deleteTable(restaurantId: string, tableId: string): Promise<DeleteTableResponse> {
  const response = await apiClient.delete<ApiSuccessResponse<DeleteTableResponse>>(
    `/restaurants/${restaurantId}/tables/${tableId}`
  );
  return unwrapResponseData(response);
}

export async function scanPublicTableByQrCode(qrCode: string): Promise<PublicTableScanResponse> {
  const response = await apiClient.get<ApiSuccessResponse<PublicTableScanResponse>>(`/public/tables/${qrCode}`);
  return unwrapResponseData(response);
}

export async function getPublicTableByQrCode(qrCode: string): Promise<PublicTableScanResponse> {
  return scanPublicTableByQrCode(qrCode);
}
