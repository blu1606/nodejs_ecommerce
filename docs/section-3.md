## Connect nodejs to mongodb using mongoose 

### 1. Nhược điểm cách connect cũ 
- Cách cũ `D:\CODE\Study\nodejs\ecommerce-nodejs\src\dbs\init.mongodb.lv0.js`
Với cách này mỗi lần module nào require module này thì nó sẽ lại tạo ra 1 connection mới dẫn tới nhiều connection được tạo ra, với nodejs vì require có cơ chế cache nên sẽ tránh được trường hợp này. Tuy nhiên đây vẫn là 1 bad practices vì tư duy sử dụng nhiều ngôn ngữ khác sẽ bị học theo. 

### 2. Cách connect mongo mới 
- Sử dụng singleton pattern, chỉ gọi khi phương thức getInstance() được gọi lần đầu tiên, cách lần gọi tiếp theo thì trả về phiên bản hiện tại. Sử dụng cho các thiết kế gọi một lần. vd task manager trên windows

### 3. Kiểm tra hệ thống có bao nhiêu connect
Sử dụng mongoose.connections.length

### 4. thông báo khi server quá tải connection
- Dùng `checkOverload()` trong `helpers/check.connect.js`
- `setInterval` mỗi 5s kiểm tra: số connections, memory usage (RSS), số CPU cores
- Công thức tính max connections: `numCores * 5` — nếu vượt thì log cảnh báo
- `os.cpus().length` lấy số cores, `process.memoryUsage().rss` lấy RAM thực tế đang dùng

### 5. có nên disConnect() liên tục  
-> không cần

### 6. poolSize là gì? Vì sao quan trọng 
- Pool size = số connection tối đa driver giữ sẵn (keep alive) trong một "bể kết nối" tới MongoDB
- Thay vì mỗi query tạo connection mới (tốn TCP handshake + auth), lấy connection có sẵn từ pool → nhanh hơn
- Mongoose mặc định `maxPoolSize = 100`
- Config: `mongoose.connect(uri, { maxPoolSize: 50, minPoolSize: 5 })`

### 7. nếu vượt quá kết nối poolSize thì sao
- Request mới sẽ xếp hàng chờ (queue) cho đến khi có connection rảnh
- Nếu chờ quá lâu → timeout error (`serverSelectionTimeoutMS`, mặc định 30s)
- Giải pháp: tăng poolSize hoặc tối ưu query cho nhanh hơn (giải phóng connection sớm)

### 8. mongoose.set('debug')
- `mongoose.set('debug', true)` — log tất cả query ra console (collection, method, filter, options)
- Chỉ nên bật khi dev, production tắt đi vì ảnh hưởng performance
- Dùng `NODE_ENV` để toggle thay vì `if (1 === 1)`