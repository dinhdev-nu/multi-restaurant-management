import { apiClient, unwrapResponseData } from './client';
import { toAppError } from './error';
import type { ApiSuccessResponse, AppError } from './types';
import type {
  Order,
  CreatePosOrderPayload,
  ListOrdersQuery,
  OrderListResponse,
  AddOrderItemsPayload,
  AddOrderItemsResponse,
  UpdateOrderItemPayload,
  UpdateOrderItemResponse,
  CancelOrderItemPayload,
  CancelOrderItemResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
  UpdateOrderItemStatusPayload,
  UpdateOrderItemStatusResponse,
  UpdateOrderDiscountPayload,
  UpdateOrderDiscountResponse,
  CancelOrderPayload,
  CancelOrderResponse,
  ActiveOrderResponse,
  CreatePublicOrderPayload,
  CreatePublicOrderResponse,
} from '@/types/order-type';

export type OrderApiEndpoint =
  | 'create'
  | 'create-public'
  | 'list'
  | 'detail'
  | 'add-items'
  | 'update-item'
  | 'cancel-item'
  | 'update-status'
  | 'update-item-status'
  | 'update-discount'
  | 'cancel'
  | 'active-by-table';

const ORDER_ENDPOINT_FALLBACK_MESSAGE: Record<OrderApiEndpoint, string> = {
  create: 'Không thể tạo đơn hàng',
  'create-public': 'Không thể tạo đơn hàng công khai',
  list: 'Không thể tải danh sách đơn hàng',
  detail: 'Không thể tải chi tiết đơn hàng',
  'add-items': 'Không thể thêm món vào đơn hàng',
  'update-item': 'Không thể cập nhật món trong đơn hàng',
  'cancel-item': 'Không thể hủy món trong đơn hàng',
  'update-status': 'Không thể cập nhật trạng thái đơn hàng',
  'update-item-status': 'Không thể cập nhật trạng thái món',
  'update-discount': 'Không thể cập nhật giảm giá đơn hàng',
  cancel: 'Không thể hủy đơn hàng',
  'active-by-table': 'Không thể lấy đơn hàng đang hoạt động của bàn',
};

function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
  ) as Partial<T>;
}

export function toOrderEndpointError(endpoint: OrderApiEndpoint, error: unknown): AppError {
  return toAppError(error, ORDER_ENDPOINT_FALLBACK_MESSAGE[endpoint]);
}

export async function createPosOrder(restaurantId: string, payload: CreatePosOrderPayload): Promise<Order> {
  const response = await apiClient.post<ApiSuccessResponse<Order>>(`/restaurants/${restaurantId}/orders`, payload);
  return unwrapResponseData(response);
}

export async function listOrders(restaurantId: string, query: ListOrdersQuery = {}): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiSuccessResponse<OrderListResponse>>(`/restaurants/${restaurantId}/orders`, {
    params: compactParams(query),
  });
  return unwrapResponseData(response);
}

export async function getOrderDetail(restaurantId: string, orderId: string): Promise<Order> {
  const response = await apiClient.get<ApiSuccessResponse<Order>>(`/restaurants/${restaurantId}/orders/${orderId}`);
  return unwrapResponseData(response);
}

export async function addOrderItems(restaurantId: string, orderId: string, payload: AddOrderItemsPayload): Promise<AddOrderItemsResponse> {
  const response = await apiClient.post<ApiSuccessResponse<AddOrderItemsResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/items`, payload);
  return unwrapResponseData(response);
}

export async function updateOrderItem(restaurantId: string, orderId: string, itemId: string, payload: UpdateOrderItemPayload): Promise<UpdateOrderItemResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOrderItemResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/items/${itemId}`, payload);
  return unwrapResponseData(response);
}

export async function cancelOrderItem(restaurantId: string, orderId: string, itemId: string, payload: CancelOrderItemPayload): Promise<CancelOrderItemResponse> {
  const response = await apiClient.delete<ApiSuccessResponse<CancelOrderItemResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/items/${itemId}`, { data: payload });
  return unwrapResponseData(response);
}

export async function updateOrderStatus(restaurantId: string, orderId: string, payload: UpdateOrderStatusPayload): Promise<UpdateOrderStatusResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOrderStatusResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/status`, payload);
  return unwrapResponseData(response);
}

export async function updateOrderItemStatus(restaurantId: string, orderId: string, itemId: string, payload: UpdateOrderItemStatusPayload): Promise<UpdateOrderItemStatusResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOrderItemStatusResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/items/${itemId}/status`, payload);
  return unwrapResponseData(response);
}

export async function updateOrderDiscount(restaurantId: string, orderId: string, payload: UpdateOrderDiscountPayload): Promise<UpdateOrderDiscountResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<UpdateOrderDiscountResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/discount`, payload);
  return unwrapResponseData(response);
}

export async function cancelOrder(restaurantId: string, orderId: string, payload: CancelOrderPayload): Promise<CancelOrderResponse> {
  const response = await apiClient.patch<ApiSuccessResponse<CancelOrderResponse>>(`/restaurants/${restaurantId}/orders/${orderId}/cancel`, payload);
  return unwrapResponseData(response);
}

export async function getActiveOrderByTable(restaurantId: string, tableId: string): Promise<ActiveOrderResponse> {
  const response = await apiClient.get<ApiSuccessResponse<ActiveOrderResponse>>(`/restaurants/${restaurantId}/tables/${tableId}/active-order`);
  return unwrapResponseData(response);
}

export async function createPublicOrder(payload: CreatePublicOrderPayload): Promise<CreatePublicOrderResponse> {
  const response = await apiClient.post<ApiSuccessResponse<CreatePublicOrderResponse>>('/public/orders', payload);
  return unwrapResponseData(response);
}
