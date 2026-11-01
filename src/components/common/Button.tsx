import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF5] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[38px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  }[size];

  const variantStyles = {
    primary: 'bg-[#6D5EF5] text-white hover:bg-[#5C4DE3] active:bg-[#4C3DD1] shadow-sm',
    secondary: 'bg-[#0F766E] text-white hover:bg-[#0D655E] active:bg-[#0B544E] shadow-sm',
    outline: 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 active:bg-slate-100',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D]',
    ghost: 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
      ) : icon ? (
        <span className="ml-2 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
