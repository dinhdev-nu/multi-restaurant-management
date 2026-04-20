# Order Module OpenAPI Documentation

## 1. Data Lineage

## 1.1 Files da truy vet
- DTO input/output:
  - src/modules/order/dto/order.dto.ts
  - src/modules/order/dto/create-order.dto.ts (re-export)
  - src/modules/order/dto/update-order.dto.ts (re-export)
  - src/modules/order/dto/change-order-status.dto.ts (re-export)
- Controller entrypoint:
  - src/modules/order/order.controller.ts
- Service business logic:
  - src/modules/order/order.service.ts
- Repository data access:
  - src/modules/order/repositories/order.repository.ts
- Database schemas:
  - src/modules/order/schemas/order.schema.xxx.ts
  - src/modules/order/schemas/order-item.schema.xxx.ts
- Phu thuoc lien quan business rule:
  - src/modules/restaurant/schemas/table.schema.ts
  - src/modules/restaurant/schemas/menu-item.schema.ts
  - src/modules/restaurant/restaurant.service.xxx.ts
- Auth/public interceptor:
  - src/modules/order/interceptors/optional-public-user.interceptor.ts

## 1.2 Lineage theo tung endpoint

| Endpoint | DTO | Controller | Service | Repository | Schema read/write |
|---|---|---|---|---|---|
| POST /restaurants/{id}/orders | CreatePosOrderDto | createPosOrder | createPosOrder | createOne, saveOrder | write almost full Order schema; read menu/table/restaurant snapshots |
| GET /restaurants/{id}/orders | ListOrdersQueryDto | listOrders | listOrders | listByRestaurant | read list projection from Order |
| GET /restaurants/{id}/orders/{order_id} | path params | getOrderDetail | getOrderDetail | findByIdInRestaurant | read full Order + items |
| POST /restaurants/{id}/orders/{order_id}/items | AddOrderItemsDto | addOrderItems | addOrderItems | addItemsToOrder, updateOrderTotals | write items array + recomputed totals |
| PATCH /restaurants/{id}/orders/{order_id}/items/{item_id} | UpdateOrderItemDto | updateOrderItem | updateOrderItem | updateItemQuantityAndNotes, updateOrderTotals | write item.quantity/item.notes + totals |
| DELETE /restaurants/{id}/orders/{order_id}/items/{item_id} | CancelOrderItemDto | cancelOrderItem | cancelOrderItem | cancelOrderItem, updateOrderTotals | write item.status/item.notes + totals |
| PATCH /restaurants/{id}/orders/{order_id}/status | UpdateOrderStatusDto | updateOrderStatus | updateOrderStatus | updateOrderStatus | write order.status (+ staff_id/completed_at/cancelled_at theo transition) |
| PATCH /restaurants/{id}/orders/{order_id}/items/{item_id}/status | UpdateOrderItemStatusDto | updateOrderItemStatus | updateOrderItemStatus | updateOrderStatus (giu order.status) | write updated_at tren order (runtime hien tai) |
| PATCH /restaurants/{id}/orders/{order_id}/discount | UpdateOrderDiscountDto | updateOrderDiscount | updateOrderDiscount | update | write discount fields + recomputed totals |
| PATCH /restaurants/{id}/orders/{order_id}/cancel | CancelOrderDto | cancelOrder | cancelOrder | cancelOrder, cancelMultipleOrderItems, countOtherActiveByTable | write order.status=cancelled + cancel fields + pending item status |
| GET /restaurants/{id}/tables/{table_id}/active-order | path params | getActiveOrderByTable | getActiveOrderByTable | findActiveByTable | read full active order or null |
| POST /public/orders | CreatePublicOrderDto | createPublicOrder | createPublicOrder | createOne, saveOrder | write full Order schema + response message |

## 1.3 Response envelope chuan
Tat ca endpoint duoc wrap boi TransformResponseInterceptor:

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

## 1.4 Shared response data schemas

### 1.4.1 Enum dictionary (gia tri + y nghia)

- OrderType:
  - dine_in: don tai ban trong nha hang
  - takeaway: khach mang di
  - delivery: don giao hang
  - online: don tao tu kenh online noi bo/he thong
