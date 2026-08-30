class TasksController < ApplicationController
  before_action :set_task, only: %i[show edit update destroy toggle]

  # Listar as tarefas do usuário autenticado organizadas por dia da semana em ordem cronológica crescente
  def index
    dias_semana = Task::DIAS_SEMANA
    user_tasks = current_user.tasks.order(:due_date)

    # Garante que tarefas únicas com data e tarefas recorrentes nos dias corretos sejam listadas em ordem crescente
    @tarefas_por_dia = dias_semana.index_with do |dia|
      user_tasks.select { |task| task.occurs_on_day?(dia) }
    end

    render json: @tarefas_por_dia
  end

  # Mostrar uma tarefa específica
  def show
    render json: @task
  end

  # Instância para formulário de criação
  def new
    @task = current_user.tasks.build
  end

  # Instância para formulário de edição
  def edit
  end

  # Criar uma nova tarefa associada ao usuário atual
  def create
    @task = current_user.tasks.build(task_params)

    if @task.save
      render json: @task, status: :created
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Atualizar uma tarefa existente do usuário
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

  # Alternar o status de conclusão de uma tarefa
  def toggle
    @task.update!(completed: !@task.completed)
    render json: @task
  end

  private

  # Busca a tarefa restrita ao escopo do usuário autenticado
  def set_task
    @task = current_user.tasks.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Tarefa não encontrada." }, status: :not_found
  end

  # Validação de parâmetros fortes (Rails 8)
  def task_params
    params.expect(task: [
      :title,
      :description,
      :due_date,
      :completed,
      :categoria,
      :recurring,
      :recurrence_type,
      { recurring_days: [] }
    ])
  end
end