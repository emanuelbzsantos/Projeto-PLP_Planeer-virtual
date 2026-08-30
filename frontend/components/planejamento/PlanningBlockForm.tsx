import React, { useState } from 'react';
import { Clock, ListChecks } from 'lucide-react';
import type { Task } from '@/types';

interface PlanningBlockFormProps {
  date: string; // formato YYYY-MM-DD, dia selecionado na página
  tasks: Task[]; // lista de tasks do usuário, para vincular opcionalmente
  onSubmit: (block: {
    date: string;
    start_time: string;
    end_time: string;
    title?: string;
    task_id?: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}

// Atalhos rápidos de duração — só preenchem o horário de término a partir do início
const DURATION_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hora', minutes: 60 },
  { label: 'Manhã (08h-12h)', start: '08:00', end: '12:00' },
  { label: 'Tarde (13h-18h)', start: '13:00', end: '18:00' },
  { label: 'Noite (19h-22h)', start: '19:00', end: '22:00' },
];

function combineDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export function PlanningBlockForm({ date, tasks, onSubmit, onCancel }: PlanningBlockFormProps) {
  const [mode, setMode] = useState<'texto' | 'tarefa'>('texto');
  const [title, setTitle] = useState('');
  const [taskId, setTaskId] = useState<string>('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function applyPreset(preset: typeof DURATION_PRESETS[number]) {
    if ('minutes' in preset && typeof preset.minutes === 'number') {
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + preset.minutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    } else {
      setStartTime(preset.start);
      setEndTime(preset.end);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startTime || !endTime) return;
    if (mode === 'texto' && !title.trim()) return;
    if (mode === 'tarefa' && !taskId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        start_time: combineDateTime(date, startTime),
        end_time: combineDateTime(date, endTime),
        title: mode === 'texto' ? title : undefined,
        task_id: mode === 'tarefa' ? Number(taskId) : null,
      });

      setTitle('');
      setTaskId('');
      onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('texto')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
            mode === 'texto'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Clock size={16} />
          Atividade livre
        </button>

        <button
          type="button"
          onClick={() => setMode('tarefa')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
            mode === 'tarefa'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <ListChecks size={16} />
          Vincular tarefa
        </button>
      </div>

      {mode === 'texto' ? (
        <div>
          <label htmlFor="pb_title" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            O que você vai fazer
          </label>
          <input
            id="pb_title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
            placeholder="Ex: Estudar Java"
            required
          />
        </div>
      ) : (
        <div>
          <label htmlFor="pb_task" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Tarefa
          </label>
          <select
            id="pb_task"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all bg-white text-sm"
            required
          >
            <option value="" disabled>Selecione uma tarefa</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
          {tasks.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">
              Você ainda não tem tarefas cadastradas.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pb_start" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Início
          </label>
          <input
            id="pb_start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="pb_end" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Fim
          </label>
          <input
            id="pb_end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
            required
          />
        </div>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-500 mb-2">Atalhos de duração</span>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-lg font-medium transition-all bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors flex items-center justify-center min-w-[110px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Adicionar Bloco'}
        </button>
      </div>
    </form>
  );
}