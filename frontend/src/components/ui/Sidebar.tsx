'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackageSearch, PackagePlus, Map, MapPin, Users, BookUser, Truck } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = {
    ADMIN: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Orders', path: '/orders', icon: PackageSearch },
      { name: 'Create Order', path: '/orders/new', icon: PackagePlus },
      { name: 'Zones', path: '/zones', icon: Map },
      { name: 'Areas', path: '/areas', icon: MapPin },
      { name: 'Agents', path: '/agents', icon: Users },
      { name: 'Rate Cards', path: '/rate-cards', icon: BookUser },
    ],
    AGENT: [
      { name: 'My Deliveries', path: '/deliveries', icon: Truck },
      { name: 'Profile', path: '/profile', icon: Users },
    ],
    CUSTOMER: [
      { name: 'My Orders', path: '/orders', icon: PackageSearch },
      { name: 'New Order', path: '/orders/new', icon: PackagePlus },
      { name: 'Track Order', path: '/track', icon: MapPin },
      { name: 'Profile', path: '/profile', icon: Users },
    ]
  };

  const navLinks = links[user.role] || [];

  return (
    <div className="w-64 border-r-4 border-neo-black bg-neo-white min-h-screen flex flex-col shadow-neo">
      <div className="p-6 border-b-4 border-neo-black bg-neo-yellow">
        <h1 className="text-2xl font-black font-mono">PARCEL_OS</h1>
        <div className="text-xs font-mono font-bold mt-1 bg-neo-black text-neo-white inline-block px-1">{user.role}</div>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link key={link.path} href={link.path} 
              className={`flex items-center gap-3 p-3 font-mono font-bold uppercase border-4 border-transparent hover:border-neo-black transition-all ${isActive ? 'bg-neo-black text-neo-white border-neo-black' : 'text-neo-black hover:bg-neo-gray'}`}
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
