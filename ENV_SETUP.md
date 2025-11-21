# ⚠️ HƯỚNG DẪN: Tạo file .env.local

## 📁 **Tạo file .env.local trong thư mục root:**

**Đường dẫn chính xác:**
```
E:\Kha\UIT\hk1_2025\web\QLyPhongGym_Frontend\.env.local
```

**Cách tạo:**
1. Mở VS Code
2. Click chuột phải vào thư mục `QLyPhongGym_Frontend`
3. Chọn **"New File"**
4. Đặt tên: `.env.local`
5. Copy nội dung bên dưới vào file:

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=897272389729-2f6rr2n8cuplr42ku0p7h3qrrg8mccpd.apps.googleusercontent.com

# Backend API URL
VITE_API_URL=http://localhost:8081/api
```

## ⚠️ **Quan trọng:**

- File `.env.local` phải nằm **cùng cấp** với `package.json`
- Sau khi tạo file, **PHẢI restart dev server**:
  ```bash
  # Ctrl+C để dừng
  npm run dev
  ```

## 🔍 **Kiểm tra file đã tạo đúng chưa:**

Chạy lệnh trong terminal:
```bash
# Windows PowerShell
Get-Content .env.local

# Hoặc
type .env.local
```

Nếu thấy nội dung hiển thị → File đã tạo thành công ✅
