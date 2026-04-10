# Section 6: Xử lý Check API Key & Permission (Middleware)

> Ngày: 2026-04-08
> Các file thay đổi: `src/auth/checkAuth.js`, `src/models/apikey.model.js`, `src/routes/index.js`, `src/services/apikey.service.js`, `src/postman/access.post.http`

## Tổng quan
Section này tập trung vào việc thiết kế và lập trình luồng xác thực (authentication) và ủy quyền (authorization) dựa trên API Key cho các request. Cụ thể, xây dựng các Middleware để kiểm tra tính hợp lệ của API Key và đảm bảo rằng đối tượng gửi request (Client) có quyền truy cập vào các routes.

## Kiến thức đã học

### 1. API Key là gì & Tại sao cần dùng trong hệ thống
- **What:** API Key là một chuỗi ký tự nhận dạng định danh nguồn gốc của request. Thường dùng để cấp riêng cho các Developer, Vendor, hay Clients của các đối tác bên ngoài khi dùng APIs của Service.
- **Why:** Kiểm soát và phân luồng traffic. Dễ dàng block khi có rủi ro lộ từ phía client, bảo vệ hệ thống trước sự tấn công (brute force, rate limit theo từng key). Ngoài ra, còn cấp quyền cụ thể thay vì open API.
- **Code:** Model `apikey.model.js` lưu trữ thông tin về string token, trạng thái status hoạt động và permissions tương ứng.

### 2. Thiết kế Middleware kiểm tra bảo mật (Authentication & Authorization)
- **What:** Middleware là các functions chặn giữa server nhận HTTP Request và các Controller xử lý.
- **Why:** Phân cách vai trò (Separation of Concerns). Security logic được đặt lên đầu để cản request rác sớm, giúp ứng dụng không phải xử lý tiếp code payload của hacker hoặc user không hợp lệ.  Và truyền thông tin auth đi thông qua biến `req.objKey`.
- **Code:** 
  - `apiKey` Middleware (`src/auth/checkAuth.js`): Intercept lấy header `x-api-key`, verify DB và block lỗi 403 Forbidden nếu bất hợp lệ.
  - `permission` Middleware (`src/auth/checkAuth.js`): Nhận closure biến cấu hình required permission (như `'0000'`) để so khớp và block nếu request API Key không có role này. 

### 3. Pipeline Router - Thứ tự gắn kết logic (Order of execution)
- **What:** Thứ tự khai báo trong `Express.js` cấu thành nên flow xử lý logic (đoạn nào chặn trên, chặn dưới).
- **Why:** Middleware phải đứng trước các routing con muốn bảo vệ. Vị trí gắn middleware rất quan trọng (Top-down execution). Nếu sai thứ tự, middleware sẽ có thể bị bỏ qua hoặc làm block lỗi oan application. Nắm vững điều này sẽ phòng tránh rò rỉ bảo mật.
- **Code:** `src/routes/index.js` khai báo `router.use(apiKey)` xong tới `router.use(permission('0000'))` rồi mới mở entrypoint `.use('/v1/api/')`. Mọi request đã qua được đây chắc chắn đã an toàn, hợp lệ.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `src/models/apikey.model.js` | Created | Database schematics dành riêng cho đối tượng Key API |
| `src/services/apikey.service.js` | Created | Business logic abstract tương tác csdl để truy vấn lấy objKey |
| `src/auth/checkAuth.js` | Created | Export `apiKey` và `permission` middlewares đảm đương chặn ở routing pipeline |
| `src/routes/index.js` | Modified | Mount các middlewares bảo mật lên trên route tree để kiểm soát traffic vào Router `access` |
| `src/postman/access.post.http`| Modified | Thêm Header truyền x-api-key cho việc test thực tế |

## Câu hỏi cần tìm hiểu thêm
- [ ] Sự khác biệt của Auth API key và Auth JWT Payload cho người dùng cuối?
- [ ] Có nên đưa API key validation này lên API Gateway / Proxy phân giải thay vì đưa vào phía backend app code không?
- [ ] Giải pháp invalidate (xóa cache / update roles) nhanh cho API key nếu nó cache trên Redis khi model thay đổi là gì?

## Ghi chú cá nhân
- Lưu ý truyền middleware thì ở logic cuối phải nhớ gọi `return next()` nếu thoả mãn logic, nếu không gọi request sẽ bị treo vĩnh viễn (timeout). Express sẽ lơ lửng ở memory layer.
