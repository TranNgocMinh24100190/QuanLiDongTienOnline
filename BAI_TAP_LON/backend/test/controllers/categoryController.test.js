const categoryController = require("../../src/controllers/categoryController");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("categoryController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 getCategories without type", async () => {
    db.query.mockResolvedValueOnce([[{ category_id: 1, category_name: "Ăn uống", type: "Expense", is_system: 0 }]]);
    const req = { user: { user_id: 1 }, query: {} };
    const res = createRes();

    await categoryController.getCategories(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      count: 1,
      data: expect.any(Array)
    }));
  });

  it("returns 400 createCategory missing fields", async () => {
    const req = { body: { type: "Expense" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Name and type are required" });
  });

  it("returns 400 createCategory invalid type", async () => {
    const req = { body: { name: "Test", type: "Other" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid category type" });
  });

  it("returns 201 createCategory success", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 5 }]);
    const req = { body: { name: "Ăn uống", type: "Expense" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Category created",
      data: expect.objectContaining({ category_name: "Ăn uống" })
    }));
  });

  it("returns 400 updateCategory missing name", async () => {
    const req = { params: { id: "1" }, body: { name: "" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.updateCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Name is required" });
  });

  it("returns 404 updateCategory when not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { params: { id: "1" }, body: { name: "New" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.updateCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });

  it("returns 400 deleteCategory when system category", async () => {
    db.query.mockResolvedValueOnce([[{ category_id: 1, is_system: 1 }]]);
    const req = { params: { id: "1" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "System categories cannot be deleted" });
  });

  it("returns 404 deleteCategory when not found", async () => {
    db.query.mockResolvedValueOnce([[{ category_id: 1, is_system: 0 }]]);
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const req = { params: { id: "1" }, user: { user_id: 1 } };
    const res = createRes();

    await categoryController.deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });
});