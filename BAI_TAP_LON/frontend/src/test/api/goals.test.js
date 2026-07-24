import * as goalsApi from "../../api/goals";
import API from "../../api/api";

jest.mock("../../api/api");

describe("goals API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getGoals calls GET /goals", async () => {
    API.get.mockResolvedValue({ data: [] });
    await goalsApi.getGoals();
    expect(API.get).toHaveBeenCalledWith("/goals");
  });

  it("createGoal calls POST /goals", async () => {
    const data = { goal_name: "Buy bike", target_amount: 1000 };
    API.post.mockResolvedValue({ data: {} });
    await goalsApi.createGoal(data);
    expect(API.post).toHaveBeenCalledWith("/goals", data);
  });

  it("updateGoal calls PUT /goals/:id", async () => {
    const data = { target_amount: 2000 };
    API.put.mockResolvedValue({ data: {} });
    await goalsApi.updateGoal(9, data);
    expect(API.put).toHaveBeenCalledWith("/goals/9", data);
  });

  it("deleteGoal calls DELETE /goals/:id", async () => {
    API.delete.mockResolvedValue({ data: {} });
    await goalsApi.deleteGoal(9);
    expect(API.delete).toHaveBeenCalledWith("/goals/9");
  });
});