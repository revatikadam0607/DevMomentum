/* =====================================================
   DevMomentum API — Validation Helper
   (src/middleware/validate.middleware.js)
   ===================================================== */
"use strict";

const { validationResult } = require("express-validator");
const { clientError }      = require("../utils/respond");

/**
 * Run after express-validator chains.
 * Collects errors and short-circuits with a 422 if any exist.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return clientError(res, "Validation failed.", 422, errors.array());
  }
  next();
}

module.exports = { validate };
