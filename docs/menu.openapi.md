# Menu Module OpenAPI Documentation

## 1. Data Lineage

## 1.1 Files da truy vet
- DTO input/output:
  - src/modules/restaurant/dto/menu.dto.ts
- Controller entrypoint:
  - src/modules/restaurant/controllers/menu.controller.xxx.ts
- Service business logic:
  - src/modules/restaurant/services/menu.service.xxx.ts
- Repository data access:
  - src/modules/restaurant/repositories/menu-category.repository.ts
  - src/modules/restaurant/repositories/menu-item.repository.ts
  - src/modules/restaurant/repositories/restaurant.repository.ts
- Schema database model:
  - src/modules/restaurant/schemas/menu-category.schema.ts
  - src/modules/restaurant/schemas/menu-item.schema.ts
  - src/modules/restaurant/schemas/restaurant.schema.xxx.ts
- Guard/Pipe/Interceptor lien quan auth va response:
  - src/common/guards/jwt-auth.guard.ts
  - src/common/guards/system-role.guard.ts
  - src/common/guards/restaurant-auth.guard.ts
  - src/common/pipes/parse-id.pipe.ts
  - src/common/pipes/slug.pipe.ts
  - src/common/interceptors/transform-response.interceptor.ts

## 1.2 Luong API theo endpoint (DTO -> Controller -> Service -> Repository -> Schema)

| Endpoint | DTO | Controller | Service | Repository | Schema fields read/write |
|---|---|---|---|---|---|
| POST /restaurants/{id}/menu/categories | CreateMenuCategoryDto | createCategory | createCategory | MenuCategoryRepository.countActiveByRestaurant, getMaxSortOrderByRestaurant, createOne | write category: restaurant_id, name, description, image_url, sort_order, is_active |
| GET /restaurants/{id}/menu/categories | ListMenuCategoryQueryDto | listCategories | listCategories | MenuCategoryRepository.listByRestaurant, MenuItemRepository.countByCategoryMap | read category: _id, restaurant_id, name, description, image_url, sort_order, is_active, created_at, updated_at; compute extra item_count |
| PATCH /restaurants/{id}/menu/categories/reorder | ReorderMenuCategoriesDto | reorderCategories | reorderCategories | MenuCategoryRepository.listIdsByRestaurant, bulkReorder | write category.sort_order |
| PATCH /restaurants/{id}/menu/categories/{cat_id} | UpdateMenuCategoryDto | updateCategory | updateCategory | MenuCategoryRepository.findByIdInRestaurant, updateInRestaurant | write category: name, description, image_url |
| PATCH /restaurants/{id}/menu/categories/{cat_id}/toggle | ToggleMenuCategoryDto | toggleCategory | toggleCategoryActive | MenuCategoryRepository.findByIdInRestaurant, countActiveByRestaurant, toggleActive | write category.is_active |
| DELETE /restaurants/{id}/menu/categories/{cat_id} | path params | deleteCategory | deleteCategory | MenuCategoryRepository.findByIdInRestaurant, MenuItemRepository.countByCategory, deleteInRestaurant | delete category hard-delete row |
| POST /restaurants/{id}/menu/items | CreateMenuItemDto | createItem | createItem | MenuCategoryRepository.findByIdInRestaurant, MenuItemRepository.countByCategory, getMaxSortOrderByCategory, create | write item: restaurant_id, category_id, name, description, base_price, images, is_available, is_featured, sort_order, deleted_at |
| GET /restaurants/{id}/menu/items | ListMenuItemsQueryDto | listItems | listItems | MenuItemRepository.listByRestaurant | read item: full item schema (except filtered by deleted_at=null) |
| PATCH /restaurants/{id}/menu/items/reorder | ReorderMenuItemsDto | reorderItems | reorderItems | MenuCategoryRepository.findByIdInRestaurant, MenuItemRepository.listIdsByCategory, bulkReorderByCategory | write item.sort_order |
| GET /restaurants/{id}/menu/items/{item_id} | path params | getItemDetail | getItemDetail -> getItemOrThrow | MenuItemRepository.findByIdInRestaurant | read item full schema |
| PATCH /restaurants/{id}/menu/items/{item_id} | UpdateMenuItemDto | updateItem | updateItem | MenuItemRepository.findByIdInRestaurant, MenuCategoryRepository.findByIdInRestaurant, updateInRestaurant | write item: category_id, name, description, base_price |
| PATCH /restaurants/{id}/menu/items/{item_id}/availability | ToggleMenuItemAvailabilityDto | toggleItemAvailability | toggleItemAvailability | MenuItemRepository.findByIdInRestaurant, OrderRepository.countActiveOrderItems, toggleAvailability | write item.is_available; read order refs for warnings |
| PATCH /restaurants/{id}/menu/items/{item_id}/featured | ToggleMenuItemFeaturedDto | toggleItemFeatured | toggleItemFeatured | MenuItemRepository.findByIdInRestaurant, toggleFeatured | write item.is_featured |
| POST /restaurants/{id}/menu/items/{item_id}/images | AddMenuItemImageDto | addItemImage | addItemImage | MenuItemRepository.findByIdInRestaurant, appendImage | write item.images[] |
| DELETE /restaurants/{id}/menu/items/{item_id}/images/{index} | path params | removeItemImage | removeItemImage | MenuItemRepository.findByIdInRestaurant, removeImageAt | write item.images[] |
| DELETE /restaurants/{id}/menu/items/{item_id} | path params | softDeleteItem | softDeleteItem | MenuItemRepository.findByIdInRestaurant, softDeleteInRestaurant | write item.deleted_at, item.is_available=false |
| GET /public/restaurants/{slug}/menu | slug param | getPublicMenuBySlug | getPublicMenuBySlug | RestaurantRepository.getBySlug (through RestaurantService), MenuCategoryRepository.listByRestaurant, MenuItemRepository.listPublicAvailableByRestaurant | read published restaurant + category active + item available; response omits private/internal fields by ObjectUtil.omit/pick |
| GET /public/restaurants/{slug}/menu/search | PublicMenuSearchQueryDto | searchPublicMenuItem | searchPublicMenuItem | RestaurantRepository.getBySlug (through RestaurantService), MenuItemRepository.searchPublicAvailableByRestaurant ($text + lookup category) | read item available + category active; response returns projected search fields |

## 1.3 Response envelope chuan
Tat ca endpoint duoc wrap boi TransformResponseInterceptor.

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

## 1.4 Zero-omission inventory tu schema

### MenuCategory schema field goc
- _id: ObjectId
- restaurant_id: ObjectId
- name: string
- description: string|null
- image_url: string|null
- sort_order: number
- is_active: boolean
- created_at: date-time (timestamps)
- updated_at: date-time (timestamps)

### MenuItem schema field goc
- _id: ObjectId
- restaurant_id: ObjectId
- category_id: ObjectId|null
- name: string
- description: string|null
- base_price: number
- images: array<{ url: string, alt: string }>
- is_available: boolean
- is_featured: boolean
- sort_order: number
- deleted_at: date-time|null
- created_at: date-time (timestamps)
- updated_at: date-time (timestamps)

### Mapping MenuCategory fields theo response
| Field | Create category | List categories | Update category | Toggle category | Delete category | Public menu | Ghi chu |
|---|---|---|---|---|---|---|---|
| _id | co | co | co (nested category) | khong | khong | khong | Public menu co category summary khong tra id |
| restaurant_id | co | co | co (nested category) | khong | khong | khong | Public payload da omit restaurant_id |
| name | co | co | co | khong | khong | co | |
| description | co | co | co | khong | khong | co | |
| image_url | co | co | co | khong | khong | co | |
| sort_order | co | co | co | khong | khong | khong | Public menu category da omit sort_order |
| is_active | co | co | co | co | khong | co | |
| created_at | co | co | co | khong | khong | khong | Public menu category da omit created_at |
| updated_at | co | co | co | khong | khong | khong | Public menu category da omit updated_at |
| item_count (derived) | khong | co | khong | khong | khong | khong | Field tinh toan tu aggregate, khong thuoc schema |

### Mapping MenuItem fields theo response
| Field | Create item | List items | Item detail | Update item | Toggle available | Toggle featured | Image add/remove | Soft delete | Public menu | Public search | Ghi chu |
|---|---|---|---|---|---|---|---|---|---|---|---|
| _id | co | co | co | co (nested item) | khong | khong | khong | khong | co | co | |
| restaurant_id | co | co | co | co | khong | khong | khong | khong | khong | khong | Public responses da omit field noi bo |
| category_id | co | co | co | co | khong | khong | khong | khong | khong | khong | Public search tra category object thay vi category_id |
| name | co | co | co | co | khong | khong | khong | khong | co | co | |
| description | co | co | co | co | khong | khong | khong | khong | co | co | |
| base_price | co | co | co | co | khong | khong | khong | khong | co | co | |
| images | co | co | co | co | khong | khong | co | khong | co | co | |
| is_available | co | co | co | co | co | khong | khong | khong | khong (chi available item) | khong (chi available item) | Public endpoint chi tra item available nen field duoc implicit |
| is_featured | co | co | co | co | khong | co | khong | khong | co | co | |
| sort_order | co | co | co | co | khong | khong | khong | khong | co | khong | Public search projection khong tra sort_order |
| deleted_at | co (default null) | co (neu chua xoa se null) | co | co | khong | khong | khong | khong | khong | khong | Public endpoint loc deleted_at=null nen khong can expose |
| created_at | co | co | co | co | khong | khong | khong | khong | khong | khong | Public payload da omit created_at |
| updated_at | co | co | co | co | khong | khong | khong | khong | khong | khong | Public payload da omit updated_at |
| warnings (derived) | khong | khong | khong | khong | co | khong | khong | khong | khong | khong | Warning business tu OrderRepository, khong thuoc schema |
| score (derived) | khong | khong | khong | khong | khong | khong | khong | khong | khong | co | Text score cua full-text search |

### Restaurant fields trong public menu response
Public endpoint `GET /public/restaurants/{slug}/menu` tra object `restaurant` duoc lay tu RestaurantService/getRestaurantDetailsBySlug va tiep tuc omit them cac field `_id`, `slug`, `owner_id`, `settings`, `created_at`, `updated_at`, `__v`.

Field con lai trong `restaurant` public menu:
- name, description, cuisine_type, price_range, logo_url, cover_image_url, gallery_urls
- address, city, district, ward, latitude, longitude, location
- phone, email, website, operating_hours, timezone
- currency, tax_rate, service_charge_rate
- is_published, accepts_online_orders, deleted_at

Ket luan zero-omission:
- Khong bo sot field schema MenuCategory/MenuItem trong tai lieu.
- Moi field khong xuat hien o response da duoc giai thich ro ly do: endpoint command tra payload toi gian, endpoint public co omit/pick co chu dich, hoac field la derived field khong thuoc schema.

---

## 2. API Specification

## 2.1 POST /restaurants/{id}/menu/categories
### Muc dich
Tao danh muc menu moi cho nha hang. Neu khong gui `sort_order`, he thong tu tinh theo max(sort_order)+1.

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
| name | string | true | IsString, trim, MinLength(1), MaxLength(150) |
| description | string\|null | false | IsString, trim |
| image_url | string\|null | false | IsString, trim, regex HTTPS image |
| sort_order | integer | false | Type(Number), IsInt, Min(0) |

