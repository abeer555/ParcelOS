'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AgentDeliveries() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiService.agents.getAgentOrders();
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load deliveries');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">MY DELIVERIES</h1>
      
      {orders.length === 0 ? (
        <Card><p className="font-mono text-center">No active deliveries assigned.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order: any) => (
            <Card key={order.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl">{order.orderNumber}</h3>
                  <Badge status={order.status} />
                </div>
                <div className="font-mono text-sm mb-4">
                  <p><strong>Pickup:</strong> {order.pickupAddress}</p>
                  <p><strong>Drop:</strong> {order.dropAddress}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push(`/orders/${order.id}`)}>VIEW & UPDATE</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
