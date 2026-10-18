import React from 'react';

type BaseInputProps = {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
};

export type InputProps = BaseInputProps &
  (
    | ({ as?: 'input' } & React.InputHTMLAttributes<HTMLInputElement>)
    | ({ as: 'textarea' } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  as = 'input',
  className = '',
  id,
  ...rest
}) => {
  const generatedId = React.useId();
  const inputId = id || (label ? generatedId : undefined);

  const borderClass = error
    ? 'border-rose-500 focus:border-rose-500'
    : 'border-field focus:border-brand-light';

  const baseInputClasses = `w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all duration-200 ${borderClass}`;

  const renderField = () => {
    if (as === 'textarea') {
      const textareaProps = rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>;
      return (
        <textarea
          id={inputId}
          className={`${baseInputClasses} ${className}`.trim()}
          {...textareaProps}
        />
      );
    }

    const inputProps = rest as React.InputHTMLAttributes<HTMLInputElement>;
    const inputWithIconClasses = icon ? `pl-9 ${baseInputClasses}` : baseInputClasses;

    if (icon) {
      return (
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 flex items-center justify-center pointer-events-none">
            {icon}
          </span>
          <input
            id={inputId}
            className={`${inputWithIconClasses} ${className}`.trim()}
            {...inputProps}
          />
        </div>
      );
    }

    return (
      <input
        id={inputId}
        className={`${baseInputClasses} ${className}`.trim()}
        {...inputProps}
      />
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      {renderField()}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};
