/* =====================================================
   DevMomentum API — Roadmap Routes
   (src/routes/roadmap.routes.js)

   GET    /api/roadmaps
   POST   /api/roadmaps
   GET    /api/roadmaps/:id
   PUT    /api/roadmaps/:id
   POST   /api/roadmaps/:id/regenerate
   DELETE /api/roadmaps/:id
   ===================================================== */
"use strict";

const { Router } = require("express");
const { body }   = require("express-validator");

const { authenticate } = require("../middleware/auth.middleware");
const { validate }     = require("../middleware/validate.middleware");
const {
  listRoadmaps,
  createRoadmap,
  getRoadmap,
  updateRoadmap,
  regenerateRoadmap,
  deleteRoadmap,
} = require("../controllers/roadmap.controller");

const router = Router();
router.use(authenticate);

router.get("/", listRoadmaps);

router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Roadmap title is required.")],
  validate,
  createRoadmap
);

router.get("/:id", getRoadmap);

router.put(
  "/:id",
  [body("title").optional().trim().notEmpty().withMessage("Title cannot be empty.")],
  validate,
  updateRoadmap
);

router.post("/:id/regenerate", regenerateRoadmap);

router.delete("/:id", deleteRoadmap);

module.exports = router;
