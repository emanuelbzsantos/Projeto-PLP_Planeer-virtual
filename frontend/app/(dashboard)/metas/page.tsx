"use client";

import { useState } from "react";
import { useMetas } from "@/hooks/useMetas";
import { Plus, Target, Search } from "lucide-react";
import { MetaCard } from "@/components/metas/MetaCard";
import { MetaForm } from "@/components/metas/MetaForm";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MetasPage() {
  const { metas, loading, createMeta, cycleStatus, deleteMeta } = useMetas();
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState("semana");
  const [searchTerm, setSearchTerm] = useState("");

  const periodosOrder = [
    { key: "Semana", value: "semana" },
    { key: "Mês", value: "mes" },
    { key: "Ano", value: "ano" }
  ];

  function openFormForPeriodo(periodoValue: string) {
    setSelectedPeriodo(periodoValue);
    setShowForm(true);
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <Target size={24} />
            </div>
            Minhas Metas
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Acompanhe seus objetivos de curto, médio e longo prazo.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar metas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            onClick={() => openFormForPeriodo("semana")}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={20} />
            Nova Meta
          </button>
        </div>
      </header>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Meta">
        <MetaForm 
          onSubmit={async (m) => { await createMeta(m); setShowForm(false); }} 
          onCancel={() => setShowForm(false)} 
          defaultPeriodo={selectedPeriodo}
        />
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {loading ? (
          periodosOrder.map((p) => (
            <div key={p.key} className="animate-pulse">
              <div className="h-10 bg-gray-100 rounded-lg mb-4"></div>
              <div className="h-40 bg-gray-100 rounded-xl mb-3"></div>
              <div className="h-40 bg-gray-100 rounded-xl"></div>
            </div>
          ))
        ) : (
          periodosOrder.map((p) => {
            const rawLista = metas[p.key] || [];
            const lista = rawLista.filter(meta => 
              meta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (meta.categoria && meta.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            return (
              <div key={p.key} className="flex flex-col">
                {/* Header do período */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-transparent group">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-2">
                    {p.key}
                  </h3>
                  
                  <button 
                    onClick={() => openFormForPeriodo(p.value)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md"
                    title={`Adicionar meta para ${p.key}`}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Lista de metas */}
                <div className="flex-1 flex flex-col gap-3">
                  {lista.length === 0 ? (
                    <EmptyState 
                      icon={<TargetPlaceholder />} 
                      title="Nenhuma meta" 
                      description={`Você não tem metas para este ${p.key.toLowerCase()}.`}
                    />
                  ) : (
                    lista.map((meta) => (
                      <MetaCard
                        key={meta.id}
                        meta={meta}
                        onCycleStatus={cycleStatus}
                        onDelete={deleteMeta}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TargetPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}