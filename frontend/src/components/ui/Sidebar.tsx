"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookUser,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  PackagePlus,
  PackageSearch,
  Truck,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navigation: Record<string, NavSection[]> = {
  ADMIN: [
    {
      label: "Overview",
      items: [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Operations",
      items: [
        { name: "Orders", path: "/orders", icon: PackageSearch },
        { name: "Create order", path: "/orders/new", icon: PackagePlus },
      ],
    },
    {
      label: "Service map",
      items: [
        { name: "Zones", path: "/zones", icon: Map },
        { name: "Areas", path: "/areas", icon: MapPin },
      ],
    },
    {
      label: "Management",
      items: [
        { name: "Agents", path: "/agents", icon: Users },
        { name: "Rate cards", path: "/rate-cards", icon: BookUser },
      ],
    },
  ],
  AGENT: [
    {
      label: "Work",
      items: [{ name: "My deliveries", path: "/deliveries", icon: Truck }],
    },
    {
      label: "Account",
      items: [{ name: "Profile", path: "/profile", icon: UserRound }],
    },
  ],
  CUSTOMER: [
    {
      label: "Orders",
      items: [
        { name: "My orders", path: "/orders", icon: PackageSearch },
        { name: "New order", path: "/orders/new", icon: PackagePlus },
        { name: "Track order", path: "/track", icon: MapPin },
      ],
    },
    {
      label: "Account",
      items: [{ name: "Profile", path: "/profile", icon: UserRound }],
    },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    onClose?.();
    // Close the mobile drawer after navigation; onClose is intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const sections = navigation[user.role] ?? [];
  const items = sections.flatMap((section) => section.items);
  const activePath = items
    .filter(
      (item) =>
        pathname === item.path ||
        (item.path !== "/dashboard" && pathname.startsWith(`${item.path}/`)),
    )
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-black/45 transition-opacity md:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        id="parcel-sidebar"
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col border-r-3 border-neo-black bg-neo-white shadow-neo-lg transition-transform duration-200 ease-out md:relative md:z-20 md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-[calc(100%+6px)]"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b-3 border-neo-black bg-neo-yellow px-4">
          <Link
            href="/dashboard"
            className="font-mono text-xl font-black tracking-[-0.06em] text-neo-black focus-visible:outline-offset-4"
            onClick={onClose}
          >
            PARCEL_OS
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center border-2 border-neo-black bg-neo-white text-neo-black shadow-neo-sm neo-interactive hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-neo-black/60">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onClose}
                      className={`flex min-h-10 items-center gap-3 border-2 px-3 py-2 font-mono text-sm font-bold uppercase neo-interactive focus-visible:z-10 ${
                        isActive
                          ? "translate-x-0.5 border-neo-black bg-neo-yellow text-neo-black shadow-neo-sm"
                          : "border-transparent text-neo-black hover:border-neo-black hover:bg-neo-gray"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t-3 border-neo-black bg-neo-gray p-3">
          <div className="flex items-center gap-3">
            <div
              className="grid size-10 shrink-0 place-items-center border-2 border-neo-black bg-neo-yellow font-mono text-sm font-black text-neo-black"
              aria-hidden="true"
            >
              {initials || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm font-bold text-neo-black">
                {user.name}
              </p>
              <p className="truncate text-xs text-neo-black/65">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="grid size-9 shrink-0 place-items-center border-2 border-transparent text-neo-black neo-interactive hover:border-neo-black hover:bg-neo-red hover:text-neo-white"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} strokeWidth={2.25} />
            </button>
          </div>
          <div className="mt-2 inline-flex border border-neo-black/30 bg-neo-white px-1.5 py-0.5 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-neo-black">
            {user.role}
          </div>
        </div>
      </aside>
    </>
  );
};
