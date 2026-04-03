Rails.application.routes.draw do
  namespace :api do
    resources :drawings, only: [:index, :show, :create, :destroy, :update]
  end

  get "/api/health", to: "health#show"
end
