import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { dichVuService } from '../services/dichVuService.js';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Dumbbell, Award, Users, Clock, Search, Star, Filter, Grid, List, Heart, Share2, ArrowRight, ShoppingCart, Plus } from 'lucide-react';
import { FullPageLoader } from '../components/ui/LoadingSpinner';
import { FullPageError } from '../components/ui/ErrorMessage';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceRange, setPriceRange] = useState('ALL');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const { items: cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Mock data từ PostgreSQL database - đầy đủ 48 dịch vụ
  const mockData = [
    // BM01 – GYM (TuDo, PT)
    { maDV: 'DV01', tenDV: 'GYM TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV02', tenDV: 'GYM TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV03', tenDV: 'GYM TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV04', tenDV: 'GYM TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV05', tenDV: 'GYM PT 7N', loaiDV: 'PT', thoiHan: 7, donGia: 800000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV06', tenDV: 'GYM PT 30N', loaiDV: 'PT', thoiHan: 30, donGia: 2500000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV07', tenDV: 'GYM PT 90N', loaiDV: 'PT', thoiHan: 90, donGia: 6500000, maBM: 'BM01', tenBM: 'Gym Fitness' },
    { maDV: 'DV08', tenDV: 'GYM PT 365N', loaiDV: 'PT', thoiHan: 365, donGia: 20000000, maBM: 'BM01', tenBM: 'Gym Fitness' },

    // BM02 – YOGA (TuDo, Lop)
    { maDV: 'DV09', tenDV: 'YOGA TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV10', tenDV: 'YOGA TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV11', tenDV: 'YOGA TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV12', tenDV: 'YOGA TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV13', tenDV: 'YOGA Lop 7N', loaiDV: 'Lop', thoiHan: 7, donGia: 400000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV14', tenDV: 'YOGA Lop 30N', loaiDV: 'Lop', thoiHan: 30, donGia: 1300000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV15', tenDV: 'YOGA Lop 90N', loaiDV: 'Lop', thoiHan: 90, donGia: 3500000, maBM: 'BM02', tenBM: 'Yoga' },
    { maDV: 'DV16', tenDV: 'YOGA Lop 365N', loaiDV: 'Lop', thoiHan: 365, donGia: 10000000, maBM: 'BM02', tenBM: 'Yoga' },

    // BM03 – ZUMBA (TuDo, Lop)
    { maDV: 'DV17', tenDV: 'ZUMBA TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV18', tenDV: 'ZUMBA TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV19', tenDV: 'ZUMBA TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV20', tenDV: 'ZUMBA TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV21', tenDV: 'ZUMBA Lop 7N', loaiDV: 'Lop', thoiHan: 7, donGia: 400000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV22', tenDV: 'ZUMBA Lop 30N', loaiDV: 'Lop', thoiHan: 30, donGia: 1300000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV23', tenDV: 'ZUMBA Lop 90N', loaiDV: 'Lop', thoiHan: 90, donGia: 3500000, maBM: 'BM03', tenBM: 'Zumba' },
    { maDV: 'DV24', tenDV: 'ZUMBA Lop 365N', loaiDV: 'Lop', thoiHan: 365, donGia: 10000000, maBM: 'BM03', tenBM: 'Zumba' },

    // BM04 – CARDIO (TuDo, PT)
    { maDV: 'DV25', tenDV: 'CARDIO TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV26', tenDV: 'CARDIO TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV27', tenDV: 'CARDIO TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV28', tenDV: 'CARDIO TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV29', tenDV: 'CARDIO PT 7N', loaiDV: 'PT', thoiHan: 7, donGia: 800000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV30', tenDV: 'CARDIO PT 30N', loaiDV: 'PT', thoiHan: 30, donGia: 2500000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV31', tenDV: 'CARDIO PT 90N', loaiDV: 'PT', thoiHan: 90, donGia: 6500000, maBM: 'BM04', tenBM: 'Cardio' },
    { maDV: 'DV32', tenDV: 'CARDIO PT 365N', loaiDV: 'PT', thoiHan: 365, donGia: 20000000, maBM: 'BM04', tenBM: 'Cardio' },

    // BM05 – BƠI (TuDo, Lop)
    { maDV: 'DV33', tenDV: 'BOI TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV34', tenDV: 'BOI TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV35', tenDV: 'BOI TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV36', tenDV: 'BOI TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV37', tenDV: 'BOI Lop 7N', loaiDV: 'Lop', thoiHan: 7, donGia: 400000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV38', tenDV: 'BOI Lop 30N', loaiDV: 'Lop', thoiHan: 30, donGia: 1300000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV39', tenDV: 'BOI Lop 90N', loaiDV: 'Lop', thoiHan: 90, donGia: 3500000, maBM: 'BM05', tenBM: 'Boi' },
    { maDV: 'DV40', tenDV: 'BOI Lop 365N', loaiDV: 'Lop', thoiHan: 365, donGia: 10000000, maBM: 'BM05', tenBM: 'Boi' },

    // BM06 – CROSSFIT (TuDo, PT)
    { maDV: 'DV41', tenDV: 'CROSSFIT TuDo 7N', loaiDV: 'TuDo', thoiHan: 7, donGia: 300000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV42', tenDV: 'CROSSFIT TuDo 30N', loaiDV: 'TuDo', thoiHan: 30, donGia: 1000000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV43', tenDV: 'CROSSFIT TuDo 90N', loaiDV: 'TuDo', thoiHan: 90, donGia: 2700000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV44', tenDV: 'CROSSFIT TuDo 365N', loaiDV: 'TuDo', thoiHan: 365, donGia: 9000000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV45', tenDV: 'CROSSFIT PT 7N', loaiDV: 'PT', thoiHan: 7, donGia: 800000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV46', tenDV: 'CROSSFIT PT 30N', loaiDV: 'PT', thoiHan: 30, donGia: 2500000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV47', tenDV: 'CROSSFIT PT 90N', loaiDV: 'PT', thoiHan: 90, donGia: 6500000, maBM: 'BM06', tenBM: 'Crossfit' },
    { maDV: 'DV48', tenDV: 'CROSSFIT PT 365N', loaiDV: 'PT', thoiHan: 365, donGia: 20000000, maBM: 'BM06', tenBM: 'Crossfit' }
  ];

  const categories = [
    { value: 'ALL', label: 'Tất cả dịch vụ', icon: '🏃‍♂️' },
    { value: 'Gym Fitness', label: 'Tập gym', icon: '💪' },
    { value: 'Yoga', label: 'Yoga', icon: '🧘‍♀️' },
    { value: 'Cardio', label: 'Cardio', icon: '❤️' },
    { value: 'Zumba', label: 'Zumba', icon: '💃' },
    { value: 'Boi', label: 'Bơi lội', icon: '🏊‍♀️' },
    { value: 'Crossfit', label: 'CrossFit', icon: '🏋️‍♀️' },
  ];

  const priceRanges = [
    { value: 'ALL', label: 'Tất cả mức giá' },
    { value: '0-500000', label: 'Dưới 500,000đ' },
    { value: '500000-1000000', label: '500,000 - 1,000,000đ' },
    { value: '1000000-2000000', label: '1,000,000 - 2,000,000đ' },
    { value: '2000000+', label: 'Trên 2,000,000đ' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Thử gọi API backend trước
      try {
        console.log('🔄 Đang gọi API backend...');
        const data = await dichVuService.getDanhSachDichVu();
        console.log('✅ API Response received:', data);
        
        if (data && data.length > 0) {
          setServices(data);
          console.log('✅ Sử dụng dữ liệu từ backend');
        } else {
          throw new Error('API trả về dữ liệu rỗng');
        }
        setError('');
      } catch (apiError) {
        console.warn('⚠️ API không khả dụng, sử dụng mock data:', apiError.message);
        // Fallback to mock data nếu API fail
        setServices(mockData);
        console.log('📋 Sử dụng mock data làm fallback');
        setError('');
      }
    } catch (err) {
      console.error('❌ Lỗi tổng thể:', err);
      // Final fallback
      setServices(mockData);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.tenDV.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.tenBM && service.tenBM.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(service => service.tenBM === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'ALL') {
      filtered = filtered.filter(service => {
        const price = service.donGia;
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

    // Sort services
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.donGia - b.donGia);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.donGia - a.donGia);
        break;
      case 'duration':
        filtered.sort((a, b) => a.thoiHan - b.thoiHan);
        break;
      case 'name':
        filtered.sort((a, b) => a.tenDV.localeCompare(b.tenDV));
        break;
      default:
        // popularity - keep original order
        break;
    }

    setFilteredServices(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Cart functionality handled by CartContext

  const proceedToCheckout = () => {
    if (!cart || cart.length === 0) return;
    navigate('/register-service', { state: { cartItems: cart } });
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

  const getCategoryImage = (service) => {
    // Mỗi loại dịch vụ cụ thể có một hình ảnh riêng
    const imageMap = {
      // GYM Fitness - TuDo
      'DV01': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gym equipment
      'DV02': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gym workout
      'DV03': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Weight training
      'DV04': 'https://images.unsplash.com/photo-1583500178690-f7d24f6bd16c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Gym interior
      
      // GYM Fitness - PT
      'DV05': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Personal training
      'DV06': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // PT session
      'DV07': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Trainer helping
      'DV08': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Premium PT
      
      // YOGA - TuDo
      'DV09': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga mat
      'DV10': 'https://images.unsplash.com/photo-1506629905607-44812b8f7e0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga pose
      'DV11': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga meditation
      'DV12': 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga studio
      
      // YOGA - Lop
      'DV13': 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga class
      'DV14': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Group yoga
      'DV15': 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yoga instructor
      'DV16': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Advanced yoga
      
      // ZUMBA - TuDo
      'DV17': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Dance fitness
      'DV18': 'https://images.unsplash.com/photo-1571266028243-d220c9c18cd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Zumba energy
      'DV19': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Dance movement
      'DV20': 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Zumba fun
      
      // ZUMBA - Lop
      'DV21': 'https://images.unsplash.com/photo-1571266028243-d220c9c18cd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Zumba class
      'DV22': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Group dance
      'DV23': 'https://images.unsplash.com/photo-1578766556744-4d978f0de15f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Dance studio
      'DV24': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Zumba party
      
      // CARDIO - TuDo
      'DV25': 'https://images.unsplash.com/photo-1571019614081-0f8e6e4b2ca2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Treadmill
      'DV26': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cardio machines
      'DV27': 'https://images.unsplash.com/photo-1485727749690-d091e8284ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Running
      'DV28': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cardio workout
      
      // CARDIO - PT
      'DV29': 'https://images.unsplash.com/photo-1571019614332-74ec4e351994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cardio PT
      'DV30': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Intensive cardio
      'DV31': 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // HIIT training
      'DV32': 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Elite cardio
      
      // BƠI - TuDo
      'DV33': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Swimming pool
      'DV34': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Pool lanes
      'DV35': 'https://images.unsplash.com/photo-1530143808100-583d5ff08862?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Swimming
      'DV36': 'https://images.unsplash.com/photo-1571019614332-74ec4e351994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Pool facility
      
      // BƠI - Lop
      'DV37': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Swimming lesson
      'DV38': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Swim class
      'DV39': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Group swimming
      'DV40': 'https://images.unsplash.com/photo-1530143808100-583d5ff08862?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Pro swimming
      
      // CROSSFIT - TuDo
      'DV41': 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // CrossFit box
      'DV42': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Functional training
      'DV43': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // CrossFit WOD
      'DV44': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // CrossFit athlete
      
      // CROSSFIT - PT
      'DV45': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // CrossFit coaching
      'DV46': 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Personal CrossFit
      'DV47': 'https://images.unsplash.com/photo-1583500178690-f7d24f6bd16c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Elite CrossFit
      'DV48': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Premium CrossFit
    };
    
    return imageMap[service.maDV] || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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

  const handleServiceClick = (service) => {
    navigate(`/services/${service.maDV}`, { state: { service } });
  };

  const toggleFavorite = (serviceId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
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
          {cart && cart.length > 0 && (
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
                    {cart.map(item => (
                      <div key={item.maDV} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.tenDV}</h4>
                          <p className="text-sm text-gray-500">{formatPrice(item.donGia)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateQuantity(item.maDV, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.maDV, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.maDV)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Danh sách dịch vụ</h1>
            <p className="text-lg text-gray-600">Khám phá và đăng ký các dịch vụ tập luyện phù hợp với bạn</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        {/* Advanced Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 animate-fade-in-up">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm dịch vụ
              </label>
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

            {/* Category Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại dịch vụ
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mức giá
              </label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sắp xếp theo
              </label>
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
                Tìm thấy {filteredServices.length} dịch vụ
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Được sắp xếp theo độ phổ biến</span>
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
              onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setPriceRange('ALL'); }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up" 
            : "space-y-6 animate-fade-in-up"
          } style={{animationDelay: '0.3s'}}>
            {filteredServices.map((service, index) => (
              <div
                key={service.maDV}
                onClick={() => handleServiceClick(service)}
                className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden group ${
                  viewMode === 'list' ? 'flex items-center p-6' : ''
                }`}
                style={{animationDelay: `${0.1 * (index % 8)}s`}}
              >
                {/* Service Image */}
                <div className={`${viewMode === 'list' ? 'w-24 h-24 mr-6 flex-shrink-0' : 'h-48'} relative overflow-hidden ${viewMode === 'grid' ? '' : 'rounded-2xl'}`}>
                  <img 
                    src={getCategoryImage(service)}
                    alt={service.tenDV}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity duration-300"></div>
                  
                  {/* Service Type Badge */}
                  <div className={`absolute top-2 ${viewMode === 'list' ? 'right-2' : 'right-4'} ${getServiceTypeColor(service.loaiDV)} backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold border`}>
                    {getServiceTypeLabel(service.loaiDV)}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(service.maDV, e)}
                    className={`absolute ${viewMode === 'list' ? 'bottom-2 right-2' : 'top-4 left-4'} p-2 rounded-full backdrop-blur-sm border-2 transition-all duration-300 ${
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
                  <h3 className={`${viewMode === 'list' ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-200`}>
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
                    <span>Thời hạn: {service.thoiHan} ngày</span>
                    {viewMode === 'list' && (
                      <>
                        <span className="mx-3">•</span>
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>4.8 (234 đánh giá)</span>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'}`}>
                    <div>
                      <span className={`${viewMode === 'list' ? 'text-xl' : 'text-2xl'} font-bold text-orange-600`}>
                        {formatPrice(service.donGia)}
                      </span>
                      {service.thoiHan && (
                        <span className="text-sm text-gray-500">/{service.thoiHan} ngày</span>
                      )}
                    </div>
                  </div>

                  {/* Actions - moved to its own row so buttons won't overflow */}
                  <div className="mt-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(service); }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/services/${service.maDV}`); }}
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
        <div className="mt-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl text-white p-12 text-center shadow-2xl animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
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
            <button 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-200 transform hover:scale-105"
            >
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
