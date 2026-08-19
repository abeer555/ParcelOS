"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiService } from "@/lib/api";
import { Zone } from "@/types";
import toast from "react-hot-toast";

interface ZoneWithAreas extends Zone {
  areas?: Array<{ id: string; name: string; pincode: string }>;
  _count?: { areas?: number };
}

export default function ZonesList() {
  const [zones, setZones] = useState<ZoneWithAreas[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.zones.getZones();
      setZones(response.data || []);
    } catch {
      setError("Zone coverage could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const areaCount = (zone: ZoneWithAreas) =>
    zone.areas?.length ?? zone._count?.areas ?? 0;
  const totalAreas = zones.reduce((sum, zone) => sum + areaCount(zone), 0);
  const largestZone = useMemo(
    () => [...zones].sort((a, b) => areaCount(b) - areaCount(a))[0],
    [zones],
  );
  const filteredZones = zones.filter((zone) =>
    `${zone.name} ${zone.description || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const handleCreate = async () => {
    const name = zoneName.trim();
    if (name.length < 2) {
      toast.error("Zone name must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      await apiService.zones.createZone({ name });
      toast.success("Zone created");
      setZoneName("");
      setShowCreate(false);
      await fetchZones();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create zone");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-sm font-black uppercase">
            Network design
          </p>
          <h1 className="mt-2 inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl shadow-neo">
            SERVICE ZONES
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm font-bold">
            Manage the operating regions that connect areas, agents and pricing.
          </p>
        </div>
        <Button onClick={() => setShowCreate((value) => !value)}>
          {showCreate ? "CANCEL" : "+ NEW ZONE"}
        </Button>
      </header>

      {showCreate && (
        <Card className="bg-neo-blue text-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Create operating region
          </p>
          <div className="mt-4 flex flex-col items-end gap-4 sm:flex-row">
            <Input
              label="Zone name"
              placeholder="E.G. WEST ZONE"
              value={zoneName}
              onChange={(event) => setZoneName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
              }}
            />
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "SAVING..." : "CREATE ZONE"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs font-black uppercase">
            Operating zones
          </p>
          <p className="mt-2 font-mono text-4xl font-black">{zones.length}</p>
        </Card>
        <Card className="bg-neo-green text-neo-white">
          <p className="font-mono text-xs font-black uppercase">Mapped areas</p>
          <p className="mt-2 font-mono text-4xl font-black">{totalAreas}</p>
        </Card>
        <Card className="bg-neo-blue text-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Largest coverage
          </p>
          <p className="mt-2 truncate font-mono text-2xl font-black">
            {largestZone?.name || "—"}
          </p>
          <p className="mt-2 font-mono text-xs">
            {largestZone ? `${areaCount(largestZone)} areas` : "No zone data"}
          </p>
        </Card>
      </div>

      <Input
        aria-label="Search zones"
        placeholder="SEARCH ZONES..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? (
        <Card className="bg-neo-red text-neo-white">
          <p className="font-mono font-black">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchZones}>
            TRY AGAIN
          </Button>
        </Card>
      ) : loading ? (
        <div className="grid animate-pulse grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 border-4 border-neo-black bg-neo-white shadow-neo"
            />
          ))}
        </div>
      ) : filteredZones.length === 0 ? (
        <Card>
          <p className="py-8 text-center font-mono font-black">
            {zones.length
              ? "NO ZONES MATCH THIS SEARCH"
              : "NO SERVICE ZONES YET"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredZones.map((zone, index) => (
            <Card
              key={zone.id}
              className={
                index % 3 === 1
                  ? "bg-neo-yellow"
                  : index % 3 === 2
                    ? "bg-neo-blue text-neo-white"
                    : "bg-neo-white"
              }
            >
              <div className="flex items-start justify-between gap-4">
                <span className="border-2 border-neo-black bg-neo-white px-2 py-1 font-mono text-xs font-black text-neo-black">
                  ZONE {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-3xl font-black">
                  {areaCount(zone)}
                </span>
              </div>
              <h2 className="mt-6 text-2xl uppercase">{zone.name}</h2>
              <p className="mt-2 min-h-10 font-mono text-sm">
                {zone.description || "Operational service region"}
              </p>
              <div className="mt-5 border-t-4 border-neo-black pt-3 font-mono text-xs font-black uppercase">
                {areaCount(zone)} mapped{" "}
                {areaCount(zone) === 1 ? "area" : "areas"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
