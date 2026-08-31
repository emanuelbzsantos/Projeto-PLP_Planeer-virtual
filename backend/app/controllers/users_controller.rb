class UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: :create

  # GET /users/:id
  # Sempre retorna os dados do usuário autenticado, independente do :id na URL.
  def show
    render json: current_user.as_json(only: %i[id name email created_at])
  end

  # POST /users (Cadastro)
  def create
    @user = User.new(user_params)

    if @user.save
      render json: {
        user: @user.as_json(only: %i[id name email created_at]),
        token: @user.auth_token
      }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/:id
  # Sempre atualiza os dados do usuário autenticado, independente do :id na URL.
  def update
    if params.dig(:user, :password).present?
      unless current_user.authenticate(params[:old_password])
        render json: { errors: ["Senha antiga inválida."] }, status: :forbidden
        return
      end
    end

    if current_user.update(user_params)
      render json: current_user.as_json(only: %i[id name email updated_at])
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /users/:id
  # Sempre exclui a conta do usuário autenticado, independente do :id na URL.
  def destroy
    current_user.destroy
    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
end