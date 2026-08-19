"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/Loading";
import { Sidebar } from "@/components/ui/Sidebar";
import { Topbar } from "@/components/ui/Topbar";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neo-gray px-4">
        <Loading label="Loading your workspace" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-neo-gray text-neo-black">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((open) => !open)}
        />
        <main className="relative flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-shell p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
