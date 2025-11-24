import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Home, Calendar, CreditCard, Clipboard, MapPin, User } from 'lucide-react';

const menu = [
  { to: '/user/home', label: 'Trang chủ', icon: Home },
  { to: '/user/dang-ky', label: 'Đăng ký dịch vụ', icon: Clipboard },
  { to: '/user/lich-tap', label: 'Xem lịch tập', icon: Calendar },
  { to: '/user/thanh-toan', label: 'Thanh toán', icon: CreditCard },
  { to: '/user/dich-vu-cua-toi', label: 'Dịch vụ của tôi', icon: User },
  { to: '/user/theo-doi-khu-vuc', label: 'Theo dõi khu vực', icon: MapPin }
];

const UserLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-6 border-b">
          <div className="text-xl font-bold">KHÁCH HÀNG</div>
          <div className="text-sm text-gray-500 mt-1">Xin chào</div>
        </div>

        <nav className="p-4 space-y-1">
          {menu.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded ${isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Icon className="w-4 h-4"/>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded">
            <LogOut className="w-4 h-4"/> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
