import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "出现了一些问题",
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-center animate-in fade-in duration-500 ${className}`}>
      <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-5">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-base font-semibold text-rose-800 dark:text-rose-300 mb-2">{title}</h3>
      <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={16} className="mr-2" />
          重试
        </button>
      )}
    </div>
  );
};
