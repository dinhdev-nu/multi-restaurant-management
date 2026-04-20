# Restaurant Module OpenAPI Documentation

## 1. Data Lineage (DTO -> Controller -> Service -> Repository -> Schema)

### 1.1 Source Files Used
- DTO: `src/modules/restaurant/dto/restaurant.dto.ts`
- Controller: `src/modules/restaurant/restaurant.controler.xxx.ts`
- Service: `src/modules/restaurant/restaurant.service.xxx.ts`
- Repository: `src/modules/restaurant/repositories/restaurant.repository.ts`
- Schema: `src/modules/restaurant/schemas/restaurant.schema.xxx.ts`
- Guard/Pipe references for exception mapping:
  - `src/common/guards/jwt-auth.guard.ts`
  - `src/common/guards/restaurant-auth.guard.ts`
  - `src/common/pipes/parse-id.pipe.ts`
  - `src/common/pipes/slug.pipe.ts`

### 1.2 Standard Response Envelope
All endpoints (except bypass-interceptor routes) are wrapped by `TransformResponseInterceptor`.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {},
  "correlationId": "string",
  "timestamp": "2026-04-17T03:20:56.000Z"
}
```

### 1.3 Zero-Omission Field Coverage Matrix (Schema -> API Responses)
Legend:
- `CREATE`: `POST /restaurants`
- `DETAIL_OWNER`: `GET /restaurants/{id}` (owner/admin)
- `DETAIL_STAFF`: `GET /restaurants/{id}` (staff)
- `OWNER_LIST`: `GET /restaurants`
- `PUBLIC_SEARCH`: `GET /public/restaurants`
- `PUBLIC_DETAIL`: `GET /public/restaurants/{slug}`

| Schema Field | Type | Returned In | Omitted In | Reason If Omitted |
|---|---|---|---|---|
| `_id` | string(ObjectId) | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | - | Primary identifier |
| `owner_id` | string(ObjectId) | CREATE, DETAIL_OWNER, DETAIL_STAFF | OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | Minimize sensitive owner linkage for list/public responses |
| `name` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | - | Core display field |
| `slug` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | - | Public routing key |
| `description` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `cuisine_type` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `price_range` | number\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `logo_url` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | - | Thumbnail/display field |
| `cover_image_url` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `gallery_urls` | string[] | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Payload size optimization |
| `address` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `city` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `district` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `ward` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `latitude` | number\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `longitude` | number\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `location` | object | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Public search returns `distance_km` instead of raw geo object |
| `phone` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `email` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Search/list avoid nonessential contact detail |
| `website` | string\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Search/list avoid nonessential contact detail |
| `operating_hours` | object | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_SEARCH, PUBLIC_DETAIL | OWNER_LIST | Owner list intentionally lightweight |
| `timezone` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Search/list payload minimization |
| `currency` | string | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | Search/list payload minimization |
| `tax_rate` | number | CREATE, DETAIL_OWNER, PUBLIC_DETAIL | DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH | Staff intentionally masked in service; list/search payload minimization |
| `service_charge_rate` | number | CREATE, DETAIL_OWNER, PUBLIC_DETAIL | DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH | Staff intentionally masked in service; list/search payload minimization |
| `is_published` | boolean | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_DETAIL | PUBLIC_SEARCH | Search query always filters published records, flag not projected |
| `accepts_online_orders` | boolean | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | - | Operational field |
| `settings` | object | CREATE, DETAIL_OWNER | DETAIL_STAFF, OWNER_LIST, PUBLIC_SEARCH, PUBLIC_DETAIL | Staff/public intentionally masked by service; list/search minimal |
| `deleted_at` | date\|null | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | List/search only fetch active docs; field omitted from projection |
| `created_at` | date | CREATE, DETAIL_OWNER, DETAIL_STAFF, OWNER_LIST, PUBLIC_DETAIL | PUBLIC_SEARCH | Search projection excludes timestamp |
| `updated_at` | date | CREATE, DETAIL_OWNER, DETAIL_STAFF, PUBLIC_DETAIL | OWNER_LIST, PUBLIC_SEARCH | List/search projection excludes timestamp |

Notes:
- `PUBLIC_SEARCH` includes computed `distance_km` from aggregation pipeline (`$geoNear` + `$addFields`). This field is not in schema, but is a derived response field.
- `PUBLIC_DETAIL` intentionally omits `owner_id` and `settings` in service (`ObjectUtil.omit`).
- `DETAIL_STAFF` intentionally masks `tax_rate`, `service_charge_rate`, `settings` in service.

---

## 2. API Documentation

## 2.1 POST /restaurants/check-slug
### Mục đích
Kiểm tra slug có thể sử dụng hay không trước khi tạo nhà hàng.

### Data lineage
- Input: Body slug (validated by `SlugValidationPipe`)
- Controller: `RestaurantController.checkSlug`
- Service: `RestaurantService.checkRestaurantSlug`
- Repository: `RestaurantRepository.getBySlug`
- Schema fields read: `slug`, `deleted_at`

### Dữ liệu vào (Request)
- Header:
  - Không yêu cầu `Authorization` (public)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `slug` | string | true | `SlugValidationPipe`: lowercase alphanumeric + hyphen, no invalid format |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "available": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

- `data.available`: `boolean`

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: slug format invalid (`INVALID_SLUG_FORMAT`)
- `429 Too Many Requests`: vượt limit `restaurant-check-slug`
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.2 POST /restaurants
### Mục đích
Tạo nhà hàng mới cho owner hiện tại (lấy owner từ JWT `sub`).

### Data lineage
- Input DTO: `CreateRestaurantDto`
- Controller: `RestaurantController.createRestaurant`
- Service: `RestaurantService.create`
- Repository: `RestaurantRepository.getCountByOwner`, `RestaurantRepository.getBySlug`, `RestaurantRepository.create`
- Schema write fields: toàn bộ document `Restaurant`

### Dữ liệu vào (Request)
- Header:
  - `Authorization: Bearer <access_token>` (required)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | true | `@IsString`, `@Length(3,100)` |
| `slug` | string | false | `@IsString`, `@Matches(SLUG_REGEX)` |
| `description` | string | false | `@IsString` |
| `logo_url` | string | false | `@IsString` |
| `cover_image_url` | string | false | `@IsString` |
| `gallery_urls` | string[] | false | `@IsString({each:true})` |
| `website` | string | false | `@IsString` |
| `cuisine_type` | string | false | `@IsString` |
| `price_range` | number | false | `@Min(1)`, `@Max(4)` |
| `address` | string | true | `@IsString` |
| `city` | string | true | `@IsString` |
| `district` | string | false | `@IsString` |
| `ward` | string | false | `@IsString` |
| `latitude` | number | false | `@ValidateIf(lat/lng pair)`, `@IsLatitude` |
| `longitude` | number | false | `@ValidateIf(lat/lng pair)`, `@IsLongitude` |
| `phone` | string | false | `@IsPhoneNumber('VN')` |
| `email` | string | false | `@IsEmail` |
| `timezone` | string | false | `@IsTimeZone` |
| `operating_hours` | object | true | `@ValidateNested`, `@IsNotEmpty` |

`operating_hours` sub-structure:
- Keys required: `mon,tue,wed,thu,fri,sat,sun`
- Mỗi ngày là object:

| Field | Type | Required | Validation |
|---|---|---|---|
| `closed` | boolean | true | `@IsBoolean` |
| `open` | string | true | `HH:mm`, `@Matches`, `@IsNotEmpty` |
| `close` | string | true | `HH:mm`, `@Matches`, `@IsNotEmpty` |

Business rule thêm ở service:
- Phải có ít nhất 1 ngày mở (`closed = false`)
- Nếu không truyền `slug`, service tự sinh slug tối đa 3 lần
- Rate limit create: tối đa 5 request/ngày/owner
- Max restaurant per owner: 10

### Dữ liệu ra (Response)
- HTTP `201`
- `data` trả về toàn bộ document đã tạo (đầy đủ field schema)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "owner_id": "string",
    "name": "string",
    "slug": "string",
    "description": "string|null",
    "cuisine_type": "string|null",
    "price_range": "number|null",
    "logo_url": "string|null",
    "cover_image_url": "string|null",
    "gallery_urls": ["string"],
    "address": "string",
    "city": "string",
    "district": "string|null",
    "ward": "string|null",
    "latitude": "number|null",
    "longitude": "number|null",
    "location": {
      "type": "Point",
      "coordinates": [106.7009, 10.7769]
    },
    "phone": "string|null",
    "email": "string|null",
    "website": "string|null",
    "operating_hours": {
      "mon": { "open": "08:00", "close": "22:00", "closed": false },
      "tue": { "open": "08:00", "close": "22:00", "closed": false },
      "wed": { "open": "08:00", "close": "22:00", "closed": false },
      "thu": { "open": "08:00", "close": "22:00", "closed": false },
      "fri": { "open": "08:00", "close": "22:00", "closed": false },
      "sat": { "open": "08:00", "close": "22:00", "closed": false },
      "sun": { "open": "08:00", "close": "22:00", "closed": false }
    },
    "timezone": "Asia/Ho_Chi_Minh",
    "currency": "VND",
    "tax_rate": 0.1,
    "service_charge_rate": 0,
    "is_published": false,
    "accepts_online_orders": false,
    "settings": {},
    "deleted_at": null,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`:
  - validation DTO fail
  - không có ngày mở cửa (`Nhà hàng phải mở cửa ít nhất 1 ngày trong tuần`)
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: vượt giới hạn 10 nhà hàng/owner
- `409 Conflict`:
  - slug đã tồn tại
  - không thể sinh slug tự động
