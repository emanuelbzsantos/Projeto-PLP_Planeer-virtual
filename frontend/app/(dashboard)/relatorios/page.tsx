"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/hooks/useApi";
import { AlertCircle, Search, FileText, CheckCircle, Clock, Target, CalendarDays, Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import type { Task, Meta } from "@/types";

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState<"tasks" | "metas">("tasks");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  // Carrega o relatório padrão (Tarefas) ao montar a página
  useEffect(() => {
    handleGenerateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerateReport(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(false);
    try {
      // Montar query string
      const params = new URLSearchParams({ type: reportType });
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const response = await apiGet<any[]>(`/reports/custom?${params.toString()}`);
      setResults(response || []);
    } catch (err) {
      console.error("Erro ao gerar relatório", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadExcel = () => {
    if (!results || results.length === 0) return;
    
    let excelData: any[] = [];
    
    if (reportType === "tasks") {
      excelData = results.map((task: Task) => ({
        "ID": task.id,
        "Título": task.title,
        "Categoria": task.category || "Geral",
        "Data Limite": task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem prazo",
        "Status": task.completed ? "Concluída" : "Pendente"
      }));
    } else {
      excelData = results.map((meta: Meta) => ({
        "ID": meta.id,
        "Título": meta.title,
        "Data Limite": meta.deadline ? new Date(meta.deadline).toLocaleDateString("pt-BR") : "Sem prazo",
        "Status": meta.status.replace('_', ' ')
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    
    // Configura a largura das colunas
    const maxWidths = excelData.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const val = row[key] ? row[key].toString() : "";
        acc[i] = Math.max(acc[i] || key.length, val.length);
      });
      return acc;
    }, []);
    worksheet["!cols"] = maxWidths.map((w: number) => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `relatorio_${reportType}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-5rem)] px-6 lg:px-8 py-6 animate-fade-in">
      <header className="flex justify-between items-end mb-6 print:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Gerador de Relatórios</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1 print:hidden">
            Filtre e exporte dados detalhados sobre suas tarefas e metas.
          </p>
        </div>
        <div className="print:hidden flex items-center gap-3">
          <button 
            onClick={handleDownloadExcel}
            disabled={!results || results.length === 0}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={18} />
            Exportar XLSX
          </button>
          <button 
            onClick={() => window.print()}
            disabled={!results || results.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Printer size={18} />
            Imprimir PDF
          </button>
        </div>
      </header>

      {/* Painel de Filtros (Oculto na Impressão) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 print:hidden shrink-0">
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo</label>
            <select 
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as "tasks"|"metas");
                setStatusFilter("all");
                setResults(null);
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="tasks">Tarefas Detalhadas</option>
              <option value="metas">Metas Detalhadas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">De (Data Limite)</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Até (Data Limite)</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              {reportType === "tasks" ? (
                <>
                  <option value="completed">Concluídas</option>
                  <option value="pending">Pendentes</option>
                </>
              ) : (
                <>
                  <option value="cumprida">Cumpridas</option>
                  <option value="parcialmente_cumprida">Parcialmente Cumpridas</option>
                  <option value="nao_cumprida">Não Cumpridas</option>
                </>
              )}
            </select>
          </div>

          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[var(--color-primary)] hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  Gerar Relatório
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Resultados */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-8">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Erro ao carregar dados.</p>
          </div>
        ) : results === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <FileText size={64} strokeWidth={1} className="mb-6 opacity-40 text-slate-400" />
            <p className="text-xl font-medium text-slate-500">Nenhum relatório gerado</p>
            <p className="text-sm mt-2">Utilize os filtros acima para buscar dados.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <AlertCircle size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum registro encontrado para estes filtros.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Título</th>
                  {reportType === "tasks" && <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>}
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data Limite</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-400 font-mono">#{item.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-700">{item.title}</td>
                    
                    {reportType === "tasks" && (
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                          {item.category || "Geral"}
                        </span>
                      </td>
                    )}
                    
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {(item.due_date || item.deadline) 
                        ? new Date(item.due_date || item.deadline).toLocaleDateString("pt-BR", { timeZone: 'UTC' }) 
                        : <span className="text-slate-400 italic">Sem prazo</span>}
                    </td>
                    
                    <td className="py-3 px-4">
                      {reportType === "tasks" ? (
                        item.completed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle size={12} /> Concluída
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock size={12} /> Pendente
                          </span>
                        )
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          item.status === 'cumprida' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          item.status === 'parcialmente_cumprida' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <Target size={12} /> 
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Título de Impressão (Só aparece no papel) */}
      <div className="hidden print:block fixed bottom-4 right-4 text-xs text-slate-400">
        Gerado em {new Date().toLocaleString('pt-BR')} pelo PlannerVirtual
      </div>
    </div>
  );
}
