# Upload Module API Contract

Tai lieu nay tap trung vao 4 cau hoi khi tich hop:
- API dung de lam gi
- Client can gui gi (header, query, body/form-data)
- API tra ve gi (du field, kieu du lieu, vi du)
- Loi co the xay ra

## 1. Authentication va quy dinh chung

### 1.1 Authentication
- Tat ca endpoint upload deu bat buoc Bearer token.

| Header | Bat buoc | Kieu | Vi du |
|---|---|---|---|
| Authorization | Yes | string | Bearer eyJhbGciOi... |

Neu thieu/sai token:
- HTTP 401
- errorCode thuong gap: AUTH_001, AUTH_003

### 1.2 Response envelope thanh cong
Tat ca endpoint thanh cong duoc wrap theo format:

| Field | Kieu | Vi du | Mo ta |
|---|---|---|---|
| success | boolean | true | Luon true khi thanh cong |
| statusCode | number | 200 | Ma HTTP runtime |
| message | string | Request was successful | Thong diep tong quat |
| data | object/array/null | {} | Payload chinh cua endpoint |
| correlationId | string | 4b3f... | ID trace request |
| timestamp | string(date-time) | 2026-04-23T10:00:00.000Z | Thoi diem response |

### 1.3 Response envelope loi

| Field | Kieu | Vi du | Mo ta |
|---|---|---|---|
| success | boolean | false | Luon false khi loi |
| errorCode | string | UPLOAD_001 | Ma loi nghiep vu/he thong |
| message | string | Failed to upload file | Mo ta loi |
| details | any/null | null | Chi tiet them neu co |
| path | string | /upload/single | Route gay loi |
| correlationId | string | 4b3f... | ID trace request |
| timestamp | string(date-time) | 2026-04-23T10:00:00.000Z | Thoi diem response |

## 2. Quy dinh file upload

### 2.1 Mime type hop le
- image/jpeg
- image/png
- application/pdf

Luu y runtime:
- He thong check qua 2 tang (multer + pipe).
- Mime type thuc te phai nam trong giao cua:
  - Danh sach hard-code tren
  - Danh sach env UPLOAD_ALLOWED_MIME_TYPES

### 2.2 Kich thuoc file
- Gioi han pipe: 5 MB/file
- Multer con co gioi han theo env: UPLOAD_MAX_FILE_SIZE
- Gioi han thuc te la gia tri nho hon giua 2 tang

### 2.3 So luong file
- POST /upload/single: 1 file
- POST /upload/multiple: toi da 10 file

### 2.4 Object file tra ve khi upload thanh cong

| Field | Kieu | Vi du | Mo ta |
|---|---|---|---|
| url | string(url) | https://res.cloudinary.com/... | URL file tren Cloudinary |
| filename | string | multi-restaurant-manager/uploads/menu_abc123 | public_id tren Cloudinary |
| originalname | string | menu.jpg | Ten file goc client gui |
| mimetype | string | image/jpeg | Mime type cua file |
| size | number | 24567 | Kich thuoc theo byte |

## 3. API chi tiet

## 3.1 POST /upload/single
### Muc dich
Upload 1 file len Cloudinary.

### Client can gui gi
- Method: POST
- URL: /upload/single
- Content-Type: multipart/form-data

Headers:

| Field | Bat buoc | Kieu | Vi du |
|---|---|---|---|
| Authorization | Yes | string | Bearer eyJhbGciOi... |

Form-data:

| Field | Bat buoc | Kieu | Vi du | Mo ta |
|---|---|---|---|---|
| file | Yes | binary | menu.jpg | File can upload |

### API tra ve gi
- HTTP thanh cong: 200 hoac 201 (tuy runtime)
- data la 1 object file voi day du 5 field (url, filename, originalname, mimetype, size)

### Loi co the xay ra

| HTTP | errorCode | Khi nao gap |
|---|---|---|
| 400 | UPLOAD_002 | File type khong hop le |
| 400 | UPLOAD_003 | File vuot kich thuoc cho phep |
| 400 | UPLOAD_001 | Upload cloud that bai |
| 401 | AUTH_001/AUTH_003 | Thieu token, token sai, token het han |
| 429 | RATELIMIT_001 | Vuot rate-limit |
| 500 | INTERNAL_001 | Loi he thong khong duoc xu ly rieng |

