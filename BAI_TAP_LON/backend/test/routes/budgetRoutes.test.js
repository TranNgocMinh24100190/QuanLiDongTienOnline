jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/budgetController", () => ({
  getBudgets: jest.fn((req, res) => res.status(200).json({ data: [] })),
  createBudget: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  updateBudget: jest.fn((req, res) => res.status(200).json({ message: "updated" })),
  deleteBudget: jest.fn((req, res) => res.status(200).json({ message: "deleted" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Budget routes", () => {
  it("POST /budgets returns 400 when month invalid", async () => {
    const res = await request(app)
      .post("/budgets")
      .send({ amount_limit: 1000, month: 13, year: 2024, category_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /budgets returns 201 when valid", async () => {
    const res = await request(app)
      .post("/budgets")
      .send({ amount_limit: 1000, month: 5, year: 2025, category_id: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });

  it("PUT /budgets/:id returns 400 when year invalid", async () => {
    const res = await request(app)
      .put("/budgets/1")
      .send({ year: 1999 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});