1. Cơ chế generateKeyPair Sync 

``` JavaScript
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
    }
})
```

Khi generate RSA key pair, bạn cần quyết định 2 thứ cho mỗi key:

Type (cấu trúc dữ liệu) — key được tổ chức theo chuẩn nào?
Format (encoding) — key được biểu diễn dạng gì? (text hay binary?)

Type:
- spki, thường dùng cho publicKey, subject public key info - chuẩn X.509 chứa có algorithm info + key data
- pkcs8, public-key cryptography standards#8 - chuẩn chứa privatekey, hỗ trợ encryption

spki là chuẩn phổ biến nhất cho public key — mọi library/ngôn ngữ đều đọc được
pkcs8 cho phép encrypt private key bằng passphrase (dòng cipher + passphrase trong code). pkcs1 không hỗ trợ điều này

3. Format — Cách encoding
PEM (Privacy-Enhanced Mail)
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMII...
(Base64 encoded data)
-----END PUBLIC KEY-----
Text-based — Base64 encoding của binary data
Có header/footer rõ ràng → dễ copy paste, lưu file, log
Dùng khi: lưu vào DB dạng string, truyền qua API, config file

---

## 2. Hai cách generate key cho JWT

### Cách 1: RSA Key Pair (`generateKeyPairSync`)

```javascript
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})
```

- Dùng **asymmetric encryption** (RS256 algorithm)
- Sign bằng `privateKey`, verify bằng `publicKey`
- Public key có thể share an toàn — chỉ verify, không thể sign giả token
- Phù hợp **microservices**: service khác chỉ cần publicKey để verify, không cần biết privateKey
- Nhược: key dài (PEM string), gen chậm hơn, phức tạp hơn

### Cách 2: Random Bytes (hiện tại — đơn giản hơn)

```javascript
const privateKey = crypto.randomBytes(64).toString('hex')
const publicKey = crypto.randomBytes(64).toString('hex')
```

- Tạo 2 chuỗi hex ngẫu nhiên (128 ký tự mỗi chuỗi)
- Dùng **symmetric signing** (HS256 — HMAC SHA256, default của jsonwebtoken)
- Cùng key để sign VÀ verify — ai có key thì vừa tạo vừa verify được
- Phù hợp **monolith**: chỉ 1 server xử lý cả sign+verify
- Ưu: đơn giản, nhanh, key ngắn gọn

### So sánh nhanh

| | Cách 1 (RSA) | Cách 2 (Random hex) |
|---|---|---|
| Algorithm | RS256 (asymmetric) | HS256 (symmetric) |
| Sign | privateKey | secret string |
| Verify | publicKey | cùng secret string |
| Khi nào dùng | Microservices, multi-service verify | Monolith, single server |
| Độ phức tạp | Cao hơn | Đơn giản |

---

## 3. Luồng `createTokenPair`

```
signUp → hash password → create shop → gen keys → save keyStore (DB)
       → createTokenPair(payload, publicKey, privateKey)
       → return { shop info, tokens }
```

```javascript
const accessToken = JWT.sign(payload, publicKey, { expiresIn: '2 days' })
const refreshToken = JWT.sign(payload, privateKey, { expiresIn: '7 days' })
```

- **accessToken**: sign bằng `publicKey`, sống 2 ngày — dùng để gọi API
- **refreshToken**: sign bằng `privateKey`, sống 7 ngày — dùng để xin accessToken mới
- Tách 2 key khác nhau → nếu 1 key bị leak, chỉ ảnh hưởng 1 loại token
- `JWT.verify(accessToken, publicKey)` ngay sau tạo → sanity check, đảm bảo token hợp lệ
