import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService, authService } from '../services/api';
import {
    Users, UserPlus, LogOut, Sun, Moon,
    LayoutDashboard, Dumbbell, Shield, AlertCircle,
    Check, X, Eye, EyeOff, Plus, ChevronDown,
    CheckCircle, Search, Mail, Calendar, User, PackagePlus, DollarSign, Clock, Layers
} from 'lucide-react';

// Format date helper: YYYY-MM-DD -> DD/MM/YYYY
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Parse date helper: DD/MM/YYYY -> YYYY-MM-DD
const parseDate = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

const ManagerHome = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    // Dashboard stats (mock data for now, or fetch if API available)
    const [stats, setStats] = useState({
        trainers: 0,
        staff: 0,
        customers: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Class Modal State
    const [showClassModal, setShowClassModal] = useState(false);
    const [classFormData, setClassFormData] = useState({
        tenLop: '',
        maBM: '',
        maNV: '', // Trainer ID
        thoiHan: '30', // Default 30 days
        ngayBD: formatDate(new Date().toISOString().split('T')[0]),
        slToiDa: 20,
        moTa: '',
        ghiChu: ''
    });

    // Register Modal State
    const [showModal, setShowModal] = useState(false);
    const [boMonList, setBoMonList] = useState([]);
    const [nhanVienList, setNhanVienList] = useState([]);
    const [formData, setFormData] = useState({
        tenNV: '',
        email: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        ngayVaoLam: new Date().toISOString().split('T')[0],
        loaiNV: 'Trainer', // Default
        username: '',
        password: '',
        maBM: ''
    });

    useEffect(() => {
        // In a real app, you would fetch dashboard stats here
        // internalFetchStats();
        fetchBoMon();
        fetchNhanVien();
    }, []);

    const fetchBoMon = async () => {
        try {
            const response = await managerService.getBoMonList();
            setBoMonList(response.data || response);
        } catch (err) {
            console.error('Failed to fetch BoMon', err);
        }
    };

    const fetchNhanVien = async () => {
        try {
            const response = await managerService.getAllNhanVien();
            setNhanVienList(response.data || response);
        } catch (err) {
            console.error('Failed to fetch NhanVien', err);
        }
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('auth_token');
            navigate('/login');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClassInputChange = (e) => {
        const { name, value } = e.target;
        setClassFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            // Validation basic
            if (!formData.username || !formData.password || !formData.tenNV || !formData.email) {
                throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
            }

            if (formData.loaiNV === 'Trainer' && !formData.maBM) {
                throw new Error('Vui lòng chọn Công việc chuyên môn (Bộ môn) cho Trainer');
            }

            const payload = {
                ...formData,
                ngaySinh: formatDate(formData.ngaySinh),
                ngayVaoLam: formatDate(formData.ngayVaoLam)
            };

            const response = await managerService.addNhanVien(payload);
            setSuccessMsg(response.message || 'Thêm nhân viên thành công!');
            setShowModal(false);
            // Reset form
            setFormData({
                tenNV: '',
                email: '',
                ngaySinh: '',
                gioiTinh: 'Nam',
                ngayVaoLam: new Date().toISOString().split('T')[0],
                loaiNV: 'Trainer',
                username: '',
                password: '',
                maBM: ''
            });

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi thêm nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!classFormData.tenLop || !classFormData.maBM || !classFormData.maNV || !classFormData.ngayBD || !classFormData.slToiDa) {
                throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm Trainer)');
            }

            const payload = {
                ...classFormData,
                ngayBD: parseDate(classFormData.ngayBD) // Convert dd/MM/yyyy to yyyy-MM-dd for backend
            };

            console.log('🔍 Payload gửi đến backend:', payload);
            console.log('🔍 maNV:', payload.maNV);

            const response = await managerService.addLop(payload);
            setSuccessMsg(response.message || 'Tạo lớp thành công!');
            setShowClassModal(false);
            // Reset form
            setClassFormData({
                tenLop: '',
                maBM: '',
                maNV: '',
                thoiHan: '30',
                ngayBD: formatDate(new Date().toISOString().split('T')[0]),
                slToiDa: 20,
                moTa: '',
                ghiChu: ''
            });

        } catch (err) {
            console.error('Class creation error:', err);
            setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi tạo lớp');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`} style={{
            background: isDarkMode
                ? 'linear-gradient(to bottom right, #111827, #1F2937, #111827)'
                : 'linear-gradient(to bottom right, #E0E7FF, #EEF2FF, #E0E7FF)'
        }}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-blue-100'} shadow-lg border-b sticky top-0 z-10`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Manager Dashboard
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Quản lý hệ thống Gym
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleDarkMode}
                                className={`p-3 rounded-xl transition-all ${isDarkMode
                                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isDarkMode
                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                            >
                                <LogOut className="w-5 h-5" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tổng quan</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chào mừng bạn quay trở lại! Dưới đây là tình hình hoạt động hôm nay.</p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        Đăng ký Nhân Viên
                    </button>
                    <button
                        onClick={() => setShowClassModal(true)}
                        className="ml-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all active:scale-95"
                    >
                        <PackagePlus className="w-5 h-5" />
                        Tạo Lớp Mới
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Trainer', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { label: 'Staff (Lễ tân)', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { label: 'Doanh thu tháng', icon: LayoutDashboard, color: 'text-green-500', bg: 'bg-green-500/10' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-white'} border backdrop-blur-xl p-6 rounded-2xl shadow-xl`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <span className={`text-sm font-medium px-2 py-1 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    Tháng này
                                </span>
                            </div>
                            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                --
                            </div>
                            <div className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Messages */}
                {successMsg && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium">{successMsg}</span>
                        <button onClick={() => setSuccessMsg('')} className="ml-auto p-1 hover:bg-black/5 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                )}
                {error && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium">{error}</span>
                        <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-black/5 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-2xl transform transition-all scale-100 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
                        {/* Modal Header */}
                        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                <UserPlus className="w-5 h-5 text-blue-500" />
                                Thêm Nhân Viên Mới
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Account Info Section */}
                                <div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                                        Thông tin tài khoản
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                    }`}
                                                placeholder="Nhập username"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password <span className="text-red-500">*</span></label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                    }`}
                                                placeholder="Nhập password"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Info Section */}
                                <div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                                        Thông tin cá nhân
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Họ và tên <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="text"
                                                    name="tenNV"
                                                    value={formData.tenNV}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                        }`}
                                                    placeholder="Nguyễn Văn A"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                        }`}
                                                    placeholder="email@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ngày sinh</label>
                                            <input
                                                type="date"
                                                name="ngaySinh"
                                                value={formData.ngaySinh}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                    }`}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Giới tính</label>
                                            <select
                                                name="gioiTinh"
                                                value={formData.gioiTinh}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nu">Nữ</option>
                                                <option value="Khac">Khác</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Info Section */}
                                <div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                                        Thông tin công việc
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vai trò (Role) <span className="text-red-500">*</span></label>
                                            <select
                                                name="loaiNV"
                                                value={formData.loaiNV}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="Trainer">Trainer (Huấn luyện viên)</option>
                                                <option value="LeTan">Staff (Lễ tân/Nhân viên)</option>
                                                {/* QuanLy is usually not registered here, but can be added if needed */}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Trainer mã bắt đầu bằng <b>PT</b>. Staff mã bắt đầu bằng <b>NV</b>.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ngày vào làm</label>
                                            <div className="relative">
                                                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="date"
                                                    name="ngayVaoLam"
                                                    value={formData.ngayVaoLam}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Special fields for Trainer */}
                                        {formData.loaiNV === 'Trainer' && (
                                            <>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chuyên môn (Bộ môn) <span className="text-red-500">*</span></label>
                                                    <select
                                                        name="maBM"
                                                        value={formData.maBM}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/50 focus:border-blue-500'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                                                            }`}
                                                        required
                                                    >
                                                        <option value="">-- Chọn bộ môn --</option>
                                                        {boMonList.map(bm => (
                                                            <option key={bm.maBM} value={bm.maBM}>
                                                                {bm.tenBM}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 px-6 -mx-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className={`px-6 py-2.5 rounded-xl font-medium transition-all ${isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Đăng ký
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Class Creation Modal */}
            {showClassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-2xl transform transition-all scale-100 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
                        {/* Modal Header */}
                        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                <PackagePlus className="w-5 h-5 text-emerald-500" />
                                Tạo Lớp Mới
                            </h3>
                            <button
                                onClick={() => setShowClassModal(false)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <form onSubmit={handleClassSubmit} className="space-y-6">

                                {/* Basic Info */}
                                <div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                                        Thông tin lớp học
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tên Lớp <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="tenLop"
                                                value={classFormData.tenLop}
                                                onChange={handleClassInputChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                    }`}
                                                placeholder="VD: Yoga Cơ Bản Sáng 2-4-6"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bộ Môn <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Layers className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <select
                                                    name="maBM"
                                                    value={classFormData.maBM}
                                                    onChange={handleClassInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                        }`}
                                                    required
                                                >
                                                    <option value="">-- Chọn bộ môn --</option>
                                                    {boMonList
                                                        .filter(bm => ['Yoga', 'Zumba', 'Bơi', 'Boi'].includes(bm.tenBM))
                                                        .map(bm => (
                                                            <option key={bm.maBM} value={bm.maBM}>
                                                                {bm.tenBM}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Trainer <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <select
                                                    name="maNV"
                                                    value={classFormData.maNV}
                                                    onChange={handleClassInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                        }`}
                                                    required
                                                    disabled={!classFormData.maBM}
                                                >
                                                    <option value="">-- Chọn Trainer --</option>
                                                    {nhanVienList
                                                        .filter(nv => nv.loaiNV === 'Trainer' && nv.maBM === classFormData.maBM)
                                                        .map(trainer => (
                                                            <option key={trainer.maNV} value={trainer.maNV}>
                                                                {trainer.tenNV} ({trainer.maNV})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            {!classFormData.maBM && (
                                                <p className="text-xs text-yellow-600 mt-1">Vui lòng chọn Bộ môn trước</p>
                                            )}
                                            {classFormData.maBM && nhanVienList.filter(nv => nv.loaiNV === 'Trainer' && nv.maBM === classFormData.maBM).length === 0 && (
                                                <p className="text-xs text-red-600 mt-1">Không có Trainer nào cho bộ môn này</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Thời hạn (Ngày) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <select
                                                    name="thoiHan"
                                                    value={classFormData.thoiHan}
                                                    onChange={handleClassInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                        }`}
                                                    required
                                                >
                                                    <option value="1">1 ngày</option>
                                                    <option value="7">7 ngày</option>
                                                    <option value="30">30 ngày</option>
                                                    <option value="90">90 ngày</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ngày bắt đầu (dd/mm/yyyy) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="date"
                                                    name="ngayBD"
                                                    value={classFormData.ngayBD}
                                                    onChange={handleClassInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                        }`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Số lượng tối đa <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <input
                                                    type="number"
                                                    name="slToiDa"
                                                    value={classFormData.slToiDa}
                                                    onChange={handleClassInputChange}
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                        }`}
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mô tả</label>
                                            <textarea
                                                name="moTa"
                                                value={classFormData.moTa}
                                                onChange={handleClassInputChange}
                                                rows="3"
                                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500/50 focus:border-emerald-500'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                    }`}
                                                placeholder="Mô tả về lớp học..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 px-6 -mx-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowClassModal(false)}
                                        className={`px-6 py-2.5 rounded-xl font-medium transition-all ${isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <PackagePlus className="w-5 h-5" />
                                                Tạo Lớp
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerHome;

