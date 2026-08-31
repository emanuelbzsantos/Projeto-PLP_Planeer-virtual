class Task < ApplicationRecord
  belongs_to :user
  has_many :planning_blocks, dependent: :nullify

  DIAS_SEMANA = %w[Domingo Segunda-feira Terça-feira Quarta-feira Quinta-feira Sexta-feira Sábado].freeze
  CATEGORIAS = [
    "Reuniões",
    "Ligações",
    "Compras",
    "Estudos",
    "Exercícios",
    "Entregas de trabalhos"
  ].freeze

  validates :title, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }, allow_blank: true
  validates :categoria, presence: true, inclusion: { in: CATEGORIAS }
  validates :recurrence_type, inclusion: { in: %w[single weekly] }, allow_blank: true

  def recurring?
    super || recurrence_type == "weekly"
  end

  def occurs_on_day?(dia)
    if recurring?
      if recurring_days.present? && recurring_days.is_a?(Array) && !recurring_days.empty?
        recurring_days.include?(dia)
      elsif due_date.present?
        DIAS_SEMANA[due_date.wday] == dia
      else
        false
      end
    else
      due_date.present? && DIAS_SEMANA[due_date.wday] == dia
    end
  end
end