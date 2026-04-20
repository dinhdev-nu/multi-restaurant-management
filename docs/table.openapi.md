# Table Module OpenAPI Documentation

## 1. Data Lineage

## 1.1 Files da truy vet
- DTO input/output:
  - src/modules/restaurant/dto/table.dto.ts
- Controller entrypoint:
  - src/modules/restaurant/controllers/table.controller.xxx.ts
- Service business logic:
  - src/modules/restaurant/services/table.service.xxx.ts
- Repository data access:
  - src/modules/restaurant/repositories/table.repository.ts
  - src/modules/order/repositories/order.repository.ts
- Schema database model:
  - src/modules/restaurant/schemas/table.schema.ts
  - src/modules/restaurant/schemas/restaurant.schema.xxx.ts (chi dung cho public QR scan)
- Guard/Pipe/Interceptor lien quan auth, role, response:
  - src/common/guards/jwt-auth.guard.ts
  - src/common/guards/system-role.guard.ts
  - src/common/guards/restaurant-auth.guard.ts
  - src/common/pipes/parse-id.pipe.ts
  - src/common/interceptors/transform-response.interceptor.ts

Ghi chu pham vi:
- File src/modules/restaurant/dto/create-table.dto.ts la legacy DTO khong duoc controller table hien tai su dung.
- Data lineage cua Table APIs ben duoi chi map cac DTO dang duoc import truc tiep trong TableController/PublicTableController.

## 1.2 Lineage theo tung endpoint

| Endpoint | DTO | Controller | Service | Repository | Schema fields read/write |
|---|---|---|---|---|---|
| POST /restaurants/{id}/tables | CreateTableDto | createTable | createTable | countByRestaurant, findByTableNumber, createOne | write: restaurant_id, table_number, capacity, name, notes, status=available, is_active=true, qr_code=null |
| GET /restaurants/{id}/tables | ListTablesQueryDto | listTables | listTables | listByRestaurant | read: _id, restaurant_id, table_number, name, capacity, status, qr_code, notes, is_active, created_at, updated_at; response row co role-based masking |
| GET /restaurants/{id}/tables/{table_id} | path params | getTableDetail | getTableDetail -> getTableOrThrow | findByIdInRestaurant | read full table schema row; owner/admin xem qr_code+notes, staff xem has_qr |
| PATCH /restaurants/{id}/tables/{table_id} | UpdateTableDto | updateTable | updateTable | findByIdInRestaurant, findByTableNumber, updateInRestaurant | write: table_number, capacity, name, notes |
| PATCH /restaurants/{id}/tables/{table_id}/status | UpdateTableStatusDto | updateTableStatus | updateTableStatus | findByIdInRestaurant, updateStatus + order check | write: status |
| PATCH /restaurants/{id}/tables/{table_id}/toggle | path params | toggleTableActive | toggleTableActive | findByIdInRestaurant, toggleActive + order check | write: is_active |
| POST /restaurants/{id}/tables/{table_id}/qr | path params | regenerateQrCode | regenerateQrCode | findByIdInRestaurant, updateQrCode | write: qr_code |
| DELETE /restaurants/{id}/tables/{table_id} | path params | deleteTable | deleteTable | findByIdInRestaurant, deleteInRestaurant + unlinkOrdersFromTable | hard delete table row |
| GET /public/tables/{qr_code} | qr_code param | scanPublicByQrCode | scanPublicByQrCode | findByQrCode + RestaurantService.handleGetResAndThrow | read table by qr_code + restaurant basic fields |

