import { Trash2, ListChecks, Clock } from 'lucide-react';
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
    <div className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all rounded-2xl">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 text-xs font-bold text-[var(--color-primary)]">
          <span>{formatTime(block.start_time)}</span>
          <span className="text-slate-300 text-[10px]">até</span>
          <span>{formatTime(block.end_time)}</span>
        </div>

        <div className="w-px self-stretch bg-slate-100" />

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
              {displayTitle}
            </h3>
            {task ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                <ListChecks size={10} strokeWidth={2.5} />
                Tarefa vinculada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                <Clock size={10} strokeWidth={2.5} />
                Livre
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 ml-3"
        title="Remover bloco"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}