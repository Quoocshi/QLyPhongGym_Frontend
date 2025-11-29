import { useNavigate } from 'react-router-dom';
import { Clock, Award, TrendingUp, ArrowRight, Plus } from "lucide-react";

export const ServiceCard = ({ dichVu, idx = 0, formatCurrency, getLoaiDichVuLabel }) => {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
      onClick={() => navigate(`/user/dang-ky/service/${dichVu.maDV}`)}
    >
      {/* IMAGE HEADER */}
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={dichVu.hinhAnh || "/fallback-gym.jpg"}
          alt={dichVu.tenDV}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

        {/* Badge top-left */}
        {idx < 3 && (
          <span className="absolute top-4 left-4 bg-white/90 text-orange-600 font-semibold text-xs px-3 py-1 rounded-full shadow-sm">
            ⭐ Phổ biến
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="p-5 space-y-4 flex-1">

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-snug">
          {dichVu.tenDV}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Giá / kỳ hạn</p>
            <p className="text-2xl font-extrabold text-orange-600">
              {formatCurrency(dichVu.donGia)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{dichVu.thoiHan} tháng</span>
          </div>
        </div>

        {/* Info items */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 text-lg">
              {dichVu.loaiDV === 'PT' && "⭐"}
              {dichVu.loaiDV === 'Lop' && "👥"}
              {dichVu.loaiDV === 'TuDo' && "🎯"}
            </div>
            <div>
              <p className="text-xs text-gray-500">Loại dịch vụ</p>
              <p className="font-semibold">{getLoaiDichVuLabel(dichVu.loaiDV)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium">Trải nghiệm cao cấp</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-orange-100 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium">Hiệu quả đảm bảo</span>
          </div>
        </div>

        {/* ACTIONS - moved to their own block to avoid overflow/truncation */}
        <div className="mt-3 space-y-3">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/user/dang-ky/service/${dichVu.maDV}`); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/user/dang-ky/service/${dichVu.maDV}`); }}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            Chi tiết
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


export const ServiceGrid = ({ dichVuList, formatCurrency, getLoaiDichVuLabel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {dichVuList.map((dichVu, idx) => (
        <ServiceCard
          key={dichVu.maDV}
          dichVu={dichVu}
          idx={idx}
          formatCurrency={formatCurrency}
          getLoaiDichVuLabel={getLoaiDichVuLabel}
        />
      ))}
    </div>
  );
};
