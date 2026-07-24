import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Categories from "../../pages/Categories";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../api/categories";

jest.mock("../../api/categories");

describe("Categories page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("loads categories and skips system categories", async () => {
    getCategories.mockResolvedValueOnce({
      data: { data: [
        { category_id: 1, category_name: "Food", type: "Expense", is_system: false },
        { category_id: 2, category_name: "System", type: "Expense", is_system: true },
      ] },
    });

    render(<Categories />);

    expect(await screen.findByText("Food")).toBeInTheDocument();
    expect(screen.queryByText("System")).not.toBeInTheDocument();
  });

  it("creates a category and reloads", async () => {
    getCategories
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({
        data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] },
      });
    createCategory.mockResolvedValueOnce({});

    render(<Categories />);

    fireEvent.change(screen.getByPlaceholderText("Tên danh mục"), {
      target: { value: "Food" },
    });
    fireEvent.change(screen.getByDisplayValue("Expense"), {
      target: { value: "Expense" },
    });
    fireEvent.click(screen.getByText("Tạo"));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({ name: "Food", type: "Expense" });
      expect(screen.getByText("Food")).toBeInTheDocument();
    });
  });

  it("updates a category through modal", async () => {
    getCategories
      .mockResolvedValueOnce({
        data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] },
      })
      .mockResolvedValueOnce({
        data: { data: [{ category_id: 1, category_name: "Food Updated", type: "Expense", is_system: false }] },
      });
    updateCategory.mockResolvedValueOnce({});

    render(<Categories />);

    fireEvent.click(await screen.findByText("Sửa"));

    const modal = screen.getByText("Sửa Danh Mục").closest(".modal");
    const modalUtils = within(modal);

    fireEvent.change(modalUtils.getByPlaceholderText("Tên danh mục"), {
      target: { value: "Food Updated" },
    });
    fireEvent.click(modalUtils.getByText("Lưu"));

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith(1, { name: "Food Updated" });
      expect(screen.getByText("Food Updated")).toBeInTheDocument();
    });
  });

  it("deletes a category", async () => {
    getCategories.mockResolvedValueOnce({
      data: { data: [{ category_id: 1, category_name: "Food", type: "Expense", is_system: false }] },
    });
    deleteCategory.mockResolvedValueOnce({});

    render(<Categories />);

    fireEvent.click(await screen.findByText("Xóa"));

    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith(1);
    });
  });
});