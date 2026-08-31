"use client";

import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useMetas } from "@/hooks/useMetas";
import { Clock, CheckCircle2, Target, TrendingUp, XCircle, ClockArrowDown } from "lucide-react";
import { InteractiveAgenda } from "@/components/dashboard/InteractiveAgenda";

export default function Dashboard() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { metas, loading: metasLoading } = useMetas();
  const [todayString, setTodayString] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
      setTodayString(new Date().toLocaleDateString("pt-BR", options));

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserName(u.name.split(" ")[0]);
        } catch {}
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const allTasks = Array.from(
    new Map(Object.values(tasks).flat().map(task => [task.id, task])).values()
  );

  // Categorização avançada dos status
  const tarefasConcluidas = allTasks.filter(t => t.status === "executada").length;
  const tarefasCanceladas = allTasks.filter(t => t.status === "cancelada").length;
  const tarefasAdiadas = allTasks.filter(t => t.status === "adiada").length;
  
  // Pendentes reais (exclui executadas, canceladas e adiadas)
  const tarefasPendentes = allTasks.filter(t => t.status !== "executada" && t.status !== "cancelada" && t.status !== "adiada").length;
  
  // Total de tarefas ativas (excluindo canceladas e adiadas para o cálculo justo de produtividade)
  const tarefasAtivas = allTasks.filter(t => t.status !== "cancelada" && t.status !== "adiada").length;

  const produtividade = tarefasAtivas === 0 ? 0 : Math.round((tarefasConcluidas / tarefasAtivas) * 100);

  const allMetas = Object.values(metas).flat();
  const metasEmAndamento = allMetas.filter(m => m.status === "parcialmente_cumprida" || m.status === "nao_cumprida").length;

  return (
    <div className="p-6 md:p-8 w-full mx-auto pb-16 bg-slate-50/40 dark:bg-transparent min-h-[calc(100vh-64px)]">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Painel Analítico
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium capitalize">
            {todayString} • Bem-vindo de volta, {userName || "Usuário"}!
          </p>
        </div>
      </header>

      {/* Grid com 6 Cards de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 w-full">
        {/* Card 1: Tarefas Pendentes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pendentes</h2>
            <div className="bg-amber-100/80 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
            {tasksLoading ? "-" : tarefasPendentes}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Aguardando ação</p>
        </div>

        {/* Card 2: Tarefas Concluídas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Concluídas</h2>
            <div className="bg-emerald-100/80 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
            {tasksLoading ? "-" : tarefasConcluidas}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Tarefas finalizadas</p>
        </div>

        {/* Card 3: Tarefas Adiadas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Adiadas</h2>
            <div className="bg-blue-100/80 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <ClockArrowDown size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
            {tasksLoading ? "-" : tarefasAdiadas}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Reagendadas</p>
        </div>

        {/* Card 4: Tarefas Canceladas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Canceladas</h2>
            <div className="bg-rose-100/80 dark:bg-rose-900/30 p-2 rounded-xl text-rose-600 dark:text-rose-400">
              <XCircle size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
            {tasksLoading ? "-" : tarefasCanceladas}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Descartadas</p>
        </div>

        {/* Card 5: Metas Ativas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metas Ativas</h2>
            <div className="bg-purple-100/80 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
              <Target size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">
            {metasLoading ? "-" : metasEmAndamento}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Foco no objetivo</p>
        </div>

        {/* Card 6: Produtividade */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 rounded-2xl p-5 shadow-md text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Produtividade</h2>
            <div className="bg-white/20 p-2 rounded-xl text-white">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-black">{tasksLoading ? "-" : `${produtividade}%`}</p>
          </div>
          <div className="w-full bg-black/20 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${produtividade}%` }}
            ></div>
          </div>
        </div>
      </div>

      <InteractiveAgenda tasks={tasks} loading={tasksLoading} />
    </div>
  );
}