class Api::ArtistsController < ApplicationController
  def index
    render json: Artist.order(:created_at).map { |a| { id: a.id, name: a.name } }
  end

  def create
    artist = Artist.new(name: params[:name])
    if artist.save
      render json: { id: artist.id, name: artist.name }, status: :created
    else
      render json: { errors: artist.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    Artist.find(params[:id]).destroy
    head :no_content
  end
end
