import React from 'react';
import { OrderStatus } from '@/types';

export const Badge = ({ status }: { status: OrderStatus | string }) => {
  const colors: Record<string, string> = {
    CREATED: 'bg-neo-gray text-neo-black',
    CONFIRMED: 'bg-neo-blue text-neo-white',
    ASSIGNED: 'bg-neo-orange text-neo-black',
    PICKED_UP: 'bg-neo-yellow text-neo-black',
    IN_TRANSIT: 'bg-purple-500 text-neo-white',
    OUT_FOR_DELIVERY: 'bg-cyan-500 text-neo-black',
    DELIVERED: 'bg-neo-green text-neo-white',
    FAILED: 'bg-neo-red text-neo-white',
    RESCHEDULED: 'bg-neo-orange text-neo-black',
  };

  const colorClass = colors[status] || 'bg-neo-gray text-neo-black';

  return (
    <span className={`inline-block px-2 py-1 font-mono text-xs font-bold uppercase border-2 border-neo-black ${colorClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
