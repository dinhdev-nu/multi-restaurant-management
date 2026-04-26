# Staff Module OpenAPI Documentation

## 1. Data Lineage

## 1.1 Files đã truy vết
- DTO input:
  - src/modules/restaurant/dto/create-staff.dto.ts
  - src/modules/restaurant/dto/staff.dto.ts
- Controller entrypoint:
  - src/modules/restaurant/controllers/staff.controller.xxx.ts
- Service business logic:
  - src/modules/restaurant/services/staff.service.xxx.ts
- Repository data access:
  - src/modules/restaurant/repositories/staff.repository.ts
- Schema database model:
  - src/modules/restaurant/schemas/staff.schema.xxx.ts
- Guard/Pipe để xác định lỗi auth/param:
  - src/common/guards/jwt-auth.guard.ts
  - src/common/guards/system-role.guard.ts
  - src/common/guards/restaurant-auth.guard.ts
  - src/common/pipes/parse-id.pipe.ts

## 1.2 Luồng API theo endpoint

| Endpoint | DTO | Controller | Service | Repository | Schema fields read/write |
|---|---|---|---|---|---|
| POST /restaurants/{id}/staff | CreateStaffPayloadDto | createStaff | createStaff | findByEmployeeCodeInRestaurant, findByUserInRestaurant, createOne | write: restaurant_id, user_id, employee_code, full_name, phone, email, position, hire_date, avatar_url, status, permissions, deleted_at |
| GET /restaurants/{id}/staff | ListStaffQuery | listStaffs | listStaffs | findByRestaurantId | read: _id, user_id, employee_code, full_name, position, status, hire_date, avatar_url, created_at |
| GET /restaurants/{id}/staff/{staff_id} | path params | getStaffDetail | getStaffDetail -> getStaffOrThrow | findByIdInRestaurant | read: full schema object; có thể ẩn permissions theo requester role |
| PATCH /restaurants/{id}/staff/{staff_id} | UpdateStaffDto | updateStaffInfo | updateStaffInfo | updateFieldsInRestaurant | write: full_name, position, hire_date, phone, email |
| PATCH /restaurants/{id}/staff/{staff_id}/status | UpdateStaffStatusDto | updateStaffStatus | updateStaffStatus | updateStaffStatus | write: status |
| PATCH /restaurants/{id}/staff/{staff_id}/link-account | UpdateStaffLinkAccountDto | linkStaffAccount | linkAccount | findByUserInRestaurant, linkUserAccount | write: user_id |
| PATCH /restaurants/{id}/staff/{staff_id}/permissions | UpdateStaffPermissionsDto | updateStaffPermissions | updatePermissions | updatePermissions | write: permissions.can_discount, permissions.can_cancel_order, permissions.can_process_payment, permissions.can_refund, permissions.can_view_reports, permissions.can_manage_tables, permissions.can_manage_menu |
| PUT /restaurants/{id}/staff/{staff_id}/avatar | UpdateStaffAvatarDto | updateStaffAvatar | updateAvatar | updateFieldsInRestaurant | write: avatar_url |
| DELETE /restaurants/{id}/staff/{staff_id} | path params | softDeleteStaff | softDeleteStaff | softDeleteInRestaurant | write: deleted_at, status=terminated |

## 1.3 Response envelope chuẩn
Tất cả endpoint Staff được wrap bởi TransformResponseInterceptor.

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

## 1.4 Zero-omission inventory từ Staff schema

### Schema field gốc
- _id: ObjectId
- restaurant_id: ObjectId
- user_id: ObjectId
- employee_code: string
- full_name: string
- phone: string|null
- email: string|null
- position: enum(manager,cashier,waiter,kitchen,delivery)
- hire_date: date
- avatar_url: string|null
- status: enum(active,inactive,on_leave,terminated)
- permissions: object
  - can_discount: boolean
  - can_cancel_order: boolean
  - can_process_payment: boolean
  - can_refund: boolean
  - can_view_reports: boolean
  - can_manage_tables: boolean
  - can_manage_menu: boolean
- deleted_at: date|null
- created_at: date
- updated_at: date

