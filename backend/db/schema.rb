# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_30_021025) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "metas", force: :cascade do |t|
    t.string "categoria"
    t.datetime "created_at", null: false
    t.text "descricao"
    t.string "periodo"
    t.string "status"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["user_id"], name: "index_metas_on_user_id"
  end

  create_table "planning_blocks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.datetime "end_time", null: false
    t.datetime "start_time", null: false
    t.bigint "task_id"
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["task_id"], name: "index_planning_blocks_on_task_id"
    t.index ["user_id", "date"], name: "index_planning_blocks_on_user_id_and_date"
    t.index ["user_id"], name: "index_planning_blocks_on_user_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.string "categoria", default: "Pessoal", null: false
    t.boolean "completed", default: false, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "due_date"
    t.string "recurrence_type", default: "single"
    t.boolean "recurring", default: false, null: false
    t.string "recurring_days", default: [], array: true
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "auth_token"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["auth_token"], name: "index_users_on_auth_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "metas", "users"
  add_foreign_key "planning_blocks", "tasks"
  add_foreign_key "planning_blocks", "users"
  add_foreign_key "tasks", "users"
end
