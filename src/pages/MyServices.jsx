import { useEffect, useState } from 'react';
import { dichVuGymService } from '../services/api';
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
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  } catch (e) {
    return String(value);
  }
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

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

  const kh = data?.khachHang;
  const ds = data?.dichVuDaDangKy || [];

  const total = ds.reduce((s, it) => s + (Number(it.giaTien || it.gia || 0) || 0), 0);

  return (
    <div className="space-y-6">
      <BackToUserHome className="mb-2" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dịch vụ của tôi</h1>
        <div className="text-sm text-gray-600">{ds.length} dịch vụ</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-medium">Thông tin khách hàng</h2>
        {kh ? (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
            <div><div className="text-xs text-gray-500">Mã KH</div><div className="font-medium">{kh.maKH || '-'}</div></div>
            <div><div className="text-xs text-gray-500">Họ tên</div><div className="font-medium">{kh.hoTen || '-'}</div></div>
            <div><div className="text-xs text-gray-500">Email</div><div className="font-medium">{kh.email || '-'}</div></div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">Không có thông tin khách hàng</div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Các gói/dịch vụ đã đăng ký</h2>
          <div className="text-sm text-gray-700">Tổng: <span className="font-semibold">{currency(total)}</span></div>
        </div>

        {ds.length === 0 ? (
          <div className="mt-4 text-sm text-gray-500">Bạn chưa đăng ký dịch vụ nào.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ds.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Mã DV</div>
                    <div className="font-semibold text-gray-900">{item.maDV || item.maDichVu || '-'}</div>
                    <div className="mt-2 text-sm text-gray-700">{item.tenDichVu || item.tenDV || item.ten || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Giá</div>
                    <div className="text-sm font-medium text-pink-600">{currency(item.giaTien || item.gia || item.price)}</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <div><span className="text-xs text-gray-500">Bắt đầu:</span> <span className="font-medium">{dateFormatter(item.ngayBD || item.ngayBatDau)}</span></div>
                  <div><span className="text-xs text-gray-500">Kết thúc:</span> <span className="font-medium">{dateFormatter(item.ngayKT || item.ngayKetThuc)}</span></div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Trạng thái</div>
                  <div className="text-sm font-medium text-green-600">Đã kích hoạt</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices;
