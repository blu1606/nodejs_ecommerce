# Section 9: Login Implementation & Service Refactoring

> Ngày: 2026-04-08
> Các file thay đổi: 
> - src/controllers/access.controller.js
> - src/core/success.response.js
> - src/routes/access/index.js
> - src/services/access.service.js
> - src/postman/access/login.post.http
> - src/postman/access/signup.post.http

## Tổng quan
Section này tập trung vào việc hoàn thiện tính năng Đăng nhập (Login), tái cấu trúc (Refactor) luồng xử lý trong Service Layer để đạt chuẩn Clean Code và tối ưu hóa phản hồi (Success Response).

## Kiến thức đã học

### 1. Tư duy Fail-Fast (Thất bại sớm)
- **What:** Thay vì sử dụng các câu lệnh `if` lồng nhau để bao bọc logic thành công, ta kiểm tra và xử lý các trường hợp lỗi trước (trả về lỗi hoặc throw exception) ngay khi chúng xảy ra.
- **Why:** Giúp code "phẳng" hơn, dễ đọc, dễ bảo trì và tránh hiện tượng "Arrow Code". Đảm bảo luồng chính của hàm luôn xử lý dữ liệu hợp lệ.
- **Code:** `src/services/access.service.js` (phần hàm `signUp`).

### 2. Standardizing Success Response
- **What:** Sử dụng Class `SuccessResponse` làm base cho các phản hồi thành công (200 OK, 201 Created).
- **Why:** Đảm bảo cấu trúc dữ liệu trả về cho client luôn thống nhất (message, status, metadata). Giúp frontend dễ dàng xử lý response.
- **Code:** `src/core/success.response.js`, `src/controllers/access.controller.js`.

### 3. Error Handling Pittfalls
- **What:** Lưu ý việc sử dụng `new` khi throw Error (ví dụ: `throw new BadRequestError(...)`).
- **Why:** Nếu thiếu `new`, Error object có thể không được khởi tạo đúng cách hoặc không mang theo Stack Trace, dẫn đến khó khăn khi debug.
- **Code:** `src/services/access.service.js`.

### 4. API Organization với Postman/REST Client
- **What:** Tổ chức các file `.http` (hoặc Postman collections) theo tính năng (ví dụ thư mục `access/`).
- **Why:** Khi project lớn dần, việc quản lý hàng chục endpoint trong một file sẽ rất khó khăn. Chia nhỏ giúp quản lý và testing hiệu quả hơn.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/controllers/access.controller.js | Modified | Thêm method `login` và sử dụng `SuccessResponse`. |
| src/core/success.response.js | Modified | Export thêm `SuccessResponse` class. |
| src/routes/access/index.js | Modified | Đăng ký route `POST /shop/login`. |
| src/services/access.service.js | Modified | Implement logic `login`, refactor `signUp` sang Fail-Fast. |
| src/postman/access/*.http | New | Tổ chức lại và thêm test script cho login. |

## Câu hỏi cần tìm hiểu thêm
- [ ] So sánh `lean()` và không dùng `lean()` trong Mongoose ảnh hưởng thế nào đến Performance?
- [ ] Cách xử lý Refresh Token rotation để tăng tính bảo mật cho hệ thống Login.

## Ghi chú cá nhân
- Luôn luôn kiểm tra việc khởi tạo Error với `new`.
- Ưu tiên viết code "phẳng" nhất có thể.
