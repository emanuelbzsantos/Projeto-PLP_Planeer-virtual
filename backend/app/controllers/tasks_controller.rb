class TasksController < ApplicationController
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  # Listar todas as tarefas organizadas por dia da semana
  def index
    dias_semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

    # Cria um hash com cada dia da semana apontando para uma lista vazia
    @tarefas_por_dia = dias_semana.map { |dia| [dia, []] }.to_h

    # Agrupa as tarefas no dia da semana correspondente
    Task.all.each do |task|
      if task.due_date.present?
        dia = dias_semana[task.due_date.wday]
        @tarefas_por_dia[dia] << task
      end
    end
  end

  # Mostrar uma tarefa específica
  def show
  end

  # Formulário para criar uma nova tarefa
  def new
    @task = Task.new
  end

  # Formulário para editar uma tarefa existente
  def edit
  end

  # Criar uma nova tarefa no banco de dados
  def create
    @task = Task.new(task_params)

    if @task.save
      redirect_to @task, notice: "Tarefa criada com sucesso!"
    else
      render :new, status: :unprocessable_content
    end
  end

  # Atualizar uma tarefa existente
  def update
    if @task.update(task_params)
      redirect_to @task, notice: "Tarefa atualizada com sucesso!", status: :see_other
    else
      render :edit, status: :unprocessable_content
    end
  end

  # Excluir uma tarefa
  def destroy
    @task.destroy!
    redirect_to tasks_path, notice: "Tarefa excluída com sucesso!", status: :see_other
  end

  private

  # Buscar a tarefa pelo ID
  def set_task
    @task = Task.find(params.expect(:id))
  end

  # Permitir apenas os parâmetros esperados
  def task_params
    params.expect(task: [:title, :description, :due_date])
  end
end
