'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Moon, Sun } from 'lucide-react';

export default function LandingPage() {
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b-4 border-neo-black bg-neo-yellow p-6 flex justify-between items-center">
        <h1 className="text-3xl font-black text-neo-black">PARCEL_OS</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleDark}
            className="p-2 border-4 border-neo-black bg-neo-white hover:bg-neo-gray shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={20} className="text-neo-black" /> : <Moon size={20} className="text-neo-black" />}
          </button>
          <Link href="/track">
            <Button variant="outline">Track Order</Button>
          </Link>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-neo-blue text-neo-white border-b-4 border-neo-black p-20 text-center flex flex-col items-center">
          <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">SHIP. TRACK.<br/>DELIVER.</h2>
          <p className="text-xl max-w-2xl font-mono bg-neo-black p-4 mb-10 border-4 border-neo-white">
            ParcelOS — a full-stack last-mile delivery platform. Manage zones, rate cards, agents, and real-time order tracking from a single dashboard.
          </p>
          <div className="flex gap-6">
            <Link href="/register">
              <Button className="text-2xl py-4 px-8 bg-neo-yellow text-neo-black border-neo-black shadow-[8px_8px_0_0_var(--shadow-color)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">GET STARTED</Button>
            </Link>
          </div>
        </section>

        <section className="p-20 grid grid-cols-1 md:grid-cols-3 gap-10 bg-neo-gray">
          <Card className="bg-neo-yellow transform -rotate-2">
            <h3 className="text-2xl mb-4 text-neo-black">Smart Routing</h3>
            <p className="font-mono text-neo-black">Auto-assigns orders to the nearest available agent based on zone and location.</p>
          </Card>
          <Card className="bg-neo-white transform rotate-1">
            <h3 className="text-2xl mb-4 text-neo-black">Real-time Tracking</h3>
            <p className="font-mono text-neo-black">Granular timestamped delivery updates with full tracking history for every order.</p>
          </Card>
          <Card className="bg-neo-green transform -rotate-1">
            <h3 className="text-2xl mb-4 text-neo-black">Rate Engine</h3>
            <p className="font-mono text-neo-black">Dynamic pricing based on zones, volumetric weight, order type, and COD surcharges.</p>
          </Card>
        </section>
      </main>

      <footer className="border-t-4 border-neo-black bg-neo-black text-neo-white p-6 text-center font-mono uppercase font-bold">
        &copy; {new Date().getFullYear()} ParcelOS. All rights reserved.
      </footer>
    </div>
  );
}
