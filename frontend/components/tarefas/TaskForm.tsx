import React, { useState } from 'react';
import { Calendar, Repeat, Bell, Check } from 'lucide-react';
import type { RecurrenceType } from '@/types';

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    due_date: string;
    recurring?: boolean;
    recurrence_type?: RecurrenceType;
    recurring_days?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  defaultDate?: string;
}

const DIAS_SEMANA = [
  { key: 'Domingo', label: 'Dom', full: 'Domingo' },
  { key: 'Segunda-feira', label: 'Seg', full: 'Segunda-feira' },
  { key: 'Terça-feira', label: 'Ter', full: 'Terça-feira' },
  { key: 'Quarta-feira', label: 'Qua', full: 'Quarta-feira' },
  { key: 'Quinta-feira', label: 'Qui', full: 'Quinta-feira' },
  { key: 'Sexta-feira', label: 'Sex', full: 'Sexta-feira' },
  { key: 'Sábado', label: 'Sáb', full: 'Sábado' },
];

export function TaskForm({ onSubmit, onCancel, defaultDate = '' }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('single');
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    if (defaultDate) {
      const dateObj = new Date(defaultDate);
      if (!isNaN(dateObj.getTime())) {
        const dayName = DIAS_SEMANA[dateObj.getDay()]?.full;
        return dayName ? [dayName] : [];
      }
    }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSelectWeekly() {
    setRecurrenceType('weekly');
    if (selectedDays.length === 0 && dueDate) {
      const dateObj = new Date(dueDate);
      if (!isNaN(dateObj.getTime())) {
        const dayName = DIAS_SEMANA[dateObj.getDay()]?.full;
        if (dayName) setSelectedDays([dayName]);
      }
    }
  }

  function toggleDay(dayFull: string) {
    setSelectedDays(prev =>
      prev.includes(dayFull)
        ? prev.filter(d => d !== dayFull)
        : [...prev, dayFull]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !dueDate) return;

    setIsSubmitting(true);
    try {
      const isRecurring = recurrenceType === 'weekly';
      // Se for recorrente e nenhum dia foi marcado, usa o dia da data selecionada
      let finalDays = selectedDays;
      if (isRecurring && finalDays.length === 0) {
        const dateObj = new Date(dueDate);
        const dayName = DIAS_SEMANA[dateObj.getDay()]?.full;
        if (dayName) finalDays = [dayName];
      }

      await onSubmit({
        title,
        description,
        due_date: dueDate,
        recurring: isRecurring,
        recurrence_type: recurrenceType,
        recurring_days: isRecurring ? finalDays : [],
      });

      setTitle('');
      setDescription('');
      if (!defaultDate) setDueDate('');
      setRecurrenceType('single');
      setSelectedDays([]);
      onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
          placeholder="Ex: Reunião de alinhamento"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all resize-none h-20 text-sm"
          placeholder="Detalhes adicionais..."
        />
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Data e Hora
        </label>
        <input
          id="due_date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
          required
        />
      </div>

      {/* Seção de Tipo de Lembrete / Recorrência */}
      <div className="pt-2 border-t border-[var(--color-border)]">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-1.5">
          <Bell size={16} className="text-[var(--color-primary)]" />
          Tipo de Lembrete
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Opção Lembrete Único */}
          <button
            type="button"
            onClick={() => setRecurrenceType('single')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              recurrenceType === 'single'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
            }`}
          >
            <Calendar size={16} />
            Único (Pontual)
          </button>

          {/* Opção Lembrete Recorrente Semanal */}
          <button
            type="button"
            onClick={handleSelectWeekly}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              recurrenceType === 'weekly'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
            }`}
          >
            <Repeat size={16} />
            Recorrente Semanal
          </button>
        </div>

        {/* Seleção de dias da semana para lembrete semanal */}
        {recurrenceType === 'weekly' && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
            <span className="text-xs font-medium text-slate-600 block">
              Repetir nos dias da semana:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DIAS_SEMANA.map((dia) => {
                const isSelected = selectedDays.includes(dia.full);
                return (
                  <button
                    key={dia.key}
                    type="button"
                    onClick={() => toggleDay(dia.full)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {dia.label}
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-[11px] text-amber-600">
                Selecione pelo menos um dia (ou usaremos o dia da data selecionada).
              </p>
            )}
          </div>
        )}
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
          disabled={isSubmitting || !title || !dueDate}
        >
          {isSubmitting ? 'Salvando...' : 'Criar Lembrete'}
        </button>
      </div>
    </form>
  );
}

