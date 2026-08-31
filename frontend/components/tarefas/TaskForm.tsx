import React, { useState, useEffect } from 'react';
import { Calendar, Repeat, Bell, Check } from 'lucide-react';
import type { Task, RecurrenceType } from '@/types';
import { CATEGORIES } from '@/lib/categories';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/FormField';

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    due_date: string;
    categoria: string;
    recurring?: boolean;
    recurrence_type?: RecurrenceType;
    recurring_days?: string[];
  }) => Promise<void>;
  onCancel: () => void;
  defaultDate?: string;
  initialTask?: Task | null;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const DIAS_SEMANA = [
  { key: 'Domingo', label: 'Dom', full: 'Domingo' },
  { key: 'Segunda-feira', label: 'Seg', full: 'Segunda-feira' },
  { key: 'Terça-feira', label: 'Ter', full: 'Terça-feira' },
  { key: 'Quarta-feira', label: 'Qua', full: 'Quarta-feira' },
  { key: 'Quinta-feira', label: 'Qui', full: 'Quinta-feira' },
  { key: 'Sexta-feira', label: 'Sex', full: 'Sexta-feira' },
  { key: 'Sábado', label: 'Sáb', full: 'Sábado' },
];

function formatForDatetimeLocal(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export function TaskForm({ onSubmit, onCancel, defaultDate = '', initialTask = null }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoria, setCategoria] = useState<string>('Pessoal');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('single');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  useEffect(() => {
    setErrors({});
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategoria(initialTask.categoria || 'Pessoal');
      setDueDate(formatForDatetimeLocal(initialTask.due_date));
      const isWeekly = initialTask.recurrence_type === 'weekly' || !!initialTask.recurring;
      setRecurrenceType(isWeekly ? 'weekly' : 'single');
      setSelectedDays(initialTask.recurring_days || []);
    } else {
      setTitle('');
      setDescription('');
      setCategoria('Pessoal');
      setDueDate(defaultDate ? defaultDate.slice(0, 16) : '');
      setRecurrenceType('single');

      if (defaultDate) {
        const dateObj = new Date(defaultDate);
        if (!isNaN(dateObj.getTime())) {
          const dayName = DIAS_SEMANA[dateObj.getDay()]?.full;
          setSelectedDays(dayName ? [dayName] : []);
        } else {
          setSelectedDays([]);
        }
      } else {
        setSelectedDays([]);
      }
    }
  }, [initialTask, defaultDate]);

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
    
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'O título da tarefa não pode ficar em branco.';
    }
    if (!dueDate) {
      newErrors.dueDate = 'A data e o horário são obrigatórios.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const isRecurring = recurrenceType === 'weekly';
      let finalDays = selectedDays;
      if (isRecurring && finalDays.length === 0) {
        const dateObj = new Date(dueDate);
        const dayName = DIAS_SEMANA[dateObj.getDay()]?.full;
        if (dayName) finalDays = [dayName];
      }

      await onSubmit({
        title: title.trim().slice(0, MAX_TITLE_LENGTH),
        description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
        due_date: dueDate,
        categoria,
        recurring: isRecurring,
        recurrence_type: recurrenceType,
        recurring_days: isRecurring ? finalDays : [],
      });

      onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormInput
        id="task_title"
        label="Título"
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
        placeholder="Ex: Reunião de alinhamento"
      />

      <FormSelect
        id="task_categoria"
        label="Categoria"
        required
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </FormSelect>

      <FormTextarea
        id="task_description"
        label="Descrição (opcional)"
        maxLength={MAX_DESCRIPTION_LENGTH}
        currentLength={description.length}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detalhes adicionais..."
        rows={3}
      />

      <FormInput
        id="task_due_date"
        type="datetime-local"
        label="Data e Hora"
        required
        value={dueDate}
        onChange={(e) => {
          setDueDate(e.target.value);
          if (errors.dueDate && e.target.value) {
            setErrors(prev => ({ ...prev, dueDate: undefined }));
          }
        }}
        error={errors.dueDate}
      />

      <div className="pt-2 border-t border-[var(--color-border)] dark:border-slate-700">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2 flex items-center gap-1.5">
          <Bell size={16} className="text-[var(--color-primary)]" />
          Tipo de Lembrete
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRecurrenceType('single')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
              recurrenceType === 'single'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
            }`}
          >
            <Calendar size={16} />
            Único (Pontual)
          </button>

          <button
            type="button"
            onClick={handleSelectWeekly}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
              recurrenceType === 'weekly'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/40 text-[var(--color-primary)] font-semibold shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
            }`}
          >
            <Repeat size={16} />
            Recorrente Semanal
          </button>
        </div>

        {recurrenceType === 'weekly' && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-200">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
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
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {dia.label}
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
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
          className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors flex items-center justify-center min-w-[120px] cursor-pointer shadow-xs"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : initialTask ? 'Salvar Alterações' : 'Criar Lembrete'}
        </button>
      </div>
    </form>
  );
}