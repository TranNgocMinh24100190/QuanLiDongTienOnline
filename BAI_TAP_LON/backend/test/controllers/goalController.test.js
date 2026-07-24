const goalController = require("../../src/controllers/goalController");
const db = require("../../src/config/db");
const createRes = require("./__mocks__/response");

jest.mock("../../src/config/db", () => ({ query: jest.fn() }));

describe("goalController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 getGoals", async () => {
    db.query.mockResolvedValueOnce([[{ goal_id: 1, user_id: 1, goal_name: "Test", target_amount: 1000, current_amount: 0 }]]);
    const req = { user: { user_id: 1 } };
    const res = createRes();

    await goalController.getGoals(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: expect.any(Array) });
  });

  it("returns 400 createGoal missing fields", async () => {
    const req = { body: { target_amount: 1000 }, user: { user_id: 1 } };
    const res = createRes();

    await goalController.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Goal name and target amount are required" });
  });

  it("returns 400 createGoal invalid target_amount", async () => {
    const req = { body: { goal_name: "Test", target_amount: 0 }, user: { user_id: 1 } };
    const res = createRes();

    await goalController.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid target amount" });
  });

  it("returns 201 createGoal success", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 10 }]);
    const req = { body: { goal_name: "Test", target_amount: 1000 }, user: { user_id: 1 } };
    const res = createRes();

    await goalController.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Goal created",
      data: expect.objectContaining({ goal_id: 10, goal_name: "Test" })
    }));
  });

  it("returns 404 updateGoal when not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { params: { id: "5" }, body: { goal_name: "New" }, user: { user_id: 1 } };
    const res = createRes();

    await goalController.updateGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Goal not found" });
  });

  it("returns 400 updateGoal when no fields to update", async () => {
    db.query.mockResolvedValueOnce([[{ goal_id: 5, user_id: 1 }]]);
    const req = { params: { id: "5" }, body: {}, user: { user_id: 1 } };
    const res = createRes();

    await goalController.updateGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No fields to update" });
  });

  it("returns 404 deleteGoal when not found", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const req = { params: { id: "5" }, user: { user_id: 1 } };
    const res = createRes();

    await goalController.deleteGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Goal not found" });
  });
});