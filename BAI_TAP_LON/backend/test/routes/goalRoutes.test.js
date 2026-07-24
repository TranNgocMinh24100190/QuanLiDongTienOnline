jest.mock("../../src/middleware/authMiddleware", () => (req, res, next) => {
  req.user = { user_id: 1 };
  next();
});

jest.mock("../../src/controllers/goalController", () => ({
  getGoals: jest.fn((req, res) => res.status(200).json({ data: [] })),
  createGoal: jest.fn((req, res) => res.status(201).json({ message: "created" })),
  updateGoal: jest.fn((req, res) => res.status(200).json({ message: "updated" })),
  deleteGoal: jest.fn((req, res) => res.status(200).json({ message: "deleted" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Goal routes", () => {
  it("POST /goals returns 400 when target_amount invalid", async () => {
    const res = await request(app)
      .post("/goals")
      .send({ goal_name: "Mua xe", target_amount: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /goals returns 201 when valid", async () => {
    const res = await request(app)
      .post("/goals")
      .send({ goal_name: "Mua xe", target_amount: 1000000 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });
});