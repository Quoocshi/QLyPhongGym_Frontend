import { useEffect, useState, useMemo } from 'react';
import { dichVuService as dichVuGymService } from '../services/dichVuService.js';
import { userService } from '../services/userService.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useMyServices } from '../contexts/MyServicesContext.jsx';
import { Box, Users, Clock, CreditCard, User, DollarSign, CheckCircle, Info, X } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const RegisterService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { addService } = useMyServices();
  const [boMonList, setBoMonList] = useState([]);
  const [selectedBoMon, setSelectedBoMon] = useState(null);
  const [dichVuList, setDichVuList] = useState([]);
  const [khachHang, setKhachHang] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [selectedDV, setSelectedDV] = useState([]); // array of maDV
  const [classOptions, setClassOptions] = useState({}); // maDV -> [classes]
  const [trainerOptions, setTrainerOptions] = useState({}); // maDV -> [trainers]
  const [selectedClassByDV, setSelectedClassByDV] = useState({});
  const [selectedTrainerByDV, setSelectedTrainerByDV] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    // Kiểm tra authentication trước
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Nếu có cartItems từ ServiceDetail thì chuyển thẳng đến checkout
    const cartItems = location.state?.cartItems;
    if (cartItems && cartItems.length > 0) {
      console.log('🛒 Nhận cartItems từ ServiceDetail, chuyển đến checkout:', cartItems);
      // Cập nhật selected services từ cartItems
      setSelectedDV(cartItems.map(item => item.maDV));
      // Tạo fake dichVuList từ cartItems để tính tổng tiền
      setDichVuList(cartItems);
      setSelectedBoMon({ tenBM: 'Checkout', maBM: 'CHECKOUT' });
      setLoading(false);
      return; // Không load danh sách bộ môn
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await dichVuGymService.getDanhSachBoMon();
        setBoMonList(res.dsBoMon || res.dsBM || res);
        
        // Prefer the AuthContext user; fallback to localStorage 'auth_user'
        let storedUser = user;
        if (!storedUser) {
          try {
            const raw = localStorage.getItem('auth_user');
            storedUser = raw ? JSON.parse(raw) : null;
          } catch (e) {
            storedUser = null;
          }
        }

        if (storedUser) {
          setKhachHang({
            hoTen: storedUser.hoTen || storedUser.fullName || storedUser.username || 'Khách hàng',
            maKH: storedUser.maKH || storedUser.accountId || storedUser.maNV || 'KH001',
            email: storedUser.email || 'email@example.com',
            sdt: storedUser.sdt || storedUser.soDienThoai || '0123456789'
          });
          setAccountId(storedUser.maKH || storedUser.accountId || storedUser.maNV || 'USR001');
        }
      } catch (err) {
        setError(err.response?.data || err.message || 'Lỗi khi tải danh sách bộ môn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [location.state, isAuthenticated, navigate, user]);
  
  // compute total price of selected services
  const totalPrice = useMemo(() => {
    return selectedDV.reduce((sum, maDV) => {
      const dv = dichVuList.find(x => x.maDV === maDV);
      const p = Number(dv?.donGia || dv?.gia || 0) || 0;
      return sum + p;
    }, 0);
  }, [selectedDV, dichVuList]);

  const loadDichVu = async (maBM) => {
    try {
      setLoading(true);
      const res = await dichVuGymService.getDichVuTheoBoMon(maBM);
      const boMon = res.boMon || res;
      setSelectedBoMon(boMon);
      setDichVuList(boMon.danhSachDichVu || []);
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi tải dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectDV = (maDV) => {
    setSelectedDV((prev) => {
      if (prev.includes(maDV)) return prev.filter(x => x !== maDV);
      return [...prev, maDV];
    });
  };

  const chooseClassForDV = async (maDV) => {
    try {
      const res = await dichVuGymService.getChonLop(maDV);
      const classes = res.dsLopChuaDay || res.dsLop || [];
      setClassOptions((s) => ({ ...s, [maDV]: classes }));
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi lấy lớp');
    }
  };

  const choosePTForDV = async (maDV) => {
    try {
      const res = await dichVuGymService.getChonPT(maDV);
      const trainers = res.dsTrainer || res.dsTrainer || res.ds || res;
      setTrainerOptions((s) => ({ ...s, [maDV]: trainers }));
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi lấy PT');
    }
  };

  const handleRegister = async () => {
    if (!khachHang) {
      setError('Không có thông tin khách hàng');
      return;
    }
    if (selectedDV.length === 0) {
      setError('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }
    // Show payment modal instead of direct submission
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    // Validate payment form (mock validation - always passes)
    if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
      alert('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    try {
      setSubmitting(true);
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Get the selected service details
      const selectedService = dichVuList.find(dv => selectedDV.includes(dv.maDichVu));
      if (selectedService) {
        // Add to My Services context
        addService({
          maDV: selectedService.maDichVu,
          tenDV: selectedService.tenDichVu,
          gia: selectedService.giaTien,
          trangThai: 'active',
          ngayDangKy: new Date().toISOString().split('T')[0],
          boMon: selectedBoMon?.tenBoMon || 'N/A'
        });
      }
      
      // Mock successful registration
      alert('🎉 Thanh toán thành công!\n\nDịch vụ đã được đăng ký vào tài khoản của bạn.');
      setShowPaymentModal(false);
      navigate('/user/dich-vu-cua-toi'); // Navigate to My Services
    } catch (err) {
      setError('Lỗi trong quá trình thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header variant="solid" />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
      <ReusableFooter />
    </div>
  );

  // Nếu có cartItems thì hiển thị trang checkout
  const cartItems = location.state?.cartItems;
  if (cartItems && cartItems.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header variant="solid" />
        
        <div className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column - User Information */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Thông tin khách hàng
                  </h2>
                  
                  {khachHang ? (
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(khachHang.hoTen || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">{khachHang.hoTen}</h3>
                          <p className="text-sm text-gray-600">Mã KH: {khachHang.maKH}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-500">Email</span>
                          <p className="font-medium">{khachHang.email}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-500">Số điện thoại</span>
                          <p className="font-medium">{khachHang.sdt}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <User className="w-16 h-16 mx-auto" />
                      </div>
                      <p className="text-gray-500">Đang tải thông tin khách hàng...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Service Information */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Box className="w-6 h-6 mr-3 text-orange-600" />
                    Dịch vụ đăng ký
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    {cartItems.map((item, index) => (
                      <div key={item.maDV} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{item.tenDV}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                                {item.loaiDV}
                              </span>
                              <Clock className="w-4 h-4 mr-1" />
                              {item.thoiHan} ngày
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-blue-600">
                              {Number(item.donGia || 0).toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {cartItems.reduce((sum, item) => sum + Number(item.donGia || 0), 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!khachHang}
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ReusableFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header variant="solid" />
      
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - User Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin đăng ký
                </h2>
                
                {khachHang && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(khachHang.hoTen || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">{khachHang.hoTen}</div>
                        <div className="text-sm text-gray-500">{khachHang.maKH}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Gói đã chọn</div>
                    <div className="font-semibold">{selectedDV.length} dịch vụ</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Tổng tạm tính</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                <button 
                  disabled={submitting || selectedDV.length === 0} 
                  onClick={handleRegister} 
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  {submitting ? 'Đang xử lý...' : 'Đăng ký & Thanh toán'}
                </button>
              </div>
            </div>

            {/* Right Columns - Service Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">Chọn dịch vụ tập luyện</h1>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Info className="w-4 h-4"/> 
                    Chọn gói phù hợp với bạn
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {/* Bộ môn selector */}
                  <div className="col-span-1">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      <Box className="w-4 h-4"/> Bộ môn
                    </h2>
                    <div className="space-y-2">
                      {boMonList.map(b => (
                        <button 
                          key={b.maBM} 
                          onClick={() => loadDichVu(b.maBM)} 
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedBoMon?.maBM === b.maBM 
                              ? 'bg-blue-50 border-blue-200 shadow-md' 
                              : 'hover:shadow-md hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{b.tenBM}</div>
                          <div className="text-xs text-gray-500 mt-1">{b.moTa || ''}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dịch vụ list */}
                  <div className="col-span-3">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4"/> 
                      Dịch vụ {selectedBoMon ? `- ${selectedBoMon.tenBM}` : ''}
                    </h2>
                    
                    {dichVuList.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Chọn bộ môn để xem các dịch vụ có sẵn</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dichVuList.map(dv => (
                          <div key={dv.maDV} className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-200 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="rounded-full w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {(dv.tenDV || 'DV').charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-lg">{dv.tenDV}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      <span className="bg-gray-100 px-2 py-1 rounded">{dv.loaiDV}</span>
                                      <Clock className="w-4 h-4" /> {dv.thoiHan || '-'} ngày
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm text-gray-500">Giá</div>
                                <div className="text-xl font-bold text-blue-600 mb-3">
                                  {Number(dv.donGia || 0).toLocaleString('vi-VN')}đ
                                </div>
                                
                                <label className="inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedDV.includes(dv.maDV)} 
                                    onChange={() => toggleSelectDV(dv.maDV)} 
                                    className="sr-only" 
                                  />
                                  <div className={`w-12 h-6 rounded-full transition-colors ${
                                    selectedDV.includes(dv.maDV) ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                                      selectedDV.includes(dv.maDV) ? 'translate-x-7' : 'translate-x-1'
                                    }`}></div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReusableFooter />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin thanh toán
                  </h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số thẻ
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="19"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="4"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={paymentForm.cardholderName}
                      onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">
                      {(cartItems ? 
                        cartItems.reduce((sum, item) => sum + Number(item.donGia || 0), 0) : 
                        totalPrice
                      ).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Thanh toán ngay'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterService;
