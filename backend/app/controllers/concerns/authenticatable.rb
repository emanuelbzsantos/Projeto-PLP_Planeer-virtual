module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    render json: { error: "Acesso não autorizado." }, status: :unauthorized unless current_user
  end

  def current_user
    @current_user ||= authenticate_token
  end

  def authenticate_token
    token = extract_token_from_header
    return nil unless token.present?

    User.find_by(auth_token: token)
  end

  def extract_token_from_header
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    auth_header.split(" ").last
  end
end