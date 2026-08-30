"use client";

import { useState, useMemo } from "react";
import { Plus, CalendarClock, ChevronLeft, ChevronRight, Clock, ListChecks, CheckCircle2, ArrowRight } from "lucide-react";
import { usePlanningBlocks } from "@/hooks/usePlanningBlocks";
import { useTasks } from "@/hooks/useTasks";
import { PlanningBlockCard } from "@/components/planejamento/PlanningBlockCard";
import { PlanningBlockForm } from "@/components/planejamento/PlanningBlockForm";
import { Modal } from "@/components/ui/Modal";
import type { Task, PlanningBlock } from "@/types";

const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function taskDateKey(dueDate: string) {
  return dueDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
}

function taskOccursOnDate(task: Task, date: Date) {
  const recurring = task.recurring || task.recurrence_type === "weekly";
  if (!recurring) return taskDateKey(task.due_date) === toDateKey(date);

  const weekday = WEEKDAYS[date.getDay()];
  if (task.recurring_days?.length) return task.recurring_days.includes(weekday);

  const originalDateKey = taskDateKey(task.due_date);
  if (!originalDateKey) return false;

  return new Date(`${originalDateKey}T12:00:00`).getDay() === date.getDay();
}

function calculateTotalFocusMinutes(blocks: { start_time: string; end_time: string }[]) {
  return blocks.reduce((acc, block) => {
    const start = block.start_time.match(/T(\d{2}):(\d{2})/);
    const end = block.end_time.match(/T(\d{2}):(\d{2})/);
    if (!start || !end) return acc;
    const startMinutes = Number(start[1]) * 60 + Number(start[2]);
    const endMinutes = Number(end[1]) * 60 + Number(end[2]);
    const diff = endMinutes - startMinutes;
    return acc + (diff > 0 ? diff : 0);
  }, 0);
}

function formatMinutesToHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function PlanejamentoPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const dateKey = toDateKey(selectedDate);
  const { planningBlocks, createPlanningBlock, updatePlanningBlock, deletePlanningBlock } = usePlanningBlocks(dateKey);
  const { tasks: tasksByDay } = useTasks();
  
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PlanningBlock | null>(null);
  const [selectedTaskForBlock, setSelectedTaskForBlock] = useState<number | null>(null);

  const allTasks = useMemo(() => {
    const map = new Map<number, Task>();
    Object.values(tasksByDay).flat().forEach((task) => map.set(task.id, task));
    return Array.from(map.values());
  }, [tasksByDay]);

  const tasksById = useMemo(() => {
    const map = new Map<number, Task>();
    allTasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [allTasks]);

  // Tarefas programadas para esta data específica
  const tasksForThisDate = useMemo(() => {
    return allTasks.filter(task => taskOccursOnDate(task, selectedDate));
  }, [allTasks, selectedDate]);

  // IDs das tarefas que já possuem um bloco agendado no dia
  const allocatedTaskIds = useMemo(() => {
    return new Set(planningBlocks.map(b => b.task_id).filter(Boolean));
  }, [planningBlocks]);

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
      setCalendarMonth(new Date(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function openCreateForm(taskId?: number) {
    setEditingBlock(null);
    setSelectedTaskForBlock(taskId ?? null);
    setShowForm(true);
  }

  function handleEditBlock(block: PlanningBlock) {
    setEditingBlock(block);
    setSelectedTaskForBlock(null);
    setShowForm(true);
  }

  async function handleFormSubmit(blockData: {
    date: string;
    start_time: string;
    end_time: string;
    title?: string;
    task_id?: number | null;
  }) {
    if (editingBlock) {
      await updatePlanningBlock(editingBlock.id, blockData);
    } else {
      await createPlanningBlock(blockData);
    }
    setShowForm(false);
    setEditingBlock(null);
    setSelectedTaskForBlock(null);
  }

  const sortedBlocks = [...planningBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const totalFocusMinutes = calculateTotalFocusMinutes(sortedBlocks);

  // Calendário
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekday = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarMonthLabel = calendarMonth.toLocaleDateString("pt-BR", { month: "long" });

  function changeCalendarMonth(offset: number) {
    setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 md:p-8 w-full max-w-none overflow-hidden">
      {/* Top Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
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
            onClick={() => openCreateForm()}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} />
            Novo Bloco
          </button>
        </div>
      </header>

      <Modal 
        open={showForm} 
        onClose={() => { setShowForm(false); setEditingBlock(null); setSelectedTaskForBlock(null); }} 
        title={editingBlock ? "Editar Bloco de Planejamento" : "Novo Bloco de Planejamento"}
      >
        <PlanningBlockForm
          date={dateKey}
          tasks={allTasks}
          initialTaskId={selectedTaskForBlock}
          initialBlock={editingBlock}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingBlock(null); setSelectedTaskForBlock(null); }}
        />
      </Modal>

      {/* Grid Central de Planejamento (100% da Largura e Altura) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch pb-2">
        {/* Painel Esquerdo: Linha do Tempo de Blocos (7/12 = ~58% da tela) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8 flex flex-col h-full min-h-0">
          <div className="shrink-0 flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-[var(--color-primary)]" />
                Linha do Tempo
              </h2>
              {sortedBlocks.length > 0 && (
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Tempo total alocado: <strong className="text-slate-700">{formatMinutesToHours(totalFocusMinutes)}</strong>
                </span>
              )}
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {sortedBlocks.length} {sortedBlocks.length === 1 ? "bloco" : "blocos"}
            </span>
          </div>

          {sortedBlocks.length === 0 ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-center p-8">
              <CalendarClock size={40} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum bloco agendado para este dia.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Aloque blocos de tempo para suas tarefas e compromissos para manter seu dia produtivo.
              </p>
              <button
                type="button"
                onClick={() => openCreateForm()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus size={15} />
                Adicionar Primeiro Bloco
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
              {sortedBlocks.map((block) => (
                <PlanningBlockCard
                  key={block.id}
                  block={block}
                  task={block.task_id ? tasksById.get(block.task_id) : undefined}
                  onEdit={handleEditBlock}
                  onDelete={deletePlanningBlock}
                />
              ))}
            </div>
          )}
        </div>

        {/* Painel Direito: Central do Dia (5/12 = ~42% da tela) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0 gap-5">
          {/* Card 1: Mini-Calendário Mensal para Navegação Rápida */}
          <div className="shrink-0 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 capitalize">{calendarMonthLabel}</h3>
                <button
                  type="button"
                  onClick={goToToday}
                  className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline mt-0.5 transition-colors cursor-pointer"
                >
                  Ir para hoje
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeCalendarMonth(-1)}
                  className="p-1 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-lg">
                  {calendarYear}
                </span>
                <button
                  type="button"
                  onClick={() => changeCalendarMonth(1)}
                  className="p-1 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                <div key={index} className="text-[10.5px] font-bold text-slate-400">{day}</div>
              ))}

              {Array.from({ length: firstWeekday }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => {
                const date = new Date(calendarYear, calendarMonthIndex, day);
                const loopDateKey = toDateKey(date);
                const isSelected = loopDateKey === dateKey;
                const isTodayDate = loopDateKey === toDateKey(new Date());

                return (
                  <button
                    type="button"
                    key={loopDateKey}
                    onClick={() => setSelectedDate(date)}
                    aria-label={`Selecionar ${date.toLocaleDateString("pt-BR")}`}
                    className={`relative w-7 h-7 mx-auto flex items-center justify-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-2xs font-bold"
                        : isTodayDate
                          ? "text-[var(--color-primary)] bg-[var(--color-primary-light)] font-bold ring-1 ring-[var(--color-primary)]"
                          : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Tarefas do Dia Disponíveis para Alocar */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="shrink-0 flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ListChecks size={16} className="text-indigo-600" />
                  Tarefas deste Dia
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {tasksForThisDate.length} {tasksForThisDate.length === 1 ? "tarefa" : "tarefas"}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {tasksForThisDate.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    Nenhuma tarefa agendada para esta data.
                  </div>
                ) : (
                  tasksForThisDate.map((task) => {
                    const isAllocated = allocatedTaskIds.has(task.id);

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl transition-all gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-800 truncate" title={task.title}>
                            {task.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {task.categoria || "Sem categoria"}
                          </span>
                        </div>

                        {isAllocated ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 shrink-0">
                            <CheckCircle2 size={12} />
                            Alocada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCreateForm(task.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                            title="Alocar horário para esta tarefa"
                          >
                            <span>+ Alocar</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={() => openCreateForm()}
              className="mt-3 shrink-0 w-full flex items-center justify-center gap-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-indigo-100 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus size={15} />
              Criar Novo Bloco
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}