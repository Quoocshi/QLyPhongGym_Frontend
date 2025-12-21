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
  const [step, setStep] = useState(1); // 1: Chọn bộ môn, 2: Chọn dịch vụ, 3: Chọn PT/Lớp
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
    } catch (err) {
      setError(err.response?.data || err.message || 'Lỗi khi lấy lớp');
    }
  };

  const choosePTForDV = async (maDV) => {
    try {
      const res = await dichVuGymService.getChonPT(maDV);
      const trainers = res.dsTrainer || res.ds || res;
      setTrainerOptions((s) => ({ ...s, [maDV]: trainers }));
      setStep(3);
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

    // Check if any selected services require PT or Class selection
    const servicesNeedingPT = [];
    const servicesNeedingClass = [];

    for (const maDV of selectedDV) {
      const dv = dichVuList.find(x => x.maDV === maDV);
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

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Promo Banner */}
          <aside className="w-64 flex-shrink-0 hidden 2xl:block">
            <div className="sticky top-6 space-y-6">
              {/* Gym PT 30 Days Promo Banner */}
              <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <Star className="w-10 h-10 mb-3 fill-current" />
                  <h3 className="text-2xl font-extrabold mb-2">Phổ biến nhất!</h3>
                  <p className="text-lg text-white font-bold mb-1">Gym PT 30 ngày</p>
                  <p className="text-sm text-white/90 mb-4">Gói tập luyện cá nhân được yêu thích nhất</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <p className="text-xs font-semibold">✨ Ưu điểm nổi bật:</p>
                    <ul className="text-xs mt-2 space-y-1">
                      <li>• Huấn luyện 1-1 cá nhân</li>
                      <li>• Lịch tập linh hoạt</li>
                      <li>• Hiệu quả tối ưu</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <Award className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 mb-2">Đã có</h4>
                  <div className="text-4xl font-extrabold text-primary mb-1">10,000+</div>
                  <p className="text-sm text-gray-600">Thành viên tin tưởng</p>
                </div>
              </div>
            </div>
          </aside>

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
                <div className="text-center py-16">
                  <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn bộ môn để xem các gói dịch vụ</p>
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
                        {(classOptions[dv.maDV]?.length > 0 || trainerOptions[dv.maDV]?.length > 0) && (
                          <div className="px-4 pb-4">
                            {/* Class Options */}
                            {classOptions[dv.maDV]?.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-bold mb-2 flex items-center gap-1.5 text-blue-600">
                                  <Users className="w-3 h-3" />
                                  Chọn lớp:
                                </div>
                                <div className="space-y-1.5">
                                  {classOptions[dv.maDV].slice(0, 2).map(lp => (
                                    <button
                                      key={lp.maLop}
                                      onClick={() => setSelectedClassByDV(s => ({ ...s, [dv.maDV]: lp.maLop }))}
                                      className={`w-full p-2 rounded-lg border text-left transition-all text-xs ${selectedClassByDV[dv.maDV] === lp.maLop
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                      <div className="font-semibold text-gray-800">{lp.tenLop}</div>
                                      {lp.slToiDa && (
                                        <div className="text-blue-600 mt-0.5">
                                          {lp.slHienTai || 0}/{lp.slToiDa} người
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Trainer Options */}
                            {trainerOptions[dv.maDV]?.length > 0 && (
                              <div>
                                <div className="text-xs font-bold mb-2 flex items-center gap-1.5 text-orange-600">
                                  <UserCheck className="w-3 h-3" />
                                  Chọn PT:
                                </div>
                                <div className="space-y-1.5">
                                  {trainerOptions[dv.maDV].slice(0, 2).map(tv => {
                                    const trainerId = tv.maNV || tv.id || tv.nvId;
                                    const trainerName = tv.tenNV || tv.tenNhanVien || tv.hoTen || tv.name || trainerId;
                                    const isSelectedTrainer = selectedTrainerByDV[dv.maDV] === trainerId;

                                    return (
                                      <button
                                        key={trainerId || Math.random()}
                                        onClick={() => setSelectedTrainerByDV(s => ({ ...s, [dv.maDV]: trainerId }))}
                                        className={`w-full p-2 rounded-lg border text-left transition-all ${isSelectedTrainer
                                          ? 'border-orange-500 bg-orange-50'
                                          : 'border-gray-200 hover:border-orange-300'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSelectedTrainer
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                            : 'bg-gray-200'
                                            }`}>
                                            <User className={`w-4 h-4 ${isSelectedTrainer ? 'text-white' : 'text-gray-500'}`} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs text-gray-800 truncate">{trainerName}</div>
                                            {tv.chuyenMon && (
                                              <div className="text-xs text-orange-600 truncate">{tv.chuyenMon}</div>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                      const dv = dichVuList.find(x => x.maDV === maDV);
                      if (!dv) return null;
                      return (
                        <div key={maDV} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 truncate flex-1">{dv.tenDV}</span>
                          <span className="font-semibold text-primary ml-2">{formatPrice(dv.donGia || 0)}</span>
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
                  {Object.entries(selectedTrainerByDV).map(([maDV, trainerId]) => {
                    const dv = dichVuList.find(x => x.maDV === maDV);
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
    </div>
  );
};

export default RegisterService;