### Mapping theo response endpoint
| Field schema | Create | List | Detail | Update info | Update status | Link account | Update permissions | Update avatar | Soft delete | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| _id | gián tiếp qua id | gián tiếp qua id | trả trực tiếp _id | gián tiếp qua id | không trả | không trả | không trả | không trả | không trả | endpoint command trả payload tối giản |
| restaurant_id | không trả | không trả | trả | không trả | không trả | không trả | không trả | không trả | không trả | chỉ detail trả đầy đủ context resource |
| user_id | trả | trả | trả | trả | không trả | trả | không trả | không trả | không trả | command endpoint không trả full entity |
| employee_code | trả | trả | trả | trả | không trả | không trả | không trả | không trả | không trả | command endpoint tối giản |
| full_name | trả | trả | trả | trả | không trả | không trả | không trả | không trả | không trả | command endpoint tối giản |
| phone | không trả | không trả | trả | trả | không trả | không trả | không trả | không trả | không trả | create/list tối ưu payload |
| email | không trả | không trả | trả | trả | không trả | không trả | không trả | không trả | không trả | create/list tối ưu payload |
| position | trả | trả | trả | trả | không trả | không trả | không trả | không trả | không trả | command endpoint tối giản |
| hire_date | trả | trả | trả | trả | không trả | không trả | không trả | không trả | không trả | command endpoint tối giản |
| avatar_url | không trả | trả | trả | trả | không trả | không trả | không trả | trả | không trả | create không trả avatar theo implementation hiện tại |
| status | trả | trả | trả | trả | trả | không trả | không trả | không trả | không trả | update status trả riêng status |
| permissions.* | không trả | không trả | trả có điều kiện | trả | không trả | không trả | trả | không trả | không trả | detail ẩn permissions nếu staff xem người khác |
| deleted_at | không trả | không trả | trả | không trả | không trả | không trả | không trả | không trả | không trả | detail phản ánh soft-delete marker |
| created_at | trả | trả | trả | trả | không trả | không trả | không trả | không trả | không trả | command endpoint tối giản |
| updated_at | không trả | không trả | trả | trả | không trả | không trả | không trả | không trả | không trả | create/list không cần field này |

Kết luận zero-omission:
- Không có field schema nào bị bỏ quên trong tài liệu.
- Các field không xuất hiện ở một số response đã được nêu rõ lý do: endpoint command trả payload tối giản, hoặc endpoint list/create tối ưu payload, hoặc detail mask theo role.

---
2.1 2.2.2.3 2.9 2.4 2.7  2.5 2.6 2.8
## 2. API Specification

## 2.1 POST /restaurants/{id}/staff
### Mục đích
Tạo hồ sơ staff mới cho một nhà hàng và bắt buộc liên kết với user_id đã tồn tại.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| user_id | string(ObjectId) | true | IsMongoId |
| employee_code | string | true | IsString, trim, MinLength(1), MaxLength(30) |
| full_name | string | true | IsString, trim, MinLength(1), MaxLength(150) |
| position | string(enum) | true | IsEnum(StaffPosition) |
| hire_date | string(date) | true | IsDateString |
| phone | string | false | IsString, MaxLength(20), IsPhoneNumber(VN) |
| email | string | false | IsEmail |
| status | string(enum) | false | IsEnum(StaffStatus) |
| avatar_url | string(url) | false | IsString, IsUrl, regex image extension |

Service constraints:
- hire_date phải parse được date và không ở tương lai
- employee_code không được trùng trong cùng nhà hàng
- user_id không được link với staff khác trong cùng nhà hàng
- rate limit ghi staff: 30 thao tác/phút/restaurant

