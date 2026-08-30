"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useRequireAuth();

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex-1 flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}