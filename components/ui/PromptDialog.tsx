import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

export interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
  inputType?: 'text' | 'number' | 'password' | 'email';
  placeholder?: string;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  title,
  message,
  defaultValue = '',
  onConfirm,
  onCancel,
  inputType = 'text',
  placeholder = '请输入内容...',
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with defaultValue when opening
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  // Keyboard accessibility: ESC to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Tab focus trap and focus input initially
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the input element initially after animation finishes
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const cleanedValue = value.trim();
    if (!cleanedValue) {
      setError('输入内容不能为空');
      return;
    }
    setError(null);
    onConfirm(cleanedValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCancel}
          />

          {/* Modal Panel Container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md overflow-hidden z-[var(--z-modal)] focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-dialog-title"
            tabIndex={-1}
          >
            {/* Header Content */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shrink-0">
                <HelpCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="prompt-dialog-title"
                  className="text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight"
                >
                  {title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline"
                aria-label="关闭弹窗"
              >
                <X size={16} />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type={inputType}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={placeholder}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                    error ? 'border-rose-500 focus:border-rose-500' : 'border-field focus:border-[var(--color-brand)]'
                  } rounded-lg text-sm font-sans font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/15 dark:focus:ring-brand-light/10 transition-all`}
                  autoComplete="off"
                />
                {error && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1" role="alert">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] rounded-lg transition-all shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  确定
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
