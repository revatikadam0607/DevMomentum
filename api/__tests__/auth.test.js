/* =====================================================
   DevMomentum API — Auth Tests
   (__tests__/auth.test.js)
   ===================================================== */
"use strict";

const request = require("supertest");
const app     = require("../src/app");

let accessToken  = "";
let refreshToken = "";

describe("Auth API", () => {

  describe("POST /api/auth/register", () => {
    it("registers a new user and returns tokens", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@devmomentum.test",
        password: "SecurePass1!",
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
      accessToken  = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it("rejects duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Dup User",
        email: "test@devmomentum.test",
        password: "SecurePass1!",
      });
      expect(res.status).toBe(409);
    });

    it("rejects weak passwords", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Weak",
        email: "weak@devmomentum.test",
        password: "123",
      });
      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@devmomentum.test",
        password: "SecurePass1!",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@devmomentum.test",
        password: "WrongPass!",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("returns a new access token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe("POST /api/auth/logout", () => {
    it("revokes the access token", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/health", () => {
    it("returns a health check", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
