import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { dichVuService } from '../services/dichVuService.js';
import { paymentService } from '../services/paymentService.js';
import { userService } from '../services/userService.js';
import Header from '../components/common/Header.jsx';
import ReusableFooter from '../components/common/ReusableFooter.jsx';
import { Box, Clock, CreditCard, User, Info, X } from 'lucide-react';

const RegisterService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [khachHang, setKhachHang] = useState(null);
  const [boMonList, setBoMonList] = useState([]);
  const [selectedBoMon, setSelectedBoMon] = useState(null);
  const [dichVuList, setDichVuList] = useState([]);

  // selected
  const [selectedDV, setSelectedDV] = useState([]); // maDV[]
  const [selectedServicesMap, setSelectedServicesMap] = useState({}); // maDV -> service object

  // options per service
  const [classOptionsByDV, setClassOptionsByDV] = useState({}); // maDV -> classes[]
  const [trainerOptionsByDV, setTrainerOptionsByDV] = useState({}); // maDV -> trainers[]

  // chosen per service
  const [selectedClassByDV, setSelectedClassByDV] = useState({}); // maDV -> classObj
  const [selectedTrainerByDV, setSelectedTrainerByDV] = useState({}); // maDV -> trainerObj
  
  // 🔥 Thêm lịch tập cụ thể cho PT
  const [selectedScheduleByDV, setSelectedScheduleByDV] = useState({}); // maDV -> { ngay, gio, thu }

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const cartItems = location.state?.cartItems || null;

  const handleAuthErrorIfNeeded = (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      navigate('/login', { state: { from: location } });
      return true;
    }
    return false;
  };

  const fetchBase = async () => {
    const res = await dichVuService.getDangKyDichVu(); // GET /api/dich-vu-gym/dang-kydv
    setKhachHang(res?.khachHang || null);
    setBoMonList(res?.dsBoMon || []);

    if ((res?.dsBoMon || []).length > 0) {
      setSelectedBoMon(res.dsBoMon[0]);
      await loadDichVu(res.dsBoMon[0].maBM);
    }
  };

  const loadDichVu = async (maBM) => {
    const res = await dichVuService.getDichVuTheoBoMon(maBM); // GET /api/dich-vu-gym/dich-vu-theo-bo-mon?maBM=...
    const bm = res?.boMon;
    setSelectedBoMon(bm || null);

    const list = (bm?.danhSachDichVu || []).map((s) => ({
      ...s,
      tenBM: bm?.tenBM,
      maBM: bm?.maBM,
    }));
    setDichVuList(list);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login', { state: { from: location } });
          return;
        }

        setLoading(true);
        setError('');

        await fetchBase();

        // nếu có cartItems => preselect
        if (cartItems && cartItems.length > 0) {
          const ids = cartItems.map((x) => x.maDV);
          setSelectedDV(ids);

          const map = {};
          const classSel = {};
          const trainerSel = {};

          for (const it of cartItems) {
            map[it.maDV] = it;
            if (it.selectedClass) classSel[it.maDV] = it.selectedClass;
            if (it.selectedTrainer) trainerSel[it.maDV] = it.selectedTrainer;
          }

          setSelectedServicesMap(map);
          setSelectedClassByDV(classSel);
          setSelectedTrainerByDV(trainerSel);

          // Tạo lịch mặc định cho PT từ cartItems
          const scheduleSel = {};
          for (const it of cartItems) {
            if (it.loaiDV === 'PT') {
              scheduleSel[it.maDV] = {
                ngay: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ngày mai
                gio: '08:00',
                thu: '246' // T2, T4, T6
              };
            }
          }
          setSelectedScheduleByDV(scheduleSel);

          // 🔥 Tự động load options cho các dịch vụ đã chọn
          for (const it of cartItems) {
            if (it.loaiDV === 'Lop') {
              fetchClasses(it.maDV);
            }
            if (it.loaiDV === 'PT') {
              fetchTrainers(it.maDV);
            }
          }
        }
      } catch (err) {
        console.error(err);
        if (handleAuthErrorIfNeeded(err)) return;
        setError('Không thể tải dữ liệu đăng ký dịch vụ.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const totalPrice = useMemo(() => {
    return selectedDV.reduce((sum, id) => {
      const s = selectedServicesMap[id] || dichVuList.find((x) => x.maDV === id);
      return sum + Number(s?.donGia || 0);
    }, 0);
  }, [selectedDV, selectedServicesMap, dichVuList]);

  const getServiceFromAny = (maDV) => {
    return selectedServicesMap[maDV] || dichVuList.find((x) => x.maDV === maDV) || null;
  };

  const fetchClasses = async (maDV) => {
    try {
      const res = await dichVuService.getChonLop(maDV); // GET /api/dich-vu-gym/chonlop?maDV=...
      setClassOptionsByDV((p) => ({ ...p, [maDV]: res?.dsLopChuaDay || [] }));
    } catch (err) {
      console.error(err);
      setError('Lỗi khi lấy danh sách lớp.');
    }
  };

  const fetchTrainers = async (maDV) => {
    try {
      const res = await dichVuService.getChonPT(maDV); // GET /api/dich-vu-gym/chonpt?maDV=...
      setTrainerOptionsByDV((p) => ({ ...p, [maDV]: res?.dsTrainer || [] }));
    } catch (err) {
      console.error(err);
      setError('Lỗi khi lấy danh sách PT.');
    }
  };

  const toggleSelectDV = async (svc) => {
    const id = svc.maDV;

    setSelectedDV((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      return [...prev, id];
    });

    setSelectedServicesMap((prev) => ({ ...prev, [id]: svc }));

    // auto load options if needed
    if (svc.loaiDV === 'Lop' && !classOptionsByDV[id]) {
      await fetchClasses(id);
    }
    if (svc.loaiDV === 'PT' && !trainerOptionsByDV[id]) {
      await fetchTrainers(id);
    }
  };

  const validateBeforePay = () => {
    if (!khachHang?.maKH) return 'Không có thông tin khách hàng.';
    if (!user?.accountId) return 'Thiếu accountId (AuthContext chưa có user.accountId).';
    if (selectedDV.length === 0) return 'Vui lòng chọn ít nhất một dịch vụ.';

    for (const id of selectedDV) {
      const svc = getServiceFromAny(id);
      if (!svc) return `Không tìm thấy dữ liệu dịch vụ ${id}.`;

      if (svc.loaiDV === 'Lop' && !selectedClassByDV[id]) return `Vui lòng chọn lớp cho dịch vụ: ${svc.tenDV}`;
      if (svc.loaiDV === 'PT' && !selectedTrainerByDV[id]) return `Vui lòng chọn PT cho dịch vụ: ${svc.tenDV}`;
      if (svc.loaiDV === 'PT' && !selectedScheduleByDV[id]?.ngay) return `Vui lòng chọn lịch tập cho dịch vụ: ${svc.tenDV}`;
    }

    return '';
  };

  const openPayment = () => {
    const msg = validateBeforePay();
    if (msg) {
      setError(msg);
      addToast({ message: msg, type: 'error' });
      return;
    }
    setError('');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    // giả lập validate payment form
    if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
      addToast({ message: 'Vui lòng điền đầy đủ thông tin thanh toán', type: 'error' });
      return;
    }

    const msg = validateBeforePay();
    if (msg) {
      setError(msg);
      addToast({ message: msg, type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // build ids WITHOUT null (tránh join lỗi)
      const dsTrainerId = selectedDV
        .map((id) => selectedTrainerByDV[id]?.maNV || selectedTrainerByDV[id]?.id)
        .filter(Boolean);

      const dsClassId = selectedDV
        .map((id) => selectedClassByDV[id]?.maLop)
        .filter(Boolean);

      const payload = {
        accountId: user.accountId,
        maKH: khachHang.maKH,
        dsMaDV: selectedDV,
        dsTrainerId: dsTrainerId.length ? dsTrainerId : null,
        dsClassId: dsClassId.length ? dsClassId : null,
      };

      // 1) tạo hóa đơn + CT_DKDV
      const res = await dichVuService.dangKyDichVuUniversal(payload); // POST /api/dich-vu-gym/dang-ky-dv-universal
      const maHD = res?.maHD;

      if (!maHD) throw new Error('Không nhận được maHD từ server.');

      // 2) gọi momo/pay để BE giả lập thanh toán => chuyển trạng thái DaThanhToan
      const payRes = await paymentService.momoPay(maHD); // POST /api/momo/pay/{maHD}

      // 3) 🔥 Tự động tạo lịch tập cho dịch vụ PT/Lớp
      const lichTapPromises = [];
      for (const id of selectedDV) {
        const svc = getServiceFromAny(id);
        if (svc?.loaiDV === 'PT' && selectedTrainerByDV[id]) {
          // Tạo lịch PT với trainer đã chọn
          lichTapPromises.push(
            userService.createLichTapPT({
              maKH: khachHang.maKH,
              maDV: id,
              maNV: selectedTrainerByDV[id].maNV || selectedTrainerByDV[id].id
            })
          );
        } else if (svc?.loaiDV === 'Lop' && selectedClassByDV[id]) {
          // Tạo lịch lớp với lớp đã chọn
          lichTapPromises.push(
            userService.createLichTapLop({
              maKH: khachHang.maKH,
              maDV: id,
              maLop: selectedClassByDV[id].maLop
            })
          );
        }
        // TuDo không cần tạo lịch cố định
      }

      // Chờ tất cả lịch tập được tạo (không block nếu lỗi)
      if (lichTapPromises.length > 0) {
        try {
          console.log('🔥 Tạo lịch tập cho', lichTapPromises.length, 'dịch vụ...');
          const results = await Promise.allSettled(lichTapPromises);
          console.log('📅 Kết quả tạo lịch:', results);
          
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const errorCount = results.filter(r => r.status === 'rejected').length;
          
          if (successCount > 0) {
            addToast({
              message: `✅ Đã tạo ${successCount} lịch tập thành công!`,
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

      addToast({
        message: `🎉 Thanh toán thành công! Mã HD: ${maHD} - ${Number(res?.tongTien || totalPrice).toLocaleString('vi-VN')}đ`,
        type: 'success',
        duration: 5000,
      });

      setShowPaymentModal(false);

      // 4) điều hướng qua dịch vụ của tôi
      navigate('/user/dich-vu-cua-toi', { replace: true });
    } catch (err) {
      console.error(err);
      if (handleAuthErrorIfNeeded(err)) return;

      const msgErr = err?.response?.data?.error || err?.message || 'Lỗi thanh toán/đăng ký dịch vụ';
      setError(msgErr);
      addToast({ message: msgErr, type: 'error', duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="solid" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <ReusableFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header variant="solid" />

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: customer + summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin đăng ký
                </h2>

                {khachHang ? (
                  <div className="p-4 bg-blue-50 rounded-xl mb-6">
                    <div className="font-semibold text-gray-800">{khachHang.hoTen}</div>
                    <div className="text-sm text-gray-600">Mã KH: {khachHang.maKH}</div>
                    <div className="text-sm text-gray-600">Email: {khachHang.email}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 mb-6">Không có dữ liệu khách hàng.</div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Đã chọn</div>
                    <div className="font-semibold">{selectedDV.length} dịch vụ</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tổng tạm tính</div>
                    <div className="text-2xl font-extrabold text-blue-600">{formatVND(totalPrice)}</div>
                  </div>
                </div>

                <button
                  onClick={openPayment}
                  disabled={submitting || selectedDV.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  {submitting ? 'Đang xử lý...' : 'Thanh toán'}
                </button>

                <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Dịch vụ loại PT/Lớp cần chọn PT/Lớp trước khi thanh toán.
                </div>
              </div>
            </div>

            {/* Right: selection */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems && cartItems.length > 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Xác nhận dịch vụ</h1>

                  <div className="space-y-4">
                    {selectedDV.map((id) => {
                      const svc = getServiceFromAny(id);
                      if (!svc) return null;

                      const classes = classOptionsByDV[id] || [];
                      const trainers = trainerOptionsByDV[id] || [];

                      return (
                        <div key={id} className="p-5 rounded-2xl border bg-gray-50">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-bold text-gray-800">{svc.tenDV}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 rounded bg-white border">{svc.loaiDV}</span>
                                <Clock className="w-4 h-4" />
                                {svc.thoiHan == null ? 'Không giới hạn' : `${svc.thoiHan} ngày`}
                              </div>
                            </div>
                            <div className="font-extrabold text-blue-600">{formatVND(svc.donGia)}</div>
                          </div>

                          {svc.loaiDV === 'Lop' && (
                            <div className="mt-4">
                              <button onClick={() => fetchClasses(id)} className="text-sm text-blue-600 hover:underline">
                                Tải danh sách lớp
                              </button>

                              <select
                                className="mt-2 w-full px-4 py-2 border rounded-xl"
                                value={selectedClassByDV[id]?.maLop || ''}
                                onChange={(e) => {
                                  const found = classes.find((c) => c.maLop === e.target.value) || null;
                                  setSelectedClassByDV((p) => ({ ...p, [id]: found }));
                                }}
                              >
                                <option value="">-- Chọn lớp --</option>
                                {classes.map((c) => (
                                  <option key={c.maLop} value={c.maLop}>
                                    {c.tenLop} (SL tối đa: {c.slToiDa})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {svc.loaiDV === 'PT' && (
                            <div className="mt-4">
                              <button onClick={() => fetchTrainers(id)} className="text-sm text-blue-600 hover:underline">
                                Tải danh sách PT
                              </button>

                              <select
                                className="mt-2 w-full px-4 py-2 border rounded-xl"
                                value={selectedTrainerByDV[id]?.maNV || selectedTrainerByDV[id]?.id || ''}
                                onChange={(e) => {
                                  const found =
                                    trainers.find((t) => t.maNV === e.target.value) ||
                                    trainers.find((t) => String(t.id) === String(e.target.value)) ||
                                    null;
                                  setSelectedTrainerByDV((p) => ({ ...p, [id]: found }));
                                }}
                              >
                                <option value="">-- Chọn PT --</option>
                                {trainers.map((t) => (
                                  <option key={t.maNV || t.id} value={t.maNV || t.id}>
                                    {t.hoTen || t.tenNV || `PT ${t.maNV || t.id}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {svc.loaiDV === 'PT' && selectedTrainerByDV[id] && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                              <h4 className="font-semibold text-gray-800 mb-3">📅 Chọn lịch tập với {selectedTrainerByDV[id]?.hoTen || selectedTrainerByDV[id]?.tenNV}</h4>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                  <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={selectedScheduleByDV[id]?.ngay || ''}
                                    onChange={(e) => setSelectedScheduleByDV(p => ({
                                      ...p,
                                      [id]: { ...p[id], ngay: e.target.value }
                                    }))}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ tập</label>
                                  <select
                                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={selectedScheduleByDV[id]?.gio || ''}
                                    onChange={(e) => setSelectedScheduleByDV(p => ({
                                      ...p,
                                      [id]: { ...p[id], gio: e.target.value }
                                    }))}
                                  >
                                    <option value="">-- Chọn giờ --</option>
                                    <option value="06:00">06:00 - 07:00</option>
                                    <option value="07:00">07:00 - 08:00</option>
                                    <option value="08:00">08:00 - 09:00</option>
                                    <option value="09:00">09:00 - 10:00</option>
                                    <option value="10:00">10:00 - 11:00</option>
                                    <option value="16:00">16:00 - 17:00</option>
                                    <option value="17:00">17:00 - 18:00</option>
                                    <option value="18:00">18:00 - 19:00</option>
                                    <option value="19:00">19:00 - 20:00</option>
                                    <option value="20:00">20:00 - 21:00</option>
                                  </select>
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lặp lại</label>
                                <div className="flex flex-wrap gap-2">
                                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => {
                                        const currentThu = selectedScheduleByDV[id]?.thu || '';
                                        const dayNumber = idx + 2 > 7 ? 1 : idx + 2; // CN=1, T2=2, T3=3...
                                        const newThu = currentThu.includes(dayNumber.toString()) 
                                          ? currentThu.replace(dayNumber.toString(), '')
                                          : currentThu + dayNumber.toString();
                                        setSelectedScheduleByDV(p => ({
                                          ...p,
                                          [id]: { ...p[id], thu: newThu }
                                        }));
                                      }}
                                      className={`px-3 py-1 text-sm rounded-full border transition-all ${
                                        (selectedScheduleByDV[id]?.thu || '').includes(((idx + 2 > 7 ? 1 : idx + 2)).toString())
                                          ? 'bg-blue-500 text-white border-blue-500'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Chọn các ngày trong tuần để lặp lại lịch tập</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Chọn dịch vụ tập luyện</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Chọn gói phù hợp với bạn
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {/* BoMon */}
                    <div className="col-span-1">
                      <h2 className="font-semibold mb-3">Bộ môn</h2>
                      <div className="space-y-2">
                        {boMonList.map((b) => (
                          <button
                            key={b.maBM}
                            onClick={async () => {
                              try {
                                setLoading(true);
                                await loadDichVu(b.maBM);
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                              selectedBoMon?.maBM === b.maBM
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium text-gray-800">{b.tenBM}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="col-span-3">
                      <h2 className="font-semibold mb-3">
                        Dịch vụ {selectedBoMon ? `- ${selectedBoMon.tenBM}` : ''}
                      </h2>

                      {dichVuList.length === 0 ? (
                        <div className="text-gray-500 py-8">Không có dịch vụ.</div>
                      ) : (
                        <div className="space-y-4">
                          {dichVuList.map((dv) => {
                            const checked = selectedDV.includes(dv.maDV);
                            const classes = classOptionsByDV[dv.maDV] || [];
                            const trainers = trainerOptionsByDV[dv.maDV] || [];

                            return (
                              <div key={dv.maDV} className="p-5 rounded-2xl border bg-white hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="font-bold text-gray-800 text-lg">{dv.tenDV}</div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                      <span className="px-2 py-1 rounded bg-gray-100 border">{dv.loaiDV}</span>
                                      <Clock className="w-4 h-4" />
                                      {dv.thoiHan == null ? 'Không giới hạn' : `${dv.thoiHan} ngày`}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="font-extrabold text-blue-600">{formatVND(dv.donGia)}</div>
                                    <label className="inline-flex items-center cursor-pointer mt-3">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleSelectDV(dv)}
                                        className="mr-2"
                                      />
                                      <span className="text-sm">{checked ? 'Đã chọn' : 'Chọn'}</span>
                                    </label>
                                  </div>
                                </div>

                                {checked && dv.loaiDV === 'Lop' && (
                                  <div className="mt-4">
                                    <button onClick={() => fetchClasses(dv.maDV)} className="text-sm text-blue-600 hover:underline">
                                      Tải danh sách lớp
                                    </button>
                                    <select
                                      className="mt-2 w-full px-4 py-2 border rounded-xl"
                                      value={selectedClassByDV[dv.maDV]?.maLop || ''}
                                      onChange={(e) => {
                                        const found = classes.find((c) => c.maLop === e.target.value) || null;
                                        setSelectedClassByDV((p) => ({ ...p, [dv.maDV]: found }));
                                      }}
                                    >
                                      <option value="">-- Chọn lớp --</option>
                                      {classes.map((c) => (
                                        <option key={c.maLop} value={c.maLop}>
                                          {c.tenLop} (SL tối đa: {c.slToiDa})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {checked && dv.loaiDV === 'PT' && (
                                  <div className="mt-4">
                                    <button onClick={() => fetchTrainers(dv.maDV)} className="text-sm text-blue-600 hover:underline">
                                      Tải danh sách PT
                                    </button>
                                    <select
                                      className="mt-2 w-full px-4 py-2 border rounded-xl"
                                      value={selectedTrainerByDV[dv.maDV]?.maNV || selectedTrainerByDV[dv.maDV]?.id || ''}
                                      onChange={(e) => {
                                        const found =
                                          trainers.find((t) => t.maNV === e.target.value) ||
                                          trainers.find((t) => String(t.id) === String(e.target.value)) ||
                                          null;
                                        setSelectedTrainerByDV((p) => ({ ...p, [dv.maDV]: found }));
                                      }}
                                    >
                                      <option value="">-- Chọn PT --</option>
                                      {trainers.map((t) => (
                                        <option key={t.maNV || t.id} value={t.maNV || t.id}>
                                          {t.hoTen || t.tenNV || `PT ${t.maNV || t.id}`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {checked && dv.loaiDV === 'PT' && selectedTrainerByDV[dv.maDV] && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <h4 className="font-semibold text-gray-800 mb-3">📅 Chọn lịch tập với {selectedTrainerByDV[dv.maDV]?.hoTen || selectedTrainerByDV[dv.maDV]?.tenNV}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                        <input
                                          type="date"
                                          min={new Date().toISOString().split('T')[0]}
                                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                          value={selectedScheduleByDV[dv.maDV]?.ngay || ''}
                                          onChange={(e) => setSelectedScheduleByDV(p => ({
                                            ...p,
                                            [dv.maDV]: { ...p[dv.maDV], ngay: e.target.value }
                                          }))}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giờ tập</label>
                                        <select
                                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                          value={selectedScheduleByDV[dv.maDV]?.gio || ''}
                                          onChange={(e) => setSelectedScheduleByDV(p => ({
                                            ...p,
                                            [dv.maDV]: { ...p[dv.maDV], gio: e.target.value }
                                          }))}
                                        >
                                          <option value="">-- Chọn giờ --</option>
                                          <option value="06:00">06:00 - 07:00</option>
                                          <option value="07:00">07:00 - 08:00</option>
                                          <option value="08:00">08:00 - 09:00</option>
                                          <option value="09:00">09:00 - 10:00</option>
                                          <option value="10:00">10:00 - 11:00</option>
                                          <option value="16:00">16:00 - 17:00</option>
                                          <option value="17:00">17:00 - 18:00</option>
                                          <option value="18:00">18:00 - 19:00</option>
                                          <option value="19:00">19:00 - 20:00</option>
                                          <option value="20:00">20:00 - 21:00</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="mt-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Lặp lại</label>
                                      <div className="flex flex-wrap gap-2">
                                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => (
                                          <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                              const currentThu = selectedScheduleByDV[dv.maDV]?.thu || '';
                                              const dayNumber = idx + 2 > 7 ? 1 : idx + 2; // CN=1, T2=2, T3=3...
                                              const newThu = currentThu.includes(dayNumber.toString()) 
                                                ? currentThu.replace(dayNumber.toString(), '')
                                                : currentThu + dayNumber.toString();
                                              setSelectedScheduleByDV(p => ({
                                                ...p,
                                                [dv.maDV]: { ...p[dv.maDV], thu: newThu }
                                              }));
                                            }}
                                            className={`px-3 py-1 text-sm rounded-full border transition-all ${
                                              (selectedScheduleByDV[dv.maDV]?.thu || '').includes(((idx + 2 > 7 ? 1 : idx + 2)).toString())
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                            }`}
                                          >
                                            {day}
                                          </button>
                                        ))}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">Chọn các ngày trong tuần để lặp lại lịch tập</p>
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
              )}
            </div>
          </div>
        </div>
      </div>

      <ReusableFooter />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/40" onClick={() => !submitting && setShowPaymentModal(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin thanh toán
                </h3>
                <button onClick={() => !submitting && setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số thẻ</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hết hạn</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    value={paymentForm.cardholderName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">{formatVND(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterService;
