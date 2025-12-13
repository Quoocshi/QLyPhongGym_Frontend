import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useMyServices } from '../contexts/MyServicesContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dichVuService } from '../services/dichVuService.js';
import { invoiceService } from '../services/invoiceService.js';
import { paymentService } from '../services/paymentService.js';
import { userService } from '../services/userService.js';
import { ShoppingCart, Trash2, CreditCard, Loader, Plus, Minus, Shield, Truck, Award, CheckCircle, ArrowLeft, Heart, Gift, Percent, Clock, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext.jsx';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { items: cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { addServices } = useMyServices();
  const { addToast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
  }, [isAuthenticated, navigate, location]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('momo');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Mock promotion codes
  const promoCodes = {
    'GYM2024': { discount: 100000, type: 'fixed', description: 'Giảm 100,000đ cho khách hàng mới' },
    'NEWBIE20': { discount: 20, type: 'percent', description: 'Giảm 20% cho lần đăng ký đầu tiên' },
    'SAVE50K': { discount: 50000, type: 'fixed', description: 'Giảm 50,000đ cho đơn hàng trên 1 triệu' }
  };

  const paymentMethods = [
    { id: 'momo', name: 'MoMo', icon: '🍑', color: 'from-pink-500 to-red-500' },
    { id: 'vnpay', name: 'VNPay', icon: '💳', color: 'from-blue-500 to-indigo-500' },
    { id: 'zalopay', name: 'ZaloPay', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { id: 'banking', name: 'Chuyển khoản', icon: '🏦', color: 'from-green-500 to-teal-500' }
  ];

  // Auto-select items when added from ServiceDetail
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoSelectId = params.get('autoSelect');
    if (autoSelectId && cart.length > 0) {
      // Find the matching item and select it
      const matchingItem = cart.find(item => 
        (item.maDV || item.maDichVu || item.id) === autoSelectId
      );
      if (matchingItem) {
        setSelectedItems(new Set([matchingItem.maDV || matchingItem.maDichVu || matchingItem.id]));
      }
      // Clean up URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, cart]);

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map(item => item.maDV || item.maDichVu || item.id)));
    }
  };

  const getSelectedItems = () => {
    return cart.filter(item => selectedItems.has(item.maDV || item.maDichVu || item.id));
  };

  const calculateSubtotal = () => {
    const selected = getSelectedItems();
    return selected.reduce((total, item) => {
      const price = item.donGia || item.giaTien || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discount && promoCodes[promoCode]) {
      const promo = promoCodes[promoCode];
      if (promo.type === 'percent') {
        return Math.min(subtotal * (promo.discount / 100), subtotal * 0.5); // Max 50% discount
      } else {
        return Math.min(promo.discount, subtotal);
      }
    }
    return 0;
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode].discount);
      setShowPromoInput(false);
      addToast({
        message: `✅ Áp dụng mã giảm giá thành công: ${promoCodes[promoCode].description}`,
        type: 'success',
        duration: 4000
      });
    } else {
      addToast({
        message: 'Mã giảm giá không hợp lệ!',
        type: 'error',
        duration: 3000
      });
    }
  };

  const getCategoryIcon = (tenBM) => {
    const iconMap = {
      'Gym Fitness': '💪',
      'Yoga': '🧘‍♀️',
      'Cardio': '❤️',
      'Zumba': '💃',
      'Boi': '🏊‍♀️',
      'Crossfit': '🏋️‍♀️'
    };
    return iconMap[tenBM] || '🏃‍♂️';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      addToast({ message: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán', type: 'error' });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentForm.customerName || !paymentForm.email || !paymentForm.phone) {
      addToast({ message: 'Vui lòng điền đầy đủ thông tin khách hàng', type: 'error' });
      return;
    }

    try {
      setProcessing(true);
      
      // 🔥 Giống RegisterService logic - xử lý nhiều dịch vụ
      const selectedServices = getSelectedItems();
      
      // Validate có khách hàng và accountId
      if (!user?.accountId) {
        addToast({ message: 'Thiếu thông tin tài khoản', type: 'error' });
        return;
      }

      // Build payload cho universal registration
      const registrationData = {
        accountId: user.accountId,
        maKH: user?.maKH || 'KH001', // fallback
        dsMaDV: selectedServices.map(item => item.maDV),
        dsTrainerId: selectedServices.map(item => item.selectedTrainer?.maNV || item.selectedTrainer?.id).filter(Boolean),
        dsClassId: selectedServices.map(item => item.selectedClass?.maLop).filter(Boolean)
      };
      
      console.log('📝 Cart registration:', registrationData);
      
      // 1) Tạo hóa đơn + CT_DKDV
      const response = await dichVuService.dangKyDichVuUniversal(registrationData);
      const maHD = response?.maHD;
      
      if (!maHD) throw new Error('Không nhận được maHD từ server.');
      
      // 2) Thanh toán qua MoMo
      const payRes = await paymentService.momoPay(maHD);
      
      // 3) 🔥 Tự động tạo lịch tập cho PT/Lớp (giống RegisterService)
      const lichTapPromises = [];
      for (const item of selectedServices) {
        if (item.loaiDV === 'PT' && item.selectedTrainer) {
          lichTapPromises.push(
            userService.createLichTapPT({
              maKH: user?.maKH || 'KH001',
              maDV: item.maDV,
              maNV: item.selectedTrainer.maNV || item.selectedTrainer.id,
              ngay: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ngày mai
              gio: '08:00',
              thu: '246' // T2, T4, T6 mặc định
            })
          );
        } else if (item.loaiDV === 'Lop' && item.selectedClass) {
          lichTapPromises.push(
            userService.createLichTapLop({
              maKH: user?.maKH || 'KH001',
              maDV: item.maDV,
              maLop: item.selectedClass.maLop,
              ngay: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              gio: '08:00',
              thu: '246'
            })
          );
        }
      }

      // Tạo lịch tập (không block nếu lỗi)
      if (lichTapPromises.length > 0) {
        try {
          console.log('🔥 Tạo lịch tập cho', lichTapPromises.length, 'dịch vụ...');
          const results = await Promise.allSettled(lichTapPromises);
          console.log('📅 Kết quả tạo lịch:', results);
          
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const errorCount = results.filter(r => r.status === 'rejected').length;
          
          if (successCount > 0) {
            addToast({
              message: `✅ Đã tạo ${successCount} lịch tập!`,
              type: 'success',
              duration: 3000
            });
          }
          if (errorCount > 0) {
            console.warn('❌ Lỗi tạo lịch:', results.filter(r => r.status === 'rejected'));
            addToast({
              message: `⚠️ ${errorCount} lịch tập không tạo được (cần Backend hỗ trợ)`,
              type: 'error',
              duration: 4000
            });
          }
        } catch (err) {
          console.error('❌ Lỗi tạo lịch tập:', err);
          addToast({
            message: 'Backend chưa hỗ trợ tạo lịch tập tự động',
            type: 'error',
            duration: 4000
          });
        }
      }
      
      // Success toast
      addToast({
        message: `🎉 Thanh toán thành công ${selectedServices.length} dịch vụ! Mã HD: ${maHD} - ${formatCurrency(calculateTotal())}`,
        type: 'success',
        duration: 5000
      });
      
      // Add to MyServices context
      const servicesToAdd = selectedServices.map(item => ({
        maDV: item.maDV,
        tenDV: item.tenDV,
        gia: item.donGia,
        trangThai: 'active',
        ngayDangKy: new Date().toISOString().split('T')[0],
        boMon: item.tenBM || 'N/A'
      }));
      addServices(servicesToAdd);
      
      // Remove from cart
      selectedServices.forEach(item => {
        removeFromCart(item.maDV);
      });
      
      setSelectedItems(new Set());
      setShowPaymentModal(false);
      
      // Navigate to my services
      setTimeout(() => {
        navigate('/user/dich-vu-cua-toi');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Payment failed:', err);
      const errorMsg = err?.response?.data?.error || err?.message || 'Lỗi thanh toán';
      addToast({ message: errorMsg, type: 'error', duration: 5000 });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin"></div>
              <ShoppingCart className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="text-gray-600 text-lg">Đang tải giỏ hàng của bạn...</p>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="container mx-auto px-4 flex-grow">
        {cart.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-24 bg-white rounded-3xl shadow-xl animate-fade-in-up">
            <div className="mb-8 bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h3>
            <p className="text-gray-600 text-lg mb-8">Hãy thêm các dịch vụ yêu thích vào giỏ hàng để tiếp tục</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Khám phá dịch vụ
              </button>
              <button
                onClick={() => navigate('/user/services')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Dịch vụ của tôi
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-4"></div>
                      Dịch vụ đã chọn ({cart.length})
                    </h2>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedItems.size === cart.length && cart.length > 0}
                        onChange={handleSelectAll}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <label htmlFor="selectAll" className="text-gray-700 font-medium cursor-pointer">
                        Chọn tất cả ({selectedItems.size}/{cart.length})
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <div
                        key={item.maDV}
                        className={`flex items-center p-6 rounded-2xl transition-all duration-300 group ${
                          selectedItems.has(item.maDV || item.maDichVu || item.id)
                            ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50'
                        }`}
                        style={{animationDelay: `${0.1 * index}s`}}
                      >
                        {/* Checkbox */}
                        <div className="mr-4">
                          <input
                            type="checkbox"
                            id={`item-${item.maDV || item.maDichVu || item.id}`}
                            checked={selectedItems.has(item.maDV || item.maDichVu || item.id)}
                            onChange={() => handleSelectItem(item.maDV || item.maDichVu || item.id)}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                          />
                        </div>
                        
                        {/* Service Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-3xl">{getCategoryIcon(item.tenBM)}</span>
                        </div>

                        {/* Service Info */}
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {item.tenDV}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Thời hạn: {item.thoiHan} ngày
                            </span>
                            <span className="flex items-center">
                              <Award className="w-4 h-4 mr-1" />
                              {item.loaiDV === 'TuDo' ? 'Tự do' : item.loaiDV === 'Lop' ? 'Lớp học' : 'Personal Training'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-orange-600">
                              {formatCurrency(item.donGia)}
                            </span>
                            <div className="text-sm text-gray-500">
                              / {item.thoiHan} ngày
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center space-x-3 bg-white rounded-xl border border-gray-200 p-2">
                            <button
                              onClick={() => updateQuantity(item.maDV, (item.quantity || 1) - 1)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              disabled={(item.quantity || 1) <= 1}
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity || 1}</span>
                            <button
                              onClick={() => updateQuantity(item.maDV, (item.quantity || 1) + 1)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-300">
                              <Heart className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.maDV)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Gift className="w-6 h-6 mr-3 text-orange-500" />
                    Mã giảm giá
                  </h3>
                  
                  {!showPromoInput ? (
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Percent className="w-5 h-5" />
                      <span>Nhập mã giảm giá</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã giảm giá..."
                          className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <button
                          onClick={applyPromoCode}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                        >
                          Áp dụng
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p className="mb-2">Mã giảm giá có sẵn:</p>
                        <div className="space-y-1">
                          <div>• <strong>GYM2024</strong>: Giảm 100,000đ cho khách hàng mới</div>
                          <div>• <strong>NEWBIE20</strong>: Giảm 20% cho lần đầu đăng ký</div>
                          <div>• <strong>SAVE50K</strong>: Giảm 50,000đ cho đơn trên 1 triệu</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary - Right Column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 sticky top-8 border border-gray-100 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                    Tóm tắt đơn hàng
                  </h3>

                  {/* Order Details */}
                  <div className="space-y-4 mb-8 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span className="font-semibold">-{formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <span className="text-green-600 font-semibold">Miễn phí</span>
                    </div>
                    
                    <hr className="border-gray-200" />
                    
                    <div className="flex justify-between text-xl font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-orange-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                            selectedPaymentMethod === method.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mx-auto mb-2`}>
                            <span className="text-white text-lg">{method.icon}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800">{method.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="mb-8 p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-green-800">Thanh toán bảo mật</span>
                    </div>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mã hóa SSL 256-bit</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Thông tin không lưu trữ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Hoàn tiền 100% nếu lỗi</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={processing || selectedItems.size === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl ${
                      processing || selectedItems.size === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    }`}
                  >
                    {processing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : selectedItems.size === 0 ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Chọn sản phẩm để thanh toán</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Thanh toán ({selectedItems.size} sản phẩm)</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/services')}
                    className="w-full mt-4 py-3 text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ReusableFooter />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Xác nhận thanh toán</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Invoice Details */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết hóa đơn</h3>
                <div className="space-y-3">
                  {getSelectedItems().map((item, index) => (
                    <div key={item.maDV || item.maDichVu || item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-800">{item.tenDV || item.tenDichVu || item.name}</span>
                        <span className="text-sm text-gray-600 ml-2">(x{item.quantity || 1})</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency((item.donGia || item.giaTien || item.price) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                  
                  <hr className="my-4" />
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  
                    <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                    {selectedItems.size > 0 && selectedItems.size < cart.length && (
                      <div className="text-sm text-gray-600 mt-2">
                        Đã chọn {selectedItems.size} trong {cart.length} sản phẩm
                      </div>
                    )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={paymentForm.customerName}
                      onChange={(e) => setPaymentForm({...paymentForm, customerName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={paymentForm.email}
                      onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm({...paymentForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số thẻ
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    processing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Xác nhận thanh toán</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

// CSS Animations sử dụng các class đã định nghĩa trong index.css:
// .animate-fade-in-up: Hiệu ứng fade in từ dưới lên
// .animate-gradient: Hiệu ứng gradient chạy
// .animate-pulse: Hiệu ứng nhấp nháy

// Features:
// - Responsive design cho mọi thiết bị
// - Mock data fallback khi localStorage trống
// - Promo code system với validation
// - Multiple payment methods
// - Quantity management
// - Security badges và trust signals
// - Professional animations và transitions
