import type { OrderingCategory, OrderingMenuItem, TableOption } from "./types"

export interface OrderingRestaurant {
  _id: string
  name: string
  restaurantName?: string
  logo?: string
  isOpen: boolean
}

export const DEFAULT_RESTAURANT: OrderingRestaurant = {
  _id: "demo-restaurant",
  name: "GiGi Energy Restaurant",
  restaurantName: "GiGi Energy Restaurant",
  logo: "/assets/images/restaurant_logo.png",
  isOpen: true,
}

export const DEFAULT_CATEGORIES: OrderingCategory[] = [
  { id: "cat1", name: "Đồ uống", icon: "Coffee" },
  { id: "cat2", name: "Khai vị", icon: "Soup" },
  { id: "cat3", name: "Món chính", icon: "UtensilsCrossed" },
  { id: "cat4", name: "Tráng miệng", icon: "IceCream" },
]

export const DEFAULT_MENU_ITEMS: OrderingMenuItem[] = [
  {
    _id: "item001",
    name: "Cà phê sữa đá",
    description: "Cà phê phin truyền thống với sữa đặc",
    price: 35000,
    category: "cat1",
    status: "available",
    stock_quantity: 15,
    image: "/assets/images/placeholder.png",
  },
  {
    _id: "item002",
    name: "Trà sữa trân châu",
    description: "Trà sữa Đài Loan với trân châu đen",
    price: 45000,
    category: "cat1",
    status: "available",
    stock_quantity: 7,
    image: "/assets/images/placeholder.png",
  },
  {
    _id: "item003",
    name: "Chả giò",
    description: "Chả giò chiên giòn kèm nước chấm",
    price: 55000,
    category: "cat2",
    status: "available",
    stock_quantity: 10,
    image: "/assets/images/placeholder.png",
  },
  {
    _id: "item004",
    name: "Bánh mì thịt",
    description: "Bánh mì giòn với nhân thịt và rau",
    price: 25000,
    category: "cat3",
    status: "unavailable",
    stock_quantity: 0,
    image: "/assets/images/placeholder.png",
  },
  {
    _id: "item005",
    name: "Cơm tấm sườn",
    description: "Sườn nướng than ăn kèm cơm tấm",
    price: 68000,
    category: "cat3",
    status: "available",
    stock_quantity: 12,
    image: "/assets/images/placeholder.png",
  },
  {
    _id: "item006",
    name: "Bánh flan",
    description: "Flan mềm mịn, caramel đậm vị",
    price: 22000,
    category: "cat4",
    status: "available",
    stock_quantity: 20,
    image: "/assets/images/placeholder.png",
  },
]

export const DEFAULT_TABLE_OPTIONS: TableOption[] = [
  { value: "table-01", label: "Tầng 1 - Bàn 01" },
  { value: "table-02", label: "Tầng 1 - Bàn 02" },
  { value: "table-03", label: "Tầng 1 - Bàn 03" },
  { value: "table-04", label: "Tầng 2 - Bàn 04" },
  { value: "table-vip-1", label: "VIP - Bàn 01" },
]
