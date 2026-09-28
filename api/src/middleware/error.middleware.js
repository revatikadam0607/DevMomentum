/* =====================================================
   DevMomentum API — Global Error Middleware
   (src/middleware/error.middleware.js)
   ===================================================== */
"use strict";

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error.",
  });
}

module.exports = { errorHandler };
