# TABLE OF CONTENT
1. sigint
2. folder structure
3. library

## 1. SIGINT
process.on('SIGINT', () => {
    server.close(() => console.log(`Exit Server Express`))
})
- SIGINT là viết tắt của signal interrupt, tính hiệu OS gửi đến một process khi mà user ctrl + C thì trigger. 
- Graceful Shutdown: nếu không handle tính hiệu sigint thì OS sẽ kill ngay lập tức, req đang xử lí bị ngắt đột ngột, các file ghi dở bị hỏng, connect db redis không đóng đúng cách, lãng phí tài nguyên

SIGTERM/SIGKILL, thoát ngay lập tức

## 2. Structure
app.js: Nơi cấu hình middleware, route, xử lý lỗi (Logic).
server.js: Nơi khởi động server HTTP (Infrastructure/Network).

### vì sao tách app.js ra khỏi server.js 
- testing: import app vào các file test logic mà không cần mở port

### cấu trúc dự án
- configs/ chứa các cấu hình hệ thống (db, redis, aws) -> dễ dàng switch env (dev, staging, production)
- models/ định nghĩa schema cho db 
- controllers/ nhận req từ user, check và forward cho services, nhận response và trả về cho client
- services/ xử lí nghiệp vụ, chứa mọi logic tính toán
- utils/ chứa các function dùng chung cho toàn dự án
- routes/ chứa các api routes 

### luồng
- routes nhận url -> gọi hàm controller -> controller lấy params -> gọi xuống service -> service gọi model, tính toán gửi lên controller -> controller nhận kết quả

## 3. các thư viện 
### 1. morgan
- logger
### 2. helmet
- encrypt header
### 3. compress
- compress payload
compression giúp tối ưu băng thông đáng kể nhưng sẽ tốn thêm một ít tài nguyên CPU của server để nén dữ liệu trước khi gửi