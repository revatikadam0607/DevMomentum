/* =====================================================
   DevMomentum API — User Routes
   (src/routes/user.routes.js)

   GET   /api/users/me
   PUT   /api/users/me
   PATCH /api/users/me/availability
   ===================================================== */
"use strict";

const { Router } = require("express");
const { body }   = require("express-validator");

const { authenticate } = require("../middleware/auth.middleware");
const { validate }     = require("../middleware/validate.middleware");
const { getProfile, updateProfile, updateAvailability } = require("../controllers/user.controller");

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/me", getProfile);

router.put(
  "/me",
  [body("name").trim().notEmpty().withMessage("Name is required.")],
  validate,
  updateProfile
);

router.patch(
  "/me/availability",
  [
    body("weekdayHours")
      .optional()
      .isFloat({ min: 0, max: 24 })
      .withMessage("weekdayHours must be 0–24."),
    body("weekendHours")
      .optional()
      .isFloat({ min: 0, max: 24 })
      .withMessage("weekendHours must be 0–24."),
  ],
  validate,
  updateAvailability
);

module.exports = router;
