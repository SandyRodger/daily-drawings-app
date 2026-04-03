class Api::DrawingsController < ApplicationController
  include Rails.application.routes.url_helpers

  def index
    drawings = Drawing.order(created_at: :desc)

    render json: drawings.map { |drawing| drawing_json(drawing) }
  end

  def show
    drawing = Drawing.find(params[:id])
    render json: drawing_json(drawing)
  end

  def create
    drawing = Drawing.new(drawing_params)

    if drawing.save
      render json: drawing_json(drawing), status: :created
    else
      render json: { errors: drawing.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def drawing_params
    params.permit(:title, :date, :caption, :notes, :image)
  end

  def drawing_json(drawing)
    {
      id: drawing.id,
      title: drawing.title,
      date: drawing.date,
      caption: drawing.caption,
      notes: drawing.notes,
      image_url: drawing.image.attached? ? url_for(drawing.image) : drawing.image_url
    }
  end
end