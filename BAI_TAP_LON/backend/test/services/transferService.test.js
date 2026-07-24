const transferService = require("../../src/services/transferService");
const db = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

describe("transferService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when required fields are missing", async () => {
    await expect(transferService.createTransfer(1, { from_wallet_id: 1 }))
      .rejects.toThrow("Missing required fields");
  });

  it("throws when amount is zero", async () => {
    await expect(transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 2,
      amount: 0
    })).rejects.toThrow("Invalid amount");
  });

  it("throws when amount is negative", async () => {
    await expect(transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 2,
      amount: -100
    })).rejects.toThrow("Invalid amount");
  });

  it("throws when transferring to same wallet", async () => {
    await expect(transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 1,
      amount: 100
    })).rejects.toThrow("Cannot transfer to same wallet");
  });

  it("throws when wallet not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    await expect(transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 2,
      amount: 100
    })).rejects.toThrow("Wallet not found");
  });

  it("throws when insufficient balance", async () => {
    db.query
      .mockResolvedValueOnce([[{ wallet_id: 1, wallet_name: "A" }, { wallet_id: 2, wallet_name: "B" }]])
      .mockResolvedValueOnce([[{ balance: 50 }]]);

    await expect(transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 2,
      amount: 100
    })).rejects.toThrow("Insufficient balance");
  });

  it("creates transfer successfully", async () => {
    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };

    db.query
      .mockResolvedValueOnce([[{ wallet_id: 1, wallet_name: "A" }, { wallet_id: 2, wallet_name: "B" }]])
      .mockResolvedValueOnce([[{ balance: 200 }]])
      .mockResolvedValueOnce([[{ category_id: 10 }]])
      .mockResolvedValueOnce([[{ category_id: 20 }]]);

    db.getConnection.mockResolvedValue(conn);

    conn.query
      .mockResolvedValueOnce([{ insertId: 100 }])
      .mockResolvedValueOnce([{ insertId: 101 }])
      .mockResolvedValueOnce([{ insertId: 102 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await transferService.createTransfer(1, {
      from_wallet_id: 1,
      to_wallet_id: 2,
      amount: 100,
      note: "Chuyển tiền"
    });

    expect(result.message).toBe("Transfer success");
    expect(result.data.from_wallet_id).toBe(1);
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  it("throws when reverse transfer not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    await expect(transferService.reverseTransfer(1, 100))
      .rejects.toThrow("Transfer transaction not found");
  });

  it("throws when reverse transfer group is invalid", async () => {
    db.query
      .mockResolvedValueOnce([[{ transfer_group_id: 1 }]])
      .mockResolvedValueOnce([[]]);

    await expect(transferService.reverseTransfer(1, 100))
      .rejects.toThrow("Invalid transfer group");
  });
});