"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Repeat, CalendarDays, Clock, ArrowRight } from "lucide-react";
import { getTaskCategoryConfig } from "@/lib/taskCategories";
import type { Task, TasksByDay } from "@/types";

interface InteractiveAgendaProps {
  tasks: TasksByDay;
  loading: boolean;
}

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

function formatTaskTime(dueDate: string) {
  const time = dueDate.match(/T(\d{2}):(\d{2})/);
  return time ? `${time[1]}:${time[2]}` : "Sem horário";
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

export function InteractiveAgenda({ tasks, loading }: InteractiveAgendaProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const allTasks = Array.from(
    new Map(Object.values(tasks).flat().map(task => [task.id, task])).values()
  );
  const todayKey = toDateKey(new Date());
  const selectedDateKey = toDateKey(selectedDate);
  const isSelectedToday = selectedDateKey === todayKey;

  const selectedDateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const selectedTasks = allTasks
    .filter(task => taskOccursOnDate(task, selectedDate))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekday = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarMonthLabel = calendarMonth.toLocaleDateString("pt-BR", { month: "long" });

  function changeCalendarMonth(offset: number) {
    setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function selectToday() {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays size={20} className="text-[var(--color-primary)]" />
                Sua Agenda
              </h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium mt-1 capitalize">
                {selectedDateLabel}{isSelectedToday ? " • Hoje" : ""}
              </p>
            </div>
            <Link href="/tarefas" className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors group">
              <span>Ver todas as tarefas</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ) : selectedTasks.length === 0 ? (
            <div className="text-center py-14 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Nenhuma tarefa agendada para esta data.</p>
              {!isSelectedToday && (
                <button
                  type="button"
                  onClick={selectToday}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline mt-2.5 transition-all cursor-pointer"
                >
                  Voltar para hoje
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {selectedTasks.map(task => {
                const categoryConfig = getTaskCategoryConfig(task.categoria);
                const CategoryIcon = categoryConfig.icon;

                return (
                  <div
                    key={task.id}
                    className={`group flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700 hover:border-slate-300/80 dark:hover:border-slate-600 transition-all rounded-xl ${task.completed ? "opacity-65" : ""}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: task.completed ? "#30A46C" : categoryConfig.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[var(--color-primary)] transition-colors ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                            {task.title}
                          </h3>
                          {task.recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              <Repeat size={10} strokeWidth={2.5} />
                              Semanal
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{task.description}</p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Clock size={11} /> {formatTaskTime(task.due_date)}
                          </span>
                          <span>•</span>
                          <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded border ${categoryConfig.badgeClass}`}>
                            <CategoryIcon size={10} strokeWidth={2.5} />
                            <span>{task.categoria || "Estudos"}</span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-3 ${task.completed ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                      {task.completed ? "Concluída" : "Pendente"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">{calendarMonthLabel}</h2>
              <button
                type="button"
                onClick={selectToday}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline mt-0.5 transition-colors cursor-pointer"
              >
                Ir para hoje
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeCalendarMonth(-1)}
                className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-1 rounded-lg">
                {calendarYear}
              </span>
              <button
                type="button"
                onClick={() => changeCalendarMonth(1)}
                className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
              <div key={index} className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{day}</div>
            ))}

            {Array.from({ length: firstWeekday }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => {
              const date = new Date(calendarYear, calendarMonthIndex, day);
              const dateKey = toDateKey(date);
              const isSelected = dateKey === selectedDateKey;
              const isToday = dateKey === todayKey;
              const hasTasks = allTasks.some(task => taskOccursOnDate(task, date));

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`Selecionar ${date.toLocaleDateString("pt-BR")}`}
                  aria-pressed={isSelected}
                  className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : isToday
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-light)] font-bold ring-1 ring-[var(--color-primary)]"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {day}
                  {hasTasks && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[var(--color-primary)]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}