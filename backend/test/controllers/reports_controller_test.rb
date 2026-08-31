require "test_helper"

class ReportsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:usuario_teste)
    
    # Colocar no header de autorização
    @auth_headers = {
      "Authorization" => "Bearer #{@user.auth_token}",
      "Content-Type" => "application/json"
    }

    # Forçar algumas tasks de fixtures a serem completed true/false
    # e uma meta para "cumprida" para testar a resposta do json
    @user.tasks.first.update(completed: true)
    @user.metas.first.update(status: 'cumprida')
  end

  test "nao deve retornar relatorios sem estar logado" do
    get reports_url, as: :json
    assert_response :unauthorized
  end

  test "deve retornar estatisticas de relatorios corretamente" do
    get reports_url, headers: @auth_headers, as: :json
    assert_response :success
    
    body = JSON.parse(response.body)
    
    # Verifica a estrutura
    assert body.key?("tasks")
    assert body.key?("metas")
    
    # Verifica dados das tasks
    assert_equal @user.tasks.count, body["tasks"]["total"]
    assert_equal @user.tasks.where(completed: true).count, body["tasks"]["completed"]
    assert_equal 7, body["tasks"]["history_last_7_days"].length
    
    # Verifica dados das metas
    assert_equal @user.metas.count, body["metas"]["total"]
    assert_equal @user.metas.where(status: 'cumprida').count, body["metas"]["cumpridas"]
  end

  test "deve retornar bad request para tipo invalido no relatorio custom" do
    get reports_custom_url, params: { type: 'invalido' }, headers: @auth_headers, as: :json
    assert_response :bad_request
  end

  test "deve filtrar tarefas completadas no relatorio custom" do
    get reports_custom_url, params: { type: 'tasks', status: 'completed' }, headers: @auth_headers, as: :json
    assert_response :success
    body = JSON.parse(response.body)
    assert_instance_of Array, body
    body.each do |task|
      assert_equal true, task["completed"]
    end
  end

  test "deve filtrar metas cumpridas no relatorio custom" do
    get reports_custom_url, params: { type: 'metas', status: 'cumprida' }, headers: @auth_headers, as: :json
    assert_response :success
    body = JSON.parse(response.body)
    assert_instance_of Array, body
    body.each do |meta|
      assert_equal 'cumprida', meta["status"]
    end
  end
end
