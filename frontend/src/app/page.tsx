import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-4 border-neo-black bg-neo-yellow p-6 flex justify-between items-center">
        <h1 className="text-3xl font-black">PARCEL_OS</h1>
        <div className="flex gap-4">
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
          <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">TRACK. DELIVER.<br/>DOMINATE.</h2>
          <p className="text-xl max-w-2xl font-mono bg-neo-black p-4 mb-10 border-4 border-neo-white">
            The ultimate neo-brutalist last-mile delivery tracking platform. Fast, reliable, and unignorable.
          </p>
          <div className="flex gap-6">
            <Link href="/register">
              <Button className="text-2xl py-4 px-8 bg-neo-yellow text-neo-black border-neo-black shadow-[8px_8px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">GET STARTED</Button>
            </Link>
          </div>
        </section>

        <section className="p-20 grid grid-cols-1 md:grid-cols-3 gap-10 bg-neo-gray">
          <Card className="bg-neo-yellow transform -rotate-2">
            <h3 className="text-2xl mb-4">Smart Routing</h3>
            <p className="font-mono">Assigns orders automatically to the best available agent based on zones.</p>
          </Card>
          <Card className="bg-neo-white transform rotate-1">
            <h3 className="text-2xl mb-4">Real-time Tracking</h3>
            <p className="font-mono">Keep customers informed with granular, timestamped delivery updates and maps.</p>
          </Card>
          <Card className="bg-neo-green text-neo-white transform -rotate-1">
            <h3 className="text-2xl mb-4">Rate Engine</h3>
            <p className="font-mono">Dynamic pricing rules based on zones, volumetric weight, and order types.</p>
          </Card>
        </section>
      </main>

      <footer className="border-t-4 border-neo-black bg-neo-black text-neo-white p-6 text-center font-mono uppercase font-bold">
        &copy; {new Date().getFullYear()} ParcelOS. All rights reserved.
      </footer>
    </div>
  );
}
