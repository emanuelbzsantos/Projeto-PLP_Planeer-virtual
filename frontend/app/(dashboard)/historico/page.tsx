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

  // Todas as tarefas únicas
  const allTasks = useMemo(() => {
    const map = new Map<number, Task>();
    Object.values(tasks).flat().forEach((task) => map.set(task.id, task));
    return Array.from(map.values());
  }, [tasks]);

  // Apenas tarefas concluídas
  const completedTasks = useMemo(() => {
    return allTasks.filter((t) => t.completed);
  }, [allTasks]);

  // Métricas
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

  // Filtragem da lista
  const filteredTasks = useMemo(() => {
    return completedTasks.filter((task) => {
      // Filtro de busca
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      // Filtro de categoria
      if (selectedCategory !== "all" && task.categoria !== selectedCategory) {
        return false;
      }

      // Filtro de período
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
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 md:p-8 w-full max-w-none overflow-hidden bg-slate-50/40">
      {/* Top Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600 shadow-xs">
            <History size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Histórico de Conclusão
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Visualize, busque e gerencie todas as tarefas que você já concluiu.
            </p>
          </div>
        </div>
      </header>

      {/* 4 Cards de Métricas em Grid */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Concluídas</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{loading ? "-" : totalCompleted}</p>
          <span className="text-[11px] text-slate-400 font-medium">Realizações acumuladas</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Nesta Semana</span>
            <Calendar size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{loading ? "-" : completedThisWeek}</p>
          <span className="text-[11px] text-slate-400 font-medium">Entregas nos últimos 7 dias</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Neste Mês</span>
            <Clock size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{loading ? "-" : completedThisMonth}</p>
          <span className="text-[11px] text-slate-400 font-medium">Conclusões no mês atual</span>
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

      {/* Toolbar de Filtros e Busca */}
      <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Busca Textual */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro de Categoria */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-end md:self-auto">
          <button
            onClick={() => setSelectedPeriod("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "all" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Todo o Histórico
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "month" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setSelectedPeriod("week")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedPeriod === "week" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Esta Semana
          </button>
        </div>
      </div>

      {/* Lista Estruturada de Tarefas Concluídas */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <CheckCircle2 size={42} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Nenhuma tarefa concluída encontrada.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchTerm || selectedCategory !== "all" || selectedPeriod !== "all"
                  ? "Tente ajustar os filtros ou a busca acima para encontrar seus registros."
                  : "Quando você marcar tarefas como concluídas na tela de Minha Semana, elas aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const categoryStyle = getCategoryStyle(task.categoria);

                return (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl transition-all gap-4"
                  >
                    {/* Checkmark e Detalhes */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            title={task.title}
                            className="text-sm font-semibold text-slate-800 line-through text-slate-500 break-all truncate"
                          >
                            {task.title}
                          </h3>
                          {task.recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              <Repeat size={10} strokeWidth={2.5} />
                              Semanal
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate" title={task.description}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tag de Categoria e Data */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${categoryStyle.badgeClass}`}>
                        {task.categoria || "Sem categoria"}
                      </span>

                      <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                        {formatDateDisplay(task.due_date)}
                      </span>

                      {/* Ações de Reabrir e Excluir */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Reabrir tarefa (tornar pendente)"
                        >
                          <RotateCcw size={12} />
                          <span className="hidden md:inline">Reabrir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir do histórico"
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