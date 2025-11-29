import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = ({ 
  title = "Sẵn sàng thay đổi bản thân?",
  subtitle = "Tham gia ngay hôm nay và nhận ưu đãi đặc biệt cho thành viên mới!",
  buttonText = "Đăng ký miễn phí",
  buttonLink = "/register"
}) => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative max-w-4xl mx-auto text-center px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 opacity-0 animate-fade-in-up">
          {title}
        </h2>
        <p className="text-xl text-orange-100 mb-10 opacity-0 animate-fade-in-up delay-200">
          {subtitle}
        </p>
        <Link 
          to={buttonLink} 
          className="inline-flex items-center px-10 py-5 bg-white text-primary font-bold text-lg rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl opacity-0 animate-fade-in-up delay-300"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-6 w-6" />
        </Link>
      </div>
    </section>
  );
};

export default CTASection;