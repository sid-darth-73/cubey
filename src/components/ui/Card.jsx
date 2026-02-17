import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`glass-panel rounded-xl p-6 ${className}`}
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
  <h3 className="font-mont font-semibold leading-none tracking-tight text-lg md:text-xl" {...props}>
    {children}
  ,</h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`pt-0 ${className}`} {...props}>
    {children}
  </div>
);
