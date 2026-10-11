/* =====================================================
   DevMomentum API — Auth Middleware
   (src/middleware/auth.middleware.js)
   ===================================================== */
"use strict";

const { verifyAccessToken } = require("../utils/jwt");
const { isTokenRevoked }    = require("../models/store");
const { unauthorized, forbidden } = require("../utils/respond");

/**
 * Protect a route — requires a valid Bearer JWT.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return unauthorized(res, "No token provided.");

  try {
    const payload = verifyAccessToken(token);
    if (isTokenRevoked(payload.jti)) return unauthorized(res, "Token has been revoked.");
    req.user = payload; // { uid, email, role, jti }
    next();
  } catch {
    return unauthorized(res, "Invalid or expired token.");
  }
}

/**
 * Require a specific role (e.g. "admin").
 * Must be used AFTER authenticate.
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return forbidden(res, `Requires role: ${role}.`);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
