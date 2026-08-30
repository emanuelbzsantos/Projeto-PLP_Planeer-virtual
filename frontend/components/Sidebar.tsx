"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Target, CalendarClock, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"; import { apiDelete } from "@/hooks/useApi"

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); async function handleLogout() { try { await apiDelete("/logout"); } catch (e) { console.error("Erro ao fazer logout", e); } finally { localStorage.removeItem("auth_token"); localStorage.removeItem("user"); router.push("/login"); } }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
    { name: "Metas", href: "/metas", icon: Target },
    { name: "Planejamento", href: "/planejamento", icon: CalendarClock },
  ];

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-full py-8 px-4 flex flex-col gap-6 items-center z-50">
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`p-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      {/* Divisória sutil */}
      <div className="w-8 h-px bg-slate-200 my-2"></div>

      <div className="flex flex-col gap-4">
        <Link href="/configuracoes" title="Configurações" className="p-3 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-all">
          <Settings size={22} />
        </Link>
        <button title="Sair da conta" className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all mt-2" onClick={handleLogout}>
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}