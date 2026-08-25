import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/50 rounded-2xl border border-dashed border-[var(--color-border)] h-full min-h-[200px]">
      <div className="text-[var(--color-text-secondary)] mb-4 opacity-40 [&>svg]:w-10 [&>svg]:h-10">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--color-text)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-5 max-w-[250px] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction} 
          className="text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors px-4 py-2 rounded-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
