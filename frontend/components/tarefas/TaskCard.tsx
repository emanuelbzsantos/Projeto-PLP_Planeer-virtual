import React from 'react';
import { Trash2, Check, Repeat } from 'lucide-react';
import type { Task } from '@/types';
import { getCategoryStyle } from '@/lib/categories';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const categoryStyle = getCategoryStyle(task.categoria);

  return (
    <div
      style={{ borderLeftColor: categoryStyle.color }}
      className={`group flex items-start gap-3 p-3.5 rounded-xl border border-l-4 transition-all duration-200 hover:shadow-sm ${
      task.completed 
        ? 'bg-[#F8F9FC]/50 border-transparent opacity-75' 
        : 'bg-white border-[var(--color-border)] hover:border-[var(--color-primary-light)]'
    }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-[22px] h-[22px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
            : 'border-[#C1C8D1] hover:border-[var(--color-primary)] bg-transparent'
        }`}
        aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
      >
        <Check size={14} className={`transition-transform duration-200 ${task.completed ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={`text-sm font-medium leading-tight transition-colors ${
          task.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'
        }`}>
          {task.title}
        </h4>
        {task.description && (
          <p className={`text-[13px] mt-1 truncate ${
            task.completed ? 'text-[#9BA1A6]' : 'text-[var(--color-text-secondary)]'
          }`}>
            {task.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md ${categoryStyle.badgeClass}`}>
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

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[#FEF2F2] p-1.5 rounded-md transition-all flex-shrink-0"
        title="Excluir tarefa"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
