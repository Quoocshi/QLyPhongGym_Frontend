import { Sparkles, Award, Users, Clock, CheckCircle2 } from 'lucide-react';

export const ServiceHero = ({ dichVuInfo }) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      
      {/* Content */}
      <div className="relative px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mb-8 animate-fade-in-up">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">Đăng ký dịch vụ cao cấp</span>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <span className="bg-gradient-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
              {dichVuInfo?.tenDV || 'Thông Tin Dịch Vụ'}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Chọn thông tin phù hợp và bắt đầu hành trình rèn luyện sức khỏe của bạn
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {[
              { icon: Award, number: '500+', label: 'Học viên' },
              { icon: Users, number: '50+', label: 'HLV chuyên nghiệp' },
              { icon: Clock, number: '24/7', label: 'Hỗ trợ' },
              { icon: CheckCircle2, number: '100%', label: 'Hài lòng' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:-translate-y-1">
                <stat.icon className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                <p className="text-3xl font-black text-white mb-1">{stat.number}</p>
                <p className="text-sm text-gray-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};