- OrderStatus:
  - pending: moi tao, cho xu ly
  - confirmed: da xac nhan don
  - preparing: dang chuan bi mon
  - ready: san sang phuc vu/giao
  - delivering: dang giao hang
  - completed: da hoan tat
  - cancelled: da huy
  - refunded: da hoan tien
- OrderPaymentStatus:
  - unpaid: chua thanh toan
  - partial: thanh toan mot phan
  - paid: da thanh toan du
  - partially_refunded: da hoan tien mot phan
  - refunded: da hoan tien toan bo
- OrderDiscountType:
  - none: khong ap dung giam gia
  - percent: giam theo ty le phan tram
  - fixed: giam so tien co dinh
  - coupon: giam gia theo coupon/chuong trinh
- OrderSource:
  - pos: tao tai quay (point of sale)
  - online: kenh dat online
  - qr: tao tu QR table/menu
  - app: tao tu ung dung
  - phone: tao tu don dat qua dien thoai
- OrderItemStatus:
  - pending: item moi tao
  - preparing: item dang lam
  - ready: item da san sang
  - served: item da phuc vu
  - cancelled: item da huy

### OrderItem snapshot fields
| Field | Type | Nullable | Source |
|---|---|---|---|
| _id | string | yes | subdocument id trong items[] |
| menu_item_id | string | no | snapshot tu menu item id |
| item_name | string | no | snapshot ten mon |
| quantity | number | no | so luong |
| unit_price | number | no | gia tai thoi diem dat |
| total_price | number | no | unit_price x quantity |
| status | enum(pending, preparing, ready, served, cancelled) | no | trang thai item |
| notes | string | yes | ghi chu item |
| created_at | date-time string | no | timestamp item |
| updated_at | date-time string | yes | timestamp item update |

### Order persisted fields (full payload)
| Field | Type | Nullable | Source schema |
|---|---|---|---|
| id | string | yes | virtual id (co the co/khong tu cach serialize) |
| _id | string | no | ObjectId order |
| order_number | string | no | order_number |
| restaurant_id | string | no | restaurant_id |
| table_id | string | yes | table_id |
| user_id | string | yes | user_id |
| customer_name | string | yes | customer_name |
| customer_phone | string | yes | customer_phone |
| staff_id | string | yes | staff_id |
| order_type | enum(dine_in, takeaway, delivery, online) | no | order_type |
| status | enum(pending, confirmed, preparing, ready, delivering, completed, cancelled, refunded) | no | status |
| payment_status | enum(unpaid, partial, paid, partially_refunded, refunded) | no | payment_status |
| items | array<object> | no | items[] |
| subtotal | number | no | subtotal |
| discount_type | enum(none, percent, fixed, coupon) | no | discount_type |
| discount_ref | string | yes | discount_ref |
| discount_value | number | no | discount_value |
| discount_amount | number | no | discount_amount |
| tax_rate | number | no | tax_rate |
| tax_amount | number | no | tax_amount |
| service_charge_rate | number | no | service_charge_rate |
| service_charge_amount | number | no | service_charge_amount |
| total_amount | number | no | total_amount |
| currency | string | no | currency |
| source | enum(pos, online, qr, app, phone) | no | source |
| notes | string | yes | notes |
| completed_at | date-time string | yes | completed_at |
| cancelled_at | date-time string | yes | cancelled_at |
| cancel_reason | string | yes | cancel_reason |
| created_at | date-time string | no | created_at |
| updated_at | date-time string | no | updated_at |

## 1.5 Zero-omission matrix

