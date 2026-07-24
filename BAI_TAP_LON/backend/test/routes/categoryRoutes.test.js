jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/categoryController", () => ({
  getCategories: jest.fn((req, res) => res.status(200).json({ data: [] })),
  createCategory: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  updateCategory: jest.fn((req, res) => res.status(200).json({ message: "updated" })),
  deleteCategory: jest.fn((req, res) => res.status(200).json({ message: "deleted" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Category routes", () => {
  it("POST /categories returns 400 when name missing", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ type: "Expense" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /categories returns 201 when valid", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ name: "Ăn uống", type: "Expense" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });
});