- `429 Too Many Requests`: vượt limit tạo nhà hàng theo ngày
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.3 GET /restaurants
### Mục đích
Lấy danh sách nhà hàng của owner (admin có thể chỉ định `owner_id`).

### Data lineage
- Input DTO: `OwnerRestaurantListQueryDto`
- Controller: `RestaurantController.getRestaurantsByOwner`
- Service: `RestaurantService.getRestaurantsByOwner`
- Repository: `RestaurantRepository.getCountByOwner`, `RestaurantRepository.getListByOwner`
- Schema read fields: `_id,name,slug,is_published,accepts_online_orders,logo_url,created_at`

### Dữ liệu vào (Request)
- Header:
  - `Authorization: Bearer <access_token>` (required)
- Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `page` | number | false | `@IsInt`, `@Min(1)` |
| `limit` | number | false | `@IsInt`, `@Min(1)`, `@Max(50)` |
| `status` | string | false | `@IsIn(['published'])` |
| `owner_id` | string | false | `@IsMongoId` (admin only semantic) |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "data": [
      {
        "_id": "string",
        "name": "string",
        "slug": "string",
        "is_published": true,
        "accepts_online_orders": true,
        "logo_url": "string|null",
        "created_at": "date-time"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: query invalid
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: role không được phép truy cập
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.4 GET /restaurants/{id}
### Mục đích
Lấy chi tiết nhà hàng theo id với field-level masking theo vai trò.

### Data lineage
- Input: path `id` + current user id
- Controller: `RestaurantController.getRestaurantDetail`
- Service: `RestaurantService.getRestaurantDetails` -> `handleGetResAndThrow`
- Repository: `RestaurantRepository.findOne`
- Schema read fields: toàn bộ document `Restaurant`

### Dữ liệu vào (Request)
- Header:
  - `Authorization: Bearer <access_token>` (required)
- Path param:

| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | string(ObjectId) | true | `ParseObjectIdPipe` |

### Dữ liệu ra (Response)
- HTTP `200`

Case 1: owner/admin (full fields)
- `data` structure giống `POST /restaurants` response payload (đầy đủ schema fields).

Case 2: staff (masked fields)
- `data` giống full fields nhưng:
  - `tax_rate`: omitted
  - `service_charge_rate`: omitted
  - `settings`: omitted

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: id không hợp lệ
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không thuộc nhà hàng hoặc không đủ quyền
- `404 Not Found`: nhà hàng không tồn tại
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.5 PATCH /restaurants/{id}
### Mục đích
Cập nhật thông tin cơ bản nhà hàng (partial update).

### Data lineage
- Input DTO: `UpdateRestaurantDto`
- Controller: `RestaurantController.updateRestaurant`
- Service: `RestaurantService.updateRestaurant`
- Repository: `RestaurantRepository.update`
- Schema write fields: subset của schema trừ `slug`, `operating_hours`

### Dữ liệu vào (Request)
- Header:
  - `Authorization: Bearer <access_token>` (required)
- Path param:
  - `id` (ObjectId, required)
- Body:
  - Là `Partial<CreateRestaurantDto>` loại trừ `slug`, `operating_hours`
  - Chỉ field gửi lên mới được update

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: id hoặc payload không hợp lệ
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền owner/admin
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.6 PATCH /restaurants/{id}/hours
### Mục đích
Cập nhật `operating_hours` của nhà hàng.

### Data lineage
- Input DTO: `UpdateOperatingHoursDto`
- Controller: `RestaurantController.updateOperatingHours`
- Service: `RestaurantService.updateOperatingHours`, `validateOperatingHours`
- Repository: `RestaurantRepository.update`
- Schema write field: `operating_hours`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `operating_hours` | object | true | same validation as create DTO |

Business rule:
- phải có ít nhất 1 ngày mở (`closed=false`)

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: format giờ sai, open/close sai, không có ngày mở
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.7 PATCH /restaurants/{id}/financial
### Mục đích
Cập nhật cấu hình tài chính của nhà hàng.

### Data lineage
- Input DTO: `UpdateRestaurantfinancialDto`
- Controller: `RestaurantController.updateFinancial`
- Service: `RestaurantService.updateFinancialSettings`
- Repository: `RestaurantRepository.update`
- Schema write fields: `tax_rate`, `currency`, `service_charge_rate`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `tax_rate` | number | false | `@Min(0)`, `@Max(1)` |
| `currency` | string | false | `@IsEnum(['VND','USD','EUR'])` |
| `service_charge_rate` | number | false | `@Min(0)`, `@Max(0.1)` |

### Dữ liệu ra (Response)
- HTTP `200`
- Payload giống endpoint update thường: `{ "updated": true }`

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: dữ liệu tài chính sai ràng buộc
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.8 PATCH /restaurants/{id}/settings
### Mục đích
Cập nhật settings nghiệp vụ bằng cơ chế merge patch có whitelist key.

### Data lineage
- Input DTO: `UpdateRestaurantSettingsDto`
- Controller: `RestaurantController.updateSettings`
- Service: `RestaurantService.updateRestaurantSettings`, `validateAndNormalizeSettingsPatch`
- Repository: `RestaurantRepository.findById`, `RestaurantRepository.update`
- Schema write field: `settings`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `settings` | object | true | `@IsObject`, `@IsNotEmptyObject` |

Service-level whitelist and constraints:
- Allowed keys only:
  - `auto_confirm_orders`: boolean
  - `min_order_amount`: number, finite, `>= 0`
  - `delivery_radius_km`: number, finite, `> 0`
  - `max_advance_booking_days`: integer `1..365`
- Không cho phép value `null`
- Không cho phép key lạ ngoài whitelist

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "settings": {
      "auto_confirm_orders": true,
      "min_order_amount": 150000,
      "delivery_radius_km": 8,
      "max_advance_booking_days": 14
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: settings rỗng/sai type/key lạ/value sai
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.9 PATCH /restaurants/{id}/publish
### Mục đích
Bật/tắt trạng thái publish (`is_published`) của nhà hàng.

### Data lineage
- Input DTO: `UpdatePublishStatusDto`
- Controller: `RestaurantController.updatePublishStatus`
- Service: `RestaurantService.updatePublishStatus`
- Repository: `RestaurantRepository.update`
- Schema write field: `is_published`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `is_published` | boolean | true | `@IsBoolean` |

Business rule khi bật publish:
- bắt buộc có `name,address,city,operating_hours`
- `operating_hours` phải hợp lệ

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Trạng thái xuất bản đã được cập nhật.",
  "data": {
    "is_published": true,
    "message": "Trạng thái xuất bản đã được cập nhật."
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: thiếu điều kiện publish hoặc payload sai
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.10 PATCH /restaurants/{id}/online-orders
### Mục đích
Bật/tắt trạng thái nhận đơn online (`accepts_online_orders`).

### Data lineage
- Input DTO: `UpdateOnlineOrdersDto`
- Controller: `RestaurantController.updateOnlineOrders`
- Service: `RestaurantService.updateAcceptOnlineOrders`
- Repository: `RestaurantRepository.update`
- Schema write field: `accepts_online_orders`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `accepts_online_orders` | boolean | true | `@IsBoolean` |

Business rule:
- Chỉ được bật `true` khi nhà hàng đã `is_published = true`

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Trạng thái nhận đơn online đã được cập nhật.",
  "data": {
    "accepts_online_orders": true,
    "message": "Trạng thái nhận đơn online đã được cập nhật."
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: bật online orders khi chưa publish hoặc body sai
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit update
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.11 PUT /restaurants/{id}/logo
### Mục đích
Cập nhật URL logo của nhà hàng.

### Data lineage
- Input DTO: `UpdateRestaurantLogoDto`
- Controller: `RestaurantController.updateRestaurantLogo`
- Service: `RestaurantService.updateRestaurantLogo`, `validateImageUrl`, `isTrustedStorageHost`
- Repository: `RestaurantRepository.update`
- Schema write field: `logo_url`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `logo_url` | string | true | DTO: HTTPS URL (`@IsUrl`), Service: protocol https + ext jpg/jpeg/png/webp + trusted host |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "logo_url": "https://res.cloudinary.com/demo/image/upload/v1/restaurants/new-logo.png"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: URL không đạt rule
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit ảnh theo giờ
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.12 PUT /restaurants/{id}/cover
### Mục đích
Cập nhật URL cover image của nhà hàng.

### Data lineage
- Input DTO: `UpdateRestaurantCoverDto`
- Controller: `RestaurantController.updateRestaurantCover`
- Service: `RestaurantService.updateRestaurantCover`, `validateImageUrl`, `isTrustedStorageHost`
- Repository: `RestaurantRepository.update`
- Schema write field: `cover_image_url`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `cover_image_url` | string | true | DTO: HTTPS URL (`@IsUrl`), Service: protocol https + ext jpg/jpeg/png/webp + trusted host |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "cover_image_url": "https://res.cloudinary.com/demo/image/upload/v1/restaurants/new-cover.webp"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: URL không đạt rule
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit ảnh theo giờ
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.13 POST /restaurants/{id}/gallery
### Mục đích
Thêm một ảnh mới vào `gallery_urls`.

### Data lineage
- Input DTO: `AddRestaurantGalleryImageDto`
- Controller: `RestaurantController.addRestaurantGalleryImage`
- Service: `RestaurantService.addRestaurantGalleryImage`
- Repository: `RestaurantRepository.update`
- Schema write field: `gallery_urls`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param: `id` (ObjectId)
- Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `image_url` | string | true | DTO HTTPS URL + Service image URL policy |

Business rule:
- tối đa 20 ảnh trong gallery

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "gallery_urls": [
      "https://res.cloudinary.com/demo/image/upload/v1/restaurants/gallery-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/restaurants/gallery-2.jpg"
    ],
    "count": 2
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: URL sai rule hoặc vượt giới hạn 20 ảnh
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `429 Too Many Requests`: vượt limit ảnh theo giờ
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.14 DELETE /restaurants/{id}/gallery/{index}
### Mục đích
Xóa ảnh khỏi `gallery_urls` theo vị trí index.

### Data lineage
- Input: path `id`, `index`
- Controller: `RestaurantController.removeRestaurantGalleryImage`
- Service: `RestaurantService.removeRestaurantGalleryImage`
- Repository: `RestaurantRepository.update`
- Schema write field: `gallery_urls`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path params:

| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | string(ObjectId) | true | `ParseObjectIdPipe` |
| `index` | integer | true | `ParseIntPipe`, service requires `index >= 0` |

### Dữ liệu ra (Response)
- HTTP `200`
- Cấu trúc payload giống endpoint thêm ảnh (`gallery_urls`, `count`)

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: id/index không hợp lệ, index < 0
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại hoặc index vượt số lượng ảnh
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.15 DELETE /restaurants/{id}
### Mục đích
Xóa mềm nhà hàng (`deleted_at`) khi không có đơn hàng active.

### Data lineage
- Input: path `id`
- Controller: `RestaurantController.deleteRestaurant`
- Service: `RestaurantService.deleteRestaurant`
- Repository: `OrderRepository.countActiveByRestaurant`, `RestaurantRepository.softDelete`
- Schema write fields: `deleted_at`, `is_published`, `updated_at`

### Dữ liệu vào (Request)
- Header: `Authorization` required
- Path param:

| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | string(ObjectId) | true | `ParseObjectIdPipe` |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Nhà hàng đã được xóa.",
  "data": {
    "deleted": true,
    "message": "Nhà hàng đã được xóa."
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: id không hợp lệ
- `401 Unauthorized`: thiếu/invalid token
- `403 Forbidden`: không có quyền
- `404 Not Found`: nhà hàng không tồn tại
- `409 Conflict`: nhà hàng còn đơn active nên không thể xóa
- `429 Too Many Requests`: vượt limit thao tác update/delete
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.16 GET /public/restaurants
### Mục đích
Tìm kiếm nhà hàng public (đã publish), hỗ trợ lọc theo vị trí và phân trang.

### Data lineage
- Input DTO: `SearchRestaurantDto`
- Controller: `PublicRestaurantController.searchPublicRestaurants`
- Service: `RestaurantService.searchRestaurants`
- Repository: `RestaurantRepository.search` (aggregation pipeline)
- Schema read fields: projection subset (không phải full document)

### Dữ liệu vào (Request)
- Header:
  - Không yêu cầu auth (public)
- Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `city` | string | true | `@IsString`, `@IsNotEmpty` |
| `cuisine_type` | string | false | `@IsString` |
| `price_range` | number[] | false | `@Transform`, `@IsNumber(each)`, `@IsIn([1,2,3,4],each)`, `@ArrayUnique` |
| `accepts_online` | boolean | false | `@Transform`, `@IsBoolean` |
| `lat` | number | false | `@ValidateIf(lat/lng pair)`, `@Min(-90)`, `@Max(90)` |
| `lng` | number | false | `@ValidateIf(lat/lng pair)`, `@Min(-180)`, `@Max(180)` |
| `radius_km` | number | false | `@Min(1)`, `@Max(50)` |
| `q` | string | false | `@IsString` |
| `sort` | string | false | `@IsIn(['distance','name'])` |
| `page` | number | false | `@Min(1)` |
| `limit` | number | false | `@Min(1)`, `@Max(50)` |

### Dữ liệu ra (Response)
- HTTP `200`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "data": [
      {
        "_id": "string",
        "name": "string",
        "slug": "string",
        "description": "string|null",
        "cuisine_type": "string|null",
        "price_range": "number|null",
        "logo_url": "string|null",
        "cover_image_url": "string|null",
        "address": "string",
        "city": "string",
        "district": "string|null",
        "ward": "string|null",
        "latitude": "number|null",
        "longitude": "number|null",
        "phone": "string|null",
        "operating_hours": {
          "mon": { "open": "08:00", "close": "22:00", "closed": false },
          "tue": { "open": "08:00", "close": "22:00", "closed": false },
          "wed": { "open": "08:00", "close": "22:00", "closed": false },
          "thu": { "open": "08:00", "close": "22:00", "closed": false },
          "fri": { "open": "08:00", "close": "22:00", "closed": false },
          "sat": { "open": "08:00", "close": "22:00", "closed": false },
          "sun": { "open": "08:00", "close": "22:00", "closed": false }
        },
        "accepts_online_orders": true,
        "distance_km": 2.4
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Type notes:
- `distance_km`: `number|null` (null nếu không truyền lat/lng)

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: query invalid
- `429 Too Many Requests`: vượt limit public search
- `500 Internal Server Error`: lỗi hệ thống

---

## 2.17 GET /public/restaurants/{slug}
### Mục đích
Lấy chi tiết nhà hàng public theo slug (chỉ trả nhà hàng đã publish).

### Data lineage
- Input: path `slug`
- Controller: `PublicRestaurantController.getPublicRestaurantBySlug`
- Service: `RestaurantService.getRestaurantDetailsBySlug`
- Repository: `RestaurantRepository.getBySlug` và/hoặc `RestaurantService.handleGetResAndThrow`
- Schema read fields: gần full document, sau đó service omit `owner_id`, `settings`

### Dữ liệu vào (Request)
- Header:
  - Không yêu cầu auth (public)
- Path param:

| Field | Type | Required | Validation |
|---|---|---|---|
| `slug` | string | true | `SlugValidationPipe` |

### Dữ liệu ra (Response)
- HTTP `200`
- Cấu trúc gần full schema, trừ 2 field bị ẩn cố ý (`owner_id`, `settings`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "name": "string",
    "slug": "string",
    "description": "string|null",
    "cuisine_type": "string|null",
    "price_range": "number|null",
    "logo_url": "string|null",
    "cover_image_url": "string|null",
    "gallery_urls": ["string"],
    "address": "string",
    "city": "string",
    "district": "string|null",
    "ward": "string|null",
    "latitude": "number|null",
    "longitude": "number|null",
    "location": {
      "type": "Point",
      "coordinates": [106.7009, 10.7769]
    },
    "phone": "string|null",
    "email": "string|null",
    "website": "string|null",
    "operating_hours": {
      "mon": { "open": "08:00", "close": "22:00", "closed": false },
      "tue": { "open": "08:00", "close": "22:00", "closed": false },
      "wed": { "open": "08:00", "close": "22:00", "closed": false },
      "thu": { "open": "08:00", "close": "22:00", "closed": false },
      "fri": { "open": "08:00", "close": "22:00", "closed": false },
      "sat": { "open": "08:00", "close": "22:00", "closed": false },
      "sun": { "open": "08:00", "close": "22:00", "closed": false }
    },
    "timezone": "Asia/Ho_Chi_Minh",
    "currency": "VND",
    "tax_rate": 0.1,
    "service_charge_rate": 0,
    "is_published": true,
    "accepts_online_orders": true,
    "deleted_at": null,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

Omitted fields (intentional):
- `owner_id`: tránh lộ định danh owner ở public endpoint
- `settings`: cấu hình nội bộ không public

### Xử lý lỗi (Exception handling)
- `400 Bad Request`: slug không hợp lệ
- `404 Not Found`: slug không tồn tại hoặc nhà hàng chưa publish
- `500 Internal Server Error`: lỗi hệ thống

---

## 3. Error Code Summary by Source

### 3.1 Validation and Param Errors
- `400 INVALID_ID_ERROR`: ObjectId path param invalid (`ParseObjectIdPipe`)
- `400 INVALID_SLUG_FORMAT`: slug format invalid (`SlugValidationPipe`)
- `400 VALIDATION_ERROR`: DTO constraints fail, business validation fail (operating hours/settings/image URL policy)

### 3.2 Auth and Authorization Errors
- `401 UNAUTHORIZED`: missing token / invalid token / revoked token
- `401 TOKEN_EXPIRED`: expired JWT
- `403 FORBIDDEN`: thiếu quyền owner/staff/admin phù hợp

### 3.3 Business Conflict and Limits
- `404 RESTAURANT_NOT_FOUND`: nhà hàng không tồn tại
- `404 RESOURCE_NOT_FOUND`: phần tử gallery index không tồn tại
- `409 CONFLICT_ERROR`: slug đã tồn tại hoặc không thể xóa vì còn active orders
- `429 TOO_MANY_REQUESTS`: create/update/image/public-search/check-slug rate limit

### 3.4 Internal Errors
- `500 INTERNAL_ERROR`: lỗi hệ thống không mong muốn

---

## 4. Validation Consistency Notes
- `service_charge_rate` schema `min: 0.01` nhưng service create set `0.000` và DTO update cho phép `>=0`.
- Public detail endpoint vẫn trả `tax_rate` và `service_charge_rate`; chỉ ẩn `owner_id` và `settings` theo logic service hiện tại.
- Staff private detail endpoint ẩn `tax_rate`, `service_charge_rate`, `settings`.
- Search endpoint luôn lọc `is_published=true` và `deleted_at=null` tại repository level.
