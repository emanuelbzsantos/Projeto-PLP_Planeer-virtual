# backend/app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  has_secure_token :auth_token

  has_many :tasks, dependent: :destroy

  # Normaliza o email antes da validação
  before_validation :normalize_email

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, allow_nil: true

  validate :profile_update_cooldown, on: :update

  # Invalida o token atual gerando um novo (usado no logout)
  def invalidate_auth_token!
    regenerate_auth_token
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end

  def profile_update_cooldown
    if name_changed? || email_changed?
      if updated_at_was.present? && updated_at_was > 5.minutes.ago
        seconds_left = (5.minutes.to_i - (Time.current - updated_at_was).to_i)
        minutes_left = (seconds_left / 60.0).ceil
        errors.add(:base, "Você alterou seus dados recentemente. Por segurança, aguarde mais #{minutes_left} minuto(s) para alterar novamente.")
      end
    end
  end
end