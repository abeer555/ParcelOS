'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix leafet marker icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface OrderMapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  agentLat?: number;
  agentLng?: number;
}

const OrderMap = ({ pickupLat, pickupLng, dropLat, dropLng, agentLat, agentLng }: OrderMapProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] bg-neo-gray border-4 border-neo-black animate-pulse" />;

  const centerLat = pickupLat || dropLat || 0;
  const centerLng = pickupLng || dropLng || 0;

  return (
    <div className="h-[400px] border-4 border-neo-black shadow-neo relative z-0">
      <MapContainer center={[centerLat, centerLng]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickupLat && pickupLng && (
          <Marker position={[pickupLat, pickupLng]} icon={customIcon}>
            <Popup className="font-mono font-bold">Pickup</Popup>
          </Marker>
        )}
        {dropLat && dropLng && (
          <Marker position={[dropLat, dropLng]} icon={customIcon}>
            <Popup className="font-mono font-bold">Drop</Popup>
          </Marker>
        )}
        {agentLat && agentLng && (
          <Marker position={[agentLat, agentLng]} icon={customIcon}>
            <Popup className="font-mono font-bold">Agent</Popup>
          </Marker>
        )}
        {pickupLat && pickupLng && dropLat && dropLng && (
          <Polyline positions={[[pickupLat, pickupLng], [dropLat, dropLng]]} color="#000" weight={4} dashArray="10, 10" />
        )}
      </MapContainer>
    </div>
  );
};

export default OrderMap;
