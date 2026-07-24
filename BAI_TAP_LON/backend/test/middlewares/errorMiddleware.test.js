const errorMiddleware = require("../../src/middleware/errorMiddleware");

describe("errorMiddleware", () => {
  it("returns 500 and error message", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const err = new Error("Test failure");

    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    errorMiddleware(err, req, res, next);

    expect(consoleError).toHaveBeenCalledWith("❌ Error:", "Test failure");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "Test failure"
    });

    consoleError.mockRestore();
  });
});