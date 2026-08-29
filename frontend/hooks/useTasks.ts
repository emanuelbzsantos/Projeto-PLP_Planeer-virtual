import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, apiPatch } from './useApi';
import type { TasksByDay } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<TasksByDay>({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiGet<TasksByDay>('/tasks');
      setTasks(data);
    } catch (e) {
      console.error('Erro ao carregar tarefas', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: {
    title: string;
    description: string;
    due_date: string;
    recurring?: boolean;
    recurrence_type?: 'single' | 'weekly';
    recurring_days?: string[];
  }) => {
    await apiPost('/tasks', { task });
    await fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await apiDelete(`/tasks/${id}`);
    await fetchTasks();
  };

  const toggleTask = async (id: number) => {
    await apiPatch(`/tasks/${id}/toggle`);
    await fetchTasks();
  };

  return { tasks, loading, createTask, deleteTask, toggleTask, fetchTasks };
}
