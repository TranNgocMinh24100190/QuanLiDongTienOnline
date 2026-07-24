import * as authApi from "../../api/auth";
import API from "../../api/api";

jest.mock("../../api/api");

describe("auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("login calls POST /auth/login with payload", async () => {
    const payload = { email: "test@example.com", password: "123456" };
    API.post.mockResolvedValue({ data: {} });
    await authApi.login(payload);
    expect(API.post).toHaveBeenCalledWith("/auth/login", payload);
  });
});