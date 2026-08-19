"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { apiService } from "@/lib/api";
import { AgentProfile, Zone } from "@/types";

function AgentRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={index} className="animate-pulse border-b-4 border-neo-black">
          <td colSpan={5} className="p-4">
            <div className="h-7 bg-neo-gray" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AgentsList() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [agentsResponse, zonesResponse] = await Promise.all([
        apiService.agents.getAgents(),
        apiService.zones.getZones(),
      ]);
      setAgents(agentsResponse.data || []);
      setZones(zonesResponse.data || []);
    } catch {
      setError("Agent roster could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const zoneNames = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones],
  );
  const availableCount = agents.filter((agent) => agent.isAvailable).length;
  const unassignedCount = agents.filter((agent) => !agent.zoneId).length;
  const filteredAgents = agents.filter((agent) => {
    const haystack =
      `${agent.user?.name || ""} ${agent.user?.email || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(search.trim().toLowerCase());
    const matchesZone = !zoneFilter || agent.zoneId === zoneFilter;
    const matchesAvailability =
      !availabilityFilter || String(agent.isAvailable) === availabilityFilter;
    return matchesSearch && matchesZone && matchesAvailability;
  });

  const hasCoordinates = (agent: AgentProfile) =>
    agent.currentLat !== null &&
    agent.currentLat !== undefined &&
    agent.currentLng !== null &&
    agent.currentLng !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-sm font-black uppercase">
          Fleet operations
        </p>
        <h1 className="mt-2 inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl shadow-neo">
          AGENT ROSTER
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm font-bold">
          Find coverage gaps and see who is ready for the next parcel.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-neo-blue text-neo-white">
          <p className="font-mono text-xs font-black uppercase">Total agents</p>
          <p className="mt-2 font-mono text-4xl font-black">{agents.length}</p>
        </Card>
        <Card className="bg-neo-green text-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Available now
          </p>
          <p className="mt-2 font-mono text-4xl font-black">{availableCount}</p>
        </Card>
        <Card
          className={
            unassignedCount ? "bg-neo-red text-neo-white" : "bg-neo-white"
          }
        >
          <p className="font-mono text-xs font-black uppercase">Without zone</p>
          <p className="mt-2 font-mono text-4xl font-black">
            {unassignedCount}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 border-4 border-neo-black bg-neo-white p-4 shadow-neo md:grid-cols-3">
        <Input
          aria-label="Search agents"
          placeholder="SEARCH NAME OR EMAIL..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          aria-label="Filter agents by zone"
          value={zoneFilter}
          onChange={(event) => setZoneFilter(event.target.value)}
          options={[
            { value: "", label: "ALL ZONES" },
            ...zones.map((zone) => ({
              value: zone.id,
              label: zone.name.toUpperCase(),
            })),
          ]}
        />
        <Select
          aria-label="Filter agents by availability"
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
          options={[
            { value: "", label: "ALL AVAILABILITY" },
            { value: "true", label: "AVAILABLE" },
            { value: "false", label: "BUSY" },
          ]}
        />
      </div>

      {error ? (
        <Card className="bg-neo-red text-neo-white">
          <p className="font-mono font-black">{error}</p>
          <button
            className="mt-4 border-4 border-neo-black bg-neo-white px-4 py-2 font-mono font-black text-neo-black shadow-neo"
            onClick={fetchAgents}
          >
            TRY AGAIN
          </button>
        </Card>
      ) : (
        <Table headers={["Agent", "Zone", "Status", "Location", "Contact"]}>
          {loading ? (
            <AgentRowsSkeleton />
          ) : filteredAgents.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center font-mono font-black">
                {agents.length
                  ? "NO AGENTS MATCH THESE FILTERS"
                  : "NO AGENTS ON THE ROSTER"}
              </td>
            </tr>
          ) : (
            filteredAgents.map((agent) => (
              <tr
                key={agent.id}
                className="border-b-4 border-neo-black bg-neo-white last:border-b-0 hover:bg-neo-gray"
              >
                <td className="p-4">
                  <p className="font-black">
                    {agent.user?.name || "Unnamed agent"}
                  </p>
                  <p className="font-mono text-xs">ID {agent.id.slice(0, 8)}</p>
                </td>
                <td className="p-4 font-mono font-bold">
                  {agent.zone?.name ||
                    zoneNames.get(agent.zoneId) ||
                    "UNASSIGNED"}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block border-2 border-neo-black px-3 py-1 font-mono text-xs font-black ${agent.isAvailable ? "bg-neo-green text-neo-white" : "bg-neo-yellow text-neo-black"}`}
                  >
                    {agent.isAvailable ? "AVAILABLE" : "BUSY"}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs">
                  {hasCoordinates(agent)
                    ? `${Number(agent.currentLat).toFixed(4)}, ${Number(agent.currentLng).toFixed(4)}`
                    : "NOT REPORTED"}
                </td>
                <td className="p-4 font-mono text-sm">
                  {agent.user?.email || "—"}
                </td>
              </tr>
            ))
          )}
        </Table>
      )}
    </div>
  );
}
