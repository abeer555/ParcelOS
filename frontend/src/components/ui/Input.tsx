import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="font-mono font-bold uppercase text-sm">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'px-4 py-2 border-4 border-neo-black rounded-none bg-neo-white focus:outline-none focus:ring-2 focus:ring-neo-yellow font-sans',
            error && 'border-neo-red focus:ring-neo-red',
            className
          )}
          {...props}
        />
        {error && <span className="font-mono text-neo-red text-xs font-bold">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
