class AddRecurrenceToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :recurring, :boolean, default: false, null: false
    add_column :tasks, :recurrence_type, :string, default: "single"
    add_column :tasks, :recurring_days, :string, array: true, default: []
  end
end
