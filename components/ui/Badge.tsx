import React from 'react';

export type BadgeTone = 'teal' | 'emerald' | 'amber' | 'rose' | 'slate';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  solid?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const toneStyles: Record<BadgeTone, string> = {
  teal: 'bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/40',
  emerald:
    'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
  amber:
    'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
  rose: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
  slate:
    'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'teal',
  solid = false,
  icon,
  children,
  className = '',
  ...rest
}) => {
  if (solid) {
    return (
      <span
        className={`bg-teal-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1 ${className}`.trim()}
        {...rest}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }

  const toneClass = toneStyles[tone] || toneStyles.teal;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold gap-1 ${toneClass} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
