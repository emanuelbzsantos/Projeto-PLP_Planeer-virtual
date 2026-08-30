import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import type { Meta } from '@/types';
import { getCategoryStyle } from '@/lib/categories';

interface MetaCardProps {
  meta: Meta;
  onCycleStatus: (id: number) => void;
  onEdit: (meta: Meta) => void;
  onDelete: (id: number) => void;
}

export function MetaCard({ meta, onCycleStatus, onEdit, onDelete }: MetaCardProps) {
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
      className="group p-4 rounded-xl bg-white border border-l-4 border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-xs transition-all duration-200 flex flex-col shrink-0 min-w-0"
    >
      {/* Texto da Meta */}
      <div className="mb-2 min-w-0">
        <h4 
          title={meta.descricao}
          className="font-semibold text-sm text-[var(--color-text)] leading-snug break-all line-clamp-3 min-w-0"
        >
          {meta.descricao}
        </h4>
      </div>
      
      {/* Linha Inferior com Tag, Botões de Ação ao lado e Status */}
      <div className="mt-2 pt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border)] border-dashed">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md shrink-0 ${categoryStyle.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dotClass}`} />
            {meta.categoria || 'Sem categoria'}
          </span>

          {/* Botões de Ação ao lado da Tag */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(meta)}
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors cursor-pointer"
              title="Editar meta"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(meta.id)}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
              title="Excluir meta"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        
        {/* Status Clicável */}
        <button
          onClick={() => onCycleStatus(meta.id)}
          className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors shrink-0 ${config.textClass} ${config.bgClass} ${config.hoverClass}`}
          title="Clique para alternar o status"
        >
          {config.label}
        </button>
      </div>
    </div>
  );
}