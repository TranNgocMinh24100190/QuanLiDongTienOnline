import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Goals from "../../pages/Goals";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../../api/goals";

jest.mock("../../api/goals");

describe("Goals page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("loads goals and shows completed status", async () => {
    getGoals.mockResolvedValueOnce({
      data: { data: [{ goal_id: 1, goal_name: "Goal A", current_amount: 1000, target_amount: 1000 }] },
    });

    render(<Goals />);

    expect(await screen.findByText("🎉 Đã hoàn thành mục tiêu!")).toBeInTheDocument();
  });

  it("creates a new goal", async () => {
    getGoals
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    createGoal.mockResolvedValueOnce({});

    render(<Goals />);

    fireEvent.change(screen.getByPlaceholderText("Tên mục tiêu"), {
      target: { value: "New Goal" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mục tiêu"), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByText("Tạo mục tiêu"));

    await waitFor(() => {
      expect(createGoal).toHaveBeenCalledWith({
        goal_name: "New Goal",
        target_amount: "5000",
      });
    });
  });

  it("updates goal and deletes goal", async () => {
    getGoals
      .mockResolvedValueOnce({
        data: { data: [{ goal_id: 1, goal_name: "Goal A", current_amount: 100, target_amount: 500 }] },
      })
      .mockResolvedValueOnce({
        data: { data: [{ goal_id: 1, goal_name: "Goal A Updated", current_amount: 100, target_amount: 500 }] },
      });
    updateGoal.mockResolvedValueOnce({});
    deleteGoal.mockResolvedValueOnce({});

    render(<Goals />);

    fireEvent.click(await screen.findByText("Sửa"));

    const modal = screen.getByText("Sửa Mục Tiêu").closest(".modal");
    const modalInputs = within(modal);

    fireEvent.change(modalInputs.getByPlaceholderText("Tên mục tiêu"), {
      target: { value: "Goal A Updated" },
    });
    fireEvent.change(modalInputs.getByPlaceholderText("Mục tiêu"), {
      target: { value: "500" },
    });
    fireEvent.click(modalInputs.getByText("Lưu"));

    await waitFor(() => {
      expect(updateGoal).toHaveBeenCalledWith(1, {
        goal_name: "Goal A Updated",
        target_amount: 500,
      });
    });

    fireEvent.click(screen.getByText("Xóa"));
    await waitFor(() => {
      expect(deleteGoal).toHaveBeenCalledWith(1);
    });
  });
});