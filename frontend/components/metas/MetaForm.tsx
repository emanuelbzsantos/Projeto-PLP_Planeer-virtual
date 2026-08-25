import React, { useState } from 'react';

interface MetaFormProps {
  onSubmit: (meta: { descricao: string; categoria: string; status: string; periodo: string }) => Promise<void>;
  onCancel: () => void;
  defaultPeriodo?: string;
}

export function MetaForm({ onSubmit, onCancel, defaultPeriodo = 'semana' }: MetaFormProps) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !categoria || !periodo) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ descricao, categoria, status: 'nao_cumprida', periodo });
      setDescricao('');
      setCategoria('');
      if (!defaultPeriodo) setPeriodo('semana');
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
        <label htmlFor="descricao" className="block text-sm font-medium text-[var(--color-text)] mb-1">Descrição</label>
        <input
          id="descricao"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
          placeholder="Ex: Ler 30 páginas por dia"
          required
        />
      </div>
      
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-[var(--color-text)] mb-1">Categoria</label>
        <input
          id="categoria"
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
          placeholder="Ex: Estudos"
          required
        />
      </div>
      
      <div>
        <label htmlFor="periodo" className="block text-sm font-medium text-[var(--color-text)] mb-1">Período</label>
        <select
          id="periodo"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all bg-white"
          required
        >
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
          <option value="ano">Ano</option>
        </select>
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
          disabled={isSubmitting || !descricao || !categoria}
        >
          {isSubmitting ? 'Salvando...' : 'Criar Meta'}
        </button>
      </div>
    </form>
  );
}
