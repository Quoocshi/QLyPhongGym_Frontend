import { useEffect, useState } from 'react';
import { userService } from '../services/userService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Calendar, CreditCard, Award, Settings, Bell, Shield, Activity, TrendingUp, Target, Star, Edit, Save, X, Camera, MapPin, Cake } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const UserHome = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [homeInfo, setHomeInfo] = useState(null);
  const [taiKhoan, setTaiKhoan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [recentActivity, setRecentActivity] = useState([]);

  // Mock data cho dashboard
  const mockStats = {
    totalSessions: 24,
    currentServices: 2,
    totalSpent: 2300000,
    memberSince: '2024-01-15',
    nextSession: '2024-11-29 09:00'
  };

  const mockActivity = [
    { id: 1, type: 'workout', title: 'Hoàn thành buổi tập GYM', time: '2 giờ trước', icon: '💪' },
    { id: 2, type: 'payment', title: 'Thanh toán gói Yoga 30N', time: '1 ngày trước', icon: '💳' },
    { id: 3, type: 'booking', title: 'Đăng ký lớp Yoga buổi sáng', time: '3 ngày trước', icon: '🧘‍♀️' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Prefer user from AuthContext/localStorage when available
        const stored = authUser || (() => {
          try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw) : null;
          } catch (e) {
            return null;
          }
        })();

        if (stored) {
          setHomeInfo({
            accountId: stored.maKH || stored.accountId || stored.username || stored.maNV || null,
            username: stored.username || null,
            hoTen: stored.hoTen || stored.fullName || stored.name || '',
            email: stored.email || '' ,
            avatar: stored.avatar || null
          });
          setTaiKhoan({
            hoTen: stored.hoTen || stored.fullName || stored.name || '',
            email: stored.email || '',
            soDienThoai: stored.sdt || stored.soDienThoai || '',
            diaChi: stored.diaChi || '',
            gioiTinh: stored.gioiTinh || '',
            ngaySinh: stored.ngaySinh || ''
          });
        } else {
          try {
            const home = await userService.getHome();
            setHomeInfo(home);

            const tk = await userService.getTaiKhoan();
            setTaiKhoan(tk.khachHang || tk);
          } catch (apiErr) {
            // Mock data fallback khi API lỗi
            console.log('Using mock data fallback for user home');
            const mockHomeInfo = {
              accountId: 'USR001',
              username: 'demo',
              hoTen: 'Nguyễn Văn A',
              email: 'demo@gym.vn',
              avatar: null
            };

            const mockTaiKhoan = {
              hoTen: 'Nguyễn Văn A',
              email: 'demo@gym.vn',
              soDienThoai: '0123456789',
              diaChi: '123 Nguyễn Huệ, Q.1, TP.HCM',
              gioiTinh: 'NAM',
              ngaySinh: '1990-05-15'
            };

            setHomeInfo(mockHomeInfo);
            setTaiKhoan(mockTaiKhoan);
          }
        }

        setRecentActivity(mockActivity);
      } catch (err) {
        // If 401, redirect to login and clear auth
        if (err.response && err.response.status === 401) {
          try { logout(); } catch (e) { }
          navigate('/login');
          return;
        }
        setError(err.response?.data || err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, authUser, logout]);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin"></div>
              <User className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="text-gray-600 text-lg">Đang tải thông tin cá nhân...</p>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 overflow-hidden py-16">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            {/* Welcome Section */}
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">{homeInfo?.hoTen || 'Thành viên'}</span>
              </h1>
              <p className="text-xl text-gray-300">Chào mừng bạn trở lại với hành trình sức khỏe</p>
            </div>
          </div>

          {/* User Info Card */}
          {homeInfo && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {homeInfo.hoTen ? homeInfo.hoTen.split(' ').map(s => s[0]).slice(0, 2).join('') : <User className="w-8 h-8" />}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{homeInfo.hoTen}</h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Thành viên VIP</span>
                  </div>
                  <div className="flex items-center space-x-6 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{homeInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>ID: {homeInfo.accountId}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tham gia từ {mockStats.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-16 flex-grow">
        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl mb-8 animate-fade-in-up">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
              { id: 'profile', label: 'Thông tin cá nhân', icon: User },
              { id: 'activity', label: 'Hoạt động', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Buổi tập', value: mockStats.totalSessions, icon: Activity, color: 'from-blue-500 to-blue-600', change: '+12%' },
                { title: 'Dịch vụ hiện tại', value: mockStats.currentServices, icon: Award, color: 'from-green-500 to-green-600', change: '+1' },
                { title: 'Tổng chi tiêu', value: formatCurrency(mockStats.totalSpent), icon: CreditCard, color: 'from-purple-500 to-purple-600', change: '+8%' },
                { title: 'Mục tiêu', value: '85%', icon: Target, color: 'from-orange-500 to-orange-600', change: '+5%' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-4"></div>
                Thề hành động nhanh
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Đăng ký gói tập', desc: 'Khám phá các gói dịch vụ mới', action: () => navigate('/services'), color: 'from-green-500 to-green-600', icon: Award },
                  { title: 'Lịch tập của tôi', desc: 'Xem lịch tập và đăng ký buổi mới', action: () => navigate('/user/lich-tap'), color: 'from-blue-500 to-blue-600', icon: Calendar },
                  { title: 'Dịch vụ đã đăng ký', desc: 'Quản lý dịch vụ hiện tại', action: () => navigate('/user/dich-vu-cua-toi'), color: 'from-purple-500 to-purple-600', icon: Star }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-left group hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                      <p className="text-gray-600 text-sm">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-4"></div>
                Hoạt động gần đây
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                      <span className="text-2xl">{activity.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                    <div className="text-gray-400">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-4"></div>
              Thông tin cá nhân
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-auto flex items-center space-x-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            {taiKhoan ? (
              !isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Họ tên', value: taiKhoan.hoTen, icon: User },
                    { label: 'Email', value: taiKhoan.email, icon: Mail },
                    { label: 'Số điện thoại', value: taiKhoan.soDienThoai, icon: Phone },
                    { label: 'Địa chỉ', value: taiKhoan.diaChi, icon: MapPin },
                    { label: 'Giới tính', value: taiKhoan.gioiTinh === 'NAM' ? 'Nam' : taiKhoan.gioiTinh === 'NU' ? 'Nữ' : taiKhoan.gioiTinh, icon: User },
                    { label: 'Ngày sinh', value: taiKhoan.ngaySinh, icon: Cake }
                  ].map((field, index) => {
                    const Icon = field.icon;
                    return (
                      <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <label className="font-semibold text-gray-800">{field.label}</label>
                        </div>
                        <p className="text-gray-600 text-lg">{field.value || 'Chưa cập nhật'}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'hoTen', label: 'Họ tên', type: 'text', icon: User },
                      { name: 'email', label: 'Email', type: 'email', icon: Mail },
                      { name: 'soDienThoai', label: 'Số điện thoại', type: 'tel', icon: Phone },
                      { name: 'diaChi', label: 'Địa chỉ', type: 'text', icon: MapPin },
                      { name: 'ngaySinh', label: 'Ngày sinh', type: 'date', icon: Cake }
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.name}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span>{field.label}</span>
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={taiKhoan[field.name] || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      );
                    })}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Giới tính</span>
                      </label>
                      <select
                        name="gioiTinh"
                        value={taiKhoan.gioiTinh || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="NAM">Nam</option>
                        <option value="NU">Nữ</option>
                        <option value="KHAC">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
                        }`}
                    >
                      <Save className="w-5 h-5" />
                      <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                      <span>Hủy</span>
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Không có thông tin tài khoản</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full mr-4"></div>
              Dịch vụ của tôi
            </h3>
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Bạn chưa đăng ký dịch vụ nào</p>
              <button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                Khám phá dịch vụ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-4"></div>
              Lịch sử hoạt động
            </h3>
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{activity.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                    <p className="text-gray-600">{activity.time}</p>
                  </div>
                  <div className="text-gray-400">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;