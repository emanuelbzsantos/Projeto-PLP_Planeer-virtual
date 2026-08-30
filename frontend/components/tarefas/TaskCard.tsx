import React from 'react';
import { Trash2, Check, Repeat, Clock, Pencil } from 'lucide-react';
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

      // Texto compacto: apenas horário para a semana atual, ou horário + ano completo se for outro ano
      let badgeLabel = time;
      if (isDifferentYear) {
        badgeLabel = `${time} • ${taskYear}`;
      } else if (!isThisWeek) {
        badgeLabel = `${time} • ${dayMonth}`;
      }

      const fullDateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

      return {
        time,
        badgeLabel,
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
      className={`group relative flex items-start gap-2 p-2.5 rounded-xl border border-l-4 transition-all duration-200 hover:shadow-xs min-w-0 ${
        task.completed 
          ? 'bg-[#F8F9FC]/70 border-transparent opacity-75' 
          : 'bg-white border-[var(--color-border)] hover:border-[var(--color-primary-light)] shadow-2xs'
      }`}
    >
      {/* Coluna Esquerda: Checkbox e Ações (Editar/Excluir) na vertical */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-[19px] h-[19px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 cursor-pointer ${
            task.completed
              ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
              : 'border-[#C1C8D1] hover:border-[var(--color-primary)] bg-transparent'
          }`}
          aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
        >
          <Check size={11} className={`transition-transform duration-200 ${task.completed ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
        </button>

        {/* Botões de Ação na vertical abaixo do checkbox (visíveis no hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-0.5">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] p-1 rounded-md transition-all cursor-pointer"
              title="Editar tarefa"
            >
              <Pencil size={12} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-slate-400 hover:text-[var(--color-danger)] hover:bg-[#FEF2F2] p-1 rounded-md transition-all cursor-pointer"
            title="Excluir tarefa"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Conteúdo da Tarefa */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 
          title={task.title}
          className={`text-[13px] font-semibold leading-snug line-clamp-2 break-all transition-colors min-w-0 ${
            task.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p 
            title={task.description}
            className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed break-all ${
              task.completed ? 'text-[#9BA1A6]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Badges: Horário, Categoria, Recorrência */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap min-w-0">
          {dateInfo && (
            <span 
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border shrink-0 max-w-full truncate ${
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
              <Clock size={10} className={`shrink-0 ${
                dateInfo.isDifferentYear ? 'text-amber-600' : !dateInfo.isThisWeek ? 'text-purple-600' : 'text-slate-500'
              }`} />
              <span>{dateInfo.badgeLabel}</span>
            </span>
          )}

          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${categoryStyle.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dotClass}`} />
            {task.categoria || 'Sem categoria'}
          </span>

          {task.recurring && (
            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100/60 shrink-0">
              <Repeat size={10} strokeWidth={2.5} />
              Semanal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}