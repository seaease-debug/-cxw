import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Tab key focus trap
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

    // Focus the first action button initially
    setTimeout(() => {
      // Prefer focusing the cancel button (safer default for danger/warning) or confirm button
      const defaultFocus = container.querySelector('[data-default-focus="true"]') as HTMLElement;
      if (defaultFocus) {
        defaultFocus.focus();
      } else {
        firstElement.focus();
      }
    }, 50);

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

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/10 focus-visible:outline-rose-600';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/10 focus-visible:outline-amber-600';
      case 'info':
      default:
        return 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] text-white shadow-lg shadow-emerald-700/10 focus-visible:outline-[var(--color-brand)]';
    }
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
            aria-labelledby="confirm-dialog-title"
            tabIndex={-1}
          >
            {/* Header Content with Icon */}
            <div className="flex items-start space-x-4">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h3
                  id="confirm-dialog-title"
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

            {/* Actions Footer */}
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                onClick={onCancel}
                data-default-focus={type === 'danger' ? 'true' : 'false'}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                data-default-focus={type !== 'danger' ? 'true' : 'false'}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${getConfirmButtonStyles()}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
