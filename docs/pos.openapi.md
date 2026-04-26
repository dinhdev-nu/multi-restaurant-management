# POS API

GET /restaurants/{slug}/pos/init

## 1) Muc dich API

API khoi tao context cho man hinh POS theo restaurant slug.

API nay tra ve:
- Thong tin user dang dang nhap (tu JWT payload)
- Staff profile trong nha hang (chi co khi user khong phai owner/admin va co ban ghi staff hop le)
- Thong tin restaurant can thiet cho POS
- Danh sach ban duoc nhom theo tung trang thai

## 2) Endpoint

- Method: GET
- Path: /restaurants/{slug}/pos/init
- Auth: Bearer JWT (bat buoc)

## 3) Dau vao

### 3.1 Path params

- slug: string
  - Rule: slug format pipe (SlugValidationPipe)
  - Vi du: bep-nha-viet

### 3.2 Header

- Authorization: Bearer <access_token>

### 3.3 Du lieu noi bo tu guard/decorator

- CurrentUser() -> AccessTokenPayload
  - sub: ObjectId user
  - system_role: user | admin
  - jti: string
  - iat: number
  - exp: number

## 4) Luong xu ly va truy vet du lieu

### 4.1 Service va repository duoc su dung

- PosService.init(slug, user)
- restaurantRepository.getBySlug(slug)
- staffRepository.findByUserInRestaurant(restaurant._id, user.sub)
- tableRepository.listByRestaurant(restaurant._id)

### 4.2 Rule phan quyen

- Cho phep neu:
  - user la owner cua restaurant
  - hoac user co system_role = admin
  - hoac user co record staff active trong restaurant
- Tu choi 403 neu khong thoa 1 trong 3 dieu kien tren

## 5) Dau ra (response data)

Luu y: Toan bo response bi wrap boi TransformResponseInterceptor theo format chung:
- success: boolean
- statusCode: number
- message: string
- data: object
- correlationId: string
- timestamp: string (ISO datetime)

### 5.1 Cau truc data

- user: object
- staff: object | null
- restaurant: object
- tables: object

Chi tiet tung field duoc truy vet tu schema -> repo -> service nhu sau.

## 6) Truy vet field chi tiet

### 6.1 user

Nguon:
- Schema: khong query DB o API nay, lay truc tiep tu JWT payload
- Repo: khong su dung cho object user output
- Service: PosService.init

Fields:
- user.id: ObjectId (string serialize)
  - Nguon: user.sub
- user.system_role: "user" | "admin"
  - Nguon: user.system_role
- user.is_owner: boolean
  - Nguon: so sanh restaurant.owner_id voi user.sub
- user.is_admin: boolean
  - Nguon: user.system_role === "admin"

### 6.2 staff

Nguon:
- Schema: Staff (src/modules/restaurant/schemas/staff.schema.xxx.ts)
- Repo: staffRepository.findByUserInRestaurant
- Service: ObjectUtil.pick(staffRecord, ["_id","employee_code","full_name","phone","email","permissions","position"])

Kieu tong:
- staff: null | object

Khi staff khac null, fields:
- staff._id: ObjectId (string serialize)
- staff.employee_code: string
- staff.full_name: string
- staff.phone: string | null
- staff.email: string | null
- staff.position: "manager" | "cashier" | "waiter" | "kitchen" | "delivery"
- staff.permissions: object
  - can_discount: boolean
  - can_cancel_order: boolean
  - can_process_payment: boolean
  - can_refund: boolean
  - can_view_reports: boolean
  - can_manage_tables: boolean
  - can_manage_menu: boolean

### 6.3 restaurant

Nguon:
- Schema: Restaurant (src/modules/restaurant/schemas/restaurant.schema.xxx.ts)
- Repo: restaurantRepository.getBySlug(slug)
- Service: ObjectUtil.pick(restaurant, ["_id","name","slug","address","phone","timezone","currency","tax_rate","service_charge_rate","accepts_online_orders"])

