import { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone } from 'lucide-react';

const UserHome = () => {
  const navigate = useNavigate();
  const [homeInfo, setHomeInfo] = useState(null);
  const [taiKhoan, setTaiKhoan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const home = await userService.getHome();
        setHomeInfo(home);

        const tk = await userService.getTaiKhoan();
        setTaiKhoan(tk.khachHang || tk);
      } catch (err) {
        // If 401, redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('auth_token');
          navigate('/login');
          return;
        }
        setError(err.response?.data || err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaiKhoan((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        hoTen: taiKhoan.hoTen || '',
        email: taiKhoan.email || '',
        soDienThoai: taiKhoan.soDienThoai || '',
        diaChi: taiKhoan.diaChi || '',
        gioiTinh: taiKhoan.gioiTinh || '',
        ngaySinh: taiKhoan.ngaySinh || ''
      };

      const updated = await userService.updateTaiKhoan(payload);
      // backend returns ChiTietKhachHangDTO; keep local state consistent
      setTaiKhoan(updated);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công');
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-4 text-gray-900">Trang cá nhân</h1>
      <div className="mb-6 text-sm text-gray-500">Chào mừng trở lại — quản lý thông tin và đăng ký gói tập tại đây.</div>

      {homeInfo && (
        <div className="mb-6 bg-gradient-to-r from-white to-orange-50 p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">
              {homeInfo.hoTen ? homeInfo.hoTen.split(' ').map(s=>s[0]).slice(0,2).join('') : <User className="w-6 h-6" />}
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600">Account ID</div>
              <div className="font-semibold text-gray-900">{homeInfo.accountId} · {homeInfo.username}</div>
              <div className="text-sm text-gray-700">{homeInfo.hoTen}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Thông tin tài khoản</h2>
          {homeInfo && (
            <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-700">{homeInfo.username}@example.com</span></div>
              <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-700">--</span></div>
              <div className="text-right"><span className="text-sm text-gray-500">Tài khoản</span><div className="font-semibold">{homeInfo.username}</div></div>
            </div>
          )}
          <div className="flex space-x-3">
            <button onClick={() => navigate('/user/dang-ky')} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded shadow hover:scale-[1.02] transition">Đăng ký gói tập</button>
            <button onClick={() => navigate('/user/lich-tap')} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded shadow hover:scale-[1.02] transition">Xem lịch tập</button>
            <button onClick={() => alert('Đổi username hiện chưa được backend hỗ trợ')} className="px-4 py-2 border rounded hover:bg-gray-50">Chỉnh sửa tài khoản</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
          {error && <div className="text-red-600 mb-3">{error}</div>}
          {taiKhoan ? (
            <div>
              {!isEditing ? (
                <div>
                  <div className="mb-2"><strong>Họ tên:</strong> {taiKhoan.hoTen || '-'}</div>
                  <div className="mb-2"><strong>Email:</strong> {taiKhoan.email || '-'}</div>
                  <div className="mb-2"><strong>Số điện thoại:</strong> {taiKhoan.soDienThoai || '-'}</div>
                  <div className="mb-2"><strong>Địa chỉ:</strong> {taiKhoan.diaChi || '-'}</div>
                  <div className="mb-2"><strong>Giới tính:</strong> {taiKhoan.gioiTinh || '-'}</div>
                  <div className="mb-2"><strong>Ngày sinh:</strong> {taiKhoan.ngaySinh || '-'}</div>
                  <div className="mt-3">
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-primary text-white rounded">Chỉnh sửa thông tin cá nhân</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Họ tên</label>
                    <input name="hoTen" value={taiKhoan.hoTen || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" value={taiKhoan.email || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Số điện thoại</label>
                    <input name="soDienThoai" value={taiKhoan.soDienThoai || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Địa chỉ</label>
                    <input name="diaChi" value={taiKhoan.diaChi || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Giới tính</label>
                    <select name="gioiTinh" value={taiKhoan.gioiTinh || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                      <option value="">-- Chọn --</option>
                      <option value="NAM">Nam</option>
                      <option value="NU">Nữ</option>
                      <option value="KHAC">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Ngày sinh</label>
                    <input type="date" name="ngaySinh" value={taiKhoan.ngaySinh || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                    <button type="button" onClick={() => { setIsEditing(false); }} className="px-4 py-2 border rounded">Hủy</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>Không có thông tin tài khoản</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
