import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (task: { title: string; description: string; due_date: string }) => Promise<void>;
  onCancel: () => void;
  defaultDate?: string;
}

export function TaskForm({ onSubmit, onCancel, defaultDate = '' }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !dueDate) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, due_date: dueDate });
      setTitle('');
      setDescription('');
      if (!defaultDate) setDueDate('');
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
        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-1">Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
          placeholder="Ex: Estudar React"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text)] mb-1">Descrição (opcional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all resize-none h-20"
          placeholder="Detalhes adicionais..."
        />
      </div>
      
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-[var(--color-text)] mb-1">Data</label>
        <input
          id="due_date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
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
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors flex items-center justify-center min-w-[100px]"
          disabled={isSubmitting || !title || !dueDate}
        >
          {isSubmitting ? 'Salvando...' : 'Criar Tarefa'}
        </button>
      </div>
    </form>
  );
}
