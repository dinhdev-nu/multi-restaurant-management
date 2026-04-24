export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'online';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled' | 'refunded';
export type OrderPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'partially_refunded' | 'refunded';
export type OrderDiscountType = 'none' | 'percent' | 'fixed' | 'coupon';
export type OrderSource = 'pos' | 'online' | 'qr' | 'app' | 'phone';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderItem {
  _id?: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderItemStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Order {
  id?: string;
  _id: string;
  order_number: string;
  restaurant_id: string;
  table_id?: string | null;
  user_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  staff_id?: string | null;
  order_type: OrderType;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  items: OrderItem[];
  subtotal: number;
  discount_type: OrderDiscountType;
  discount_ref?: string | null;
  discount_value: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  total_amount: number;
  currency: string;
  source: OrderSource;
  notes?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemInputDto {
  menu_item_id: string;
  quantity: number;
  notes?: string | null;
}

export interface CreatePosOrderPayload {
  order_type: OrderType;
  source?: OrderSource;
  table_id?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  items?: OrderItemInputDto[];
}

export interface ListOrdersQuery {
  status?: OrderStatus;
  date?: string;
  table_id?: string;
  order_type?: OrderType;
  source?: OrderSource;
  payment_status?: OrderPaymentStatus;
  page?: number;
  limit?: number;
}

export interface OrderListItem {
  id: string;
  _id: string;
  order_number: string;
  order_type: OrderType;
  source: OrderSource;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  table_id?: string | null;
  customer_name?: string | null;
  total_amount: number;
  currency: string;
  item_count: number;
  created_at: string;
}

export interface OrderListResponse {
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: {
    total_orders: number;
    total_revenue: number;
  };
}

export interface AddOrderItemsPayload {
  items: OrderItemInputDto[];
}

export interface AddOrderItemsResponse {
  order_id: string;
  new_items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  total_amount: number;
}

export interface UpdateOrderItemPayload {
  quantity?: number;
  notes?: string | null;
}

export interface UpdateOrderItemResponse {
  unchanged?: boolean;
  item: OrderItem;
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  total_amount: number;
}

export interface CancelOrderItemPayload {
  cancel_reason?: string;
}

export interface CancelOrderItemResponse {
  item_id: string;
  status: OrderItemStatus;
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  total_amount: number;
}

export type AllowedOrderStatusUpdate = 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed';

export interface UpdateOrderStatusPayload {
  status: AllowedOrderStatusUpdate;
  staff_id?: string;
}

export interface UpdateOrderStatusResponse {
  unchanged?: boolean;
  id: string;
  order_number: string;
  status: OrderStatus;
  updated_at: string;
}

export type AllowedOrderItemStatusUpdate = 'preparing' | 'ready' | 'served' | 'cancelled';

export interface UpdateOrderItemStatusPayload {
  status: AllowedOrderItemStatusUpdate;
}

export interface UpdateOrderItemStatusResponse {
  item_id: string;
  status: OrderItemStatus;
  updated_at: string;
}

export interface UpdateOrderDiscountPayload {
  discount_type: OrderDiscountType;
  discount_value?: number;
  discount_ref?: string | null;
}

export interface UpdateOrderDiscountResponse {
  discount_type: OrderDiscountType;
  discount_ref?: string | null;
  discount_amount: number;
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  total_amount: number;
}

export interface CancelOrderPayload {
  cancel_reason: string;
}

export interface CancelOrderResponse {
  id: string;
  order_number: string;
  status: OrderStatus;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
}

export interface ActiveOrderResponse {
  order: Order | null;
}

export interface CreatePublicOrderPayload {
  restaurant_id: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_id?: string;
  source?: OrderSource;
  customer_name?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  items: OrderItemInputDto[];
}

export interface CreatePublicOrderResponse extends Order {
  message: string;
}
