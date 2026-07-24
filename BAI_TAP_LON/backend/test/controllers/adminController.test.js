const adminController = require("../../src/controllers/adminController");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("adminController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 when non-admin user calls getUsers", async () => {
    const req = { user: { user_id: 1, role: "USER" } };
    const res = createRes();

    await adminController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  it("returns 200 getUsers for admin", async () => {
    db.query.mockResolvedValue([[{ user_id: 1, full_name: "Test", email: "t@test.com", role: "ADMIN", created_at: new Date() }]]);
    const req = { user: { user_id: 1, role: "ADMIN" } };
    const res = createRes();

    await adminController.getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.any(Array)
    }));
  });
});