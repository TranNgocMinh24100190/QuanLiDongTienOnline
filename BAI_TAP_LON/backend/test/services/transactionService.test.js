const transactionService = require("../../src/services/transactionService");
const db = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

describe("transactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when required fields are missing", async () => {
    await expect(transactionService.createTransaction(1, { wallet_id: 1 }))
      .rejects.toThrow("Missing required fields");
  });

  it("throws when amount is zero", async () => {
    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: 0,
      transaction_type: "Expense"
    })).rejects.toThrow("Invalid amount");
  });

  it("throws when amount is negative", async () => {
    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: -50,
      transaction_type: "Expense"
    })).rejects.toThrow("Invalid amount");
  });

  it("throws when transaction type is invalid", async () => {
    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: 100,
      transaction_type: "Loan"
    })).rejects.toThrow(/Invalid transaction type|Missing required fields|Category type does not match/);
  });

  it("throws when wallet not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: 100,
      transaction_type: "Expense"
    })).rejects.toThrow("Wallet not found");
  });

  it("throws when wallet is closed", async () => {
    db.query.mockResolvedValueOnce([[{ status: "CLOSED", balance: 100 }]]);
    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: 50,
      transaction_type: "Expense"
    })).rejects.toThrow("Wallet is closed");
  });

  it("throws when category type mismatches transaction type", async () => {
    db.query
      .mockResolvedValueOnce([[{ status: "ACTIVE", balance: 100 }]])
      .mockResolvedValueOnce([[{ type: "Income" }]]);

    await expect(transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 1,
      amount: 50,
      transaction_type: "Expense"
    })).rejects.toThrow("Category type does not match transaction type");
  });

  it("creates expense transaction successfully", async () => {
    const conn = {
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };

    db.query
      .mockResolvedValueOnce([[{ status: "ACTIVE", balance: 200 }]]) // wallet
      .mockResolvedValueOnce([[{ type: "Expense" }]]); // category

    db.getConnection.mockResolvedValue(conn);

    conn.query
      .mockResolvedValueOnce([[]]) // budgetRows
      .mockResolvedValueOnce([{ insertId: 11 }]) // insert transaction
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update balance

    const result = await transactionService.createTransaction(1, {
      wallet_id: 1,
      category_id: 2,
      amount: 50,
      transaction_type: "Expense",
      description: "Mua sắm"
    });

    expect(result.message).toBe("Transaction success");
    expect(result.data.amount).toBe(50);
    expect(result.budgetWarning).toBeNull();
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  it("throws when transaction to reverse is not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    await expect(transactionService.reverseTransaction(1, 999))
      .rejects.toThrow("Transaction not found");
  });

  it("throws when reversing an already reversed transaction", async () => {
    db.query.mockResolvedValueOnce([[{
      transaction_id: 10,
      wallet_id: 1,
      category_id: 2,
      amount: 100,
      transaction_type: "Expense",
      description: "[REVERSED] Test",
      is_transfer: 0,
      is_reversed: 1
    }]]);

    await expect(transactionService.reverseTransaction(1, 10))
      .rejects.toThrow("Transaction has already been reversed");
  });

  it("reverses transaction successfully", async () => {
    db.query
      .mockResolvedValueOnce([[{
        transaction_id: 10,
        wallet_id: 1,
        category_id: 2,
        amount: 100,
        transaction_type: "Expense",
        description: "Test",
        is_transfer: 0,
        is_reversed: 0
      }]])
      .mockResolvedValueOnce([[]]) // goals select, no update
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update transaction

    const result = await transactionService.reverseTransaction(1, 10);

    expect(result.message).toBe("Transaction reversed successfully");
    expect(result.data.is_reversed).toBe(true);
    expect(result.data.transaction_type).toBe("Income");
  });
});