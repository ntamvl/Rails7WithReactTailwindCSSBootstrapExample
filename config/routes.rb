Rails.application.routes.draw do
  resources :articles
  root 'pages#home'
  get '/hello_react' => 'pages#hello_react'
end
