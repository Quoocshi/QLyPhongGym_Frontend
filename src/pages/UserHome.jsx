import { useEffect, useState } from 'react';
import { userService, authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, LogOut, Calendar, Clock, MapPin,
  Dumbbell, RefreshCw, ChevronLeft, ChevronRight,
  CalendarDays, Grid3X3, FileText, X, BookOpen, Target,
  Bell, TrendingUp, Gift, Info, Zap, Sun, Moon, Sparkles,
  CheckCircle
} from 'lucide-react';
import ChatBubble from '../components/chat/ChatBubble';

// Cấu hình các ngày trong tuần
const DAYS_OF_WEEK = [
  { value: '2', label: 'T2', fullLabel: 'Thứ 2' },
  { value: '3', label: 'T3', fullLabel: 'Thứ 3' },
  { value: '4', label: 'T4', fullLabel: 'Thứ 4' },
  { value: '5', label: 'T5', fullLabel: 'Thứ 5' },
  { value: '6', label: 'T6', fullLabel: 'Thứ 6' },
  { value: '7', label: 'T7', fullLabel: 'Thứ 7' },
  { value: 'CN', label: 'CN', fullLabel: 'Chủ nhật' }
];

// Array quotes động lực
const MOTIVATION_QUOTES = [
  { text: "Thật đáng xấu hổ cho một người già đi mà chưa bao giờ nhìn thấy vẻ đẹp và sức mạnh mà cơ thể mình có thể đạt được.", author: "Socrates" },
  { text: "Tôi ghét từng phút tập luyện, nhưng tôi đã nói: 'Đừng bỏ cuộc. Hãy chịu khổ bây giờ và sống phần đời còn lại như một nhà vô địch'.", author: "Muhammad Ali" },
  { text: "Sức mạnh không đến từ chiến thắng. Chính những gian khổ bạn trải qua mới là thứ phát triển sức mạnh của bạn.", author: "Arnold Schwarzenegger" },
  { text: "Mọi người đều muốn trở thành vận động viên thể hình, nhưng không ai muốn nâng những mức tạ nặng.", author: "Ronnie Coleman" },
  { text: "Thành công không phải là luôn luôn vĩ đại. Đó là sự kiên định. Kiên định làm việc chăm chỉ sẽ dẫn đến thành công.", author: "Dwayne 'The Rock' Johnson" },
  { text: "Đừng ước nó dễ dàng hơn, hãy ước mình mạnh mẽ hơn.", author: "Jim Rohn" },
  { text: "Sự khác biệt giữa người thành công và những người khác không phải là thiếu sức mạnh hay thiếu kiến thức, mà là thiếu ý chí.", author: "Vince Lombardi" },
  { text: "Động lực là thứ giúp bạn bắt đầu. Thói quen là thứ giữ bạn đi tới đích.", author: "Jim Ryun" },
  { text: "Bạn không cần phải tuyệt vời để bắt đầu, nhưng bạn phải bắt đầu để trở nên tuyệt vời.", author: "Zig Ziglar" },
  { text: "Tôi đã thất bại hết lần này đến lần khác trong cuộc đời mình. Và đó là lý do tại sao tôi thành công.", author: "Michael Jordan" }
];

