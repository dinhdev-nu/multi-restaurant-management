import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PosTables } from '@/types/pos-init-type';
import type { StaffSummary } from '@/types/staff-type';

export type POSSection = 'main-pos' | 'table' | 'payment' | 'order' | 'menu' | 'staff';

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
  tables: PosTables | null;
  menuCategories: Category[];
  menuItems: MenuItem[];
  staffs: StaffSummary[];

  setTables: (tables: PosTables) => void;
  setMenuCategories: (categories: Category[]) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setStaffs: (staffs: StaffSummary[]) => void;
}

const POS_STORAGE_KEY = 'pos_store';

const createEmptyTables = (): PosTables => ({
  total: [],
  available: [],
  occupied: [],
  reserved: [],
  cleaning: [],
  inactive: [],
});

function normalizeTables(tables: unknown): PosTables {
  if (!tables || typeof tables !== 'object') {
    return createEmptyTables();
  }

  const candidate = tables as Record<string, unknown>;
  return {
    total: Array.isArray(candidate.total) ? candidate.total : [],
    available: Array.isArray(candidate.available) ? candidate.available : [],
    occupied: Array.isArray(candidate.occupied) ? candidate.occupied : [],
    reserved: Array.isArray(candidate.reserved) ? candidate.reserved : [],
    cleaning: Array.isArray(candidate.cleaning) ? candidate.cleaning : [],
    inactive: Array.isArray(candidate.inactive) ? candidate.inactive : [],
  };
}

export const usePOSStore = create<POSState>()(
  persist(
    (set) => ({
      tables: null,
      menuCategories: [],
      menuItems: [],
      staffs: [],

      setTables: (tables) => set({ tables: normalizeTables(tables) }),
      setMenuCategories: (menuCategories) => set({ menuCategories }),
      setMenuItems: (menuItems) => set({ menuItems }),
      setStaffs: (staffs) => set({ staffs }),
    }),
    {
      name: POS_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
        menuCategories: state.menuCategories,
        menuItems: state.menuItems,
        staffs: state.staffs,
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return { tables: null, menuCategories: [], menuItems: [], staffs: [] };
        }

        const state = persistedState as Record<string, unknown>;
        return {
          tables: state.tables ? normalizeTables(state.tables) : null,
          menuCategories: Array.isArray(state.menuCategories) ? state.menuCategories : [],
          menuItems: Array.isArray(state.menuItems) ? state.menuItems : [],
          staffs: Array.isArray(state.staffs) ? state.staffs : [],
        };
      },
    }
  )
);
