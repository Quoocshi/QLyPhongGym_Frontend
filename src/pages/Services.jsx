import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dichVuService } from '../services/dichVuService.js';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  Search,
  Star,
  Filter,
  Grid,
  List,
  Heart,
  ArrowRight,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { FullPageError } from '../components/ui/ErrorMessage';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const { items: cart = [], addToCart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  const [boMonList, setBoMonList] = useState([]);
  const [selectedBoMon, setSelectedBoMon] = useState(null);

  const [dichVuList, setDichVuList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('ALL');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  const priceRanges = useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả mức giá' },
      { value: '0-500000', label: 'Dưới 500,000đ' },
      { value: '500000-1000000', label: '500,000 - 1,000,000đ' },
      { value: '1000000-2000000', label: '1,000,000 - 2,000,000đ' },
      { value: '2000000+', label: 'Trên 2,000,000đ' },
    ],
    []
  );

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price) => {
    const safe = Number(price || 0);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(safe);
  };

  const getCategoryIcon = (tenBM) => {
    const iconMap = {
      'Gym Fitness': '💪',
      Yoga: '🧘‍♀️',
      Cardio: '❤️',
      Zumba: '💃',
      Boi: '🏊‍♀️',
      Crossfit: '🏋️‍♀️',
    };
    return iconMap[tenBM] || '🏃‍♂️';
  };

  const getServiceTypeLabel = (loaiDV) => {
    const labels = {
      TuDo: 'Tự do',
      Lop: 'Lớp học',
      PT: 'Personal Training',
    };
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

  // (Giữ mapping ảnh theo maDV như bạn đang dùng)
  const getCategoryImage = (service) => {
    const imageMap = {
      DV01: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV02: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV03: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV04: 'https://images.unsplash.com/photo-1583500178690-f7d24f6bd16c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV05: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV06: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV07: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV08: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV09: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV10: 'https://images.unsplash.com/photo-1506629905607-44812b8f7e0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV11: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV12: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV13: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV14: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV15: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV16: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV17: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV18: 'https://images.unsplash.com/photo-1571266028243-d220c9c18cd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV19: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV20: 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV21: 'https://images.unsplash.com/photo-1571266028243-d220c9c18cd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV22: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV23: 'https://images.unsplash.com/photo-1578766556744-4d978f0de15f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV24: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV25: 'https://images.unsplash.com/photo-1571019614081-0f8e6e4b2ca2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV26: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV27: 'https://images.unsplash.com/photo-1485727749690-d091e8284ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV28: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV29: 'https://images.unsplash.com/photo-1571019614332-74ec4e351994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV30: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV31: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV32: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV33: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV34: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV35: 'https://images.unsplash.com/photo-1530143808100-583d5ff08862?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV36: 'https://images.unsplash.com/photo-1571019614332-74ec4e351994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV37: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV38: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV39: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV40: 'https://images.unsplash.com/photo-1530143808100-583d5ff08862?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV41: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV42: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV43: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV44: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',

      DV45: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV46: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV47: 'https://images.unsplash.com/photo-1583500178690-f7d24f6bd16c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      DV48: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    };

    return (
      imageMap[service?.maDV] ||
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    );
  };

  const handleAuthErrorIfNeeded = (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      navigate('/login', { state: { from: location } });
      return true;
    }
    return false;
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');

      // 1) Lấy dsBoMon + khachHang
      const response = await dichVuService.getDangKyDichVu();

      if (!response?.dsBoMon || response.dsBoMon.length === 0) {
        setBoMonList([]);
        setSelectedBoMon(null);
        setDichVuList([]);
        setError('Không có bộ môn/dịch vụ nào.');
        return;
      }

      setBoMonList(response.dsBoMon);

      // 2) Mặc định chọn bộ môn đầu tiên và load dịch vụ theo bộ môn (API này lọc theo khách hàng chưa đăng ký)
      const first = response.dsBoMon[0];
      setSelectedBoMon(first);
      await loadDichVuTheoBoMon(first.maBM);
    } catch (err) {
      console.error('❌ Lỗi khi tải dữ liệu:', err);

      if (handleAuthErrorIfNeeded(err)) return;

      setBoMonList([]);
      setSelectedBoMon(null);
      setDichVuList([]);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const loadDichVuTheoBoMon = async (maBM) => {
    try {
      setError('');

      const response = await dichVuService.getDichVuTheoBoMon(maBM);

      const boMon = response?.boMon;
      const tenBM = boMon?.tenBM || selectedBoMon?.tenBM || '';

      const list = (boMon?.danhSachDichVu || []).map((s) => ({
        ...s,
        tenBM,
        maBM,
      }));

      setDichVuList(list);
    } catch (err) {
      console.error('Error loading services by department:', err);

      if (handleAuthErrorIfNeeded(err)) return;

      setDichVuList([]);
      setError('Lỗi khi tải dịch vụ theo bộ môn.');
    }
  };

  const handleBoMonSelect = async (boMon) => {
    setSelectedBoMon(boMon);
    await loadDichVuTheoBoMon(boMon.maBM);
  };

  const filteredServices = useMemo(() => {
    let filtered = [...dichVuList];

    // search
    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        const tenDV = (s.tenDV || '').toLowerCase();
        const tenBM = (s.tenBM || '').toLowerCase();
        return tenDV.includes(kw) || tenBM.includes(kw);
      });
    }

    // price range
    if (priceRange !== 'ALL') {
      filtered = filtered.filter((s) => {
        const price = Number(s.donGia || 0);
        switch (priceRange) {
          case '0-500000':
            return price < 500000;
          case '500000-1000000':
            return price >= 500000 && price < 1000000;
          case '1000000-2000000':
            return price >= 1000000 && price < 2000000;
          case '2000000+':
            return price >= 2000000;
          default:
            return true;
        }
      });
    }

    // sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.donGia || 0) - Number(b.donGia || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.donGia || 0) - Number(a.donGia || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => (a.thoiHan ?? 999999) - (b.thoiHan ?? 999999));
        break;
      case 'name':
        filtered.sort((a, b) => (a.tenDV || '').localeCompare(b.tenDV || ''));
        break;
      default:
        // popularity: giữ nguyên
        break;
    }

    return filtered;
  }, [dichVuList, searchTerm, priceRange, sortBy]);

  const proceedToCheckout = () => {
    if (!cart || cart.length === 0) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/checkout');
  };

  const handleServiceClick = (service) => {
    navigate(`/services/${service.maDV}`, { state: { service } });
  };

  const toggleFavorite = (serviceId, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="text-gray-600 text-lg">Đang tải danh sách dịch vụ...</p>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <FullPageError message={error} onRetry={fetchServices} />
        </div>
        <ReusableFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header variant="solid" />

      {/* Floating Cart Button */}
      <button
        onClick={() => setShowCartSidebar(true)}
        className="fixed top-20 right-8 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
              {getItemCount()}
            </span>
          )}
        </div>
      </button>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCartSidebar(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Giỏ hàng của bạn</h3>
                  <button onClick={() => setShowCartSidebar(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.maDV} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.tenDV}</h4>
                          <p className="text-sm text-gray-500">{formatPrice(item.donGia)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.maDV, (item.quantity || 1) - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.maDV, (item.quantity || 1) + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button onClick={() => removeFromCart(item.maDV)} className="text-red-500 hover:text-red-700 ml-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Thanh toán
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Danh sách dịch vụ</h1>
            <p className="text-lg text-gray-600">Khám phá và đăng ký các dịch vụ tập luyện phù hợp với bạn</p>
          </div>

          {/* Department Selection */}
          {boMonList.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Chọn bộ môn</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {boMonList.map((boMon) => (
                  <button
                    key={boMon.maBM}
                    onClick={() => handleBoMonSelect(boMon)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                      selectedBoMon?.maBM === boMon.maBM
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{getCategoryIcon(boMon.tenBM)}</div>
                    <div className="font-medium text-sm">{boMon.tenBM}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        {/* Advanced Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 animate-fade-in-up">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm dịch vụ</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Department Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bộ môn</label>
              <select
                value={selectedBoMon?.maBM || ''}
                onChange={(e) => {
                  const boMon = boMonList.find((bm) => bm.maBM === e.target.value);
                  if (boMon) handleBoMonSelect(boMon);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {boMonList.map((boMon) => (
                  <option key={boMon.maBM} value={boMon.maBM}>
                    {getCategoryIcon(boMon.tenBM)} {boMon.tenBM}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mức giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="popularity">Phổ biến</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="duration">Thời hạn</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle & Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-lg font-semibold text-gray-800">
                {selectedBoMon ? `${selectedBoMon.tenBM}: ` : ''}Tìm thấy {filteredServices.length} dịch vụ
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Đang sắp xếp: {sortBy}</span>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl animate-fade-in-up">
            <div className="mb-6 bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Không tìm thấy dịch vụ</h3>
            <p className="text-gray-600 text-lg mb-8">Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceRange('ALL');
              }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up'
                : 'space-y-6 animate-fade-in-up'
            }
            style={{ animationDelay: '0.3s' }}
          >
            {filteredServices.map((service, index) => (
              <div
                key={service.maDV}
                onClick={() => handleServiceClick(service)}
                className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden group ${
                  viewMode === 'list' ? 'flex items-center p-6' : ''
                }`}
                style={{ animationDelay: `${0.1 * (index % 8)}s` }}
              >
                {/* Service Image */}
                <div
                  className={`${
                    viewMode === 'list' ? 'w-24 h-24 mr-6 flex-shrink-0' : 'h-48'
                  } relative overflow-hidden ${viewMode === 'grid' ? '' : 'rounded-2xl'}`}
                >
                  <img
                    src={getCategoryImage(service)}
                    alt={service.tenDV}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity duration-300"></div>

                  {/* Service Type Badge */}
                  <div
                    className={`absolute top-2 ${
                      viewMode === 'list' ? 'right-2' : 'right-4'
                    } ${getServiceTypeColor(service.loaiDV)} backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold border`}
                  >
                    {getServiceTypeLabel(service.loaiDV)}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(service.maDV, e)}
                    className={`absolute ${
                      viewMode === 'list' ? 'bottom-2 right-2' : 'top-4 left-4'
                    } p-2 rounded-full backdrop-blur-sm border-2 transition-all duration-300 ${
                      favorites.has(service.maDV)
                        ? 'bg-red-500/90 border-red-400 text-white'
                        : 'bg-white/80 border-white/50 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(service.maDV) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className={`${viewMode === 'list' ? 'flex-grow' : 'p-6'}`}>
                  {/* Service Title */}
                  <h3
                    className={`${
                      viewMode === 'list' ? 'text-lg' : 'text-xl'
                    } font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-200`}
                  >
                    {service.tenDV}
                  </h3>

                  {/* Department */}
                  {service.tenBM && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-1">🏢</span>
                      <span>{service.tenBM}</span>
                    </div>
                  )}

                  {/* Duration & Features */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      Thời hạn:{' '}
                      {service.thoiHan == null ? 'Không giới hạn' : `${service.thoiHan} ngày`}
                    </span>
                    {viewMode === 'list' && (
                      <>
                        <span className="mx-3">•</span>
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>4.8 (234 đánh giá)</span>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`${viewMode === 'list' ? 'text-xl' : 'text-2xl'} font-bold text-orange-600`}>
                        {formatPrice(service.donGia)}
                      </span>
                      {service.thoiHan != null && (
                        <span className="text-sm text-gray-500">/{service.thoiHan} ngày</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(service);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/services/${service.maDV}`, { state: { service } });
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div
          className="mt-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl text-white p-12 text-center shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu hành trình của bạn?</h2>
          <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn thành viên đã tin tưởng chúng tôi để đạt được mục tiêu sức khỏe và thể hình
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Đăng ký ngay hôm nay
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-200 transform hover:scale-105">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </div>

      <ReusableFooter />
    </div>
  );
};

export default Services;
