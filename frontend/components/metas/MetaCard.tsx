import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Meta } from '@/types';
import { getCategoryStyle } from '@/lib/categories';

interface MetaCardProps {
  meta: Meta;
  onCycleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export function MetaCard({ meta, onCycleStatus, onDelete }: MetaCardProps) {
  const statusConfig = {
    nao_cumprida: { label: 'Não cumprida', textClass: 'text-[var(--color-danger)]', bgClass: 'bg-[#FEF2F2]', hoverClass: 'hover:bg-[#FEE2E2]' },
    parcialmente_cumprida: { label: 'Parcialmente', textClass: 'text-[var(--color-warning)]', bgClass: 'bg-[#FFFBEB]', hoverClass: 'hover:bg-[#FEF3C7]' },
    cumprida: { label: 'Cumprida', textClass: 'text-[var(--color-success)]', bgClass: 'bg-[#F0FDF4]', hoverClass: 'hover:bg-[#DCFCE7]' },
  };

  const config = statusConfig[meta.status];
  const categoryStyle = getCategoryStyle(meta.categoria);

  return (
    <div
      style={{ borderLeftColor: categoryStyle.color }}
      className="group p-4 rounded-xl bg-white border border-l-4 border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-xs transition-all duration-200 relative flex flex-col shrink-0"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm text-[var(--color-text)] leading-snug pr-6 break-words">
          {meta.descricao}
        </h4>
        
        <button
          onClick={() => onDelete(meta.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[#FEF2F2] p-1.5 rounded-md transition-all cursor-pointer"
          title="Excluir meta"
        >
          <Trash2 size={15} />
        </button>
      </div>
      
      <div className="mt-2 pt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border)] border-dashed">
        <span className={`inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${categoryStyle.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dotClass}`} />
          {meta.categoria || 'Sem categoria'}
        </span>
        
        <button
          onClick={() => onCycleStatus(meta.id)}
          className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors ${config.textClass} ${config.bgClass} ${config.hoverClass}`}
          title="Clique para alternar o status"
        >
          {config.label}
        </button>
      </div>
    </div>
  );
}