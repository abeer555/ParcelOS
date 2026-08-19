'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ZonesList() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await apiService.zones.getZones();
      setZones(res.data);
    } catch (err) {
      toast.error('Failed to load zones');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">ZONES</h1>
        <Button>+ NEW ZONE</Button>
      </div>
      <Table headers={['Name', 'Description', 'Areas Count', 'Actions']}>
        {zones.length === 0 ? (
          <tr><td colSpan={4} className="p-4 text-center font-mono">No zones found</td></tr>
        ) : (
          zones.map((zone: any) => (
            <tr key={zone.id} className="border-b-4 border-neo-black bg-neo-white hover:bg-neo-gray">
              <td className="p-4 font-bold">{zone.name}</td>
              <td className="p-4">{zone.description}</td>
              <td className="p-4 font-mono">{zone._count?.areas || 0}</td>
              <td className="p-4">
                <Button variant="outline" className="py-1 px-2 text-sm">EDIT</Button>
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
