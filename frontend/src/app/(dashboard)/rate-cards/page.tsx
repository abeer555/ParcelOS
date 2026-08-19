'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RateCardsList() {
  const [rateCards, setRateCards] = useState([]);

  useEffect(() => {
    fetchRateCards();
  }, []);

  const fetchRateCards = async () => {
    try {
      const res = await apiService.rateCards.getRateCards();
      setRateCards(res.data);
    } catch (err) {
      toast.error('Failed to load rate cards');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">RATE CARDS</h1>
        <Button>+ NEW RATE CARD</Button>
      </div>
      <Table headers={['From Zone', 'To Zone', 'Type', 'Base Rate', 'Rate/kg', 'COD Surcharge']}>
        {rateCards.length === 0 ? (
          <tr><td colSpan={6} className="p-4 text-center font-mono">No rate cards found</td></tr>
        ) : (
          rateCards.map((rc: any) => (
            <tr key={rc.id} className="border-b-4 border-neo-black bg-neo-white hover:bg-neo-gray font-mono">
              <td className="p-4">{rc.fromZone?.name}</td>
              <td className="p-4">{rc.toZone?.name}</td>
              <td className="p-4 font-bold">{rc.orderType}</td>
              <td className="p-4">${rc.baseRate}</td>
              <td className="p-4">${rc.ratePerKg}</td>
              <td className="p-4">${rc.codSurcharge}</td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
