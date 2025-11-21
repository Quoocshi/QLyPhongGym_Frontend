# 🧪 Hướng dẫn Test Đăng ký & Đăng nhập

## 📋 **Thông tin API từ Backend**

### **1. API Đăng ký:**
- **Endpoint:** `POST http://localhost:8081/api/auth/register`
- **Body format:**
```json
{
  "username": "huyhehe",
  "password": "Huydinh123",
  "hoTen": "Huy Huhu",
  "gioiTinh": "Nam",
  "ngaySinh": "23/03/2004",
  "email": "huy.gym@example.com",
  "soDienThoai": "0987654321",
  "diaChi": "123 Nguyen Trai, Quan 5, TP HCM"
}
```

### **2. API Đăng nhập:**
- **Endpoint:** `POST http://localhost:8081/api/auth/login`
- **Body format:**
```json
{
  "username": "nv123",
  "password": "123"
}
```

---

## ✅ **Đã cập nhật Frontend:**

### **1. File `src/services/api.js`:**
- ✅ Đã map field names từ tiếng Anh sang tiếng Việt
- ✅ Login dùng `username` thay vì `email`
- ✅ Register gửi đúng format backend yêu cầu

### **2. File `src/pages/Login.jsx`:**
- ✅ Đổi input từ "Email" sang "Tên đăng nhập"
- ✅ Validation cho username

### **3. File `src/pages/Register.jsx`:**
- ✅ Thêm hàm `formatDate()` để convert `YYYY-MM-DD` → `DD/MM/YYYY`
- ✅ Gửi đúng tất cả field backend yêu cầu

---

## 🚀 **Cách test:**

### **Bước 1: Start Backend**
```bash
cd path/to/laravel/backend
php artisan serve --port=8081
```

### **Bước 2: Start Frontend**
```bash
cd E:\Kha\UIT\hk1_2025\web\QLyPhongGym_Frontend
npm run dev
```

### **Bước 3: Test Đăng ký**

1. Mở browser: `http://localhost:5173/register`
2. Điền form:
   - **Họ và tên:** Nguyễn Văn A
   - **Giới tính:** Nam
   - **Ngày sinh:** 15/01/1995 (chọn từ date picker)
   - **Số điện thoại:** 0901234567
   - **Email:** test@example.com
   - **Địa chỉ:** 123 Đường ABC, Quận 1, TP.HCM
   - **Tên đăng nhập:** nguyenvana123
   - **Mật khẩu:** Password123 (phải có chữ hoa, chữ thường, số)
   - **Xác nhận mật khẩu:** Password123

3. Click **"Đăng ký"**

4. **Kiểm tra:**
   - Mở DevTools (F12) → Tab **Network**
   - Xem request POST tới `/api/auth/register`
   - Kiểm tra body có đúng format không:
     ```json
     {
       "username": "nguyenvana123",
       "password": "Password123",
       "hoTen": "Nguyễn Văn A",
       "gioiTinh": "Nam",
       "ngaySinh": "15/01/1995",
       "email": "test@example.com",
       "soDienThoai": "0901234567",
       "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
     }
     ```

5. **Nếu thành công:**
   - Sẽ redirect sang `/login`
   - Kiểm tra database (Neon Console hoặc DataGrip):
     ```sql
     SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
     ```

### **Bước 4: Test Đăng nhập**

1. Trên trang Login: `http://localhost:5173/login`
2. Nhập:
   - **Tên đăng nhập:** nguyenvana123
   - **Mật khẩu:** Password123

3. Click **"Đăng nhập"**

4. **Kiểm tra:**
   - DevTools → Network → Xem response
   - Console → Chạy: `localStorage.getItem('auth_token')`
   - Nếu có token → Đăng nhập thành công ✅

---

## 🐛 **Troubleshooting:**

### **Lỗi 422 (Validation Error):**
Mở DevTools → Network → Click vào request → Tab **Response**

**Ví dụ response lỗi:**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "username": ["The username has already been taken."]
  }
}
```

**Giải pháp:**
- Email/Username đã tồn tại → Đổi sang email/username khác
- Hoặc xóa user cũ trong database

### **Lỗi 500 (Server Error):**
Kiểm tra Laravel log:
```bash
tail -f storage/logs/laravel.log
```

### **Lỗi CORS:**
Thêm vào `config/cors.php` (Laravel):
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

---

## 📊 **Kiểm tra Database:**

### **Trong Neon Console hoặc DataGrip:**

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem user vừa đăng ký
SELECT * FROM users 
WHERE username = 'nguyenvana123';

-- Xóa user để test lại
DELETE FROM users 
WHERE username = 'nguyenvana123';

-- Kiểm tra cấu trúc bảng
SHOW COLUMNS FROM users;
```

---

## ✅ **Checklist hoàn chỉnh:**

### **Backend:**
- [ ] Laravel server đang chạy: `php artisan serve --port=8081`
- [ ] Database đã kết nối (Neon Console)
- [ ] Bảng `users` đã được migrate
- [ ] Routes `/api/auth/login` và `/api/auth/register` hoạt động

### **Frontend:**
- [ ] File `.env.local` đã tạo với `VITE_API_URL=http://localhost:8081/api`
- [ ] Dev server đang chạy: `npm run dev`
- [ ] Các file đã được cập nhật:
  - [x] `src/services/api.js`
  - [x] `src/pages/Login.jsx`
  - [x] `src/pages/Register.jsx`

### **Test:**
- [ ] Đăng ký user mới thành công
- [ ] User xuất hiện trong database
- [ ] Đăng nhập với user vừa tạo thành công
- [ ] Token được lưu vào localStorage
- [ ] Redirect về trang chủ sau khi đăng nhập

---

## 🎉 **Kết quả mong đợi:**

1. **Đăng ký thành công:**
   - Form submit không có lỗi
   - Redirect sang `/login`
   - User mới xuất hiện trong database

2. **Đăng nhập thành công:**
   - Nhập đúng username/password
   - Nhận được token
   - Token lưu vào localStorage
   - Redirect về trang chủ `/`

---

**Nếu gặp lỗi, hãy:**
1. Mở DevTools (F12) → Tab Console & Network
2. Screenshot lỗi và gửi cho tôi
3. Kiểm tra Laravel log: `tail -f storage/logs/laravel.log`
