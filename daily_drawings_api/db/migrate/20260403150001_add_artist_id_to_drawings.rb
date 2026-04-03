class AddArtistIdToDrawings < ActiveRecord::Migration[8.0]
  def change
    add_column :drawings, :artist_id, :integer
    add_index :drawings, :artist_id
  end
end
