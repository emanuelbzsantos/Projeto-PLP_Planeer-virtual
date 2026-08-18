class MetasController < ApplicationController
  before_action :set_meta, only: [:show, :edit, :update, :destroy]

  # Listar todas as metas organizadas por período
  def index
    periodos = { "semana" => "Semana", "mes" => "Mês", "ano" => "Ano" }

    # Cria um hash com cada período apontando para uma lista vazia
    @metas_por_periodo = periodos.map { |chave, nome| [nome, []] }.to_h

    # Agrupa as metas no período correspondente
    Meta.all.each do |meta|
      nome_periodo = periodos[meta.periodo]
      @metas_por_periodo[nome_periodo] << meta if nome_periodo.present?
    end
  end

  # Mostrar uma meta específica
  def show
  end

  # Formulário para criar uma nova meta
  def new
    @meta = Meta.new
  end

  # Formulário para editar uma meta existente
  def edit
  end

  # Criar uma nova meta no banco de dados
  def create
    @meta = Meta.new(meta_params)

    if @meta.save
      redirect_to meta_path(@meta), notice: "Meta criada com sucesso!"
    else
      render :new, status: :unprocessable_content
    end
  end

  # Atualizar uma meta existente
  def update
    if @meta.update(meta_params)
      redirect_to meta_path(@meta), notice: "Meta atualizada com sucesso!", status: :see_other
    else
      render :edit, status: :unprocessable_content
    end
  end

  # Excluir uma meta
  def destroy
    @meta.destroy!
    redirect_to metas_path, notice: "Meta excluída com sucesso!", status: :see_other
  end

  private

  # Buscar a meta pelo ID
  def set_meta
    @meta = Meta.find(params.expect(:id))
  end

  # Permitir apenas os parâmetros esperados
  def meta_params
    params.expect(meta: [:descricao, :categoria, :status, :periodo])
  end
end
