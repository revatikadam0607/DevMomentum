/* =====================================================
   DevMomentum API — Response helpers (src/utils/respond.js)
   ===================================================== */
"use strict";

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function created(res, data) {
  return success(res, data, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function clientError(res, message, statusCode = 400, errors = null) {
  const body = { success: false, error: message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

function unauthorized(res, message = "Unauthorized.") {
  return clientError(res, message, 401);
}

function forbidden(res, message = "Forbidden.") {
  return clientError(res, message, 403);
}

function notFound(res, message = "Not found.") {
  return clientError(res, message, 404);
}

function conflict(res, message) {
  return clientError(res, message, 409);
}

module.exports = { success, created, noContent, clientError, unauthorized, forbidden, notFound, conflict };
