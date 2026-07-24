import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/Login";
import { login } from "../../api/auth";

jest.mock("../../api/auth");

describe("Login page", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    jest.useRealTimers();
  });

   it("logs in and redirects after success", async () => {
    login.mockResolvedValueOnce({ data: { role: "USER" } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mật khẩu"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(localStorage.getItem("role")).toBe("USER");
      expect(screen.getByText("Đăng nhập thành công!")).toBeInTheDocument();
    });

    jest.runAllTimers();
    expect(window.location.href).toBe("/dashboard");
  });

  it("shows error message when login fails", async () => {
    login.mockRejectedValueOnce(new Error("Invalid"));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(screen.getByText("Sai tài khoản hoặc mật khẩu.")).toBeInTheDocument();
    });
  });
});