import React, { useState } from 'react';
import { Clock, ListChecks } from 'lucide-react';
import type { Task } from '@/types';
import { FormInput, FormSelect } from '@/components/ui/FormField';

interface PlanningBlockFormProps {
  date: string;
  tasks: Task[];
  onSubmit: (block: {
    date: string;
    start_time: string;
    end_time: string;
    title?: string;
    task_id?: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}

const MAX_TITLE_LENGTH = 100;

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
  const [errors, setErrors] = useState<{ title?: string; taskId?: string; time?: string }>({});

  function applyPreset(preset: typeof DURATION_PRESETS[number]) {
    if ('minutes' in preset && typeof preset.minutes === 'number') {
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + preset.minutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    } else if ('start' in preset && 'end' in preset) {
      setStartTime(preset.start);
      setEndTime(preset.end);
    }
    if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: { title?: string; taskId?: string; time?: string } = {};

    if (!startTime || !endTime) {
      newErrors.time = 'Os horários de início e término são obrigatórios.';
    } else if (endTime <= startTime) {
      newErrors.time = 'O horário de término deve ser após o horário de início.';
    }

    if (mode === 'texto' && !title.trim()) {
      newErrors.title = 'O título do bloco não pode ficar em branco.';
    }

    if (mode === 'tarefa' && !taskId) {
      newErrors.taskId = 'Selecione uma tarefa para vincular ao bloco.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        start_time: combineDateTime(date, startTime),
        end_time: combineDateTime(date, endTime),
        title: mode === 'texto' ? title.trim().slice(0, MAX_TITLE_LENGTH) : undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Seletor de Modo: Texto vs Tarefa */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setMode('texto'); setErrors({}); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
            mode === 'texto'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-xs'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <Clock size={16} />
          Atividade livre
        </button>

        <button
          type="button"
          onClick={() => { setMode('tarefa'); setErrors({}); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
            mode === 'tarefa'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-xs'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
          }`}
        >
          <ListChecks size={16} />
          Vincular tarefa
        </button>
      </div>

      {mode === 'texto' ? (
        <FormInput
          id="pb_title"
          label="O que você vai fazer"
          required
          maxLength={MAX_TITLE_LENGTH}
          currentLength={title.length}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title && e.target.value.trim()) {
              setErrors(prev => ({ ...prev, title: undefined }));
            }
          }}
          error={errors.title}
          placeholder="Ex: Estudo focado de algoritmos"
        />
      ) : (
        <FormSelect
          id="pb_task"
          label="Tarefa vinculada"
          required
          value={taskId}
          onChange={(e) => {
            setTaskId(e.target.value);
            if (errors.taskId && e.target.value) {
              setErrors(prev => ({ ...prev, taskId: undefined }));
            }
          }}
          error={errors.taskId}
        >
          <option value="" disabled>Selecione uma tarefa</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </FormSelect>
      )}

      {/* Horários */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pb_start" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Início <span className="text-rose-500">*</span>
          </label>
          <input
            id="pb_start"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
            }}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm bg-white"
            required
          />
        </div>
        <div>
          <label htmlFor="pb_end" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Fim <span className="text-rose-500">*</span>
          </label>
          <input
            id="pb_end"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
            }}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm bg-white"
            required
          />
        </div>
      </div>

      {errors.time && (
        <p className="text-xs text-rose-500 font-medium animate-in fade-in duration-150">
          ⚠️ {errors.time}
        </p>
      )}

      {/* Atalhos Rápidos */}
      <div>
        <span className="block text-xs font-medium text-slate-500 mb-2">Atalhos de duração</span>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-lg font-medium transition-all bg-white text-slate-600 border border-slate-200 hover:border-slate-300 cursor-pointer"
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
          className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors flex items-center justify-center min-w-[120px] cursor-pointer shadow-xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Adicionar Bloco'}
        </button>
      </div>
    </form>
  );
}