"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiService } from "@/lib/api";

const OrderMap = dynamic(() => import("@/components/OrderMap"), { ssr: false });

const formatDate = (value?: string) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not scheduled"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

export default function PublicTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = orderNumber.trim().toUpperCase();
    if (!query) {
      setError("Enter an order number");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const res = await apiService.tracking.getTracking(query);
      setTrackingData(res.data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Order not found";
      toast.error(message);
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const events =
    trackingData?.trackingHistory ?? trackingData?.trackingEvents ?? [];

  return (
    <main className="min-h-screen bg-neo-gray px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <header className="text-center">
          <p className="mb-2 font-mono text-xs font-black uppercase tracking-[0.25em]">
            ParcelOS live shipment updates
          </p>
          <h1 className="inline-block border-4 border-neo-black bg-neo-yellow px-4 py-3 text-3xl font-black shadow-neo sm:px-8 sm:text-5xl">
            TRACK YOUR PARCEL
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium sm:text-base">
            Enter the order number from your confirmation to see its latest
            immutable tracking events.
          </p>
        </header>

        <Card className="p-4 sm:p-6">
          <form
            onSubmit={handleTrack}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <Input
              label="Order number"
              placeholder="e.g. ORD-12345"
              value={orderNumber}
              error={error}
              autoComplete="off"
              onChange={(event) => {
                setOrderNumber(event.target.value);
                setError("");
              }}
            />
            <Button type="submit" disabled={loading} className="sm:min-w-36">
              {loading ? "SEARCHING…" : "TRACK"}
            </Button>
          </form>
        </Card>

        {loading && (
          <div
            className="grid gap-4 sm:grid-cols-3"
            aria-label="Loading tracking details"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse border-4 border-neo-black bg-neo-white"
              />
            ))}
          </div>
        )}

        {!loading && searched && !trackingData && (
          <div className="border-4 border-dashed border-neo-black bg-neo-white p-8 text-center shadow-neo">
            <p className="font-mono text-lg font-black">
              NO TRACKING RECORD FOUND
            </p>
            <p className="mt-2 text-sm">
              Check the order number and try again.
            </p>
          </div>
        )}

        {!loading && trackingData && (
          <>
            <Card className="bg-neo-blue p-4 text-neo-white sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase">
                    Order
                  </p>
                  <h2 className="text-2xl font-black sm:text-3xl">
                    {trackingData.orderNumber}
                  </h2>
                </div>
                <Badge status={trackingData.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-neo-white pt-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-xs font-bold uppercase">
                    Pickup
                  </dt>
                  <dd className="font-black">{trackingData.pickupPincode}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs font-bold uppercase">
                    Drop
                  </dt>
                  <dd className="font-black">{trackingData.dropPincode}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs font-bold uppercase">
                    Created
                  </dt>
                  <dd>{formatDate(trackingData.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs font-bold uppercase">
                    Scheduled
                  </dt>
                  <dd>{formatDate(trackingData.scheduledDate)}</dd>
                </div>
              </dl>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
              <Card className="p-4 sm:p-5">
                <h2 className="mb-5 border-b-4 border-neo-black pb-2 text-xl font-black">
                  SHIPMENT TIMELINE
                </h2>
                <TrackingTimeline events={events} />
              </Card>
              <OrderMap
                pickupLat={trackingData.pickupLat}
                pickupLng={trackingData.pickupLng}
                dropLat={trackingData.dropLat}
                dropLng={trackingData.dropLng}
                agentLat={trackingData.agentLat}
                agentLng={trackingData.agentLng}
                pickupLabel={trackingData.pickupPincode}
                dropLabel={trackingData.dropPincode}
                compact
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
