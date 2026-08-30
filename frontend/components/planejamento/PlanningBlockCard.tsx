import { Trash2, ListChecks } from 'lucide-react';
import type { PlanningBlock, Task } from '@/types';

interface PlanningBlockCardProps {
  block: PlanningBlock;
  task?: Task;
  onDelete: (id: number) => void;
}

function formatTime(datetime: string) {
  const match = datetime.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '--:--';
}

export function PlanningBlockCard({ block, task, onDelete }: PlanningBlockCardProps) {
  const displayTitle = task?.title ?? block.title ?? 'Sem título';

  return (
    <div className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300/80 transition-all rounded-2xl shadow-2xs">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-14 shrink-0 text-xs font-bold text-[var(--color-primary)]">
          <span>{formatTime(block.start_time)}</span>
          <span className="text-slate-300 text-[10px]">até</span>
          <span>{formatTime(block.end_time)}</span>
        </div>

        <div className="w-px self-stretch bg-slate-100" />

        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 
              title={displayTitle}
              className="font-bold text-sm text-slate-700 group-hover:text-[var(--color-primary)] transition-colors break-all line-clamp-2 min-w-0"
            >
              {displayTitle}
            </h3>
            {task && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60 shrink-0">
                <ListChecks size={11} strokeWidth={2.5} />
                Tarefa vinculada
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl shrink-0 ml-2 cursor-pointer"
        title="Remover bloco"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}