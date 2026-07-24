import * as walletsApi from "../../api/wallets";
import API from "../../api/api";

jest.mock("../../api/api");

describe("wallets API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getWallets calls GET /wallets", async () => {
    API.get.mockResolvedValue({ data: [] });
    await walletsApi.getWallets();
    expect(API.get).toHaveBeenCalledWith("/wallets");
  });

  it("getWalletById calls GET /wallets/:id", async () => {
    API.get.mockResolvedValue({ data: {} });
    await walletsApi.getWalletById(5);
    expect(API.get).toHaveBeenCalledWith("/wallets/5");
  });

  it("createWallet calls POST /wallets", async () => {
    const data = { wallet_name: "Cash", wallet_type: "Cash" };
    API.post.mockResolvedValue({ data: {} });
    await walletsApi.createWallet(data);
    expect(API.post).toHaveBeenCalledWith("/wallets", data);
  });

  it("updateWallet calls PUT /wallets/:id", async () => {
    const data = { wallet_name: "New" };
    API.put.mockResolvedValue({ data: {} });
    await walletsApi.updateWallet(3, data);
    expect(API.put).toHaveBeenCalledWith("/wallets/3", data);
  });

  it("closeWallet calls POST /wallets/:id/close", async () => {
    API.post.mockResolvedValue({ data: {} });
    await walletsApi.closeWallet(4);
    expect(API.post).toHaveBeenCalledWith("/wallets/4/close");
  });

  it("openWallet calls POST /wallets/:id/open", async () => {
    API.post.mockResolvedValue({ data: {} });
    await walletsApi.openWallet(4);
    expect(API.post).toHaveBeenCalledWith("/wallets/4/open");
  });
});