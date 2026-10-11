/* =====================================================
   DevMomentum API — Task Controller
   (src/controllers/task.controller.js)
   ===================================================== */
"use strict";

const store = require("../models/store");
const { success, created, noContent, notFound, forbidden, clientError } = require("../utils/respond");

/* ── GET /api/tasks ──────────────────────────────── */
function listTasks(req, res) {
  let tasks = store.findTasksByUser(req.user.uid);

  // Optional query filters
  const { category, completed, roadmapId } = req.query;
  if (category)   tasks = tasks.filter((t) => t.category === category);
  if (completed !== undefined)
    tasks = tasks.filter((t) => t.completed === (completed === "true"));
  if (roadmapId) tasks = tasks.filter((t) => t.roadmapId === roadmapId);

  return success(res, tasks);
}

/* ── POST /api/tasks ─────────────────────────────── */
function createTask(req, res) {
  const { title, category, difficulty, dueDate, priority, roadmapId } = req.body;
  const task = store.createTask({
    userId: req.user.uid,
    roadmapId: roadmapId || null,
    title,
    category,
    difficulty,
    dueDate,
    priority,
  });
  return created(res, task);
}

/* ── GET /api/tasks/:id ──────────────────────────── */
function getTask(req, res) {
  const task = store.findTaskById(req.params.id);
  if (!task) return notFound(res, "Task not found.");
  if (task.userId !== req.user.uid) return forbidden(res);
  return success(res, task);
}

/* ── PUT /api/tasks/:id ──────────────────────────── */
function updateTask(req, res) {
  const task = store.findTaskById(req.params.id);
  if (!task) return notFound(res, "Task not found.");
  if (task.userId !== req.user.uid) return forbidden(res);

  const { title, category, difficulty, dueDate, priority, notes } = req.body;
  const fields = {};
  if (title      !== undefined) fields.title      = title;
  if (category   !== undefined) fields.category   = category;
  if (difficulty !== undefined) fields.difficulty = difficulty;
  if (dueDate    !== undefined) fields.dueDate    = dueDate;
  if (priority   !== undefined) fields.priority   = priority;
  if (notes      !== undefined) fields.notes      = notes;

  const updated = store.updateTask(req.params.id, fields);
  return success(res, updated);
}

/* ── PATCH /api/tasks/:id/complete ──────────────── */
function completeTask(req, res) {
  const task = store.findTaskById(req.params.id);
  if (!task) return notFound(res, "Task not found.");
  if (task.userId !== req.user.uid) return forbidden(res);
  if (task.completed) return clientError(res, "Task is already completed.");

  const updated = store.updateTask(req.params.id, {
    completed: true,
    completedAt: new Date().toISOString(),
  });
  return success(res, updated);
}

/* ── PATCH /api/tasks/:id/reschedule ────────────── */
function rescheduleTask(req, res) {
  const task = store.findTaskById(req.params.id);
  if (!task) return notFound(res, "Task not found.");
  if (task.userId !== req.user.uid) return forbidden(res);

  const { newDate } = req.body;
  if (!newDate) return clientError(res, "newDate is required.");

  const rescheduledDates = [...task.rescheduledDates, task.dueDate].filter(Boolean);
  const updated = store.updateTask(req.params.id, { dueDate: newDate, rescheduledDates });
  return success(res, updated);
}

/* ── DELETE /api/tasks/:id ───────────────────────── */
function deleteTask(req, res) {
  const task = store.findTaskById(req.params.id);
  if (!task) return notFound(res, "Task not found.");
  if (task.userId !== req.user.uid) return forbidden(res);
  store.deleteTask(req.params.id);
  return noContent(res);
}

module.exports = { listTasks, createTask, getTask, updateTask, completeTask, rescheduleTask, deleteTask };
