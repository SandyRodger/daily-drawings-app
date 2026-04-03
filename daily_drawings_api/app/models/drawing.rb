class Drawing < ApplicationRecord
  belongs_to :artist, optional: true
  has_one_attached :image
end
