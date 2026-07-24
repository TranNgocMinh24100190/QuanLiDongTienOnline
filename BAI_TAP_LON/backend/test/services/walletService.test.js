const walletService = require("../../src/services/walletService");
const db = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

describe("walletService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when wallet_name is missing", async () => {
    await expect(walletService.createWallet(1, { wallet_type: "Cash" }))
      .rejects.toThrow("Wallet name and type are required");
  });

  it("throws when wallet_type is invalid", async () => {
    await expect(walletService.createWallet(1, { wallet_name: "Test", wallet_type: "Invalid" }))
      .rejects.toThrow("Invalid wallet type");
  });

  it("creates wallet successfully", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }]);

    const result = await walletService.createWallet(1, {
      wallet_name: "Tiền mặt",
      wallet_type: "Cash"
    });

    expect(result.message).toBe("Wallet created successfully");
    expect(result.data.wallet_id).toBe(123);
    expect(result.data.wallet_name).toBe("Tiền mặt");
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it("throws when changing wallet type after transactions exist", async () => {
    db.query.mockResolvedValueOnce([[{ transaction_id: 1 }]]);

    await expect(walletService.updateWallet(1, 10, { wallet_type: "Bank" }))
      .rejects.toThrow("Cannot change wallet type after transactions exist");
  });

  it("updates wallet successfully", async () => {
    db.query
      .mockResolvedValueOnce([[/* no transactions */]]) // transaction check
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // update
      .mockResolvedValueOnce([[{
        wallet_id: 10,
        user_id: 1,
        wallet_name: "Ví mới",
        wallet_type: "Bank",
        balance: 0,
        status: "ACTIVE"
      }]]); // select updated

    const result = await walletService.updateWallet(1, 10, { wallet_name: "Ví mới", wallet_type: "Bank" });

    expect(result.message).toBe("Wallet updated successfully");
    expect(result.data.wallet_name).toBe("Ví mới");
    expect(db.query).toHaveBeenCalledTimes(3);
  });

  it("throws when closing wallet with remaining balance", async () => {
    db.query.mockResolvedValueOnce([[{ balance: 100, status: "ACTIVE" }]]);
    await expect(walletService.closeWallet(1, 5))
      .rejects.toThrow("Cannot close wallet with remaining balance");
  });

  it("closes wallet successfully", async () => {
    db.query
      .mockResolvedValueOnce([[{ balance: 0, status: "ACTIVE" }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{
        wallet_id: 5,
        user_id: 1,
        wallet_name: "Ví đóng",
        wallet_type: "Cash",
        balance: 0,
        status: "CLOSED"
      }]]);

    const result = await walletService.closeWallet(1, 5);

    expect(result.message).toBe("Wallet closed successfully");
    expect(result.data.status).toBe("CLOSED");
  });

  it("reopens wallet successfully", async () => {
    db.query
      .mockResolvedValueOnce([[{ status: "CLOSED" }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{
        wallet_id: 5,
        user_id: 1,
        wallet_name: "Ví mở",
        wallet_type: "Cash",
        balance: 0,
        status: "ACTIVE"
      }]]);

    const result = await walletService.openWallet(1, 5);
    expect(result.message).toBe("Wallet reopened successfully");
    expect(result.data.status).toBe("ACTIVE");
  });
});