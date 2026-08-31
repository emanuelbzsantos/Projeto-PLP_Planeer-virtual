import { 
  Users, 
  PhoneCall, 
  ShoppingCart, 
  BookOpen, 
  Dumbbell, 
  PackageCheck,
  Tag,
  type LucideIcon 
} from 'lucide-react';
import type { TaskCategory } from '@/types';

export const TASK_CATEGORIES: TaskCategory[] = [
  'Reuniões',
  'Ligações',
  'Compras',
  'Estudos',
  'Exercícios',
  'Entregas de trabalhos',
];

export interface TaskCategoryConfig {
  name: TaskCategory;
  icon: LucideIcon;
  badgeClass: string;
  dotClass: string;
  color: string;
  bgLight: string;
}

export const TASK_CATEGORY_CONFIGS: Record<TaskCategory, TaskCategoryConfig> = {
  'Reuniões': {
    name: 'Reuniões',
    icon: Users,
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    dotClass: 'bg-purple-500',
    color: '#9333ea',
    bgLight: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
  },
  'Ligações': {
    name: 'Ligações',
    icon: PhoneCall,
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    color: '#059669',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
  },
  'Compras': {
    name: 'Compras',
    icon: ShoppingCart,
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-500',
    color: '#d97706',
    bgLight: 'bg-amber-50 hover:bg-amber-100 text-amber-700',
  },
  'Estudos': {
    name: 'Estudos',
    icon: BookOpen,
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dotClass: 'bg-blue-500',
    color: '#2563eb',
    bgLight: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
  },
  'Exercícios': {
    name: 'Exercícios',
    icon: Dumbbell,
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClass: 'bg-rose-500',
    color: '#e11d48',
    bgLight: 'bg-rose-50 hover:bg-rose-100 text-rose-700',
  },
  'Entregas de trabalhos': {
    name: 'Entregas de trabalhos',
    icon: PackageCheck,
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dotClass: 'bg-indigo-500',
    color: '#4f46e5',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
  },
};

const DEFAULT_CONFIG: TaskCategoryConfig = {
  name: 'Estudos',
  icon: Tag,
  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  dotClass: 'bg-slate-500',
  color: '#64748b',
  bgLight: 'bg-slate-50 hover:bg-slate-100 text-slate-700',
};

export function getTaskCategoryConfig(category?: string): TaskCategoryConfig {
  if (!category) return DEFAULT_CONFIG;
  return TASK_CATEGORY_CONFIGS[category as TaskCategory] ?? DEFAULT_CONFIG;
}
