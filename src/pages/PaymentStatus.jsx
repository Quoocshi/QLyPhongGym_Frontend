// src/pages/PaymentStatus.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { CheckCircle2, Package, Home, ShoppingCart, Calendar, User, CreditCard, Sparkles } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const PaymentStatus = () => {
  const { maHD } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [hoTen, setHoTen] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await invoiceService.getHoaDon(maHD);
        console.log('Invoice API response:', res);
        setHoaDon(res.hoaDon);
        setHoTen(res.hoTen);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [maHD]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="animate-spin w-6 h-6 text-green-600" />
          <span className="text-gray-700">Đang tải thông tin hóa đơn…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
      <div className="w-full max-w-3xl">
        <BackToUserHome className="mb-4" />

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Success Header with Animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm animate-bounce">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
              <p className="text-green-100 text-lg">Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi</p>

              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Mã hóa đơn: {hoaDon?.maHD}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Customer Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Thông tin khách hàng
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {hoTen?.charAt(0)?.toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{hoTen || 'Khách hàng'}</p>
                  <p className="text-sm text-gray-500">Thành viên thân thiết</p>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Các gói dịch vụ đã đăng ký
              </h3>

              {hoaDon?.dsChiTiet && hoaDon.dsChiTiet.length > 0 ? (
                <div className="space-y-3">
                  {hoaDon.dsChiTiet.map((chiTiet, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-green-600" />
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
                                <span className="text-gray-500">Huấn luyện viên:</span>
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
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-500">Bắt đầu:</span>
                                <span className="font-medium text-gray-700">
                                  {new Date(chiTiet.ngayBD).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}

                            {chiTiet.ngayKT && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-500">Kết thúc:</span>
                                <span className="font-medium text-gray-700">
                                  {new Date(chiTiet.ngayKT).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-green-600">
                            {chiTiet.giaTien ? formatCurrency(chiTiet.giaTien) : '0 ₫'}
                          </div>
                        </div>
                      </div>

                      {/* Success Badge */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã kích hoạt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600">Không có thông tin chi tiết gói dịch vụ</p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thông tin thanh toán
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Ngày thanh toán:</span>
                  <span className="font-medium text-gray-800">
                    {hoaDon?.ngayTT ? new Date(hoaDon.ngayTT).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-pink-500" />
                    MoMo
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    {hoaDon?.trangThai || 'Đã thanh toán'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng tiền đã thanh toán:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {hoaDon?.tongTien ? formatCurrency(hoaDon.tongTien) : '0 ₫'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Cảm ơn quý khách!</h4>
                  <p className="text-sm text-gray-600">
                    Chúng tôi rất vui khi được phục vụ quý khách. Hãy bắt đầu hành trình rèn luyện sức khỏe của bạn ngay hôm nay!
                    Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/user/home')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </button>

              <button
                onClick={() => navigate('/user/dang-ky')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                Tiếp tục đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
