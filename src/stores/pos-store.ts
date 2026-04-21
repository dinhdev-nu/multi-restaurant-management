import { create } from 'zustand';

export type POSSection = 'main-pos' | 'table' | 'payment' | 'order' | 'menu' | 'staff';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status?: string;
  note?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  table?: string;
  staff?: string;
  items?: OrderItem[];
  total?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  createdAt?: string;
  expiredAt?: string;
  customer?: { name: string; contact?: string };
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  stock_quantity?: number;
  status?: 'available' | 'unavailable';
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface POSState {
  isOperational: boolean;
  activeSection: POSSection;

  categories: Category[];
  menuItems: MenuItem[];

  cartItems: CartItem[];
  orderNumber: string | null;
  selectedTable: string | null;
  selectedStaff: string | null;
  draftOrderId: string | null;
  draftCustomerInfo: { name: string } | null;
  isCreatingOrder: boolean;

  customerOrders: Order[];

  // Actions
  toggleOperational: () => void;
  setActiveSection: (section: POSSection) => void;

  setCartItems: (items: CartItem[]) => void;
  addToCart: (item: MenuItem | { _id: string; name: string; price: number; icon?: string }) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clearCart: () => void;
  
  setSelectedTable: (table: string | null) => void;
  setSelectedStaff: (staff: string | null) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  isOperational: true,
  activeSection: 'main-pos',

  categories: [],
  menuItems: [],

  cartItems: [],
  orderNumber: null,
  selectedTable: null,
  selectedStaff: null,
  draftOrderId: null,
  draftCustomerInfo: null,
  isCreatingOrder: false,

  customerOrders: [],

  toggleOperational: () => set((state) => ({ isOperational: !state.isOperational })),
  setActiveSection: (section) => set({ activeSection: section }),

  setCartItems: (items) => set({ cartItems: items }),
  addToCart: (item) => set((state) => {
    const existing = state.cartItems.find(i => i._id === item._id);
    if (existing) {
      return {
        cartItems: state.cartItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return {
      cartItems: [
        ...state.cartItems,
        {
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          note: ''
        }
      ]
    };
  }),
  updateQuantity: (id, qty) => set((state) => ({
    cartItems: state.cartItems.map(i => i._id === id ? { ...i, quantity: qty } : i)
  })),
  removeItem: (id) => set((state) => ({
    cartItems: state.cartItems.filter(i => i._id !== id)
  })),
  updateNote: (id, note) => set((state) => ({
    cartItems: state.cartItems.map(i => i._id === id ? { ...i, note } : i)
  })),
  clearCart: () => set({ cartItems: [] }),

  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
}));
