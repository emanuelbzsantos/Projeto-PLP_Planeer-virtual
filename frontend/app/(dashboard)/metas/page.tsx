// ============================================================
// Página de Metas — /metas
// ============================================================
// Esta página faz 3 coisas:
//   1. Busca as metas da API (GET /metas)
//   2. Exibe as metas organizadas por período (Semana, Mês, Ano)
//   3. Permite criar e excluir metas
// ============================================================

"use client"; // Indica ao Next.js que este componente roda no navegador (client-side)

import { useEffect, useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";

// URL base da API Rails (vem do arquivo .env ou usa o padrão localhost:3000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ----- Definição de Tipo (TypeScript) -----
// Descreve o formato de uma Meta vinda da API
interface Meta {
  id: number;
  descricao: string;
  categoria: string;
  status: string;    // "nao_cumprida", "parcialmente_cumprida" ou "cumprida"
  periodo: string;   // "semana", "mes" ou "ano"
}

// Mapeamento de cores para cada status (para deixar visual)
const STATUS_COLORS: Record<string, string> = {
  nao_cumprida: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  parcialmente_cumprida: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cumprida: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

// Nomes legíveis para os status
const STATUS_LABELS: Record<string, string> = {
  nao_cumprida: "Não cumprida",
  parcialmente_cumprida: "Parcialmente cumprida",
  cumprida: "Cumprida",
};

export default function MetasPage() {
  // ----- Estados do Componente -----
  // "metas" guarda o objeto { "Semana": [...], "Mês": [...], "Ano": [...] }
  const [metas, setMetas] = useState<Record<string, Meta[]>>({});
  // "loading" controla se estamos esperando a resposta da API
  const [loading, setLoading] = useState(true);
  // "showForm" controla se o formulário de nova meta está visível
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário de nova meta
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("nao_cumprida");
  const [periodo, setPeriodo] = useState("semana");

  // ----- Função: Buscar metas da API -----
  // Faz uma requisição GET para /metas e salva o resultado no estado
  async function fetchMetas() {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/metas`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Erro na resposta da API:", response.status);
        return;
      }

      const data = await response.json();
      if (data && typeof data === "object" && !data.error && !data.errors) {
        setMetas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  }

  // ----- Função: Criar uma nova meta -----
  // Faz uma requisição POST para /metas com os dados do formulário
  async function handleCreateMeta(e: React.FormEvent) {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/metas`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          meta: {
            descricao: descricao,
            categoria: categoria,
            status: status,
            periodo: periodo,
          },
        }),
      });

      if (response.ok) {
        // Limpa o formulário e recarrega a lista
        setDescricao("");
        setCategoria("");
        setStatus("nao_cumprida");
        setPeriodo("semana");
        setShowForm(false);
        fetchMetas();
      }
    } catch (error) {
      console.error("Erro ao criar meta:", error);
    }
  }

  // ----- Função: Excluir uma meta -----
  // Faz uma requisição DELETE para /metas/:id
  async function handleDeleteMeta(id: number) {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      await fetch(`${API_URL}/metas/${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchMetas(); // Recarrega a lista após excluir
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
    }
  }

  // ----- useEffect: Executa ao carregar a página -----
  // É chamado automaticamente quando o componente aparece na tela
  useEffect(() => {
    fetchMetas();
  }, []); // O array vazio significa: executar apenas uma vez

  // ----- Renderização (o que aparece na tela) -----
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* Cabeçalho da página */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="text-purple-500" />
            Minhas Metas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Defina metas por semana, mês ou ano.
          </p>
        </div>

        {/* Botão para abrir o formulário de nova meta */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </header>

      {/* ===== Formulário de Nova Meta ===== */}
      {/* Só aparece quando showForm é true */}
      {showForm && (
        <form
          onSubmit={handleCreateMeta}
          className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Criar Nova Meta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Descrição da meta */}
            <input
              type="text"
              placeholder="Descrição da meta"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {/* Campo: Categoria */}
            <input
              type="text"
              placeholder="Categoria (ex: Saúde, Estudos)"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {/* Campo: Status (select/dropdown) */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="nao_cumprida">Não cumprida</option>
              <option value="parcialmente_cumprida">Parcialmente cumprida</option>
              <option value="cumprida">Cumprida</option>
            </select>

            {/* Campo: Período (select/dropdown) */}
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="semana">Semana</option>
              <option value="mes">Mês</option>
              <option value="ano">Ano</option>
            </select>
          </div>

          {/* Botões do formulário */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ===== Lista de Metas por Período ===== */}
      {loading ? (
        // Animação de carregamento enquanto espera a API
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        // Exibe os cards de cada período
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(metas).map(([periodo, lista]) => (
            <div
              key={periodo}
              className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
            >
              {/* Nome do período */}
              <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                {periodo}
              </h3>

              {/* Lista de metas daquele período */}
              {lista && Array.isArray(lista) && lista.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Sem metas
                </p>
              ) : lista && Array.isArray(lista) ? (
                <div className="space-y-3">
                  {lista.map((meta) => (
                    <div
                      key={meta.id}
                      className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Descrição da meta */}
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                            {meta.descricao}
                          </h4>

                          {/* Badges de categoria e status */}
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                              {meta.categoria}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${STATUS_COLORS[meta.status] || ""}`}>
                              {STATUS_LABELS[meta.status] || meta.status}
                            </span>
                          </div>
                        </div>

                        {/* Botão de excluir (aparece ao passar o mouse) */}
                        <button
                          onClick={() => handleDeleteMeta(meta.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                          title="Excluir meta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Erro ao carregar metas
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}