import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neo-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-neo-white tracking-tighter drop-shadow-[4px_4px_0_var(--shadow-color)]">PARCEL_OS</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
