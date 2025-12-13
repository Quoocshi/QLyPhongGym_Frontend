import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// Types: 'success' | 'error' | 'info' | 'warning' | 'loading'
const TYPE_STYLES = {
  success: {
    icon: CheckCircle2,
    border: 'border-green-200',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    bar: 'bg-green-500',
    title: 'text-green-900',
  },
  error: {
    icon: AlertTriangle,
    border: 'border-red-200',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    bar: 'bg-red-500',
    title: 'text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-yellow-200',
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    bar: 'bg-yellow-500',
    title: 'text-yellow-900',
  },
  info: {
    icon: Info,
    border: 'border-slate-200',
    bg: 'bg-white',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    bar: 'bg-slate-500',
    title: 'text-slate-900',
  },
  loading: {
    icon: Loader2,
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    bar: 'bg-blue-500',
    title: 'text-blue-900',
  },
};

const genId = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));

/**
 * addToast({
 *   type: 'success'|'error'|'info'|'warning'|'loading',
 *   title?: string,
 *   message?: string,        // giữ tương thích cũ
 *   description?: string,    // mô tả thêm
 *   duration?: number,       // ms, 0 = không tự tắt
 *   action?: { label: string, onClick: () => void },
 * })
 */
export const ToastProvider = ({ children, maxToasts = 4 }) => {
  const [toasts, setToasts] = useState([]);

  // lưu timer theo id để clear đúng
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));

    // cho animation out chạy rồi mới remove hẳn
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }, 220);
  }, []);

  const addToast = useCallback(
    ({ message, title, description, type = 'info', duration = 3500, action } = {}) => {
      const id = genId();

      const tTitle = title || (type === 'success'
        ? 'Thành công'
        : type === 'error'
          ? 'Có lỗi xảy ra'
          : type === 'warning'
            ? 'Lưu ý'
            : type === 'loading'
              ? 'Đang xử lý'
              : 'Thông báo');

      const toast = {
        id,
        type,
        title: tTitle,
        description: description || message || '',
        duration,
        action,
        createdAt: Date.now(),
        leaving: false,
        paused: false,
        // progress animation
        progressKey: genId(),
        remaining: duration,
        startedAt: Date.now(),
      };

      setToasts((prev) => {
        const next = [toast, ...prev];
        // giới hạn số lượng toast
        return next.slice(0, maxToasts);
      });

      // auto-dismiss (trừ duration=0 hoặc loading)
      if (duration > 0 && type !== 'loading') {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [maxToasts, removeToast]
  );

  // update toast (đổi type/loading -> success, đổi text…)
  const updateToast = useCallback((id, patch = {}) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));

    // nếu đổi duration thì set timer mới
    if (patch.duration != null) {
      const existing = timersRef.current.get(id);
      if (existing) {
        clearTimeout(existing);
        timersRef.current.delete(id);
      }
      if (patch.duration > 0 && patch.type !== 'loading') {
        const timer = setTimeout(() => removeToast(id), patch.duration);
        timersRef.current.set(id, timer);
      }
    }
  }, [removeToast]);

  // clear all
  const clearToasts = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  // dọn timers khi unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ addToast, removeToast, updateToast, clearToasts }),
    [addToast, removeToast, updateToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 pointer-events-none"
      >
        <div className="flex flex-col items-end gap-3">
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              toast={t}
              onClose={() => removeToast(t.id)}
              onPause={(pause) => {
                // pause progress bar only (UI); timer vẫn chạy,
                // nếu bạn muốn pause timer thật thì nói mình sẽ nâng cấp thêm.
                setToasts(prev => prev.map(x => x.id === t.id ? { ...x, paused: pause, progressKey: pause ? x.progressKey : genId() } : x));
              }}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose, onPause }) => {
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={[
        'pointer-events-auto w-[360px] max-w-[92vw]',
        'rounded-2xl border shadow-xl overflow-hidden',
        style.border,
        style.bg,
        'backdrop-blur supports-[backdrop-filter]:bg-white/80',
        'transition-all duration-200',
        toast.leaving ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0',
        'animate-[toast-in_220ms_ease-out]',
      ].join(' ')}
      onMouseEnter={() => onPause(true)}
      onMouseLeave={() => onPause(false)}
      role="status"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={['shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', style.iconBg].join(' ')}>
            {toast.type === 'loading' ? (
              <Icon className={['w-5 h-5 animate-spin', style.iconColor].join(' ')} />
            ) : (
              <Icon className={['w-5 h-5', style.iconColor].join(' ')} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={['font-semibold leading-5', style.title].join(' ')}>
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-slate-600 leading-5 break-words">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {toast.action?.label && typeof toast.action?.onClick === 'function' ? (
              <div className="mt-3">
                <button
                  onClick={() => toast.action.onClick()}
                  className="text-sm font-semibold text-slate-800 hover:underline"
                >
                  {toast.action.label}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {toast.duration > 0 && toast.type !== 'loading' ? (
        <div className="h-1 w-full bg-black/5">
          <div
            key={toast.progressKey}
            className={[
              'h-full',
              style.bar,
              toast.paused ? '' : 'animate-[toast-progress_linear_forwards]',
            ].join(' ')}
            style={{
              // duration: ms
              animationDuration: `${toast.duration}ms`,
            }}
          />
        </div>
      ) : null}

      {/* Keyframes (Tailwind không có sẵn) */}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(18px) translateY(-6px); }
          to   { opacity: 1; transform: translateX(0) translateY(0); }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ToastProvider;
