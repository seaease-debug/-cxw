import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500 ${className}`}>
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-slate-900 dark:bg-slate-700 hover:bg-brand text-white rounded-lg font-semibold text-sm shadow-lg shadow-slate-200/50 dark:shadow-none transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
