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

  if (loading && boMonList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
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
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step >= s.num 
                    ? 'bg-white text-orange-600 font-bold shadow-lg' 
                    : 'bg-white/20 text-white/70'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    step >= s.num ? 'bg-orange-600 text-white' : 'bg-white/30'
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
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Bộ môn Column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Bộ môn
                  </h2>
                  <div className="space-y-2">
                    {boMonList.map(b => (
                      <button 
                        key={b.maBM} 
                        onClick={() => loadDichVu(b.maBM)} 
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedBoMon?.maBM === b.maBM 
                            ? 'border-primary bg-orange-50 shadow-md transform scale-[1.02]' 
                            : 'border-gray-100 hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{b.tenBM}</div>
                        {b.moTa && <div className="text-xs text-gray-500 mt-1">{b.moTa}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dịch vụ Column */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Dịch vụ {selectedBoMon ? `- ${selectedBoMon.tenBM}` : ''}
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
                    <div className="space-y-4">
                      {dichVuList.map(dv => {
                        const badge = getLoaiDVBadge(dv.loaiDV);
                        const BadgeIcon = badge.icon;
                        const isSelected = selectedDV.includes(dv.maDV);
                        
                        return (
                          <div 
                            key={dv.maDV} 
                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'border-primary bg-orange-50 shadow-lg transform scale-[1.01]' 
                                : 'border-gray-100 hover:border-primary/50 hover:shadow-md bg-white'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Service Icon & Info */}
                              <div className="flex-1">
                                <div className="flex items-start gap-4">
                                  <div className={`w-14 h-14 ${badge.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <BadgeIcon className="w-7 h-7 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <h3 className="text-xl font-bold text-gray-800">{dv.tenDV}</h3>
                                      <span className={`px-3 py-1 ${badge.bg} text-white text-xs font-bold rounded-full`}>
                                        {badge.text}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {dv.thoiHan || '-'} ngày
                                      </span>
                                      {dv.loaiDV === 'PT' && (
                                        <span className="flex items-center gap-1 text-orange-600">
                                          <Star className="w-4 h-4 fill-current" />
                                          1-1 với PT
                                        </span>
                                      )}
                                    </div>
                                    {dv.moTa && (
                                      <p className="mt-3 text-gray-600 text-sm">{dv.moTa}</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Price & Actions */}
                              <div className="flex flex-col items-end justify-between min-w-[200px]">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Giá gói</div>
                                  <div className="text-2xl font-extrabold text-primary">
                                    {formatPrice(dv.donGia || 0)}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-4 w-full">
                                  <button
                                    onClick={() => toggleSelectDV(dv.maDV)}
                                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                                      isSelected
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
                                    }`}
                                  >
                                    {isSelected ? '✓ Đã chọn' : 'Chọn gói này'}
                                  </button>

                                  {dv.loaiDV === 'Lop' && isSelected && (
                                    <button 
                                      onClick={() => chooseClassForDV(dv.maDV)} 
                                      className="w-full py-2 px-4 rounded-xl border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                    >
                                      <Users className="w-4 h-4" />
                                      Chọn lớp học
                                    </button>
                                  )}
                                  {dv.loaiDV === 'PT' && isSelected && (
                                    <button 
                                      onClick={() => choosePTForDV(dv.maDV)} 
                                      className="w-full py-2 px-4 rounded-xl border-2 border-orange-500 text-orange-600 font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      Chọn huấn luyện viên
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Class Options */}
                            {classOptions[dv.maDV] && classOptions[dv.maDV].length > 0 && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  Chọn lớp học:
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {classOptions[dv.maDV].map(lp => (
                                    <button 
                                      key={lp.maLop} 
                                      onClick={() => setSelectedClassByDV(s => ({ ...s, [dv.maDV]: lp.maLop }))}
                                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        selectedClassByDV[dv.maDV] === lp.maLop 
                                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                                          : 'border-gray-200 hover:border-blue-300'
                                      }`}
                                    >
                                      <div className="font-semibold text-gray-800">{lp.tenLop}</div>
                                      <div className="text-xs text-gray-500 mt-1">Mã: {lp.maLop}</div>
                                      {lp.slToiDa && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          Sĩ số: {lp.slHienTai || 0}/{lp.slToiDa}
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Trainer Options */}
                            {trainerOptions[dv.maDV] && trainerOptions[dv.maDV].length > 0 && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="text-sm font-bold mb-3 flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-orange-600" />
                                  Chọn Huấn luyện viên (PT):
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {trainerOptions[dv.maDV].map(tv => {
                                    const trainerId = tv.maNV || tv.id || tv.nvId;
                                    const trainerName = tv.tenNV || tv.tenNhanVien || tv.hoTen || tv.name || trainerId;
                                    const isSelectedTrainer = selectedTrainerByDV[dv.maDV] === trainerId;
                                    
                                    return (
                                      <button 
                                        key={trainerId || Math.random()} 
                                        onClick={() => setSelectedTrainerByDV(s => ({ ...s, [dv.maDV]: trainerId }))}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                          isSelectedTrainer 
                                            ? 'border-orange-500 bg-orange-50 shadow-lg' 
                                            : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            isSelectedTrainer 
                                              ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                                              : 'bg-gray-200'
                                          }`}>
                                            <User className={`w-6 h-6 ${isSelectedTrainer ? 'text-white' : 'text-gray-500'}`} />
                                          </div>
                                          <div>
                                            <div className="font-bold text-gray-800">{trainerName}</div>
                                            <div className="text-xs text-gray-500">Mã PT: {trainerId}</div>
                                            {tv.chuyenMon && (
                                              <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                {tv.chuyenMon}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {isSelectedTrainer && (
                                          <div className="mt-3 flex items-center gap-1 text-orange-600 text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Đã chọn PT này
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                  <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-orange-800">
                                      <strong>Lưu ý:</strong> Sau khi đăng ký thành công, Huấn luyện viên sẽ liên hệ để sắp xếp lịch tập phù hợp với bạn.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
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
