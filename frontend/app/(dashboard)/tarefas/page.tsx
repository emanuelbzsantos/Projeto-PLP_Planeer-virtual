"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Plus, CalendarDays } from "lucide-react";
import { TaskCard } from "@/components/tarefas/TaskCard";
import { TaskForm } from "@/components/tarefas/TaskForm";
import { Modal } from "@/components/ui/Modal";

export default function TarefasPage() {
  const { tasks, loading, createTask, toggleTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const diasOrdem = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const hoje = diasOrdem[new Date().getDay()];

  function openFormForDay(dia: string) {
    const today = new Date();
    const diff = diasOrdem.indexOf(dia) - today.getDay();
    const dateForDay = new Date(today);
    dateForDay.setDate(today.getDate() + diff);
    // Format to YYYY-MM-DDTHH:mm
    const dateString = new Date(dateForDay.getTime() - (dateForDay.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    
    setSelectedDate(dateString);
    setShowForm(true);
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full pb-20">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="bg-[var(--color-primary-light)] p-2 rounded-xl text-[var(--color-primary)]">
              <CalendarDays size={24} />
            </div>
            Minha Semana
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Organize e acompanhe suas tarefas diárias.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDate("");
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Nova Tarefa
        </button>
      </header>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Tarefa">
        <TaskForm 
          onSubmit={async (t) => { await createTask(t); setShowForm(false); }} 
          onCancel={() => setShowForm(false)} 
          defaultDate={selectedDate}
        />
      </Modal>

      {/* Grid de 7 colunas em telas grandes, scroll horizontal em menores */}
      <div className="flex overflow-x-auto pb-6 snap-x gap-4 min-h-[500px]">
        {loading ? (
          diasOrdem.map((dia) => (
            <div key={dia} className="min-w-[280px] w-[280px] flex-shrink-0 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-lg mb-4"></div>
              <div className="h-32 bg-gray-100 rounded-xl mb-3"></div>
              <div className="h-32 bg-gray-100 rounded-xl"></div>
            </div>
          ))
        ) : (
          diasOrdem.map((dia) => {
            const lista = tasks[dia] || [];
            const isToday = dia === hoje;

            return (
              <div
                key={dia}
                className="min-w-[280px] w-[280px] flex-shrink-0 snap-start flex flex-col"
              >
                {/* Header do dia */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-transparent relative group">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                  }`}>
                    {dia}
                    {isToday && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>}
                  </h3>
                  
                  <button 
                    onClick={() => openFormForDay(dia)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md"
                    title={`Adicionar tarefa em ${dia}`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                  
                  {isToday && (
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[var(--color-primary)] rounded-full"></div>
                  )}
                </div>

                {/* Lista de tarefas */}
                <div className="flex-1 flex flex-col gap-2.5">
                  {lista.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-secondary)] opacity-60">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    lista.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}