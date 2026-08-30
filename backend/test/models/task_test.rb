require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "deve exigir uma categoria" do
    task = tasks(:one)
    task.categoria = nil

    assert_not task.valid?
    assert_includes task.errors[:categoria], "can't be blank"
  end
end
