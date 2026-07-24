const budgetController = require("../../src/controllers/budgetController");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("budgetController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 getBudgets", async () => {
    db.query
      .mockResolvedValueOnce([[{ category_id: 1, amount_limit: 1000, month: 5, year: 2024, category_name: "Food" }]])
      .mockResolvedValueOnce([[{ spent: 200 }]]);
    const req = { user: { user_id: 1 } };
    const res = createRes();

    await budgetController.getBudgets(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: expect.any(Array) });
  });

  it("returns 400 createBudget missing fields", async () => {
    const req = { body: { amount_limit: 1000 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.createBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing fields" });
  });

  it("returns 400 createBudget invalid month", async () => {
    const req = { body: { category_id: 1, amount_limit: 1000, month: 13, year: 2025 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.createBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid month" });
  });

  it("returns 404 createBudget for missing category", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { body: { category_id: 1, amount_limit: 1000, month: 5, year: 2025 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.createBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });

  it("returns 201 createBudget success", async () => {
    db.query
      .mockResolvedValueOnce([[{ type: "Expense" }]])
      .mockResolvedValueOnce([{ insertId: 1 }]);
    const req = { body: { category_id: 1, amount_limit: 1000, month: 5, year: 2025 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.createBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Budget created" });
  });

  it("returns 400 updateBudget invalid amount", async () => {
    const req = { params: { id: "1" }, body: { amount_limit: "abc", month: 5, year: 2025 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.updateBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Amount limit is required" });
  });

  it("returns 404 updateBudget when not found", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const req = { params: { id: "1" }, body: { amount_limit: 1000, month: 5, year: 2025 }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.updateBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Budget not found" });
  });

  it("returns 404 deleteBudget not found", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const req = { params: { id: "1" }, user: { user_id: 1 } };
    const res = createRes();

    await budgetController.deleteBudget(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Budget not found" });
  });
});