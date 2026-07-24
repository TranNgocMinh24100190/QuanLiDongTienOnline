import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../pages/Register";
import { register } from "../../api/auth";

const mockedNavigate = jest.fn();

jest.mock("../../api/auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("Register page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("submits registration and navigates after success", async () => {
    register.mockResolvedValueOnce({});
    render(<MemoryRouter>
        <Register />
        </MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mật khẩu"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText("Đăng ký"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        full_name: "User",
        email: "a@b.com",
        password: "123456",
      });
      expect(screen.getByText("Đăng ký thành công! Bạn có thể đăng nhập.")).toBeInTheDocument();
    });

    jest.runAllTimers();
    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows error message when register fails", async () => {
    register.mockRejectedValueOnce(new Error("Fail"));
    render(<MemoryRouter>
        <Register />
      </MemoryRouter>);

    fireEvent.click(screen.getByText("Đăng ký"));

    await waitFor(() => {
      expect(screen.getByText("Có lỗi xảy ra khi đăng ký.")).toBeInTheDocument();
    });
  });
});