/* =====================================================
   DevMomentum API — Analytics Controller
   (src/controllers/analytics.controller.js)
   ===================================================== */
"use strict";

const store = require("../models/store");
const { success } = require("../utils/respond");

/* ── GET /api/analytics/progress ────────────────── */
function getUserProgress(req, res) {
  const tasks = store.findTasksByUser(req.user.uid);

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Streak calculation (naive — consecutive days with completions)
  const completionDays = [...new Set(
    tasks
      .filter((t) => t.completedAt)
      .map((t) => t.completedAt.slice(0, 10))
  )].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let prev = null;

  for (const day of completionDays) {
    if (!prev) {
      currentStreak = 1;
    } else {
      const diff = (new Date(day) - new Date(prev)) / 86400000;
      currentStreak = diff === 1 ? currentStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    prev = day;
  }

  // XP: easy=10 medium=20 hard=40
  const xpMap = { easy: 10, medium: 20, hard: 40 };
  const xp = tasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + (xpMap[t.difficulty] || 20), 0);

  return success(res, {
    total,
    completed,
    pending,
    completionPercentage: pct,
    currentStreak,
    longestStreak,
    xp,
  });
}

/* ── GET /api/analytics/statistics ──────────────── */
function getStudyStatistics(req, res) {
  const tasks     = store.findTasksByUser(req.user.uid);
  const user      = store.findUserById(req.user.uid);
  const completed = tasks.filter((t) => t.completed);

  // Category breakdown
  const categoryMap = {};
  for (const t of tasks) {
    if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 };
    categoryMap[t.category].total++;
    if (t.completed) categoryMap[t.category].completed++;
  }

  // Weekly completion (last 7 days)
  const now  = new Date();
  const week = new Date(now);
  week.setDate(week.getDate() - 7);
  const weeklyCompleted = completed.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= week
  ).length;

  // Monthly completion (last 30 days)
  const month = new Date(now);
  month.setDate(month.getDate() - 30);
  const monthlyCompleted = completed.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= month
  ).length;

  // Missed tasks (overdue, not completed)
  const today = now.toISOString().slice(0, 10);
  const missed = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < today
  ).length;

  return success(res, {
    categoryBreakdown: categoryMap,
    weeklyCompletedTasks: weeklyCompleted,
    monthlyCompletedTasks: monthlyCompleted,
    missedTasks: missed,
    studyAvailability: user?.studyAvailability || null,
  });
}

module.exports = { getUserProgress, getStudyStatistics };
