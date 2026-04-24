export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'inactive';

export interface TableIdentity {
  _id: string;
  id?: string;
}

export interface TableRecord extends TableIdentity {
  restaurant_id: string;
  table_number: string;
  name: string | null;
  capacity: number;
  status: TableStatus;
  qr_code: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableListItem extends TableIdentity {
  table_number: string;
  name: string | null;
  capacity: number;
  status: TableStatus;
  is_active: boolean;
  has_qr: boolean;
  notes?: string | null;
}

export interface TableDetailOwner extends TableIdentity {
  restaurant_id: string;
  table_number: string;
  name: string | null;
  capacity: number;
  status: TableStatus;
  is_active: boolean;
  qr_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableDetailStaff extends TableIdentity {
  restaurant_id: string;
  table_number: string;
  name: string | null;
  capacity: number;
  status: TableStatus;
  is_active: boolean;
  has_qr: boolean;
  created_at: string;
  updated_at: string;
}

export type TableDetailResponse = TableDetailOwner | TableDetailStaff;

export interface TableQuery {
  status?: TableStatus;
  is_active?: boolean;
  capacity_min?: number;
  capacity_max?: number;
}

export interface CreateTablePayload {
  table_number: string;
  capacity: number;
  name?: string | null;
  notes?: string | null;
}

export interface UpdateTablePayload {
  table_number?: string;
  capacity?: number;
  name?: string | null;
  notes?: string | null;
}

export interface UpdateTableStatusPayload {
  status: TableStatus;
}

export interface UpdateTableResponse {
  updated: true;
  table: TableRecord;
}

export type UpdateTableStatusResponse =
  | { unchanged: true }
  | {
      unchanged: false;
      table: Pick<TableRecord, 'restaurant_id' | 'table_number' | 'status' | 'updated_at'>;
    };

export interface ToggleTableActiveResponse {
  restaurant_id: string;
  table_number: string;
  is_active: boolean;
  updated_at: string;
}

export interface RegenerateTableQrResponse {
  table_id: string;
  qr_code: string;
  qr_url: string;
  updated_at: string;
}

export interface DeleteTableResponse {
  message: string;
}

export interface TableListResponse {
  data: TableListItem[];
  total: number;
}

export interface PublicTableRestaurantSummary {
  id?: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface PublicTableScanResponse {
  table_id: string;
  table_number: string;
  name: string | null;
  capacity: number;
  status: TableStatus;
  restaurant: PublicTableRestaurantSummary;
  menu_url: string;
}
