'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiService } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.auth.login({ email, password });
      login(res.data.accessToken, res.data.user);
      toast.success('Logged in successfully!');
      
      const role = res.data.user.role;
      if (role === 'ADMIN') router.push('/dashboard');
      else if (role === 'AGENT') router.push('/deliveries');
      else router.push('/orders');
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl mb-6 text-center border-b-4 border-neo-black pb-4">LOGIN</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? 'PROCESSING...' : 'ENTER'}
        </Button>
      </form>
      <div className="mt-6 text-center font-mono text-sm font-bold">
        Don't have an account? <Link href="/register" className="text-neo-blue hover:underline">Register</Link>
      </div>
    </Card>
  );
}
