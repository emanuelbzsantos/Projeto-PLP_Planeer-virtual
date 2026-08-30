import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from './useApi';
import type { PlanningBlock } from '@/types';

export function usePlanningBlocks(date: string) {
  const [planningBlocks, setPlanningBlocks] = useState<PlanningBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlanningBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<PlanningBlock[]>(`/planning_blocks?date=${date}`);
      setPlanningBlocks(data);
    } catch (e) {
      console.error('Erro ao carregar planejamento', e);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchPlanningBlocks();
  }, [fetchPlanningBlocks]);

  const createPlanningBlock = async (block: {
    date: string;
    start_time: string;
    end_time: string;
    title?: string;
    task_id?: number | null;
  }) => {
    await apiPost('/planning_blocks', { planning_block: block });
    await fetchPlanningBlocks();
  };

  const updatePlanningBlock = async (
    id: number,
    block: Partial<{
      date: string;
      start_time: string;
      end_time: string;
      title: string;
      task_id: number | null;
    }>
  ) => {
    await apiPatch(`/planning_blocks/${id}`, { planning_block: block });
    await fetchPlanningBlocks();
  };

  const deletePlanningBlock = async (id: number) => {
    await apiDelete(`/planning_blocks/${id}`);
    await fetchPlanningBlocks();
  };

  return {
    planningBlocks,
    loading,
    createPlanningBlock,
    updatePlanningBlock,
    deletePlanningBlock,
    fetchPlanningBlocks,
  };
}