'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AreasList() {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await apiService.areas.getAreas();
      setAreas(res.data);
    } catch (err) {
      toast.error('Failed to load areas');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">AREAS</h1>
        <Button>+ NEW AREA</Button>
      </div>
      <Table headers={['Name', 'Pincode', 'Zone', 'Coordinates', 'Actions']}>
        {areas.length === 0 ? (
          <tr><td colSpan={5} className="p-4 text-center font-mono">No areas found</td></tr>
        ) : (
          areas.map((area: any) => (
            <tr key={area.id} className="border-b-4 border-neo-black bg-neo-white hover:bg-neo-gray">
              <td className="p-4 font-bold">{area.name}</td>
              <td className="p-4 font-mono font-bold bg-neo-yellow">{area.pincode}</td>
              <td className="p-4 font-mono">{area.zone?.name}</td>
              <td className="p-4 font-mono text-xs">{area.lat}, {area.lng}</td>
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
