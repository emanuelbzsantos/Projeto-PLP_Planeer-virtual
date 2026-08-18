class CreateMetas < ActiveRecord::Migration[8.1]
  def change
    create_table :metas do |t|
      t.text :descricao
      t.string :categoria
      t.string :status
      t.string :periodo

      t.timestamps
    end
  end
end
