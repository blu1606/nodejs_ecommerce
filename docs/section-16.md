# Section 16: Notification System & Message Queue Integration

> Ngày: 2026-04-19
> Các file thay đổi: 
> - product.service.js
> - notification.model.js
> - notification.service.js
> - notification.controller.js
> - notification/index.js
> - docker-compose.yml
> - package.json
> - NodeJS Ecommerce API.postman_collection.json

## Tổng quan
Section này tập trung vào việc xây dựng hệ thống thông báo (Notification System) trong ứng dụng Ecommerce. Đây là nền tảng để gửi các thông tin quan trọng như: đơn hàng thành công, khuyến mãi mới, hoặc thông báo khi shop có sản phẩm mới. Đồng thời, khởi tạo hạ tầng cho kiến trúc hướng sự kiện (Event-driven) với Kafka và RabbitMQ.

## Kiến thức đã học

### 1. Notification Model & Service
- **What:** Thiết kế schema cho thông báo lưu trữ trong MongoDB. Sử dụng `noti_type` để phân loại và `noti_options` để lưu trữ dữ liệu động.
- **Why:** Tách biệt logic thông báo giúp hệ thống dễ mở rộng và quản lý các loại thông báo khác nhau một cách linh hoạt.
- **Code:** `src/models/notification.model.js`, `src/services/notification.service.js`

### 2. Integration Pattern (Push vs Pull)
- **What:** Hiện tại đang sử dụng mô hình "Push" cơ bản: khi một hành động xảy ra (ví dụ: tạo sản phẩm), hệ thống sẽ gọi service thông báo để lưu vào database.
- **Why:** Đảm bảo người dùng luôn nhận được cập nhật mới nhất dựa trên các sự kiện họ quan tâm (ví dụ: theo dõi shop).
- **Code:** `src/services/product.service.js`

### 3. Message Queue Infrastructure (Kafka & RabbitMQ)
- **What:** Cấu hình Kafka 4.0 (KRaft mode) và RabbitMQ trong `docker-compose.yml`. Cài đặt thư viện `kafkajs`.
- **Why:** Chuẩn bị cho việc xử lý bất đồng bộ (async processing). Thay vì sản phẩm mới được tạo và chờ thông báo lưu xong, ta sẽ bắn một sự kiện vào Message Queue để Worker xử lý sau, giúp tăng performance cho API chính.
- **Code:** `docker-compose.yml`, `package.json`

### 4. Advanced Aggregation for Notifications
- **What:** Sử dụng `aggregate` của Mongoose để lọc thông báo theo User, Type và trạng thái Đã đọc.
- **Why:** Tối ưu hóa truy vấn khi lượng thông báo lớn và cần các phép toán phứcợ tạp hơn find thông thường.
- **Code:** `src/services/notification.service.js`

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| docker-compose.yml | Modified | Thêm Kafka (KRaft mode) và RabbitMQ |
| package.json | Modified | Thêm dependency `kafkajs` |
| src/models/notification.model.js | New | Định nghĩa Schema Notification |
| src/services/notification.service.js | New | Logic push và list thông báo |
| src/controllers/notification.controller.js | New | Xử lý request cho notification |
| src/routes/notification/index.js | New | Routing cho API notification |
| src/services/product.service.js | Modified | Tích hợp push notification khi tạo sản phẩm |

## Câu hỏi cần tìm hiểu thêm
- [ ] [Message Queue]: Sự khác biệt giữa Topic trong Kafka và Queue trong RabbitMQ?
- [ ] [Subscriber Pattern]: Làm sao để tối ưu việc gửi thông báo cho hàng triệu user cùng lúc?
- [ ] [At-least-once delivery]: Đảm bảo thông báo không bị mất khi hệ thống có lỗi.

## Ghi chú cá nhân
- Kafka 4.0 KRaft mode không cần Zookeeper, cấu hình gọn hơn nhiều.
- Cần chú ý logic `receivedId` trong notification service, hiện tại đang hardcode hoặc query đơn giản.
