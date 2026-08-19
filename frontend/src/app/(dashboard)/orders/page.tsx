"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { apiService } from "@/lib/api";
import { OrderStatus } from "@/types";

interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  type?: string;
  orderType?: string;
  pickupPincode?: string;
  dropPincode?: string;
  totalCharge?: number;
  charges?: { total?: number; totalCharge?: number };
  createdAt: string;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const orderTotal = (order: OrderListItem) =>
  order.totalCharge ?? order.charges?.total ?? order.charges?.totalCharge ?? 0;

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
};

export default function OrdersList() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const res = await apiService.orders.getOrders(
        statusFilter ? { status: statusFilter } : undefined,
      );
      setOrders(res.data || []);
    } catch {
      setLoadFailed(true);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [order.orderNumber, order.pickupPincode, order.dropPincode]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [orders, search]);

  const openOrder = (id: string) => router.push(`/orders/${id}`);

  const emptyMessage = loadFailed
    ? "ORDERS COULD NOT BE LOADED"
    : search || statusFilter
      ? "NO ORDERS MATCH THESE FILTERS"
      : "NO ORDERS YET";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest">
            Customer shipments
          </p>
          <h1 className="inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl font-black shadow-neo sm:text-4xl">
            ORDERS
          </h1>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => router.push("/orders/new")}
        >
          + NEW ORDER
        </Button>
      </header>

      <section
        className="border-4 border-neo-black bg-neo-white p-3 shadow-neo sm:p-4"
        aria-label="Order filters"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px_auto] md:items-end">
          <Input
            label="Search"
            aria-label="Search orders"
            placeholder="Order number or pincode"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Status"
            options={[
              { value: "", label: "ALL STATUSES" },
              ...Object.values(OrderStatus).map((status) => ({
                value: status,
                label: status.replace(/_/g, " "),
              })),
            ]}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={!search && !statusFilter}
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
          >
            CLEAR
          </Button>
        </div>
        <p
          className="mt-3 font-mono text-xs font-bold uppercase"
          aria-live="polite"
        >
          {loading
            ? "Loading orders…"
            : `${filteredOrders.length} of ${orders.length} orders shown`}
        </p>
      </section>

      {loading ? (
        <div className="grid gap-3" aria-label="Loading orders">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse border-4 border-neo-black bg-neo-gray"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border-4 border-dashed border-neo-black bg-neo-white p-8 text-center shadow-neo">
          <p className="font-mono text-lg font-black">{emptyMessage}</p>
          <p className="mt-2 text-sm">
            {loadFailed
              ? "Check your connection and try again."
              : "Adjust the filters or create a new shipment."}
          </p>
          {loadFailed && (
            <Button className="mt-4" onClick={fetchOrders}>
              RETRY
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table
              headers={[
                "Order",
                "Route",
                "Status",
                "Type",
                "Total",
                "Created",
                "",
              ]}
            >
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b-4 border-neo-black bg-neo-white last:border-b-0 hover:bg-neo-gray"
                >
                  <td className="p-4 font-mono font-black">
                    {order.orderNumber}
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {order.pickupPincode || "—"} → {order.dropPincode || "—"}
                  </td>
                  <td className="p-4">
                    <Badge status={order.status} />
                  </td>
                  <td className="p-4 font-mono font-bold">
                    {order.orderType ?? order.type ?? "—"}
                  </td>
                  <td className="p-4 whitespace-nowrap font-mono font-black">
                    {inrFormatter.format(orderTotal(order))}
                  </td>
                  <td className="p-4 whitespace-nowrap font-mono text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      className="px-3 py-1 text-sm"
                      onClick={() => openOrder(order.id)}
                    >
                      VIEW
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="border-4 border-neo-black bg-neo-white p-4 shadow-neo"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-neo-black pb-3">
                  <div>
                    <p className="font-mono text-xs font-bold">ORDER</p>
                    <h2 className="font-mono text-lg font-black">
                      {order.orderNumber}
                    </h2>
                  </div>
                  <Badge status={order.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase">
                      Route
                    </dt>
                    <dd>
                      {order.pickupPincode || "—"} → {order.dropPincode || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase">
                      Type
                    </dt>
                    <dd>{order.orderType ?? order.type ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase">
                      Created
                    </dt>
                    <dd>{formatDate(order.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase">
                      Total
                    </dt>
                    <dd className="font-mono font-black">
                      {inrFormatter.format(orderTotal(order))}
                    </dd>
                  </div>
                </dl>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => openOrder(order.id)}
                >
                  VIEW ORDER
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
