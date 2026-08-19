import React from "react";
import { DashboardStats as StatsType } from "@/types";
import { Card } from "./ui/Card";

const statCards: Array<{
  key: keyof StatsType;
  label: string;
  className: string;
}> = [
  {
    key: "totalOrders",
    label: "Total orders",
    className: "bg-neo-blue text-neo-white",
  },
  {
    key: "pending",
    label: "Pending",
    className: "bg-neo-yellow text-neo-black",
  },
  {
    key: "inTransit",
    label: "In transit",
    className: "bg-purple-500 text-neo-white",
  },
  {
    key: "delivered",
    label: "Delivered",
    className: "bg-neo-green text-neo-white",
  },
  { key: "failed", label: "Failed", className: "bg-neo-red text-neo-white" },
];

export const DashboardStats = ({ stats }: { stats: StatsType }) => {
  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-5"
      aria-label="Order statistics"
    >
      {statCards.map(({ key, label, className }) => (
        <Card key={key} className={`${className} min-h-32 p-4 sm:p-6`}>
          <p className="font-mono text-xs font-black uppercase tracking-wider sm:text-sm">
            {label}
          </p>
          <p className="mt-3 font-mono text-4xl font-black sm:text-5xl">
            {stats[key] ?? 0}
          </p>
          {key !== "totalOrders" && stats.totalOrders > 0 && (
            <p className="mt-2 font-mono text-xs font-bold">
              {Math.round((stats[key] / stats.totalOrders) * 100)}% of total
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};
