"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { apiService } from "@/lib/api";
import { OrderType, Zone } from "@/types";
import toast from "react-hot-toast";

interface RateCardRecord {
  id: string;
  zoneId: string;
  destinationZoneId: string;
  fromZoneId?: string;
  toZoneId?: string;
  orderType: OrderType;
  baseRate: number;
  ratePerKg: number;
  codSurcharge: number;
}

const initialForm = {
  zoneId: "",
  destinationZoneId: "",
  orderType: OrderType.B2C,
  baseRate: "",
  ratePerKg: "",
  codSurcharge: "0",
};

export default function RateCardsList() {
  const [rateCards, setRateCards] = useState<RateCardRecord[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rateResponse, zoneResponse] = await Promise.all([
        apiService.rateCards.getRateCards(),
        apiService.zones.getZones(),
      ]);
      setRateCards(rateResponse.data || []);
      setZones(zoneResponse.data || []);
    } catch {
      setError("Pricing configuration could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const zoneName = (id?: string) =>
    zones.find((zone) => zone.id === id)?.name || "Unknown zone";
  const sourceZoneId = (rateCard: RateCardRecord) =>
    rateCard.zoneId || rateCard.fromZoneId || "";
  const destinationZoneId = (rateCard: RateCardRecord) =>
    rateCard.destinationZoneId || rateCard.toZoneId || "";
  const filteredCards = rateCards.filter(
    (rateCard) => !typeFilter || rateCard.orderType === typeFilter,
  );
  const averageBase = rateCards.length
    ? rateCards.reduce((sum, card) => sum + Number(card.baseRate), 0) /
      rateCards.length
    : 0;
  const averagePerKg = rateCards.length
    ? rateCards.reduce((sum, card) => sum + Number(card.ratePerKg), 0) /
      rateCards.length
    : 0;
  const routeCount = useMemo(
    () =>
      new Set(
        rateCards.map(
          (card) => `${sourceZoneId(card)}-${destinationZoneId(card)}`,
        ),
      ).size,
    [rateCards],
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const editRateCard = (rateCard: RateCardRecord) => {
    setEditingId(rateCard.id);
    setFormData({
      zoneId: sourceZoneId(rateCard),
      destinationZoneId: destinationZoneId(rateCard),
      orderType: rateCard.orderType,
      baseRate: String(rateCard.baseRate),
      ratePerKg: String(rateCard.ratePerKg),
      codSurcharge: String(rateCard.codSurcharge),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (
      !formData.zoneId ||
      !formData.destinationZoneId ||
      !formData.baseRate ||
      !formData.ratePerKg
    ) {
      toast.error("Complete all required pricing fields");
      return;
    }
    const payload = {
      zoneId: formData.zoneId,
      destinationZoneId: formData.destinationZoneId,
      orderType: formData.orderType,
      baseRate: Number(formData.baseRate),
      ratePerKg: Number(formData.ratePerKg),
      codSurcharge: Number(formData.codSurcharge || 0),
    };
    setSaving(true);
    try {
      if (editingId) {
        await apiService.rateCards.updateRateCard(editingId, payload);
        toast.success("Rate card updated");
      } else {
        await apiService.rateCards.createRateCard(payload);
        toast.success("Rate card created");
      }
      resetForm();
      await fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} rate card`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rateCard: RateCardRecord) => {
    if (
      !window.confirm(
        `Delete the ${rateCard.orderType} rate from ${zoneName(sourceZoneId(rateCard))} to ${zoneName(destinationZoneId(rateCard))}?`,
      )
    )
      return;
    try {
      await apiService.rateCards.deleteRateCard(rateCard.id);
      toast.success("Rate card deleted");
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete rate card");
    }
  };

  const currency = (value: number) =>
    `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-sm font-black uppercase">
            Admin pricing configuration
          </p>
          <h1 className="mt-2 inline-block border-4 border-neo-black bg-neo-yellow px-4 py-2 text-3xl shadow-neo">
            RATE CARDS
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm font-bold">
            Configure zone-pair pricing in INR for B2B and B2C shipments.
          </p>
        </div>
        <Button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? "CANCEL" : "+ NEW RATE CARD"}
        </Button>
      </header>

      {showForm && (
        <Card className="bg-neo-blue text-neo-white">
          <div className="border-b-4 border-neo-black pb-3">
            <p className="font-mono text-xs font-black uppercase">
              {editingId ? "Update pricing rule" : "New pricing rule"}
            </p>
            <h2 className="text-2xl">
              {editingId ? "EDIT RATE CARD" : "CREATE RATE CARD"}
            </h2>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select
              label="From zone"
              value={formData.zoneId}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  zoneId: event.target.value,
                }))
              }
              options={[
                { value: "", label: "SELECT ORIGIN" },
                ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
              ]}
            />
            <Select
              label="To zone"
              value={formData.destinationZoneId}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  destinationZoneId: event.target.value,
                }))
              }
              options={[
                { value: "", label: "SELECT DESTINATION" },
                ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
              ]}
            />
            <Select
              label="Order type"
              value={formData.orderType}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  orderType: event.target.value as OrderType,
                }))
              }
              options={Object.values(OrderType).map((type) => ({
                value: type,
                label: type,
              }))}
            />
            <Input
              label="Base rate (INR)"
              type="number"
              min="0"
              step="0.01"
              value={formData.baseRate}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  baseRate: event.target.value,
                }))
              }
            />
            <Input
              label="Rate / kg (INR)"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.ratePerKg}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  ratePerKg: event.target.value,
                }))
              }
            />
            <Input
              label="COD surcharge (INR)"
              type="number"
              min="0"
              step="0.01"
              value={formData.codSurcharge}
              onChange={(event) =>
                setFormData((value) => ({
                  ...value,
                  codSurcharge: event.target.value,
                }))
              }
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? "SAVING..."
                : editingId
                  ? "UPDATE RATE CARD"
                  : "CREATE RATE CARD"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs font-black uppercase">
            Configured routes
          </p>
          <p className="mt-2 font-mono text-4xl font-black">{routeCount}</p>
        </Card>
        <Card className="bg-neo-green text-neo-white">
          <p className="font-mono text-xs font-black uppercase">Average base</p>
          <p className="mt-2 font-mono text-3xl font-black">
            {currency(averageBase)}
          </p>
        </Card>
        <Card className="bg-neo-blue text-neo-white">
          <p className="font-mono text-xs font-black uppercase">Average / kg</p>
          <p className="mt-2 font-mono text-3xl font-black">
            {currency(averagePerKg)}
          </p>
        </Card>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-mono text-sm font-black uppercase">
          {filteredCards.length} pricing rules
        </p>
        <div className="w-full sm:w-64">
          <Select
            aria-label="Filter rate cards by order type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            options={[
              { value: "", label: "ALL ORDER TYPES" },
              ...Object.values(OrderType).map((type) => ({
                value: type,
                label: type,
              })),
            ]}
          />
        </div>
      </div>

      {error ? (
        <Card className="bg-neo-red text-neo-white">
          <p className="font-mono font-black">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>
            TRY AGAIN
          </Button>
        </Card>
      ) : (
        <Table
          headers={[
            "Route",
            "Type",
            "Base rate",
            "Rate / kg",
            "COD surcharge",
            "Actions",
          ]}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={index}
                className="animate-pulse border-b-4 border-neo-black"
              >
                <td colSpan={6} className="p-4">
                  <div className="h-7 bg-neo-gray" />
                </td>
              </tr>
            ))
          ) : filteredCards.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center font-mono font-black">
                {rateCards.length
                  ? "NO RATE CARDS MATCH THIS FILTER"
                  : "NO RATE CARDS CONFIGURED"}
              </td>
            </tr>
          ) : (
            filteredCards.map((rateCard) => (
              <tr
                key={rateCard.id}
                className="border-b-4 border-neo-black bg-neo-white last:border-b-0 hover:bg-neo-gray"
              >
                <td className="p-4">
                  <p className="font-black">
                    {zoneName(sourceZoneId(rateCard))}
                  </p>
                  <p className="font-mono text-xs font-bold">
                    → {zoneName(destinationZoneId(rateCard))}
                  </p>
                </td>
                <td className="p-4">
                  <span className="border-2 border-neo-black bg-neo-yellow px-3 py-1 font-mono text-xs font-black">
                    {rateCard.orderType}
                  </span>
                </td>
                <td className="p-4 font-mono font-black">
                  {currency(rateCard.baseRate)}
                </td>
                <td className="p-4 font-mono font-black">
                  {currency(rateCard.ratePerKg)}
                </td>
                <td className="p-4 font-mono">
                  {currency(rateCard.codSurcharge)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => editRateCard(rateCard)}
                    >
                      EDIT
                    </Button>
                    <Button
                      variant="danger"
                      className="px-2 py-1 text-xs"
                      onClick={() => handleDelete(rateCard)}
                    >
                      DELETE
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      )}
    </div>
  );
}
