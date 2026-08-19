import React from 'react';
import { ChargeBreakdown as ChargeBreakdownType } from '@/types';
import { Card } from './ui/Card';

export const ChargeBreakdownDisplay = ({ data }: { data: ChargeBreakdownType }) => {
  return (
    <Card className="bg-neo-yellow">
      <h3 className="text-xl mb-4">Charge Breakdown</h3>
      <div className="flex flex-col gap-2 font-mono">
        <div className="flex justify-between">
          <span>Base Charge:</span>
          <span>${data.baseCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Weight Charge ({data.billableWeight}kg):</span>
          <span>${data.weightCharge.toFixed(2)}</span>
        </div>
        {data.codSurcharge > 0 && (
          <div className="flex justify-between text-neo-red">
            <span>COD Surcharge:</span>
            <span>${data.codSurcharge.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t-4 border-neo-black pt-2 mt-2 font-bold text-xl">
          <span>Total:</span>
          <span>${data.total.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};
