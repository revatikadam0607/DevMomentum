/* =====================================================
   DevMomentum API — Admin Controller
   (src/controllers/admin.controller.js)
   ===================================================== */
"use strict";

const store = require("../models/store");
const { success } = require("../utils/respond");

/**
 * GET /api/admin/analytics
 * Returns aggregated platform-level statistics.
 * Requires role: "admin"
 */
function getPlatformAnalytics(req, res) {
  const allUsers    = store.getAllUsers();
  const allTasks    = store.getAllTasks();
  const allRoadmaps = store.getAllRoadmaps();

  const completedTasks = allTasks.filter((t) => t.completed).length;
  const totalTasks     = allTasks.length;

  const categoryMap = {};
  for (const t of allTasks) {
    if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 };
    categoryMap[t.category].total++;
    if (t.completed) categoryMap[t.category].completed++;
  }

  const activeToday = new Set(
    allTasks
      .filter((t) => t.completedAt?.startsWith(new Date().toISOString().slice(0, 10)))
      .map((t) => t.userId)
  ).size;

  return success(res, {
    users: {
      total: allUsers.length,
      activeToday,
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      byCategory: categoryMap,
    },
    roadmaps: {
      total: allRoadmaps.length,
    },
  });
}

module.exports = { getPlatformAnalytics };
