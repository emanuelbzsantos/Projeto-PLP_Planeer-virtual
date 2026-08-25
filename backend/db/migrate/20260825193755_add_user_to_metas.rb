class AddUserToMetas < ActiveRecord::Migration[8.1]
  def change
    add_reference :metas, :user, null: true, foreign_key: true
  end
end
