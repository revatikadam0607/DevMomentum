/* =====================================================
   DevMomentum API — Task Routes
   (src/routes/task.routes.js)

   GET    /api/tasks               ?category=&completed=&roadmapId=
   POST   /api/tasks
   GET    /api/tasks/:id
   PUT    /api/tasks/:id
   PATCH  /api/tasks/:id/complete
   PATCH  /api/tasks/:id/reschedule
   DELETE /api/tasks/:id
   ===================================================== */
"use strict";

const { Router } = require("express");
const { body }   = require("express-validator");

const { authenticate } = require("../middleware/auth.middleware");
const { validate }     = require("../middleware/validate.middleware");
const {
  listTasks,
  createTask,
  getTask,
  updateTask,
  completeTask,
  rescheduleTask,
  deleteTask,
} = require("../controllers/task.controller");

const CATEGORIES   = ["DSA", "Development", "DSA-Sheet", "Revision"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const PRIORITIES   = ["low", "normal", "high"];

const router = Router();
router.use(authenticate);

router.get("/", listTasks);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required."),
    body("category")
      .optional()
      .isIn(CATEGORIES)
      .withMessage(`category must be one of: ${CATEGORIES.join(", ")}.`),
    body("difficulty")
      .optional()
      .isIn(DIFFICULTIES)
      .withMessage(`difficulty must be one of: ${DIFFICULTIES.join(", ")}.`),
    body("priority")
      .optional()
      .isIn(PRIORITIES)
      .withMessage(`priority must be one of: ${PRIORITIES.join(", ")}.`),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("dueDate must be an ISO 8601 date (YYYY-MM-DD)."),
  ],
  validate,
  createTask
);

router.get("/:id", getTask);

router.put(
  "/:id",
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
    body("category").optional().isIn(CATEGORIES),
    body("difficulty").optional().isIn(DIFFICULTIES),
    body("priority").optional().isIn(PRIORITIES),
    body("dueDate").optional().isISO8601(),
  ],
  validate,
  updateTask
);

router.patch("/:id/complete", completeTask);

router.patch(
  "/:id/reschedule",
  [body("newDate").isISO8601().withMessage("newDate must be ISO 8601 (YYYY-MM-DD).")],
  validate,
  rescheduleTask
);

router.delete("/:id", deleteTask);

module.exports = router;
