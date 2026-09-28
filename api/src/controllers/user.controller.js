/* =====================================================
   DevMomentum API — User Controller
   (src/controllers/user.controller.js)
   ===================================================== */
"use strict";

const store = require("../models/store");
const { success, notFound, forbidden } = require("../utils/respond");

function safeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/* ── GET /api/users/me ───────────────────────────── */
function getProfile(req, res) {
  const user = store.findUserById(req.user.uid);
  if (!user) return notFound(res, "User not found.");
  return success(res, safeUser(user));
}

/* ── PUT /api/users/me ───────────────────────────── */
function updateProfile(req, res) {
  const { name } = req.body;
  const updated = store.updateUser(req.user.uid, { name });
  if (!updated) return notFound(res, "User not found.");
  return success(res, safeUser(updated));
}

/* ── PATCH /api/users/me/availability ───────────── */
function updateAvailability(req, res) {
  const { weekdayHours, weekendHours } = req.body;
  const availability = {};
  if (weekdayHours !== undefined) availability.weekdayHours = weekdayHours;
  if (weekendHours !== undefined) availability.weekendHours = weekendHours;

  const updated = store.updateUser(req.user.uid, {
    studyAvailability: {
      ...store.findUserById(req.user.uid)?.studyAvailability,
      ...availability,
    },
  });
  if (!updated) return notFound(res, "User not found.");
  return success(res, safeUser(updated));
}

module.exports = { getProfile, updateProfile, updateAvailability };
