jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/transactionController", () => ({
  getTransactions: jest.fn((req, res) => res.status(200).json({ data: [] })),
  createTransaction: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  reverseTransaction: jest.fn((req, res) => res.status(200).json({ message: "reversed" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Transaction routes", () => {
  it("POST /transactions returns 400 when amount invalid", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({ wallet_id: 1, category_id: 1, amount: 0, transaction_type: "Expense" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /transactions returns 201 when valid", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({ wallet_id: 1, category_id: 1, amount: 100, transaction_type: "Expense" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });

  it("POST /transactions/reverse/:id returns 200", async () => {
    const res = await request(app).post("/transactions/reverse/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "reversed" });
  });
});