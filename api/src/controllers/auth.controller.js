/* =====================================================
   DevMomentum API — Auth Controller
   (src/controllers/auth.controller.js)
   ===================================================== */
"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const store = require("../models/store");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { created, success, clientError, unauthorized, conflict } = require("../utils/respond");

const SALT_ROUNDS = 12;

/* ── Helpers ─────────────────────────────────────── */
function safeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/* ── Register ────────────────────────────────────── */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (store.findUserByEmail(email)) {
      return conflict(res, "Email is already registered.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = store.createUser({ name, email, passwordHash });

    const tokenPayload = { uid: user.uid, email: user.email, role: user.role };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return created(res, {
      user: safeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/* ── Login ───────────────────────────────────────── */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = store.findUserByEmail(email);
    if (!user) return unauthorized(res, "Invalid credentials.");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return unauthorized(res, "Invalid credentials.");

    const tokenPayload = { uid: user.uid, email: user.email, role: user.role };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return success(res, {
      user: safeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/* ── Logout ──────────────────────────────────────── */
function logout(req, res) {
  // Revoke the access token JTI so it can never be reused.
  if (req.user?.jti) store.revokeToken(req.user.jti);
  return success(res, { message: "Logged out successfully." });
}

/* ── Refresh token ───────────────────────────────── */
function refreshToken(req, res, next) {
  try {
    const { refreshToken: rt } = req.body;
    if (!rt) return clientError(res, "Refresh token required.");

    let payload;
    try {
      payload = verifyRefreshToken(rt);
    } catch {
      return unauthorized(res, "Invalid or expired refresh token.");
    }

    if (store.isTokenRevoked(payload.jti)) {
      return unauthorized(res, "Refresh token has been revoked.");
    }

    const user = store.findUserById(payload.uid);
    if (!user) return unauthorized(res, "User not found.");

    const tokenPayload = { uid: user.uid, email: user.email, role: user.role };
    const accessToken  = signAccessToken(tokenPayload);
    const newRefresh   = signRefreshToken(tokenPayload);

    // Revoke old refresh jti
    store.revokeToken(payload.jti);

    return success(res, { accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

/* ── Password reset (simplified) ─────────────────── */
function requestPasswordReset(req, res) {
  // In production: generate a reset token, store it, email it.
  // Here we return a success stub so the endpoint is demonstrable.
  const { email } = req.body;
  const user = store.findUserByEmail(email);

  // Always respond the same way — prevents email enumeration.
  return success(res, {
    message: "If that email is registered, a reset link has been sent.",
  });
}

async function resetPassword(req, res, next) {
  try {
    // In production: validate the reset token from the request.
    // Here we trust the authenticated user (used after /forgot flow).
    const { uid } = req.user;
    const { newPassword } = req.body;

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    store.updateUser(uid, { passwordHash });

    // Revoke current access token
    if (req.user?.jti) store.revokeToken(req.user.jti);

    return success(res, { message: "Password reset successfully. Please log in again." });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, refreshToken, requestPasswordReset, resetPassword };