Fields:
- restaurant._id: ObjectId (string serialize)
- restaurant.name: string
- restaurant.slug: string
- restaurant.address: string
- restaurant.phone: string | null
- restaurant.timezone: string
- restaurant.currency: string
- restaurant.tax_rate: number
- restaurant.service_charge_rate: number
- restaurant.accepts_online_orders: boolean

### 6.4 tables

Nguon:
- Schema: Table (src/modules/restaurant/schemas/table.schema.ts)
- Repo: tableRepository.listByRestaurant(restaurant._id)
- Service: group bang filter theo status trong PosService.init

Quan trong:
- tables.total KHONG phai number o ban hien tai.
- tables.total hien dang la mang TableDocument[] (toan bo ban), tuong tu available/occupied/... cung la mang.

Kieu:
- tables.total: TableRow[]
- tables.available: TableRow[]
- tables.occupied: TableRow[]
- tables.reserved: TableRow[]
- tables.cleaning: TableRow[]
- tables.inactive: TableRow[]

TableRow fields (theo Table schema + find().lean()):
- _id: ObjectId (string serialize)
- restaurant_id: ObjectId (string serialize)
- table_number: string
- name: string | null
- capacity: number
- status: "available" | "occupied" | "reserved" | "cleaning" | "inactive"
- qr_code: string | null
- notes: string | null
- is_active: boolean
- created_at: string (ISO datetime)
- updated_at: string (ISO datetime)

## 7) Chi tiet loi trong qua trinh API

### 7.1 Loi validation slug

