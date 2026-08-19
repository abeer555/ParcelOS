import React, { useId } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-xs font-bold uppercase tracking-wide text-neo-black"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props["aria-describedby"]}
          className={cn(
            "h-11 w-full rounded-none border-2 border-neo-black bg-neo-white px-3 py-2 font-sans text-sm text-neo-black shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-neo-black/45 hover:bg-neo-gray/50 focus:bg-neo-white focus:outline-none focus:ring-3 focus:ring-neo-yellow focus:ring-offset-2 focus:ring-offset-neo-gray disabled:cursor-not-allowed disabled:bg-neo-muted disabled:text-neo-black/60",
            error && "border-neo-red focus:ring-neo-red",
            className,
          )}
          {...props}
        />
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

Input.displayName = "Input";
