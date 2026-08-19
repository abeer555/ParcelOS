import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="font-mono font-bold uppercase text-sm">{label}</label>}
        <select
          ref={ref}
          className={`px-4 py-2 border-4 border-neo-black rounded-none bg-neo-white focus:outline-none focus:ring-2 focus:ring-neo-yellow font-sans appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className="font-mono text-neo-red text-xs font-bold">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
