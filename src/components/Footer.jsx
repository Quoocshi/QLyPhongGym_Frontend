import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">GYM VIỆT</h3>
            <p className="text-gray-400 mb-4">
              Thay đổi cơ thể và tinh thần với cơ sở vật chất hiện đại và đội ngũ huấn luyện viên chuyên nghiệp.
              Gia nhập ngay hôm nay để bắt đầu hành trình thay đổi bản thân.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition"><Facebook className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition"><Instagram className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-primary transition"><Twitter className="h-6 w-6" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Về chúng tôi</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-white transition">Dịch vụ</a></li>
              <li><a href="#trainers" className="text-gray-400 hover:text-white transition">Huấn luyện viên</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Bảng giá</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-1" />
                <span className="text-gray-400">123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-400">(+84) 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-400">lienhe@gymviet.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Gym Việt. Bản quyền thuộc về công ty.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;