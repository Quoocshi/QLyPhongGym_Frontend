import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ArrowRight, CheckCircle, Clock, Users, Zap, Award, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Parallax Effect */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 pt-16 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Gym Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="text-center opacity-0 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              KIẾN TẠO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">VÓC DÁNG</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">MƠ ƯỚC</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Trang thiết bị hiện đại • Huấn luyện viên chuyên nghiệp • Lịch tập linh hoạt
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-bold rounded-xl text-white hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-300">
                Đăng nhập
              </Link>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 opacity-0 animate-fade-in-up delay-500">
            {[
              { number: '10K+', label: 'Thành viên' },
              { number: '50+', label: 'HLV chuyên nghiệp' },
              { number: '100+', label: 'Lớp học' },
              { number: '24/7', label: 'Hoạt động' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features / Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 opacity-0 animate-fade-in-up">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase mb-2">Dịch vụ của chúng tôi</h2>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Tại sao chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Gym Việt</span>?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Trải nghiệm tập luyện đẳng cấp với đội ngũ chuyên nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Thiết bị Hiện đại',
                desc: 'Máy móc tập luyện hàng đầu và tạ tự do, được bảo trì thường xuyên.',
                color: 'from-orange-400 to-orange-600'
              },
              {
                icon: Users,
                title: 'PT Chuyên nghiệp',
                desc: 'Huấn luyện viên có chứng chỉ hướng dẫn với lộ trình riêng biệt.',
                color: 'from-blue-400 to-blue-600'
              },
              {
                icon: Clock,
                title: 'Lớp học Linh hoạt',
                desc: 'Tham gia Yoga, HIIT, Cardio. Đặt lịch dễ dàng qua website.',
                color: 'from-purple-400 to-purple-600'
              }
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="group relative p-8 bg-white rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="relative text-gray-600 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Additional Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: 'Chứng nhận Quốc tế', desc: 'Đạt chuẩn ISO về an toàn' },
              { icon: Target, title: 'Cam kết Kết quả', desc: 'Hoặc hoàn tiền 100%' },
              { icon: TrendingUp, title: 'Theo dõi Tiến độ', desc: 'App theo dõi thông minh' }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-primary transition-all duration-300 transform hover:scale-105">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 opacity-0 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Gói Thành Viên
            </h2>
            <p className="text-xl text-gray-600">
              Lựa chọn gói tập phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Cơ bản',
                price: '500k',
                popular: false,
                features: ['Sử dụng phòng gym', 'Tủ đồ cá nhân', 'Wi-Fi miễn phí', 'Hỗ trợ 24/7']
              },
              {
                name: 'Nâng cao',
                price: '1tr2',
                popular: true,
                features: ['Tất cả quyền lợi Cơ bản', 'Lớp nhóm không giới hạn', '1 buổi PT/tháng', 'Đồ uống miễn phí', 'Ưu tiên đặt lịch']
              },
              {
                name: 'Vip',
                price: '3tr',
                popular: false,
                features: ['Tất cả quyền lợi Nâng cao', 'PT không giới hạn', 'Chế độ dinh dưỡng riêng', 'Massage & Spa', 'Phòng tập riêng']
              }
            ].map((plan, idx) => (
              <div key={idx} className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 ${plan.popular ? 'ring-4 ring-primary scale-105 md:scale-110' : 'hover:shadow-2xl'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-sm font-bold">
                    🔥 PHỔ BIẾN NHẤT
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? 'pt-16' : 'pt-8'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="ml-2 text-xl text-gray-500">/tháng</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white'
                  }`}>
                    Chọn gói {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 opacity-0 animate-fade-in-up">
            Sẵn sàng thay đổi bản thân?
          </h2>
          <p className="text-xl text-orange-100 mb-10 opacity-0 animate-fade-in-up delay-200">
            Tham gia ngay hôm nay và nhận ưu đãi đặc biệt cho thành viên mới!
          </p>
          <Link to="/register" className="inline-flex items-center px-10 py-5 bg-white text-primary font-bold text-lg rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl opacity-0 animate-fade-in-up delay-300">
            Đăng ký miễn phí
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;