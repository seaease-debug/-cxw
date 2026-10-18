
import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';
import { IconButton } from './ui/IconButton';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: if used outside provider, fall back to console
    const showToast = (msg: string, type?: ToastType) => { if (import.meta.env.DEV) console.log(`[${type || 'info'}] ${msg}`); };
    return {
      showToast,
      success: (msg: string) => showToast(msg, 'success'),
      error: (msg: string) => showToast(msg, 'error'),
      info: (msg: string) => showToast(msg, 'info'),
      warning: (msg: string) => showToast(msg, 'warning'),
    };
  }
  return ctx;
};

const TYPE_STYLES: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800', icon: <Check className="w-3.5 h-3.5" /> },
  error: { bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800', icon: <X className="w-3.5 h-3.5" /> },
  info: { bg: 'bg-teal-50 dark:bg-teal-950/80 border-teal-200 dark:border-teal-800', icon: <Info className="w-3.5 h-3.5" /> },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const TEXT_COLORS: Record<ToastType, string> = {
  success: 'text-emerald-700 dark:text-emerald-200',
  error: 'text-rose-700 dark:text-rose-200',
  info: 'text-teal-700 dark:text-teal-200',
  warning: 'text-amber-700 dark:text-amber-200',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  info: 'bg-teal-500 text-white',
  warning: 'bg-amber-500 text-white',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const contextValue = useMemo(() => ({
    showToast,
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
    warning: (msg: string) => showToast(msg, 'warning'),
  }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[var(--z-toast)] flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => {
          const style = TYPE_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 min-w-[300px] max-w-[420px] transition-all duration-300 ${
                toast.exiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'
              } ${style.bg}`}
              role="alert"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`}>
                {style.icon}
              </span>
              <p className={`text-xs font-semibold leading-relaxed flex-1 ${TEXT_COLORS[toast.type]}`}>
                {toast.message}
              </p>
              <IconButton
                icon={<X className="w-3.5 h-3.5" />}
                label="关闭通知"
                onClick={() => removeToast(toast.id)}
                className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 ml-2 p-0 h-auto"
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
