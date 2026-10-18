import React from 'react';

/**
 * 图标按钮：颜色 / 形状 / 尺寸全部由**具名令牌**决定，而不是让调用方在 className 里
 * 手写长串工具类。
 *
 * 为什么这么改（2026-10-18）：
 * 本组件的 className 是朴素字符串拼接（未引入 tailwind-merge），调用方一旦传入与内部
 * 默认值**同属性**的工具类（如 hover:text-rose-600 撞 hover:text-slate-600），谁生效
 * 就完全取决于 Tailwind 的**生成顺序**——与传入先后无关。实测 rose-600 / amber-600
 * 都排在 slate-600 之前 ⇒ 所有「用另一色相做警示」的 hover 全部静默失效（变成灰色）。
 *
 * 修法不是加大优先级（`!` 前缀在设计红线里明令禁止），而是**让每个属性只有一个来源**：
 * tone 输出一整套颜色，shape 输出圆角，size 输出尺寸，三者互不重叠；className 只留给
 * 布局类（absolute / shrink-0 / border / bg 等）。
 */
export type IconButtonTone =
  | 'default'
  | 'danger'
  | 'dangerTint'
  | 'warning'
  | 'brand'
  | 'onDark'
  | 'onDarkDanger'
  | 'onBrand';

export type IconButtonShape = 'circle' | 'rounded';
export type IconButtonSize = 'xs' | 'sm' | 'md';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  className?: string;
  /** 语义色。默认 default（slate 中性灰）。 */
  tone?: IconButtonTone;
  /** 形状。默认 circle；表格内图标按钮用 rounded。 */
  shape?: IconButtonShape;
  /** 固定尺寸（xs 24 / sm 28 / md 32）。不传则沿用 6px 内边距的自适应尺寸。 */
  size?: IconButtonSize;
}

/** 每个 tone 都是一整套颜色，同一个属性绝不出现第二个来源。 */
const TONE_CLASS: Record<IconButtonTone, string> = {
  default:
    'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800',
  danger:
    'text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 dark:hover:text-rose-400 dark:hover:bg-rose-950/30',
  dangerTint:
    'text-rose-700 hover:bg-rose-100/70 dark:text-rose-400 dark:hover:bg-rose-950/60',
  warning:
    'text-slate-400 hover:text-amber-600 hover:bg-amber-50/60 dark:hover:text-amber-400 dark:hover:bg-amber-950/30',
  brand:
    'text-slate-400 hover:text-teal-600 hover:bg-teal-50/60 dark:hover:text-teal-400 dark:hover:bg-teal-950/30',
  onDark: 'text-slate-300 hover:text-white hover:bg-slate-800',
  onDarkDanger: 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40',
  onBrand: 'text-white hover:bg-white/20',
};

const SHAPE_CLASS: Record<IconButtonShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  xs: 'w-6 h-6 p-0',
  sm: 'w-7 h-7 p-0',
  md: 'w-8 h-8 p-0',
};

// 不承载任何颜色 / 圆角 / 尺寸，避免与上面三张表抢同一个属性。
const BASE_CLASS =
  'inline-flex items-center justify-center transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  className = '',
  tone = 'default',
  shape = 'circle',
  size,
  type = 'button',
  ...rest
}) => {
  const sizeClass = size ? SIZE_CLASS[size] : 'p-1.5';
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${BASE_CLASS} ${sizeClass} ${SHAPE_CLASS[shape]} ${TONE_CLASS[tone]} ${className}`.trim()}
      {...rest}
    >
      {icon}
    </button>
  );
};
