import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="font-mono text-xs font-bold uppercase tracking-wide text-neo-black"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : props["aria-describedby"]}
            className={cn(
              "h-11 w-full appearance-none rounded-none border-2 border-neo-black bg-neo-white py-2 pl-3 pr-10 font-sans text-sm text-neo-black transition-[border-color,box-shadow,background-color] hover:bg-neo-gray/50 focus:bg-neo-white focus:outline-none focus:ring-3 focus:ring-neo-yellow focus:ring-offset-2 focus:ring-offset-neo-gray disabled:cursor-not-allowed disabled:bg-neo-muted disabled:text-neo-black/60",
              error && "border-neo-red focus:ring-neo-red",
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={17}
            strokeWidth={2.5}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neo-black"
          />
        </div>
        {error && (
          <span
            id={errorId}
            role="alert"
            className="font-mono text-xs font-bold text-neo-red"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
