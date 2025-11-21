import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { ArrowLeft, Check, X, Eye, EyeOff, Dumbbell, Sparkles, UserPlus } from 'lucide-react';
import { useState } from 'react';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password", "");

  const hasMinLength = password.length >= 6;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  // Convert date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const onSubmit = async (data) => {
    if (!hasMinLength || !hasLowerCase || !hasUpperCase || !hasNumber) {
        return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.register({
        fullName: data.fullName,
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        username: data.username,
        gender: data.gender,
        dob: formatDate(data.dob), // Convert to DD/MM/YYYY
        address: data.address
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        {/* Left Side - Image */}
        <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-800">
              <img
                className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-70 animate-ken-burns"
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1475&q=80"
                alt="Gym background"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-slide-up">
                <div className="max-w-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/50 to-transparent"></div>
                  </div>
                  <h2 className="text-5xl font-bold mb-4 leading-tight">
                    Sức khỏe là<br/>
                    <span className="text-orange-300">Tài sản quý giá nhất.</span>
                  </h2>
                  <p className="text-xl text-orange-100 leading-relaxed mb-8">
                    Tham gia cùng cộng đồng hơn 10,000 thành viên đã thay đổi cuộc sống.
                  </p>
                  
                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[
                      { label: 'Chuyên nghiệp', value: '100%' },
                      { label: 'Uy tín', value: '5⭐' },
                      { label: 'Bảo mật', value: 'SSL' }
                    ].map((badge, idx) => (
                      <div key={idx} className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <div className="text-2xl font-bold text-white">{badge.value}</div>
                        <div className="text-xs text-orange-200 mt-1">{badge.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-start py-12 px-4 sm:px-6 lg:px-20 xl:px-24 w-full lg:w-1/2 overflow-y-auto max-h-screen relative z-10">
            <div className="w-full max-w-md mx-auto">
                <div className="mb-8 opacity-0 animate-fade-in-up">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary transition-all duration-300 group mb-8">
                        <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-2 transition-transform duration-300" />
                        <span className="font-medium group-hover:text-primary">Về Trang chủ</span>
                    </Link>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="relative">
                          <Dumbbell className="h-12 w-12 text-primary animate-bounce-slow" />
                          <Sparkles className="h-5 w-5 text-orange-400 absolute -top-1 -right-1 animate-ping" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900">Đăng Ký</h2>
                    </div>
                    <p className="text-gray-600">
                        Bắt đầu hành trình thay đổi của bạn ngay hôm nay
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-shake" role="alert">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 opacity-0 animate-fade-in-up delay-200">
                  <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                          <span className="text-sm font-medium text-gray-700">Thông tin cá nhân</span>
                        </div>
                        <div className="flex-1 h-px bg-gray-300 mx-3"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">2</div>
                          <span className="text-sm font-medium text-gray-500">Tài khoản</span>
                        </div>
                      </div>
                      
                      {/* Họ và tên */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <input
                              id="fullName"
                              type="text"
                              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                              placeholder="Nhập họ tên đầy đủ"
                              {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                          />
                          {errors.fullName && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.fullName.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          {/* Giới tính */}
                          <div className="transform transition-all duration-300 hover:scale-[1.01]">
                              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                                Giới tính <span className="text-red-500">*</span>
                              </label>
                              <select
                                  id="gender"
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                                  {...register('gender', { required: 'Vui lòng chọn giới tính' })}
                              >
                                  <option value="">-- Chọn giới tính --</option>
                                  <option value="Nam">Nam</option>
                                  <option value="Nữ">Nữ</option>
                                  <option value="Khác">Khác</option>
                              </select>
                              {errors.gender && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.gender.message}</p>}
                          </div>

                          {/* Ngày sinh */}
                          <div className="transform transition-all duration-300 hover:scale-[1.01]">
                              <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
                                Ngày sinh <span className="text-red-500">*</span>
                              </label>
                              <input
                                  id="dob"
                                  type="date"
                                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                                  {...register('dob', { required: 'Vui lòng chọn ngày sinh' })}
                              />
                              {errors.dob && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.dob.message}</p>}
                          </div>
                      </div>

                      {/* Số điện thoại */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                            Số điện thoại <span className="text-red-500">*</span>
                          </label>
                          <input
                              id="phone"
                              type="tel"
                              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                              placeholder="VD: 0901234567"
                              {...register('phone', { 
                                  required: 'Vui lòng nhập số điện thoại',
                                  pattern: {
                                      value: /^[0-9]{10,11}$/,
                                      message: "Số điện thoại không hợp lệ"
                                  }
                              })}
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.phone.message}</p>}
                      </div>

                      {/* Email */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                              id="email"
                              type="email"
                              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                              placeholder="your-email@example.com"
                              {...register('email', { 
                                  required: 'Vui lòng nhập Email',
                                  pattern: {
                                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                      message: "Email không hợp lệ"
                                  }
                              })}
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.email.message}</p>}
                      </div>

                      {/* Địa chỉ */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                            Địa chỉ <span className="text-red-500">*</span>
                          </label>
                          <input
                              id="address"
                              type="text"
                              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                              placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
                              {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                          />
                          {errors.address && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.address.message}</p>}
                      </div>
                      
                      <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t-2 border-gray-200" />
                          </div>
                          <div className="relative flex justify-center">
                              <span className="px-4 bg-white text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                                <span>Thông tin tài khoản</span>
                              </span>
                          </div>
                      </div>

                      {/* Tên đăng nhập */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên đăng nhập <span className="text-red-500">*</span>
                          </label>
                          <input
                              id="username"
                              type="text"
                              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                              placeholder="VD: nguyenvana123"
                              {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
                          />
                          {errors.username && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.username.message}</p>}
                      </div>

                      {/* Mật khẩu */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                              <input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm pr-12"
                                  placeholder="Nhập mật khẩu mạnh"
                                  {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                              />
                              <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                  onClick={() => setShowPassword(!showPassword)}
                              >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                          </div>
                          
                          {/* Password Strength Indicators */}
                          <div className="mt-3 grid grid-cols-2 gap-2">
                              {[
                                { check: hasMinLength, label: 'Ít nhất 6 ký tự' },
                                { check: hasLowerCase, label: 'Chữ thường (a-z)' },
                                { check: hasUpperCase, label: 'Chữ HOA (A-Z)' },
                                { check: hasNumber, label: 'Số (0-9)' }
                              ].map((rule, idx) => (
                                <div key={idx} className={`flex items-center text-xs transition-all duration-300 ${rule.check ? 'scale-105' : ''}`}>
                                    {rule.check ? (
                                      <Check className="h-4 w-4 text-green-500 mr-1.5 animate-check-pop" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-400 mr-1.5" />
                                    )}
                                    <span className={rule.check ? 'text-green-700 font-medium' : 'text-gray-500'}>{rule.label}</span>
                                </div>
                              ))}
                          </div>
                      </div>

                      {/* Xác nhận mật khẩu */}
                      <div className="transform transition-all duration-300 hover:scale-[1.01]">
                          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                              <input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm pr-12"
                                  placeholder="Nhập lại mật khẩu"
                                  {...register('confirmPassword', { 
                                      required: 'Vui lòng xác nhận mật khẩu',
                                      validate: value => value === password || "Mật khẩu không khớp"
                                  })}
                              />
                              <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                          </div>
                          {errors.confirmPassword && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.confirmPassword.message}</p>}
                      </div>

                      <div className="pt-6">
                          <button
                              type="submit"
                              disabled={isLoading}
                              className="group w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-300"
                          >
                              {isLoading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  Tạo tài khoản
                                  <ArrowLeft className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform rotate-180" />
                                </>
                              )}
                          </button>
                          
                          <div className="mt-6 text-center">
                              <p className="text-sm text-gray-600">
                                  Đã có tài khoản?{' '}
                                  <Link to="/login" className="font-bold text-primary hover:text-orange-700 hover:underline transition-all duration-300">
                                      Đăng nhập ngay →
                                  </Link>
                              </p>
                          </div>
                      </div>
                  </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Register;