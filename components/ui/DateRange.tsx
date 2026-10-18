import React from 'react';
import { X } from 'lucide-react';

export interface DateRangeProps {
  start: string;
  end: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onClear?: () => void;
  className?: string;
  startAriaLabel?: string;
  endAriaLabel?: string;
}

export const DateRange: React.FC<DateRangeProps> = ({
  start,
  end,
  onStartChange,
  onEndChange,
  onClear,
  className = '',
  startAriaLabel = '起始日期',
  endAriaLabel = '结束日期',
}) => {
  const hasValue = Boolean(start || end);

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-field rounded-lg px-2.5 py-2 text-xs transition-all duration-200 ${className}`.trim()}
    >
      <input
        type="date"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        aria-label={startAriaLabel}
        className="bg-transparent text-slate-800 dark:text-slate-200 text-xs cursor-pointer outline-none font-semibold"
      />
      <span className="text-slate-400 font-bold select-none">~</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        aria-label={endAriaLabel}
        className="bg-transparent text-slate-800 dark:text-slate-200 text-xs cursor-pointer outline-none font-semibold"
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="清除日期区间"
          title="清除日期区间"
          className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
