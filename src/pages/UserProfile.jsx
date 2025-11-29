import { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getTaiKhoan();
      setProfile(data.khachHang || data);
      setFormData(data.khachHang || data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateTaiKhoan(formData);
      setProfile(formData);
      setEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-4">
                  <User className="w-12 h-12 text-pink-500" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">
                    {profile.hoTen || profile.tenKH || 'Người dùng'}
                  </h1>
                  <p className="opacity-90">Thông tin tài khoản</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-white text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-50 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="hoTen"
                    value={formData.hoTen || formData.tenKH || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{profile.hoTen || profile.tenKH || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{profile.email || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={formData.soDienThoai || formData.sdt || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-800">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{profile.soDienThoai || profile.sdt || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                {editing ? (
                  <select
                    name="gioiTinh"
                    value={formData.gioiTinh || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{profile.gioiTinh || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                {editing ? (
                  <input
                    type="date"
                    name="ngaySinh"
                    value={formData.ngaySinh || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{formatDate(profile.ngaySinh)}</span>
                  </div>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                {editing ? (
                  <textarea
                    name="diaChi"
                    value={formData.diaChi || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-gray-800">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <span>{profile.diaChi || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  <X className="w-5 h-5" />
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mã khách hàng:</span>
              <span className="ml-2 font-medium">{profile.maKH || 'N/A'}</span>
            </div>
            {profile.ngayDangKy && (
              <div>
                <span className="text-gray-600">Ngày đăng ký:</span>
                <span className="ml-2 font-medium">{formatDate(profile.ngayDangKy)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
