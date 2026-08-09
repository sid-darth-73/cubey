import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-[#181818] rounded-lg p-6 ${className}`}
      style={{ boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    className={`text-[18px] font-semibold leading-[1.3] text-white ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`pt-0 ${className}`} {...props}>
    {children}
  </div>
);
