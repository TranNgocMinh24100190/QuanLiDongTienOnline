import * as txApi from "../../api/transactions";
import API from "../../api/api";

jest.mock("../../api/api");

describe("transactions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTransactions calls GET /transactions", async () => {
    API.get.mockResolvedValue({ data: [] });
    await txApi.getTransactions();
    expect(API.get).toHaveBeenCalledWith("/transactions");
  });

  it("createTransaction calls POST /transactions", async () => {
    const data = { amount: 100, wallet_id: 1 };
    API.post.mockResolvedValue({ data: {} });
    await txApi.createTransaction(data);
    expect(API.post).toHaveBeenCalledWith("/transactions", data);
  });

  it("reverseTransaction calls POST /transactions/:id/reverse", async () => {
    API.post.mockResolvedValue({ data: {} });
    await txApi.reverseTransaction(7);
    expect(API.post).toHaveBeenCalledWith("/transactions/7/reverse");
  });
});