import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LogOut,
  Home,
  Calendar,
  Clipboard,
  User,
  ShoppingCart,
  Settings,
  Bell,
  Search,
  Menu as MenuIcon,
  X,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { authService } from "../services/authService.js";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const menu = [
  {
    to: "/user/home",
    label: "Trang cá nhân",
    icon: Home,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    to: "/user/dich-vu-cua-toi",
    label: "Dịch vụ của tôi",
    icon: Clipboard,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    to: "/user/lich-tap",
    label: "Lịch tập",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    to: "/user/cart",
    label: "Giỏ hàng",
    icon: ShoppingCart,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    to: "/user/profile",
    label: "Thông tin cá nhân",
    icon: User,
    gradient: "from-gray-500 to-gray-700",
  },
];

const UserLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const firstName = user?.hoTen?.split(" ")[0] || "Bạn";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Overlay mobile khi mở sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* ============ SIDEBAR ============ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* Header brand + user */}
          <div className="relative p-6 bg-gradient-to-b from-orange-500 to-orange-600 overflow-hidden">
            <div className="absolute -top-16 -right-10 w-44 h-44 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />

            {/* Brand */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">GYM VIỆT</p>
                  <p className="text-orange-100 text-xs">Thành viên VIP</p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User box */}
            <div className="relative mt-5">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-100 flex items-center justify-center text-white font-bold text-lg">
                      {user?.hoTen
                        ? user.hoTen
                            .split(" ")
                            .slice(-2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                        : "NV"}
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.hoTen || "Nguyễn Văn A"}
                    </p>
                    <p className="text-xs text-orange-100 truncate">
                      {user?.email || "demo@gym.vn"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-orange-200`
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-md"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-2 rounded-xl transition-colors ${
                          isActive
                            ? "bg-white/20"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-semibold ${
                          isActive ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <Sparkles className="w-4 h-4 text-white/80 animate-pulse ml-auto" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-md hover:shadow-xl hover:from-red-600 hover:to-pink-700 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        {/* ❗ Quan trọng: bỏ lg:ml-64 để không cách xa sidebar nữa */}
        <div className="flex-1 flex flex-col">
          {/* Top header (Dashboard + search + icon) */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-6 py-3 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 lg:gap-6">
                {/* Toggle sidebar mobile */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>

                {/* Title + small nav */}
                <div>
                  <h1 className="text-2xl font-bold text-orange-600">
                    Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Chào mừng trở lại, {firstName}!
                  </p>
                </div>

                <nav className="hidden md:flex items-center ml-2 text-sm">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      }`
                    }
                  >
                    Trang chủ
                  </NavLink>
                  <NavLink
                    to="/services"
                    className={({ isActive }) =>
                      `ml-1 px-4 py-2 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      }`
                    }
                  >
                    Dịch vụ
                  </NavLink>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:block relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>

                <button className="relative p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </button>

                <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </header>

          {/* CONTENT: padding nhỏ, sát sidebar hơn */}
          <main className="flex-1 px-4 lg:px-6 pb-6 pt-3 lg:pt-4 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
