"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Plus, Search, CalendarDays, X, CheckCircle2, Clock } from "lucide-react";
import { TaskCard } from "@/components/tarefas/TaskCard";
import { TaskForm } from "@/components/tarefas/TaskForm";
import { Modal } from "@/components/ui/Modal";
import type { Task } from "@/types";

const DIAS_SEMANA = [
  { full: "Domingo", short: "Dom" },
  { full: "Segunda-feira", short: "Seg" },
  { full: "Terça-feira", short: "Ter" },
  { full: "Quarta-feira", short: "Qua" },
  { full: "Quinta-feira", short: "Qui" },
  { full: "Sexta-feira", short: "Sex" },
  { full: "Sábado", short: "Sáb" },
];

export default function TarefasPage() {
  const { tasks, loading, createTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Domingo
    
    // Início da semana atual (Domingo)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return DIAS_SEMANA.map((dia, index) => {
      const dateForDay = new Date(startOfWeek);
      dateForDay.setDate(startOfWeek.getDate() + index);

      const dayOfMonth = pad(dateForDay.getDate());
      const monthShort = dateForDay.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      const formattedDate = `${dayOfMonth} ${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}`;

      const isToday =
        dateForDay.getDate() === today.getDate() &&
        dateForDay.getMonth() === today.getMonth() &&
        dateForDay.getFullYear() === today.getFullYear();

      // Data padrão no formato aceito pelo input datetime-local às 09:00
      const defaultIsoDate = `${dateForDay.getFullYear()}-${pad(dateForDay.getMonth() + 1)}-${dayOfMonth}T09:00`;

      return {
        ...dia,
        formattedDate,
        isToday,
        defaultIsoDate,
      };
    });
  }, []);

  function openCreateForm(dateString?: string) {
    setEditingTask(null);
    setSelectedDate(dateString || "");
    setIsModalOpen(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setSelectedDate(task.due_date);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTask(null);
    setSelectedDate("");
  }

  async function handleFormSubmit(taskData: any) {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    closeModal();
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-5 md:p-6 w-full mx-auto overflow-hidden">
      {/* Top Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary-light)] p-2.5 rounded-2xl text-[var(--color-primary)] shadow-xs">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              Minha Semana
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Organize e acompanhe suas tarefas da semana de forma integrada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seletor de Filtro de Status (Todas / Pendentes / Concluídas) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-800 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "pending"
                  ? "bg-white text-[var(--color-primary)] shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={12} />
              Pendentes
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "completed"
                  ? "bg-white text-emerald-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckCircle2 size={12} />
              Concluídas
            </button>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all w-52 md:w-60 shadow-xs text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Limpar pesquisa"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Botão Nova Tarefa */}
          <button
            onClick={() => openCreateForm()}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={17} />
            Nova Tarefa
          </button>
        </div>
      </header>

      {/* Modal de Criação / Edição de Tarefas */}
      <Modal 
        open={isModalOpen} 
        onClose={closeModal} 
        title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}
      >
        <TaskForm 
          onSubmit={handleFormSubmit} 
          onCancel={closeModal} 
          defaultDate={selectedDate}
          initialTask={editingTask}
        />
      </Modal>

      {/* Grid de 7 colunas - 100% da largura útil e altura restante com scroll interno */}
      <div className="flex-1 min-h-0 grid grid-cols-7 gap-3 w-full items-stretch pb-2">
        {weekDays.map((dia) => {
          const lista = tasks[dia.full] || [];
          
          // Filtro por status (Todas, Pendentes, Concluídas)
          const listaFiltradaPorStatus = lista.filter((t) => {
            if (statusFilter === "pending") return !t.completed;
            if (statusFilter === "completed") return t.completed;
            return true;
          });

          // Filtro de busca em tempo real
          const listaFiltrada = searchTerm.trim() !== ""
            ? listaFiltradaPorStatus.filter((task) =>
                task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : listaFiltradaPorStatus;

          // Ordenação crescente por Data e Horário (do mais próximo para o mais distante)
          const listaOrdenada = [...listaFiltrada].sort((a, b) => {
            const timeA = new Date(a.due_date).getTime();
            const timeB = new Date(b.due_date).getTime();
            if (isNaN(timeA) && isNaN(timeB)) return 0;
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            return timeA - timeB;
          });

          const pendentes = lista.filter((t) => !t.completed).length;

          return (
            <div
              key={dia.full}
              className={`flex flex-col rounded-2xl border transition-all duration-200 min-w-0 p-2.5 h-full min-h-0 ${
                dia.isToday
                  ? "bg-blue-50/25 border-[var(--color-primary)]/40 shadow-xs ring-1 ring-[var(--color-primary)]/20"
                  : "bg-slate-50/50 border-slate-200/70 hover:border-slate-300/80"
              }`}
            >
              {/* Header do dia */}
              <div className="shrink-0 flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-slate-200/80">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className={`text-xs font-bold uppercase tracking-wider truncate ${
                      dia.isToday ? "text-[var(--color-primary)]" : "text-slate-700"
                    }`}>
                      {dia.short}
                    </h2>
                    {dia.isToday && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white leading-none tracking-normal">
                        Hoje
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                    {dia.formattedDate}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span 
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                      pendentes > 0 
                        ? "bg-slate-200/70 text-slate-700" 
                        : "bg-slate-100 text-slate-400"
                    }`}
                    title={`${lista.length} tarefas (${pendentes} pendentes)`}
                  >
                    {listaOrdenada.length}
                  </span>
                  <button
                    onClick={() => openCreateForm(dia.defaultIsoDate)}
                    className="p-1 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md transition-colors cursor-pointer"
                    title={`Adicionar tarefa em ${dia.full}`}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Lista de tarefas com scroll vertical interno independente */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                {loading ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-20 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-20 bg-slate-200/60 rounded-xl"></div>
                  </div>
                ) : listaOrdenada.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 text-center px-2">
                    <span>
                      {searchTerm 
                        ? "Nenhum resultado" 
                        : statusFilter === "completed" 
                          ? "Nenhuma concluída" 
                          : statusFilter === "pending"
                            ? "Tudo em dia!"
                            : "Nenhuma tarefa"}
                    </span>
                  </div>
                ) : (
                  listaOrdenada.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onEdit={openEditForm}
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