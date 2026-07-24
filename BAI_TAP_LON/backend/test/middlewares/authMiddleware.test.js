jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

const jwt = require("jsonwebtoken");
const authMiddleware = require("../../src/middleware/authMiddleware");

describe("authMiddleware", () => {
  const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no token in cookie or Authorization header", () => {
    const req = { cookies: {}, headers: {} };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header is malformed", () => {
    const req = { cookies: {}, headers: { authorization: "Bearer" } };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = { cookies: {}, headers: { authorization: "Bearer badtoken" } };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and attaches req.user when token is valid from cookie", () => {
    jwt.verify.mockReturnValue({ user_id: 1, role: "USER" });

    const req = { cookies: { accessToken: "validtoken" }, headers: {} };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validtoken", process.env.JWT_SECRET);
    expect(req.user).toEqual({ user_id: 1, role: "USER" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("calls next and attaches req.user when token is valid from Authorization header", () => {
    jwt.verify.mockReturnValue({ user_id: 2, role: "ADMIN" });

    const req = { cookies: {}, headers: { authorization: "Bearer validtoken" } };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validtoken", process.env.JWT_SECRET);
    expect(req.user).toEqual({ user_id: 2, role: "ADMIN" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});