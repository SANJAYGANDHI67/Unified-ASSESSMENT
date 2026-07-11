import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import {
  getInstructorAnalytics,
  getAssessmentAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

/* =====================================
   OVERALL ANALYTICS
===================================== */

router.get(
  "/",
  authenticate,
  authorize("instructor"),
  getInstructorAnalytics
);

/* =====================================
   SINGLE ASSESSMENT ANALYTICS
===================================== */

router.get(
  "/:assessmentId",
  authenticate,
  authorize("instructor"),
  getAssessmentAnalytics
);

export default router;