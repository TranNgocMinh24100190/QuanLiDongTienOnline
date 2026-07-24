const transferController = require("../../src/controllers/transferController");
const transferService = require("../../src/services/transferService");
const createRes = require("./__mocks__/response");

jest.mock("../../src/services/transferService");

describe("transferController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 createTransfer success", async () => {
    transferService.createTransfer.mockResolvedValue({ message: "created", data: { transfer_id: 1 } });
    const req = { body: { from_wallet_id: 1, to_wallet_id: 2, amount: 100 }, user: { user_id: 1 } };
    const res = createRes();

    await transferController.createTransfer(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "created",
      data: expect.objectContaining({ transfer_id: 1 })
    });
  });

  it("returns 400 createTransfer service error", async () => {
    transferService.createTransfer.mockRejectedValue(new Error("Insufficient balance"));
    const req = { body: { from_wallet_id: 1 }, user: { user_id: 1 } };
    const res = createRes();

    await transferController.createTransfer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Insufficient balance" });
  });

  it("returns 400 reverseTransfer invalid id", async () => {
    const req = { params: { id: "abc" }, user: { user_id: 1 } };
    const res = createRes();

    await transferController.reverseTransfer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid transfer ID" });
  });

  it("returns 200 reverseTransfer success", async () => {
    transferService.reverseTransfer.mockResolvedValue({ message: "reversed", data: { transfer_id: 5 } });
    const req = { params: { id: "5" }, user: { user_id: 1 } };
    const res = createRes();

    await transferController.reverseTransfer(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "reversed",
      data: expect.objectContaining({ transfer_id: 5 })
    });
  });
});