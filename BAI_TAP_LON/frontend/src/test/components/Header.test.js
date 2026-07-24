import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "../../components/Header";
import * as authApi from "../../api/auth";

jest.mock("../../api/auth", () => ({
  getMe: jest.fn(),
  logout: jest.fn()
}));

describe("Header component", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });
  });

  it("renders full_name when getMe succeeds", async () => {
    authApi.getMe.mockResolvedValueOnce({
      data: { data: { full_name: "Nguyen Van A", email: "a@b.com" } }
    });

    render(<Header onSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    });
  });

  it("renders email when full_name is missing", async () => {
    authApi.getMe.mockResolvedValueOnce({
      data: { data: { email: "a@b.com" } }
    });

    render(<Header onSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("a@b.com")).toBeInTheDocument();
    });
  });

  it("renders default label when getMe fails", async () => {
    authApi.getMe.mockRejectedValueOnce(new Error("API error"));

    render(<Header onSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Người dùng")).toBeInTheDocument();
    });
  });

  it("opens dropdown and closes when clicking outside", async () => {
    authApi.getMe.mockResolvedValueOnce({
      data: { data: { full_name: "Nguyen", email: "a@b.com" } }
    });

    render(<Header onSearch={jest.fn()} />);

    const button = await screen.findByRole("button", { name: /Nguyen/i });
    fireEvent.click(button);

    expect(screen.getByText(/Đăng xuất/i)).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText(/Đăng xuất/i)).not.toBeInTheDocument();
    });
  });

  it("calls logout, clears localStorage role and redirects to /login", async () => {
    authApi.getMe.mockResolvedValueOnce({
      data: { data: { full_name: "Nguyen", email: "a@b.com" } }
    });
    authApi.logout.mockResolvedValueOnce({});
    localStorage.setItem("role", "USER");

    render(<Header onSearch={jest.fn()} />);

    const button = await screen.findByRole("button", { name: /Nguyen/i });
    fireEvent.click(button);

    const logoutButton = screen.getByRole("button", { name: /Đăng xuất/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
    });

    expect(localStorage.getItem("role")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});