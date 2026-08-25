class TasksController < ApplicationController
  before_action :set_task, only: %i[show edit update destroy]

  # Listar as tarefas do usuário autenticado organizadas por dia da semana
  def index
    dias_semana = %w[Domingo Segunda-feira Terça-feira Quarta-feira Quinta-feira Sexta-feira Sábado]

    # Agrupa apenas tarefas com data definida do usuário autenticado
    tarefas_agrupadas = current_user.tasks
                                    .where.not(due_date: nil)
                                    .group_by { |task| dias_semana[task.due_date.wday] }

    # Garante todos os 7 dias presentes no JSON de retorno
    @tarefas_por_dia = dias_semana.index_with { |dia| tarefas_agrupadas[dia] || [] }

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

  private

  # Busca a tarefa restrita ao escopo do usuário autenticado
  def set_task
    @task = current_user.tasks.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Tarefa não encontrada." }, status: :not_found
  end

  # Validação de parâmetros fortes (Rails 8)
  def task_params
    params.expect(task: %i[title description due_date])
  end
end