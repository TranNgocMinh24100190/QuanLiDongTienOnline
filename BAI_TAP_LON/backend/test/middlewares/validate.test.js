jest.mock("express-validator", () => ({
  validationResult: jest.fn()
}));

const { validationResult } = require("express-validator");
const validate = require("../../src/middleware/validate");

describe("validate middleware", () => {
  const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 with errors when validationResult is not empty", () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "error", param: "name" }]
    });

    const req = {};
    const res = createRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: "error", param: "name" }] });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when validationResult is empty", () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    const req = {};
    const res = createRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});