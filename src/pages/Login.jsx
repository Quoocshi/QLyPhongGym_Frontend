import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService, getRoleFromToken } from '../services/api';
import { Dumbbell, ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(data);
      const token = response.token || response.access_token; 
      if (token) {
        localStorage.setItem('auth_token', token);
        // Decode token to get role and redirect accordingly
        const role = getRoleFromToken(token);
        if (role === 'trainer') {
          navigate('/trainer/home');
        } else if (role === 'user') {
          navigate('/user/home');
        } else {
          // Fallback: default to user home
          navigate('/user/home');
        }
      } else {
         setError('Đăng nhập thất bại. Không nhận được token.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      const token = response.token || response.access_token;
      if (token) {
        localStorage.setItem('auth_token', token);
        // Decode token to get role and redirect accordingly
        const role = getRoleFromToken(token);
        if (role === 'trainer') {
          navigate('/trainer/home');
        } else if (role === 'user') {
          navigate('/user/home');
        } else {
          navigate('/user/home');
        }
      }
    } catch (err) {
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative z-10">
        {/* Back Button */}
        <Link to="/" className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-primary transition-all duration-300 font-medium group">
            <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="group-hover:text-primary">Về Trang chủ</span>
        </Link>

        <div className="mx-auto w-full max-w-md opacity-0 animate-fade-in-up">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex justify-center mb-6 transform hover:scale-110 transition-transform duration-300">
                <div className="relative">
                  <Dumbbell className="h-14 w-14 text-primary animate-bounce-slow" />
                  <Sparkles className="h-5 w-5 text-orange-400 absolute -top-1 -right-1 animate-ping" />
                </div>
            </Link>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Chào mừng trở lại! 👋
            </h2>
            <p className="text-gray-600">
              Đăng nhập để tiếp tục hành trình của bạn
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm shadow-md animate-shake" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  type="text"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                  placeholder="Nhập tên đăng nhập"
                  {...register('username', { 
                      required: 'Vui lòng nhập tên đăng nhập'
                  })}
                />
                {errors.username && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.username.message}</p>}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                 <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                    <a href="#" className="text-sm font-medium text-primary hover:text-orange-700 hover:underline transition-all duration-300">
                      Quên mật khẩu?
                    </a>
                 </div>
                <input
                  id="password"
                  type="password"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 sm:text-sm"
                  placeholder="••••••••"
                  {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.password.message}</p>}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-all duration-300"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-300"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </span>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center transform hover:scale-105 transition-transform duration-300">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        console.log('Login Failed');
                        setError('Đăng nhập Google thất bại');
                    }}
                    shape="pill"
                    size="large"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
              <p className="text-gray-600">
                  Bạn chưa có tài khoản?{' '}
                  <Link to="/register" className="font-bold text-primary hover:text-orange-700 hover:underline transition-all duration-300">
                      Đăng ký ngay →
                  </Link>
              </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700">
          <img
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80 animate-ken-burns"
            src="https://images.unsplash.com/photo-1540497077202-7c8a33801524?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Gym background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-slide-up">
            <div className="max-w-md">
              <h2 className="text-5xl font-bold mb-4 leading-tight">
                Không có áp lực,<br/>
                <span className="text-orange-300">Không có kim cương.</span>
              </h2>
              <p className="text-xl text-orange-100 leading-relaxed">
                Hãy bắt đầu hành trình thay đổi bản thân ngay hôm nay.
              </p>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-orange-400 border-2 border-white"></div>
                  ))}
                </div>
                <p className="text-sm text-orange-200">+10,000 thành viên đã tham gia</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;