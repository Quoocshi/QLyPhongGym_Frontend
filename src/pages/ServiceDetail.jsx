import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { dichVuService } from '../services/dichVuService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';
import { ArrowLeft, Star, Check, Clock, Users, Award, Phone, Mail, MapPin, Share2, Heart, ShoppingCart, Plus } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(!service);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const { addToCart } = useCart();

  // Mock service detail data từ PostgreSQL
  const mockServiceDetails = {
    'DV01': { rating: 4.8, reviews: 234, features: ['Phòng tập 24/7', 'Trang thiết bị Technogym', 'Wifi miễn phí', 'Khăn tập sạch'] },
    'DV05': { rating: 4.9, reviews: 156, features: ['HLV 1-1 chuyên nghiệp', 'Chương trình cá nhân hóa', 'Theo dõi tiến độ', 'Tư vấn dinh dưỡng'] },
    'DV09': { rating: 4.7, reviews: 189, features: ['Lớp nhỏ tối đa 15 người', 'Thảm yoga cao cấp', 'Không gian yên tĩnh', 'Âm nhạc thiền định'] },
    'DV13': { rating: 4.6, reviews: 98, features: ['Giảng viên chứng chỉ quốc tế', 'Lớp học theo trình độ', 'Props yoga đầy đủ', 'Coaching cá nhân'] }
  };

  useEffect(() => {
    if (!service && id) {
      fetchServiceDetail();
    }
  }, [id, service]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      console.log('🔄 Đang thử lấy chi tiết dịch vụ từ API:', id);
      
      const data = await dichVuService.getDichVuDetail(id);
      console.log('✅ Chi tiết dịch vụ từ API:', data);
      setService(data);
      setError('');
    } catch (err) {
      console.warn('⚠️ API chi tiết dịch vụ không khả dụng, sử dụng mock data:', err.message);
      
      // Mock fallback - sử dụng cùng data với Services.jsx
      const mockServices = [
        // BM01 – GYM (TuDo, PT) - chỉ lấy một vài để test
        { maDV: 'DV01', tenDV: 'GYM TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM01', tenBM: 'Gym Fitness' },
        { maDV: 'DV02', tenDV: 'GYM TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM01', tenBM: 'Gym Fitness' },
        { maDV: 'DV05', tenDV: 'GYM PT 7N', loaiDV: 'PT', thoiHan: 7, donGia: 800000, maBM: 'BM01', tenBM: 'Gym Fitness' },
        { maDV: 'DV06', tenDV: 'GYM PT 30N', loaiDV: 'PT', thoiHan: 30, donGia: 2500000, maBM: 'BM01', tenBM: 'Gym Fitness' },
        
        // BM02 – YOGA (TuDo, Lop)
        { maDV: 'DV09', tenDV: 'YOGA TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM02', tenBM: 'Yoga' },
        { maDV: 'DV10', tenDV: 'YOGA TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM02', tenBM: 'Yoga' },
        { maDV: 'DV13', tenDV: 'YOGA Lop 7N', loaiDV: 'Lop', thoiHan: 7, donGia: 400000, maBM: 'BM02', tenBM: 'Yoga' },
        { maDV: 'DV14', tenDV: 'YOGA Lop 30N', loaiDV: 'Lop', thoiHan: 30, donGia: 1300000, maBM: 'BM02', tenBM: 'Yoga' },
        
        // Các dịch vụ khác...
        { maDV: 'DV17', tenDV: 'ZUMBA TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM03', tenBM: 'Zumba' },
        { maDV: 'DV25', tenDV: 'CARDIO TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM04', tenBM: 'Cardio' }
      ];
      
      const foundService = mockServices.find(s => s.maDV === id);
      if (foundService) {
        console.log('📦 Sử dụng mock data cho dịch vụ:', foundService);
        setService(foundService);
        setError('');
      } else {
        console.error('❌ Không tìm thấy dịch vụ trong mock data:', id);
        setError('Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(service, 1);
    // Show notification
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);
  };

  const proceedToCheckout = () => {
    navigate('/register-service', { state: { cartItems: [{ ...service, quantity: 1 }] } });
  };

  const getCategoryIcon = (tenBM) => {
    const icons = {
      'Gym Fitness': '💪',
      'Yoga': '🧘‍♀️',
      'Cardio': '❤️',
      'Zumba': '💃',
      'Boi': '🏊‍♀️',
      'Crossfit': '🏋️‍♀️'
    };
    return icons[tenBM] || '🏃‍♂️';
  };

  const getServiceTypeLabel = (loaiDV) => {
    const labels = {
      'TuDo': 'Tự do',
      'Lop': 'Lớp học',
      'PT': 'Personal Training'
    };
    return labels[loaiDV] || loaiDV;
  };

  const getServiceTypeColor = (loaiDV) => {
    const colors = {
      'TuDo': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Lop': 'bg-blue-100 text-blue-800 border-blue-200',
      'PT': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[loaiDV] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getServiceDetails = () => {
    return mockServiceDetails[service?.maDV] || { rating: 4.5, reviews: 50, features: ['Dịch vụ chất lượng', 'Đội ngũ chuyên nghiệp', 'Trang thiết bị hiện đại', 'Hỗ trợ 24/7'] };
  };

  const handleRegister = () => {
    // Add to cart and navigate to cart with auto-select (use canonical fields)
    const serviceItem = {
      maDV: service.maDV || service.maDichVu || service.id,
      tenDV: service.tenDV || service.tenDichVu || service.name,
      donGia: service.donGia || service.giaTien || service.price || 0,
      tenBM: service.tenBM || service.boMon || '',
      quantity: 1
    };

    addToCart(serviceItem);
    // navigate to the cart route defined in App.jsx and pass autoSelect param
    navigate(`/user/cart?autoSelect=${encodeURIComponent(serviceItem.maDV)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Đang tải thông tin dịch vụ...</p>
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
            <div className="text-6xl mb-6 animate-bounce">😔</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Không tìm thấy dịch vụ
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {error || 'Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Xem tất cả dịch vụ
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
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

  const serviceDetails = getServiceDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header variant="solid" />
      
      {/* Added to Cart Notification */}
      {showAddedNotification && (
        <div className="fixed top-20 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Đã thêm vào giỏ hàng!</span>
          </div>
        </div>
      )}
      
      {/* Enhanced Hero Section với Ken Burns effect */}
      <div className="relative h-[70vh] bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 overflow-hidden">
        {/* Background Image với Ken Burns Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={`https://images.unsplash.com/photo-${
              service.tenBM === 'Gym Fitness' ? '1571902943202-507ec2618e8f' :
              service.tenBM === 'Yoga' ? '1544367567-0f2fcb009e0b' :
              service.tenBM === 'Cardio' ? '1571019613454-1cb2f99b2d8b' :
              service.tenBM === 'Zumba' ? '1594736797933-d0501ba2fe65' :
              service.tenBM === 'Boi' ? '1571019614081-0f8e6e4b2ca2' :
              service.tenBM === 'Crossfit' ? '1517963628607-235ccdd5476c' : '1571902943202-507ec2618e8f'
            }?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80`}
            alt={service.tenDV} 
            className="w-full h-full object-cover opacity-30 animate-ken-burns"
          />
        </div>

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation Bar */}
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-white px-4">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            {/* Service Category Icon */}
            <div className="text-8xl mb-6 animate-bounce-slow">
              {getCategoryIcon(service.tenBM)}
            </div>
            
            {/* Service Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              {service.tenDV}
            </h1>
            
            {/* Service Type Badge */}
            <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getServiceTypeColor(service.loaiDV)} bg-white/90 backdrop-blur-sm mb-6`}>
              <Award className="w-5 h-5 mr-2" />
              <span className="font-bold text-lg">{getServiceTypeLabel(service.loaiDV)}</span>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center justify-center space-x-6 text-lg mb-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold">{serviceDetails.rating}</span>
                <span className="text-gray-300">({serviceDetails.reviews} đánh giá)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-5 h-5" />
                <span>{service.thoiHan} ngày</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Đăng ký ngay - {formatPrice(service.donGia)}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-500/90 border-red-400 text-white' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 transition-all duration-300">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Information Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-4"></div>
                Thông tin chi tiết
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Department */}
                {service.tenBM && (
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="text-3xl">{getCategoryIcon(service.tenBM)}</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Bộ môn</h3>
                      <p className="text-gray-600 text-lg">{service.tenBM}</p>
                    </div>
                  </div>
                )}

                {/* Duration */}
                {service.thoiHan && (
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <Clock className="w-8 h-8 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Thời hạn sử dụng</h3>
                      <p className="text-gray-600 text-lg">{service.thoiHan} ngày</p>
                    </div>
                  </div>
                )}

                {/* Service Type */}
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                  <Award className="w-8 h-8 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Hình thức tập luyện</h3>
                    <p className="text-gray-600 text-lg">{getServiceTypeLabel(service.loaiDV)}</p>
                  </div>
                </div>

                {/* Service Code */}
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-100">
                  <div className="text-3xl">🏷️</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Mã dịch vụ</h3>
                    <p className="text-gray-600 text-lg font-mono tracking-wider">{service.maDV}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-4"></div>
                Tính năng nổi bật
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {serviceDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{feature}</h3>
                      <p className="text-gray-600">Được bao gồm trong gói dịch vụ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <div className="w-2 h-8 bg-white rounded-full mr-4"></div>
                Khách hàng nói gì
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      AN
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">Anh Nguyễn</p>
                      <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-blue-100 italic">"Dịch vụ tuyệt vời, đội ngũ hỗ trợ nhiệt tình. Tôi đã đạt được mục tiêu giảm cân sau 3 tháng."</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      LM
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">Linh Mai</p>
                      <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-blue-100 italic">"Trang thiết bị hiện đại, không gian sạch sẽ. Huấn luyện viên rất chuyên nghiệp và tận tâm."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 sticky top-8 border border-gray-100 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center mb-8">
                <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                  {formatPrice(service.donGia)}
                </div>
                {service.thoiHan && (
                  <div className="text-gray-600 text-lg">
                    Gói {service.thoiHan} ngày
                  </div>
                )}
                <div className="mt-2 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Có sẵn
                </div>
              </div>

              <div className="space-y-4 mb-8 p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá gốc</span>
                  <span className="font-semibold">{formatPrice(service.donGia)}</span>
                </div>
                {service.thoiHan && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giá theo ngày</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(Math.round(service.donGia / service.thoiHan))}
                    </span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Tổng thanh toán</span>
                  <span className="text-blue-600">{formatPrice(service.donGia)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Đăng ký ngay
                </button>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Thêm vào giỏ hàng
                </button>

                <button
                  onClick={() => navigate('/services')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Xem dịch vụ khác
                </button>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-3">Phương thức thanh toán</p>
                <div className="flex justify-center space-x-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                  <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">VNP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ReusableFooter />
    </div>
  );
};

export default ServiceDetail;

// CSS Animations được định nghĩa trong index.css:
// .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
// .animate-bounce-slow { animation: bounce 2s infinite; }
// .animate-ken-burns { animation: kenBurns 20s ease-out infinite; }
// .animate-gradient { animation: gradient 3s ease infinite; }

// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translate3d(0, 40px, 0);
//   }
//   to {
//     opacity: 1;
//     transform: translate3d(0, 0, 0);
//   }
// }

// @keyframes kenBurns {
//   0% { transform: scale(1); }
//   50% { transform: scale(1.1); }
//   100% { transform: scale(1); }
// }

// @keyframes gradient {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
