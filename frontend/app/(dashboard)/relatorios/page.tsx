"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/hooks/useApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, CheckCircle, Clock, Target, AlertCircle } from "lucide-react";

// Tipagens para os dados
interface TasksReport {
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
  history_last_7_days: { date: string; completed: number }[];
}

interface MetasReport {
  total: number;
  cumpridas: number;
  parcialmente_cumpridas: number;
  nao_cumpridas: number;
  completion_rate: number;
}

interface ReportData {
  tasks: TasksReport;
  metas: MetasReport;
}

// Cores para os gráficos de pizza (Tailwind: indigo-500, blue-400, slate-300)
const COLORS = ["#6366f1", "#60a5fa", "#cbd5e1"];

export default function RelatoriosPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await apiGet<ReportData>("/reports");
        if (response) {
          setData(response);
        }
      } catch (err) {
        console.error("Erro ao carregar relatórios", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Não foi possível carregar os relatórios.</p>
      </div>
    );
  }

  const { tasks, metas } = data;

  // Prepara dados para o gráfico de pizza das Metas
  const pieData = [
    { name: "Cumpridas", value: metas.cumpridas },
    { name: "Parciais", value: metas.parcialmente_cumpridas },
    { name: "Não Cumpridas", value: metas.nao_cumpridas }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe seu desempenho em tarefas e metas.
        </p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Taxa de Tarefas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tarefas Concluídas</p>
            <p className="text-2xl font-bold text-slate-800">{tasks.completion_rate}%</p>
          </div>
        </div>

        {/* Card: Tarefas Pendentes */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tarefas Pendentes</p>
            <p className="text-2xl font-bold text-slate-800">{tasks.pending}</p>
          </div>
        </div>

        {/* Card: Taxa de Metas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Metas Cumpridas</p>
            <p className="text-2xl font-bold text-slate-800">{metas.completion_rate}%</p>
          </div>
        </div>

        {/* Card: Total de Metas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Metas</p>
            <p className="text-2xl font-bold text-slate-800">{metas.total}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Histórico de Tarefas (BarChart) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Tarefas Concluídas (Últimos 7 dias)</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasks.history_last_7_days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="completed" 
                  name="Concluídas" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Metas (PieChart) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Status das Metas</h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Texto central do Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">{metas.total}</span>
              <span className="text-sm text-slate-500 font-medium">Metas</span>
            </div>
          </div>
          
          {/* Legenda Customizada */}
          <div className="flex justify-center gap-6 mt-6">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm font-medium text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
