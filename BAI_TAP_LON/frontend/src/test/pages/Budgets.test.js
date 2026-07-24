import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Budgets from "../../pages/Budgets";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../../api/budgets";
import { getCategories } from "../../api/categories";

jest.mock("../../api/budgets");
jest.mock("../../api/categories");

describe("Budgets page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("loads budgets and categories", async () => {
    getBudgets.mockResolvedValueOnce({
      data: { data: [{ budget_id: 1, category_name: "Food", amount_limit: 1000, spent: 400, status: "FULL", month: 5, year: 2024 }] },
    });
    getCategories.mockResolvedValueOnce({
      data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] },
    });

    render(<Budgets />);

    expect(await screen.findByText("Food")).toBeInTheDocument();
    expect(screen.getByText(/Đã dùng hết ngân sách/i)).toBeInTheDocument();
  });

  it("creates budget with numeric values", async () => {
    getBudgets
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    getCategories.mockResolvedValue({ data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] } });
    createBudget.mockResolvedValueOnce({});

    render(<Budgets />);

    const categorySelect = screen.getByRole("combobox");
    await screen.findByRole("option", { name: "Food" }); // đợi option có mặt
    fireEvent.change(categorySelect, { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText("Giới hạn"), { target: { value: "1000" } });
    fireEvent.change(screen.getByPlaceholderText("Tháng"), { target: { value: "5" } });
    fireEvent.change(screen.getByPlaceholderText("Năm"), { target: { value: "2024" } });
    fireEvent.click(screen.getByText("Tạo ngân sách"));

    await waitFor(() => {
      expect(createBudget).toHaveBeenCalledWith({
        category_id: 1,
        amount_limit: 1000,
        month: 5,
        year: 2024,
      });
    });
  });

  it("updates budget and closes modal", async () => {
    getBudgets
      .mockResolvedValueOnce({
        data: { data: [{ budget_id: 1, category_name: "Food", amount_limit: 1000, spent: 400, status: "FULL", month: 5, year: 2024 }] },
      })
      .mockResolvedValueOnce({
        data: { data: [{ budget_id: 1, category_name: "Food", amount_limit: 1200, spent: 400, status: "FULL", month: 5, year: 2024 }] },
      });
    getCategories.mockResolvedValue({ data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] } });
    updateBudget.mockResolvedValueOnce({});

    render(<Budgets />);

    fireEvent.click(await screen.findByText("Sửa"));

    const modal = screen.getByText("Sửa ngân sách").closest(".modal");
    const modalUtils = within(modal);

    fireEvent.change(modalUtils.getByPlaceholderText("Giới hạn"), { target: { value: "1200" } });
    fireEvent.click(modalUtils.getByText("Lưu"));

    await waitFor(() => {
      expect(updateBudget).toHaveBeenCalledWith(1, {
        amount_limit: 1200,
        month: 5,
        year: 2024,
      });
    });
  });

  it("deletes a budget", async () => {
    getBudgets.mockResolvedValueOnce({
      data: { data: [{ budget_id: 1, category_name: "Food", amount_limit: 1000, spent: 400, status: "FULL", month: 5, year: 2024 }] },
    });
    getCategories.mockResolvedValue({ data: { data: [] } });
    deleteBudget.mockResolvedValueOnce({});

    render(<Budgets />);

    fireEvent.click(await screen.findByText("Xóa"));

    await waitFor(() => {
      expect(deleteBudget).toHaveBeenCalledWith(1);
    });
  });
});