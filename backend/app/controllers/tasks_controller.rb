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

    render json: @tarefas_por_dia
  end

  # Mostrar uma tarefa específica
  def show
    render json: @task
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
      render json: @task, status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Atualizar uma tarefa existente
  def update
    if @task.update(task_params)
      render json: @task
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Excluir uma tarefa
  def destroy
    @task.destroy!
    head :no_content
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
