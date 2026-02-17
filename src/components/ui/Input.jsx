import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main 
          placeholder:text-text-muted/50 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';