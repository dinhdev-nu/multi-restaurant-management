export { default as Header } from "./components/Header"
export { default as MenuCategory } from "./components/MenuCategory"
export { default as MenuGrid } from "./components/MenuGrid"
export { default as OrderCart } from "./components/OrderCart"
export { default as OrdersDropdown } from "./components/OrdersDropdown"
export { default as QuickActions } from "./components/QuickActions"

export { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_RESTAURANT, DEFAULT_TABLE_OPTIONS } from "./mockData"

export type {
  NotificationType,
  OrderingNotification,
  OrderingCategory,
  OrderingMenuItem,
  CartItem,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CustomerOrder,
  OrderSummary,
  TableOption,
  OrderingUser,
} from "./types"
