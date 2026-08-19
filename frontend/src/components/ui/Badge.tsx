import React from "react";
import { OrderStatus } from "@/types";

export const Badge = ({ status }: { status: OrderStatus | string }) => {
  const colors: Record<string, string> = {
    CREATED: "bg-neo-muted text-neo-black",
    CONFIRMED: "bg-neo-blue text-neo-white",
    ASSIGNED: "bg-neo-orange text-neo-black",
    PICKED_UP: "bg-neo-yellow text-neo-black",
    IN_TRANSIT: "bg-neo-blue text-neo-white",
    OUT_FOR_DELIVERY: "bg-neo-yellow text-neo-black",
    DELIVERED: "bg-neo-green text-neo-white",
    FAILED: "bg-neo-red text-neo-white",
    RESCHEDULED: "bg-neo-orange text-neo-black",
  };

  const colorClass = colors[status] ?? "bg-neo-muted text-neo-black";

  return (
    <span
      className={`inline-flex min-h-6 items-center whitespace-nowrap border-2 border-neo-black px-2 py-0.5 font-mono text-[0.6875rem] font-bold uppercase leading-none tracking-wide ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};
