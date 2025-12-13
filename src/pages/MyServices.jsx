// src/pages/MyServices.jsx
import { useEffect, useMemo } from 'react';
import { useMyServices } from '../contexts/MyServicesContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import BackToUserHome from '../components/BackToUserHome';

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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value));
  } catch (e) {
    return String(value);
  }
};

const MyServices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAuth();
  const { services, loading, error, loadMyServices } = useMyServices();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    // Context sẽ tự gọi API + merge localAdded (nếu bạn có)
    loadMyServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const ds = Array.isArray(services) ? services : [];

  const total = useMemo(() => {
    return ds.reduce((sum, s) => {
      const price = s.giaTien ?? s.gia ?? s.donGia ?? s.price ?? 0;
      return sum + (Number(price) || 0);
    }, 0);
  }, [ds]);

  const kh = useMemo(() => {
    return {
      maKH: user?.maKH || user?.khachHang?.maKH || user?.accountId || 'N/A',
      hoTen: user?.hoTen || user?.khachHang?.hoTen || user?.username || 'Người dùng',
      email: user?.email || user?.khachHang?.email || 'N/A',
    };
  }, [user]);

  if (loading) return <div className="p-6">Đang tải...</div>;

  // error từ context (nếu có)
  if (error) return <div className="p-6 text-red-600">Lỗi: {String(error)}</div>;

  return (
    <div className="space-y-6">
      <BackToUserHome className="mb-2" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dịch vụ của tôi</h1>
        <div className="text-sm text-gray-600">{ds.length} dịch vụ</div>
      </div>

      {/* Thông tin khách hàng */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium">Thông tin khách hàng</h2>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <div>
            <div className="text-xs text-gray-500">Mã KH</div>
            <div className="font-medium">{kh.maKH || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Họ tên</div>
            <div className="font-medium">{kh.hoTen || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{kh.email || '-'}</div>
          </div>
        </div>
      </div>

      {/* Danh sách dịch vụ */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Các gói/dịch vụ đã đăng ký</h2>
          <div className="text-sm text-gray-700">
            Tổng: <span className="font-semibold">{currency(total)}</span>
          </div>
        </div>

        {ds.length === 0 ? (
          <div className="mt-4 text-sm text-gray-500">Bạn chưa đăng ký dịch vụ nào.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ds.map((item, idx) => {
              const maDV = item.maDV || item.maDichVu || item.id || '-';
              const ten = item.tenDichVu || item.tenDV || item.ten || '-';
              const price = item.giaTien ?? item.gia ?? item.donGia ?? item.price ?? 0;

              const ngayBD = item.ngayBD || item.ngayBatDau || item.ngayDangKy;
              const ngayKT = item.ngayKT || item.ngayKetThuc;

              const trangThai = item.trangThai || item.status || 'ACTIVE';

              return (
                <div
                  key={maDV !== '-' ? maDV : idx}
                  className="border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Mã DV</div>
                      <div className="font-semibold text-gray-900">{maDV}</div>
                      <div className="mt-2 text-sm text-gray-700">{ten}</div>

                      {(item.loaiDV || item.tenBM || item.boMon) && (
                        <div className="mt-2 text-xs text-gray-500">
                          {item.tenBM || item.boMon ? (
                            <span className="mr-2">Bộ môn: {item.tenBM || item.boMon}</span>
                          ) : null}
                          {item.loaiDV ? <span>Loại: {item.loaiDV}</span> : null}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Giá</div>
                      <div className="text-sm font-medium text-pink-600">{currency(price)}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="text-xs text-gray-500">Bắt đầu:</span>{' '}
                      <span className="font-medium">{dateFormatter(ngayBD)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Kết thúc:</span>{' '}
                      <span className="font-medium">{dateFormatter(ngayKT)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Trạng thái</div>
                    <div className="text-sm font-medium text-green-600">
                      {String(trangThai)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices;
