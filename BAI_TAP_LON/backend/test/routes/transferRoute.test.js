jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/transferController", () => ({
  createTransfer: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  reverseTransfer: jest.fn((req, res) => res.status(200).json({ message: "reversed" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Transfer routes", () => {
  it("POST /transfers returns 400 when amount invalid", async () => {
    const res = await request(app)
      .post("/transfers")
      .send({ from_wallet_id: 1, to_wallet_id: 2, amount: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /transfers returns 201 when valid", async () => {
    const res = await request(app)
      .post("/transfers")
      .send({ from_wallet_id: 1, to_wallet_id: 2, amount: 100 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });

  it("POST /transfers/reverse/:id returns 200", async () => {
    const res = await request(app).post("/transfers/reverse/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "reversed" });
  });
});