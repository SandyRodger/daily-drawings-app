class CreateDrawings < ActiveRecord::Migration[8.0]
  def change
    create_table :drawings do |t|
      t.string :title
      t.date :date
      t.text :caption
      t.text :notes
      t.string :image_url

      t.timestamps
    end
  end
end
