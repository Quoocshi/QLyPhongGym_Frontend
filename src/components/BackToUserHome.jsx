import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const BackToUserHome = ({ className }) => {
  const navigate = useNavigate();
  return (
    <div className={className}>
      <button
        onClick={() => navigate('/user/home')}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
        aria-label="Quay về trang chủ"
      >
        <Home className="w-4 h-4 text-gray-700" />
        <span className="text-sm text-gray-700">Trang chủ</span>
      </button>
    </div>
  );
};

export default BackToUserHome;
