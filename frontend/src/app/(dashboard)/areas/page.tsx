'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AreasList() {
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', pincode: '', zoneId: '', lat: '', lng: ''
  });

  useEffect(() => {
    fetchAreas();
    fetchZones();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await apiService.areas.getAreas();
      setAreas(res.data);
    } catch (err) {
      toast.error('Failed to load areas');
    }
  };

  const fetchZones = async () => {
    try {
      const res = await apiService.zones.getZones();
      setZones(res.data);
    } catch (err) {
      toast.error('Failed to load zones');
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.pincode || !formData.zoneId || !formData.lat || !formData.lng) {
        toast.error('All fields are required');
        return;
      }
      
      const payload = {
        name: formData.name,
        pincode: formData.pincode,
        zoneId: formData.zoneId,
        lat: Number(formData.lat),
        lng: Number(formData.lng)
      };
      
      await apiService.areas.createArea(payload);
      toast.success('Area created successfully!');
      setIsAdding(false);
      setFormData({ name: '', pincode: '', zoneId: '', lat: '', lng: '' });
      fetchAreas();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create area');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">AREAS</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'CANCEL' : '+ NEW AREA'}
        </Button>
      </div>
      
      {isAdding && (
        <Card className="bg-neo-white border-4 border-neo-black">
          <h2 className="text-2xl mb-4 text-neo-black">Add New Area</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Area Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
            <Select 
              label="Zone" 
              name="zoneId" 
              value={formData.zoneId} 
              onChange={handleChange}
              options={[{ value: '', label: 'Select a Zone' }, ...zones.map((z: any) => ({ value: z.id, label: z.name }))]}
            />
            <div className="flex gap-2">
              <Input label="Latitude" name="lat" type="number" value={formData.lat} onChange={handleChange} />
              <Input label="Longitude" name="lng" type="number" value={formData.lng} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreate}>SAVE AREA</Button>
          </div>
        </Card>
      )}

      <Table headers={['Name', 'Pincode', 'Zone', 'Coordinates', 'Actions']}>
        {areas.length === 0 ? (
          <tr><td colSpan={5} className="p-4 text-center font-mono text-black">No areas found</td></tr>
        ) : (
          areas.map((area: any) => (
            <tr key={area.id} className="border-b-4 border-neo-black bg-neo-white hover:bg-neo-gray text-black">
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
