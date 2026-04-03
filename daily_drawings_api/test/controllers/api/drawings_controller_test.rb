require "test_helper"

class Api::DrawingsControllerTest < ActionDispatch::IntegrationTest
  # GET /api/drawings
  test "index returns 200 and a JSON array" do
    get "/api/drawings"
    assert_response :success
    json = JSON.parse(response.body)
    assert_instance_of Array, json
  end

  test "index returns all drawings" do
    get "/api/drawings"
    json = JSON.parse(response.body)
    assert_equal Drawing.count, json.length
  end

  test "index returns drawings ordered newest first" do
    get "/api/drawings"
    json = JSON.parse(response.body)
    created_ats = Drawing.order(created_at: :desc).pluck(:id)
    assert_equal created_ats, json.map { |d| d["id"] }
  end

  test "index returns the expected JSON fields" do
    get "/api/drawings"
    json = JSON.parse(response.body)
    first = json.first
    %w[id title date caption notes image_url].each do |field|
      assert first.key?(field), "Expected field '#{field}' in response"
    end
  end

  test "index returns image_url from image_url column when no attachment" do
    drawing = drawings(:one)
    get "/api/drawings"
    json = JSON.parse(response.body)
    record = json.find { |d| d["id"] == drawing.id }
    assert_equal drawing.image_url, record["image_url"]
  end

  # GET /api/drawings/:id
  test "show returns 200 for a valid id" do
    drawing = drawings(:one)
    get "/api/drawings/#{drawing.id}"
    assert_response :success
  end

  test "show returns the correct drawing" do
    drawing = drawings(:one)
    get "/api/drawings/#{drawing.id}"
    json = JSON.parse(response.body)
    assert_equal drawing.id, json["id"]
    assert_equal drawing.title, json["title"]
    assert_equal drawing.caption, json["caption"]
  end

  test "show returns 404 for a missing id" do
    get "/api/drawings/0"
    assert_response :not_found
  end

  # POST /api/drawings
  test "create returns 201 with valid params" do
    post "/api/drawings", params: {
      title: "New Drawing",
      date: "2026-04-01",
      caption: "A fresh drawing"
    }
    assert_response :created
  end

  test "create adds a new drawing to the database" do
    assert_difference("Drawing.count", 1) do
      post "/api/drawings", params: {
        title: "New Drawing",
        date: "2026-04-01"
      }
    end
  end

  test "create returns the new drawing as JSON" do
    post "/api/drawings", params: {
      title: "New Drawing",
      date: "2026-04-01",
      caption: "Fresh",
      notes: "Notes here"
    }
    json = JSON.parse(response.body)
    assert_equal "New Drawing", json["title"]
    assert_equal "Fresh", json["caption"]
    assert_equal "Notes here", json["notes"]
    assert json.key?("id")
    assert json.key?("image_url")
  end

  test "create accepts an image upload" do
    image = fixture_file_upload(
      Rails.root.join("test/fixtures/files/sample.jpg"),
      "image/jpeg"
    )
    assert_difference("Drawing.count", 1) do
      post "/api/drawings", params: {
        title: "Drawing with image",
        date: "2026-04-01",
        image: image
      }
    end
    assert_response :created
    drawing = Drawing.last
    assert drawing.image.attached?
  end
end
