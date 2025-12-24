import { useEffect, useState } from 'react';
import { dichVuGymService } from '../services/api';
import BackToUserHome from '../components/BackToUserHome';
import { User, Calendar, Clock, Box, Activity, Smile } from 'lucide-react';

const dateFormatter = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN');
  } catch (e) {
    return iso;
  }
};

const currency = (value) => {
  if (value == null) return '-';
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  } catch (e) {
    return String(value);
  }
};

const ServiceCard = ({ item }) => {
  const isClass = !!item.tenLop; // Check if it's a class
  const isPT = !!item.tenNV && !isClass; // Check if it's PT (has Instructor but no Class Name)

  const endDateStr = item.ngayKT || item.ngayKetThuc;
  const isExpired = endDateStr ? new Date(endDateStr) < new Date() : false;

  // Determine card style based on type
  let bgGradient = 'bg-white';
  let accentColor = 'text-gray-600';
  let iconBg = 'bg-gray-100';
  let TypeIcon = Box;
  let typeLabel = 'Gói tập';
  let borderClass = 'border-gray-200';

  if (isClass) {
    bgGradient = 'bg-gradient-to-br from-blue-50/50 to-white';
    accentColor = 'text-blue-600';
    iconBg = 'bg-blue-100';
    TypeIcon = Activity;
    typeLabel = 'Lớp học';
    borderClass = 'border-blue-100';
  } else if (isPT) {
    bgGradient = 'bg-gradient-to-br from-orange-50/50 to-white';
    accentColor = 'text-orange-600';
    iconBg = 'bg-orange-100';
    TypeIcon = Smile;
    typeLabel = 'Thuê PT';
    borderClass = 'border-orange-100';
  }

  return (
    <div className={`relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border ${borderClass} ${bgGradient} flex flex-col h-full`}>
      {/* Type Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${iconBg} ${accentColor}`}>
        {typeLabel}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 text-xl font-bold ${accentColor}`}>
          <TypeIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 pr-16 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight" title={item.tenDichVu}>
            {item.tenDichVu || item.tenDV || item.ten || 'Dịch vụ chưa đặt tên'}
          </h3>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-mono">
            #{item.maDV}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-4 mb-6 flex-1">
        {/* Dates */}
        <div className="bg-white/60 p-3 rounded-xl border border-gray-100 space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-green-500" />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-gray-500 text-xs uppercase font-semibold">Bắt đầu</span>
              <span className="font-medium text-gray-800">{dateFormatter(item.ngayBD || item.ngayBatDau)}</span>
            </div>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-red-500" />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-gray-500 text-xs uppercase font-semibold">Kết thúc</span>
              <span className="font-medium text-gray-800">{dateFormatter(item.ngayKT || item.ngayKetThuc)}</span>
            </div>
          </div>
        </div>

        {/* Instructor / Class Info */}
        {(item.tenNV || item.maNV) && (
          <div className={`p-3 rounded-xl border border-dashed ${isClass ? 'border-blue-200 bg-blue-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
            {item.tenLop && (
              <div className="mb-2 pb-2 border-b border-dashed border-gray-200">
                <span className="text-xs text-gray-500 block mb-1">Lớp học:</span>
                <span className="font-bold text-gray-800 block">{item.tenLop}</span>
              </div>
            )}

            <div>
              <span className="text-xs text-gray-500 block mb-1">{item.tenLop ? 'Giáo viên hướng dẫn:' : 'Huấn luyện viên cá nhân:'}</span>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isClass ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{item.tenNV}</div>
                  <div className="text-xs text-gray-400 font-mono">({item.maNV})</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Price */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5">
          {isExpired ? (
            <>
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đã hết hạn</span>
            </>
          ) : (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Đang hiệu lực</span>
            </>
          )}
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-pink-600">
            {currency(item.giaTien || item.gia || item.price)}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyServices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await dichVuGymService.getDichVuCuaToi();
        if (mounted) setData(res);
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Thử lại
        </button>
      </div>
    </div>
  );

  const kh = data?.khachHang;
  const ds = data?.dichVuDaDangKy || [];
  const total = ds.reduce((s, it) => s + (Number(it.giaTien || it.gia || 0) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      <BackToUserHome className="mb-4" />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dịch Vụ Của Tôi</h1>
        <p className="text-gray-500">Quản lý các gói tập và dịch vụ bạn đã đăng ký</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Customer Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
                {kh?.hoTen ? kh.hoTen.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="text-lg font-bold text-gray-800">{kh?.hoTen || 'Khách hàng'}</h2>
              <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 font-mono">{kh?.maKH || '---'}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              </div>
              <div className="text-sm text-gray-700 font-medium truncate bg-gray-50 p-2 rounded-lg" title={kh?.email}>{kh?.email || '-'}</div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Tổng giá trị</label>
                <div className="text-2xl font-bold text-green-600">{currency(total)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Services Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              Danh sách đăng ký
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{ds.length}</span>
            </h2>
          </div>

          {ds.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-64 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có dịch vụ nào</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Bạn chưa đăng ký bất kỳ gói tập nào. Hãy khám phá các gói tập ngay!</p>
              <a href="/user/dang-ky" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Đăng ký dịch vụ mới
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ds.map((item, idx) => (
                <ServiceCard key={idx} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyServices;
