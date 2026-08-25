import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
          <p className="text-xs font-semibold text-[var(--color-primary)]">{percentage}%</p>
        </div>
      )}
      <div className="h-2.5 bg-[#E0E1E6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-medium">
        {current} de {total} concluídas
      </p>
    </div>
  );
}
