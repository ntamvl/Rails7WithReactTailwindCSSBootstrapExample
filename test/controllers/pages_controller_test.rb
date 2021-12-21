require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get pages_home_url
    assert_response :success
  end

  test "should get hello_react" do
    get pages_hello_react_url
    assert_response :success
  end
end
