# Section 12: Production Readiness & Data Integrity

> Ngày: 2026-04-11
> Các file thay đổi: `server.js`, `src/app.js`, `src/services/checkout.service.js`, `src/services/discount.service.js`, `src/models/discount.model.js`, `src/models/product.model.js`, `src/core/error.response.js`, `src/core/success.response.js`, `src/models/repository/inventory.repo.js`, `src/models/repository/cart.repo.js`

## Tổng quan
Section này tập trung vào việc đưa hệ thống backend lên tiêu chuẩn Production. Chúng ta đã giải quyết các vấn đề quan trọng về bảo mật (Helmet), tính ổn định (Graceful Shutdown), và đặc biệt là tính toàn vẹn dữ liệu thông qua Mongoose Transactions trong luồng Checkout.

## Kiến thức đã học

### 1. Security with Helmet
- **What:** Sử dụng middleware Helmet để thiết lập các HTTP headers bảo mật (X-Frame-Options, Content-Security-Policy, etc.).
- **Why:** Bảo vệ ứng dụng khỏi các cuộc tấn công web phổ biến như XSS, clickjacking.
- **Code:** `src/app.js`

### 2. Graceful Shutdown
- **What:** Lắng nghe tín hiệu `SIGINT` (Ctrl+C) để đóng server và ngắt kết nối database một cách an toàn.
- **Why:** Đảm bảo không có request nào bị bỏ dở và không để lại các "zombie connection" trong database.
- **Code:** `server.js`

### 3. Mongoose Transactions (Session)
- **What:** Group nhiều thao tác database vào một "Session". Nếu một thao tác lỗi, toàn bộ sẽ được rollback.
- **Why:** Đảm bảo tính nguyên tử (Atomicity). Trong Checkout, việc trừ tồn kho, tạo đơn hàng và xóa giỏ hàng phải thành công cùng lúc.
- **Code:** `src/services/checkout.service.js`

### 4. Discount Cap (Financial Guardrails)
- **What:** Bổ sung trường `discount_max_value` để giới hạn số tiền giảm tối đa cho loại giảm giá theo phần trăm.
- **Why:** Ngăn chặn rủi ro thất thoát doanh thu khi có đơn hàng giá trị cực lớn nhưng áp dụng mã giảm % không giới hạn.
- **Code:** `src/services/discount.service.js`

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/app.js | Modified | Kích hoạt helmet() middleware |
| server.js | Modified | Import instanceMongodb và xử lý SIGINT shutdown |
| src/services/checkout.service.js | Modified | Triển khai Mongoose Transactions cho orderByUser |
| src/services/discount.service.js | Modified | Implement logic Discount Cap (Math.min) |
| src/core/error.response.js | Modified | Sửa lỗi StatusCode -> StatusCodes |
| src/core/success.response.js | Modified | Chuẩn hóa Response với thư viện httpStatusCode |

## Câu hỏi cần tìm hiểu thêm
- [ ] [Transactions] MongoDB Replica Set là gì và tại sao Transactions lại yêu cầu nó?
- [ ] [Security] Tại sao không nên dùng `alert()` hoặc console.log thông tin nhạy cảm trong Production?

## Ghi chú cá nhân
[Hệ thống hiện đã rất vững chắc về mặt logic, sẵn sàng cho việc test tải hoặc CI/CD.]
