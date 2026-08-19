"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardStats } from "@/components/DashboardStats";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { apiService } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardStats as Stats, OrderStatus, Role } from "@/types";

interface DashboardOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  totalCharge?: number;
  charges?: { total?: number };
  customer?: { name?: string };
}

interface AdminDashboardResponse {
  totalOrders: number;
  ordersByStatus: Array<{
    status: OrderStatus;
    _count: { status: number } | number;
  }>;
  recentOrders: DashboardOrder[];
  agentUtilization: { total: number; available: number; busy: number };
}

const emptyStats: Stats = {
  totalOrders: 0,
  pending: 0,
  inTransit: 0,
  delivered: 0,
  failed: 0,
};
const pendingStatuses = new Set<OrderStatus>([
  OrderStatus.CREATED,
  OrderStatus.CONFIRMED,
  OrderStatus.ASSIGNED,
  OrderStatus.RESCHEDULED,
]);
const transitStatuses = new Set<OrderStatus>([
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.OUT_FOR_DELIVERY,
]);

function deriveStats(orders: Array<{ status: OrderStatus }>): Stats {
  return orders.reduce<Stats>(
    (stats, order) => {
      stats.totalOrders += 1;
      if (pendingStatuses.has(order.status)) stats.pending += 1;
      if (transitStatuses.has(order.status)) stats.inTransit += 1;
      if (order.status === OrderStatus.DELIVERED) stats.delivered += 1;
      if (order.status === OrderStatus.FAILED) stats.failed += 1;
      return stats;
    },
    { ...emptyStats },
  );
}

function deriveAdminStats(data: AdminDashboardResponse): Stats {
  const stats = data.ordersByStatus.reduce<Stats>(
    (current, item) => {
      const count =
        typeof item._count === "number"
          ? item._count
          : item._count?.status || 0;
      if (pendingStatuses.has(item.status)) current.pending += count;
      if (transitStatuses.has(item.status)) current.inTransit += count;
      if (item.status === OrderStatus.DELIVERED) current.delivered += count;
      if (item.status === OrderStatus.FAILED) current.failed += count;
      return current;
    },
    { ...emptyStats },
  );
  return { ...stats, totalOrders: data.totalOrders };
}

function DashboardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-6"
      aria-label="Loading dashboard"
    >
      <div className="h-14 w-72 border-4 border-neo-black bg-neo-yellow" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-36 border-4 border-neo-black bg-neo-white shadow-neo"
          />
        ))}
      </div>
      <div className="h-72 border-4 border-neo-black bg-neo-white shadow-neo" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [utilization, setUtilization] = useState<
    AdminDashboardResponse["agentUtilization"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      if (user.role === Role.ADMIN) {
        const response = await apiService.admin.getDashboard();
        const data = response.data as AdminDashboardResponse;
        setStats(deriveAdminStats(data));
        setOrders(data.recentOrders || []);
        setUtilization(data.agentUtilization);
      } else {
        const response = await apiService.orders.getOrders();
        const roleOrders = (response.data || []) as DashboardOrder[];
        setOrders(roleOrders);
        setStats(deriveStats(roleOrders));
        setUtilization(null);
      }
    } catch {
      setError(
        "Operational data could not be loaded. Check the API connection and try again.",
      );
      setOrders([]);
      setStats(emptyStats);
      setUtilization(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const activeOrders = stats.pending + stats.inTransit;
  const completionRate = stats.totalOrders
    ? Math.round((stats.delivered / stats.totalOrders) * 100)
    : 0;
  const totalValue = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.totalCharge ?? order.charges?.total ?? 0),
        0,
      ),
    [orders],
  );

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <Card className="max-w-2xl bg-neo-red text-neo-white">
        <p className="font-mono text-sm font-black uppercase">
          Dashboard unavailable
        </p>
        <h1 className="mt-2 text-3xl">WE LOST THE SIGNAL.</h1>
        <p className="my-5 font-mono">{error}</p>
        <Button variant="outline" onClick={fetchDashboard}>
          TRY AGAIN
        </Button>
      </Card>
    );
  }

  const roleTitle =
    user?.role === Role.ADMIN
      ? "OPERATIONS CONTROL"
      : user?.role === Role.AGENT
        ? "DELIVERY RUN"
        : "MY SHIPPING DESK";
  const roleCopy =
    user?.role === Role.ADMIN
      ? "Network health, workload and the latest parcel movement."
      : user?.role === Role.AGENT
        ? "Your assigned workload and delivery progress at a glance."
        : "Track shipment momentum, delivery success and recent spend.";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 font-mono text-sm font-black uppercase">
            Hello, {user?.name}
          </p>
          <h1 className="inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl shadow-neo sm:text-4xl">
            {roleTitle}
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm font-bold">
            {roleCopy}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(user?.role === Role.AGENT ? "/deliveries" : "/orders")
          }
        >
          {user?.role === Role.AGENT ? "OPEN DELIVERIES" : "VIEW ALL ORDERS"}
        </Button>
      </header>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Live workload
          </p>
          <p className="mt-2 font-mono text-5xl font-black">{activeOrders}</p>
          <p className="mt-2 font-mono text-sm">Pending or moving parcels</p>
        </Card>
        <Card className="bg-neo-green text-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Delivery success
          </p>
          <p className="mt-2 font-mono text-5xl font-black">
            {completionRate}%
          </p>
          <p className="mt-2 font-mono text-sm">
            Delivered across visible orders
          </p>
        </Card>
        {user?.role === Role.ADMIN && utilization ? (
          <Card className="bg-neo-blue text-neo-white">
            <p className="font-mono text-xs font-black uppercase">
              Agent availability
            </p>
            <p className="mt-2 font-mono text-5xl font-black">
              {utilization.available}/{utilization.total}
            </p>
            <p className="mt-2 font-mono text-sm">
              {utilization.busy} currently busy
            </p>
          </Card>
        ) : (
          <Card className="bg-neo-blue text-neo-white">
            <p className="font-mono text-xs font-black uppercase">
              Visible order value
            </p>
            <p className="mt-2 font-mono text-4xl font-black">
              ₹
              {totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-2 font-mono text-sm">
              Across your current order history
            </p>
          </Card>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-black uppercase">
              Latest activity
            </p>
            <h2 className="text-2xl">RECENT ORDERS</h2>
          </div>
          <span className="border-2 border-neo-black bg-neo-white px-3 py-1 font-mono text-xs font-black">
            SHOWING {Math.min(orders.length, 8)}
          </span>
        </div>
        <Table
          headers={[
            "Order",
            "Status",
            user?.role === Role.ADMIN ? "Customer" : "Route",
            "Created",
            "Action",
          ]}
        >
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center font-mono font-bold">
                NO ORDER ACTIVITY YET
              </td>
            </tr>
          ) : (
            orders.slice(0, 8).map((order) => (
              <tr
                key={order.id}
                className="border-b-4 border-neo-black bg-neo-white last:border-b-0 hover:bg-neo-gray"
              >
                <td className="p-4 font-mono font-black">
                  {order.orderNumber}
                </td>
                <td className="p-4">
                  <Badge status={order.status} />
                </td>
                <td className="p-4 font-mono text-sm">
                  {user?.role === Role.ADMIN
                    ? order.customer?.name || "—"
                    : "Pickup → Drop"}
                </td>
                <td className="p-4 font-mono text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4">
                  <Button
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    VIEW
                  </Button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </section>
    </div>
  );
}
