class UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: :create
  before_action :set_user, only: %i[show update destroy]

  # GET /users
  def index
    @users = User.select(:id, :name, :email, :created_at)
    render json: @users
  end

  # GET /users/:id
  def show
    render json: @user.as_json(only: %i[id name email created_at])
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
  def update
    if params.dig(:user, :password).present?
      unless @user.authenticate(params[:old_password])
        render json: { errors: ["Senha antiga inválida."] }, status: :forbidden
        return
      end
    end

    if @user.update(user_params)
      render json: @user.as_json(only: %i[id name email updated_at])
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Usuário não encontrado." }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
end