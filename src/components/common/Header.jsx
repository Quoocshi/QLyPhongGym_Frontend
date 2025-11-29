import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Header = ({ variant = 'default' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const storedUser = useMemo(() => {
    try {
      const s = localStorage.getItem('auth_user');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const displayUser = user || storedUser;
  const firstName = displayUser?.hoTen?.split(' ')[0] || displayUser?.username || null;

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Dịch vụ', href: '/services' },
    { name: 'Huấn luyện viên', href: '/trainers' },
    { name: 'Liên hệ', href: '/contact' },
  ];

  const headerClass = variant === 'transparent' 
    ? 'absolute top-0 left-0 right-0 z-50 bg-transparent'
    : 'bg-white shadow-lg';

  const textClass = variant === 'transparent' 
    ? 'text-white' 
    : 'text-gray-900';

  const logoTextClass = variant === 'transparent'
    ? 'text-white'
    : 'text-primary';

  return (
    <header className={`w-full transition-all duration-300 ${headerClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold ${logoTextClass} transition-colors duration-300`}>
                FitnessPro
              </span>
              <span className={`text-xs ${variant === 'transparent' ? 'text-orange-200' : 'text-orange-500'} font-medium`}>
                Gym & Fitness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`${textClass} hover:text-orange-500 font-medium transition-colors duration-300 relative group`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {displayUser ? (
              <>
                <Link
                  to="/user/home"
                  className={`px-4 py-2 text-sm ${textClass} hover:text-orange-500 font-medium transition-colors duration-300`}
                >
                  Xin chào, {firstName}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 ${textClass} hover:text-orange-500 font-medium transition-colors duration-300`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${textClass} hover:bg-gray-100 transition-colors duration-300`}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-4 py-3 text-gray-900 hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 mt-4 pt-4 px-4 space-y-2">
                {displayUser ? (
                  <>
                    <Link
                      to="/user/home"
                      className="block w-full px-4 py-2 text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Xin chào, {firstName}
                    </Link>
                    <button
                      onClick={() => { setIsMenuOpen(false); logout(); navigate('/login'); }}
                      className="block w-full px-4 py-2 text-center bg-red-500 text-white rounded-lg font-medium transition-colors duration-300"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2 text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full px-4 py-2 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;