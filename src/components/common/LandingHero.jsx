import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero = () => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 pt-16 overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
          alt="Gym Background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="text-center opacity-0 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            KIẾN TẠO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">VÓC DÁNG</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">MƠ ƯỚC</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Trang thiết bị hiện đại • Huấn luyện viên chuyên nghiệp • Lịch tập linh hoạt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-bold rounded-xl text-white hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-300">
              Đăng nhập
            </Link>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 opacity-0 animate-fade-in-up delay-500">
          {[
            { number: '10K+', label: 'Thành viên' },
            { number: '50+', label: 'HLV chuyên nghiệp' },
            { number: '100+', label: 'Lớp học' },
            { number: '24/7', label: 'Hoạt động' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
              <div className="text-sm md:text-base text-gray-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingHero;