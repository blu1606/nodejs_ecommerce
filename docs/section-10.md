# Section 10: Order Management & Inventory Synchronization

> Ngày: 2026-04-11
> Các file thay đổi: 
> - `src/models/repository/order.repo.js`
> - `src/models/repository/inventory.repo.js`
> - `src/services/checkout.service.js`
> - `src/utils/index.js`

## Tổng quan
Section này tập trung vào việc hoàn thiện logic nghiệp vụ cho đơn hàng, bao gồm việc hủy đơn hàng (Order Cancellation) bởi người dùng và cập nhật trạng thái đơn hàng (Status Update) bởi shop. Cốt lõi của phần này là đảm bảo tính nhất quán giữa trạng thái đơn hàng và số lượng tồn kho (Inventory).

## Kiến thức đã học

### 1. State Machine trong Quản lý Đơn hàng
- **What:** Một tập hợp các quy tắc xác định trạng thái nào có thể chuyển sang trạng thái nào.
- **Why:** Tránh việc dữ liệu bị sai lệch (ví dụ: không thể hủy một đơn hàng đã được giao).
- **Code:** Định nghĩa `VALID_TRANSITIONS` trong `checkout.service.js`.

### 2. Inventory Restoration (Hoàn trả kho)
- **What:** Logic tăng lại số lượng sản phẩm trong kho khi đơn hàng bị hủy.
- **Why:** Đảm bảo số lượng tồn kho chính xác khi giao dịch không thành công. Khác với `rollback` (dùng khi checkout lỗi), `restore` dùng khi đơn hàng đã tồn tại nhưng bị hủy sau đó.
- **Code:** Hàm `restoreInventoryStock` trong `inventory.repo.js`.

### 3. Shop Authorization & Ownership
- **What:** Kiểm tra xem Shop có quyền tác động lên đơn hàng hay không.
- **Why:** Trong hệ thống Multi-vendor, một shop chỉ được phép cập nhật trạng thái cho các đơn hàng có chứa sản phẩm của mình.
- **Code:** Logic filter `shopProducts` trong `updateOrderStatusByShop`.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `src/models/repository/order.repo.js` | Modified | Export `extractProductsFromOrder`, thêm `findOrderById`. |
| `src/models/repository/inventory.repo.js` | Modified | Thêm `restoreInventoryStock`, fix lỗi import `convertToObjectIdMongodb`. |
| `src/services/checkout.service.js` | Modified | Triển khai `cancelOrderByUser` và `updateOrderStatusByShop` với đầy đủ validation. |
| `src/utils/index.js` | Modified | Cập nhật `convertToObjectIdMongodb` sử dụng `createFromHexString`. |

## Câu hỏi cần tìm hiểu thêm
- [ ] Cách triển khai MongoDB Transactions (Session) để đảm bảo tính nguyên tử khi update Order và Inventory đồng thời.
- [ ] Xử lý logic Partial Cancellation (hủy một phần đơn hàng) trong hệ thống Multi-vendor.

## Ghi chú cá nhân
- Luôn ưu tiên dùng **Whitelist** cho việc chuyển đổi trạng thái thay vì Blacklist để code an toàn hơn.
- Cẩn thận với `.lean()` khi muốn update dữ liệu.
