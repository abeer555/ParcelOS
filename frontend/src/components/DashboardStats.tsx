import React from 'react';
import { DashboardStats as StatsType } from '@/types';
import { Card } from './ui/Card';

export const DashboardStats = ({ stats }: { stats: StatsType }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-neo-blue text-neo-white">
        <h3 className="text-sm">Total Orders</h3>
        <p className="text-4xl font-mono mt-2">{stats.totalOrders}</p>
      </Card>
      <Card className="bg-neo-gray">
        <h3 className="text-sm">Pending</h3>
        <p className="text-4xl font-mono mt-2">{stats.pending}</p>
      </Card>
      <Card className="bg-purple-500 text-neo-white">
        <h3 className="text-sm">In Transit</h3>
        <p className="text-4xl font-mono mt-2">{stats.inTransit}</p>
      </Card>
      <Card className="bg-neo-green text-neo-white">
        <h3 className="text-sm">Delivered</h3>
        <p className="text-4xl font-mono mt-2">{stats.delivered}</p>
      </Card>
      <Card className="bg-neo-red text-neo-white">
        <h3 className="text-sm">Failed</h3>
        <p className="text-4xl font-mono mt-2">{stats.failed}</p>
      </Card>
    </div>
  );
};
