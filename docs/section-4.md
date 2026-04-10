# Section 4: Environment Configuration — Cấu Hình Env Chuẩn Production

> Ngày: 2026-04-05
> Các file liên quan: `.env`, `src/configs/config.mongodb.js`, `server.js`, `.gitignore`

## Tổng quan
Section này ghi chép cách cấu hình environment variables đúng chuẩn production cho Node.js backend. Từ cách tổ chức file `.env`, multi-environment config, đến các nguyên tắc bảo mật secrets.

## Kiến thức đã học

### 1. Tại sao cần Environment Variables?
- **What:** Biến môi trường = giá trị cấu hình nằm NGOÀI code, được inject vào runtime
- **Why:** 
  - Tách biệt config khỏi code → cùng 1 codebase chạy được ở dev/staging/production
  - Bảo mật secrets (DB password, API keys) — không hardcode trong source
  - Tuân theo **12-Factor App** (Factor III: Store config in the environment)
- **Trade-off:** Env vars đơn giản nhưng không type-safe, không có validation built-in → cần tự validate

### 2. dotenv — Load env từ file
- **What:** Package `dotenv` đọc file `.env` và gán vào `process.env`
- **How:** Gọi `require('dotenv').config()` ở dòng ĐẦU TIÊN của entry point (`server.js`)
- **Quan trọng:** `dotenv` chỉ dùng cho **development**. Production dùng env vars thật từ OS/container
- **Code:** `server.js` dòng 1: `require('dotenv').config()`

#### ⚠️ Common Mistakes
- Gọi `dotenv.config()` SAU khi đã require config file → env vars chưa được load
- Đặt `.env` trong thư mục con thay vì root → dotenv không tìm thấy
- Commit `.env` lên git → lộ secrets (phải có trong `.gitignore`)

### 3. Cấu trúc file `.env`
```
# Development
DEV_APP_PORT=3000
DEV_DB_HOST=localhost
DEV_DB_PORT=27017
DEV_DB_NAME=shopDEV

# Production
PRO_APP_PORT=3000
PRO_DB_HOST=localhost
PRO_DB_PORT=27017
PRO_DB_NAME=shopPRO
```

#### Naming convention
- Format: `{ENV}_{SERVICE}_{KEY}` → ví dụ `DEV_DB_HOST`, `PRO_APP_PORT`
- Dùng UPPER_SNAKE_CASE
- Prefix theo environment giúp tránh conflict khi load toàn bộ vào `process.env`

#### ⚠️ Bug trong project hiện tại
- `.env` dòng 9: `PRO_DB_NAME = shopDEV` → **sai**, production đang trỏ vào DB dev
- Phải là `PRO_DB_NAME = shopPRO`

### 4. Multi-Environment Config Pattern
- **What:** Tạo object config cho từng environment (dev, pro), export theo `NODE_ENV`
- **Code:** `src/configs/config.mongodb.js`

```javascript
const dev = {
    app: { port: process.env.DEV_APP_PORT || '3000' },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || 'shopDEV'
    }
}

const pro = {
    app: { port: process.env.PRO_APP_PORT || '3000' },
    db: {
        host: process.env.PRO_DB_HOST || 'localhost',
        port: process.env.PRO_DB_PORT || 27017,
        name: process.env.PRO_DB_NAME || 'shopPRO'
    }
}

const config = { dev, pro }
const env = process.env.NODE_ENV || 'dev'
module.exports = config[env]
```

#### Cách hoạt động
1. `NODE_ENV` quyết định dùng config nào: `dev` hoặc `pro`
2. Mỗi env var có **fallback value** qua toán tử `||` → app vẫn chạy được nếu thiếu `.env`
3. Config được export là object phẳng → consumer chỉ cần destructure: `const { app: { port } } = require('./configs/config.mongodb')`

#### ⚠️ Vấn đề cần lưu ý
- `process.env` trả về **string**, kể cả số. `DEV_DB_PORT || 27017` hoạt động nhưng kiểu dữ liệu không nhất quán
- `NODE_ENV` mặc default `'dev'` → nếu deploy mà quên set `NODE_ENV=pro` sẽ dùng config dev trên production (nguy hiểm)
- Config file tên `config.mongodb.js` nhưng chứa cả `app.port` → naming chưa chính xác, nên tách hoặc đổi tên thành `config.js`

