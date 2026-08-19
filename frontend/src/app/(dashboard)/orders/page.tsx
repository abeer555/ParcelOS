'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/types';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const res = await apiService.orders.getOrders({ status: statusFilter });
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  const filteredOrders = orders.filter((o: any) => 
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo">ORDERS</h1>
        <Button onClick={() => router.push('/orders/new')}>+ NEW ORDER</Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search Order Number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="w-64">
          <Select
            options={[
              { value: '', label: 'ALL STATUSES' },
              ...Object.values(OrderStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      <Table headers={['Order Number', 'Status', 'Type', 'Total Charge', 'Date', 'Actions']}>
        {filteredOrders.length === 0 ? (
          <tr><td colSpan={6} className="p-4 text-center font-mono font-bold">NO ORDERS FOUND</td></tr>
        ) : (
          filteredOrders.map((order: any) => (
            <tr key={order.id} className="border-b-4 border-neo-black bg-neo-white hover:bg-neo-gray">
              <td className="p-4 font-bold">{order.orderNumber}</td>
              <td className="p-4"><Badge status={order.status} /></td>
              <td className="p-4 font-mono">{order.type}</td>
              <td className="p-4 font-mono">${order.charges?.total?.toFixed(2) || '0.00'}</td>
              <td className="p-4 font-mono text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="p-4">
                <Button variant="outline" className="py-1 px-2 text-sm" onClick={() => router.push(`/orders/${order.id}`)}>
                  VIEW
                </Button>
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
