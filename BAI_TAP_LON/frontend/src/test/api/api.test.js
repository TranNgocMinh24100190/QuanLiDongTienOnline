describe("API axios instance", () => {
  let API;
  let responseFulfilled;
  let responseRejected;
  let fakeInstance;
  const originalLocation = window.location;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" }
    });

    fakeInstance = jest.fn();
    fakeInstance.interceptors = {
      response: {
        use: jest.fn((onFulfilled, onRejected) => {
          responseFulfilled = onFulfilled;
          responseRejected = onRejected;
        })
      }
    };
    fakeInstance.get = jest.fn();
    fakeInstance.post = jest.fn();
    fakeInstance.put = jest.fn();
    fakeInstance.delete = jest.fn();

    jest.doMock("axios", () => ({
      create: jest.fn(() => fakeInstance)
    }));

    const module = await import("../../api/api");
    API = module.default;
  });

  afterEach(() => {
    jest.dontMock("axios");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });
  });

  it("creates axios with correct baseURL and credentials", () => {
    const axios = require("axios");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:5000",
      withCredentials: true
    });
  });

  it("passes through successful response", async () => {
    const response = { data: { ok: true } };
    const result = await responseFulfilled(response);
    expect(result).toBe(response);
  });

  it("refreshes token on 401 and retries original request", async () => {
    fakeInstance.post.mockResolvedValueOnce({ data: { success: true } });
    fakeInstance.mockResolvedValueOnce({ data: { retry: true } });

    const err = {
      response: { status: 401 },
      config: { _retry: false, url: "/test" }
    };

    const result = await responseRejected(err);

    expect(fakeInstance.post).toHaveBeenCalledWith("/auth/refresh");
    expect(fakeInstance).toHaveBeenCalledWith(err.config);
    expect(result).toEqual({ data: { retry: true } });
  });

  it("redirects to login when refresh fails", async () => {
    const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

    fakeInstance.post.mockRejectedValueOnce(new Error("refresh failed"));

    const err = {
      response: { status: 401 },
      config: { _retry: false, url: "/test" }
    };

    await expect(responseRejected(err)).rejects.toThrow("refresh failed");
    expect(window.location.href).toBe("/login");
  });
});