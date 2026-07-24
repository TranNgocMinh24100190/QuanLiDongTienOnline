let mockUser = { user_id: 1, role: "ADMIN" };

jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = mockUser;
  next();
});

jest.mock("../../src/middleware/authorize", () => (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
});

jest.mock("../../src/controllers/adminController", () => ({
  getUsers: jest.fn((req, res) => res.status(200).json({ data: [] }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Admin routes", () => {
  it("GET /admin/users returns 200 for ADMIN", async () => {
    mockUser = { user_id: 1, role: "ADMIN" };

    const res = await request(app).get("/admin/users");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("GET /admin/users returns 403 for non-admin", async () => {
    mockUser = { user_id: 1, role: "USER" };

    const res = await request(app).get("/admin/users");

    expect(res.status).toBe(403);
  });
});