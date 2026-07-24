const authorize = require("../../src/middleware/authorize");

describe("authorize middleware", () => {
  const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("calls next when role is allowed", () => {
    const middleware = authorize("ADMIN", "USER");
    const req = { user: { role: "USER" } };
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 when role is not allowed", () => {
    const middleware = authorize("ADMIN");
    const req = { user: { role: "USER" } };
    const res = createRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when req.user is missing", () => {
    const middleware = authorize("ADMIN");
    const req = {};
    const res = createRes();
    const next = jest.fn();

    expect(() => middleware(req, res, next)).toThrow();
  });
});