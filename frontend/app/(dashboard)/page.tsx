"use client";

import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useMetas } from "@/hooks/useMetas";
import { CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";
import { InteractiveAgenda } from "@/components/dashboard/InteractiveAgenda";

export default function Dashboard() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { metas, loading: metasLoading } = useMetas();
  const [userName, setUserName] = useState("");
  const [todayString, setTodayString] = useState("");

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
  const tarefasPendentes = allTasks.filter(t => !t.completed).length;
  const tarefasConcluidas = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  
  const produtividade = totalTasks === 0 ? 0 : Math.round((tarefasConcluidas / totalTasks) * 100);

  const allMetas = Object.values(metas).flat();
  const metasEmAndamento = allMetas.filter(m => m.status === "parcialmente_cumprida" || m.status === "nao_cumprida").length;

  return (
    <div className="p-6 md:p-8 w-full mx-auto pb-16 bg-slate-50/40 min-h-[calc(100vh-64px)]">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Painel Analítico
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium capitalize">
            {todayString} • Bem-vindo de volta, {userName || "Usuário"}!
          </p>
        </div>
      </header>

      {/* 4 Cards de Indicadores em Grid 100% da Largura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 w-full">
        {/* Card 1: Tarefas Pendentes */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendentes</h2>
            <div className="bg-amber-100/80 p-2 rounded-xl text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800">
            {tasksLoading ? "-" : tarefasPendentes}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Aguardando ação</p>
        </div>

        {/* Card 2: Tarefas Concluídas */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concluídas</h2>
            <div className="bg-emerald-100/80 p-2 rounded-xl text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800">
            {tasksLoading ? "-" : tarefasConcluidas}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Tarefas finalizadas</p>
        </div>

        {/* Card 3: Metas Ativas */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metas Ativas</h2>
            <div className="bg-purple-100/80 p-2 rounded-xl text-purple-600">
              <Target size={18} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-slate-800">
            {metasLoading ? "-" : metasEmAndamento}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Foco no objetivo</p>
        </div>

        {/* Card 4: Produtividade */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 rounded-2xl p-6 shadow-md text-white">
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