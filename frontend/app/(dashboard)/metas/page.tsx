"use client";

import { useState } from "react";
import { useMetas } from "@/hooks/useMetas";
import { Plus, Target, Search, X } from "lucide-react";
import { MetaCard } from "@/components/metas/MetaCard";
import { MetaForm } from "@/components/metas/MetaForm";
import { Modal } from "@/components/ui/Modal";
import type { Meta } from "@/types";

export default function MetasPage() {
  const { metas, loading, createMeta, updateMeta, cycleStatus, deleteMeta } = useMetas();
  const [showForm, setShowForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState("semana");
  const [searchTerm, setSearchTerm] = useState("");

  const periodosConfig = [
    { key: "Semana", value: "semana", title: "Metas da Semana", subtitle: "Foco no curto prazo" },
    { key: "Mês", value: "mes", title: "Metas do Mês", subtitle: "Foco no médio prazo" },
    { key: "Ano", value: "ano", title: "Metas do Ano", subtitle: "Grandes objetivos" }
  ];

  function openCreateForm(periodoValue: string) {
    setEditingMeta(null);
    setSelectedPeriodo(periodoValue);
    setShowForm(true);
  }

  function handleEditMeta(meta: Meta) {
    setEditingMeta(meta);
    setSelectedPeriodo(meta.periodo);
    setShowForm(true);
  }

  async function handleFormSubmit(metaData: { descricao: string; categoria: string; status: string; periodo: string }) {
    if (editingMeta) {
      await updateMeta(editingMeta.id, metaData);
    } else {
      await createMeta(metaData);
    }
    setShowForm(false);
    setEditingMeta(null);
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 md:p-8 w-full max-w-none overflow-hidden">
      {/* Top Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-2xl text-purple-600 shadow-xs">
            <Target size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Minhas Metas
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Acompanhe seus objetivos estratégicos de curto, médio e longo prazo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar metas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-2 w-56 md:w-64 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-sm text-[var(--color-text)] shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => openCreateForm("semana")}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} />
            Nova Meta
          </button>
        </div>
      </header>

      <Modal 
        open={showForm} 
        onClose={() => { setShowForm(false); setEditingMeta(null); }} 
        title={editingMeta ? "Editar Meta" : "Nova Meta"}
      >
        <MetaForm 
          initialMeta={editingMeta}
          onSubmit={handleFormSubmit} 
          onCancel={() => { setShowForm(false); setEditingMeta(null); }} 
          defaultPeriodo={selectedPeriodo}
        />
      </Modal>

      {/* Grid de 3 Colunas 100% da Largura com Scroll Interno */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch pb-2">
        {periodosConfig.map((p) => {
          const rawLista = metas[p.key] || [];
          const lista = rawLista.filter(meta => 
            meta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (meta.categoria && meta.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          return (
            <div 
              key={p.key} 
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 h-full min-h-0 hover:border-slate-300/80 transition-all"
            >
              {/* Header do Período */}
              <div className="shrink-0 flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/80">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    {p.title}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                    {p.subtitle}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                    {lista.length}
                  </span>
                  <button 
                    onClick={() => openCreateForm(p.value)}
                    className="p-1 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md transition-colors cursor-pointer"
                    title={`Adicionar meta para ${p.key}`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Lista de Metas com Scroll Vertical Interno */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-28 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-28 bg-slate-200/60 rounded-xl"></div>
                  </div>
                ) : lista.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 text-center px-4">
                    <TargetPlaceholder />
                    <span className="font-medium mt-2">{searchTerm ? "Nenhuma meta encontrada" : "Nenhuma meta"}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Você não tem metas para este período.</span>
                  </div>
                ) : (
                  lista.map((meta) => (
                    <MetaCard
                      key={meta.id}
                      meta={meta}
                      onCycleStatus={cycleStatus}
                      onEdit={handleEditMeta}
                      onDelete={deleteMeta}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TargetPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}