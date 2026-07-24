const walletController = require("../../src/controllers/walletController");
const walletService = require("../../src/services/walletService");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/services/walletService");
jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("walletController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when createWallet missing fields", async () => {
    const req = { body: { wallet_type: "Cash" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.createWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Wallet name and type are required" });
  });

  it("returns 201 when createWallet succeeds", async () => {
    walletService.createWallet.mockResolvedValue({
      message: "Wallet created successfully",
      data: { wallet_id: 1, wallet_name: "Cash", wallet_type: "Cash", balance: 0 }
    });

    const req = {
      body: { wallet_name: "Cash", wallet_type: "Cash" },
      user: { user_id: 1 }
    };
    const res = createRes();

    await walletController.createWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Wallet created successfully",
      data: expect.objectContaining({ wallet_name: "Cash", wallet_type: "Cash" })
    }));
  });

  it("returns 200 getWallets with wallet list", async () => {
    db.query.mockResolvedValue([[{ wallet_id: 1, wallet_name: "Cash", wallet_type: "Cash", balance: 0 }]]);
    const req = { user: { user_id: 1 } };
    const res = createRes();

    await walletController.getWallets(req, res);

    expect(db.query).toHaveBeenCalledWith("SELECT * FROM Wallets WHERE user_id=?", [1]);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ wallet_id: 1, wallet_name: "Cash" })
    ]));
  });

  it("returns 400 getWalletById invalid id", async () => {
    const req = { params: { id: "abc" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.getWalletById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid wallet ID" });
  });

  it("returns 404 getWalletById not found", async () => {
    db.query.mockResolvedValue([[]]);
    const req = { params: { id: "10" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.getWalletById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Wallet not found" });
  });

  it("returns 200 getWalletById success", async () => {
    db.query.mockResolvedValue([[{ wallet_id: 10, wallet_name: "Cash", wallet_type: "Cash", balance: 0 }]]);
    const req = { params: { id: "10" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.getWalletById(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ wallet_id: 10 }));
  });

  it("returns 400 updateWallet invalid id", async () => {
    const req = { params: { id: "abc" }, body: {}, user: { user_id: 1 } };
    const res = createRes();

    await walletController.updateWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 closeWallet invalid id", async () => {
    const req = { params: { id: "abc" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.closeWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 openWallet invalid id", async () => {
    const req = { params: { id: "abc" }, user: { user_id: 1 } };
    const res = createRes();

    await walletController.openWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});