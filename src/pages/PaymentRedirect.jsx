import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { Loader2, ExternalLink, CreditCard } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentRedirect = () => {
  const { maHD } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    const startPayment = async () => {
      try {
        setLoading(true);
        const res = await paymentService.createMomoPayment(maHD);
        // expected: { maHD, amount, paymentUrl }
        const url = res.paymentUrl || res.url || res.payment_url;
        if (!url) {
          setError('Không nhận được đường dẫn thanh toán từ server');
          return;
        }

        setPaymentUrl(url);

        // try opening payment in a new tab
        const opened = window.open(url, '_blank');
        if (!opened) {
          // popup blocked - stay and show user the link
          setError('Trình duyệt chặn popup. Vui lòng nhấn nút mở liên kết để tiếp tục.');
        }

        // navigate to status page which will poll the invoice
        navigate(`/thanh-toan/${maHD}`);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Lỗi khi tạo yêu cầu thanh toán');
      } finally {
        setLoading(false);
      }
    };

    startPayment();
  }, [maHD, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <BackToUserHome className="mb-4" />
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600"><CreditCard className="w-6 h-6" /></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Chuyển tới cổng thanh toán</h2>
          <p className="text-sm text-gray-600 mb-4">Hệ thống đang tạo yêu cầu thanh toán. Bạn sẽ được chuyển tới MoMo để hoàn tất.</p>

          {loading && (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin w-5 h-5 text-indigo-600" />
              <div>Đang tạo yêu cầu thanh toán…</div>
            </div>
          )}

          {!loading && error && (
            <div>
              <div className="text-sm text-red-600 mb-3">{error}</div>
              {paymentUrl && (
                <a href={paymentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded">
                  Mở liên kết thanh toán <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="mt-3 text-sm text-gray-500">Hoặc bấm nút bên dưới để kiểm tra trạng thái thanh toán.</div>
              <div className="mt-3">
                <button onClick={() => navigate(`/thanh-toan/${maHD}`)} className="px-4 py-2 rounded border">Kiểm tra trạng thái</button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4 text-sm text-gray-500">Nếu bạn không được chuyển tự động, hãy mở liên kết thanh toán.</div>
          )}
        </div>
      </div>
    </div>
  );
};

      export default PaymentRedirect;