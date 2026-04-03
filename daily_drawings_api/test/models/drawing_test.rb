require "test_helper"

class DrawingTest < ActiveSupport::TestCase
  test "can be created with valid attributes" do
    drawing = Drawing.new(
      title: "Test Drawing",
      date: Date.today,
      caption: "A test caption",
      notes: "Some notes"
    )
    assert drawing.save
  end

  test "can be created without optional fields" do
    drawing = Drawing.new(title: "Minimal Drawing", date: Date.today)
    assert drawing.save
  end

  test "can be created without a title" do
    drawing = Drawing.new(date: Date.today)
    assert drawing.save
  end

  test "persists all attributes" do
    drawing = Drawing.create!(
      title: "Persisted Drawing",
      date: Date.new(2026, 3, 15),
      caption: "My caption",
      notes: "My notes",
      image_url: "https://example.com/img.jpg"
    )

    found = Drawing.find(drawing.id)
    assert_equal "Persisted Drawing", found.title
    assert_equal Date.new(2026, 3, 15), found.date
    assert_equal "My caption", found.caption
    assert_equal "My notes", found.notes
    assert_equal "https://example.com/img.jpg", found.image_url
  end

  test "has_one_attached :image" do
    drawing = drawings(:one)
    assert_respond_to drawing, :image
    assert_not drawing.image.attached?
  end

  test "fixtures load correctly" do
    assert_equal "Morning Sketch", drawings(:one).title
    assert_equal "Afternoon Doodle", drawings(:two).title
  end
end