### 5. Fallback Values — `||` vs `??`
- `||` trả về vế phải khi vế trái là **falsy** (`''`, `0`, `null`, `undefined`, `false`)
- `??` (nullish coalescing) chỉ trả về vế phải khi vế trái là `null` hoặc `undefined`
- **Ví dụ thực tế:** Nếu set `DEV_APP_PORT=0` (port 0 = OS tự chọn port), `|| 3000` sẽ bỏ qua giá trị 0 và dùng 3000. `?? 3000` sẽ giữ nguyên 0
- **Best practice:** Dùng `??` cho env vars vì user có thể cố tình set giá trị falsy

### 6. `.gitignore` — Bảo vệ secrets
```
node_modules/
.env
```
- `.env` PHẢI nằm trong `.gitignore` → không bao giờ commit secrets lên git
- Tạo file `.env.example` chứa danh sách keys (không có values) để team biết cần config gì:

```
# .env.example — commit file này lên git
DEV_APP_PORT=
DEV_DB_HOST=
DEV_DB_PORT=
DEV_DB_NAME=

PRO_APP_PORT=
PRO_DB_HOST=
PRO_DB_PORT=
PRO_DB_NAME=
```

### 7. `NODE_ENV` — Biến quan trọng nhất
- **What:** Biến tiêu chuẩn trong Node.js ecosystem, quyết định app chạy ở mode nào
- **Giá trị thông dụng:** `development`, `staging`, `production` (hoặc rút gọn: `dev`, `pro`)
- **Ai set:** 
  - Dev: không set (dùng default) hoặc set trong `.env`
  - Production: set bởi platform (Docker, PM2, Heroku, AWS...)
- **Ảnh hưởng thực tế:**
  - Express: `NODE_ENV=production` → tắt stack trace trong error response, bật view caching
  - Mongoose: dùng để toggle `debug` mode (như project hiện tại)
  - npm: `NODE_ENV=production` → không install `devDependencies`

### 8. Thứ tự ưu tiên khi load config
```
OS/Container env vars (cao nhất)
  ↓
.env file (dotenv load)
  ↓  
Fallback values trong code (thấp nhất)
```
- `dotenv` KHÔNG ghi đè env vars đã tồn tại → OS env luôn được ưu tiên
- Đây là design có chủ đích: production set env thật, dotenv không can thiệp

### 9. Destructuring config — Clean import
```javascript
// server.js
const { app: { port } } = require('./src/configs/config.mongodb')

// init.mongodb.js  
const { db: { host, name, port } } = require('../configs/config.mongodb')
```
- Nested destructuring lấy đúng giá trị cần → code gọn
- Config module export object duy nhất theo env → consumer không cần biết đang ở env nào

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `.env` | Existing | Chứa env vars cho dev và pro |
| `src/configs/config.mongodb.js` | Existing | Multi-env config pattern với fallback |
| `server.js` | Existing | Load dotenv, destructure port từ config |
| `src/dbs/init.mongodb.js` | Existing | Dùng config để build connection string |
| `.gitignore` | Existing | Đã ignore `.env` |

## So sánh các cách quản lý config

| Cách | Ưu điểm | Nhược điểm | Khi nào dùng |
|---|---|---|---|
| Hardcode trong code | Đơn giản | Không flexible, lộ secrets | Không bao giờ |
| `.env` + dotenv | Dễ setup, tách config khỏi code | Không type-safe, file-based | Dev/small projects |
| Config service (AWS SSM, Vault) | Secure, audit trail, rotation | Phức tạp, thêm dependency | Production lớn |
| Docker env / K8s secrets | Native container support | Cần infra knowledge | Container deployment |

## Câu hỏi cần tìm hiểu thêm
- [ ] Làm sao validate env vars khi app khởi động? (fail fast nếu thiếu biến bắt buộc)
- [ ] `envalid` hoặc `joi` để validate env — nên dùng cái nào?
- [ ] Khi nào cần config service (AWS Parameter Store, HashiCorp Vault) thay vì `.env`?
- [ ] Secret rotation — thay đổi DB password mà không cần restart app?
- [ ] `.env.development` vs `.env.production` — dotenv hỗ trợ multi-file không?

## Ghi chú cá nhân

