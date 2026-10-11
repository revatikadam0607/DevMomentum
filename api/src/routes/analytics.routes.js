/* =====================================================
   DevMomentum API — Analytics Routes
   (src/routes/analytics.routes.js)

   GET /api/analytics/progress
   GET /api/analytics/statistics
   ===================================================== */
"use strict";

const { Router } = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { getUserProgress, getStudyStatistics } = require("../controllers/analytics.controller");

const router = Router();
router.use(authenticate);

router.get("/progress",   getUserProgress);
router.get("/statistics", getStudyStatistics);

module.exports = router;
