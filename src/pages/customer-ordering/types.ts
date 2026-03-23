// ─── Shared domain types ──────────────────────────────────────────────────────

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  stock_quantity?: number;
  status?: 'available' | 'unavailable';
}

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface Order {
  _id: string;
  table: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  staff?: string;
  expiredAt?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface Notification {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  time: string;
  orderId?: string;
}

export interface User {
  _id: string;
  user_name: string;
  email: string;
  avatar?: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface QuickItem {
  _id: string;
  name: string;
  price: number;
  icon: string;
}
