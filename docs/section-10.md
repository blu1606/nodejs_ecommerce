# Section 10: Authentication Middleware & Logout Implementation

> Ngày: 2026-04-08
> Các file thay đổi: 
> - src/auth/authUtils.js
> - src/controllers/access.controller.js
> - src/services/access.service.js
> - src/services/keyToken.service.js
> - src/postman/access/logout.post.http

## Tổng quan
Section này tập trung vào việc bảo mật các endpoint thông qua Middleare xác thực (Authentication), triển khai tính năng Đăng xuất (Logout) và xử lý các vấn đề phát sinh khi quản lý Token trong cơ sở dữ liệu.

## Kiến thức đã học

### 1. Luồng xác thực (Authentication Flow)
- **What:** Xây dựng middleware để kiểm tra tính hợp lệ của request trước khi cho phép truy cập vào các route bảo mật (protected routes).
- **Requirements:** 
    - `x-client-id`: ID của người dùng.
    - `authorization`: Access Token được cấp sau khi login.
- **Process:** Middleware trích xuất `userId`, tìm `keyStore` tương ứng, sau đó verify `accessToken` bằng `publicKey` được lưu trữ.

### 2. Stateful Logout
- **What:** Logout trong hệ thống này không chỉ đơn thuần là xóa token ở phía Client mà còn xóa bản ghi `keyStore` trong Database.
- **Why:** Để đảm bảo Token đó không còn hiệu lực ngay cả khi nó chưa hết hạn (Hạn chế rủi ro bị chiếm dụng Token).
- **Code:** `src/services/access.service.js` (hàm `logout`).

### 3. Mongoose API Migration (v7+)
- **What:** Chuyển đổi từ hàm `.remove()` sang `.deleteOne()` hoặc `.deleteMany()`.
- **Why:** Mongoose phiên bản 7 trở đi đã gỡ bỏ hoàn toàn hàm `.remove()` để tăng tính tường minh cho API.
- **Code:** `src/services/keyToken.service.js`.

### 4. JavaScript Pitfall: Object Destructuring
- **What:** Lỗi mismatch khi truyền tham số giữa Controller và Service.
- **Example:** Nếu Service định nghĩa `logout = async ({ keyStore })`, thì Controller phải gọi `logout({ keyStore: req.keyStore })` thay vì truyền trực tiếp `logout(req.keyStore)`.
- **Note:** Luôn kiểm tra kỹ cấu trúc đối tượng khi sử dụng Destructuring trong tham số hàm.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/auth/authUtils.js | Modified | Kiểm tra Header và thực hiện verify JWT token. |
| src/controllers/access.controller.js | Modified | Implement method `logout` và bọc dữ liệu vào object. |
| src/services/access.service.js | Modified | Implement logic xóa token khi người dùng đăng xuất. |
| src/services/keyToken.service.js | Modified | Thay thế hàm `.remove()` bằng `.deleteOne()`. |
| src/postman/access/logout.post.http | New | File test cho API Logout với đầy đủ Header cần thiết. |

## Câu hỏi cần tìm hiểu thêm
- [ ] Sự khác biệt giữa `accessToken` và `refreshToken` trong việc bảo mật hệ thống.
- [ ] Tại sao sử dụng `publicKey` và `privateKey` (Asymmetric) lại an toàn hơn một Secret Key duy nhất?
- [ ] Cách triển khai Refresh Token rotation để tối ưu hóa trải nghiệm người dùng.

## Ghi chú cá nhân
- Cẩn thận với các API deprecated khi nâng cấp thư viện (Mongoose).
- Luôn sử dụng object cho tham số hàm Service để dễ dàng mở rộng.
- Token là tài sản nhạy cảm, cần quản lý vòng đời (Lifecycle) chặt chẽ trong DB.
