import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-neo-white border-4 border-neo-black shadow-neo p-6 ${className}`}>
      {children}
    </div>
  );
};
