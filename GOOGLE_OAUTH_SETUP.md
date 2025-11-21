# 🔐 Hướng dẫn cấu hình Google OAuth Login

## 📋 Thông tin cần thiết

### Frontend (React):
- ✅ **Google Client ID**: `897272389729-2f6rr2n8cuplr42ku0p7h3qrrg8mccpd.apps.googleusercontent.com`
- ⚠️ **KHÔNG cần Client Secret** (chỉ backend mới cần)

### Backend (Laravel):
- ✅ **Google Client ID**: (giống frontend)
- ✅ **Google Client Secret**: (lấy từ Google Cloud Console)

---

## 🚀 Bước 1: Tạo file .env.local (Frontend)

Tạo file `.env.local` trong thư mục root của project React:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=897272389729-2f6rr2n8cuplr42ku0p7h3qrrg8mccpd.apps.googleusercontent.com

# Backend API URL
VITE_API_URL=http://localhost:8081/api
```

**Lưu ý:** File `.env.local` sẽ tự động được git ignore.

---

## 🔧 Bước 2: Cấu hình Backend Laravel

### 2.1. Cài đặt Laravel Socialite (nếu chưa có):
```bash
composer require laravel/socialite
composer require socialiteproviders/google
```

### 2.2. Cấu hình `.env` trong Laravel:
```env
GOOGLE_CLIENT_ID=897272389729-2f6rr2n8cuplr42ku0p7h3qrrg8mccpd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:8081/api/auth/google/callback
```

### 2.3. Cấu hình `config/services.php`:
```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

### 2.4. Tạo Controller xử lý Google Login:

**File: `app/Http/Controllers/Auth/GoogleAuthController.php`**

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Google_Client;

class GoogleAuthController extends Controller
{
    public function handleGoogleLogin(Request $request)
    {
        try {
            $token = $request->input('token');
            
            // Verify Google Token
            $client = new Google_Client(['client_id' => config('services.google.client_id')]);
            $payload = $client->verifyIdToken($token);
            
            if (!$payload) {
                return response()->json(['message' => 'Invalid token'], 401);
            }
            
            // Get user info from Google
            $googleId = $payload['sub'];
            $email = $payload['email'];
            $name = $payload['name'];
            $avatar = $payload['picture'] ?? null;
            
            // Find or create user
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => Hash::make(uniqid()), // Random password
                    'email_verified_at' => now(),
                ]);
            } else {
                // Update google_id if not set
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleId]);
                }
            }
            
            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Google login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### 2.5. Thêm route trong `routes/api.php`:
```php
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google', [GoogleAuthController::class, 'handleGoogleLogin']);
```

### 2.6. Cài đặt Google API PHP Client:
```bash
composer require google/apiclient
```

### 2.7. Thêm cột `google_id` vào bảng users (Migration):
```bash
php artisan make:migration add_google_id_to_users_table
```

```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('google_id')->nullable()->unique()->after('email');
        $table->string('avatar')->nullable()->after('google_id');
    });
}
```

Chạy migration:
```bash
php artisan migrate
```

---

## ✅ Bước 3: Test Google Login

### 3.1. Chạy Backend:
```bash
cd path/to/laravel
php artisan serve --port=8081
```

### 3.2. Chạy Frontend:
```bash
cd path/to/react
npm run dev
```

### 3.3. Test flow:
1. Mở `http://localhost:5173/login`
2. Click nút **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google
4. Sau khi đăng nhập thành công:
   - Token được lưu vào `localStorage`
   - User được tạo/cập nhật trong database
   - Redirect về trang chủ

---

## 🐛 Debug & Troubleshooting

### Kiểm tra trong Browser DevTools (F12):

#### Console Tab:
```javascript
// Xem token đã lưu chưa
localStorage.getItem('auth_token')

// Clear token để test lại
localStorage.removeItem('auth_token')
```

#### Network Tab:
- Xem request POST tới `/api/auth/google`
- Kiểm tra Response có token không
- Xem lỗi 401/500 nếu có

### Kiểm tra trong DataGrip:
```sql
-- Xem user vừa đăng nhập bằng Google
SELECT id, name, email, google_id, avatar, created_at 
FROM users 
WHERE google_id IS NOT NULL 
ORDER BY created_at DESC;

-- Xóa để test lại
DELETE FROM users WHERE email = 'your-email@gmail.com';
```

### Lỗi thường gặp:

#### 1. "Invalid token" / 401:
- ✅ Kiểm tra Client ID trong `.env.local` và Google Cloud Console có khớp không
- ✅ Đảm bảo đã enable Google+ API

#### 2. CORS Error:
Thêm vào `config/cors.php` (Laravel):
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

#### 3. "Popup closed by user":
- User đóng popup trước khi hoàn tất đăng nhập
- Bình thường, không phải lỗi

---

## 📝 Checklist hoàn chỉnh

### Google Cloud Console:
- [ ] Tạo OAuth 2.0 Client ID
- [ ] Thêm `http://localhost:5173` vào Authorized JavaScript origins
- [ ] Copy Client ID và Client Secret

### Frontend (React):
- [ ] Cập nhật Client ID trong `src/App.jsx`
- [ ] Tạo file `.env.local` với `VITE_GOOGLE_CLIENT_ID`
- [ ] Kiểm tra `src/services/api.js` có hàm `googleLogin`

### Backend (Laravel):
- [ ] Cài đặt `laravel/socialite` và `google/apiclient`
- [ ] Cấu hình `.env` với Client ID và Secret
- [ ] Tạo `GoogleAuthController`
- [ ] Thêm route `/api/auth/google`
- [ ] Migration thêm cột `google_id` và `avatar`
- [ ] Chạy `php artisan migrate`

### Test:
- [ ] Backend chạy trên port 8081
- [ ] Frontend chạy trên port 5173
- [ ] Click "Đăng nhập bằng Google" hoạt động
- [ ] User được tạo trong database
- [ ] Token được lưu vào localStorage
- [ ] Redirect về trang chủ thành công

---

## 🎉 Kết quả mong đợi

Sau khi hoàn tất, user có thể:
1. Click "Đăng nhập bằng Google"
2. Chọn tài khoản Google trong popup
3. Tự động đăng nhập vào hệ thống
4. Thông tin user được lưu vào database
5. Có thể sử dụng các tính năng của hệ thống

---

**Lưu ý bảo mật:**
- ⚠️ **KHÔNG** commit file `.env` hoặc `.env.local` lên Git
- ⚠️ **KHÔNG** public Client Secret ra ngoài
- ✅ Chỉ dùng Client ID ở frontend
- ✅ Client Secret chỉ dùng ở backend

