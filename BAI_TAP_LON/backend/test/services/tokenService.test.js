const tokenService = require("../../src/services/tokenService");
const jwt = require("jsonwebtoken");

describe("tokenService", () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret"
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("generates a valid access token", () => {
    const token = tokenService.generateAccessToken({ user_id: 5 });
    const payload = jwt.verify(token, "test-secret");

    expect(payload.user_id).toBe(5);
    expect(payload).toHaveProperty("iat");
    expect(payload).toHaveProperty("exp");
  });

  it("generates a valid refresh token", () => {
    const token = tokenService.generateRefreshToken({ user_id: 7 });
    const payload = jwt.verify(token, "test-refresh-secret");

    expect(payload.user_id).toBe(7);
    expect(payload).toHaveProperty("iat");
    expect(payload).toHaveProperty("exp");
  });

  it("generates different access and refresh tokens", () => {
    const accessToken = tokenService.generateAccessToken({ user_id: 1 });
    const refreshToken = tokenService.generateRefreshToken({ user_id: 1 });

    expect(accessToken).not.toBe(refreshToken);
    expect(typeof accessToken).toBe("string");
    expect(typeof refreshToken).toBe("string");
  });
});