import { useEffect, useState } from 'react';
import { trainerService, authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Loader, AlertCircle, LogOut, Calendar, Users, Clock, MapPin,
  Plus, Edit, Trash2, CheckCircle, XCircle, User, Star, 
  Dumbbell, RefreshCw, ChevronDown, ChevronUp, Save, X,
  UserCheck, FileText, Filter, CalendarDays, AlertTriangle,
  Award, Target, BookOpen, Grid3X3, ChevronLeft, ChevronRight
} from 'lucide-react';

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

const TrainerHome = () => {
  const navigate = useNavigate();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [maNV, setMaNV] = useState('');
  const [lichTapList, setLichTapList] = useState([]); // dsPTSchedules
  const [khachHangList, setKhachHangList] = useState([]); // dsPTCustomers (basic)
  const [khachHangChiTiet, setKhachHangChiTiet] = useState([]); // Chi tiết KH với ngayBD, ngayKT, tenDV
  const [caTapList, setCaTapList] = useState([]); // dsCaTap
  const [khuVucList, setKhuVucList] = useState([]); // dsKhuVuc
  const [lopList, setLopList] = useState([]); // dsLop
  const [boMonList, setBoMonList] = useState([]); // Danh sách bộ môn trainer phụ trách
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, customers, classes
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    maKH: '',
    tenKH: '',
    ngayBatDau: '', // Ngày bắt đầu PT dạng yyyy-mm-dd
    thuTap: [], // Array of selected days: ['2', '4', '6'] => lưu vào cột "thu"
    caTap: '',
    maKV: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // Cho nút Dừng/Hủy
  
  // Calendar month navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // Event detail modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch trainer home info
      const trainerData = await trainerService.getHome();
      setTrainerInfo(trainerData);

      // Fetch lịch cá nhân PT (includes dsPTCustomers, dsPTSchedules, dsCaTap, dsKhuVuc)
      try {
        const lichCaNhan = await trainerService.getLichCaNhan();
        console.log('=== DEBUG: lichCaNhan response ===', lichCaNhan);
        console.log('dsCaTap:', lichCaNhan.dsCaTap);
        console.log('dsKhuVuc:', lichCaNhan.dsKhuVuc);
        
        setMaNV(lichCaNhan.maNV || '');
        setKhachHangList(lichCaNhan.dsPTCustomers || []);
        setLichTapList(lichCaNhan.dsPTSchedules || []);
        setCaTapList(lichCaNhan.dsCaTap || []);
        setKhuVucList(lichCaNhan.dsKhuVuc || []);
        
        // Debug: kiểm tra sau khi set
        console.log('After set - caTapList:', lichCaNhan.dsCaTap?.length || 0, 'items');
        console.log('After set - khuVucList:', lichCaNhan.dsKhuVuc?.length || 0, 'items');
      } catch (e) {
        console.error('❌ Error fetching lich-canhan:', e);
        console.error('Error details:', e.response?.data || e.message);
      }

      // Fetch chi tiết khách hàng PT (có ngayBD, ngayKT, tenDV)
      try {
        const debugData = await trainerService.debugPTCustomers();
        if (debugData.success && debugData.data) {
          setKhachHangChiTiet(debugData.data);
        }
      } catch (e) {
        console.log('Could not fetch debug/ptCustomers:', e);
      }

      // Fetch lịch lớp và extract bộ môn
      try {
        const lichLop = await trainerService.getLichLop();
        const dsLop = lichLop.dsLop || [];
        setLopList(dsLop);
        
        // Extract unique bộ môn từ danh sách lớp
        const boMonSet = new Map();
        dsLop.forEach(lop => {
          if (lop.boMon && lop.boMon.maBM) {
            boMonSet.set(lop.boMon.maBM, lop.boMon);
          }
        });
        setBoMonList(Array.from(boMonSet.values()));
      } catch (e) {
        console.log('Could not fetch lich-lop:', e);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Lỗi khi tải dữ liệu');
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

  const openAddModal = (khachHang = null) => {
    // Nếu có thông tin khách hàng, lấy ngày bắt đầu từ đó
    let defaultNgayBD = '';
    if (khachHang?.ngayBD) {
      // Format yyyy-mm-dd cho input date
      const date = new Date(khachHang.ngayBD);
      defaultNgayBD = date.toISOString().split('T')[0];
    }
    
    setFormData({
      maKH: khachHang?.maKH || '',
      tenKH: khachHang?.hoTen || khachHang?.tenKH || '',
      ngayBatDau: defaultNgayBD, // Ngày bắt đầu PT
      thuTap: [], // Reset selected days
      caTap: '',
      maKV: ''
    });
    setConflictWarning(false);
    setShowAddModal(true);
  };

  // Toggle chọn ngày trong tuần
  const toggleDaySelection = (dayValue) => {
    setFormData(prev => {
      const newThuTap = prev.thuTap.includes(dayValue)
        ? prev.thuTap.filter(d => d !== dayValue)
        : [...prev.thuTap, dayValue].sort((a, b) => {
            const order = ['2', '3', '4', '5', '6', '7', 'CN'];
            return order.indexOf(a) - order.indexOf(b);
          });
      return { ...prev, thuTap: newThuTap };
    });
  };

  // Chuyển đổi thuTap array thành chuỗi "246"
  const getThuTapString = (thuArr = formData.thuTap) => {
    return thuArr.join('');
  };

  // Parse chuỗi "246CN" thành mảng ['2', '4', '6', 'CN']
  const parseThuString = (thuStr) => {
    if (!thuStr) return [];
    const result = [];
    let i = 0;
    while (i < thuStr.length) {
      // Check for "CN"
      if (thuStr.substring(i, i + 2) === 'CN') {
        if (!result.includes('CN')) result.push('CN'); // Tránh trùng lặp
        i += 2;
      } else if (['2', '3', '4', '5', '6', '7'].includes(thuStr[i])) {
        if (!result.includes(thuStr[i])) result.push(thuStr[i]); // Tránh trùng lặp
        i += 1;
      } else {
        i += 1;
      }
    }
    return result;
  };

  // Lấy tất cả các ngày trong tháng hiện tại (bao gồm cả ngày padding từ tháng trước/sau)
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1);
    // Ngày cuối cùng của tháng
    const lastDay = new Date(year, month + 1, 0);
    
    // Xác định ngày bắt đầu calendar (Thứ 2 đầu tiên)
    let startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    // Lùi về thứ 2 (0=CN, 1=T2, ...)
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Luôn tạo 6 tuần (42 ngày) để calendar đồng nhất
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

  // Format tên tháng
  const getMonthName = () => {
    return currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  // Lấy lịch tập cho một ngày cụ thể (dựa vào thu, thời hạn PT và trạng thái)
  const getSchedulesForDate = (dayValue, dateObj = null) => {
    return lichTapList.filter(lt => {
      // Không hiển thị lịch đã hủy (backend trả về "Huy")
      if (lt.trangThai === 'Huy' || lt.trangThai === 'DaHuy') return false;
      
      const thuStr = lt.thu || lt.ngayTap || '';
      const thuArr = parseThuString(thuStr);
      
      // Kiểm tra thứ có khớp không
      if (!thuArr.includes(dayValue)) return false;
      
      // Nếu có ngày cụ thể, thực hiện các kiểm tra bổ sung
      if (dateObj) {
        const checkDate = new Date(dateObj);
        checkDate.setHours(12, 0, 0, 0);
        
        // Tìm thông tin khách hàng để lấy thời hạn PT
        const kh = khachHangChiTiet.find(k => k.maKH === lt.maKH) || 
                   khachHangList.find(k => k.maKH === lt.maKH);
        
        if (kh) {
          const ngayBD = kh.ngayBD ? new Date(kh.ngayBD) : null;
          const ngayKT = kh.ngayKT ? new Date(kh.ngayKT) : null;
          
          // Set hours to 0 for accurate date comparison
          if (ngayBD) ngayBD.setHours(0, 0, 0, 0);
          if (ngayKT) ngayKT.setHours(23, 59, 59, 999);
          
          // Kiểm tra ngày có nằm trong thời hạn PT không
          if (ngayBD && checkDate < ngayBD) return false;
          if (ngayKT && checkDate > ngayKT) return false;
        }
      }
      
      return true;
    });
  };

  // Open event detail modal
  const openEventModal = (schedule) => {
    setSelectedEvent(schedule);
    setShowEventModal(true);
  };

  // Lấy thông tin ca tập từ mã
  const getCaTapInfo = (maCa) => {
    return caTapList.find(ca => ca.maCa === maCa) || null;
  };

  // Lấy thông tin khu vực từ mã
  const getKhuVucInfo = (maKV) => {
    return khuVucList.find(kv => kv.maKV === maKV) || null;
  };

  // Khi chọn khách hàng từ dropdown, tự động điền tên
  const handleSelectKhachHang = (maKH) => {
    // Tìm trong khachHangChiTiet trước (có đầy đủ thông tin hơn)
    let kh = khachHangChiTiet.find(k => k.maKH === maKH);
    if (!kh) {
      kh = khachHangList.find(k => k.maKH === maKH);
    }
    
    // Lấy ngày bắt đầu từ thông tin khách hàng
    let ngayBD = '';
    if (kh?.ngayBD) {
      const date = new Date(kh.ngayBD);
      ngayBD = date.toISOString().split('T')[0]; // Format yyyy-mm-dd
    }
    
    setFormData({
      ...formData,
      maKH: maKH,
      tenKH: kh?.tenKH || kh?.hoTen || '',
      ngayBatDau: ngayBD // Tự động điền ngày bắt đầu từ thông tin đăng ký
    });
  };

  // Lấy danh sách khách hàng cho dropdown (ưu tiên khachHangChiTiet)
  const getKhachHangOptions = () => {
    if (khachHangChiTiet.length > 0) {
      return khachHangChiTiet;
    }
    return khachHangList;
  };

  // Kiểm tra xung đột khi chọn ngày và ca
  const checkConflict = async () => {
    if (formData.thuTap.length > 0 && formData.caTap) {
      try {
        const thuString = getThuTapString();
        const result = await trainerService.kiemTraXungDot(thuString, formData.caTap);
        setConflictWarning(result?.hasConflict || false);
      } catch (e) {
        console.log('Could not check conflict:', e);
        setConflictWarning(false);
      }
    } else {
      setConflictWarning(false);
    }
  };

  useEffect(() => {
    if (formData.thuTap.length > 0 && formData.caTap) {
      checkConflict();
    }
  }, [formData.thuTap, formData.caTap]);

  // Xử lý HỦY lịch tập - Gọi API backend
  const handleHuyLichTap = async () => {
    if (!selectedEvent?.maLT) return;
    
    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO: Bạn có chắc muốn HỦY lịch tập của khách hàng "${selectedEvent.tenKhachHang || selectedEvent.hoTenKH}"?\n\nThao tác này không thể hoàn tác!`
    );
    
    if (!confirmed) return;

    setActionLoading(true);
    try {
      // Gọi API backend để hủy lịch
      const result = await trainerService.huyLichPT(selectedEvent.maLT);
      console.log('Kết quả hủy lịch:', result);
      
      // Kiểm tra response - backend có thể trả về success=true hoặc không có lỗi = thành công
      if (result.success === true || result.maLT || result.message?.includes('thành công')) {
        // Xóa lịch khỏi state để cập nhật lưới ngay lập tức
        setLichTapList(prev => prev.filter(lt => lt.maLT !== selectedEvent.maLT));
        
        setShowEventModal(false);
        setSuccessMsg('✅ Đã hủy lịch tập thành công! Lưới đã được cập nhật.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else if (result.success === false) {
        setError(result.message || 'Không thể hủy lịch tập');
      } else {
        // Nếu không có trường success nhưng có response = thành công (HTTP 200)
        setLichTapList(prev => prev.filter(lt => lt.maLT !== selectedEvent.maLT));
        setShowEventModal(false);
        setSuccessMsg('✅ Đã hủy lịch tập thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Lỗi hủy lịch tập:', err);
      // Kiểm tra nếu thực tế API thành công nhưng response format lỗi
      if (err.response?.status === 200 || err.response?.data?.success === true) {
        setLichTapList(prev => prev.filter(lt => lt.maLT !== selectedEvent.maLT));
        setShowEventModal(false);
        setSuccessMsg('✅ Đã hủy lịch tập thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể hủy lịch tập. Vui lòng thử lại.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLichTap = async () => {
    if (!formData.maKH || !formData.ngayBatDau || formData.thuTap.length === 0 || !formData.caTap || !formData.maKV) {
      setError('Vui lòng điền đầy đủ thông tin (khách hàng, ngày tập, thứ, ca tập, khu vực)');
      return;
    }

    // Kiểm tra trùng lịch ở frontend trước khi gọi API
    const ngayTapDate = new Date(formData.ngayBatDau);
    const dayOfWeek = ngayTapDate.getDay();
    const thuValue = dayOfWeek === 0 ? 'CN' : String(dayOfWeek + 1);
    
    const existingSchedule = lichTapList.find(lt => {
      // Kiểm tra cùng khách hàng, cùng ca, và cùng thứ trong tuần
      const ltThuArr = parseThuString(lt.thu || '');
      const isSameCustomer = lt.maKH === formData.maKH;
      const isSameCa = lt.maCa === formData.caTap;
      const isSameThu = ltThuArr.includes(thuValue);
      const isActive = lt.trangThai !== 'Huy' && lt.trangThai !== 'DaHuy';
      
      return isSameCustomer && isSameCa && isSameThu && isActive;
    });

    if (existingSchedule) {
      const caInfo = getCaTapInfo(formData.caTap);
      const khInfo = khachHangChiTiet.find(k => k.maKH === formData.maKH) || khachHangList.find(k => k.maKH === formData.maKH);
      setError(`⚠️ TRÙNG LỊCH! Khách hàng "${khInfo?.tenKH || khInfo?.hoTen || formData.maKH}" đã có lịch tập vào ${thuValue === 'CN' ? 'Chủ nhật' : 'Thứ ' + thuValue} - Ca "${caInfo?.tenCa || formData.caTap}". Vui lòng chọn ca hoặc ngày khác.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await trainerService.taoLichPT({
        maKH: formData.maKH,
        ngayTap: formData.ngayBatDau, // Backend mong đợi "ngayTap" dạng yyyy-MM-dd
        caTap: formData.caTap,
        maKV: formData.maKV
      });

      if (result.success) {
        setSuccessMsg(result.message || 'Tạo lịch PT thành công!');
        setShowAddModal(false);
        fetchAllData(); // Refresh dữ liệu để cập nhật lưới
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        // Hiển thị thông báo lỗi từ backend
        const errorMsg = result.message || 'Không thể tạo lịch PT';
        if (errorMsg.toLowerCase().includes('trùng') || errorMsg.toLowerCase().includes('xung đột') || errorMsg.toLowerCase().includes('conflict')) {
          setError(`⚠️ TRÙNG LỊCH! ${errorMsg}`);
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Lỗi khi thêm lịch tập';
      // Kiểm tra nếu là lỗi trùng lịch
      if (errorMsg.toLowerCase().includes('trùng') || errorMsg.toLowerCase().includes('xung đột') || errorMsg.toLowerCase().includes('conflict') || errorMsg.toLowerCase().includes('đã có')) {
        setError(`⚠️ TRÙNG LỊCH! ${errorMsg}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getTrangThaiBadge = (trangThai) => {
    const status = trangThai?.toLowerCase() || '';
    if (status.includes('dang') || status.includes('mo')) {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Đang mở' };
    }
    if (status.includes('tam') || status.includes('dung')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Tạm dừng' };
    }
    if (status.includes('huy')) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: trangThai || 'Không xác định' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa xác định';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
<div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-8 h-8" />
              </div>
            <div>
                {/* Dòng chào + Chuyên môn trên cùng một dòng */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-orange-100">Xin chào, Huấn luyện viên</span>
                  {boMonList.length > 0 && (
                    <>
                      <span className="text-orange-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-orange-200" />
                        <span className="text-sm text-orange-100">Chuyên môn:</span>
                        {boMonList.map((bm) => (
                          <span 
                            key={bm.maBM} 
                            className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium"
                          >
                            {bm.tenBM}
                          </span>
                        ))}
            </div>
                    </>
                  )}
          </div>
                <h1 className="text-2xl font-extrabold mt-1">{trainerInfo?.hoTen || trainerInfo?.tenNV || 'Trainer'}</h1>
                <div className="text-sm text-orange-200 mt-1">Mã HLV: {maNV || trainerInfo?.trainerId || trainerInfo?.maNV || '-'}</div>
        </div>
      </div>
          <button
            onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
        
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{lichTapList.length}</div>
              <div className="text-sm text-orange-100">Lịch PT</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{khachHangList.length}</div>
              <div className="text-sm text-orange-100">Khách hàng PT</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{lopList.length}</div>
              <div className="text-sm text-orange-100">Lớp phụ trách</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {lichTapList.filter(lt => lt.trangThai?.toLowerCase().includes('mo')).length}
              </div>
              <div className="text-sm text-orange-100">Đang hoạt động</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { key: 'schedule', label: 'Lịch tập PT', icon: Grid3X3, count: lichTapList.length },
              { key: 'customers', label: 'Khách hàng PT', icon: Users, count: khachHangList.length },
              { key: 'classes', label: 'Lớp phụ trách', icon: FileText, count: lopList.length }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-orange-100 text-orange-600' : 'bg-white/20'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-6 mt-4 space-y-2">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab: Schedule - Monthly Calendar View (Dạng lưới tháng) */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Header với điều khiển tháng */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Lịch tập PT theo tháng
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAllData}
                  className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-all"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openAddModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Thêm lịch tập
                </button>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <button
                onClick={goToPreviousMonth}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Tháng trước
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={goToCurrentMonth}
                  className="px-4 py-2 text-sm font-medium text-primary bg-orange-100 hover:bg-orange-200 rounded-lg transition-all"
                >
                  Tháng này
                </button>
                <span className="text-xl font-bold text-gray-700 capitalize">
                  {getMonthName()}
                </span>
              </div>
              
              <button
                onClick={goToNextMonth}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all"
              >
                Tháng sau
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Monthly Calendar Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header Row - Các ngày trong tuần */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div 
                      key={day.value}
                      className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-center"
                    >
                      <span className="text-white font-bold text-sm">{day.label}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Body - Lưới các ngày trong tháng */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays().map((day, idx) => {
                    // Truyền cả ngày cụ thể để filter theo thời hạn PT của khách hàng
                    const schedulesForDay = getSchedulesForDate(day.dayValue, new Date(day.date));
                    const hasSchedules = schedulesForDay.length > 0;

                    return (
                      <div 
                        key={idx}
                        className={`min-h-[100px] p-2 rounded-lg border transition-all ${
                          !day.isCurrentMonth 
                            ? 'bg-gray-100/50 border-gray-100 opacity-50' 
                            : day.isToday 
                              ? 'bg-orange-50 border-orange-400 border-2 shadow-md' 
                              : hasSchedules 
                                ? 'bg-orange-50/50 border-orange-200' 
                                : 'bg-white border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        {/* Số ngày */}
                        <div className={`text-right mb-1 ${
                          !day.isCurrentMonth 
                            ? 'text-gray-400' 
                            : day.isToday 
                              ? 'text-orange-600 font-bold' 
                              : 'text-gray-600'
                        }`}>
                          <span className={`inline-block w-6 h-6 leading-6 text-center rounded-full text-sm ${
                            day.isToday ? 'bg-orange-500 text-white' : ''
                          }`}>
                            {day.day}
                          </span>
                        </div>
                        
                        {/* Events */}
                        {hasSchedules && day.isCurrentMonth && (
                          <div className="space-y-1">
                            {schedulesForDay.slice(0, 2).map((schedule, sIdx) => {
                              const trangThai = getTrangThaiBadge(schedule.trangThai);
                              return (
                                <button
                                  key={schedule.maLT || sIdx}
                                  onClick={() => openEventModal(schedule)}
                                  className={`w-full px-1.5 py-1 rounded text-left text-xs ${trangThai.bg} ${trangThai.text} hover:shadow-sm transition-all truncate`}
                                >
                                  {schedule.tenKhachHang || schedule.hoTenKH || schedule.maKH}
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

            {/* Chú thích màu sắc */}
            <div className="mt-6 pt-4 border-t flex items-center gap-6 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">Chú thích:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border-2 border-green-300"></div>
                <span className="text-sm text-gray-600">Đang mở</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded border-2 border-yellow-300"></div>
                <span className="text-sm text-gray-600">Tạm dừng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded border-2 border-red-300"></div>
                <span className="text-sm text-gray-600">Đã hủy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Hôm nay</span>
              </div>
              <span className="text-sm text-gray-400 italic">* Nhấn vào sự kiện để xem chi tiết ca tập</span>
            </div>

            {/* Tổng hợp số liệu */}
            {lichTapList.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <strong className="text-gray-800">{lichTapList.length}</strong> lịch tập PT
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-green-600">{lichTapList.filter(lt => (lt.trangThai || '').toLowerCase().includes('mo')).length}</strong> đang hoạt động
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Customers (Khách hàng PT) */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Danh sách Khách hàng đăng ký PT
            </h2>

            {khachHangChiTiet.length === 0 && khachHangList.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có khách hàng</h3>
                <p className="text-gray-500">Chưa có khách hàng nào đăng ký dịch vụ PT với bạn</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sử dụng khachHangChiTiet nếu có, fallback về khachHangList */}
                {(khachHangChiTiet.length > 0 ? khachHangChiTiet : khachHangList).map((kh, idx) => {
                  // Tính trạng thái gói dịch vụ
                  const ngayKT = kh.ngayKT ? new Date(kh.ngayKT) : null;
                  const today = new Date();
                  const isExpired = ngayKT && ngayKT < today;
                  const isActive = ngayKT && ngayKT >= today;
                  const daysLeft = ngayKT ? Math.ceil((ngayKT - today) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <div 
                      key={kh.maCTDK || kh.maKH || idx}
                      className={`border-2 rounded-xl p-5 hover:shadow-md transition-all ${
                        isExpired ? 'border-red-200 bg-red-50' : 
                        isActive && daysLeft <= 7 ? 'border-yellow-200 bg-yellow-50' : 
                        'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-gray-800 text-lg">{kh.tenKH || kh.hoTen || 'Khách hàng'}</h3>
                              <span className="text-sm text-gray-500">({kh.maKH})</span>
                              
                              {/* Trạng thái hóa đơn */}
                              {kh.trangThaiHD && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  kh.trangThaiHD === 'DaThanhToan' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {kh.trangThaiHD === 'DaThanhToan' ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}
                                </span>
                              )}
                            </div>

                            {/* Thông tin dịch vụ/bộ môn */}
                            {kh.tenDV && (
                              <div className="flex items-center gap-2 mt-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">{kh.tenDV}</span>
                              </div>
                            )}

                            {/* Thời gian thuê PT */}
                            {(kh.ngayBD || kh.ngayKT) && (
                              <div className="flex items-center gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    <strong>Từ:</strong> {kh.ngayBD ? new Date(kh.ngayBD).toLocaleDateString('vi-VN') : '-'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                  <Target className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    <strong>Đến:</strong> {kh.ngayKT ? new Date(kh.ngayKT).toLocaleDateString('vi-VN') : '-'}
                                  </span>
                                </div>
                                
                                {/* Badge còn lại */}
                                {daysLeft !== null && (
                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                    isExpired ? 'bg-red-500 text-white' :
                                    daysLeft <= 7 ? 'bg-yellow-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {isExpired 
                                      ? '⚠️ Hết hạn' 
                                      : daysLeft === 0 
                                        ? 'Hôm nay hết hạn'
                                        : `Còn ${daysLeft} ngày`
                                    }
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => openAddModal({ maKH: kh.maKH, hoTen: kh.tenKH || kh.hoTen })}
                          className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-all flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          Tạo lịch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tổng quan */}
            {khachHangChiTiet.length > 0 && (
              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">
                    {khachHangChiTiet.filter(kh => kh.trangThaiHD === 'DaThanhToan').length}
                  </div>
                  <div className="text-sm text-green-600">Đã thanh toán</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-700">
                    {khachHangChiTiet.filter(kh => {
                      const ngayKT = kh.ngayKT ? new Date(kh.ngayKT) : null;
                      const daysLeft = ngayKT ? Math.ceil((ngayKT - new Date()) / (1000 * 60 * 60 * 24)) : null;
                      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                    }).length}
                  </div>
                  <div className="text-sm text-yellow-600">Sắp hết hạn (≤7 ngày)</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-700">
                    {khachHangChiTiet.filter(kh => {
                      const ngayKT = kh.ngayKT ? new Date(kh.ngayKT) : null;
                      return ngayKT && ngayKT < new Date();
                    }).length}
                  </div>
                  <div className="text-sm text-red-600">Đã hết hạn</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Classes (Lớp phụ trách) */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Danh sách Lớp phụ trách
            </h2>

            {lopList.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có lớp</h3>
                <p className="text-gray-500">Bạn chưa được phân công phụ trách lớp nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lopList.map((lop, idx) => (
                  <div 
                    key={lop.maLop || idx}
                    className="border rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{lop.tenLop}</h3>
                        <div className="text-sm text-gray-500 mt-1">Mã lớp: {lop.maLop}</div>
                        {lop.boMon && (
                          <div className="text-sm text-blue-600 mt-1">Bộ môn: {lop.boMon.tenBM}</div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lop.tinhTrangLop === 'ChuaDay' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lop.tinhTrangLop === 'ChuaDay' ? 'Còn chỗ' : 'Đã đầy'}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <div>Sĩ số tối đa: {lop.slToiDa || '-'}</div>
                      <div>Từ: {lop.ngayBD} - {lop.ngayKT}</div>
                      {lop.moTa && <div className="mt-2 text-gray-500">{lop.moTa}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal - Thêm lịch tập PT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" />
                  Thêm Lịch tập PT
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Mã Khách hàng - Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khách hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maKH}
                  onChange={(e) => handleSelectKhachHang(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {getKhachHangOptions().map(kh => (
                    <option key={kh.maCTDK || kh.maKH} value={kh.maKH}>
                      {kh.maKH} - {kh.tenKH || kh.hoTen} {kh.tenDV ? `(${kh.tenDV})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Chọn khách hàng đã đăng ký dịch vụ PT với bạn</p>
                
                {/* Hiển thị thông tin chi tiết khi đã chọn */}
                {formData.maKH && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    {(() => {
                      const selectedKH = getKhachHangOptions().find(k => k.maKH === formData.maKH);
                      if (!selectedKH) return null;
                      return (
                        <div className="space-y-1 text-sm">
                          {selectedKH.tenDV && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="text-gray-700"><strong>Dịch vụ:</strong> {selectedKH.tenDV}</span>
                            </div>
                          )}
                          {(selectedKH.ngayBD || selectedKH.ngayKT) && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-gray-700">
                                <strong>Thời hạn:</strong> {selectedKH.ngayBD ? new Date(selectedKH.ngayBD).toLocaleDateString('vi-VN') : '-'} → {selectedKH.ngayKT ? new Date(selectedKH.ngayKT).toLocaleDateString('vi-VN') : '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Tên Khách hàng - Text Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Khách hàng
                </label>
                <input
                  type="text"
                  value={formData.tenKH}
                  onChange={(e) => setFormData({ ...formData, tenKH: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Nhập tên khách hàng (tự động điền khi chọn)"
                />
                <p className="text-xs text-gray-500 mt-1">Tự động điền khi chọn khách hàng hoặc bạn có thể nhập thủ công</p>
              </div>

              {/* Ngày tập - Date Picker (Backend yêu cầu ngày cụ thể) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ngayBatDau}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    // Tự động xác định thứ từ ngày đã chọn
                    if (selectedDate) {
                      const date = new Date(selectedDate);
                      const dayOfWeek = date.getDay();
                      const thuValue = dayOfWeek === 0 ? 'CN' : String(dayOfWeek + 1);
                      setFormData({ 
                        ...formData, 
                        ngayBatDau: selectedDate,
                        thuTap: [thuValue] // Tự động set thứ tương ứng
                      });
                    } else {
                      setFormData({ ...formData, ngayBatDau: selectedDate, thuTap: [] });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chọn ngày cụ thể khách hàng sẽ tập. Ngày phải nằm trong thời hạn đăng ký PT.
                </p>
                
                {/* Hiển thị thứ của ngày đã chọn */}
                {formData.ngayBatDau && formData.thuTap.length > 0 && (
                  <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200 text-xs text-orange-700">
                    <strong>Thứ:</strong> {formData.thuTap.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.fullLabel).join(', ')}
                  </div>
                )}
                
                {/* Hiển thị thời hạn PT của khách hàng đã chọn */}
                {formData.maKH && (() => {
                  const kh = getKhachHangOptions().find(k => k.maKH === formData.maKH);
                  if (kh?.ngayBD || kh?.ngayKT) {
                    return (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
                        <strong>Thời hạn PT:</strong> {kh.ngayBD ? new Date(kh.ngayBD).toLocaleDateString('vi-VN') : '?'} → {kh.ngayKT ? new Date(kh.ngayKT).toLocaleDateString('vi-VN') : '?'}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Thứ tập trong tuần - Bắt buộc để hiển thị trên lưới */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thứ tập trong tuần <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Chọn các thứ trong tuần khách hàng sẽ tập (tự động chọn khi chọn ngày, hoặc chọn thủ công)
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDaySelection(day.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formData.thuTap.includes(day.value)
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg transform scale-105'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="font-bold text-lg">{day.label}</div>
                      <div className={`text-xs ${formData.thuTap.includes(day.value) ? 'text-orange-100' : 'text-gray-500'}`}>
                        {day.fullLabel}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Hiển thị các ngày đã chọn */}
                {formData.thuTap.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        <strong>Đã chọn:</strong> {formData.thuTap.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.fullLabel).join(', ')}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Mã thứ: "<strong>{getThuTapString()}</strong>" (dùng để hiển thị trên lưới)
                    </div>
                  </div>
                )}
              </div>

              {/* Ca tập - Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ca tập <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.caTap}
                  onChange={(e) => setFormData({ ...formData, caTap: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">-- Chọn ca tập --</option>
                  {caTapList.map(ca => (
                    <option key={ca.maCa} value={ca.maCa}>
                      {ca.tenCa} - {ca.moTa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Khu vực - Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khu vực <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maKV}
                  onChange={(e) => setFormData({ ...formData, maKV: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">-- Chọn khu vực --</option>
                  {khuVucList.map(kv => (
                    <option key={kv.maKV} value={kv.maKV}>
                      {kv.tenKhuVuc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conflict Warning */}
              {conflictWarning && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-800">Cảnh báo xung đột lịch</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Bạn đã có lịch tập vào ngày và ca này. Vui lòng chọn thời gian khác hoặc xác nhận để tiếp tục.
              </div>
            </div>
          </div>
        )}
      </div>
            
            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 border-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleAddLichTap}
                disabled={submitting || !formData.maKH || !formData.ngayBatDau || formData.thuTap.length === 0 || !formData.caTap || !formData.maKV}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Tạo lịch tập
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal - Hiển thị chi tiết ca tập khi click vào sự kiện */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Chi tiết lịch tập PT
                </h2>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Thông tin khách hàng */}
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {selectedEvent.tenKhachHang || selectedEvent.hoTenKH || 'Khách hàng'}
                  </div>
                  <div className="text-sm text-gray-500">Mã KH: {selectedEvent.maKH}</div>
                </div>
              </div>

              {/* Ngày tập trong tuần */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Ngày tập trong tuần
                </div>
                <div className="flex gap-2 flex-wrap">
                  {parseThuString(selectedEvent.thu || selectedEvent.ngayTap).map(d => {
                    const dayInfo = DAYS_OF_WEEK.find(day => day.value === d);
                    return (
                      <span 
                        key={d} 
                        className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold"
                      >
                        {dayInfo?.fullLabel || d}
                      </span>
                    );
                  })}
                  {parseThuString(selectedEvent.thu || selectedEvent.ngayTap).length === 0 && (
                    <span className="text-gray-400 text-sm">Chưa xác định</span>
                  )}
                </div>
              </div>

              {/* Ca tập */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  Ca tập
                </div>
                <div className="font-bold text-blue-700">
                  {selectedEvent.tenCaTap || selectedEvent.moTaCa || (() => {
                    const caInfo = getCaTapInfo(selectedEvent.ca || selectedEvent.caTap || selectedEvent.maCa);
                    return caInfo ? `${caInfo.tenCa} - ${caInfo.moTa}` : (selectedEvent.caTap || 'Chưa xác định');
                  })()}
                </div>
              </div>

              {/* Khu vực */}
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Khu vực
                </div>
                <div className="font-bold text-green-700">
                  {selectedEvent.tenKhuVuc || (() => {
                    const kvInfo = getKhuVucInfo(selectedEvent.maKV);
                    return kvInfo ? kvInfo.tenKhuVuc : 'Chưa xác định';
                  })()}
                </div>
              </div>

              {/* Trạng thái */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="text-sm font-semibold text-gray-600">Trạng thái</div>
                {(() => {
                  const trangThai = getTrangThaiBadge(selectedEvent.trangThai);
                  return (
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${trangThai.bg} ${trangThai.text}`}>
                      {trangThai.label}
                    </span>
                  );
                })()}
              </div>

              {/* Mã lịch tập */}
              <div className="text-center text-xs text-gray-400">
                Mã lịch tập: <strong>{selectedEvent.maLT}</strong>
              </div>
            </div>

            {/* Footer với các nút hành động */}
            <div className="p-4 border-t bg-gray-50 space-y-3">
              {/* Nút Hủy lịch - chỉ hiển thị nếu lịch chưa bị hủy */}
              {selectedEvent.trangThai !== 'Huy' && selectedEvent.trangThai !== 'DaHuy' && (
                <button
                  onClick={handleHuyLichTap}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Hủy lịch tập
                </button>
              )}
              
              {/* Hiển thị thông báo nếu lịch đã hủy */}
              {(selectedEvent.trangThai === 'Huy' || selectedEvent.trangThai === 'DaHuy') && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <div className="text-red-700 font-medium">❌ Lịch đã bị hủy</div>
                </div>
              )}
              
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerHome;