Service constraints:
- Rate limit write menu: 30 requests/phut/restaurant.
- So danh muc active toi da: 50.

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
    "name": "string",
    "description": "string|null",
    "image_url": "string|null",
    "sort_order": 0,
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
  - payload khong dung validation
  - dat gioi han 50 danh muc active
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - context restaurant khong ton tai/khong truy cap duoc
- 429 Too Many Requests
  - vuot `ratelimit:menu:write:{restaurant_id}`
- 500 Internal Server Error

---

## 2.2 GET /restaurants/{id}/menu/categories
### Muc dich
Lay danh sach danh muc cua nha hang; mac dinh chi tra category active.

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
| include_inactive | boolean | false | IsBoolean, default false |

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
        "_id": "string",
        "restaurant_id": "string",
        "name": "string",
        "description": "string|null",
        "image_url": "string|null",
        "sort_order": 0,
        "is_active": true,
        "created_at": "date-time",
        "updated_at": "date-time",
        "item_count": 12
      }
    ]
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
- 500 Internal Server Error

---

## 2.3 PATCH /restaurants/{id}/menu/categories/reorder
### Muc dich
Sap xep lai toan bo thu tu category trong nha hang.

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
| order | string[] (ObjectId) | true | IsArray, ArrayNotEmpty, IsMongoId(each=true) |

Service constraints:
- `order` phai chua day du tat ca category id hien co trong nha hang.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "reordered": true
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - order khong hop le / thieu id
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - category khong ton tai trong nha hang
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.4 PATCH /restaurants/{id}/menu/categories/{cat_id}
### Muc dich
Cap nhat thong tin category theo patch payload.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| cat_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| name | string | false | IsString, trim, MinLength(1), MaxLength(150) |
| description | string\|null | false | IsString, trim |
| image_url | string\|null | false | IsString, trim, regex HTTPS image |

