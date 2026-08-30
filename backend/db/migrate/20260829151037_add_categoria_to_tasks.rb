class AddCategoriaToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :categoria, :string, default: "Pessoal", null: false
  end
end
