# Section 8: Standardized Success Responses

> Ngày: 2026-04-08
> Các file thay đổi: `src/core/success.response.js`, `src/controllers/access.controller.js`, `src/postman/access.post.http`

## Tổng quan
Tiếp nối việc xử lý lỗi (Error Handling), section này tập trung vào việc chuẩn hóa các phản hồi thành công (Success Response) từ server. Việc này giúp đảm bảo sự nhất quán trong dữ liệu trả về và làm sạch mã nguồn ở tầng Controller.

## Kiến thức đã học

### 1. Success Response Architecture
- **What:** Tạo một hệ thống class kế thừa để đóng gói các dữ liệu trả về khi request thành công.
- **Why:** 
    - Đảm bảo cấu trúc response luôn giống nhau (ví dụ luôn có `message`, `statusCode`, `metadata`).
    - Giúp Controller chỉ tập trung vào việc điều phối dữ liệu, không cần lo lắng về việc set status code hay format JSON thủ công.
- **Code:** `src/core/success.response.js`

### 2. Base Class & Specialized Classes
- **Base Class (`SuccessResponse`)**: Chứa các thuộc tính chung và hàm `send()`.
- **Specialized Classes (`OK`, `CREATED`)**: Cấu hình sẵn mã lỗi mặc định (200, 201) giúp gọi code ngắn gọn hơn.

### 3. Dynamic Options
- **What:** Thêm thuộc tính `options` vào response.
- **Why:** Dùng để chứa các thông tin metadata bổ sung không thuộc dữ liệu chính, ví dụ: `limit`, `page`, `offset` trong phân trang.

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| `src/core/success.response.js` | New | Tạo hệ thống class xử lý phản hồi thành công. |
| `src/controllers/access.controller.js` | Modified | Sử dụng class `CREATED` thay vì `res.status().json()`. |
| `src/postman/access.post.http` | Modified | Cập nhật dữ liệu test cho shop mới. |

## Câu hỏi cần tìm hiểu thêm
- [ ] Làm sao để ẩn các trường nhạy cảm tự động trong `metadata` (ví dụ: `password`) một cách tập trung hơn ngoài việc dùng `lodash.pick`?
- [ ] Có nên dùng Header thay vì Body để chứa một số thông tin metadata không?

## Ghi chú cá nhân
Sử dụng class giúp code ở Controller trông rất chuyên nghiệp và dễ đọc: `new OK({ metadata }).send(res)`. Tuy nhiên cần cẩn thận lỗi gõ nhầm tên thuộc tính (typo).
