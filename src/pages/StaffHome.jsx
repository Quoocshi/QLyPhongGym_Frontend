import { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Sun, Moon,
  Eye, Wrench, CheckCircle, AlertTriangle,
  Plus, X, RefreshCw, MapPin, Calendar,
  ClipboardList, Settings, Activity, Search,
  Filter, ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';

const StaffHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('monitor'); // monitor, maintenance, update

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Staff info
  const [staffInfo, setStaffInfo] = useState({
    hoTen: 'Nhân viên',
    maNV: 'NV001'
  });

  // Area monitoring data
  const [areas, setAreas] = useState([
    { maKV: 'KV001', tenKhuVuc: 'Khu vực Cardio', soThietBi: 15, thietBiHoatDong: 13, thietBiHuHong: 2, trangThai: 'Bình thường' },
    { maKV: 'KV002', tenKhuVuc: 'Khu vực Tạ', soThietBi: 20, thietBiHoatDong: 18, thietBiHuHong: 2, trangThai: 'Cần kiểm tra' },
    { maKV: 'KV003', tenKhuVuc: 'Khu vực Yoga', soThietBi: 10, thietBiHoatDong: 10, thietBiHuHong: 0, trangThai: 'Tốt' },
  ]);

  // Equipment list
  const [equipmentList, setEquipmentList] = useState([
    { maTB: 'TB001', tenThietBi: 'Máy chạy bộ A1', maKV: 'KV001', tenKhuVuc: 'Khu vực Cardio', trangThai: 'Hoạt động', ngayBaoTri: '2024-01-15' },
    { maTB: 'TB002', tenThietBi: 'Máy chạy bộ A2', maKV: 'KV001', tenKhuVuc: 'Khu vực Cardio', trangThai: 'Hư hỏng', ngayBaoTri: '2024-01-10' },
    { maTB: 'TB003', tenThietBi: 'Tạ đơn 10kg', maKV: 'KV002', tenKhuVuc: 'Khu vực Tạ', trangThai: 'Hoạt động', ngayBaoTri: '2024-01-12' },
    { maTB: 'TB004', tenThietBi: 'Ghế tập lưng', maKV: 'KV002', tenKhuVuc: 'Khu vực Tạ', trangThai: 'Hư hỏng', ngayBaoTri: '2024-01-08' },
    { maTB: 'TB005', tenThietBi: 'Thảm Yoga', maKV: 'KV003', tenKhuVuc: 'Khu vực Yoga', trangThai: 'Hoạt động', ngayBaoTri: '2024-01-20' },
  ]);

  // Maintenance tickets
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    { maPBT: 'PBT001', maTB: 'TB002', tenThietBi: 'Máy chạy bộ A2', moTaLoi: 'Băng chạy bị trượt', ngayTao: '2024-01-21', trangThai: 'Đang xử lý' },
    { maPBT: 'PBT002', maTB: 'TB004', tenThietBi: 'Ghế tập lưng', moTaLoi: 'Đệm bị rách', ngayTao: '2024-01-20', trangThai: 'Chờ xử lý' },
  ]);

  // Form states
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    maTB: '',
    tenThietBi: '',
    moTaLoi: '',
  });

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    maTB: '',
    tenThietBi: '',
    trangThaiMoi: 'Hoạt động',
  });

  // Filters
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with actual API calls
      // const response = await staffService.getHome();
      // setStaffInfo(response);

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
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

  const handleCreateMaintenanceTicket = (e) => {
    e.preventDefault();

    const newTicket = {
      maPBT: `PBT${String(maintenanceTickets.length + 1).padStart(3, '0')}`,
      maTB: maintenanceForm.maTB,
      tenThietBi: maintenanceForm.tenThietBi,
      moTaLoi: maintenanceForm.moTaLoi,
      ngayTao: new Date().toISOString().split('T')[0],
      trangThai: 'Chờ xử lý'
    };

    setMaintenanceTickets([newTicket, ...maintenanceTickets]);
    setShowMaintenanceForm(false);
    setMaintenanceForm({ maTB: '', tenThietBi: '', moTaLoi: '' });
    alert('Đã tạo phiếu bảo trì thành công!');
  };

  const handleUpdateEquipmentStatus = (e) => {
    e.preventDefault();

    setEquipmentList(equipmentList.map(eq =>
      eq.maTB === updateForm.maTB
        ? { ...eq, trangThai: updateForm.trangThaiMoi, ngayBaoTri: new Date().toISOString().split('T')[0] }
        : eq
    ));

    setShowUpdateForm(false);
    setUpdateForm({ maTB: '', tenThietBi: '', trangThaiMoi: 'Hoạt động' });
    alert('Đã cập nhật trạng thái thiết bị thành công!');
  };

  const getStatusBadge = (trangThai) => {
    const status = trangThai?.toLowerCase() || '';
    if (status.includes('hoạt động') || status.includes('tốt')) {
      return { bg: 'bg-green-100', text: 'text-green-700', label: trangThai };
    }
    if (status.includes('hư') || status.includes('hỏng')) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: trangThai };
    }
    if (status.includes('kiểm tra') || status.includes('chờ')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: trangThai };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: trangThai };
  };

  const filteredEquipment = equipmentList.filter(eq => {
    const matchesArea = areaFilter === 'all' || eq.maKV === areaFilter;
    const matchesStatus = statusFilter === 'all' || eq.trangThai === statusFilter;
    const matchesSearch = searchQuery === '' ||
      eq.tenThietBi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.maTB.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="text-center">
          <Wrench className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`} style={{
      background: isDarkMode
        ? 'linear-gradient(to bottom right, #1F2937, #111827, #1F2937)'
        : 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)'
    }}>
      {/* Header */}
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
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-orange-100'} tracking-wide`}>Xin chào, Nhân viên</span>
                <h1 className="text-3xl font-bold mt-1 tracking-tight">{staffInfo.hoTen}</h1>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-orange-100/80'} mt-1.5`}>ID: {staffInfo.maNV}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Chat Button */}
              <button
                onClick={() => navigate('/staff/chat')}
                className={`flex items-center gap-2 px-5 py-2.5 ${isDarkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-white/15 hover:bg-white/20'} rounded-xl transition-all backdrop-blur-sm shadow-md font-medium`}
                title="Chat với khách hàng"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mt-8">
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">{areas.length}</div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Khu vực</div>
            </div>
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">
                {equipmentList.filter(eq => eq.trangThai === 'Hoạt động').length}
              </div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Thiết bị hoạt động</div>
            </div>
            <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} backdrop-blur-xl rounded-2xl p-5 text-center border shadow-xl`}>
              <div className="text-4xl font-extrabold tracking-tight">
                {equipmentList.filter(eq => eq.trangThai === 'Hư hỏng').length}
              </div>
              <div className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-white/90'}`}>Cần bảo trì</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { key: 'monitor', label: 'Giám sát khu vực', icon: Eye },
              { key: 'maintenance', label: 'Quản lý bảo trì', icon: Wrench, count: maintenanceTickets.length },
              { key: 'update', label: 'Cập nhật trạng thái', icon: CheckCircle }
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

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab: Monitor Areas */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
              boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <span>Giám sát khu vực tập luyện</span>
                </h2>
                <button
                  onClick={fetchData}
                  className={`p-3 ${isDarkMode ? 'text-gray-400 hover:text-orange-400 hover:bg-gray-800' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'} rounded-xl transition-all`}
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {areas.map(area => {
                  const statusBadge = getStatusBadge(area.trangThai);
                  const healthPercentage = (area.thietBiHoatDong / area.soThietBi * 100).toFixed(0);

                  return (
                    <div key={area.maKV} className={`p-6 rounded-2xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:shadow-lg transition-all`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{area.tenKhuVuc}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{area.maKV}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tổng thiết bị:</span>
                          <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{area.soThietBi}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hoạt động:</span>
                          <span className="font-bold text-green-600">{area.thietBiHoatDong}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hư hỏng:</span>
                          <span className="font-bold text-red-600">{area.thietBiHuHong}</span>
                        </div>

                        {/* Health Bar */}
                        <div className="pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tình trạng</span>
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{healthPercentage}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${healthPercentage >= 80 ? 'bg-green-500' :
                                healthPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${healthPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment List */}
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
              boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
            }}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-6 flex items-center gap-3`}>
                <Activity className="w-6 h-6 text-orange-600" />
                <span>Danh sách thiết bị</span>
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm thiết bị..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all`}
                    />
                  </div>
                </div>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all`}
                >
                  <option value="all">Tất cả khu vực</option>
                  {areas.map(area => (
                    <option key={area.maKV} value={area.maKV}>{area.tenKhuVuc}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all`}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Hư hỏng">Hư hỏng</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mã TB</th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tên thiết bị</th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Khu vực</th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trạng thái</th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ngày bảo trì</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map(eq => {
                      const statusBadge = getStatusBadge(eq.trangThai);
                      return (
                        <tr key={eq.maTB} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{eq.maTB}</td>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold`}>{eq.tenThietBi}</td>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{eq.tenKhuVuc}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{eq.ngayBaoTri}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Maintenance Management */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
              boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span>Quản lý bảo trì thiết bị</span>
                </h2>
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Tạo phiếu bảo trì
                </button>
              </div>

              {/* Maintenance Tickets List */}
              <div className="space-y-4">
                {maintenanceTickets.map(ticket => {
                  const statusBadge = getStatusBadge(ticket.trangThai);
                  return (
                    <div key={ticket.maPBT} className={`p-6 rounded-2xl border-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:shadow-lg transition-all`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{ticket.tenThietBi}</h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mã phiếu: {ticket.maPBT} • Mã TB: {ticket.maTB}</p>
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'} mb-3`}>
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Mô tả lỗi:</p>
                            <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ticket.moTaLoi}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.ngayTao}</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {maintenanceTickets.length === 0 && (
                  <div className="text-center py-12">
                    <Settings className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chưa có phiếu bảo trì nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Update Equipment Status */}
        {activeTab === 'update' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-900/60' : 'bg-white'} rounded-3xl p-8 transition-colors duration-300`} style={{
              boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                  </div>
                  <span>Cập nhật trạng thái thiết bị</span>
                </h2>
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <CheckCircle className="w-5 h-5" />
                  Cập nhật trạng thái
                </button>
              </div>

              <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-blue-500/10 border-2 border-blue-500/20' : 'bg-blue-50 border-2 border-blue-100'}`}>
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Hướng dẫn cập nhật trạng thái</h3>
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                      <li>• Sau khi đội bảo trì hoàn tất sửa chữa, nhân viên cần cập nhật trạng thái thiết bị</li>
                      <li>• Chọn thiết bị cần cập nhật và trạng thái mới (Hoạt động/Hư hỏng)</li>
                      <li>• Hệ thống sẽ tự động ghi nhận thời gian cập nhật</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Equipment Status List */}
              <div className="mt-6 space-y-3">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Danh sách thiết bị</h3>
                {equipmentList.map(eq => {
                  const statusBadge = getStatusBadge(eq.trangThai);
                  return (
                    <div key={eq.maTB} className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-all`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${statusBadge.bg} flex items-center justify-center`}>
                            <Settings className={`w-6 h-6 ${statusBadge.text}`} />
                          </div>
                          <div>
                            <h4 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{eq.tenThietBi}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{eq.maTB} • {eq.tenKhuVuc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bảo trì: {eq.ngayBaoTri}</p>
                          </div>
                          <button
                            onClick={() => {
                              setUpdateForm({ maTB: eq.maTB, tenThietBi: eq.tenThietBi, trangThaiMoi: eq.trangThai });
                              setShowUpdateForm(true);
                            }}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                          >
                            Cập nhật
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl w-full max-w-md overflow-hidden`} style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div className="p-6" style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)'
            }}>
              <div className="flex items-center justify-between text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Wrench className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span>Tạo phiếu bảo trì</span>
                </h2>
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="p-2 hover:bg-white/15 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateMaintenanceTicket} className="p-6 space-y-5">
              <div>
                <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Chọn thiết bị</label>
                <select
                  required
                  value={maintenanceForm.maTB}
                  onChange={(e) => {
                    const selectedEq = equipmentList.find(eq => eq.maTB === e.target.value);
                    setMaintenanceForm({
                      ...maintenanceForm,
                      maTB: e.target.value,
                      tenThietBi: selectedEq?.tenThietBi || ''
                    });
                  }}
                  className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {equipmentList.map(eq => (
                    <option key={eq.maTB} value={eq.maTB}>{eq.tenThietBi} ({eq.maTB})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Mô tả lỗi</label>
                <textarea
                  required
                  rows={4}
                  value={maintenanceForm.moTaLoi}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, moTaLoi: e.target.value })}
                  placeholder="Mô tả chi tiết tình trạng hư hỏng của thiết bị..."
                  className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Tạo phiếu
                </button>
                <button
                  type="button"
                  onClick={() => setShowMaintenanceForm(false)}
                  className={`flex-1 px-6 py-3.5 border-2 rounded-2xl font-semibold transition-all ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Form Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl w-full max-w-md overflow-hidden`} style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div className="p-6" style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)'
            }}>
              <div className="flex items-center justify-between text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span>Cập nhật trạng thái</span>
                </h2>
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="p-2 hover:bg-white/15 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateEquipmentStatus} className="p-6 space-y-5">
              <div>
                <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Chọn thiết bị</label>
                <select
                  required
                  value={updateForm.maTB}
                  onChange={(e) => {
                    const selectedEq = equipmentList.find(eq => eq.maTB === e.target.value);
                    setUpdateForm({
                      ...updateForm,
                      maTB: e.target.value,
                      tenThietBi: selectedEq?.tenThietBi || '',
                      trangThaiMoi: selectedEq?.trangThai || 'Hoạt động'
                    });
                  }}
                  className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {equipmentList.map(eq => (
                    <option key={eq.maTB} value={eq.maTB}>{eq.tenThietBi} ({eq.maTB})</option>
                  ))}
                </select>
              </div>

              {updateForm.tenThietBi && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Thiết bị đã chọn:</p>
                  <p className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{updateForm.tenThietBi}</p>
                </div>
              )}

              <div>
                <label className={`block text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Trạng thái mới</label>
                <select
                  required
                  value={updateForm.trangThaiMoi}
                  onChange={(e) => setUpdateForm({ ...updateForm, trangThaiMoi: e.target.value })}
                  className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Hư hỏng">Hư hỏng</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className={`flex-1 px-6 py-3.5 border-2 rounded-2xl font-semibold transition-all ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHome;
