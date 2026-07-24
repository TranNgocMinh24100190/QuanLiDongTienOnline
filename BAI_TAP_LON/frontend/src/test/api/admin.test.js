import * as adminApi from "../../api/admin";
import API from "../../api/api";

jest.mock("../../api/api");

describe("admin API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getUsers calls GET /admin/users", async () => {
    API.get.mockResolvedValue({ data: [] });
    await adminApi.getUsers();
    expect(API.get).toHaveBeenCalledWith("/admin/users");
  });
});