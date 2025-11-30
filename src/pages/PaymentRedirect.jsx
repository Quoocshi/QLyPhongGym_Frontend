// src/pages/PaymentRedirect.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { Loader2, CreditCard } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentRedirect = () => {
  const { maHD } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processAndRedirect = async () => {
      try {
        // Backend xử lý thanh toán ngay tại đây
        await paymentService.createMomoPayment(maHD);

        // Chuyển thẳng đến trang xem trạng thái
        navigate(`/thanh-toan/${maHD}`);
      } catch (err) {
        navigate(`/thanh-toan/${maHD}`, {
          state: {
            paymentError: err.message || 'Không thể tạo yêu cầu thanh toán'
          }
        });
      }
    };

    processAndRedirect();
  }, [maHD, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <BackToUserHome className="mb-4" />

        <div className="bg-white rounded shadow p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Đang xử lý thanh toán…</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng chờ trong giây lát.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin w-5 h-5 text-indigo-600" />
            <div>Đang xử lý…</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirect;
