// src/pages/PaymentRedirect.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService, invoiceService } from '../services/api';
import { Loader2, CreditCard, Package, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentRedirect = () => {
  const { maHD } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [hoTen, setHoTen] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const res = await invoiceService.getHoaDon(maHD);
        console.log('Invoice details:', res);
        setHoaDon(res.hoaDon);
        setHoTen(res.hoTen);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Không thể tải thông tin hóa đơn');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [maHD]);

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);
      // Gọi API tạo thanh toán MoMo
      await paymentService.createMomoPayment(maHD);

      // Chuyển đến trang xem trạng thái thanh toán
      navigate(`/thanh-toan/${maHD}`);
    } catch (err) {
      console.error('Payment error:', err);
      navigate(`/thanh-toan/${maHD}`, {
        state: {
          paymentError: err.message || 'Không thể tạo yêu cầu thanh toán'
        }
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
          <span className="text-gray-700">Đang tải thông tin hóa đơn…</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="w-full max-w-lg">
          <BackToUserHome className="mb-4" />

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-red-50 text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>

            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Main payment confirmation screen
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
      <div className="w-full max-w-2xl">
        <BackToUserHome className="mb-4" />

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Package className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">Xác nhận thanh toán</h1>
            <p className="text-center text-indigo-100 mt-1">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
          </div>

          {/* Invoice Details */}
          <div className="p-6">
            {/* Customer Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Thông tin khách hàng</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {hoTen?.charAt(0)?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{hoTen || 'Khách hàng'}</p>
                  <p className="text-sm text-gray-500">Mã hóa đơn: #{hoaDon?.maHD}</p>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Các gói dịch vụ</h3>

              {hoaDon?.dsChiTiet && hoaDon.dsChiTiet.length > 0 ? (
                <div className="space-y-3">
                  {hoaDon.dsChiTiet.map((chiTiet, index) => (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-gray-800">{chiTiet.tenDichVu || 'Gói dịch vụ'}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {chiTiet.loaiDichVu && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Loại:</span>
                                <span className="font-medium text-gray-700">
                                  {chiTiet.loaiDichVu === 'PT' ? 'Personal Training' :
                                    chiTiet.loaiDichVu === 'Lop' ? 'Lớp học' : chiTiet.loaiDichVu}
                                </span>
                              </div>
                            )}

                            {chiTiet.thoiHan && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Thời hạn:</span>
                                <span className="font-medium text-gray-700">{chiTiet.thoiHan} ngày</span>
                              </div>
                            )}

                            {chiTiet.tenNV && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">PT:</span>
                                <span className="font-medium text-gray-700">{chiTiet.tenNV}</span>
                              </div>
                            )}

                            {chiTiet.tenLop && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Lớp:</span>
                                <span className="font-medium text-gray-700">{chiTiet.tenLop}</span>
                              </div>
                            )}

                            {chiTiet.ngayBD && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Bắt đầu:</span>
                                <span className="font-medium text-gray-700">
                                  {new Date(chiTiet.ngayBD).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}

                            {chiTiet.ngayKT && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Kết thúc:</span>
                                <span className="font-medium text-gray-700">
                                  {new Date(chiTiet.ngayKT).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-indigo-600">
                            {chiTiet.giaTien ? formatCurrency(chiTiet.giaTien) : '0 ₫'}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${hoaDon?.trangThai === 'Đã thanh toán'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {hoaDon?.trangThai === 'Đã thanh toán' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {hoaDon?.trangThai || 'Chưa thanh toán'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-800">Gói tập đã chọn</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hóa đơn này đã được tạo và đang chờ thanh toán
                      </p>
                    </div>
                  </div>

                  {/* Invoice Status Badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${hoaDon?.trangThai === 'Đã thanh toán'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {hoaDon?.trangThai === 'Đã thanh toán' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {hoaDon?.trangThai || 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Tổng quan thanh toán</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Ngày tạo hóa đơn:</span>
                  <span className="font-medium text-gray-800">
                    {hoaDon?.ngayLap ? new Date(hoaDon.ngayLap).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-pink-500" />
                    MoMo
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-medium text-gray-800">{hoaDon?.trangThai || 'Chưa thanh toán'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {hoaDon?.tongTien ? formatCurrency(hoaDon.tongTien) : '0 ₫'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleGoBack}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại
              </button>

              <button
                onClick={handleConfirmPayment}
                disabled={processing || hoaDon?.trangThai === 'Đã thanh toán'}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>

            {/* Payment Note */}
            {hoaDon?.trangThai !== 'Đã thanh toán' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Sau khi nhấn "Xác nhận thanh toán", bạn sẽ được chuyển đến cổng thanh toán MoMo để hoàn tất giao dịch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirect;