### Dữ liệu ra (Response)
HTTP 201

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request was successful",
  "data": {
    "id": "string",
    "employee_code": "string",
    "full_name": "string",
    "position": "manager|cashier|waiter|kitchen|delivery",
    "hire_date": "date-time",
    "status": "active|inactive|on_leave|terminated",
    "user_id": "string",
    "created_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - id không hợp lệ
  - payload sai validation
  - hire_date invalid hoặc hire_date ở tương lai
- 401 Unauthorized
  - thiếu Bearer token
  - token invalid/expired/revoked
- 403 Forbidden
  - không phải owner/admin của restaurant
- 404 Not Found
  - user_id không tồn tại
  - restaurant không tồn tại
- 409 Conflict
  - employee_code đã tồn tại
  - user_id đã liên kết với staff khác
- 429 Too Many Requests
  - vượt rate limit ghi staff
- 500 Internal Server Error

---

## 2.2 GET /restaurants/{id}/staff
### Mục đích
Lấy danh sách staff theo nhà hàng, có lọc theo status/position và phân trang.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |

### Query Param
| Field | Type | Required | Validation |
|---|---|---|---|
| status | string(enum) | false | từ CreateStaffDto.status -> IsEnum(StaffStatus) |
| position | string(enum) | false | từ CreateStaffDto.position -> IsEnum(StaffPosition) |
| page | number | false | IsInt, Min(1), default 1 |
| limit | number | false | IsInt, Min(1), Max(100), default 50 |

### Dữ liệu ra (Response)
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
        "employee_code": "string",
        "full_name": "string",
        "position": "manager|cashier|waiter|kitchen|delivery",
        "status": "active|inactive|on_leave|terminated",
        "hire_date": "date-time",
        "avatar_url": "string|null",
        "user_id": "string",
        "created_at": "date-time"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "total_pages": 2
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - id/query không hợp lệ
- 401 Unauthorized
- 403 Forbidden
  - không thuộc restaurant (owner/admin/staff)
- 404 Not Found
  - restaurant không tồn tại
- 500 Internal Server Error

---

## 2.3 GET /restaurants/{id}/staff/{staff_id}
### Mục đích
Lấy chi tiết một staff. Quyền hiển thị permissions phụ thuộc requester role.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Dữ liệu ra (Response)
HTTP 200

Case owner/admin hoặc staff xem chính mình (có permissions)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "restaurant_id": "string",
    "user_id": "string",
    "employee_code": "string",
    "full_name": "string",
    "phone": "string|null",
    "email": "string|null",
    "position": "manager|cashier|waiter|kitchen|delivery",
    "hire_date": "date-time",
    "avatar_url": "string|null",
    "status": "active|inactive|on_leave|terminated",
    "permissions": {
      "can_discount": true,
      "can_cancel_order": false,
      "can_process_payment": true,
      "can_refund": false,
      "can_view_reports": true,
      "can_manage_tables": true,
      "can_manage_menu": false
    },
    "deleted_at": null,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Case staff xem người khác (ẩn permissions)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "restaurant_id": "string",
    "user_id": "string",
    "employee_code": "string",
    "full_name": "string",
    "phone": "string|null",
    "email": "string|null",
    "position": "manager|cashier|waiter|kitchen|delivery",
    "hire_date": "date-time",
    "avatar_url": "string|null",
    "status": "active|inactive|on_leave|terminated",
    "deleted_at": null,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - id/staff_id không hợp lệ
- 401 Unauthorized
- 403 Forbidden
  - không có quyền truy cập restaurant
  - staff không active trong restaurant
- 404 Not Found
  - staff không tồn tại trong restaurant
  - restaurant không tồn tại
- 500 Internal Server Error

---

## 2.4 PATCH /restaurants/{id}/staff/{staff_id}
### Mục đích
Cập nhật thông tin cơ bản staff (partial update).

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| full_name | string | false | IsString, trim, MinLength(1), MaxLength(150) |
| position | string(enum) | false | IsEnum(StaffPosition) |
| hire_date | string(date) | false | IsDateString |
| phone | string | false | IsString, MaxLength(20), IsPhoneNumber(VN) |
| email | string | false | IsEmail |

Service constraints:
- nếu có hire_date thì không được ở tương lai
- rate limit ghi staff

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "staff": {
      "id": "string",
      "employee_code": "string",
      "full_name": "string",
      "phone": "string|null",
      "email": "string|null",
      "position": "manager|cashier|waiter|kitchen|delivery",
      "hire_date": "date-time",
      "avatar_url": "string|null",
      "status": "active|inactive|on_leave|terminated",
      "user_id": "string",
      "created_at": "date-time",
      "updated_at": "date-time",
      "permissions": {
        "can_discount": true,
        "can_cancel_order": false,
        "can_process_payment": true,
        "can_refund": false,
        "can_view_reports": true,
        "can_manage_tables": true,
        "can_manage_menu": false
      }
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - payload sai validation
  - id/staff_id không hợp lệ
  - hire_date invalid hoặc ở tương lai
- 401 Unauthorized
- 403 Forbidden
  - không có quyền owner/admin
- 404 Not Found
  - staff không tồn tại
  - restaurant không tồn tại
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.5 PATCH /restaurants/{id}/staff/{staff_id}/status
### Mục đích
Cập nhật trạng thái staff.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| status | string(enum) | true | IsEnum(StaffStatus) |
| reason | string | false | IsString |

Service constraints:
- nếu status không đổi -> unchanged=true
- nếu set terminated -> kiểm tra số order active và trả warnings (không chặn)
- rate limit ghi staff

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "unchanged": false,
    "status": "terminated",
    "warnings": ["Đang phụ trách 2 đơn hàng active"]
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - status sai enum
  - id/staff_id không hợp lệ
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - staff không tồn tại
  - restaurant không tồn tại
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.6 PATCH /restaurants/{id}/staff/{staff_id}/link-account
### Mục đích
Đổi user account liên kết với staff hiện tại.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| user_id | string(ObjectId) | true | IsMongoId |

Service constraints:
- user_id mới phải tồn tại
- user_id mới chưa link với staff khác trong cùng restaurant
- nếu user_id mới trùng user hiện tại -> trả linked=true ngay
- rate limit ghi staff

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "linked": true,
    "user_id": "string"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - user_id sai format hoặc id/staff_id sai
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - staff không tồn tại
  - user_id mới không tồn tại
  - restaurant không tồn tại
- 409 Conflict
  - user_id mới đã liên kết staff khác
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.7 PATCH /restaurants/{id}/staff/{staff_id}/permissions
### Mục đích
Cập nhật bộ quyền của staff.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| can_discount | boolean | false | IsBoolean |
| can_cancel_order | boolean | false | IsBoolean |
| can_process_payment | boolean | false | IsBoolean |
| can_refund | boolean | false | IsBoolean |
| can_view_reports | boolean | false | IsBoolean |
| can_manage_tables | boolean | false | IsBoolean |
| can_manage_menu | boolean | false | IsBoolean |

Service constraints:
- ít nhất 1 key permissions phải được truyền
- merge với permissions hiện tại
- rate limit ghi staff

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "permissions": {
      "can_discount": true,
      "can_cancel_order": false,
      "can_process_payment": true,
      "can_refund": false,
      "can_view_reports": true,
      "can_manage_tables": true,
      "can_manage_menu": false
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - body sai validation
  - không có permissions field nào được cung cấp
  - id/staff_id không hợp lệ
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - staff không tồn tại
  - restaurant không tồn tại
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.8 PUT /restaurants/{id}/staff/{staff_id}/avatar
### Mục đích
Cập nhật avatar của staff.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| avatar_url | string | true | IsString, IsUrl, regex https, regex extension jpg/jpeg/png/webp |

Authorization rule tại service:
- owner/admin: có thể cập nhật avatar cho mọi staff trong restaurant
- staff: chỉ được cập nhật avatar của chính mình

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "avatar_url": "string|null"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - avatar_url sai format
  - id/staff_id không hợp lệ
- 401 Unauthorized
- 403 Forbidden
  - staff chỉnh avatar của người khác
  - không thuộc restaurant
- 404 Not Found
  - staff không tồn tại
  - restaurant không tồn tại
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.9 DELETE /restaurants/{id}/staff/{staff_id}
### Mục đích
Xóa mềm staff (soft delete) và chuyển status về terminated.

### Dữ liệu vào (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| staff_id | string(ObjectId) | true | ParseObjectIdPipe |

### Dữ liệu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "deleted": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- 400 Bad Request
  - id/staff_id không hợp lệ
- 401 Unauthorized
- 403 Forbidden
  - không có quyền owner/admin
- 404 Not Found
  - staff không tồn tại
  - restaurant không tồn tại
- 409 Conflict
  - staff đang phụ trách order active
- 429 Too Many Requests
- 500 Internal Server Error

---

## 3. Error Source Map

### Validation / Param
- 400 INVALID_ID_ERROR
  - ParseObjectIdPipe cho id hoặc staff_id
- 400 VALIDATION_ERROR
  - DTO validation fail
  - hire_date invalid/future
  - payload permissions rỗng

### Auth / Authorization
- 401 UNAUTHORIZED
  - không có token, token sai, token bị thu hồi
- 401 TOKEN_EXPIRED
  - access token hết hạn
- 403 FORBIDDEN
  - không thuộc restaurant
  - không có role phù hợp
  - staff tự sửa avatar người khác

### Not Found / Conflict / Rate Limit
- 404 RESOURCE_NOT_FOUND
  - staff không tồn tại
- 404 USER_NOT_FOUND
  - user liên kết không tồn tại
- 409 CONFLICT_ERROR
  - duplicate employee_code
  - duplicate user_id link
  - còn order active khi soft delete
- 429 TOO_MANY_REQUESTS
  - write rate limit theo restaurant

### Internal
- 500 INTERNAL_ERROR
  - lỗi không dự kiến từ hệ thống
