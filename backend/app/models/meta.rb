class Meta < ApplicationRecord
  self.table_name = "metas"
  belongs_to :user, optional: true

  # Valores permitidos para o status da meta
  STATUSES = ["nao_cumprida", "parcialmente_cumprida", "cumprida"]

  # Valores permitidos para o período da meta
  PERIODOS = ["semana", "mes", "ano"]

  # Validações - garante que os campos obrigatórios estão preenchidos e com limite
  validates :descricao, presence: { message: "não pode ficar em branco" }, length: { maximum: 100 }
  validates :categoria, presence: { message: "não pode ficar em branco" }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :periodo, presence: true, inclusion: { in: PERIODOS }

  # Retorna o status formatado para exibição
  def status_formatado
    case status
    when "cumprida"
      "Cumprida"
    when "parcialmente_cumprida"
      "Parcialmente cumprida"
    when "nao_cumprida"
      "Não cumprida"
    end
  end

  # Retorna o período formatado para exibição
  def periodo_formatado
    case periodo
    when "semana"
      "Semana"
    when "mes"
      "Mês"
    when "ano"
      "Ano"
    end
  end
end