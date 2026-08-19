import React from "react";
import { ChargeBreakdown as ChargeBreakdownType } from "@/types";
import { Card } from "./ui/Card";

type CompatibleChargeBreakdown = Partial<ChargeBreakdownType> & {
  totalCharge?: number;
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const amount = (value: number | undefined) =>
  inrFormatter.format(Number.isFinite(value) ? (value as number) : 0);

export const ChargeBreakdownDisplay = ({
  data,
}: {
  data: CompatibleChargeBreakdown;
}) => {
  const total = data.total ?? data.totalCharge ?? 0;
  const billableWeight = Number.isFinite(data.billableWeight)
    ? data.billableWeight
    : 0;
  const volumetricWeight = Number.isFinite(data.volumetricWeight)
    ? data.volumetricWeight
    : 0;

  return (
    <Card className="bg-neo-yellow p-4 sm:p-6">
      <div className="flex flex-col gap-1 border-b-4 border-neo-black pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-wider">
            Price preview
          </p>
          <h3 className="text-2xl font-black">CHARGE BREAKDOWN</h3>
        </div>
        <p className="font-mono text-xs font-bold">
          ALL AMOUNTS INCLUDE APPLICABLE CHARGES
        </p>
      </div>

      <dl className="mt-4 flex flex-col gap-3 font-mono text-sm sm:text-base">
        <div className="flex items-center justify-between gap-4">
          <dt>Base charge</dt>
          <dd className="font-bold">{amount(data.baseCharge)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Weight charge</dt>
          <dd className="font-bold">{amount(data.weightCharge)}</dd>
        </div>
        {(data.codSurcharge ?? 0) > 0 && (
          <div className="flex items-center justify-between gap-4 text-neo-red">
            <dt className="font-bold">COD surcharge</dt>
            <dd className="font-black">{amount(data.codSurcharge)}</dd>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 border-t-2 border-neo-black pt-3 text-xs sm:text-sm">
          <div className="border-2 border-neo-black bg-neo-white p-2">
            <dt className="font-bold uppercase">Volumetric</dt>
            <dd>{volumetricWeight?.toFixed(2)} kg</dd>
          </div>
          <div className="border-2 border-neo-black bg-neo-white p-2">
            <dt className="font-bold uppercase">Billable</dt>
            <dd>{billableWeight?.toFixed(2)} kg</dd>
          </div>
        </div>
        <div className="mt-1 flex items-end justify-between gap-4 border-t-4 border-neo-black pt-4">
          <dt className="text-lg font-black uppercase sm:text-xl">Total</dt>
          <dd className="text-2xl font-black sm:text-3xl">{amount(total)}</dd>
        </div>
      </dl>
    </Card>
  );
};