const UserHome = () => {
  const navigate = useNavigate();
  const [homeInfo, setHomeInfo] = useState(null);
  const [taiKhoan, setTaiKhoan] = useState(null);
  const [lichTapList, setLichTapList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, schedule, profile

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Random Quote
  const [dailyQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    return MOTIVATION_QUOTES[randomIndex];
  });

  // Calendar month navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Event detail modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Banner carousel
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    {
      id: 1,
      title: '🎉 Khuyến mãi đặc biệt',
      content: 'Giảm 20% cho gói tập 6 tháng - Áp dụng đến hết tháng này!',
      color: 'from-orange-500 to-orange-600',
      icon: Gift
    },
    {
      id: 2,
      title: '💪 Mẹo tập luyện',
      content: 'Uống đủ nước trước, trong và sau khi tập để cơ thể luôn khỏe mạnh',
      color: 'from-blue-500 to-blue-600',
      icon: Zap
    },
    {
      id: 3,
      title: '📢 Thông báo',
      content: 'Phòng gym nghỉ lễ 30/4 & 1/5. Chúc các bạn nghỉ lễ vui vẻ!',
      color: 'from-green-500 to-green-600',
      icon: Bell
    },
    {
      id: 4,
      title: '🌟 Giới thiệu HLV mới',
      content: 'Chào mừng HLV Minh - Chuyên gia Yoga với 10 năm kinh nghiệm',
      color: 'from-purple-500 to-purple-600',
      icon: TrendingUp
    }
  ];

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchAllData = async () => {
    try {
      console.log('🔄 Starting fetchAllData...');
      setLoading(true);
      setError('');

      // Fetch home info
      console.log('📞 Calling userService.getHome()...');
      const home = await userService.getHome();
      console.log('✅ Home data:', home);
      setHomeInfo(home);

      // Fetch account info
      console.log('📞 Calling userService.getTaiKhoan()...');
      const tk = await userService.getTaiKhoan();
      console.log('✅ TaiKhoan data:', tk);
      setTaiKhoan(tk.khachHang || tk);

      // Fetch lịch tập
      try {
        console.log('📞 Calling userService.getLichTap()...');
        const lichTap = await userService.getLichTap();
        console.log('✅ Lịch tập data:', lichTap);
        const lichTapArray = Array.isArray(lichTap) ? lichTap : (lichTap.danhSachLichTap || []);
        console.log('📊 LichTap array:', lichTapArray);
        setLichTapList(lichTapArray);
      } catch (e) {
        console.error('❌ Error fetching lich tap:', e);
        console.error('Error details:', e.response?.data);
        setLichTapList([]);
      }
      console.log('✅ fetchAllData completed');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      if (err.response?.status === 401) {
        console.log('🔐 Unauthorized - redirecting to login');
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete');
    }
  };

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
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Parse chuỗi "246CN" thành mảng ['2', '4', '6', 'CN']
  const parseThuString = (thuStr) => {
    if (!thuStr) return [];
    const result = [];
    let i = 0;
    while (i < thuStr.length) {
      if (thuStr.substring(i, i + 2) === 'CN') {
        if (!result.includes('CN')) result.push('CN');
        i += 2;
      } else if (['2', '3', '4', '5', '6', '7'].includes(thuStr[i])) {
        if (!result.includes(thuStr[i])) result.push(thuStr[i]);
        i += 1;
      } else {
        i += 1;
      }
    }
    return result;
  };

  // Lấy tất cả các ngày trong tháng hiện tại
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayOfWeek = date.getDay();
      const dayValue = dayOfWeek === 0 ? 'CN' : String(dayOfWeek + 1);

      days.push({
        date,
        day: date.getDate(),
        dayValue,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        dateStr: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      });
    }

    return days;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getMonthName = () => {
    return currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  // Lấy lịch tập cho một ngày cụ thể
  const getSchedulesForDate = (dayValue, dateObj = null) => {
    return lichTapList.filter(lt => {
      if (lt.trangThai === 'Huy' || lt.trangThai === 'DaHuy') return false;

      const thuStr = lt.thu || lt.ngayTap || '';
      const thuArr = parseThuString(thuStr);

      if (!thuArr.includes(dayValue)) return false;

      if (dateObj) {
        const checkDate = new Date(dateObj);
        checkDate.setHours(12, 0, 0, 0);

        const ngayBD = lt.ngayBD ? new Date(lt.ngayBD) : null;
        const ngayKT = lt.ngayKT ? new Date(lt.ngayKT) : null;

        if (ngayBD) ngayBD.setHours(0, 0, 0, 0);
        if (ngayKT) ngayKT.setHours(23, 59, 59, 999);

        if (ngayBD && checkDate < ngayBD) return false;
        if (ngayKT && checkDate > ngayKT) return false;
      }

      return true;
    });
  };

  const openEventModal = (schedule) => {
    setSelectedEvent(schedule);
    setShowEventModal(true);
  };

  const getTrangThaiBadge = (trangThai) => {
    const status = trangThai?.toLowerCase() || '';
    if (status.includes('dang') || status.includes('mo')) {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Đang hoạt động' };
    }
    if (status.includes('tam') || status.includes('dung')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Tạm dừng' };
    }
    if (status.includes('huy')) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: trangThai || 'Không xác định' };
  };

  // Tìm buổi tập sắp tới
  const getUpcomingSession = () => {
    const now = new Date();
    const today = now.getDay(); // 0 = CN, 1 = T2, ...
    const todayValue = today === 0 ? 'CN' : String(today + 1);

    // Lọc lịch đang hoạt động
    const activeSessions = (lichTapList || []).filter(lt =>
      lt.trangThai?.toLowerCase().includes('mo') ||
      lt.trangThai?.toLowerCase().includes('dang')
    );

    // Tìm buổi tập hôm nay
    const todaySessions = activeSessions.filter(lt => {
      const thuStr = lt.thu || lt.ngayTap || '';
      const thuArr = parseThuString(thuStr);
      return thuArr.includes(todayValue);
    });

    if (todaySessions.length > 0) {
      return { ...todaySessions[0], isToday: true };
    }

    // Nếu không có hôm nay, tìm buổi gần nhất
    if (activeSessions.length > 0) {
      return { ...activeSessions[0], isToday: false };
    }

    return null;
  };

  console.log('🎨 Render - loading:', loading, 'activeTab:', activeTab, 'homeInfo:', homeInfo);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Debug render
  if (!homeInfo && !taiKhoan) {
    console.log('⚠️ No data available, showing fallback');
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`} style={{
      background: isDarkMode
        ? 'linear-gradient(to bottom right, #1F2937, #111827, #1F2937)'
        : 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)'
    }}>
      {/* Header - Modern Gradient with Depth */}
      <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-850 to-gray-900' : 'bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600'} text-white shadow-lg`} style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1F2937 0%, #111827 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)'
      }}>
        <div className="max-w-screen-2xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 ${isDarkMode ? 'bg-white/10' : 'bg-white/15'} rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg`}>
                <User className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-orange-100'} tracking-wide`}>Xin chào, Hội viên</span>
                <h1 className="text-3xl font-bold mt-1 tracking-tight">{homeInfo?.hoTen || taiKhoan?.hoTen || 'User'}</h1>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-orange-100/80'} mt-1.5`}>ID: {homeInfo?.maKH || taiKhoan?.maKH || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center w-11 h-11 ${isDarkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-white/15 hover:bg-white/20'} rounded-xl transition-all backdrop-blur-sm shadow-md`}
                title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-5 py-2.5 ${isDarkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-white/15 hover:bg-white/20'} rounded-xl transition-all backdrop-blur-sm shadow-md font-medium`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Stats - Clean Glassmorphism Cards */}
          <div className="grid grid-cols-3 gap-5 mt-8">
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">{(lichTapList || []).length}</div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Lịch tập</div>
            </div>
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">
                {(lichTapList || []).filter(lt => lt.trangThai?.toLowerCase().includes('mo')).length}
              </div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Đang hoạt động</div>
            </div>
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">
                {new Set((lichTapList || []).map(lt => lt.tenDichVu || lt.tenLop).filter(Boolean)).size}
              </div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Dịch vụ</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { key: 'overview', label: 'Tổng quan', icon: BookOpen },
              { key: 'schedule', label: 'Lịch tập', icon: Grid3X3, count: lichTapList.length },
              { key: 'profile', label: 'Thông tin cá nhân', icon: FileText }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-medium transition-all ${activeTab === tab.key
                    ? isDarkMode
                      ? 'bg-gray-800 text-orange-400 shadow-lg'
                      : 'bg-white text-orange-600 shadow-lg'
                    : isDarkMode
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                      ? isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'
                      : isDarkMode ? 'bg-gray-600' : 'bg-white/20'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Container - Full Width */}
      <div className="flex-1">
        <div className="flex max-w-screen-2xl mx-auto">
          {/* Sidebar Navigation */}
          <aside className={`hidden lg:block w-72 ${isDarkMode ? 'bg-gray-900/40' : 'bg-white'} backdrop-blur-md border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} sticky top-0 h-screen overflow-y-auto transition-colors duration-300 shadow-sm`}>
            <div className="p-8 space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-6`}>Navigation</h3>
              {[
                { key: 'overview', label: 'Tổng quan', icon: BookOpen },
                { key: 'schedule', label: 'Lịch tập', icon: Grid3X3, count: lichTapList.length },
                { key: 'profile', label: 'Thông tin cá nhân', icon: FileText }
              ].map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-medium transition-all ${activeTab === tab.key
                      ? isDarkMode
                        ? 'bg-orange-500/10 text-orange-400 shadow-sm'
                        : 'bg-orange-50 text-orange-600 shadow-sm'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key
                        ? isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-500 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className={`mt-10 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-6`}>Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/user/dang-ky')}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all ${isDarkMode
                      ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                      : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                  >
                    <BookOpen className="w-5 h-5" strokeWidth={2} />
                    <span>Đăng ký gói tập</span>
                  </button>
                  <button
                    onClick={() => navigate('/user/dich-vu-cua-toi')}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all ${isDarkMode
                      ? 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                  >
                    <FileText className="w-5 h-5" strokeWidth={2} />
                    <span>Dịch vụ của tôi</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Alerts */}
            {error && (
              <div className="px-6 mt-4">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="px-6 py-8">
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Banner/Tin tức Slider - Clean Card */}
                  <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 overflow-hidden transition-colors duration-300`} style={{
                    boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                  }}>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-6 flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Info className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                      </div>
                      <span>Thông báo & Tin tức</span>
                    </h2>
                    <div className="relative">
                      {/* Banner content */}
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        {banners.map((banner, idx) => {
                          const BannerIcon = banner.icon;
                          return (
                            <div
                              key={banner.id}
                              className={`absolute inset-0 transition-all duration-500 ${idx === currentBanner
                                ? 'opacity-100 translate-x-0'
                                : idx < currentBanner
                                  ? 'opacity-0 -translate-x-full'
                                  : 'opacity-0 translate-x-full'
                                }`}
                            >
                              <div className={`h-full bg-gradient-to-r ${banner.color} p-6 flex items-center gap-4 text-white`}>
                                <BannerIcon className="w-12 h-12 flex-shrink-0" />
                                <div>
                                  <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                                  <p className="text-sm text-white/90">{banner.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Indicators */}
                      <div className="flex justify-center gap-2 mt-4">
                        {banners.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`h-2 rounded-full transition-all ${idx === currentBanner
                              ? 'w-8 bg-primary'
                              : 'w-2 bg-gray-300 hover:bg-gray-400'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quote động lực - Clean Card with Accent */}
                  <div className={`${isDarkMode ? 'bg-gray-900/60 border-purple-500/20' : 'bg-white border-purple-100'} rounded-3xl p-8 border-2 relative overflow-hidden transition-colors duration-300`} style={{
                    boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                  }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-y-12 -translate-x-12"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                        </div>
                        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Động lực hôm nay</h2>
                      </div>
                      <blockquote className="mb-6">
                        <p className={`text-xl md:text-2xl font-semibold leading-relaxed italic ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          "{dailyQuote.text}"
                        </p>
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <cite className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} not-italic font-medium`}>— {dailyQuote.author}</cite>
                        <div className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Lịch tập sắp tới - Clean Card with Orange Accent */}
                  {getUpcomingSession() && (
                    <div className={`${isDarkMode ? 'bg-gray-900/60 border-orange-500/20' : 'bg-white border-orange-100'} rounded-3xl p-8 border-2 relative overflow-hidden transition-colors duration-300`} style={{
                      boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                    }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                            </div>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                              {getUpcomingSession().isToday ? '🔥 Hôm nay' : '📅 Sắp tới'}
                            </h2>
                          </div>
                          <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-4 py-2 ${isDarkMode ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'} rounded-xl text-sm font-semibold transition-all`}
                          >
                            Xem đầy đủ
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-orange-600" strokeWidth={2} />
                            </div>
                            <span className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {getUpcomingSession().tenDichVu || getUpcomingSession().tenLop || 'Buổi tập'}
                            </span>
                          </div>
                          {getUpcomingSession().tenNhanVien && (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-orange-600" strokeWidth={2} />
                              </div>
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                HLV {getUpcomingSession().tenNhanVien}
                              </span>
                            </div>
                          )}
                          {getUpcomingSession().tenCaTap && (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-orange-600" strokeWidth={2} />
                              </div>
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                {getUpcomingSession().tenCaTap}
                              </span>
                            </div>
                          )}
                          {getUpcomingSession().tenKhuVuc && (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-orange-600" strokeWidth={2} />
                              </div>
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                {getUpcomingSession().tenKhuVuc}
                              </span>
                            </div>
                          )}
                        </div>
                        {getUpcomingSession().isToday && (
                          <div className="mt-6 bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                            <p className="text-sm font-semibold text-orange-700">⏰ Đừng quên! Chuẩn bị sẵn sàng nhé!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions - Clean Cards */}
                  <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
                    boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                  }}>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-6 flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <span>Thao tác nhanh</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <button
                        onClick={() => navigate('/user/dang-ky')}
                        className={`p-6 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'} border-2 rounded-2xl transition-all group`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                        </div>
                        <div className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Đăng ký gói tập</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Khám phá các gói tập mới</div>
                      </button>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className={`p-6 ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15' : 'bg-orange-50 border-orange-100 hover:bg-orange-100'} border-2 rounded-2xl transition-all group`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Calendar className="w-7 h-7 text-orange-600" strokeWidth={2} />
                        </div>
                        <div className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Xem lịch tập</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quản lý lịch tập của bạn</div>
                      </button>
                      <button
                        onClick={() => navigate('/user/dich-vu-cua-toi')}
                        className={`p-6 ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'} border-2 rounded-2xl transition-all group`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-7 h-7 text-blue-600" strokeWidth={2} />
                        </div>
                        <div className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Dịch vụ của tôi</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Xem các dịch vụ đã đăng ký</div>
                      </button>
                    </div>
                  </div>

                  {/* Account Info - Clean Card */}
                  {homeInfo && (
                    <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
                      boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                    }}>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-6`}>Thông tin tài khoản</h2>
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {homeInfo.hoTen && typeof homeInfo.hoTen === 'string' && homeInfo.hoTen.split(' ').length > 0
                            ? homeInfo.hoTen.split(' ').map(s => s[0]).slice(0, 2).join('')
                            : <User className="w-10 h-10" />
                          }
                        </div>
                        <div>
                          <div className={`font-bold text-xl mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{homeInfo.hoTen || 'User'}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>ID: {homeInfo.accountId || '-'} · {homeInfo.username || '-'}</div>
                          {taiKhoan?.email && (
                            <div className={`flex items-center gap-2 mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Mail className="w-4 h-4" />
                              {taiKhoan.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Schedule - Monthly Calendar View */}
              {activeTab === 'schedule' && (
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
                  boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                }}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                      </div>
                      <span>Lịch tập theo tháng</span>
                    </h2>
                    <button
                      onClick={fetchAllData}
                      className={`p-3 ${isDarkMode ? 'text-gray-400 hover:text-orange-400 hover:bg-gray-800' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'} rounded-xl transition-all`}
                      title="Làm mới dữ liệu"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Month Navigation */}
                  <div className={`flex items-center justify-between mb-6 p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                    <button
                      onClick={goToPreviousMonth}
                      className={`flex items-center gap-2 px-4 py-2.5 ${isDarkMode ? 'text-gray-300 hover:text-orange-400 hover:bg-gray-700' : 'text-gray-600 hover:text-orange-600 hover:bg-white'} rounded-xl transition-all font-medium`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Tháng trước</span>
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={goToCurrentMonth}
                        className={`px-5 py-2.5 text-sm font-semibold ${isDarkMode ? 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20' : 'text-orange-600 bg-orange-100 hover:bg-orange-200'} rounded-xl transition-all`}
                      >
                        Tháng này
                      </button>
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} capitalize`}>
                        {getMonthName()}
                      </span>
                    </div>

                    <button
                      onClick={goToNextMonth}
                      className={`flex items-center gap-2 px-4 py-2.5 ${isDarkMode ? 'text-gray-300 hover:text-orange-400 hover:bg-gray-700' : 'text-gray-600 hover:text-orange-600 hover:bg-white'} rounded-xl transition-all font-medium`}
                    >
                      <span>Tháng sau</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Monthly Calendar Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                      {/* Header Row - Clean Design */}
                      <div className="grid grid-cols-7 gap-2 mb-3">
                        {DAYS_OF_WEEK.map(day => (
                          <div
                            key={day.value}
                            className={`py-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-orange-50'} rounded-xl text-center`}
                          >
                            <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'} font-bold text-sm tracking-wide`}>{day.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Calendar Body - Modern Clean Cards */}
                      <div className="grid grid-cols-7 gap-2">
                        {getMonthDays().map((day, idx) => {
                          const schedulesForDay = getSchedulesForDate(day.dayValue, new Date(day.date));
                          const hasSchedules = schedulesForDay.length > 0;

                          return (
                            <div
                              key={idx}
                              className={`min-h-[110px] p-3 rounded-2xl transition-all ${!day.isCurrentMonth
                                ? isDarkMode
                                  ? 'bg-gray-800/20 opacity-40'
                                  : 'bg-gray-50/50 opacity-50'
                                : day.isToday
                                  ? isDarkMode
                                    ? 'bg-orange-500/20 border-2 border-orange-500/40 shadow-lg'
                                    : 'bg-orange-50 border-2 border-orange-300 shadow-lg'
                                  : hasSchedules
                                    ? isDarkMode
                                      ? 'bg-gray-800/50 border border-orange-500/20'
                                      : 'bg-orange-50/30 border border-orange-100'
                                    : isDarkMode
                                      ? 'bg-gray-800/30 border border-gray-700 hover:border-orange-500/30'
                                      : 'bg-gray-50 border border-gray-100 hover:border-orange-200'
                                }`}
                            >
                              {/* Số ngày */}
                              <div className={`text-right mb-2 ${!day.isCurrentMonth
                                ? 'text-gray-400'
                                : day.isToday
                                  ? isDarkMode ? 'text-orange-300 font-bold' : 'text-orange-600 font-bold'
                                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                <span className={`inline-block w-7 h-7 leading-7 text-center rounded-full text-sm font-semibold ${day.isToday
                                  ? isDarkMode
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-orange-500 text-white shadow-sm'
                                  : ''
                                  }`}>
                                  {day.day}
                                </span>
                              </div>

                              {/* Events */}
                              {hasSchedules && day.isCurrentMonth && (
                                <div className="space-y-1">
                                  {schedulesForDay.slice(0, 2).map((schedule, sIdx) => {
                                    const trangThai = getTrangThaiBadge(schedule.trangThai);
                                    console.log('Schedule on grid:', schedule); // Debug log
                                    return (
                                      <button
                                        key={schedule.maLT || sIdx}
                                        onClick={() => openEventModal(schedule)}
                                        className={`w-full px-2 py-1.5 rounded text-left text-xs font-semibold ${trangThai.bg} hover:shadow-md transition-all`}
                                        style={{ color: '#1f2937' }} // Force dark text
                                      >
                                        <div className="truncate">
                                          {schedule.tenKhuVuc || schedule.tenLop || 'Lịch tập'}
                                        </div>
                                      </button>
                                    );
                                  })}
                                  {schedulesForDay.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center">
                                      +{schedulesForDay.length - 2} thêm
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Chú thích - Modern */}
                  <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-8 flex-wrap`}>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold tracking-wide`}>Chú thích:</span>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-lg border-2 border-green-300"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Đang hoạt động</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-orange-500 rounded-full shadow-sm"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Hôm nay</span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>* Nhấn vào lịch tập để xem chi tiết</span>
                  </div>

                  {/* Tổng hợp số liệu - Clean Stats */}
                  {(lichTapList || []).length > 0 && (
                    <div className={`mt-6 p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          <strong className="text-gray-800">{(lichTapList || []).length}</strong> lịch tập
                        </span>
                        <span className="text-gray-600">
                          <strong className="text-green-600">{(lichTapList || []).filter(lt => (lt.trangThai || '').toLowerCase().includes('mo')).length}</strong> đang hoạt động
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Profile */}
              {activeTab === 'profile' && (
                <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
                  boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
                }}>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-8 flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                    </div>
                    <span>Thông tin cá nhân</span>
                  </h2>

                  {taiKhoan ? (
                    <div>
                      {!isEditing ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Họ tên</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.hoTen || '-'}</div>
                            </div>
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Email</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.email || '-'}</div>
                            </div>
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Số điện thoại</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.soDienThoai || '-'}</div>
                            </div>
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Giới tính</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.gioiTinh || '-'}</div>
                            </div>
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Ngày sinh</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.ngaySinh || '-'}</div>
                            </div>
                            <div className={`p-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl col-span-1 md:col-span-2`}>
                              <div className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Địa chỉ</div>
                              <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{taiKhoan.diaChi || '-'}</div>
                            </div>
                          </div>
                          <div className="mt-8">
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                              Chỉnh sửa thông tin
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Họ tên</label>
                              <input
                                name="hoTen"
                                value={taiKhoan.hoTen || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Email</label>
                              <input
                                name="email"
                                value={taiKhoan.email || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Số điện thoại</label>
                              <input
                                name="soDienThoai"
                                value={taiKhoan.soDienThoai || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Giới tính</label>
                              <select
                                name="gioiTinh"
                                value={taiKhoan.gioiTinh || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              >
                                <option value="">-- Chọn --</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                              </select>
                            </div>
                            <div>
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Ngày sinh</label>
                              <input
                                type="date"
                                name="ngaySinh"
                                value={taiKhoan.ngaySinh || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Địa chỉ</label>
                              <input
                                name="diaChi"
                                value={taiKhoan.diaChi || ''}
                                onChange={handleChange}
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 pt-6">
                            <button
                              type="submit"
                              disabled={saving}
                              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 hover:scale-105"
                            >
                              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className={`px-8 py-3.5 border-2 rounded-2xl font-semibold transition-all ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Không có thông tin tài khoản</div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Quick Stats & Tips */}
          <aside className={`hidden xl:block w-80 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 h-screen overflow-y-auto transition-colors duration-300`}>
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Thống kê nhanh</h3>
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
                    <div className="flex items-center justify-between">
                      <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                        {(lichTapList || []).length}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tổng lịch tập</p>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                    <div className="flex items-center justify-between">
                      <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {(lichTapList || []).filter(lt => lt.trangThai?.toLowerCase().includes('mo')).length}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Đang hoạt động</p>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                    <div className="flex items-center justify-between">
                      <Target className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {new Set((lichTapList || []).map(lt => lt.tenDichVu || lt.tenLop).filter(Boolean)).size}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dịch vụ đã đăng ký</p>
                  </div>
                </div>
              </div>

              {/* Tips Box */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-900' : 'bg-gradient-to-br from-purple-500 to-indigo-600'} text-white`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Mẹo hôm nay</h4>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  Hãy uống ít nhất 2 lít nước mỗi ngày để duy trì sức khỏe tốt nhất trong quá trình tập luyện!
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Liên kết nhanh</h3>
                <div className="space-y-2">
                  <a href="#" className={`block p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-all text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📚 Hướng dẫn sử dụng
                  </a>
                  <a href="#" className={`block p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-all text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    💬 Liên hệ hỗ trợ
                  </a>
                  <a href="#" className={`block p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-all text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ⭐ Đánh giá dịch vụ
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
          <div
            className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Chi tiết lịch tập
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Mã lịch: {selectedEvent.maLT}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedEvent.trangThai?.toLowerCase().includes('dang') || selectedEvent.trangThai?.toLowerCase().includes('mo')
                  ? 'bg-green-100 text-green-700'
                  : selectedEvent.trangThai?.toLowerCase().includes('tam') || selectedEvent.trangThai?.toLowerCase().includes('dung')
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {selectedEvent.trangThai || 'Đang hoạt động'}
                </span>
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedEvent.loaiLich === 'PT'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {selectedEvent.loaiLich === 'PT' ? 'Personal Training' : 'Lớp học'}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Trainer/Instructor */}
                {selectedEvent.tenNhanVien && (
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-orange-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-orange-600" strokeWidth={2} />
                      <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedEvent.loaiLich === 'PT' ? 'Huấn luyện viên' : 'Giảng viên'}
                      </span>
                    </div>
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedEvent.tenNhanVien}
                    </div>
                  </div>
                )}

                {/* Session Time */}
                {selectedEvent.tenCaTap && (
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
                      <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ca tập
                      </span>
                    </div>
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedEvent.tenCaTap}
                    </div>
                    {selectedEvent.moTaCaTap && (
                      <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedEvent.moTaCaTap}
                      </div>
                    )}
                  </div>
                )}

                {/* Class Name */}
                {selectedEvent.tenLop && (
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-green-600" strokeWidth={2} />
                      <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Lớp học
                      </span>
                    </div>
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedEvent.tenLop}
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedEvent.tenKhuVuc && (
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-purple-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-purple-600" strokeWidth={2} />
                      <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Khu vực
                      </span>
                    </div>
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedEvent.tenKhuVuc}
                    </div>
                  </div>
                )}

                {/* Day of Week */}
                {selectedEvent.thu && (
                  <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarDays className="w-5 h-5 text-yellow-600" strokeWidth={2} />
                      <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ngày tập
                      </span>
                    </div>
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedEvent.thu.split('').map(day => {
                        const dayMap = { '2': 'T2', '3': 'T3', '4': 'T4', '5': 'T5', '6': 'T6', '7': 'T7', 'C': 'CN', 'N': '' };
                        return dayMap[day] || day;
                      }).filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range */}
              {(selectedEvent.ngayBD || selectedEvent.ngayKT) && (
                <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-600" strokeWidth={2} />
                    <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Thời hạn
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedEvent.ngayBD && (
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Bắt đầu</div>
                        <div className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {new Date(selectedEvent.ngayBD).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}
                    {selectedEvent.ngayBD && selectedEvent.ngayKT && (
                      <div className={`text-gray-400`}>→</div>
                    )}
                    {selectedEvent.ngayKT && (
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Kết thúc</div>
                        <div className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {new Date(selectedEvent.ngayKT).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
};

export default UserHome;
