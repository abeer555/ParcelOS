'use client';
import React from 'react';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">MY PROFILE</h1>
      
      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={user.name} disabled />
          <Input label="Email" value={user.email} disabled />
          <Input label="Phone" value={user.phone} disabled />
          <Input label="Role" value={user.role} disabled className="bg-neo-gray" />
        </div>
      </Card>

      {user.role === 'AGENT' && (
        <Card className="bg-neo-blue text-neo-white">
          <h2 className="text-2xl mb-4">LOCATION SETTINGS</h2>
          <div className="flex gap-4">
            <Button variant="outline">UPDATE LOCATION</Button>
            <Button variant="success">TOGGLE AVAILABILITY</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
