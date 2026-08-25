class ApplicationController < ActionController::Base
  # Desabilita a verificação de token CSRF para permitir requisições
  # vindas do frontend Next.js (que roda em outra porta/origem).
  # Sem isso, o Rails bloqueia qualquer POST/PUT/DELETE externo.
  protect_from_forgery with: :null_session

  include Authenticatable

  rescue_from StandardError do |e|
    render json: { error: e.message }, status: :internal_server_error
  end

  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { error: e.message }, status: :not_found
  end
end