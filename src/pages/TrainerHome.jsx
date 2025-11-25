import React, { useEffect, useState } from 'react';
import { trainerService, authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, LogOut } from 'lucide-react';

const TrainerHome = () => {
  const navigate = useNavigate();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainerInfo();
  }, []);

  const fetchTrainerInfo = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching trainer info...');
      const data = await trainerService.getHome();
      console.log('Trainer data received:', data);
      setTrainerInfo(data);
    } catch (err) {
      console.error('Error fetching trainer info:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-2">Lỗi</h2>
              <p className="text-gray-700">{error}</p>
              <button 
                onClick={fetchTrainerInfo}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-orange-700 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trang chủ Huấn luyện viên</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
        
        {trainerInfo && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-500 text-sm font-medium mb-1">Mã HLV</p>
                <p className="text-2xl font-bold text-gray-900">{trainerInfo.trainerId || '-'}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-500 text-sm font-medium mb-1">Tên Huấn luyện viên</p>
                <p className="text-2xl font-bold text-gray-900">{trainerInfo.hoTen || '-'}</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-500 text-sm font-medium mb-1">Tên đăng nhập</p>
                <p className="text-2xl font-bold text-gray-900">{trainerInfo.username || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerHome;