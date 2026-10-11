/* =====================================================
   DevMomentum API — Auth Routes
   (src/routes/auth.routes.js)

   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/logout          (protected)
   POST /api/auth/refresh
   POST /api/auth/forgot-password
   POST /api/auth/reset-password  (protected)
   ===================================================== */
"use strict";

const { Router } = require("express");
const { body } = require("express-validator");

const { authenticate }    = require("../middleware/auth.middleware");
const { validate }        = require("../middleware/validate.middleware");
const {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.post("/logout", authenticate, logout);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("refreshToken is required.")],
  validate,
  refreshToken
);

router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail().withMessage("Valid email is required.")],
  validate,
  requestPasswordReset
);

router.post(
  "/reset-password",
  authenticate,
  [
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters."),
  ],
  validate,
  resetPassword
);

module.exports = router;
