import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import Admin from "../../pages/Admin";
import { getUsers } from "../../api/admin";

jest.mock("../../api/admin");

describe("Admin page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("loads users and renders stats and table rows", async () => {
    getUsers.mockResolvedValueOnce({
      data: {
        data: [
          {
            user_id: 1,
            full_name: "Nguyen Van A",
            email: "a@b.com",
            role: "ADMIN",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            user_id: 2,
            full_name: "Nguyen Van B",
            email: "b@b.com",
            role: "USER",
            created_at: "2024-01-02T00:00:00Z",
          },
        ],
      },
    });

    render(<Admin />);

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();

    const totalCard = screen.getByText("Tổng tài khoản").closest(".stat-card");
    expect(within(totalCard).getByText("2")).toBeInTheDocument();

    const adminCard = screen.getByText("Admin").closest(".stat-card");
    expect(within(adminCard).getByText("1")).toBeInTheDocument();

    const userCard = screen.getByText("User").closest(".stat-card");
    expect(within(userCard).getByText("1")).toBeInTheDocument();

    expect(screen.getByText("👑 ADMIN")).toBeInTheDocument();
    expect(screen.getByText("👤 USER")).toBeInTheDocument();
    expect(screen.getByText("Nguyen Van B")).toBeInTheDocument();
  });

  it("shows alert if getUsers fails", async () => {
    getUsers.mockRejectedValueOnce(new Error("Network error"));

    render(<Admin />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Không tải được danh sách người dùng"
      );
    });
  });

  it("renders empty state when no users", async () => {
    getUsers.mockResolvedValueOnce({ data: { data: [] } });

    render(<Admin />);

    await waitFor(() => {
      const totalCard = screen.getByText("Tổng tài khoản").closest(".stat-card");
      expect(within(totalCard).getByText("0")).toBeInTheDocument();
    });
  });
});