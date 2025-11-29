import { Search } from 'lucide-react';

export const ServiceSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm dịch vụ của bạn..."
          className="w-full pl-14 pr-6 py-5 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-primary transition-all shadow-lg hover:shadow-xl placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};
