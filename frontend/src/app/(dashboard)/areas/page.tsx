"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { apiService } from "@/lib/api";
import { Area, Zone } from "@/types";
import toast from "react-hot-toast";

const initialForm = { name: "", pincode: "", zoneId: "", lat: "", lng: "" };

export default function AreasList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [areasResponse, zonesResponse] = await Promise.all([
        apiService.areas.getAreas(),
        apiService.zones.getZones(),
      ]);
      setAreas(areasResponse.data || []);
      setZones(zonesResponse.data || []);
    } catch {
      setError("Area coverage could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreate = async () => {
    if (
      !formData.name ||
      !formData.pincode ||
      !formData.zoneId ||
      !formData.lat ||
      !formData.lng
    ) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      await apiService.areas.createArea({
        name: formData.name.trim(),
        pincode: formData.pincode.trim(),
        zoneId: formData.zoneId,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      });
      toast.success("Area created successfully");
      setIsAdding(false);
      setFormData(initialForm);
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create area");
    } finally {
      setSaving(false);
    }
  };

  const filteredAreas = areas.filter((area) => {
    const matchesSearch = `${area.name} ${area.pincode}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesSearch && (!zoneFilter || area.zoneId === zoneFilter);
  });
  const coveredZones = useMemo(
    () => new Set(areas.map((area) => area.zoneId)).size,
    [areas],
  );
  const unmappedAreas = areas.filter((area) => !area.zoneId).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-sm font-black uppercase">
            Pincode coverage
          </p>
          <h1 className="mt-2 inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl shadow-neo">
            SERVICE AREAS
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm font-bold">
            Maintain the pincode-to-zone map used by routing and rate
            calculation.
          </p>
        </div>
        <Button onClick={() => setIsAdding((value) => !value)}>
          {isAdding ? "CANCEL" : "+ NEW AREA"}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs font-black uppercase">Total areas</p>
          <p className="mt-2 font-mono text-4xl font-black">{areas.length}</p>
        </Card>
        <Card className="bg-neo-blue text-neo-white">
          <p className="font-mono text-xs font-black uppercase">
            Zones covered
          </p>
          <p className="mt-2 font-mono text-4xl font-black">
            {coveredZones}/{zones.length}
          </p>
        </Card>
        <Card
          className={
            unmappedAreas
              ? "bg-neo-red text-neo-white"
              : "bg-neo-green text-neo-white"
          }
        >
          <p className="font-mono text-xs font-black uppercase">
            Unmapped areas
          </p>
          <p className="mt-2 font-mono text-4xl font-black">{unmappedAreas}</p>
        </Card>
      </div>

      {isAdding && (
        <Card className="bg-neo-white">
          <div className="mb-5 border-b-4 border-neo-black pb-3">
            <p className="font-mono text-xs font-black uppercase">
              Coverage editor
            </p>
            <h2 className="text-2xl">ADD NEW AREA</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Area name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="Pincode"
              name="pincode"
              inputMode="numeric"
              value={formData.pincode}
              onChange={handleChange}
            />
            <Select
              label="Zone"
              name="zoneId"
              value={formData.zoneId}
              onChange={handleChange}
              options={[
                { value: "", label: "SELECT A ZONE" },
                ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                name="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={handleChange}
              />
              <Input
                label="Longitude"
                name="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "SAVING..." : "SAVE AREA"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 border-4 border-neo-black bg-neo-white p-4 shadow-neo md:grid-cols-[1fr_18rem]">
        <Input
          aria-label="Search service areas"
          placeholder="SEARCH AREA OR PINCODE..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          aria-label="Filter service areas by zone"
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
      </div>

      {error ? (
        <Card className="bg-neo-red text-neo-white">
          <p className="font-mono font-black">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>
            TRY AGAIN
          </Button>
        </Card>
      ) : (
        <Table headers={["Area", "Pincode", "Zone", "Coordinates"]}>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={index}
                className="animate-pulse border-b-4 border-neo-black"
              >
                <td colSpan={4} className="p-4">
                  <div className="h-7 bg-neo-gray" />
                </td>
              </tr>
            ))
          ) : filteredAreas.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-10 text-center font-mono font-black">
                {areas.length
                  ? "NO AREAS MATCH THESE FILTERS"
                  : "NO SERVICE AREAS YET"}
              </td>
            </tr>
          ) : (
            filteredAreas.map((area) => (
              <tr
                key={area.id}
                className="border-b-4 border-neo-black bg-neo-white last:border-b-0 hover:bg-neo-gray"
              >
                <td className="p-4 font-black">{area.name}</td>
                <td className="p-4">
                  <span className="inline-block border-2 border-neo-black bg-neo-yellow px-3 py-1 font-mono font-black">
                    {area.pincode}
                  </span>
                </td>
                <td className="p-4 font-mono font-bold">
                  {area.zone?.name ||
                    zones.find((zone) => zone.id === area.zoneId)?.name ||
                    "UNMAPPED"}
                </td>
                <td className="p-4 font-mono text-xs">
                  {Number(area.lat).toFixed(4)}, {Number(area.lng).toFixed(4)}
                </td>
              </tr>
            ))
          )}
        </Table>
      )}
    </div>
  );
}
