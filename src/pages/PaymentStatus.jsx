// src/pages/PaymentStatus.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { CheckCircle2 } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentStatus = () => {
  const { maHD } = useParams();
  //const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
const [hoaDon, setHoaDon] = useState(null);
const [hoTen, setHoTen] = useState(''); // thêm state cho tên khách hàng

useEffect(() => {
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getHoaDon(maHD);
      console.log('Invoice API response:', res); // kiểm tra
      setHoaDon(res.hoaDon); // phần hóa đơn
      setHoTen(res.hoTen);   // tên khách hàng
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchInvoice();
}, [maHD]);


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="animate-spin w-6 h-6 text-green-600"/>
        <span>Đang tải thông tin hóa đơn…</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded shadow p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Thanh toán thành công!</h2>
        <p className="text-sm text-gray-600 mb-2">Mã hóa đơn: {hoaDon?.maHD}</p>
        <p className="text-sm text-gray-600 mb-2">Tổng tiền: {hoaDon?.tongTien}</p>
        <p className="text-sm text-gray-600 mb-2">Trạng thái: {hoaDon?.trangThai}</p>
        <p className="text-sm text-gray-600 mb-2">Ngày thanh toán:  {hoaDon?.ngayTT}</p>
        <p className="text-sm text-gray-600 mb-2">Khách hàng:  {hoTen}</p>



        {/* <button
          onClick={() => navigate('/dang-ky-goi-tap')}
          className="px-4 py-2 rounded border bg-green-100 text-green-800"
        >
          Quay về đăng ký gói tập
        </button> */}

        <BackToUserHome className="mt-4" />
      </div>
    </div>
  );
};

export default PaymentStatus;
