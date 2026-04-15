# Section 15: Comment Deletion Logic & API Refinement

> Ngày: 2026-04-15
> Các file thay đổi: 
> - src/services/comment.service.js
> - src/models/repository/comment.repo.js
> - src/controllers/comment.controller.js
> - src/routes/comment/index.js
> - NodeJS Ecommerce API.postman_collection.json

## Tổng quan
Section này hoàn thiện tính năng xoá comment trong hệ thống phân cấp (Nested Set Model). Nội dung tập trung vào việc xử lý logic dịch chuyển tọa độ (coordinate shifting) để lấp đầy khoảng trống sau khi xoá và bọc toàn bộ quy trình trong Transaction để đảm bảo tính nhất quán.

## Kiến thức đã học

### 1. Nested Set Deletion Algorithm
- **What:** Thuật toán xoá một node và toàn bộ cây con của nó, sau đó cập nhật lại các giá trị `left` và `right` của các node còn lại.
- **Why:** Để "đóng khoảng trống" (gap) được tạo ra sau khi xoá, giữ cho các chỉ cố `left/right` luôn liên tục và chính xác.
- **Code:** Triển khai trong `deleteComments`, `updateCommentsRight`, và `updateCommentsLeft`.

### 2. Transaction Integrity in Deletion
- **What:** Đưa toàn bộ quá trình xoá và shifting vào trong một transaction MongoDB.
- **Why:** Việc xoá trong Nested Set rất nhạy cảm; nếu chỉ xoá thành công mà không shift được tọa độ (hoặc ngược lại), toàn bộ cấu trúc cây sẽ bị hỏng.
- **Code:** Sử dụng `withTransaction` bao bọc logic tìm kiếm node và thực hiện xóa/update.

### 3. API Documentation Refinement
- **What:** Cập nhật Postman collection với các phương thức mới và sửa lỗi cú pháp JSON.
- **Why:** Đảm bảo team phát triển hoặc người dùng cuối có tài liệu chính xác để test API.
- **Code:** Chỉnh sửa file `NodeJS Ecommerce API.postman_collection.json`.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/services/comment.service.js | Modified | Triển khai `deleteComments` với Transaction |
| src/models/repository/comment.repo.js | Modified | Thêm các hàm repo `deleteCommentsWithRange`, `updateCommentsRight`, `updateCommentsLeft` |
| src/controllers/comment.controller.js | Modified | Thêm `deleteComment` controller |
| src/routes/comment/index.js | Modified | Thêm route DELETE cho comment và refactor controller casing |
| NodeJS Ecommerce API.postman_collection.json | Modified | Thêm DELETE request và fix lỗi JSON |

## Câu hỏi cần tìm hiểu thêm
- [ ] Sự khác biệt giữa việc xoá cứng (hard delete) và xoá mềm (soft delete) trong cấu trúc Nested Set Model?
- [ ] Cách xử lý trigger hoặc thông báo khi một comment cha bị xoá?

## Ghi chú cá nhân
- Luôn thực hiện tìm kiếm node (`findCommentById`) **bên trong** Transaction để tránh trường hợp dữ liệu bị thay đổi giữa chừng (Concurrency control).
- Kiểm tra kỹ cú pháp JSON của Postman collection trước khi export.
