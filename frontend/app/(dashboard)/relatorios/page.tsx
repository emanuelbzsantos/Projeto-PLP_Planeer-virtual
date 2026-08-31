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

  const handleDownloadCSV = () => {
    if (!data) return;
    const { tasks, metas } = data;
    
    const csvLines = [
      "Categoria,Indicador,Valor",
      `Tarefas,Taxa de Conclusão (%),${tasks.completion_rate}`,
      `Tarefas,Pendentes,${tasks.pending}`,
      `Tarefas,Total Cadastrado,${tasks.total}`,
      `Metas,Total,${metas.total}`,
      `Metas,Cumpridas,${metas.cumpridas}`,
      `Metas,Parcialmente Cumpridas,${metas.parcialmente_cumpridas}`,
      `Metas,Não Cumpridas,${metas.nao_cumpridas}`,
      `Metas,Taxa de Conclusão (%),${metas.completion_rate}`,
      "",
      "Histórico de Tarefas (Últimos 7 dias)",
      "Data,Concluídas",
      ...tasks.history_last_7_days.map(d => `${d.date},${d.completed}`)
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvLines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_planner_virtual_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-5rem)] p-4 animate-fade-in">
      <header className="flex justify-between items-end mb-6 print:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Relatórios</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Acompanhe seu desempenho em tarefas e metas.
          </p>
        </div>
        <div className="print:hidden flex items-center gap-3">
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir / PDF
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card: Taxa de Tarefas */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tarefas Concluídas</p>
            <p className="text-xl font-bold text-slate-800">{tasks.completion_rate}%</p>
          </div>
        </div>

        {/* Card: Tarefas Pendentes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tarefas Pendentes</p>
            <p className="text-xl font-bold text-slate-800">{tasks.pending}</p>
          </div>
        </div>

        {/* Card: Taxa de Metas */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Metas Cumpridas</p>
            <p className="text-xl font-bold text-slate-800">{metas.completion_rate}%</p>
          </div>
        </div>

        {/* Card: Total de Metas */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total de Metas</p>
            <p className="text-xl font-bold text-slate-800">{metas.total}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        
        {/* Histórico de Tarefas (BarChart) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tarefas Concluídas (Últimos 7 dias)</h2>
          <div className="flex-1 w-full h-full min-h-0">
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
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Status das Metas</h2>
          <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
              <span className="text-2xl font-bold text-slate-800">{metas.total}</span>
              <span className="text-xs text-slate-500 font-medium">Metas</span>
            </div>
          </div>
          
          {/* Legenda Customizada */}
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs font-medium text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
