import { Trash2, Pencil, ListChecks } from 'lucide-react';
import type { PlanningBlock, Task } from '@/types';

interface PlanningBlockCardProps {
  block: PlanningBlock;
  task?: Task;
  onEdit: (block: PlanningBlock) => void;
  onDelete: (id: number) => void;
}

function formatTime(datetime: string) {
  const match = datetime.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '--:--';
}

export function PlanningBlockCard({ block, task, onEdit, onDelete }: PlanningBlockCardProps) {
  const displayTitle = task?.title ?? block.title ?? 'Sem título';

  return (
    <div className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300/80 dark:hover:border-slate-700 transition-all rounded-2xl shadow-2xs">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-14 shrink-0 text-xs font-bold text-[var(--color-primary)]">
          <span>{formatTime(block.start_time)}</span>
          <span className="text-slate-300 dark:text-slate-600 text-[10px]">até</span>
          <span>{formatTime(block.end_time)}</span>
        </div>

        <div className="w-px self-stretch bg-slate-100 dark:bg-slate-800" />

        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 
              title={displayTitle}
              className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-[var(--color-primary)] transition-colors break-all line-clamp-2 min-w-0"
            >
              {displayTitle}
            </h3>
            {task && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100/60 dark:border-indigo-900/50 shrink-0">
                <ListChecks size={11} strokeWidth={2.5} />
                Tarefa vinculada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
        <button
          onClick={() => onEdit(block)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
          title="Editar bloco"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          title="Remover bloco"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}