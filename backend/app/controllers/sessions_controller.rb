class SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: :create

  # POST /login
  def create
    user = User.find_by(email: params[:email]&.strip&.downcase)

    if user&.authenticate(params[:password])
      user.regenerate_auth_token if user.auth_token.blank?
      render json: {
        user: user.as_json(only: %i[id name email]),
        token: user.auth_token
      }, status: :ok
    else
      render json: { error: "Credenciais inválidas." }, status: :unauthorized
    end
  end

  # DELETE /logout
  def destroy
    current_user&.invalidate_auth_token!
    head :no_content
  end

  # GET /me
  def me
    render json: current_user.as_json(only: %i[id name email created_at])
  end
end