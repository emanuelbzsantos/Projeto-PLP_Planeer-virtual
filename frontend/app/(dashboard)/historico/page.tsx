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
  ClockArrowDown,
  XCircle,
  MinusCircle,
  TrendingUp, 
  Filter, 
  Repeat, 
  Clock 
} from "lucide-react";
import { TASK_CATEGORIES, getTaskCategoryConfig } from "@/lib/taskCategories";
import type { Task } from "@/types";

const HISTORICAL_STATUSES = [
  { value: "executada", label: "Executada", shortLabel: "Executada" },
  { value: "parcialmente_executada", label: "Parcialmente Executada", shortLabel: "Parcial" },
  { value: "adiada", label: "Adiada", shortLabel: "Adiada" },
  { value: "cancelada", label: "Cancelada", shortLabel: "Cancelada" },
] as const;

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case "executada":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    case "parcialmente_executada":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "cancelada":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
    case "adiada":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

export default function HistoricoPage() {
  const { tasks, loading, toggleTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "week" | "month" | "year">("all");

  const allTasks = useMemo(() => {
    const map = new Map<number, Task>();
    Object.values(tasks).flat().forEach((task) => map.set(task.id, task));
    return Array.from(map.values());
  }, [tasks]);

  const executadasCount = useMemo(() => allTasks.filter((t) => t.status === "executada").length, [allTasks]);
  const parciaisCount = useMemo(() => allTasks.filter((t) => t.status === "parcialmente_executada").length, [allTasks]);
  const adiadasCount = useMemo(() => allTasks.filter((t) => t.status === "adiada").length, [allTasks]);
  const canceladasCount = useMemo(() => allTasks.filter((t) => t.status === "cancelada").length, [allTasks]);

  const tarefasAtivas = useMemo(() => allTasks.filter((t) => t.status !== "cancelada" && t.status !== "adiada").length, [allTasks]);
  const productivityPercent = tarefasAtivas > 0 ? Math.round((executadasCount / tarefasAtivas) * 100) : 0;

  const historicalTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (t.status) {
        return t.status !== "pendente";
      }
      return t.completed;
    });
  }, [allTasks]);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const filteredTasks = useMemo(() => {
    return historicalTasks.filter((task) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      if (selectedStatus !== "all" && task.status !== selectedStatus) {
        return false;
      }

      if (selectedCategory !== "all" && task.categoria !== selectedCategory) {
        return false;
      }

      if (task.due_date) {
        const sanitized = task.due_date.replace("Z", "").replace(/[+-]\d{2}:\d{2}$/, "");
        const d = new Date(sanitized);
        if (!isNaN(d.getTime())) {
          if (selectedPeriod === "week") {
            if (d < startOfWeek) return false;
          } else if (selectedPeriod === "month") {
            if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
          } else if (selectedPeriod === "year") {
            if (d.getFullYear() !== now.getFullYear()) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => (b.due_date || "").localeCompare(a.due_date || ""));
  }, [historicalTasks, searchTerm, selectedStatus, selectedCategory, selectedPeriod, startOfWeek, now]);

  function formatDateDisplay(dateStr?: string) {
    if (!dateStr) return "--";
    try {
      const sanitized = dateStr.replace("Z", "").replace(/[+-]\d{2}:\d{2}$/, "");
      const d = new Date(sanitized);
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
          <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2.5 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-xs">
            <History size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Histórico de Tarefas
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Acompanhe, filtre e gerencie todas as suas tarefas finalizadas, canceladas ou adiadas.
            </p>
          </div>
        </div>
      </header>

      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Executadas</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : executadasCount}</p>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">Finalizadas com sucesso</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parciais</span>
            <MinusCircle size={16} />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : parciaisCount}</p>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">Parcialmente feitas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Adiadas</span>
            <ClockArrowDown size={16} />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : adiadasCount}</p>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">Reagendadas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Canceladas</span>
            <XCircle size={16} />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "-" : canceladasCount}</p>
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">Descartadas</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 text-white rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-indigo-100 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Produtividade</span>
            <TrendingUp size={16} />
          </div>
          <p className="text-2xl font-black">{loading ? "-" : `${productivityPercent}%`}</p>
          <span className="text-[10.5px] text-indigo-100/80 font-medium">Taxa de conclusão</span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
                title="Limpar pesquisa"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              {HISTORICAL_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter size={13} className="text-slate-400 dark:text-slate-500 hidden sm:inline" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {TASK_CATEGORIES.map((cat) => (
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
            Tudo
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "month" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Este Mês
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
              <History size={42} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhuma tarefa histórica encontrada.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedPeriod !== "all"
                  ? "Tente ajustar os filtros ou a busca acima para encontrar seus registros."
                  : "Tarefas concluídas, canceladas, parciais ou adiadas aparecerão automaticamente aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const categoryConfig = getTaskCategoryConfig(task.categoria);
                const CategoryIcon = categoryConfig.icon;
                const statusBadgeClass = getStatusBadgeClass(task.status);
                const isExecuted = task.status === "executada";

                return (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 rounded-xl transition-all gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <select
                          value={task.status || "executada"}
                          onChange={(e) => toggleTask(task.id, e.target.value)}
                          className={`appearance-none cursor-pointer pl-2 pr-5 py-1 text-[10px] font-bold rounded-lg border shadow-2xs transition-all focus:outline-none focus:ring-2 ${statusBadgeClass}`}
                          title="Alterar status da tarefa"
                        >
                          {HISTORICAL_STATUSES.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.shortLabel}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-current opacity-60">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            title={task.title}
                            className={`text-sm font-semibold break-all truncate ${
                              isExecuted ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"
                            }`}
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

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryConfig.badgeClass}`}>
                        <CategoryIcon size={10} strokeWidth={2.5} className="shrink-0" />
                        <span>{task.categoria || "Estudos"}</span>
                      </span>

                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden md:inline-block">
                        {formatDateDisplay(task.due_date)}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleTask(task.id, "pendente")}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:text-white bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 dark:hover:bg-indigo-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Reabrir tarefa (tornar pendente e retornar para Minha Semana)"
                      >
                        <RotateCcw size={12} />
                        <span className="hidden sm:inline">Reabrir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir tarefa permanentemente"
                      >
                        <Trash2 size={14} />
                      </button>
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
