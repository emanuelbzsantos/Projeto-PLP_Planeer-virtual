"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import { getCategoryStyle } from "@/lib/categories";
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
  return time ? `${time[1]}:${time[2]}` : "Horário não informado";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Sua Agenda</h2>
            <p className="text-sm text-slate-400 font-medium mt-1 capitalize">
              {selectedDateLabel}{isSelectedToday ? " · Hoje" : ""}
            </p>
          </div>
          <Link href="/tarefas" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            Ver tudo &rarr;
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 font-medium">Carregando...</p>
        ) : selectedTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Nenhuma tarefa para esta data.</p>
            {!isSelectedToday && (
              <button
                type="button"
                onClick={selectToday}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-3 transition-colors"
              >
                Voltar para hoje
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {selectedTasks.map(task => {
              const categoryStyle = getCategoryStyle(task.categoria);

              return (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all rounded-2xl ${task.completed ? "opacity-65" : ""}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.completed ? "#30A46C" : categoryStyle.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-slate-700 group-hover:text-indigo-600 transition-colors ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        {task.recurring && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            <Repeat size={10} strokeWidth={2.5} />
                            Semanal
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                      )}
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {formatTaskTime(task.due_date)} · {task.categoria || "Sem categoria"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${task.completed ? "bg-emerald-50 text-emerald-600" : categoryStyle.badgeClass}`}>
                    {task.completed ? "Concluída" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 capitalize">{calendarMonthLabel}</h2>
            <button
              type="button"
              onClick={selectToday}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1 transition-colors"
            >
              Ir para hoje
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => changeCalendarMonth(-1)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {calendarYear}
            </span>
            <button
              type="button"
              onClick={() => changeCalendarMonth(1)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-[10px] font-black text-slate-300">{day}</div>
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
                className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : isToday
                      ? "text-indigo-700 ring-2 ring-indigo-200 hover:bg-indigo-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {day}
                {hasTasks && (
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`} />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
