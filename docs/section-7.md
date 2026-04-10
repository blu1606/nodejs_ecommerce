# Section 7: Handle Error Response & Async Handler

> Ngày: 2026-04-08
> Các file thay đổi: `src/app.js`, `src/helpers/asyncHandler.js`, `src/auth/checkAuth.js`, `src/routes/access/index.js`

## Tổng quan
Trong section này, chúng ta tập trung vào việc chuẩn hóa cách xử lý lỗi trong ứng dụng Express.js, đảm bảo mọi lỗi (kể cả lỗi 404) đều được trả về dưới dạng JSON đồng nhất và các hàm async không làm treo server khi có lỗi xảy ra.

## Kiến thức đã học

### 1. Global Error Handling
- **What:** Sử dụng middleware tập trung để xử lý tất cả lỗi phát sinh trong ứng dụng.
- **Why:** Tránh việc lập lại code xử lý lỗi ở nhiều nơi và đảm bảo client luôn nhận được response với cấu trúc JSON chuẩn (`status`, `code`, `message`).
- **Code:** `src/app.js`

### 2. Handling 404 Not Found
- **What:** Một middleware bắt các request không khớp với bất kỳ route nào đã định nghĩa.
- **Why:** Cung cấp thông báo rõ ràng khi user truy cập sai địa chỉ, thay vì để Express trả về trang HTML mặc định.
- **Code:** `src/app.js` (đặt sau tất cả các routes).

### 3. Async Handler Pattern
- **What:** Một higher-order function bọc các hàm async controller/middleware.
- **Why:** Tự động catch các lỗi từ async function và chuyển tiếp sang middleware xử lý lỗi thông qua `next(error)`, giúp tránh việc phải dùng `try-catch` thủ công ở mọi nơi.
- **Code:** `src/helpers/asyncHandler.js`

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `src/app.js` | Modified | Thêm middleware bắt lỗi 404 và global error handler. |
| `src/helpers/asyncHandler.js` | New | Tạo helper để tự động catch lỗi cho các hàm async. |
| `src/auth/checkAuth.js` | Modified | Xóa `asyncHandler` để chuyển sang file helper tập trung. |
| `src/routes/access/index.js` | Modified | Cập nhật đường dẫn import `asyncHandler`. |

## Câu hỏi cần tìm hiểu thêm
- [ ] Làm thế nào để phân loại lỗi (BadRequest, Forbidden, InternalServer) một cách chuyên nghiệp hơn?
- [ ] Cách log lỗi ra file hoặc service bên ngoài (như Winston hoặc Sentry)?

## Ghi chú cá nhân
Việc tách `asyncHandler` ra giúp code logic ở Controller sạch sẽ hơn rất nhiều!
