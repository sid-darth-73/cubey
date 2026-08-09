import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95";

  const variants = {
    // Dark pill — accent green background for primary CTA
    primary: "bg-primary text-black hover:bg-primary-hover",
    // Dark outlined pill — secondary actions
    secondary: "bg-surface-hover text-text-main hover:bg-border border border-border",
    // Ghost — transparent with text
    ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-surface-hover",
    // Danger
    danger: "bg-transparent text-[#f3727f] border border-[#f3727f]/40 hover:bg-[#f3727f]/10",
    // Outlined pill
    outline: "bg-transparent text-text-main border border-[#7c7c7c] hover:bg-surface-hover",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs rounded-full uppercase tracking-[1.4px]",
    md: "h-10 px-6 text-sm rounded-full uppercase tracking-[1.4px]",
    lg: "h-12 px-8 text-sm rounded-full uppercase tracking-[2px]",
    icon: "h-10 w-10 p-0 rounded-full",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};
