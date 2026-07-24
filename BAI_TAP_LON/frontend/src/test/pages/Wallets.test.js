import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Wallets from "../../pages/Wallets";
import {
  getWallets,
  createWallet,
  updateWallet,
  closeWallet,
  openWallet,
} from "../../api/wallets";

jest.mock("../../api/wallets");

describe("Wallets page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("loads wallets and displays cards", async () => {
    getWallets.mockResolvedValueOnce({
      data: [
        {
          wallet_id: 1,
          wallet_name: "Cash",
          wallet_type: "Cash",
          balance: 500000,
          status: "ACTIVE",
        },
      ],
    });

    render(<Wallets />);

    expect(await screen.findByRole("heading", { name: "Cash" })).toBeInTheDocument();
    expect(screen.getByText(/500,000\s*VNĐ/)).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("creates a wallet and reloads list", async () => {
    getWallets
      .mockResolvedValueOnce({
        data: [],
      })
      .mockResolvedValueOnce({
        data: [
          {
            wallet_id: 1,
            wallet_name: "New Wallet",
            wallet_type: "Bank",
            balance: 0,
            status: "ACTIVE",
          },
        ],
      });
    createWallet.mockResolvedValueOnce({});

    render(<Wallets />);

    fireEvent.change(screen.getByPlaceholderText("Tên ví"), {
      target: { value: "New Wallet" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Bank" },
    });

    fireEvent.click(screen.getByText("Tạo ví"));

    await waitFor(() => {
      expect(createWallet).toHaveBeenCalledWith({
        wallet_name: "New Wallet",
        wallet_type: "Bank",
      });
      expect(screen.getByRole("heading", { name: "New Wallet" })).toBeInTheDocument();
    });
  });

  it("edits wallet name and closes modal", async () => {
    getWallets
      .mockResolvedValueOnce({
        data: [
          {
            wallet_id: 1,
            wallet_name: "Old Name",
            wallet_type: "Cash",
            balance: 0,
            status: "ACTIVE",
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            wallet_id: 1,
            wallet_name: "Updated Name",
            wallet_type: "Cash",
            balance: 0,
            status: "ACTIVE",
          },
        ],
      });
    updateWallet.mockResolvedValueOnce({});

    render(<Wallets />);

    const editBtn = await screen.findByText("Sửa tên");
    fireEvent.click(editBtn);

    const modal = screen.getByText("Sửa tên ví").closest(".modal");
    const modalUtils = within(modal);

    fireEvent.change(modalUtils.getByPlaceholderText("Tên ví"), {
      target: { value: "Updated Name" },
    });
    fireEvent.click(modalUtils.getByText("Lưu"));

    await waitFor(() => {
      expect(updateWallet).toHaveBeenCalledWith(1, {
        wallet_name: "Updated Name",
      });
      expect(screen.getByRole("heading", { name: "Updated Name" })).toBeInTheDocument();
    });
  });

  it("closes and opens wallet based on status", async () => {
    getWallets
      .mockResolvedValueOnce({
        data: [
          {
            wallet_id: 1,
            wallet_name: "Cash",
            wallet_type: "Cash",
            balance: 0,
            status: "ACTIVE",
          },
          {
            wallet_id: 2,
            wallet_name: "Disabled",
            wallet_type: "Bank",
            balance: 0,
            status: "INACTIVE",
          },
        ],
      })
      .mockResolvedValue({
        data: [],
      });
    closeWallet.mockResolvedValueOnce({});
    openWallet.mockResolvedValueOnce({});

    render(<Wallets />);

    expect(await screen.findByRole("heading", { name: "Cash" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Đóng ví/i }));
    await waitFor(() => expect(closeWallet).toHaveBeenCalledWith(1));

    fireEvent.click(screen.getByRole("button", { name: /Mở ví/i }));
    await waitFor(() => expect(openWallet).toHaveBeenCalledWith(2));
  });

  it("shows alert when loading wallets fails", async () => {
    getWallets.mockRejectedValueOnce(new Error("Fail"));

    render(<Wallets />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Không tải được danh sách ví");
    });
  });
});