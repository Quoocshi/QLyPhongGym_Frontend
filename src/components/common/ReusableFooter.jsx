import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const FooterSection = ({ title, children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const FooterLink = ({ to, children, external = false }) => (
  external ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center group"
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      className="text-gray-300 hover:text-orange-400 transition-colors duration-300 block group"
    >
      {children}
    </Link>
  )
);

const ReusableFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">FitnessPro</span>
                <span className="text-sm text-orange-400 font-medium">Gym & Fitness</span>
              </div>
            </Link>
            
            <p className="text-gray-300 leading-relaxed">
              Hệ thống phòng gym hiện đại với trang thiết bị cao cấp và đội ngũ huấn luyện viên chuyên nghiệp, 
              cam kết mang đến trải nghiệm tập luyện tốt nhất.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", color: "hover:text-blue-400" },
                { icon: Instagram, href: "#", color: "hover:text-pink-400" },
                { icon: Youtube, href: "#", color: "hover:text-red-400" },
                { icon: Twitter, href: "#", color: "hover:text-blue-300" }
              ].map(({ icon: Icon, href, color }, index) => (
                <a
                  key={index}
                  href={href}
                  className={`p-3 bg-white/10 backdrop-blur-sm rounded-lg text-gray-300 ${color} transition-all duration-300 transform hover:scale-110 hover:bg-white/20`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterSection title="Liên kết nhanh">
            <FooterLink to="/services">Dịch vụ</FooterLink>
            <FooterLink to="/trainers">Huấn luyện viên</FooterLink>
            <FooterLink to="/classes">Lịch tập</FooterLink>
            <FooterLink to="/membership">Gói thành viên</FooterLink>
            <FooterLink to="/about">Về chúng tôi</FooterLink>
            <FooterLink to="/contact">Liên hệ</FooterLink>
          </FooterSection>

          {/* Services */}
          <FooterSection title="Dịch vụ nổi bật">
            <FooterLink to="/services/personal-training">Personal Training</FooterLink>
            <FooterLink to="/services/group-classes">Lớp tập nhóm</FooterLink>
            <FooterLink to="/services/nutrition">Tư vấn dinh dưỡng</FooterLink>
            <FooterLink to="/services/physio">Vật lý trị liệu</FooterLink>
            <FooterLink to="/services/yoga">Yoga & Meditation</FooterLink>
            <FooterLink to="/services/swimming">Bơi lội</FooterLink>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection title="Thông tin liên hệ">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300">
                  <div className="font-medium">Cơ sở 1:</div>
                  <div>123 Đường ABC, Quận 1, TP.HCM</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300">
                  <div className="font-medium">Cơ sở 2:</div>
                  <div>456 Đường XYZ, Quận 3, TP.HCM</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <a href="tel:+84123456789" className="text-gray-300 hover:text-orange-400 transition-colors">
                  (+84) 123 456 789
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <a href="mailto:info@fitnesspro.com" className="text-gray-300 hover:text-orange-400 transition-colors">
                  info@fitnesspro.com
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="font-medium text-orange-400 mb-2">Giờ hoạt động:</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Thứ 2 - Thứ 6: 5:00 - 23:00</div>
                <div>Thứ 7 - CN: 6:00 - 22:00</div>
              </div>
            </div>
          </FooterSection>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-700/50 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-1">
                Đăng ký nhận thông tin mới nhất
              </h3>
              <p className="text-gray-400 text-sm">
                Nhận tin tức về các chương trình khuyến mãi và lớp học mới
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} FitnessPro. All rights reserved. Designed with ❤️ for your fitness journey.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <FooterLink to="/privacy">Chính sách bảo mật</FooterLink>
              <FooterLink to="/terms">Điều khoản sử dụng</FooterLink>
              <FooterLink to="/cookies">Cookie Policy</FooterLink>
              <FooterLink to="/sitemap">Site Map</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ReusableFooter;