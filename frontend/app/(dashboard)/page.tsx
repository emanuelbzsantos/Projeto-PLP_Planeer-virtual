"use client";

import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useMetas } from "@/hooks/useMetas";
import { CheckCircle2, Clock, Target, TrendingUp, Calendar, ArrowRight, Repeat } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { metas, loading: metasLoading } = useMetas();
  const [userName, setUserName] = useState("");
  const [todayString, setTodayString] = useState("");

  const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const todayIndex = new Date().getDay();
  const todayName = diasSemana[todayIndex];

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    setTodayString(new Date().toLocaleDateString('pt-BR', options));

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name.split(' ')[0]);
      } catch (e) {}
    }
  }, []);

  // --- LÓGICA DE DADOS ANALÍTICOS ---
  const allTasks = Object.values(tasks).flat();
  const tarefasPendentes = allTasks.filter(t => !t.completed).length;
  const tarefasConcluidas = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  
  // Cálculo de Produtividade (Porcentagem)
  const produtividade = totalTasks === 0 ? 0 : Math.round((tarefasConcluidas / totalTasks) * 100);

  const allMetas = Object.values(metas).flat();
  const metasEmAndamento = allMetas.filter(m => m.status === 'parcialmente_cumprida' || m.status === 'nao_cumprida').length;

  // Separando os lembretes do dia
  const tarefasDeHoje = tasks[todayName] || [];
  const lembretesDeHoje = tarefasDeHoje.filter(t => !t.completed).slice(0, 4); // Pega os 4 primeiros pendentes

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

{/* --- MÓDULO INFERIOR: LEMBRETES E CALENDÁRIO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Lembretes */}
        <section className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800">Sua Agenda Hoje</h2>
            <Link href="/tarefas" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Ver tudo &rarr;
            </Link>
          </div>

          {tasksLoading ? (
            <p className="text-slate-400 font-medium">Carregando...</p>
          ) : lembretesDeHoje.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Nenhum compromisso pendente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lembretesDeHoje.map(task => (
                <div key={task.id} className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                        {task.recurring && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            <Repeat size={10} strokeWidth={2.5} />
                            Semanal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{task.description || "Tarefa"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Coluna Direita: Mini Calendário (Agosto 2026) */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Agosto</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">2026</span>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
            {['D','S','T','Q','Q','S','S'].map((d, index) => (
              <div key={index} className="text-[10px] font-black text-slate-300">{d}</div>
            ))}
            
            {/* Offset para começar no Sábado (Agosto 2026) */}
            {Array.from({length: 6}).map((_, i) => <div key={`empty-${i}`}></div>)}
            
            {/* Dias do mês */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
              <div 
                key={dia} 
                className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer
                  ${dia === new Date().getDate() 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
              >
                {dia}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}