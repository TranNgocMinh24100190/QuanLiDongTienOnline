import * as categoriesApi from "../../api/categories";
import API from "../../api/api";

jest.mock("../../api/api");

describe("categories API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCategories calls GET /categories", async () => {
    API.get.mockResolvedValue({ data: [] });
    await categoriesApi.getCategories();
    expect(API.get).toHaveBeenCalledWith("/categories");
  });

  it("createCategory calls POST /categories", async () => {
    const data = { name: "Food", type: "Expense" };
    API.post.mockResolvedValue({ data: {} });
    await categoriesApi.createCategory(data);
    expect(API.post).toHaveBeenCalledWith("/categories", data);
  });

  it("updateCategory calls PUT /categories/:id", async () => {
    const data = { name: "Drinks" };
    API.put.mockResolvedValue({ data: {} });
    await categoriesApi.updateCategory(4, data);
    expect(API.put).toHaveBeenCalledWith("/categories/4", data);
  });

  it("deleteCategory calls DELETE /categories/:id", async () => {
    API.delete.mockResolvedValue({ data: {} });
    await categoriesApi.deleteCategory(4);
    expect(API.delete).toHaveBeenCalledWith("/categories/4");
  });
});