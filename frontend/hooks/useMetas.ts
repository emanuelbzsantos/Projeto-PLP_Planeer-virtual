import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, apiPatch } from './useApi';
import type { MetasByPeriod, Meta } from '@/types';

export function useMetas() {
  const [metas, setMetas] = useState<MetasByPeriod>({});
  const [loading, setLoading] = useState(true);

  const fetchMetas = useCallback(async () => {
    try {
      const data = await apiGet<MetasByPeriod>('/metas');
      setMetas(data);
    } catch (e) {
      console.error('Erro ao carregar metas', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetas();
  }, [fetchMetas]);

  const createMeta = async (meta: { descricao: string; categoria: string; status: string; periodo: string }) => {
    await apiPost('/metas', { meta });
    await fetchMetas();
  };

  const updateMeta = async (id: number, meta: Partial<{ descricao: string; categoria: string; status: string; periodo: string }>) => {
    await apiPatch(`/metas/${id}`, { meta });
    await fetchMetas();
  };

  const deleteMeta = async (id: number) => {
    await apiDelete(`/metas/${id}`);
    await fetchMetas();
  };

  const cycleStatus = async (id: number) => {
    await apiPatch(`/metas/${id}/cycle_status`);
    await fetchMetas();
  };

  return { metas, loading, createMeta, updateMeta, deleteMeta, cycleStatus, fetchMetas };
}