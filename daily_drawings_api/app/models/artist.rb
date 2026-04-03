class Artist < ApplicationRecord
  has_many :drawings, dependent: :destroy
  validates :name, presence: true
end
