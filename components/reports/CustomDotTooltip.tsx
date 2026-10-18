import React from 'react';
import { CHART_SEMANTIC } from './chartPalette';

interface CustomDotTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    fill?: string;
    stroke?: string;
    dataKey?: string;
    unit?: string;
  }>;
  label?: string;
  defaultUnit?: string;
}

export const CustomDotTooltip: React.FC<CustomDotTooltipProps> = ({
  active,
  payload,
  label,
  defaultUnit = '件'
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs min-w-[140px] pointer-events-none">
      {label && (
        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/80 pb-1.5 mb-2 truncate max-w-[200px]" title={label}>
          {label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const rawVal = entry.value;
          const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal);
          const isNum = !isNaN(numVal);
          const displayVal = isNum ? numVal.toLocaleString() : (rawVal ?? '-');
          const unit = entry.unit || (entry.name && entry.name.includes('率') ? '%' : entry.name && entry.name.includes('金额') ? '元' : defaultUnit);
          const dotColor = entry.color || entry.fill || entry.stroke || CHART_SEMANTIC.inService;

          return (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="truncate max-w-[120px]" title={entry.name}>
                  {entry.name || '数值'}:
                </span>
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white shrink-0">
                {displayVal}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">
                  {unit}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
