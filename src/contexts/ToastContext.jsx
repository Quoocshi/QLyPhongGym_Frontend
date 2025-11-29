import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    const toast = { id, message, type };
    setToasts(t => [ ...t, toast ]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container (top-right) */}
      <div aria-live="polite" className="fixed top-4 right-4 pointer-events-none z-50">
        <div className="flex flex-col items-end space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`max-w-sm w-full pointer-events-auto bg-white shadow-lg rounded-lg p-4 border transform transition-all duration-300 ${t.type==='success'? 'border-green-200' : t.type==='error'? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{t.message}</p>
                </div>
                <div>
                  <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
