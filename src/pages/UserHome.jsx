import { useEffect, useState } from 'react';
import { userService } from '../services/userService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  LogOut,
  Calendar,
  CreditCard,
  Award,
  Activity,
  TrendingUp,
  Target,
  Star,
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Cake,
  Info
} from 'lucide-react';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const UserHome = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [homeInfo, setHomeInfo] = useState(null);
  const [taiKhoan, setTaiKhoan] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState(null);

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const toMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err.response.data : '') ||
    err?.message ||
    'Lỗi khi tải dữ liệu';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount || 0));
  };

  const buildHomeInfoFromStored = (stored) => {
    return {
      accountId: stored?.accountId ?? null,
      username: stored?.username ?? null,
      hoTen: stored?.hoTen ?? stored?.khachHang?.hoTen ?? '',
      email: stored?.email ?? stored?.khachHang?.email ?? '',
      avatar: stored?.avatar ?? null
    };
  };

  const buildTaiKhoanFromStored = (stored) => {
    const kh = stored?.khachHang || stored || {};
    return {
      hoTen: kh?.hoTen ?? stored?.hoTen ?? '',
      email: kh?.email ?? stored?.email ?? '',
      soDienThoai: kh?.soDienThoai ?? kh?.sdt ?? stored?.soDienThoai ?? stored?.sdt ?? '',
      diaChi: kh?.diaChi ?? stored?.diaChi ?? '',
      gioiTinh: kh?.gioiTinh ?? stored?.gioiTinh ?? '',
      ngaySinh: kh?.ngaySinh ?? stored?.ngaySinh ?? ''
    };
  };

  const fetchFromApi = async () => {
    // BE: /api/user/home
    const home = await userService.getHome();
    setHomeInfo(home);
    setStats(home?.stats || null);
    setRecentActivity(home?.recentActivity || []);

    // BE: /api/user/taikhoan -> { accountId, username, khachHang: {...} }
    const tk = await userService.getTaiKhoan();
    setTaiKhoan(tk?.khachHang || tk);

    // cố gắng cập nhật lại localStorage cho nhất quán
    try {
      const merged = {
        accountId: home?.accountId ?? tk?.accountId ?? null,
        username: home?.username ?? tk?.username ?? null,
        hoTen: home?.hoTen ?? tk?.khachHang?.hoTen ?? '',
        email: tk?.khachHang?.email ?? '',
        khachHang: tk?.khachHang || null
      };
      localStorage.setItem('auth_user', JSON.stringify(merged));
    } catch {}
  };

  const fetchFallback = () => {
    const stored = authUser || readStoredUser();
    if (!stored) {
      setHomeInfo(null);
      setTaiKhoan(null);
      setStats(null);
      setRecentActivity([]);
      return;
    }

    setHomeInfo(buildHomeInfoFromStored(stored));
    setTaiKhoan(buildTaiKhoanFromStored(stored));
    setStats(null);
    setRecentActivity([]);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');

        try {
          await fetchFromApi();
        } catch (apiErr) {
          // nếu 401 → logout + về login
          if (apiErr?.response?.status === 401) {
            try {
              logout();
            } catch {}
            navigate('/login');
            return;
          }
          // fallback stored
          fetchFallback();
        }
      } catch (err) {
        setError(toMessage(err));
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    try {
      logout();
    } finally {
      navigate('/login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaiKhoan((prev) => ({ ...(prev || {}), [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        hoTen: taiKhoan?.hoTen || '',
        email: taiKhoan?.email || '',
        soDienThoai: taiKhoan?.soDienThoai || '',
        diaChi: taiKhoan?.diaChi || '',
        gioiTinh: taiKhoan?.gioiTinh || '',
        ngaySinh: taiKhoan?.ngaySinh || ''
      };

      const updated = await userService.updateTaiKhoan(payload);
      setTaiKhoan(updated);
      setIsEditing(false);

      // cập nhật auth_user cache
      try {
        const stored = readStoredUser() || {};
        const next = {
          ...stored,
          hoTen: updated?.hoTen ?? stored?.hoTen,
          email: updated?.email ?? stored?.email,
          khachHang: { ...(stored?.khachHang || {}), ...updated }
        };
        localStorage.setItem('auth_user', JSON.stringify(next));
      } catch {}

      alert('Cập nhật thông tin thành công');
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 overflow-hidden py-16">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Xin chào,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">
                  {homeInfo?.hoTen || 'Thành viên'}
                </span>
              </h1>
              <p className="text-xl text-gray-300">Chào mừng bạn trở lại với hành trình sức khỏe</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* User Info Card */}
          {homeInfo && (
            <div
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {homeInfo.hoTen
                      ? homeInfo.hoTen
                          .split(' ')
                          .filter(Boolean)
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')
                      : <User className="w-8 h-8" />}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {}}
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{homeInfo.hoTen || 'Thành viên'}</h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Thành viên
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-gray-300 gap-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{homeInfo.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>ID: {homeInfo.accountId ?? '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tham gia từ {stats?.memberSince || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="sm:hidden mt-4 flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Đăng xuất</span>
                  </button>
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
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
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

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Buổi tập',
                  value: stats?.totalSessions || 0,
                  icon: Activity,
                  color: 'from-blue-500 to-blue-600',
                  change: stats?.sessionChange || '0%'
                },
                {
                  title: 'Dịch vụ hiện tại',
                  value: stats?.currentServices || 0,
                  icon: Award,
                  color: 'from-green-500 to-green-600',
                  change: stats?.serviceChange || '0'
                },
                {
                  title: 'Tổng chi tiêu',
                  value: formatCurrency(stats?.totalSpent || 0),
                  icon: CreditCard,
                  color: 'from-purple-500 to-purple-600',
                  change: stats?.spendingChange || '0%'
                },
                {
                  title: 'Mục tiêu',
                  value: '85%',
                  icon: Target,
                  color: 'from-orange-500 to-orange-600',
                  change: '+5%'
                }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:scale-105 transition-transform duration-300"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-4"></div>
                Thẻ hành động nhanh
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Đăng ký gói tập',
                    desc: 'Khám phá các gói dịch vụ mới',
                    action: () => navigate('/services'),
                    color: 'from-green-500 to-green-600',
                    icon: Award
                  },
                  {
                    title: 'Lịch tập của tôi',
                    desc: 'Xem lịch tập và đăng ký buổi mới',
                    action: () => navigate('/user/lich-tap'),
                    color: 'from-blue-500 to-blue-600',
                    icon: Calendar
                  },
                  {
                    title: 'Dịch vụ đã đăng ký',
                    desc: 'Quản lý dịch vụ hiện tại',
                    action: () => navigate('/user/dich-vu-cua-toi'),
                    color: 'from-purple-500 to-purple-600',
                    icon: Star
                  }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-left group hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-4"></div>
                Hoạt động gần đây
              </h3>

              {recentActivity?.length ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                        <span className="text-2xl">{activity.icon || '🏋️'}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-800">{activity.title || 'Hoạt động'}</h4>
                        <p className="text-sm text-gray-600">{activity.time || ''}</p>
                      </div>
                      <div className="text-gray-400">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  Chưa có hoạt động gần đây.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile */}
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
                    {
                      label: 'Giới tính',
                      value:
                        taiKhoan.gioiTinh === 'NAM'
                          ? 'Nam'
                          : taiKhoan.gioiTinh === 'NU'
                            ? 'Nữ'
                            : taiKhoan.gioiTinh,
                      icon: User
                    },
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
                      className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        saving
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

        {/* Activity */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-4"></div>
              Lịch sử hoạt động
            </h3>

            {recentActivity?.length ? (
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{activity.icon || '🏋️'}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {activity.title || 'Hoạt động'}
                      </h4>
                      <p className="text-gray-600">{activity.time || ''}</p>
                    </div>
                    <div className="text-gray-400">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
                Chưa có hoạt động gần đây.
              </div>
            )}
          </div>
        )}
      </div>

      <ReusableFooter />
    </div>
  );
};

export default UserHome;