Service constraints:
- Payload phai co it nhat 1 field hop le.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "category": {
      "_id": "string",
      "restaurant_id": "string",
      "name": "string",
      "description": "string|null",
      "image_url": "string|null",
      "sort_order": 0,
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
  - payload rong/khong co field hop le
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - category khong ton tai
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.5 PATCH /restaurants/{id}/menu/categories/{cat_id}/toggle
### Muc dich
Bat/tat category qua field `is_active`.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| cat_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| is_active | boolean | true | IsBoolean |

Service constraints:
- Neu chuyen sang `true`, he thong check lai gioi han 50 category active.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "is_active": false,
    "message": "Da an"
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
- 500 Internal Server Error

---

## 2.6 DELETE /restaurants/{id}/menu/categories/{cat_id}
### Muc dich
Xoa category (hard delete) khi category khong con mon an nao.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| cat_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
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

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - category van con item (deleted_at=null)
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.7 POST /restaurants/{id}/menu/items
### Muc dich
Tao mon an moi trong category cua nha hang.

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
| category_id | string(ObjectId) | true | IsMongoId |
| name | string | true | IsString, trim, MinLength(1), MaxLength(200) |
| description | string\|null | false | IsString, trim |
| base_price | number | true | Type(Number), IsNumber, Min(0) |
| is_available | boolean | false | IsBoolean, default true |
| is_featured | boolean | false | IsBoolean, default false |
| sort_order | integer | false | IsInt, Min(0) |

Service constraints:
- category_id phai ton tai trong nha hang.
- Moi category toi da 200 item chua xoa mem.
- Neu khong gui sort_order: tu tinh max(sort_order)+1.

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
    "category_id": "string",
    "name": "string",
    "description": "string|null",
    "base_price": 79000,
    "images": [],
    "is_available": true,
    "is_featured": false,
    "sort_order": 0,
    "deleted_at": null,
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - payload invalid
  - dat gioi han 200 item/category
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - category khong ton tai
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.8 GET /restaurants/{id}/menu/items
### Muc dich
Lay danh sach item theo nha hang, co loc category/status/noi bat va phan trang.

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
| category_id | string(ObjectId) | false | IsMongoId |
| is_available | boolean | false | IsBoolean |
| is_featured | boolean | false | IsBoolean |
| page | integer | false | IsInt, Min(1), default 1 |
| limit | integer | false | IsInt, Min(1), Max(100), default 50 |

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
        "_id": "string",
        "restaurant_id": "string",
        "category_id": "string",
        "name": "string",
        "description": "string|null",
        "base_price": 79000,
        "images": [{ "url": "string", "alt": "string" }],
        "is_available": true,
        "is_featured": false,
        "sort_order": 0,
        "deleted_at": null,
        "created_at": "date-time",
        "updated_at": "date-time"
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

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

## 2.9 PATCH /restaurants/{id}/menu/items/reorder
### Muc dich
Sap xep lai toan bo item trong mot category.

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
| category_id | string(ObjectId) | true | IsMongoId |
| order | string[] (ObjectId) | true | IsArray, ArrayNotEmpty, IsMongoId(each=true) |

Service constraints:
- category_id phai ton tai trong nha hang.
- order phai chua day du tat ca item id trong category (khong thieu/khong du).

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "reordered": true
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
- 500 Internal Server Error

---

## 2.10 GET /restaurants/{id}/menu/items/{item_id}
### Muc dich
Lay chi tiet item theo item_id.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "_id": "string",
    "restaurant_id": "string",
    "category_id": "string",
    "name": "string",
    "description": "string|null",
    "base_price": 79000,
    "images": [{ "url": "string", "alt": "string" }],
    "is_available": true,
    "is_featured": false,
    "sort_order": 0,
    "deleted_at": null,
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
- 404 Not Found
- 500 Internal Server Error

---

## 2.11 PATCH /restaurants/{id}/menu/items/{item_id}
### Muc dich
Cap nhat thong tin item (partial update).

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| category_id | string(ObjectId) | false | IsMongoId |
| name | string | false | IsString, trim, MinLength(1), MaxLength(200) |
| description | string\|null | false | IsString, trim |
| base_price | number | false | Type(Number), IsNumber, Min(0) |

Service constraints:
- Payload phai co it nhat 1 field hop le.
- Neu doi category_id thi category moi phai ton tai trong nha hang.

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "updated": true,
    "item": {
      "_id": "string",
      "restaurant_id": "string",
      "category_id": "string",
      "name": "string",
      "description": "string|null",
      "base_price": 79000,
      "images": [{ "url": "string", "alt": "string" }],
      "is_available": true,
      "is_featured": false,
      "sort_order": 0,
      "deleted_at": null,
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
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.12 PATCH /restaurants/{id}/menu/items/{item_id}/availability
### Muc dich
Bat/tat trang thai ban cua mon an. Neu tat mon dang duoc xu ly trong order active, API tra warnings.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| is_available | boolean | true | IsBoolean |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "is_available": false,
    "message": "Het hang",
    "warnings": [
      "Co 2 mon dang duoc xu ly"
    ]
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
- 500 Internal Server Error

---

## 2.13 PATCH /restaurants/{id}/menu/items/{item_id}/featured
### Muc dich
Bat/tat danh dau noi bat cho mon an.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| is_featured | boolean | true | IsBoolean |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "is_featured": true,
    "message": "Da danh dau noi bat"
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
- 500 Internal Server Error

---

## 2.14 POST /restaurants/{id}/menu/items/{item_id}/images
### Muc dich
Them anh moi vao danh sach images cua mon.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| url | string(URL) | true | IsString, IsUrl, regex HTTPS image |
| alt | string | false | IsString, MaxLength(255) |

Service constraints:
- Moi item toi da 10 anh.
- Rate limit image theo item: 20 requests/gio/item.

### Du lieu ra (Response)
HTTP 201

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request was successful",
  "data": {
    "images": [
      { "url": "string", "alt": "string" }
    ],
    "count": 1
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - url invalid
  - dat toi da 10 anh
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests
  - vuot write limit hoac image limit
- 500 Internal Server Error

---

## 2.15 DELETE /restaurants/{id}/menu/items/{item_id}/images/{index}
### Muc dich
Xoa anh mon an tai vi tri index trong mang images.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |
| index | integer | true | ParseIntPipe, index >= 0 |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "images": [
      { "url": "string", "alt": "string" }
    ],
    "count": 1
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - index < 0 hoac parse fail
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - item khong ton tai
  - index vuot do dai mang images
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.16 DELETE /restaurants/{id}/menu/items/{item_id}
### Muc dich
Xoa mem mon an (set deleted_at va is_available=false).

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
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

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.17 GET /public/restaurants/{slug}/menu
### Muc dich
Lay menu public cua nha hang da publish theo slug, gom thong tin nha hang + category active + item available.

### Du lieu vao (Request)
### Header
- Khong yeu cau Authorization.

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| slug | string | true | SlugValidationPipe |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "restaurant": {
      "name": "string",
      "description": "string|null",
      "cuisine_type": "string|null",
      "price_range": 2,
      "logo_url": "string|null",
      "cover_image_url": "string|null",
      "gallery_urls": ["string"],
      "address": "string",
      "city": "string",
      "district": "string|null",
      "ward": "string|null",
      "latitude": 10.7769,
      "longitude": 106.7009,
      "location": {
        "type": "Point",
        "coordinates": [106.7009, 10.7769]
      },
      "phone": "string|null",
      "email": "string|null",
      "website": "string|null",
      "operating_hours": {
        "mon": { "open": "08:00", "close": "22:00", "closed": false }
      },
      "timezone": "Asia/Ho_Chi_Minh",
      "currency": "VND",
      "tax_rate": 0.1,
      "service_charge_rate": 0.01,
      "is_published": true,
      "accepts_online_orders": true,
      "deleted_at": null
    },
    "categories": [
      {
        "name": "string",
        "description": "string|null",
        "image_url": "string|null",
        "is_active": true,
        "items": [
          {
            "_id": "string",
            "name": "string",
            "description": "string|null",
            "base_price": 79000,
            "images": [{ "url": "string", "alt": "string" }],
            "is_featured": false,
            "sort_order": 0
          }
        ]
      }
    ]
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - slug invalid format
- 404 Not Found
  - nha hang khong ton tai hoac chua publish
- 500 Internal Server Error

---

## 2.18 GET /public/restaurants/{slug}/menu/search
### Muc dich
Tim kiem mon an public theo full-text (`name`, `description`) trong nha hang da publish.

### Du lieu vao (Request)
### Header
- Khong yeu cau Authorization.

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| slug | string | true | SlugValidationPipe |

### Query Param
| Field | Type | Required | Validation |
|---|---|---|---|
| q | string | true | IsString, trim, MinLength(1), MaxLength(100) |
| page | integer | false | IsInt, Min(1), default 1 |
| limit | integer | false | IsInt, Min(1), Max(50), default 20 |

### Du lieu ra (Response)
HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "query": "pho",
    "data": [
      {
        "_id": "string",
        "name": "Pho Bo Tai",
        "description": "string|null",
        "base_price": 79000,
        "is_featured": false,
        "images": [{ "url": "string", "alt": "string" }],
        "category": {
          "_id": "string",
          "name": "Mon Nuoc"
        },
        "score": 12.843
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "total_pages": 2
    }
  },
  "correlationId": "string",
  "timestamp": "date-time"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - slug invalid
  - q/page/limit invalid
- 404 Not Found
  - nha hang khong ton tai hoac chua publish
- 429 Too Many Requests
  - vuot throttle `public-menu-search` (60 req/phut/IP)
- 500 Internal Server Error
