import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { ArrowLeft, CreditCard } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentStatus = () => {
  const { maHD } = useParams();
  const navigate = useNavigate();
  const [hoaDon, setHoaDon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await invoiceService.getHoaDon(maHD);
        if (!mounted) return;
        setHoaDon(res);
        setError('');
      } catch (err) {
        setError(err.response?.data || err.message || 'Lỗi khi lấy thông tin hóa đơn');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch
    fetchStatus();

    // poll every 3s to detect payment completion
    const id = setInterval(fetchStatus, 3000);
    return () => { mounted = false; clearInterval(id); };
  }, [maHD]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang kiểm tra trạng thái thanh toán...</div>;

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (!hoaDon) return <div className="p-6">Không tìm thấy hóa đơn.</div>;

  const statusText = hoaDon.trangThai || hoaDon.status || 'unknown';
  const paid = String(statusText).toLowerCase().includes('thanh') || String(statusText).toLowerCase().includes('paid');

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <BackToUserHome className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-gray-100"><ArrowLeft className="w-4 h-4"/></button>
          <h1 className="text-2xl font-bold">Hóa đơn: {hoaDon.maHD || maHD}</h1>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <CreditCard className="w-4 h-4"/>
          <span className="font-medium">{statusText}</span>
        </div>
      </div>

      <div className="mb-3"><strong>Tổng tiền:</strong> <span className="font-semibold">{hoaDon.tongTien}</span></div>

      <h2 className="text-lg font-semibold mt-4 mb-2">Chi tiết</h2>
      {Array.isArray(hoaDon.dsChiTiet) && hoaDon.dsChiTiet.length > 0 ? (
        <ul className="space-y-2">
          {hoaDon.dsChiTiet.map((ct, idx) => (
            <li key={ct.id || idx} className="border rounded p-2 bg-gray-50">
              <div className="flex justify-between">
                <div><strong>Mã DV:</strong> {ct.maDV || ct.dichVuMa || '-'}</div>
                <div><strong>Giá:</strong> {ct.donGia || ct.price || '-'}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>Không có chi tiết hóa đơn hiển thị.</div>
      )}
    </div>
  );
};

export default PaymentStatus;
