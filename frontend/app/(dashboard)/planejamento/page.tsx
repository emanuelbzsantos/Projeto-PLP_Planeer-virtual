"use client";

import { useState, useMemo } from "react";
import { Plus, CalendarClock, ChevronLeft, ChevronRight, Clock, CheckCircle2, ListChecks } from "lucide-react";
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
    <div className="p-6 md:p-8 w-full mx-auto pb-16 min-h-[calc(100vh-64px)] bg-slate-50/40">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary-light)] p-2.5 rounded-2xl text-[var(--color-primary)] shadow-xs">
            <CalendarClock size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Planejamento Diário
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5 capitalize">
              {dateLabel}{isToday ? " • Hoje" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Dias */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => changeDay(-1)}
              className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
              aria-label="Dia anterior"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={() => changeDay(1)}
              className="p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
              aria-label="Próximo dia"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} />
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

      {/* Grid 100% da Largura: 8 cols Linha do Tempo + 4 cols Resumo do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Painel Principal de Blocos (8/12 = ~67% da tela) */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-[var(--color-primary)]" />
              Linha do Tempo
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {sortedBlocks.length} {sortedBlocks.length === 1 ? "bloco planejado" : "blocos planejados"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ) : sortedBlocks.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CalendarClock size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum bloco agendado para este dia.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Aloque blocos de tempo para suas tarefas e compromissos para manter seu dia produtivo e organizado.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus size={15} />
                Adicionar Primeiro Bloco
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

        {/* Painel Lateral: Resumo e Dicas do Dia (4/12 = ~33% da tela) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card Resumo */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ListChecks size={18} className="text-indigo-600" />
              Visão Geral do Dia
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Total de Blocos</span>
                <span className="text-sm font-bold text-slate-800">{sortedBlocks.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Data Selecionada</span>
                <span className="text-xs font-bold text-slate-800">{selectedDate.toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-indigo-100 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Criar Novo Bloco
            </button>
          </div>

          {/* Dica de Produtividade */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100/60 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              Dica de Foco
            </h3>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Use a técnica de <em>timeboxing</em> alocando blocos de 30 a 60 minutos com pausas planejadas para maximizar sua concentração ao longo do dia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}