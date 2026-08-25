class MetasController < ApplicationController
  before_action :set_meta, only: [:show, :edit, :update, :destroy, :cycle_status]

  # Listar as metas do usuário autenticado organizadas por período
  def index
    periodos = { "semana" => "Semana", "mes" => "Mês", "ano" => "Ano" }

    # Cria um hash com cada período apontando para uma lista vazia
    @metas_por_periodo = periodos.map { |chave, nome| [nome, []] }.to_h

    # Agrupa as metas do usuário no período correspondente
    current_user.metas.each do |meta|
      nome_periodo = periodos[meta.periodo]
      @metas_por_periodo[nome_periodo] << meta if nome_periodo.present?
    end

    render json: @metas_por_periodo
  end

  # Mostrar uma meta específica
  def show
    render json: @meta
  end

  # Formulário para criar uma nova meta
  def new
    @meta = current_user.metas.build
  end

  # Formulário para editar uma meta existente
  def edit
  end

  # Criar uma nova meta associada ao usuário atual
  def create
    @meta = current_user.metas.build(meta_params)

    if @meta.save
      render json: @meta, status: :created
    else
      render json: { errors: @meta.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Atualizar uma meta existente
  def update
    if @meta.update(meta_params)
      render json: @meta
    else
      render json: { errors: @meta.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Excluir uma meta
  def destroy
    @meta.destroy!
    head :no_content
  end

  # Avançar o status da meta em ciclo (nao_cumprida → parcialmente → cumprida → nao_cumprida)
  def cycle_status
    next_status = {
      "nao_cumprida" => "parcialmente_cumprida",
      "parcialmente_cumprida" => "cumprida",
      "cumprida" => "nao_cumprida"
    }
    @meta.update!(status: next_status[@meta.status])
    render json: @meta
  end

  private

  # Buscar a meta restrita ao escopo do usuário autenticado
  def set_meta
    @meta = current_user.metas.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Meta não encontrada." }, status: :not_found
  end

  # Permitir apenas os parâmetros esperados
  def meta_params
    params.expect(meta: [:descricao, :categoria, :status, :periodo])
  end
end
