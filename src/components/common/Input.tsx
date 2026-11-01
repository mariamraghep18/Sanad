import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isLtr?: boolean;
  badge?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  isLtr = false,
  badge,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();

  return (
    <div className="w-full space-y-1.5">
      {(label || badge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="block text-xs font-semibold text-[#0F172A]">
              {label}
            </label>
          )}
          {badge && <div>{badge}</div>}
        </div>
      )}
      <input
        ref={ref}
        id={inputId}
        dir={isLtr ? 'ltr' : 'rtl'}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-[10px] min-h-[44px] transition-colors
          ${isLtr ? 'text-left font-mono' : 'text-right'}
          ${error 
            ? 'border-[#B91C1C] text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]' 
            : 'border-[#E2E8F0] text-[#0F172A] focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5]'}
          focus:outline-none placeholder:text-[#94A3B8] disabled:bg-slate-50 disabled:text-slate-400
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[#B91C1C] font-medium flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#64748B]">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
