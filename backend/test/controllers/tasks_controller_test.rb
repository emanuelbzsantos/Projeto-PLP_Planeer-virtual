require "test_helper"

class TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:usuario_teste)
    @outro_usuario = users(:outro_usuario)
    @task = tasks(:one)
    @task_completed = tasks(:two)
    @auth_headers = {
      "Authorization" => "Bearer #{@user.auth_token}",
      "Content-Type" => "application/json"
    }
  end

  # ===== Autenticação =====

  test "deve rejeitar acesso sem token" do
    get tasks_url, as: :json
    assert_response :unauthorized
  end

  # ===== Listagem =====

  test "deve listar tarefas do usuário autenticado" do
    get tasks_url, headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    # Deve retornar os 7 dias da semana
    assert_equal 7, body.keys.size
  end

  test "não deve listar tarefas de outro usuário" do
    get tasks_url, headers: @auth_headers, as: :json
    body = JSON.parse(response.body)

    # Achata todas as tarefas retornadas
    todas_tarefas = body.values.flatten
    ids_retornados = todas_tarefas.map { |t| t["id"] }

    # A tarefa do outro usuário não deve aparecer
    assert_not_includes ids_retornados, tasks(:tarefa_outro_usuario).id
  end

  # ===== Criação =====

  test "deve criar tarefa para o usuário autenticado" do
    assert_difference("Task.count") do
      post tasks_url, headers: @auth_headers, params: {
        task: { title: "Nova tarefa", description: "Descrição", due_date: "2026-08-26" }
      }, as: :json
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal "Nova tarefa", body["title"]
    assert_equal false, body["completed"]
  end

  # ===== Toggle =====

  test "deve alternar completed de false para true" do
    assert_equal false, @task.completed

    patch toggle_task_url(@task), headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal true, body["completed"]

    @task.reload
    assert_equal true, @task.completed
  end

  test "deve alternar completed de true para false" do
    assert_equal true, @task_completed.completed

    patch toggle_task_url(@task_completed), headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal false, body["completed"]

    @task_completed.reload
    assert_equal false, @task_completed.completed
  end

  test "não deve fazer toggle de tarefa de outro usuário" do
    tarefa_alheia = tasks(:tarefa_outro_usuario)

    patch toggle_task_url(tarefa_alheia), headers: @auth_headers, as: :json
    assert_response :not_found
  end

  # ===== Exclusão =====

  test "deve excluir tarefa do usuário autenticado" do
    assert_difference("Task.count", -1) do
      delete task_url(@task), headers: @auth_headers, as: :json
    end

    assert_response :no_content
  end

  test "não deve excluir tarefa de outro usuário" do
    tarefa_alheia = tasks(:tarefa_outro_usuario)

    assert_no_difference("Task.count") do
      delete task_url(tarefa_alheia), headers: @auth_headers, as: :json
    end

    assert_response :not_found
  end
end
