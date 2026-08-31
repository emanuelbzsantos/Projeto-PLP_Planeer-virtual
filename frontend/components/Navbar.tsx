"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  CalendarClock, 
  History,
  Settings, 
  LogOut,
  CalendarCheck2,
  BarChart2
} from "lucide-react";
import { apiDelete } from "@/hooks/useApi";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiDelete("/logout");
    } catch (e) {
      console.error("Erro ao fazer logout", e);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
    { name: "Metas", href: "/metas", icon: Target },
    { name: "Planejamento", href: "/planejamento", icon: CalendarClock },
    { name: "Histórico", href: "/historico", icon: History },
    { name: "Relatórios", href: "/relatorios", icon: BarChart2 },
  ];

  return (
    <header className="print:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-[#141518]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
      <div className="w-full px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-indigo-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <CalendarCheck2 size={20} />
            </div>
            <span className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              Planner<span className="text-[var(--color-primary)]">Virtual</span>
            </span>
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[var(--color-primary)]" : "text-slate-400 dark:text-slate-500"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Right Actions: Theme, Settings & Logout */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/configuracoes"
            title="Configurações"
            className={`p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[var(--color-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
              pathname === "/configuracoes" ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : ""
            }`}
          >
            <Settings size={20} />
          </Link>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="flex items-center gap-1.5 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline text-xs font-medium">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}