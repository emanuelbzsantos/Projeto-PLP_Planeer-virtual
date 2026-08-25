"use client";

import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useMetas } from "@/hooks/useMetas";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskCard } from "@/components/tarefas/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarDays, Target, Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { tasks, loading: tasksLoading, toggleTask, deleteTask } = useTasks();
  const { metas, loading: metasLoading } = useMetas();
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [todayString, setTodayString] = useState("");

  const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const todayIndex = new Date().getDay();
  const todayName = diasSemana[todayIndex];

  useEffect(() => {
    // Saudação baseada no horário
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    // Data de hoje formatada
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    setTodayString(new Date().toLocaleDateString('pt-BR', options));

    // Nome do usuário
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u.name.split(' ')[0]); // Primeiro nome
      } catch (e) {}
    }
  }, []);

  // Cálculos para o progresso da semana
  const allTasks = Object.values(tasks).flat();
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed).length;

  // Cálculos de metas
  const allMetas = Object.values(metas).flat();
  const metasAtivas = allMetas.length;
  const metasCumpridas = allMetas.filter(m => m.status === 'cumprida').length;
  const metasParciais = allMetas.filter(m => m.status === 'parcialmente_cumprida').length;

  const tarefasDeHoje = tasks[todayName] || [];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">
          {greeting}{userName ? `, ${userName}` : ''}.
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 font-medium capitalize">
          {todayString}
        </p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--color-primary-light)] p-2.5 rounded-xl text-[var(--color-primary)]">
              <CalendarDays size={22} />
            </div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">Progresso da Semana</h2>
          </div>
          
          {tasksLoading ? (
            <div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
          ) : (
            <ProgressBar current={completedTasks} total={totalTasks} />
          )}
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
                <Target size={22} />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">Metas Ativas</h2>
            </div>
            <Link href="/metas" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
              Ver todas
            </Link>
          </div>
          
          {metasLoading ? (
            <div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-[var(--color-text)] mb-2">{metasAtivas}</p>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                {metasCumpridas} cumprida{metasCumpridas !== 1 && 's'} · {metasParciais} em andamento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tarefas de Hoje */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Tarefas de Hoje</h2>
          <Link href="/tarefas" className="flex items-center gap-1.5 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} />
            Nova Tarefa
          </Link>
        </div>

        {tasksLoading ? (
          <div className="animate-pulse flex flex-col gap-3">
            {[1, 2].map(i => <div key={i} className="h-[72px] bg-white border border-gray-100 rounded-xl"></div>)}
          </div>
        ) : tarefasDeHoje.length === 0 ? (
          <EmptyState 
            icon={<CheckSquarePlaceholder />} 
            title="Seu dia está livre!" 
            description="Você não tem tarefas agendadas para hoje. Aproveite para descansar ou planejar algo novo."
          />
        ) : (
          <div className="space-y-3">
            {tarefasDeHoje.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onDelete={deleteTask} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CheckSquarePlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11 3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}