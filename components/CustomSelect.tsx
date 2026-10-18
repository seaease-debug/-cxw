import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /**
   * 紧凑度令牌。
   * ★ 不要在 className 里写 py-1.5 / text-xs 再加**感叹号强制前缀**：Tailwind 的生成顺序
   *   `py-1.5`(46401) < `py-2`(46451) < `py-2.5`(46496) < `py-3`(46546)，
   *   即本组件自带的 py-3 **永远压过**调用方手写的 py-*，不加 `!` 就是静默失效。
   *   把尺寸收进令牌表，让「同一个属性只有一个来源」。
   */
  size?: 'sm' | 'md';
}

const selectSizeStyles = {
  sm: 'px-3 py-1.5 text-xs font-semibold',
  md: 'px-4 py-3 text-sm font-semibold',
} as const;

/** 尺寸类解析 —— 分支与默认值都放模块级：ESLint 把**默认参数**也算一个分支，
 *  写在 props 解构里会让组件复杂度 +1（原 10 → 11 就是 `size = "md"` 造成的）。 */
function resolveSelectSize(size?: 'sm' | 'md'): string {
  const key = size || 'md';
  return selectSizeStyles[key] || selectSizeStyles.md;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  disabled = false,
  className = "",
  placeholder = "请选择...",
  size,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number>(() => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    return options[0]?.value ?? "";
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(String(val));
    }
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for HTML form submissions */}
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border border-field rounded-lg text-left text-slate-800 dark:text-slate-200 flex justify-between items-center outline-none focus:border-brand-light dark:focus:border-brand-light transition-all duration-150 ${resolveSelectSize(size)} ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"
        } ${className}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-600 dark:text-slate-300" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl z-[var(--z-dropdown)] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand dark:text-brand-light" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
