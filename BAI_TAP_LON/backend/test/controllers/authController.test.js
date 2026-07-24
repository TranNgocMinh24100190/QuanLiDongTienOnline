const authController = require("../../src/controllers/authController");
const db = require("../../src/config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createRes = require("./__mocks__/response");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("authController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 register missing fields", async () => {
    const req = { body: { full_name: "Test", email: "t@test.com" } };
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 register when email exists", async () => {
    db.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
    const req = { body: { full_name: "Test", email: "t@test.com", password: "123456" } };
    const res = createRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  it("returns 200 login success", async () => {
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");
    db.query.mockResolvedValueOnce([[{ user_id: 1, full_name: "Test", email: "t@test.com", password_hash: "hash", role: "USER" }]]);
    const req = { body: { email: "t@test.com", password: "123456" }, cookies: {} };
    const res = createRes();

    await authController.login(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({ message: "Login success", role: "USER" });
  });

  it("returns 400 login wrong password", async () => {
    bcrypt.compare.mockResolvedValue(false);
    db.query.mockResolvedValueOnce([[{ password_hash: "hash" }]]);
    const req = { body: { email: "t@test.com", password: "123456" } };
    const res = createRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Wrong password" });
  });

  it("returns 401 refreshToken without cookie", async () => {
    const req = { cookies: {} };
    const res = createRes();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No refresh token" });
  });

  it("returns 403 refreshToken invalid token", async () => {
    jwt.verify.mockImplementation(() => { throw new Error("bad"); });
    const req = { cookies: { refreshToken: "bad" } };
    const res = createRes();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid refresh token" });
  });

  it("returns 401 me when unauthenticated", async () => {
    const req = { user: null };
    const res = createRes();

    await authController.me(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("returns 404 me when user not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { user: { user_id: 1 } };
    const res = createRes();

    await authController.me(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 me success", async () => {
    db.query.mockResolvedValueOnce([[{ user_id: 1, full_name: "Test", email: "t@test.com", role: "USER" }]]);
    const req = { user: { user_id: 1 } };
    const res = createRes();

    await authController.me(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ full_name: "Test" }) });
  });

  it("returns logout with cleared cookies", () => {
    const req = {};
    const res = createRes();

    authController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({ message: "Logged out" });
  });
});