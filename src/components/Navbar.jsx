import { Link } from 'react-router-dom';
import { Dumbbell, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-primary font-bold text-2xl">
              <Dumbbell className="h-8 w-8 mr-2" />
              GYM VIỆT
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary transition font-medium">Trang chủ</Link>
            <a href="#services" className="text-gray-600 hover:text-primary transition font-medium">Giới thiệu</a>
            <Link to="/services" className="text-gray-600 hover:text-primary transition font-medium">Dịch vụ</Link>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition font-medium">Bảng giá</a>
            
            <div className="flex items-center space-x-4 ml-4">
              <Link to="/login" className="text-primary hover:bg-orange-50 px-4 py-2 rounded-md border border-primary transition font-medium">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-orange-700 transition font-medium">
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-orange-50">Trang chủ</Link>
            <a href="#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-orange-50">Giới thiệu</a>
            <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-orange-50">Dịch vụ</Link>
            <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-orange-50">Bảng giá</a>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/login" className="block px-3 py-2 text-base font-medium text-primary text-center border border-primary rounded-md mb-2">Đăng nhập</Link>
              <Link to="/register" className="block px-3 py-2 text-base font-medium text-white bg-primary text-center rounded-md">Đăng ký</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;