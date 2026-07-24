import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react";
import Transfers from "../../pages/Transfers";
import { getWallets } from "../../api/wallets";
import { createTransfer } from "../../api/transfers";

jest.mock("../../api/wallets");
jest.mock("../../api/transfers");

describe("Transfers page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads wallets and renders options", async () => {
    getWallets.mockResolvedValueOnce({
      data: [
        { wallet_id: 1, wallet_name: "A" },
        { wallet_id: 2, wallet_name: "B" },
      ],
    });

    await act(async () => {
      render(<Transfers />);
    });

    const [fromSelect, toSelect] = await screen.findAllByRole("combobox");
    await waitFor(() => {
      expect(within(fromSelect).getAllByRole("option").length).toBe(3);
      expect(within(toSelect).getAllByRole("option").length).toBe(3);
    });

    expect(within(fromSelect).getByRole("option", { name: "A" })).toBeInTheDocument();
    expect(within(toSelect).getByRole("option", { name: "B" })).toBeInTheDocument();
  });

  it("creates transfer and shows success modal", async () => {
    getWallets.mockResolvedValueOnce({
      data: [
        { wallet_id: 1, wallet_name: "A" },
        { wallet_id: 2, wallet_name: "B" },
      ],
    });
    createTransfer.mockResolvedValueOnce({});

    await act(async () => {
      render(<Transfers />);
    });

    const [fromSelect, toSelect] = await screen.findAllByRole("combobox");
    await waitFor(() => {
      expect(within(fromSelect).getAllByRole("option").length).toBe(3);
    });
    fireEvent.change(fromSelect, { target: { value: "1" } });
    fireEvent.change(toSelect, { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Số tiền"), {
      target: { value: "100" },
    });

    await waitFor(() => expect(fromSelect.value).toBe("1"));

    fireEvent.click(screen.getByRole("button", { name: /Chuyển tiền/i }));

    await waitFor(() => {
      expect(createTransfer).toHaveBeenCalledWith({
        from_wallet_id: "1",
        to_wallet_id: "2",
        amount: "100",
      });
      expect(screen.getByText("Chuyển tiền thành công!")).toBeInTheDocument();
    });

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(screen.queryByText("Chuyển tiền thành công!")).not.toBeInTheDocument();
    });
  });

  it("shows alert when transfer fails", async () => {
    getWallets.mockResolvedValueOnce({ data: [] });
    createTransfer.mockRejectedValueOnce(new Error("Fail"));

    render(<Transfers />);

    fireEvent.click(screen.getByRole("button", { name: /Chuyển tiền/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Không thể chuyển tiền");
    });
  });
});