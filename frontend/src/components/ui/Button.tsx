import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "success" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseStyles =
      "inline-flex min-h-10 items-center justify-center gap-2 border-2 border-neo-black px-4 py-2 font-mono text-sm font-bold uppercase leading-none shadow-neo-sm neo-interactive hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-neo-yellow disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-x-0.5 disabled:translate-y-0.5";

    const variants = {
      primary: "bg-neo-yellow text-neo-black hover:bg-neo-yellow/85",
      danger: "bg-neo-red text-neo-white hover:bg-neo-red/85",
      success: "bg-neo-green text-neo-white hover:bg-neo-green/85",
      outline: "bg-neo-white text-neo-black hover:bg-neo-gray",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
