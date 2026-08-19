import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "border-2 border-neo-black bg-neo-white p-4 text-neo-black shadow-neo sm:p-5 lg:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
