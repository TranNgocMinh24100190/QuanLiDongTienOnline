import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react";
import Transactions from "../../pages/Transactions";
import { getTransactions, createTransaction, reverseTransaction } from "../../api/transactions";
import { reverseTransfer } from "../../api/transfers";
import { getWallets } from "../../api/wallets";
import { getCategories } from "../../api/categories";

jest.mock("../../api/transactions");
jest.mock("../../api/transfers");
jest.mock("../../api/wallets");
jest.mock("../../api/categories");

describe("Transactions page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("loads data and shows transaction rows", async () => {
    getTransactions.mockResolvedValueOnce({
      data: { data: [{ transaction_id: 1, description: "Test", amount: 100, transaction_type: "Expense", is_reversed: false }] },
    });
    getWallets.mockResolvedValueOnce({ data: [{ wallet_id: 1, wallet_name: "A" }] });
    getCategories.mockResolvedValueOnce({ data: { data: [{ category_id: 1, category_name: "Food", is_system: false }] } });

    await act(async () => {
      render(<Transactions />);
    });

    expect(await screen.findByText("Test")).toBeInTheDocument();

    const row = screen.getByText("Test").closest("tr");
    expect(within(row).getByText("Expense")).toBeInTheDocument();
  });

  it("shows placeholder when description is missing", async () => {
    getTransactions.mockResolvedValueOnce({
      data: { data: [{ transaction_id: 10, description: "", amount: 0, transaction_type: "Income", is_reversed: false }] },
    });
    getWallets.mockResolvedValueOnce({ data: [] });
    getCategories.mockResolvedValueOnce({ data: { data: [] } });

    await act(async () => {
      render(<Transactions />);
    });

    expect(await screen.findByText("Không có mô tả")).toBeInTheDocument();
  });

  it("creates transaction and alerts on budget/goal warnings", async () => {
    getTransactions
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    getWallets.mockResolvedValue({ data: [{ wallet_id: 1, wallet_name: "A" }] });
    getCategories.mockResolvedValue({ data: { data: [{ category_id: 1, category_name: "Food", is_system: false }] } });
    createTransaction.mockResolvedValueOnce({
      data: { budgetWarning: "Over budget", goalMessage: ["Goal 1 reached"] },
    });

    await act(async () => {
      render(<Transactions />);
    });

    const [walletSelect, categorySelect] = screen.getAllByRole("combobox");
    fireEvent.change(walletSelect, { target: { value: "1" } });
    fireEvent.change(categorySelect, { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Số tiền"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Mô tả"), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Thêm giao dịch/i }));

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith({
        wallet_id: "1",
        category_id: "1",
        amount: "100",
        transaction_type: "Expense",
        description: "Test",
      });
      expect(window.alert).toHaveBeenCalledWith("Over budget");
      expect(window.alert).toHaveBeenCalledWith("Goal 1 reached");
    });
  });

  it("reverses normal transaction and transfer transaction", async () => {
    getTransactions.mockResolvedValueOnce({
      data: {
        data: [
          { transaction_id: 1, description: "Normal", amount: 100, transaction_type: "Expense", is_reversed: false, is_transfer: false },
          { transaction_id: 2, description: "Transfer", amount: 200, transaction_type: "Expense", is_reversed: false, is_transfer: true },
        ],
      },
    });
    getWallets.mockResolvedValueOnce({ data: [] });
    getCategories.mockResolvedValueOnce({ data: { data: [] } });
    reverseTransaction.mockResolvedValueOnce({});
    reverseTransfer.mockResolvedValueOnce({});

    await act(async () => {
      render(<Transactions />);
    });

    const buttons = await screen.findAllByText("Reverse");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(reverseTransaction).toHaveBeenCalledWith(1);
      expect(reverseTransfer).toHaveBeenCalledWith(2);
    });
  });
});