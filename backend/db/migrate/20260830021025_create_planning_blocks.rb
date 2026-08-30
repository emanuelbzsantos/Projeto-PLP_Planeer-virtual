class CreatePlanningBlocks < ActiveRecord::Migration[8.1]
  def change
    create_table :planning_blocks do |t|
      t.references :user, null: false, foreign_key: true
      t.references :task, null: true, foreign_key: true
      t.date :date, null: false
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.string :title
      t.timestamps
    end

    add_index :planning_blocks, [:user_id, :date]
  end
end