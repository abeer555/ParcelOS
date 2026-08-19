import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const Table = ({ headers, children, className, label }: TableProps) => {
  return (
    <div
      className={cn(
        "max-w-full overflow-hidden border-2 border-neo-black bg-neo-white shadow-neo",
        className,
      )}
    >
      <div className="overflow-x-auto overscroll-x-contain">
        <table
          className="w-full min-w-max border-collapse text-left"
          aria-label={label}
        >
          <thead>
            <tr className="border-b-3 border-neo-black bg-neo-yellow font-mono text-xs font-bold uppercase tracking-wide text-neo-black">
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="whitespace-nowrap border-r-2 border-neo-black px-3 py-3 last:border-r-0 sm:px-4"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-sans text-sm text-neo-black [&_tr:last-child]:border-b-0">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};
