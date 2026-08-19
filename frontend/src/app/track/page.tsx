'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import dynamic from 'next/dynamic';

const OrderMap = dynamic(() => import('@/components/OrderMap'), { ssr: false });

export default function PublicTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.tracking.getTracking(orderNumber);
      setTrackingData(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order not found');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neo-gray p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl mb-8 text-center bg-neo-yellow border-4 border-neo-black p-4 shadow-neo">PUBLIC TRACKING</h1>
        
        <Card className="mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Enter Order Number (e.g. ORD-12345)" 
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? 'SEARCHING...' : 'TRACK'}
            </Button>
          </form>
        </Card>

        {trackingData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-2xl mb-4">TIMELINE</h2>
              <TrackingTimeline events={trackingData.trackingEvents} />
            </Card>
            <div className="flex flex-col gap-8">
              <Card className="bg-neo-blue text-neo-white">
                <h2 className="text-2xl mb-4">DETAILS</h2>
                <div className="font-mono flex flex-col gap-2">
                  <p><strong>Status:</strong> {trackingData.status}</p>
                  <p><strong>Type:</strong> {trackingData.type}</p>
                  <p><strong>Pickup:</strong> {trackingData.pickupPincode}</p>
                  <p><strong>Drop:</strong> {trackingData.dropPincode}</p>
                </div>
              </Card>
              <OrderMap 
                pickupLat={28.6139} pickupLng={77.2090} // Mock coords for now
                dropLat={28.7041} dropLng={77.1025}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
