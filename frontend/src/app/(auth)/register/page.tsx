'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.auth.register(formData);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        const fieldError = data.errors[0];
        toast.error(`${fieldError.path.join('.')}: ${fieldError.message}`);
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl mb-6 text-center border-b-4 border-neo-black pb-4 bg-neo-yellow">REGISTER</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? 'PROCESSING...' : 'CREATE ACCOUNT'}
        </Button>
      </form>
      <div className="mt-6 text-center font-mono text-sm font-bold">
        Already have an account? <Link href="/login" className="text-neo-blue hover:underline">Login</Link>
      </div>
    </Card>
  );
}
