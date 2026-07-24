const transactionController = require("../../src/controllers/transactionController");
const service = require("../../src/services/transactionService");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/services/transactionService");
jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("transactionController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 createTransaction when missing fields", async () => {
    const req = { body: { wallet_id: 1 }, user: { user_id: 1 } };
    const res = createRes();

    await transactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing required fields" });
  });

  it("returns 400 createTransaction when amount invalid", async () => {
    const req = {
      body: { wallet_id: 1, category_id: 1, amount: 0, transaction_type: "Expense" },
      user: { user_id: 1 }
    };
    const res = createRes();

    await transactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid amount" });
  });

  it("returns 200 createTransaction success", async () => {
    service.createTransaction.mockResolvedValue({ message: "ok", data: { amount: 100 } });
    const req = {
      body: { wallet_id: 1, category_id: 1, amount: 100, transaction_type: "Expense" },
      user: { user_id: 1 }
    };
    const res = createRes();

    await transactionController.createTransaction(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "ok", data: { amount: 100 } });
  });

  it("returns 400 reverseTransaction invalid id", async () => {
    const req = { params: { id: "abc" }, user: { user_id: 1 } };
    const res = createRes();

    await transactionController.reverseTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid transaction ID" });
  });

  it("returns 200 reverseTransaction success", async () => {
    service.reverseTransaction.mockResolvedValue({ message: "reversed", data: { transaction_id: 1 } });
    const req = { params: { id: "1" }, user: { user_id: 1 } };
    const res = createRes();

    await transactionController.reverseTransaction(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "reversed", data: { transaction_id: 1 } });
  });

  it("returns 400 reverseTransaction service error", async () => {
    service.reverseTransaction.mockRejectedValue(new Error("Not found"));
    const req = { params: { id: "1" }, user: { user_id: 1 } };
    const res = createRes();

    await transactionController.reverseTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("returns 200 getTransactions with query params", async () => {
    db.query.mockResolvedValue([[]]);
    const req = {
      query: { type: "Expense", wallet_id: 1, category_id: 2, month: 5, search: "test", sort: "asc", page: 2, limit: 10 },
      user: { user_id: 1 }
    };
    const res = createRes();

    await transactionController.getTransactions(req, res);

    expect(db.query).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      limit: 10,
      count: 0,
      data: []
    }));
  });
});