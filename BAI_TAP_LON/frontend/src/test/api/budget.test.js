import * as budgetsApi from "../../api/budgets";
import API from "../../api/api";

jest.mock("../../api/api");

describe("budgets API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getBudgets calls GET /budgets", async () => {
    API.get.mockResolvedValue({ data: [] });
    await budgetsApi.getBudgets();
    expect(API.get).toHaveBeenCalledWith("/budgets");
  });

  it("createBudget calls POST /budgets", async () => {
    const data = { category_id: 1, amount_limit: 1000 };
    API.post.mockResolvedValue({ data: {} });
    await budgetsApi.createBudget(data);
    expect(API.post).toHaveBeenCalledWith("/budgets", data);
  });

  it("updateBudget calls PUT /budgets/:id", async () => {
    const data = { amount_limit: 1500 };
    API.put.mockResolvedValue({ data: {} });
    await budgetsApi.updateBudget(5, data);
    expect(API.put).toHaveBeenCalledWith("/budgets/5", data);
  });

  it("deleteBudget calls DELETE /budgets/:id", async () => {
    API.delete.mockResolvedValue({ data: {} });
    await budgetsApi.deleteBudget(5);
    expect(API.delete).toHaveBeenCalledWith("/budgets/5");
  });
});