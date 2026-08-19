'use client';
import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from './Button';

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-20 border-b-4 border-neo-black bg-neo-white flex items-center justify-between px-8 shadow-neo z-10 relative">
      <div className="font-mono font-bold text-lg">
        {user ? `Welcome, ${user.name}` : ''}
      </div>
      <div>
        <Button variant="danger" onClick={logout}>LOGOUT</Button>
      </div>
    </div>
  );
};
