# Section 13: Redis Pub/Sub & Asynchronous Integration

> Ngày: 2026-04-14
> Các file thay đổi:
> - `src/services/redisPubsub.service.js`
> - `src/app.js`
> - `src/tests/product.test.js`
> - `src/tests/inventory.test.js`

## Tổng quan
Section này tập trung vào việc triển khai hệ thống giao tiếp bất đồng bộ giữa các thành phần thông qua Redis Pub/Sub. Mục tiêu là tách biệt logic giữa Product Service và Inventory Service, đảm bảo tính mở rộng của hệ thống theo mô hình Event-Driven.

## Kiến thức đã học

### 1. Redis Modern API (v5+)
- **What:** Sử dụng thư viện `redis` phiên bản mới nhất với cơ chế Promise-based (async/await).
- **Why:** Thay thế cơ chế callback cũ giúp code sạch hơn, dễ quản lý lỗi và tránh "callback hell". Cần lưu ý việc gọi `.connect()` trước khi thực hiện các thao tác.
- **Code:** `src/services/redisPubsub.service.js`.

### 2. Pub/Sub Connection Management
- **What:** Phải sử dụng 2 client Redis riêng biệt (Publisher và Subscriber) vì quy tắc của Redis: Client đang ở chế độ `subscribe` không thể thực hiện các lệnh khác.
- **Why:** Tránh lỗi treo kết nối và đảm bảo hiệu năng. Sử dụng Singleton Pattern để quản lý connection hiệu quả.

### 3. Asynchronous Racing Condition in Testing
- **What:** Xử lý việc Publisher gửi tin nhắn trước khi Subscriber kịp hoàn tất đăng ký do tính chất bất đồng bộ.
- **Why:** Sử dụng các cơ chế đợi (như `setTimeout` trong môi trường test) hoặc Message Queue (nếu ở production) để đảm bảo độ tin cậy.

### 4. Monitoring & Logging via Discord
- **What:** Sử dụng thư viện `discord.js` để gửi các bản tin log, lỗi hoặc thông báo quan trọng trực tiếp vào một channel Discord.
- **Why:** Giúp quan sát hệ thống (Observability) tức thời mà không cần truy cập vào server. Hỗ trợ định dạng code (Embeds) giúp log dễ đọc hơn.
- **Code:** `src/loggers/discord.log.js`.


## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `redisPubsub.service.js` | Created | Triển khai Pub/Sub Service chuẩn Redis v5 |
| `discord.log.js` | Created | Service gửi log vào Discord channel |
| `inventory.test.js` | Created | Service đăng ký nhận tin nhắn cập nhật kho |
| `product.test.js` | Created | Service phát tin nhắn khi mua sản phẩm |
| `app.js` | Modified | Tích hợp và cấu hình luồng chạy test |

## Câu hỏi cần tìm hiểu thêm
- [ ] Sự khác biệt về hiệu năng giữa Redis Pub/Sub và Message Queue (RabbitMQ).
- [ ] Cách triển khai Error Handling cho Redis Client khi mất kết nối mạng (Auto Reconnect).

## Ghi chú cá nhân
- Cẩn thận với việc trộn lẫn CommonJS (`require`) và ES Modules (`import`) trong cùng một dự án. Nên ưu tiên giữ một chuẩn duy nhất để tránh lỗi Loader.
