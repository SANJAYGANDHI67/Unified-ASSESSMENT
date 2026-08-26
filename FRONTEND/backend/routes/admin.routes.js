import express from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  adminController.getStats
);

/* =====================================================
   USERS
===================================================== */

router.get(
  "/users",
  authenticate,
  authorize("admin"),
  adminController.getUsers
);

/* =====================================================
   SYSTEM LOGS
===================================================== */

router.get(
  "/logs",
  authenticate,
  authorize("admin"),
  adminController.getLogs
);

/* =====================================================
   PLATFORM SETTINGS
===================================================== */

router.get(
  "/settings",
  authenticate,
  authorize("admin"),
  adminController.getSettings
);

router.put(
  "/settings",
  authenticate,
  authorize("admin"),
  adminController.updateSettings
);

export default router;