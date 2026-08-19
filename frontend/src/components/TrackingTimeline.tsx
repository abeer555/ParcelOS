import React from 'react';
import { TrackingEvent } from '@/types';
import { format } from 'date-fns';
import { Badge } from './ui/Badge';

export const TrackingTimeline = ({ events }: { events: TrackingEvent[] }) => {
  if (!events || events.length === 0) return <div>No tracking events available.</div>;

  return (
    <div className="border-l-4 border-neo-black ml-4 pl-8 py-2 relative flex flex-col gap-6">
      {events.map((event, idx) => (
        <div key={event.id} className="relative">
          <div className="absolute -left-[42px] top-1 w-5 h-5 bg-neo-yellow border-4 border-neo-black rounded-full shadow-neo" />
          <div className="bg-neo-white border-4 border-neo-black p-4 shadow-neo">
            <div className="flex justify-between items-start mb-2">
              <Badge status={event.status} />
              <span className="font-mono text-xs font-bold bg-neo-gray px-2 py-1 border-2 border-neo-black">
                {format(new Date(event.timestamp), 'PP p')}
              </span>
            </div>
            {event.notes && <p className="mt-2 text-sm">{event.notes}</p>}
            {event.actorName && (
              <p className="mt-2 text-xs font-mono font-bold">Updated by: {event.actorName}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
