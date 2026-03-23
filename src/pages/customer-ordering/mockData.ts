import type { Category, MenuItem, Order, User, QuickItem } from './types';

export const MOCK_USER: User = {
  _id: 'u1',
  user_name: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  avatar: undefined,
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'all',       name: 'Tất cả',    icon: 'LayoutGrid' },
  { id: 'food',      name: 'Đồ ăn',     icon: 'UtensilsCrossed' },
  { id: 'drink',     name: 'Đồ uống',   icon: 'GlassWater' },
  { id: 'dessert',   name: 'Tráng miệng', icon: 'IceCream' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  { _id: 'm1', name: 'Phở bò đặc biệt', price: 65000, category: 'food',    stock_quantity: 20, status: 'available',   description: 'Nước dùng hầm xương 24h' },
  { _id: 'm2', name: 'Bún bò Huế',      price: 55000, category: 'food',    stock_quantity: 15, status: 'available',   description: 'Cay vừa, đậm đà' },
  { _id: 'm3', name: 'Cơm tấm sườn',    price: 50000, category: 'food',    stock_quantity: 0,  status: 'unavailable', description: 'Sườn nướng than hoa' },
  { _id: 'm4', name: 'Bánh mì thịt',    price: 35000, category: 'food',    stock_quantity: 30, status: 'available',   description: 'Giòn, đầy nhân' },
  { _id: 'm5', name: 'Trà đào cam sả',  price: 45000, category: 'drink',   stock_quantity: 4,  status: 'available',   description: 'Vị chua ngọt thanh mát' },
  { _id: 'm6', name: 'Cà phê sữa đá',   price: 30000, category: 'drink',   stock_quantity: 25, status: 'available',   description: 'Cà phê Arabica' },
  { _id: 'm7', name: 'Sinh tố xoài',    price: 40000, category: 'drink',   stock_quantity: 10, status: 'available',   description: 'Xoài cát Hòa Lộc' },
  { _id: 'm8', name: 'Chè thái',        price: 30000, category: 'dessert', stock_quantity: 12, status: 'available',   description: 'Nhiều topping' },
];

export const MOCK_DRAFT_ORDERS: Order[] = [
  {
    _id: '66a1b2c3d4e5f6a7b8c9d001',
    table: 'Bàn 3',
    status: 'pending',
    paymentStatus: 'unpaid',
    items: [
      { name: 'Phở bò đặc biệt', quantity: 2, price: 65000 },
      { name: 'Trà đào cam sả',  quantity: 2, price: 45000 },
    ],
    subtotal: 220000,
    discount: 0,
    tax: 22000,
    total: 242000,
    staff: 'Trần Thị B',
    expiredAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const MOCK_CONFIRMED_ORDERS: Order[] = [
  {
    _id: '66a1b2c3d4e5f6a7b8c9d002',
    table: 'Bàn 1',
    status: 'processing',
    paymentStatus: 'unpaid',
    items: [
      { name: 'Cơm tấm sườn', quantity: 1, price: 50000 },
      { name: 'Cà phê sữa đá', quantity: 1, price: 30000 },
    ],
    subtotal: 80000,
    discount: 0,
    tax: 8000,
    total: 88000,
    staff: 'Lê Văn C',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

export const TABLE_OPTIONS = [
  { value: 'takeaway',  label: '🥡 Mang đi' },
  { value: 'delivery',  label: '🚚 Giao hàng' },
  { value: 'table-1',   label: 'Bàn 1' },
  { value: 'table-2',   label: 'Bàn 2' },
  { value: 'table-3',   label: 'Bàn 3' },
  { value: 'table-4',   label: 'Bàn 4' },
  { value: 'table-5',   label: 'Bàn 5' },
];

export const QUICK_ADD_ITEMS: QuickItem[] = [
  { _id: 'water',  name: 'Nước suối', price: 10000, icon: 'Droplets'    },
  { _id: 'tissue', name: 'Khăn giấy', price: 5000,  icon: 'Package'     },
  { _id: 'bag',    name: 'Túi nilon', price: 2000,  icon: 'ShoppingBag' },
];
