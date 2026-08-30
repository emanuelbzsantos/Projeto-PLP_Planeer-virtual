class PlanningBlock < ApplicationRecord
  belongs_to :user
  belongs_to :task, optional: true

  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :title, presence: true, if: -> { task_id.blank? }

  validate :end_after_start

  def display_title
    task&.title || title
  end

  private

  def end_after_start
    return if start_time.blank? || end_time.blank?
    errors.add(:end_time, "deve ser depois do horário de início") if end_time <= start_time
  end
end