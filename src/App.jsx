import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { MyServicesProvider } from './contexts/MyServicesContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import UserSchedule from './pages/UserSchedule';
import PaymentRedirect from './pages/PaymentRedirect';
import PaymentStatus from './pages/PaymentStatus';
import RegisterService from './pages/RegisterService';
import MyServices from './pages/MyServices';
import TrainerHome from './pages/TrainerHome';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';
import UserLayout from './layout/UserLayout';
import ErrorPage from './pages/ErrorPage';

// Replace with your actual Google Client ID from Google Cloud Console
// You can also use environment variable: import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = "399696688602-sn7nflbtp9omc6uvh032ssegtfdq0laq.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <MyServicesProvider>
            <ToastProvider>
              <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/register-service" element={<RegisterService />} />
              <Route path="/trainer/home" element={<TrainerHome />} />

              {/* User routes with layout */}
              <Route path="/user" element={<UserLayout />}>
                <Route path="home" element={<UserHome />} />
                <Route path="dang-ky/service/:maDV" element={<ServiceDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="lich-tap" element={<UserSchedule />} />
                <Route path="dich-vu-cua-toi" element={<MyServices />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Legacy routes */}
              <Route path="/payment/:maHD" element={<PaymentRedirect />} />
              <Route path="/thanh-toan/:maHD" element={<PaymentStatus />} />
              <Route path="/user/dang-ky" element={<RegisterService />} />

              {/* Error pages */}
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
              </Router>
            </ToastProvider>
          </MyServicesProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;