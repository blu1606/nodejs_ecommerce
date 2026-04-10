---
description: Review code cho project Node.js. Đánh giá code quality, security, trade-off. Dùng `/review` cho changed files, `/review all` cho toàn bộ src/.
---

# /review — Code Review Command

## Params
- **default** (không truyền gì): chỉ review các file thay đổi trong `git status`
- **all**: review toàn bộ codebase trong `src/`

---

## Workflow Steps

### Step 1: Xác định scope review

**Nếu param = `all`:**
// turbo
1. Liệt kê toàn bộ file trong `src/` bằng lệnh: `Get-ChildItem -Path src -Recurse -File | Select-Object FullName`

**Nếu param = default (không truyền):**
// turbo
1. Chạy lệnh: `git status --short`
2. Nếu không có file nào thay đổi → thông báo "Không có file nào thay đổi để review" và dừng lại.
3. Lọc ra chỉ các file code (`.js`, `.ts`, `.json` trong `src/` và `server.js`). Bỏ qua `node_modules`, `.env`, `package-lock.json`.

### Step 2: Đọc nội dung các file cần review

1. Dùng `view_file` để đọc từng file trong danh sách.
2. Nếu param = default, cũng chạy `git diff` để xem cụ thể những dòng thay đổi.

### Step 3: Phân tích và đánh giá

Với mỗi file, phân tích theo **5 tiêu chí** sau. Đánh giá theo mức độ:
- 🔴 **Critical** — Phải sửa ngay, gây lỗi hoặc lỗ hổng bảo mật
- 🟡 **Warning** — Nên sửa, ảnh hưởng maintenance hoặc performance
- 🔵 **Suggestion** — Gợi ý cải thiện, không bắt buộc

#### Tiêu chí 1: Code Cleanliness (Độ sạch)
- Naming conventions: biến, hàm, file có đặt tên rõ ràng không?
- Single Responsibility: mỗi hàm/module chỉ làm một việc?
- DRY: có code lặp lại không?
- Dead code: có code thừa, comment thừa không?
- Consistent style: format có nhất quán không?

#### Tiêu chí 2: Security (Bảo mật)
- Hardcoded secrets (API key, password trong code)?
- Input validation & sanitization?
- SQL/NoSQL injection risks?
- XSS vulnerabilities?
- Dependency vulnerabilities (outdated packages)?
- Proper error handling (không leak stack trace ra client)?
- CORS, Helmet, rate limiting đã cấu hình chưa?

#### Tiêu chí 3: Performance (Hiệu năng)
- N+1 query problems?
- Memory leaks (event listeners không cleanup)?
- Blocking I/O trong async context?
- Thiếu indexing cho DB queries?
- Caching strategy đã có chưa?

#### Tiêu chí 4: Architecture & Patterns (Kiến trúc)
- Có tuân thủ Layered Architecture (Controller → Service → Model)?
- Error handling pattern có nhất quán?
- Middleware pipeline có hợp lý?
- Separation of Concerns có đúng?

#### Tiêu chí 5: Production Readiness
- Graceful shutdown đã handle đúng chưa?
- Logging có đầy đủ và đúng level?
- Environment variables có validate không?
- Health check endpoint?

### Step 4: Đưa ra Trade-off & Góc nhìn đa chiều

Với mỗi vấn đề tìm được:
1. Giải thích **tại sao** đó là vấn đề (không chỉ nói "sai")
2. Đưa ra **ít nhất 2 cách** tiếp cận để sửa
3. Phân tích **trade-off** của mỗi cách (ưu/nhược)
4. Gợi ý cách nào phù hợp nhất cho **context ecommerce** của project

### Step 5: Tổng kết Review

Xuất report theo format sau:

```
## 📋 Code Review Report

### Scope: [changed files / all files]
### Files reviewed: [danh sách file]

---

### 🔴 Critical Issues (X issues)
[Liệt kê]

### 🟡 Warnings (X issues)
[Liệt kê]

### 🔵 Suggestions (X items)
[Liệt kê]

---

### 📊 Tổng quan
| Tiêu chí | Điểm (1-5) | Ghi chú |
|---|---|---|
| Code Cleanliness | X/5 | ... |
| Security | X/5 | ... |
| Performance | X/5 | ... |
| Architecture | X/5 | ... |
| Production Readiness | X/5 | ... |

### 🎯 Top 3 việc nên làm ngay
1. ...
2. ...
3. ...

### 💡 Góc nhìn Senior
[Nhận xét tổng quan từ góc nhìn senior architect về hướng đi của codebase]
```

---

## Lưu ý quan trọng
- **KHÔNG sửa code thay user** — chỉ chỉ ra vấn đề và hướng giải quyết
- Dùng tiếng Việt, thuật ngữ kỹ thuật giữ nguyên tiếng Anh
- Ưu tiên nhận xét điểm tốt trước, rồi mới đến vấn đề
- Luôn đặt trong context production ecommerce Node.js