- **HTTP Status**: 400 Bad Request
- **Error Code**: VALIDATION_007 (INVALID_SLUG_FORMAT)
- **Message**: "Slug khong hop le format"
- **Nguyen nhan**: Slug param khong match pattern regex (SlugValidationPipe)
- **Khi nao xay ra**: Client truyen slug co ky tu dac biet, khoang trang, chu hoa, v.v.
- **Response body**:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Slug khong hop le format",
    "data": null,
    "correlationId": "...",
    "timestamp": "2026-04-25T10:00:00.000Z"
  }
  ```

### 7.2 Loi xac thuc (Missing/Invalid Bearer Token)

- **HTTP Status**: 401 Unauthorized
- **Error Code**: AUTH_001 (UNAUTHORIZED)
- **Message**: "Vui long dang nhap de tiep tuc"
- **Nguyen nhan**: 
  - Client khong gui Authorization header
  - Token bi sai (invalid signature, expired, malformed)
  - JWT payload khong hop le
- **Khi nao xay ra**:
  - GET /restaurants/bep-nha-viet/pos/init (khong co header)
  - Header: Authorization: Bearer invalid_token
- **Response body**:
  ```json
  {
    "success": false,
    "statusCode": 401,
    "message": "Vui long dang nhap de tiep tuc",
    "data": null,
    "correlationId": "...",
    "timestamp": "2026-04-25T10:00:00.000Z"
  }
  ```

### 7.3 Loi: Khong tim thay nha hang theo slug

- **HTTP Status**: 404 Not Found
- **Error Code**: RESTAURANT_NOT_FOUND (NOTFOUND_004)
- **Message**: "Khong tim thay nha hang"
- **Nguon loi**: PosService.init() -> restaurantRepository.getBySlug(slug)
- **Nguyen nhan**:
  - Slug khong ton tai trong database
  - Nha hang da bi soft delete (deleted_at != null)
- **Khi nao xay ra**:
  - GET /restaurants/nha-hang-ko-ton-tai/pos/init
  - GET /restaurants/nha-hang-da-xoa/pos/init
- **Response body**:
  ```json
  {
    "success": false,
    "statusCode": 404,
    "message": "Khong tim thay nha hang",
    "data": null,
    "correlationId": "...",
    "timestamp": "2026-04-25T10:00:00.000Z"
  }
  ```

### 7.4 Loi: User khong co quyen truy cap POS

- **HTTP Status**: 403 Forbidden
- **Error Code**: FORBIDDEN (AUTH_002)
- **Message**: "Ban khong co quyen truy cap POS cua nha hang nay"
- **Nguon loi**: PosService.init() -> quyen check
- **Nguyen nhan**: User khong thoa 3 dieu kien:
  1. Khong phai owner cua nha hang (restaurant.owner_id != user.sub)
  2. Khong phai admin (user.system_role != "admin")
  3. Khong co record staff active trong nha hang, hoac:
     - Khong tim thay staff record
     - Staff record bi soft delete (deleted_at != null)
     - Staff status != "active"
- **Khi nao xay ra**:
  - User binh thuong (khong phai owner/admin) va khong la nhan vien cua nha hang
  - GET /restaurants/bep-nha-viet/pos/init (Bearer token la user khong phai owner)
- **Response body**:
  ```json
  {
    "success": false,
    "statusCode": 403,
    "message": "Ban khong co quyen truy cap POS cua nha hang nay",
    "data": null,
    "correlationId": "...",
    "timestamp": "2026-04-25T10:00:00.000Z"
  }
  ```

### 7.5 Loi: Nhan vien khong o trang thai "active"

- **HTTP Status**: 403 Forbidden
- **Error Code**: FORBIDDEN (AUTH_002)
- **Message**: "Ban khong co quyen truy cap POS cua nha hang nay"
- **Nguon loi**: PosService.init() -> staff status check
- **Nguyen nhan**: User co record staff trong nha hang nhung:
  - status != "active" (co the la "inactive", "on_leave", "terminated")
- **Khi nao xay ra**:
  - GET /restaurants/bep-nha-viet/pos/init (user la staff nhung da bi khoa / chuyen di)
- **Response body**: Giong 7.4

### 7.6 Loi: Database query that bai

- **HTTP Status**: 500 Internal Server Error
- **Error Code**: INTERNAL_001 (INTERNAL_ERROR)
- **Message**: "Loi noi bo may chu"
- **Nguon loi**: Database connection error, query timeout, v.v.
- **Khi nao xay ra**:
  - MongoDB connection dat (connection pool full, network issue)
  - Query timeout khi query duong danh sach ban lon (neu listByRestaurant chay lau)
  - Replica set error
- **Response body**:
  ```json
  {
    "success": false,
    "statusCode": 500,
    "message": "Loi noi bo may chu",
    "data": null,
    "correlationId": "...",
    "timestamp": "2026-04-25T10:00:00.000Z"
  }
  ```

### 7.7 Bang tong ket loi

| HTTP Status | Error Code | Message | Nguyen nhan | Giai phap |
|-------------|-----------|---------|-----------|-----------|
| 400 | VALIDATION_007 | Slug khong hop le format | Slug param sai format | Validate slug format: ^[a-z0-9]+(?:-[a-z0-9]+)*$ |
| 401 | AUTH_001 | Vui long dang nhap de tiep tuc | Missing/invalid Bearer token | Them Authorization header voi Bearer token hop le |
| 404 | NOTFOUND_004 | Khong tim thay nha hang | Slug khong ton tai / nha hang da xoa | Kiem tra slug co ton tai, hoac restore nha hang |
| 403 | AUTH_002 | Ban khong co quyen truy cap POS cua nha hang nay | User khong phai owner/admin/staff | Login voi account hop le (owner/admin/staff active) |
| 500 | INTERNAL_001 | Loi noi bo may chu | Database error, network issue | Kiem tra database connection, thu lai |

## 9) Vi du response day du

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "user": {
      "id": "6650aa42b12c3d4e5f678900",
      "system_role": "user",
      "is_owner": false,
      "is_admin": false
    },
    "staff": {
      "_id": "6650aa42b12c3d4e5f678911",
      "employee_code": "EMP001",
      "full_name": "Nguyen Van B",
      "phone": "0901234567",
      "email": "staff@example.com",
      "position": "cashier",
      "permissions": {
        "can_discount": true,
        "can_cancel_order": true,
        "can_process_payment": true,
        "can_refund": false,
        "can_view_reports": false,
        "can_manage_tables": true,
        "can_manage_menu": false
      }
    },
    "restaurant": {
      "_id": "664f1a2b3c4d5e6f7a8b9001",
      "name": "Bep Nha Viet",
      "slug": "bep-nha-viet",
      "address": "123 Tran Hung Dao",
      "phone": "02812345678",
      "timezone": "Asia/Ho_Chi_Minh",
      "currency": "VND",
      "tax_rate": 0.1,
      "service_charge_rate": 0.01,
      "accepts_online_orders": true
    },
    "tables": {
      "total": [
        {
          "_id": "6650bb10b12c3d4e5f678101",
          "restaurant_id": "664f1a2b3c4d5e6f7a8b9001",
          "table_number": "A01",
          "name": "Ban cua so",
          "capacity": 4,
          "status": "available",
          "qr_code": "fd1de0b5-7f9b-4a2f-9f23-5a18fd2a2d9f",
          "notes": "Gan cua ra vao",
          "is_active": true,
          "created_at": "2026-04-25T10:00:00.000Z",
          "updated_at": "2026-04-25T10:30:00.000Z"
        },
        {
          "_id": "6650bb10b12c3d4e5f678102",
          "restaurant_id": "664f1a2b3c4d5e6f7a8b9001",
          "table_number": "A02",
          "name": null,
          "capacity": 6,
          "status": "occupied",
          "qr_code": null,
          "notes": null,
          "is_active": true,
          "created_at": "2026-04-25T10:05:00.000Z",
          "updated_at": "2026-04-25T11:00:00.000Z"
        }
      ],
      "available": [
        {
          "_id": "6650bb10b12c3d4e5f678101",
          "restaurant_id": "664f1a2b3c4d5e6f7a8b9001",
          "table_number": "A01",
          "name": "Ban cua so",
          "capacity": 4,
          "status": "available",
          "qr_code": "fd1de0b5-7f9b-4a2f-9f23-5a18fd2a2d9f",
          "notes": "Gan cua ra vao",
          "is_active": true,
          "created_at": "2026-04-25T10:00:00.000Z",
          "updated_at": "2026-04-25T10:30:00.000Z"
        }
      ],
      "occupied": [
        {
          "_id": "6650bb10b12c3d4e5f678102",
          "restaurant_id": "664f1a2b3c4d5e6f7a8b9001",
          "table_number": "A02",
          "name": null,
          "capacity": 6,
          "status": "occupied",
          "qr_code": null,
          "notes": null,
          "is_active": true,
          "created_at": "2026-04-25T10:05:00.000Z",
          "updated_at": "2026-04-25T11:00:00.000Z"
        }
      ],
      "reserved": [],
      "cleaning": [],
      "inactive": []
    }
  },
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-04-25T10:00:00.000Z"
}
```

