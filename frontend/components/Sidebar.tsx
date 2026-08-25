"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Target, Settings, Layout } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Tarefas", icon: CheckSquare, path: "/tarefas" },
    { name: "Metas", icon: Target, path: "/metas" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[var(--color-border)] h-screen sticky top-0 flex flex-col">
      {/* Logo / Título do app */}
      <div className="p-6 flex items-center gap-2">
        <div className="bg-[var(--color-primary)] text-white p-1.5 rounded-lg">
          <Layout size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
          Planner Virtual
        </h1>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menu.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname?.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-[15px] ${
                isActive
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[#F3F4F6] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile e Configurações */}
      <div className="p-4 border-t border-[var(--color-border)] space-y-1">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[#F3F4F6] hover:text-[var(--color-text)] transition-colors group font-medium text-[15px]"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          Configurações
        </Link>
        
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.name}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
