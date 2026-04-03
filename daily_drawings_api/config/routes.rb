Rails.application.routes.draw do
  namespace :api do
    resources :drawings, only: [:index, :show, :create, :destroy, :update]
    resources :artists, only: [:index, :create, :destroy]
  end

  get "/api/health", to: "health#show"
end
