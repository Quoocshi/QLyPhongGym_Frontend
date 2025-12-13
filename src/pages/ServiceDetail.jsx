import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { dichVuService } from '../services/dichVuService.js';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';
import { ArrowLeft, Star, Check, Clock, Award, Share2, Heart, ShoppingCart, Plus } from 'lucide-react';

const ServiceDetail = () => {
  const { maDV } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(!location.state?.service);
  const [error, setError] = useState('');

  const [classOptions, setClassOptions] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAuthErrorIfNeeded = (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      navigate('/login', { state: { from: location } });
      return true;
    }
    return false;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));

  const getServiceTypeLabel = (loaiDV) => {
    const labels = { TuDo: 'Tự do', Lop: 'Lớp học', PT: 'Personal Training' };
    return labels[loaiDV] || loaiDV || '—';
  };

  const getServiceTypeColor = (loaiDV) => {
    const colors = {
      TuDo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Lop: 'bg-blue-100 text-blue-800 border-blue-200',
      PT: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[loaiDV] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (tenBM) => {
    const icons = {
      'Gym Fitness': '💪',
      Yoga: '🧘‍♀️',
      Cardio: '❤️',
      Zumba: '💃',
      Boi: '🏊‍♀️',
      Crossfit: '🏋️‍♀️',
    };
    return icons[tenBM] || '🏃‍♂️';
  };

  // ✅ Nếu user refresh / vào thẳng URL => không có location.state
  // -> gọi /dang-kydv rồi tìm maDV trong dsBoMon[].danhSachDichVu[]
  const fetchServiceFromDangKy = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await dichVuService.getDangKyDichVu();
      const dsBoMon = res?.dsBoMon || [];

      let found = null;
      for (const bm of dsBoMon) {
        const dv = (bm.danhSachDichVu || []).find((x) => x.maDV === maDV);
        if (dv) {
          found = {
            ...dv,
            tenBM: bm.tenBM,
            maBM: bm.maBM,
          };
          break;
        }
      }

      if (!found) {
        setError('Không tìm thấy dịch vụ.');
        setService(null);
        return;
      }

      setService(found);
    } catch (err) {
      console.error(err);
      if (handleAuthErrorIfNeeded(err)) return;
      setError('Không thể tải thông tin dịch vụ.');
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (svc) => {
    if (!svc) return;

    try {
      // reset
      setClassOptions([]);
      setTrainerOptions([]);
      setSelectedClass(null);
      setSelectedTrainer(null);

      if (svc.loaiDV === 'Lop') {
        const res = await dichVuService.getChonLop(svc.maDV);
        setClassOptions(res?.dsLopChuaDay || []);
      } else if (svc.loaiDV === 'PT') {
        const res = await dichVuService.getChonPT(svc.maDV);
        setTrainerOptions(res?.dsTrainer || []);
      }
    } catch (err) {
      console.error(err);
      // options fail không chặn render, nhưng user có thể không chọn được
    }
  };

  useEffect(() => {
    if (service) {
      // đảm bảo nếu service từ location.state thiếu tenBM/maBM thì vẫn ok
      // (không bắt buộc)
      loadOptions(service);
      return;
    }
    if (maDV) fetchServiceFromDangKy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maDV]);

  useEffect(() => {
    if (service) loadOptions(service);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.maDV]);

  const serviceDetails = useMemo(() => {
    return {
      rating: 4.7,
      reviews: 120,
      features: ['Dịch vụ chất lượng', 'Đội ngũ chuyên nghiệp', 'Trang thiết bị hiện đại', 'Hỗ trợ 24/7'],
    };
  }, []);

  const validateSelections = () => {
    if (!service) return 'Không có dịch vụ.';
    if (service.loaiDV === 'Lop' && !selectedClass) return 'Vui lòng chọn lớp học.';
    if (service.loaiDV === 'PT' && !selectedTrainer) return 'Vui lòng chọn huấn luyện viên.';
    return '';
  };

  const handleAddToCart = () => {
    const msg = validateSelections();
    if (msg) {
      alert(msg);
      return;
    }

    addToCart({
      ...service,
      quantity: 1,
      selectedClass,
      selectedTrainer,
    });

    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2500);
  };

  const handleRegisterNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const msg = validateSelections();
    if (msg) {
      alert(msg);
      return;
    }

    // ✅ chuyển qua RegisterService (checkout)
    navigate('/register-service', {
      state: {
        cartItems: [
          {
            ...service,
            quantity: 1,
            selectedClass,
            selectedTrainer,
          },
        ],
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-6xl mb-6">😔</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Không tìm thấy dịch vụ</h2>
            <p className="text-gray-600 mb-8 text-lg">{error || 'Dịch vụ không tồn tại.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Xem tất cả dịch vụ
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header variant="solid" />

      {showAddedNotification && (
        <div className="fixed top-20 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Đã thêm vào giỏ hàng!</span>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 bg-white/10 text-white px-5 py-2 rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-6xl mb-3">{getCategoryIcon(service.tenBM)}</div>
              <h1 className="text-4xl md:text-5xl font-extrabold">{service.tenDV}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full border ${getServiceTypeColor(service.loaiDV)} bg-white/90`}>
                  <Award className="w-4 h-4 mr-2" />
                  {getServiceTypeLabel(service.loaiDV)}
                </span>

                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                  {serviceDetails.rating} ({serviceDetails.reviews})
                </span>

                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20">
                  <Clock className="w-4 h-4 mr-2" />
                  {service.thoiHan == null ? 'Không giới hạn' : `${service.thoiHan} ngày`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Thêm vào giỏ
              </button>

              <button
                onClick={handleRegisterNow}
                className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Đăng ký - {formatPrice(service.donGia)}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite((v) => !v)}
                  className={`p-3 rounded-2xl border transition-all ${isFavorite ? 'bg-red-500 border-red-400' : 'bg-white/10 border-white/30 hover:bg-white/20'}`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-2xl bg-white/10 border border-white/30 hover:bg-white/20 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chi tiết</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-2xl border">
                  <div className="text-sm text-gray-500">Bộ môn</div>
                  <div className="font-semibold text-gray-800 mt-1">{service.tenBM || '—'}</div>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border">
                  <div className="text-sm text-gray-500">Mã dịch vụ</div>
                  <div className="font-mono font-semibold text-gray-800 mt-1">{service.maDV}</div>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border">
                  <div className="text-sm text-gray-500">Thời hạn</div>
                  <div className="font-semibold text-gray-800 mt-1">
                    {service.thoiHan == null ? 'Không giới hạn' : `${service.thoiHan} ngày`}
                  </div>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border">
                  <div className="text-sm text-gray-500">Hình thức</div>
                  <div className="font-semibold text-gray-800 mt-1">{getServiceTypeLabel(service.loaiDV)}</div>
                </div>
              </div>
            </div>

            {/* Options: Lớp / PT */}
            {service.loaiDV === 'Lop' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chọn lớp học</h2>

                {classOptions.length === 0 ? (
                  <p className="text-gray-600">Hiện chưa có lớp phù hợp.</p>
                ) : (
                  <select
                    value={selectedClass?.maLop || ''}
                    onChange={(e) => {
                      const found = classOptions.find((x) => x.maLop === e.target.value) || null;
                      setSelectedClass(found);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classOptions.map((c) => (
                      <option key={c.maLop} value={c.maLop}>
                        {c.tenLop} (SL tối đa: {c.slToiDa})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {service.loaiDV === 'PT' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chọn huấn luyện viên</h2>

                {trainerOptions.length === 0 ? (
                  <p className="text-gray-600">Hiện chưa có PT phù hợp.</p>
                ) : (
                  <select
                    value={selectedTrainer?.maNV || selectedTrainer?.id || ''}
                    onChange={(e) => {
                      const found =
                        trainerOptions.find((x) => x.maNV === e.target.value) ||
                        trainerOptions.find((x) => String(x.id) === String(e.target.value)) ||
                        null;
                      setSelectedTrainer(found);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Chọn PT --</option>
                    {trainerOptions.map((t) => (
                      <option key={t.maNV || t.id} value={t.maNV || t.id}>
                        {t.hoTen || t.tenNV || `PT ${t.maNV || t.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tính năng</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {serviceDetails.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border">
                    <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-gray-800">{f}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right pricing */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-8">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-600">{formatPrice(service.donGia)}</div>
                {service.thoiHan != null && <div className="text-gray-600 mt-1">Gói {service.thoiHan} ngày</div>}
              </div>

              <button
                onClick={handleRegisterNow}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Đăng ký ngay
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Thêm vào giỏ hàng
              </button>

              <button
                onClick={() => navigate('/services')}
                className="w-full mt-3 border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50"
              >
                Xem dịch vụ khác
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReusableFooter />
    </div>
  );
};

export default ServiceDetail;
