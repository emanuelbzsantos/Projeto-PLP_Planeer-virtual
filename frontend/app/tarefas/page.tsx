// ============================================================
// Página de Tarefas — /tarefas
// ============================================================
// Esta página faz 3 coisas:
//   1. Busca as tarefas da API (GET /tasks)
//   2. Exibe as tarefas organizadas por dia da semana
//   3. Permite criar e excluir tarefas
// ============================================================

"use client"; // Indica ao Next.js que este componente roda no navegador (client-side)

import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";

// URL base da API Rails (vem do arquivo .env ou usa o padrão localhost:3000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ----- Definição de Tipo (TypeScript) -----
// Descreve o formato de uma Tarefa vinda da API
interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string; // Data no formato ISO (ex: "2026-08-20T00:00:00.000Z")
}

export default function TarefasPage() {
  // ----- Estados do Componente -----
  // "tasks" guarda o objeto { "Segunda-feira": [...], "Terça-feira": [...] }
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  // "loading" controla se estamos esperando a resposta da API
  const [loading, setLoading] = useState(true);
  // "showForm" controla se o formulário de nova tarefa está visível
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário de nova tarefa
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ----- Função: Buscar tarefas da API -----
  // Faz uma requisição GET para /tasks e salva o resultado no estado
  async function fetchTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }

  // ----- Função: Criar uma nova tarefa -----
  // Faz uma requisição POST para /tasks com os dados do formulário
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: {
            title: title,
            description: description,
            due_date: dueDate,
          },
        }),
      });

      if (response.ok) {
        // Limpa o formulário e recarrega a lista
        setTitle("");
        setDescription("");
        setDueDate("");
        setShowForm(false);
        fetchTasks();
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  }

  // ----- Função: Excluir uma tarefa -----
  // Faz uma requisição DELETE para /tasks/:id
  async function handleDeleteTask(id: number) {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      fetchTasks(); // Recarrega a lista após excluir
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  }

  // ----- useEffect: Executa ao carregar a página -----
  // É chamado automaticamente quando o componente aparece na tela
  useEffect(() => {
    fetchTasks();
  }, []); // O array vazio [] significa: executar apenas uma vez

  // ----- Renderização (o que aparece na tela) -----
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* Cabeçalho da página */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="text-indigo-500" />
            Minhas Tarefas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize suas tarefas por dia da semana.
          </p>
        </div>

        {/* Botão para abrir o formulário de nova tarefa */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition-colors font-medium"
        >
          <Plus size={20} />
          Nova Tarefa
        </button>
      </header>

      {/* ===== Formulário de Nova Tarefa ===== */}
      {/* Só aparece quando showForm é true */}
      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Criar Nova Tarefa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campo: Título */}
            <input
              type="text"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {/* Campo: Descrição */}
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {/* Campo: Data */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Botões do formulário */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-colors"
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

      {/* ===== Lista de Tarefas por Dia da Semana ===== */}
      {loading ? (
        // Animação de carregamento enquanto espera a API
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        // Exibe os cards de cada dia da semana
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(tasks).map(([dia, lista]) => (
            <div
              key={dia}
              className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
            >
              {/* Nome do dia da semana */}
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                {dia}
              </h3>

              {/* Lista de tarefas daquele dia */}
              {lista.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Sem tarefas
                </p>
              ) : (
                <div className="space-y-3">
                  {lista.map((task) => (
                    <div
                      key={task.id}
                      className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Botão de excluir (aparece ao passar o mouse) */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1"
                          title="Excluir tarefa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
