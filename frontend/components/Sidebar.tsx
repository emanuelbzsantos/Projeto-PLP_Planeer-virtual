// ============================================================
// Componente Sidebar — Barra lateral de navegação
// ============================================================
// Este componente é exibido em TODAS as páginas do site.
// Ele contém os links de navegação (Dashboard, Tarefas, Metas).
//
// Conceitos utilizados:
//   - usePathname(): hook do Next.js que retorna a URL atual
//   - Link: componente do Next.js para navegar sem recarregar a página
//   - Ícones: importados da biblioteca "lucide-react"
// ============================================================

"use client"; // Indica ao Next.js que este componente roda no navegador

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Target, Settings } from "lucide-react";

export default function Sidebar() {
  // Pega a URL atual do navegador (ex: "/tarefas")
  const pathname = usePathname();

  // Lista de itens do menu com nome, ícone e caminho
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Tarefas", icon: CheckSquare, path: "/tarefas" },
    { name: "Metas", icon: Target, path: "/metas" },
  ];

  return (
    <aside className="w-64 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col transition-colors duration-300">
      {/* Logo / Título do app */}
      <div className="p-6 flex items-center justify-center">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Planner Virtual
        </h1>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 px-4 space-y-2 mt-8">
        {menu.map((item) => {
          // Verifica se este link é o que está ativo (URL atual)
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname?.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Link de configurações no rodapé */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800/50">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
        >
          <Settings
            size={20}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