### A. Order schema fields -> endpoint response mapping
| Order schema field | Full doc endpoints (create/detail/active/public) | List endpoint | Mutation summary endpoints | Omit reason neu khong co |
|---|---|---|---|---|
| _id | co | co (_id + id) | thuong khong | command endpoint toi uu payload |
| id (virtual) | co the co | co | mot so endpoint tra id | virtual phu thuoc serialize |
| order_number | co | co | co voi status/cancel | |
| restaurant_id | co | khong | khong | khong can cho command response ngan |
| table_id | co | co | khong | |
| user_id | co | khong | khong | |
| customer_name | co | co | khong | |
| customer_phone | co | khong | khong | |
| staff_id | co | khong | khong | |
| order_type | co | co | khong | |
| status | co | co | co o status/item-status/cancel | |
| payment_status | co | co | khong | |
| items | co | khong (chi item_count) | khong/partial (new_items hoac item) | payload toi uu |
| subtotal | co | khong | co | |
| discount_type | co | khong | co o discount endpoint | |
| discount_ref | co | khong | co o discount/cancel mot phan | |
| discount_value | co | khong | khong | payload toi uu |
| discount_amount | co | khong | co o add/update/cancel item/discount | |
| tax_rate | co | khong | khong | payload toi uu |
| tax_amount | co | khong | co o add/update/cancel item/discount | |
| service_charge_rate | co | khong | khong | payload toi uu |
| service_charge_amount | co | khong | co o add/update/cancel item/discount | |
| total_amount | co | co | co o add/update/cancel item/discount | |
| currency | co | co | khong | |
| source | co | co | khong | |
| notes | co | khong | khong | |
| completed_at | co | khong | khong | |
| cancelled_at | co | khong | co o cancel endpoint | |
| cancel_reason | co | khong | co o cancel endpoint | |
| created_at | co | co | khong | |
| updated_at | co | khong | co o status/item-status | |

### B. Order item schema fields -> endpoint response mapping
| OrderItem schema field | Full doc endpoints | add items response.new_items | update item response.item | cancel item response | Omit reason |
|---|---|---|---|---|---|
| _id | co | khong | co | item_id tach rieng | item moi chua can expose _id ngay |
| menu_item_id | co | co | co | khong | |
| item_name | co | co | co | khong | |
| quantity | co | co | co | khong | |
| unit_price | co | co | co | khong | |
| total_price | co | co | co | khong | |
| status | co | co | co | co (status field) | |
| notes | co | co | co | khong | |
| created_at | co | co | co | khong | |
| updated_at | co the co | khong | co the co | khong | payload toi uu |

Luu y runtime quan trong:
- Endpoint PATCH /orders/{order_id}/items/{item_id}/status hien tai tra status lay tu item da doc truoc update trong memory.
- Endpoint PATCH /orders/{order_id}/cancel hien tai tra status/cancel field theo object order da doc truoc transaction.
- Tai lieu nay mo ta dung runtime hien tai cua service.

---

## 2. API Specification

## 2.1 POST /restaurants/{id}/orders
### Muc dich
Tao don POS moi trong context nha hang. Ho tro dine_in, takeaway, delivery.

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
| order_type | enum(dine_in, takeaway, delivery, online) | true | IsEnum(OrderType) |
| source | enum(pos, online, qr, app, phone) | false | IsEnum(OrderSource) |
| table_id | string(ObjectId) | false* | IsMongoId, bat buoc khi order_type=dine_in |
| customer_name | string\|null | false | IsString, MaxLength(150) |
| customer_phone | string\|null | false | IsString, MaxLength(20) |
| notes | string\|null | false | IsString, MaxLength(1000) |
| items | array<OrderItemInputDto> | false | IsArray + ValidateNested |

OrderItemInputDto:
- menu_item_id: string(ObjectId), required, IsMongoId
- quantity: integer >= 1, required
- notes: string|null, optional, MaxLength(500)

### Du lieu ra (Response)
HTTP 201

Data schema: Order persisted fields (xem muc 1.4).

### Xu ly loi (Exception handling)
- 400 Bad Request
  - table_id missing for dine_in
  - payload validation fail
  - invalid object id
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - restaurant/table/menu item not found
- 409 Conflict
  - table is not available for new order
- 429 Too Many Requests
  - key ratelimit:order:create:{restaurant_id}
- 500 Internal Server Error

---

## 2.2 GET /restaurants/{id}/orders
### Muc dich
Lay danh sach don theo bo loc va phan trang, kem summary doanh thu.

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
| status | enum(pending, confirmed, preparing, ready, delivering, completed, cancelled, refunded) | false | IsEnum(OrderStatus) |
| date | string (ISO date) | false | IsDateString |
| table_id | string(ObjectId) | false | IsMongoId |
| order_type | enum(dine_in, takeaway, delivery, online) | false | IsEnum(OrderType) |
| source | enum(pos, online, qr, app, phone) | false | IsEnum(OrderSource) |
| payment_status | enum(unpaid, partial, paid, partially_refunded, refunded) | false | IsEnum(OrderPaymentStatus) |
| page | integer >=1 | false | IsInt, Min(1), default=1 |
| limit | integer 1..100 | false | IsInt, Min(1), Max(100), default=50 |

