"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { ChargeBreakdownDisplay } from "@/components/ChargeBreakdown";
import { apiService } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const OrderMap = dynamic(() => import("@/components/OrderMap"), { ssr: false });

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

export default function OrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await apiService.orders.getOrder(params.id);
      setOrder(res.data);
    } catch {
      setOrder(null);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleAutoAssign = async () => {
    setActionLoading(true);
    try {
      await apiService.orders.autoAssign(order.id);
      toast.success("Agent assigned");
      await fetchOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setActionLoading(true);
    try {
      await apiService.orders.updateStatus(
        order.id,
        status,
        `Status updated to ${status}`,
      );
      toast.success("Status updated");
      await fetchOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="h-48 animate-pulse border-4 border-neo-black bg-neo-gray"
        aria-label="Loading order"
      />
    );
  }

  if (!order) {
    return (
      <div className="border-4 border-dashed border-neo-black bg-neo-white p-8 text-center shadow-neo">
        <p className="font-mono text-xl font-black">ORDER UNAVAILABLE</p>
        <p className="mt-2 text-sm">The order could not be loaded.</p>
        <Button className="mt-4" onClick={fetchOrder}>
          RETRY
        </Button>
      </div>
    );
  }

  const orderType = order.orderType ?? order.type ?? "—";
  const dimensions = order.dimensions ?? {
    l: order.packageLength,
    b: order.packageBreadth,
    h: order.packageHeight,
  };
  const trackingEvents = order.trackingHistory ?? order.trackingEvents ?? [];
  const charges = order.charges ?? {
    baseCharge: order.baseCharge,
    weightCharge: order.weightCharge,
    codSurcharge: order.codSurcharge,
    totalCharge: order.totalCharge,
    billableWeight: order.billableWeight,
    volumetricWeight: order.volumetricWeight,
  };
  const total = charges.total ?? charges.totalCharge ?? 0;
  const assignedName = order.agent?.user?.name ?? order.agent?.name;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <header className="border-4 border-neo-black bg-neo-white p-4 shadow-neo sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-black uppercase tracking-widest">
              Order details
            </p>
            <h1 className="mt-1 break-words text-2xl font-black sm:text-4xl">
              {order.orderNumber}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge status={order.status} />
              <span className="border-2 border-neo-black bg-neo-gray px-2 py-1 font-mono text-xs font-bold">
                {orderType}
              </span>
              <span className="border-2 border-neo-black bg-neo-yellow px-2 py-1 font-mono text-xs font-black">
                {inrFormatter.format(total)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.role === "ADMIN" && order.status === "CONFIRMED" && (
              <Button disabled={actionLoading} onClick={handleAutoAssign}>
                {actionLoading ? "ASSIGNING…" : "AUTO-ASSIGN AGENT"}
              </Button>
            )}
            {user?.role === "AGENT" && order.status === "ASSIGNED" && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate("PICKED_UP")}
              >
                PICK UP
              </Button>
            )}
            {user?.role === "AGENT" && order.status === "PICKED_UP" && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate("IN_TRANSIT")}
              >
                IN TRANSIT
              </Button>
            )}
            {user?.role === "AGENT" && order.status === "IN_TRANSIT" && (
              <Button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate("OUT_FOR_DELIVERY")}
              >
                OUT FOR DELIVERY
              </Button>
            )}
            {user?.role === "AGENT" && order.status === "OUT_FOR_DELIVERY" && (
              <Button
                variant="success"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate("DELIVERED")}
              >
                DELIVERED
              </Button>
            )}
          </div>
        </div>
        <p className="mt-4 border-t-2 border-neo-black pt-3 font-mono text-xs font-bold uppercase">
          Created {formatDate(order.createdAt)} · {order.paymentType ?? "—"}
        </p>
      </header>

      <section aria-labelledby="shipment-overview-heading">
        <h2
          id="shipment-overview-heading"
          className="mb-3 font-mono text-sm font-black uppercase tracking-widest"
        >
          Shipment overview
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="border-b-4 border-neo-black pb-2 text-xl font-black">
              ADDRESSES
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
              <div className="border-4 border-neo-black bg-neo-gray p-4">
                <p className="font-mono text-xs font-black uppercase">Pickup</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {order.pickupAddress}
                </p>
                <p className="mt-3 font-mono font-black">
                  PIN {order.pickupPincode}
                </p>
              </div>
              <div className="hidden items-center font-mono text-2xl font-black sm:flex">
                →
              </div>
              <div className="border-4 border-neo-black bg-neo-yellow p-4">
                <p className="font-mono text-xs font-black uppercase">Drop</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {order.dropAddress}
                </p>
                <p className="mt-3 font-mono font-black">
                  PIN {order.dropPincode}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="border-b-4 border-neo-black pb-2 text-xl font-black">
              PACKAGE
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <dt className="font-mono text-xs font-bold uppercase">
                  Dimensions
                </dt>
                <dd className="text-lg font-black">
                  {dimensions.l ?? "—"} × {dimensions.b ?? "—"} ×{" "}
                  {dimensions.h ?? "—"} cm
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-bold uppercase">
                  Actual
                </dt>
                <dd className="font-black">{order.actualWeight ?? "—"} kg</dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-bold uppercase">
                  Billable
                </dt>
                <dd className="font-black">
                  {order.billableWeight ?? charges.billableWeight ?? "—"} kg
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="lg:col-span-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs font-black uppercase">
                  Assignment
                </p>
                <h3 className="text-xl font-black">
                  {assignedName ||
                    (order.agentId
                      ? "DELIVERY AGENT ASSIGNED"
                      : "AWAITING AGENT")}
                </h3>
                {order.agentId && !assignedName && (
                  <p className="mt-1 break-all font-mono text-xs">
                    Assignment ID: {order.agentId}
                  </p>
                )}
              </div>
              <span
                className={`w-fit border-4 border-neo-black px-3 py-2 font-mono text-xs font-black ${order.agentId ? "bg-neo-green text-neo-white" : "bg-neo-gray"}`}
              >
                {order.agentId ? "ASSIGNED" : "UNASSIGNED"}
              </span>
            </div>
          </Card>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]"
        aria-label="Tracking and route"
      >
        <Card>
          <h2 className="mb-5 border-b-4 border-neo-black pb-2 text-2xl font-black">
            TRACKING HISTORY
          </h2>
          <TrackingTimeline events={trackingEvents} />
        </Card>
        <div className="flex min-w-0 flex-col gap-5">
          <OrderMap
            pickupLat={order.pickupLat}
            pickupLng={order.pickupLng}
            dropLat={order.dropLat}
            dropLng={order.dropLng}
            agentLat={order.agent?.currentLat ?? order.agentLat}
            agentLng={order.agent?.currentLng ?? order.agentLng}
            pickupLabel={order.pickupPincode}
            dropLabel={order.dropPincode}
          />
          <ChargeBreakdownDisplay data={charges} />
        </div>
      </section>
    </div>
  );
}
