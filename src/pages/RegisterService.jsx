import { useEffect, useState, useMemo } from 'react';
import { dichVuGymService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, Users, Clock, CreditCard, User, DollarSign, CheckCircle,
  Info, Star, ArrowRight, Sparkles, Award, Target, ChevronRight,
  UserCheck, Calendar, MapPin
} from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const RegisterService = () => {
  const [boMonList, setBoMonList] = useState([]);
  const [selectedBoMon, setSelectedBoMon] = useState(null);
  const [dichVuList, setDichVuList] = useState([]); // Current sport's services
  const [allDichVu, setAllDichVu] = useState([]); // All services from all selected sports
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
  const [step, setStep] = useState(1); // 1: Chọn bộ môn, 2: Chọn dịch vụ, 3: Chọn PT/Lớp
  const [showPTModal, setShowPTModal] = useState(false);
  const [currentServiceForPT, setCurrentServiceForPT] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [currentServiceForClass, setCurrentServiceForClass] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await dichVuGymService.getDanhSachBoMon();
        setBoMonList(res.dsBoMon || res.dsBM || res);
        setKhachHang(res.khachHang || null);
        try {
          const home = await userService.getHome();
          if (home && home.accountId) setAccountId(home.accountId);
        } catch (e) {
          // ignore
        }
      } catch (err) {
        setError(err.response?.data || err.message || 'Lỗi khi tải danh sách bộ môn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // compute total price
  const totalPrice = useMemo(() => {
    return selectedDV.reduce((sum, maDV) => {
      const dv = allDichVu.find(x => x.maDV === maDV);
      const p = Number(dv?.donGia || dv?.gia || 0) || 0;
      return sum + p;
    }, 0);
  }, [selectedDV, allDichVu]);

  const loadDichVu = async (maBM) => {
    try {
      setLoading(true);
      const res = await dichVuGymService.getDichVuTheoBoMon(maBM);
      const boMon = res.boMon || res;
      setSelectedBoMon(boMon);
      const newServices = boMon.danhSachDichVu || [];
      setDichVuList(newServices);

      // Add new services to allDichVu, avoiding duplicates
      setAllDichVu(prevAll => {
        const existingIds = new Set(prevAll.map(dv => dv.maDV));
        const toAdd = newServices
          .filter(dv => !existingIds.has(dv.maDV))
          .map(dv => ({ ...dv, tenBM: boMon.tenBM })); // Attach sport name
        return [...prevAll, ...toAdd];
      });

      setStep(2);
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
      setCurrentServiceForClass(maDV);
      setShowClassModal(true);
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi lấy lớp');
    }
  };

  const selectClass = (maDV, classId) => {
    setSelectedClassByDV(s => ({ ...s, [maDV]: classId }));
    setShowClassModal(false);
    setCurrentServiceForClass(null);
  };

  const choosePTForDV = async (maDV) => {
    try {
      const res = await dichVuGymService.getChonPT(maDV);
      const trainers = res.dsTrainer || res.ds || res;
      setTrainerOptions((s) => ({ ...s, [maDV]: trainers }));
      setCurrentServiceForPT(maDV);
      setShowPTModal(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi lấy PT');
    }
  };

  const selectTrainer = (maDV, trainerId) => {
    setSelectedTrainerByDV(s => ({ ...s, [maDV]: trainerId }));
    setShowPTModal(false);
    setCurrentServiceForPT(null);
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

    // Check if any selected services require PT or Class selection
    const servicesNeedingPT = [];
    const servicesNeedingClass = [];

    for (const maDV of selectedDV) {
      const dv = allDichVu.find(x => x.maDV === maDV);
      if (!dv) continue;

      if (dv.loaiDV === 'PT' && !selectedTrainerByDV[maDV]) {
        servicesNeedingPT.push(dv);
      } else if (dv.loaiDV === 'Lop' && !selectedClassByDV[maDV]) {
        servicesNeedingClass.push(dv);
      }
    }

    // If there are services needing PT/Class selection, load options and show error
    if (servicesNeedingPT.length > 0 || servicesNeedingClass.length > 0) {
      // Automatically load PT/Class options if not already loaded
      for (const dv of servicesNeedingPT) {
        if (!trainerOptions[dv.maDV]) {
          await choosePTForDV(dv.maDV);
        }
      }
      for (const dv of servicesNeedingClass) {
        if (!classOptions[dv.maDV]) {
          await chooseClassForDV(dv.maDV);
        }
      }

      // Show error message
      const ptNames = servicesNeedingPT.map(dv => dv.tenDV).join(', ');
      const classNames = servicesNeedingClass.map(dv => dv.tenDV).join(', ');
      let errorMsg = 'Vui lòng chọn ';

      if (servicesNeedingPT.length > 0) {
        errorMsg += `PT cho gói: ${ptNames}`;
      }
      if (servicesNeedingClass.length > 0) {
        if (servicesNeedingPT.length > 0) errorMsg += ' và ';
        errorMsg += `lớp cho gói: ${classNames}`;
      }

      setError(errorMsg);
      return;
    }

    const payload = {
      accountId: accountId ? Number(accountId) : Number(khachHang?.accountId),
      maKH: khachHang?.maKH,
      dsMaDV: selectedDV,
      dsTrainerId: Object.values(selectedTrainerByDV).filter(Boolean),
      dsClassId: Object.values(selectedClassByDV).filter(Boolean)
    };

    try {
      setSubmitting(true);
      const res = await dichVuGymService.dangKyDichVuUniversal(payload);

      if (res.maHD) {
        navigate(`/payment/${res.maHD}`);
      } else {
        setError(res.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Lỗi khi đăng ký dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getLoaiDVBadge = (loaiDV) => {
    const badges = {
      'PT': { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'Personal Trainer', icon: UserCheck },
      'Lop': { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'Lớp học', icon: Users },
      'TuDo': { bg: 'bg-gradient-to-r from-green-500 to-green-600', text: 'Tự do', icon: Dumbbell }
    };
    return badges[loaiDV] || badges['TuDo'];
  };

  // Determine if a package is popular (hardcoded to "Gym PT 30 ngày")
  const isPopularPackage = (dv) => {
    return dv.tenDV === 'Gym PT 30 ngày';
  };

  // Get image based on sport, service type, and service code
  const getServiceImage = (boMonName, loaiDV, maDV = '') => {
    if (!boMonName) return null;

    // Map Vietnamese names to folder names
    const sportMap = {
      'Gym': 'Gym',
      'Gym Fitness': 'Gym',
      'Yoga': 'Yoga',
      'Zumba': 'Zumba',
      'Bơi': 'Boi',
      'Bơi lội': 'Boi',
      'Cardio': 'Cardio',
      'CrossFit': 'Crossfit',
      'Crossfit': 'Crossfit'
    };

    const sport = sportMap[boMonName] || boMonName;

    // Sports that have PT (Gym, Cardio, Crossfit)
    const ptSports = ['Gym', 'Cardio', 'Crossfit'];
    // Sports that have Lop (Yoga, Zumba, Boi)
    const lopSports = ['Yoga', 'Zumba', 'Boi'];

    // Map service type to image type
    let imageType = 'Tudo'; // default
    if (loaiDV === 'PT') {
      imageType = 'PT';
    } else if (loaiDV === 'Lop') {
      imageType = 'Lop';
    }

    // Use hash of maDV (service code) to get consistent image number (1-4)
    // Each service will have its own unique but consistent image
    const hashString = maDV || `${sport}_${imageType}`;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const imageNumber = (Math.abs(hash) % 4) + 1;

    return `/images/${sport}/${imageNumber}_${sport}_${imageType}.jpg`;
  };

  if (loading && boMonList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #FED7AA, #F4EDDF, #FED7AA)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <BackToUserHome className="mb-4 text-white hover:text-orange-200" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Đăng ký Dịch vụ</h1>
              <p className="text-orange-100 mt-1">Chọn gói tập phù hợp với nhu cầu của bạn</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-8">
            {[
              { num: 1, label: 'Chọn bộ môn' },
              { num: 2, label: 'Chọn dịch vụ' },
              { num: 3, label: 'Chọn PT/Lớp' },
              { num: 4, label: 'Thanh toán' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= s.num
                  ? 'bg-white text-orange-600 font-bold shadow-lg'
                  : 'bg-white/20 text-white/70'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= s.num ? 'bg-orange-600 text-white' : 'bg-white/30'
                    }`}>{s.num}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < 3 && <ChevronRight className="w-5 h-5 mx-2 text-white/50" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
            <button onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Bộ môn Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Chọn bộ môn
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {boMonList.map(b => {
                  const previewImage = getServiceImage(b.tenBM, 'Tudo', b.maBM);
                  return (
                    <button
                      key={b.maBM}
                      onClick={() => loadDichVu(b.maBM)}
                      className={`text-left rounded-xl border-2 transition-all duration-300 overflow-hidden ${selectedBoMon?.maBM === b.maBM
                        ? 'border-primary bg-orange-50 shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-100 hover:border-primary/50 hover:shadow-md'
                        }`}
                    >
                      {previewImage && (
                        <div className="relative h-20 overflow-hidden">
                          <img
                            src={previewImage}
                            alt={b.tenBM}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="font-bold text-sm text-gray-800 text-center">{b.tenBM}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dịch vụ Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Chọn gói tập {selectedBoMon ? `- ${selectedBoMon.tenBM}` : ''}
                {selectedBoMon && (
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    {dichVuList.length} gói có sẵn
                  </span>
                )}
              </h2>

              {dichVuList.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="max-w-4xl w-full">
                    {/* Gym PT 30 Days Promo Banner */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                      {/* Popular Ribbon */}
                      <div className="absolute top-6 -left-12 z-30 bg-gradient-to-r from-red-600 to-orange-500 text-white px-16 py-2 transform -rotate-45 shadow-lg">
                        <div className="flex items-center gap-2 justify-center">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-extrabold tracking-wide">PHỔ BIẾN NHẤT</span>
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row">
                        {/* Left Side - Image */}
                        <div className="md:w-1/2 relative">
                          <img
                            src="/images/Gym/1_Gym_PT.jpg"
                            alt="Gym PT Training"
                            className="w-full h-full object-cover min-h-[400px]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-600/30"></div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="md:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 md:p-10 text-white relative">
                          {/* Decorative circles */}
                          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Award className="w-8 h-8" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white/90">Gói được yêu thích nhất</div>
                                <div className="text-xs text-white/70">Hơn 5,000+ thành viên đã chọn</div>
                              </div>
                            </div>

                            <h3 className="text-4xl font-extrabold mb-3 leading-tight">
                              Gym PT<br />30 ngày
                            </h3>

                            <p className="text-lg text-white/95 mb-6 font-medium">
                              Gói tập luyện cá nhân với hiệu quả tối ưu
                            </p>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/30 mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5" />
                                <p className="font-bold text-base">Ưu điểm nổi bật</p>
                              </div>
                              <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm leading-relaxed">Huấn luyện 1-1 cá nhân với PT chuyên nghiệp</span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm leading-relaxed">Lịch tập linh hoạt, phù hợp mọi lịch trình</span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm leading-relaxed">Kết quả rõ rệt chỉ sau 30 ngày</span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm leading-relaxed">Chế độ dinh dưỡng cá nhân hóa miễn phí</span>
                                </li>
                              </ul>
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => {
                                // Find Gym sport and load its services
                                const gymBoMon = boMonList.find(b =>
                                  b.tenBM?.toLowerCase().includes('gym')
                                );
                                if (gymBoMon) {
                                  loadDichVu(gymBoMon.maBM);
                                  // Scroll to services section
                                  setTimeout(() => {
                                    window.scrollTo({
                                      top: 400,
                                      behavior: 'smooth'
                                    });
                                  }, 300);
                                }
                              }}
                              className="w-full bg-white hover:bg-gray-50 text-orange-600 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                              <span className="text-lg">Đăng ký ngay</span>
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-xs text-white/80 text-center mt-3">
                              Nhấn để xem chi tiết và đăng ký gói này
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {dichVuList.map(dv => {
                    const badge = getLoaiDVBadge(dv.loaiDV);
                    const BadgeIcon = badge.icon;
                    const isSelected = selectedDV.includes(dv.maDV);
                    const serviceImage = getServiceImage(selectedBoMon?.tenBM, dv.loaiDV, dv.maDV);
                    const isPopular = isPopularPackage(dv);

                    return (
                      <div
                        key={dv.maDV}
                        className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${isPopular
                          ? 'border-gradient scale-105 shadow-2xl'
                          : isSelected
                            ? 'border-primary bg-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-primary/50 hover:shadow-md bg-white'
                          }`}
                        style={isPopular ? {
                          borderImage: 'linear-gradient(135deg, #f97316, #dc2626) 1',
                          boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)'
                        } : {}}
                      >
                        {/* Popular Badge */}
                        {isPopular && (
                          <>
                            <div className="absolute -top-3 -right-3 z-20">
                              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse border-2 border-white">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs font-extrabold">PHỔ BIẾN NHẤT</span>
                              </div>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-2xl pointer-events-none"></div>
                          </>
                        )}

                        {/* Selected Checkmark */}
                        {isSelected && !isPopular && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Service Image */}
                        {serviceImage && (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={serviceImage}
                              alt={dv.tenDV}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                            {/* Badge on Image */}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className={`px-3 py-1 ${badge.bg} text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 border border-white/20`}>
                                <BadgeIcon className="w-3 h-3" />
                                {badge.text}
                              </span>
                              {dv.thoiHan && (
                                <span className="px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-md backdrop-blur-sm border border-white/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {dv.thoiHan} ngày
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4">
                          {/* Service Info */}
                          <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{dv.tenDV}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                              <Clock className="w-3 h-3" />
                              <span>{dv.thoiHan || '-'} ngày</span>
                              {dv.loaiDV === 'PT' && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <Star className="w-3 h-3 fill-current text-orange-500" />
                                  <span className="text-orange-600 font-medium">1-1 PT</span>
                                </>
                              )}
                            </div>
                            {dv.moTa && (
                              <p className="text-xs text-gray-500 line-clamp-2">{dv.moTa}</p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="mb-3 pb-3 border-b border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Giá gói</div>
                            <div className="text-xl font-extrabold text-primary">
                              {formatPrice(dv.donGia || 0)}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <button
                              onClick={() => toggleSelectDV(dv.maDV)}
                              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${isSelected
                                ? 'bg-primary text-white shadow-md'
                                : isPopular
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
                                }`}
                            >
                              {isSelected ? '✓ Đã chọn' : 'Chọn gói này'}
                            </button>

                            {dv.loaiDV === 'Lop' && isSelected && (
                              <button
                                onClick={() => chooseClassForDV(dv.maDV)}
                                className="w-full py-2 px-3 rounded-lg border border-blue-500 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Users className="w-3 h-3" />
                                Chọn lớp
                              </button>
                            )}
                            {dv.loaiDV === 'PT' && isSelected && (
                              <button
                                onClick={() => choosePTForDV(dv.maDV)}
                                className="w-full py-2 px-3 rounded-lg border border-orange-500 text-orange-600 text-xs font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5"
                              >
                                <UserCheck className="w-3 h-3" />
                                Chọn PT
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Options */}
                        {/* Expanded Options - Inline Class List Removed */}
                        {classOptions[dv.maDV]?.length > 0 && null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Order Summary */}
          <aside className="w-80 flex-shrink-0 hidden xl:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Khách hàng</div>
                  <div className="font-bold text-gray-800">{khachHang?.hoTen || khachHang?.ten || '---'}</div>
                  <div className="text-xs text-gray-400">Mã: {khachHang?.maKH || '-'}</div>
                </div>
              </div>

              {/* Selected Services */}
              <div className="py-4 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-700 mb-2">Gói đã chọn</div>
                {selectedDV.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa chọn gói nào</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDV.map(maDV => {
                      const dv = allDichVu.find(x => x.maDV === maDV);
                      if (!dv) return null;
                      return (
                        <div key={maDV} className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 truncate flex-1">{dv.tenDV}</span>
                            <span className="font-semibold text-primary ml-2">{formatPrice(dv.donGia || 0)}</span>
                          </div>
                          {dv.tenBM && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {dv.tenBM}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected PT */}
              {Object.keys(selectedTrainerByDV).length > 0 && (
                <div className="py-4 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    PT đã chọn
                  </div>
                  {Object.entries(selectedTrainerByDV)
                    .filter(([_, trainerId]) => trainerId) // Only show if trainer is selected
                    .map(([maDV, trainerId]) => {
                      const dv = allDichVu.find(x => x.maDV === maDV);
                      const trainer = trainerOptions[maDV]?.find(t => (t.maNV || t.id) === trainerId);
                      return (
                        <div key={maDV} className="text-sm text-gray-600">
                          {trainer?.tenNV || trainer?.hoTen || trainerId}
                          <span className="text-gray-400"> ({dv?.tenDV})</span>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Total */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-extrabold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={submitting || selectedDV.length === 0}
                onClick={handleRegister}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Đăng ký & Thanh toán
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Bạn sẽ được chuyển tới cổng thanh toán sau khi tạo hóa đơn
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="text-sm text-gray-500">{selectedDV.length} gói đã chọn</div>
            <div className="text-xl font-extrabold text-primary">{formatPrice(totalPrice)}</div>
          </div>
          <button
            disabled={submitting || selectedDV.length === 0}
            onClick={handleRegister}
            className="py-3 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Đang xử lý...' : 'Đăng ký'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PT Selection Modal */}
      {showPTModal && currentServiceForPT && trainerOptions[currentServiceForPT] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold">Chọn Personal Trainer</h2>
                  <p className="text-orange-100 text-sm mt-1">
                    {allDichVu.find(d => d.maDV === currentServiceForPT)?.tenDV}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPTModal(false);
                  setCurrentServiceForPT(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainerOptions[currentServiceForPT].map(trainer => {
                  const trainerId = trainer.maNV || trainer.id || trainer.nvId;
                  const trainerName = trainer.tenNV || trainer.tenNhanVien || trainer.hoTen || trainer.name || trainerId;
                  const isSelected = selectedTrainerByDV[currentServiceForPT] === trainerId;

                  return (
                    <button
                      key={trainerId || Math.random()}
                      onClick={() => selectTrainer(currentServiceForPT, trainerId)}
                      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                        }`}
                    >
                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Đã chọn
                        </div>
                      )}

                      <div className="flex items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                          : 'bg-gradient-to-br from-gray-300 to-gray-400'
                          }`}>
                          <User className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{trainerName}</h3>

                          {/* Quick meta: maNV, loaiNV, maBM, hoTen */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                            { (trainer.maNV || trainer.id) && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span className="font-medium">Mã: {trainer.maNV || trainer.id}</span>
                              </div>
                            )}
                            { trainer.loaiNV && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span className="font-medium">Loại: {trainer.loaiNV}</span>
                              </div>
                            )}
                            { trainer.maBM && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span className="font-medium">Bộ môn: {trainer.maBM}</span>
                              </div>
                            )}
                            { trainer.hoTen && trainer.hoTen !== trainerName && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span className="font-medium">Tên đầy đủ: {trainer.hoTen}</span>
                              </div>
                            )}
                          </div>

                          {/* Gender & DOB (if present) */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            {trainer.gioiTinh && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span>{trainer.gioiTinh === 'Nam' ? '👨' : '👩'}</span>
                                <span className="font-medium">{trainer.gioiTinh}</span>
                              </div>
                            )}
                            {trainer.ngaySinh && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                <span className="text-base">🎂</span>
                                <span className="font-medium">{new Date(trainer.ngaySinh).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 text-sm">
                        {/* Experience */}
                        {trainer.kinhNghiem && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Kinh nghiệm</div>
                              <div className="font-medium">{trainer.kinhNghiem}</div>
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {trainer.chungChi && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Chứng chỉ</div>
                              <div className="font-medium">{trainer.chungChi}</div>
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="pt-2 border-t border-gray-200 space-y-1.5">
                          {trainer.sdt && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-base">📞</span>
                              <span className="text-xs font-medium">{trainer.sdt}</span>
                            </div>
                          )}
                          {trainer.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-base">✉️</span>
                              <span className="text-xs truncate font-medium">{trainer.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Select/Deselect Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {!isSelected ? (
                          <div className="text-center text-sm font-semibold text-orange-600 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                            <span>Chọn PT này</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTrainer(currentServiceForPT, null); // Deselect logic
                            }}
                            className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-red-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hủy chọn
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {trainerOptions[currentServiceForPT].length} PT có sẵn
                </p>
                <button
                  onClick={() => {
                    setShowPTModal(false);
                    setCurrentServiceForPT(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection Modal */}
      {showClassModal && currentServiceForClass && classOptions[currentServiceForClass] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold">Chọn Lớp Học</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {allDichVu.find(d => d.maDV === currentServiceForClass)?.tenDV}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setCurrentServiceForClass(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classOptions[currentServiceForClass]
                  .filter(lop => {
                    if (!lop.ngayKT) return true;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const endDate = new Date(lop.ngayKT);
                    endDate.setHours(0, 0, 0, 0);
                    return endDate >= today;
                  })
                  .map(lop => {
                    const isSelected = selectedClassByDV[currentServiceForClass] === lop.maLop;
                    const slotsFilled = lop.slHienTai || 0;
                    const slotsTotal = lop.slToiDa || 0;
                    const percentFilled = slotsTotal > 0 ? (slotsFilled / slotsTotal) * 100 : 0;

                    return (
                      <button
                        key={lop.maLop}
                        onClick={() => selectClass(currentServiceForClass, lop.maLop)}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                      >
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã chọn
                          </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                          {/* Icon */}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                            <Users className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          </div>

                          {/* Class Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{lop.tenLop}</h3>
                            {lop.moTa && (
                              <div className="text-sm text-gray-600 line-clamp-2">{lop.moTa}</div>
                            )}
                          </div>
                        </div>

                        {/* Instructor & Details */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          {/* Instructor */}
                          {lop.tenGV && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-medium">Giáo viên</div>
                                <div className="font-bold text-gray-800">{lop.tenGV}</div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {/* Schedule */}
                            {lop.lichHoc && (
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">Lịch học</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-800">{lop.lichHoc}</div>
                              </div>
                            )}

                            {/* Room */}
                            {lop.phong && (
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">Phòng</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-800">{lop.phong}</div>
                              </div>
                            )}
                          </div>

                          {/* Capacity */}
                          {slotsTotal > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span className="text-gray-600 font-medium">Sĩ số lớp</span>
                                <span className={`font-bold ${percentFilled >= 90 ? 'text-red-600' : percentFilled >= 70 ? 'text-orange-600' : 'text-blue-600'}`}>
                                  {slotsFilled}/{slotsTotal}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${percentFilled >= 90 ? 'bg-red-500' : percentFilled >= 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                  style={{ width: `${percentFilled}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Select/Deselect Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {!isSelected ? (
                            <div className="text-center text-sm font-semibold text-blue-600 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                              <span>Chọn lớp này</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectClass(currentServiceForClass, null);
                              }}
                              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-red-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Hủy chọn
                            </button>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {classOptions[currentServiceForClass]
                    .filter(lop => !lop.ngayKT || new Date(lop.ngayKT) >= new Date().setHours(0, 0, 0, 0))
                    .length} lớp học có sẵn
                </p>
                <button
                  onClick={() => {
                    setShowClassModal(false);
                    setCurrentServiceForClass(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Đóng
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
