import type { UserProfile } from "@/lib/api/types"

export type NotificationType = "success" | "warning" | "error" | "info"

export interface OrderingNotification {
  id: number
  type: NotificationType
  message: string
  time: string
  orderId?: string
}

export interface OrderingCategory {
  id: string
  name: string
  icon?: string
}

export interface OrderingMenuItem {
  _id: string
  name: string
  price: number
  category: string
  image?: string
  description?: string
  stock_quantity?: number
  status?: "available" | "unavailable"
  icon?: string
}

export interface CartItem extends OrderingMenuItem {
  quantity: number
  note?: string
}

export interface OrderItem {
  itemId?: string
  name: string
  quantity: number
  price: number
  note?: string
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled"
export type PaymentStatus = "unpaid" | "paid" | "refunded"

export interface CustomerOrder {
  _id: string
  orderNumber?: string
  table: string
  staff?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  timestamp: string
  createdAt?: string
  expiredAt?: string
  customer?: {
    customerId?: string
    name: string
    contact?: string
  }
}

export interface OrderSummary {
  subtotal: number
  discount: number
  tax: number
  total: number
}

export interface TableOption {
  value: string
  label: string
}

export type OrderingUser = UserProfile & {
  user_name?: string
  avatar?: string | null
}
