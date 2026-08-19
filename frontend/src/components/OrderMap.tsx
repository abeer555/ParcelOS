"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

interface OrderMapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  agentLat?: number;
  agentLng?: number;
  pickupLabel?: string;
  dropLabel?: string;
  compact?: boolean;
}

type Point = [number, number];

const markerIcon = (label: string, colour: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:${colour};border:4px solid #111;font:900 14px monospace;box-shadow:3px 3px 0 #111">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });

const pickupIcon = markerIcon("P", "#22c55e");
const dropIcon = markerIcon("D", "#ef4444");
const agentIcon = markerIcon("A", "#3b82f6");

const isCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const distanceInKm = (from: Point, to: Point) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371;
  const latDelta = toRadians(to[0] - from[0]);
  const lngDelta = toRadians(to[1] - from[1]);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from[0])) *
      Math.cos(toRadians(to[0])) *
      Math.sin(lngDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FitMapToRoute = ({ points }: { points: Point[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [45, 45] });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [map, points]);

  return null;
};

const OrderMap = ({
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  agentLat,
  agentLng,
  pickupLabel = "Pickup",
  dropLabel = "Drop",
  compact = false,
}: OrderMapProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const pickup: Point | null =
    isCoordinate(pickupLat) && isCoordinate(pickupLng)
      ? [pickupLat, pickupLng]
      : null;
  const drop: Point | null =
    isCoordinate(dropLat) && isCoordinate(dropLng) ? [dropLat, dropLng] : null;
  const agent: Point | null =
    isCoordinate(agentLat) && isCoordinate(agentLng)
      ? [agentLat, agentLng]
      : null;
  const points = useMemo(
    () =>
      [pickup, drop, agent].filter((point): point is Point => point !== null),
    [pickup, drop, agent],
  );
  const routeDistance = pickup && drop ? distanceInKm(pickup, drop) : null;
  const mapHeight = compact
    ? "h-[260px] sm:h-[300px]"
    : "h-[320px] sm:h-[400px]";

  return (
    <section
      className="overflow-hidden border-4 border-neo-black bg-neo-white shadow-neo"
      aria-label="Order route map"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b-4 border-neo-black bg-neo-yellow p-3 font-mono text-xs font-black uppercase sm:text-sm">
        <div className="min-w-0">
          <span className="block text-[10px]">Pickup</span>
          <span className="block truncate">{pickupLabel}</span>
        </div>
        <div className="text-center">
          <span aria-hidden="true">→</span>
          {routeDistance !== null && (
            <span className="block whitespace-nowrap text-[10px]">
              ~{routeDistance.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="min-w-0 text-right">
          <span className="block text-[10px]">Drop</span>
          <span className="block truncate">{dropLabel}</span>
        </div>
      </div>

      {!mounted ? (
        <div
          className={`${mapHeight} animate-pulse bg-neo-gray`}
          aria-label="Loading map"
        />
      ) : points.length === 0 ? (
        <div
          className={`${mapHeight} flex flex-col items-center justify-center bg-neo-gray p-6 text-center`}
        >
          <div className="mb-3 border-4 border-neo-black bg-neo-white px-3 py-2 font-mono text-xl font-black">
            MAP
          </div>
          <p className="font-mono font-black uppercase">
            Live coordinates unavailable
          </p>
          <p className="mt-1 max-w-sm text-sm">
            The route summary is available now. Map markers will appear when
            location coordinates are shared.
          </p>
        </div>
      ) : (
        <div className={`${mapHeight} relative z-0`}>
          <MapContainer
            center={points[0]}
            zoom={11}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMapToRoute points={points} />
            {pickup && (
              <Marker position={pickup} icon={pickupIcon}>
                <Popup>
                  <strong>Pickup:</strong> {pickupLabel}
                </Popup>
              </Marker>
            )}
            {drop && (
              <Marker position={drop} icon={dropIcon}>
                <Popup>
                  <strong>Drop:</strong> {dropLabel}
                </Popup>
              </Marker>
            )}
            {agent && (
              <Marker position={agent} icon={agentIcon}>
                <Popup>
                  <strong>Delivery agent</strong>
                </Popup>
              </Marker>
            )}
            {pickup && drop && (
              <Polyline
                positions={[pickup, drop]}
                color="#111"
                weight={5}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t-4 border-neo-black bg-neo-white px-3 py-2 font-mono text-[10px] font-bold uppercase">
        <span>P · Pickup</span>
        <span>D · Drop</span>
        {agent && <span>A · Agent</span>}
        {routeDistance !== null && (
          <span className="ml-auto">Straight-line estimate</span>
        )}
      </div>
    </section>
  );
};

export default OrderMap;
