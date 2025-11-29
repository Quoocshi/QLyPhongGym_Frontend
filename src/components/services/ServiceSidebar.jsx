import { Dumbbell, TrendingUp, Filter, Award } from 'lucide-react';

export const ServiceSidebar = ({ 
  boMonList, 
  selectedBoMon, 
  setSelectedBoMon, 
  thoiHanFilter, 
  setThoiHanFilter, 
  filteredCount 
}) => {
  return (
    <div className="lg:w-1/4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-4">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <Dumbbell className="w-10 h-10 text-white mb-3" />
            <h2 className="text-2xl font-bold text-white">Môn Thể Thao</h2>
            <p className="text-orange-100 text-sm mt-1">Chọn môn yêu thích</p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {boMonList.map((boMon, idx) => (
              <button
                key={boMon.maBM}
                onClick={() => setSelectedBoMon(boMon.maBM)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-102 ${
                  selectedBoMon === boMon.maBM
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-200 scale-102'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-lg'
                }`}
                style={{animationDelay: `${0.1 * idx}s`}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{boMon.tenBM}</span>
                  {selectedBoMon === boMon.maBM && (
                    <div className="bg-white/20 p-1 rounded-full animate-bounce-slow">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Premium Filter Section */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Thời hạn gói</h3>
            </div>
            <select
              value={thoiHanFilter}
              onChange={(e) => setThoiHanFilter(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-primary transition-all font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            >
              <option value="">🎯 Tất cả các gói</option>
              <option value="1">⚡ 1 tháng - Linh hoạt</option>
              <option value="3">🔥 3 tháng - Phổ biến</option>
              <option value="6">💪 6 tháng - Tiết kiệm</option>
              <option value="12">🏆 12 tháng - Tốt nhất</option>
            </select>
          </div>

          {/* Stats Card */}
          <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng dịch vụ</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  {filteredCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
