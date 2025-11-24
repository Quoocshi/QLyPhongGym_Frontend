import { useEffect, useState, useMemo } from 'react';
import { dichVuGymService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Box, Users, Clock, CreditCard, User, DollarSign, CheckCircle, Info } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await dichVuGymService.getDanhSachBoMon();
        setBoMonList(res.dsBoMon || res.dsBM || res);
        setKhachHang(res.khachHang || null);
        // fetch accountId from user/home (server provides accountId)
        try {
          const home = await userService.getHome();
          if (home && home.accountId) setAccountId(home.accountId);
        } catch (e) {
          // ignore; accountId may be absent
        }
      } catch (err) {
        setError(err.response?.data || err.message || 'Lỗi khi tải danh sách bộ môn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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

    const payload = {
      accountId: accountId ? Number(accountId) : (Number(khachHang?.accountId) || undefined),
      maKH: khachHang?.maKH,
      dsMaDV: selectedDV,
      dsTrainerId: Object.values(selectedTrainerByDV).filter(Boolean),
      dsClassId: Object.values(selectedClassByDV).filter(Boolean)
    };

    try {
      setSubmitting(true);
      const res = await dichVuGymService.dangKyDichVuUniversal(payload);
      if (res.maHD) {
        // navigate to payment flow
        navigate(`/payment/${res.maHD}`);
      } else {
        setError(res.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi đăng ký dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BackToUserHome className="mb-4" />
      <div className="flex items-start justify-between mb-6 gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold">Đăng ký gói tập</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2"><Info className="w-4 h-4"/> Chọn gói phù hợp — có thể chọn lớp hoặc PT nếu hỗ trợ</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <h2 className="font-semibold mb-2 flex items-center gap-2"><Box className="w-4 h-4"/> Bộ môn</h2>
              <div className="space-y-2">
                {boMonList.map(b => (
                  <button key={b.maBM} onClick={() => loadDichVu(b.maBM)} className={`w-full text-left p-3 rounded border transition ${selectedBoMon?.maBM === b.maBM ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:shadow-sm hover:bg-gray-50'}`}>
                    <div className="font-medium">{b.tenBM}</div>
                    <div className="text-xs text-gray-500">{b.moTa || ''}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-3">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Dịch vụ {selectedBoMon ? `- ${selectedBoMon.tenBM}` : ''}</h2>
              {dichVuList.length === 0 ? <div className="text-sm text-gray-500">Chọn bộ môn để xem dịch vụ</div> : (
                <div className="space-y-4">
                  {dichVuList.map(dv => (
                    <div key={dv.maDV} className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">{(dv.tenDV || 'DV').slice(0,1)}</div>
                            <div>
                              <div className="font-semibold text-gray-800 text-lg">{dv.tenDV} <span className="text-sm text-gray-500">({dv.loaiDV})</span></div>
                              <div className="mt-1 text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4"/> Thời hạn: {dv.thoiHan || '-'}</div>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-700">{dv.moTa || dv.moTaDV || ''}</div>
                        </div>

                        <div className="flex flex-col items-end space-y-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Giá</div>
                            <div className="text-xl font-bold text-indigo-700"><DollarSign className="inline w-4 h-4"/> {dv.donGia || '-'}</div>
                          </div>

                          <label className="inline-flex items-center">
                            <input type="checkbox" checked={selectedDV.includes(dv.maDV)} onChange={() => toggleSelectDV(dv.maDV)} className="mr-2" />
                            <span className="text-sm">Chọn</span>
                          </label>

                          <div className="flex flex-col gap-2">
                            {dv.loaiDV === 'Lop' && (
                              <button disabled={!selectedDV.includes(dv.maDV)} onClick={() => chooseClassForDV(dv.maDV)} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">Chọn lớp</button>
                            )}
                            {dv.loaiDV === 'PT' && (
                              <button disabled={!selectedDV.includes(dv.maDV)} onClick={() => choosePTForDV(dv.maDV)} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">Chọn PT</button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* render class options if loaded */}
                      {classOptions[dv.maDV] && classOptions[dv.maDV].length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Chọn 1 lớp:</div>
                          <div className="flex gap-2 flex-wrap">
                            {classOptions[dv.maDV].map(lp => (
                              <button key={lp.maLop} onClick={() => setSelectedClassByDV(s => ({ ...s, [dv.maDV]: lp.maLop }))} className={`px-3 py-1 border rounded ${selectedClassByDV[dv.maDV] === lp.maLop ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>
                                {lp.tenLop} ({lp.maLop})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {trainerOptions[dv.maDV] && trainerOptions[dv.maDV].length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-2">Chọn PT:</div>
                          <div className="flex gap-2 flex-wrap">
                            {trainerOptions[dv.maDV].map(tv => {
                              const trainerId = tv.maNV || tv.id || tv.nvId;
                              const trainerName = tv.tenNV || tv.tenNhanVien || tv.hoTen || tv.name || trainerId;
                              return (
                                <button key={trainerId || Math.random()} onClick={() => setSelectedTrainerByDV(s => ({ ...s, [dv.maDV]: trainerId }))} className={`px-3 py-1 border rounded ${selectedTrainerByDV[dv.maDV] === trainerId ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>
                                  {trainerName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="w-80">
          <div className="p-4 rounded-lg border bg-white shadow-sm sticky top-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full w-12 h-12 bg-gray-100 flex items-center justify-center"><User className="w-5 h-5 text-gray-600"/></div>
              <div>
                <div className="text-sm text-gray-500">Khách hàng</div>
                <div className="font-medium">{khachHang?.hoTen || khachHang?.ten || '---'}</div>
                <div className="text-xs text-gray-400">Mã KH: {khachHang?.maKH || '-'}</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-500">Tài khoản</div>
              <div className="font-medium">{accountId || khachHang?.accountId || '-'}</div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-500">Gói đã chọn</div>
              <div className="text-sm text-gray-700">{selectedDV.length} mục</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Tổng tạm tính</div>
              <div className="text-2xl font-bold text-indigo-700 flex items-center gap-2"><DollarSign className="w-5 h-5"/>{totalPrice}</div>
            </div>

            <button disabled={submitting || selectedDV.length === 0} onClick={handleRegister} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded shadow hover:brightness-105">
              <CreditCard className="w-4 h-4"/>
              {submitting ? 'Đang xử lý...' : 'Đăng ký & Thanh toán'}
            </button>

            <div className="mt-3 text-xs text-gray-400">Bạn sẽ được chuyển tới cổng thanh toán sau khi tạo hóa đơn.</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RegisterService;
