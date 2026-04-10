# Section 11: Refresh Token & Token Rotation Strategy

> Ngày: 2026-04-09
> Các file thay đổi: `src/auth/authUtils.js`, `src/controllers/access.controller.js`, `src/routes/access/index.js`, `src/services/access.service.js`, `src/services/keyToken.service.js`, `src/postman/access/handlerefresh.post.http`

## Tổng quan
Trong section này, chúng ta implement cơ chế Refresh Token Rotation để tăng cường bảo mật cho hệ thống authentication. Thay vì dùng một refresh token duy nhất mãi mãi, mỗi lần refresh sẽ tạo ra một cặp Access/Refresh Token mới và vô hiệu hóa token cũ.

## Kiến thức đã học

### 1. Refresh Token Rotation
- **What:** Mỗi khi Client gửi Refresh Token để lấy Access Token mới, Server sẽ trả về một cặp Access Token và Refresh Token mới hoàn toàn.
- **Why:** Ngăn chặn việc hacker đánh cắp và sử dụng Refresh Token vĩnh viễn. Nếu một token cũ được dùng lại, hệ thống sẽ phát hiện hành vi bất thường.
- **Code:** `src/services/access.service.js` (hàm `handleRefreshToken`)

### 2. Reuse Detection (Phát hiện sử dụng lại token)
- **What:** Lưu trữ các Refresh Token đã qua sử dụng (`refreshTokensUsed`). Nếu một token nằm trong danh sách này được gửi lên, nghĩa là có nghi vấn Token bị đánh cắp (hoặc Client code lỗi).
- **Why:** Khi phát hiện sử dụng lại, Server sẽ xóa toàn bộ `keyStore` của user đó, bắt buộc re-login để đảm bảo an toàn.
- **Code:** `src/services/access.service.js` (check `findByRefreshTokenUsed`)

### 3. JWT Verification Helpers
- **What:** Tạo utility function để verify JWT.
- **Why:** Tái sử dụng code và làm cho service layer sạch hơn.
- **Code:** `src/auth/authUtils.js` (`verifyJWT`)

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/auth/authUtils.js | Modified | Thêm hàm verifyJWT tiện ích |
| src/controllers/access.controller.js | Modified | Thêm controller xử lý handleRefreshToken |
| src/routes/access/index.js | Modified | Thêm public route cho việc refresh token |
| src/services/access.service.js | Modified | Implement logic phức tạp: Rotation & Reuse Detection |
| src/services/keyToken.service.js | Modified | Thêm các phương thức truy vấn Token model |
| src/postman/access/handlerefresh.post.http | Created | File test API bằng REST Client |

## Câu hỏi cần tìm hiểu thêm
- [ ] Cách xử lý Race Condition khi Client gọi Refresh Token đồng thời (ví dụ khi mở nhiều tab)?
- [ ] Sự khác biệt giữa cơ chế này và cơ chế dùng Redis để quản lý Token?

## Ghi chú cá nhân
[Chưa có]
