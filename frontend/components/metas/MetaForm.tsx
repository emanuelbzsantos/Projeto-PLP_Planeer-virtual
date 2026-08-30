import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { FormInput, FormSelect } from '@/components/ui/FormField';
import type { Meta } from '@/types';

interface MetaFormProps {
  onSubmit: (meta: { descricao: string; categoria: string; status: string; periodo: string }) => Promise<void>;
  onCancel: () => void;
  defaultPeriodo?: string;
  initialMeta?: Meta | null;
}

const MAX_DESCRICAO_LENGTH = 100;

export function MetaForm({ onSubmit, onCancel, defaultPeriodo = 'semana', initialMeta = null }: MetaFormProps) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Pessoal');
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ descricao?: string }>({});

  useEffect(() => {
    if (initialMeta) {
      setDescricao(initialMeta.descricao || '');
      setCategoria(initialMeta.categoria || 'Pessoal');
      setPeriodo(initialMeta.periodo || defaultPeriodo);
    } else {
      setDescricao('');
      setCategoria('Pessoal');
      setPeriodo(defaultPeriodo);
    }
    setErrors({});
  }, [initialMeta, defaultPeriodo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!descricao.trim()) {
      setErrors({ descricao: 'A descrição da meta não pode ficar em branco.' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        descricao: descricao.trim().slice(0, MAX_DESCRICAO_LENGTH), 
        categoria, 
        status: initialMeta?.status || 'nao_cumprida', 
        periodo 
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
        id="meta_descricao"
        label="Descrição da Meta"
        required
        maxLength={MAX_DESCRICAO_LENGTH}
        currentLength={descricao.length}
        value={descricao}
        onChange={(e) => {
          setDescricao(e.target.value);
          if (errors.descricao && e.target.value.trim()) {
            setErrors({});
          }
        }}
        error={errors.descricao}
        placeholder="Ex: Ler 30 páginas por dia"
      />
      
      <FormSelect
        id="meta_categoria"
        label="Categoria"
        required
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </FormSelect>
      
      <FormSelect
        id="meta_periodo"
        label="Período"
        required
        value={periodo}
        onChange={(e) => setPeriodo(e.target.value)}
      >
        <option value="semana">Semana</option>
        <option value="mes">Mês</option>
        <option value="ano">Ano</option>
      </FormSelect>
      
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
          {isSubmitting ? 'Salvando...' : initialMeta ? 'Salvar Alterações' : 'Criar Meta'}
        </button>
      </div>
    </form>
  );
}