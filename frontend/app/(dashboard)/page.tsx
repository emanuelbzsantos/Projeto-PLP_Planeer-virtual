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
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      setTodayString(new Date().toLocaleDateString('pt-BR', options));

      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserName(u.name.split(' ')[0]);
        } catch {}
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // --- LÓGICA DE DADOS ANALÍTICOS ---
  const allTasks = Array.from(
    new Map(Object.values(tasks).flat().map(task => [task.id, task])).values()
  );
  const tarefasPendentes = allTasks.filter(t => !t.completed).length;
  const tarefasConcluidas = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  
  // Cálculo de Produtividade (Porcentagem)
  const produtividade = totalTasks === 0 ? 0 : Math.round((tarefasConcluidas / totalTasks) * 100);

  const allMetas = Object.values(metas).flat();
  const metasEmAndamento = allMetas.filter(m => m.status === 'parcialmente_cumprida' || m.status === 'nao_cumprida').length;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-20 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Painel Analítico
          </h1>
          <p className="text-slate-500 mt-2 font-medium capitalize">
            {todayString} · Bem-vindo de volta, {userName || "Usuário"}!
          </p>
        </div>
      </header>

      {/* --- 4 CARDS OBRIGATÓRIOS DA ISSUE #19 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Card 1: Tarefas Pendentes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pendentes</h2>
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-800">
            {tasksLoading ? "-" : tarefasPendentes}
          </p>
          <p className="text-sm text-slate-400 mt-2 font-medium">Aguardando ação</p>
        </div>

        {/* Card 2: Tarefas Concluídas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Concluídas</h2>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-800">
            {tasksLoading ? "-" : tarefasConcluidas}
          </p>
          <p className="text-sm text-slate-400 mt-2 font-medium">Tarefas finalizadas</p>
        </div>

        {/* Card 3: Metas em Andamento */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Metas Ativas</h2>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Target size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-800">
            {metasLoading ? "-" : metasEmAndamento}
          </p>
          <p className="text-sm text-slate-400 mt-2 font-medium">Foco no objetivo</p>
        </div>

        {/* Card 4: Indicador de Produtividade */}
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-md text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Produtividade</h2>
            <div className="bg-indigo-500 p-2 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black">{tasksLoading ? "-" : `${produtividade}%`}</p>
          </div>
          {/* Mini barra de progresso branca */}
          <div className="w-full bg-indigo-800 h-1.5 rounded-full mt-4">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${produtividade}%` }}
            ></div>
          </div>
        </div>
      </div>

      <InteractiveAgenda tasks={tasks} loading={tasksLoading} />
    </div>
  );
}
