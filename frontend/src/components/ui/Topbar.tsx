"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface TopbarProps {
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

export const Topbar = ({ isMenuOpen = false, onMenuToggle }: TopbarProps) => {
  const { user } = useAuth();

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center border-b-3 border-neo-black bg-neo-white px-3 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="grid size-10 shrink-0 place-items-center border-2 border-neo-black bg-neo-yellow text-neo-black shadow-neo-sm neo-interactive hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-controls="parcel-sidebar"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={19} strokeWidth={2.5} />
            ) : (
              <Menu size={19} strokeWidth={2.5} />
            )}
          </button>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-black uppercase leading-tight text-neo-black sm:text-base">
              Operations workspace
            </p>
            <p className="hidden truncate text-xs text-neo-black/60 sm:block">
              {user ? `Signed in as ${user.name}` : "Parcel management console"}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};
