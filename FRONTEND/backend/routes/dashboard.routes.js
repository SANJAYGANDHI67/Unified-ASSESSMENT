import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = express.Router();

/* ======================
   STUDENT DASHBOARD
====================== */
router.get(
  "/student",
  authenticate,
  authorize("student"),
  dashboardController.getStudentDashboard
);

/* ======================
   INSTRUCTOR DASHBOARD
====================== */
router.get(
  "/instructor",
  authenticate,
  authorize("instructor"),
  dashboardController.getInstructorDashboard
);

/* ======================
   ADMIN DASHBOARD
====================== */
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  dashboardController.getAdminDashboard
);

export default router;