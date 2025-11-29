import { useEffect, useState } from 'react';
import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import BackToUserHome from '../components/BackToUserHome';

const UserSchedule = () => {
  const navigate = useNavigate();
  const [lichTap, setLichTap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await userService.getLichTap();
        setLichTap(res.danhSachLichTap || res);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        setError(err.response?.data || err.message || 'Lỗi khi tải lịch tập');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải lịch...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <BackToUserHome className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Lịch tập của bạn</h1>
        <div className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Lịch hiện tại</div>
      </div>
      {error && <div className="text-red-600 mb-3">{error}</div>}

      {Array.isArray(lichTap) && lichTap.length > 0 ? (
        <ul className="space-y-3">
          {lichTap.map((lt, idx) => (
            <li key={lt.maLT || idx} className="border rounded p-4 bg-white hover:shadow-sm transition">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{lt.tenCaTap} {lt.tenLop ? `· ${lt.tenLop}` : ''}</div>
                  <div className="text-sm text-gray-600">{lt.thu} · {lt.moTaCaTap}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Nhân viên</div>
                  <div className="font-medium">{lt.tenNhanVien}</div>
                  <div className={`mt-2 inline-block px-2 py-1 text-sm rounded ${lt.trangThai?.toLowerCase().includes('dang') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{lt.trangThai}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600"><strong>Khu vực:</strong> {lt.tenKhuVuc}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">Chưa có lịch tập.</div>
      )}
    </div>
  );
};

export default UserSchedule;
