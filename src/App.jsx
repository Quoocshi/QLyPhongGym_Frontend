import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import UserSchedule from './pages/UserSchedule';
import PaymentRedirect from './pages/PaymentRedirect';
import PaymentStatus from './pages/PaymentStatus';
import RegisterService from './pages/RegisterService';

// Replace with your actual Google Client ID from Google Cloud Console
// You can also use environment variable: import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = "897272389729-2f6rr2n8cuplr42ku0p7h3qrrg8mccpd.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user/lich-tap" element={<UserSchedule />} />
            <Route path="/payment/:maHD" element={<PaymentRedirect />} />
            <Route path="/thanh-toan/:maHD" element={<PaymentStatus />} />
            <Route path="/user/dang-ky" element={<RegisterService />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;