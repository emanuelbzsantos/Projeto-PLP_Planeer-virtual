"use client";

import { useState, useMemo } from "react";
import { Plus, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlanningBlocks } from "@/hooks/usePlanningBlocks";
import { useTasks } from "@/hooks/useTasks";
import { PlanningBlockCard } from "@/components/planejamento/PlanningBlockCard";
import { PlanningBlockForm } from "@/components/planejamento/PlanningBlockForm";
import { Modal } from "@/components/ui/Modal";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlanejamentoPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = toDateKey(selectedDate);

  const { planningBlocks, loading, createPlanningBlock, deletePlanningBlock } = usePlanningBlocks(dateKey);
  const { tasks: tasksByDay } = useTasks();
  const [showForm, setShowForm] = useState(false);

  const allTasks = useMemo(() => {
    const map = new Map();
    Object.values(tasksByDay).flat().forEach((task) => map.set(task.id, task));
    return Array.from(map.values());
  }, [tasksByDay]);

  const tasksById = useMemo(() => {
    const map = new Map();
    allTasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [allTasks]);

  const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isToday = dateKey === toDateKey(new Date());

  function changeDay(offset: number) {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + offset);
      return next;
    });
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  const sortedBlocks = [...planningBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="p-8 max-w-[1000px] mx-auto w-full pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="bg-[var(--color-primary-light)] p-2 rounded-xl text-[var(--color-primary)]">
              <CalendarClock size={24} />
            </div>
            Planejamento
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 capitalize">
            {dateLabel}{isToday ? " · Hoje" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => changeDay(-1)}
              className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
              aria-label="Dia anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => changeDay(1)}
              className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
              aria-label="Próximo dia"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={20} />
            Novo Bloco
          </button>
        </div>
      </header>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo Bloco de Planejamento">
        <PlanningBlockForm
          date={dateKey}
          tasks={allTasks}
          onSubmit={async (block) => { await createPlanningBlock(block); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-gray-100 rounded-2xl"></div>
            <div className="h-16 bg-gray-100 rounded-2xl"></div>
          </div>
        ) : sortedBlocks.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Nenhum bloco planejado para este dia.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-3 transition-colors"
            >
              Adicionar o primeiro bloco
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBlocks.map((block) => (
              <PlanningBlockCard
                key={block.id}
                block={block}
                task={block.task_id ? tasksById.get(block.task_id) : undefined}
                onDelete={deletePlanningBlock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}