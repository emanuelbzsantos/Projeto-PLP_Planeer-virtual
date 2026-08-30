import React from 'react';
import { Trash2, Check, Repeat, Clock, Pencil, Calendar } from 'lucide-react';
import type { Task } from '@/types';
import { getCategoryStyle } from '@/lib/categories';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const categoryStyle = getCategoryStyle(task.categoria);

  const dateInfo = React.useMemo(() => {
    if (!task.due_date) return null;
    try {
      const d = new Date(task.due_date);
      if (isNaN(d.getTime())) return null;

      const today = new Date();
      const currentYear = today.getFullYear();
      const taskYear = d.getFullYear();
      const isDifferentYear = taskYear !== currentYear;

      // Início e fim da semana atual
      const currentDayIdx = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDayIdx);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const isThisWeek = d >= startOfWeek && d <= endOfWeek;

      const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dayMonth = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const formattedDateText = isDifferentYear ? `${dayMonth}/${taskYear}` : dayMonth;
      const fullDateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

      return {
        time,
        dateText: formattedDateText,
        isDifferentYear,
        isThisWeek,
        taskYear,
        fullDateStr,
      };
    } catch {
      return null;
    }
  }, [task.due_date]);

  return (
    <div
      style={{ borderLeftColor: categoryStyle.color }}
      className={`group relative flex items-start gap-2.5 p-3 rounded-xl border border-l-4 transition-all duration-200 hover:shadow-sm ${
        task.completed 
          ? 'bg-[#F8F9FC]/70 border-transparent opacity-75' 
          : 'bg-white border-[var(--color-border)] hover:border-[var(--color-primary-light)] shadow-xs'
      }`}
    >
      {/* Coluna Esquerda: Checkbox e Ações (Editar/Excluir) na vertical */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
              : 'border-[#C1C8D1] hover:border-[var(--color-primary)] bg-transparent'
          }`}
          aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
        >
          <Check size={12} className={`transition-transform duration-200 ${task.completed ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
        </button>

        {/* Botões de Ação na vertical abaixo do checkbox (visíveis no hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-0.5">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] p-1 rounded-md transition-all"
              title="Editar tarefa"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-slate-400 hover:text-[var(--color-danger)] hover:bg-[#FEF2F2] p-1 rounded-md transition-all"
            title="Excluir tarefa"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Conteúdo da Tarefa */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 
          title={task.title}
          className={`text-sm font-medium leading-snug line-clamp-2 break-words transition-colors ${
            task.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p 
            title={task.description}
            className={`text-[12px] mt-1 line-clamp-2 leading-relaxed break-words ${
              task.completed ? 'text-[#9BA1A6]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Badges: Horário/Data, Categoria, Recorrência */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {dateInfo && (
            <span 
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                dateInfo.isDifferentYear
                  ? 'text-amber-800 bg-amber-50 border-amber-200/90 font-semibold'
                  : !dateInfo.isThisWeek
                  ? 'text-purple-800 bg-purple-50/80 border-purple-200/80'
                  : 'text-slate-600 bg-slate-100/90 border-slate-200/70'
              }`}
              title={`Agendado para ${dateInfo.fullDateStr} às ${dateInfo.time}${
                dateInfo.isDifferentYear ? ` (Ano ${dateInfo.taskYear})` : !dateInfo.isThisWeek ? ' (Fora da semana atual)' : ''
              }`}
            >
              <Clock size={11} className={`shrink-0 ${
                dateInfo.isDifferentYear ? 'text-amber-600' : !dateInfo.isThisWeek ? 'text-purple-600' : 'text-slate-500'
              }`} />
              <span>{dateInfo.time}</span>
              <span className="opacity-40">•</span>
              <span>{dateInfo.dateText}</span>
            </span>
          )}

          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${categoryStyle.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dotClass}`} />
            {task.categoria || 'Sem categoria'}
          </span>

          {task.recurring && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60">
              <Repeat size={11} strokeWidth={2.5} />
              Semanal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}