## 10) Interface TypeScript tham khao

```ts
type SystemRole = "user" | "admin";
type StaffPosition = "manager" | "cashier" | "waiter" | "kitchen" | "delivery";
type TableStatus = "available" | "occupied" | "reserved" | "cleaning" | "inactive";

interface StaffPermissions {
  can_discount: boolean;
  can_cancel_order: boolean;
  can_process_payment: boolean;
  can_refund: boolean;
  can_view_reports: boolean;
  can_manage_tables: boolean;
  can_manage_menu: boolean;
}

interface PosUser {
  id: string;
  system_role: SystemRole;
  is_owner: boolean;
  is_admin: boolean;
}

interface PosStaff {
  _id: string;
  employee_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  position: StaffPosition;
  permissions: StaffPermissions;
}

interface PosRestaurant {
  _id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge_rate: number;
  accepts_online_orders: boolean;
}

interface TableRow {
  _id: string;
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

interface PosTables {
  total: TableRow[];
  available: TableRow[];
  occupied: TableRow[];
  reserved: TableRow[];
  cleaning: TableRow[];
  inactive: TableRow[];
}

interface PosInitData {
  user: PosUser;
  staff: PosStaff | null;
  restaurant: PosRestaurant;
  tables: PosTables;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  correlationId: string;
  timestamp: string;
}

type PosInitResponse = ApiResponse<PosInitData>;
```
