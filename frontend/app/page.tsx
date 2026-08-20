"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Target, CalendarDays, ArrowRight } from "lucide-react";

export default function Home() {
  const [tasks, setTasks] = useState<any>({});
  const [metas, setMetas] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, metasRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/tasks`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/metas`)
        ]);

        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (metasRes.ok) setMetas(await metasRes.json());
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalTasks = Object.values(tasks).flat().length;
  const totalMetas = Object.values(metas).flat().length;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Olá! Bem-vindo ao Planner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Aqui está um resumo de como está a sua semana.
        </p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Tarefas Pendentes</h2>
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {loading ? "..." : totalTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Metas Ativas</h2>
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full text-purple-600 dark:text-purple-400">
              <Target size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {loading ? "..." : totalMetas}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sessão de Tarefas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="text-indigo-500" />
              Tarefas da Semana
            </h2>
            <Link href="/tarefas" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-sm font-medium">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full"></div>
                ))}
              </div>
            ) : totalTasks === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(tasks).map(([dia, lista]: [string, any]) => {
                  if (lista.length === 0) return null;
                  return (
                    <div key={dia} className="mb-4 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-2">{dia}</h3>
                      <div className="space-y-2">
                        {lista.map((task: any) => (
                          <div key={task.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                            <Circle className="text-gray-300 dark:text-gray-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                              {task.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sessão de Metas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="text-purple-500" />
              Minhas Metas
            </h2>
            <Link href="/metas" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-sm font-medium">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white dark:bg-black/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full"></div>
                ))}
              </div>
            ) : totalMetas === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma meta encontrada.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(metas).map(([periodo, lista]: [string, any]) => {
                  if (lista.length === 0) return null;
                  return (
                    <div key={periodo} className="mb-4 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-2">{periodo}</h3>
                      <div className="space-y-3">
                        {lista.map((meta: any) => (
                          <div key={meta.id} className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-800/30">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{meta.descricao}</h4>
                            <div className="flex items-center gap-3 text-xs font-medium">
                              <span className="px-2 py-1 bg-white dark:bg-black/50 text-purple-600 dark:text-purple-400 rounded-md">
                                {meta.categoria}
                              </span>
                              <span className="px-2 py-1 bg-white dark:bg-black/50 text-gray-600 dark:text-gray-400 rounded-md">
                                {meta.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