## 3.2 POST /upload/multiple
### Muc dich
Upload nhieu file trong 1 request (toi da 10 file).

### Client can gui gi
- Method: POST
- URL: /upload/multiple
- Content-Type: multipart/form-data

Headers:

| Field | Bat buoc | Kieu | Vi du |
|---|---|---|---|
| Authorization | Yes | string | Bearer eyJhbGciOi... |

Form-data:

| Field | Bat buoc | Kieu | Vi du | Mo ta |
|---|---|---|---|---|
| files | Yes | binary[] | a.jpg, b.pdf | Danh sach file can upload |

### API tra ve gi
- HTTP thanh cong: 200 hoac 201 (tuy runtime)
- data la mang object file
- Moi phan tu trong mang co day du 5 field: url, filename, originalname, mimetype, size

### Loi co the xay ra

| HTTP | errorCode | Khi nao gap |
|---|---|---|
| 400 | UPLOAD_002 | Co file sai type |
| 400 | UPLOAD_003 | Co file qua size |
| 400 | UPLOAD_001 | Co it nhat 1 file upload that bai |
| 401 | AUTH_001/AUTH_003 | Thieu token, token sai, token het han |
| 429 | RATELIMIT_001 | Vuot rate-limit |
| 500 | INTERNAL_001 | Loi he thong |

## 3.3 POST /upload/replace
### Muc dich
Thay file cu bang file moi (xoa file cu truoc, upload file moi sau).

### Client can gui gi
- Method: POST
- URL: /upload/replace
- Content-Type: multipart/form-data

Headers:

| Field | Bat buoc | Kieu | Vi du |
|---|---|---|---|
| Authorization | Yes | string | Bearer eyJhbGciOi... |

Form-data:

| Field | Bat buoc | Kieu | Vi du | Mo ta |
|---|---|---|---|---|
| imgUrl | Yes | string | https://res.cloudinary.com/.../old.jpg | URL/public id file cu |
| file | Yes | binary | new.jpg | File moi thay the |

### API tra ve gi
- HTTP thanh cong: 200 hoac 201 (tuy runtime)
- data la 1 object file moi voi day du 5 field: url, filename, originalname, mimetype, size

### Loi co the xay ra

| HTTP | errorCode | Khi nao gap |
|---|---|---|
| 400 | UPLOAD_001 | Replace that bai (xoa cu/upload moi loi) |
| 400 | UPLOAD_002 | File moi sai type |
| 400 | UPLOAD_003 | File moi qua size |
| 401 | AUTH_001/AUTH_003 | Thieu token, token sai, token het han |
| 429 | RATELIMIT_001 | Vuot rate-limit |
| 500 | INTERNAL_001 | Loi he thong |

## 3.4 DELETE /upload
### Muc dich
Xoa file tren Cloudinary theo imgUrl.

### Client can gui gi
- Method: DELETE
- URL: /upload

Headers:

| Field | Bat buoc | Kieu | Vi du |
|---|---|---|---|
| Authorization | Yes | string | Bearer eyJhbGciOi... |

Query params:

| Field | Bat buoc | Kieu | Vi du | Mo ta |
|---|---|---|---|---|
| imgUrl | Yes | string | https://res.cloudinary.com/.../old.jpg | URL/public id can xoa |

### API tra ve gi
- HTTP thanh cong: 200
- data co the null hoac bi omit tuy runtime serialize
- Cac field envelope van day du: success, statusCode, message, correlationId, timestamp

### Loi co the xay ra

| HTTP | errorCode | Khi nao gap |
|---|---|---|
| 400 | DELETE_001 | Cloudinary destroy that bai |
| 401 | AUTH_001/AUTH_003 | Thieu token, token sai, token het han |
| 429 | RATELIMIT_001 | Vuot rate-limit |
| 500 | INTERNAL_001 | Loi he thong |

## 4. Error code tong hop nhanh

| errorCode | Y nghia |
|---|---|
| UPLOAD_001 | Loi upload/replace |
| UPLOAD_002 | File type khong hop le |
| UPLOAD_003 | File qua lon |
| DELETE_001 | Loi xoa file |
| RATELIMIT_001 | Vuot gioi han request |
| AUTH_001 | Unauthorized |
| AUTH_003 | Token expired |
| INTERNAL_001 | Internal server error |
