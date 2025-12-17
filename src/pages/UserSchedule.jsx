import { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, User, Dumbbell, 
  CheckCircle, AlertCircle, XCircle, ChevronLeft, ChevronRight,
  Users, Star, Filter, RefreshCw
} from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const UserSchedule = () => {
  const navigate = useNavigate();
  const [lichTap, setLichTap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pt, lop
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchLichTap();
  }, []);

  const fetchLichTap = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getLichTap();
      setLichTap(res.danhSachLichTap || res || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }
      setError(err.response?.data || err.message || 'Lỗi khi tải lịch tập');
    } finally {
      setLoading(false);
    }
  };

  const getTrangThaiBadge = (trangThai) => {
    const status = trangThai?.toLowerCase() || '';
    if (status.includes('dang') || status.includes('mở') || status.includes('mo')) {
      return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đang hoạt động' };
    }
    if (status.includes('tam') || status.includes('dung')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Tạm dừng' };
    }
    if (status.includes('huy')) {
      return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Đã hủy' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: trangThai || 'Không xác định' };
  };

  const getLoaiLichBadge = (loaiLich) => {
    if (loaiLich?.toLowerCase() === 'pt') {
      return { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', icon: User, label: 'PT 1-1' };
    }
    return { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: Users, label: 'Lớp học' };
  };

  const getDayName = (thu) => {
    const dayMap = {
      '2': 'Thứ 2', '3': 'Thứ 3', '4': 'Thứ 4', 
      '5': 'Thứ 5', '6': 'Thứ 6', '7': 'Thứ 7', 'CN': 'Chủ nhật'
    };
    
    if (!thu) return 'Chưa xác định';
    
    // Handle format like "246" -> "Thứ 2, Thứ 4, Thứ 6"
    if (thu.length > 1 && !thu.includes(',')) {
      return thu.split('').map(d => dayMap[d] || d).join(', ');
    }
    
    return dayMap[thu] || thu;
  };

  const filteredLichTap = lichTap.filter(lt => {
    if (filter === 'all') return true;
    if (filter === 'pt') return lt.loaiLich?.toLowerCase() === 'pt';
    if (filter === 'lop') return lt.loaiLich?.toLowerCase() === 'lop';
    return true;
  });

  // Group by day
  const groupedByDay = filteredLichTap.reduce((acc, lt) => {
    const days = lt.thu?.split('') || ['?'];
    days.forEach(day => {
      if (!acc[day]) acc[day] = [];
      acc[day].push(lt);
    });
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lịch tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <BackToUserHome className="mb-4 text-white hover:text-orange-200" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">Lịch tập của tôi</h1>
                <p className="text-orange-100 mt-1">Xem và theo dõi lịch tập đã đăng ký</p>
              </div>
            </div>
            <button 
              onClick={fetchLichTap}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{lichTap.length}</div>
              <div className="text-sm text-orange-100">Tổng lịch tập</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {lichTap.filter(lt => lt.loaiLich?.toLowerCase() === 'pt').length}
              </div>
              <div className="text-sm text-orange-100">Lịch PT 1-1</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {lichTap.filter(lt => lt.loaiLich?.toLowerCase() === 'lop').length}
              </div>
              <div className="text-sm text-orange-100">Lịch lớp học</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Filter className="w-4 h-4" />
            Lọc:
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tất cả', count: lichTap.length },
              { key: 'pt', label: 'PT 1-1', count: lichTap.filter(lt => lt.loaiLich?.toLowerCase() === 'pt').length },
              { key: 'lop', label: 'Lớp học', count: lichTap.filter(lt => lt.loaiLich?.toLowerCase() === 'lop').length }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {filteredLichTap.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có lịch tập</h3>
            <p className="text-gray-500 mb-6">
              Bạn chưa có lịch tập nào. Hãy đăng ký dịch vụ để bắt đầu!
            </p>
            <button
              onClick={() => navigate('/user/dang-ky')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Đăng ký dịch vụ ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLichTap.map((lt, idx) => {
              const trangThai = getTrangThaiBadge(lt.trangThai);
              const loaiLich = getLoaiLichBadge(lt.loaiLich);
              const TrangThaiIcon = trangThai.icon;
              const LoaiLichIcon = loaiLich.icon;

              return (
                <div 
                  key={lt.maLT || idx} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex">
                    {/* Left Color Bar */}
                    <div className={`w-2 ${loaiLich.bg}`}></div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Main Info */}
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 ${loaiLich.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                            <LoaiLichIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-800">
                                {lt.tenCaTap || lt.tenLop || `Lịch tập #${lt.maLT}`}
                              </h3>
                              <span className={`px-3 py-1 ${loaiLich.bg} text-white text-xs font-bold rounded-full`}>
                                {loaiLich.label}
                              </span>
                              <span className={`px-3 py-1 ${trangThai.bg} ${trangThai.text} text-xs font-bold rounded-full flex items-center gap-1`}>
                                <TrangThaiIcon className="w-3 h-3" />
                                {trangThai.label}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm">{getDayName(lt.thu)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm">{lt.moTaCaTap || lt.tenCa || 'Chưa xác định'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm">{lt.tenKhuVuc || 'Chưa xác định'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{lt.tenNhanVien || lt.tenTrainer || 'Chưa phân công'}</span>
                              </div>
                            </div>

                            {lt.tenLop && (
                              <div className="mt-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-blue-600 font-medium">Lớp: {lt.tenLop}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-gray-500">Mã lịch</div>
                          <div className="text-lg font-bold text-primary">{lt.maLT}</div>
                          
                          {lt.loaiLich?.toLowerCase() === 'pt' && (
                            <div className="flex items-center gap-1 text-orange-600 mt-2">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">Personal Training</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info for PT */}
                      {lt.loaiLich?.toLowerCase() === 'pt' && lt.tenNhanVien && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Huấn luyện viên của bạn</div>
                              <div className="font-bold text-gray-800">{lt.tenNhanVien}</div>
                            </div>
                            <div className="ml-auto text-right">
                              <div className="text-xs text-gray-500">Mã HLV</div>
                              <div className="font-medium text-orange-600">{lt.maNV}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {lichTap.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4">Chú thích</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded"></div>
                <span className="text-sm text-gray-600">Lịch PT 1-1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                <span className="text-sm text-gray-600">Lịch lớp học</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Đang hoạt động</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Tạm dừng</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSchedule;
