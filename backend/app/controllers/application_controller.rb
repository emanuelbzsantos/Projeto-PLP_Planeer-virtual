class ApplicationController < ActionController::Base
  # Desabilita a verificação de token CSRF para permitir requisições
  # vindas do frontend Next.js (que roda em outra porta/origem).
  # Sem isso, o Rails bloqueia qualquer POST/PUT/DELETE externo.
  skip_forgery_protection
end
