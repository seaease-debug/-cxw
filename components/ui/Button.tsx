import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /**
   * 仅图标按钮（正方形）。
   * ★ 必须用这个开关，不能在 className 里给 p-0 / w-7 h-7 加**感叹号强制前缀**：
   *   Tailwind 的生成顺序是 `p-0`(45314) < `px-3`(46020) 与 `py-1.5`(46401) < `py-3`(46546)，
   *   即 size 的 padding 永远压过手写的 p-0，不加强制前缀图标就会被压成 2px 宽。
   *   iconOnly 分支**不再输出** sizeStyles，从根上消除同属性竞争（同 B5-A 的 IconButton）。
   */
  iconOnly?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-brand text-white font-medium shadow-sm hover:bg-brand/90',
  secondary:
    'bg-white dark:bg-slate-800 border border-field text-slate-800 dark:text-slate-100 font-medium shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700',
  danger: 'bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-700',
  ghost: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium',
  link: 'text-teal-600 hover:underline font-medium p-0 h-auto bg-transparent border-none shadow-none active:scale-100',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 h-9 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

/** 仅图标时的正方形尺寸 —— 与 size 一一对应，且**不含任何 padding 工具类**（p-0 是唯一来源） */
const iconOnlySizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'w-7 h-7 p-0',
  md: 'w-9 h-9 p-0',
  lg: 'w-11 h-11 p-0',
};

/**
 * 尺寸类解析 —— 分支集中放在模块级。
 * ★ ESLint 的 complexity 按**函数**计 AST 分支节点，写在组件体里会把复杂度记到组件头上；
 *   抽成模块级小函数后组件本体回到 0 分支（比改造前的 `sizeStyles[size] || ` 还低）。
 */
function resolveSizeClass(
  size: NonNullable<ButtonProps['size']>,
  isLink: boolean,
  iconOnly: boolean,
): string {
  if (isLink) return '';
  if (iconOnly) return iconOnlySizes[size] || iconOnlySizes.md;
  return sizeStyles[size] || sizeStyles.md;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) => {
  const isLink = variant === 'link';
  const baseClasses = isLink
    ? 'inline-flex items-center justify-center gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
    : 'rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClass = resolveSizeClass(size, isLink, iconOnly);
  const variantClass = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
};
