# Section 14: Comment Service & Nested Set Model

> Ngày: 2026-04-14
> Các file thay đổi: 
> - src/services/comment.service.js
> - src/models/comment.model.js
> - src/models/repository/comment.repo.js
> - src/services/checkout.service.js
> - src/utils/index.js

## Tổng quan
Section này tập trung vào việc xây dựng hệ thống Comment phân cấp (Nested comments) sử dụng thuật toán **Nested Set Model** để tối ưu hóa hiệu năng truy vấn. Đồng thời, áp dụng **MongoDB Transactions** để đảm bảo tính toàn vẹn dữ liệu trong các luồng quan trọng như Checkout và Comment.

## Kiến thức đã học

### 1. Nested Set Model
- **What:** Một kỹ thuật lưu trữ dữ liệu phân cấp sử dụng hai tọa độ `left` và `right` để xác định phạm vi của một Node.
- **Why:** Cho phép truy vấn toàn bộ cây con (sub-tree) chỉ với 1 query duy nhất, cực kỳ hiệu quả so với Adjacency List (parentId) truyền thống.
- **Code:** Áp dụng trong `comment.service.js` và `comment.repo.js`.

### 2. MongoDB Transactions (Atomic Operations)
- **What:** Cơ chế đảm bảo một nhóm các thao tác database hoặc cùng thành công, hoặc cùng thất bại (không có trạng thái dở dang).
- **Why:** Cực kỳ quan trọng trong Ecommerce (ví dụ: tạo đơn hàng thành công thì phải trừ kho và xoá giỏ hàng đồng thời).
- **Code:** Tạo helper `withTransaction` trong `utils/index.js` và áp dụng vào `CheckoutService` và `CommentService`.

### 3. Compound Index (Chỉ số phức hợp)
- **What:** Đánh index trên nhiều trường đồng thời.
- **Why:** Tối ưu hóa các câu truy vấn lọc theo ProductId và dải tọa độ Left/Right liên tiếp.
- **Code:** `commentSchema.index({ comment_productId: 1, comment_left: 1, comment_right: 1 })`.

### 4. Pagination (Limit/Offset)
- **What:** Kỹ thuật chia nhỏ dữ liệu trả về theo trang.
- **Why:** Tránh quá tải cho server và network khi discussion có hàng ngàn comment.
- **Code:** Sử dụng `.skip()` và `.limit()` trong repository.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/utils/index.js | Modified | Thêm `withTransaction` helper |
| src/services/comment.service.js | New | Logic quản lý comment (Nested Set) |
| src/models/comment.model.js | New | Schema comment với left/right/parent |
| src/models/repository/comment.repo.js | New | Các hàm repo hỗ trợ nested set & pagination |
| src/services/checkout.service.js | Modified | Refactor sang dùng Transaction cho atomicity |

## Câu hỏi cần tìm hiểu thêm
- [ ] Cách tối ưu hóa `skip/limit` khi dữ liệu cực lớn (Cursor-based pagination)?
- [ ] Xử lý Concurrency trong Nested Set Model khi có hàng ngàn user comment cùng lúc?

## Ghi chú cá nhân
- Luôn ưu tiên dùng `withTransaction` cho các logic thay đổi dữ liệu ở nhiều collection.
- Sử dụng Object Destructuring cho tham số hàm để dễ mở rộng.