## 1.3 Response envelope chuan
Tat ca endpoint (ke ca public) duoc wrap boi TransformResponseInterceptor.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {},
  "correlationId": "string",
  "timestamp": "2026-04-17T08:00:00.000Z"
}
```

## 1.4 Zero-omission inventory

### Table schema fields goc
- _id: ObjectId
- restaurant_id: ObjectId
- table_number: string
- name: string|null
- capacity: number
- status: enum(available, occupied, reserved, cleaning, inactive)
- qr_code: string|null
- notes: string|null
- is_active: boolean
- created_at: date-time
- updated_at: date-time
- id: virtual string (tu _id)

### Mapping field theo response endpoint
| Field | Create | List | Detail owner/admin | Detail staff | Update | Update status | Toggle active | Regenerate QR | Delete | Public scan | Ghi chu |
|---|---|---|---|---|---|---|---|---|---|---|---|
| _id | co | khong | khong | khong | co (nested table) | khong | khong | khong | khong | khong | list/detail dung id thay vi _id |
| id (virtual/derived) | co the khong (phu thuoc serialize) | co | co | co | co the khong | co the khong | co the khong | khong (table_id) | khong | khong | service readEntityId co the tao id tu _id |
| restaurant_id | co | khong | co | co | co (nested table) | co | co | khong | khong | khong | public scan an restaurant_id cua table |
| table_number | co | co | co | co | co | co | co | khong | khong | co | |
| name | co | co | co | co | co | khong | khong | khong | khong | co | |
| capacity | co | co | co | co | co | khong | khong | khong | khong | co | |
| status | co | co | co | co | co | co | khong | khong | khong | co | |
| qr_code | co (mac dinh null) | khong (chi has_qr) | co | khong (chi has_qr) | co | khong | khong | co | khong | khong | security masking trong list/staff/public |
| notes | co | co voi owner/admin | co voi owner/admin | khong | co | khong | khong | khong | khong | khong | role-based masking |
| is_active | co | co | co | co | co | khong | co | khong | khong | khong (nhung service check is_active=true) | public scan chi cho table active |
| created_at | co | khong | co | co | co | khong | khong | khong | khong | khong | list/command toi uu payload |
| updated_at | co | khong | co | co | co | co | co | co | khong | khong | |
| has_qr (derived) | khong | co | khong | co | khong | khong | khong | khong | khong | khong | derived tu Boolean(qr_code) |
| table_id (derived) | khong | khong | khong | khong | khong | khong | khong | co | khong | co | derived tu _id |
| qr_url (derived) | khong | khong | khong | khong | khong | khong | khong | co | khong | khong | ta o service |
| message (non-schema) | khong | khong | khong | khong | khong | khong | khong | khong | co | khong | thong diep nghiep vu command |

### Restaurant fields trong public QR scan response
Public QR scan khong tra full restaurant schema. Service chi pick:
- id (co the co/khong tuy cach serialize)
- name
- slug
- logo_url

Cac field restaurant khac bi omit co chu dich:
- owner_id, settings, address, phone, email, operating_hours, tax_rate, ...
- Ly do: endpoint scan QR chi can thong tin nhan dien nha hang + menu_url de client dieu huong.

Ket luan zero-omission:
- Tat ca field thuoc Table schema da duoc map ro trong bang.
- Moi field khong xuat hien tren response deu co ly do cu the (mask theo role, payload toi gian cho command endpoint, hoac derived field thay the).

---

## 2. API Specification

## 2.1 POST /restaurants/{id}/tables
### Muc dich
Tao ban moi trong nha hang.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| table_number | string | true | IsString, trim, MinLength(1), MaxLength(20) |
| capacity | number(integer) | true | Type(Number), IsInt, Min(1), Max(99) |
| name | string\|null | false | IsString, trim, MinLength(1), MaxLength(50) |
| notes | string\|null | false | IsString, trim, MaxLength(500) |

Service constraints:
- Gioi han 300 ban/restaurant.
- table_number khong duoc trung trong cung restaurant.
- status duoc set mac dinh `available`, is_active=true, qr_code=null.

### Du lieu ra (Response)
HTTP 201

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "restaurant_id": "string",
    "table_number": "A01",
    "name": "Ban sat cua so",
    "capacity": 4,
    "status": "available",
    "qr_code": null,
    "notes": "string|null",
    "is_active": true,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - id khong hop le
  - payload validation fail
  - vuot gioi han 300 ban
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - khong tim thay context nha hang
- 409 Conflict
  - table_number da ton tai
- 429 Too Many Requests
  - vuot `ratelimit:table:write:{restaurant_id}`
- 500 Internal Server Error

---

## 2.2 GET /restaurants/{id}/tables
### Muc dich
Lay danh sach ban cua nha hang theo bo loc.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |

### Query Param
| Field | Type | Required | Validation |
|---|---|---|---|
| status | enum(TableStatus) | false | IsEnum(TableStatus) |
| is_active | boolean | false | Transform(toBoolean), IsBoolean |
| capacity_min | integer | false | Type(Number), IsInt, Min(1), Max(99) |
| capacity_max | integer | false | Type(Number), IsInt, Min(1), Max(99) |

Service constraints:
- Neu cung co capacity_min va capacity_max thi capacity_min <= capacity_max.
- Response list mask theo role:
  - owner/admin: co notes
  - staff: khong co notes
- qr_code khong tra truc tiep trong list, chi tra has_qr.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "data": [
      {
        "id": "string",
        "table_number": "A01",
        "name": "Ban sat cua so",
        "capacity": 4,
        "status": "available",
        "is_active": true,
        "has_qr": true,
        "notes": "Uu tien khach dat truoc"
      }
    ],
    "total": 28
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - query invalid
  - capacity_min > capacity_max
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

## 2.3 GET /restaurants/{id}/tables/{table_id}
### Muc dich
Lay chi tiet mot ban theo role requester.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
HTTP 200

Owner/Admin variant:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "id": "string",
    "restaurant_id": "string",
    "table_number": "A01",
    "name": "Ban sat cua so",
    "capacity": 4,
    "status": "available",
    "is_active": true,
    "qr_code": "06d66ff8-7f8d-4df4-97b7-b04b774706f7",
    "notes": "string|null",
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Staff variant:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "id": "string",
    "restaurant_id": "string",
    "table_number": "A01",
    "name": "Ban sat cua so",
    "capacity": 4,
    "status": "available",
    "is_active": true,
    "has_qr": true,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
  - table cache hit nhung restaurant_id khong khop context
- 404 Not Found
  - table khong ton tai
- 500 Internal Server Error

---

## 2.4 PATCH /restaurants/{id}/tables/{table_id}
### Muc dich
Cap nhat thong tin co ban cua ban (partial update).

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| table_number | string | false | IsString, trim, MinLength(1), MaxLength(20) |
| capacity | number(integer) | false | Type(Number), IsInt, Min(1), Max(99) |
| name | string\|null | false | IsString, trim, MinLength(1), MaxLength(50) |
| notes | string\|null | false | IsString, trim, MaxLength(500) |

Service constraints:
- Payload phai co it nhat 1 field hop le.
- Neu doi table_number phai check trung trong cung restaurant.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "table": {
      "_id": "string",
      "restaurant_id": "string",
      "table_number": "A01",
      "name": "Ban sat cua so",
      "capacity": 4,
      "status": "available",
      "qr_code": "string|null",
      "notes": "string|null",
      "is_active": true,
      "created_at": "date-time",
      "updated_at": "date-time"
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - payload invalid
  - payload rong (khong co field hop le)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - table_number trung
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.5 PATCH /restaurants/{id}/tables/{table_id}/status
### Muc dich
Cap nhat status cua ban theo thao tac owner/admin.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| status | enum(TableStatus) | true | IsEnum(TableStatus) |

Service constraints:
- Ban inactive khong duoc doi status.
- Neu target status la available hoac reserved thi khong duoc con unpaid active orders.

### Du lieu ra (Response)
HTTP 200

Case 1: khong doi (target = current)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "unchanged": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Case 2: da doi status
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "unchanged": false,
    "table": {
      "restaurant_id": "string",
      "table_number": "A01",
      "status": "reserved",
      "updated_at": "date-time"
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - payload invalid
  - inactive table cannot change status
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - table has unpaid active orders
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.6 PATCH /restaurants/{id}/tables/{table_id}/toggle
### Muc dich
Dao trang thai is_active cua ban.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "restaurant_id": "string",
    "table_number": "A01",
    "is_active": false,
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - khi deactivate nhung van co active unpaid orders
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.7 POST /restaurants/{id}/tables/{table_id}/qr
### Muc dich
Sinh QR moi cho ban va vo hieu hoa QR cu.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
- Khong co body.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "table_id": "string",
    "qr_code": "06d66ff8-7f8d-4df4-97b7-b04b774706f7",
    "qr_url": "https://api.example.com/public/tables/06d66ff8-7f8d-4df4-97b7-b04b774706f7",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests
  - vuot `ratelimit:table:qr:{restaurant_id}`
- 500 Internal Server Error

---

## 2.8 DELETE /restaurants/{id}/tables/{table_id}
### Muc dich
Xoa ban va unlink tham chieu table_id tren order trong transaction.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| table_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "message": "Deleted table A01"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - table has active unpaid orders, cannot delete
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.9 GET /public/tables/{qr_code}
### Muc dich
Quet QR public de lay thong tin ban va duong dan menu public.

### Du lieu vao (Request)
### Header
- Khong yeu cau Authorization.

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| qr_code | string | true | raw path param (khong co pipe dinh dang) |

Service constraints:
- qr_code phai ton tai.
- table phai active.
- restaurant cua ban phai published.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "table_id": "string",
    "table_number": "A01",
    "name": "Ban sat cua so",
    "capacity": 4,
    "status": "available",
    "restaurant": {
      "id": "string",
      "name": "Bep Nha Viet",
      "slug": "bep-nha-viet",
      "logo_url": "string|null"
    },
    "menu_url": "/public/restaurants/bep-nha-viet/menu"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Luu y:
- Truong `restaurant.id` co the vang neu object restaurant duoc serialize tu lean object khong co virtual id.

### Xu ly loi (Exception handling)
- 404 Not Found
  - invalid QR code
  - table inactive
  - restaurant chua publish hoac khong ton tai
- 429 Too Many Requests
  - vuot throttle `public-table-qr-scan` (60 req/phut/IP)
- 500 Internal Server Error
