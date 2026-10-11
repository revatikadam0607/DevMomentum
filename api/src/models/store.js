/* =====================================================
   DevMomentum API — In-Memory Data Store
   (src/models/store.js)

   A simple in-memory store with Maps to keep the API
   dependency-free (no database required for a PR demo).
   In production, swap these Maps for real DB calls.
   ===================================================== */
"use strict";

const { v4: uuidv4 } = require("uuid");

/* ── In-memory collections ────────────────────────── */
const users    = new Map(); // uid  -> user object
const tokens   = new Set(); // revoked / logged-out JTIs
const roadmaps = new Map(); // roadmapId -> roadmap object
const tasks    = new Map(); // taskId    -> task object

/* ── Helper: shallow clone to avoid leaking refs ──── */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* =======================================================
   USERS
   ======================================================= */

/**
 * Create a new user record.
 * The password must already be hashed by the caller.
 */
function createUser({ name, email, passwordHash }) {
  const uid = uuidv4();
  const now = new Date().toISOString();
  const user = {
    uid,
    name,
    email,
    passwordHash,
    role: "user",
    studyAvailability: {
      weekdayHours: 2,
      weekendHours: 4,
    },
    createdAt: now,
    updatedAt: now,
  };
  users.set(uid, user);
  return clone(user);
}

function findUserByEmail(email) {
  for (const user of users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) return clone(user);
  }
  return null;
}

function findUserById(uid) {
  const user = users.get(uid);
  return user ? clone(user) : null;
}

function updateUser(uid, fields) {
  const user = users.get(uid);
  if (!user) return null;
  Object.assign(user, fields, { updatedAt: new Date().toISOString() });
  users.set(uid, user);
  return clone(user);
}

function getAllUsers() {
  return [...users.values()].map(clone);
}

/* =======================================================
   TOKEN REVOCATION (logout / password-reset)
   ======================================================= */

function revokeToken(jti) {
  tokens.add(jti);
}

function isTokenRevoked(jti) {
  return tokens.has(jti);
}

/* =======================================================
   ROADMAPS
   ======================================================= */

function createRoadmap({ userId, title, tasks: taskList = [] }) {
  const id  = uuidv4();
  const now = new Date().toISOString();
  const roadmap = {
    id,
    userId,
    title,
    tasks: taskList,
    createdAt: now,
    updatedAt: now,
  };
  roadmaps.set(id, roadmap);
  return clone(roadmap);
}

function findRoadmapById(id) {
  const r = roadmaps.get(id);
  return r ? clone(r) : null;
}

function findRoadmapsByUser(userId) {
  return [...roadmaps.values()].filter((r) => r.userId === userId).map(clone);
}

function updateRoadmap(id, fields) {
  const roadmap = roadmaps.get(id);
  if (!roadmap) return null;
  Object.assign(roadmap, fields, { updatedAt: new Date().toISOString() });
  roadmaps.set(id, roadmap);
  return clone(roadmap);
}

function deleteRoadmap(id) {
  return roadmaps.delete(id);
}

function getAllRoadmaps() {
  return [...roadmaps.values()].map(clone);
}

/* =======================================================
   TASKS
   ======================================================= */

function createTask({ userId, roadmapId = null, title, category = "DSA", difficulty = "medium", dueDate = null, priority = "normal" }) {
  const id  = uuidv4();
  const now = new Date().toISOString();
  const task = {
    id,
    userId,
    roadmapId,
    title,
    category,
    difficulty,
    dueDate,
    priority,
    completed: false,
    completedAt: null,
    rescheduledDates: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(id, task);
  return clone(task);
}

function findTaskById(id) {
  const t = tasks.get(id);
  return t ? clone(t) : null;
}

function findTasksByUser(userId) {
  return [...tasks.values()].filter((t) => t.userId === userId).map(clone);
}

function findTasksByRoadmap(roadmapId) {
  return [...tasks.values()].filter((t) => t.roadmapId === roadmapId).map(clone);
}

function updateTask(id, fields) {
  const task = tasks.get(id);
  if (!task) return null;
  Object.assign(task, fields, { updatedAt: new Date().toISOString() });
  tasks.set(id, task);
  return clone(task);
}

function deleteTask(id) {
  return tasks.delete(id);
}

function getAllTasks() {
  return [...tasks.values()].map(clone);
}

/* =======================================================
   EXPORTS
   ======================================================= */
module.exports = {
  // users
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsers,
  // tokens
  revokeToken,
  isTokenRevoked,
  // roadmaps
  createRoadmap,
  findRoadmapById,
  findRoadmapsByUser,
  updateRoadmap,
  deleteRoadmap,
  getAllRoadmaps,
  // tasks
  createTask,
  findTaskById,
  findTasksByUser,
  findTasksByRoadmap,
  updateTask,
  deleteTask,
  getAllTasks,
};
