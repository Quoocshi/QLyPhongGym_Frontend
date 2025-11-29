import { Dumbbell, Sparkles } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default', message = 'Đang tải...', variant = 'primary' }) => {
  const sizeClasses = {
    small: { container: 'w-12 h-12', icon: 'w-6 h-6', border: 'border-4' },
    default: { container: 'w-24 h-24', icon: 'w-10 h-10', border: 'border-8' },
    large: { container: 'w-32 h-32', icon: 'w-16 h-16', border: 'border-8' }
  };

  const variantClasses = {
    primary: {
      border: 'border-orange-200',
      borderTop: 'border-primary',
      icon: 'text-primary'
    },
    dark: {
      border: 'border-orange-200/20',
      borderTop: 'border-primary',
      icon: 'text-primary'
    }
  };

  const s = sizeClasses[size];
  const v = variantClasses[variant];
  const Icon = variant === 'dark' ? Sparkles : Dumbbell;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${s.container}`}>
        <div className={`absolute inset-0 rounded-full ${s.border} ${v.border}`}></div>
        <div className={`absolute inset-0 rounded-full ${s.border} ${v.borderTop} border-t-transparent animate-spin`}></div>
        <Icon className={`absolute inset-0 m-auto ${s.icon} ${v.icon} animate-pulse`} />
      </div>
      {message && (
        <p className={`mt-6 font-medium ${variant === 'dark' ? 'text-white text-2xl' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ message, variant = 'primary' }) => {
  const bgClass = variant === 'dark' 
    ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-gray-50 to-gray-100';

  return (
    <div className={`flex items-center justify-center min-h-screen ${bgClass}`}>
      <LoadingSpinner size="large" message={message} variant={variant} />
    </div>
  );
};
