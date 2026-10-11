/* =====================================================
   DevMomentum API — Admin Routes
   (src/routes/admin.routes.js)

   GET /api/admin/analytics   (admin only)
   ===================================================== */
"use strict";

const { Router }   = require("express");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const { getPlatformAnalytics }      = require("../controllers/admin.controller");

const router = Router();
router.use(authenticate);
router.use(requireRole("admin"));

router.get("/analytics", getPlatformAnalytics);

module.exports = router;
