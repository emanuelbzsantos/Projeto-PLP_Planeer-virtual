require "test_helper"

class MetasControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:usuario_teste)
    @outro_usuario = users(:outro_usuario)
    @meta_semanal = metas(:meta_semanal)
    @meta_mensal = metas(:meta_mensal)
    @meta_cumprida = metas(:meta_cumprida)
    @auth_headers = {
      "Authorization" => "Bearer #{@user.auth_token}",
      "Content-Type" => "application/json"
    }
  end

  # ===== Autenticação =====

  test "deve rejeitar acesso sem token" do
    get metas_url, as: :json
    assert_response :unauthorized
  end

  # ===== Listagem =====

  test "deve listar metas do usuário autenticado organizadas por período" do
    get metas_url, headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    # Deve retornar os 3 períodos
    assert_includes body.keys, "Semana"
    assert_includes body.keys, "Mês"
    assert_includes body.keys, "Ano"
  end

  test "não deve listar metas de outro usuário" do
    get metas_url, headers: @auth_headers, as: :json
    body = JSON.parse(response.body)

    # Achata todas as metas retornadas
    todas_metas = body.values.flatten
    ids_retornados = todas_metas.map { |m| m["id"] }

    # A meta do outro usuário não deve aparecer
    assert_not_includes ids_retornados, metas(:meta_outro_usuario).id
  end

  # ===== Criação =====

  test "deve criar meta associada ao usuário autenticado" do
    assert_difference("Meta.count") do
      post metas_url, headers: @auth_headers, params: {
        meta: { descricao: "Nova meta", categoria: "Saúde", status: "nao_cumprida", periodo: "semana" }
      }, as: :json
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert_equal "Nova meta", body["descricao"]
    assert_equal @user.id, Meta.last.user_id
  end

  # ===== Ciclo de Status =====

  test "deve avançar status de nao_cumprida para parcialmente_cumprida" do
    assert_equal "nao_cumprida", @meta_semanal.status

    patch cycle_status_meta_url(@meta_semanal), headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal "parcialmente_cumprida", body["status"]

    @meta_semanal.reload
    assert_equal "parcialmente_cumprida", @meta_semanal.status
  end

  test "deve avançar status de parcialmente_cumprida para cumprida" do
    assert_equal "parcialmente_cumprida", @meta_mensal.status

    patch cycle_status_meta_url(@meta_mensal), headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal "cumprida", body["status"]
  end

  test "deve voltar status de cumprida para nao_cumprida" do
    assert_equal "cumprida", @meta_cumprida.status

    patch cycle_status_meta_url(@meta_cumprida), headers: @auth_headers, as: :json
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal "nao_cumprida", body["status"]
  end

  test "não deve alterar status de meta de outro usuário" do
    meta_alheia = metas(:meta_outro_usuario)

    patch cycle_status_meta_url(meta_alheia), headers: @auth_headers, as: :json
    assert_response :not_found
  end

  # ===== Exclusão =====

  test "deve excluir meta do usuário autenticado" do
    assert_difference("Meta.count", -1) do
      delete meta_url(@meta_semanal), headers: @auth_headers, as: :json
    end

    assert_response :no_content
  end

  test "não deve excluir meta de outro usuário" do
    meta_alheia = metas(:meta_outro_usuario)

    assert_no_difference("Meta.count") do
      delete meta_url(meta_alheia), headers: @auth_headers, as: :json
    end

    assert_response :not_found
  end
end
