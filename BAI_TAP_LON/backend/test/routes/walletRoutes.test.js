jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/walletController", () => ({
  createWallet: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  getWallets: jest.fn((req, res) => res.status(200).json({ data: [] })),
  getWalletById: jest.fn((req, res) => res.status(200).json({ data: { wallet_id: 1 } })),
  updateWallet: jest.fn((req, res) => res.status(200).json({ message: "updated" })),
  closeWallet: jest.fn((req, res) => res.status(200).json({ message: "closed" })),
  openWallet: jest.fn((req, res) => res.status(200).json({ message: "opened" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Wallet routes", () => {
  it("POST /wallets returns 201 with valid payload", async () => {
    const res = await request(app)
      .post("/wallets")
      .send({ wallet_name: "Cash", wallet_type: "Cash" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });

  it("GET /wallets returns 200", async () => {
    const res = await request(app).get("/wallets");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("GET /wallets/:id returns 200", async () => {
    const res = await request(app).get("/wallets/1");
    expect(res.status).toBe(200);
    expect(res.body.data.wallet_id).toBe(1);
  });
});