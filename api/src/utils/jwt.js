/* =====================================================
   DevMomentum API — JWT Utilities (src/utils/jwt.js)
   ===================================================== */
"use strict";

const jwt = require("jsonwebtoken");

const ACCESS_SECRET  = process.env.JWT_SECRET         || "dev_secret_change_me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const ACCESS_EXPIRY  = process.env.JWT_EXPIRES_IN     || "7d";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

/**
 * Sign an access token for the given user payload.
 * Embeds a unique jti so we can revoke it on logout.
 */
function signAccessToken(payload) {
  const { v4: uuidv4 } = require("uuid");
  return jwt.sign({ ...payload, jti: uuidv4() }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
}

function signRefreshToken(payload) {
  const { v4: uuidv4 } = require("uuid");
  return jwt.sign({ ...payload, jti: uuidv4() }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
