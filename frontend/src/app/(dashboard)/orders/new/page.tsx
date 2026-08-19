'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ChargeBreakdownDisplay } from '@/components/ChargeBreakdown';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreateOrder() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pickupAddress: '', pickupPincode: '',
    dropAddress: '', dropPincode: '',
    length: '', breadth: '', height: '',
    actualWeight: '', type: 'B2C', paymentType: 'PREPAID'
  });
  const [chargeData, setChargeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCalculate = async () => {
    try {
      const payload = {
        pickupPincode: formData.pickupPincode, 
        dropPincode: formData.dropPincode,
        packageLength: Number(formData.length), 
        packageBreadth: Number(formData.breadth), 
        packageHeight: Number(formData.height),
        actualWeight: Number(formData.actualWeight), 
        orderType: formData.type, 
        paymentType: formData.paymentType
      };
      const res = await apiService.orders.calculateCharge(payload);
      setChargeData(res.data);
      toast.success('Charge calculated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to calculate charge. Ensure valid pincodes/zones.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        pickupAddress: formData.pickupAddress,
        pickupPincode: formData.pickupPincode,
        dropAddress: formData.dropAddress,
        dropPincode: formData.dropPincode,
        packageLength: Number(formData.length),
        packageBreadth: Number(formData.breadth),
        packageHeight: Number(formData.height),
        actualWeight: Number(formData.actualWeight),
        orderType: formData.type,
        paymentType: formData.paymentType
      };
      const res = await apiService.orders.createOrder(payload);
      toast.success('Order created successfully!');
      router.push(`/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-3xl bg-neo-green text-neo-white inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">CREATE ORDER</h1>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Pickup Address" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} />
          <Input label="Pickup Pincode" name="pickupPincode" value={formData.pickupPincode} onChange={handleChange} />
          <Input label="Drop Address" name="dropAddress" value={formData.dropAddress} onChange={handleChange} />
          <Input label="Drop Pincode" name="dropPincode" value={formData.dropPincode} onChange={handleChange} />
          
          <div className="flex gap-2 col-span-1 md:col-span-2">
            <Input label="L (cm)" name="length" type="number" value={formData.length} onChange={handleChange} />
            <Input label="B (cm)" name="breadth" type="number" value={formData.breadth} onChange={handleChange} />
            <Input label="H (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
          </div>
          
          <Input label="Actual Weight (kg)" name="actualWeight" type="number" value={formData.actualWeight} onChange={handleChange} />
          <Select 
            label="Order Type" name="type" value={formData.type} onChange={handleChange}
            options={[{ value: 'B2C', label: 'B2C' }, { value: 'B2B', label: 'B2B' }]} 
          />
          <Select 
            label="Payment Type" name="paymentType" value={formData.paymentType} onChange={handleChange}
            options={[{ value: 'PREPAID', label: 'PREPAID' }, { value: 'COD', label: 'COD' }]} 
          />
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={handleCalculate} type="button">CALCULATE CHARGE</Button>
        </div>
      </Card>

      {chargeData && (
        <div className="flex flex-col gap-6">
          <ChargeBreakdownDisplay data={chargeData} />
          <Button onClick={handleSubmit} disabled={loading} className="py-4 text-xl">CONFIRM AND CREATE ORDER</Button>
        </div>
      )}
    </div>
  );
}
