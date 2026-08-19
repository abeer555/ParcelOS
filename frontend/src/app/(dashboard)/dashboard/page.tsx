'use client';
import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { Card } from '@/components/ui/Card';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loading } from '@/components/ui/Loading';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiService.admin.getDashboard();
        setData(res.data);
      } catch (err: any) {
        toast.error('Failed to load dashboard data. Check backend connection.');
        // Mock data to render something
        setData({
          stats: { totalOrders: 120, pending: 20, inTransit: 35, delivered: 55, failed: 10 },
          recentOrders: [],
          agentUtilization: { active: 10, total: 15 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;
  if (!data) return <div>Error loading data</div>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">ADMIN DASHBOARD</h1>
      
      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl border-b-4 border-neo-black pb-4 mb-4">Orders by Status (Mock)</h2>
          <div className="flex flex-col gap-4 font-mono">
            <div className="flex items-center gap-4">
              <span className="w-32">PENDING</span>
              <div className="flex-1 h-6 bg-neo-gray border-2 border-neo-black relative">
                <div className="absolute top-0 left-0 h-full bg-neo-yellow" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32">IN TRANSIT</span>
              <div className="flex-1 h-6 bg-neo-gray border-2 border-neo-black relative">
                <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32">DELIVERED</span>
              <div className="flex-1 h-6 bg-neo-gray border-2 border-neo-black relative">
                <div className="absolute top-0 left-0 h-full bg-neo-green" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-neo-blue text-neo-white">
          <h2 className="text-2xl border-b-4 border-neo-black pb-4 mb-4">Agent Utilization</h2>
          <div className="text-6xl font-black text-center mt-10">
            {data.agentUtilization.active} / {data.agentUtilization.total}
          </div>
          <p className="text-center font-mono mt-4">Agents Active Currently</p>
        </Card>
      </div>
    </div>
  );
}
