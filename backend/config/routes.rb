Rails.application.routes.draw do
  # REST
  resources :users, only: %i[create show update destroy]
  resources :tasks do
    member do
      patch :toggle
    end
  end
  resources :metas do
    member do
      patch :cycle_status
    end
  end
  resources :planning_blocks, only: %i[index show create update destroy]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Autenticação e Sessão
  post "/login", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"
  get "/me", to: "sessions#me"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "tasks#index"
end
