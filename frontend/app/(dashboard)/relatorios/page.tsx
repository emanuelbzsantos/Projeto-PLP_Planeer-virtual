"use client";

import { useState, useEffect, useMemo } from "react";
import { apiGet } from "@/hooks/useApi";
import { 
  AlertCircle, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  Target, 
  CalendarDays, 
  Download, 
  Printer, 
  FileDown, 
  X,
  CalendarCheck2,
  TrendingUp,
  MinusCircle,
  ClockArrowDown,
  XCircle,
  ShieldCheck,
  UserCheck
} from "lucide-react";
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
  
  const [userName, setUserName] = useState<string>("Usuário");
  const [userEmail, setUserEmail] = useState<string>("");

  // Controle da prévia de impressão/pdf
  const [showPreview, setShowPreview] = useState(false);

  // Carrega informações do usuário logado
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do usuário:", e);
    }
  }, []);

  // Carrega e atualiza o relatório sempre que qualquer filtro mudar
  useEffect(() => {
    handleGenerateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, startDate, endDate, statusFilter]);

  async function handleGenerateReport(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(false);
    try {
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

  function formatDisplayDate(dateStr?: string) {
    if (!dateStr) return "Sem prazo";
    try {
      const sanitized = dateStr.replace("Z", "").replace(/[+-]\d{2}:\d{2}$/, "");
      const d = new Date(sanitized);
      if (isNaN(d.getTime())) return "Sem prazo";
      return d.toLocaleDateString("pt-BR");
    } catch {
      return "Sem prazo";
    }
  }

  // Estatísticas calculadas dinamicamente a partir dos resultados
  const stats = useMemo(() => {
    const items = results || [];
    const total = items.length;

    if (reportType === "tasks") {
      const executadas = items.filter((t) => t.status === "executada" || t.completed).length;
      const parciais = items.filter((t) => t.status === "parcialmente_executada").length;
      const adiadas = items.filter((t) => t.status === "adiada").length;
      const canceladas = items.filter((t) => t.status === "cancelada").length;
      const pendentes = items.filter((t) => (!t.status || t.status === "pendente") && !t.completed).length;
      const rate = total > 0 ? Math.round((executadas / total) * 100) : 0;

      return { total, executadas, parciais, adiadas, canceladas, pendentes, rate };
    } else {
      const cumpridas = items.filter((m) => m.status === "cumprida").length;
      const parciais = items.filter((m) => m.status === "parcialmente_cumprida").length;
      const naoCumpridas = items.filter((m) => m.status === "nao_cumprida" || (!m.status && !m.cumprida)).length;
      const rate = total > 0 ? Math.round((cumpridas / total) * 100) : 0;

      return { total, cumpridas, parciais, naoCumpridas, rate };
    }
  }, [results, reportType]);

  const handleDownloadExcel = () => {
    if (!results || results.length === 0) return;
    
    let excelData: any[] = [];
    
    if (reportType === "tasks") {
      excelData = results.map((task: any) => ({
        "ID": task.id,
        "Título": task.title,
        "Categoria": task.categoria || "Geral",
        "Recorrência": task.recurring ? (task.recurrence_type === "weekly" ? "Semanal" : "Recorrente") : "Única",
        "Data Limite": formatDisplayDate(task.due_date),
        "Status": task.status ? task.status.replace("_", " ") : (task.completed ? "Concluída" : "Pendente")
      }));
    } else {
      excelData = results.map((meta: any) => ({
        "ID": meta.id,
        "Descrição": meta.descricao || meta.title || "",
        "Categoria": meta.categoria || "Geral",
        "Período": meta.periodo ? meta.periodo.charAt(0).toUpperCase() + meta.periodo.slice(1) : "-",
        "Criado em": formatDisplayDate(meta.created_at),
        "Status": meta.status ? meta.status.replace("_", " ") : "-"
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    
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

  // Layout Executivo Moderno para Impressão e PDF
  const renderClassicReport = () => (
    <div className="w-full bg-white text-slate-900 font-sans text-xs p-6 md:p-8 space-y-6">
      {/* 1. Cabeçalho Executivo */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <CalendarCheck2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Planner<span className="text-indigo-600">Virtual</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Relatório Executivo & Analítico de Produtividade
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500 space-y-0.5 border-l border-slate-200 pl-4">
          <p><span className="font-semibold text-slate-700">Documento:</span> REL_{reportType.toUpperCase()}</p>
          <p><span className="font-semibold text-slate-700">Emissor:</span> {userName} {userEmail ? `(${userEmail})` : ""}</p>
          <p><span className="font-semibold text-slate-700">Data de Emissão:</span> {new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* 2. Barra de Metadados / Parâmetros do Filtro no Topo */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="grid grid-cols-4 gap-4 text-[11px]">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Relatório</span>
            <span className="font-semibold text-slate-800 capitalize">
              {reportType === "tasks" ? "Tarefas Detalhadas" : "Metas Estratégicas"}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Período Consultado</span>
            <span className="font-semibold text-slate-800">
              {startDate ? formatDisplayDate(startDate) : "Início"} até {endDate ? formatDisplayDate(endDate) : "Atual"}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Filtro de Status</span>
            <span className="font-semibold text-slate-800 uppercase">
              {statusFilter === "all" ? "Todos os Status" : statusFilter.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Registros Encontrados</span>
            <span className="font-bold text-indigo-600">{stats.total} itens</span>
          </div>
        </div>
      </div>

      {/* 3. Cards de Resumo e Métricas (KPIs) */}
      <div className="grid grid-cols-5 gap-3">
        {reportType === "tasks" ? (
          <>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Total</span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-emerald-700 uppercase">Executadas</span>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{"executadas" in stats ? stats.executadas : 0}</p>
            </div>
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-amber-700 uppercase">Parciais</span>
              <p className="text-lg font-extrabold text-amber-700 mt-0.5">{"parciais" in stats ? stats.parciais : 0}</p>
            </div>
            <div className="bg-slate-100/60 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-slate-600 uppercase">Pendentes</span>
              <p className="text-lg font-extrabold text-slate-700 mt-0.5">{"pendentes" in stats ? stats.pendentes : 0}</p>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-indigo-700 uppercase">Eficiência</span>
              <p className="text-lg font-extrabold text-indigo-700 mt-0.5">{stats.rate}%</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Total</span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-emerald-700 uppercase">Cumpridas</span>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{"cumpridas" in stats ? stats.cumpridas : 0}</p>
            </div>
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-blue-700 uppercase">Parciais</span>
              <p className="text-lg font-extrabold text-blue-700 mt-0.5">{"parciais" in stats ? stats.parciais : 0}</p>
            </div>
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-rose-700 uppercase">Não Cumpridas</span>
              <p className="text-lg font-extrabold text-rose-700 mt-0.5">{"naoCumpridas" in stats ? stats.naoCumpridas : 0}</p>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-lg p-2.5 text-center">
              <span className="text-[9px] font-bold text-indigo-700 uppercase">Atingimento</span>
              <p className="text-lg font-extrabold text-indigo-700 mt-0.5">{stats.rate}%</p>
            </div>
          </>
        )}
      </div>

      {/* 4. Tabela de Dados Enriquecida */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-12 font-mono text-center">ID</th>
              <th className="py-2.5 px-3">{reportType === "tasks" ? "TÍTULO" : "DESCRIÇÃO"}</th>
              <th className="py-2.5 px-3">CATEGORIA</th>
              <th className="py-2.5 px-3 whitespace-nowrap">{reportType === "tasks" ? "RECORRÊNCIA" : "PERÍODO"}</th>
              <th className="py-2.5 px-3 whitespace-nowrap">{reportType === "tasks" ? "DATA LIMITE" : "CRIADO EM"}</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60">
                <td className="py-2 px-3 font-mono text-slate-400 text-center">#{item.id}</td>
                <td className="py-2 px-3 font-semibold text-slate-800">{item.title || item.descricao}</td>
                <td className="py-2 px-3">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-700">
                    {item.categoria || "Geral"}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-600">
                  {reportType === "tasks"
                    ? (item.recurring ? (item.recurrence_type === "weekly" ? "Semanal" : "Recorrente") : "Única")
                    : (item.periodo ? item.periodo.toUpperCase() : "-")}
                </td>
                <td className="py-2 px-3 text-slate-600 font-medium whitespace-nowrap">
                  {reportType === "tasks" ? formatDisplayDate(item.due_date) : formatDisplayDate(item.created_at)}
                </td>
                <td className="py-2 px-3 text-center whitespace-nowrap">
                  {reportType === "tasks" ? (
                    (item.status === "executada" || item.completed) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        EXECUTADA
                      </span>
                    ) : item.status === "parcialmente_executada" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        PARCIAL
                      </span>
                    ) : item.status === "adiada" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                        ADIADA
                      </span>
                    ) : item.status === "cancelada" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                        CANCELADA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                        PENDENTE
                      </span>
                    )
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.status === "cumprida" ? "bg-emerald-100 text-emerald-800" :
                      item.status === "parcialmente_cumprida" ? "bg-blue-100 text-blue-800" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {item.status ? item.status.replace("_", " ").toUpperCase() : "PENDENTE"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(!results || results.length === 0) && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 font-medium italic">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Rodapé Corporativo e Linha de Assinatura */}
      <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
        <div className="space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" />
            Documento emitido através da plataforma PlannerVirtual.
          </p>
          <p className="text-slate-400 text-[9px]">
            Este documento consolida as atividades e metas cadastradas até {new Date().toLocaleDateString("pt-BR")}.
          </p>
        </div>

        <div className="text-center w-52 border-t border-slate-400 pt-1.5">
          <p className="font-bold text-slate-800 text-[10px]">{userName}</p>
          <p className="text-[8px] text-slate-400 uppercase tracking-wider">Responsável / Usuário</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- INTERFACE WEB (ESCONDIDA NA IMPRESSÃO) --- */}
      <div className={`print:hidden w-full max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-5rem)] px-6 lg:px-8 py-6 animate-fade-in ${showPreview ? "hidden" : "flex"}`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
              <FileText className="text-[var(--color-primary)]" size={28} />
              Central de Relatórios
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              Filtre e exporte dados analíticos detalhados sobre suas tarefas e metas.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadExcel}
              disabled={!results || results.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 disabled:opacity-50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <FileDown size={18} />
              Exportar XLSX
            </button>
            
            <button 
              onClick={() => setShowPreview(true)}
              disabled={!results || results.length === 0}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 disabled:opacity-50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <FileText size={18} />
              PDF / Prévia
            </button>
            
            <button 
              onClick={() => setShowPreview(true)}
              disabled={!results || results.length === 0}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>
        </header>

        {/* Painel de Filtros */}
        <div className="bg-white dark:bg-[#141518] p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-6 shrink-0">
          <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tipo</label>
              <select 
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as "tasks" | "metas");
                  setStatusFilter("all");
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
              >
                <option value="tasks">Tarefas Detalhadas</option>
                <option value="metas">Metas Detalhadas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">De (Data Limite)</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Até (Data Limite)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
              >
                <option value="all">Todos</option>
                {reportType === "tasks" ? (
                  <>
                    <option value="executada">Executada</option>
                    <option value="pendente">Pendente</option>
                    <option value="parcialmente_executada">Parcialmente Executada</option>
                    <option value="adiada">Adiada</option>
                    <option value="cancelada">Cancelada</option>
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
                className="w-full h-10 bg-[var(--color-primary)] hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
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

        {/* Tabela de Resultados Interativa */}
        <div className="flex-1 bg-white dark:bg-[#141518] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col">
          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-8">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Erro ao carregar dados.</p>
            </div>
          ) : results === null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <FileText size={64} strokeWidth={1} className="mb-6 opacity-40 text-slate-400" />
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">Nenhum relatório gerado</p>
              <p className="text-sm mt-2">Utilize os filtros acima para buscar dados.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <AlertCircle size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Nenhum registro encontrado para estes filtros.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{reportType === "tasks" ? "Título" : "Descrição"}</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{reportType === "tasks" ? "Data Limite" : "Período"}</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-400 font-mono">#{item.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200">{item.title || item.descricao}</td>
                      
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {item.categoria || "Geral"}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {reportType === "tasks" 
                          ? (item.due_date ? new Date(item.due_date).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : <span className="text-slate-400 italic">Sem prazo</span>)
                          : <span className="capitalize">{item.periodo || "-"}</span>}
                      </td>
                      
                      <td className="py-3 px-4">
                        {reportType === "tasks" ? (
                          (item.status === "executada" || item.completed) ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              <CheckCircle size={12} /> Executada
                            </span>
                          ) : item.status === "parcialmente_executada" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              <Clock size={12} /> Parcial
                            </span>
                          ) : item.status === "adiada" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              <Clock size={12} /> Adiada
                            </span>
                          ) : item.status === "cancelada" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                              <Clock size={12} /> Cancelada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              <Clock size={12} /> Pendente
                            </span>
                          )
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            item.status === "cumprida" ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" :
                            item.status === "parcialmente_cumprida" ? "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" :
                            "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}>
                            <Target size={12} /> 
                            {item.status ? item.status.replace("_", " ") : "-"}
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
      </div>

      {/* --- OVERLAY DE PRÉVIA (ESCONDIDO NA IMPRESSÃO) --- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col print:hidden animate-fade-in">
          {/* Header do Overlay */}
          <div className="p-4 flex justify-between items-center text-white bg-slate-900 shadow-md">
            <div>
              <h3 className="font-bold text-lg">Prévia do Relatório Executivo</h3>
              <p className="text-xs text-slate-400 mt-1">Verifique o layout antes de gerar o PDF ou imprimir.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPreview(false)} 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <X size={18} /> Cancelar
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Printer size={18} /> Confirmar & Gerar PDF
              </button>
            </div>
          </div>
          
          {/* Scroll da folha A4 */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-[1024px] bg-white shadow-2xl rounded-2xl p-2 mb-8 border border-slate-200" style={{ minHeight: "297mm" }}>
              {renderClassicReport()}
            </div>
          </div>
        </div>
      )}

      {/* --- RELATÓRIO CLÁSSICO PARA IMPRESSORA (ESCONDIDO NA WEB) --- */}
      <div className="hidden print:block w-full p-0 m-0">
        {renderClassicReport()}
      </div>
    </>
  );
}
