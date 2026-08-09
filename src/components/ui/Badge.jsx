import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: "bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/25",
    success: "bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/25",
    warning: "bg-[#ffa42b]/15 text-[#ffa42b] border border-[#ffa42b]/25",
    error: "bg-[#f3727f]/15 text-[#f3727f] border border-[#f3727f]/25",
    outline: "border border-[#4d4d4d] text-[#b3b3b3]",
    secondary: "bg-[#252525] text-[#b3b3b3] border border-[#4d4d4d]",
  };

  return (
    <div
      className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-[10.5px] font-semibold capitalize tracking-normal ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
