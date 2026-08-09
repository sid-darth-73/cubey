import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[12px] font-700 text-[#b3b3b3] mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          flex h-10 w-full rounded-lg
          px-3 py-2 text-sm text-white
          bg-[#1f1f1f]
          placeholder:text-[#b3b3b3]/50
          focus:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${error ? 'outline outline-1 outline-[#f3727f]' : ''}
          ${className}
        `}
        style={{
          boxShadow: error
            ? 'rgb(18,18,18) 0px 1px 0px, rgb(243,114,127) 0px 0px 0px 1px inset'
            : 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[#f3727f]">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';