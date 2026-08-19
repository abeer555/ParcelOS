import React from "react";
import { OrderStatus } from "@/types";
import { Badge } from "./ui/Badge";

export interface TimelineEvent {
  id?: string;
  status: OrderStatus | string;
  timestamp?: string;
  createdAt?: string;
  notes?: string;
  description?: string;
  actorName?: string;
  actor?: string;
  actorRole?: string;
}

const formatEventTime = (value?: string) => {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const TrackingTimeline = ({ events }: { events: TimelineEvent[] }) => {
  if (!events?.length) {
    return (
      <div className="border-4 border-dashed border-neo-black bg-neo-gray p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-neo-black bg-neo-yellow font-black">
          0
        </div>
        <p className="font-mono font-black uppercase">
          No movement recorded yet
        </p>
        <p className="mt-1 text-sm">
          The first immutable tracking update will appear here once the order is
          processed.
        </p>
      </div>
    );
  }

  const orderedEvents = [...events].sort((a, b) => {
    const aTime = new Date(a.timestamp ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.timestamp ?? b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });

  return (
    <ol
      className="relative ml-3 border-l-4 border-neo-black pl-6 sm:ml-4 sm:pl-8"
      aria-label="Order tracking history"
    >
      {orderedEvents.map((event, index) => {
        const note = event.notes ?? event.description;
        const actor = event.actorName ?? event.actor;

        return (
          <li
            key={
              event.id ??
              `${event.status}-${event.timestamp ?? event.createdAt}-${index}`
            }
            className="relative pb-7 last:pb-0"
          >
            <span
              className={`absolute -left-[38px] top-1 h-5 w-5 rounded-full border-4 border-neo-black sm:-left-[46px] ${
                index === 0 ? "bg-neo-yellow shadow-neo" : "bg-neo-white"
              }`}
              aria-hidden="true"
            />
            <article
              className={`border-4 border-neo-black p-3 sm:p-4 ${index === 0 ? "bg-neo-yellow shadow-neo" : "bg-neo-white"}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={event.status} />
                  {index === 0 && (
                    <span className="border-2 border-neo-black bg-neo-black px-2 py-0.5 font-mono text-[10px] font-black text-neo-white">
                      LATEST
                    </span>
                  )}
                </div>
                <time
                  className="font-mono text-xs font-bold"
                  dateTime={event.timestamp ?? event.createdAt}
                >
                  {formatEventTime(event.timestamp ?? event.createdAt)}
                </time>
              </div>
              {note && (
                <p className="mt-3 text-sm font-medium leading-relaxed">
                  {note}
                </p>
              )}
              {(actor || event.actorRole) && (
                <p className="mt-3 border-t-2 border-neo-black pt-2 font-mono text-xs font-bold uppercase">
                  Updated by {actor || "System"}
                  {event.actorRole ? ` · ${event.actorRole}` : ""}
                </p>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
};
