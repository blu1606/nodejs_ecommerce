---
description: Review changes, đề xuất commit, và viết/cập nhật file nghiệm thu docs/section-xxx.md. Dùng `/commit section-2` cho section cụ thể, `/commit` để auto-detect section tiếp theo.
---

# /commit — Commit & Nghiệm Thu Command

## Params
- **section-X** (ví dụ: `section-2`, `section-3`): chỉ định section cụ thể
- **default** (không truyền): tự detect section cao nhất trong `docs/` và tạo section tiếp theo (X+1)

---

## Workflow Steps

### Step 1: Xác định section number

**Nếu user truyền param (ví dụ `section-2`):**
1. Ghi nhận section target = `section-2`

**Nếu user KHÔNG truyền param:**
// turbo
1. Chạy lệnh: `Get-ChildItem -Path docs -Filter "section-*.md" | Sort-Object Name | Select-Object -Last 1 -ExpandProperty Name`
2. Parse ra số section cao nhất hiện có (ví dụ `section-2.md` → 2)
3. Section target = X + 1 (ví dụ → `section-3`)
4. Nếu không có file section nào trong docs/ → section target = `section-1`

### Step 2: Review các thay đổi trong git

// turbo
1. Chạy `git status --short` để xem danh sách file thay đổi
// turbo
2. Chạy `git diff` để xem nội dung thay đổi chi tiết
// turbo
3. Chạy `git diff --cached` để xem cả file đã staged
4. Đọc nội dung các file thay đổi bằng `view_file`

### Step 3: Phân tích thay đổi

Phân tích tất cả thay đổi và tóm tắt:
- Những file nào được tạo mới / sửa / xóa
- Tính năng / concept gì được thêm vào
- Có vấn đề gì cần lưu ý không (security, bug tiềm ẩn)

### Step 4: Kiểm tra file section trong docs/

**Nếu file `docs/section-X.md` ĐÃ TỒN TẠI:**
1. Đọc nội dung file hiện tại
2. So sánh với các thay đổi code ở Step 3
3. Kiểm tra xem section note có thiếu khái niệm nào quan trọng không:
   - Có concept mới trong code mà section chưa ghi chép?
   - Có phần ghi chép nào sai hoặc chưa chính xác?
   - Có heading trống (### mà không có nội dung) cần bổ sung?
4. **Thông báo cho user** những phần còn thiếu/cần bổ sung, format:

```
## 📝 Section Review: section-X.md

### ✅ Đã ghi chép tốt:
- [liệt kê các concept đã note đầy đủ]

### ⚠️ Cần bổ sung:
- [concept A]: Bạn đã dùng trong code nhưng chưa ghi note
- [concept B]: Phần ghi chép chưa chính xác, cụ thể...
- [heading trống]: Có X heading chưa có nội dung

### 💡 Gợi ý thêm:
- [kiến thức liên quan mà user nên tìm hiểu thêm]
```

5. **KHÔNG tự sửa file section** — chỉ thông báo để user tự bổ sung

**Nếu file `docs/section-X.md` CHƯA TỒN TẠI:**
1. Tạo file mới `docs/section-X.md` với nội dung tổng hợp từ code changes
2. Format file theo cấu trúc:

```markdown
# Section X: [Tên chủ đề chính]

> Ngày: [YYYY-MM-DD]
> Các file thay đổi: [danh sách file]

## Tổng quan
[Mô tả ngắn gọn section này học/làm gì]

## Kiến thức đã học

### 1. [Concept A]
- **What:** [khái niệm]
- **Why:** [tại sao cần]
- **Code:** [file nào áp dụng]

### 2. [Concept B]
...

## Code Changes Summary
| File | Hành động | Mô tả |
|---|---|---|
| src/app.js | Modified | Thêm middleware morgan |
| ... | ... | ... |

## Câu hỏi cần tìm hiểu thêm
- [ ] [Câu hỏi mở rộng 1]
- [ ] [Câu hỏi mở rộng 2]

## Ghi chú cá nhân
[Để trống cho user tự ghi]
```

### Step 5: Đề xuất commit

Dựa trên analysis ở Step 3, đề xuất commit message theo **Conventional Commits** format:

```
<type>(<scope>): <description>

[body - chi tiết thay đổi]

Section: X
```

**Type mapping:**
- `feat`: thêm tính năng mới
- `fix`: sửa lỗi
- `refactor`: tái cấu trúc code
- `docs`: thay đổi documentation
- `chore`: cấu hình, setup
- `style`: format code, không đổi logic

**Ví dụ:**
```
feat(server): add graceful shutdown with SIGINT handler

- Fix SIGNIN typo to SIGINT for proper signal handling
- Add morgan middleware for HTTP request logging
- Setup layered architecture in src/

Section: 2
```

Hỏi user xác nhận trước khi commit. Nếu user đồng ý:
// turbo
1. `git add .` (hoặc các file cụ thể nếu user yêu cầu)
2. `git commit -m "[commit message]"`

### Step 6: Tổng kết

Xuất báo cáo ngắn gọn:
```
## ✅ Commit Report

### Commit: [hash ngắn]
### Message: [commit message]
### Files: [số file] changed
### Section: docs/section-X.md [created/reviewed]

### Tiếp theo nên làm:
- [gợi ý bước tiếp theo trong learning path]
```

---

## Lưu ý quan trọng
- **KHÔNG commit file `.env`** hoặc bất kỳ file chứa secrets nào
- **KHÔNG tự sửa section file đã tồn tại** — chỉ thông báo thiếu sót cho user
- Commit message phải sạch, chuyên nghiệp, không nhắc tới AI
- Dùng tiếng Việt cho nội dung section, thuật ngữ kỹ thuật giữ nguyên tiếng Anh
- Luôn hỏi user xác nhận trước khi thực hiện `git commit`
