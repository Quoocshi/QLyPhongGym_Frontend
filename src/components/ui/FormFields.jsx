import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

export const InputField = ({ 
  label, 
  icon: Icon, 
  error, 
  type = 'text',
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="animate-fade-in-up">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={inputType}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3.5 bg-gray-50 border-2 rounded-xl transition-all focus:outline-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export const SelectField = ({ label, icon: Icon, error, options, ...props }) => {
  return (
    <div className="animate-fade-in-up">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <select
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-10 py-3.5 bg-gray-50 border-2 rounded-xl transition-all focus:outline-none appearance-none cursor-pointer ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
          }`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export const PasswordStrengthIndicator = ({ password }) => {
  const hasMinLength = password.length >= 6;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const checks = [
    { label: 'Ít nhất 6 ký tự', valid: hasMinLength },
    { label: 'Chữ thường (a-z)', valid: hasLowerCase },
    { label: 'Chữ hoa (A-Z)', valid: hasUpperCase },
    { label: 'Số (0-9)', valid: hasNumber }
  ];

  const validCount = checks.filter(c => c.valid).length;
  const strength = validCount === 0 ? 0 : (validCount / checks.length) * 100;

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < validCount
                ? validCount <= 1
                  ? 'bg-red-500'
                  : validCount <= 2
                  ? 'bg-yellow-500'
                  : validCount <= 3
                  ? 'bg-blue-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                check.valid ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              {check.valid && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={check.valid ? 'text-green-700' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
