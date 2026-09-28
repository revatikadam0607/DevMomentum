/* =====================================================
   DevMomentum API — Roadmap Controller
   (src/controllers/roadmap.controller.js)
   ===================================================== */
"use strict";

const store = require("../models/store");
const { success, created, noContent, notFound, forbidden } = require("../utils/respond");

/* ── GET /api/roadmaps ───────────────────────────── */
function listRoadmaps(req, res) {
  const roadmaps = store.findRoadmapsByUser(req.user.uid);
  return success(res, roadmaps);
}

/* ── POST /api/roadmaps ──────────────────────────── */
function createRoadmap(req, res) {
  const { title, tasks } = req.body;
  const roadmap = store.createRoadmap({ userId: req.user.uid, title, tasks });
  return created(res, roadmap);
}

/* ── GET /api/roadmaps/:id ───────────────────────── */
function getRoadmap(req, res) {
  const roadmap = store.findRoadmapById(req.params.id);
  if (!roadmap) return notFound(res, "Roadmap not found.");
  if (roadmap.userId !== req.user.uid && req.user.role !== "admin") {
    return forbidden(res);
  }
  return success(res, roadmap);
}

/* ── PUT /api/roadmaps/:id ───────────────────────── */
function updateRoadmap(req, res) {
  const roadmap = store.findRoadmapById(req.params.id);
  if (!roadmap) return notFound(res, "Roadmap not found.");
  if (roadmap.userId !== req.user.uid) return forbidden(res);

  const { title, tasks } = req.body;
  const fields = {};
  if (title !== undefined) fields.title = title;
  if (tasks !== undefined) fields.tasks = tasks;

  const updated = store.updateRoadmap(req.params.id, fields);
  return success(res, updated);
}

/* ── POST /api/roadmaps/:id/regenerate ──────────── */
function regenerateRoadmap(req, res) {
  const roadmap = store.findRoadmapById(req.params.id);
  if (!roadmap) return notFound(res, "Roadmap not found.");
  if (roadmap.userId !== req.user.uid) return forbidden(res);

  // Regeneration logic stub:
  // In production this would call an AI service or scheduling engine.
  const updated = store.updateRoadmap(req.params.id, {
    regeneratedAt: new Date().toISOString(),
  });
  return success(res, { message: "Roadmap regeneration initiated.", roadmap: updated });
}

/* ── DELETE /api/roadmaps/:id ────────────────────── */
function deleteRoadmap(req, res) {
  const roadmap = store.findRoadmapById(req.params.id);
  if (!roadmap) return notFound(res, "Roadmap not found.");
  if (roadmap.userId !== req.user.uid) return forbidden(res);
  store.deleteRoadmap(req.params.id);
  return noContent(res);
}

module.exports = { listRoadmaps, createRoadmap, getRoadmap, updateRoadmap, regenerateRoadmap, deleteRoadmap };
