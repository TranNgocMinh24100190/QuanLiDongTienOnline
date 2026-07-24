import * as transferApi from "../../api/transfers";
import API from "../../api/api";

jest.mock("../../api/api");

describe("transfers API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createTransfer calls POST /transfers", async () => {
    const data = { from_wallet_id: 1, to_wallet_id: 2, amount: 100 };
    API.post.mockResolvedValue({ data: {} });
    await transferApi.createTransfer(data);
    expect(API.post).toHaveBeenCalledWith("/transfers", data);
  });

  it("reverseTransfer calls POST /transfers/:id/reverse", async () => {
    API.post.mockResolvedValue({ data: {} });
    await transferApi.reverseTransfer(8);
    expect(API.post).toHaveBeenCalledWith("/transfers/8/reverse");
  });
});