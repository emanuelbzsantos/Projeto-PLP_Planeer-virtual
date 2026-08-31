import React from 'react';
import { Trash2, Repeat, Clock, Pencil } from 'lucide-react';
import type { Task } from '@/types';
import { getTaskCategoryConfig } from '@/lib/taskCategories';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number, status?: string) => void;
  onDelete: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const categoryConfig = getTaskCategoryConfig(task.categoria);
  const CategoryIcon = categoryConfig.icon;

  const dateInfo = React.useMemo(() => {
    if (!task.due_date) return null;
    try {
      // Remove o 'Z' ou offset UTC para o JavaScript não aplicar conversão indesejada de fuso (-3h)
      const sanitizedDateStr = task.due_date.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
      const d = new Date(sanitizedDateStr);
      if (isNaN(d.getTime())) return null;

      const today = new Date();
      const currentYear = today.getFullYear();
      const taskYear = d.getFullYear();
      const isDifferentYear = taskYear !== currentYear;

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

      let badgeLabel = time;
      if (isDifferentYear) {
        badgeLabel = `${time} - ${taskYear}`;
      } else if (!isThisWeek) {
        badgeLabel = `${time} - ${dayMonth}`;
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
      style={{ borderLeftColor: categoryConfig.color }}
      className={`group relative flex flex-col gap-2.5 p-3.5 rounded-xl border border-l-4 transition-all duration-200 hover:shadow-xs min-w-0 ${
        task.status === 'executada'
          ? 'bg-[#F8F9FC]/70 dark:bg-slate-900/40 border-transparent opacity-75'
          : 'bg-white dark:bg-slate-900 border-[var(--color-border)] dark:border-slate-800 hover:border-[var(--color-primary-light)] dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      {/* 1. CABEÇALHO: Status na Esquerda, Ações na Direita */}
      <div className="flex items-center justify-between w-full gap-2">
        <div className="relative group/status shrink-0">
          <select
            value={task.status || 'pendente'}
            onChange={(e) => onToggle(task.id, e.target.value)}
            className={`
              appearance-none cursor-pointer pl-2.5 pr-6 py-1 text-[10px] font-bold rounded-md border shadow-sm transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50
              ${
                task.status === 'executada'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-500'
                  : task.status === 'parcialmente_executada'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 focus:ring-amber-500'
                  : task.status === 'cancelada'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 focus:ring-rose-500'
                  : task.status === 'adiada'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-500'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 focus:ring-slate-400'
              }
            `}
            title="Alterar status"
          >
            <option value="pendente">Pendente</option>
            <option value="executada">Executada</option>
            <option value="parcialmente_executada">Parcial</option>
            <option value="cancelada">Cancelada</option>
            <option value="adiada">Adiada</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-current opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] p-1 rounded-md transition-all cursor-pointer"
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
            className="text-slate-400 hover:text-[var(--color-danger)] hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 p-1 rounded-md transition-all cursor-pointer"
            title="Excluir tarefa"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 2. CORPO: Título e Descrição alinhados à esquerda */}
      <div className="flex flex-col w-full min-w-0 mt-0.5">
        <h4
          title={task.title}
          className={`text-[13px] font-semibold leading-snug line-clamp-2 break-all transition-colors min-w-0 ${
            task.status === 'executada' ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p
            title={task.description}
            className={`text-[11px] mt-1 line-clamp-3 leading-relaxed break-all ${
              task.status === 'executada' ? 'text-[#9BA1A6]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* 3. RODAPÉ: Badges de Data e Categoria */}
      <div className="flex items-center gap-1.5 flex-wrap min-w-0 mt-1">
        {dateInfo && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border shrink-0 max-w-full truncate ${
              dateInfo.isDifferentYear
                ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-900/50 font-semibold'
                : !dateInfo.isThisWeek
                ? 'text-purple-800 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-900/50'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 border-slate-200/70 dark:border-slate-700'
            }`}
            title={`Agendado para ${dateInfo.fullDateStr} as ${dateInfo.time}${
              dateInfo.isDifferentYear ? ` (Ano ${dateInfo.taskYear})` : !dateInfo.isThisWeek ? ' (Fora da semana atual)' : ''
            }`}
          >
            <Clock size={10} className={`shrink-0 ${
              dateInfo.isDifferentYear ? 'text-amber-600 dark:text-amber-400' : !dateInfo.isThisWeek ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
            }`} />
            <span>{dateInfo.badgeLabel}</span>
          </span>
        )}

        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 border ${categoryConfig.badgeClass}`}>
          <CategoryIcon size={10} strokeWidth={2.5} className="shrink-0" />
          <span>{task.categoria || 'Estudos'}</span>
        </span>

        {task.recurring && (
          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-100/60 dark:border-indigo-900/50 shrink-0">
            <Repeat size={10} strokeWidth={2.5} />
            Semanal
          </span>
        )}
      </div>
    </div>
  );
}