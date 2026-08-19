'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import { ChargeBreakdownDisplay } from '@/components/ChargeBreakdown';
import { apiService } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { OrderStatus } from '@/types';

const OrderMap = dynamic(() => import('@/components/OrderMap'), { ssr: false });

export default function OrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await apiService.orders.getOrder(params.id);
      setOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order');
    }
  };

  const handleAutoAssign = async () => {
    try {
      await apiService.orders.autoAssign(order.id);
      toast.success('Agent assigned!');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Assign failed');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await apiService.orders.updateStatus(order.id, status, `Status updated to ${status}`);
      toast.success('Status updated!');
      fetchOrder();
    } catch (err: any) {
      toast.error('Update failed');
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-neo-white border-4 border-neo-black p-4 shadow-neo">
        <div>
          <h1 className="text-3xl font-black">ORDER: {order.orderNumber}</h1>
          <div className="mt-2"><Badge status={order.status} /></div>
        </div>
        {user?.role === 'ADMIN' && order.status === 'CONFIRMED' && (
          <Button onClick={handleAutoAssign}>AUTO-ASSIGN AGENT</Button>
        )}
        {user?.role === 'AGENT' && (
          <div className="flex gap-2">
            {order.status === 'ASSIGNED' && <Button onClick={() => handleStatusUpdate('PICKED_UP')}>PICK UP</Button>}
            {order.status === 'PICKED_UP' && <Button onClick={() => handleStatusUpdate('IN_TRANSIT')}>IN TRANSIT</Button>}
            {order.status === 'IN_TRANSIT' && <Button onClick={() => handleStatusUpdate('OUT_FOR_DELIVERY')}>OUT FOR DELIVERY</Button>}
            {order.status === 'OUT_FOR_DELIVERY' && <Button variant="success" onClick={() => handleStatusUpdate('DELIVERED')}>DELIVERED</Button>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card>
            <h2 className="text-2xl border-b-4 border-neo-black pb-2 mb-4">MAP</h2>
            <OrderMap pickupLat={28.6} pickupLng={77.2} dropLat={28.7} dropLng={77.1} />
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-bold border-b-2 border-neo-black mb-2">PICKUP</h3>
              <p className="font-mono text-sm">{order.pickupAddress}</p>
              <p className="font-mono font-bold mt-2">PIN: {order.pickupPincode}</p>
            </Card>
            <Card>
              <h3 className="font-bold border-b-2 border-neo-black mb-2">DROP</h3>
              <p className="font-mono text-sm">{order.dropAddress}</p>
              <p className="font-mono font-bold mt-2">PIN: {order.dropPincode}</p>
            </Card>
          </div>
          
          {order.charges && <ChargeBreakdownDisplay data={order.charges} />}
        </div>
        
        <div className="col-span-1">
          <Card className="h-full">
            <h2 className="text-2xl border-b-4 border-neo-black pb-2 mb-4">TIMELINE</h2>
            <TrackingTimeline events={order.trackingEvents || []} />
          </Card>
        </div>
      </div>
    </div>
  );
}
