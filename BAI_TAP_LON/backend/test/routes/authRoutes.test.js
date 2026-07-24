jest.mock("../../src/controllers/authController", () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: "registered" })),
  login: jest.fn((req, res) => res.status(200).json({ message: "logged in" })),
  refreshToken: jest.fn((req, res) => res.status(200).json({ message: "refreshed" })),
  me: jest.fn((req, res) => res.status(200).json({ data: { user_id: 1, full_name: "Test", email: "test@example.com" } })),
  logout: jest.fn((req, res) => res.status(200).json({ message: "logged out" }))
}));

const request = require("supertest");
const app = require("../../src/app");

describe("Auth routes", () => {
  it("POST /auth/register returns 400 when password missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ full_name: "Test User", email: "test@example.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /auth/login returns 400 when email invalid", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "invalid-email", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /auth/login returns 200 with valid payload", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "logged in" });
  });

  it("GET /auth/me returns 401 without auth", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });
});