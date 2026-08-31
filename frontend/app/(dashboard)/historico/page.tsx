"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { 
  History, 
  Search, 
  X, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Filter, 
  Repeat, 
  Clock 
} from "lucide-react";
import { CATEGORIES, getCategoryStyle } from "@/lib/categories";
import type { Task } from "@/types";

export default function HistoricoPage() {
  const { tasks, loading, toggleTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "week" | "month" | "year">("all");

  const allTasks = useMemo(() => {
    const map = new Map<number, Task>();
    Object.values(tasks).flat().forEach((task) => map.set(task.id, task));
    return Array.from(map.values());
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return allTasks.filter((t) => t.completed);
  }, [allTasks]);

  const totalCompleted = completedTasks.length;
  const totalTasks = allTasks.length;
  const productivityPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const completedThisWeek = useMemo(() => {
    return completedTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d >= startOfWeek;
    }).length;
  }, [completedTasks, startOfWeek]);

  const completedThisMonth = useMemo(() => {
    return completedTasks.filter((t) => {
      const d = new Date(t.due_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [completedTasks, now]);

  const filteredTasks = useMemo(() => {
    return completedTasks.filter((task) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      if (selectedCategory !== "all" && task.categoria !== selectedCategory) {
        return false;
      }

      if (selectedPeriod === "week") {
        const d = new Date(task.due_date);
        if (d < startOfWeek) return false;
      } else if (selectedPeriod === "month") {
        const d = new Date(task.due_date);
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (selectedPeriod === "year") {
        const d = new Date(task.due_date);
        if (d.getFullYear() !== now.getFullYear()) return false;
      }

      return true;
    }).sort((a, b) => b.due_date.localeCompare(a.due_date));
  }, [completedTasks, searchTerm, selectedCategory, selectedPeriod, startOfWeek, now]);

  function formatDateDisplay(dateStr: string) {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "--";
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 md:p-8 w-full max-w-none overflow-hidden bg-slate-50/40 dark:bg-transparent">
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-950/40 p-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-xs">
            <History size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Historico de Conclusao
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Visualize, busque e gerencie todas as tarefas que voce ja concluiu.
            </p>
          </div>
        </div>
      </header>

      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Concluidas</span>
            <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : totalCompleted}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Realizacoes acumuladas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Nesta Semana</span>
            <Calendar size={16} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : completedThisWeek}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Entregas nos ultimos 7 dias</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Neste Mes</span>
            <Clock size={16} className="text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : completedThisMonth}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Conclusoes no mes atual</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-100 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Sucesso</span>
            <TrendingUp size={16} />
          </div>
          <p className="text-2xl font-black">{loading ? "-" : `${productivityPercent}%`}</p>
          <span className="text-[11px] text-emerald-100/80 font-medium">De todas as tarefas criadas</span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Buscar no historico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter size={14} className="text-slate-400 dark:text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-end md:self-auto">
          <button
            onClick={() => setSelectedPeriod("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "all" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Todo o Historico
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "month" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setSelectedPeriod("week")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "week" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Esta Semana
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <CheckCircle2 size={42} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhuma tarefa concluida encontrada.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                {searchTerm || selectedCategory !== "all" || selectedPeriod !== "all"
                  ? "Tente ajustar os filtros ou a busca acima para encontrar seus registros."
                  : "Quando voce marcar tarefas como concluidas na tela de Minha Semana, elas aparecerao aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const categoryStyle = getCategoryStyle(task.categoria);

                return (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 rounded-xl transition-all gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            title={task.title}
                            className="text-sm font-semibold line-through text-slate-500 dark:text-slate-400 break-all truncate"
                          >
                            {task.title}
                          </h3>
                          {task.recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
                              <Repeat size={10} strokeWidth={2.5} />
                              Semanal
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate" title={task.description}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${categoryStyle.badgeClass}`}>
                        {task.categoria || "Sem categoria"}
                      </span>

                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline-block">
                        {formatDateDisplay(task.due_date)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:text-white bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 dark:hover:bg-indigo-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Reabrir tarefa (tornar pendente)"
                        >
                          <RotateCcw size={12} />
                          <span className="hidden md:inline">Reabrir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Excluir do historico"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}