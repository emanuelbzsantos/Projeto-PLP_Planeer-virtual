export type RecurrenceType = 'single' | 'weekly';

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  categoria: string;
  recurring?: boolean;
  recurrence_type?: RecurrenceType;
  recurring_days?: string[];
}

export interface Meta {
  id: number;
  descricao: string;
  categoria: string;
  status: 'nao_cumprida' | 'parcialmente_cumprida' | 'cumprida';
  periodo: 'semana' | 'mes' | 'ano';
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export interface PlanningBlock {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  task_id?: number;
}

export type TasksByDay = Record<string, Task[]>;
export type MetasByPeriod = Record<string, Meta[]>;

