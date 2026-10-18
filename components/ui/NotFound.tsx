import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onBackToHome?: () => void;
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ onBackToHome, message }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
      <FileQuestion size={36} className="text-slate-400" />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">页面未找到</h1>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
      {message || '您访问的页面不存在或已被移除。请检查链接是否正确，或返回首页。'}
    </p>
    {onBackToHome && (
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        <ArrowLeft size={18} />
        <span>返回资产管理</span>
      </button>
    )}
  </div>
);
