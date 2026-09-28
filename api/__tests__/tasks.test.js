/* =====================================================
   DevMomentum API — Tasks + Analytics Tests
   (__tests__/tasks.test.js)
   ===================================================== */
"use strict";

const request = require("supertest");
const app     = require("../src/app");

let token  = "";
let taskId = "";

beforeAll(async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Task Tester",
    email: "tasks@devmomentum.test",
    password: "TaskPass1!",
  });
  token = res.body.data.accessToken;
});

describe("Tasks API", () => {

  describe("POST /api/tasks", () => {
    it("creates a task", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Implement binary search",
          category: "DSA",
          difficulty: "medium",
          dueDate: "2026-10-01",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Implement binary search");
      taskId = res.body.data.id;
    });

    it("rejects missing title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ category: "DSA" });
      expect(res.status).toBe(422);
    });
  });

  describe("GET /api/tasks", () => {
    it("returns the user task list", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("filters by category", async () => {
      const res = await request(app)
        .get("/api/tasks?category=DSA")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((t) => expect(t.category).toBe("DSA"));
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns the task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("updates the task title", async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Implement merge sort" });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Implement merge sort");
    });
  });

  describe("PATCH /api/tasks/:id/reschedule", () => {
    it("reschedules the task", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/reschedule`)
        .set("Authorization", `Bearer ${token}`)
        .send({ newDate: "2026-10-10" });
      expect(res.status).toBe(200);
      expect(res.body.data.dueDate).toBe("2026-10-10");
    });
  });

  describe("PATCH /api/tasks/:id/complete", () => {
    it("marks the task as complete", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
      expect(res.body.data.completedAt).toBeDefined();
    });

    it("rejects completing an already-completed task", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe("Analytics", () => {
    it("GET /api/analytics/progress returns progress data", async () => {
      const res = await request(app)
        .get("/api/analytics/progress")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.completed).toBeGreaterThan(0);
      expect(res.body.data.xp).toBeGreaterThan(0);
    });

    it("GET /api/analytics/statistics returns category breakdown", async () => {
      const res = await request(app)
        .get("/api/analytics/statistics")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.categoryBreakdown).toBeDefined();
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes the task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });

  describe("Unauthenticated access", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });
});
