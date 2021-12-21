Rails.application.routes.draw do
  root 'pages#home'
  get '/hello_react' => 'pages#hello_react'
end