### Du lieu ra (Response)
HTTP 200

```json
{
  "data": [
    {
      "id": "string",
      "_id": "string",
      "order_number": "string",
      "order_type": "dine_in|takeaway|delivery|online",
      "source": "pos|online|qr|app|phone",
      "status": "pending|confirmed|preparing|ready|delivering|completed|cancelled|refunded",
      "payment_status": "unpaid|partial|paid|partially_refunded|refunded",
      "table_id": "string|null",
      "customer_name": "string|null",
      "total_amount": 0,
      "currency": "string",
      "item_count": 0,
      "created_at": "date-time"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "total_pages": 1
  },
  "summary": {
    "total_orders": 0,
    "total_revenue": 0
  }
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - invalid query/date
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

## 2.3 GET /restaurants/{id}/orders/{order_id}
### Muc dich
Lay chi tiet day du cua mot don hang.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |

### Du lieu ra (Response)
HTTP 200

Data schema: Order persisted fields (muc 1.4), bao gom day du items[] va cac truong tinh tien.

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
  - order does not belong to this restaurant
- 404 Not Found
  - order not found
- 500 Internal Server Error

---

## 2.4 POST /restaurants/{id}/orders/{order_id}/items
### Muc dich
Them nhieu mon vao don dang mo va tinh lai tong tien.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| items | array<OrderItemInputDto> | true | IsArray, ArrayMinSize(1), ValidateNested |

OrderItemInputDto fields nhu muc 2.1.

### Du lieu ra (Response)
HTTP 200

```json
{
  "order_id": "string",
  "new_items": [
    {
      "menu_item_id": "string",
      "item_name": "string",
      "quantity": 2,
      "unit_price": 79000,
      "total_price": 158000,
      "status": "pending",
      "notes": "string|null",
      "created_at": "date-time"
    }
  ],
  "subtotal": 0,
  "tax_amount": 0,
  "service_charge_amount": 0,
  "total_amount": 0
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - order/menu item not found
- 409 Conflict
  - order not mutable at current status
- 429 Too Many Requests
  - key ratelimit:order:write:{order_id}
- 500 Internal Server Error

---

## 2.5 PATCH /restaurants/{id}/orders/{order_id}/items/{item_id}
### Muc dich
Cap nhat quantity va/hoac notes cua item trong don.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| quantity | integer >=1 | false | IsInt, Min(1) |
| notes | string\|null | false | IsString, MaxLength(500) |

### Du lieu ra (Response)
HTTP 200

```json
{
  "unchanged": true,
  "item": {
    "_id": "string",
    "menu_item_id": "string",
    "item_name": "string",
    "quantity": 2,
    "unit_price": 79000,
    "total_price": 158000,
    "status": "pending",
    "notes": "string|null",
    "created_at": "date-time",
    "updated_at": "date-time"
  },
  "subtotal": 0,
  "tax_amount": 0,
  "service_charge_amount": 0,
  "total_amount": 0
}
```

Ghi chu:
- Field unchanged chi co khi payload khong tao thay doi thuc te.

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - order/item not found
- 409 Conflict
  - item/order status khong cho phep update
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.6 DELETE /restaurants/{id}/orders/{order_id}/items/{item_id}
### Muc dich
Huy tung item trong don va tinh lai tong tien.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| cancel_reason | string | false | IsString, MinLength(1), MaxLength(500) |

### Du lieu ra (Response)
HTTP 200

```json
{
  "item_id": "string",
  "status": "pending|preparing|ready|served|cancelled",
  "subtotal": 0,
  "tax_amount": 0,
  "service_charge_amount": 0,
  "total_amount": 0
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - khong duoc huy item theo trang thai hien tai
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.7 PATCH /restaurants/{id}/orders/{order_id}/status
### Muc dich
Cap nhat trang thai don theo workflow transition duoc phep.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| status | enum(confirmed, preparing, ready, delivering, completed) | true | IsIn(ORDER_STATUS_UPDATE_ALLOWED) |
| staff_id | string(ObjectId) | false | IsMongoId |

### Du lieu ra (Response)
HTTP 200

```json
{
  "unchanged": true,
  "id": "string",
  "order_number": "string",
  "status": "pending|confirmed|preparing|ready|delivering|completed|cancelled|refunded",
  "updated_at": "date-time"
}
```

Ghi chu:
- unchanged chi co khi status moi trung status cu.

### Xu ly loi (Exception handling)
- 400 Bad Request
  - invalid payload
  - delivering cho order khong phai delivery
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - transition khong hop le
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.8 PATCH /restaurants/{id}/orders/{order_id}/items/{item_id}/status
### Muc dich
Cap nhat trang thai item theo role actor va transition rules.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |
| item_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| status | enum(preparing, ready, served, cancelled) | true | IsIn(ORDER_ITEM_STATUS_UPDATE_ALLOWED) |

### Du lieu ra (Response)
HTTP 200

```json
{
  "item_id": "string",
  "status": "pending|preparing|ready|served|cancelled",
  "updated_at": "date-time"
}
```

Luu y runtime:
- status trong response hien lay tu item object da doc truoc khi repository update.

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
  - transition item status khong hop le
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.9 PATCH /restaurants/{id}/orders/{order_id}/discount
### Muc dich
Ap dung/cap nhat/xoa discount cho don va tinh lai tong tien.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| discount_type | enum(none, percent, fixed, coupon) | true | IsEnum(OrderDiscountType) |
| discount_value | number >= 0 | false | IsNumber, Min(0) |
| discount_ref | string\|null | false | IsString, MaxLength(50) |

Service constraints them:
- percent: discount_value phai trong [0.01..1.00]
- fixed/coupon: discount_value phai >=0 va < subtotal
- terminal order khong duoc discount

### Du lieu ra (Response)
HTTP 200

```json
{
  "discount_type": "none|percent|fixed|coupon",
  "discount_ref": "string|null",
  "discount_amount": 0,
  "subtotal": 0,
  "tax_amount": 0,
  "service_charge_amount": 0,
  "total_amount": 0
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - sai ranh buoc discount
- 401 Unauthorized
- 403 Forbidden
  - staff khong co can_discount
- 404 Not Found
- 409 Conflict
  - terminal order cannot apply discount
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.10 PATCH /restaurants/{id}/orders/{order_id}/cancel
### Muc dich
Huy toan bo don theo role va trang thai cho phep.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (required)

### Path Param
| Field | Type | Required | Validation |
|---|---|---|---|
| id | string(ObjectId) | true | ParseObjectIdPipe |
| order_id | string(ObjectId) | true | ParseObjectIdPipe |

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| cancel_reason | string | true | IsString, MinLength(1), MaxLength(500) |

### Du lieu ra (Response)
HTTP 200

```json
{
  "id": "string",
  "order_number": "string",
  "status": "pending|confirmed|preparing|ready|delivering|completed|cancelled|refunded",
  "cancel_reason": "string|null",
  "cancelled_at": "date-time|null"
}
```

Luu y runtime:
- Service hien tra object da doc truoc transaction, nen status/cancel fields co the la snapshot truoc khi cancel.

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
  - staff khong co can_cancel_order
- 404 Not Found
- 409 Conflict
  - khong cho huy theo status hien tai
- 429 Too Many Requests
- 500 Internal Server Error

---

## 2.11 GET /restaurants/{id}/tables/{table_id}/active-order
### Muc dich
Lay don active unpaid cua mot ban. Neu khong co, tra order=null.

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
  "order": null
}
```

hoac

```json
{
  "order": {
    "_id": "string",
    "order_number": "string",
    "restaurant_id": "string",
    "table_id": "string|null",
    "user_id": "string|null",
    "customer_name": "string|null",
    "customer_phone": "string|null",
    "staff_id": "string|null",
    "order_type": "dine_in|takeaway|delivery|online",
    "status": "pending|confirmed|preparing|ready|delivering|completed|cancelled|refunded",
    "payment_status": "unpaid|partial|paid|partially_refunded|refunded",
    "items": [],
    "subtotal": 0,
    "discount_type": "none|percent|fixed|coupon",
    "discount_ref": "string|null",
    "discount_value": 0,
    "discount_amount": 0,
    "tax_rate": 0,
    "tax_amount": 0,
    "service_charge_rate": 0,
    "service_charge_amount": 0,
    "total_amount": 0,
    "currency": "string",
    "source": "pos|online|qr|app|phone",
    "notes": "string|null",
    "completed_at": "date-time|null",
    "cancelled_at": "date-time|null",
    "cancel_reason": "string|null",
    "created_at": "date-time",
    "updated_at": "date-time"
  }
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
  - table not found
- 500 Internal Server Error

---

## 2.12 POST /public/orders
### Muc dich
Tao don online/QR cho khach public. Co the dinh kem user_id neu JWT hop le.

### Du lieu vao (Request)
### Header
- Authorization: Bearer access_token (optional)
  - Neu hop le: service gan user_id vao order
  - Neu thieu/sai/blacklist: bo qua, user_id = null

### Body
| Field | Type | Required | Validation |
|---|---|---|---|
| restaurant_id | string(ObjectId) | true | IsMongoId |
| order_type | enum(dine_in, takeaway, delivery) | true | IsIn(PUBLIC_ORDER_TYPES) |
| table_id | string(ObjectId) | false* | IsMongoId, bat buoc khi order_type=dine_in |
| source | enum(pos, online, qr, app, phone) | false | IsEnum(OrderSource) |
| customer_name | string\|null | false | IsString, MaxLength(150) |
| customer_phone | string\|null | false | IsString, MaxLength(20) |
| notes | string\|null | false | IsString, MaxLength(1000) |
| items | array<OrderItemInputDto> | true | IsArray, ArrayMinSize(1), ValidateNested |

### Du lieu ra (Response)
HTTP 201

Data schema: full Order persisted fields + message:string.

```json
{
  "_id": "string",
  "order_number": "string",
  "restaurant_id": "string",
  "table_id": "string|null",
  "user_id": "string|null",
  "customer_name": "string|null",
  "customer_phone": "string|null",
  "staff_id": null,
  "order_type": "dine_in|takeaway|delivery",
  "status": "pending|confirmed",
  "payment_status": "unpaid",
  "items": [],
  "subtotal": 0,
  "discount_type": "none",
  "discount_ref": null,
  "discount_value": 0,
  "discount_amount": 0,
  "tax_rate": 0,
  "tax_amount": 0,
  "service_charge_rate": 0,
  "service_charge_amount": 0,
  "total_amount": 0,
  "currency": "VND",
  "source": "pos|online|qr|app|phone",
  "notes": "string|null",
  "completed_at": null,
  "cancelled_at": null,
  "cancel_reason": null,
  "created_at": "date-time",
  "updated_at": "date-time",
  "message": "Order has been placed successfully"
}
```

### Xu ly loi (Exception handling)
- 400 Bad Request
  - invalid payload
  - missing table_id for dine_in
- 404 Not Found
  - restaurant not found / not accepting online orders
  - table not found
  - menu item unavailable
- 409 Conflict
  - table is not available for new order
- 429 Too Many Requests
  - throttle public-order-create (10 req/phut)
- 500 Internal Server Error

---

## 3. Security, Permission, Rate Limit Notes

- Private order routes yeu cau:
  - @Roles(admin, user)
  - @RequireRestaurant()
- Route co permission bo sung:
  - PATCH /orders/{order_id}/discount -> CAN_DISCOUNT
  - PATCH /orders/{order_id}/cancel -> CAN_CANCEL_ORDER
- Public route:
  - POST /public/orders su dung OptionalPublicUserInterceptor + throttle 10/phut
- Internal rate limit trong service:
  - create order: ratelimit:order:create:{restaurant_id}
  - write order: ratelimit:order:write:{order_id}

## 4. Kiem tra zero-omission

- Toan bo field trong Order schema da duoc liet ke o muc 1.4 va map o muc 1.5.
- Toan bo field trong OrderItem schema da duoc liet ke va map theo endpoint.
- Moi endpoint command tra payload toi uu da duoc giai thich ly do omit field.
- Cac truong phat sinh khong thuoc schema (item_count, pagination, summary, message, unchanged) da duoc khai bao ro la derived/business metadata.
