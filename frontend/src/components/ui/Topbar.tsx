'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from './Button';
import { Moon, Sun } from 'lucide-react';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div className="h-20 border-b-4 border-neo-black bg-neo-white flex items-center justify-between px-8 shadow-neo z-10 relative">
      <div className="font-mono font-bold text-lg text-neo-black">
        {user ? `Welcome, ${user.name}` : ''}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 border-4 border-neo-black bg-neo-gray hover:bg-neo-yellow shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={20} className="text-neo-black" /> : <Moon size={20} className="text-neo-black" />}
        </button>
        <Button variant="danger" onClick={logout}>LOGOUT</Button>
      </div>
    </div>
  );
};
