import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import Dashboard from "../../pages/Dashboard";
import { getWallets } from "../../api/wallets";

jest.mock("../../api/wallets");

describe("Dashboard page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders totals from wallets", async () => {
    getWallets.mockResolvedValueOnce({
      data: [
        { wallet_id: 1, wallet_name: "A", balance: 1000, status: "ACTIVE" },
        { wallet_id: 2, wallet_name: "B", balance: 2000, status: "INACTIVE" },
      ],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("3,000 VNĐ")).toBeInTheDocument();
    });

    const totalWalletsCard = screen.getByText("Tổng số ví").closest(".stat-card");
    expect(within(totalWalletsCard).getByText("2")).toBeInTheDocument();

    const activeWalletsCard = screen.getByText("Ví đang hoạt động").closest(".stat-card");
    expect(within(activeWalletsCard).getByText("1")).toBeInTheDocument();
  });

  it("shows zero totals when no wallets", async () => {
    getWallets.mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("0 VNĐ")).toBeInTheDocument();
    });

    const totalWalletsCard = screen.getByText("Tổng số ví").closest(".stat-card");
    expect(within(totalWalletsCard).getByText("0")).toBeInTheDocument();

    const activeWalletsCard = screen.getByText("Ví đang hoạt động").closest(".stat-card");
    expect(within(activeWalletsCard).getByText("0")).toBeInTheDocument();
  });
});